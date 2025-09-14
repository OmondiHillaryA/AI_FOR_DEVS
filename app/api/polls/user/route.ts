import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Retrieves all polls for the authenticated user.
 * 
 * WHAT: Fetches poll records from the database owned by the current user.
 * WHY: Provides a secure way for users to access their own polls.
 * 
 * @returns A Next.js response object with the user's polls or an error.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ polls: [], error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ polls: [], error: error.message }, { status: 500 });
  return NextResponse.json({ polls: data ?? [] });
}
