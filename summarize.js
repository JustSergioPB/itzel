// summarize.js

// --- 1. Import Dependencies ---
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables (OPENAI_API_KEY) from .env file
dotenv.config();

// --- 2. Configure OpenAI Client ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- 3. Helper Function: Generate Summary ---
// This function sends the text content to the OpenAI Chat API
async function generateSummary(text) {
    console.log('[OpenAI] Sending text for formal summarization...');

    if (!text || text.trim().length === 0) {
        console.warn('[OpenAI] Text content is empty. Skipping summary.');
        return 'File was empty. No summary generated.';
    }

    // --- MODIFIED PROMPT FOR FORMAL/LEGAL USE ---
    const prompt = `You are a professional legal summarizer. Your task is to generate a neutral, formal, and objective summary of the following transcript. This summary may be used as evidence in a legal proceeding.

- Do NOT inject any opinion, interpretation, or emotion.
- Stick strictly to the facts and key statements as presented in the text.
- The summary must be a clear, concise, and factual representation of the content.
- Focus on who said what, key events, and factual statements.
- The tone must be strictly formal and neutral.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Using a more powerful model for better adherence to strict constraints
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: text },
            ],
            temperature: 0.0, // Set to 0.0 for maximum objectivity and fact-based output
        });

        const summary = response.choices[0].message.content;
        console.log('[OpenAI] Formal summary received.');
        return summary;
    } catch (error) {
        console.error('[OpenAI] Error generating summary:', error.message);
        throw new Error('Failed to generate summary from OpenAI.');
    }
}

// --- 4. Main Function ---
async function processDirectory(dirPath) {
    console.log(`Scanning directory for .txt files: ${dirPath}`);

    try {
        const allFiles = await fs.readdir(dirPath);

        const allTextFiles = allFiles.filter(file =>
            path.extname(file).toLowerCase() === '.txt'
        );

        const existingTranscripts = allTextFiles.filter(file => !file.startsWith('SUMMARY-'));
        const existingSummaries = allTextFiles.filter(file => file.startsWith('SUMMARY-'));

        const summarizedNames = new Set(existingSummaries.map(summaryFile =>
            summaryFile.replace('SUMMARY-', '')
        ));

        const filesToSummarize = existingTranscripts.filter(transcriptFile =>
            !summarizedNames.has(transcriptFile)
        );

        if (filesToSummarize.length === 0) {
            console.log('✅ No new transcripts found to summarize. All files are up to date.');
            return;
        }

        console.log(`Found ${filesToSummarize.length} new text files to summarize.`);

        for (const file of filesToSummarize) {
            console.log(`\n--- Processing: ${file} ---`);

            const fullPath = path.join(dirPath, file);
            const outputFileName = `SUMMARY-${file}`;
            const outputPath = path.join(dirPath, outputFileName);

            try {
                const content = await fs.readFile(fullPath, 'utf8');
                const summaryText = await generateSummary(content);
                await fs.writeFile(outputPath, summaryText);
                console.log(`[FS] Saved summary to ${outputPath}`);
            } catch (err) {
                console.error(`Failed to process ${file}. Error: ${err.message}`);
            }
        }

        console.log('\n✅ All new text files summarized.');

    } catch (err) {
        console.error(`Could not scan directory ${dirPath}. Error: ${err.message}`);
    }
}

// --- 5. Run the Script ---
async function run() {
    const dirPath = process.argv[2];

    if (!dirPath) {
        console.error('❌ Error: Please provide a directory path.');
        console.log('Usage: node summarize.js /path/to/your/transcripts');
        return;
    }

    const absolutePath = path.resolve(dirPath);

    await processDirectory(absolutePath);
}

run();