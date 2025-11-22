export const videoStatuses = ['pending', 'procesing', 'ready', 'error'] as const;
export type VideoStatus = (typeof videoStatuses)[number];

export interface Video {
  id: string;
  name: string;
  transcript: string | null;
  summary: string | null;
  status: VideoStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateVideo = Pick<Video, 'name' | 'publishedAt'>;
export type VideoWithTranscript = Omit<Video, 'transcript'> & { transcript: string };
export type CompletedVideo = Omit<VideoWithTranscript, 'summary'> & { summary: string };
