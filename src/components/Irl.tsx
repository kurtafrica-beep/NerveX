import React, { useRef, useState } from 'react';
import { Dimensions, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNerve, type IrlEvent } from '../data';
import { HUE } from '../progress';
import { C, F } from '../theme';
import { Btn, Icon, Sheet, T } from '../ui';

// In real life: Toronto meetups the host posts. One theme, a public venue, a set number of spots.
// The exact address only reaches people who said they're going (the database hands it out).
const TZ = 'America/Toronto';
const THEMES = ['Confidence', 'Talk', 'Cues', 'Voice', 'Relationships', 'Open practice'];
const THEME_HUE: Record<string, [string, string]> = {
  Confidence: HUE.c,
  Talk: HUE.t,
  Cues: HUE.q,
  Voice: HUE.v,
  Relationships: HUE.m,
  'Open practice': ['#C2410C', '#FBE2D2'],
};
const ms = (iso: string) => new Date(iso).getTime();

function fmt(at: number, o: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, ...o }).format(at).replace('.', '');
}
// The Toronto calendar day of a moment, as YYYY-MM-DD.
function torontoDay(at: number): string {
  const y = fmt(at, { year: 'numeric' });
  const m = fmt(at, { month: '2-digit' });
  const d = fmt(at, { day: '2-digit' });
  return `${y}-${m}-${d}`;
}
function hm(at: number): string {
  const h = Number(fmt(at, { hour: 'numeric', hourCycle: 'h23' })) % 24;
  const m = fmt(at, { minute: '2-digit' }).padStart(2, '0');
  return `${String(h).padStart(2, '0')}:${m}`;
}
// A Toronto wall-clock time to a moment, whatever time zone this phone is in.
function torontoMs(date: string, time: string): number {
  const want = Date.parse(`${date}T${time}:00Z`);
  let guess = want;
  for (let i = 0; i < 2; i++) {
    const [y, mo, d] = torontoDay(guess).split('-').map(Number);
    const [h, mi] = hm(guess).split(':').map(Number);
    guess += want - Date.UTC(y, mo - 1, d, h, mi);
  }
  return guess;
}
function timeRange(e: IrlEvent): string {
  const t = (at: number) => {
    const [h, m] = hm(at).split(':').map(Number);
    return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
  };
  return `${t(ms(e.starts_at))} to ${t(ms(e.ends_at))}`;
}

function calendarLink(e: IrlEvent, where: string): string {
  const z = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  if (Platform.OS === 'web') {
    const esc = (t: string) => t.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nerve//IRL//EN',
      'BEGIN:VEVENT',
      `UID:${e.id}@nerve`,
      `DTSTAMP:${z(new Date().toISOString())}`,
      `DTSTART:${z(e.starts_at)}`,
      `DTEND:${z(e.ends_at)}`,
      `SUMMARY:${esc(`Nerve IRL: ${e.title}`)}`,
      `LOCATION:${esc(where)}`,
      `DESCRIPTION:${esc(e.what)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }
  // On a phone, the calendar app picks this up.
  const q = new URLSearchParams({ action: 'TEMPLATE', text: `Nerve IRL: ${e.title}`, dates: `${z(e.starts_at)}/${z(e.ends_at)}`, location: where, details: e.what, ctz: TZ });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
function addToCalendar(e: IrlEvent, where: string) {
  const url = calendarLink(e, where);
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const a = document.createElement('a');
    a.href = url;
    a.download = `nerve-${e.id.slice(0, 8)}.ics`;
    a.click();
    return;
  }
  Linking.openURL(url).catch(() => {});
}

export function Irl({ onError }: { onError: (m: string) => void }) {
  const n = useNerve();
  const [month, setMonth] = useState(false);
  const [editing, setEditing] = useState<IrlEvent | 'new' | null>(null);
  const [sel, setSel] = useState('');
  const track = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [now] = useState(() => Date.now());
  const up = n.events.filter((e) => !e.off && ms(e.ends_at) > now);
  if (!up.length && !n.isHost) return null;
  const cardW = Math.min(440, Dimensions.get('window').width - 32) * (up.length > 1 ? 0.86 : 1);
  const STEP = cardW + 10;
  return (
    <View style={{ gap: 10 }}>
      <View style={s.head}>
        <T v="h" accessibilityRole="header">
          In real life
        </T>
        <T style={s.city}>Toronto</T>
        <Pressable accessibilityRole="button" accessibilityLabel="Month view" accessibilityState={{ selected: month }} onPress={() => setMonth((m) => !m)} style={[s.calBtn, month && s.calBtnOn]}>
          <Icon name="cal" size={22} color={month ? C.surface : C.ink} />
        </Pressable>
      </View>
      {month ? (
        <MonthView
          events={up}
          selected={sel}
          onPick={(day, e) => {
            setSel(day);
            const k = up.findIndex((x) => x.id === e.id);
            track.current?.scrollTo({ x: k * STEP, animated: true });
          }}
        />
      ) : null}
      {up.length ? (
        <ScrollView ref={track} horizontal showsHorizontalScrollIndicator={false} snapToInterval={STEP} decelerationRate="fast" contentContainerStyle={{ gap: 10 }} accessibilityLabel="Upcoming events">
          {up.map((e) => (
            <EventCard key={e.id} e={e} width={cardW} onEdit={() => setEditing(e)} onError={onError} />
          ))}
        </ScrollView>
      ) : (
        <T v="sub">No event posted yet. Post the next one and it shows here for everyone.</T>
      )}
      {n.isHost ? <Btn label="Post an event" small style={{ alignSelf: 'flex-start' }} onPress={() => setEditing('new')} /> : null}
      {editing ? <EventForm e={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
    </View>
  );
}

function EventCard({ e, width, onEdit, onError }: { e: IrlEvent; width: number; onEdit: () => void; onError: (m: string) => void }) {
  const n = useNerve();
  const [busy, setBusy] = useState(false);
  const [h, soft] = THEME_HUE[e.theme] ?? THEME_HUE['Open practice'];
  const going = n.goingTo(e.id);
  const me = n.amGoing(e.id);
  const full = going.length >= e.cap;
  const friends = going.filter((u) => n.isFollowing(u));
  const address = n.addressOf(e.id);
  const at = ms(e.starts_at);
  const toggle = async () => {
    setBusy(true);
    const err = await n.toggleGoing(e);
    setBusy(false);
    if (err) onError(err);
  };
  const where = [e.venue, me && address ? address : e.area, 'Toronto'].filter(Boolean).join(', ');
  return (
    <View style={[s.card, { width }]} accessibilityLabel={`${e.title}, ${fmt(at, { weekday: 'long', month: 'long', day: 'numeric' })}`}>
      <View style={[s.stub, { backgroundColor: h }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <T style={s.stubSmall}>{fmt(at, { month: 'short' })}</T>
        <T style={s.stubDay}>{fmt(at, { day: 'numeric' })}</T>
        <T style={s.stubSmall}>{fmt(at, { weekday: 'short' })}</T>
      </View>
      <View style={s.body}>
        <View style={[s.theme, { backgroundColor: soft }]}>
          <T style={[s.themeText, { color: h }]}>{e.theme}</T>
        </View>
        <T style={s.title}>{e.title}</T>
        <T v="semi" style={{ fontSize: 16 }}>
          {timeRange(e)}
        </T>
        <T v="sub" style={{ fontSize: 15 }}>
          {e.venue}
          {e.area ? `, ${e.area}` : ''}
        </T>
        {me && address ? (
          <View style={[s.addr, { backgroundColor: soft }]}>
            <T v="semi" style={{ fontSize: 15 }}>
              {address}
            </T>
          </View>
        ) : null}
        {e.what ? <T style={{ fontSize: 15, lineHeight: 21 }}>{e.what}</T> : null}
        <T v="small">{`${going.length ? `${going.length} going` : 'Be the first to say you’re going'}, ${Math.max(0, e.cap - going.length)} of ${e.cap} spots left`}</T>
        {friends.length ? (
          <T v="small" style={{ color: C.ink }}>
            {`From your circle: ${friends.slice(0, 3).map(n.nameOf).join(', ')}${friends.length > 3 ? ` and ${friends.length - 3} more` : ''}`}
          </T>
        ) : null}
        <View style={s.acts}>
          {me ? (
            <>
              <View style={[s.yes, { backgroundColor: h }]}>
                <T v="semi" style={{ color: '#FFFFFF', fontSize: 15 }}>
                  You’re going
                </T>
              </View>
              <Link label="Can’t make it" disabled={busy} onPress={toggle} />
            </>
          ) : (
            <Btn label={full ? 'Full' : 'I’m going'} kind="primary" small disabled={full || busy} onPress={toggle} />
          )}
          <Link label="Add to calendar" onPress={() => addToCalendar(e, where)} />
          {n.isHost ? <Link label="Edit" onPress={onEdit} /> : null}
        </View>
        {!me ? <T v="small">The exact address shows once you’re going. Public venue, organised by Nerve.</T> : null}
      </View>
    </View>
  );
}

function Link({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} hitSlop={6} style={({ pressed }) => [s.link, (pressed || disabled) && { opacity: 0.6 }]}>
      <T v="semi" style={s.linkText}>
        {label}
      </T>
    </Pressable>
  );
}

// A month grid with event days marked. Tapping one brings its event into view.
function MonthView({ events, selected, onPick }: { events: IrlEvent[]; selected: string; onPick: (day: string, e: IrlEvent) => void }) {
  const [now] = useState(() => Date.now());
  const first = events[0] ? ms(events[0].starts_at) : now;
  const [cur, setCur] = useState(() => ({ y: Number(fmt(first, { year: 'numeric' })), m: Number(fmt(first, { month: 'numeric' })) }));
  const byDay: Record<string, IrlEvent[]> = {};
  for (const e of events) (byDay[torontoDay(ms(e.starts_at))] ??= []).push(e);
  return (
    <View style={s.month}>
      <MonthGrid
        y={cur.y}
        m={cur.m}
        today={torontoDay(now)}
        selected={selected}
        marked={(key) => !!byDay[key]}
        onStep={(d) => setCur(({ y, m }) => ({ y: m + d > 12 ? y + 1 : m + d < 1 ? y - 1 : y, m: ((m + d + 11) % 12) + 1 }))}
        onPick={(key) => byDay[key] && onPick(key, byDay[key][0])}
        labelFor={(key) => (byDay[key] ?? []).map((e) => e.title).join(', ')}
      />
      {(() => {
        const k = events.filter((e) => torontoDay(ms(e.starts_at)).startsWith(`${cur.y}-${String(cur.m).padStart(2, '0')}`)).length;
        return <T v="small">{k ? `${k} ${k === 1 ? 'event' : 'events'} this month. Tap a marked day to see it.` : 'No events this month yet.'}</T>;
      })()}
    </View>
  );
}

function MonthGrid({
  y,
  m,
  today,
  selected,
  marked,
  onStep,
  onPick,
  labelFor,
  dots = true,
}: {
  y: number;
  m: number;
  today: string;
  selected: string;
  marked: (key: string) => boolean;
  onStep: (d: number) => void;
  onPick: (key: string) => void;
  labelFor?: (key: string) => string;
  dots?: boolean;
}) {
  const title = new Date(Date.UTC(y, m - 1, 15)).toLocaleString('en-CA', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <View style={{ gap: 6 }}>
      <View style={s.moHead}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => onStep(-1)} style={s.moNav}>
          <T style={s.moNavText}>‹</T>
        </Pressable>
        <T style={s.moTitle} accessibilityLiveRegion="polite">
          {title}
        </T>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => onStep(1)} style={s.moNav}>
          <T style={s.moNavText}>›</T>
        </Pressable>
      </View>
      <View style={s.grid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => (
          <View key={`w${i}`} style={s.cell}>
            <T style={s.wd}>{w}</T>
          </View>
        ))}
        {cells.map((d, i) => {
          if (!d) return <View key={`p${i}`} style={s.cell} />;
          const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const on = marked(key);
          const isSel = key === selected;
          const inner = (
            <>
              <T style={[s.dayText, on && { color: isSel ? C.surface : C.ink, fontFamily: F.display }]}>{d}</T>
              {on && dots ? <View style={[s.mark, isSel && { backgroundColor: C.surface }]} /> : null}
            </>
          );
          return (
            <View key={key} style={s.cell}>
              {on ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`${d} ${title}${labelFor ? `: ${labelFor(key)}` : ''}`} onPress={() => onPick(key)} style={[s.day, s.dayOn, isSel && s.daySel, key === today && s.today]}>
                  {inner}
                </Pressable>
              ) : (
                <View style={[s.day, key === today && s.today]}>{inner}</View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// The host's form. Dates are picked on a month grid; times are typed as 19:00.
function EventForm({ e, onClose }: { e: IrlEvent | null; onClose: () => void }) {
  const n = useNerve();
  const [now] = useState(() => Date.now());
  const start0 = e ? ms(e.starts_at) : 0;
  const [theme, setTheme] = useState(e?.theme ?? 'Cues');
  const [title, setTitle] = useState(e?.title ?? '');
  const [date, setDate] = useState(e ? torontoDay(start0) : '');
  const [cur, setCur] = useState(() => {
    const base = e ? start0 : now;
    return { y: Number(fmt(base, { year: 'numeric' })), m: Number(fmt(base, { month: 'numeric' })) };
  });
  const [st, setSt] = useState(e ? hm(start0) : '19:00');
  const [en, setEn] = useState(e ? hm(ms(e.ends_at)) : '21:00');
  const [venue, setVenue] = useState(e?.venue ?? '');
  const [area, setArea] = useState(e?.area ?? '');
  const [address, setAddress] = useState(e ? n.addressOf(e.id) : '');
  const [what, setWhat] = useState(e?.what ?? '');
  const [cap, setCap] = useState(String(e?.cap ?? 16));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;
  const save = async () => {
    if (!title.trim()) return setError('Give it a title.');
    if (!date) return setError('Pick a date on the calendar.');
    if (!TIME.test(st) || !TIME.test(en)) return setError('Type the times like 19:00.');
    if (!venue.trim()) return setError('Add the venue.');
    const pad = (t: string) => t.padStart(5, '0');
    const start = torontoMs(date, pad(st));
    let end = torontoMs(date, pad(en));
    if (end <= start) end += 86400000;
    if (end < Date.now()) return setError('That time has already passed.');
    setBusy(true);
    const err = await n.saveEvent({ title: title.trim(), theme, start, end, venue: venue.trim(), area: area.trim(), address: address.trim(), what: what.trim(), cap: Number(cap) || 16 }, e?.id);
    setBusy(false);
    if (err) return setError(err);
    onClose();
  };
  const field = (label: string, value: string, set: (v: string) => void, o: { ph?: string; max?: number; note?: string; multi?: boolean; num?: boolean } = {}) => (
    <View style={{ gap: 4 }}>
      <T v="semi" style={{ fontSize: 15 }}>
        {label}
        {o.note ? <T v="small">{`  ${o.note}`}</T> : null}
      </T>
      <TextInput
        value={value}
        onChangeText={set}
        placeholder={o.ph}
        placeholderTextColor={C.muted}
        maxLength={o.max}
        multiline={o.multi}
        keyboardType={o.num ? 'number-pad' : 'default'}
        accessibilityLabel={label}
        style={[s.field, o.multi && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );
  return (
    <Sheet visible title={e ? 'Edit the event' : 'Post an event'} onClose={onClose}>
      <T v="semi" style={{ fontSize: 15 }}>
        Theme
      </T>
      <View style={s.chips} accessibilityRole="radiogroup">
        {THEMES.map((t) => (
          <Pressable key={t} accessibilityRole="radio" accessibilityState={{ checked: theme === t }} onPress={() => setTheme(t)} style={[s.chip, theme === t && { backgroundColor: C.ink }]}>
            <T v="semi" style={{ fontSize: 14, color: theme === t ? C.surface : C.ink }}>
              {t}
            </T>
          </Pressable>
        ))}
      </View>
      {field('Title', title, setTitle, { ph: 'Reading the room', max: 60 })}
      <T v="semi" style={{ fontSize: 15 }}>
        Date
        <T v="small">{date ? `  ${fmt(torontoMs(date, '12:00'), { weekday: 'long', month: 'long', day: 'numeric' })}` : '  Tap a day'}</T>
      </T>
      <View style={s.month}>
        <MonthGrid
          y={cur.y}
          m={cur.m}
          today={torontoDay(now)}
          selected={date}
          marked={(key) => key >= torontoDay(now)}
          onStep={(d) => setCur(({ y, m }) => ({ y: m + d > 12 ? y + 1 : m + d < 1 ? y - 1 : y, m: ((m + d + 11) % 12) + 1 }))}
          onPick={setDate}
          dots={false}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>{field('Starts', st, setSt, { ph: '19:00', max: 5 })}</View>
        <View style={{ flex: 1 }}>{field('Ends', en, setEn, { ph: '21:00', max: 5 })}</View>
      </View>
      {field('Venue', venue, setVenue, { ph: 'Balzac’s Café', max: 60 })}
      {field('Area', area, setArea, { ph: 'Distillery District', max: 40 })}
      {field('Address', address, setAddress, { ph: '55 Mill St, Building 60', max: 100, note: 'shown only to people going' })}
      {field('What you’ll practise', what, setWhat, { ph: 'Short rounds in pairs: notice one cue, name it, ask about it.', max: 300, multi: true })}
      {field('Spots', cap, setCap, { max: 3, num: true })}
      {error ? (
        <T v="error" accessibilityRole="alert">
          {error}
        </T>
      ) : null}
      <Btn label={e ? 'Save changes' : 'Post the event'} kind="primary" wide disabled={busy} onPress={save} />
      {e ? (
        <Btn
          label="Cancel this event"
          kind="quiet"
          wide
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            const err = await n.cancelEvent(e.id);
            setBusy(false);
            if (err) setError(err);
            else onClose();
          }}
        />
      ) : null}
    </Sheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  city: { fontFamily: F.semi, fontSize: 14, color: C.muted, flex: 1 },
  calBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  calBtnOn: { backgroundColor: C.ink },
  card: { flexDirection: 'row', borderWidth: 1.5, borderColor: C.ink, borderRadius: 12, backgroundColor: C.surface, overflow: 'hidden' },
  stub: { width: 74, alignItems: 'center', gap: 2, paddingVertical: 16, borderRightWidth: 2, borderRightColor: C.surface, borderStyle: 'dashed' },
  stubSmall: { fontFamily: F.semi, fontSize: 14, color: '#FFFFFF', opacity: 0.92 },
  stubDay: { fontFamily: F.display, fontSize: 38, lineHeight: 42, color: '#FFFFFF' },
  body: { flex: 1, gap: 6, padding: 14 },
  theme: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  themeText: { fontFamily: F.semi, fontSize: 13 },
  title: { fontFamily: F.display, fontSize: 23, lineHeight: 26, color: C.ink },
  addr: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  acts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 16, rowGap: 6, paddingTop: 4 },
  link: { minHeight: 40, justifyContent: 'center' },
  linkText: { fontSize: 15, textDecorationLine: 'underline' },
  yes: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  month: { gap: 8, padding: 12, borderWidth: 1.5, borderColor: C.ink, borderRadius: 12, backgroundColor: C.surface },
  moHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moNav: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  moNavText: { fontSize: 22, lineHeight: 26, color: C.ink },
  moTitle: { fontFamily: F.display, fontSize: 19, color: C.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, padding: 2 },
  wd: { textAlign: 'center', fontFamily: F.semi, fontSize: 12, color: C.muted },
  day: { height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayOn: { borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.bg },
  daySel: { backgroundColor: C.ink },
  today: { borderBottomWidth: 3, borderBottomColor: C.accent },
  dayText: { fontSize: 15, color: C.muted },
  mark: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: C.ink },
  field: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.surface, fontFamily: F.body, fontSize: 16, color: C.ink },
});
