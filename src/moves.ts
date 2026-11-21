import { PATH_LAYOUT, PATH_SOURCE } from './pathMoves';

export type BaseKey = 'c' | 't' | 'q' | 'v' | 's';
export type PathKey = 'n' | 'f' | 'm' | 'p' | 'k';
export type BranchKey = BaseKey | PathKey;

export type Move = {
  id: string;
  b: BranchKey;
  n: number;
  // level (stage on a path), position in it, how many moves it has
  lv: number;
  i: number;
  of: number;
  // the last move of a path: it only counts with proof
  cap: boolean;
  // taken out of the levels; kept so lines already posted on it still show
  retired?: boolean;
  title: string;
  doIt: string;
  rep: string;
  up: string;
};

export const BRANCH: Record<BranchKey, { name: string; tag: string; path?: boolean }> = {
  c: { name: 'Confidence', tag: 'Gets you in.' },
  t: { name: 'Talk', tag: 'Keeps it going.' },
  q: { name: 'Cues', tag: 'How it lands. Built on Vanessa Van Edwards’ work on warmth and competence.' },
  v: { name: 'Voice', tag: 'How it sounds. Built on Vinh Giang’s teaching on vocal foundations and connection.' },
  s: { name: 'Sell', tag: 'How to get a yes. Built on Alex Hormozi’s sales frameworks. Only sell what you believe helps them.' },
  n: { name: 'Negotiator', path: true, tag: 'Getting to a deal both sides keep. Built on Chris Voss’s negotiation methods.' },
  f: { name: 'Founder', path: true, tag: 'Selling when you are the whole team. Built on ideas from Josh Braun, Keenan, April Dunford and Oren Klaff.' },
  m: { name: 'Creator', path: true, tag: 'Being on camera and in public. Built on ideas from Ali Abdaal, Vinh Giang, MrBeast, Paddy Galloway and Alex Hormozi.' },
  p: { name: 'Prospector', path: true, tag: 'Starting conversations that turn into business. Built on ideas from Jeb Blount and Mike Weinberg.' },
  k: { name: 'Keynote', path: true, tag: 'Owning a room. Built on ideas from Julian Treasure, Chris Anderson’s TED guide, Matthew Dicks and Vinh Giang.' },
};
export const BRANCH_KEYS: BaseKey[] = ['c', 't', 'q', 'v', 's'];
export const PATH_KEYS: PathKey[] = ['n', 'f', 'm', 'p', 'k'];
export const ALL_KEYS: BranchKey[] = [...BRANCH_KEYS, ...PATH_KEYS];
// What each path needs: the level reached in each base branch, and recordings across those branches.
export const PATH: Record<PathKey, { need: Partial<Record<BaseKey, number>>; recs: number; by: string[] }> = {
  n: { need: { t: 3, q: 3 }, recs: 8, by: [] },
  f: { need: { s: 3, c: 3, t: 2 }, recs: 8, by: ['Josh Braun', 'Keenan', 'April Dunford', 'Oren Klaff'] },
  m: { need: { v: 3, c: 2 }, recs: 8, by: ['Ali Abdaal and Vinh Giang', 'MrBeast and Paddy Galloway', 'Alex Hormozi', ''] },
  p: { need: { s: 3, c: 3 }, recs: 8, by: ['Jeb Blount', 'Mike Weinberg', 'Jeb Blount', 'Mike Weinberg'] },
  k: { need: { v: 4, t: 3, c: 3 }, recs: 10, by: ['Julian Treasure', 'Chris Anderson’s TED Talks guide', 'Matthew Dicks', 'Vinh Giang'] },
};
// Reactions from other people a posted capstone needs before it counts.
export const CAP_REACTS = 3;
export function isPath(b: BranchKey): b is PathKey {
  return !!BRANCH[b].path;
}

// [title, the move, the rep, the upgrade]
const SOURCE: Record<BranchKey, [string, string, string, string][]> = {
  ...PATH_SOURCE,
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
    ["Ask a stranger to take your photo", "Somewhere busy, ask a stranger to take a photo of you.", "One ask, one photo.", "Ask for a second shot and tell them how to frame it."],
    ["Speak first in a group", "At a class, meetup or team call, be the first person to say something.", "First voice in the room, once.", "Be first, then ask the group a question."],
    ["Ask for an on-camera answer", "Ask a stranger a fun question and ask if you can film their ten-second answer.", "One ask. A no still counts.", "Get three different people to answer the same question."],
    ["Eat out alone, phone away", "Have a meal at a restaurant or café on your own, with your phone out of sight.", "Thirty minutes, phone away.", "Sit at the bar and chat with the bartender."],
    ["Talk to someone who intimidates you", "Start a normal, short chat with someone you find intimidating: attractive, senior, or high status.", "Thirty seconds in a normal tone.", "Get their name before you leave."],
    ["Admit you’re nervous", "In a conversation, say out loud that you are a bit nervous, then keep going.", "Say it once.", "Say it, then keep talking for two more minutes."],
    ["Say the opinion you usually keep", "In a group, share a real opinion you would normally keep to yourself.", "One opinion, said without hedging.", "Say it and then ask who disagrees."],
    ["Ask for honest feedback", "Ask a friend or coworker for one thing you could do better when you talk to people.", "Ask, listen, say thanks. No defending.", "Ask two more people the same question and compare."],
    ["Introduce yourself to the feed", "Record a thirty-second video introducing yourself and post it here.", "One take, posted.", "Post it to your own social accounts too."],
    ["Say your goal out loud", "Tell someone what you are working on: getting more confident talking to people.", "Say it to one person.", "Say it to someone you just met."],
    ["Open a group of strangers", "Walk up to a group of strangers who are not at an event with you and start a conversation.", "Two minutes with the group.", "Get everyone’s name."],
    ["Get rejected on purpose", "Make a request that will probably get a no: ask for a discount, to see the kitchen, to swap a seat.", "One no, taken with a smile.", "Collect three nos in one day."],
    ["Say a few words at a gathering", "At a dinner, party or team event, stand up and say a few words: a toast, a thank-you, an announcement.", "Thirty seconds, standing.", "Do it without notes."],
    ["Approach in a quiet place", "In a café or library, start a chat with someone sitting alone who looks open.", "One quiet approach.", "Keep it going for five minutes."],
    ["Go alone, leave with three names", "Go to an event or meetup on your own and leave with three new names.", "Three names before you leave.", "Leave with a plan to see one of them again."],
    ["Take the open-mic stage", "Sign up at an open mic or storytelling night and do three minutes.", "Three minutes on stage.", "Do it at a second venue."],
    ["Host a mixed gathering", "Organise a small get-together where not everyone knows each other, and introduce people.", "One gathering, everyone introduced.", "Invite someone you met through Nerve."],
    ["Hold a boundary calmly", "When someone pushes past a reasonable no or request of yours, repeat it once, calmly, without extra excuses.", "One calm repeat.", "Do it with someone you usually give in to."],
    ["Ten approaches in one night", "In one outing, start ten real conversations with strangers.", "Ten conversations, any length.", "Do it in a place you have never been."],
    ["Teach a move", "Take a friend through a Base move and do it with them.", "They complete the move once.", "Coach them to their first Level 2 move."],
    ["Thank someone by name", "Read the name tag of a cashier or server and thank them using it.", "Three people thanked by name.", "Add one line about their day."],
    ["Ask a quick favour", "Ask a stranger for something small: to watch your seat, pass the sugar, or tell you the wifi password.", "One small favour asked.", "Ask two different strangers in one outing."],
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
    ["Thread back to something they said", "Later in a conversation, bring back something they mentioned earlier.", "One callback in a conversation.", "Thread two earlier details together."],
    ["Remember them next time", "When you see someone again, ask about something they told you last time.", "One remembered detail.", "Remember two things about them."],
    ["Ask a deeper question", "Once a chat is warm, ask one question that goes past small talk.", "One deeper question, answered.", "Share your own answer too."],
    ["Answer with a hook", "When asked a question, add one interesting detail that invites a follow-up.", "One hooked answer.", "Do it three times in one conversation."],
    ["Exit well", "End a conversation warmly, on your terms, with a reason and a nice last line.", "One clean exit.", "Exit while the conversation is still at its best."],
    ["Tell a story with a turn", "Tell a sixty-second story with a set-up, something unexpected, and an ending.", "One story with a clear turn.", "Tell it to two different people and tighten it."],
    ["Tell a story against yourself", "Tell a story about a time you looked a bit foolish, and laugh at it.", "One self-mocking story.", "Tell it in a group."],
    ["Put dialogue in your story", "Tell a story using what people actually said, in their voices.", "One story with quoted lines.", "Do a voice for each person."],
    ["Build three go-to stories", "Prepare three short stories you can tell anywhere: a funny one, a surprising one, and one that shows what you care about.", "Three stories, each under a minute.", "Tell all three for real in one week."],
    ["Make someone laugh on purpose", "Tell a story or make an observation with the goal of getting a laugh.", "One real laugh.", "Get a laugh from a group."],
    ["Introduce two people", "Introduce two people who do not know each other, with a reason they should talk.", "One introduction with a reason.", "Introduce three pairs at one event."],
    ["Find three things in common", "In one conversation, discover three real things you share with the other person.", "Three shared things.", "Find them with someone very different from you."],
    ["Get them on their passion", "Find what the other person cares about most and get them talking about it for five minutes.", "Five minutes on their passion.", "Learn something from it you did not know."],
    ["Keep a group talking", "In a group of four or more, keep the conversation going and bring quieter people in.", "Bring one quiet person in.", "Do it in a group of strangers."],
    ["Have the awkward talk", "Bring up something awkward with a friend, partner or coworker, kindly and directly.", "One awkward topic raised.", "Do it within a day of it coming up."],
    ["Thirty minutes with a stranger", "Carry a thirty-minute conversation with someone you just met.", "Thirty minutes.", "End it with a plan to talk again."],
    ["Talk to someone very different", "Have a real conversation with someone very different from you in age, background or views.", "Fifteen minutes, both sides heard.", "Find out how they would see one of your problems."],
    ["Repair a misstep live", "When something you say lands wrong, notice it and fix it on the spot.", "One repair in the moment.", "Repair it with humour."],
    ["Host a table conversation", "At a dinner or gathering, guide the whole table into one shared conversation.", "One shared conversation at the table.", "Keep it going for twenty minutes."],
    ["Record a real conversation", "Sit down with a friend and record a twenty-minute podcast-style conversation.", "Twenty minutes recorded.", "Do it with someone you do not know well."],
    ["Echo their last words", "When they finish a sentence, repeat their last few words back as a question.", "One echo, and let them keep going.", "Use it three times in one conversation."],
    ["Comment, then ask", "Make one observation about something around you, then ask a question about it.", "One comment and one question.", "Turn the answer into a two-minute chat."],
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
    ["Smile for real", "Let your smile come from something real so it reaches your eyes, rather than a polite one.", "One genuine smile you noticed.", "Hold it a beat longer before it fades."],
    ["Match their energy", "Quietly match the other person’s pace, volume and posture.", "One conversation matched.", "Match someone, then slowly lift their energy."],
    ["The full warm hello", "Greet someone with every warm cue at once: eyebrow flash, smile, their name, and an open hand.", "One full greeting.", "Do it for everyone you greet at an event."],
    ["Remove the barriers", "In a conversation, take away anything between you: crossed arms, a bag, a laptop, a table corner.", "One conversation with nothing in between.", "Step around a table to talk."],
    ["Tilt to listen", "While they talk, tilt your head slightly to one side.", "One conversation with the listening tilt.", "Combine it with the slow triple nod."],
    ["Phone away the whole time", "Spend a whole hangout with your phone out of sight.", "One full hangout.", "Tell them you put it away for them."],
    ["Hold eye contact while they talk", "Keep steady eye contact while the other person speaks, glancing away only briefly.", "One conversation with steady eye contact.", "Hold it with someone who intimidates you."],
    ["Stop the self-soothing", "Catch yourself touching your face, neck or hair, or rubbing your hands, and replace it with still hands.", "Catch it three times.", "Get through a whole conversation without it."],
    ["Set your stance before you enter", "Before walking into a room, take a strong, open stance: shoulders back, chin level, feet planted.", "One entrance set up this way.", "Hold the posture for the first five minutes inside."],
    ["Take up your space", "Sit or stand taking up a natural amount of space instead of shrinking.", "One conversation where you did not shrink.", "Do it in a meeting."],
    ["Steeple your point", "When you make an important point, press your fingertips together in front of you.", "Use it on one key point.", "Use it in a meeting or interview."],
    ["Flash your palms", "Show your open palms when you say hello or explain something.", "Three palm flashes in one conversation.", "Use it when you admit a mistake."],
    ["Pick your spot in the room", "At an event, place yourself where people naturally pass, facing into the room.", "Spend ten minutes in a good spot.", "Meet three people from that spot."],
    ["Tune warmth and competence", "Before a conversation, decide whether you need more warmth or more competence, and pick two cues for it.", "One conversation with planned cues.", "Switch the balance mid-conversation."],
    ["Find your danger cues", "Record yourself in a conversation and look for blocking, distancing and self-soothing.", "Find three danger cues in your recording.", "Fix one and record again."],
    ["Test your first impression", "Record a ten-second introduction and ask three people for their honest first impression.", "Three honest impressions.", "Re-record with changes and ask again."],
    ["Own the entrance", "Walk into an event with your stance set, scan the room, smile, and go greet someone straight away.", "One full entrance.", "Greet the host by name within a minute."],
    ["Adjust live", "In a conversation, notice the other person’s cues (crossed arms, leaning away, short answers) and adjust yours.", "One adjustment in the moment.", "Turn a cold conversation warm."],
    ["Both in a high-stakes moment", "In an interview, date or pitch, use planned warmth and competence cues together.", "One high-stakes conversation with planned cues.", "Ask afterwards how you came across."],
    ["Coach someone’s cues", "Watch a friend’s video and give them three notes on their cues.", "Three useful notes given.", "Watch them improve on a second recording."],
    ["Smile first", "Smile at five people before they smile at you.", "Five first smiles.", "Add an eyebrow flash to each one."],
    ["Walk tall", "Walk through a busy place at a calm pace, head up, shoulders back, eyes forward.", "One full walk, no phone.", "Hold it through a crowd without speeding up."],
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
    ["Warm up your voice", "Do a two-minute vocal warm-up before you talk: humming, lip trills, and a tongue twister.", "One warm-up before a real conversation.", "Do it every day for a week."],
    ["Sharpen your words", "Read a paragraph out loud, over-pronouncing every consonant, then read it again normally.", "One paragraph, twice.", "Do it with a pen held between your teeth first."],
    ["Breathe from the belly", "Speak a full paragraph on breaths from your stomach, not your chest.", "One paragraph, belly breaths.", "Use it in a real conversation."],
    ["Cut the filler, on tape", "Record yourself explaining something for two minutes, listen back, then record it again with fewer fillers.", "Two recordings, fewer fillers in the second.", "Get it under three fillers."],
    ["Answer in three sentences", "Answer a question with three sentences: your point, your reason, an example.", "One three-sentence answer.", "Do it in a meeting."],
    ["Stretch your range", "Say the same sentence in five emotions: happy, sad, angry, scared, surprised.", "Five versions recorded.", "Get a friend to guess each emotion."],
    ["Use the volume dial", "Tell a story with one quiet part and one loud part.", "One story with clear volume changes.", "Use a whisper for the key moment."],
    ["Paint the picture", "Describe a place so well the listener can see it.", "One place described in detail.", "Add sound and smell."],
    ["The dramatic pause", "In a story, pause for a full two seconds right before the big moment.", "One two-second pause in a story.", "Use two pauses in one story."],
    ["Read a children’s story aloud", "Read a children’s story out loud with full expression: voices, pace, volume, pauses.", "One full story read with expression.", "Read it to a real child."],
    ["Two minutes to camera, no notes", "Record a two-minute talk to camera about something you know, with no notes.", "Two minutes, one take.", "Do it on a topic someone else picks."],
    ["Make a structured point in a meeting", "In a meeting or group discussion, make one point using point, reason, example.", "One clear point in a group.", "Make it first, before anyone else."],
    ["Slow down under pressure", "In a tense or nervous moment, deliberately speak slower than feels natural.", "One tense moment, slowed down.", "Use it when you are being challenged."],
    ["Review yourself three ways", "Record a conversation or talk, then review it three times: on mute, audio only, and as a transcript.", "Three passes, one note each.", "Fix the top note and record again."],
    ["Handle an interruption", "When someone talks over you, calmly finish your thought.", "One interruption handled calmly.", "Do it in a group."],
    ["Five minutes to a real audience", "Give a five-minute talk to a real group: a meetup, a club, a team meeting.", "Five minutes, live.", "Do it without notes."],
    ["Move someone with a story", "Tell a story that leaves the listener feeling something: moved, inspired or emotional.", "One story that lands a feeling.", "Do it in front of a group."],
    ["Speak on a random topic", "Have a friend give you a random topic and speak on it for sixty seconds with no preparation.", "Sixty seconds, no pause longer than three seconds.", "Do three topics in a row."],
    ["Lead the room", "Host or MC a moment: welcome people, introduce a speaker, or run a short event.", "One hosting moment.", "Host a whole event."],
    ["Coach someone’s voice", "Listen to a friend’s recording and give notes on melody, volume, pace, tone and pause.", "Three useful notes given.", "Hear them improve on a second recording."],
    ["Read a paragraph aloud", "Record yourself reading one paragraph out loud, then listen back once.", "One paragraph, one listen.", "Read it again and change one thing you noticed."],
    ["Smile while you talk", "Record the same sentence twice: once with a straight face, once smiling.", "Two recordings, compared.", "Leave a real voicemail while smiling."],
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
    ["Find the frustration", "In a casual chat, ask what is frustrating someone about their work, a hobby or a plan.", "One real frustration heard.", "Ask what they have done about it."],
    ["Set the frame first", "At the start of a conversation where you want something, say how it will go.", "One conversation framed upfront.", "Get them to agree to the frame out loud."],
    ["Pitch yourself in thirty seconds", "Write and record a thirty-second pitch for yourself: who you help, the problem you solve, the result.", "One recorded pitch.", "Use it when someone asks what you do."],
    ["Ask for an introduction", "Ask someone you know to introduce you to someone they know.", "One introduction asked for.", "Get the introduction made."],
    ["Follow up within a day", "After a good conversation, send a message within twenty-four hours with one specific next step.", "One follow-up sent in time.", "Get a reply that moves it forward."],
    ["Run CLOSER on camera", "Record a full mock sales conversation using every CLOSER step.", "One full recorded run-through.", "Do it in under ten minutes."],
    ["Role-play the price objection", "Have a friend play a buyer who says it is too expensive, and handle it.", "One price objection handled.", "Handle three versions of it."],
    ["Ask twice", "After the first no or maybe, address the concern and ask for the yes again.", "One second ask.", "Get a yes on the second ask."],
    ["Sell with a story", "Tell a thirty-second story about someone like them who got the result.", "One sales story told.", "Have three stories ready for different objections."],
    ["Get a real yes for money", "Sell something real for money: an item you own, a service, a ticket.", "One real sale.", "Sell it at full price without a discount."],
    ["Surface the hidden concerns", "Before you make your offer, ask what could stop them from going ahead.", "One hidden concern found.", "Find two before the pitch."],
    ["Make the offer hard to refuse", "Write an offer that makes the result bigger and more likely while making it faster and easier to get.", "One offer written and tested on a friend.", "Make it so good your friend asks to buy."],
    ["Close in the moment", "Have a real sales conversation and ask for a decision before it ends.", "One decision asked for in the conversation.", "Get the yes and the payment then."],
    ["Reinforce the yes", "After someone says yes, send a personal message the same day confirming why it was a good decision.", "One reinforcement message sent.", "Make it handwritten."],
    ["Review three of your conversations", "Review three sales conversations to find exactly where you lost or won them.", "Three conversations reviewed.", "Fix the most common mistake."],
    ["Sell to a sceptic", "Go back to someone who said no before, and have a fresh conversation.", "One second conversation.", "Turn the no into a yes."],
    ["Five conversations in a week", "Have five real sales conversations in one week.", "Five conversations in seven days.", "Close two of them."],
    ["Hold your price", "When asked for a discount, keep your price and add value instead.", "One discount request held.", "Close the sale at full price."],
    ["Pitch to a group", "Pitch something to three or more people at once.", "One group pitch.", "Get a yes from someone in the room."],
    ["Teach someone the CLOSER", "Train a friend on the CLOSER steps and watch them run a full conversation.", "They run the full structure once.", "They make a real sale with it."],
    ["Ask what they want", "Ask someone what they are hoping to get out of their week, a plan or a project.", "One answer heard in full.", "Ask what would make it a great result."],
    ["Recommend one thing", "Recommend something you love to a friend in thirty seconds, focused on why it suits them.", "One recommendation, under thirty seconds.", "Get them to try it."],
  ],
};

// Where each move sits: five levels per branch, easiest first. A move's ID never changes,
// so lines already posted stay attached to the same move when it moves level.
// n is the move's position in its branch: 1-10 is the base level, 11-30 are levels 2-5.
const LAYOUT: Record<BranchKey, string[][]> = {
  ...PATH_LAYOUT,
  "c": [
    [
      "c1",
      "c3",
      "c2",
      "c5",
      "c7"
    ],
    [
      "c11",
      "c12",
      "c13",
      "c14",
      "c15"
    ],
    [
      "c16",
      "c17",
      "c18",
      "c19",
      "c8"
    ],
    [
      "c21",
      "c22",
      "c23",
      "c25",
      "c10"
    ],
    [
      "c26",
      "c27",
      "c28",
      "c29",
      "c30"
    ]
  ],
  "t": [
    [
      "t1",
      "t2",
      "t4",
      "t3",
      "t7"
    ],
    [
      "t11",
      "t12",
      "t13",
      "t15",
      "t10"
    ],
    [
      "t16",
      "t17",
      "t18",
      "t19",
      "t20"
    ],
    [
      "t21",
      "t23",
      "t24",
      "t8",
      "t25"
    ],
    [
      "t26",
      "t27",
      "t28",
      "t29",
      "t30"
    ]
  ],
  "q": [
    [
      "q1",
      "q2",
      "q3",
      "q32",
      "q4"
    ],
    [
      "q11",
      "q13",
      "q14",
      "q15",
      "q5"
    ],
    [
      "q16",
      "q17",
      "q18",
      "q19",
      "q20"
    ],
    [
      "q21",
      "q22",
      "q23",
      "q10",
      "q25"
    ],
    [
      "q26",
      "q27",
      "q28",
      "q29",
      "q30"
    ]
  ],
  "v": [
    [
      "v1",
      "v2",
      "v3",
      "v4",
      "v5"
    ],
    [
      "v11",
      "v12",
      "v13",
      "v14",
      "v15"
    ],
    [
      "v16",
      "v17",
      "v18",
      "v9",
      "v20"
    ],
    [
      "v21",
      "v22",
      "v24",
      "v25",
      "v10"
    ],
    [
      "v26",
      "v27",
      "v28",
      "v29",
      "v30"
    ]
  ],
  "s": [
    [
      "s1",
      "s2",
      "s3",
      "s5",
      "s6"
    ],
    [
      "s11",
      "s12",
      "s13",
      "s14",
      "s15"
    ],
    [
      "s16",
      "s17",
      "s7",
      "s19",
      "s20"
    ],
    [
      "s21",
      "s22",
      "s10",
      "s24",
      "s25"
    ],
    [
      "s26",
      "s27",
      "s28",
      "s29",
      "s30"
    ]
  ]
};

export const MOVES: Move[] = [];
export const BY: Record<string, Move> = {};
const BYPOS: Record<string, string> = {};
for (const b of ALL_KEYS) {
  let n = 0;
  LAYOUT[b].forEach((ids, li) => {
    ids.forEach((id, ii) => {
      const m = SOURCE[b][Number(id.slice(1)) - 1];
      n++;
      const move: Move = { id, b, n, lv: li + 1, i: ii + 1, of: ids.length, cap: isPath(b) && li === 4, title: m[0], doIt: m[1], rep: m[2], up: m[3] };
      MOVES.push(move);
      BY[id] = move;
      BYPOS[b + n] = id;
    });
  });
}

// Moves taken out of the levels keep their ID so lines already posted on them still show.
for (const b of ALL_KEYS) {
  SOURCE[b].forEach((m, idx) => {
    const id = b + (idx + 1);
    if (BY[id]) return;
    BY[id] = { id, b, n: 0, lv: 0, i: 0, of: 0, cap: false, retired: true, title: m[0], doIt: m[1], rep: m[2], up: m[3] };
  });
}

// Tonight's pick walks the branches side by side, easiest first.
export const ORDER: string[] = [];
for (let n = 1; n <= 25; n++) for (const b of BRANCH_KEYS) if (BYPOS[b + n]) ORDER.push(BYPOS[b + n]);
for (let n = 1; n <= 17; n++) for (const b of PATH_KEYS) if (BYPOS[b + n]) ORDER.push(BYPOS[b + n]);

// Five levels of five moves per branch.
export const LEVEL_NAMES: Record<BranchKey, string[]> = {
  n: ['Listen', 'Empathy', 'Calibrate', 'Bargain', 'Capstone'],
  f: ['Outreach', 'Discovery', 'Positioning', 'Pitch', 'Capstone'],
  m: ['On camera', 'Hooks', 'Story', 'In public', 'Capstone'],
  p: ['The call', 'Walk in', 'Follow up', 'Book it', 'Capstone'],
  k: ['Presence', 'Structure', 'Story', 'The room', 'Capstone'],
  "c": [
    "Base",
    "Bold",
    "Open",
    "Fearless",
    "Unshakeable"
  ],
  "t": [
    "Base",
    "Engaging",
    "Storyteller",
    "Connector",
    "Master Conversationalist"
  ],
  "q": [
    "Base",
    "Warm",
    "Present",
    "Magnetic",
    "Charismatic"
  ],
  "v": [
    "Base",
    "Clear",
    "Expressive",
    "Commanding",
    "Master Speaker"
  ],
  "s": [
    "Base",
    "Prospector",
    "Closer",
    "Rainmaker",
    "Master Salesman"
  ]
};
export const LEVELS = [1, 2, 3, 4, 5];

// Base branches have levels; paths have stages and end in a capstone.
export function lvWord(b: BranchKey): string {
  return isPath(b) ? 'Stage' : 'Level';
}
export function lvTitle(b: BranchKey, k: number): string {
  return isPath(b) && k === 5 ? 'Capstone' : `${lvWord(b)} ${k} · ${LEVEL_NAMES[b][k - 1]}`;
}
export function levelMoves(b: BranchKey, k: number): Move[] {
  return MOVES.filter((m) => m.b === b && m.lv === k);
}
export function levelDone(b: BranchKey, k: number, count: Record<string, number>): boolean {
  return levelMoves(b, k).every((m) => count[m.id]);
}
// A level opens once every move in the level before it has a line. A path move also needs its path open.
export function unlocked(m: Move, count: Record<string, number>, open: Partial<Record<BranchKey, boolean>> = {}): boolean {
  if (m.retired) return false;
  if (isPath(m.b) && !open[m.b]) return false;
  return m.lv === 1 || levelDone(m.b, m.lv - 1, count);
}
export function currentLevel(b: BranchKey, count: Record<string, number>): number {
  let k = 1;
  while (k < 5 && levelDone(b, k, count)) k++;
  return k;
}
export function label(m: Move): string {
  return m.retired ? `${BRANCH[m.b].name} · Retired move` : `${BRANCH[m.b].name} · ${lvTitle(m.b, m.lv)}`;
}
