// transcribe.js

// --- 1. Import Dependencies ---
import { OpenAI } from 'openai';
import fs from 'fs'; // <-- CHANGED: Import the main 'fs' module
import fsPromises from 'fs/promises'; // <-- CHANGED: Import promises as 'fsPromises'
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';

// Load environment variables (OPENAI_API_KEY) from .env file
dotenv.config();

// --- 2. Configure OpenAI Client ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define the video extensions we want to process
const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.mkv', '.mov', '.avi', '.webm', '.flv'];

// --- 3. Helper Function: Extract Audio ---
// This function uses ffmpeg to extract audio from a video file
// and saves it as a temporary MP3 file.
function extractAudio(videoPath, audioPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .noVideo()
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .save(audioPath)
            .on('end', () => {
                console.log(`[FFmpeg] Extracted audio to ${audioPath}`);
                resolve();
            })
            .on('error', (err) => {
                console.error(`[FFmpeg] Error: ${err.message}`);
                reject(err);
            });
    });
}

// --- 4. Helper Function: Transcribe Audio ---
// This function sends the audio file to the Whisper API
async function transcribeAudio(audioPath) {
    console.log(`[OpenAI] Sending ${audioPath} to Whisper API...`);

    const transcription = await openai.audio.transcriptions.create({
        // Use the main 'fs' module which has 'createReadStream'
        file: fs.createReadStream(audioPath), // <-- This line now works
        model: 'whisper-1',
    });

    console.log(`[OpenAI] Transcription successful.`);
    return transcription.text;
}

// --- 5. Main Function ---
async function processDirectory(dirPath) {
    console.log(`Scanning directory: ${dirPath}`);

    try {
        // Read all files in the directory
        const files = await fsPromises.readdir(dirPath); // <-- CHANGED: Use fsPromises

        // Loop over each file sequentially
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();

            // Check if the file is a video
            if (VIDEO_EXTENSIONS.includes(ext)) {
                const fullVideoPath = path.join(dirPath, file);
                const fileData = path.parse(file);

                const tempAudioPath = path.join(dirPath, `${fileData.name}.mp3`);
                const transcriptPath = path.join(dirPath, `${fileData.name}.txt`);

                console.log(`\n--- Processing: ${file} ---`);

                try {
                    // --- Step A: Extract Audio ---
                    await extractAudio(fullVideoPath, tempAudioPath);

                    // --- Step B: Transcribe Audio ---
                    const transcriptText = await transcribeAudio(tempAudioPath);

                    // --- Step C: Save Transcription ---
                    await fsPromises.writeFile(transcriptPath, transcriptText); // <-- CHANGED: Use fsPromises
                    console.log(`[FS] Saved transcript to ${transcriptPath}`);

                } catch (err) {
                    console.error(`Failed to process ${file}. Error: ${err.message}`);

                } finally {
                    // --- Step D: Cleanup ---
                    try {
                        await fsPromises.unlink(tempAudioPath); // <-- CHANGED: Use fsPromises
                        console.log(`[FS] Cleaned up temporary file ${tempAudioPath}`);
                    } catch (cleanupErr) {
                        console.warn(`Could not delete temporary file ${tempAudioPath}`);
                    }
                }
            }
        }
        console.log('\n✅ All video files processed.');
    } catch (err) {
        console.error(`Could not scan directory ${dirPath}. Error: ${err.message}`);
    }
}

// --- 6. Run the Script ---
async function run() {
    const dirPath = process.argv[2];

    if (!dirPath) {
        console.error('❌ Error: Please provide a directory path.');
        console.log('Usage: node transcribe.js /path/to/your/videos');
        return;
    }

    const absolutePath = path.resolve(dirPath);

    await processDirectory(absolutePath);
}

run();