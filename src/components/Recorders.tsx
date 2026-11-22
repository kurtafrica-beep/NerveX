import {
  AudioQuality,
  IOSOutputFormat,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_AUDIO_SECONDS, MAX_VIDEO_SECONDS } from '../config';
import { clockText, type Recording } from '../data';
import { C, F } from '../theme';
import { Btn, Icon, T } from '../ui';
import { AFTER_BEEP_MS, beep, wait } from '../beep';

// Speech-quality mono AAC: about 7 MB for a full 30 minutes.
const VOICE: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 32000,
  android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
  ios: { outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.MEDIUM },
  // bitRate above becomes the audio bitrate. bitsPerSecond here would be split
  // with a video track the browser assumes, leaving voice at about 5 kbps.
  web: { mimeType: 'audio/webm' },
};

// Voice recording that starts on the same tap that asks for it.
export function useVoiceRecorder(onDone: (rec: Recording) => void) {
  const recorder = useAudioRecorder(VOICE);
  const state = useAudioRecorderState(recorder, 500);
  const [active, setActive] = useState(false);
  const last = useRef(0);
  const stopping = useRef(false);

  // Remember the running length: the recorder reports zero once it stops.
  useEffect(() => {
    if (state.isRecording) last.current = state.durationMillis;
  }, [state.isRecording, state.durationMillis]);

  const start = useCallback(async (): Promise<string> => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) return 'Nerve needs the microphone to record. Allow it in your phone settings.';
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      await beep('start');
      await wait(AFTER_BEEP_MS);
      last.current = 0;
      stopping.current = false;
      recorder.record();
      setActive(true);
      return '';
    } catch {
      return 'Recording could not start. Close other apps using the microphone and try again.';
    }
  }, [recorder]);

  const stop = useCallback(async () => {
    if (stopping.current) return;
    stopping.current = true;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // The file is still there if the recorder stopped on its own.
    }
    beep('stop');
    setActive(false);
    const uri = recorder.uri;
    if (uri) onDone({ kind: 'voice', uri, seconds: last.current / 1000 });
  }, [recorder, onDone]);

  // Hard stop at the limit.
  useEffect(() => {
    if (active && state.durationMillis >= MAX_AUDIO_SECONDS * 1000) stop();
  }, [active, state.durationMillis, stop]);

  return { active, seconds: (active ? state.durationMillis : 0) / 1000, start, stop };
}

export function RecordingBar({ seconds, limit, onStop }: { seconds: number; limit: number; onStop: () => void }) {
  return (
    <View style={s.bar}>
      <View style={s.dot} />
      <View style={{ flex: 1 }}>
        <T v="semi">Recording {clockText(seconds)}</T>
        <T v="small">Stops by itself at {clockText(limit)}</T>
      </View>
      <Btn label="Stop" icon="stop" kind="dark" small onPress={onStop} />
    </View>
  );
}

// Full-screen selfie camera. Recording starts as soon as the camera is ready.
export function VideoRecorder({ onDone, onCancel }: { onDone: (rec: Recording) => void; onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  const camera = useRef<CameraView>(null);
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [asked, setAsked] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const startedAt = useRef(0);
  const cancelled = useRef(false);

  useEffect(() => {
    (async () => {
      await requestCam();
      await requestMic();
      setAsked(true);
    })();
    // Ask once when the camera opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((Date.now() - startedAt.current) / 1000), 250);
    return () => clearInterval(id);
  }, [recording]);

  const begin = async () => {
    if (recording || !camera.current) return;
    startedAt.current = Date.now();
    setRecording(true);
    try {
      const result = await camera.current.recordAsync({ maxDuration: MAX_VIDEO_SECONDS });
      const length = (Date.now() - startedAt.current) / 1000;
      setRecording(false);
      if (cancelled.current || !result?.uri) onCancel();
      else onDone({ kind: 'video', uri: result.uri, seconds: length });
    } catch {
      setRecording(false);
      setError('The camera could not record. Close it and try again.');
    }
  };

  const close = () => {
    if (recording) {
      cancelled.current = true;
      camera.current?.stopRecording();
    } else {
      onCancel();
    }
  };

  const granted = !!camPerm?.granted && !!micPerm?.granted;

  return (
    <View style={s.screen}>
      {granted ? (
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing="front"
          mode="video"
          mirror
          videoQuality="480p"
          videoBitrate={1500000}
          onCameraReady={begin}
        />
      ) : null}

      <View style={[s.top, { paddingTop: insets.top + 10 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close camera" onPress={close} hitSlop={12} style={s.close}>
          <Icon name="back" color="#fff" />
        </Pressable>
        {recording ? (
          <View style={s.timer}>
            <View style={s.dot} />
            <T style={s.timerText}>
              {clockText(seconds)} / {clockText(MAX_VIDEO_SECONDS)}
            </T>
          </View>
        ) : null}
      </View>

      <View style={[s.bottom, { paddingBottom: insets.bottom + 24 }]}>
        {!granted && asked ? (
          <T style={s.note}>Nerve needs the camera and microphone to record video. Allow both in your phone settings, then come back.</T>
        ) : null}
        {error ? <T style={s.note}>{error}</T> : null}
        {granted && !error ? (
          <>
            <T style={s.note}>{recording ? 'Film yourself, not them.' : 'Starting the camera…'}</T>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop recording"
              disabled={!recording}
              onPress={() => camera.current?.stopRecording()}
              style={[s.shutter, !recording && { opacity: 0.4 }]}>
              <View style={s.square} />
            </Pressable>
          </>
        ) : (
          <Btn label="Close" kind="primary" onPress={onCancel} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.rec,
    backgroundColor: C.surface,
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.rec },
  screen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 30, elevation: 30 },
  top: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.6)' },
  timerText: { color: '#fff', fontFamily: F.semi, fontSize: 16 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: 16, paddingHorizontal: 24 },
  note: { color: '#fff', textAlign: 'center', fontFamily: F.medium, fontSize: 16 },
  shutter: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  square: { width: 32, height: 32, borderRadius: 6, backgroundColor: C.rec },
});
