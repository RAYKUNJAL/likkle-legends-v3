import { NextRequest, NextResponse } from 'next/server';
import { generateEducationalContent, ContentRequest } from '@/lib/content-agent';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as ContentRequest;

        // Validate required fields
        if (!body.category || !body.ageBand || !body.subject || !body.island) {
            return NextResponse.json(
                { error: 'Missing required fields: category, ageBand, subject, island' },
                { status: 400 }
            );
        }

        // Generate content using AI
        const generatedContent = await generateEducationalContent(body);

        // Optionally save to database
        if (body.topic) { // If a specific topic was provided, save it
            const { error } = await supabaseAdmin.from('content_items').insert({
                title: generatedContent.title,
                content_type: body.category,
                island_code: body.island,
                track_tags: {
                    subject: body.subject,
                    ageBand: body.ageBand,
                    keywords: generatedContent.keywords,
                    learningObjectives: generatedContent.learningObjectives
                },
                review_status: 'draft',
                published: false
            });

            if (error) {
                console.error('Failed to save content:', error);
            }
        }

        return NextResponse.json({
            success: true,
            content: generatedContent
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        console.error('Content generation error:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
