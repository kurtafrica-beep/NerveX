# Nerve

Do the move. Drop the line.

150 moves for talking to people, in five branches (Confidence, Talk, Cues, Voice, Sell), each with five levels. A level opens when every move in the one before it has a line. Cues is built on Vanessa Van Edwards’ work on warmth and competence; Voice on Vinh Giang’s teaching on vocal foundations and connection; Sell on Alex Hormozi’s sales frameworks. Pick one tonight, do it, and tell your circle what happened in a line, a voice note or a short video.

Android app built with Expo (React Native). The backend is a Supabase project: Google sign-in, Postgres tables behind row-level security, and a private bucket for recordings.

## What is in here

| Path | What it is |
| --- | --- |
| `App.tsx` | Shell: top bar, three tabs, the plus button, the move sheet |
| `src/moves.ts` | The 150 moves, their reps and upgrades. Edit the wording here |
| `src/data.tsx` | Loads the feed, live updates, and every write (lines, kudos, comments, challenges, uploads) |
| `src/auth.tsx` | Google sign-in through the system browser |
| `src/screens/` | Sign-in, Feed, Tonight, You, and the move sheet |
| `src/components/Recorders.tsx` | Voice recording (starts on the tap, up to 30 minutes) and the selfie video recorder (up to 1 minute) |
| `src/mic.ts`, `modules/nerve-mic/` | Records from a connected headset's mic on Android. The module is native Kotlin: it opens the headset's call link before a take and closes it after |
| `src/config.ts` | Supabase URL and publishable key, recording limits |
| `.github/workflows/android-apk.yml` | Builds an installable APK on every push to `main` |

## Sign-in: email and password

People can create an account with a name, email and password, or use Google.

By default Supabase asks new email accounts to confirm their address, and its built-in mail service only delivers to members of your Supabase organisation. For anyone else to sign up by email, do one of these in the Supabase dashboard for the **Nerve** project:

- Turn off **Confirm email** under Authentication, Sign In / Providers, Email. Accounts then work the moment they are created.
- Or keep confirmation on and connect your own mail service under Authentication, Emails, SMTP settings.

There is no password reset screen yet.

## One-time setup: Google sign-in

Sign-in will not work until Google and Supabase know about each other.

1. In Google Cloud Console, create an OAuth client of type **Web application**. Add this authorised redirect URI:
   `https://ddvsifbydoukfwohkqod.supabase.co/auth/v1/callback`
2. In the Supabase dashboard for the **Nerve** project, open Authentication, then Sign In / Providers, then Google. Turn it on and paste the client ID and client secret.
3. In Authentication, URL Configuration, add `nerve://auth` to the redirect URLs.

## Getting it on a phone

**From GitHub (no computer needed).** Every push to `main` builds an APK and publishes it as a release. Install link:
`https://github.com/kurtafrica-beep/NerveX/releases/latest/download/nerve.apk`

**With Expo's build service.** `npx eas-cli@latest build -p android --profile preview` builds the same APK in Expo's cloud and gives you an install link.

**Locally.** `npm install`, then `npx expo run:android` with a phone plugged in or an emulator running. Expo Go will not work, because the app records audio and video with native modules.

## Before a public store listing

This is a test build for a closed circle. A public listing still needs: report and block tools, a privacy policy, in-app account deletion, a release signing key (the test build is signed with the debug key), and your own package name if you do not want `com.nervex.app`.

## Checks

```bash
npx tsc --noEmit                      # types
npx expo export --platform android    # bundles the app
```
