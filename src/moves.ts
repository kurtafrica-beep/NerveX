export type BranchKey = 'c' | 't' | 'r' | 'q';

export type Move = {
  id: string;
  b: BranchKey;
  n: number;
  title: string;
  doIt: string;
  rep: string;
  up: string;
};

export const BRANCH: Record<BranchKey, { name: string; tag: string }> = {
  c: { name: 'Confidence', tag: 'Gets you in.' },
  t: { name: 'Talk', tag: 'Keeps it going.' },
  r: { name: 'Read', tag: 'Tells you when.' },
  q: { name: 'Cues', tag: 'How it lands. Built on Vanessa Van Edwards’ work on warmth and competence.' },
};
export const BRANCH_KEYS: BranchKey[] = ['c', 't', 'r', 'q'];

// [title, the move, the rep, the upgrade]
const SOURCE: Record<BranchKey, [string, string, string, string][]> = {
  c: [
    ['Say hi to ten strangers', 'Walk a busy block. Eye contact, a real hi, then keep walking.', 'Count them. Ten is the rep. A nod back is enough.', 'Add two words: “Hi, nice day.” Ten times.'],
    ['Hold a short chat', 'Cashier, barista, someone in line. One comment, one question.', 'Thirty seconds counts. You end it.', 'Two minutes, with someone who is not paid to talk to you.'],
    ['Give one specific compliment', 'Pick something they chose: shoes, a jacket, a bike. Say it and move on.', 'One is the rep. Choices, not bodies.', 'Stay for the answer and ask where they got it.'],
    ['Ask for a recommendation', 'A shop, a food court, a bar. Ask someone what they would get.', 'Ask, listen, thank them.', 'Take the recommendation, then go back and tell them how it was.'],
    ['Start a conversation in a shared space', 'Class, gym, queue, patio. Open with something you can both see.', 'You speak first. That is the rep.', 'Open with someone who is there with a friend.'],
    ['Join a small group for a minute', 'Two or three people at an event. “Mind if I join?” Then listen.', 'One minute in the circle.', 'Stay five and add one thing to the conversation.'],
    ['Introduce yourself by name', 'A minute into any chat: “I’m ___, by the way.”', 'Your name out, theirs back.', 'Use their name when you say goodbye.'],
    ['Invite someone along', 'Someone you just met. “A few of us are getting food after. Come.”', 'The invite is the rep, not the yes.', 'Invite two people who do not know each other.'],
    ['Say you liked talking to them', 'End a good chat by saying it straight: “I liked talking to you.”', 'Say it once and mean it.', 'Add the one thing they said that you liked.'],
    ['Ask someone for their number', 'After a real conversation, never as an opener. Ask clearly, once.', 'Asking is the rep. A no is a full answer.', 'Ask with a plan attached: “Coffee this week?”'],
  ],
  t: [
    ['Ask one follow-up', 'They say a thing. Ask one question about that thing.', 'One follow-up, then let them talk.', 'Three follow-ups in a row without changing the subject.'],
    ['Use their name once', 'Get their name early. Say it back once before you leave.', 'Once. Twice sounds like sales.', 'Remember it the next time you see them.'],
    ['Give a real answer', '“How are you?” gets one true detail, not “good.”', 'One detail is the rep.', 'End your answer with a question back.'],
    ['Ask an open question', 'Start it with how or what. Skip anything a yes can answer.', 'One question that gets more than a word back.', 'Ask “what was that like?” and wait.'],
    ['Trade one detail', 'They share something. You share something the same size.', 'One trade.', 'Go first.'],
    ['Let a silence sit', 'When it goes quiet, count three before you fill it.', 'Three seconds, once.', 'Let them break it.'],
    ['Tell a thirty-second story', 'Something that happened this week. Start, middle, end.', 'Thirty seconds. Stop at the end.', 'Tell one where you look a bit foolish.'],
    ['Disagree, kindly', '“I see it differently.” Say why in one sentence.', 'One honest disagreement, no apology after.', 'Ask what would change their mind, then answer the same question.'],
    ['Bring a third person in', 'Two of you are talking. Pull in someone nearby with a question.', 'One person added.', 'Introduce them to each other by name and one detail.'],
    ['Carry ten minutes', 'One person you just met, ten minutes, started by you.', 'Check the clock after, not during.', 'Do it with your phone out of reach.'],
  ],
  r: [
    ['Spot who is open', 'Stand somewhere busy. Find five people who look up for a hello.', 'Five. Slow pace, looking around, no headphones.', 'Say hi to one of them.'],
    ['Spot the no', 'Find five people who are clearly busy. Leave them alone.', 'Five. Headphones, fast walk, eyes down.', 'Name the exact signal for each one in your line.'],
    ['Match their pace', 'Talk at their speed and volume, not yours.', 'One conversation matched.', 'Match a quiet person without going silent.'],
    ['Catch the short answer', 'One-word replies mean wrap it up. So wrap it up.', 'Notice it once and end warmly.', 'End it within one sentence.'],
    ['Watch the feet', 'Feet toward you means stay. Feet toward the door means go.', 'Call it once in your head, then act on it.', 'Check again two minutes in.'],
    ['Ask if you are keeping them', 'Mid-chat: “Am I keeping you?” Believe the answer.', 'Ask once.', 'Ask before they have to hint.'],
    ['Leave on a high', 'End the conversation while it is still good.', 'You end it first, smiling.', 'Leave them a reason to talk again.'],
    ['Name what you see', '“You look busy, I’ll be quick.” Then be quick.', 'Name it once, accurately.', 'Name a good one: “You look like you’re having a great night.”'],
    ['Take a no well', 'Ask for something small. If it is a no: “No worries.” Mean it.', 'One no, taken clean. No second ask.', 'Stay friendly with them for the rest of the night.'],
    ['Wait for the yes', 'Two clear green lights before you ask for anything.', 'Count them: they ask you a question, they stay when they could leave.', 'Write both signals in your line before you say what you asked.'],
  ],
  q: [
    ['Eyebrow flash hello', 'When you greet someone, lift your eyebrows for a beat as you say hi.', 'Five greetings with the flash.', 'Add their name to the hello.'],
    ['Keep your hands in view', 'One whole conversation with your hands visible. Out of pockets, off your phone.', 'Hands seen from start to finish.', 'Do it standing, with nothing to hold.'],
    ['Face them fully', 'Point your toes, torso and head at the person talking. Not just your face.', 'One conversation, fully fronted.', 'Turn to face someone the moment they start talking.'],
    ['The slow triple nod', 'When they finish a thought, nod three times, slowly, and wait.', 'Use it once and count how much more they say.', 'Use it in a group to pull a quiet person in.'],
    ['Swap the stock opener', 'Skip “What do you do?” Try “Working on anything exciting lately?”', 'One conversation started with a better question.', 'Write a spark question of your own and use it twice.'],
    ['Land it flat', 'Say your point and let your voice drop at the end. No rising question tone.', 'Three statements that end down, not up.', 'Introduce yourself the same way: name, one fact, voice down.'],
    ['Pause instead of um', 'One conversation where every “um” or “like” becomes a short silence.', 'Notice them. Fewer counts.', 'Tell a whole story with none.'],
    ['Talk with your hands', 'Tell a story and show sizes, steps or directions with your hands as you go.', 'One story, hands working.', 'Use your hands to count off three points.'],
    ['Lean in at the good part', 'When they say something that interests you, lean in a little and let a slow smile come.', 'Catch it once and do it on purpose.', 'Let them see you react before you say anything.'],
    ['Warm and capable in one ask', 'Ask for something you want. Stand tall and keep your voice low and steady, then smile when they answer.', 'One ask with both: steady, then warm.', 'Make the ask to someone who intimidates you.'],
  ],
};

export const MOVES: Move[] = [];
export const BY: Record<string, Move> = {};
for (const b of BRANCH_KEYS) {
  SOURCE[b].forEach((m, i) => {
    const move: Move = { id: b + (i + 1), b, n: i + 1, title: m[0], doIt: m[1], rep: m[2], up: m[3] };
    MOVES.push(move);
    BY[move.id] = move;
  });
}

// Tonight's pick walks the branches side by side: c1, t1, r1, c2, ...
export const ORDER: string[] = [];
for (let n = 1; n <= 10; n++) for (const b of BRANCH_KEYS) ORDER.push(b + n);

export function level(n: number): string {
  return n <= 3 ? 'Easy' : n <= 7 ? 'Mid' : 'Hard';
}
export function label(m: Move): string {
  return `${BRANCH[m.b].name} · ${m.n} · ${level(m.n)}`;
}
