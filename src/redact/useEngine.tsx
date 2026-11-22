import { File, Paths } from 'expo-file-system';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { ENGINE_JS } from './engineSource';
import type { Engine, Span } from './types';

// Android: the engine runs in a hidden WebView. It has the browser's audio
// decoder (so it reads the m4a the recorder makes) and a fast JavaScript
// engine, and the work happens off the app's UI thread. Nothing leaves the phone.
// The web version is useEngine.web.tsx.

const IN_CHUNK = 512 * 1024; // characters of base64 per push into the page

const PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
${ENGINE_JS.replace(/<\/script/gi, '<\\/script')}
(function(){
  var NR = window.NerveRedact;
  function post(m){ window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
  window.__call = function(id, method, args){
    Promise.resolve().then(function(){
      if (method === 'renderBase64') {
        var b64 = NR.renderBase64(args[0]), CH = 1048576, n = Math.ceil(b64.length / CH);
        for (var i = 0; i < n; i++) post({ id: id, part: i, of: n, data: b64.slice(i * CH, (i + 1) * CH) });
        return { parts: n };
      }
      return NR[method].apply(null, args || []);
    }).then(function(r){ post({ id: id, ok: true, r: r }); })
      .catch(function(e){ post({ id: id, ok: false, e: String((e && e.message) || e) }); });
  };
  post({ ready: true });
})();
</script></body></html>`;

type Waiter = { resolve: (v: unknown) => void; reject: (e: Error) => void; file?: File; writes?: Promise<void> };

export function useRedactEngine(): { engine: Engine; host: React.ReactNode } {
  const view = useRef<{ injectJavaScript: (js: string) => void } | null>(null);
  const [ready, setReady] = useState(false);
  const readyWait = useRef<(() => void)[]>([]);
  const waiters = useRef(new Map<number, Waiter>());
  const nextId = useRef(1);

  const whenReady = useCallback(
    () => new Promise<void>((resolve) => (ready ? resolve() : readyWait.current.push(resolve))),
    [ready],
  );

  const call = useCallback(
    async <R,>(method: string, args: unknown[] = [], file?: File): Promise<R> => {
      await whenReady();
      const id = nextId.current++;
      return new Promise<R>((resolve, reject) => {
        waiters.current.set(id, { resolve: resolve as (v: unknown) => void, reject, file });
        view.current?.injectJavaScript(`window.__call(${id}, ${JSON.stringify(method)}, ${JSON.stringify(args)}); true;`);
      });
    },
    [whenReady],
  );

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    let m: { ready?: boolean; id?: number; ok?: boolean; r?: unknown; e?: string; part?: number; of?: number; data?: string };
    try {
      m = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (m.ready) {
      setReady(true);
      readyWait.current.splice(0).forEach((f) => f());
      return;
    }
    const w = m.id != null ? waiters.current.get(m.id) : undefined;
    if (!w) return;
    if (m.part != null && m.data != null) {
      // A piece of the rendered WAV. Pieces are whole base64 blocks, so each is
      // appended as it arrives, in order.
      const file = w.file;
      const data = m.data;
      const append = m.part > 0;
      w.writes = (w.writes ?? Promise.resolve()).then(() => file?.write(data, { encoding: 'base64', append }));
      return;
    }
    waiters.current.delete(m.id!);
    const done = w.writes ?? Promise.resolve();
    if (m.ok) done.then(() => w.resolve(m.r), () => w.reject(new Error('Could not write the redacted take.')));
    else w.reject(new Error(m.e || 'Redaction failed.'));
  }, []);

  const engine = useMemo<Engine>(
    () => ({
      ready,
      load: async (uri) => {
        const b64 = await new File(uri).base64();
        await call('reset');
        for (let i = 0; i < b64.length; i += IN_CHUNK) {
          await call('push', [b64.slice(i, i + IN_CHUNK)]);
        }
        return call<{ seconds: number }>('decodePushed');
      },
      enroll: () => call('enroll'),
      analyze: (profile) => call('analyze', [profile]),
      render: async (keep: Span[]) => {
        const file = new File(Paths.document, `take-${Date.now()}-redacted.wav`);
        file.create();
        await call('renderBase64', [keep], file);
        return file.uri;
      },
      clear: () => {
        call('clear').catch(() => {});
      },
    }),
    [ready, call],
  );

  const host = (
    <View style={s.hidden} pointerEvents="none">
      <WebView
        ref={(r: { injectJavaScript: (js: string) => void } | null) => {
          view.current = r;
        }}
        source={{ html: PAGE, baseUrl: 'https://nerve.local/' }}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        // the engine needs no network; this keeps it that way
        onShouldStartLoadWithRequest={(r) => r.url.startsWith('https://nerve.local') || r.url === 'about:blank'}
        style={s.web}
      />
    </View>
  );

  return { engine, host };
}

const s = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', left: -10, top: -10 },
  web: { width: 1, height: 1 },
});
