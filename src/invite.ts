import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';

// Invites: a code (the first 8 characters of your account id) and a link.
// Android friends install the APK; everyone else uses the web version, where the
// link carries the code so they land in your circle without typing it.
export const APK_URL = 'https://github.com/kurtafrica-beep/NerveX/releases/latest/download/nerve.apk';
export const WEB_URL = 'https://kurtafrica-beep.github.io/NerveX/';
const PENDING = 'nerve.invite.pending';

export const inviteCode = (uid: string) => uid.replace(/-/g, '').slice(0, 8).toUpperCase();

export function inviteMessage(code: string) {
  return (
    `Do the scary social stuff with me on Nerve.\n\n` +
    `iPhone or computer: ${WEB_URL}?invite=${code}\n` +
    `Android app: ${APK_URL}\n\n` +
    `If it asks, my invite code is ${code}.`
  );
}

// Returns 'copied' when the browser can't share and the invite went to the clipboard.
export async function sendInvite(code: string): Promise<'shared' | 'copied' | 'failed'> {
  const message = inviteMessage(code);
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    try {
      if (nav?.share) {
        await nav.share({ text: message });
        return 'shared';
      }
      await nav?.clipboard?.writeText(message);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'failed';
  }
}

// Web: remember ?invite=CODE from the link through sign-up.
export async function captureInvite() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const code = url.searchParams.get('invite');
  if (!code) return;
  await AsyncStorage.setItem(PENDING, code.slice(0, 8)).catch(() => {});
  url.searchParams.delete('invite');
  window.history.replaceState(null, '', url.toString());
}

export async function takePendingInvite(): Promise<string> {
  const code = (await AsyncStorage.getItem(PENDING).catch(() => null)) ?? '';
  if (code) await AsyncStorage.removeItem(PENDING).catch(() => {});
  return code;
}
