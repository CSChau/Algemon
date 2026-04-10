// ═══════════════════════════════════════════════════════════════
// ALGEMON MATH BATTLE v4 — GAME DATA
//
// Editing guide:
//   • easy / hard MCQuestion arrays: correct = 0-based index of right option
//   • shortAnswer SAQuestion: answer = exact string (spaces & case ignored)
//   • hint: shown when HINT button used (free at Lv5, or costs 1 Hint Tool)
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────
export const ALGEMON_TYPES = ["Fire", "Water", "Grass"] as const;
export type AlgemonType = (typeof ALGEMON_TYPES)[number];

export const TOPIC_KEYS = [
  "factorization", "changeOfSubject", "inequalities",
  "indices", "simultaneous", "polynomials", "quadratic", "functions",
] as const;
export type TopicKey = (typeof TOPIC_KEYS)[number];

export interface MCQuestion   { text: string; options: string[]; correct: number; }
export interface SAQuestion   { text: string; answer: string; }
export interface TopicData {
  topicName:   string;
  hint:        string;
  easy:        MCQuestion[];
  hard:        MCQuestion[];
  shortAnswer: SAQuestion[];
}

// ── Visual maps ───────────────────────────────────────────────
export const TYPE_COLOR: Record<AlgemonType, string> = {
  Fire: "#e05c00", Water: "#1565c0", Grass: "#2d7a27",
};
export const TYPE_EMOJI: Record<AlgemonType, string> = {
  Fire: "🔥", Water: "💧", Grass: "🌿",
};
export const TYPE_TOPIC: Record<AlgemonType, TopicKey> = {
  Fire: "changeOfSubject", Water: "factorization", Grass: "inequalities",
};

// ── Wild-battle enemy per player type ────────────────────────
export const WILD_ENEMY: Record<AlgemonType, {
  name: string; color: string; emoji: string;
  catchType: AlgemonType; speciesId: string;
}> = {
  Fire:  { name: "Aqua Specter",  color: "#1565c0", emoji: "💧", catchType: "Water", speciesId: "aqua-specter"  },
  Water: { name: "Flora Specter", color: "#2d7a27", emoji: "🌿", catchType: "Grass", speciesId: "flora-specter" },
  Grass: { name: "Cryo Specter",  color: "#00838f", emoji: "❄️", catchType: "Water", speciesId: "cryo-specter"  },
};

// ── Battle constants ──────────────────────────────────────────
export const PLAYER_MAX_HP        = 100;
export const WILD_ENEMY_MAX_HP    = 60;
export const GYM_ENEMY_MAX_HP     = 100;
export const ELITE_ENEMY_MAX_HP   = 120;
export const WILD_CORRECT_DMG     = 30;
export const GYM_CORRECT_DMG      = 50;
export const ELITE_CORRECT_DMG    = 60;
export const WRONG_DMG            = 20;
export const CATCH_HP_PCT         = 0.30;
export const XP_PER_CORRECT_WILD  = 30;
export const XP_PER_CORRECT_GYM   = 50;
export const XP_PER_CORRECT_ELITE = 80;
export const XP_PER_LEVEL         = 100;
export const HINT_MIN_LEVEL       = 5;
export const HINT_TOOL_COST       = 50;
export const ALGEBALL_COST        = 50;
export const POTION_COST          = 30;
export const POTION_HEAL          = 20;
export const WILD_WIN_COINS       = 30;
export const GYM_WIN_COINS        = 100;
export const ELITE_WIN_COINS      = 200;

// ── Utilities ─────────────────────────────────────────────────
export function xpToLevel(xp: number): number  { return Math.min(10, Math.floor(xp / XP_PER_LEVEL) + 1); }
export function xpToNextLevel(xp: number): number {
  const lv = xpToLevel(xp);
  return lv >= 10 ? 0 : lv * XP_PER_LEVEL - xp;
}
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function normalizeAns(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

// ═══════════════════════════════════════════════════════════════
// ALGE_DB — question bank (8 topics)
// ═══════════════════════════════════════════════════════════════
export const ALGE_DB: Record<TopicKey, TopicData> = {

  factorization: {
    topicName: "Factorization",
    hint: "Factor out any common factor first, then look for Difference of Two Squares (a²−b²=(a+b)(a−b)) or trinomial patterns ax²+bx+c.",
    easy: [
      { text: "Factorise: x² + 5x + 6", options: ["(x+1)(x+6)", "(x+2)(x+3)", "(x+3)(x+3)", "(x−2)(x−3)"], correct: 1 },
      { text: "Factorise: x² − 9", options: ["(x−3)²", "(x+9)(x−1)", "(x+3)(x−3)", "(x−9)(x+1)"], correct: 2 },
      { text: "Factorise: x² − 6x + 9", options: ["(x+3)(x−3)", "(x−9)(x+1)", "(x−3)²", "(x+3)²"], correct: 2 },
    ],
    hard: [
      { text: "Factorise completely: 4x² − 12x + 9", options: ["(2x−3)²", "(4x−9)(x−1)", "(2x+3)²", "(4x−3)(x−3)"], correct: 0 },
      { text: "Factorise completely: 6x² + 5x − 6", options: ["(3x−2)(2x+3)", "(6x−1)(x+6)", "(3x+2)(2x−3)", "(2x+3)(3x−2)"], correct: 3 },
      { text: "Factorise completely: x³ − x", options: ["x(x−1)²", "x(x+1)(x−1)", "x²(x−1)", "(x²−1)x"], correct: 1 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nFactorise: x² − 16\n(e.g. (x+4)(x-4))", answer: "(x+4)(x-4)" },
      { text: "CATCH CHALLENGE!\nFactorise: x² + 8x + 15\n(e.g. (x+3)(x+5))", answer: "(x+3)(x+5)" },
    ],
  },

  changeOfSubject: {
    topicName: "Change of Subject",
    hint: "Isolate the target variable step by step using inverse operations in reverse order. If it appears in a fraction, cross-multiply first!",
    easy: [
      { text: "Make x the subject: y = 3x + 5", options: ["x=(y−5)/3", "x=y/3−5", "x=(y+5)/3", "x=3y−5"], correct: 0 },
      { text: "Make r the subject: A = πr²", options: ["r=√(A/π)", "r=A/π", "r=√(Aπ)", "r=A²/π"], correct: 0 },
      { text: "Make h the subject: V = ½bh", options: ["h=2V/b", "h=V/b", "h=Vb/2", "h=b/(2V)"], correct: 0 },
    ],
    hard: [
      { text: "Make x the subject: y = (2x − 1)/(x + 3)", options: ["x=(3y+1)/(2−y)", "x=(y+1)/(2−3y)", "x=(1−3y)/(y−2)", "x=(2y+1)/(y−3)"], correct: 0 },
      { text: "Make x the subject: y = √(x − 4)", options: ["x=y²+4", "x=y²−4", "x=√y+4", "x=(y+4)²"], correct: 0 },
      { text: "Make x the subject: y = x/(x − 2)", options: ["x=2y/(y−1)", "x=y/(y−2)", "x=2/(y−1)", "x=(y+2)/y"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nMake x the subject: y = 2x − 3\n(e.g. x=(y+3)/2)", answer: "x=(y+3)/2" },
      { text: "CATCH CHALLENGE!\nMake x the subject: y = 5x\n(e.g. x=y/5)", answer: "x=y/5" },
    ],
  },

  inequalities: {
    topicName: "Inequalities",
    hint: "FLIP the inequality sign when you multiply or divide BOTH sides by a NEGATIVE number. Everything else stays the same as normal algebra.",
    easy: [
      { text: "Solve: 2x + 3 > 7", options: ["x>2", "x>5", "x<2", "x≥2"], correct: 0 },
      { text: "Solve: −3x ≤ 9", options: ["x≤−3", "x≥−3", "x≥3", "x≤3"], correct: 1 },
      { text: "Solve: x/2 − 1 < 3", options: ["x<8", "x<4", "x<2", "x>8"], correct: 0 },
    ],
    hard: [
      { text: "Solve: (2x−1)/3 > (x+2)/2\n[Multiply both sides by 6]", options: ["x>8", "x>2", "x<8", "x>−8"], correct: 0 },
      { text: "Solve: 5 − 2x > 1", options: ["x>2", "x<2", "x>−2", "x<−2"], correct: 1 },
      { text: "Solve: −4 ≤ 2x + 2 ≤ 10", options: ["−3≤x≤4", "−2≤x≤5", "−1≤x≤4", "−3≤x≤5"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve: 4x − 2 > 10\n(e.g. x>3)", answer: "x>3" },
      { text: "CATCH CHALLENGE!\nSolve: −2x < 6\n(e.g. x>-3)", answer: "x>-3" },
    ],
  },

  indices: {
    topicName: "Indices",
    hint: "For fractional indices: x^(m/n) = (ⁿ√x)^m — find the root first, then raise to the power. To multiply: add powers. To divide: subtract powers.",
    easy: [],
    hard: [
      { text: "Simplify: (2x²y)³ ÷ (4xy²)", options: ["2x⁵y", "8x⁵y", "2x⁵y²", "4x⁵y"], correct: 0 },
      { text: "Evaluate: 27^(2/3)", options: ["9", "3", "18", "6"], correct: 0 },
      { text: "Simplify: (4x²)^(3/2)", options: ["8x³", "4x³", "8x²", "6x³"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nEvaluate: 8^(1/3) + 4^(1/2)\n(give a number)", answer: "4" },
      { text: "CATCH CHALLENGE!\nSimplify: x⁵ ÷ x²\n(e.g. x^3)", answer: "x^3" },
    ],
  },

  simultaneous: {
    topicName: "Simultaneous Equations",
    hint: "Substitution: isolate one variable, then substitute. Elimination: multiply equations to match a coefficient, then add or subtract to remove one variable.",
    easy: [],
    hard: [
      { text: "Solve:\n2x + 3y = 12\nx − y = 1\nFind x.", options: ["x=3", "x=2", "x=4", "x=1"], correct: 0 },
      { text: "Solve:\n5x − y = 7\n2x + y = 0\nFind y.", options: ["y=−2", "y=2", "y=7", "y=−7"], correct: 0 },
      { text: "Solve:\n3x + 2y = 16\nx = 2y\nFind x.", options: ["x=4", "x=2", "x=8", "x=16"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve: x + y = 5, x − y = 1\nWhat is x? (just the number)", answer: "3" },
      { text: "CATCH CHALLENGE!\nSolve: 2x + y = 7, y = 1\nWhat is x? (just the number)", answer: "3" },
    ],
  },

  polynomials: {
    topicName: "Polynomials",
    hint: "Remainder Theorem: f(a) = remainder when f(x) ÷ (x−a). Factor Theorem: (x−a) is a factor of f(x) if and only if f(a) = 0.",
    easy: [],
    hard: [
      { text: "If f(x) = x³ − 3x + 2, find f(−1).", options: ["4", "0", "−4", "2"], correct: 0 },
      { text: "When f(x) = x³ + ax² − x + 3 is divided by (x−1), the remainder is 5. Find a.", options: ["a=2", "a=3", "a=−2", "a=1"], correct: 0 },
      { text: "If (x−2) is a factor of f(x) = x³ − kx² + 4, find k.", options: ["k=3", "k=4", "k=2", "k=−3"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf f(x) = 2x² + x − 3, find f(2).\n(just the number)", answer: "7" },
      { text: "CATCH CHALLENGE!\nFind the remainder when x³ − 2x + 1 is divided by (x−1).\n(just the number)", answer: "0" },
    ],
  },

  quadratic: {
    topicName: "Quadratic Equations",
    hint: "Discriminant Δ = b²−4ac. Δ>0: two distinct real roots. Δ=0: one repeated root. Δ<0: no real roots. Formula: x = (−b ± √Δ) / 2a.",
    easy: [],
    hard: [
      { text: "Solve: 2x² − 7x + 3 = 0.\nOne root is x = ½. Find the other root.", options: ["x=3", "x=−3", "x=7", "x=1/3"], correct: 0 },
      { text: "Find the discriminant of 3x² − 4x + 2 = 0.", options: ["−8", "8", "40", "−40"], correct: 0 },
      { text: "x² − 6x + k = 0 has equal roots. Find k.", options: ["9", "3", "6", "−9"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve x² − 4 = 0.\nGive both roots separated by comma (e.g. 2,-2)", answer: "2,-2" },
      { text: "CATCH CHALLENGE!\nDiscriminant of x² + 2x + 1 = 0?\n(just the number)", answer: "0" },
    ],
  },

  functions: {
    topicName: "Functions & Graphs",
    hint: "Inverse function f⁻¹: swap x and y, then solve for the new y. Composite fg(x): apply g first, then f to that result.",
    easy: [],
    hard: [
      { text: "If f(x) = 2x − 3, find f⁻¹(x).", options: ["(x+3)/2", "(x−3)/2", "2x+3", "1/(2x−3)"], correct: 0 },
      { text: "If f(x) = x² and g(x) = x + 2, find fg(3).\n[fg(3) = f(g(3))]", options: ["25", "11", "5", "17"], correct: 0 },
      { text: "The vertex of y = (x − 3)² + 5 is at:", options: ["(3, 5)", "(−3, 5)", "(3, −5)", "(5, 3)"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf f(x) = x + 4, find f(−2).\n(just the number)", answer: "2" },
      { text: "CATCH CHALLENGE!\nIf f(x) = 3x and g(x) = x−1, find gf(2).\n(just the number)", answer: "5" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// GYM_DATA — the 8 Tai Po Gyms
// ═══════════════════════════════════════════════════════════════
export interface GymDef {
  id: number; locationName: string; gymName: string;
  leaderName: string; topic: TopicKey; badge: string;
  enemyName: string; enemyColor: string; enemyEmoji: string;
  catchType: AlgemonType; speciesId: string; reward: number;
}

export const GYM_DATA: GymDef[] = [
  { id: 0, locationName: "Lam Tsuen Valley",         gymName: "Lam Tsuen Gym",  leaderName: "Leader Fern",  topic: "factorization",  badge: "Petal Badge",   enemyName: "Fern's Factorion",   enemyColor: "#2d7a27", enemyEmoji: "🌿", catchType: "Grass", speciesId: "factorion",  reward: 100 },
  { id: 1, locationName: "Tai Po Market",             gymName: "Market Gym",     leaderName: "Leader Marx",  topic: "changeOfSubject",badge: "Subject Badge", enemyName: "Marx's Metamorphon", enemyColor: "#1565c0", enemyEmoji: "💧", catchType: "Water", speciesId: "metamorphon",reward: 100 },
  { id: 2, locationName: "Tai Mei Tuk",               gymName: "Lakeside Gym",   leaderName: "Leader Ines",  topic: "inequalities",   badge: "Balance Badge", enemyName: "Ines's Inequalon",   enemyColor: "#00838f", enemyEmoji: "❄️", catchType: "Water", speciesId: "inequalon", reward: 100 },
  { id: 3, locationName: "Plover Cove Reservoir",     gymName: "Reservoir Gym",  leaderName: "Leader Xander",topic: "indices",        badge: "Power Badge",   enemyName: "Xander's Exponent",  enemyColor: "#6a1b9a", enemyEmoji: "⚡", catchType: "Fire",  speciesId: "exponent",   reward: 100 },
  { id: 4, locationName: "Tai Po Industrial Estate",  gymName: "Factory Gym",    leaderName: "Leader Simon", topic: "simultaneous",   badge: "Dual Badge",    enemyName: "Simon's Simultanon", enemyColor: "#e65100", enemyEmoji: "🔩", catchType: "Fire",  speciesId: "simultanon", reward: 100 },
  { id: 5, locationName: "Lo Shue Ling",              gymName: "Highland Gym",   leaderName: "Leader Poly",  topic: "polynomials",    badge: "Degree Badge",  enemyName: "Poly's Polynomion",  enemyColor: "#880e4f", enemyEmoji: "🌺", catchType: "Water", speciesId: "polynomion", reward: 100 },
  { id: 6, locationName: "Tai Po Mega Mall",          gymName: "Mall Gym",       leaderName: "Leader Quinn", topic: "quadratic",      badge: "Apex Badge",    enemyName: "Quinn's Quadraton",  enemyColor: "#b71c1c", enemyEmoji: "🔺", catchType: "Fire",  speciesId: "quadraton",  reward: 100 },
  { id: 7, locationName: "Sam Mun Tsai Village",      gymName: "Harbour Gym",    leaderName: "Leader Fiona", topic: "functions",      badge: "Curve Badge",   enemyName: "Fiona's Functeon",   enemyColor: "#b8860b", enemyEmoji: "🌊", catchType: "Grass", speciesId: "functeon",   reward: 100 },
];

// ═══════════════════════════════════════════════════════════════
// ELITE FOUR — unlocked after all 8 gyms
// ═══════════════════════════════════════════════════════════════
export interface EliteDef {
  id: number; name: string; title: string;
  enemyName: string; enemyColor: string; enemyEmoji: string;
  catchType: AlgemonType; speciesId: string;
  questions: MCQuestion[];
}

export const ELITE_FOUR: EliteDef[] = [
  {
    id: 0, name: "Algeius", title: "Master of Form",
    enemyName: "Algeius's Formix", enemyColor: "#4a148c", enemyEmoji: "🔮",
    catchType: "Fire", speciesId: "formix",
    questions: [
      { text: "Simplify: (x² − 4) / (x² + 4x + 4)\n[Factorise both numerator and denominator]",
        options: ["(x−2)/(x+2)", "(x+2)/(x−2)", "(x−2)²/(x+4)", "1/(x+2)"], correct: 0 },
      { text: "Make k the subject: m = √(2k/g)",
        options: ["k=m²g/2", "k=m²/(2g)", "k=2m/g", "k=m²g"], correct: 0 },
      { text: "Factorise x⁴ − 1 completely.",
        options: ["(x²+1)(x+1)(x−1)", "(x²+1)(x²−1)", "(x+1)²(x−1)²", "(x²−1)²"], correct: 0 },
    ],
  },
  {
    id: 1, name: "Numbrix", title: "Master of Power",
    enemyName: "Numbrix's Powrix", enemyColor: "#1a237e", enemyEmoji: "💥",
    catchType: "Water", speciesId: "powrix",
    questions: [
      { text: "Solve the quadratic inequality: x² − 5x + 6 > 0\n(Hint: factorise first)",
        options: ["x<2  or  x>3", "2<x<3", "x<−2  or  x>3", "x≤2  or  x≥3"], correct: 0 },
      { text: "If 4^x = 8, find x.\n[Write both sides as powers of 2]",
        options: ["3/2", "2", "3", "1/2"], correct: 0 },
      { text: "Evaluate: (√2)⁸",
        options: ["16", "8", "4", "32"], correct: 0 },
    ],
  },
  {
    id: 2, name: "Equalis", title: "Master of Systems",
    enemyName: "Equalis's Solvrix", enemyColor: "#004d40", enemyEmoji: "⚖️",
    catchType: "Grass", speciesId: "solvrix",
    questions: [
      { text: "Solve:\nx + 2y = 7\nx − y = 1\nFind the product xy.",
        options: ["6", "5", "3", "4"], correct: 0 },
      { text: "If f(x) = x³ + 2x² − 5x − 6, what is f(2)?",
        options: ["0", "4", "−6", "2"], correct: 0 },
      { text: "Given x³ + 2x² − 5x − 6 = (x−2)(x+a)(x+b),\nfind a + b.",
        options: ["4", "3", "−4", "1"], correct: 0 },
    ],
  },
  {
    id: 3, name: "Champion Mathex", title: "The Champion",
    enemyName: "Mathex's Apexion", enemyColor: "#b71c1c", enemyEmoji: "👑",
    catchType: "Fire", speciesId: "apexion",
    questions: [
      { text: "The quadratic y = x² − 4x + 3 crosses the x-axis at:\n(Hint: factorise y)",
        options: ["x=1 and x=3", "x=−1 and x=3", "x=1 and x=−3", "x=2 (double root)"], correct: 0 },
      { text: "If g(x) = (x−1)² for x ≥ 1, find g⁻¹(4).",
        options: ["3", "−1", "2", "4"], correct: 0 },
      { text: "The graph y = 2(x − 1)² + 3 has minimum value:",
        options: ["3", "2", "1", "5"], correct: 0 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// SPECIES LIST — 24 collectibles (3 per topic)
// ═══════════════════════════════════════════════════════════════
export const SPECIES_LIST: { id: string; name: string; emoji: string; topic: string }[] = [
  // Factorization (3)
  { id: "flora-specter", name: "Flora Specter",    emoji: "🌿", topic: "Factorization"       },
  { id: "factorion",     name: "Fern's Factorion", emoji: "🌿", topic: "Factorization"       },
  { id: "algefern",      name: "Algefern",         emoji: "🌱", topic: "Factorization"       },
  // Change of Subject (3)
  { id: "aqua-specter",  name: "Aqua Specter",       emoji: "💧", topic: "Change of Subject"   },
  { id: "metamorphon",   name: "Marx's Metamorphon", emoji: "💧", topic: "Change of Subject"   },
  { id: "varbeast",      name: "Varbeast",           emoji: "🌀", topic: "Change of Subject"   },
  // Inequalities (3)
  { id: "cryo-specter",  name: "Cryo Specter",      emoji: "❄️", topic: "Inequalities"        },
  { id: "inequalon",     name: "Ines's Inequalon",  emoji: "❄️", topic: "Inequalities"        },
  { id: "signix",        name: "Signix",            emoji: "⚡", topic: "Inequalities"        },
  // Indices (3)
  { id: "exponent",      name: "Xander's Exponent", emoji: "⚡", topic: "Indices"             },
  { id: "indextra",      name: "Indextra",          emoji: "🔋", topic: "Indices"             },
  { id: "powrex",        name: "Powrex",            emoji: "💥", topic: "Indices"             },
  // Simultaneous (3)
  { id: "simultanon",    name: "Simon's Simultanon", emoji: "🔩", topic: "Simultaneous Eqs"   },
  { id: "duabot",        name: "Duabot",             emoji: "🤖", topic: "Simultaneous Eqs"   },
  { id: "solvix",        name: "Solvix",             emoji: "⚙️", topic: "Simultaneous Eqs"   },
  // Polynomials (3)
  { id: "polynomion",    name: "Poly's Polynomion",  emoji: "🌺", topic: "Polynomials"        },
  { id: "rootling",      name: "Rootling",           emoji: "🍃", topic: "Polynomials"        },
  { id: "termion",       name: "Termion",            emoji: "🔬", topic: "Polynomials"        },
  // Quadratic (3)
  { id: "quadraton",     name: "Quinn's Quadraton",  emoji: "🔺", topic: "Quadratic Eqs"      },
  { id: "parabolix",     name: "Parabolix",          emoji: "📈", topic: "Quadratic Eqs"      },
  { id: "apexion",       name: "Mathex's Apexion",   emoji: "👑", topic: "Quadratic Eqs"      },
  // Functions (3)
  { id: "functeon",      name: "Fiona's Functeon",   emoji: "🌊", topic: "Functions & Graphs" },
  { id: "curvon",        name: "Curvon",             emoji: "📉", topic: "Functions & Graphs" },
  { id: "inverson",      name: "Inverson",           emoji: "🔄", topic: "Functions & Graphs" },
];

// ═══════════════════════════════════════════════════════════════
// STUDY GUIDE — Alge-Library cheat sheet content
// ═══════════════════════════════════════════════════════════════
export interface StudySection {
  topicName: string;
  emoji:     string;
  formulas:  string[];
  traps:     string[];
}

export const STUDY_GUIDE: StudySection[] = [
  {
    topicName: "Factorization",  emoji: "🌿",
    formulas: [
      "a² − b² = (a+b)(a−b)   [Difference of 2 Squares]",
      "a² ± 2ab + b² = (a ± b)²   [Perfect Square]",
      "ax² + bx + c: find two numbers with product=ac and sum=b",
    ],
    traps: ["Always factor out the GCF first!", "3x² − 3 = 3(x²−1) = 3(x+1)(x−1)"],
  },
  {
    topicName: "Change of Subject",  emoji: "💧",
    formulas: [
      "Step 1: Isolate all terms containing target variable",
      "Step 2: Factor out the target variable if needed",
      "Step 3: Divide both sides",
    ],
    traps: [
      "y = (ax+b)/(cx+d) → cross-multiply: y(cx+d) = ax+b, then collect x terms",
      "y = √(x+a) → square both sides: y² = x+a → x = y²−a",
    ],
  },
  {
    topicName: "Inequalities",  emoji: "❄️",
    formulas: [
      "Treat like an equation BUT flip < / > when × or ÷ by a negative",
      "For −3x < 9: divide by −3 → x > −3   (sign flips!)",
      "Compound: −4 ≤ 2x+2 ≤ 10 → subtract 2 → divide by 2",
    ],
    traps: [
      "−2x < 6  →  x > −3   (NOT x < −3)",
      "Combined inequality: apply same operation to ALL THREE parts",
    ],
  },
  {
    topicName: "Indices",  emoji: "⚡",
    formulas: [
      "aᵐ × aⁿ = aᵐ⁺ⁿ       aᵐ ÷ aⁿ = aᵐ⁻ⁿ",
      "(aᵐ)ⁿ = aᵐⁿ          (ab)ⁿ = aⁿbⁿ",
      "a⁰ = 1                a⁻ⁿ = 1/aⁿ",
      "a^(m/n) = (ⁿ√a)^m    — find the root FIRST, then power",
    ],
    traps: [
      "27^(2/3): cube-root first → 3, then square → 9",
      "4^(3/2): √4=2, then 2³=8",
    ],
  },
  {
    topicName: "Simultaneous Equations",  emoji: "🔩",
    formulas: [
      "Substitution: isolate one variable, sub into other equation",
      "Elimination: multiply to match a coefficient, then add/subtract equations",
    ],
    traps: [
      "After finding x, always substitute back to find y",
      "Check: substitute both values into BOTH original equations",
    ],
  },
  {
    topicName: "Polynomials",  emoji: "🌺",
    formulas: [
      "Remainder Theorem: f(a) = remainder when f(x) ÷ (x−a)",
      "Factor Theorem: (x−a) is a factor  ⟺  f(a) = 0",
    ],
    traps: [
      "Dividing by (x+a) means substitute x = −a, not +a!",
      "Always expand carefully and watch signs",
    ],
  },
  {
    topicName: "Quadratic Equations",  emoji: "🔺",
    formulas: [
      "Δ = b² − 4ac     (discriminant)",
      "Δ > 0: two distinct real roots",
      "Δ = 0: one repeated root",
      "Δ < 0: no real roots",
      "x = (−b ± √Δ) / 2a",
    ],
    traps: [
      "For 3x²−4x+2: a=3, b=−4, c=2 → Δ = 16−24 = −8 (no real roots)",
      "Equal roots → set Δ = 0 and solve for the unknown constant",
    ],
  },
  {
    topicName: "Functions & Graphs",  emoji: "🌊",
    formulas: [
      "Inverse f⁻¹: replace f(x) with y, swap x and y, solve for y",
      "Composite fg(x): apply g first, then f to the result",
      "Vertex form: y = a(x−h)² + k  →  vertex at (h, k)",
    ],
    traps: [
      "fg(3) = f(g(3)) — apply g first!   gf(3) = g(f(3)) — apply f first!",
      "y = (x−3)²+5: vertex is (3, 5) not (−3, 5)",
    ],
  },
];
