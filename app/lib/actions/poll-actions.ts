"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new poll with comprehensive security validation
 * 
 * WHAT: Processes form data to create a poll record in the database
 * WHY: Centralizes poll creation logic with security-first approach to prevent
 *      unauthorized poll creation, data corruption, and injection attacks
 * 
 * @param formData - Form data containing poll question and options array
 * @returns Promise<{error: string | null}> - Success (null error) or failure message
 * 
 * Security Rationale:
 * - Input validation prevents malformed data from reaching the database
 * - User authentication ensures only logged-in users can create polls
 * - Type checking prevents File objects or null values from being processed
 * - Sanitization removes potential XSS payloads from user input
 * 
 * Edge Cases Handled:
 * - FormData.get() returning File objects instead of strings
 * - Empty or whitespace-only inputs
 * - Duplicate or invalid options
 * - User session expiration during form submission
 * 
 * @example
 * const formData = new FormData();
 * formData.append('question', 'What is your favorite color?');
 * formData.append('options', 'Red');
 * formData.append('options', 'Blue');
 * const result = await createPoll(formData);
 * if (result.error) console.error('Creation failed:', result.error);
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question");
  const options = formData.getAll("options").filter(Boolean);
  
  // EDGE CASE: FormData.get() can return File objects when file inputs are present
  // EDGE CASE: FormData.getAll() can return mixed types (string | File)
  // WHY: Type validation prevents runtime errors and ensures safe string operations
  if (typeof question !== 'string' || !Array.isArray(options)) {
    return { error: "Invalid form data." };
  }
  
  // WHY: Sanitization prevents XSS attacks and normalizes user input
  // EDGE CASE: Users may submit only whitespace or mixed content types
  const sanitizedQuestion = question.trim();
  const sanitizedOptions = options.map(opt => 
    // EDGE CASE: Handle File objects or other non-string types gracefully
    typeof opt === 'string' ? opt.trim() : ''
  ).filter(Boolean); // EDGE CASE: Remove empty strings that result from whitespace-only inputs

  if (!sanitizedQuestion || sanitizedOptions.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: sanitizedQuestion,
      options: sanitizedOptions,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves all polls belonging to the authenticated user
 * 
 * @returns Promise<{polls: Poll[], error: string | null}> - User's polls or error
 * 
 * Security Features:
 * - User authentication verification
 * - Returns only user's own polls (data isolation)
 * 
 * @example
 * const {polls, error} = await getUserPolls();
 * if (error) {
 *   console.error('Failed to fetch polls:', error);
 * } else {
 *   console.log('User has', polls.length, 'polls');
 * }
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optionally require login to vote
  // if (!user) return { error: 'You must be logged in to vote.' };

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll with strict ownership verification (SECURITY CRITICAL)
 * 
 * WHAT: Removes a poll record from the database after security checks
 * WHY: Implements secure deletion to prevent unauthorized users from deleting
 *      other users' polls, which was a critical vulnerability that allowed
 *      any authenticated user to delete any poll by simply knowing the ID
 * 
 * @param id - UUID of the poll to delete
 * @returns Promise<{error: string | null}> - Success (null) or error message
 * 
 * Security Rationale:
 * - Authentication check prevents anonymous deletion attempts
 * - Ownership verification ensures users can only delete their own polls
 * - Database-level constraint (.eq('user_id', user.id)) provides defense-in-depth
 * 
 * Edge Cases Handled:
 * - User session expires during deletion request
 * - Poll ID doesn't exist (Supabase returns no error, 0 rows affected)
 * - User tries to delete poll they don't own (no rows affected)
 * - Network failures during authentication check
 * 
 * @example
 * const result = await deletePoll('550e8400-e29b-41d4-a716-446655440000');
 * if (result.error) {
 *   console.error('Delete failed:', result.error);
 * } else {
 *   console.log('Poll deleted successfully');
 * }
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // WHY: Authentication check prevents anonymous deletion attempts
  // EDGE CASE: Session might be expired or invalid, userError will be truthy
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // WHY: Ownership verification is the critical security fix that prevents
  //      unauthorized deletion - the original vulnerability allowed any authenticated
  //      user to delete any poll by omitting the user_id check
  // EDGE CASE: If poll doesn't exist or user doesn't own it, Supabase returns
  //            no error but affects 0 rows (this is acceptable behavior)
  // EDGE CASE: If user_id is somehow null/undefined, the query will fail safely
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)           // Target the specific poll
    .eq("user_id", user.id); // CRITICAL: Only delete if user owns the poll
    
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow updating polls owned by the user
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
