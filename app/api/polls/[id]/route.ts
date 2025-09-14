import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Retrieves a single poll by its ID.
 * 
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters, containing the poll ID.
 * @returns A Next.js response object with the poll data or an error.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ poll: null, error: "Poll not found." }, { status: 404 });
  return NextResponse.json({ poll: data });
}

/**
 * Deletes a poll with strict ownership verification.
 * 
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters, containing the poll ID.
 * @returns A Next.js response object.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = params;

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        return NextResponse.json({ error: "You must be logged in to delete a poll." }, { status: 401 });
    }

    const { error } = await supabase
        .from("polls")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    revalidatePath("/polls");
    return NextResponse.json({ message: "Poll deleted successfully." });
}

/**
 * Updates a poll with strict ownership verification.
 * 
 * @param request - The incoming Next.js request object, expecting a JSON body.
 * @param params - The route parameters, containing the poll ID.
 * @returns A Next.js response object.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = params;
    
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
        return NextResponse.json({ error: "You must be logged in to update a poll." }, { status: 401 });
    }

    const { error } = await supabase
        .from("polls")
        .update({ question: sanitizedQuestion, options: sanitizedOptions })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath(`/polls/${id}`);
    revalidatePath(`/polls`);
    return NextResponse.json({ message: "Poll updated successfully." });
}
