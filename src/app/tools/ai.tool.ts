import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import OpenAI from 'openai';
import { SettingsService } from '../services/settings.service';
import { SettingsError } from '../errors/settings.error';

@Injectable({
  providedIn: 'root',
})
export class AITool {
  private settings = inject(SettingsService);

  transcribe(file: File): Observable<string> {
    const aiKey = this.settings.settings().aiKey;

    if (!aiKey) throw new SettingsError('missingAiKey');

    const client = new OpenAI({
      apiKey: aiKey,
      dangerouslyAllowBrowser: true,
    });

    return from(
      client.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'es',
      }),
    ).pipe(map((response) => response.text));
  }

  summarize(transcript: string): Observable<string> {
    const aiKey = this.settings.settings().aiKey;

    if (!aiKey) throw new SettingsError('missingAiKey');

    const client = new OpenAI({
      apiKey: aiKey,
      dangerouslyAllowBrowser: true,
    });

    return from(
      client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional legal summarizer. Your task is to generate a neutral, formal, and objective summary of the following transcript. This summary may be used as evidence in a legal proceeding.
              - Do NOT inject any opinion, interpretation, or emotion.
              - Stick strictly to the facts and key statements as presented in the text.
              - The summary must be a clear, concise, and factual representation of the content.
              - Focus on who said what, key events, and factual statements.
              - The tone must be strictly formal and neutral.
              - Do NOT translate the summary, the summary MUST be in the same language as the transcript`,
          },
          {
            role: 'user',
            content: `Please summarize the following transcript:\n\n${transcript}`,
          },
        ],
        model: 'gpt-5-nano',
        temperature: 0,
      }),
    ).pipe(map((response) => response.choices[0].message.content || ''));
  }
}
