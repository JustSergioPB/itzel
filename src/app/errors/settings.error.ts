export const codes = ['missingAiKey'] as const;
export type Code = (typeof codes)[number];

export class SettingsError extends Error {
  constructor(public code: Code) {
    super();
  }
}
