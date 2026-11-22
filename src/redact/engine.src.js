/* eslint-disable */
// Nerve redaction engine. Plain browser JavaScript, no imports.
//
// It runs in two places: straight in the page on the web, and inside a hidden
// WebView on Android (scripts/build-engine.mjs turns this file into the string
// in engineSource.ts, which is what the app actually loads). Nothing here talks
// to a server: audio goes in, your voice comes out, the rest is silence.
//
// How it decides what is you:
//   1. Find speech (frames well above the room's noise floor).
//   2. Describe each second of speech by its voice colour (MFCCs) and pitch.
//   3. Split those seconds into two groups (k-means). One is you, one is them.
//   4. The group closest to your enrolled voice is you. Loudness helps break ties:
//      your mouth is nearer the phone.
//   5. Keep only stretches that are confidently you. Everything else, including
//      silence and anything unsure, is muted. It fails closed.
(function (root) {
  'use strict';
  var SR = 16000;
  var WIN = 400; // 25 ms
  var HOP = 160; // 10 ms
  var NFFT = 512;
  var NMEL = 26;
  var NCEP = 12; // c1..c12
  var PITCH_N = 1024;
  var PITCH_WIN = 640; // 40 ms
  var LAG_MIN = 40; // 400 Hz
  var LAG_MAX = 228; // 70 Hz
  var KEEP_P = 0.8; // how sure we must be that a stretch is you
  var MIN_KEEP = 30; // frames: shortest stretch of you that is kept (0.3 s)
  var DIMS = NCEP * 2 + 3; // mfcc means, mfcc spreads, pitch, voicing, loudness

  // ---------- small maths ----------
  var TW = {};
  function twiddles(n) {
    if (TW[n]) return TW[n];
    var c = new Float32Array(n / 2), si = new Float32Array(n / 2);
    for (var k = 0; k < n / 2; k++) { c[k] = Math.cos((-2 * Math.PI * k) / n); si[k] = Math.sin((-2 * Math.PI * k) / n); }
    return (TW[n] = { c: c, s: si });
  }
  function fft(re, im) {
    var n = re.length, i, j, k, len, half, stride, wr, wi, tr, ti, ur, ui, tw = twiddles(n);
    for (i = 1, j = 0; i < n; i++) {
      var bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        tr = re[i]; re[i] = re[j]; re[j] = tr;
        tr = im[i]; im[i] = im[j]; im[j] = tr;
      }
    }
    for (len = 2; len <= n; len <<= 1) {
      half = len >> 1;
      stride = n / len;
      for (i = 0; i < n; i += len) {
        for (k = 0; k < half; k++) {
          wr = tw.c[k * stride]; wi = tw.s[k * stride];
          ur = re[i + k]; ui = im[i + k];
          tr = re[i + k + half] * wr - im[i + k + half] * wi;
          ti = re[i + k + half] * wi + im[i + k + half] * wr;
          re[i + k] = ur + tr; im[i + k] = ui + ti;
          re[i + k + half] = ur - tr; im[i + k + half] = ui - ti;
        }
      }
    }
  }

  var hamming = new Float32Array(WIN);
  for (var h = 0; h < WIN; h++) hamming[h] = 0.54 - 0.46 * Math.cos((2 * Math.PI * h) / (WIN - 1));
  var hann = new Float32Array(PITCH_WIN);
  for (var h2 = 0; h2 < PITCH_WIN; h2++) hann[h2] = 0.5 - 0.5 * Math.cos((2 * Math.PI * h2) / (PITCH_WIN - 1));

  function mel(f) { return 2595 * Math.log10(1 + f / 700); }
  function imel(m) { return 700 * (Math.pow(10, m / 2595) - 1); }
  var bins = NFFT / 2 + 1;
  var fbank = (function () {
    var lo = mel(80), hi = mel(7600), pts = [], b = [], m, f;
    for (m = 0; m < NMEL + 2; m++) pts.push(Math.floor(((NFFT + 1) * imel(lo + ((hi - lo) * m) / (NMEL + 1))) / SR));
    for (m = 1; m <= NMEL; m++) {
      var row = new Float32Array(bins);
      row.lo = pts[m - 1]; row.hi = pts[m + 1];
      for (f = pts[m - 1]; f < pts[m]; f++) row[f] = (f - pts[m - 1]) / Math.max(1, pts[m] - pts[m - 1]);
      for (f = pts[m]; f < pts[m + 1]; f++) row[f] = (pts[m + 1] - f) / Math.max(1, pts[m + 1] - pts[m]);
      b.push(row);
    }
    return b;
  })();
  var dct = (function () {
    var d = [], c, m;
    for (c = 1; c <= NCEP; c++) {
      var row = new Float32Array(NMEL);
      for (m = 0; m < NMEL; m++) row[m] = Math.cos((Math.PI * c * (m + 0.5)) / NMEL);
      d.push(row);
    }
    return d;
  })();

  // Any rate in, 16 kHz out. Averages over each output step, which doubles as a
  // rough low-pass when going down from 44.1 or 48 kHz.
  function resample(x, sr) {
    if (sr === SR) return x;
    var ratio = sr / SR, n = Math.floor(x.length / ratio), out = new Float32Array(n), i;
    if (ratio > 1) {
      for (i = 0; i < n; i++) {
        var a = Math.floor(i * ratio), b = Math.min(x.length, Math.floor((i + 1) * ratio)), s = 0;
        for (var j = a; j < b; j++) s += x[j];
        out[i] = s / Math.max(1, b - a);
      }
    } else {
      for (i = 0; i < n; i++) {
        var p = i * ratio, q = Math.floor(p), t = p - q;
        out[i] = x[q] * (1 - t) + (x[Math.min(x.length - 1, q + 1)] || 0) * t;
      }
    }
    return out;
  }

  function percentile(arr, p) {
    var c = Array.prototype.slice.call(arr).sort(function (a, b) { return a - b; });
    return c.length ? c[Math.min(c.length - 1, Math.floor(p * c.length))] : 0;
  }

  // ---------- per-frame features ----------
  function frames(x) {
    var nf = Math.max(0, Math.floor((x.length - WIN) / HOP) + 1);
    var logE = new Float32Array(nf), cep = new Float32Array(nf * NCEP), pitch = new Float32Array(nf);
    var re = new Float32Array(NFFT), im = new Float32Array(NFFT), pw = new Float32Array(bins), melE = new Float32Array(NMEL);
    var i, k, m, c, off, e, prev;
    for (i = 0; i < nf; i++) {
      off = i * HOP; e = 0; prev = off > 0 ? x[off - 1] : 0;
      for (k = 0; k < NFFT; k++) { re[k] = 0; im[k] = 0; }
      for (k = 0; k < WIN; k++) {
        var v = x[off + k];
        e += v * v;
        re[k] = (v - 0.97 * prev) * hamming[k];
        prev = v;
      }
      logE[i] = 10 * Math.log10(e / WIN + 1e-10);
      fft(re, im);
      for (k = 0; k < bins; k++) pw[k] = re[k] * re[k] + im[k] * im[k];
      for (m = 0; m < NMEL; m++) {
        var row = fbank[m], s = 0;
        for (k = row.lo; k < row.hi; k++) s += row[k] * pw[k];
        melE[m] = Math.log(s + 1e-8);
      }
      for (c = 0; c < NCEP; c++) {
        var d = dct[c], acc = 0;
        for (m = 0; m < NMEL; m++) acc += d[m] * melE[m];
        cep[i * NCEP + c] = acc;
      }
    }
    return { nf: nf, logE: logE, cep: cep, pitch: pitch };
  }

  // Pitch by autocorrelation (through the FFT), only on speech frames, every other frame.
  function addPitch(x, F, speech) {
    var re = new Float32Array(PITCH_N), im = new Float32Array(PITCH_N), i, k;
    for (i = 0; i < F.nf; i += 2) {
      if (!speech[i]) continue;
      var off = i * HOP;
      if (off + PITCH_WIN > x.length) break;
      for (k = 0; k < PITCH_N; k++) { re[k] = 0; im[k] = 0; }
      for (k = 0; k < PITCH_WIN; k++) re[k] = x[off + k] * hann[k];
      fft(re, im);
      for (k = 0; k < PITCH_N; k++) { re[k] = re[k] * re[k] + im[k] * im[k]; im[k] = 0; }
      fft(re, im); // power spectrum -> autocorrelation (real, scaled)
      var r0 = re[0] || 1, best = 0, lag = 0;
      for (k = LAG_MIN; k <= LAG_MAX; k++) {
        var r = re[k] / r0;
        if (r > best) { best = r; lag = k; }
      }
      if (best > 0.45 && lag) {
        F.pitch[i] = Math.log2(SR / lag);
        if (i + 1 < F.nf) F.pitch[i + 1] = F.pitch[i];
      }
    }
  }

  function findSpeech(F) {
    var floor = percentile(F.logE, 0.1), on = new Uint8Array(F.nf), i;
    var top = percentile(F.logE, 0.98);
    var thr = Math.max(floor + 9, -62, top - 38);
    for (i = 0; i < F.nf; i++) on[i] = F.logE[i] > thr ? 1 : 0;
    closeGaps(on, 15);
    dropShort(on, 15);
    return { on: on, floor: floor, thr: thr };
  }

  function runs(mask, value) {
    var out = [], start = -1, i;
    for (i = 0; i <= mask.length; i++) {
      var v = i < mask.length ? mask[i] === value : false;
      if (v && start < 0) start = i;
      if (!v && start >= 0) { out.push([start, i]); start = -1; }
    }
    return out;
  }
  function closeGaps(mask, max) {
    var r = runs(mask, 0);
    for (var j = 0; j < r.length; j++) {
      if (r[j][0] === 0 || r[j][1] === mask.length) continue;
      if (r[j][1] - r[j][0] < max) for (var i = r[j][0]; i < r[j][1]; i++) mask[i] = 1;
    }
  }
  function dropShort(mask, min) {
    var r = runs(mask, 1);
    for (var j = 0; j < r.length; j++) if (r[j][1] - r[j][0] < min) for (var i = r[j][0]; i < r[j][1]; i++) mask[i] = 0;
  }

  // ---------- one vector per second of speech ----------
  function windows(F, speech) {
    // Pieces of about a second that never cross a pause, so one piece is
    // almost always one person.
    var out = [], c, i;
    runs(speech, 1).forEach(function (r) {
      var len = r[1] - r[0];
      if (len < 25) return;
      var parts = Math.max(1, Math.round(len / 100)), size = len / parts;
      for (var p = 0; p < parts; p++) {
        var t = r[0] + Math.round(p * size), end = r[0] + Math.round((p + 1) * size);
        var n = 0, sum = new Float64Array(NCEP), sq = new Float64Array(NCEP), pS = 0, pN = 0, eS = 0;
        for (i = t; i < end; i++) {
          n++;
          eS += F.logE[i];
          for (c = 0; c < NCEP; c++) { var v = F.cep[i * NCEP + c]; sum[c] += v; sq[c] += v * v; }
          if (F.pitch[i]) { pS += F.pitch[i]; pN++; }
        }
        var vec = new Float64Array(DIMS);
        for (c = 0; c < NCEP; c++) {
          var mu = sum[c] / n;
          vec[c] = mu;
          vec[NCEP + c] = Math.sqrt(Math.max(0, sq[c] / n - mu * mu));
        }
        vec[2 * NCEP] = pN >= 6 ? pS / pN : NaN; // log2 Hz
        vec[2 * NCEP + 1] = pN / n; // how voiced
        vec[2 * NCEP + 2] = eS / n; // loudness: your mouth is nearest the phone
        out.push({ t0: t, t1: end, n: n, loud: eS / n, vec: vec });
      }
    });
    // Fill missing pitch with the median of known pitch, so a whispery second
    // does not throw the maths.
    var known = out.map(function (w) { return w.vec[2 * NCEP]; }).filter(function (v) { return !isNaN(v); });
    var med = known.length ? percentile(known, 0.5) : 7;
    out.forEach(function (w) { if (isNaN(w.vec[2 * NCEP])) w.vec[2 * NCEP] = med; });
    return out;
  }

  // Pitch matters a lot for telling two people apart, so it counts several times over.
  var WEIGHT = (function () {
    var w = new Float64Array(DIMS), c;
    for (c = 0; c < NCEP; c++) { w[c] = 1; w[NCEP + c] = 0.5; }
    w[2 * NCEP] = 4;
    w[2 * NCEP + 1] = 0.5;
    w[2 * NCEP + 2] = 3;
    return w;
  })();

  function stats(vs) {
    var mu = new Float64Array(DIMS), sd = new Float64Array(DIMS), d, i;
    for (i = 0; i < vs.length; i++) for (d = 0; d < DIMS; d++) mu[d] += vs[i][d] / vs.length;
    for (i = 0; i < vs.length; i++) for (d = 0; d < DIMS; d++) sd[d] += Math.pow(vs[i][d] - mu[d], 2) / vs.length;
    for (d = 0; d < DIMS; d++) sd[d] = Math.sqrt(sd[d]) || 1;
    return { mu: mu, sd: sd };
  }
  function dist(a, b, sd) {
    var s = 0;
    // Your enrolled voice has no loudness (it depends on how you held the phone), so that dimension is skipped for it.
    for (var d = 0; d < DIMS; d++) { if (isNaN(a[d]) || isNaN(b[d])) continue; var z = (a[d] - b[d]) / sd[d]; s += WEIGHT[d] * z * z; }
    return Math.sqrt(s);
  }

  function kmeans2(vs, sd) {
    // start from the two windows furthest apart
    var a = 0, b = 0, best = -1, i, j, it;
    for (i = 0; i < vs.length; i++) { var dd = dist(vs[i], vs[0], sd); if (dd > best) { best = dd; a = i; } }
    best = -1;
    for (i = 0; i < vs.length; i++) { var de = dist(vs[i], vs[a], sd); if (de > best) { best = de; b = i; } }
    var cen = [Float64Array.from(vs[a]), Float64Array.from(vs[b])], lab = new Uint8Array(vs.length);
    for (it = 0; it < 25; it++) {
      for (i = 0; i < vs.length; i++) lab[i] = dist(vs[i], cen[0], sd) <= dist(vs[i], cen[1], sd) ? 0 : 1;
      for (j = 0; j < 2; j++) {
        var n = 0, m = new Float64Array(DIMS);
        for (i = 0; i < vs.length; i++) if (lab[i] === j) { n++; for (var d = 0; d < DIMS; d++) m[d] += vs[i][d]; }
        if (n) { for (var d2 = 0; d2 < DIMS; d2++) m[d2] /= n; cen[j] = m; }
      }
    }
    return { cen: cen, lab: lab };
  }

  // ---------- public ----------
  var NR = {
    pcm: null,
    chunks: [],

    // Android: the app pushes base64 pieces of the recording, then calls decodePushed.
    reset: function () { NR.pcm = null; NR.chunks = []; },
    push: function (b64) { NR.chunks.push(b64); },
    decodePushed: function () {
      var bin = atob(NR.chunks.join('')), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      NR.chunks = [];
      return NR.decodeBuffer(bytes.buffer);
    },
    decodeBuffer: function (buf) {
      var Ctx = root.AudioContext || root.webkitAudioContext;
      var ctx = new Ctx();
      return new Promise(function (resolve, reject) {
        ctx.decodeAudioData(buf, resolve, reject);
      }).then(function (ab) {
        var ch = ab.getChannelData(0), mono = ch;
        if (ab.numberOfChannels > 1) {
          var ch2 = ab.getChannelData(1);
          mono = new Float32Array(ch.length);
          for (var i = 0; i < ch.length; i++) mono[i] = (ch[i] + ch2[i]) / 2;
        }
        NR.pcm = resample(mono, ab.sampleRate);
        if (ctx.close) ctx.close();
        return { seconds: NR.pcm.length / SR };
      });
    },
    // Node tests hand in samples directly.
    setPcm: function (x, sr) { NR.pcm = resample(x, sr); return { seconds: NR.pcm.length / SR }; },

    // Your voice: one averaged description of how you sound.
    enroll: function () {
      var x = NR.pcm;
      if (!x || x.length < SR * 5) return { error: 'That was too short. Read the whole passage.' };
      var F = frames(x), S = findSpeech(F);
      addPitch(x, F, S.on);
      var ws = windows(F, S.on);
      var speechSec = S.on.reduce(function (a, b) { return a + b; }, 0) / 100;
      if (ws.length < 6 || speechSec < 6) return { error: 'Nerve could not hear enough of you. Find a quieter spot and read it a little louder.' };
      var st = stats(ws.map(function (w) { return w.vec; }));
      st.mu[2 * NCEP + 2] = NaN;
      var own = ws.map(function (w) { return dist(w.vec, st.mu, st.sd); });
      var r = Math.max(4.5, percentile(own, 0.9));
      return { profile: { v: 1, mu: Array.from(st.mu, function (v) { return isNaN(v) ? null : v; }), sd: Array.from(st.sd), r: r, n: ws.length, sec: Math.round(speechSec) } };
    },

    // Who spoke when. Returns stretches of you (kept) and of them (muted).
    analyze: function (profile) {
      var x = NR.pcm;
      if (!x) return { error: 'No recording loaded.' };
      var F = frames(x), S = findSpeech(F);
      addPitch(x, F, S.on);
      var ws = windows(F, S.on), duration = x.length / SR;
      var keep = new Uint8Array(F.nf), quality = 'good', note = '';
      var youMu = Float64Array.from(profile.mu, function (v) { return v === null ? NaN : v; });
      if (youMu.length !== DIMS) return { error: 'Set up your voice again. This version of Nerve describes voices differently.' };

      // Distances to your voice use the spread measured when you enrolled, so
      // they mean the same thing in every take. r is how far your own voice
      // usually wanders from its average.
      var psd = Float64Array.from(profile.sd), r = profile.r || 5.7;
      var info = { speech: Math.round(S.on.reduce(function (a2, b2) { return a2 + b2; }, 0)) / 100, pieces: ws.length, r: Math.round(r * 10) / 10 };
      function pNear(d, k) { return 1 / (1 + Math.exp((d - k * r) / (0.12 * r))); }

      if (ws.length >= 2) {
        var vs = ws.map(function (w) { return w.vec; });
        var dAbs = ws.map(function (w) { return dist(w.vec, youMu, psd); });
        var st = stats(vs);
        var km = kmeans2(vs, st.sd);
        var i, g = [[], []], lo = [0, 0];
        for (i = 0; i < ws.length; i++) { g[km.lab[i]].push(dAbs[i]); lo[km.lab[i]] += ws[i].loud; }
        var med = g.map(function (a3) { return a3.length ? percentile(a3, 0.5) : 99; });
        var loud = [g[0].length ? lo[0] / g[0].length : -99, g[1].length ? lo[1] / g[1].length : -99];
        // You are the group that sounds more like your voice; if both sound
        // like you, the louder one (your mouth is nearest the phone).
        var you = Math.abs(med[0] - med[1]) < 0.6 * r ? (loud[0] >= loud[1] ? 0 : 1) : med[0] <= med[1] ? 0 : 1;
        var them = 1 - you;
        var louder = loud[you] - loud[them];
        info.near = [Math.round(med[you] * 10) / 10, Math.round(med[them] * 10) / 10];
        info.louder = Math.round(louder * 10) / 10;
        var pClu = ws.map(function (w) {
          var dy = dist(w.vec, km.cen[you], st.sd), dt = dist(w.vec, km.cen[them], st.sd);
          return 1 / (1 + Math.exp(-(dt * dt - dy * dy) / 2));
        });
        var pw;
        if (med[you] > 1.7 * r) {
          // Nothing here sounds much like you. Keep only pieces that clearly do.
          quality = 'one-them';
          pw = dAbs.map(function (d) { return pNear(d, 1.1); });
        } else if (med[them] > 2.1 * r && g[them].length) {
          // Someone who sounds clearly different from you.
          quality = 'good';
          pw = pClu.map(function (p, k) { return p * pNear(dAbs[k], 2.0); });
        } else {
          // Both groups sound like you. Either it was only you, or the other
          // person sounds a lot like you. Loudness settles it: your mouth is
          // nearest the phone, so keep pieces that sound like you AND are about
          // as loud as your loudest speech. Quieter look-alikes are muted.
          var louds = ws.map(function (w) { return w.loud; });
          var top = percentile(louds, 0.85);
          var dropped = 0;
          pw = dAbs.map(function (d, k) {
            var p = pNear(d, 1.4), byLoud = 1 / (1 + Math.exp(-(ws[k].loud - (top - 4)) / 0.8));
            if (p > KEEP_P && p * byLoud <= KEEP_P) dropped++;
            return p * byLoud;
          });
          quality = dropped > 0 ? 'unsure' : 'one-you';
        }
        // Average each frame over the pieces that cover it.
        var acc = new Float32Array(F.nf), cnt = new Uint8Array(F.nf);
        ws.forEach(function (w, k) { for (var f = w.t0; f < w.t1; f++) if (S.on[f]) { acc[f] += pw[k]; cnt[f]++; } });
        for (i = 0; i < F.nf; i++) keep[i] = S.on[i] && cnt[i] && acc[i] / cnt[i] > KEEP_P ? 1 : 0;
        note =
          quality === 'unsure' ? 'Some speech sounded like you but quieter, so Nerve muted it in case it was someone else. Check before saving.'
          : quality === 'one-them' ? 'This didn’t sound like your voice, so most of it is muted. If it was you, set up your voice again in a quiet spot.'
          : '';
      } else {
        quality = 'empty';
        note = 'Nerve heard almost no speech in this take.';
      }
      closeGaps(keep, 8);
      // Never let gap-closing pull in their speech
      var themMask = new Uint8Array(F.nf), i2;
      for (i2 = 0; i2 < F.nf; i2++) if (S.on[i2] && !keep[i2]) themMask[i2] = 1;
      dropShort(keep, MIN_KEEP);
      for (i2 = 0; i2 < F.nf; i2++) if (keep[i2]) themMask[i2] = 0;

      function toSec(r) { return [Math.round((r[0] * HOP) / 16) / 1000, Math.round((r[1] * HOP + WIN) / 16) / 1000]; }
      var mineRuns = runs(keep, 1).map(toSec);
      var theirRuns = runs(themMask, 1).filter(function (r) { return r[1] - r[0] >= 20; }).map(toSec);
      var youSec = mineRuns.reduce(function (a, r) { return a + r[1] - r[0]; }, 0);
      var themSec = theirRuns.reduce(function (a, r) { return a + r[1] - r[0]; }, 0);
      return { duration: duration, you: mineRuns, them: theirRuns, youSec: youSec, themSec: themSec, quality: quality, note: note, info: info };
    },

    // Build the shareable file: your stretches, silence everywhere else.
    // Returns a 16-bit mono WAV, at a lower rate for long takes so it stays under 48 MB.
    render: function (keepRuns) {
      var x = NR.pcm;
      if (!x) throw new Error('No recording loaded.');
      var outSr = Math.min(SR, Math.floor(48e6 / 2 / Math.max(1, x.length / SR)));
      var y = new Float32Array(x.length), fade = Math.floor(SR * 0.015);
      keepRuns.forEach(function (r) {
        var a = Math.max(0, Math.floor(r[0] * SR)), b = Math.min(x.length, Math.ceil(r[1] * SR));
        for (var i = a; i < b; i++) {
          var g = Math.min(1, (i - a) / fade, (b - 1 - i) / fade);
          y[i] = x[i] * Math.max(0, g);
        }
      });
      var z = y;
      if (outSr !== SR) {
        z = new Float32Array(Math.floor((y.length * outSr) / SR));
        var ratio = SR / outSr;
        for (var q = 0; q < z.length; q++) z[q] = y[Math.min(y.length - 1, Math.floor(q * ratio))];
      }
      var n = z.length, buf = new ArrayBuffer(44 + n * 2), dv = new DataView(buf), o = 0;
      function str(s) { for (var k = 0; k < s.length; k++) dv.setUint8(o++, s.charCodeAt(k)); }
      str('RIFF'); dv.setUint32(o, 36 + n * 2, true); o += 4; str('WAVE'); str('fmt ');
      dv.setUint32(o, 16, true); o += 4; dv.setUint16(o, 1, true); o += 2; dv.setUint16(o, 1, true); o += 2;
      dv.setUint32(o, outSr, true); o += 4; dv.setUint32(o, outSr * 2, true); o += 4;
      dv.setUint16(o, 2, true); o += 2; dv.setUint16(o, 16, true); o += 2; str('data'); dv.setUint32(o, n * 2, true); o += 4;
      for (var t = 0; t < n; t++) { var s = Math.max(-1, Math.min(1, z[t])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
      return buf;
    },
    renderBase64: function (keepRuns) {
      var bytes = new Uint8Array(NR.render(keepRuns)), parts = [], CH = 0x8000;
      for (var i = 0; i < bytes.length; i += CH) parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + CH)));
      return btoa(parts.join(''));
    },
    clear: function () { NR.pcm = null; NR.chunks = []; },
  };

  root.NerveRedact = NR;
})(typeof window !== 'undefined' ? window : globalThis);
