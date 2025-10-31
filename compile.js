// compile.js

// --- 1. Import Dependencies ---
import fs from 'fs/promises';
import path from 'path';

// --- 2. Configuration ---
// The name of the final, compiled report
const OUTPUT_FILENAME = 'todos_los_resumenes.txt';

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
            const transcript = await fs.readFile(fullPath.replace('SUMMARY-', ''), 'utf8');

            // Get the original video name, e.g., "my-video" from "SUMMARY-my-video.txt"
            const videoName = file.replace('SUMMARY-', '').replace('.txt', '');

            return {
                date: getFileDate(videoName) || stats.mtime,
                name: videoName,
                summary: content,
                transcript
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
            return `Fecha: ${formattedDate}\nVideo: ${item.name}\n\nDescripción:\n\n${item.summary}\n\nTranscripción Completa:\n\n${item.transcript}`;
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

function getFileDate(fileName) {
    if (fileName.includes('ScreenRecording')) {
        const [_, unformattedDate] = fileName.split('_');
        const [date, time] = unformattedDate.split(' ');
        const [month, day, year] = date.split('-').map(num => parseInt(num, 10));
        const [hour, min, secs] = time.split('-').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day, hour, min || 0, secs || 0);
    }

    if (fileName.includes('Whatsapp')) {
        const [unformattedDate, unformattedTime] = fileName.split('at');
        const left = unformattedDate.split(' ');
        const date = left[left.length - 1];
        const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
        const right = unformattedTime.split('.txt');
        const [hour, min, secs] = right[0].split('.').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day, hour, min, secs);
    }

    if (fileName.includes('VIDEO')) {
        const [year, month, day, hour, min, secs] = fileName.split('-').filter(part => !isNaN(part));
        return new Date(year, month - 1, day, hour, min, secs);
    }

    return undefined;
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