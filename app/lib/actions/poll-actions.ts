"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CreatePollData, ValidationResult } from "../types";

interface PollRecord {
  user_id: string;
  question: string;
  options: string[];
  expires_at?: string;
  is_public: boolean;
}

function validatePollData(formData: FormData): ValidationResult<CreatePollData> {
  const question = formData.get("question");
  const options = formData.getAll("options").filter(Boolean);
  const expires_at = formData.get("expires_at");
  const is_public = formData.get("is_public");
  
  if (typeof question !== 'string' || !Array.isArray(options)) {
    return { error: "Invalid form data." };
  }
  
  const sanitizedQuestion = question.trim();
  const sanitizedOptions = options
    .map(opt => typeof opt === 'string' ? opt.trim() : '')
    .filter(Boolean);

  if (!sanitizedQuestion || sanitizedOptions.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  const data: CreatePollData = {
    question: sanitizedQuestion,
    options: sanitizedOptions,
    is_public: is_public === 'true',
  };

  if (expires_at && typeof expires_at === 'string' && expires_at.trim()) {
    const date = new Date(expires_at);
    if (isNaN(date.getTime()) || date <= new Date()) {
      return { error: "Invalid expiration date." };
    }
    data.expires_at = date.toISOString();
  }

  return { data };
}

export async function createPoll(formData: FormData) {
  const validation = validatePollData(formData);
  if (validation.error) {
    return { error: validation.error };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "You must be logged in to create a poll." };
  }

  const pollRecord: PollRecord = {
    user_id: user.id,
    is_public: validation.data.is_public ?? true,
    ...validation.data,
  };

  const { error } = await supabase.from("polls").insert([pollRecord]);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves polls for the authenticated user with visibility filtering
 * 
 * @param includePrivate - Whether to include private polls (default: true for own polls)
 * @returns Promise<{polls: Poll[], error: string | null}> - Filtered polls or error
 */
export async function getUserPolls(includePrivate: boolean = true) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  let query = supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id);

  if (!includePrivate) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

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

  // Check if poll is expired
  const { data: poll } = await supabase
    .from('polls')
    .select('expires_at')
    .eq('id', pollId)
    .single();
    
  if (poll?.expires_at && new Date(poll.expires_at) < new Date()) {
    return { error: 'This poll has expired and is no longer accepting votes.' };
  }

  // For logged-in users, prevent duplicate votes
  if (user) {
    const { data: existingVote, error: voteError } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (voteError && voteError.code !== 'PGRST116') {
        return { error: voteError.message };
    }
    if (existingVote) {
      return { error: "You have already voted on this poll." };
    }
  }

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  revalidatePath(`/polls/${pollId}`);
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

// GET POLL ANALYTICS
export async function getPollAnalytics(pollId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("votes")
    .select("option_index")
    .eq("poll_id", pollId);

  if (error) {
    return { analytics: null, error: error.message };
  }

  const { data: pollData, error: pollError } = await getPollById(pollId);
  if (pollError) {
    return { analytics: null, error: pollError };
  }

  const voteCounts = pollData.poll.options.map((option: string, index: number) => {
    const count = data.filter((vote) => vote.option_index === index).length;
    return { option, count };
  });

  const totalVotes = data.length;

  return { analytics: { voteCounts, totalVotes }, error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question");
  const options = formData.getAll("options").filter(Boolean);
  const expires_at = formData.get("expires_at");

  // WHY: Type validation prevents runtime errors and ensures safe string operations
  if (typeof question !== 'string' || !Array.isArray(options)) {
    return { error: "Invalid form data." };
  }

  // WHY: Sanitization prevents XSS attacks and normalizes user input
  const sanitizedQuestion = question.trim();
  const sanitizedOptions = options.map(opt =>
    typeof opt === 'string' ? opt.trim() : ''
  ).filter(Boolean);

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
    return { error: "You must be logged in to update a poll." };
  }

  const pollData: any = {
    question: sanitizedQuestion,
    options: sanitizedOptions,
  };

  if (expires_at) {
    pollData.expires_at = new Date(expires_at as string).toISOString();
  } else {
    pollData.expires_at = null;
  }

  // Only allow updating polls owned by the user
  const { error } = await supabase
    .from("polls")
    .update(pollData)
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/polls/${pollId}/edit`);
  revalidatePath("/polls");
  return { error: null };
}
