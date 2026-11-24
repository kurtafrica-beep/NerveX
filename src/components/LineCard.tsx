import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { stamp, useNerve, type Line } from '../data';
import { BY } from '../moves';
import { lensed, moveKey } from '../placePaths';
import { HUE, titleInfo } from '../progress';
import { REACT, REACTIONS } from '../reactions';
import { Emo } from './ArtIcon';
import { Profile } from './Profile';
import { C, F } from '../theme';
import { Avatar, Card, ConfirmLink, Pill, T } from '../ui';
import { RemoteMedia } from './Media';

export function LineCard({ line, onOpenMove, onError }: { line: Line; onOpenMove: (id: string) => void; onError: (message: string) => void }) {
  const n = useNerve();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState(false);

  // A place line done in a path's version shows that version.
  const move = lensed(BY[line.move], line.via)!;
  const author = n.profiles[line.author];
  const kudos = n.kudosFor(line.id);
  const mine = kudos.find((x) => x.author === n.uid);
  const comments = n.commentsFor(line.id);
  const shown = open ? comments : comments.slice(-1);
  const mates = n.partnersOfLine(line);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const problem = await n.addComment(line.id, body);
    setSending(false);
    if (problem) onError(problem);
    else setDraft('');
  };

  return (
    <Card style={{ padding: 16, gap: 10 }}>
      <View style={s.who}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${n.nameOf(line.author)}. Open profile`}
          onPress={() => setProfile(true)}
          style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, pressed && { opacity: 0.7 }]}>
          <Avatar name={n.nameOf(line.author)} url={author?.avatar_url} />
          <View style={{ flex: 1 }}>
            <View style={s.nameRow}>
              <T v="semi">{n.nameOf(line.author)}</T>
              <TitleChip uid={line.author} />
            </View>
            <T v="small">{stamp(line.created_at)}</T>
          </View>
        </Pressable>
        {line.upgrade ? <T v="accent">Upgrade</T> : null}
        {line.author !== n.uid ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: n.isFollowing(line.author) }}
            onPress={async () => {
              const problem = await n.toggleFollow(line.author);
              if (problem) onError(problem);
            }}
            style={[s.follow, n.isFollowing(line.author) && s.following]}>
            <T style={[s.followText, n.isFollowing(line.author) && { color: C.muted }]}>{n.isFollowing(line.author) ? 'Following' : 'Follow'}</T>
          </Pressable>
        ) : null}
      </View>

      <Pressable accessibilityRole="button" onPress={() => onOpenMove(moveKey(move.id, line.via))}>
        <T style={s.move}>{move.title}</T>
      </Pressable>

      {line.line ? <T>{line.line}</T> : null}
      {line.media_path && line.media_kind ? (
        <RemoteMedia path={line.media_path} kind={line.media_kind} seconds={line.media_seconds} />
      ) : null}
      {mates.length ? <T v="small">Together with {mates.map(n.nameOf).join(', ')}</T> : null}

      {kudos.length ? (
        <View style={s.chips}>
          {REACTIONS.filter((r) => kudos.some((x) => x.kind === r.k)).map((r) => (
            <View key={r.k} style={s.chip} accessibilityLabel={`${kudos.filter((x) => x.kind === r.k).length} ${r.t}`}>
              <Emo e={r.e} size={18} />
              <T style={s.chipText}>{kudos.filter((x) => x.kind === r.k).length}</T>
            </View>
          ))}
        </View>
      ) : null}

      <View style={s.acts}>
        <Pill
          label={mine ? `${REACT[mine.kind].e} ${REACT[mine.kind].t}` : 'React'}
          on={!!mine}
          onPress={() => setPicking((v) => !v)}
        />
        <Pill label={comments.length ? String(comments.length) : ''} icon="comment" onPress={() => setOpen((v) => !v)} />
        <View style={{ flex: 1 }} />
        {line.author === n.uid ? (
          <ConfirmLink
            label="Delete"
            onConfirm={async () => {
              const problem = await n.deleteLine(line);
              if (problem) onError(problem);
            }}
          />
        ) : null}
      </View>

      {picking ? (
        <View style={s.grid} accessibilityLabel="React to this line">
          {REACTIONS.map((r) => {
            const on = mine?.kind === r.k;
            return (
              <Pressable
                key={r.k}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={async () => {
                  setPicking(false);
                  const problem = await n.react(line.id, r.k);
                  if (problem) onError(problem);
                }}
                style={({ pressed }) => [s.react, on && s.reactOn, pressed && { opacity: 0.8 }]}>
                <Emo e={r.e} size={30} />
                <T style={[s.reactText, on && { color: C.accentText }]}>{r.t}</T>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {shown.length ? (
        <View style={{ gap: 8 }}>
          {shown.map((c) => (
            <View key={c.id} style={s.comment}>
              <View style={s.meta}>
                <T style={s.cname}>{n.nameOf(c.author)}</T>
                <T v="small">{stamp(c.created_at)}</T>
                {c.author === n.uid ? (
                  <ConfirmLink
                    label="Delete"
                    onConfirm={async () => {
                      const problem = await n.deleteComment(c.id);
                      if (problem) onError(problem);
                    }}
                  />
                ) : null}
              </View>
              <T style={{ fontSize: 16, lineHeight: 22 }}>{c.body}</T>
            </View>
          ))}
        </View>
      ) : null}

      {open ? (
        <View style={s.form}>
          <TextInput
            accessibilityLabel="Comment on this line"
            value={draft}
            onChangeText={setDraft}
            placeholder="Say something"
            placeholderTextColor={C.muted}
            maxLength={500}
            style={s.field}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Pressable accessibilityRole="button" disabled={sending || !draft.trim()} onPress={send} style={[s.send, (sending || !draft.trim()) && { opacity: 0.5 }]}>
            <T style={{ color: C.surface, fontFamily: F.semi, fontSize: 16 }}>Send</T>
          </Pressable>
        </View>
      ) : null}
      {profile ? <Profile uid={line.author} onClose={() => setProfile(false)} onOpenMove={onOpenMove} onError={onError} /> : null}
    </Card>
  );
}

// The title someone chose to wear. Your own only shows while you have earned it.
export function TitleChip({ uid }: { uid: string }) {
  const n = useNerve();
  const key = n.profiles[uid]?.title;
  const t = titleInfo(key);
  if (!t || (uid === n.uid && !n.progress.earned.includes(t.key))) return null;
  return (
    <View style={[s.title, { backgroundColor: HUE[t.b][1] }]}>
      <T style={[s.titleText, { color: HUE[t.b][0] }]}>{t.text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  follow: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1.5, borderColor: C.ink },
  following: { borderColor: C.line },
  followText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.ink },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  title: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  titleText: { fontFamily: F.semi, fontSize: 12, lineHeight: 16 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  move: { fontFamily: F.display, fontSize: 30, lineHeight: 31, color: C.accentText },
  acts: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: C.bg },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  react: { width: '31.5%', minHeight: 76, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  reactOn: { borderColor: C.accent, backgroundColor: C.accentSoft },
  reactText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, textAlign: 'center' },
  comment: { backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  meta: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  cname: { fontFamily: F.semi, fontSize: 15, color: C.ink },
  form: { flexDirection: 'row', gap: 8 },
  field: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    fontFamily: F.body,
    fontSize: 16,
    color: C.ink,
  },
  send: { minHeight: 46, paddingHorizontal: 18, borderRadius: 23, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
});
