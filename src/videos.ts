// One example video per base level and path stage, with what to take from it.
// up is the upload month; a video older than three years is hidden automatically.
import type { BranchKey } from './moves';

export type Video = { t: string; by: string; id: string; at: number; up: string; take: string };

export const VIDEO: Partial<Record<BranchKey, Video[]>> = {
  "c": [
    {
      "t": "How to talk to strangers",
      "by": "Nick Epley with Andrew Huberman",
      "id": "vAVczrdehdg",
      "at": 0,
      "up": "2026-05",
      "take": "A behavioural scientist on why we avoid talking to strangers and why those chats go better than we expect. Watch it before your first ten hellos."
    },
    {
      "t": "Why you should talk to strangers (science says so)",
      "by": "Juliana Schroeder",
      "id": "JL0jZmsN2nA",
      "at": 0,
      "up": "2025-12",
      "take": "Research on why we skip the person on the train, and what it costs us. Use it to push through the bold moves in this level, like talking to someone who intimidates you."
    },
    {
      "t": "The only way out",
      "by": "Brené Brown · The Diary of a CEO",
      "id": "jroF3PH-PTs",
      "at": 0,
      "up": "2025-11",
      "take": "Brené Brown on how shame, fear and perfectionism hold people back, and how courage gets built. It is the idea behind admitting you're nervous and saying the opinion you usually keep."
    },
    {
      "t": "I tried rejection therapy for 100 days",
      "by": "Rejection therapy diary",
      "id": "EM6nSUDcGhc",
      "at": 0,
      "up": "2026-01",
      "take": "Someone who set out to be rejected 100 times, and what changed. Watch before 'Get rejected on purpose': it shows how fast the fear shrinks once the no stops being rare."
    },
    {
      "t": "How to set boundaries (without feeling guilty)",
      "by": "Nick Wignall, psychologist",
      "id": "jTp1ss9y7MI",
      "at": 0,
      "up": "2025-04",
      "take": "Four practical ways to set boundaries without guilt. Use them for 'Hold a boundary calmly'."
    }
  ],
  "t": [
    {
      "t": "How to have a conversation with anyone",
      "by": "Mini-class",
      "id": "e6GAgBbZGMI",
      "at": 0,
      "up": "2025-04",
      "take": "A short class in four parts on starting a conversation with confidence and keeping it going. It covers the same ground as this level's moves."
    },
    {
      "t": "How to remember faces and names",
      "by": "Jim Kwik",
      "id": "bpcltGKKMX0",
      "at": 0,
      "up": "2025-04",
      "take": "Memory techniques for names and faces. Use one before 'Remember them next time'; nothing makes people feel noticed faster."
    },
    {
      "t": "How to tell better stories",
      "by": "Matthew Dicks",
      "id": "J4wguyJZI6A",
      "at": 0,
      "up": "2023-12",
      "take": "The author of Storyworthy on what makes a story work. Watch it before you build your three go-to stories."
    },
    {
      "t": "How to respectfully disagree",
      "by": "Joseph Grenny · Crucial Conversations",
      "id": "703QaWAkZpM",
      "at": 0,
      "up": "2024-07",
      "take": "The Crucial Conversations co-author's tip: lead with curiosity instead of trying to change their mind. That is the 'Disagree, kindly' move."
    },
    {
      "t": "How to connect with anyone, even with nothing in common",
      "by": "Charisma on Command",
      "id": "BfUEDvrD1Y4",
      "at": 0,
      "up": "2025-09",
      "take": "How to find a way in with someone you seem to share nothing with. Use it for 'Talk to someone very different'."
    }
  ],
  "q": [
    {
      "t": "These simple mistakes make people dislike you",
      "by": "Vanessa Van Edwards",
      "id": "kfDe8JPgSOM",
      "at": 0,
      "up": "2025-06",
      "take": "Starts from how the way you say hello affects how people see you. It is the research behind this level's base cues, like the eyebrow flash hello."
    },
    {
      "t": "A powerful cue to connect",
      "by": "Vanessa Van Edwards · The Diary of a CEO",
      "id": "Np1Nga6_Ymw",
      "at": 0,
      "up": "2024-12",
      "take": "A short clip on warmth cues that make you more approachable. Pick one to try when you swap your stock opener."
    },
    {
      "t": "Sound smarter, be stronger and look more confident",
      "by": "Vanessa Van Edwards",
      "id": "zYXbV-REsss",
      "at": 0,
      "up": "2026-05",
      "take": "Body language and voice changes for taking up space and not shrinking. Watch before 'Set your stance before you enter' and 'Take up your space'."
    },
    {
      "t": "This is why people don't take you seriously",
      "by": "Vanessa Van Edwards",
      "id": "zuSf_wSbrXM",
      "at": 0,
      "up": "2025-06",
      "take": "Everyday charisma and how small cues change how capable you look. Use it for the competence cues in this level."
    },
    {
      "t": "How to make a great first impression",
      "by": "Vanessa Van Edwards · CreativeLive",
      "id": "jpF2f8-wvm0",
      "at": 0,
      "up": "2026-04",
      "take": "A lesson on the nonverbal cues people judge you on first. Use it before 'Test your first impression' and 'Own the entrance'."
    }
  ],
  "v": [
    {
      "t": "This speaking mistake makes people dislike you",
      "by": "Vinh Giang · The Diary of a CEO",
      "id": "oIiv_335yus",
      "at": 0,
      "up": "2025-03",
      "take": "Vinh Giang on speaking as a skill you can learn, with pauses for emphasis and more volume than feels normal. Those are this level's base moves."
    },
    {
      "t": "How to sound confident (even when you don't feel it)",
      "by": "Vinh Giang",
      "id": "EyyUfmWpZZc",
      "at": 0,
      "up": "2026-11",
      "take": "A recent conversation on the power of your voice and how to sound confident when you're not. Pair it with the warm-up and breathing moves."
    },
    {
      "t": "Sound instantly charismatic, even if you're shy",
      "by": "Vinh Giang",
      "id": "D6ajLBYgnSk",
      "at": 0,
      "up": "2025-03",
      "take": "Five vocal techniques for sounding more engaging. Copy one at a time while you record this level's moves."
    },
    {
      "t": "The overachiever's guide to effective communication",
      "by": "Matt Abrahams · Stanford",
      "id": "NmKXDkFZEGQ",
      "at": 0,
      "up": "2026-03",
      "take": "The teacher of Stanford's most popular communication course on speaking clearly when it counts. Use it for the structured point and handling interruptions."
    },
    {
      "t": "The simple way to never run out of things to say",
      "by": "Vinh Giang",
      "id": "yLQPOsb8sQ4",
      "at": 0,
      "up": "2025-09",
      "take": "Frameworks for speaking clearly without preparation. Practise one before 'Speak on a random topic'."
    }
  ],
  "s": [
    {
      "t": "Close any sale in 3 steps",
      "by": "Alex Hormozi",
      "id": "CwmV4azspI8",
      "at": 0,
      "up": "2024-12",
      "take": "Hormozi on talking less and closing more. Notice how much of a good sale is asking and listening, which is what these base moves train."
    },
    {
      "t": "How to get your first customer",
      "by": "Alex Hormozi",
      "id": "PIbBM2xJ464",
      "at": 0,
      "up": "2026-03",
      "take": "How to land the first customer when you have none. It pairs with asking for introductions and following up within a day."
    },
    {
      "t": "I closed 4,000 deals before discovering this",
      "by": "Alex Hormozi",
      "id": "t10r_KD4QzE",
      "at": 0,
      "up": "2026-01",
      "take": "What he learned about closing after thousands of sales. Use it alongside the CLOSER moves in this level."
    },
    {
      "t": "How to create an offer people can't say no to",
      "by": "Alex Hormozi",
      "id": "IlfLshu5CI0",
      "at": 0,
      "up": "2026-04",
      "take": "The four parts of an irresistible offer, starting with the dream outcome. Watch before 'Make the offer hard to refuse'."
    },
    {
      "t": "3 rules for closing any sale in under 5 minutes",
      "by": "Alex Hormozi",
      "id": "M5SuDAAif5A",
      "at": 0,
      "up": "2026-06",
      "take": "His rules for closing, and why deals get lost in the first minute. Use them for selling to a sceptic and holding your price."
    }
  ],
  "n": [
    {
      "t": "Tactical empathy and mirroring",
      "by": "Chris Voss with Andrew Huberman",
      "id": "oSm5yHogsD8",
      "at": 0,
      "up": "2026-05",
      "take": "Voss explains mirroring and tactical empathy in depth. Watch before your first three mirrors."
    },
    {
      "t": "Tactical empathy at the World Economic Forum",
      "by": "Chris Voss",
      "id": "-at52cSECho",
      "at": 0,
      "up": "2026-01",
      "take": "Voss on tactical empathy: understanding the other side without agreeing with them. It is the idea behind labels and getting a 'that's right'."
    },
    {
      "t": "Asking how and what questions",
      "by": "Chris Voss with Andrew Huberman",
      "id": "xMiohtH8W-k",
      "at": 0,
      "up": "2024-10",
      "take": "A short clip on using how and what questions to find out how serious the other side is. These are the calibrated questions in this stage."
    },
    {
      "t": "How to defend your price",
      "by": "Chris Voss",
      "id": "nesogXflaQ0",
      "at": 0,
      "up": "2024-09",
      "take": "What to do when someone asks you to drop your price, starting with labelling how they feel. Use it for the Bargain stage."
    }
  ],
  "f": [
    {
      "t": "Josh Braun's exact cold call script",
      "by": "Josh Braun",
      "id": "fwyxBrj4m-8",
      "at": 0,
      "up": "2026-05",
      "take": "His cold call script, from the opener to objections to booking the meeting, without sounding salesy. Use it for 'Open with permission'."
    },
    {
      "t": "Fancy discovery questions don't work",
      "by": "Keenan",
      "id": "9qbZg75aPtE",
      "at": 0,
      "up": "2025-03",
      "take": "The author of Gap Selling on why simple, direct questions about the problem beat clever ones. That is the whole Discovery stage."
    },
    {
      "t": "Obviously Awesome 2.0: what's changed in positioning",
      "by": "April Dunford",
      "id": "lAWpJ0LJfgI",
      "at": 0,
      "up": "2026-04",
      "take": "April Dunford on positioning today. Use it to work out what you'd be compared with and what only you have."
    },
    {
      "t": "Flip the script: a masterclass on pitching",
      "by": "Oren Klaff",
      "id": "UZma_TWt4uk",
      "at": 0,
      "up": "2025-09",
      "take": "The author of Pitch Anything on how pitches really get won. Watch before 'Hold your ground on a challenge'."
    }
  ],
  "m": [
    {
      "t": "Stop being nervous on camera: 10 tips",
      "by": "Creator tutorial",
      "id": "Y6ZPTJkRb8I",
      "at": 0,
      "up": "2025-11",
      "take": "Ten practical tips for going from awkward to natural on camera. Try one per take while you talk to the lens."
    },
    {
      "t": "MrBeast's ex-strategist on getting to 100k",
      "by": "Paddy Galloway",
      "id": "SYbQqMeq48o",
      "at": 0,
      "up": "2025-01",
      "take": "A YouTube strategist who worked with MrBeast on what makes people click and keep watching. Take the parts about the first seconds and the idea itself; skip the algorithm talk."
    },
    {
      "t": "Hormozi's storytelling framework for content",
      "by": "Alex Hormozi",
      "id": "QGs5z6j7Y80",
      "at": 371,
      "up": "2024-06",
      "take": "Where his content ideas come from (your own experiences, recent conversations) and why story matters. It starts at the storytelling section."
    },
    {
      "t": "Street interview tips",
      "by": "NBCU Academy",
      "id": "nSZymgTDnmI",
      "at": 0,
      "up": "2024-08",
      "take": "NBC News journalists on how they get strangers to talk on camera. Watch before 'Do a street interview'."
    }
  ],
  "p": [
    {
      "t": "What to say on a cold call to get the meeting",
      "by": "Jeb Blount",
      "id": "5md8SrK3VKg",
      "at": 0,
      "up": "2026-10",
      "take": "How to open a cold call so the person agrees to meet. Use it to write your opener before your first five dials."
    },
    {
      "t": "Sales mistakes, with Mike Weinberg",
      "by": "Sales Logic Expert Exchange",
      "id": "Kfi1InFn8Mg",
      "at": 0,
      "up": "2025-04",
      "take": "A no-fluff conversation with Mike Weinberg on the mistakes salespeople make. It pairs with building your target list and walking in."
    },
    {
      "t": "How to qualify leads and build a prospecting system",
      "by": "Jeb Blount",
      "id": "z2Tynppj6eI",
      "at": 0,
      "up": "2026-07",
      "take": "When a lead has really gone cold, and whether to leave a voicemail on every call. Watch before your follow-ups."
    },
    {
      "t": "How to cold call busy people and get the meeting",
      "by": "Jeb Blount",
      "id": "9UmgG25bmDI",
      "at": 0,
      "up": "2026-04",
      "take": "How to reach owners who are too busy to talk and still book the meeting. Use it for 'Book a meeting from cold'."
    }
  ],
  "k": [
    {
      "t": "How to be confident (even if you're not)",
      "by": "Montana von Fliss · TEDx",
      "id": "eVFzbxmKNUw",
      "at": 0,
      "up": "2025-03",
      "take": "A speaker coach's techniques for looking confident on stage when you don't feel it. They match this stage: stand still, speak up, own the pause."
    },
    {
      "t": "Creating and delivering a great TEDx talk",
      "by": "TEDx speaker",
      "id": "Iym0hdujC3Y",
      "at": 0,
      "up": "2026-04",
      "take": "A six-part framework for writing a TEDx talk and delivering it with confidence. Use it to build your five-minute talk."
    },
    {
      "t": "Matthew Dicks on telling stories that sell",
      "by": "Matthew Dicks",
      "id": "64XjGDgEOKM",
      "at": 0,
      "up": "2024-09",
      "take": "The author of Storyworthy on getting good through practice, and starting from the message you want to land. Use it to shape your five-second moment."
    },
    {
      "t": "Mastering the art of confident communication",
      "by": "Vinh Giang",
      "id": "OPJ4c4clNH4",
      "at": 0,
      "up": "2026-11",
      "take": "Vinh Giang on speaking with clarity and presence through small changes in how you behave. Watch before you take the room."
    }
  ],
  "b": [
    {
      "t": "The content mistake costing coaches thousands",
      "by": "Brian Mark",
      "id": "fug-2NAPgmA",
      "at": 0,
      "up": "2026-03",
      "take": "Why views and followers don’t pay, and what to post instead. It is aimed at fitness coaches, but it works for anything you sell. Watch before your first proof video."
    },
    {
      "t": "How to hack the algorithm and go viral on Instagram",
      "by": "Brian Mark",
      "id": "hgt86CsQ8-Y",
      "at": 0,
      "up": "2024-06",
      "take": "How he thinks about reach and formats. Take the format ideas for 'Borrow a format' and skip anything that chases views for their own sake."
    },
    {
      "t": "How to get your first 10 clients, starting from zero",
      "by": "Brian Mark",
      "id": "0KE3BM3J7to",
      "at": 0,
      "up": "2026-10",
      "take": "The profile, the content system and his DM scripts, word for word. Watch before you start your ten conversations."
    },
    {
      "t": "Close any sale in 3 steps",
      "by": "Alex Hormozi",
      "id": "CwmV4azspI8",
      "at": 0,
      "up": "2024-12",
      "take": "Talk less, ask more, and say the price plainly. It is the whole Calls stage in one video."
    }
  ],
  "h": [
    {
      "t": "The advice Johnny Carson gave Conan",
      "by": "Conan O’Brien",
      "id": "GsibjmC_R3E",
      "at": 0,
      "up": "2026-09",
      "take": "Conan on performing with his hero watching from a few feet away. Watch it before your first bit: everyone is nervous, even Conan."
    },
    {
      "t": "Conan and Matt Groening on The Simpsons writers’ room",
      "by": "Conan O’Brien Needs A Friend",
      "id": "ZjWPkOHk_BM",
      "at": 0,
      "up": "2026-09",
      "take": "Two comedy writers on how jokes got made in one of the best writers’ rooms ever. Listen for how many jokes get thrown away."
    },
    {
      "t": "Lisa Kudrow and Conan bonded in improv class",
      "by": "Conan O’Brien Needs A Friend",
      "id": "QqQbTl1dKYY",
      "at": 0,
      "up": "2025-01",
      "take": "Where Conan’s playfulness comes from: improv. Watch before you start riffing with strangers."
    },
    {
      "t": "Conan on preparing to host the Oscars",
      "by": "Jimmy Kimmel Live",
      "id": "kTCMPedUSWU",
      "at": 0,
      "up": "2025-02",
      "take": "How much preparation goes into looking loose on a big stage. Use it before your tight three."
    }
  ],
  "w": [
    {
      "t": "Trevor Noah on storytelling",
      "by": "Trevor Noah at CLEANPOWER 2025",
      "id": "0neVALfl6zQ",
      "at": 0,
      "up": "2025-06",
      "take": "Trevor on why stories move people more than facts. It’s not a comedy set, but it is the thinking behind his storytelling."
    },
    {
      "t": "Meet Eugene Khoza",
      "by": "What Now? with Trevor Noah",
      "id": "GhlhkbAtN1g",
      "at": 0,
      "up": "2025-04",
      "take": "Two South African comedians who grew up together. Listen to how they tell stories to each other: the voices, the languages, the timing."
    },
    {
      "t": "Jon Stewart on What Now?",
      "by": "What Now? with Trevor Noah",
      "id": "44uC12g9ZVk",
      "at": 0,
      "up": "2025-06",
      "take": "Trevor and his Daily Show predecessor on comedy and perspective. Use it for the Perspective stage."
    },
    {
      "t": "Chris Rock’s advice to Trevor Noah",
      "by": "Trevor Noah",
      "id": "qflyIvSnl_I",
      "at": 0,
      "up": "2026-10",
      "take": "A short one: what Chris Rock told him when he started hosting. Watch before you take a room."
    }
  ],
  "g": [
    {
      "t": "The 3 rules that make every gathering better",
      "by": "Priya Parker",
      "id": "AItT7HrDrJU",
      "at": 0,
      "up": "2025-11",
      "take": "Priya Parker on what turns a meeting or a dinner into something people remember. Start with the part on purpose."
    },
    {
      "t": "Rethinking big ideas: Priya Parker on gathering",
      "by": "Priya Parker",
      "id": "oGBoMxew7xE",
      "at": 0,
      "up": "2024-01",
      "take": "Her idea that every gathering is a chance to create the world you want. Use it for the Opening stage."
    },
    {
      "t": "Priya Parker, The Art of Gathering",
      "by": "Priya Parker",
      "id": "9D4jg8nkDKA",
      "at": 0,
      "up": "2024-11",
      "take": "Why gathering is a source of meaning, and what a host owes the guests. Watch before you redirect someone or bring in the quiet one."
    }
  ]
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fresh(v: Video | undefined): Video | null {
  if (!v || !/^\d{4}-\d{2}$/.test(v.up)) return null;
  const y = Number(v.up.slice(0, 4));
  const mo = Number(v.up.slice(5, 7));
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - mo) < 36 ? v : null;
}
export function levelVideo(b: BranchKey, k: number): Video | null {
  return fresh(VIDEO[b]?.[k - 1]);
}
export function videoUrl(v: Video): string {
  return `https://www.youtube.com/watch?v=${v.id}${v.at ? `&t=${v.at}s` : ''}`;
}
export function upText(v: Video): string {
  return `${MONTHS[Number(v.up.slice(5, 7)) - 1]} ${v.up.slice(0, 4)}`;
}
export function mmss(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
// A YouTube search for more examples of one move, limited to this year's uploads.
export function searchUrl(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIIBQ%253D%253D`;
}
