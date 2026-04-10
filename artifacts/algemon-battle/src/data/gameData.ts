// ═══════════════════════════════════════════════════════════════
// ALGEMON MATH BATTLE v3 — GAME DATA
//
// To add / edit questions:
//   • multipleChoice:  correct = index 0-3 of the right option
//   • shortAnswer:     answer  = exact accepted string (spaces
//                               and case are ignored on check)
//   • hint:            shown when HINT button is used in battle
//
// To add a new Gym, append to GYM_DATA and add a TopicKey entry
// to ALGE_DB.
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
  easy:        MCQuestion[];   // wild battles
  hard:        MCQuestion[];   // gym battles
  shortAnswer: SAQuestion[];   // catch-phase challenges
}

// ── Visual maps ───────────────────────────────────────────────
export const TYPE_COLOR: Record<AlgemonType, string> = {
  Fire:  "#e05c00",
  Water: "#1565c0",
  Grass: "#2d7a27",
};
export const TYPE_EMOJI: Record<AlgemonType, string> = {
  Fire: "🔥", Water: "💧", Grass: "🌿",
};

// Fire player → fights Water enemy → answers Change of Subject
// Water player → fights Grass enemy → answers Factorization
// Grass player → fights Ice enemy   → answers Inequalities
export const TYPE_TOPIC: Record<AlgemonType, TopicKey> = {
  Fire:  "changeOfSubject",
  Water: "factorization",
  Grass: "inequalities",
};

// Wild-battle enemy per player type
export const WILD_ENEMY: Record<AlgemonType, { name: string; color: string; emoji: string; catchType: AlgemonType }> = {
  Fire:  { name: "Aqua Specter",  color: "#1565c0", emoji: "💧", catchType: "Water" },
  Water: { name: "Flora Specter", color: "#2d7a27", emoji: "🌿", catchType: "Grass" },
  Grass: { name: "Cryo Specter",  color: "#00838f", emoji: "❄️", catchType: "Water" },
};

// ── Battle constants ──────────────────────────────────────────
export const PLAYER_MAX_HP        = 100;
export const WILD_ENEMY_MAX_HP    = 60;
export const GYM_ENEMY_MAX_HP     = 100;
export const WILD_CORRECT_DMG     = 30;  // 50% of 60 — 2 hits to win
export const GYM_CORRECT_DMG      = 50;  // 50% of 100 — 2 hits to win
export const WRONG_DMG            = 20;  // 20% of 100
export const CATCH_HP_PCT         = 0.30; // enemy must be below 30% HP
export const XP_PER_CORRECT_WILD  = 30;
export const XP_PER_CORRECT_GYM   = 50;
export const XP_PER_LEVEL         = 100;
export const HINT_MIN_LEVEL       = 5;
export const HINT_TOOL_COST       = 50;
export const WILD_WIN_COINS       = 30;
export const GYM_WIN_COINS        = 100;

// ── Utility ───────────────────────────────────────────────────
export function xpToLevel(xp: number): number {
  return Math.min(10, Math.floor(xp / XP_PER_LEVEL) + 1);
}
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

// ══════════════════════════════════════════════════════════════
// ALGE_DB  — the full question bank
// ══════════════════════════════════════════════════════════════
export const ALGE_DB: Record<TopicKey, TopicData> = {

  // ── Factorization ──────────────────────────────────────────
  factorization: {
    topicName: "Factorization",
    hint: "Factor out any common factor first, then look for Difference of Two Squares (a²−b²=(a+b)(a−b)) or trinomial patterns ax²+bx+c.",
    easy: [
      { text: "Factorise: x² + 5x + 6",
        options: ["(x+1)(x+6)", "(x+2)(x+3)", "(x+3)(x+3)", "(x−2)(x−3)"], correct: 1 },
      { text: "Factorise: x² − 9",
        options: ["(x−3)²", "(x+9)(x−1)", "(x+3)(x−3)", "(x−9)(x+1)"], correct: 2 },
      { text: "Factorise: x² − 6x + 9",
        options: ["(x+3)(x−3)", "(x−9)(x+1)", "(x−3)²", "(x+3)²"], correct: 2 },
    ],
    hard: [
      { text: "Factorise completely: 4x² − 12x + 9",
        options: ["(2x−3)²", "(4x−9)(x−1)", "(2x+3)²", "(4x−3)(x−3)"], correct: 0 },
      { text: "Factorise completely: 6x² + 5x − 6",
        options: ["(3x−2)(2x+3)", "(6x−1)(x+6)", "(3x+2)(2x−3)", "(2x+3)(3x−2)"], correct: 3 },
      { text: "Factorise completely: x³ − x",
        options: ["x(x−1)²", "x(x+1)(x−1)", "x²(x−1)", "(x²−1)x"], correct: 1 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nFactorise: x² − 16\n(e.g. (x+4)(x-4))", answer: "(x+4)(x-4)" },
      { text: "CATCH CHALLENGE!\nFactorise: x² + 8x + 15\n(e.g. (x+3)(x+5))", answer: "(x+3)(x+5)" },
    ],
  },

  // ── Change of Subject ──────────────────────────────────────
  changeOfSubject: {
    topicName: "Change of Subject",
    hint: "Isolate the target variable step by step using inverse operations in reverse order. If it appears in a fraction, cross-multiply first!",
    easy: [
      { text: "Make x the subject: y = 3x + 5",
        options: ["x=(y−5)/3", "x=y/3−5", "x=(y+5)/3", "x=3y−5"], correct: 0 },
      { text: "Make r the subject: A = πr²",
        options: ["r=√(A/π)", "r=A/π", "r=√(Aπ)", "r=A²/π"], correct: 0 },
      { text: "Make h the subject: V = ½bh",
        options: ["h=2V/b", "h=V/b", "h=Vb/2", "h=b/(2V)"], correct: 0 },
    ],
    hard: [
      { text: "Make x the subject: y = (2x − 1)/(x + 3)",
        options: ["x=(3y+1)/(2−y)", "x=(y+1)/(2−3y)", "x=(1−3y)/(y−2)", "x=(2y+1)/(y−3)"], correct: 0 },
      { text: "Make x the subject: y = √(x − 4)",
        options: ["x=y²+4", "x=y²−4", "x=√y+4", "x=(y+4)²"], correct: 0 },
      { text: "Make x the subject: y = x/(x − 2)",
        options: ["x=2y/(y−1)", "x=y/(y−2)", "x=2/(y−1)", "x=(y+2)/y"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nMake x the subject: y = 2x − 3\n(e.g. x=(y+3)/2)", answer: "x=(y+3)/2" },
      { text: "CATCH CHALLENGE!\nMake x the subject: y = 5x\n(e.g. x=y/5)", answer: "x=y/5" },
    ],
  },

  // ── Inequalities ───────────────────────────────────────────
  inequalities: {
    topicName: "Inequalities",
    hint: "FLIP the inequality sign when you multiply or divide BOTH sides by a NEGATIVE number. Everything else stays the same as normal algebra.",
    easy: [
      { text: "Solve: 2x + 3 > 7",
        options: ["x>2", "x>5", "x<2", "x≥2"], correct: 0 },
      { text: "Solve: −3x ≤ 9",
        options: ["x≤−3", "x≥−3", "x≥3", "x≤3"], correct: 1 },
      { text: "Solve: x/2 − 1 < 3",
        options: ["x<8", "x<4", "x<2", "x>8"], correct: 0 },
    ],
    hard: [
      { text: "Solve: (2x−1)/3 > (x+2)/2\n[Multiply both sides by 6]",
        options: ["x>8", "x>2", "x<8", "x>−8"], correct: 0 },
      { text: "Solve: 5 − 2x > 1",
        options: ["x>2", "x<2", "x>−2", "x<−2"], correct: 1 },
      { text: "Solve: −4 ≤ 2x + 2 ≤ 10",
        options: ["−3≤x≤4", "−2≤x≤5", "−1≤x≤4", "−3≤x≤5"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve: 4x − 2 > 10\n(e.g. x>3)", answer: "x>3" },
      { text: "CATCH CHALLENGE!\nSolve: −2x < 6\n(e.g. x>-3)", answer: "x>-3" },
    ],
  },

  // ── Indices (Gym 4) ────────────────────────────────────────
  indices: {
    topicName: "Indices",
    hint: "For fractional indices: x^(m/n) = (ⁿ√x)^m — find the root first, then raise to the power. To multiply: add powers. To divide: subtract powers.",
    easy: [],
    hard: [
      { text: "Simplify: (2x²y)³ ÷ (4xy²)",
        options: ["2x⁵y", "8x⁵y", "2x⁵y²", "4x⁵y"], correct: 0 },
      { text: "Evaluate: 27^(2/3)",
        options: ["9", "3", "18", "6"], correct: 0 },
      { text: "Simplify: (4x²)^(3/2)",
        options: ["8x³", "4x³", "8x²", "6x³"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nEvaluate: 8^(1/3) + 4^(1/2)\n(give a number)", answer: "4" },
      { text: "CATCH CHALLENGE!\nSimplify: x⁵ ÷ x²\n(e.g. x^3)", answer: "x^3" },
    ],
  },

  // ── Simultaneous Equations (Gym 5) ────────────────────────
  simultaneous: {
    topicName: "Simultaneous Equations",
    hint: "Substitution: isolate one variable, then substitute. Elimination: multiply equations to match a coefficient, then add or subtract to remove one variable.",
    easy: [],
    hard: [
      { text: "Solve the simultaneous equations:\n2x + 3y = 12\nx − y = 1\nFind x.",
        options: ["x=3", "x=2", "x=4", "x=1"], correct: 0 },
      { text: "Solve the simultaneous equations:\n5x − y = 7\n2x + y = 0\nFind y.",
        options: ["y=−2", "y=2", "y=7", "y=−7"], correct: 0 },
      { text: "Solve the simultaneous equations:\n3x + 2y = 16\nx = 2y\nFind x.",
        options: ["x=4", "x=2", "x=8", "x=16"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve: x + y = 5, x − y = 1\nWhat is x? (just the number)", answer: "3" },
      { text: "CATCH CHALLENGE!\nSolve: 2x + y = 7, y = 1\nWhat is x? (just the number)", answer: "3" },
    ],
  },

  // ── Polynomials (Gym 6) ────────────────────────────────────
  polynomials: {
    topicName: "Polynomials",
    hint: "Remainder Theorem: f(a) = remainder when f(x) ÷ (x−a). Factor Theorem: (x−a) is a factor of f(x) if and only if f(a) = 0.",
    easy: [],
    hard: [
      { text: "If f(x) = x³ − 3x + 2, find f(−1).",
        options: ["4", "0", "−4", "2"], correct: 0 },
      { text: "When f(x) = x³ + ax² − x + 3 is divided by (x−1), the remainder is 5. Find a.",
        options: ["a=2", "a=3", "a=−2", "a=1"], correct: 0 },
      { text: "If (x−2) is a factor of f(x) = x³ − kx² + 4, find k.",
        options: ["k=3", "k=4", "k=2", "k=−3"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf f(x) = 2x² + x − 3, find f(2).\n(just the number)", answer: "7" },
      { text: "CATCH CHALLENGE!\nFind the remainder when x³ − 2x + 1 is divided by (x−1).\n(just the number)", answer: "0" },
    ],
  },

  // ── Quadratic Equations (Gym 7) ───────────────────────────
  quadratic: {
    topicName: "Quadratic Equations",
    hint: "Discriminant Δ = b²−4ac. Δ>0: two distinct real roots. Δ=0: one repeated root. Δ<0: no real roots. Formula: x = (−b ± √Δ) / 2a.",
    easy: [],
    hard: [
      { text: "Solve: 2x² − 7x + 3 = 0. One root is x = ½. Find the other root.",
        options: ["x=3", "x=−3", "x=7", "x=1/3"], correct: 0 },
      { text: "Find the discriminant of 3x² − 4x + 2 = 0.",
        options: ["−8", "8", "40", "−40"], correct: 0 },
      { text: "x² − 6x + k = 0 has equal roots. Find k.",
        options: ["9", "3", "6", "−9"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve x² − 4 = 0.\nGive both roots separated by comma (e.g. 2,-2)", answer: "2,-2" },
      { text: "CATCH CHALLENGE!\nDiscriminant of x² + 2x + 1 = 0?\n(just the number)", answer: "0" },
    ],
  },

  // ── Functions & Graphs (Gym 8) ────────────────────────────
  functions: {
    topicName: "Functions & Graphs",
    hint: "Inverse function f⁻¹: swap x and y, then solve for the new y. Composite fg(x): apply g first, then f to that result.",
    easy: [],
    hard: [
      { text: "If f(x) = 2x − 3, find f⁻¹(x).",
        options: ["(x+3)/2", "(x−3)/2", "2x+3", "1/(2x−3)"], correct: 0 },
      { text: "If f(x) = x² and g(x) = x + 2, find fg(3).\n[fg(3) = f(g(3))]",
        options: ["25", "11", "5", "17"], correct: 0 },
      { text: "The vertex of y = (x − 3)² + 5 is at:",
        options: ["(3, 5)", "(−3, 5)", "(3, −5)", "(5, 3)"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf f(x) = x + 4, find f(−2).\n(just the number)", answer: "2" },
      { text: "CATCH CHALLENGE!\nIf f(x) = 3x and g(x) = x−1, find gf(2).\n(just the number)", answer: "5" },
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// GYM_DATA — the 8 Tai Po Gyms (in order)
// Must be challenged in order (1→8).
// ══════════════════════════════════════════════════════════════
export interface GymDef {
  id:           number;
  locationName: string;
  gymName:      string;
  leaderName:   string;
  topic:        TopicKey;
  badge:        string;
  enemyName:    string;
  enemyColor:   string;
  enemyEmoji:   string;
  catchType:    AlgemonType;
  reward:       number;  // Algecoins
}

export const GYM_DATA: GymDef[] = [
  {
    id: 0, locationName: "Lam Tsuen Valley",   gymName: "Lam Tsuen Gym",
    leaderName: "Leader Fern",   topic: "factorization",
    badge: "Petal Badge",        enemyName: "Fern's Factorion",
    enemyColor: "#2d7a27",       enemyEmoji: "🌿",
    catchType: "Grass",          reward: 100,
  },
  {
    id: 1, locationName: "Tai Po Market",       gymName: "Market Gym",
    leaderName: "Leader Marx",   topic: "changeOfSubject",
    badge: "Subject Badge",      enemyName: "Marx's Metamorphon",
    enemyColor: "#1565c0",       enemyEmoji: "💧",
    catchType: "Water",          reward: 100,
  },
  {
    id: 2, locationName: "Tai Mei Tuk",         gymName: "Lakeside Gym",
    leaderName: "Leader Ines",   topic: "inequalities",
    badge: "Balance Badge",      enemyName: "Ines's Inequalon",
    enemyColor: "#00838f",       enemyEmoji: "❄️",
    catchType: "Water",          reward: 100,
  },
  {
    id: 3, locationName: "Plover Cove Reservoir", gymName: "Reservoir Gym",
    leaderName: "Leader Xander", topic: "indices",
    badge: "Power Badge",        enemyName: "Xander's Exponent",
    enemyColor: "#6a1b9a",       enemyEmoji: "⚡",
    catchType: "Fire",           reward: 100,
  },
  {
    id: 4, locationName: "Tai Po Industrial Estate", gymName: "Factory Gym",
    leaderName: "Leader Simon",  topic: "simultaneous",
    badge: "Dual Badge",         enemyName: "Simon's Simultanon",
    enemyColor: "#e65100",       enemyEmoji: "🔩",
    catchType: "Fire",           reward: 100,
  },
  {
    id: 5, locationName: "Lo Shue Ling",         gymName: "Highland Gym",
    leaderName: "Leader Poly",   topic: "polynomials",
    badge: "Degree Badge",       enemyName: "Poly's Polynomion",
    enemyColor: "#880e4f",       enemyEmoji: "🌺",
    catchType: "Water",          reward: 100,
  },
  {
    id: 6, locationName: "Tai Po Mega Mall",     gymName: "Mall Gym",
    leaderName: "Leader Quinn",  topic: "quadratic",
    badge: "Apex Badge",         enemyName: "Quinn's Quadraton",
    enemyColor: "#b71c1c",       enemyEmoji: "🔺",
    catchType: "Fire",           reward: 100,
  },
  {
    id: 7, locationName: "Sam Mun Tsai Village", gymName: "Harbour Gym",
    leaderName: "Leader Fiona",  topic: "functions",
    badge: "Curve Badge",        enemyName: "Fiona's Functeon",
    enemyColor: "#b8860b",       enemyEmoji: "🌊",
    catchType: "Grass",          reward: 100,
  },
];
