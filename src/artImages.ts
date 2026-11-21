// The cel-shaded art set, bundled with the app so it works offline.
import type { ImageSourcePropType } from 'react-native';

export const PLACE_POSTER: Record<string, ImageSourcePropType> = {
  cafe: require('../assets/art/poster-cafe.webp'),
  grocery: require('../assets/art/poster-grocery.webp'),
  gym: require('../assets/art/poster-gym.webp'),
  books: require('../assets/art/poster-books.webp'),
  dogs: require('../assets/art/poster-dogs.webp'),
  meetup: require('../assets/art/poster-meetup.webp'),
  work: require('../assets/art/poster-work.webp'),
  bar: require('../assets/art/poster-bar.webp'),
};

export const PLACE_ICON: Record<string, ImageSourcePropType> = {
  cafe: require('../assets/art/icon-cafe.webp'),
  grocery: require('../assets/art/icon-grocery.webp'),
  gym: require('../assets/art/icon-gym.webp'),
  books: require('../assets/art/icon-books.webp'),
  dogs: require('../assets/art/icon-dogs.webp'),
  meetup: require('../assets/art/icon-meetup.webp'),
  work: require('../assets/art/icon-work.webp'),
  bar: require('../assets/art/icon-bar.webp'),
};

// One icon per branch and path.
export const BRANCH_ICON: Record<string, ImageSourcePropType> = {
  c: require('../assets/art/icon-c.webp'),
  t: require('../assets/art/icon-t.webp'),
  q: require('../assets/art/icon-q.webp'),
  v: require('../assets/art/icon-v.webp'),
  s: require('../assets/art/icon-s.webp'),
  n: require('../assets/art/icon-n.webp'),
  f: require('../assets/art/icon-f.webp'),
  m: require('../assets/art/icon-creator.webp'),
  p: require('../assets/art/icon-p.webp'),
  k: require('../assets/art/icon-k.webp'),
};

// Emoji the art replaces wherever they're used as icons.
export const EMOJI_ICON: Record<string, ImageSourcePropType> = {
  '🔒': require('../assets/art/lock.webp'),
  '🔓': require('../assets/art/unlock.webp'),
  '🥉': require('../assets/art/bronze.webp'),
  '🥈': require('../assets/art/silver.webp'),
  '🥇': require('../assets/art/gold.webp'),
  '🔥': require('../assets/art/flame.webp'),
  '🗺️': require('../assets/art/compass.webp'),
  '🧭': require('../assets/art/compass.webp'),
  '🏠': require('../assets/art/key.webp'),
  '✨': require('../assets/art/xp.webp'),
  '⚡': require('../assets/art/xp.webp'),
  '⬆️': require('../assets/art/up.webp'),
  '🏷️': require('../assets/art/tag.webp'),
  '⛰️': require('../assets/art/icon-c.webp'),
  '🧗': require('../assets/art/icon-c.webp'),
  '🎯': require('../assets/art/target.webp'),
  '👑': require('../assets/art/crown.webp'),
  '🏕️': require('../assets/art/tent.webp'),
  '⏫': require('../assets/art/chevron.webp'),
  '🎙️': require('../assets/art/recorder.webp'),
  '❤️': require('../assets/art/heart.webp'),
  '🌱': require('../assets/art/seedling.webp'),
  '📣': require('../assets/art/megaphone.webp'),
};
