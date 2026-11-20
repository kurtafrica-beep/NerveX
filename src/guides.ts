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
  }
};
