// Expert data — sourced verbatim from user-verified content against
// nirvanawellness.org. Nothing below has been added, embellished, or
// inferred beyond what the user provided. Fields left undefined are
// intentionally missing until verified content arrives.

export type Expert = {
  slug: string;
  name: string;
  role: string;
  focus: string[]; // filter tags — derived only from stated credentials
  pillars: ("Mind" | "Body" | "Soul")[];
  short: string; // one-line directory summary, built only from stated facts
  bio: string[];
  credentials: string[];
  // Optional — only present when verified content exists
  languages?: string[];
  location?: string;
  quote?: string;
  approach?: string[];
  specialties?: string[];
};

export const EXPERTS: Expert[] = [
  {
    slug: "sumaia-azmi",
    name: "Sumaia Azmi",
    role: "Founder · Counselor Psychologist, Life Coach & Corporate Trainer",
    focus: ["Individual", "Corporate", "Coaching"],
    pillars: ["Mind", "Soul"],
    short:
      "Founder of Nirvana. Eight years of practice, working from a holistic wellness-coaching approach.",
    bio: [
      "Founder of Nirvana. Counselor Psychologist and certified Life Coach, and a Corporate Trainer, with 8 years of experience. Her practice is built around a holistic wellness-coaching approach.",
    ],
    credentials: [
      "Counselor Psychologist",
      "Certified Life Coach",
      "Corporate Trainer",
      "Founder — Nirvana Wellness",
    ],
  },
  {
    slug: "sanjida-afroz",
    name: "Sanjida Afroz",
    role: "Psychotherapist · Certified NLP Master Practitioner · Family & Couple Therapist",
    focus: ["Individual", "Couples", "Family"],
    pillars: ["Mind"],
    short:
      "Psychotherapist with 10+ years of experience. Clinical Counselor at BUET.",
    bio: [
      "Psychotherapist, Certified NLP Master Practitioner, and Family & Couple Therapist. Clinical Counselor at Bangladesh University of Engineering and Technology (BUET). More than 10 years of experience in the field.",
    ],
    credentials: [
      "B.Sc & M.Sc in Psychology — Dhaka University",
      "M.Sc in Counseling Psychology — Dhaka University",
      "Diploma — Transactional Analysis & NLP (India)",
      "Diploma — Family & Couple Therapy (India)",
      "Certification — Disability & Rehabilitation (Canada)",
      "NLP Master Practitioner",
      "Clinical Counselor — BUET",
    ],
  },
  {
    slug: "dr-richard-castle",
    name: "Dr. Richard Castle",
    role: "Consultant Psychologist",
    focus: ["Individual", "Online"],
    pillars: ["Mind"],
    location: "Online",
    languages: ["English"],
    short:
      "UK-registered Consultant Psychologist. Around 20 years of experience; sessions delivered online.",
    bio: [
      "Consultant Psychologist, registered with the UK Health and Care Professions Council and an Associate Fellow of the British Psychological Society. Holds a doctorate in psychology and a master's degree in stress management. Approximately 20 years of experience.",
      "His career began in the UK Royal Air Force. He was central to bringing Mental Health First Aid (MHFA) to Bangladesh in 2015 and has worked with the Acid Survivors Foundation in Dhaka.",
    ],
    credentials: [
      "Doctorate in Psychology",
      "Master's in Stress Management",
      "Registered — UK Health and Care Professions Council",
      "Associate Fellow — British Psychological Society",
      "Certified DBT provider",
      "MHFA instructor",
      "Formerly — UK Royal Air Force",
    ],
  },
  {
    slug: "stanislas-ll",
    name: "Stanislas LL",
    role: "Mindfulness & Heartfulness Meditation Guide",
    focus: ["Meditation", "Corporate", "Individual"],
    pillars: ["Soul"],
    languages: ["English", "French"],
    short:
      "French diplomat with 20 years of Mindfulness and Heartfulness meditation practice. Associated with the Heartfulness Institute.",
    bio: [
      "French diplomat. Served several years at the Crisis Center in Paris and has been posted in China, India, Turkey, Slovakia, and Bangladesh. Holds a Master's degree in Law and Economy, and has been certified in Mindfulness and Heartfulness meditation for the past 20 years.",
      "Closely associated with the Heartfulness Institute.",
    ],
    credentials: [
      "20 years — certified in Mindfulness & Heartfulness meditation",
      "Master's — Law and Economy",
      "Associated with the Heartfulness Institute",
    ],
  },
  {
    slug: "aparazita-rahman",
    name: "Aparazita Rahman",
    role: "Art Therapist",
    focus: ["Art therapy"],
    pillars: ["Soul", "Mind"],
    short: "Art therapist.",
    bio: [
      "Art therapy is an integrative mental-health practice that enriches the lives of individuals, families, and communities through active art-making and creative therapeutic processes — a space where psychological theory, social experience, and feeling are explored together.",
      "It engages the mind, body, and spirit in ways that verbal articulation alone cannot. Visual and symbolic expression brings up a fuller understanding of oneself, and can support individual, communal, and societal transformation.",
    ],
    credentials: [
      "Art Therapist",
    ],
  },
  {
    slug: "shadin-haque",
    name: "Shadin Haque",
    role: "Reiki Master Teacher",
    focus: ["Energy work", "Reiki"],
    pillars: ["Body", "Soul"],
    short:
      "Reiki Master Teacher. Combines Reiki with sound healing and chakra balancing, and offers sessions for pets as well as people.",
    bio: [
      "Reiki Master Teacher. Combines Reiki with sound healing and chakra balancing. Notably offers sessions for pets as well as for people.",
    ],
    credentials: [
      "Reiki Master Teacher",
      "Sound healing & chakra balancing",
      "Sessions for people and pets",
    ],
  },
  {
    slug: "abhijeet-vaishnav",
    name: "Abhijeet Vaishnav",
    role: "Fitness Trainer & Sports Nutritionist",
    focus: ["Fitness", "Nutrition"],
    pillars: ["Body"],
    short:
      "Certified fitness trainer and Sports Nutritionist from India. Also holds a full-time corporate role.",
    bio: [
      "Fitness and nutrition coach from India. A certified fitness trainer in strength and functional training, and a certified Sports Nutritionist. Also holds a full-time corporate job.",
    ],
    credentials: [
      "Certified Fitness Trainer — Strength & Functional Training",
      "Certified Sports Nutritionist",
    ],
  },
];

export function getExpert(slug: string) {
  return EXPERTS.find((e) => e.slug === slug);
}

export const EXPERT_FILTERS = [
  "All",
  "Individual",
  "Couples",
  "Corporate",
  "Meditation",
  "Art therapy",
  "Energy work",
  "Fitness",
] as const;
