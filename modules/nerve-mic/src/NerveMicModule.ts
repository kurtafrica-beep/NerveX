import { NativeModule, requireOptionalNativeModule } from 'expo';

export type MicKind = 'phone' | 'bluetooth' | 'wired' | 'other';
export type MicStart = { kind: MicKind; name: string; connected: boolean; note: string };
export type MicInput = { id: string; type: number; kind: MicKind; name: string };

declare class NerveMicModule extends NativeModule<{}> {
  start(): Promise<MicStart>;
  stop(): boolean;
  inputs(): MicInput[];
  recordingFrom(): MicKind | '';
}

// Android only. Null anywhere the native code isn't built in.
export default requireOptionalNativeModule<NerveMicModule>('NerveMic');
