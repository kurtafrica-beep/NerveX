import { File, Paths } from 'expo-file-system';

// Where recordings live between being made and being uploaded. On a phone that's
// the app's documents folder; the web version (takeStore.web.ts) uses the browser.

// Move the recorder's temporary file somewhere the phone won't clear it.
export async function keep(uri: string, ext = 'm4a'): Promise<string> {
  try {
    const src = new File(uri);
    const dest = new File(Paths.document, `take-${Date.now()}.${ext}`);
    src.move(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}

export function remove(uri: string) {
  try {
    new File(uri).delete();
  } catch {
    // already gone
  }
}

// A URI the audio player can open.
export async function playable(uri: string): Promise<string> {
  return uri;
}

export async function readRecording(uri: string, kind: 'voice' | 'video', wav?: boolean) {
  return {
    body: await new File(uri).arrayBuffer(),
    ext: wav ? 'wav' : kind === 'voice' ? 'm4a' : 'mp4',
    type: wav ? 'audio/wav' : kind === 'voice' ? 'audio/mp4' : 'video/mp4',
  };
}
