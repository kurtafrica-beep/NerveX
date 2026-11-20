import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import {
  ExpoSpeechRecognitionModule,
  RecognizerIntentExtraLanguageModel,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionOptions,
} from 'expo-speech-recognition';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';
import { clockText, type Recording } from '../data';
import { C } from '../theme';
import { Btn, T } from '../ui';

// Hands-free takes are raw WAV (about 1.9 MB a minute), so they stop by themselves
// at 25 minutes to stay under the 50 MB upload limit.
export const HANDS_FREE_MAX_SECONDS = 25 * 60;
const KEEP_AWAKE_TAG = 'nerve-hands-free';

type Phase = 'off' | 'listening' | 'arming' | 'recording' | 'saving';

const BASE: ExpoSpeechRecognitionOptions = {
  lang: 'en-US',
  interimResults: true,
  continuous: true,
  requiresOnDeviceRecognition: true,
  // Several guesses per phrase: a command counts if any guess has it.
  maxAlternatives: 5,
  // Tell Android to expect these words (Android 13+).
  contextualStrings: ['start', 'stop', 'start recording', 'stop recording'],
};
// While waiting for "start", use the short-phrase model, which is better at single words.
const LISTEN: ExpoSpeechRecognitionOptions = {
  ...BASE,
  androidIntentOptions: { EXTRA_LANGUAGE_MODEL: RecognizerIntentExtraLanguageModel.LANGUAGE_MODEL_WEB_SEARCH },
};

function clean(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
// Words the recognizer often hears in place of the commands.
const START_WORDS = new Set(['start', 'starts', 'started', 'starting', 'stark', 'star', 'stat', 'sturt', 'begin']);
const STOP_WORDS = new Set(['stop', 'stops', 'stopped', 'stopping', 'stopp', 'stoppe']);
// "Stop" after one of these is part of a sentence ("I couldn't stop"), not a command.
const NOT_A_COMMAND = new Set(['not', 'cant', 'can', 'couldnt', 'didnt', 'dont', 'wont', 'never', 'to', 'bus', 'full', 'pit', 'truck', 'one', 'no', 'would', 'should', 'just']);

// The command is the last word of what was just said, after a pause or "okay".
// Checks every alternative guess. "Start recording" and "stop recording" also count.
function heardCommand(texts: string[], words: Set<string>, guard: boolean): boolean {
  return texts.some((text) => {
    let w = clean(text).split(' ').filter(Boolean);
    if (w[w.length - 1] === 'recording') w = w.slice(0, -1);
    const last = w[w.length - 1];
    if (!last || !words.has(last)) return false;
    return !guard || !NOT_A_COMMAND.has(w[w.length - 2] ?? '');
  });
}

// Say "start" to begin a voice take and "stop" to save it to your log, then it listens again.
// The phone's speech recognizer does the listening and records the take itself, because
// Android lets only one thing use the microphone at a time.
export function useHandsFree(onTake: (rec: Recording) => Promise<boolean>) {
  const [phase, setPhaseState] = useState<Phase>('off');
  const [seconds, setSeconds] = useState(0);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState('');
  const phase$ = useRef<Phase>('off');
  const on$ = useRef(false);
  const started = useRef(0);
  const take = useRef<{ uri: string | null; seconds: number }>({ uri: null, seconds: 0 });
  const onTake$ = useRef(onTake);
  const restart = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTake$.current = onTake;
  }, [onTake]);

  const setPhase = (p: Phase) => {
    phase$.current = p;
    setPhaseState(p);
  };

  const listen = useCallback(() => {
    if (!on$.current) return;
    setPhase('listening');
    ExpoSpeechRecognitionModule.start(LISTEN);
  }, []);

  const finishTake = useCallback(async () => {
    const { uri, seconds: length } = take.current;
    take.current = { uri: null, seconds: 0 };
    if (uri && length >= 1) {
      const ok = await onTake$.current({ kind: 'voice', uri, seconds: length, wav: true });
      if (ok) Vibration.vibrate([0, 80, 120, 80]);
    }
    if (on$.current) listen();
    else setPhase('off');
  }, [listen]);

  const stopTake = useCallback(() => {
    if (phase$.current !== 'recording') return;
    setPhase('saving');
    ExpoSpeechRecognitionModule.stop();
  }, []);

  // Turning off mid-take still saves what was recorded.
  const turnOff = useCallback(() => {
    on$.current = false;
    if (restart.current) clearTimeout(restart.current);
    deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
    if (phase$.current === 'recording') {
      setPhase('saving');
      ExpoSpeechRecognitionModule.stop();
    } else if (phase$.current !== 'saving') {
      ExpoSpeechRecognitionModule.abort();
      setPhase('off');
    }
  }, []);

  // Acts on interim results too, so a command is caught as soon as it is heard.
  useSpeechRecognitionEvent('result', (ev) => {
    const texts = ev.results.map((r) => r.transcript).filter(Boolean);
    if (!texts.length) return;
    setHeard(clean(texts[0]).split(' ').slice(-6).join(' '));
    if (phase$.current === 'listening' && heardCommand(texts, START_WORDS, false)) {
      setPhase('arming');
      ExpoSpeechRecognitionModule.abort();
    } else if (phase$.current === 'recording' && heardCommand(texts, STOP_WORDS, true)) {
      stopTake();
    }
  });

  useSpeechRecognitionEvent('audiostart', (ev) => {
    if (phase$.current === 'recording') started.current = ev.timestamp || Date.now();
  });

  useSpeechRecognitionEvent('audioend', (ev) => {
    if (ev.uri && started.current) {
      take.current = { uri: ev.uri, seconds: Math.max(0, ((ev.timestamp || Date.now()) - started.current) / 1000) };
    }
  });

  useSpeechRecognitionEvent('error', (ev) => {
    if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
      setError('Nerve needs the microphone and speech recognition. Allow both in your phone settings.');
      turnOff();
    } else if (ev.error === 'language-not-supported') {
      setError('Your phone needs its offline English speech model. Turn hands-free on again to download it, then retry.');
      ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({ locale: 'en-US' }).catch(() => undefined);
      turnOff();
    } else if (ev.error === 'audio-capture') {
      setError('The microphone is busy or recording is not supported on this phone.');
      turnOff();
    }
    // no-speech, network and interrupted end the session; the end handler restarts it.
  });

  useSpeechRecognitionEvent('end', () => {
    if (restart.current) clearTimeout(restart.current);
    const p = phase$.current;
    if (!on$.current) {
      if (p === 'recording' || p === 'saving') finishTake();
      else setPhase('off');
      return;
    }
    if (p === 'arming') {
      // "start" heard: begin a recording session.
        started.current = 0;
      take.current = { uri: null, seconds: 0 };
      setPhase('recording');
      setSeconds(0);
      Vibration.vibrate(150);
      ExpoSpeechRecognitionModule.start({ ...BASE, recordingOptions: { persist: true } });
    } else if (p === 'recording' || p === 'saving') {
      // "stop" heard, the limit was reached, or the recognizer stopped by itself: keep what was recorded.
      finishTake();
    } else {
      // The recognizer times out on silence; keep listening.
      restart.current = setTimeout(listen, 0);
    }
  });

  // Recording clock and the length limit.
  useEffect(() => {
    if (phase !== 'recording') return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      setSeconds(s);
      if (s >= HANDS_FREE_MAX_SECONDS) stopTake();
    }, 500);
    return () => clearInterval(id);
  }, [phase, stopTake]);

  const turnOn = useCallback(async (): Promise<void> => {
    setError('');
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Nerve needs the microphone and speech recognition. Allow both in your phone settings.');
      return;
    }
    if (!ExpoSpeechRecognitionModule.supportsRecording()) {
      setError('Hands-free needs Android 13 or newer. Use the record buttons instead.');
      return;
    }
    if (!ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
      setError('Hands-free needs on-device speech recognition, which this phone does not offer. Use the record buttons instead.');
      return;
    }
    on$.current = true;
    await activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    listen();
  }, [listen]);

  // Leaving the screen stops listening.
  useEffect(
    () => () => {
      on$.current = false;
      if (restart.current) clearTimeout(restart.current);
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
      ExpoSpeechRecognitionModule.abort();
    },
    [],
  );

  const startNow = useCallback(() => {
    if (phase$.current !== 'listening') return;
    setPhase('arming');
    ExpoSpeechRecognitionModule.abort();
  }, []);

  return { phase, on: phase !== 'off', seconds, heard, error, turnOn, turnOff, stopTake, startNow };
}

export function HandsFreePanel({ hf }: { hf: ReturnType<typeof useHandsFree> }) {
  const status =
    hf.phase === 'recording'
      ? `Recording ${clockText(hf.seconds)}. Say “stop” to save it.`
      : hf.phase === 'saving'
        ? 'Saving your take…'
        : hf.phase === 'arming'
          ? 'Starting…'
          : 'Listening. Say “start” to record a take.';
  return (
    <View style={[s.panel, hf.phase === 'recording' && { borderColor: C.rec }]}>
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: hf.phase === 'recording' ? C.rec : C.accent }]} />
        <T v="semi" style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>
          {status}
        </T>
      </View>
      {hf.heard ? (
        <T v="small" numberOfLines={1}>
          Heard: “{hf.heard}”
        </T>
      ) : null}
      <T v="small">
        Pause for a beat, then say the word clearly. “Okay, start” and “stop recording” work too. Each take saves to your log as private. Keep Nerve open; the screen stays on. Takes stop by themselves at {clockText(HANDS_FREE_MAX_SECONDS)}.
      </T>
      <View style={s.row}>
        {hf.phase === 'recording' ? <Btn label="Stop and save" icon="stop" kind="dark" small onPress={hf.stopTake} /> : null}
        {hf.phase === 'listening' ? <Btn label="Start now" icon="mic" kind="primary" small onPress={hf.startNow} /> : null}
        <Btn label="Turn off hands-free" kind="quiet" small onPress={hf.turnOff} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  panel: { gap: 8, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: C.accent, backgroundColor: C.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  dot: { width: 12, height: 12, borderRadius: 6 },
});

