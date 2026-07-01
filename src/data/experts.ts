export type Expert = {
  slug: string;
  name: string;
  role: string;
  focus: string[]; // filter tags
  languages: string[];
  pillars: ("Mind" | "Body" | "Soul")[];
  location: "Dhaka" | "Online";
  short: string; // 1-line summary for directory
  quote?: string;
  bio: string[]; // paragraphs — real bio from live site
  credentials: string[];
  approach: string[]; // paragraphs — "how they actually work with clients" (Nirvana-authored)
  specialties: string[];
};

export const EXPERTS: Expert[] = [
  {
    slug: "sumaia-azmi",
    name: "Sumaia Azmi",
    role: "Founder & Clinical Director · Counselor Psychologist, Life Coach, Corporate Trainer",
    focus: ["Individual", "Couples", "Corporate", "Coaching"],
    languages: ["English", "Bangla"],
    pillars: ["Mind", "Soul"],
    location: "Dhaka",
    short:
      "Founder of Nirvana. Integrative counseling and coaching across individuals, couples, and organisations.",
    quote:
      "Nobody cares how much you know until they know how much you care.",
    bio: [
      "Addressing only one's mental and emotional issues is never enough. It requires a compassionate approach involving understanding, connection, and healing through attentive listening, unwavering support, and the cultivation of meaningful rapport. Over my 8-year professional journey, I've successfully connected with individuals from diverse backgrounds, establishing rapport and addressing core issues hindering personal progress. My clientele spans various age groups, representing different social, cultural, and organisational contexts, enriching my experience.",
      "As a Mental Health Professional with a Life Coach certification, my vision for success lies in the application of a holistic approach to wellness coaching. This approach aims to guide individuals, groups, and organisations in overcoming resistance to change and facilitating progress. I firmly believe in fostering sustainable behavioural changes by recognising and amplifying individuals' skills, strengths, and resources, directing them towards achievable, value-based objectives.",
      "My journey is fuelled by a genuine desire to create and add value to lives. I'm dedicated to empowering clients, couples, and corporations by encouraging the exploration of core values, the setting of meaningful goals, and excelling with available resources and tools.",
    ],
    credentials: [
      "Counselor Psychologist & Certified Life Coach",
      "Corporate Wellness Trainer",
      "Founder — Nirvana Wellness (est. 2020)",
    ],
    approach: [
      "First sessions with Sumaia are unhurried. She spends most of the first hour listening — mapping where you actually are before deciding, together, what a useful path forward looks like. There is no protocol applied on top of you.",
      "Her work sits at the intersection of therapy and coaching: enough clinical grounding to hold heavier material safely, and enough coaching structure that you leave with something concrete to try before the next session.",
      "With couples and teams she is direct without being harsh — surfacing the pattern in the room and helping people name it, so the conversation can finally happen out loud.",
    ],
    specialties: [
      "Anxiety, burnout, life transitions",
      "Couples & relationship work",
      "Career and leadership coaching",
      "Corporate wellbeing program design",
    ],
  },
  {
    slug: "sanjida-afroz",
    name: "Sanjida Afroz",
    role: "Psychotherapist · Certified NLP Master Practitioner · Family & Couple Therapist",
    focus: ["Individual", "Couples", "Family"],
    languages: ["English", "Bangla"],
    pillars: ["Mind"],
    location: "Dhaka",
    short:
      "10+ years of psychotherapy across families, couples, and individuals — with an NLP and TA lens.",
    quote:
      "Know your story, know the new way of living.",
    bio: [
      "\"No health without mental health.\" How we feel and think affects our behaviour, and it has a huge impact on every aspect of life — self-image, education, sleep, relationships, and physical health. Our mind and body are connected. Care for your mental health as much as your physical health; there is no fixed age for beginning.",
      "I have been working for more than 10 years in this field and I believe that our self-limiting core beliefs put us down and keep us from moving forward. It is the right time to uncover those beliefs and understand your story, so you can step outside of it and develop new ways of living. We cannot change the past, but we can begin our journey by understanding it.",
      "Clinical Counselor at Bangladesh University of Engineering and Technology (BUET).",
    ],
    credentials: [
      "B.Sc & M.Sc in Psychology, Dhaka University",
      "M.Sc in Counseling Psychology, Dhaka University",
      "Diploma — Transactional Analysis & NLP (India)",
      "Diploma — Family & Couple Therapy (India)",
      "Certification — Disability & Rehabilitation (Canada)",
      "NLP Master Practitioner (India), affiliated by CTAA",
    ],
    approach: [
      "Sanjida works from the belief that most stuck feelings are stories we've stopped questioning. Sessions move gently between talk therapy, TA (Transactional Analysis), and NLP techniques — depending on what the moment calls for.",
      "With couples and families she creates enough safety in the room for both people to say the thing they've been avoiding, then helps translate it into something the other person can actually hear.",
      "Expect structured, warm sessions with concrete reframes you can carry into the week.",
    ],
    specialties: [
      "Anxiety, self-esteem, core-belief work",
      "Couples & family therapy",
      "NLP and Transactional Analysis",
      "Adolescents & young adults",
    ],
  },
  {
    slug: "dr-richard-castle",
    name: "Dr. Richard Castle",
    role: "Consultant Psychologist · Online (English)",
    focus: ["Individual", "Trauma", "Online"],
    languages: ["English"],
    pillars: ["Mind"],
    location: "Online",
    short:
      "UK-registered consultant psychologist. Trauma, BPD, and eating-disorder work delivered online worldwide.",
    bio: [
      "Dr. Richard Castle is a Consultant Psychologist offering English-language support to clients worldwide. He specialises in trauma-related issues, Borderline Personality Disorder, and Eating Disorders, delivering online sessions that let clients across the globe access expert care.",
      "Dr. Castle is a Chartered Psychologist registered with the UK Health and Care Professions Council and an Associate Fellow of the British Psychological Society. He holds a doctorate in psychology and a master's degree in stress management. His academic and research work, combined with nearly 20 years of hands-on experience, has made him a sought-after expert in mental health and trauma recovery.",
      "His career began in the UK Royal Air Force, providing psychological support to personnel on active operations. After leaving the RAF in 2012, he moved into advisory and consultancy roles in disaster management — in the UK and internationally, including Bangladesh. He was central to bringing Mental Health First Aid (MHFA) to Bangladesh in 2015 and has collaborated with the Acid Survivors Foundation in Dhaka to support survivors of trauma.",
    ],
    credentials: [
      "Doctorate in Psychology · MSc in Stress Management",
      "Chartered Psychologist — UK HCPC-registered",
      "Associate Fellow — British Psychological Society",
      "Certified DBT provider · Licensed MHFA instructor",
    ],
    approach: [
      "Dr. Castle's sessions are considered, structured, and paced for people who've been through a lot. He does not push for disclosure; he builds the container first.",
      "His primary modality is Dialectical Behavioural Therapy (DBT), used to help clients regulate emotions and behaviours — especially with Borderline Personality Disorder, PTSD, or eating disorders. He combines it with trauma-informed care drawn from 20 years of humanitarian and crisis work.",
      "Sessions are online, in English, and open to clients anywhere in the world.",
    ],
    specialties: [
      "Trauma & PTSD",
      "Borderline Personality Disorder (DBT)",
      "Eating disorders",
      "Humanitarian & crisis-context work",
    ],
  },
  {
    slug: "stanislas-ll",
    name: "Stanislas LL",
    role: "Mindfulness & Heartfulness Meditation Guide",
    focus: ["Meditation", "Corporate", "Individual"],
    languages: ["English", "French"],
    pillars: ["Soul"],
    location: "Dhaka",
    short:
      "20 years of meditation practice. Heart-based sessions for individuals, universities, and corporate teams.",
    bio: [
      "Stanislas works for the French Diplomacy. He served several years at the Crisis Center in Paris and has extensive experience abroad — posted in China, India, Turkey, Slovakia, and now Bangladesh. He holds a Master's degree in Law and Economy (France) and has been certified in Mindfulness and Heartfulness meditation for the past 20 years.",
      "He loves sharing awareness and heart-based practices to bring wellness and inner transformation. He conducts programs on the benefits of meditation from a scientific perspective at universities, and works with professionals in corporations on wellness, performance, emotional intelligence, and leadership.",
      "Stanislas is closely associated with the Heartfulness Institute and offers his time following the principle of gift ecology.",
    ],
    credentials: [
      "20 years of Mindfulness & Heartfulness practice",
      "Master's — Law and Economy (France)",
      "Facilitator — Heartfulness Institute",
    ],
    approach: [
      "Stanislas begins where you are — no expectation of prior practice. Sessions weave short guided sits with a plain-spoken framing of what meditation is actually doing at a neurological and relational level.",
      "For corporate groups he focuses less on 'wellness' as an idea and more on how heart-based awareness changes how a team makes decisions under pressure.",
      "Offered in English or French, in person or online.",
    ],
    specialties: [
      "Guided Heartfulness meditation",
      "Corporate meditation programs",
      "Leadership & emotional intelligence",
      "Stress and burnout prevention",
    ],
  },
  {
    slug: "aparazita-rahman",
    name: "Aparazita Rahman",
    role: "Art Therapist",
    focus: ["Art therapy", "Individual", "Group"],
    languages: ["English", "Bangla"],
    pillars: ["Soul", "Mind"],
    location: "Dhaka",
    short:
      "Art therapy for feelings that don't yet have words — for individuals, families, and communities.",
    bio: [
      "Art therapy is an integrative mental-health practice that enriches the lives of individuals, families, and communities through active art-making and creative therapeutic processes — a space where psychological theory, social experience, and feeling are explored together.",
      "It engages the mind, body, and spirit in ways that verbal articulation alone cannot. Visual and symbolic expression brings up a fuller understanding of oneself, and can support individual, communal, and societal transformation.",
    ],
    credentials: [
      "Trained Art Therapy Practitioner",
      "Group and individual facilitation",
    ],
    approach: [
      "Aparazita's sessions are for people who feel something they cannot yet name — grief that won't move, tension that won't unclench, a story that words keep flattening.",
      "You do not need to consider yourself an artist. The mark you make on the page is the material, not its aesthetic value. She works alongside you, asking gentle questions about what appears.",
      "Group art-therapy sessions are available for teams and communities working through a shared experience.",
    ],
    specialties: [
      "Grief and emotional processing",
      "Adolescents and young adults",
      "Group and family art-therapy",
      "Post-crisis and post-trauma support",
    ],
  },
  {
    slug: "shadin-haque",
    name: "Shadin Haque",
    role: "Reiki Master · Energy Healing & Sound",
    focus: ["Energy work", "Individual", "Reiki"],
    languages: ["English", "Bangla"],
    pillars: ["Body", "Soul"],
    location: "Dhaka",
    short:
      "Reiki, sound healing, and chakra balancing — for people (and pets) carrying stress in the body.",
    bio: [
      "I am a Reiki Master who believes true healing happens when we feel heard and understood. If you're carrying stress in your body, feeling emotionally out of sync, or are simply curious about the calming power of energy work, you've found a supportive guide. My role is to help you unwind those knots and restore a sense of inner peace and balance, tailored just for you.",
      "What makes our work together unique is the personal care I put into every session. I don't use a one-size-fits-all approach. We start with a conversation about what you're experiencing — tension, anxiety, fatigue, or a general feeling of being 'stuck.' Then, using my training in Reiki and other energy-healing arts, I create a session designed specifically for your needs.",
      "A special part of my practice is that I extend this healing to pets — our animal companions hold energy and stress, too.",
    ],
    credentials: [
      "Certified Reiki Master Teacher",
      "Sound healing & chakra balancing",
      "In-person and distance sessions",
    ],
    approach: [
      "Shadin's sessions begin with a real conversation, not a form. She wants to understand what you're actually carrying before laying hands or offering a distance session.",
      "Sessions blend gentle Reiki with sound and chakra work as the moment calls for it. Practical mindfulness cues are shared so you can keep the calm alive between sessions.",
      "Available in person, at distance, and for pets.",
    ],
    specialties: [
      "Reiki (in-person and distance)",
      "Sound healing & chakra balancing",
      "Stress and burnout recovery",
      "Sessions for pets",
    ],
  },
  {
    slug: "abhijeet-vaishnav",
    name: "Abhijeet Vaishnav",
    role: "Fitness & Sports Nutritionist",
    focus: ["Fitness", "Nutrition", "Coaching"],
    languages: ["English", "Hindi"],
    pillars: ["Body"],
    location: "Online",
    short:
      "Certified fitness and nutrition coach. Body-weight training and lifestyle change for busy professionals.",
    bio: [
      "Abhijeet Vaishnav, from India, began his fitness journey at the age of 17 and never looked back. He turned his passion into a profession with a simple mission: help people adopt fitness as a lifestyle. He believes aesthetics is a by-product of fitness — it is equally important to feel good about your life and do things correctly. That only happens when you complete the tripod of fitness: exercise, nutrition, and recovery.",
      "He is not only an expert in nutrition and training, but also holds a 10-to-6 corporate job. Despite working 8 hours in an office, he still looks after his body — and one of his goals is to show that anyone, in any occupation, can achieve the physical life they want.",
      "He is a certified fitness trainer for strength and functional training, and a Sports Nutritionist. His mastery of the ketogenic diet has helped many clients transform their lives.",
    ],
    credentials: [
      "Certified Fitness Trainer — Strength & Functional Training",
      "Certified Sports Nutritionist",
      "Specialisation — Ketogenic protocols",
    ],
    approach: [
      "Abhijeet's coaching starts with your calendar, not your dumbbells. He designs body-weight and functional routines that survive real work schedules — because a plan you can't keep is not a plan.",
      "Nutrition conversations are practical: what you actually eat in a week, what small swaps compound over months. No fad language, no shame.",
      "Sessions are online and pair well with in-person psychological work at Nirvana for full mind-body support.",
    ],
    specialties: [
      "Bodyweight & functional training",
      "Sports and everyday-life nutrition",
      "Lifestyle change for desk-bound professionals",
      "Ketogenic and metabolic protocols",
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
  "Trauma",
  "Meditation",
  "Art therapy",
  "Energy work",
  "Fitness",
] as const;
