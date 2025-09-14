import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Creates a new poll via API route.
 * 
 * WHAT: Processes JSON body to create a poll record in the database.
 * WHY: Centralizes poll creation logic in an API route for broader client compatibility.
 * 
 * @param request - The incoming Next.js request object, expecting a JSON body.
 * @returns A Next.js response object.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  let question: any;
  let options: any;

  try {
    const body = await request.json();
    question = body.question;
    options = body.options;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  
  if (typeof question !== 'string' || !Array.isArray(options)) {
    return NextResponse.json({ error: "Invalid form data. 'question' must be a string and 'options' must be an array." }, { status: 400 });
  }
  
  const sanitizedQuestion = question.trim();
  const sanitizedOptions = options.map(opt => 
    typeof opt === 'string' ? opt.trim() : ''
  ).filter(Boolean);

  if (!sanitizedQuestion || sanitizedOptions.length < 2) {
    return NextResponse.json({ error: "Please provide a question and at least two options." }, { status: 400 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to create a poll." }, { status: 401 });
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: sanitizedQuestion,
      options: sanitizedOptions,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/polls");
  return NextResponse.json({ message: "Poll created successfully." }, { status: 201 });
}
