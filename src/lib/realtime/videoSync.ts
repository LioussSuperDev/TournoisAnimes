export interface VideoState {
  isPlaying: boolean;
  positionSeconds: number;
  /** Server epoch ms when this state was set — clients project the
   * current position from here when isPlaying, instead of us streaming
   * position updates every second. */
  updatedAt: number;
}

// Same globalThis trick as presence.ts: the custom server and Next's API
// routes are two separate module instances of this file in the same
// process, so a plain module-level Map wouldn't be shared between them.
declare global {
  var __videoSync: Map<string, VideoState> | undefined;
}

const videoStates = globalThis.__videoSync ?? new Map<string, VideoState>();
globalThis.__videoSync = videoStates;

export function setVideoState(duelId: string, state: VideoState) {
  videoStates.set(duelId, state);
}

export function getVideoState(duelId: string): VideoState | null {
  return videoStates.get(duelId) ?? null;
}

export function clearVideoState(duelId: string) {
  videoStates.delete(duelId);
}
