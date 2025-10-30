// compile.js

// --- 1. Import Dependencies ---
import fs from 'fs/promises';
import path from 'path';

// --- 2. Configuration ---
// The name of the final, compiled report file.
const OUTPUT_FILENAME = '_Compiled_Summaries.txt';

// --- 3. Main Function ---
async function compileSummaries(dirPath) {
    console.log(`Scanning directory for 'SUMMARY-' files: ${dirPath}`);

    try {
        // --- Step A: Find all 'SUMMARY-' files ---
        const allFiles = await fs.readdir(dirPath);

        const summaryFiles = allFiles.filter(file =>
            file.startsWith('SUMMARY-') && file.endsWith('.txt')
        );

        if (summaryFiles.length === 0) {
            console.log('❌ No "SUMMARY-" files were found in this directory.');
            return;
        }

        console.log(`Found ${summaryFiles.length} summary files. Processing...`);

        // --- Step B: Read file content and stats in parallel ---
        const dataPromises = summaryFiles.map(async (file) => {
            const fullPath = path.join(dirPath, file);

            // Get file stats (for the date) and content
            const stats = await fs.stat(fullPath);
            const content = await fs.readFile(fullPath, 'utf8');

            // Get the original video name, e.g., "my-video" from "SUMMARY-my-video.txt"
            const videoName = file.replace('SUMMARY-', '').replace('.txt', '');

            return {
                date: stats.birthtime, // 'mtime' = modification time. Use stats.birthtime if you prefer.
                name: videoName,
                summary: content,
            };
        });

        // Wait for all files to be read
        const allSummaries = await Promise.all(dataPromises);

        // --- Step C: Sort by date (oldest to newest) ---
        allSummaries.sort((a, b) => a.date.getTime() - b.date.getTime());

        // --- Step D: Format the final report ---
        const reportEntries = allSummaries.map(item => {
            // Format the date to be human-readable
            const formattedDate = item.date.toLocaleString();

            // This is the format you requested
            return `Fecha: ${formattedDate}\nVideo: ${item.name}\nSummary:\n\n${item.summary}`;
        });

        // Join each entry with two newlines to separate them
        const finalReport = reportEntries.join('\n\n');

        // --- Step E: Save the compiled file ---
        const outputPath = path.join(dirPath, OUTPUT_FILENAME);
        await fs.writeFile(outputPath, finalReport);

        console.log(`\n✅ Success! Compiled report saved to: ${outputPath}`);

    } catch (err) {
        console.error(`An error occurred: ${err.message}`);
    }
}

// --- 4. Run the Script ---
async function run() {
    const dirPath = process.argv[2];

    if (!dirPath) {
        console.error('❌ Error: Please provide a directory path.');
        console.log('Usage: node compile.js /path/to/your/summaries');
        return;
    }

    const absolutePath = path.resolve(dirPath);
    await compileSummaries(absolutePath);
}

run();