import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateContent } from '@/lib/gemini';

export async function POST() {
    // 1. Get next queued job
    const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'queued')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

    if (fetchError || !job) {
        return NextResponse.json({ message: 'No jobs in queue' }, { status: 200 });
    }

    // 2. Mark as running
    await supabase
        .from('jobs')
        .update({ status: 'running', locked_at: new Date().toISOString() })
        .eq('id', job.id);

    try {
        let result;

        if (job.job_type === 'ai_outline') {
            const { project_id, prompt } = job.payload as { project_id: string; prompt: string };

            // Fetch project details for context
            const { data: project } = await supabase
                .from('book_projects')
                .select('*')
                .eq('id', project_id)
                .single();

            const aiPrompt = `Generate a 5-page story outline for a Caribbean children's book.
        Title: ${project?.title || 'Untitled'}
        Island: ${project?.island_code || 'TT'}
        Age Band: ${project?.age_band || '3-5'}
        Core Hook: ${prompt}
        
        Provide the result as a JSON array of 5 objects, each with "page_number" and "description".`;

            const response = await generateContent(aiPrompt);

            // Extract JSON if AI wrapped it in markdown
            const jsonStr = response.replace(/```json|```/g, '').trim();
            const outline = JSON.parse(jsonStr);

            // Update project
            await supabase
                .from('book_projects')
                .update({ outline })
                .eq('id', project_id);

            result = { outline };
        }

        // 3. Mark as completed
        await supabase
            .from('jobs')
            .update({ status: 'completed', result, updated_at: new Date().toISOString() })
            .eq('id', job.id);

        return NextResponse.json({ message: 'Job processed', job_id: job.id, result });
    } catch (error: any) {
        console.error('Job error:', error);
        await supabase
            .from('jobs')
            .update({ status: 'failed', error: error.message, updated_at: new Date().toISOString() })
            .eq('id', job.id);

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
