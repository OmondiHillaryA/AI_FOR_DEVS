import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Submits a vote for a specific poll option.
 * 
 * @param request - The incoming Next.js request object, expecting a JSON body.
 * @param params - The route parameters, containing the poll ID.
 * @returns A Next.js response object.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id: pollId } = params;
    
    let optionIndex: any;
    try {
        const body = await request.json();
        optionIndex = body.optionIndex;
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (typeof optionIndex !== 'number') {
        return NextResponse.json({ error: "Invalid 'optionIndex'. It must be a number." }, { status: 400 });
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // The original action allowed anonymous votes. This API route maintains that behavior.
    // To require login, uncomment the following lines:
    // if (!user) {
    //     return NextResponse.json({ error: 'You must be logged in to vote.' }, { status: 401 });
    // }

    const { error } = await supabase.from("votes").insert([
        {
            poll_id: pollId,
            user_id: user?.id ?? null,
            option_index: optionIndex,
        },
    ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Vote submitted successfully." });
}
