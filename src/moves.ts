export type BranchKey = 'c' | 't' | 'q' | 'v' | 's';

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
  q: { name: 'Cues', tag: 'How it lands. Built on Vanessa Van Edwards’ work on warmth and competence.' },
  v: { name: 'Voice', tag: 'How it sounds. Built on Vinh Giang’s teaching on vocal foundations and connection.' },
  s: { name: 'Sell', tag: 'How to get a yes. Built on Alex Hormozi’s sales frameworks. Only sell what you believe helps them.' },
};
export const BRANCH_KEYS: BranchKey[] = ['c', 't', 'q', 'v', 's'];

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
  v: [
    ['Record and review', 'Film yourself talking for five minutes, unplanned. Watch it once with the sound off, then listen once without the picture.', 'One recording, two passes. Write the one habit you noticed.', 'Do it again a week later and compare.'],
    ['Turn the volume up', 'One conversation one notch louder than feels normal. Most quiet people are quieter than they think.', 'One conversation where nobody asks you to repeat yourself.', 'Do it in a loud room.'],
    ['Pause before the point', 'Right before the part that matters, stop for one full second. Then say it.', 'One deliberate pause.', 'Pause after the point too, and let it land.'],
    ['Slow down for what matters', 'Talk at your normal speed, then drop to half speed for the one line you want remembered.', 'One line slowed down on purpose.', 'Speed up for the exciting part of a story, then slow for the ending.'],
    ['Find the melody', 'Tell someone about your day and let your pitch move: up for questions and surprises, down for endings.', 'One story with no flat stretch.', 'Read a paragraph out loud as if to a child, then tell a story with the same range.'],
    ['Explain with open palms', 'When you explain something, show your palms as you talk. Hands visible and open.', 'One explanation with open hands.', 'Use palms down on the one point you are certain about.'],
    ['Let your tone carry it', 'Say what you feel in a voice that sounds like it. Excited sounds excited. Sorry sounds sorry.', 'One sentence where tone and words match.', 'Say the same sentence three ways for a friend and ask which one they believed.'],
    ['Play Hi-Lo Buffalo', 'Ask someone for their high of the week, their low, and their buffalo: something random that happened.', 'All three answers, and one follow-up.', 'Play it with a group of three or more.'],
    ['Relive the story, don’t report it', 'Tell something that happened as if it is happening now: where you were, what you saw, what you felt.', 'One story told from inside the moment.', 'Keep it under a minute and end on the feeling.'],
    ['Listen on four channels', 'While they talk, track their words, their tone, their body and their energy. Name what you notice: “You sound excited about that.”', 'Name one thing they did not say out loud.', 'Do it when they are upset, and say what you hear before you offer anything.'],
  ],
  s: [
    ['Ask why now', 'Someone brings you a problem or a plan. Before you offer anything, ask: “What made you want to sort this out now?”', 'One why-now question, then listen to the whole answer.', 'Ask one more question about their answer.'],
    ['Say their problem back', 'Sum up what they want in one sentence, then ask: “Is that right?”', 'One summary that gets a yes.', 'Name the problem more sharply than they did, and still get the yes.'],
    ['Ask what they already tried', '“What have you tried so far? How did that go?” Let them walk you through it.', 'Two attempts heard, no advice given.', 'Find the missing piece that made those attempts fail, and say it.'],
    ['Run it on questions', 'Five minutes where almost everything you say is a question. Whoever asks the questions steers the talk.', 'Five minutes, mostly questions.', 'Steer the conversation to a topic you chose, using only questions.'],
    ['Sell the vacation', 'Pitch a plan, a place or an idea by describing how it will feel when it is done, not the steps to get there. Thirty seconds.', 'One pitch about the outcome, under thirty seconds.', 'Use a short story about someone else who got that outcome.'],
    ['Make the ask, then stop', 'Ask for something clearly, then say nothing until they answer.', 'One clear ask and a silence you did not fill.', 'Make the ask twice in one day, to two different people.'],
    ['Acknowledge, associate, ask', 'When someone pushes back, say their concern back neutrally, link it to something good about them, then ask a question.', 'One objection met with all three, no arguing.', 'Do it when the objection is about money or time.'],
    ['Find the real no', 'When you hear a maybe, ask: “If that weren’t an issue, would you do it?”', 'One hypothetical asked, and the real reason heard.', 'Ask it twice to reach the second reason under the first.'],
    ['Make them right', 'In a disagreement, find what they are right about and say it before you make your point.', 'One “You’re right that…” before your side.', 'Get them to agree with your point without ever saying they were wrong.'],
    ['Run the whole CLOSER', 'Pitch something you believe will help them: why now, their problem back, what they tried, the outcome, their concerns. Then ask.', 'All five steps in one conversation, ending with a clear ask. Only sell what you believe in.', 'If they say yes, message them the same day saying why it was a good call.'],
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
