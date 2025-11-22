import * as uuid from 'uuid';
import { CreateVideo, Video } from '../types/video.types';

export const create = (data: CreateVideo): Video => ({
  ...data,
  id: uuid.v7(),
  transcript: null,
  summary: null,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const process = (data: Video): Video => ({
  ...data,
  status: 'procesing',
  updatedAt: new Date(),
});

export const addTranscription = (
  data: Video,
  transcript: string,
): Video & { transcript: string } => ({
  ...data,
  transcript,
  status: 'procesing',
  updatedAt: new Date(),
});

export const addSummary = (data: Video, summary: string): Video => ({
  ...data,
  summary,
  status: 'ready',
  updatedAt: new Date(),
});

export const fail = (data: Video): Video => ({
  ...data,
  status: 'error',
  updatedAt: new Date(),
});
