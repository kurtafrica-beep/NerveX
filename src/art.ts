/* eslint-disable */
// @ts-nocheck
// SVG art as strings, drawn with SvgXml: trail patches, poster banners and place cards.
// Kept word for word in step with the web page.
import { HUE, PLACE_HUE } from './progress';
import { PLACES } from './rpgData';

  var PATCH_SHAPE = {
  c: '<circle cx="50" cy="50" r="46"/>',
  t: '<path d="M50 4 L92 15 V50 C92 74 73 89 50 97 C27 89 8 74 8 50 V15 Z"/>',
  q: '<polygon points="50,3 93,27 93,73 50,97 7,73 7,27"/>',
  v: '<rect x="6" y="6" width="88" height="88" rx="22"/>',
  s: '<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30"/>',
  place: '<path d="M7 96 V46 A43 43 0 0 1 93 46 V96 Z"/>'
};
var patchSeq = 0;
function patchSvg(c, mode, size) {
  var id = 'pt' + (++patchSeq);
  var shape = c.u.b ? PATCH_SHAPE[c.u.b] : PATCH_SHAPE.place;
  var hue = c.u.b ? HUE[c.u.b] : (PLACES[c.u.place] && PLACE_HUE[PLACES[c.u.place].id]) || ['#2B3A44', '#DCE2E5'];
  var k = c.u.b ? c.u.k : 1;
  var inner = 'translate(50 50) scale(.84) translate(-50 -50)';
  var svg = '<svg class="patch ' + mode + '" viewBox="-4 -4 108 108" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">';
  if (mode === 'locked') {
    svg += '<g fill="none" stroke="#C3CBC0" stroke-width="2.5" stroke-dasharray="4 4">' + shape + '</g>';
    svg += '<g transform="' + inner + '" fill="none" stroke="#C3CBC0" stroke-width="2" stroke-linejoin="round"><path d="M12 80 L34 50 L46 64 L62 38 L88 80"/></g>';
    svg += '<g transform="translate(50 50)"><rect x="-9" y="-2" width="18" height="14" rx="3" fill="#C3CBC0"/><path d="M-5 -2 V-6 A5 5 0 0 1 5 -6 V-2" fill="none" stroke="#C3CBC0" stroke-width="3"/></g>';
    return svg + '</svg>';
  }
  var gold = mode === 'mastered';
  // peaks rise with level: 1 hill, 2 peaks, 3-peak range
  var peaks = k === 1 ? 'M4 82 L40 52 L54 62 L70 48 L100 82 Z'
    : k === 2 ? 'M4 82 L30 44 L44 60 L64 32 L100 82 Z'
    : 'M4 82 L24 50 L36 60 L52 22 L66 46 L76 38 L100 82 Z';
  var snow = k === 1 ? 'M40 52 L34 57 L40 56 L45 59 Z'
    : k === 2 ? 'M64 32 L56 43 L62 41 L66 45 L72 41 Z M30 44 L25 51 L30 50 L34 52 Z'
    : 'M52 22 L44 34 L50 32 L54 36 L60 31 Z M76 38 L72 43 L76 42 L79 44 Z';
  var sunY = [0, 46, 34, 22][k];
  // transform on the shape itself: react-native-svg ignores it on clipPath
svg += '<defs><clipPath id="' + id + '">' + shape.replace('/>', ' transform="' + inner + '"/>') + '</clipPath></defs>';
  // merrowed edge
  svg += '<g fill="' + (gold ? '#C9971C' : hue[0]) + '">' + shape + '</g>';
  svg += '<g fill="none" stroke="#14201B" stroke-opacity=".28" stroke-width="1.5">' + shape + '</g>';
  if (gold) svg += '<g class="gold-thread" fill="none" stroke="#FCE9A8" stroke-width="2" stroke-dasharray="1.6 2.4" transform="translate(50 50) scale(.93) translate(-50 -50)">' + shape + '</g>';
  // scene
  svg += '<g clip-path="url(#' + id + ')">';
  svg += '<rect x="0" y="0" width="100" height="100" fill="' + hue[1] + '"/>';
  svg += '<circle cx="' + (c.u.b ? 70 : 72) + '" cy="' + sunY + '" r="9" fill="#FF6A1A"/>';
  svg += '<path d="M0 86 L18 64 L34 74 L58 56 L80 70 L100 60 V100 H0 Z" fill="' + hue[0] + '" fill-opacity=".35"/>';
  if (c.u.b) {
    svg += '<path d="' + peaks + '" fill="' + hue[0] + '"/><path d="' + snow + '" fill="#FFFFFF"/>';
  } else {
    // base camp: a hut under one ridge
    svg += '<path d="M4 82 L46 46 L60 58 L72 50 L100 82 Z" fill="' + hue[0] + '" fill-opacity=".8"/>';
    svg += '<path d="M36 82 V70 L48 60 L60 70 V82 Z" fill="#FFFFFF"/><rect x="45" y="72" width="6" height="10" fill="' + hue[0] + '"/>';
  }
  svg += '<rect x="0" y="80" width="100" height="20" fill="#14201B" fill-opacity=".82"/>';
  // trail up the slope
  svg += '<path d="M30 100 C40 90 46 88 52 82" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="2.5 2.5" stroke-opacity=".8"/>';
  svg += '</g>';
  // inner stitch line
  svg += '<g fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="1.3" stroke-dasharray="3 2.5" transform="translate(50 50) scale(.79) translate(-50 -50)">' + shape + '</g>';
  if (gold) svg += '<g transform="translate(84 16)"><circle r="12" fill="#C9971C" stroke="#14201B" stroke-width="1.5"/><path d="M0 -6.5 L1.9 -2 L6.6 -1.8 L3 1.2 L4.1 5.8 L0 3.3 L-4.1 5.8 L-3 1.2 L-6.6 -1.8 L-1.9 -2 Z" fill="#FFF6D6"/></g>';
  return svg + '</svg>';
}
var PLACE_ART = {
  cafe: '<path d="M22 40 H70 V60 C70 76 59 86 46 86 C33 86 22 76 22 60 Z" fill="F"/><circle cx="74" cy="54" r="9" fill="none" stroke="F" stroke-width="6"/><ellipse cx="46" cy="90" rx="34" ry="5" fill="F"/><path d="M36 32 C30 24 42 20 36 10 M50 32 C44 24 56 20 50 10" fill="none" stroke="F" stroke-width="4" stroke-linecap="round"/>',
  grocery: '<path d="M4 18 H16 L28 66 H78" fill="none" stroke="F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 30 H90 L80 58 H27 Z" fill="F"/><circle cx="34" cy="80" r="7" fill="F"/><circle cx="72" cy="80" r="7" fill="F"/><path d="M42 30 V58 M58 30 V58 M74 30 V58" stroke="B" stroke-width="3"/>',
  gym: '<rect x="28" y="45" width="44" height="10" rx="3" fill="F"/><rect x="16" y="28" width="13" height="44" rx="4" fill="F"/><rect x="71" y="28" width="13" height="44" rx="4" fill="F"/><rect x="6" y="36" width="10" height="28" rx="3" fill="F"/><rect x="84" y="36" width="10" height="28" rx="3" fill="F"/>',
  books: '<rect x="14" y="24" width="16" height="64" rx="2" fill="F"/><rect x="33" y="14" width="18" height="74" rx="2" fill="F"/><rect x="54" y="32" width="14" height="56" rx="2" fill="F"/><rect x="72" y="26" width="15" height="62" rx="2" fill="F" transform="rotate(12 79 88)"/><path d="M33 26 H51 M33 74 H51 M14 36 H30" stroke="B" stroke-width="3"/>',
  dogs: '<ellipse cx="50" cy="64" rx="22" ry="18" fill="F"/><ellipse cx="22" cy="40" rx="9" ry="12" fill="F" transform="rotate(-20 22 40)"/><ellipse cx="40" cy="24" rx="9" ry="12" fill="F"/><ellipse cx="60" cy="24" rx="9" ry="12" fill="F"/><ellipse cx="78" cy="40" rx="9" ry="12" fill="F" transform="rotate(20 78 40)"/>',
  meetup: '<path d="M8 30 H92 V44 A8 8 0 0 0 92 60 V74 H8 V60 A8 8 0 0 0 8 44 Z" fill="F" transform="rotate(-8 50 52)"/><path d="M66 30 V74" stroke="B" stroke-width="3" stroke-dasharray="4 4" transform="rotate(-8 50 52)"/><path d="M22 46 H52 M22 58 H44" stroke="B" stroke-width="5" stroke-linecap="round" transform="rotate(-8 50 52)"/>',
  work: '<rect x="10" y="32" width="80" height="52" rx="7" fill="F"/><path d="M36 32 V22 A4 4 0 0 1 40 18 H60 A4 4 0 0 1 64 22 V32" fill="none" stroke="F" stroke-width="6"/><path d="M10 52 H90" stroke="B" stroke-width="4"/><rect x="44" y="46" width="12" height="12" rx="2" fill="F" stroke="B" stroke-width="3"/>',
  bar: '<path d="M14 18 H86 L50 56 Z" fill="F"/><path d="M50 56 V84 M32 88 H68" stroke="F" stroke-width="6" stroke-linecap="round"/><circle cx="62" cy="30" r="6" fill="B"/><path d="M62 30 L76 8" stroke="B" stroke-width="3"/>'
};
var BRANCH_ART = {
  c: '<path d="M6 92 L48 30 L92 92 Z" fill="F"/><path d="M48 30 V4" stroke="F" stroke-width="4" stroke-linecap="round"/><path d="M48 5 L72 12 L48 20 Z" fill="#FF6A1A"/><path d="M48 30 L38 45 L48 42 L56 47 Z" fill="B" fill-opacity=".35"/>',
  t: '<path d="M6 18 H62 A8 8 0 0 1 70 26 V52 A8 8 0 0 1 62 60 H28 L14 72 V60 H14 A8 8 0 0 1 6 52 V26 A8 8 0 0 1 14 18 Z" fill="F"/><path d="M40 46 H86 A8 8 0 0 1 94 54 V76 A8 8 0 0 1 86 84 H84 V96 L70 84 H48 A8 8 0 0 1 40 76 Z" fill="F" stroke="B" stroke-width="4"/><circle cx="56" cy="65" r="3.5" fill="B"/><circle cx="67" cy="65" r="3.5" fill="B"/><circle cx="78" cy="65" r="3.5" fill="B"/>',
  q: '<path d="M4 50 C24 18 76 18 96 50 C76 82 24 82 4 50 Z" fill="F"/><circle cx="50" cy="50" r="19" fill="B"/><circle cx="50" cy="50" r="8" fill="F"/><circle cx="57" cy="43" r="4" fill="F"/>',
  v: '<rect x="36" y="6" width="28" height="50" rx="14" fill="F"/><path d="M22 44 C22 62 34 72 50 72 C66 72 78 62 78 44" fill="none" stroke="F" stroke-width="6" stroke-linecap="round"/><path d="M50 72 V90 M34 92 H66" stroke="F" stroke-width="6" stroke-linecap="round"/><path d="M8 34 V54 M92 34 V54" stroke="F" stroke-width="5" stroke-linecap="round" stroke-opacity=".6"/>',
  s: '<path d="M12 14 H52 L90 52 L52 90 L12 50 Z" fill="F" transform="rotate(-6 50 50)"/><circle cx="30" cy="32" r="7" fill="B"/><path d="M44 62 L64 42 M50 46 L60 56" stroke="B" stroke-width="5" stroke-linecap="round"/>',
  n: '<path d="M50 8 V86 M26 92 H74 M14 28 H86" stroke="F" stroke-width="6" stroke-linecap="round"/><path d="M14 28 L2 58 H26 Z M86 28 L74 52 H98 Z" fill="F"/><circle cx="50" cy="8" r="6" fill="F"/>',
  f: '<path d="M50 4 C70 20 74 46 66 70 H34 C26 46 30 20 50 4 Z" fill="F"/><circle cx="50" cy="38" r="9" fill="B"/><path d="M34 52 L18 72 L34 70 Z M66 52 L82 72 L66 70 Z" fill="F"/><path d="M42 74 L50 96 L58 74 Z" fill="#FF6A1A"/>',
  m: '<rect x="4" y="18" width="92" height="64" rx="16" fill="F"/><path d="M40 34 L68 50 L40 66 Z" fill="B"/>',
  p: '<path d="M30 10 H70 L92 38 L50 94 L8 38 Z" fill="F"/><path d="M8 38 H92 M30 10 L40 38 L50 94 L60 38 L70 10" fill="none" stroke="B" stroke-width="3" stroke-linejoin="round"/>',
  k: '<path d="M24 54 H76 L70 96 H30 Z" fill="F"/><rect x="18" y="44" width="64" height="12" rx="3" fill="F"/><path d="M50 44 V22" stroke="F" stroke-width="5"/><rect x="42" y="4" width="16" height="22" rx="8" fill="F"/><path d="M38 70 H62" stroke="B" stroke-width="4" stroke-linecap="round"/>'
};
// A poster banner: deep colour, map contours, the blaze sun and one big glyph.
function posterArt(art, deep, light, w, h, gx, scale) {
  art = art.replace(/"F"/g, '"' + light + '"').replace(/"B"/g, '"' + deep + '"');
  var lines = '';
  for (var y = 22; y < h + 30; y += 24) lines += '<path d="M-10 ' + y + ' C' + (w * 0.25) + ' ' + (y - 18) + ' ' + (w * 0.55) + ' ' + (y + 16) + ' ' + (w + 10) + ' ' + (y - 8) + '"/>';
  var gy = (h - 100 * scale) / 2 + 6;
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" focusable="false">' +
    '<rect width="' + w + '" height="' + h + '" fill="' + deep + '"/>' +
    '<g fill="none" stroke="#FFFFFF" stroke-opacity=".1" stroke-width="1.2">' + lines + '</g>' +
    '<circle cx="' + (gx + 70 * scale) + '" cy="' + (gy + 34 * scale) + '" r="' + (30 * scale) + '" fill="#FF6A1A"/>' +
    '<g transform="translate(' + gx + ' ' + gy + ') scale(' + scale + ')">' + art + '</g></svg>';
}
function branchPoster(b, w, h, gx, scale) {
  var hue = HUE[b] || ['#2B3A44', '#DCE2E5'];
  return posterArt(BRANCH_ART[b] || BRANCH_ART.c, hue[0], hue[1], w, h, gx, scale);
}
function placeArt(pl) {
  var hue = PLACE_HUE[pl.id] || ['#2B3A44', '#DCE2E5'];
  var art = (PLACE_ART[pl.id] || '').replace(/"F"/g, '"' + hue[1] + '"').replace(/"B"/g, '"' + hue[0] + '"');
  return '<svg class="pc-art" viewBox="0 0 180 236" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
    '<rect width="180" height="236" fill="' + hue[0] + '"/>' +
    '<g fill="none" stroke="#FFFFFF" stroke-opacity=".09" stroke-width="1.2">' +
    '<path d="M-10 70 C40 50 90 86 190 58"/><path d="M-10 96 C50 78 100 112 190 86"/><path d="M-10 122 C40 104 110 140 190 112"/><path d="M-10 148 C60 130 100 166 190 140"/><path d="M-10 174 C40 158 120 190 190 166"/></g>' +
    '<circle cx="124" cy="104" r="34" fill="#FF6A1A"/>' +
    '<g transform="translate(30 76) scale(1.2)">' + art + '</g>' +
    '<defs><linearGradient id="pcfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs><rect y="150" width="180" height="86" fill="url(#pcfade)"/></svg>';
}

export { patchSvg, posterArt, branchPoster, placeArt, BRANCH_ART, PLACE_ART };
