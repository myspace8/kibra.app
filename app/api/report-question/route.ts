import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {

  try {
    const { question_id, exam_id, issue_type, description } = await request.json();

    // Basic validation
    if (!question_id || !exam_id || !issue_type || !description) {
      return NextResponse.json({ error: 'All fields (question_id, exam_id, issue_type, description) are required' }, { status: 400 });
    }

    if (typeof description !== 'string' || description.length > 500) {
      return NextResponse.json({ error: 'Description must be a string under 500 characters' }, { status: 400 });
    }

    // Generate anonymous user ID (temporary until auth is added)
    const user_id = `anonymous_${crypto.randomUUID()}`;

    // Insert report into Supabase
    const { error } = await supabase
      .from('question_reports')
      .insert({
        question_id,
        exam_id,
        user_id,
        issue_type,
        description,
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in report-question route:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}