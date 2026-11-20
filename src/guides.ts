import { PATH_GUIDE } from './pathMoves';

export type Guide = { steps: string[]; say: string; why: string; watch: string; record: string };

// How to do each move: three steps, a line to say, why it works, the usual mistake, how to record it.
export const GUIDE: Record<string, Guide> = {
  "c1": {
    "steps": [
      "Pick a busy street, a park path or a mall for twenty minutes.",
      "Look up a few steps before you pass someone, catch their eye, and say “hi” or “morning” at normal volume.",
      "Keep walking. Count each one, whether or not they answer."
    ],
    "say": "Hi. / Morning.",
    "why": "It trains the very first second of contact, the part that usually freezes you, with almost no risk: you are gone before anything can go wrong.",
    "watch": "Mumbling at the ground. If they could not hear it or see your face, it does not count.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c2": {
    "steps": [
      "Pick someone whose job puts them in front of you: a cashier, a barista, someone in the same line.",
      "Say one thing about what is in front of you both, then ask one easy question.",
      "Listen to the answer, reply once, then end it yourself with a thanks."
    ],
    "say": "Busy today? / This line is moving fast. Is it always like this?",
    "why": "These people expect to be spoken to, so you get the practice of starting and ending a chat without the fear of bothering someone.",
    "watch": "Asking a question and then looking at your phone while they answer.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c3": {
    "steps": [
      "Notice something the person chose: shoes, a jacket, a bag, a bike, a haircut.",
      "Say exactly what you like about it in one sentence.",
      "Smile and keep moving unless they clearly want to keep talking."
    ],
    "say": "That jacket colour is great. / Nice bike. That green is sharp.",
    "why": "Specific compliments read as honest, and walking on afterwards shows you wanted nothing back, so people relax.",
    "watch": "Commenting on someone’s body or face. Stick to things they picked.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c4": {
    "steps": [
      "Go somewhere people are already choosing: a café menu, a bookshop shelf, a food court.",
      "Ask someone nearby what they would get, and why.",
      "Thank them, and if it fits, take the recommendation."
    ],
    "say": "You look like you know this place. What should I order?",
    "why": "Asking for advice flatters people and gives them an easy, low-stakes reason to talk to you.",
    "watch": "Asking someone in a rush or with headphones in. Pick someone who is browsing.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c5": {
    "steps": [
      "Go somewhere people share space for a while: a class, the gym, a waiting room, a patio.",
      "Open with something you can both see or hear: the music, the weather, the wait.",
      "Follow with a question about them, and let it end naturally."
    ],
    "say": "Is this class always this packed? / How long have you been coming here?",
    "why": "A shared surrounding gives you an opener that never sounds like a line, because it is about the moment, not about them.",
    "watch": "Waiting for the perfect opener. A plain one said now beats a clever one never said.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c6": {
    "steps": [
      "At an event, find a group of two or three that is chatting, open, and not deep in something private.",
      "Walk up, stand at the edge, and say the line.",
      "Listen for a minute before adding anything. Nod and react to what is said."
    ],
    "say": "Mind if I join you?",
    "why": "Groups are easier than one-on-one: the talk is already going, so you only have to join, not carry it.",
    "watch": "Jumping in with your own topic straight away. Join their conversation first.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c7": {
    "steps": [
      "Start any chat as normal.",
      "About a minute in, give your name casually.",
      "When they give theirs back, repeat it once in your head so it sticks."
    ],
    "say": "I’m Kurt, by the way.",
    "why": "Names turn a passing chat into a real meeting, and they make the next conversation much easier.",
    "watch": "Leading with your name before any small talk. It feels formal and abrupt.",
    "record": "Practise your line to camera until it sounds casual, then do it for real and record a debrief."
  },
  "c8": {
    "steps": [
      "Talk with someone at a class, event or gathering.",
      "Name a specific plan that is already happening: food after, a show, the next class.",
      "Make it easy to say no, and mean it."
    ],
    "say": "A few of us are grabbing food after. You should come.",
    "why": "An invite to a plan that already exists feels generous, not needy, and it is how acquaintances become friends.",
    "watch": "A vague “we should hang out sometime”. Without a time and place it is not an invite.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c9": {
    "steps": [
      "Have a conversation you actually enjoyed.",
      "As it winds down, say plainly that you liked talking to them.",
      "Leave on that note. Do not wait to see if they say it back."
    ],
    "say": "I really liked talking to you.",
    "why": "Most people think it and never say it. Saying it out loud is memorable and costs nothing.",
    "watch": "Saying it with a joke or a shrug to protect yourself. Say it straight.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c10": {
    "steps": [
      "Only after a real conversation where you both enjoyed it, never as an opener.",
      "Ask once, clearly, with a reason to stay in touch.",
      "Whatever the answer, be warm. A no gets “no worries” and a smile."
    ],
    "say": "I’ve enjoyed this. Can I get your number?",
    "why": "Asking clearly and accepting the answer gracefully is the skill. The number is a bonus.",
    "watch": "Asking twice, or asking someone who has been giving short answers. Read the room first.",
    "record": "Record a voice debrief afterwards, whatever the answer was. A clean no is worth posting."
  },
  "t1": {
    "steps": [
      "Listen for something they mention in passing: a trip, a job, a plan.",
      "Ask one question about that exact thing.",
      "Let them answer fully before you say anything about yourself."
    ],
    "say": "Wait, you went to Lisbon? What was that like?",
    "why": "A follow-up proves you were listening, and people warm up to whoever makes them feel heard.",
    "watch": "Asking a follow-up and then switching to your own story right away.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t2": {
    "steps": [
      "Get their name early in the chat.",
      "Use it once, naturally, later in the conversation or at the goodbye.",
      "Just once. Repeating it sounds rehearsed."
    ],
    "say": "Good to meet you, Priya.",
    "why": "Hearing your own name lands as attention. One use shows you remembered.",
    "watch": "Using it every sentence. It sounds like a sales script.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t3": {
    "steps": [
      "When someone asks “How are you?”, skip “good”.",
      "Give one true, specific detail about your day or week.",
      "Keep it short and light, then hand the turn back."
    ],
    "say": "Pretty good. I finally fixed my bike this morning, so I’m riding home.",
    "why": "A real detail gives the other person something to grab, which turns small talk into a real exchange.",
    "watch": "Unloading something heavy on a stranger. One light, true detail is enough.",
    "record": "Record yourself answering “How are you?” three ways to camera and post the most natural one."
  },
  "t4": {
    "steps": [
      "Start the question with what, how, or what was it like.",
      "Avoid questions that can be answered with yes or no.",
      "Wait for the full answer, even if there is a pause."
    ],
    "say": "What got you into that? / How did you end up here?",
    "why": "Open questions invite stories, and stories are where conversations come alive.",
    "watch": "Asking three questions in a row like an interview. Ask one, then react.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t5": {
    "steps": [
      "Listen for something personal they share: a hobby, a worry, a plan.",
      "Share something of about the same size from your own life.",
      "Then hand it back with a question."
    ],
    "say": "Same here, I just started climbing too. How long have you been at it?",
    "why": "Matching what they share builds trust both ways. Too little feels cold, too much feels like a takeover.",
    "watch": "Topping their story with a bigger one.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t6": {
    "steps": [
      "When the talk goes quiet, do not rush to fill it.",
      "Count three slow seconds while staying relaxed and looking friendly.",
      "If nobody speaks, ask an easy question or comment on something around you."
    ],
    "say": "",
    "why": "Comfort with silence reads as confidence, and it often gives the other person room to say more.",
    "watch": "Looking down at your phone during the pause. Stay present.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t7": {
    "steps": [
      "Pick something small that happened this week.",
      "Tell it in three parts: where you were, what happened, how it ended.",
      "Stop at the end. No recap, no explaining the point."
    ],
    "say": "So yesterday I’m on the streetcar, and…",
    "why": "A short story is the easiest way to show who you are without bragging or listing facts.",
    "watch": "Too much setup. Start as close to the interesting part as you can.",
    "record": "Record the story to camera first, then tell it for real."
  },
  "t8": {
    "steps": [
      "When you see something differently, say so once, calmly.",
      "Give your reason in one sentence.",
      "Ask what they think of your reason, and stay curious."
    ],
    "say": "I actually see it differently. I think…",
    "why": "Honest, kind disagreement makes you more interesting and more trusted than nodding along.",
    "watch": "Apologising for your opinion, or trying to win. The goal is a good exchange.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t9": {
    "steps": [
      "While talking with one person, notice someone nearby who is alone or at the edge.",
      "Pull them in with a question that fits what you are both talking about.",
      "Give them a moment to answer before you continue."
    ],
    "say": "We were just arguing about the best pizza in the city. What’s your vote?",
    "why": "Including others shows confidence and makes you the person people are glad to stand next to.",
    "watch": "Pulling someone in and then ignoring them. Give them a real turn.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t10": {
    "steps": [
      "Start a conversation with someone new.",
      "Keep it going with follow-ups, open questions and one short story.",
      "Check the time only after it ends."
    ],
    "say": "",
    "why": "Ten minutes is long enough that you have to use every other Talk move together.",
    "watch": "Watching the clock during the conversation. Stay in it.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q1": {
    "steps": [
      "As you greet someone, lift your eyebrows for a split second.",
      "Pair it with a smile and your hello.",
      "Keep it quick: a flash, not a stare."
    ],
    "say": "",
    "why": "A quick eyebrow raise is a near-universal signal of “good to see you”, so people read you as friendly before you speak.",
    "watch": "Holding the raise. It looks surprised, not warm.",
    "record": "Practise the flash in a selfie video first so you can see how long it lasts."
  },
  "q2": {
    "steps": [
      "Before a conversation, take your hands out of your pockets and put your phone away.",
      "Let your hands rest loosely or move as you talk.",
      "Keep them in view the whole time."
    ],
    "say": "",
    "why": "Visible hands read as open and trustworthy. Hidden hands make people slightly uneasy without knowing why.",
    "watch": "Crossing your arms or holding a drink in front of your chest like a shield.",
    "record": "Film yourself telling a story with your hands in view, then do it for real and record a debrief."
  },
  "q3": {
    "steps": [
      "When someone talks to you, turn more than your head.",
      "Point your feet, hips and chest toward them.",
      "Hold it for the whole conversation."
    ],
    "say": "",
    "why": "Facing someone fully tells them they have your full attention, which is rare and noticed.",
    "watch": "Feet pointed toward the exit. It signals you want to leave.",
    "record": "Record a voice debrief: did you catch yourself turning away?"
  },
  "q4": {
    "steps": [
      "When they finish a thought, do not reply straight away.",
      "Nod slowly three times and keep your face interested.",
      "Wait. Most people will add more."
    ],
    "say": "",
    "why": "Slow nodding signals “keep going”, and people often share the most interesting part after it.",
    "watch": "Fast nodding. That signals “hurry up”.",
    "record": "Record a voice debrief: how much more did they say after the nods?"
  },
  "q5": {
    "steps": [
      "Skip the standard “What do you do?”",
      "Ask a question that lets them talk about something they are excited about.",
      "Follow whatever lights them up."
    ],
    "say": "Working on anything exciting lately? / What’s the best part of your week so far?",
    "why": "A fresher opener breaks people out of autopilot answers and gets you a real conversation.",
    "watch": "A question that is too personal too early. Keep it open and positive.",
    "record": "Record a voice debrief with the question you used and the best answer you got."
  },
  "q6": {
    "steps": [
      "Make a point or a statement.",
      "Let your voice go down at the end of the sentence.",
      "Pause briefly afterwards instead of adding “you know?”"
    ],
    "say": "",
    "why": "A rising tone at the end makes statements sound like questions, as if you are asking permission. Going down sounds sure.",
    "watch": "Ending with “…right?” or “…if that makes sense?”",
    "record": "Record three statements to camera and listen for your voice going down at the end."
  },
  "q7": {
    "steps": [
      "Pick one conversation to focus on.",
      "Each time you feel an “um”, “like” or “you know” coming, close your mouth for a beat instead.",
      "Then carry on with the sentence."
    ],
    "say": "",
    "why": "Short pauses sound thoughtful. Fillers sound unsure, even when you know exactly what you mean.",
    "watch": "Trying so hard you stop talking. Fewer fillers counts, not zero.",
    "record": "Record one minute about your day, count the fillers, then record it again with pauses."
  },
  "q8": {
    "steps": [
      "Tell a short story or explain something.",
      "Use your hands to show what you mean: how big, which way, first and second.",
      "Keep gestures between your waist and shoulders."
    ],
    "say": "",
    "why": "Gestures that match your words make you easier to follow and look more confident.",
    "watch": "Random hand movement that does not match what you are saying.",
    "record": "Video yourself explaining something, then watch it on mute to check your hands."
  },
  "q9": {
    "steps": [
      "Notice when the other person says something you find interesting.",
      "Lean in slightly and let a smile come slowly.",
      "Then respond with a question about it."
    ],
    "say": "",
    "why": "A visible reaction shows real interest, and people talk more to someone who clearly cares.",
    "watch": "Leaning in the whole time. Save it for the good part.",
    "record": "Practise the lean and slow smile in a selfie video, then record a debrief after the real one."
  },
  "q10": {
    "steps": [
      "Pick something you want to ask for: a favour, a better price, a shift swap.",
      "Ask while standing tall, voice low and steady, hands visible.",
      "When they answer, soften with a genuine smile and thanks."
    ],
    "say": "I’d like to take Friday off. Can you make that work?",
    "why": "Steady body and voice show competence, and the smile adds warmth. Together they make the ask hard to refuse.",
    "watch": "Apologising before the ask. “Sorry, I was just wondering…” undoes the steadiness.",
    "record": "Record yourself making the ask to camera first. Watch for posture and voice."
  },
  "v1": {
    "steps": [
      "Set your phone up and record yourself talking for five minutes about your week. No script.",
      "Watch it once on mute: posture, face, hands.",
      "Listen once without the picture: speed, volume, “um”s. Write one habit down."
    ],
    "say": "",
    "why": "You cannot fix what you cannot hear. Splitting picture and sound shows habits you miss when watching both at once.",
    "watch": "Judging how you look. Note one habit and move on.",
    "record": "This one is the recording. Post it, or post the one habit you found."
  },
  "v2": {
    "steps": [
      "In your next conversation, speak one notch louder than feels natural.",
      "Breathe from your stomach, not your chest.",
      "Notice whether people lean in less or ask “sorry?” less."
    ],
    "say": "",
    "why": "Volume is what lets everything else land. If people strain to hear you, they hear less of what you mean.",
    "watch": "Shouting. Louder means clear and full, not aggressive.",
    "record": "Record a minute at your normal volume, then a minute one notch up. Post the louder one."
  },
  "v3": {
    "steps": [
      "Before you say the part that matters most, stop.",
      "Hold the silence for one full second while looking at them.",
      "Then say it, a little slower."
    ],
    "say": "",
    "why": "A pause tells the listener “this next bit matters”, so they pay closer attention.",
    "watch": "Pausing so often that nothing stands out. Save it for one point.",
    "record": "Record yourself making the same point with and without the pause."
  },
  "v4": {
    "steps": [
      "Talk at your normal speed for most of a conversation.",
      "When you reach the line you want remembered, drop to about half speed.",
      "Then return to normal."
    ],
    "say": "",
    "why": "Changing pace signals importance. Speaking fast all the time makes everything sound equally unimportant.",
    "watch": "Slowing everything down. The contrast is what works.",
    "record": "Record a short story with one line at half speed."
  },
  "v5": {
    "steps": [
      "Tell someone about your day.",
      "Let your pitch rise on surprises and questions, and fall on endings.",
      "Exaggerate a little more than feels normal."
    ],
    "say": "",
    "why": "A moving pitch keeps attention. A flat voice makes even exciting news sound boring.",
    "watch": "Sounding sing-song. Follow the meaning, not a pattern.",
    "record": "Record the same story twice: flat, then with your pitch moving."
  },
  "v6": {
    "steps": [
      "When you explain something, turn your palms up and toward the listener.",
      "Keep your hands open and visible as you talk.",
      "For a point you are certain about, turn your palms down."
    ],
    "say": "",
    "why": "Open palms read as honest and inviting; palms down read as certain. Your hands back up your words.",
    "watch": "Pointing a finger at someone. It reads as blame.",
    "record": "Video yourself explaining something with open palms."
  },
  "v7": {
    "steps": [
      "Before you speak, name the feeling you mean: excited, sorry, serious.",
      "Let your voice carry that feeling, not just the words.",
      "Check their face to see if it landed."
    ],
    "say": "",
    "why": "People believe the tone over the words. “I’m excited” said flatly is heard as not excited.",
    "watch": "Forcing a tone you do not feel. Pick a feeling that is true.",
    "record": "Record the same sentence three ways and post the one that sounds most like you mean it."
  },
  "v8": {
    "steps": [
      "Ask someone for three things about their week.",
      "High: the best moment. Low: the hardest. Buffalo: something random or odd.",
      "Ask one follow-up about whichever answer surprised you most."
    ],
    "say": "What was your high this week? Your low? And your buffalo, the random thing?",
    "why": "The game skips small talk, and the random third question usually gets the best story.",
    "watch": "Rushing through all three. Linger on the one that matters to them.",
    "record": "Record a voice debrief with their buffalo. It is usually the best part."
  },
  "v9": {
    "steps": [
      "Pick something that happened to you.",
      "Tell it in the present tense, from inside the moment: where you are, what you see, what you feel.",
      "Slow down at the key moment."
    ],
    "say": "So I’m standing at the counter, and the guy turns around, and…",
    "why": "Reliving puts the listener in the moment with you. Reporting just hands them facts.",
    "watch": "Summarising the ending first. Let them find out with you.",
    "record": "Record the story as a voice note, told from inside the moment."
  },
  "v10": {
    "steps": [
      "While they talk, notice four things: their words, their tone, their body, their energy.",
      "Look for a gap between them, like happy words with a tired voice.",
      "Name what you notice, gently."
    ],
    "say": "You say it’s fine, but you sound a bit worn out. Long week?",
    "why": "Naming what someone did not say out loud makes them feel truly heard.",
    "watch": "Diagnosing them. Offer what you notice as a question, not a verdict.",
    "record": "Record a voice debrief: what did you notice that they did not say?"
  },
  "s1": {
    "steps": [
      "When someone brings up a problem or a plan, hold back your advice.",
      "Ask why it matters to them now.",
      "Listen to the whole answer. The real reason is often the second one."
    ],
    "say": "What made you want to sort this out now?",
    "why": "The reason behind the timing tells you what they actually care about, which is what any good suggestion has to fit.",
    "watch": "Jumping straight to the solution.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s2": {
    "steps": [
      "Listen until you understand what they want.",
      "Sum it up in one clear sentence.",
      "Ask if you got it right, and adjust if not."
    ],
    "say": "So you want to get fitter, but evenings never work. Is that right?",
    "why": "Hearing their own problem said back clearly makes people feel understood and more open to your help.",
    "watch": "Adding your own spin. Use their words.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s3": {
    "steps": [
      "Ask what they have already tried.",
      "Ask how each attempt went.",
      "Hold back advice until they have finished."
    ],
    "say": "What have you tried so far? How did that go?",
    "why": "Hearing past attempts shows you what did not work and why, so your idea can fill the gap.",
    "watch": "Saying “oh, that never works”. Stay neutral.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s4": {
    "steps": [
      "Set a goal: for five minutes, mostly ask questions.",
      "Use their answers to choose the next question.",
      "Notice how the conversation follows your questions."
    ],
    "say": "",
    "why": "Whoever asks the questions steers the conversation, without having to push.",
    "watch": "Asking leading questions to trap them. Stay curious.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s5": {
    "steps": [
      "Pick something you want someone to try: a restaurant, a plan, an idea.",
      "Describe what it will feel like once they are doing it, not the steps to get there.",
      "Keep it under thirty seconds."
    ],
    "say": "Picture Saturday: patio, sun, the best tacos in the city, no plans after.",
    "why": "People decide on the outcome they can picture, not the logistics.",
    "watch": "Listing details: the address, the price, the menu.",
    "record": "Record your thirty-second pitch to camera before you use it."
  },
  "s6": {
    "steps": [
      "Decide exactly what you are asking for.",
      "Ask in one clear sentence.",
      "Stop talking. Wait for their answer, even if the silence feels long."
    ],
    "say": "Would you be up for coming Saturday?",
    "why": "You never get a yes you do not ask for, and talking after the ask often talks people out of it.",
    "watch": "Filling the silence with “no pressure, totally fine if not…”",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s7": {
    "steps": [
      "When someone pushes back, say their concern back neutrally.",
      "Link it to something positive about them.",
      "Ask a question that helps them think it through."
    ],
    "say": "You’re worried about the cost. Makes sense, you’re careful with money. What would make it feel worth it?",
    "why": "It shows you heard them, keeps the talk friendly, and turns the objection into a conversation.",
    "watch": "Arguing with the concern or repeating your pitch louder.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s8": {
    "steps": [
      "When you hear a maybe, ask a hypothetical.",
      "Remove the reason they gave and see if they would say yes.",
      "Listen for the real reason underneath."
    ],
    "say": "If time weren’t an issue, would you do it?",
    "why": "The first reason is often not the real one. The hypothetical shows what is actually in the way.",
    "watch": "Pushing after you hear the real reason. Respect it.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s9": {
    "steps": [
      "In a disagreement, look for the part they are right about.",
      "Say it out loud first.",
      "Then add your point, without saying they were wrong."
    ],
    "say": "You’re right that it’s risky. And I think…",
    "why": "People listen more when they feel right. Agreeing first lowers their guard.",
    "watch": "Saying “you’re right, but…”. The “but” erases the first half.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s10": {
    "steps": [
      "Pick something you truly believe will help them.",
      "Go through it: why now, their problem back, what they tried, the outcome, their concerns.",
      "Finish with a clear ask, then wait."
    ],
    "say": "",
    "why": "It puts every Sell move together in one real conversation.",
    "watch": "Pushing something you do not believe in. People feel it.",
    "record": "Record your pitch to camera first, then a debrief after the real conversation."
  },
  "c11": {
    "steps": [
      "Pick a busy spot with a good view: a square, a waterfront, a landmark.",
      "Have your camera open, walk up and ask clearly.",
      "Thank them and say one more line about the place."
    ],
    "say": "Would you mind taking a quick photo of me?",
    "why": "It is a small request most people say yes to, so you practise asking a stranger for something with almost no risk of a no.",
    "watch": "Apologising three times before you ask. One “excuse me” is enough.",
    "record": "Post the photo with a voice note about how the ask felt."
  },
  "c12": {
    "steps": [
      "Arrive a few minutes early.",
      "Within the first minute, say something simple to the people near you.",
      "Keep it light. The point is being first, not being clever."
    ],
    "say": "Anyone been to one of these before?",
    "why": "The first person to speak sets the mood and gets remembered. Waiting makes it harder every minute.",
    "watch": "Waiting for the perfect thing to say. Plain and early beats perfect and late.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c13": {
    "steps": [
      "Pick a light question: best pizza in the city, best advice they got this year.",
      "Say it is for a practice app, ask the question, then ask to film the answer.",
      "If they say no, smile and thank them. Never film before they agree."
    ],
    "say": "Quick one for a project: best pizza in the city? Mind if I film your answer?",
    "why": "Asking permission openly is a real confidence rep, and it gets you footage made with consent.",
    "watch": "Filming first and asking later.",
    "record": "Post the clip only if they agreed on camera. Otherwise record a voice debrief."
  },
  "c14": {
    "steps": [
      "Choose a place with tables near other people.",
      "Put your phone in your bag before you sit down.",
      "Look around, enjoy the food, and make eye contact with staff and people nearby."
    ],
    "say": "",
    "why": "Being comfortable alone in public is the base that makes approaching people easier. You stop needing a shield.",
    "watch": "Bringing a book to hide behind. Let yourself be seen.",
    "record": "Record a voice note before you go in and one after. Compare how you felt."
  },
  "c15": {
    "steps": [
      "Notice who you would usually avoid talking to.",
      "Open with the same plain line you would use with anyone.",
      "Keep your voice and pace normal. Leave on a friendly note."
    ],
    "say": "How’s your night going?",
    "why": "Treating someone intimidating like a normal person is how the fear shrinks. They usually get fewer genuine hellos than you think.",
    "watch": "Changing your voice or overdoing the charm. Talk to them like anyone else.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c16": {
    "steps": [
      "Notice the nerves in a conversation instead of hiding them.",
      "Name them simply and lightly.",
      "Carry on with the conversation as normal."
    ],
    "say": "I’ll be honest, I’m a bit nervous. I don’t usually do this.",
    "why": "Naming nerves takes away their power, and most people find it disarming and relatable.",
    "watch": "Turning it into a long apology. One line, then move on.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c17": {
    "steps": [
      "Pick a topic that comes up naturally: a film, a restaurant, an idea at work.",
      "Say what you actually think in one or two sentences.",
      "Do not soften it with “maybe” or “I could be wrong”."
    ],
    "say": "Honestly, I think the sequel was better.",
    "why": "People connect with people who have a view. Agreeing with everything makes you forgettable.",
    "watch": "Picking something heavy just to prove a point. Start with low-stakes topics.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c18": {
    "steps": [
      "Pick someone who sees you talk to people often.",
      "Ask for one specific thing, not general praise.",
      "Listen to the whole answer and thank them, even if it stings."
    ],
    "say": "What’s one thing I could do better when I talk to people? Be honest.",
    "why": "Other people see habits you cannot. Asking for it is itself a confidence move.",
    "watch": "Explaining why they are wrong. Just take it in.",
    "record": "Record their answer if they are happy to be recorded, or a voice note of what they said."
  },
  "c19": {
    "steps": [
      "Set the camera at eye level with light on your face.",
      "Say your name, what you are working on, and why you joined.",
      "Post the first take that is good enough. Do not chase perfect."
    ],
    "say": "Hey, I’m Kurt. I’m working on getting better at talking to people, and…",
    "why": "Being seen on purpose is a big confidence step, and it gives your circle a face to cheer for.",
    "watch": "Recording twenty takes. The third one is usually the best.",
    "record": "This one is the recording. Post it."
  },
  "c20": {
    "steps": [
      "Pick someone you trust first.",
      "Say the goal in one plain sentence.",
      "Answer any question they have honestly."
    ],
    "say": "I’m working on getting more confident talking to people.",
    "why": "Saying a goal out loud makes it real, and people often want to help.",
    "watch": "Joking it away straight after you say it.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c21": {
    "steps": [
      "Pick a relaxed group at a bar, a park or a party.",
      "Walk up confidently and open with something about the place or the moment.",
      "Talk to the whole group, not just one person."
    ],
    "say": "Hey, quick question for the group: is this place always this busy?",
    "why": "Opening a whole group is one of the hardest approaches. Once you can do it, one-on-one feels easy.",
    "watch": "Focusing only on the person you find interesting. Win the group first.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c22": {
    "steps": [
      "Pick a request that is unusual but harmless.",
      "Ask clearly, with no apology.",
      "When you get a no, say thanks and leave happy."
    ],
    "say": "Any chance you could do this for ten percent off?",
    "why": "Rejection loses its sting when you collect it on purpose. And sometimes you get a yes.",
    "watch": "Picking a request that makes someone’s job harder. Keep it light.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c23": {
    "steps": [
      "Know your first and last line before you stand.",
      "Get attention with a clear “Can I say something quickly?”",
      "Speak, raise a glass or say thanks, and sit down."
    ],
    "say": "Can I say something quickly? I just want to thank…",
    "why": "Speaking to a whole room is the step past one-on-one courage, and short toasts are the friendliest way in.",
    "watch": "Going on too long. Under a minute.",
    "record": "Ask a friend to film it, or record a voice debrief."
  },
  "c24": {
    "steps": [
      "Only approach someone who is not deep in work or wearing headphones.",
      "Keep your voice low to fit the room.",
      "Comment on something nearby, and leave them easily if they are busy."
    ],
    "say": "Sorry to interrupt. Is that book any good? I’ve been meaning to read it.",
    "why": "Quiet places feel exposed, so the approach takes more nerve, and people are often glad of a friendly break.",
    "watch": "Hovering. Say your line and let them answer.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c25": {
    "steps": [
      "Pick an event where people mingle.",
      "Talk to someone within your first five minutes.",
      "Introduce yourself to two more people before you leave."
    ],
    "say": "Hi, I’m Kurt. First time here?",
    "why": "Going alone forces you to start conversations instead of hiding with friends.",
    "watch": "Standing at the food table the whole time.",
    "record": "Record a voice debrief with the three names and one thing about each."
  },
  "c26": {
    "steps": [
      "Find an open mic, storytelling night or speech club near you.",
      "Prepare one short story or set and practise it three times.",
      "Sign up, go on, and finish even if it wobbles."
    ],
    "say": "",
    "why": "A stage with strangers watching is the hardest version of being seen. Afterwards, most social fears shrink.",
    "watch": "Skipping it because the material is not perfect. Show up anyway.",
    "record": "Ask the venue or a friend to film it, or record a voice debrief straight after."
  },
  "c27": {
    "steps": [
      "Invite four to eight people from different parts of your life.",
      "Greet each person at the door and introduce them to someone with one thing in common.",
      "Check in on anyone standing alone."
    ],
    "say": "You two should meet. You both just started climbing.",
    "why": "Hosting puts you at the centre of the room by choice. It is confidence turned into generosity.",
    "watch": "Hiding in the kitchen to cook. Be with your guests.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c28": {
    "steps": [
      "Know what you want before the conversation.",
      "Say it once, clearly.",
      "If they push, repeat the same sentence in the same calm tone."
    ],
    "say": "I hear you. I’m still going to say no this time.",
    "why": "Confidence is not just approaching people. It is staying steady when someone leans on you.",
    "watch": "Over-explaining. Every extra reason gives them something to argue with.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c29": {
    "steps": [
      "Pick a busy area or event and set a time limit.",
      "Use the openers you already know from earlier moves.",
      "Keep count, and do not stop after a bad one."
    ],
    "say": "",
    "why": "Volume breaks the fear. By the seventh approach, each one stops feeling like a big deal.",
    "watch": "Stopping after one rejection. Bad ones are part of the ten.",
    "record": "Record a quick voice note after each one, or one debrief at the end with your count."
  },
  "c30": {
    "steps": [
      "Pick a friend who wants to get more confident.",
      "Explain the move, show them, then let them try.",
      "Give them one thing they did well and one thing to try next."
    ],
    "say": "Watch me do the first one, then you take the next.",
    "why": "Teaching proves you have mastered it, and helping someone else through the fear makes yours smaller.",
    "watch": "Doing it for them. Let them take the reps.",
    "record": "Record a debrief with your friend, if they are happy to be recorded."
  },
  "t11": {
    "steps": [
      "As they talk, note one detail they mention in passing.",
      "Ten minutes later, bring it back up.",
      "Ask a question about it or connect it to what you are discussing now."
    ],
    "say": "You said earlier you’re moving soon. Where to?",
    "why": "Coming back to something they said shows you were really listening, and people love feeling remembered.",
    "watch": "Forcing it in where it does not fit.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t12": {
    "steps": [
      "After a conversation, note one detail about them in your phone.",
      "Read it before you see them again.",
      "Open with it."
    ],
    "say": "How did the interview go last week?",
    "why": "Being remembered makes people feel important, and it skips the small talk entirely.",
    "watch": "Getting the detail wrong. Check your note first.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t13": {
    "steps": [
      "Wait until you have been chatting for a few minutes.",
      "Ask something about what matters to them, not just facts.",
      "Listen fully and follow up."
    ],
    "say": "What’s been the best part of your year so far?",
    "why": "Deeper questions turn acquaintances into connections. Most people are waiting for someone to ask.",
    "watch": "Asking too deep too soon. Read how open they are first.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t14": {
    "steps": [
      "Get asked something ordinary, like what you did this weekend.",
      "Answer, then add one detail that makes them curious.",
      "Stop and let them ask."
    ],
    "say": "Not much, mostly fixing my bike. Which turned into a whole adventure.",
    "why": "A hook hands the other person an easy next question, so the conversation keeps itself going.",
    "watch": "Telling the whole story straight away. Leave something for them to ask about.",
    "record": "Record yourself answering three common questions with hooks, then use one for real."
  },
  "t15": {
    "steps": [
      "Notice a natural pause.",
      "Give a short, honest reason you are moving on.",
      "End with something warm about the talk."
    ],
    "say": "I’m going to grab a drink, but I’m glad we got talking about the trip.",
    "why": "A good exit leaves people with a good last impression and makes them glad to see you again.",
    "watch": "Waiting for the conversation to die before you leave.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t16": {
    "steps": [
      "Pick something that happened where something did not go as expected.",
      "Set up the scene in one or two sentences.",
      "Hit the turn, give the ending, and stop."
    ],
    "say": "So I’m at the airport, everything’s fine, and then…",
    "why": "The unexpected moment is what makes a story worth hearing. Without it, it is just a report.",
    "watch": "Spending too long on the set-up.",
    "record": "Record it to camera first, then tell it for real."
  },
  "t17": {
    "steps": [
      "Pick a harmless embarrassing moment.",
      "Tell it honestly, without making yourself look better.",
      "Laugh with them at the ending."
    ],
    "say": "You won’t believe how I embarrassed myself last week.",
    "why": "Laughing at yourself shows security, and it makes others relax around you.",
    "watch": "Picking something that makes people worry about you. Keep it light.",
    "record": "Record it to camera, then tell it for real and record a debrief."
  },
  "t18": {
    "steps": [
      "Pick a story with a short exchange between people.",
      "Instead of “he told me no”, say what he said.",
      "Change your tone slightly for each person."
    ],
    "say": "And she just looks at me and goes, “Are you serious?”",
    "why": "Dialogue brings a story to life and makes the listener feel they were there.",
    "watch": "Too many characters. Two or three voices at most.",
    "record": "Record the story to camera with the dialogue."
  },
  "t19": {
    "steps": [
      "Write a one-line summary of each story.",
      "Practise each out loud until it flows.",
      "Trim anything that does not move it forward."
    ],
    "say": "",
    "why": "Having stories ready means you never freeze when someone says “tell me about yourself”.",
    "watch": "Memorising word for word. Know the beats, not the script.",
    "record": "Record all three to camera and post your favourite."
  },
  "t20": {
    "steps": [
      "Pick something you found funny this week.",
      "Tell it with the punchline last.",
      "Pause before the punchline."
    ],
    "say": "",
    "why": "Shared laughter is one of the fastest ways to build a bond with someone.",
    "watch": "Explaining the joke after. If it did not land, move on.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t21": {
    "steps": [
      "Find two people with something in common.",
      "Say both names and the thing they share.",
      "Give them a question to start, then step back."
    ],
    "say": "Sam, meet Ana. You both just got back from Japan. Ana, where did you go?",
    "why": "Connecting people makes you the hub. People remember who introduced them.",
    "watch": "Introducing them and walking off before they have started talking.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t22": {
    "steps": [
      "Ask open questions about their life, work and interests.",
      "Notice anything you share and say so.",
      "Keep count."
    ],
    "say": "No way, you’re into that too?",
    "why": "Things in common build trust fast. Finding them is a skill, not luck.",
    "watch": "Faking a shared interest. People can tell.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t23": {
    "steps": [
      "Ask what they do for fun or what they are into lately.",
      "Watch for the moment their energy lifts.",
      "Ask follow-ups about that and let them run."
    ],
    "say": "What’s the thing you could talk about for hours?",
    "why": "People feel great talking about what they love, and they associate that feeling with you.",
    "watch": "Steering it back to yourself too soon.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t24": {
    "steps": [
      "Watch who has not spoken in a while.",
      "Ask them a question tied to the topic.",
      "When the talk stalls, ask the group a new open question."
    ],
    "say": "Jo, you’ve been quiet. What’s your take?",
    "why": "Running a group conversation is a leadership skill, and everyone remembers who made them feel included.",
    "watch": "Putting someone on the spot with something personal. Keep it easy.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t25": {
    "steps": [
      "Pick a calm, private moment.",
      "Say what you noticed and how it affected you, without blame.",
      "Ask how they see it, and listen."
    ],
    "say": "Can I bring something up? It’s a bit awkward, but I’d rather say it.",
    "why": "Being able to talk about hard things keeps relationships honest and strong.",
    "watch": "Waiting until you are angry.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t26": {
    "steps": [
      "Start with a light opener.",
      "Use follow-ups, stories, shared things and deeper questions.",
      "Do not check the time until it ends."
    ],
    "say": "",
    "why": "Thirty minutes means you used every Talk skill together without leaning on a script.",
    "watch": "Interviewing them. Make it a real two-way exchange.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t27": {
    "steps": [
      "Find someone you would not usually talk to.",
      "Ask what their life is like and listen with curiosity.",
      "Find one thing you agree on and one you see differently."
    ],
    "say": "I’d love to hear how you see this.",
    "why": "Talking across differences is the hardest and most rewarding kind of conversation.",
    "watch": "Trying to change their mind.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t28": {
    "steps": [
      "Watch their face after you speak.",
      "If something lands badly, stop.",
      "Name it and say what you meant."
    ],
    "say": "That came out wrong. What I meant was…",
    "why": "Everyone says the wrong thing sometimes. Fixing it gracefully earns more trust than never slipping.",
    "watch": "Over-apologising until it becomes a bigger thing.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t29": {
    "steps": [
      "Wait for a lull.",
      "Ask the whole table an open question everyone can answer.",
      "Bring people in, react, and keep it moving."
    ],
    "say": "Okay, everyone: what’s the best trip you’ve ever taken?",
    "why": "Hosting a table conversation is the top of the Talk branch. You make the whole room better.",
    "watch": "Making it about your answers.",
    "record": "Record a debrief, or a short clip if everyone at the table agrees."
  },
  "t30": {
    "steps": [
      "Ask a friend who is happy to be recorded.",
      "Plan three topics, then let it flow.",
      "Use everything: follow-ups, stories, threading back, deeper questions."
    ],
    "say": "Let’s talk about something we’ve never really talked about.",
    "why": "Listening back is the best review there is. You will hear exactly where the conversation came alive.",
    "watch": "Talking over them. Leave room for silence.",
    "record": "This one is the recording. Post a clip both of you agree on."
  },
  "q11": {
    "steps": [
      "In a conversation, wait for something you genuinely like.",
      "Let the smile build slowly.",
      "Let it reach your eyes, then fade naturally."
    ],
    "say": "",
    "why": "A real smile reads as warmth. A quick polite one reads as a formality.",
    "watch": "Smiling the whole time. It stops meaning anything.",
    "record": "Practise a slow smile in a selfie video, then record a debrief after doing it for real."
  },
  "q12": {
    "steps": [
      "Notice how fast, loud and animated they are.",
      "Shift yours a little toward theirs.",
      "Keep it subtle. Do not copy every move."
    ],
    "say": "",
    "why": "People feel more comfortable with someone who seems in sync with them.",
    "watch": "Obvious copying. It reads as mocking.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q13": {
    "steps": [
      "As you see them, flash your eyebrows.",
      "Smile and say their name.",
      "Offer an open hand or a wave with your palm visible."
    ],
    "say": "Hey, Ana! Good to see you.",
    "why": "Stacking warm cues makes the first second of a meeting land as genuinely glad to see them.",
    "watch": "Rushing it. The whole thing takes two seconds.",
    "record": "Practise the greeting to camera, then record a debrief."
  },
  "q14": {
    "steps": [
      "Notice what is between you and the other person.",
      "Move it, put it down, or step around it.",
      "Keep your torso open."
    ],
    "say": "",
    "why": "Barriers make people feel blocked off. Removing them makes you feel more open and available.",
    "watch": "Making a big show of moving things. Do it naturally.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q15": {
    "steps": [
      "When they start telling you something, relax your neck.",
      "Let your head tilt slightly.",
      "Keep eye contact and stay quiet."
    ],
    "say": "",
    "why": "A head tilt is a universal sign of “I’m listening”, and it encourages people to say more.",
    "watch": "Tilting while you talk. It reads as unsure.",
    "record": "Practise it in a selfie video, then record a debrief."
  },
  "q16": {
    "steps": [
      "Before you meet, put your phone in your bag on silent.",
      "Leave it there the whole time.",
      "Notice how often you reach for it."
    ],
    "say": "",
    "why": "A phone on the table tells people they are not your full priority. Removing it is the strongest presence cue there is.",
    "watch": "Checking it “just once”.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q17": {
    "steps": [
      "While they speak, keep your eyes on theirs most of the time.",
      "Glance away briefly when it feels natural.",
      "Return your gaze when they make a point."
    ],
    "say": "",
    "why": "Steady eye contact while listening shows full attention and confidence.",
    "watch": "Staring without blinking. Relax your face.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q18": {
    "steps": [
      "Learn your habits: record yourself talking and watch.",
      "In conversations, notice when your hands go to your face or each other.",
      "Rest them still and visible instead."
    ],
    "say": "",
    "why": "Self-soothing gestures signal anxiety, even when you sound confident.",
    "watch": "Freezing stiffly. Still and relaxed, not rigid.",
    "record": "Record a two-minute video talking about your day. Watch it for self-soothing."
  },
  "q19": {
    "steps": [
      "Stop just outside the door.",
      "Roll your shoulders back, lift your chin to level, and breathe.",
      "Walk in at a calm pace."
    ],
    "say": "",
    "why": "How you enter shapes how people read you in the first seconds.",
    "watch": "Rushing in looking at your phone.",
    "record": "Film yourself walking into a room twice: normal, then set. Compare."
  },
  "q20": {
    "steps": [
      "Notice when you hunch, cross your legs tightly, or tuck your arms in.",
      "Uncross, rest your arms naturally, and let your shoulders drop.",
      "Keep it relaxed, not sprawling."
    ],
    "say": "",
    "why": "Taking up normal space reads as comfortable and confident. Shrinking reads as wanting to disappear.",
    "watch": "Spreading out so much it takes others’ space.",
    "record": "Record yourself seated in a conversation and check your posture."
  },
  "q21": {
    "steps": [
      "Before your key point, bring your hands together, fingertips touching.",
      "Make the point.",
      "Release your hands and carry on."
    ],
    "say": "",
    "why": "The steeple is a classic competence cue. It signals that you are sure of what you are saying.",
    "watch": "Holding it the whole time. It looks scheming.",
    "record": "Record yourself explaining something to camera with one steeple."
  },
  "q22": {
    "steps": [
      "When you greet someone or start an explanation, turn your palms up and out briefly.",
      "Keep it natural and quick.",
      "Notice how people respond."
    ],
    "say": "",
    "why": "Open palms are an old signal of having nothing to hide. People read you as honest.",
    "watch": "Holding palms up the whole time. It looks like pleading.",
    "record": "Video yourself explaining something and spot the palm flashes."
  },
  "q23": {
    "steps": [
      "Arrive and scan the room.",
      "Find a spot near where people pass, not in a corner or by the door.",
      "Stand there with an open posture."
    ],
    "say": "",
    "why": "Where you stand decides who you meet. A good spot brings people to you.",
    "watch": "Standing with your back to the room.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q24": {
    "steps": [
      "Ask: do they need to like me or trust my skill more here?",
      "Pick two cues to match: warmth (smile, tilt, nod) or competence (steeple, posture, steady voice).",
      "Use them on purpose."
    ],
    "say": "",
    "why": "Charisma is the right balance of warmth and competence for the moment. Planning it means you control it.",
    "watch": "Using only one side. You need both.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q25": {
    "steps": [
      "Record your side of a video call, or record yourself telling a story to a friend.",
      "Watch it on mute.",
      "Note every time you block, lean away or touch your face."
    ],
    "say": "",
    "why": "You cannot fix cues you cannot see. Most people are surprised by their own.",
    "watch": "Recording someone without asking. Only film yourself.",
    "record": "Post the clip, or the list of cues you found."
  },
  "q26": {
    "steps": [
      "Record yourself walking in and introducing yourself to camera.",
      "Show three people and ask for three words they would use.",
      "Compare what they saw with what you wanted."
    ],
    "say": "Be honest: what three words come to mind?",
    "why": "First impressions form fast. Testing yours tells you what people actually see.",
    "watch": "Asking only friends who will be nice.",
    "record": "This one is the recording. Post it with the words people gave you."
  },
  "q27": {
    "steps": [
      "Set your stance at the door.",
      "Pause, scan the room, smile.",
      "Walk with purpose to the first person you will greet."
    ],
    "say": "",
    "why": "A confident entrance sets how the whole room sees you before you have spoken.",
    "watch": "Heading straight to your phone or the bar alone.",
    "record": "Ask a friend to film the entrance, or record a debrief."
  },
  "q28": {
    "steps": [
      "Watch their body while you talk.",
      "If they close off, step back slightly, soften your voice and ask about them.",
      "Watch whether they open up again."
    ],
    "say": "",
    "why": "Charisma is not a fixed act. It is noticing how you land and adjusting.",
    "watch": "Assuming every closed cue is about you. Sometimes they are just cold.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q29": {
    "steps": [
      "Before it, choose two warmth cues and two competence cues.",
      "Use the warmth cues at the hello and goodbye.",
      "Use the competence cues on your key points."
    ],
    "say": "",
    "why": "Under pressure people drop into habits. Planning the cues keeps you charismatic when it counts.",
    "watch": "Thinking so hard about cues you stop listening.",
    "record": "Record yourself rehearsing to camera, then a debrief after."
  },
  "q30": {
    "steps": [
      "Ask a friend to record themselves talking for two minutes.",
      "Watch it on mute and note warmth, competence and danger cues.",
      "Give one strength and two things to try."
    ],
    "say": "Here’s what you do really well, and two things to try.",
    "why": "Spotting cues in others proves you see them, and teaching sharpens your own.",
    "watch": "Only giving criticism. Lead with what works.",
    "record": "Record a debrief with your friend, if they are happy to be recorded."
  },
  "v11": {
    "steps": [
      "Hum for thirty seconds, low to high.",
      "Do lip trills (a horse-like brr) for thirty seconds.",
      "Say a tongue twister three times, getting faster."
    ],
    "say": "Red leather, yellow leather.",
    "why": "A warmed-up voice is clearer, steadier and less likely to crack when you are nervous.",
    "watch": "Skipping it because it feels silly. Do it in the car.",
    "record": "Record yourself reading the same paragraph before and after the warm-up."
  },
  "v12": {
    "steps": [
      "Pick a paragraph from anything.",
      "Read it slowly, exaggerating every consonant.",
      "Read it again at normal speed. It will sound sharper."
    ],
    "say": "",
    "why": "Exaggerating clarity in practice makes your normal speech crisper without effort.",
    "watch": "Rushing the exaggerated read. Go slowly.",
    "record": "Record both reads and post them back to back."
  },
  "v13": {
    "steps": [
      "Put a hand on your stomach.",
      "Breathe in so your hand moves out, not your shoulders up.",
      "Speak on that breath and notice how much steadier it sounds."
    ],
    "say": "",
    "why": "Belly breathing gives your voice support, so it sounds fuller and calmer.",
    "watch": "Gulping air. Breathe in slowly.",
    "record": "Record yourself reading with chest breaths, then belly breaths."
  },
  "v14": {
    "steps": [
      "Record a two-minute explanation of anything you know well.",
      "Listen back and count every “um”, “like” and “you know”.",
      "Re-record, pausing where the fillers were."
    ],
    "say": "",
    "why": "Hearing your fillers is the fastest way to lose them.",
    "watch": "Being harsh on yourself. Everyone has them.",
    "record": "Post the second recording with your before and after count."
  },
  "v15": {
    "steps": [
      "When asked something, take a breath.",
      "Say your point, then why, then a quick example.",
      "Stop."
    ],
    "say": "I’d go with the first option. It’s cheaper long term. We saved a lot doing that last year.",
    "why": "A clear structure makes you sound sure and makes you easy to follow.",
    "watch": "Adding a fourth and fifth sentence.",
    "record": "Record yourself answering three questions this way."
  },
  "v16": {
    "steps": [
      "Pick a neutral sentence, like “I didn’t expect to see you here.”",
      "Say it in each emotion, really committing.",
      "Listen back and notice what changed."
    ],
    "say": "I didn’t expect to see you here.",
    "why": "Most people use a tiny part of their vocal range. Stretching it makes your everyday voice more alive.",
    "watch": "Holding back because it feels silly.",
    "record": "Post all five versions."
  },
  "v17": {
    "steps": [
      "Pick a story with a tense or secret moment and an exciting one.",
      "Drop to almost a whisper for the tense part.",
      "Raise your volume for the exciting part."
    ],
    "say": "",
    "why": "Changing volume pulls people in. Quiet makes them lean closer, loud makes them sit up.",
    "watch": "Staying at one level the whole time.",
    "record": "Record the story to camera with both volume changes."
  },
  "v18": {
    "steps": [
      "Pick a place you know well.",
      "Describe what you see, hear and feel there.",
      "Use specific details, not general words."
    ],
    "say": "There’s this tiny café with one window, always fogged up, and it smells like cinnamon.",
    "why": "Specific detail makes people feel they are there with you.",
    "watch": "Listing facts. Describe it like you are walking through it.",
    "record": "Record the description as a voice note."
  },
  "v19": {
    "steps": [
      "Tell a story with a clear big moment.",
      "Just before it, stop and look at your listener.",
      "Hold two seconds, then deliver."
    ],
    "say": "",
    "why": "A pause before the payoff builds anticipation and makes the moment land harder.",
    "watch": "Pausing so long they think you lost your place.",
    "record": "Record the story with the pause."
  },
  "v20": {
    "steps": [
      "Pick a short children’s book.",
      "Give each character a voice, and change pace for the exciting parts.",
      "Read it like you are performing it."
    ],
    "say": "",
    "why": "Children’s stories give you permission to be expressive. That range carries into your normal speech.",
    "watch": "Reading flat because no one is watching.",
    "record": "Record the whole reading."
  },
  "v21": {
    "steps": [
      "Pick a topic you know well.",
      "Plan only your opening line and closing line.",
      "Record in one take and do not stop."
    ],
    "say": "",
    "why": "Speaking without notes forces you to know your point, and it builds the confidence to talk anywhere.",
    "watch": "Stopping and restarting. Keep going.",
    "record": "This one is the recording. Post it."
  },
  "v22": {
    "steps": [
      "Before you speak, plan your three sentences.",
      "Use your clear, belly-supported voice.",
      "Land your last sentence flat and stop."
    ],
    "say": "I think we should push the launch. We’re not ready on support. Last time that cost us a week.",
    "why": "A structured point stands out because most people ramble in meetings.",
    "watch": "Apologising before you speak: “This might be stupid, but…”",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "v23": {
    "steps": [
      "Notice when your heart rate goes up.",
      "Breathe from the belly once.",
      "Speak at about two-thirds of your normal speed."
    ],
    "say": "",
    "why": "Nerves speed you up. Slowing down sounds calm and in control, and it calms you too.",
    "watch": "Speeding up again after the first sentence.",
    "record": "Record yourself answering a hard question at normal speed, then slowed down."
  },
  "v24": {
    "steps": [
      "Record yourself speaking for at least five minutes.",
      "Watch on mute for body language. Listen without picture for tone.",
      "Read a transcript for wasted words and structure."
    ],
    "say": "",
    "why": "Each pass isolates one channel, so you catch things you would miss watching everything at once.",
    "watch": "Skipping the transcript. It shows how much you ramble.",
    "record": "Post the recording or your three notes."
  },
  "v25": {
    "steps": [
      "When interrupted, raise your hand slightly.",
      "Keep your volume steady, do not get louder.",
      "Finish your sentence, then hand over."
    ],
    "say": "Let me just finish this thought.",
    "why": "Holding your ground calmly earns respect without conflict.",
    "watch": "Shouting over them or going quiet and giving up.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "v26": {
    "steps": [
      "Find a group that will let you speak: a speaking club, work, a meetup.",
      "Build a clear opening, three points, and an ending.",
      "Rehearse it out loud three times."
    ],
    "say": "",
    "why": "A real audience is the true test of every vocal skill together.",
    "watch": "Reading from slides. Talk to the people.",
    "record": "Ask someone to film it, or record the audio."
  },
  "v27": {
    "steps": [
      "Pick a story that matters to you.",
      "Relive it, use pauses, and slow down at the emotional moment.",
      "End on the feeling, not a lesson."
    ],
    "say": "",
    "why": "Moving someone is the peak of using your voice. It shows full control of tone, pace and pause.",
    "watch": "Explaining the moral at the end. Let them feel it.",
    "record": "Record the story to camera."
  },
  "v28": {
    "steps": [
      "Ask a friend for any topic.",
      "Take one breath and start with a clear opening line.",
      "Use point, reason, example to keep going."
    ],
    "say": "",
    "why": "Thinking on your feet is what lets you sound confident in any situation.",
    "watch": "Freezing to find the perfect angle. Start with anything.",
    "record": "Record all your attempts and post the best."
  },
  "v29": {
    "steps": [
      "Volunteer to welcome people or introduce someone.",
      "Prepare your opening line and the key details.",
      "Use full volume, warmth and a clear ending."
    ],
    "say": "Welcome, everyone. Thanks for coming. Let’s get started.",
    "why": "Hosting means your voice sets the energy for the whole room.",
    "watch": "Mumbling the names. Practise them first.",
    "record": "Ask someone to film it, or record a debrief."
  },
  "v30": {
    "steps": [
      "Ask a friend to record two minutes of talking.",
      "Listen for each of the five foundations.",
      "Give one strength and two things to try."
    ],
    "say": "Your volume’s great. Try pausing before your main point.",
    "why": "Hearing these things in others proves you understand them, and teaching sharpens your own ear.",
    "watch": "Giving ten notes at once. Two is plenty.",
    "record": "Record a debrief with your friend, if they are happy to be recorded."
  },
  "s11": {
    "steps": [
      "Ask about their work or a project.",
      "Ask what is the most annoying part of it right now.",
      "Listen. Do not solve it yet."
    ],
    "say": "What’s the most frustrating part of it right now?",
    "why": "Every sale starts with a problem. Finding real problems is the first skill of selling.",
    "watch": "Jumping in with a fix.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s12": {
    "steps": [
      "Before you start, say what you want to cover and how long it will take.",
      "Say what will happen at the end.",
      "Ask if that works for them."
    ],
    "say": "I’ve got about ten minutes. I’ll ask a few questions, then tell you what I’d suggest. Sound good?",
    "why": "Setting the frame puts you in charge of the conversation and removes awkwardness at the end.",
    "watch": "Making it sound like a script. Keep it casual.",
    "record": "Record yourself saying your frame to camera first."
  },
  "s13": {
    "steps": [
      "Write who you help and what problem they have.",
      "Write the result you give them.",
      "Record it until it sounds natural, not memorised."
    ],
    "say": "I help small gyms get more members without spending more on ads.",
    "why": "Being able to say what you do clearly and quickly opens doors in every conversation.",
    "watch": "Describing your process instead of the result.",
    "record": "Post the recording."
  },
  "s14": {
    "steps": [
      "Think of who you want to meet and who might know them.",
      "Ask clearly and say why.",
      "Make it easy: offer to write the message for them."
    ],
    "say": "Who do you know who’s trying to grow their business? I’d love an intro.",
    "why": "Warm introductions are the easiest way to start a new conversation, and most people are happy to help.",
    "watch": "Being vague about who you want to meet.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s15": {
    "steps": [
      "Write down the main thing you talked about.",
      "Send a short message mentioning it.",
      "Suggest one clear next step."
    ],
    "say": "Great talking about your launch yesterday. Want to grab coffee Thursday and go through it?",
    "why": "Most opportunities die from no follow-up. Doing it fast puts you ahead of almost everyone.",
    "watch": "A vague “let’s stay in touch”.",
    "record": "Record a voice note on what you sent and why."
  },
  "s16": {
    "steps": [
      "Pick something to sell, real or made up.",
      "Record yourself playing your side, or have a friend play the buyer.",
      "Hit every step: why now, problem back, what they tried, the outcome, concerns, the ask."
    ],
    "say": "",
    "why": "Practising the whole structure out loud makes it automatic when it is real.",
    "watch": "Skipping steps because you know them. Say every one.",
    "record": "This one is the recording. Post it."
  },
  "s17": {
    "steps": [
      "Brief your friend to push back on price.",
      "Acknowledge, connect it to something good about them, and ask a question.",
      "Find out what would make it worth it."
    ],
    "say": "Totally fair. You’re careful with money. If it paid for itself in a month, would that change things?",
    "why": "Price objections come up in nearly every sale. Practising makes your answer calm instead of defensive.",
    "watch": "Dropping your price straight away.",
    "record": "Record the role-play, if your friend agrees."
  },
  "s18": {
    "steps": [
      "When you get a no or maybe, ask what is holding them back.",
      "Address that one thing.",
      "Ask again, clearly."
    ],
    "say": "Makes sense. With that sorted, are you in?",
    "why": "Many yeses come on the second ask. Most people give up after the first.",
    "watch": "Asking again without answering the concern.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s19": {
    "steps": [
      "Pick a real example of someone who got the outcome.",
      "Tell it in thirty seconds: where they started, what changed, where they are now.",
      "Link it back to the person in front of you."
    ],
    "say": "A friend of mine was in the same spot, trying everything. Three months later…",
    "why": "Stories make results feel real and possible for the listener.",
    "watch": "Making up a story. Use real ones.",
    "record": "Record the story to camera."
  },
  "s20": {
    "steps": [
      "Pick something you can actually sell.",
      "Use the steps: find the problem, sell the outcome, handle concerns.",
      "Ask for the money clearly."
    ],
    "say": "",
    "why": "A real sale for real money is completely different from practice. This is where it becomes a skill.",
    "watch": "Discounting before they even ask.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s21": {
    "steps": [
      "After you understand their problem, ask what might get in the way.",
      "Listen for time, money, a partner, or past bad experiences.",
      "Address them before you pitch."
    ],
    "say": "Before I suggest anything, what could stop you from doing this?",
    "why": "Concerns raised early are easy to handle. Concerns raised at the end kill sales.",
    "watch": "Waiting for them to bring up objections.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s22": {
    "steps": [
      "Write the result they want, as big and specific as honestly possible.",
      "Add things that make success more likely, like a guarantee or support.",
      "Cut the time and effort it takes."
    ],
    "say": "",
    "why": "People say yes when the value clearly outweighs the price. Building the offer is selling before you speak.",
    "watch": "Promising results you cannot deliver.",
    "record": "Record yourself presenting the offer to camera."
  },
  "s23": {
    "steps": [
      "Run the full conversation.",
      "At the end, ask for the decision directly.",
      "If it is “I need to think”, ask what exactly they need to think about."
    ],
    "say": "Based on everything you’ve said, should we get you started today?",
    "why": "Decisions put off are usually decisions lost. Closing in the moment respects their time and yours.",
    "watch": "Ending with “let me know what you think”.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s24": {
    "steps": [
      "Within a few hours, write a short personal message.",
      "Mention one specific thing they said they wanted.",
      "Tell them what happens next."
    ],
    "say": "Really excited to have you. You said you wanted to stop wasting weekends on this. Here’s what happens next.",
    "why": "Reinforcing the decision prevents buyer’s remorse and starts the relationship well.",
    "watch": "A generic copy-paste message.",
    "record": "Record a voice note about what you sent."
  },
  "s25": {
    "steps": [
      "Record your side (with consent) or write a debrief straight after each one.",
      "For each, find the moment it turned.",
      "Write down the pattern."
    ],
    "say": "",
    "why": "The best sellers review their calls. Patterns show up that you never notice in the moment.",
    "watch": "Only reviewing the ones that went badly.",
    "record": "Post your three notes as a voice debrief."
  },
  "s26": {
    "steps": [
      "Pick someone who said no earlier.",
      "Ask what has changed since, and what put them off before.",
      "Address it honestly, then ask again."
    ],
    "say": "Last time it wasn’t the right fit. What’s changed since then?",
    "why": "A no is often a “not now”. Going back with respect shows real persistence.",
    "watch": "Repeating the same pitch.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s27": {
    "steps": [
      "Book five conversations at the start of the week.",
      "Use the full structure in each.",
      "Review each one straight after."
    ],
    "say": "",
    "why": "Volume builds skill fast. Five in a week shows you patterns you would never see in one.",
    "watch": "Cancelling when one goes badly.",
    "record": "Record a debrief after each conversation."
  },
  "s28": {
    "steps": [
      "When asked for a discount, acknowledge it.",
      "Explain the value instead of cutting the price.",
      "Offer something extra that costs you little but is worth a lot to them."
    ],
    "say": "I keep my price the same for everyone, but I can add a second session at no extra cost.",
    "why": "Discounting trains people to wait for deals. Adding value keeps your worth and still helps them say yes.",
    "watch": "Caving at the first push.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s29": {
    "steps": [
      "Prepare a short version of your pitch.",
      "Ask the group one question to find their shared problem.",
      "Pitch the outcome and handle questions from the room."
    ],
    "say": "",
    "why": "Selling to a group means handling several people’s concerns at once. It is the top of the skill.",
    "watch": "Talking to only one person in the group.",
    "record": "Ask someone to film it, or record a debrief."
  },
  "s30": {
    "steps": [
      "Explain each step in your own words.",
      "Role-play as the buyer.",
      "Give them one strength and one thing to fix."
    ],
    "say": "You play the seller. I’ll be a tough buyer.",
    "why": "Teaching it proves you have mastered it. Master salesmen build other salesmen.",
    "watch": "Taking over when they struggle. Let them work through it.",
    "record": "Record the role-play, if your friend agrees."
  },
  "c31": {
    "steps": [
      "Notice the name tag before you reach the counter.",
      "At the end, look up and say thanks with their name.",
      "Smile and move on."
    ],
    "say": "Thanks, Maria. Have a good one.",
    "why": "Using a name turns a transaction into a tiny human moment, and people light up when they hear it.",
    "watch": "Mumbling the name at the till screen. Look at them.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "c32": {
    "steps": [
      "Pick a favour that takes them five seconds.",
      "Ask clearly, with a please.",
      "Thank them properly."
    ],
    "say": "Would you mind keeping an eye on my seat for a minute?",
    "why": "Small favours are almost always a yes, so you practise asking strangers for things without much risk.",
    "watch": "Apologising before you even ask. Just ask.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t31": {
    "steps": [
      "Listen to the end of what they say.",
      "Repeat the last two or three words, with a curious tone.",
      "Stop and let them expand."
    ],
    "say": "They: “…so I ended up moving to Montreal.” You: “Moved to Montreal?”",
    "why": "Echoing shows you are listening and invites them to say more, with almost no effort from you.",
    "watch": "Echoing every sentence. Once or twice is enough.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "t32": {
    "steps": [
      "Notice something you both can see or hear.",
      "Say one short thing about it.",
      "Follow it straight away with a question."
    ],
    "say": "This place is packed for a Tuesday. Is it always like this?",
    "why": "A comment followed by a question is the easiest way to start any conversation. It feels natural, not like a line.",
    "watch": "Stopping after the comment and waiting for them to carry it.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "q31": {
    "steps": [
      "Walk somewhere with people coming toward you.",
      "Catch their eye a few steps away.",
      "Smile first, then keep walking."
    ],
    "say": "",
    "why": "Smiling first sets a warm tone, and most people smile back without thinking.",
    "watch": "A tight polite smile. Let it reach your eyes.",
    "record": "Practise your smile in a selfie video, then record a debrief on how many smiled back."
  },
  "q32": {
    "steps": [
      "Pick a busy hallway, mall or street.",
      "Lift your chin to level, roll your shoulders back, slow your pace slightly.",
      "Keep your phone in your pocket the whole way."
    ],
    "say": "",
    "why": "How you move is the first cue people read, before you say a word. A calm walk reads as confident.",
    "watch": "Marching stiffly. Calm and loose, not rigid.",
    "record": "Ask a friend to film you walking, before and after."
  },
  "v31": {
    "steps": [
      "Pick a paragraph from any article or book.",
      "Read it out loud into your phone at normal speed.",
      "Listen back once and notice your speed and volume."
    ],
    "say": "",
    "why": "Most people have never heard their own voice properly. This is the easiest first look.",
    "watch": "Cringing and stopping. Everyone hates their recorded voice at first.",
    "record": "This one is the recording. Post it."
  },
  "v32": {
    "steps": [
      "Pick a short greeting, like a voicemail message.",
      "Record it with a straight face.",
      "Record it again while smiling, and listen to both."
    ],
    "say": "Hey, it’s Kurt. Just calling to say hi.",
    "why": "A smile changes the sound of your voice. People can hear warmth even when they cannot see you.",
    "watch": "A forced grin. Think of something that makes you smile.",
    "record": "Post both recordings back to back."
  },
  "s31": {
    "steps": [
      "Pick a friend, coworker or someone you are chatting with.",
      "Ask what they want out of it, not what they are doing.",
      "Listen and ask one follow-up."
    ],
    "say": "What are you hoping to get out of this week?",
    "why": "Every sale begins with what the other person wants. Asking it plainly is the first sales skill.",
    "watch": "Telling them what you think they should want.",
    "record": "Right after, record a voice note: what you did, how they reacted, what you would change."
  },
  "s32": {
    "steps": [
      "Pick something you genuinely love: a show, a place, a tool.",
      "Think about why it fits this person in particular.",
      "Tell them in thirty seconds, then stop."
    ],
    "say": "You’d love this place. You’re always after somewhere quiet to work, and the coffee’s great.",
    "why": "Selling starts with recommending what you believe in, tailored to the person.",
    "watch": "Listing every feature. Pick the one reason that fits them.",
    "record": "Record your thirty-second recommendation to camera before you say it."
  }
};
Object.assign(GUIDE, PATH_GUIDE);
