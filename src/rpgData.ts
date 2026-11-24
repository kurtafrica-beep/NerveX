// Places, side quests, playbook patches and character stats. Same content as the web page.
export type StatKey = 'courage' | 'warmth' | 'presence' | 'persuasion';
export type Place = { id: string; e: string; name: string; lv: number; stats: StatKey[] };
export const PLACES: Place[] = [
 {
  "id": "cafe",
  "e": "☕",
  "name": "Coffee shop",
  "lv": 1,
  "stats": [
   "warmth",
   "courage"
  ]
 },
 {
  "id": "grocery",
  "e": "🛒",
  "name": "Grocery store",
  "lv": 1,
  "stats": [
   "courage",
   "warmth"
  ]
 },
 {
  "id": "gym",
  "e": "🏋️",
  "name": "Gym",
  "lv": 2,
  "stats": [
   "courage",
   "presence"
  ]
 },
 {
  "id": "books",
  "e": "📚",
  "name": "Bookstore",
  "lv": 3,
  "stats": [
   "warmth",
   "presence"
  ]
 },
 {
  "id": "dogs",
  "e": "🐕",
  "name": "Dog park",
  "lv": 4,
  "stats": [
   "warmth",
   "courage"
  ]
 },
 {
  "id": "meetup",
  "e": "🎟️",
  "name": "Meetup or class",
  "lv": 5,
  "stats": [
   "courage",
   "presence"
  ]
 },
 {
  "id": "work",
  "e": "💼",
  "name": "Work event",
  "lv": 6,
  "stats": [
   "persuasion",
   "presence"
  ]
 },
 {
  "id": "bar",
  "e": "🍸",
  "name": "Bar or lounge",
  "lv": 7,
  "stats": [
   "courage",
   "warmth"
  ]
 }
];
export const PLACE_SOURCE: [string, string, string, string][] = [
 [
  "Thank the barista by name",
  "Read their name tag or ask it, and thank them using it.",
  "One thank-you with their name.",
  "Ask how their shift is going and listen."
 ],
 [
  "Ask the person next to you what's good",
  "Ask someone in line or at the next table what they'd recommend here.",
  "One question, one answer.",
  "Order what they suggest and tell them how it was."
 ],
 [
  "Comment on what someone's reading or working on",
  "Make a light, curious comment about someone's book, laptop sticker or sketchbook.",
  "One comment, one reply.",
  "Turn it into a two-minute chat."
 ],
 [
  "Ask to share a table",
  "When it's busy, ask a stranger if you can share their table, then say something.",
  "One ask.",
  "Chat for five minutes once you sit."
 ],
 [
  "Invite a regular to something",
  "Invite someone you've seen there before to an event, a class or a coffee another time.",
  "One invite.",
  "They say yes and you go."
 ],
 [
  "Ask someone where something is",
  "Ask another shopper (not staff) if they know where something is.",
  "One question.",
  "Thank them and make a light comment."
 ],
 [
  "Make a light comment in line",
  "While waiting to pay, make one light comment to the person near you.",
  "One comment.",
  "Keep it going for the whole wait."
 ],
 [
  "Ask for a cooking tip",
  "Ask someone what they're making with something in their cart.",
  "One question.",
  "Try their recipe and tell them next time."
 ],
 [
  "Let someone go ahead and chat",
  "Let someone with fewer items go ahead, then chat while you wait.",
  "One kind act, one chat.",
  "Keep the chat going past the till."
 ],
 [
  "Ask the cashier a real question",
  "Ask the cashier something specific and listen to the answer.",
  "One real question.",
  "Learn their name and use it next time."
 ],
 [
  "Ask if they're using it",
  "Ask someone if they're using a piece of equipment, then say one more thing.",
  "One question plus one line.",
  "Ask to work in with them."
 ],
 [
  "Ask for a spot or a form check",
  "Ask someone experienced to spot you or check your form.",
  "One ask.",
  "Thank them and ask one follow-up question."
 ],
 [
  "Compliment someone's progress",
  "Give a genuine compliment on someone's lift, consistency or technique.",
  "One compliment.",
  "Turn it into a chat about their training."
 ],
 [
  "Ask a regular about their routine",
  "Ask someone you see often what their routine is.",
  "One conversation.",
  "Try their routine and report back."
 ],
 [
  "Invite someone to train together",
  "Suggest training together once.",
  "One invite.",
  "Actually train together."
 ],
 [
  "Ask staff for a recommendation",
  "Ask a bookseller for a recommendation based on a book you loved.",
  "One ask.",
  "Buy it and go back to tell them."
 ],
 [
  "Ask a browser what they're looking for",
  "Ask someone browsing the same section what they're looking for.",
  "One question.",
  "Recommend them something."
 ],
 [
  "Recommend a book to a stranger",
  "Hand someone a book you love and tell them why in two sentences.",
  "One recommendation.",
  "They take it to the till."
 ],
 [
  "Talk about a book for two minutes",
  "Have a two-minute conversation about a book with someone.",
  "Two minutes.",
  "Five minutes."
 ],
 [
  "Suggest a book swap or a coffee",
  "Suggest swapping books or grabbing a coffee to talk about it.",
  "One invite.",
  "They say yes."
 ],
 [
  "Ask a dog's name",
  "Ask someone their dog's name.",
  "One question.",
  "Remember the name next time."
 ],
 [
  "Ask the owner about the dog",
  "Ask a real question about the dog: age, training, personality.",
  "One question.",
  "Two-minute chat."
 ],
 [
  "Introduce yourself, not just the dog",
  "Swap your own names, not just the dogs'.",
  "Names swapped.",
  "Use their name when you leave."
 ],
 [
  "Talk about something that isn't dogs",
  "Keep a conversation going for five minutes on another topic.",
  "Five minutes.",
  "Ten minutes."
 ],
 [
  "Suggest a walk together",
  "Suggest walking the dogs together another day.",
  "One invite.",
  "Actually walk together."
 ],
 [
  "Arrive early and talk to the host",
  "Get there ten minutes early and talk to the organiser or teacher.",
  "One chat.",
  "Offer to help with something."
 ],
 [
  "Introduce yourself to someone alone",
  "Find someone standing alone and introduce yourself.",
  "One introduction.",
  "Introduce them to someone else."
 ],
 [
  "Ask a question out loud",
  "Ask one question in front of the group.",
  "One question.",
  "Ask two."
 ],
 [
  "Introduce two people",
  "Introduce two people who should know each other.",
  "One introduction.",
  "Two introductions."
 ],
 [
  "Suggest a group plan",
  "Stay after and suggest a group plan: food, drinks, a next meetup.",
  "One suggestion.",
  "The plan happens."
 ],
 [
  "Introduce yourself to someone senior",
  "Introduce yourself to someone more senior than you.",
  "One introduction.",
  "Ask them one real question."
 ],
 [
  "Ask what they're excited about",
  "Ask someone what they're working on that excites them.",
  "One question.",
  "Three people."
 ],
 [
  "Join a group conversation",
  "Join a group of three or more and add to the conversation.",
  "One join.",
  "Make the group laugh."
 ],
 [
  "Compliment someone's work",
  "Give someone a specific compliment on their work.",
  "One compliment.",
  "Tell their manager too."
 ],
 [
  "Follow up the next day",
  "Message someone you met the day before with something useful.",
  "One follow-up.",
  "Set up a coffee."
 ],
 [
  "Chat with the bartender",
  "Order and have a short chat with the bartender.",
  "One chat.",
  "Learn their name."
 ],
 [
  "Talk to the person next to you",
  "Start a conversation with someone next to you at the bar.",
  "One conversation.",
  "Five minutes."
 ],
 [
  "Join a trivia team or game",
  "Ask to join a group's trivia team, pool game or darts.",
  "One ask.",
  "Play the whole game with them."
 ],
 [
  "Invite someone to your table",
  "Invite someone or a small group to join your table.",
  "One invite.",
  "They join."
 ],
 [
  "Ask for a number after a real chat",
  "After a real conversation, ask for their number or contact.",
  "One ask.",
  "Set a plan."
 ]
];
export const QUEST_SOURCE: [string, string, string, string][] = [
 [
  "Ask a stranger for a book recommendation",
  "Ask someone you don't know what book they'd recommend.",
  "One ask.",
  "Read the first chapter tonight."
 ],
 [
  "Give three compliments",
  "Give three specific compliments today.",
  "Three.",
  "Five."
 ],
 [
  "Say good morning to five people",
  "Say good morning to five people you pass.",
  "Five.",
  "Ten."
 ],
 [
  "Call instead of texting",
  "Call a friend you'd normally text.",
  "One call.",
  "Talk for ten minutes."
 ],
 [
  "Ask someone how their day is really going",
  "Ask a worker or acquaintance how their day is really going, and listen.",
  "One ask.",
  "Ask a follow-up."
 ],
 [
  "Learn a new person's name",
  "Learn the name of someone you see often but don't know.",
  "One name.",
  "Use it next time."
 ],
 [
  "Send a friend a voice note",
  "Send a friend a voice note instead of a text.",
  "One voice note.",
  "Make it two minutes."
 ],
 [
  "Ask a question in a meeting or class",
  "Ask one question out loud in a meeting or class.",
  "One question.",
  "Two."
 ],
 [
  "Hold eye contact as you pass",
  "Hold eye contact and nod at three people you pass.",
  "Three.",
  "Ten."
 ],
 [
  "Tell someone a 30-second story",
  "Tell someone a 30-second story about your week.",
  "One story.",
  "Make them laugh."
 ],
 [
  "Follow up on someone's plans",
  "Ask someone about plans they mentioned before.",
  "One follow-up.",
  "Two."
 ],
 [
  "Thank someone for something specific",
  "Thank someone for one specific thing they did.",
  "One thank-you.",
  "Do it in writing too."
 ],
 [
  "Speak first in a lift or a queue",
  "Be the first to say something in a lift or a queue.",
  "One line.",
  "Turn it into a chat."
 ],
 [
  "Ask for a small extra",
  "Ask politely for a small extra: a discount, a sample, a better seat.",
  "One ask.",
  "Get a yes."
 ],
 [
  "Introduce yourself to a neighbour",
  "Introduce yourself to a neighbour you haven't met.",
  "One introduction.",
  "Learn something about them."
 ],
 [
  "Record a one-minute video about your day",
  "Record a one-minute video to camera about your day.",
  "One minute.",
  "Post it."
 ],
 [
  "Ask a stranger to take your photo",
  "Ask a stranger to take your photo.",
  "One ask.",
  "Chat with them after."
 ],
 [
  "Compliment a stranger's style",
  "Compliment a stranger on something they chose to wear.",
  "One compliment.",
  "Ask where they got it."
 ],
 [
  "Ask someone what they're excited about",
  "Ask someone what they're excited about right now.",
  "One ask.",
  "Three people."
 ],
 [
  "Make someone laugh",
  "Make someone laugh today.",
  "One laugh.",
  "Three."
 ],
 [
  "Message someone you haven't talked to in a year",
  "Message someone you've lost touch with.",
  "One message.",
  "Set up a call."
 ]
];
export const QUEST_STATS: StatKey[][] = [["courage","warmth"],["warmth"],["courage"],["warmth"],["warmth"],["warmth","courage"],["presence","warmth"],["courage","presence"],["presence","courage"],["presence","warmth"],["warmth"],["warmth"],["courage"],["courage","persuasion"],["courage","warmth"],["presence"],["courage"],["courage","warmth"],["warmth","presence"],["warmth","presence"],["warmth","courage"]];
export const RPG_GUIDE: Record<string, { steps: string[]; say?: string; why?: string; watch?: string; rec?: string }> = {
 "x1": {
  "steps": [
   "Look for a name tag, or ask while you wait.",
   "When your drink comes, thank them using their name.",
   "Smile and make eye contact while you say it."
  ],
  "say": "“Thanks, Maya. Have a good one.”",
  "why": "Using someone's name turns a transaction into a moment between two people.",
  "watch": "Mumbling it. Say the name clearly.",
  "rec": "Voice note after: did they react to their name?"
 },
 "x2": {
  "steps": [
   "Pick someone who isn't on a call or wearing headphones.",
   "Ask what's good here, or what they usually get.",
   "Thank them, and if it fits, ask one follow-up."
  ],
  "say": "“First time here. What's good?”",
  "why": "Asking for advice is the easiest opener there is: people like being the expert.",
  "watch": "Asking someone who is clearly busy.",
  "rec": "Voice note after with what they said."
 },
 "x3": {
  "steps": [
   "Notice something they chose: a book, a sticker, a drawing.",
   "Make one curious comment or question about it.",
   "If they answer briefly, smile and let them get back to it."
  ],
  "say": "“Is that book as good as everyone says?”",
  "why": "Commenting on something they chose shows you noticed them, not just their looks.",
  "watch": "Interrupting someone deep in work.",
  "rec": "Voice note after: how did they respond?"
 },
 "x4": {
  "steps": [
   "Pick a table with a free seat.",
   "Ask politely if you can join.",
   "Once you sit, say one friendly thing before you get your phone out."
  ],
  "say": "“Mind if I grab this seat? It's packed today.”",
  "why": "Sharing space is a natural reason to talk.",
  "watch": "Sitting down and ignoring them completely.",
  "rec": "Voice note after: did it turn into a chat?"
 },
 "x5": {
  "steps": [
   "Notice someone you've seen there more than once.",
   "Say hi, mention you've both been regulars, and chat briefly.",
   "Invite them to something specific, with an easy out."
  ],
  "say": "“We keep running into each other. There's a trivia night Thursday if you're into that.”",
  "why": "Turning a familiar face into a real connection is how local friendships start.",
  "watch": "Being vague. Name the thing and the day.",
  "rec": "Voice note after with what they said."
 },
 "x6": {
  "steps": [
   "Pick an aisle with another shopper.",
   "Ask if they know where something is.",
   "Thank them with a smile."
  ],
  "say": "“Sorry, do you know where they hide the tahini here?”",
  "why": "A small, real question is the lowest-risk way to speak first.",
  "watch": "Apologising too much.",
  "rec": "Voice note after."
 },
 "x7": {
  "steps": [
   "Notice something you share: the long line, the weather, a product.",
   "Say one light thing about it.",
   "If they reply, add one more line."
  ],
  "say": "“Everyone in Toronto decided to shop at the same time.”",
  "why": "Shared situations make easy openers.",
  "watch": "Complaining. Keep it light.",
  "rec": "Voice note after."
 },
 "x8": {
  "steps": [
   "Notice an ingredient in their basket.",
   "Ask what they make with it.",
   "Listen and thank them."
  ],
  "say": "“What do you make with those? I never know what to do with them.”",
  "why": "People love sharing what they're good at.",
  "watch": "Judging what's in their cart.",
  "rec": "Voice note after with the tip."
 },
 "x9": {
  "steps": [
   "Spot someone with only a few items behind you.",
   "Offer to let them go first.",
   "Use the moment to start a short chat."
  ],
  "say": "“Go ahead, you've only got a couple of things.”",
  "why": "A small kindness opens the door to talking.",
  "watch": "Expecting something in return.",
  "rec": "Voice note after."
 },
 "x10": {
  "steps": [
   "Skip “how are you”.",
   "Ask something specific: their favourite thing in the store, how long the shift is.",
   "Listen and respond to what they say."
  ],
  "say": "“What's the best thing you've found in this store?”",
  "why": "Specific questions get real answers; “how are you” gets “good”.",
  "watch": "Holding up the line.",
  "rec": "Voice note after."
 },
 "x11": {
  "steps": [
   "Find equipment near someone.",
   "Ask if they're using it or how many sets they have left.",
   "Add one friendly line."
  ],
  "say": "“How many sets left? No rush.”",
  "why": "It's a normal gym question, and it gets you used to talking there.",
  "watch": "Interrupting mid-set.",
  "rec": "Voice note after."
 },
 "x12": {
  "steps": [
   "Pick someone who looks experienced and isn't mid-set.",
   "Ask for a spot or a quick form check.",
   "Thank them and use what they said."
  ],
  "say": "“Could you watch my form on this? I think my back's off.”",
  "why": "Asking for help builds instant rapport and shows trust.",
  "watch": "Asking during their set.",
  "rec": "Voice note after with what you learned."
 },
 "x13": {
  "steps": [
   "Notice something you genuinely respect: a lift, their consistency.",
   "Say it plainly between sets.",
   "Leave it there unless they want to chat."
  ],
  "say": "“Your squat form is really clean. How long did that take?”",
  "why": "Specific praise about effort lands well.",
  "watch": "Commenting on bodies. Stick to effort and skill.",
  "rec": "Voice note after."
 },
 "x14": {
  "steps": [
   "Pick a regular you've nodded to before.",
   "Ask about their routine or programme.",
   "Ask one follow-up and thank them."
  ],
  "say": "“I see you here every morning. What's your routine?”",
  "why": "Regulars are a ready-made community.",
  "watch": "Taking too much of their workout.",
  "rec": "Voice note after."
 },
 "x15": {
  "steps": [
   "Pick someone you've already chatted with.",
   "Suggest one specific session.",
   "Give an easy out."
  ],
  "say": "“Want to do legs together Thursday? Totally fine if not.”",
  "why": "A training partner turns a stranger into a friend.",
  "watch": "Inviting someone you've never spoken to.",
  "rec": "Voice note after."
 },
 "x16": {
  "steps": [
   "Think of a book you loved.",
   "Ask a bookseller what to read next based on it.",
   "Ask why they picked it."
  ],
  "say": "“I loved this one. What should I read next?”",
  "why": "Booksellers love this question, so it's an easy win.",
  "watch": "Saying “anything good?” with no detail.",
  "rec": "Voice note after."
 },
 "x17": {
  "steps": [
   "Stand in the same section as someone.",
   "Ask what they're looking for or what they like.",
   "Listen and share one of yours."
  ],
  "say": "“Do you read a lot of these? I'm trying to find a good one.”",
  "why": "Shared interests make strangers easy to talk to.",
  "watch": "Hovering. Ask, then give them space.",
  "rec": "Voice note after."
 },
 "x18": {
  "steps": [
   "Notice someone looking at a genre you know.",
   "Pick up a book you love and tell them why in two sentences.",
   "Hand it to them and step back."
  ],
  "say": "“If you like those, this one wrecked me in the best way.”",
  "why": "Giving a recommendation is generous and confident.",
  "watch": "Pushing. One recommendation, then leave it.",
  "rec": "Voice note after."
 },
 "x19": {
  "steps": [
   "Start with a question about a book they're holding.",
   "Share what you thought of a similar one.",
   "Keep it going with questions."
  ],
  "say": "“What did you think of the ending?”",
  "why": "Talking about ideas is good practice for deeper conversation.",
  "watch": "Spoilers.",
  "rec": "Voice note after."
 },
 "x20": {
  "steps": [
   "After a good chat, suggest one simple next step.",
   "Make it specific and easy to say no to.",
   "Swap contacts if they say yes."
  ],
  "say": "“Want to swap books when we're done and compare notes?”",
  "why": "Shared books make an easy reason to meet again.",
  "watch": "Being pushy if they hesitate.",
  "rec": "Voice note after."
 },
 "x21": {
  "steps": [
   "Wait until the dog comes over or is nearby.",
   "Ask the name, and the breed if you're curious.",
   "Say something nice about the dog."
  ],
  "say": "“What's her name? She's got so much energy.”",
  "why": "Dogs are the easiest social bridge there is.",
  "watch": "Petting without asking.",
  "rec": "Voice note after."
 },
 "x22": {
  "steps": [
   "Start with the dog's name.",
   "Ask about age, training or quirks.",
   "Listen and respond."
  ],
  "say": "“How old? He's so calm for a puppy.”",
  "why": "Owners love talking about their dogs.",
  "watch": "Giving unsolicited training advice.",
  "rec": "Voice note after."
 },
 "x23": {
  "steps": [
   "After chatting about the dogs, introduce yourself.",
   "Ask their name.",
   "Use it once before you leave."
  ],
  "say": "“I'm ___, by the way. We always talk dogs and never names.”",
  "why": "Moving from the dogs to the people is the real step.",
  "watch": "Forgetting it seconds later.",
  "rec": "Voice note after."
 },
 "x24": {
  "steps": [
   "Start from the dogs.",
   "Ask about the neighbourhood, their weekend or their work.",
   "Keep it going with follow-ups."
  ],
  "say": "“Do you live around here? Any good spots I should know about?”",
  "why": "Moving beyond the shared topic is what turns acquaintances into friends.",
  "watch": "Talking only about yourself.",
  "rec": "Voice note after."
 },
 "x25": {
  "steps": [
   "Pick someone you've chatted with more than once.",
   "Suggest a specific day and time.",
   "Swap numbers if they say yes."
  ],
  "say": "“Want to do the long loop together Saturday morning?”",
  "why": "Regular walks turn park chats into friendships.",
  "watch": "Being vague.",
  "rec": "Voice note after."
 },
 "x26": {
  "steps": [
   "Arrive ten minutes early.",
   "Introduce yourself to the host.",
   "Ask how the group started or what to expect."
  ],
  "say": "“Hi, I'm new. How did this group get started?”",
  "why": "Hosts know everyone and will introduce you.",
  "watch": "Arriving late and hiding at the back.",
  "rec": "Voice note after."
 },
 "x27": {
  "steps": [
   "Scan the room for someone alone.",
   "Walk over and introduce yourself.",
   "Ask what brought them there."
  ],
  "say": "“Hi, I'm ___. First time here?”",
  "why": "People alone are usually relieved when someone comes over.",
  "watch": "Hovering without speaking.",
  "rec": "Voice note after."
 },
 "x28": {
  "steps": [
   "Listen for something you're curious about.",
   "Raise your hand and ask clearly.",
   "Thank them for the answer."
  ],
  "say": "“Can you say more about how you got started?”",
  "why": "Speaking up once makes the rest of the night easier.",
  "watch": "Turning the question into a speech.",
  "rec": "Voice note after."
 },
 "x29": {
  "steps": [
   "Learn about two people separately.",
   "Bring them together and say why they should talk.",
   "Step back and let them talk."
  ],
  "say": "“Sam, meet Priya. You're both training for the marathon.”",
  "why": "Connectors are the most valued people in any room.",
  "watch": "Leaving them in an awkward silence.",
  "rec": "Voice note after."
 },
 "x30": {
  "steps": [
   "Wait until the event ends.",
   "Suggest something specific to a few people.",
   "Make it easy to join or skip."
  ],
  "say": "“A few of us are grabbing food after. Want to come?”",
  "why": "Whoever makes the plan becomes the centre of the group.",
  "watch": "Waiting for someone else to suggest it.",
  "rec": "Voice note after."
 },
 "x31": {
  "steps": [
   "Pick someone senior who isn't mid-conversation.",
   "Introduce yourself with your name and what you do.",
   "Ask one question about their work."
  ],
  "say": "“Hi, I'm ___. I work on the events side. What's keeping you busy this quarter?”",
  "why": "Seniors are people too, and most like being approached.",
  "watch": "Pitching yourself straight away.",
  "rec": "Voice note after."
 },
 "x32": {
  "steps": [
   "Skip “what do you do?”",
   "Ask what they're excited about at work right now.",
   "Ask a follow-up."
  ],
  "say": "“What are you working on that you're actually excited about?”",
  "why": "This question gets better answers than “what do you do”.",
  "watch": "Not listening to the answer.",
  "rec": "Voice note after."
 },
 "x33": {
  "steps": [
   "Pick a group with an open side.",
   "Stand at the edge and listen.",
   "Add one thing when there's a natural gap."
  ],
  "say": "“Mind if I join? I heard you mention the conference.”",
  "why": "Joining groups is the core networking skill.",
  "watch": "Taking over.",
  "rec": "Voice note after."
 },
 "x34": {
  "steps": [
   "Think of something specific they did well.",
   "Tell them what it was and why it mattered.",
   "Keep it short."
  ],
  "say": "“Your talk on onboarding was the clearest thing all day.”",
  "why": "Specific praise builds trust and gets remembered.",
  "watch": "Vague flattery.",
  "rec": "Voice note after."
 },
 "x35": {
  "steps": [
   "Note who you met and what you talked about.",
   "Message them the next day.",
   "Mention what you discussed and add one useful thing."
  ],
  "say": "“Great chatting yesterday. Here's the article I mentioned.”",
  "why": "Following up is where most networking is won or lost.",
  "watch": "A generic “nice to meet you”.",
  "rec": "Record a voice note reading your message first."
 },
 "x36": {
  "steps": [
   "Wait until it isn't busy.",
   "Ask what they'd recommend.",
   "Chat briefly and tip well."
  ],
  "say": "“What would you make if you could make anything?”",
  "why": "Bartenders are great to practise with: friendly and used to it.",
  "watch": "Talking during a rush.",
  "rec": "Voice note after."
 },
 "x37": {
  "steps": [
   "Notice something shared: the game, the music, the drink.",
   "Make one comment or ask one question.",
   "If they turn away, let it go."
  ],
  "say": "“Is this game as tense as it looks?”",
  "why": "A bar is a social place: people expect a little chat.",
  "watch": "Pushing when they're with friends.",
  "rec": "Voice note after."
 },
 "x38": {
  "steps": [
   "Find a group game or trivia night.",
   "Ask if they need another player.",
   "Be a good sport, win or lose."
  ],
  "say": "“Need a sixth? I'm useless at sports questions but good at music.”",
  "why": "Games give you a reason to talk without small talk.",
  "watch": "Being competitive in a mean way.",
  "rec": "Voice note after."
 },
 "x39": {
  "steps": [
   "Pick someone who seems open.",
   "Invite them to join you and your friends.",
   "Introduce them to everyone."
  ],
  "say": "“We've got room if you want to join us.”",
  "why": "Inviting is a high-status, generous move.",
  "watch": "Inviting someone who is clearly on a date.",
  "rec": "Voice note after."
 },
 "x40": {
  "steps": [
   "Only after a good conversation.",
   "Ask clearly, with a reason to meet again.",
   "Accept a no gracefully."
  ],
  "say": "“I liked talking to you. Can I get your number?”",
  "why": "Asking clearly is respectful and confident.",
  "watch": "Asking when they've had too much to drink.",
  "rec": "Voice note after."
 },
 "z1": {
  "steps": [
   "Pick someone in a café, park or bookstore.",
   "Ask for one book they'd recommend.",
   "Thank them."
  ],
  "say": "“Random question: what's one book you'd recommend?”",
  "why": "A small, friendly question with a real answer.",
  "watch": "Asking someone in a rush.",
  "rec": "Voice note after."
 },
 "z2": {
  "steps": [
   "Notice things people chose or did well.",
   "Say each one plainly.",
   "Move on."
  ],
  "say": "“That's a great jacket.”",
  "why": "Specific compliments make you and them feel good.",
  "watch": "Commenting on bodies.",
  "rec": "Voice note after each."
 },
 "z3": {
  "steps": [
   "Walk somewhere busy in the morning.",
   "Make eye contact.",
   "Say good morning."
  ],
  "say": "“Morning!”",
  "why": "Small greetings build the habit of speaking first.",
  "watch": "Mumbling.",
  "rec": "Voice note after with your count."
 },
 "z4": {
  "steps": [
   "Pick a friend.",
   "Call instead of texting.",
   "Ask one real question."
  ],
  "say": "“Thought I'd call instead. How are you really?”",
  "why": "Voice builds connection that text can't.",
  "watch": "Hanging up as soon as it's awkward.",
  "rec": "Voice note after."
 },
 "z5": {
  "steps": [
   "Pick a cashier, barista or coworker.",
   "Ask how their day is really going.",
   "Listen."
  ],
  "say": "“How's your day actually going?”",
  "why": "Showing real interest makes people light up.",
  "watch": "Not listening.",
  "rec": "Voice note after."
 },
 "z6": {
  "steps": [
   "Think of someone you see regularly.",
   "Introduce yourself and ask their name.",
   "Write it down."
  ],
  "say": "“I see you all the time and never asked your name.”",
  "why": "Names turn familiar faces into people you know.",
  "watch": "Forgetting it right away.",
  "rec": "Voice note after."
 },
 "z7": {
  "steps": [
   "Pick a friend.",
   "Record a voice note.",
   "Send it without re-recording."
  ],
  "say": "“Hey, this reminded me of you…”",
  "why": "Voice feels warmer and trains you to speak without editing.",
  "watch": "Re-recording five times.",
  "rec": "The voice note is the recording."
 },
 "z8": {
  "steps": [
   "Listen for something you're curious about.",
   "Ask it clearly.",
   "Thank them."
  ],
  "say": "“Could you say more about that?”",
  "why": "Speaking up once makes it easier next time.",
  "watch": "Waiting until the end.",
  "rec": "Voice note after."
 },
 "z9": {
  "steps": [
   "Walk somewhere busy.",
   "Make eye contact.",
   "Nod or smile."
  ],
  "say": "No words needed.",
  "why": "Eye contact is the first step of every interaction.",
  "watch": "Staring.",
  "rec": "Voice note after."
 },
 "z10": {
  "steps": [
   "Pick a moment from this week.",
   "Tell it in 30 seconds.",
   "Watch their reaction."
  ],
  "say": "“The funniest thing happened Tuesday…”",
  "why": "Short stories make you more interesting.",
  "watch": "Rambling.",
  "rec": "Voice note after."
 },
 "z11": {
  "steps": [
   "Remember something someone told you they were doing.",
   "Ask how it went.",
   "Listen."
  ],
  "say": "“How did the interview go?”",
  "why": "Remembering details makes people feel valued.",
  "watch": "Forgetting what they said.",
  "rec": "Voice note after."
 },
 "z12": {
  "steps": [
   "Think of something someone did for you.",
   "Thank them for exactly that.",
   "Say why it mattered."
  ],
  "say": "“Thanks for covering for me Friday. It saved my week.”",
  "why": "Specific thanks feels real.",
  "watch": "A generic thanks.",
  "rec": "Voice note after."
 },
 "z13": {
  "steps": [
   "Get into a lift or a queue.",
   "Say one light thing.",
   "Smile."
  ],
  "say": "“Long day?”",
  "why": "Being first breaks the silence for everyone.",
  "watch": "Overthinking it.",
  "rec": "Voice note after."
 },
 "z14": {
  "steps": [
   "Pick something small.",
   "Ask politely.",
   "Accept a no gracefully."
  ],
  "say": "“Any chance of a student discount? No worries if not.”",
  "why": "Asking for small things builds rejection resilience.",
  "watch": "Being entitled.",
  "rec": "Voice note after."
 },
 "z15": {
  "steps": [
   "Spot a neighbour.",
   "Introduce yourself.",
   "Ask how long they've lived there."
  ],
  "say": "“Hi, I'm ___ from 4B. I don't think we've met.”",
  "why": "Knowing your neighbours makes home feel safer and friendlier.",
  "watch": "Being awkward about the gap in time.",
  "rec": "Voice note after."
 },
 "z16": {
  "steps": [
   "Prop your phone at eye level.",
   "Talk about one thing from your day.",
   "Don't re-record."
  ],
  "say": "“Here's what happened today…”",
  "why": "Talking to camera builds presence.",
  "watch": "Re-recording.",
  "rec": "The video is the recording."
 },
 "z17": {
  "steps": [
   "Find a nice spot.",
   "Ask someone to take your photo.",
   "Thank them."
  ],
  "say": "“Would you mind taking a quick photo?”",
  "why": "Asking strangers for small favours builds confidence fast.",
  "watch": "Picking someone in a rush.",
  "rec": "Voice note after."
 },
 "z18": {
  "steps": [
   "Notice a jacket, shoes or accessory.",
   "Compliment it.",
   "Move on."
  ],
  "say": "“Love those shoes.”",
  "why": "Compliments on choices feel genuine.",
  "watch": "Commenting on bodies.",
  "rec": "Voice note after."
 },
 "z19": {
  "steps": [
   "Pick a friend or coworker.",
   "Ask what they're excited about.",
   "Listen and ask a follow-up."
  ],
  "say": "“What are you excited about right now?”",
  "why": "This question brings out energy and real stories.",
  "watch": "Making it about you.",
  "rec": "Voice note after."
 },
 "z20": {
  "steps": [
   "Find something funny in the moment.",
   "Say it lightly.",
   "Don't explain it."
  ],
  "say": "Any light observation.",
  "why": "Humour is one of the fastest ways to connect.",
  "watch": "Jokes at someone's expense.",
  "rec": "Voice note after."
 },
 "z21": {
  "steps": [
   "Think of someone you've drifted from.",
   "Send a short message.",
   "Mention something specific."
  ],
  "say": "“Saw something that reminded me of you. How are you?”",
  "why": "Reconnecting is easier than people think.",
  "watch": "Apologising for the silence.",
  "rec": "Record a voice note of your message first."
 }
};
export type Card = { id: string; u: { b?: string; k?: number; place?: number }; t: string; sit: string; flow: string[]; why: string; move: string };
export const CARDS: Card[] = [
 {
  "id": "c1",
  "u": {
   "b": "c",
   "k": 1
  },
  "t": "The first ten seconds",
  "sit": "Someone you don't know, and no obvious reason to talk.",
  "flow": [
   "Ask them something small and real: “Quick question, what's good here?”",
   "“Thanks. Is it always this busy?” One more line, then let it go if it stays short.",
   "Repeat their last few words as a question: “Every Saturday?” Then stay quiet and let them explain.",
   "Share something of the same size: “I'm usually here on weekdays. First time on a weekend.”",
   "“Enjoy it. Maybe see you around.” Leave while it's still easy."
  ],
  "why": "A small ask gives them an easy job and you an easy start. Research on talking to strangers keeps finding it goes better than people expect.",
  "move": "Hold a short chat"
 },
 {
  "id": "c2",
  "u": {
   "b": "c",
   "k": 2
  },
  "t": "Talking to someone who intimidates you",
  "sit": "Someone senior, attractive or well known, and you want to say something.",
  "flow": [
   "Lead with something specific and true: “That point you made about pricing was the best part of the night.”",
   "“What got you into it?” A short answer from them is normal. They get approached a lot.",
   "Name what you notice: “Sounds like you've been at this a long time.” Then listen.",
   "Be honest about where you are: “I'm newer to it. I'm working out where to start.”",
   "“Thanks for the time. I'll try that.” Short exits read as confident."
  ],
  "why": "The gap shrinks the moment you treat them like a person, not an audience. Specific beats flattering.",
  "move": "Talk to someone who intimidates you"
 },
 {
  "id": "c3",
  "u": {
   "b": "c",
   "k": 3
  },
  "t": "Saying the real thing",
  "sit": "You're nervous, and you'd normally hide it or keep your opinion to yourself.",
  "flow": [
   "Say it plainly: “Honestly? I'm a bit nervous. I don't usually do this.”",
   "If they just nod, move on: “Anyway, what brings you here?”",
   "If they relate: “Okay good, that makes two of us.” Shared nerves connect people fast.",
   "Add the opinion you'd normally keep: “I actually think the second talk was better, and here's why.”",
   "“Glad I said something.” Own it, don't apologise for it."
  ],
  "why": "Being seen, nerves included, is what makes connection possible. Admitting it usually makes people warmer, not cooler.",
  "move": "Admit you're nervous"
 },
 {
  "id": "t1",
  "u": {
   "b": "t",
   "k": 1
  },
  "t": "Small talk into a real talk",
  "sit": "You're stuck in “how are you, good, you?”",
  "flow": [
   "Ask it so it can't be answered with one word: “How's your week actually been?”",
   "If you get “fine”: “Fine-good or fine-tired?” It's light and it usually gets a real answer.",
   "Pick one detail and follow it: “Wait, you're moving? Where to?”",
   "Trade a detail of the same size: “I moved last year. The boxes nearly ended me.”",
   "Use their name on the way out: “Good luck with the move, Sam.”"
  ],
  "why": "Good conversations follow one thread instead of jumping topics. One real follow-up does more than five questions.",
  "move": "Ask one follow-up"
 },
 {
  "id": "t2",
  "u": {
   "b": "t",
   "k": 2
  },
  "t": "The second time you meet someone",
  "sit": "You've met them once before and they told you something.",
  "flow": [
   "Start with what they told you: “Hey, how did the interview go?”",
   "If it's brief: “Did you hear back yet?” Then let them steer.",
   "If they light up: “What part are you most excited about?”",
   "Share something parallel: “I've got a big one next week too.”",
   "Leave a reason to talk again: “Tell me how it lands.”"
  ],
  "why": "Remembering a detail tells people they matter. It's the fastest way to go from acquaintance to friend.",
  "move": "Remember them next time"
 },
 {
  "id": "t3",
  "u": {
   "b": "t",
   "k": 3
  },
  "t": "When someone asks “what's new?”",
  "sit": "You've got a moment to say more than “not much”.",
  "flow": [
   "Start in the middle of the action: “So I'm standing outside the office on Tuesday, holding two coffees…”",
   "If they look distracted, jump to the punchline in one line. Don't push the full version.",
   "If they lean in, slow down for the moment that changed something, then stop.",
   "Hand it back: “Has anything like that ever happened to you?”",
   "Close it cleanly: “Anyway, that was my week. How was yours?”"
  ],
  "why": "A story is about a moment of change, not a list of events. Start late and leave early.",
  "move": "Tell a story with a turn"
 },
 {
  "id": "q1",
  "u": {
   "b": "q",
   "k": 1
  },
  "t": "The warm hello",
  "sit": "You're meeting someone new and want to come across as warm and confident.",
  "flow": [
   "Eyebrow flash and a real smile as you say “Hi, I'm ___.” Hands where they can see them.",
   "If they're reserved, don't fill the space. Face them fully, nod slowly, and wait.",
   "If they open up, lean in slightly and give a slow triple nod when they finish a thought.",
   "When you share something, open your palms. It signals you're not hiding anything.",
   "Use their name and mean it: “Really good to meet you, Priya.”"
  ],
  "why": "People decide how warm and capable you are in the first few seconds, mostly from cues, not words.",
  "move": "Eyebrow flash hello"
 },
 {
  "id": "q2",
  "u": {
   "b": "q",
   "k": 2
  },
  "t": "Swapping the stock opener",
  "sit": "You're about to ask “so, what do you do?”",
  "flow": [
   "Ask something with energy in it instead: “Working on anything exciting lately?”",
   "If they shrug: “Anything you're looking forward to this month?”",
   "If they get animated, tilt your head slightly and let them run. Don't jump in with your own story yet.",
   "Then share yours: “I'm weirdly excited about a pottery class.” Small and real is fine.",
   "“That made my day, honestly.” Say it if it's true."
  ],
  "why": "Questions about excitement get better answers than questions about job titles, and people remember how you made them feel.",
  "move": "Swap the stock opener"
 },
 {
  "id": "q3",
  "u": {
   "b": "q",
   "k": 3
  },
  "t": "Being fully there",
  "sit": "Someone needs your attention and your phone is right there.",
  "flow": [
   "Put the phone away where they can see you do it: “I'm all yours. What's up?”",
   "If they stall, hold eye contact and wait three seconds. Most people fill the silence.",
   "If they open up: “Tell me more about that.” Then just listen.",
   "Say back one thing they said, in your words, before giving your view.",
   "Finish by summing up: “So the real problem is the deadline, not the client.”"
  ],
  "why": "Presence is rare enough that people notice it straight away. Putting the phone away is the cue.",
  "move": "Phone away the whole time"
 },
 {
  "id": "v1",
  "u": {
   "b": "v",
   "k": 1
  },
  "t": "Saying the line that matters",
  "sit": "There's one sentence you need people to hear.",
  "flow": [
   "Slow down, pause for a full second, then say it: “Here's the thing… I want to lead this.”",
   "If someone cuts in, stop. Let them finish, then say your line again, slower.",
   "If it lands, let your voice drop at the end. No rising, question-like tone.",
   "Give one reason, not three: “Because I've done it twice already.”",
   "Stop talking. The silence after the line is part of it."
  ],
  "why": "Pace, pause and pitch tell people what matters before the words do.",
  "move": "Pause before the point"
 },
 {
  "id": "v2",
  "u": {
   "b": "v",
   "k": 2
  },
  "t": "Answering on the spot",
  "sit": "Someone asks you a question you didn't prepare for.",
  "flow": [
   "Lead with the answer: “Short answer: yes.”",
   "If they want more: “Here's why,” and give one reason.",
   "If they push: give one concrete example.",
   "Check it landed: “Does that answer it?”",
   "Stop at three sentences. Don't keep talking to fill the space."
  ],
  "why": "Simple structures make you sound clear under pressure: answer, reason, example.",
  "move": "Answer in three sentences"
 },
 {
  "id": "v3",
  "u": {
   "b": "v",
   "k": 3
  },
  "t": "Telling it so it lands",
  "sit": "You're telling a story and want people to feel it.",
  "flow": [
   "Switch to present tense: “I'm standing at the door and my hands are shaking.”",
   "If attention drifts, speed up and cut a detail.",
   "If they're with you, drop your volume for the key line. Quiet pulls people in.",
   "Let them react before you move on.",
   "End on a line, not a trail-off: “And that's when I said yes.”"
  ],
  "why": "Your voice carries the feeling. Changing pace and volume does more than adding detail.",
  "move": "Relive the story, don't report it"
 },
 {
  "id": "s1",
  "u": {
   "b": "s",
   "k": 1
  },
  "t": "Finding out what they really want",
  "sit": "Someone mentions a problem you might help with.",
  "flow": [
   "Ask why now: “What made you start looking into this now?”",
   "If they're vague: “What happens if nothing changes?”",
   "If they open up, sum it up: “So you want X by spring because of Y. Is that right?”",
   "Share one relevant thing, briefly: “I helped a café with exactly that last month.”",
   "Offer a small next step: “Want me to send you one idea for that?”"
  ],
  "why": "People buy when they feel understood. Questions first, offer last.",
  "move": "Ask why now"
 },
 {
  "id": "s2",
  "u": {
   "b": "s",
   "k": 2
  },
  "t": "The 30-second pitch",
  "sit": "Someone asks what you do.",
  "flow": [
   "Problem first: “You know how cafés go quiet on Tuesdays? I fill them with dance nights.”",
   "If they're not interested: “Fair. Who do you know who deals with that?”",
   "If they ask how, give one proof: “Last month one place doubled its Tuesday crowd.”",
   "Turn it to them: “What's the quiet night where you are?”",
   "“Can I send you something on it?” Get one small yes."
  ],
  "why": "A pitch that starts with their problem gets listened to. One that starts with your job title doesn't.",
  "move": "Pitch yourself in thirty seconds"
 },
 {
  "id": "s3",
  "u": {
   "b": "s",
   "k": 3
  },
  "t": "When they say “it's too expensive”",
  "sit": "You've made an offer and price comes up.",
  "flow": [
   "Acknowledge it calmly: “Totally fair. Too expensive compared to what?”",
   "If they shut down: “If price weren't an issue, would you do it?”",
   "If they talk: “What would make it worth it for you?”",
   "Tie it back to their goal: “You said the quiet nights cost you about $2,000 a month.”",
   "Offer a way in: “Want to start with one night and see?”"
  ],
  "why": "Price objections are usually about value. Acknowledge, ask, then connect it to what they told you.",
  "move": "Acknowledge, associate, ask"
 },
 {
  "id": "pcafe",
  "u": {
   "place": 0
  },
  "t": "The familiar stranger",
  "sit": "You've seen the same person at the café a few times.",
  "flow": [
   "“Third time this week. Are you working on something big?”",
   "If it's a short answer: “What's it for?” Then let them get back to it if it stays short.",
   "If they open up, repeat their last few words back as a question and wait.",
   "Share something of the same size: “I'm here writing too. Mine's a grant application.”",
   "“I'm here most mornings. Tell me how the deadline goes.”"
  ],
  "why": "Seeing someone repeatedly makes a chat feel natural. You're turning a familiar face into a person you know.",
  "move": "Invite a regular to something"
 },
 {
  "id": "pgrocery",
  "u": {
   "place": 1
  },
  "t": "The checkout line",
  "sit": "You're waiting in line next to someone.",
  "flow": [
   "Comment on the shared moment: “Everyone in the city decided to shop at once.”",
   "If they just smile: “Have a good one.” That's a full rep.",
   "If they reply: “What are you making with those?”",
   "Share your plan: “I'm attempting curry for the first time.”",
   "“Enjoy the [whatever they're making].” Done."
  ],
  "why": "Shared situations are the easiest openers there are. Low stakes, quick exit.",
  "move": "Make a light comment in line"
 },
 {
  "id": "pgym",
  "u": {
   "place": 2
  },
  "t": "From nod to training partner",
  "sit": "There's a regular you always see at the gym.",
  "flow": [
   "“How many sets left? No rush.”",
   "If they keep it short, nod and let them train. Next time you'll say hi.",
   "If they chat: “Your form's really clean. How long have you been training?”",
   "Share what you're working on: “I'm trying to fix my deadlift.”",
   "“Want to train together Thursday? Totally fine if not.”"
  ],
  "why": "Regulars become friends through small, repeated contact. Every chat makes the next one easier.",
  "move": "Invite someone to train together"
 },
 {
  "id": "pbooks",
  "u": {
   "place": 3
  },
  "t": "The book recommendation",
  "sit": "You're in a bookstore near someone browsing.",
  "flow": [
   "“Is that one any good?”",
   "If they're unsure: “What's the best thing you've read this year?”",
   "If they love it, repeat back why: “The ending got you?” and let them talk.",
   "Recommend one in two sentences, and hand it to them.",
   "“Tell me what you think if you read it.”"
  ],
  "why": "Books give strangers something to talk about besides themselves, so it's easy to go deep.",
  "move": "Recommend a book to a stranger"
 },
 {
  "id": "pdogs",
  "u": {
   "place": 4
  },
  "t": "Dogs to names",
  "sit": "You're at the dog park and someone's dog comes over.",
  "flow": [
   "“What's her name?”",
   "If they're quiet, talk to the dog for a bit. That's allowed.",
   "If they chat: “How old? She's so calm.”",
   "Share something about you: your dog, or how long you've lived nearby.",
   "“I'm ___, by the way. We always learn the dogs' names first.”"
  ],
  "why": "Dogs make the opener easy. Learning the human's name is the real step.",
  "move": "Introduce yourself, not just the dog"
 },
 {
  "id": "pmeetup",
  "u": {
   "place": 5
  },
  "t": "Walking in alone",
  "sit": "You've arrived at a meetup and don't know anyone.",
  "flow": [
   "Find someone standing alone: “First time here too?”",
   "If they're shy: “What brought you?” Then ask about the answer.",
   "If they're chatty, introduce them to the next person who walks by.",
   "Share why you came: “I'm trying to meet more people since I moved.”",
   "“A few of us are getting food after. Come along.”"
  ],
  "why": "People alone are usually relieved when someone comes over. Whoever makes the plan becomes the centre of the group.",
  "move": "Introduce yourself to someone alone"
 },
 {
  "id": "pwork",
  "u": {
   "place": 6
  },
  "t": "Talking to the senior person",
  "sit": "You're at a work event, near someone senior.",
  "flow": [
   "“What's the most interesting problem on your plate right now?”",
   "If it's short: “What's been the best part of your week so far?”",
   "If they open up: “How did you land on that approach?”",
   "Connect it: “We're seeing something similar on the events side.”",
   "“Can I follow up with a question next week?”"
  ],
  "why": "Senior people get pitched constantly. Curiosity stands out.",
  "move": "Introduce yourself to someone senior"
 },
 {
  "id": "pbar",
  "u": {
   "place": 7
  },
  "t": "The bar conversation",
  "sit": "You're at a bar next to someone you'd like to talk to.",
  "flow": [
   "Comment on something shared: “Is this game as tense as it looks?”",
   "If they turn back to their friends, let it go. A clean exit is a win.",
   "If they engage: “What's your story? Are you from here?”",
   "Share something real about yourself, not a line.",
   "After a real conversation: “I liked talking to you. Can I get your number?” A no is a full answer."
  ],
  "why": "Bars are social places, so a little chat is expected. Respect and a clear ask beat clever lines.",
  "move": "Ask for a number after a real chat"
 }
];
export const STATS: { k: StatKey; name: string; c: string }[] = [{"k":"courage","name":"Courage","c":"#B0301C"},{"k":"warmth","name":"Warmth","c":"#9E2357"},{"k":"presence","name":"Presence","c":"#2A6B44"},{"k":"persuasion","name":"Persuasion","c":"#1E5C9E"}];
export const BRANCH_STATS: Record<string, StatKey[]> = {"c":["courage"],"t":["warmth"],"q":["presence","warmth"],"v":["presence"],"s":["persuasion"],"n":["persuasion","warmth"],"f":["persuasion","courage"],"m":["presence","courage"],"p":["courage","persuasion"],"k":["presence","courage"],"b":["persuasion", "presence"],"h":["presence", "courage"],"w":["presence", "warmth"],"g":["warmth", "presence"],"y":["courage", "warmth"],"a":["presence","courage"]};
