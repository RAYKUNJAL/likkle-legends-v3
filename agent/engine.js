require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

const AGENT_NAME = 'Likkle Legends Engine Agent';

async function processAiOutline(job) {
    const { project_id, prompt } = job.payload;

    // 1. Fetch project details for context
    const { data: project, error: pError } = await supabase
        .from('book_projects')
        .select('*')
        .eq('id', project_id)
        .single();

    if (pError) throw pError;

    console.log(`[${AGENT_NAME}] Generating outline for: ${project.title}`);

    // 2. Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const systemPrompt = `
    You are the Likkle Legends AI Story Architect. 
    Your mission is to create culturally authentic Caribbean children's story outlines.
    Current Island Context: ${project.island_code}
    Target Age Band: ${project.age_band}
    Dialect Mode: ${project.dialect_mode}
    
    Principles:
    - Protect the "Culture Moat": Use accurate folklore references (e.g., Douens for TT, Duppies for JM).
    - COPPA compliant: No pii, child-safe language.
    - Structure: 8-10 pages.
    
    Return a JSON object with:
    {
      "summary": "...",
      "characters": [{"name": "...", "description": "..."}],
      "pages": [{"page_number": 1, "description": "...", "art_prompt": "..."}]
    }
  `;

    const result = await model.generateContent([systemPrompt, `User Input: ${prompt}`]);
    const response = await result.response;
    const text = response.text();

    // Clean JSON from markdown if needed
    const jsonContent = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const outline = JSON.parse(jsonContent);

    // 3. Update Project
    await supabase
        .from('book_projects')
        .update({
            outline: outline,
            characters: outline.characters,
            status: 'in_review'
        })
        .eq('id', project_id);

    console.log(`[${AGENT_NAME}] Outline generated and project updated.`);
}

async function runWorker() {
    console.log(`[${AGENT_NAME}] Running... Watching for jobs.`);

    while (true) {
        try {
            // Pick up one job
            const { data: job, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('status', 'queued')
                .order('priority', { ascending: false })
                .limit(1)
                .single();

            if (job) {
                // Lock it
                await supabase.from('jobs').update({ status: 'running', locked_at: new Date().toISOString() }).eq('id', job.id);

                try {
                    if (job.job_type === 'ai_outline') {
                        await processAiOutline(job);
                    } else {
                        console.log(`[${AGENT_NAME}] Unknown job type: ${job.job_type}`);
                    }

                    // Complete it
                    await supabase.from('jobs').update({ status: 'completed' }).eq('id', job.id);
                } catch (err) {
                    console.error(`[${AGENT_NAME}] Job ${job.id} failed:`, err.message);
                    await supabase.from('jobs').update({
                        status: 'failed',
                        error: err.message,
                        attempts: (job.attempts || 0) + 1
                    }).eq('id', job.id);
                }
            }
        } catch (err) {
            if (err.message !== 'JSON object requested, multiple (or no) rows returned') {
                console.error(`[${AGENT_NAME}] Error polling:`, err.message);
            }
        }

        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

runWorker();
