// Place actions tuned to each path. When a path is selected on Tonight, each place's
// five actions are swapped for that path's version. Lines keep the place's move id, so
// they count toward the place, and carry via: the path they were done for.
// A move is opened as "x3@h" (place move x3, Comedian version).
import { BY, type Move, type PathKey } from './moves';
import { PLACES } from './rpgData';

type Action = [string, string, string, string];
export const PLACE_PATH: Record<string, Record<string, Action[]>> = {
 "n": {
  "cafe": [
   [
    "Mirror the barista",
    "When the barista tells you something, repeat their last few words as a question and let them keep going.",
    "One mirror that gets them talking more.",
    "Two mirrors in one order."
   ],
   [
    "Label the rush",
    "Name what you notice out loud: “Seems like a busy morning.” Then pause.",
    "One label, then silence.",
    "Get a story out of it."
   ],
   [
    "Ask for a small extra",
    "Ask for something small and reasonable, like an extra shot or a different cup, with a “How am I supposed to…?” style question.",
    "One calibrated ask.",
    "Get it without paying more."
   ],
   [
    "Use “That’s right”",
    "When someone shares a gripe, sum it up so well they say “that’s right”.",
    "One summary that earns a “that’s right”.",
    "Do it with a stranger, not staff."
   ],
   [
    "Negotiate a regular perk",
    "Ask the manager what it would take for regulars to get something, like a punch card or a quiet-hour discount.",
    "One real ask to the manager.",
    "Leave with a yes or a clear next step."
   ]
  ],
  "grocery": [
   [
    "Mirror in line",
    "When someone comments in line, mirror their last words and see where it goes.",
    "One mirror with a stranger.",
    "Keep it going for a minute."
   ],
   [
    "Ask “what would you do?”",
    "Ask staff how they would pick between two products. Let them think.",
    "One open how/what question.",
    "Get a tip you couldn’t read on the label."
   ],
   [
    "Ask for the markdown",
    "Ask if anything close to its date can be marked down.",
    "One ask about a markdown.",
    "Get a discount."
   ],
   [
    "Accusation audit at the counter",
    "Before a return or a fussy request, name what they might think: “This probably sounds annoying…”",
    "One accusation audit before an ask.",
    "Get the yes."
   ],
   [
    "Get a “no” first",
    "Ask a question built for “no”: “Would it be crazy to ask about…?”",
    "One no-oriented question.",
    "Turn it into what you wanted."
   ]
  ],
  "gym": [
   [
    "Label the wait",
    "When waiting for a machine, label it: “Looks like you’ve got a few sets left.”",
    "One label.",
    "Work out a share without asking directly."
   ],
   [
    "Mirror a regular",
    "Ask a regular about their routine and mirror their answers.",
    "One routine chat with mirrors.",
    "Learn one thing you’ll use."
   ],
   [
    "Calibrated question to staff",
    "Ask staff a “how” question about something you want, like a free class or a guest pass.",
    "One how/what question.",
    "Get something you didn’t have."
   ],
   [
    "Negotiate your membership",
    "Ask the front desk what flexibility exists on your plan, price or freeze options.",
    "One real negotiation.",
    "Leave with a better deal."
   ],
   [
    "Late-night FM DJ voice",
    "Ask for something firm in the slow, calm voice Voss teaches.",
    "One ask in the calm voice.",
    "Record yourself practising it first."
   ]
  ],
  "books": [
   [
    "Mirror the bookseller",
    "Ask for a pick and mirror their reason.",
    "One mirror.",
    "Get a second pick out of it."
   ],
   [
    "Label a browser’s hesitation",
    "When someone is torn between books, label it: “Seems like a tough call.”",
    "One label to a stranger.",
    "Help them decide."
   ],
   [
    "Ask what it would take",
    "Ask staff what it would take to order in a book you want, or hold one.",
    "One how/what ask.",
    "Get it held or ordered."
   ],
   [
    "Bundle ask",
    "Buying more than one? Ask if there’s any flexibility.",
    "One bundle ask.",
    "Get a discount or a freebie."
   ],
   [
    "Summarise their taste",
    "Ask someone what they love reading and sum it up back until they say “that’s right”.",
    "One “that’s right”.",
    "Then recommend a book that fits."
   ]
  ],
  "dogs": [
   [
    "Mirror the owner",
    "Ask about the dog and mirror the answer.",
    "One mirror.",
    "Three in one chat."
   ],
   [
    "Label the chaos",
    "When dogs get rowdy, label it lightly: “Sounds like they’re having the best day.”",
    "One label.",
    "Get a laugh."
   ],
   [
    "Negotiate a swap",
    "Agree a small trade with another owner, like a ball for a treat, or who throws next.",
    "One small trade.",
    "Make it a running joke."
   ],
   [
    "Defuse a tense moment",
    "When an owner is stressed about their dog, label their worry before anything else.",
    "One calm label in a tense moment.",
    "They visibly relax."
   ],
   [
    "Set up a walk with a “no” question",
    "“Would it be a bad idea to walk the dogs together sometime?”",
    "One no-oriented invite.",
    "Agree a time."
   ]
  ],
  "meetup": [
   [
    "Mirror the host",
    "Ask the host why they started it and mirror the answer.",
    "One mirror.",
    "Learn something you can use."
   ],
   [
    "Label the room",
    "Name the vibe to someone: “Seems like everyone’s a bit new here.”",
    "One label.",
    "It starts a real conversation."
   ],
   [
    "Calibrated question out loud",
    "Ask the group a how/what question that opens discussion.",
    "One question asked out loud.",
    "Others build on it."
   ],
   [
    "Settle a group decision",
    "When the group can’t decide something, sum up each side and propose a way forward.",
    "One group decision settled.",
    "Everyone agrees."
   ],
   [
    "Negotiate a role",
    "Ask the host what it would take to help run a part of it.",
    "One ask for a role.",
    "Get the role."
   ]
  ],
  "work": [
   [
    "Mirror a senior person",
    "In a chat with someone senior, mirror their key point.",
    "One mirror.",
    "They tell you something new."
   ],
   [
    "Label a colleague’s stress",
    "Label what you see: “Sounds like this week has been a lot.”",
    "One label.",
    "Earn a “that’s right”."
   ],
   [
    "Ask a calibrated question in a meeting",
    "Ask “How would we know this worked?” or “What’s the biggest risk here?”",
    "One question in a meeting.",
    "It changes the plan."
   ],
   [
    "Accusation audit before an ask",
    "Before a big ask, name their likely objections first.",
    "One audit plus the ask.",
    "Get the yes."
   ],
   [
    "Negotiate something real",
    "Negotiate a deadline, a budget, a day off or your pay using the methods from this path.",
    "One real negotiation.",
    "A better outcome than you’d have asked for."
   ]
  ],
  "bar": [
   [
    "Mirror the bartender",
    "Ask what they’d drink and mirror their answer.",
    "One mirror.",
    "Get a story."
   ],
   [
    "Label the night",
    "To the person next to you: “Seems like a celebration over there.”",
    "One label.",
    "A real chat comes of it."
   ],
   [
    "Ask for a sample",
    "Ask to taste something before you order, with a how/what question.",
    "One ask.",
    "Get the sample."
   ],
   [
    "Talk a group into a plan",
    "Help a group agree on the next spot or game by summing up what each wants.",
    "One group plan agreed.",
    "It was your idea that stuck."
   ],
   [
    "Negotiate the table",
    "When it’s packed, negotiate sharing a table with a group.",
    "One table negotiated.",
    "You end up hanging out with them."
   ]
  ]
 },
 "f": {
  "cafe": [
   [
    "Ask the barista a customer question",
    "Ask what customers complain about most. Listen like it’s research.",
    "One problem question.",
    "Write down three things they said."
   ],
   [
    "Pitch your idea in one line",
    "Tell the person next to you what you’re building in one sentence. Watch their face.",
    "One line pitch.",
    "They ask a follow-up."
   ],
   [
    "Run a two-minute interview",
    "Ask a stranger about a problem your idea solves: how they handle it today.",
    "One mini interview.",
    "Three in one morning."
   ],
   [
    "Ask the owner about their business",
    "Ask the owner what they wish they knew when they started.",
    "One owner chat.",
    "Ask what tools they pay for."
   ],
   [
    "Sell something here",
    "Offer your product or a pre-order to someone who has the problem.",
    "One real offer.",
    "Someone says yes or pays."
   ]
  ],
  "grocery": [
   [
    "Watch the shelf",
    "Ask a shopper why they picked one brand over another.",
    "One why question.",
    "Three shoppers."
   ],
   [
    "Ask staff about returns",
    "Ask what people return most and why.",
    "One staff chat.",
    "Find a problem worth solving."
   ],
   [
    "Test a price",
    "Describe a product idea to a shopper and ask what they’d pay.",
    "One price test.",
    "Get a number, not “maybe”."
   ],
   [
    "Ask the manager what sells",
    "Ask what new products sell and which flop.",
    "One manager chat.",
    "Ask how to get on the shelf."
   ],
   [
    "Pitch a stocking",
    "Pitch a local product to a store manager, yours or one you’d represent.",
    "One pitch.",
    "Get a next step."
   ]
  ],
  "gym": [
   [
    "Ask about their goal",
    "Ask someone what they’re training for. Listen for the problem.",
    "One goal question.",
    "Three people."
   ],
   [
    "Interview a trainer",
    "Ask a trainer what clients struggle with most.",
    "One interview.",
    "Ask what they’d pay to fix it."
   ],
   [
    "Pitch in one line",
    "Tell someone what you’re building.",
    "One line.",
    "They want to know more."
   ],
   [
    "Run a feedback session",
    "Show someone your idea or prototype on your phone and ask what’s confusing.",
    "One feedback session.",
    "Change something because of it."
   ],
   [
    "Get a first user",
    "Ask someone to try your product this week.",
    "One person agrees to try it.",
    "They actually use it."
   ]
  ],
  "books": [
   [
    "Find the founder shelf",
    "Ask staff what business book people buy most and why.",
    "One chat.",
    "Buy it."
   ],
   [
    "Ask a reader a problem question",
    "Ask a browser about a problem in their work.",
    "One problem chat.",
    "Get their contact."
   ],
   [
    "Pitch to a stranger",
    "Pitch your idea to someone in the business section.",
    "One pitch.",
    "They give feedback you use."
   ],
   [
    "Talk to the owner about running it",
    "Ask how independent bookstores survive.",
    "One owner chat.",
    "Learn one thing about margins."
   ],
   [
    "Propose a collab",
    "Pitch the store an event or partnership with your project.",
    "One proposal.",
    "A yes or a follow-up meeting."
   ]
  ],
  "dogs": [
   [
    "Ask about a dog problem",
    "Ask an owner what’s hardest about having a dog.",
    "One problem chat.",
    "Three owners."
   ],
   [
    "Test an idea",
    "Float a product idea to an owner and ask if they’d use it.",
    "One idea test.",
    "They say how they’d use it."
   ],
   [
    "Ask what they pay for",
    "Ask what dog stuff they spend the most on.",
    "One spending chat.",
    "Find a gap."
   ],
   [
    "Pitch to a group",
    "Pitch your idea to two or three owners at once.",
    "One group pitch.",
    "They argue about it, good sign."
   ],
   [
    "Get a pre-order",
    "Ask someone to pay now for something you’ll deliver.",
    "One pre-order ask.",
    "Money changes hands."
   ]
  ],
  "meetup": [
   [
    "Introduce yourself as a founder",
    "Say “I’m building ___” instead of your job title.",
    "One intro.",
    "Five intros."
   ],
   [
    "Ask the host about the community",
    "Ask what members need that nobody offers.",
    "One chat.",
    "Find a problem."
   ],
   [
    "Get advice from someone ahead",
    "Find someone further along and ask one specific question.",
    "One question.",
    "They offer to help more."
   ],
   [
    "Demo out loud",
    "Show your project to a small group.",
    "One demo.",
    "Someone asks to try it."
   ],
   [
    "Recruit someone",
    "Ask someone to join, advise or help with your project.",
    "One ask.",
    "They say yes."
   ]
  ],
  "work": [
   [
    "Find an internal problem",
    "Ask a colleague what wastes the most time in their week.",
    "One problem chat.",
    "Three colleagues."
   ],
   [
    "Pitch an improvement",
    "Pitch a small fix to your team.",
    "One pitch.",
    "It gets tried."
   ],
   [
    "Ask a senior person for feedback",
    "Ask a leader to poke holes in your idea.",
    "One feedback ask.",
    "Fix what they found."
   ],
   [
    "Run a small pilot",
    "Get approval to test something new for two weeks.",
    "One pilot agreed.",
    "It works."
   ],
   [
    "Pitch a business case",
    "Present an idea with numbers to a decision maker.",
    "One business case.",
    "Get budget or a yes."
   ]
  ],
  "bar": [
   [
    "Ask the bartender about the business",
    "Ask what makes a good night for the bar.",
    "One chat.",
    "Learn their biggest problem."
   ],
   [
    "Pitch on a napkin",
    "Explain your idea on a napkin to someone.",
    "One napkin pitch.",
    "They take a photo of it."
   ],
   [
    "Find a co-founder vibe",
    "Ask someone what they’re building or want to build.",
    "One builder chat.",
    "Swap numbers."
   ],
   [
    "Handle a sceptic",
    "Pitch to someone who thinks it won’t work. Ask why.",
    "One sceptic chat.",
    "Learn their real objection."
   ],
   [
    "Close a first customer",
    "Turn a bar chat into a real customer conversation.",
    "One customer chat.",
    "A yes or a meeting booked."
   ]
  ]
 },
 "m": {
  "cafe": [
   [
    "Film your order",
    "Film a five-second clip of your drink being made and talk over it.",
    "One short clip.",
    "Post it."
   ],
   [
    "Talk to camera at the table",
    "Record thirty seconds to camera at your table, with people around.",
    "Thirty seconds.",
    "Don’t lower your voice."
   ],
   [
    "Review it on camera",
    "Review your drink or pastry in thirty seconds.",
    "One review.",
    "Make it funny."
   ],
   [
    "Ask to film the barista",
    "Ask the barista if you can film them making something for a post.",
    "One ask.",
    "Post it and tag the place."
   ],
   [
    "Interview a stranger",
    "Ask someone one question on camera, with their okay.",
    "One street interview.",
    "Three in one sitting."
   ]
  ],
  "grocery": [
   [
    "Film a find",
    "Film something weird or new on the shelf and react.",
    "One clip.",
    "Post it."
   ],
   [
    "Talk to camera in an aisle",
    "Record twenty seconds to camera in an aisle.",
    "Twenty seconds.",
    "With people nearby."
   ],
   [
    "Make a “$20 dinner” video",
    "Film yourself shopping for a meal on a budget, talking through it.",
    "One video.",
    "Cook it and film part two."
   ],
   [
    "Ask a shopper for a tip on camera",
    "Ask someone their best grocery tip on camera, with their okay.",
    "One clip.",
    "Post it."
   ],
   [
    "Film a full piece in store",
    "Record a complete one-minute video in the store, hook to ending.",
    "One full video.",
    "Post it."
   ]
  ],
  "gym": [
   [
    "Film a set",
    "Film one of your sets and add a voice-over later.",
    "One clip.",
    "Talk over it live instead."
   ],
   [
    "Talk between sets",
    "Record twenty seconds to camera between sets.",
    "Twenty seconds.",
    "With people around."
   ],
   [
    "Teach one tip",
    "Film yourself teaching one exercise tip.",
    "One tip video.",
    "Post it."
   ],
   [
    "Collab with a regular",
    "Ask a regular to show their favourite move on camera.",
    "One collab clip.",
    "Post and tag them."
   ],
   [
    "Film a day-in-the-gym",
    "Film a full workout story in one minute.",
    "One video.",
    "Post it."
   ]
  ],
  "books": [
   [
    "Film a shelf pick",
    "Film a book you’d recommend and say why in ten seconds.",
    "One clip.",
    "Post it."
   ],
   [
    "Talk to camera between shelves",
    "Record thirty seconds to camera.",
    "Thirty seconds.",
    "Without whispering."
   ],
   [
    "Ask staff for a pick on camera",
    "Ask a bookseller to recommend a book on camera.",
    "One clip.",
    "Post and tag the shop."
   ],
   [
    "Book haul video",
    "Film what you bought and why.",
    "One video.",
    "Make it a series."
   ],
   [
    "Run a mini interview",
    "Ask a reader what they’re reading, on camera.",
    "One interview.",
    "Three readers."
   ]
  ],
  "dogs": [
   [
    "Film the dogs",
    "Film a funny dog moment and add a caption.",
    "One clip.",
    "Post it."
   ],
   [
    "Narrate the park",
    "Narrate the dog park like a nature documentary.",
    "Thirty seconds.",
    "Post it."
   ],
   [
    "Interview an owner",
    "Ask an owner about their dog on camera, with their okay.",
    "One interview.",
    "Post and tag them."
   ],
   [
    "Dog of the day",
    "Start a “dog of the day” series.",
    "One episode.",
    "Three episodes."
   ],
   [
    "Collab with a dog account",
    "Find an owner with a dog account and film together.",
    "One collab.",
    "Both of you post it."
   ]
  ],
  "meetup": [
   [
    "Film the setup",
    "Film the room before it starts and say what it is.",
    "One clip.",
    "Post it."
   ],
   [
    "Interview the host",
    "Ask the host why they run it, on camera.",
    "One interview.",
    "Post and tag them."
   ],
   [
    "Recap it",
    "Record a thirty-second recap after.",
    "One recap.",
    "Post it."
   ],
   [
    "Get three voices",
    "Ask three attendees one question on camera.",
    "Three answers.",
    "Edit them together."
   ],
   [
    "Become the event’s camera",
    "Offer to make the official recap video.",
    "One offer.",
    "They share it."
   ]
  ],
  "work": [
   [
    "Film your workspace",
    "Film your desk or space with a voice-over about your day.",
    "One clip.",
    "Post it if allowed."
   ],
   [
    "Explain your job",
    "Explain what you do in thirty seconds to camera.",
    "One video.",
    "Make a stranger get it."
   ],
   [
    "Teach a work skill",
    "Teach one skill from your job on camera.",
    "One tip video.",
    "Post it."
   ],
   [
    "Interview a colleague",
    "Ask a colleague about their career on camera.",
    "One interview.",
    "Post it with their okay."
   ],
   [
    "Film the event",
    "Make a short recap of a work event.",
    "One recap.",
    "The company shares it."
   ]
  ],
  "bar": [
   [
    "Film the drink",
    "Film a drink being made with a five-second hook.",
    "One clip.",
    "Post it."
   ],
   [
    "Talk to camera at the bar",
    "Record twenty seconds to camera, out loud.",
    "Twenty seconds.",
    "With people around."
   ],
   [
    "Ask the bartender for a story",
    "Ask for their best bar story, on camera.",
    "One story clip.",
    "Post it."
   ],
   [
    "Film a game night",
    "Film trivia or a game with your table.",
    "One clip.",
    "Post it."
   ],
   [
    "Make a “night out” video",
    "Film a full night-out story in one minute.",
    "One video.",
    "Post it."
   ]
  ]
 },
 "p": {
  "cafe": [
   [
    "Find a decision maker",
    "Ask who owns or manages the place.",
    "One ask.",
    "Get their name and best time."
   ],
   [
    "Give your 10-second intro",
    "Tell the owner who you are and who you help.",
    "One intro.",
    "They ask a question."
   ],
   [
    "Leave a card the right way",
    "Leave your card with a specific reason to call.",
    "One card, one reason.",
    "They call."
   ],
   [
    "Ask a qualifying question",
    "Ask the owner one question that tells you if they need what you sell.",
    "One question.",
    "Three businesses."
   ],
   [
    "Book a meeting",
    "Ask for fifteen minutes this week.",
    "One ask.",
    "Booked."
   ]
  ],
  "grocery": [
   [
    "Find the manager",
    "Ask for the manager by name and time.",
    "One ask.",
    "Meet them."
   ],
   [
    "Walk-in intro",
    "Give a short intro to a department lead.",
    "One intro.",
    "They take your info."
   ],
   [
    "Ask about their supplier",
    "Ask who they buy from and what annoys them.",
    "One chat.",
    "Find an opening."
   ],
   [
    "Handle the brush-off",
    "When they say “not now”, ask when would be better.",
    "One brush-off handled.",
    "Get a time."
   ],
   [
    "Follow up in person",
    "Come back when you said you would.",
    "One follow-up.",
    "Get to a real conversation."
   ]
  ],
  "gym": [
   [
    "Ask the front desk who decides",
    "Find out who buys things for the gym.",
    "One ask.",
    "Get a name."
   ],
   [
    "Pitch the owner briefly",
    "Thirty seconds on what you offer.",
    "One pitch.",
    "They ask for more."
   ],
   [
    "Ask a trainer for an intro",
    "Ask a trainer to introduce you to the owner.",
    "One ask.",
    "Introduced."
   ],
   [
    "Handle an objection",
    "When they push back, ask what’s behind it.",
    "One objection handled.",
    "The conversation keeps going."
   ],
   [
    "Close a trial",
    "Offer a free trial or demo with a clear next step.",
    "One trial offered.",
    "Accepted."
   ]
  ],
  "books": [
   [
    "Ask who runs events",
    "Find out who books events at the store.",
    "One ask.",
    "Get their contact."
   ],
   [
    "Pitch an event",
    "Pitch a talk, workshop or signing.",
    "One pitch.",
    "They consider it."
   ],
   [
    "Bring proof",
    "Show something that proves you’d bring people.",
    "One proof shown.",
    "They’re convinced."
   ],
   [
    "Ask for the date",
    "Ask for a date on the calendar.",
    "One ask.",
    "Booked."
   ],
   [
    "Prospect a reader",
    "Talk to a browser who might be a customer.",
    "One prospect chat.",
    "Swap contacts."
   ]
  ],
  "dogs": [
   [
    "Find business owners",
    "Ask owners what they do for work.",
    "One chat.",
    "Find a prospect."
   ],
   [
    "Earn the right to pitch",
    "Talk dogs first, then ask about their work.",
    "One natural turn.",
    "They ask what you do."
   ],
   [
    "Soft pitch",
    "Explain what you do in one line.",
    "One line.",
    "They want to know more."
   ],
   [
    "Get a referral",
    "Ask if they know someone who needs what you do.",
    "One referral ask.",
    "A name."
   ],
   [
    "Book a call",
    "Ask for a call this week.",
    "One ask.",
    "Booked."
   ]
  ],
  "meetup": [
   [
    "Scan for prospects",
    "Talk to three people and find one who could be a customer.",
    "Three chats.",
    "One real prospect."
   ],
   [
    "Ask what they’re working on",
    "Lead with their goals, not your pitch.",
    "One chat.",
    "Find a need."
   ],
   [
    "Pitch to a fit",
    "Pitch only to the person who has the need.",
    "One pitch.",
    "They ask how it works."
   ],
   [
    "Get a follow-up on the spot",
    "Put a follow-up in your calendars before you leave.",
    "One booked follow-up.",
    "Two."
   ],
   [
    "Close at the event",
    "Make an offer if it’s a clear fit.",
    "One offer.",
    "A yes."
   ]
  ],
  "work": [
   [
    "Find an internal buyer",
    "Find who decides on something you want to sell inside.",
    "One name.",
    "Meet them."
   ],
   [
    "Warm intro",
    "Ask a colleague to introduce you.",
    "One ask.",
    "Introduced."
   ],
   [
    "Discovery chat",
    "Ask about their goals before pitching.",
    "One chat.",
    "Find the problem."
   ],
   [
    "Handle “send me an email”",
    "Ask what would make the email worth reading.",
    "One handled.",
    "A meeting instead."
   ],
   [
    "Close a deal",
    "Get a yes on something you pitched.",
    "One yes.",
    "In writing."
   ]
  ],
  "bar": [
   [
    "Ask the bartender who owns it",
    "Find out who to talk to.",
    "One ask.",
    "Their name and best time."
   ],
   [
    "Talk shop with a stranger",
    "Ask someone what their business is.",
    "One chat.",
    "Find a prospect."
   ],
   [
    "Pitch in a sentence",
    "One line on what you do.",
    "One line.",
    "They ask more."
   ],
   [
    "Handle a no gracefully",
    "Take a no, ask one question, leave warm.",
    "One no handled.",
    "They refer someone."
   ],
   [
    "Set the meeting",
    "Turn a bar chat into a meeting.",
    "One ask.",
    "Booked."
   ]
  ]
 },
 "k": {
  "cafe": [
   [
    "Order with a full voice",
    "Order clearly at full volume, standing tall.",
    "One order.",
    "Make eye contact the whole time."
   ],
   [
    "Tell a story at the table",
    "Tell a friend a two-minute story like it’s a talk: opening, point, ending.",
    "One story.",
    "Record it."
   ],
   [
    "Practise your opening",
    "Say the first line of a talk out loud at your table.",
    "One opening, out loud.",
    "Three times, better each time."
   ],
   [
    "Speak to a small group",
    "Share an idea with three or more people at once.",
    "One group moment.",
    "They ask a question."
   ],
   [
    "Give a toast",
    "Toast someone at a café meetup.",
    "One toast.",
    "Get a clap."
   ]
  ],
  "grocery": [
   [
    "Speak up in line",
    "Make a comment at a normal speaking volume, not a mumble.",
    "One clear comment.",
    "It starts a chat."
   ],
   [
    "Ask clearly across the aisle",
    "Ask staff a question from a few metres away.",
    "One projected question.",
    "No repeats needed."
   ],
   [
    "Practise pauses",
    "Rehearse your talk’s key line in your head in line, then say it out loud in the car.",
    "One practised line.",
    "Record it."
   ],
   [
    "Explain a recipe",
    "Explain a recipe to a shopper clearly in thirty seconds.",
    "One explanation.",
    "They thank you."
   ],
   [
    "Hold attention",
    "Tell a cashier a short story with a clear ending.",
    "One story.",
    "They laugh or react."
   ]
  ],
  "gym": [
   [
    "Count out loud",
    "Count your reps out loud with a strong voice.",
    "One set.",
    "Lead a friend’s set."
   ],
   [
    "Explain an exercise",
    "Explain a move to someone clearly.",
    "One explanation.",
    "They do it right."
   ],
   [
    "Lead a warm-up",
    "Lead a friend or two through a warm-up.",
    "One warm-up.",
    "Strangers join."
   ],
   [
    "Coach out loud",
    "Coach someone through a set with clear cues.",
    "One set coached.",
    "They hit it."
   ],
   [
    "Teach a mini class",
    "Teach a five-minute session to a few people.",
    "One mini class.",
    "Record it."
   ]
  ],
  "books": [
   [
    "Read a passage aloud",
    "Read a short passage to a friend with pauses and emphasis.",
    "One passage.",
    "Record it."
   ],
   [
    "Pitch a book",
    "Pitch a book to someone in sixty seconds like a talk.",
    "One pitch.",
    "They buy or note it."
   ],
   [
    "Ask about readings",
    "Ask staff about open readings or talks.",
    "One ask.",
    "Sign up."
   ],
   [
    "Lead a book chat",
    "Get two or more people talking about a book you started.",
    "One chat led.",
    "Five minutes."
   ],
   [
    "Give a reading",
    "Read or speak at a bookstore event.",
    "One reading.",
    "Record it."
   ]
  ],
  "dogs": [
   [
    "Call your dog with presence",
    "Use a calm, low, confident voice.",
    "One call.",
    "The dog listens."
   ],
   [
    "Tell a dog story",
    "Tell owners a short story with a clear point.",
    "One story.",
    "They laugh."
   ],
   [
    "Speak to a group of owners",
    "Share a tip with a group at once.",
    "One group tip.",
    "They ask follow-ups."
   ],
   [
    "Organise a meet-up out loud",
    "Announce a time for the group to meet again.",
    "One announcement.",
    "People show up."
   ],
   [
    "Give a mini talk",
    "Give a two-minute talk about something you know.",
    "One mini talk.",
    "Record it."
   ]
  ],
  "meetup": [
   [
    "Introduce yourself to the room",
    "When intros happen, do yours slowly and clearly.",
    "One intro.",
    "Add a story."
   ],
   [
    "Ask a question with presence",
    "Stand or sit tall and ask a question out loud.",
    "One question.",
    "No filler words."
   ],
   [
    "Share for two minutes",
    "Speak for two minutes when there’s a chance.",
    "Two minutes.",
    "Record it."
   ],
   [
    "Volunteer to present",
    "Ask the host for a speaking slot.",
    "One ask.",
    "Booked."
   ],
   [
    "Give a talk",
    "Give a five-minute talk at the meetup.",
    "Five minutes.",
    "Record it."
   ]
  ],
  "work": [
   [
    "Speak first in a meeting",
    "Say something in the first five minutes.",
    "One early contribution.",
    "Three meetings in a row."
   ],
   [
    "Present one slide",
    "Present one slide or update with no notes.",
    "One update.",
    "Under one minute."
   ],
   [
    "Tell a story in a meeting",
    "Make a point with a short story.",
    "One story.",
    "People mention it after."
   ],
   [
    "Run a meeting",
    "Run a meeting start to finish.",
    "One meeting.",
    "It ends early."
   ],
   [
    "Present to leadership",
    "Present to senior people.",
    "One presentation.",
    "Record a rehearsal."
   ]
  ],
  "bar": [
   [
    "Order over the noise",
    "Order clearly over a loud room.",
    "One order.",
    "First try."
   ],
   [
    "Tell a story to the table",
    "Hold the table for a two-minute story.",
    "One story.",
    "Nobody checks their phone."
   ],
   [
    "Give a toast",
    "Stand and toast the table.",
    "One toast.",
    "The whole table raises a glass."
   ],
   [
    "Host trivia questions",
    "Read questions or host a round for your table.",
    "One round.",
    "For the whole bar."
   ],
   [
    "Open mic or speech night",
    "Speak at an open mic or speech night.",
    "One time on the mic.",
    "Record it."
   ]
  ]
 },
 "b": {
  "cafe": [
   [
    "Say who you help, out loud",
    "Tell the barista or someone nearby who you help and how, in one line.",
    "One line.",
    "They ask a follow-up."
   ],
   [
    "Film a proof clip here",
    "Record a short proof video at your table.",
    "One clip.",
    "Post it."
   ],
   [
    "Answer a question on camera",
    "Answer a question you get asked, filmed here.",
    "One answer.",
    "Post it."
   ],
   [
    "Talk to a potential client",
    "Ask someone about the problem you solve.",
    "One chat.",
    "They follow you."
   ],
   [
    "Take a call from here",
    "Run a discovery call from the café.",
    "One call.",
    "It ends in an offer."
   ]
  ],
  "grocery": [
   [
    "Spot content",
    "Find something here that relates to what you teach and film it.",
    "One clip.",
    "Post it."
   ],
   [
    "Teach in the aisle",
    "Teach one tip in an aisle on camera.",
    "One tip.",
    "Post it."
   ],
   [
    "Ask a shopper a problem question",
    "Ask a shopper about a problem you solve.",
    "One chat.",
    "Get their handle."
   ],
   [
    "Batch three ideas",
    "Film three short ideas here.",
    "Three clips.",
    "Five."
   ],
   [
    "Invite to a call",
    "Invite someone you met to a short call.",
    "One invite.",
    "Booked."
   ]
  ],
  "gym": [
   [
    "Film your proof",
    "Film a progress or result clip.",
    "One clip.",
    "Post it."
   ],
   [
    "Teach a regular",
    "Help someone and ask if you can post it.",
    "One clip.",
    "Post it."
   ],
   [
    "Ask the problem question",
    "Ask someone what’s held their training back.",
    "One chat.",
    "They follow you."
   ],
   [
    "Get a testimonial",
    "Ask someone you helped for thirty seconds on camera.",
    "One ask.",
    "Post it."
   ],
   [
    "Land a client here",
    "Turn a gym chat into a paid client.",
    "One offer.",
    "A yes."
   ]
  ],
  "books": [
   [
    "Film a recommendation",
    "Recommend a book that relates to what you teach.",
    "One clip.",
    "Post it."
   ],
   [
    "Answer a question with a book",
    "Answer a common question using a book’s idea, on camera.",
    "One clip.",
    "Post it."
   ],
   [
    "Talk to a reader",
    "Ask a browser about their goals.",
    "One chat.",
    "Swap handles."
   ],
   [
    "Comment-keyword video",
    "Film a video with a comment keyword at the end.",
    "One video.",
    "Reply to everyone."
   ],
   [
    "Pitch an event",
    "Pitch the store a free workshop.",
    "One pitch.",
    "A date."
   ]
  ],
  "dogs": [
   [
    "Say what you do",
    "Tell an owner who you help.",
    "One line.",
    "They ask more."
   ],
   [
    "Film a quick tip",
    "Film a tip with the park behind you.",
    "One clip.",
    "Post it."
   ],
   [
    "Ask the problem question",
    "Ask about their goals or struggles.",
    "One chat.",
    "Get their handle."
   ],
   [
    "Voice-note follow-up",
    "Follow up with someone by voice note.",
    "One voice note.",
    "They reply."
   ],
   [
    "Invite to a call",
    "Invite someone to a call.",
    "One invite.",
    "Booked."
   ]
  ],
  "meetup": [
   [
    "Introduce yourself by who you help",
    "Lead with who you help, not your title.",
    "One intro.",
    "Five."
   ],
   [
    "Film a recap with a lesson",
    "Record what you learned at the event.",
    "One recap.",
    "Post it."
   ],
   [
    "Start ten conversations",
    "Talk to ten people about what they want.",
    "Ten chats.",
    "Twenty."
   ],
   [
    "Share a proof story",
    "Tell a client result story to a small group.",
    "One story.",
    "Someone asks to talk."
   ],
   [
    "Book a call on the spot",
    "Book a call with someone before you leave.",
    "One booked.",
    "Two."
   ]
  ],
  "work": [
   [
    "Share a lesson post",
    "Post a lesson from your work.",
    "One post.",
    "Get a comment from a colleague."
   ],
   [
    "Film a skill",
    "Teach a work skill on camera.",
    "One clip.",
    "Post it."
   ],
   [
    "Ask for a testimonial",
    "Ask a colleague or client for a short testimonial.",
    "One ask.",
    "Post it."
   ],
   [
    "Find a client internally",
    "Find someone at work who needs your side offer.",
    "One chat.",
    "Interest."
   ],
   [
    "Run a call",
    "Run a discovery call.",
    "One call.",
    "Make an offer."
   ]
  ],
  "bar": [
   [
    "Say what you do in a line",
    "Answer “what do you do?” with who you help.",
    "One line.",
    "They lean in."
   ],
   [
    "Tell a proof story",
    "Tell a client story to the table.",
    "One story.",
    "Someone asks for your handle."
   ],
   [
    "Film a quick take",
    "Film a thirty-second take on a topic in your space.",
    "One clip.",
    "Post it."
   ],
   [
    "Ask the problem question",
    "Ask someone what’s in their way.",
    "One chat.",
    "They follow you."
   ],
   [
    "Book a call",
    "Turn a bar chat into a booked call.",
    "One ask.",
    "Booked."
   ]
  ]
 },
 "h": {
  "cafe": [
   [
    "Make the barista laugh",
    "Make one light joke while you order.",
    "One joke.",
    "They laugh."
   ],
   [
    "Commit to a bit with your order",
    "Order in a silly committed way, like a toast to your croissant.",
    "One bit.",
    "They play along."
   ],
   [
    "Be the joke",
    "Tell someone at the next table a quick self-own.",
    "One self-own.",
    "They laugh."
   ],
   [
    "Riff with a stranger",
    "Yes-and something someone says.",
    "One riff.",
    "Keep it going a minute."
   ],
   [
    "Do a tight one at the table",
    "Do one minute of material for friends at the café.",
    "One minute.",
    "Record it."
   ]
  ],
  "grocery": [
   [
    "Joke about the line",
    "Make one observation joke in line.",
    "One joke.",
    "Someone laughs."
   ],
   [
    "Commit to a fake expert bit",
    "Act like a produce sommelier for a friend.",
    "One bit.",
    "Hold it a full minute."
   ],
   [
    "Write jokes from the aisles",
    "Write five jokes from what you see.",
    "Five jokes.",
    "Record the best."
   ],
   [
    "Play with a cashier",
    "Riff with the cashier about your weird basket.",
    "One riff.",
    "They join in."
   ],
   [
    "Record a bit in the car",
    "Record your best grocery bit in the parking lot.",
    "One take.",
    "Post it."
   ]
  ],
  "gym": [
   [
    "Joke between sets",
    "Make one light joke with a gym buddy.",
    "One joke.",
    "They laugh."
   ],
   [
    "Narrate your set",
    "Narrate your set like a sports commentator.",
    "One set.",
    "Record it."
   ],
   [
    "Be the joke",
    "Joke about your own form or strength.",
    "One self-own.",
    "Someone joins in."
   ],
   [
    "Write the gym bit",
    "Write five jokes about gym culture.",
    "Five jokes.",
    "Record the best three."
   ],
   [
    "Perform it for friends",
    "Do your gym bit for friends.",
    "One set.",
    "Record it."
   ]
  ],
  "books": [
   [
    "Make staff laugh",
    "Ask for a book in a funny, specific way.",
    "One ask.",
    "They laugh."
   ],
   [
    "Commit to a bit",
    "Read a dramatic blurb out loud to a friend.",
    "One reading.",
    "Hold it."
   ],
   [
    "Find a premise",
    "Find a ridiculous title and write three jokes.",
    "Three jokes.",
    "Record them."
   ],
   [
    "Riff with a browser",
    "Yes-and a stranger’s book comment.",
    "One riff.",
    "Keep it going."
   ],
   [
    "Do a funny book review",
    "Record a sixty-second funny review.",
    "One review.",
    "Post it."
   ]
  ],
  "dogs": [
   [
    "Voice a dog",
    "Give a dog a voice for its owner.",
    "One line.",
    "They laugh."
   ],
   [
    "Commit to the bit",
    "Keep the dog voice going for a minute.",
    "One minute.",
    "The owner plays too."
   ],
   [
    "Narrate the park",
    "Narrate the dogs like a nature show.",
    "One minute.",
    "Record it."
   ],
   [
    "Write dog jokes",
    "Write five jokes from the park.",
    "Five jokes.",
    "Record the best."
   ],
   [
    "Perform for owners",
    "Do a minute of dog material for owners.",
    "One minute.",
    "They laugh."
   ]
  ],
  "meetup": [
   [
    "Open with a light joke",
    "Introduce yourself with a quick joke.",
    "One intro joke.",
    "It gets a laugh."
   ],
   [
    "Be the joke",
    "Share a quick self-own in a group.",
    "One self-own.",
    "People relax."
   ],
   [
    "Riff in the group",
    "Yes-and someone in a group chat.",
    "One riff.",
    "The group joins."
   ],
   [
    "Improv game",
    "Start a quick improv game with a few people.",
    "One game.",
    "Five minutes."
   ],
   [
    "Do a set",
    "Ask for two minutes to do a funny bit.",
    "Two minutes.",
    "Record it."
   ]
  ],
  "work": [
   [
    "Make a colleague laugh",
    "One light joke in a quiet moment.",
    "One joke.",
    "They laugh."
   ],
   [
    "Commit to a running bit",
    "Start a harmless running bit with a colleague.",
    "One bit.",
    "It lasts a week."
   ],
   [
    "Lighten a meeting",
    "Land one joke in a meeting without derailing it.",
    "One joke.",
    "The room laughs."
   ],
   [
    "Roast yourself in a speech",
    "Open an update with a self-own.",
    "One opening.",
    "It lands."
   ],
   [
    "Host something funny",
    "Host a work social or quiz with jokes.",
    "One hosting.",
    "Record a bit."
   ]
  ],
  "bar": [
   [
    "Joke with the bartender",
    "Make the bartender laugh.",
    "One joke.",
    "They laugh."
   ],
   [
    "Commit to a bit with friends",
    "Keep a bit going for five minutes.",
    "Five minutes.",
    "Bring it back later."
   ],
   [
    "Riff with strangers",
    "Yes-and a nearby group.",
    "One riff.",
    "You join them."
   ],
   [
    "Tell your best story",
    "Tell your funniest story to the table.",
    "One story.",
    "Big laugh."
   ],
   [
    "Hit the open mic",
    "Do a set at a bar open mic.",
    "One set.",
    "Record it."
   ]
  ]
 },
 "w": {
  "cafe": [
   [
    "Tell a story from the scene",
    "Tell a friend a story that starts mid-moment.",
    "One story.",
    "Record it."
   ],
   [
    "Do a voice",
    "Tell a story with one character voice.",
    "One voice.",
    "Two voices."
   ],
   [
    "Explain your world",
    "Explain a custom from your family to someone.",
    "One explanation.",
    "They laugh."
   ],
   [
    "Hold the pause",
    "Land a story with a two-second pause.",
    "One pause.",
    "Big laugh."
   ],
   [
    "Tell a story to a new group",
    "Tell a story to people you just met.",
    "One story.",
    "Record a debrief."
   ]
  ],
  "grocery": [
   [
    "Find a story in the aisles",
    "Tell a friend a story the store reminds you of.",
    "One story.",
    "Record it."
   ],
   [
    "Explain your family’s food",
    "Explain a dish from home to a shopper.",
    "One explanation.",
    "They try it."
   ],
   [
    "Act it out",
    "Act out a grocery memory.",
    "One story.",
    "Record it."
   ],
   [
    "Switch pitch",
    "Tell a short story playing with pitch.",
    "One story.",
    "Record two versions."
   ],
   [
    "Record a grocery story",
    "Record a two-minute story about a shopping moment.",
    "One story.",
    "Post it."
   ]
  ],
  "gym": [
   [
    "Start in the scene",
    "Tell a gym story that opens mid-action.",
    "One story.",
    "Record it."
   ],
   [
    "Voice your coach",
    "Do your coach or parent’s voice in a story.",
    "One voice.",
    "They laugh."
   ],
   [
    "Flip the point of view",
    "Retell a gym moment from the other person’s side.",
    "Two versions.",
    "Record both."
   ],
   [
    "Find the point",
    "End a funny gym story with what it meant.",
    "One story.",
    "Under ten words."
   ],
   [
    "Record a gym story",
    "Record two minutes on camera.",
    "One story.",
    "Post it."
   ]
  ],
  "books": [
   [
    "Story behind a book",
    "Tell someone why a book mattered to you.",
    "One story.",
    "Record it."
   ],
   [
    "Read like a performer",
    "Read a passage with voices.",
    "One passage.",
    "Record it."
   ],
   [
    "Explain your world",
    "Find a book from your culture and explain it to a stranger.",
    "One chat.",
    "They buy it."
   ],
   [
    "Find the turn",
    "Tell a story about a book with a twist ending.",
    "One story.",
    "Record it."
   ],
   [
    "Story night pitch",
    "Pitch the store a storytelling night.",
    "One pitch.",
    "A date."
   ]
  ],
  "dogs": [
   [
    "Origin story",
    "Tell an owner how you met your dog, or a childhood pet.",
    "One story.",
    "Record it."
   ],
   [
    "Do the dog’s voice",
    "Tell a story in your dog’s voice.",
    "One voice.",
    "They laugh."
   ],
   [
    "Find the light",
    "Tell a sad pet story with lightness.",
    "One story.",
    "Gentle laugh."
   ],
   [
    "Read the room",
    "Tell the same story to two owners and adjust.",
    "Two tellings.",
    "Record a debrief."
   ],
   [
    "Record a pet story",
    "Record a two-minute pet story.",
    "One story.",
    "Post it."
   ]
  ],
  "meetup": [
   [
    "Introduce yourself with a story",
    "Use a ten-second story instead of your job.",
    "One intro.",
    "Three times."
   ],
   [
    "Explain your world",
    "Explain where you’re from to someone new.",
    "One explanation.",
    "They ask more."
   ],
   [
    "Bring in a language",
    "Use a phrase from home in a story.",
    "One phrase.",
    "They laugh."
   ],
   [
    "Tell a story to a circle",
    "Tell a story to four or more people.",
    "One story.",
    "Record a debrief."
   ],
   [
    "Host story time",
    "Start a round of stories in the group.",
    "One round.",
    "You go first."
   ]
  ],
  "work": [
   [
    "Open with a story",
    "Start an update with a ten-second story.",
    "One story.",
    "People remember it."
   ],
   [
    "Explain your job as a story",
    "Explain your work through one moment.",
    "One story.",
    "Record it."
   ],
   [
    "Flip perspective",
    "Tell a work conflict from the other side.",
    "One story.",
    "Record it."
   ],
   [
    "Land a point",
    "End a work story with one honest line.",
    "One story.",
    "Under ten words."
   ],
   [
    "Story at a work event",
    "Tell a story in a speech or toast.",
    "One story.",
    "Record it."
   ]
  ],
  "bar": [
   [
    "Start in the scene",
    "Open a story mid-action at the table.",
    "One story.",
    "Hold the table."
   ],
   [
    "Do the voices",
    "Tell a story with two voices.",
    "One story.",
    "Record it."
   ],
   [
    "Fold in an interruption",
    "When someone cuts in, use it.",
    "One handled.",
    "Bigger laugh."
   ],
   [
    "Read the room",
    "Adjust a story mid-telling to the table.",
    "One story.",
    "Record a debrief."
   ],
   [
    "Storytelling night",
    "Tell a story at a bar story night.",
    "One story.",
    "Record it."
   ]
  ]
 },
 "g": {
  "cafe": [
   [
    "Name the purpose of a coffee",
    "Before a coffee with someone, say its purpose out loud.",
    "One purpose.",
    "Change the plan to fit."
   ],
   [
    "Introduce two people",
    "Introduce two people you know with a reason.",
    "One intro.",
    "They swap numbers."
   ],
   [
    "Open strong",
    "Start a coffee meet-up with a real welcome.",
    "One opening.",
    "Record it."
   ],
   [
    "Run one table question",
    "Ask everyone at the table the same question.",
    "One question.",
    "Everyone answers."
   ],
   [
    "Host a café morning",
    "Host four or more people at a café with a purpose.",
    "One gathering.",
    "Post a debrief."
   ]
  ],
  "grocery": [
   [
    "Plan a dinner on purpose",
    "Shop for a dinner and say its purpose out loud.",
    "One purpose.",
    "Invite people."
   ],
   [
    "Invite while shopping",
    "Send a personal invite from the store.",
    "One invite.",
    "With an ask: bring a story."
   ],
   [
    "Pick the menu for the people",
    "Choose food that fits your guests.",
    "One menu.",
    "Ask one guest’s favourite."
   ],
   [
    "Set a pop-up rule",
    "Decide one rule for the dinner.",
    "One rule.",
    "Tell guests in advance."
   ],
   [
    "Host the dinner",
    "Host it with an opening and a closing.",
    "One dinner.",
    "Post a debrief."
   ]
  ],
  "gym": [
   [
    "Greet a newcomer",
    "Welcome someone who looks new.",
    "One welcome.",
    "Introduce them to someone."
   ],
   [
    "Gather a workout group",
    "Invite two or three people to train together.",
    "One invite.",
    "They show up."
   ],
   [
    "Open the session",
    "Start the group with why you’re there.",
    "One opening.",
    "Record it."
   ],
   [
    "Bring in the quiet one",
    "Include someone who usually trains alone.",
    "One person included.",
    "They come again."
   ],
   [
    "Host a group workout",
    "Host a session with a purpose and a closing.",
    "One session.",
    "Post a debrief."
   ]
  ],
  "books": [
   [
    "Name a book club’s purpose",
    "Write one specific reason for a book club.",
    "One purpose.",
    "Share it."
   ],
   [
    "Invite with an ask",
    "Invite people to bring one passage.",
    "One invite.",
    "Three yeses."
   ],
   [
    "Host in the store",
    "Ask the store if you can host there.",
    "One ask.",
    "Yes."
   ],
   [
    "Run a round",
    "Have everyone read their passage in turn.",
    "One round.",
    "Everyone reads."
   ],
   [
    "Host a book night",
    "Host a full book night.",
    "One night.",
    "Post a debrief."
   ]
  ],
  "dogs": [
   [
    "Greet a new owner",
    "Welcome a new owner and introduce them.",
    "One welcome.",
    "They come back."
   ],
   [
    "Name a purpose",
    "Suggest a regular park time with a purpose.",
    "One suggestion.",
    "Agreed."
   ],
   [
    "Set a pop-up rule",
    "Pick one rule for the group, like no phones for the first ten minutes.",
    "One rule.",
    "People follow it."
   ],
   [
    "Close on purpose",
    "End a park meet with a plan for next time.",
    "One closing.",
    "Everyone agrees."
   ],
   [
    "Host a dog meet-up",
    "Host six or more owners.",
    "One meet-up.",
    "Post a debrief."
   ]
  ],
  "meetup": [
   [
    "Help the host",
    "Ask the host how you can help tonight.",
    "One ask.",
    "Given a job."
   ],
   [
    "Greet at the door",
    "Greet people as they arrive.",
    "Five greetings.",
    "Introduce them on."
   ],
   [
    "Introduce with a reason",
    "Introduce three pairs with a reason.",
    "Three intros.",
    "They stay talking."
   ],
   [
    "Redirect kindly",
    "Steer a dominating person to someone else.",
    "One redirect.",
    "Nobody notices."
   ],
   [
    "Host your own",
    "Start your own meetup with a purpose.",
    "One event.",
    "Post a debrief."
   ]
  ],
  "work": [
   [
    "Give a meeting a purpose",
    "Open a meeting by saying what it’s for.",
    "One opening.",
    "It ends early."
   ],
   [
    "Introduce two colleagues",
    "Introduce two people who should talk.",
    "One intro.",
    "They work together."
   ],
   [
    "Run a round",
    "Ask every person one question at the start of a meeting.",
    "One round.",
    "Everyone answers."
   ],
   [
    "Close on purpose",
    "End a meeting with a clear closing.",
    "One closing.",
    "Clear next steps."
   ],
   [
    "Host a team gathering",
    "Host a team lunch or social with a purpose.",
    "One gathering.",
    "Post a debrief."
   ]
  ],
  "bar": [
   [
    "Gather a table",
    "Invite friends with a purpose for the night.",
    "One invite.",
    "Everyone comes."
   ],
   [
    "Mix the group",
    "Introduce friends from different circles.",
    "One intro.",
    "They hit it off."
   ],
   [
    "Toast the purpose",
    "Open the night with a short toast.",
    "One toast.",
    "Glasses up."
   ],
   [
    "Bring in the quiet one",
    "Draw a quiet person in with a question.",
    "One question.",
    "They tell a story."
   ],
   [
    "Host the night",
    "Host a night out with an opening and a closing.",
    "One night.",
    "Post a debrief."
   ]
  ]
 },
 "y": {
  "cafe": [
   [
    "Say one line and go",
    "Say one warm line to someone you find attractive, then leave.",
    "One line.",
    "Three in a week."
   ],
   [
    "Hold the look",
    "Catch someone’s eye, hold it a beat and smile.",
    "One look.",
    "They smile back."
   ],
   [
    "Start a conversation",
    "Talk to someone you’re drawn to, and be the one who ends it.",
    "One chat.",
    "Five minutes."
   ],
   [
    "Tease kindly",
    "Tease their order lightly.",
    "One tease.",
    "They tease back."
   ],
   [
    "Make the ask",
    "Ask to get coffee together another time.",
    "One ask.",
    "A yes."
   ]
  ],
  "grocery": [
   [
    "Say one line and go",
    "Say one warm line in an aisle, then move on.",
    "One line.",
    "Three."
   ],
   [
    "Ask for a real opinion",
    "Ask someone you’re drawn to which one they’d pick.",
    "One question.",
    "It becomes a chat."
   ],
   [
    "Use the imperfect opener",
    "Start a chat with whatever’s true.",
    "One opener.",
    "Keep it going."
   ],
   [
    "Be the one who leaves",
    "End the chat warmly before it fades.",
    "One exit.",
    "Leave them smiling."
   ],
   [
    "Make the ask",
    "Ask for their number after a real chat.",
    "One ask.",
    "A yes."
   ]
  ],
  "gym": [
   [
    "Hold the look",
    "A friendly look and smile, never mid-set.",
    "One look.",
    "A nod back."
   ],
   [
    "Say one line",
    "One respectful line between sets, then leave them to train.",
    "One line.",
    "They say hi next time."
   ],
   [
    "Know what you bring",
    "Record a minute on what you bring, after your workout.",
    "One minute.",
    "Say it to a friend."
   ],
   [
    "Talk outside the workout",
    "Chat by the door or at the front desk, not while they lift.",
    "One chat.",
    "Five minutes."
   ],
   [
    "Make the ask",
    "Invite them to coffee or a class together.",
    "One ask.",
    "A yes."
   ]
  ],
  "books": [
   [
    "Say one line",
    "Comment on the book someone’s holding, then go.",
    "One line.",
    "Three."
   ],
   [
    "Ask a real question",
    "Ask what they love about it.",
    "One question.",
    "Five minutes."
   ],
   [
    "Recommend a book",
    "Recommend one to someone you’re drawn to.",
    "One recommendation.",
    "They take it."
   ],
   [
    "Tease kindly",
    "Tease their genre lightly.",
    "One tease.",
    "They laugh."
   ],
   [
    "Make the ask",
    "Suggest coffee to talk books.",
    "One ask.",
    "A yes."
   ]
  ],
  "dogs": [
   [
    "Say one line",
    "Compliment the dog and say hi to the owner.",
    "One line.",
    "Three."
   ],
   [
    "Hold the look",
    "Hold eye contact with the owner, not just the dog.",
    "One look.",
    "They smile."
   ],
   [
    "Talk about them, not the dog",
    "Ask about their life.",
    "One chat.",
    "Five minutes."
   ],
   [
    "Suggest a walk",
    "Ask to walk the dogs together.",
    "One ask.",
    "They say yes."
   ],
   [
    "Ask for a date",
    "Ask them out after a real chat.",
    "One ask.",
    "A yes."
   ]
  ],
  "meetup": [
   [
    "Say hello first",
    "Introduce yourself to someone you’re drawn to.",
    "One intro.",
    "Three."
   ],
   [
    "Ask a real question",
    "Ask something you’re genuinely curious about.",
    "One question.",
    "It goes deep."
   ],
   [
    "Share something true",
    "Share one real thing about yourself.",
    "One share.",
    "They share back."
   ],
   [
    "Leave first",
    "End the chat warmly and move on.",
    "One exit.",
    "They find you later."
   ],
   [
    "Make the ask",
    "Ask for their number before you leave.",
    "One ask.",
    "A yes."
   ]
  ],
  "work": [
   [
    "Speak with warmth",
    "Give a colleague a specific compliment about their work.",
    "One compliment.",
    "Three this week."
   ],
   [
    "Hold your ground",
    "Say what you want in a meeting without hedging.",
    "One clear ask.",
    "Get it."
   ],
   [
    "Name your nerves",
    "Say “I’m a bit nervous” before a presentation.",
    "One honest line.",
    "It helps."
   ],
   [
    "Say no kindly",
    "Turn down something that isn’t right for you, clearly.",
    "One no.",
    "No guilt after."
   ],
   [
    "Ask someone to lunch",
    "Invite someone new to lunch, as a friend.",
    "One invite.",
    "A yes."
   ]
  ],
  "bar": [
   [
    "Say one line and go",
    "Say one warm line, then return to your friends.",
    "One line.",
    "Three."
   ],
   [
    "Hold the look",
    "Catch an eye across the room and smile.",
    "One look.",
    "They come over."
   ],
   [
    "Start a conversation",
    "Go over and talk.",
    "One chat.",
    "Five minutes."
   ],
   [
    "Take a no well",
    "If it’s a no, respond warmly.",
    "One no taken well.",
    "You feel fine."
   ],
   [
    "Ask them out",
    "Ask for a date with a specific plan.",
    "One ask.",
    "A yes."
   ]
  ]
 },
 "a": {
  "cafe": [
   [
    "Order like a regular",
    "Order with full voice and eye contact, like you’ve been coming for years.",
    "One order.",
    "Use the barista’s name."
   ],
   [
    "Hype the barista",
    "Tell the barista their latte art is championship level.",
    "One hype line.",
    "They laugh."
   ],
   [
    "Banter with the line",
    "Make one playful comment to the person behind you.",
    "One line.",
    "It turns into a chat."
   ],
   [
    "Rhyme your order",
    "Order with a small rhyme, committed.",
    "One rhyme.",
    "The staff remember you next time."
   ],
   [
    "Make the café laugh",
    "Get a laugh from more than one person at once.",
    "One group laugh.",
    "Record a debrief."
   ]
  ],
  "grocery": [
   [
    "Walk the aisles tall",
    "Shop slowly, head up, saying hi to two people.",
    "Two hellos.",
    "Five."
   ],
   [
    "Compliment a basket",
    "Playfully praise someone’s shopping choices.",
    "One compliment.",
    "They laugh."
   ],
   [
    "Predict the line",
    "Predict out loud which line will move fastest, and own it either way.",
    "One prediction.",
    "Someone joins the bet."
   ],
   [
    "Hype the cashier",
    "Tell the cashier they’re the fastest you’ve seen.",
    "One hype line.",
    "They smile."
   ],
   [
    "Lift someone’s day",
    "Make one person in the store laugh.",
    "One laugh.",
    "Three."
   ]
  ],
  "gym": [
   [
    "Walk in like a champ",
    "Enter with presence and greet the front desk by name.",
    "One entrance.",
    "Greet two regulars."
   ],
   [
    "Talk yourself up out loud",
    "Before a heavy set, say a short line of belief.",
    "One line.",
    "Record it."
   ],
   [
    "Hype a stranger’s set",
    "Cheer someone through their last rep.",
    "One cheer.",
    "They thank you."
   ],
   [
    "Banter with a regular",
    "Trade playful lines with a regular.",
    "One exchange.",
    "It becomes a running bit."
   ],
   [
    "Lead the room",
    "Get a few people laughing or cheering together.",
    "One group moment.",
    "Record a debrief."
   ]
  ],
  "books": [
   [
    "Make a bold pick",
    "Tell staff you’re looking for the best book ever written, then let them try.",
    "One bold ask.",
    "They take the challenge."
   ],
   [
    "Read with flair",
    "Read a dramatic line aloud to a friend.",
    "One reading.",
    "Record it."
   ],
   [
    "Write a rhyme about a book",
    "Write four lines about your favourite book.",
    "Four lines.",
    "Perform it."
   ],
   [
    "Hype a book to a stranger",
    "Sell a book you love to a browser with full belief.",
    "One pitch.",
    "They take it."
   ],
   [
    "Own a reading",
    "Speak at a reading or open mic.",
    "One time up.",
    "Record it."
   ]
  ],
  "dogs": [
   [
    "Greet the whole park",
    "Say hi to every owner as you arrive.",
    "Every owner greeted.",
    "Use names."
   ],
   [
    "Hype a dog",
    "Introduce a dog to others like a champion.",
    "One hype intro.",
    "The owner loves it."
   ],
   [
    "Banter with an owner",
    "Playful lines about whose dog is fastest.",
    "One exchange.",
    "A rematch is scheduled."
   ],
   [
    "Make a prediction",
    "Predict which dog wins the fetch race, and own it.",
    "One prediction.",
    "Others bet too."
   ],
   [
    "Lift the group",
    "Get the group laughing together.",
    "One group laugh.",
    "Record a debrief."
   ]
  ],
  "meetup": [
   [
    "Make an entrance",
    "Arrive with energy and greet the host by name.",
    "One entrance.",
    "Get a laugh in a minute."
   ],
   [
    "Hype someone’s intro",
    "Introduce someone like a champion.",
    "One intro.",
    "They’re beaming."
   ],
   [
    "Answer with a joke first",
    "When asked something, joke, then answer.",
    "One answer.",
    "Three."
   ],
   [
    "Take a stand",
    "Share a view calmly in a discussion.",
    "One stand.",
    "Hold it under pushback."
   ],
   [
    "Speak to the room",
    "Speak for two minutes with belief and warmth.",
    "Two minutes.",
    "Record it."
   ]
  ],
  "work": [
   [
    "Walk in slowly",
    "Enter a meeting calm and unhurried, and greet people by name.",
    "One entrance.",
    "Every meeting this week."
   ],
   [
    "Predict a win",
    "Tell your team what you’ll deliver by Friday.",
    "One prediction.",
    "Deliver it."
   ],
   [
    "Hype a colleague",
    "Praise a colleague’s work in front of others.",
    "One shout-out.",
    "In a big meeting."
   ],
   [
    "Banter in the kitchen",
    "Trade a few playful lines with a colleague.",
    "One exchange.",
    "It becomes a running joke."
   ],
   [
    "Own the room",
    "Present with belief, a light joke and warmth.",
    "One presentation.",
    "Record a rehearsal."
   ]
  ],
  "bar": [
   [
    "Make an entrance",
    "Arrive, greet your group with energy, and greet the bartender.",
    "One entrance.",
    "Use names."
   ],
   [
    "Hype your friend",
    "Introduce your friend to strangers like a champion.",
    "One intro.",
    "A new group forms."
   ],
   [
    "Banter with a stranger",
    "Trade playful lines with someone at the bar.",
    "One exchange.",
    "Swap names."
   ],
   [
    "Rhyme a toast",
    "Give a four-line rhyming toast.",
    "One toast.",
    "Glasses up."
   ],
   [
    "Hold the table",
    "Tell a story with energy until the whole table is in.",
    "One story.",
    "Record a debrief."
   ]
  ]
 }
};

export const VIA_RE = /^[nfmpkbhwgya]$/;

// The path version of a place move, or the move itself.
export function lensed(m: Move | undefined, via?: string | null): Move | undefined {
  if (!m || m.b !== 'x' || !via || !PLACE_PATH[via]) return m;
  const v = PLACE_PATH[via][PLACES[m.place ?? 0].id]?.[m.i - 1];
  if (!v) return m;
  return { ...m, title: v[0], doIt: v[1], rep: v[2], up: v[3], via: via as PathKey };
}

// "x3@h" -> the move and the path it's tuned for.
export function parseMoveKey(key: string): { move: Move; via: PathKey | null } {
  const [id, via] = key.split('@');
  const base = BY[id];
  const v = via && VIA_RE.test(via) && base?.b === 'x' ? (via as PathKey) : null;
  return { move: lensed(base, v) as Move, via: v };
}
export const moveKey = (id: string, via?: string | null) => (via ? `${id}@${via}` : id);
