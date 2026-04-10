// ═══════════════════════════════════════════════════════════════
// ALGEMON MATH BATTLE v5 — GAME DATA
// HKDSE Compulsory Part A — 8-type registry, dynamic scaling
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────
export const ALGEMON_TYPES = [
  "Fire", "Water", "Grass", "Ice", "Flying", "Ground", "Fighting", "Electric",
] as const;
export type AlgemonType = (typeof ALGEMON_TYPES)[number];

export const TOPIC_KEYS = [
  "factorization", "changeOfSubject", "inequalities",
  "indices", "simultaneous", "polynomials", "quadratic", "functions",
  "coordinates", "ratios",
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
  Fire:     "#e05c00",
  Water:    "#1565c0",
  Grass:    "#2d7a27",
  Ice:      "#0097a7",
  Flying:   "#546e7a",
  Ground:   "#795548",
  Fighting: "#c62828",
  Electric: "#f57f17",
};
export const TYPE_EMOJI: Record<AlgemonType, string> = {
  Fire:     "🔥",
  Water:    "💧",
  Grass:    "🌿",
  Ice:      "❄️",
  Flying:   "🦅",
  Ground:   "🪨",
  Fighting: "👊",
  Electric: "⚡",
};

// Player type → topic asked in wild battles
export const TYPE_TOPIC: Record<AlgemonType, TopicKey> = {
  Fire:     "indices",
  Water:    "changeOfSubject",
  Grass:    "factorization",
  Ice:      "inequalities",
  Flying:   "polynomials",
  Ground:   "coordinates",
  Fighting: "ratios",
  Electric: "simultaneous",
};

// ── Wild-battle enemy per player type ────────────────────────
export const WILD_ENEMY: Record<AlgemonType, {
  name: string; color: string; emoji: string;
  catchType: AlgemonType; speciesId: string;
}> = {
  Fire:     { name: "Aqua Specter",  color: "#1565c0", emoji: "💧", catchType: "Water",    speciesId: "aquat"    },
  Water:    { name: "Flora Specter", color: "#2d7a27", emoji: "🌿", catchType: "Grass",    speciesId: "phyllon"  },
  Grass:    { name: "Cryo Specter",  color: "#0097a7", emoji: "❄️", catchType: "Ice",      speciesId: "cryocub"  },
  Ice:      { name: "Igni Specter",  color: "#e05c00", emoji: "🔥", catchType: "Fire",     speciesId: "ignit"    },
  Flying:   { name: "Terra Specter", color: "#795548", emoji: "🪨", catchType: "Ground",   speciesId: "terron"   },
  Ground:   { name: "Aero Specter",  color: "#546e7a", emoji: "🦅", catchType: "Flying",   speciesId: "aeron"    },
  Fighting: { name: "Volt Specter",  color: "#f57f17", emoji: "⚡", catchType: "Electric", speciesId: "volt"     },
  Electric: { name: "Pugn Specter",  color: "#c62828", emoji: "👊", catchType: "Fighting", speciesId: "pugn"     },
};

// ── Battle constants ──────────────────────────────────────────
export const PLAYER_MAX_HP         = 100;
export const ENEMY_MAX_HP          = 100;  // all battles — scaling via formula
export const BASE_DAMAGE           = 34;   // at equal levels: 34% per hit; 2 hits → 32% HP
export const CATCH_HP_PCT          = 0.30; // CATCH button requires < 30% HP
export const MAX_LEVEL             = 30;
export const XP_PER_LEVEL          = 100;
export const XP_PER_CORRECT_WILD   = 50;
export const XP_PER_CORRECT_GYM    = 100;
export const XP_PER_CORRECT_ELITE  = 150;
export const HINT_MIN_LEVEL        = 5;
export const HINT_TOOL_COST        = 50;
export const ALGEBALL_COST         = 50;
export const POTION_COST           = 30;
export const POTION_HEAL           = 20;
export const WILD_WIN_COINS        = 30;
export const GYM_WIN_COINS         = 100;
export const ELITE_WIN_COINS       = 200;

// ── Damage formula ────────────────────────────────────────────
export function calcPlayerDmg(playerLv: number, foeLv: number): number {
  return Math.max(8, Math.round(BASE_DAMAGE * playerLv / foeLv));
}
export function calcFoeDmg(playerLv: number, foeLv: number, defenseBonus: number): number {
  const raw = Math.max(6, Math.round(BASE_DAMAGE * foeLv / playerLv));
  return Math.round(raw * (1 - defenseBonus));
}

// ── XP / Level utilities ──────────────────────────────────────
export function xpToLevel(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1);
}
export function xpToNextLevel(xp: number): number {
  const lv = xpToLevel(xp);
  return lv >= MAX_LEVEL ? 0 : lv * XP_PER_LEVEL - xp;
}
export function getEvolutionStage(level: number): 0 | 1 | 2 {
  return level >= 21 ? 2 : level >= 11 ? 1 : 0;
}
export function getSpeciesId(baseType: AlgemonType, stage: 0 | 1 | 2): string {
  return EVOLUTION_DATA[baseType].stages[stage].name.toLowerCase();
}

// ── Misc ──────────────────────────────────────────────────────
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function normalizeAns(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

// ══════════════════════════════════════════════════════════════
// EVOLUTION DATA — 8 types × 3 stages
// ══════════════════════════════════════════════════════════════
export interface EvolutionStage {
  name: string; emoji: string; level: number; defenseBonus: number;
}
export interface AlgemonLineage {
  stages: [EvolutionStage, EvolutionStage, EvolutionStage];
}

export const EVOLUTION_DATA: Record<AlgemonType, AlgemonLineage> = {
  Fire:     { stages: [{ name: "Ignit",       emoji: "🔥", level: 1,  defenseBonus: 0    }, { name: "Ignitor",     emoji: "🌋", level: 11, defenseBonus: 0.10 }, { name: "Ignithelio",  emoji: "☀️", level: 21, defenseBonus: 0.20 }] },
  Water:    { stages: [{ name: "Aquat",       emoji: "💧", level: 1,  defenseBonus: 0    }, { name: "Aquasub",     emoji: "🌊", level: 11, defenseBonus: 0.10 }, { name: "Aquasolv",    emoji: "🏊", level: 21, defenseBonus: 0.20 }] },
  Grass:    { stages: [{ name: "Phyllon",     emoji: "🌿", level: 1,  defenseBonus: 0    }, { name: "Phyllfact",   emoji: "🌲", level: 11, defenseBonus: 0.10 }, { name: "Phyllroot",   emoji: "🌳", level: 21, defenseBonus: 0.20 }] },
  Ice:      { stages: [{ name: "Cryocub",     emoji: "❄️", level: 1,  defenseBonus: 0    }, { name: "Cryoline",    emoji: "🧊", level: 11, defenseBonus: 0.10 }, { name: "Cryobound",   emoji: "⛄", level: 21, defenseBonus: 0.20 }] },
  Flying:   { stages: [{ name: "Aeron",       emoji: "🦅", level: 1,  defenseBonus: 0    }, { name: "Aeropoly",    emoji: "🦉", level: 11, defenseBonus: 0.10 }, { name: "Aeroremain",  emoji: "🦋", level: 21, defenseBonus: 0.20 }] },
  Ground:   { stages: [{ name: "Terron",      emoji: "🪨", level: 1,  defenseBonus: 0    }, { name: "Terragrid",   emoji: "🌋", level: 11, defenseBonus: 0.10 }, { name: "Terracoord",  emoji: "🗺️", level: 21, defenseBonus: 0.20 }] },
  Fighting: { stages: [{ name: "Pugn",        emoji: "👊", level: 1,  defenseBonus: 0    }, { name: "Pugnlogic",   emoji: "⚔️", level: 11, defenseBonus: 0.10 }, { name: "Pugnratio",   emoji: "🏋️", level: 21, defenseBonus: 0.20 }] },
  Electric: { stages: [{ name: "Volt",        emoji: "⚡", level: 1,  defenseBonus: 0    }, { name: "Voltgraph",   emoji: "🔌", level: 11, defenseBonus: 0.10 }, { name: "Voltsimul",   emoji: "🌩️", level: 21, defenseBonus: 0.20 }] },
};

// ══════════════════════════════════════════════════════════════
// SPECIES LIST — 24 collectibles (8 types × 3 stages)
// ══════════════════════════════════════════════════════════════
export const SPECIES_LIST: { id: string; name: string; emoji: string; topic: string; type: AlgemonType; stage: 0|1|2 }[] = [
  { id: "ignit",       name: "Ignit",       emoji: "🔥", topic: "Indices",            type: "Fire",     stage: 0 },
  { id: "ignitor",     name: "Ignitor",     emoji: "🌋", topic: "Indices",            type: "Fire",     stage: 1 },
  { id: "ignithelio",  name: "Ignithelio",  emoji: "☀️", topic: "Indices",            type: "Fire",     stage: 2 },
  { id: "aquat",       name: "Aquat",       emoji: "💧", topic: "Change of Subject",  type: "Water",    stage: 0 },
  { id: "aquasub",     name: "Aquasub",     emoji: "🌊", topic: "Change of Subject",  type: "Water",    stage: 1 },
  { id: "aquasolv",    name: "Aquasolv",    emoji: "🏊", topic: "Change of Subject",  type: "Water",    stage: 2 },
  { id: "phyllon",     name: "Phyllon",     emoji: "🌿", topic: "Factorization",      type: "Grass",    stage: 0 },
  { id: "phyllfact",   name: "Phyllfact",   emoji: "🌲", topic: "Factorization",      type: "Grass",    stage: 1 },
  { id: "phyllroot",   name: "Phyllroot",   emoji: "🌳", topic: "Factorization",      type: "Grass",    stage: 2 },
  { id: "cryocub",     name: "Cryocub",     emoji: "❄️", topic: "Inequalities",       type: "Ice",      stage: 0 },
  { id: "cryoline",    name: "Cryoline",    emoji: "🧊", topic: "Inequalities",       type: "Ice",      stage: 1 },
  { id: "cryobound",   name: "Cryobound",   emoji: "⛄", topic: "Inequalities",       type: "Ice",      stage: 2 },
  { id: "aeron",       name: "Aeron",       emoji: "🦅", topic: "Polynomials",        type: "Flying",   stage: 0 },
  { id: "aeropoly",    name: "Aeropoly",    emoji: "🦉", topic: "Polynomials",        type: "Flying",   stage: 1 },
  { id: "aeroremain",  name: "Aeroremain",  emoji: "🦋", topic: "Polynomials",        type: "Flying",   stage: 2 },
  { id: "terron",      name: "Terron",      emoji: "🪨", topic: "Coordinates",        type: "Ground",   stage: 0 },
  { id: "terragrid",   name: "Terragrid",   emoji: "🌋", topic: "Coordinates",        type: "Ground",   stage: 1 },
  { id: "terracoord",  name: "Terracoord",  emoji: "🗺️", topic: "Coordinates",        type: "Ground",   stage: 2 },
  { id: "pugn",        name: "Pugn",        emoji: "👊", topic: "Ratios/Percentages", type: "Fighting", stage: 0 },
  { id: "pugnlogic",   name: "Pugnlogic",   emoji: "⚔️", topic: "Ratios/Percentages", type: "Fighting", stage: 1 },
  { id: "pugnratio",   name: "Pugnratio",   emoji: "🏋️", topic: "Ratios/Percentages", type: "Fighting", stage: 2 },
  { id: "volt",        name: "Volt",        emoji: "⚡", topic: "Simultaneous Eqs",  type: "Electric", stage: 0 },
  { id: "voltgraph",   name: "Voltgraph",   emoji: "🔌", topic: "Simultaneous Eqs",  type: "Electric", stage: 1 },
  { id: "voltsimul",   name: "Voltsimul",   emoji: "🌩️", topic: "Simultaneous Eqs",  type: "Electric", stage: 2 },
];

// ══════════════════════════════════════════════════════════════
// ALGE_DB — question bank (10 topics)
// ══════════════════════════════════════════════════════════════
export const ALGE_DB: Record<TopicKey, TopicData> = {

  factorization: {
    topicName: "Factorization",
    hint: "Factor out any common factor first, then look for Difference of Two Squares (a²−b²=(a+b)(a−b)) or trinomial patterns ax²+bx+c.",
    easy: [
      { text: "Factorise: x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x+3)(x+3)", "(x−2)(x−3)"], correct: 0 },
      { text: "Factorise: x² − 9",       options: ["(x+3)(x−3)", "(x−3)²", "(x+9)(x−1)", "(x−9)(x+1)"], correct: 0 },
      { text: "Factorise: x² − 6x + 9", options: ["(x−3)²", "(x+3)(x−3)", "(x−9)(x+1)", "(x+3)²"], correct: 0 },
    ],
    hard: [
      { text: "Factorise completely: 4x² − 12x + 9",  options: ["(2x−3)²",        "(4x−9)(x−1)", "(2x+3)²",        "(4x−3)(x−3)"], correct: 0 },
      { text: "Factorise completely: 6x² + 5x − 6",   options: ["(2x+3)(3x−2)",   "(6x−1)(x+6)", "(3x+2)(2x−3)",   "(3x−2)(2x+3)"], correct: 0 },
      { text: "Factorise completely: x³ − x",          options: ["x(x+1)(x−1)",    "x(x−1)²",     "x²(x−1)",         "(x²−1)x"], correct: 0 },
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
      { text: "Make x the subject: y = 3x + 5",   options: ["x=(y−5)/3", "x=y/3−5", "x=(y+5)/3", "x=3y−5"], correct: 0 },
      { text: "Make r the subject: A = πr²",        options: ["r=√(A/π)", "r=A/π", "r=√(Aπ)", "r=A²/π"], correct: 0 },
      { text: "Make h the subject: V = ½bh",        options: ["h=2V/b", "h=V/b", "h=Vb/2", "h=b/(2V)"], correct: 0 },
    ],
    hard: [
      { text: "Make x the subject: y = (2x − 1)/(x + 3)", options: ["x=(3y+1)/(2−y)", "x=(y+1)/(2−3y)", "x=(1−3y)/(y−2)", "x=(2y+1)/(y−3)"], correct: 0 },
      { text: "Make x the subject: y = √(x − 4)",          options: ["x=y²+4", "x=y²−4", "x=√y+4", "x=(y+4)²"], correct: 0 },
      { text: "Make x the subject: y = x/(x − 2)",         options: ["x=2y/(y−1)", "x=y/(y−2)", "x=2/(y−1)", "x=(y+2)/y"], correct: 0 },
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
      { text: "Solve: 2x + 3 > 7",    options: ["x>2", "x>5", "x<2", "x≥2"], correct: 0 },
      { text: "Solve: −3x ≤ 9",        options: ["x≥−3", "x≤−3", "x≥3", "x≤3"], correct: 0 },
      { text: "Solve: x/2 − 1 < 3",   options: ["x<8", "x<4", "x<2", "x>8"], correct: 0 },
    ],
    hard: [
      { text: "Solve: (2x−1)/3 > (x+2)/2\n[Multiply both sides by 6]", options: ["x>8", "x>2", "x<8", "x>−8"], correct: 0 },
      { text: "Solve: 5 − 2x > 1",                                       options: ["x<2", "x>2", "x>−2", "x<−2"], correct: 0 },
      { text: "Solve: −4 ≤ 2x + 2 ≤ 10",                                 options: ["−3≤x≤4", "−2≤x≤5", "−1≤x≤4", "−3≤x≤5"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve: 4x − 2 > 10\n(e.g. x>3)", answer: "x>3" },
      { text: "CATCH CHALLENGE!\nSolve: −2x < 6\n(e.g. x>-3)", answer: "x>-3" },
    ],
  },

  indices: {
    topicName: "Indices (Laws of Indices)",
    hint: "For fractional indices: x^(m/n) = (ⁿ√x)^m — find the root first, then raise to the power. To multiply: add powers. To divide: subtract powers.",
    easy: [
      { text: "Simplify: x² × x³",          options: ["x⁵", "x⁶", "2x⁵", "x^8"], correct: 0 },
      { text: "What is 4^(1/2)?",             options: ["2", "8", "16", "1/2"], correct: 0 },
      { text: "Simplify: (x³)²",             options: ["x⁶", "x⁵", "x^9", "2x³"], correct: 0 },
    ],
    hard: [
      { text: "Simplify: (2x²y)³ ÷ (4xy²)", options: ["2x⁵y", "8x⁵y", "2x⁵y²", "4x⁵y"], correct: 0 },
      { text: "Evaluate: 27^(2/3)",            options: ["9", "3", "18", "6"], correct: 0 },
      { text: "Simplify: (4x²)^(3/2)",         options: ["8x³", "4x³", "8x²", "6x³"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nEvaluate: 8^(1/3) + 4^(1/2)\n(give a number)", answer: "4" },
      { text: "CATCH CHALLENGE!\nSimplify: x⁵ ÷ x²\n(e.g. x^3)", answer: "x^3" },
    ],
  },

  simultaneous: {
    topicName: "Simultaneous Equations",
    hint: "Substitution: isolate one variable, then substitute. Elimination: multiply equations to match a coefficient, then add or subtract to remove one variable.",
    easy: [
      { text: "Solve: x + y = 5 and x − y = 1.\nFind x.", options: ["3", "2", "4", "1"], correct: 0 },
      { text: "Solve: 2x + y = 7 and y = 1.\nFind x.",    options: ["3", "4", "2", "6"], correct: 0 },
      { text: "If x = 2 and 3x + y = 10, find y.",        options: ["4", "6", "8", "2"], correct: 0 },
    ],
    hard: [
      { text: "Solve:\n2x + 3y = 12\nx − y = 1\nFind x.", options: ["x=3", "x=2", "x=4", "x=1"], correct: 0 },
      { text: "Solve:\n5x − y = 7\n2x + y = 0\nFind y.", options: ["y=−2", "y=2", "y=7", "y=−7"], correct: 0 },
      { text: "Solve:\n3x + 2y = 16\nx = 2y\nFind x.",   options: ["x=4", "x=2", "x=8", "x=16"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve: x + y = 5, x − y = 1\nWhat is x? (just the number)", answer: "3" },
      { text: "CATCH CHALLENGE!\nSolve: 2x + y = 7, y = 1\nWhat is x? (just the number)", answer: "3" },
    ],
  },

  polynomials: {
    topicName: "Polynomials",
    hint: "Remainder Theorem: f(a) = remainder when f(x) ÷ (x−a). Factor Theorem: (x−a) is a factor of f(x) if and only if f(a) = 0.",
    easy: [
      { text: "If f(x) = x² − 3x + 2, find f(2).",              options: ["0", "4", "−2", "2"], correct: 0 },
      { text: "Which is a factor of x² − x − 6?",               options: ["(x−3)", "(x+2)", "(x−2)", "(x+3)"], correct: 0 },
      { text: "Find f(1) where f(x) = x³ − x² + x − 1.",        options: ["0", "2", "−2", "1"], correct: 0 },
    ],
    hard: [
      { text: "If f(x) = x³ − 3x + 2, find f(−1).",                                            options: ["4", "0", "−4", "2"], correct: 0 },
      { text: "When f(x) = x³ + ax² − x + 3 is divided by (x−1),\nremainder is 5. Find a.", options: ["a=2", "a=3", "a=−2", "a=1"], correct: 0 },
      { text: "If (x−2) is a factor of f(x) = x³ − kx² + 4, find k.",                          options: ["k=3", "k=4", "k=2", "k=−3"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf f(x) = 2x² + x − 3, find f(2).\n(just the number)", answer: "7" },
      { text: "CATCH CHALLENGE!\nRemainder when x³ − 2x + 1 ÷ (x−1)?\n(just the number)", answer: "0" },
    ],
  },

  quadratic: {
    topicName: "Quadratic Equations",
    hint: "Discriminant Δ = b²−4ac. Δ>0: two distinct real roots. Δ=0: one repeated root. Δ<0: no real roots. Formula: x = (−b ± √Δ) / 2a.",
    easy: [
      { text: "Solve: x² − 5x + 6 = 0.",        options: ["x=2 or x=3", "x=1 or x=6", "x=−2 or x=−3", "x=2 or x=−3"], correct: 0 },
      { text: "Solve: x(x − 4) = 0.",            options: ["x=0 or x=4", "x=4 only", "x=0 only", "x=±4"], correct: 0 },
      { text: "Discriminant of x² − 4x + 4 = 0:", options: ["0", "8", "−8", "16"], correct: 0 },
    ],
    hard: [
      { text: "Solve: 2x² − 7x + 3 = 0.\nOne root is x = ½. Find the other root.", options: ["x=3", "x=−3", "x=7", "x=1/3"], correct: 0 },
      { text: "Find the discriminant of 3x² − 4x + 2 = 0.",                         options: ["−8", "8", "40", "−40"], correct: 0 },
      { text: "x² − 6x + k = 0 has equal roots. Find k.",                           options: ["9", "3", "6", "−9"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSolve x² − 4 = 0.\nGive both roots (e.g. 2,-2)", answer: "2,-2" },
      { text: "CATCH CHALLENGE!\nDiscriminant of x² + 2x + 1 = 0?\n(just the number)", answer: "0" },
    ],
  },

  functions: {
    topicName: "Functions & Graphs",
    hint: "Inverse function f⁻¹: swap x and y, then solve for the new y. Composite fg(x): apply g first, then f to that result.",
    easy: [
      { text: "If f(x) = 2x + 1, find f(3).",                  options: ["7", "6", "8", "5"], correct: 0 },
      { text: "If f(x) = x − 3, find f⁻¹(2).",                 options: ["5", "−1", "2", "−5"], correct: 0 },
      { text: "If g(x) = x + 1, find g(g(3)).",                 options: ["5", "4", "6", "3"], correct: 0 },
    ],
    hard: [
      { text: "If f(x) = 2x − 3, find f⁻¹(x).",                             options: ["(x+3)/2", "(x−3)/2", "2x+3", "1/(2x−3)"], correct: 0 },
      { text: "If f(x) = x² and g(x) = x + 2, find fg(3).\n[fg(3) = f(g(3))]", options: ["25", "11", "5", "17"], correct: 0 },
      { text: "The vertex of y = (x − 3)² + 5 is at:",                       options: ["(3, 5)", "(−3, 5)", "(3, −5)", "(5, 3)"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf f(x) = x + 4, find f(−2).\n(just the number)", answer: "2" },
      { text: "CATCH CHALLENGE!\nIf f(x) = 3x and g(x) = x−1, find gf(2).\n(just the number)", answer: "5" },
    ],
  },

  // ── NEW: Coordinates ─────────────────────────────────────────
  coordinates: {
    topicName: "Coordinate Geometry",
    hint: "Slope m = (y₂−y₁)/(x₂−x₁). Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2). Distance = √((Δx)²+(Δy)²). Perpendicular slopes multiply to −1.",
    easy: [
      { text: "Slope of the line through (1, 2) and (3, 6):",           options: ["2", "−2", "1/2", "4"], correct: 0 },
      { text: "Midpoint of A(2, 4) and B(6, 8):",                       options: ["(4, 6)", "(3, 5)", "(8, 12)", "(2, 4)"], correct: 0 },
      { text: "Distance from the origin to (3, 4):",                    options: ["5", "7", "√7", "25"], correct: 0 },
    ],
    hard: [
      { text: "Line through (0, 3) with slope −2.\nFind its x-intercept.", options: ["3/2", "−3/2", "3", "2"], correct: 0 },
      { text: "Slope of the perpendicular bisector of\nA(0,0) and B(4,2):", options: ["−2", "2", "1/2", "−1/2"], correct: 0 },
      { text: "If A=(1,2) and B=(5,8), |AB| =",                           options: ["2√13", "4√3", "√28", "√40"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nLine through (0,−2) with slope 3.\nGive the equation (e.g. y=3x-2).", answer: "y=3x-2" },
      { text: "CATCH CHALLENGE!\ny-intercept of 2x + 3y = 12?\n(just the number)", answer: "4" },
    ],
  },

  // ── NEW: Ratios / Percentages ─────────────────────────────────
  ratios: {
    topicName: "Ratios & Percentages",
    hint: "% increase = (increase/original)×100. % decrease similar. For ratios a:b, part = (a/(a+b))×total or (b/(a+b))×total.",
    easy: [
      { text: "A coat costs $800. After a 20% discount:",               options: ["$640", "$600", "$160", "$680"], correct: 0 },
      { text: "If x : y = 3 : 5 and x = 12, find y.",                  options: ["20", "15", "24", "8"], correct: 0 },
      { text: "15% of 200 is:",                                         options: ["30", "20", "150", "3"], correct: 0 },
    ],
    hard: [
      { text: "Price increased from $250 to $300.\nPercentage increase:", options: ["20%", "16.7%", "50%", "15%"], correct: 0 },
      { text: "Divide $420 in the ratio 3:4.\nThe larger share:",         options: ["$240", "$180", "$210", "$280"], correct: 0 },
      { text: "After a 25% increase, a price is $875.\nOriginal price:",  options: ["$700", "$656.25", "$750", "$650"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nA:B = 2:3. Total = 50. Find A.\n(just the number)", answer: "20" },
      { text: "CATCH CHALLENGE!\nSimple interest on $2000 at 5% p.a. for 3 years?\n(just the number)", answer: "300" },
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// GYM_DATA — 8 Tai Po Gyms (ordered, must challenge in order)
// ══════════════════════════════════════════════════════════════
export interface GymDef {
  id: number; locationName: string; gymName: string;
  leaderName: string; topic: TopicKey; badge: string;
  enemyName: string; enemyColor: string; enemyEmoji: string;
  catchType: AlgemonType; speciesId: string;
  foeLevel: number; reward: number;
}

export const GYM_DATA: GymDef[] = [
  { id: 0, locationName: "Lam Tsuen Valley",          gymName: "Lam Tsuen Gym",  leaderName: "Leader Fern",   topic: "factorization",  badge: "Petal Badge",   enemyName: "Fern's Phyllroot",    enemyColor: "#2d7a27", enemyEmoji: "🌳", catchType: "Grass",    speciesId: "phyllon",   foeLevel: 4,  reward: 100 },
  { id: 1, locationName: "Tai Po Market",              gymName: "Market Gym",     leaderName: "Leader Marx",   topic: "changeOfSubject",badge: "Subject Badge", enemyName: "Marx's Aquasolv",     enemyColor: "#1565c0", enemyEmoji: "🏊", catchType: "Water",    speciesId: "aquat",     foeLevel: 6,  reward: 100 },
  { id: 2, locationName: "Tai Mei Tuk",                gymName: "Lakeside Gym",   leaderName: "Leader Ines",   topic: "inequalities",   badge: "Balance Badge", enemyName: "Ines's Cryobound",    enemyColor: "#0097a7", enemyEmoji: "⛄", catchType: "Ice",      speciesId: "cryocub",   foeLevel: 8,  reward: 100 },
  { id: 3, locationName: "Plover Cove Reservoir",      gymName: "Reservoir Gym",  leaderName: "Leader Xander", topic: "indices",        badge: "Power Badge",   enemyName: "Xander's Ignithelio", enemyColor: "#e05c00", enemyEmoji: "☀️", catchType: "Fire",     speciesId: "ignit",     foeLevel: 10, reward: 100 },
  { id: 4, locationName: "Tai Po Industrial Estate",   gymName: "Factory Gym",    leaderName: "Leader Simon",  topic: "simultaneous",   badge: "Dual Badge",    enemyName: "Simon's Voltsimul",   enemyColor: "#f57f17", enemyEmoji: "🌩️", catchType: "Electric", speciesId: "volt",      foeLevel: 12, reward: 100 },
  { id: 5, locationName: "Lo Shue Ling",               gymName: "Highland Gym",   leaderName: "Leader Poly",   topic: "polynomials",    badge: "Degree Badge",  enemyName: "Poly's Aeroremain",   enemyColor: "#546e7a", enemyEmoji: "🦋", catchType: "Flying",   speciesId: "aeron",     foeLevel: 14, reward: 100 },
  { id: 6, locationName: "Tai Po Mega Mall",           gymName: "Mall Gym",       leaderName: "Leader Quinn",  topic: "quadratic",      badge: "Apex Badge",    enemyName: "Quinn's Pugnratio",   enemyColor: "#c62828", enemyEmoji: "🏋️", catchType: "Fighting", speciesId: "pugn",      foeLevel: 17, reward: 100 },
  { id: 7, locationName: "Sam Mun Tsai Village",       gymName: "Harbour Gym",    leaderName: "Leader Fiona",  topic: "functions",      badge: "Curve Badge",   enemyName: "Fiona's Terracoord",  enemyColor: "#795548", enemyEmoji: "🗺️", catchType: "Ground",   speciesId: "terron",    foeLevel: 20, reward: 100 },
];

// ══════════════════════════════════════════════════════════════
// ELITE FOUR
// ══════════════════════════════════════════════════════════════
export interface EliteDef {
  id: number; name: string; title: string;
  enemyName: string; enemyColor: string; enemyEmoji: string;
  catchType: AlgemonType; speciesId: string;
  foeLevel: number;
  questions: MCQuestion[];
}

export const ELITE_FOUR: EliteDef[] = [
  {
    id: 0, name: "Algeius", title: "Master of Form",
    enemyName: "Algeius's Ignithelio", enemyColor: "#e05c00", enemyEmoji: "☀️",
    catchType: "Fire", speciesId: "ignithelio", foeLevel: 22,
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
    enemyName: "Numbrix's Voltsimul", enemyColor: "#f57f17", enemyEmoji: "🌩️",
    catchType: "Electric", speciesId: "voltsimul", foeLevel: 24,
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
    enemyName: "Equalis's Aquasolv", enemyColor: "#1565c0", enemyEmoji: "🏊",
    catchType: "Water", speciesId: "aquasolv", foeLevel: 26,
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
    enemyName: "Mathex's Phyllroot", enemyColor: "#2d7a27", enemyEmoji: "🌳",
    catchType: "Grass", speciesId: "phyllroot", foeLevel: 28,
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

// ══════════════════════════════════════════════════════════════
// STUDY GUIDE — Alge-Library content (10 topics)
// ══════════════════════════════════════════════════════════════
export interface StudySection {
  topicName: string; emoji: string; formulas: string[]; traps: string[];
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
      "Step 1: Isolate all terms containing the target variable",
      "Step 2: Factor out the target variable if it appears more than once",
      "Step 3: Divide both sides to isolate the variable",
    ],
    traps: [
      "y = (ax+b)/(cx+d) → cross-multiply: y(cx+d)=ax+b, then collect x terms",
      "y = √(x+a) → square both sides: y²=x+a → x=y²−a",
    ],
  },
  {
    topicName: "Inequalities",  emoji: "❄️",
    formulas: [
      "Treat like an equation BUT flip < / > when × or ÷ by a NEGATIVE",
      "For −3x < 9: divide by −3 → x > −3   (sign flips!)",
      "Compound: −4 ≤ 2x+2 ≤ 10 → subtract 2 → divide by 2",
    ],
    traps: [
      "−2x < 6  →  x > −3   (NOT x < −3)",
      "Combined inequality: apply same operation to ALL THREE parts",
    ],
  },
  {
    topicName: "Indices (Laws of Indices)",  emoji: "🔥",
    formulas: [
      "aᵐ × aⁿ = aᵐ⁺ⁿ       aᵐ ÷ aⁿ = aᵐ⁻ⁿ",
      "(aᵐ)ⁿ = aᵐⁿ          (ab)ⁿ = aⁿbⁿ",
      "a⁰ = 1                a⁻ⁿ = 1/aⁿ",
      "a^(m/n) = (ⁿ√a)^m    — find the ROOT first, then power",
    ],
    traps: [
      "27^(2/3): cube-root first → 3, then square → 9",
      "4^(3/2): √4=2, then 2³=8",
    ],
  },
  {
    topicName: "Simultaneous Equations",  emoji: "⚡",
    formulas: [
      "Substitution: isolate one variable, substitute into other equation",
      "Elimination: multiply to match a coefficient, then add/subtract",
    ],
    traps: [
      "After finding x, always substitute back to find y",
      "Check: substitute BOTH values into BOTH original equations",
    ],
  },
  {
    topicName: "Polynomials",  emoji: "🦅",
    formulas: [
      "Remainder Theorem: f(a) = remainder when f(x) ÷ (x−a)",
      "Factor Theorem: (x−a) is a factor  ⟺  f(a) = 0",
    ],
    traps: [
      "Dividing by (x+a) means substitute x = −a (not +a)!",
      "Always expand carefully and watch signs",
    ],
  },
  {
    topicName: "Quadratic Equations",  emoji: "🔺",
    formulas: [
      "Δ = b² − 4ac     (discriminant)",
      "Δ > 0: two distinct real roots  |  Δ = 0: one repeated  |  Δ < 0: no real roots",
      "x = (−b ± √Δ) / 2a",
    ],
    traps: [
      "3x²−4x+2: a=3, b=−4, c=2 → Δ=16−24=−8 (no real roots!)",
      "Equal roots → set Δ=0 and solve for the unknown constant",
    ],
  },
  {
    topicName: "Functions & Graphs",  emoji: "🌊",
    formulas: [
      "Inverse f⁻¹: replace f(x) with y, swap x and y, solve for y",
      "Composite fg(x): apply g first, then f to that result",
      "Vertex form: y = a(x−h)² + k  →  vertex at (h, k)",
    ],
    traps: [
      "fg(3) = f(g(3)) — apply g FIRST!   gf(3) = g(f(3)) — apply f FIRST!",
      "y = (x−3)²+5: vertex is (3,5) not (−3,5)",
    ],
  },
  {
    topicName: "Coordinate Geometry",  emoji: "🪨",
    formulas: [
      "Slope m = (y₂−y₁) / (x₂−x₁)",
      "Midpoint = ((x₁+x₂)/2 , (y₁+y₂)/2)",
      "Distance = √((x₂−x₁)² + (y₂−y₁)²)",
      "Perpendicular lines: m₁ × m₂ = −1",
    ],
    traps: [
      "Perpendicular bisector: find midpoint AND use negative reciprocal slope",
      "y = mx + c: c is the y-intercept (set x=0 to find it)",
    ],
  },
  {
    topicName: "Ratios & Percentages",  emoji: "👊",
    formulas: [
      "% change = (change / original) × 100",
      "New value after r% increase = original × (1 + r/100)",
      "Part in ratio a:b = (a / (a+b)) × total",
      "Simple Interest = P × r × t / 100",
    ],
    traps: [
      "$250 → $300 increase = 50/250 × 100 = 20% (NOT 50/300!)",
      "After 25% increase gives $875: original = 875 / 1.25 = $700",
    ],
  },
];
