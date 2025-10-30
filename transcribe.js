// transcribe.js

// --- 1. Import Dependencies ---
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
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
            .noVideo() // Don't include video
            .audioCodec('libmp3lame') // Use MP3 codec
            .audioBitrate(128) // Set bitrate
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
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language: 'es'
    });

    console.log(`[OpenAI] Transcription successful.`);
    return transcription.text;
}

// --- 5. Main Function ---
async function processDirectory(dirPath) {
    console.log(`Scanning directory: ${dirPath}`);

    try {
        // Read all files in the directory
        const files = await fs.readdir(dirPath);

        // Loop over each file sequentially
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();

            // Check if the file is a video
            if (VIDEO_EXTENSIONS.includes(ext)) {
                const fullVideoPath = path.join(dirPath, file);
                const fileData = path.parse(file); // { name: 'my-video', ext: '.mp4' }

                // Define paths for temporary audio and final transcript
                const tempAudioPath = path.join(dirPath, `${fileData.name}.mp3`);
                const transcriptPath = path.join(dirPath, `${fileData.name}.txt`);

                console.log(`\n--- Processing: ${file} ---`);

                try {
                    // --- Step A: Extract Audio ---
                    await extractAudio(fullVideoPath, tempAudioPath);

                    // --- Step B: Transcribe Audio ---
                    const transcriptText = await transcribeAudio(tempAudioPath);

                    // --- Step C: Save Transcription ---
                    await fs.writeFile(transcriptPath, transcriptText);
                    console.log(`[FS] Saved transcript to ${transcriptPath}`);

                } catch (err) {
                    console.error(`Failed to process ${file}. Error: ${err.message}`);

                } finally {
                    // --- Step D: Cleanup ---
                    // Always delete the temporary audio file, even if transcription failed
                    try {
                        await fs.unlink(tempAudioPath);
                        console.log(`[FS] Cleaned up temporary file ${tempAudioPath}`);
                    } catch (cleanupErr) {
                        // If cleanup fails, just log it. The main error is more important.
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
    // Get the directory path from the command line argument
    const dirPath = process.argv[2];

    if (!dirPath) {
        console.error('❌ Error: Please provide a directory path.');
        console.log('Usage: node transcribe.js /path/to/your/videos');
        return;
    }

    // Resolve the path to an absolute path
    const absolutePath = path.resolve(dirPath);

    await processDirectory(absolutePath);
}

run();