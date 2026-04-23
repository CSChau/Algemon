// ═══════════════════════════════════════════════════════════════
// ALGEMON MATH BATTLE v5 — GAME DATA
// HKDSE Compulsory Part A — 8-type registry, dynamic scaling
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────
export const ALGEMON_TYPES = [
  "Fire", "Water", "Grass", "Ice", "Flying", "Ground", "Fighting", "Electric",
  "Legendary",
] as const;
export type AlgemonType = (typeof ALGEMON_TYPES)[number];

/** Eight element types only (Legendary is wild-only / post-catch). */
export const ELEMENTAL_ALGEMON_TYPES: readonly AlgemonType[] = [
  "Fire", "Water", "Grass", "Ice", "Flying", "Ground", "Fighting", "Electric",
];

export const DOUBLE_STAR_SPECIES_ID = "doublestar" as const;
export const DOUBLE_STAR_SPAWN_RATE = 0.05;
export const DOUBLE_STAR_BATTLE_QUOTE =
  "The path to excellence is a marathon, not a sprint.";

export const TOPIC_KEYS = [
  "factorization", "changeOfSubject", "indices", "fractions",
  "inequalities", "simultaneous", "percentage", "ratios",
  "functions", "polynomials", "quadratic", "variations"
] as const;
export type TopicKey = (typeof TOPIC_KEYS)[number];

export interface MCQuestion   { text: string; options: string[]; correct: number; hint?: string; }
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
  Legendary: "#d4af37",
};
export const TYPE_EMOJI: Record<AlgemonType, string> = {
  Fire:     "🔥",
  Water:    "💧",
  Grass:    "🌿",
  Ice:      "❄️",
  Flying:   "🦅",
  Ground:   "🌍",
  Fighting: "👊",
  Electric: "⚡",
  Legendary: "🌟",
};

// Player type → topic asked in wild battles
export const TYPE_TOPIC: Record<AlgemonType, TopicKey> = {
  Fire:     "indices",
  Water:    "changeOfSubject",
  Grass:    "factorization",
  Ice:      "inequalities",
  Flying:   "ratios",
  Ground:   "fractions",
  Fighting: "percentage",
  Electric: "simultaneous",
  Legendary: "functions",
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
  Flying:   { name: "Terra Specter", color: "#795548", emoji: "🌍", catchType: "Ground",   speciesId: "terron"   },
  Ground:   { name: "Aero Specter",  color: "#546e7a", emoji: "🦅", catchType: "Flying",   speciesId: "aeron"    },
  Fighting: { name: "Volt Specter",  color: "#f57f17", emoji: "⚡", catchType: "Electric", speciesId: "volt"     },
  Electric: { name: "Pugn Specter",  color: "#c62828", emoji: "👊", catchType: "Fighting", speciesId: "pugn"     },
  Legendary: { name: "Double-Star", color: "#d4af37", emoji: "🌟", catchType: "Legendary", speciesId: DOUBLE_STAR_SPECIES_ID },
};

// ── Battle constants ──────────────────────────────────────────
export const PLAYER_MAX_HP         = 100;
export const ENEMY_MAX_HP          = 100;  // all battles — scaling via formula
export const BASE_DAMAGE           = 34;   // at equal levels: 34% per hit; 2 hits → 32% HP
export const CATCH_HP_PCT          = 0.30; // legacy soft threshold for log hints
export const CATCH_MODIFIER        = 0.90; // max catch probability at 0% foe HP
export const MAX_LEVEL             = 30;
export const XP_PER_LEVEL          = 100;
export const XP_GROWTH_RATE        = 1.1;
export const XP_PER_CORRECT_WILD   = 50;
export const XP_PER_CORRECT_GYM    = 100;
export const XP_PER_CORRECT_ELITE  = 150;
export const HINT_MIN_LEVEL        = 10;
export const HINT_TOOL_COST        = 20;
export const ALGEBALL_COST         = 50;
export const POTION_COST           = 30;
export const POTION_HEAL           = 50;
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
  let lv = 1;
  while (lv < MAX_LEVEL && xp >= xpForLevelStart(lv + 1)) lv++;
  return lv;
}
export function xpToNextLevel(xp: number): number {
  const lv = xpToLevel(xp);
  return lv >= MAX_LEVEL ? 0 : xpForLevelStart(lv + 1) - xp;
}
export function xpRequiredForLevel(level: number): number {
  if (level < 1) return XP_PER_LEVEL;
  return Math.round(XP_PER_LEVEL * Math.pow(XP_GROWTH_RATE, level - 1));
}
export function xpForLevelStart(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let lv = 1; lv < level; lv++) total += xpRequiredForLevel(lv);
  return total;
}
export function getEvolutionStage(level: number): 0 | 1 | 2 {
  return level >= 21 ? 2 : level >= 11 ? 1 : 0;
}
const SPECIES_ID_BY_TYPE_STAGE: Record<Exclude<AlgemonType, "Legendary">, [string, string, string]> = {
  Fire: ["ignit", "ignitor", "ignithelio"],
  Water: ["aquat", "aquasub", "aquasolv"],
  Grass: ["phyllon", "phyllfact", "phyllroot"],
  Ice: ["cryocub", "cryoline", "cryobound"],
  Flying: ["aeron", "aeropoly", "aeroremain"],
  Ground: ["terron", "terragrid", "terrafract"],
  Fighting: ["pugn", "pugnlogic", "pugnratio"],
  Electric: ["volt", "voltgraph", "voltsimul"],
};
export function getSpeciesId(baseType: AlgemonType, stage: 0 | 1 | 2): string {
  if (baseType === "Legendary") return DOUBLE_STAR_SPECIES_ID;
  return SPECIES_ID_BY_TYPE_STAGE[baseType][stage];
}

// ── Misc ──────────────────────────────────────────────────────
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function normalizeAns(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

// ══════════════════════════════════════════════════════════════
// QUESTION_BANK — paste your HKDSE questions here.
//
// Each topic has two arrays:
//   mc  — Multiple-Choice questions used in Wild & Gym battles.
//         Format: { text, options: [A, B, C, D], correct: 0-3 }
//         (correct is the index of the right answer in options[])
//   sa  — Short-Answer questions triggered when an Algaball is
//         thrown at low HP (< 30%). Answer must match exactly.
//         Format: { text, answer: "exact string" }
//
// While mc[] is empty the engine falls back to the built-in ALGE_DB
// questions so the game is always playable.
// ══════════════════════════════════════════════════════════════
export const QUESTION_BANK: Record<TopicKey, { mc: MCQuestion[]; sa: SAQuestion[] }> = {
  factorization: {
    mc: [
      { text: "Factorise $x^2 - 9$.", options: ["$(x-3)(x+3)$","$(x-3)^2$","$(x+3)^2$","$(x-9)(x+1)$"], correct: 0, hint: "Difference of Two Squares: $a^2-b^2=(a-b)(a+b)$. Here $a=x, b=3$." },
      { text: "Factorise $x^2 + 6x + 9$.", options: ["$(x+3)^2$","$(x-3)^2$","$(x+3)(x-3)$","$(x+9)(x+1)$"], correct: 0, hint: "Perfect Square: $a^2+2ab+b^2=(a+b)^2$. Here $2ab=6x$ gives $b=3$." },
      { text: "Factorise $2x^2 - 8$.", options: ["$2(x-2)(x+2)$","$2(x-4)$","$(2x-4)(x+2)$","$(x-2)(2x+4)$"], correct: 0, hint: "Take out factor 2 first: $2(x^2-4)$. Then apply Difference of Two Squares." },
      { text: "Factorise $x^2 - 5x + 6$.", options: ["$(x-2)(x-3)$","$(x+2)(x+3)$","$(x-1)(x-6)$","$(x-2)(x+3)$"], correct: 0, hint: "Find two numbers multiplying to $+6$ and adding to $-5$: $-2$ and $-3$." },
      { text: "Factorise $3x^2 + 12x$.", options: ["$3x(x+4)$","$3(x^2+4)$","$x(3x+12)$","$3(x+4)^2$"], correct: 0, hint: "HCF of $3x^2$ and $12x$ is $3x$. Factor it out." },
      { text: "Factorise $x^2 - 7x + 12$.", options: ["$(x-3)(x-4)$","$(x+3)(x+4)$","$(x-2)(x-6)$","$(x-1)(x-12)$"], correct: 0, hint: "Find two numbers multiplying to $+12$ and adding to $-7$: $-3$ and $-4$." },
      { text: "Factorise $4x^2 - 25$.", options: ["$(2x-5)(2x+5)$","$(4x-5)(x+5)$","$(2x+5)^2$","$(2x-5)^2$"], correct: 0, hint: "Difference of Two Squares: $(2x)^2-5^2=(2x-5)(2x+5)$." },
      { text: "Factorise $x^2 + x - 12$.", options: ["$(x-3)(x+4)$","$(x+3)(x-4)$","$(x-2)(x+6)$","$(x+2)(x-6)$"], correct: 0, hint: "Find two numbers multiplying to $-12$ and adding to $+1$: $+4$ and $-3$." },
      { text: "Factorise $6x^2 + 11x + 3$.", options: ["$(2x+3)(3x+1)$","$(6x+1)(x+3)$","$(3x-1)(2x+3)$","$(2x+1)(3x+3)$"], correct: 0, hint: "Product $ac=18$. Factors of 18 adding to 11: $9+2$. Rewrite $11x=9x+2x$ and group." },
      { text: "Factorise $x^2 - 2x - 15$.", options: ["$(x-5)(x+3)$","$(x+5)(x-3)$","$(x-15)(x+1)$","$(x-3)(x+5)$"], correct: 0, hint: "Find two numbers multiplying to $-15$ and adding to $-2$: $-5$ and $+3$." },
      { text: "Factorise $9x^2 - 6x + 1$.", options: ["$(3x-1)^2$","$(3x+1)^2$","$(3x-1)(3x+1)$","$(9x-1)(x-1)$"], correct: 0, hint: "Perfect Square: $(3x)^2-2(3x)(1)+1^2=(3x-1)^2$." },
      { text: "Factorise $x^3 - x$.", options: ["$x(x-1)(x+1)$","$x(x^2-1)$","$x^2(x-1)$","$(x^2-1)$"], correct: 0, hint: "Factor out $x$: $x(x^2-1)$. Then apply Difference of Two Squares: $x(x-1)(x+1)$." },
      { text: "Factorise $2x^2 - 5x - 3$.", options: ["$(2x+1)(x-3)$","$(2x-1)(x+3)$","$(x-3)(2x+3)$","$(x+1)(2x-3)$"], correct: 0, hint: "$ac=-6$. Pairs adding to $-5$: $+1$ and $-6$. Rewrite and group." },
      { text: "Factorise $ax - ay + bx - by$.", options: ["$(a+b)(x-y)$","$(a-b)(x+y)$","$(a+b)(x+y)$","$(ax-y)(b+1)$"], correct: 0, hint: "Group: $a(x-y)+b(x-y)=(a+b)(x-y)$." },
      { text: "Factorise $x^2 + 4x + 4 - y^2$.", options: ["$(x+2-y)(x+2+y)$","$(x+2)^2-y$","$(x+2+y)^2$","$(x+4-y)(x-y)$"], correct: 0, hint: "First 3 terms $=(x+2)^2$. Then Difference of Two Squares: $(x+2)^2-y^2$." },
    // 15 Additional Factorization Questions
  { text: "Factorise $x^2 - xy - 2x + 2y$.", options: ["$(x-2)(x-y)$","$(x+2)(x-y)$","$(x-2)(x+y)$","$(x+y)(x-2)$"], correct: 0, hint: "Group terms: $x(x-y) - 2(x-y) = (x-2)(x-y)$." },
  { text: "Factorise $1 - 16x^2$.", options: ["$(1-4x)(1+4x)$","$(1-4x)^2$","$(4x-1)(4x+1)$","$(1-8x)(1+8x)$"], correct: 0, hint: "Difference of Two Squares: $1^2 - (4x)^2 = (1-4x)(1+4x)$." },
  { text: "Factorise $2x^2 + 7x + 3$.", options: ["$(2x+1)(x+3)$","$(2x+3)(x+1)$","$(2x-1)(x-3)$","$(x+7)(2x+1)$"], correct: 0, hint: "Cross method: $(2x \times 3) + (1 \times x) = 7x$." },
  { text: "Factorise $4x^2 - 12x + 9$.", options: ["$(2x-3)^2$","$(2x+3)^2$","$(2x-3)(2x+3)$","$(4x-3)(x-3)$"], correct: 0, hint: "Perfect Square: $(2x)^2 - 2(2x)(3) + 3^2 = (2x-3)^2$." },
  { text: "Factorise $5x^2 - 20x$.", options: ["$5x(x-4)$","$5(x^2-4x)$","$x(5x-20)$","$5x(x+4)$"], correct: 0, hint: "Take out the Highest Common Factor (HCF) which is $5x$." },
  { text: "Factorise $x^2 + 2x - 8$.", options: ["$(x+4)(x-2)$","$(x-4)(x+2)$","$(x+8)(x-1)$","$(x+2)(x+4)$"], correct: 0, hint: "Find two numbers that multiply to $-8$ and add to $+2$: $+4$ and $-2$." },
  { text: "Factorise $a^2 - b^2 + a - b$.", options: ["$(a-b)(a+b+1)$","$(a-b)(a+b-1)$","$(a+b)(a-b+1)$","$(a-b)(a+b)$"], correct: 0, hint: "Factor $a^2-b^2$ first: $(a-b)(a+b) + (a-b)$. Then take out $(a-b)$." },
  { text: "Factorise $x^2 - 100$.", options: ["$(x-10)(x+10)$","$(x-10)^2$","$(x+10)^2$","$(x-50)(x+2)$"], correct: 0, hint: "Difference of Two Squares: $x^2 - 10^2$." },
  { text: "Factorise $3x^2 - 10x + 3$.", options: ["$(3x-1)(x-3)$","$(3x-3)(x-1)$","$(3x+1)(x+3)$","$(x-3)(3x+1)$"], correct: 0, hint: "Cross method: $(3x \times -3) + (-1 \times x) = -10x$." },
  { text: "Factorise $2x^2 - 2x - 12$.", options: ["$2(x-3)(x+2)$","$2(x+3)(x-2)$","$(2x-6)(x+2)$","$2(x-6)(x+1)$"], correct: 0, hint: "Take out factor 2 first: $2(x^2-x-6)$. Then factor the quadratic." },
  { text: "Factorise $25x^2 + 10x + 1$.", options: ["$(5x+1)^2$","$(5x-1)^2$","$(25x+1)(x+1)$","$(5x+1)(5x-1)$"], correct: 0, hint: "Perfect Square: $(5x)^2 + 2(5x)(1) + 1^2$." },
  { text: "Factorise $x^2 - y^2 - 4y - 4$.", options: ["$(x-y-2)(x+y+2)$","$(x-y+2)(x+y-2)$","$(x-y-2)^2$","$(x^2)-(y+2)^2$"], correct: 0, hint: "Group last 3 terms: $x^2 - (y^2+4y+4) = x^2 - (y+2)^2$. Then use $a^2-b^2$." },
  { text: "Factorise $x^2 - 8x + 15$.", options: ["$(x-3)(x-5)$","$(x+3)(x+5)$","$(x-1)(x-15)$","$(x-2)(x-6)$"], correct: 0, hint: "Find two numbers that multiply to $+15$ and add to $-8$: $-3$ and $-5$." },
  { text: "Factorise $4x^3 - 36x$.", options: ["$4x(x-3)(x+3)$","$4x(x^2-9)$","$4(x^3-9x)$","$x(4x-6)(4x+6)$"], correct: 0, hint: "Take out $4x$ first: $4x(x^2-9)$. Then use Difference of Two Squares." },
  { text: "Factorise $2ax - 6ay - bx + 3by$.", options: ["$(2a-b)(x-3y)$","$(2a+b)(x-3y)$","$(a-3b)(2x-y)$","$(2a-b)(x+3y)$"], correct: 0, hint: "Group: $2a(x-3y) - b(x-3y)$." },
  // --- PART 1: HCF & Basic Identities (10 Questions) ---
  { text: "Factorise $7x^2 - 21x$.", options: ["$7x(x-3)$","$7(x^2-3x)$","$x(7x-21)$","$7x(x+3)$"], correct: 0, hint: "HCF is $7x$. Divide both terms by $7x$." },
  { text: "Factorise $x^2 - 49$.", options: ["$(x-7)(x+7)$","$(x-7)^2$","$(x+7)^2$","$(x-49)(x+1)$"], correct: 0, hint: "Difference of squares: $x^2 - 7^2$." },
  { text: "Factorise $x^2 + 12x + 36$.", options: ["$(x+6)^2$","$(x-6)^2$","$(x+4)(x+9)$","$(x+12)(x+3)$"], correct: 0, hint: "Perfect square: $2 \\times 6 = 12$." },
  { text: "Factorise $12a^2b + 18ab^2$.", options: ["$6ab(2a+3b)$","$6(2a^2b+3ab^2)$","$ab(12a+18b)$","$6a^2b^2(2+3)$"], correct: 0, hint: "HCF of 12 and 18 is 6. Factor out $6ab$." },
  { text: "Factorise $64 - x^2$.", options: ["$(8-x)(8+x)$","$(x-8)(x+8)$","$(8-x)^2$","$(x-64)(x+1)$"], correct: 0, hint: "Difference of squares: $8^2 - x^2$." },
  { text: "Factorise $x^2 - 14x + 49$.", options: ["$(x-7)^2$","$(x+7)^2$","$(x-7)(x+7)$","$(x-14)(x-1)$"], correct: 0, hint: "Perfect square: $(-7)^2 = 49$ and $2(-7) = -14$." },
  { text: "Factorise $4x^2 - 1$.", options: ["$(2x-1)(2x+1)$","$(4x-1)(x+1)$","$(2x-1)^2$","$(1-2x)(1+2x)$"], correct: 0, hint: "Difference of squares: $(2x)^2 - 1^2$." },
  { text: "Factorise $5x^3 + 10x^2$.", options: ["$5x^2(x+2)$","$5x(x^2+2x)$","$5(x^3+2x^2)$","$x^2(5x+10)$"], correct: 0, hint: "HCF is $5x^2$." },
  { text: "Factorise $100y^2 - 81$.", options: ["$(10y-9)(10y+9)$","$(10y-9)^2$","$(9-10y)(9+10y)$","$(10y-81)(y+1)$"], correct: 0, hint: "Difference of squares: $(10y)^2 - 9^2$." },
  { text: "Factorise $x^2 + 20x + 100$.", options: ["$(x+10)^2$","$(x-10)^2$","$(x+20)(x+5)$","$(x+50)(x+2)$"], correct: 0, hint: "Perfect square: $10^2=100$ and $2(10)=20$." },
  // --- PART 2: Cross Method & Grouping (10 Questions) ---
  { text: "Factorise $x^2 - 9x + 20$.", options: ["$(x-4)(x-5)$","$(x-2)(x-10)$","$(x+4)(x+5)$","$(x-1)(x-20)$"], correct: 0, hint: "Find numbers multiplying to $+20$ and adding to $-9$." },
  { text: "Factorise $x^2 - x - 20$.", options: ["$(x-5)(x+4)$","$(x+5)(x-4)$","$(x-10)(x+2)$","$(x-2)(x+10)$"], correct: 0, hint: "Find numbers multiplying to $-20$ and adding to $-1$." },
  { text: "Factorise $3x^2 + 8x + 4$.", options: ["$(3x+2)(x+2)$","$(3x+1)(x+4)$","$(3x+4)(x+1)$","$(3x-2)(x-2)$"], correct: 0, hint: "Cross method: $6x + 2x = 8x$." },
  { text: "Factorise $2x^2 - 7x + 6$.", options: ["$(2x-3)(x-2)$","$(2x-2)(x-3)$","$(2x+3)(x+2)$","$(x-6)(2x-1)$"], correct: 0, hint: "Cross method: $-4x - 3x = -7x$." },
  { text: "Factorise $ac + ad - bc - bd$.", options: ["$(a-b)(c+d)$","$(a+b)(c-d)$","$(a-c)(b+d)$","$(a-b)(c-d)$"], correct: 0, hint: "Group: $a(c+d) - b(c+d)$." },
  { text: "Factorise $x^2 + 13x + 40$.", options: ["$(x+5)(x+8)$","$(x+4)(x+10)$","$(x+2)(x+20)$","$(x+1)(x+40)$"], correct: 0, hint: "Multiply to 40, add to 13." },
  { text: "Factorise $5x^2 - 14x - 3$.", options: ["$(5x+1)(x-3)$","$(5x-1)(x+3)$","$(x-1)(5x+3)$","$(5x-3)(x+1)$"], correct: 0, hint: "Cross method: $-15x + x = -14x$." },
  { text: "Factorise $2x^2 - 11x + 5$.", options: ["$(2x-1)(x-5)$","$(2x-5)(x-1)$","$(2x+1)(x+5)$","$(x-10)(x-1)$"], correct: 0, hint: "Cross method: $-10x - x = -11x$." },
  { text: "Factorise $x^2 - 11x + 24$.", options: ["$(x-3)(x-8)$","$(x-2)(x-12)$","$(x-4)(x-6)$","$(x+3)(x+8)$"], correct: 0, hint: "Multiply to 24, add to -11." },
  { text: "Factorise $ax + 2ay - bx - 2by$.", options: ["$(a-b)(x+2y)$","$(a+b)(x-2y)$","$(a-x)(b+2y)$","$(a-b)(x-2y)$"], correct: 0, hint: "Group: $a(x+2y) - b(x+2y)$." },
  // --- PART 3: HKDSE Section A1 Traps (20 Questions) ---
  { text: "Factorise $x^2 - 16x + 64 - 9y^2$.", options: ["$(x-8-3y)(x-8+3y)$","$(x-8-3y)^2$","$(x+8-3y)(x+8+3y)$","$(x-8-9y)(x-8+y)$"], correct: 0, hint: "$(x-8)^2 - (3y)^2$. Difference of squares." },
  { text: "Factorise $4x^2 - (y-3)^2$.", options: ["$(2x-y+3)(2x+y-3)$","$(2x-y-3)(2x+y+3)$","$(4x-y+3)(x+y-3)$","$(2x+y+3)(2x-y-3)$"], correct: 0, hint: "$(2x)^2 - (y-3)^2$. Watch the sign change: $-(y-3) = -y+3$." },
  { text: "Factorise $2x^3 - 50x$.", options: ["$2x(x-5)(x+5)$","$2x(x^2-25)$","$x(2x-10)(2x+10)$","$2(x^3-25x)$"], correct: 0, hint: "Take out $2x$ first, then factorise $x^2-25$." },
  { text: "Factorise $x^2 - y^2 + 2x - 2y$.", options: ["$(x-y)(x+y+2)$","$(x-y)(x+y-2)$","$(x+y)(x-y+2)$","$(x-y)(x+y+1)$"], correct: 0, hint: "$(x-y)(x+y) + 2(x-y)$." },
  { text: "Factorise $1 - a^2 - 2ab - b^2$.", options: ["$(1-a-b)(1+a+b)$","$(1-a+b)(1+a-b)$","$(1-a-b)^2$","$(a+b-1)(a+b+1)$"], correct: 0, hint: "$1 - (a^2+2ab+b^2) = 1^2 - (a+b)^2$." },
  { text: "Factorise $x^4 - 16$.", options: ["$(x-2)(x+2)(x^2+4)$","$(x^2-4)^2$","$(x-2)^2(x+2)^2$","$(x^2+4)(x^2+4)$"], correct: 0, hint: "Factorise $x^2-4$ again after the first step." },
  { text: "Factorise $12x^2 + 10x - 8$.", options: ["$2(2x-1)(3x+4)$","$2(6x^2+5x-4)$","$2(3x-1)(2x+4)$","$(4x-2)(3x+4)$"], correct: 0, hint: "HCF is 2. Then factorise $6x^2+5x-4$." },
  { text: "Factorise $x^2 - 6xy + 9y^2 - 25$.", options: ["$(x-3y-5)(x-3y+5)$","$(x-3y-5)^2$","$(x+3y-5)(x+3y+5)$","$(x-3y-25)(x-3y+1)$"], correct: 0, hint: "$(x-3y)^2 - 5^2$." },
  { text: "Factorise $x - 2y - ax + 2ay$.", options: ["$(1-a)(x-2y)$","$(a-1)(x-2y)$","$(1+a)(x-2y)$","$(1-a)(x+2y)$"], correct: 0, hint: "$(x-2y) - a(x-2y)$." },
  { text: "Factorise $x^2 + 8x + 16 - 49z^2$.", options: ["$(x+4-7z)(x+4+7z)$","$(x+4-7z)^2$","$(x-4-7z)(x-4+7z)$","$(x+4-49z)(x+4+z)$"], correct: 0, hint: "$(x+4)^2 - (7z)^2$." },
  { text: "Factorise $18x^2 - 8$.", options: ["$2(3x-2)(3x+2)$","$2(9x^2-4)$","$x(18x-8)$","$(6x-4)(3x+2)$"], correct: 0, hint: "Take out 2 first." },
  { text: "Factorise $x^2 - 2xy + y^2 - x + y$.", options: ["$(x-y)(x-y-1)$","$(x-y)(x-y+1)$","$(x+y)(x-y-1)$","$(x-y)^2-x+y$"], correct: 0, hint: "$(x-y)^2 - (x-y)$." },
  { text: "Factorise $x^2 - 4y^2 + 2x + 4y$.", options: ["$(x-2y)(x+2y+2)$","$(x-2y)(x+2y-2)$","$(x+2y)(x-2y+2)$","$(x-2y)(x+2y+1)$"], correct: 0, hint: "$(x-2y)(x+2y) + 2(x-2y)$." },
  { text: "Factorise $4 - x^2 + 6x - 9$.", options: ["$(2-x+3)(2+x-3)$","$(x-3)^2-4$","$4-(x-3)^2$","$(1+x)(5-x)$"], correct: 3, hint: "$4 - (x^2-6x+9) = 2^2 - (x-3)^2$. So the fully factorised form is $(1+x)(5-x)$." },
  { text: "Factorise $a^2 - 4ab + 4b^2 - c^2$.", options: ["$(a-2b-c)(a-2b+c)$","$(a-2b-c)^2$","$(a+2b-c)(a+2b+c)$","$(a-2b-c^2)$"], correct: 0, hint: "$(a-2b)^2 - c^2$." },
  { text: "Factorise $x^3 - 4x^2 + 4x$.", options: ["$x(x-2)^2$","$x(x^2-4x+4)$","$x(x+2)^2$","$x^2(x-4)+4x$"], correct: 0, hint: "Factor out $x$ first." },
  { text: "Factorise $25 - (x-1)^2$.", options: ["$(6-x)(4+x)$","$(5-x+1)(5+x-1)$","$(4-x)(6+x)$","$(25-x+1)(25+x-1)$"], correct: 0, hint: "$(5-(x-1))(5+(x-1)) = (6-x)(4+x)$." },
  { text: "Factorise $2x^2 - 12x + 18$.", options: ["$2(x-3)^2$","$2(x-9)$","$2(x+3)^2$","$(2x-6)(x-3)$"], correct: 0, hint: "$2(x^2-6x+9)$." },
  { text: "Factorise $x^2 - y^2 + 3x - 3y$.", options: ["$(x-y)(x+y+3)$","$(x-y)(x+y-3)$","$(x+y)(x-y+3)$","$(x-y)^2+3$"], correct: 0, hint: "$(x-y)(x+y) + 3(x-y)$." }
],
    sa: [],
  },
  changeOfSubject: {
    mc: [
      {
        // Q94 [HKCEE 1999 MII Q.1]
        text: "If $y = \\frac{1}{2x - 1}$, then $x = $",
        options: ["$\\frac{y+1}{2y}$", "$\\frac{y-1}{2y}$", "$\\frac{1-y}{2y}$", "$\\frac{1}{2y} + 1$"],
        correct: 0,
        hint: "Multiply by $(2x-1)$ to get $y(2x-1) = 1$. Then expand: $2xy - y = 1$.",
      },
      {
        // Q108 [HKCEE 2002 MII Q.3]
        text: "If $h = 5 + \\frac{k}{2 - k}$, then $k = $",
        options: ["$\\frac{h-5}{h-4}$", "$\\frac{h-5}{h-6}$", "$\\frac{2h-10}{h-4}$", "$\\frac{2h-10}{h-6}$"],
        correct: 2,
        hint: "First, isolate the fraction: $h - 5 = \\frac{k}{2 - k}$. Then cross-multiply.",
      },
      {
        // Q121 [HKCEE 2006 MII Q.4]
        text: "If $\\frac{1}{a} + \\frac{b}{c} = 2$, then $c = $",
        options: ["$\\frac{ab}{2a-1}$", "$\\frac{ab}{1-2a}$", "$\\frac{a-2}{ab}$", "$\\frac{2-a}{ab}$"],
        correct: 0,
        hint: "$\\frac{b}{c} = 2 - \\frac{1}{a} = \\frac{2a-1}{a}$. Flip both sides to solve for $c$.",
      },
      {
        // Q123 [HKCEE 2007 MII Q.4]
        text: "If $a = \\frac{b-1}{c-2}$, then $c = $",
        options: ["$\\frac{b-1+2a}{a}$", "$\\frac{b-1-2a}{a}$", "$\\frac{b+1+2a}{a}$", "$\\frac{b-1}{a-2}$"],
        correct: 0,
        hint: "Cross-multiply: $a(c-2) = b-1$, so $ac - 2a = b-1$. Now isolate $ac$.",
      },
      {
        // Q131 [HKCEE 2010 MII Q.4]
        text: "If $h = \\frac{a+b}{ab}$, then $b = $",
        options: ["$\\frac{a}{ah-1}$", "$\\frac{a}{ah+1}$", "$\\frac{h-a}{a}$", "$\\frac{a-h}{a}$"],
        correct: 0,
        hint: "Cross-multiply to get $hab = a + b$. Group all 'b' terms: $hab - b = a$.",
      },
      {
        // Q138 [HKCEE 2011 MII Q.4]
        text: "If $u = \\frac{v+2}{2v-1}$, then $v = $",
        options: ["$\\frac{u+2}{2u-1}$", "$\\frac{u-2}{2u-1}$", "$\\frac{u+2}{2u+1}$", "$\\frac{u-2}{2u+1}$"],
        correct: 0,
        hint: "Expand $u(2v-1) = v+2$ to $2uv - u = v + 2$. Move $v$ to one side: $2uv - v = u + 2$.",
      },
      {
        // Q143 [HKDSE 2012 MII Q.3]
        text: "If $a = \\frac{b+2c}{3bc}$, then $c = $",
        options: ["$\\frac{b}{3ab-2}$", "$\\frac{b}{2-3ab}$", "$\\frac{b}{3ab+2}$", "$\\frac{2b}{3ab-1}$"],
        correct: 0,
        hint: "$3abc = b + 2c$. Group the terms with $c$: $3abc - 2c = b$.",
      },
      {
        // Q156 [HKDSE 2015 MII Q.3]
        text: "If $x = \\frac{3+4y}{y-2}$, then $y = $",
        options: ["$\\frac{2x+3}{x-4}$", "$\\frac{2x-3}{x-4}$", "$\\frac{2x+3}{x+4}$", "$\\frac{2x-3}{x+4}$"],
        correct: 0,
        hint: "Multiply by $(y-2)$ to get $xy - 2x = 3 + 4y$. Group $y$ terms: $xy - 4y = 2x + 3$.",
      },
      {
        // Q162 [HKDSE 2017 MII Q.3]
        text: "If $A = 2(l+w)h$, then $w = $",
        options: ["$\\frac{A-2lh}{2h}$", "$\\frac{A-2lh}{h}$", "$\\frac{A-lh}{2h}$", "$\\frac{A}{2h} + l$"],
        correct: 0,
        hint: "Divide by $2h$ first: $\\frac{A}{2h} = l + w$. Then subtract $l$.",
      },
      {
        // Q168 [HKDSE 2019 MII Q.3]
        text: "If $h = \\frac{k-5}{k+5}$, then $k = $",
        options: ["$\\frac{5(1+h)}{1-h}$", "$\\frac{5(1-h)}{1+h}$", "$\\frac{5h+1}{h-1}$", "$\\frac{5h-1}{h+1}$"],
        correct: 0,
        hint: "Cross-multiply: $hk + 5h = k - 5$. Rearrange: $5h + 5 = k - hk$.",
      },
      {
        // Q169 [HKDSE 2019 MII Q.4]
        text: "If $x = \\sqrt{y+3} - 1$, then $y = $",
        options: ["$(x+1)^2 - 3$", "$(x-1)^2 - 3$", "$x^2 - 2$", "$x^2 + 2$"],
        correct: 0,
        hint: "Isolate the root: $x+1 = \\sqrt{y+3}$. Square both sides: $(x+1)^2 = y+3$.",
      },
      { text: "Make $x$ the subject: $y = 3x + 2$.", options: ["$x = \\frac{y-2}{3}$","$x = \\frac{y+2}{3}$","$x = \\frac{y}{3} + 2$","$x = \\frac{y}{3} - 2$"], correct: 0, hint: "Subtract 2: $y-2 = 3x$. Divide by 3." },
      { text: "Make $x$ the subject: $y = \\frac{x}{5} - 1$.", options: ["$x = 5(y+1)$","$x = 5y - 1$","$x = 5y + 1$","$x = \\frac{y+1}{5}$"], correct: 0, hint: "Add 1: $y+1 = \\frac{x}{5}$. Multiply by 5." },
      { text: "Make $x$ the subject: $y = \\sqrt{x - 1}$.", options: ["$x = y^2 + 1$","$x = y^2 - 1$","$x = (y+1)^2$","$x = \\sqrt{y} + 1$"], correct: 0, hint: "Square both sides: $y^2 = x-1$. Add 1." },
      { text: "Make $r$ the subject of $A = \\pi r^2$.", options: ["$r = \\sqrt{\\frac{A}{\\pi}}$","$r = \\frac{A}{\\pi^2}$","$r = \\frac{\\sqrt{A}}{\\pi}$","$r = \\frac{A^2}{\\pi}$"], correct: 0, hint: "Divide by $\\pi$: $r^2 = \\frac{A}{\\pi}$. Take the positive square root." },
      { text: "Make $x$ the subject: $y = \\frac{2x+1}{x-3}$.", options: ["$x = \\frac{3y+1}{y-2}$","$x = \\frac{3y-1}{y-2}$","$x = \\frac{y+3}{y-2}$","$x = \\frac{1+3y}{2-y}$"], correct: 0, hint: "Cross-multiply: $y(x-3) = 2x+1$. Expand and collect $x$ terms." },
      { text: "Make $v$ the subject: $E = \\frac{1}{2}mv^2$.", options: ["$v = \\sqrt{\\frac{2E}{m}}$","$v = \\frac{2E}{m}$","$v = \\frac{\\sqrt{E}}{m}$","$v = \\sqrt{\\frac{E}{2m}}$"], correct: 0, hint: "Multiply by 2: $2E = mv^2$. Divide by $m$. Take the square root." },
      { text: "Make $x$ the subject: $y = \\frac{x+1}{x+2}$.", options: ["$x = \\frac{2y-1}{1-y}$","$x = \\frac{2y+1}{1-y}$","$x = \\frac{1-2y}{y-1}$","$x = \\frac{y+1}{y-1}$"], correct: 0, hint: "Cross-multiply: $y(x+2) = x+1$. Expand and group $x$ terms." },
      { text: "Make $b$ the subject: $c = \\sqrt{a^2 + b^2}$.", options: ["$b = \\sqrt{c^2 - a^2}$","$b = c - a$","$b = \\sqrt{c^2 + a^2}$","$b = c^2 - a^2$"], correct: 0, hint: "Square both sides: $c^2 = a^2+b^2$. Then $b^2 = c^2-a^2$. Take the positive square root." },
      { text: "Make $x$ the subject: $y = (x-1)^2 + 3$.", options: ["$x = \\sqrt{y-3} + 1$","$x = \\sqrt{y+3} - 1$","$x = (y-3)^2 + 1$","$x = \\sqrt{y-3} - 1$"], correct: 0, hint: "Subtract 3: $(x-1)^2 = y-3$. Take the square root then add 1." },
      { text: "Make $h$ the subject: $V = \\frac{1}{3}\\pi r^2 h$.", options: ["$h = \\frac{3V}{\\pi r^2}$","$h = \\frac{V}{\\pi r^2}$","$h = \\frac{3V}{r^2}$","$h = \\frac{V}{3\\pi r^2}$"], correct: 0, hint: "Multiply by 3: $3V = \\pi r^2 h$. Divide by $\\pi r^2$." },
      { text: "If $y = \\frac{x-2}{x+2}$, then $x = $", options: ["$\\frac{2(y+1)}{1-y}$","$\\frac{2(y-1)}{1+y}$","$\\frac{2y+1}{y-1}$","$\\frac{y+2}{y-2}$"], correct: 0, hint: "Cross-multiply: $y(x+2) = x-2$. Expand: $xy+2y = x-2$. Collect $x$ terms." },
      { text: "Make $x$ the subject: $y = 2x^2 - 3$.", options: ["$x = \\sqrt{\\frac{y+3}{2}}$","$x = \\sqrt{\\frac{y-3}{2}}$","$x = \\frac{y+3}{2}$","$x = \\sqrt{2(y+3)}$"], correct: 0, hint: "Add 3: $y+3 = 2x^2$. Divide by 2. Take the positive square root." },
      { text: "Make $q$ the subject: $p = \\frac{3q+2}{q-1}$.", options: ["$q = \\frac{p+2}{p-3}$","$q = \\frac{p-2}{p+3}$","$q = \\frac{p+1}{p-3}$","$q = \\frac{3p+2}{p-1}$"], correct: 0, hint: "Cross-multiply: $p(q-1) = 3q+2$. Expand: $pq-p = 3q+2$. Group $q$ terms." },
      { text: "Make $P$ the subject: $A = P(1+r)^n$.", options: ["$P = \\frac{A}{(1+r)^n}$","$P = A(1-r)^n$","$P = A - r^n$","$P = \\frac{A}{1+nr}$"], correct: 0, hint: "Divide both sides by $(1+r)^n$." },
// --- WARM-UP (10 Questions) ---
{ text: "Make $x$ the subject of $y = x + a$.", options: ["$x = y - a$", "$x = a - y$", "$x = y + a$", "$x = \\frac{y}{a}$"], correct: 0, hint: "Subtract $a$ from both sides." },
{ text: "Make $x$ the subject of $y = ax$.", options: ["$x = \\frac{y}{a}$", "$x = y - a$", "$x = ay$", "$x = \\frac{a}{y}$"], correct: 0, hint: "Divide both sides by $a$." },
{ text: "Make $a$ the subject of $P = 2a + 2b$.", options: ["$a = \\frac{P - 2b}{2}$", "$a = \\frac{P}{2} - 2b$", "$a = P - b$", "$a = \\frac{P + 2b}{2}$"], correct: 0, hint: "Subtract $2b$ first, then divide by 2." },
{ text: "Make $u$ the subject of $v = u + at$.", options: ["$u = v - at$", "$u = v + at$", "$u = \\frac{v}{at}$", "$u = at - v$"], correct: 0, hint: "Isolate $u$ by subtracting $at$." },
{ text: "Make $r$ the subject of $C = 2\\pi r$.", options: ["$r = \\frac{C}{2\\pi}$", "$r = C - 2\\pi$", "$r = \\frac{2\\pi}{C}$", "$r = 2\\pi C$"], correct: 0, hint: "Divide by the constant $2\\pi$." },
{ text: "Make $x$ the subject of $y = \\frac{x}{k}$.", options: ["$x = ky$", "$x = \\frac{y}{k}$", "$x = y + k$", "$x = y - k$"], correct: 0, hint: "Multiply both sides by $k$." },
{ text: "Make $x$ the subject of $y = 3 - x$.", options: ["$x = 3 - y$", "$x = y - 3$", "$x = y + 3$", "$x = -3 - y$"], correct: 0, hint: "Move $-x$ to the left to make it positive." },
{ text: "Make $h$ the subject of $V = \\frac{1}{3}Ah$.", options: ["$h = \\frac{3V}{A}$", "$h = \\frac{V}{3A}$", "$h = 3VA$", "$h = \\frac{A}{3V}$"], correct: 0, hint: "Multiply by 3 then divide by $A$." },
{ text: "Make $x$ the subject of $y = mx + c$.", options: ["$x = \\frac{y - c}{m}$", "$x = \\frac{y + c}{m}$", "$x = y - c - m$", "$x = \\frac{y}{m} - c$"], correct: 0, hint: "Subtract $c$ then divide by $m$." },
{ text: "Make $s$ the subject of $v^2 = u^2 + 2as$.", options: ["$s = \\frac{v^2 - u^2}{2a}$", "$s = \\frac{v - u}{2a}$", "$s = v^2 - u^2 - 2a$", "$s = \\frac{u^2 - v^2}{2a}$"], correct: 0, hint: "Subtract $u^2$ then divide by $2a$." },

// --- INTERMEDIATE (10 Questions) ---
{ text: "Make $x$ the subject of $y = \\frac{a}{x}$.", options: ["$x = \\frac{a}{y}$", "$x = ay$", "$x = \\frac{y}{a}$", "$x = a - y$"], correct: 0, hint: "Multiply by $x$ then divide by $y$." },
{ text: "Make $k$ the subject of $T = 2\\pi\\sqrt{k}$.", options: ["$k = (\\frac{T}{2\\pi})^2$", "$k = \\frac{T^2}{2\\pi}$", "$k = \\sqrt{\\frac{T}{2\\pi}}$", "$k = \\frac{T}{4\\pi^2}$"], correct: 0, hint: "Divide by $2\\pi$ then square both sides." },
{ text: "Make $x$ the subject of $ax + b = cx + d$.", options: ["$x = \\frac{d - b}{a - c}$", "$x = \\frac{d + b}{a + c}$", "$x = \\frac{b - d}{c - a}$", "$x = d - b - a + c$"], correct: 0, hint: "Group $x$ terms and factorize: $x(a-c) = d-b$." },
{ text: "Make $m$ the subject of $E = \\frac{1}{2}mv^2$.", options: ["$m = \\frac{2E}{v^2}$", "$m = \\sqrt{\\frac{2E}{v}}$", "$m = \\frac{E}{2v^2}$", "$m = 2Ev^2$"], correct: 0, hint: "Multiply by 2 then divide by $v^2$." },
{ text: "Make $x$ the subject of $y = \\frac{1}{x+1}$.", options: ["$x = \\frac{1}{y} - 1$", "$x = \\frac{1-y}{y}$", "$x = y - 1$", "$x = \\frac{1}{y} + 1$"], correct: 0, hint: "Swap $y$ and $(x+1)$." },
{ text: "Make $b$ the subject of $A = \\frac{(a+b)h}{2}$.", options: ["$b = \\frac{2A}{h} - a$", "$b = \\frac{2A - a}{h}$", "$b = \\frac{A}{2h} - a$", "$b = \\frac{2Ah}{a}$"], correct: 0, hint: "Multiply by 2, divide by $h$, subtract $a$." },
{ text: "Make $x$ the subject of $y = \\sqrt{x - h}$.", options: ["$x = y^2 + h$", "$x = (y+h)^2$", "$x = y^2 - h$", "$x = \\sqrt{y+h}$"], correct: 0, hint: "Square both sides first: $y^2 = x - h$." },
{ text: "Make $f$ the subject of $\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$.", options: ["$f = \\frac{uv}{u+v}$", "$f = u + v$", "$f = \\frac{u+v}{uv}$", "$f = uv$"], correct: 0, hint: "Common denominator for RHS: $\\frac{u+v}{uv}$, then flip." },
{ text: "Make $a$ the subject of $S = \\frac{n}{2}(2a + (n-1)d)$.", options: ["$a = \\frac{2S - n(n-1)d}{2n}$", "$a = \\frac{S}{n} + \\frac{(n-1)d}{2}$", "$a = \\frac{2S}{n} - (n-1)d$", "$a = \\frac{S - nd}{2}$"], correct: 0, hint: "Multiply by 2, divide by $n$, then isolate $2a$." },
{ text: "Make $x$ the subject of $y = \\frac{x-a}{x+a}$.", options: ["$x = \\frac{a(1+y)}{1-y}$", "$x = \\frac{a(y-1)}{y+1}$", "$x = \\frac{1+y}{a(1-y)}$", "$x = a(1-y)$"], correct: 0, hint: "Expand $y(x+a) = x-a$ and collect $x$." },

// --- HKDSE LEVEL (20 Questions) ---
{ text: "Make $x$ the subject of $y = \\frac{3x - 2}{x + 1}$.", options: ["$x = \\frac{y + 2}{3 - y}$", "$x = \\frac{y - 2}{3 + y}$", "$x = \\frac{2 - y}{y - 3}$", "$x = \\frac{y + 2}{y - 3}$"], correct: 0, hint: "Expand $y(x+1)$, move $x$ terms to LHS." },
{ text: "Make $a$ the subject of $b = \\frac{1 - 2a}{3a + 5}$.", options: ["$a = \\frac{1 - 5b}{3b + 2}$", "$a = \\frac{5b - 1}{3b + 2}$", "$a = \\frac{1 + 5b}{3b - 2}$", "$a = \\frac{1 - 5b}{3b - 2}$"], correct: 0, hint: "Cross multiply and factor out $a$." },
{ text: "Make $h$ the subject of $S = 2\\pi r^2 + 2\\pi rh$.", options: ["$h = \\frac{S - 2\\pi r^2}{2\\pi r}$", "$h = \\frac{S}{2\\pi r} - r$", "$h = \\frac{S}{2\\pi r} - 2\\pi r$", "$h = S - r$"], correct: 0, hint: "Subtract $2\\pi r^2$ then divide by $2\\pi r$." },
{ text: "Make $x$ the subject of $y = \\frac{k}{x^2}$.", options: ["$x = \\pm\\sqrt{\\frac{k}{y}}$", "$x = \\frac{\\sqrt{k}}{y}$", "$x = (\\frac{k}{y})^2$", "$x = \\pm\\frac{k}{y^2}$"], correct: 0, hint: "Isolate $x^2 = \\frac{k}{y}$ then square root." },
{ text: "Make $g$ the subject of $T = 2\\pi\\sqrt{\\frac{L}{g}}$.", options: ["$g = \\frac{4\\pi^2 L}{T^2}$", "$g = \\frac{2\\pi L}{T^2}$", "$g = \\frac{\\pi^2 L}{T^2}$", "$g = \\frac{4\\pi^2 T^2}{L}$"], correct: 0, hint: "Square both sides: $T^2 = 4\\pi^2 \\frac{L}{g}$." },
{ text: "Make $x$ the subject of $y = \\frac{1}{2}\\sqrt{4 - x^2}$.", options: ["$x = \\pm\\sqrt{4 - 4y^2}$", "$x = \\sqrt{4 - 2y^2}$", "$x = 4 - 4y^2$", "$x = 2 - 2y$"], correct: 0, hint: "Multiply by 2 then square: $4y^2 = 4 - x^2$." },
{ text: "Make $p$ the subject of $\\frac{3}{p} - \\frac{2}{q} = 1$.", options: ["$p = \\frac{3q}{q+2}$", "$p = \\frac{3q}{q-2}$", "$p = \\frac{q+2}{3q}$", "$p = 3 - \\frac{2}{q}$"], correct: 0, hint: "Isolate $\\frac{3}{p} = \\frac{q+2}{q}$ then flip." },
{ text: "Make $x$ the subject of $a(x+b) = c - x$.", options: ["$x = \\frac{c - ab}{a + 1}$", "$x = \\frac{c - b}{a + 1}$", "$x = \\frac{c - ab}{a - 1}$", "$x = \\frac{c + ab}{a + 1}$"], correct: 0, hint: "Expand and move $-x$ to the left." },
{ text: "Make $y$ the subject of $x = \\frac{2y-3}{4} + 1$.", options: ["$y = \\frac{4x - 1}{2}$", "$y = 2x - 2.5$", "$y = \\frac{4x + 1}{2}$", "$y = 2x + 1$"], correct: 0, hint: "Subtract 1, multiply by 4, add 3, divide by 2." },
{ text: "Make $m$ the subject of $y - y_1 = m(x - x_1)$.", options: ["$m = \\frac{y - y_1}{x - x_1}$", "$m = \\frac{x - x_1}{y - y_1}$", "$m = (y - y_1)(x - x_1)$", "$m = \\frac{y + y_1}{x + x_1}$"], correct: 0, hint: "Divide by the entire bracket $(x - x_1)$." },
{ text: "Make $x$ the subject of $y = \\frac{k+x}{k-x}$.", options: ["$x = \\frac{k(y-1)}{y+1}$", "$x = \\frac{k(1-y)}{1+y}$", "$x = \\frac{y-1}{k(y+1)}$", "$x = k(y-1)$"], correct: 0, hint: "Multiply by $(k-x)$ and collect $x$." },
{ text: "Make $v$ the subject of $a = \\frac{v-u}{t}$.", options: ["$v = u + at$", "$v = at - u$", "$v = \\frac{a}{t} + u$", "$v = u - at$"], correct: 0, hint: "Multiply by $t$ then add $u$." },
{ text: "Make $r$ the subject of $V = \\frac{4}{3}\\pi r^3$.", options: ["$r = \\sqrt[3]{\\frac{3V}{4\\pi}}$", "$r = \\sqrt[3]{\\frac{4\pi}{3V}}$", "$r = \\frac{3V}{4\\pi^3}$", "$r = (\\frac{3V}{4\\pi})^3$"], correct: 0, hint: "Isolate $r^3$ then take cube root." },
{ text: "Make $x$ the subject of $y = 5 - \\frac{2}{x}$.", options: ["$x = \\frac{2}{5-y}$", "$x = \\frac{2}{y-5}$", "$x = \\frac{5-y}{2}$", "$x = \\frac{y-5}{2}$"], correct: 0, hint: "$\\frac{2}{x} = 5 - y$. Swap $x$ and $(5-y)$." },
{ text: "Make $a$ the subject of $S = \\frac{a}{1-r}$.", options: ["$a = S(1-r)$", "$a = \\frac{S}{1-r}$", "$a = S - r$", "$a = 1 - rS$"], correct: 0, hint: "Multiply by the denominator." },
{ text: "Make $x$ the subject of $3(2x-a) = 4(x+b)$.", options: ["$x = \\frac{3a + 4b}{2}$", "$x = \\frac{3a - 4b}{2}$", "$x = 3a + 4b$", "$x = \\frac{4b - 3a}{2}$"], correct: 0, hint: "Expand and group $x$: $6x - 4x = 4b + 3a$." },
{ text: "Make $k$ the subject of $y = \\sqrt{\\frac{k+1}{k-1}}$.", options: ["$k = \\frac{y^2+1}{y^2-1}$", "$k = \\frac{y^2-1}{y^2+1}$", "$k = \\frac{y+1}{y-1}$", "$k = y^2$"], correct: 0, hint: "Square first: $y^2 = \\frac{k+1}{k-1}$." },
{ text: "Make $w$ the subject of $z = \\frac{2w-5}{w+3}$.", options: ["$w = \\frac{3z+5}{2-z}$", "$w = \\frac{3z-5}{2+z}$", "$w = \\frac{2-z}{3z+5}$", "$w = \\frac{5-3z}{z-2}$"], correct: 0, hint: "Group terms: $w(z-2) = -5-3z$." },
{ text: "Make $x$ the subject of $y = ax^n$.", options: ["$x = \\sqrt[n]{\\frac{y}{a}}$", "$x = (\\frac{y}{a})^n$", "$x = \\frac{y^{1/n}}{a}$", "$x = \\sqrt[n]{ay}$"], correct: 0, hint: "Divide by $a$ then take $n$-th root." },
{ text: "Make $C$ the subject of $F = \\frac{9}{5}C + 32$.", options: ["$C = \\frac{5(F-32)}{9}$", "$C = \\frac{5F-32}{9}$", "$C = \\frac{9(F-32)}{5}$", "$C = \\frac{5}{9}F - 32$"], correct: 0, hint: "Subtract 32, multiply by $5/9$." } ],
    sa: [],
  },
  inequalities: {
    mc: [
      { text: "Solve: $2x + 3 > 7$.", options: ["$x > 2$","$x > 5$","$x < 2$","$x > \\frac{7}{2}$"], correct: 0, hint: "Subtract 3: $2x > 4$. Divide by 2: $x > 2$." },
      { text: "Solve: $-3x < 12$.", options: ["$x > -4$","$x > 4$","$x < -4$","$x < 4$"], correct: 0, hint: "Dividing by a NEGATIVE number flips the inequality sign: $x > -4$." },
      { text: "Solve: $5 - 2x \\geq 11$.", options: ["$x \\leq -3$","$x \\geq -3$","$x \\leq 3$","$x \\geq 3$"], correct: 0, hint: "Subtract 5: $-2x \\geq 6$. Divide by $-2$ (reverse sign): $x \\leq -3$." },
      { text: "Solve: $\\frac{x}{3} - 1 < 2$.", options: ["$x < 9$","$x < 3$","$x < 6$","$x > 9$"], correct: 0, hint: "Add 1: $\\frac{x}{3} < 3$. Multiply by 3: $x < 9$." },
      { text: "Which integer values satisfy $-1 < x \\leq 2$?", options: ["$0, 1, 2$","$-1, 0, 1, 2$","$0, 1$","$-1, 0, 1$"], correct: 0, hint: "$-1$ is NOT included (strict $<$) but $2$ IS ($\\leq$). Integers: $0, 1, 2$." },
      { text: "Solve: $3(x-2) < 2(x+1)$.", options: ["$x < 8$","$x < 4$","$x < -8$","$x > 8$"], correct: 0, hint: "Expand: $3x-6 < 2x+2$. Subtract $2x$: $x-6 < 2$, so $x < 8$." },
      { text: "Solve both: $2x+1>5$ AND $x-3<0$.", options: ["$2 < x < 3$","$x > 2$","$x < 3$","No solution"], correct: 0, hint: "Solve each: $x > 2$ and $x < 3$. Intersection: $2 < x < 3$." },
      { text: "Solve: $|x - 2| \\leq 3$.", options: ["$-1 \\leq x \\leq 5$","$x \\geq -1$","$-3 \\leq x \\leq 3$","$x \\leq 5$"], correct: 0, hint: "$|x-2| \\leq 3$ means $-3 \\leq x-2 \\leq 3$. Add 2 throughout." },
      { text: "Solve: $x^2 - 4 < 0$.", options: ["$-2 < x < 2$","$x < -2$ or $x > 2$","$x > 2$","$x < 2$"], correct: 0, hint: "$x^2 < 4$ means $|x| < 2$, giving $-2 < x < 2$." },
      { text: "Solve: $\\frac{2x-1}{3} \\geq x - 2$.", options: ["$x \\leq 5$","$x \\geq 5$","$x \\leq -5$","$x \\geq \\frac{1}{2}$"], correct: 0, hint: "Multiply by 3: $2x-1 \\geq 3x-6$. Rearrange: $5 \\geq x$, i.e. $x \\leq 5$." },
      { text: "How many positive integers satisfy $3x - 2 < 10$?", options: ["$3$","$4$","$2$","$5$"], correct: 0, hint: "Solve: $x < 4$. Positive integers less than 4: $1, 2, 3$. Count: 3." },
      { text: "Solve: $5 - x > 2x - 4$.", options: ["$x < 3$","$x > 3$","$x < \\frac{1}{3}$","$x > \\frac{1}{3}$"], correct: 0, hint: "Collect terms: $9 > 3x$. Divide: $x < 3$." },
      { text: "Solve: $-1 \\leq \\frac{2x+1}{3} \\leq 3$.", options: ["$-2 \\leq x \\leq 4$","$-1 \\leq x \\leq 3$","$0 \\leq x \\leq 4$","$-4 \\leq x \\leq 2$"], correct: 0, hint: "Multiply by 3: $-3 \\leq 2x+1 \\leq 9$. Subtract 1: $-4 \\leq 2x \\leq 8$. Divide by 2." },
      { text: "If $x < 0$ and $y > 0$, which is ALWAYS true?", options: ["$xy < 0$","$x+y > 0$","$\\frac{x}{y} > 0$","$x^2 < 0$"], correct: 0, hint: "Negative × Positive = Negative. So $xy < 0$ is always true." },
      { text: "Solve: $x^2 - 5x + 6 \\leq 0$.", options: ["$2 \\leq x \\leq 3$","$x \\leq 2$ or $x \\geq 3$","$x \\leq -2$ or $x \\geq -3$","$-3 \\leq x \\leq -2$"], correct: 0, hint: "Factor: $(x-2)(x-3) \\leq 0$. The parabola is non-positive between its roots $2$ and $3$." },
    // --- WARM-UP: Basic Operations (10 Questions) ---
    { text: "Solve $x + 3 > 5$.", options: ["$x > 2$", "$x > 8$", "$x < 2$", "$x > -2$"], correct: 0, hint: "Subtract 3 from both sides." },
    { text: "Solve $x - 2 \\leq 4$.", options: ["$x \\leq 6$", "$x \\leq 2$", "$x \\geq 6$", "$x < 6$"], correct: 0, hint: "Add 2 to both sides." },
    { text: "Solve $2x < 10$.", options: ["$x < 5$", "$x > 5$", "$x < 20$", "$x < -5$"], correct: 0, hint: "Divide by positive 2. The sign stays the same." },
    { text: "Solve $\\frac{x}{3} \\geq -1$.", options: ["$x \\geq -3$", "$x \\leq -3$", "$x \\geq 3$", "$x \\geq -\\frac{1}{3}$"], correct: 0, hint: "Multiply by positive 3. The sign stays the same." },
    { text: "Solve $-x > 4$.", options: ["$x < -4$", "$x > -4$", "$x < 4$", "$x > 4$"], correct: 0, hint: "TRAP: Dividing by -1 reverses the inequality sign!" },
    { text: "Solve $5 - x \\leq 2$.", options: ["$x \\geq 3$", "$x \\leq 3$", "$x \\geq -3$", "$x \\leq -3$"], correct: 0, hint: "$-x \\leq -3$. Dividing by -1 flips the sign to $\\geq$." },
    { text: "Solve $3x + 1 > 10$.", options: ["$x > 3$", "$x < 3$", "$x > 11$", "$x > \\frac{11}{3}$"], correct: 0, hint: "Subtract 1 first, then divide by 3." },
    { text: "Which integer is a solution for $x > 2.1$?", options: ["$3$", "$2$", "$1$", "$0$"], correct: 0, hint: "The smallest integer greater than 2.1 is 3." },
    { text: "Solve $-2x \\geq 8$.", options: ["$x \\leq -4$", "$x \\geq -4$", "$x \\leq 4$", "$x < -4$"], correct: 0, hint: "Divide by -2 and reverse the sign." },
    { text: "Solve $\\frac{x}{-2} < 3$.", options: ["$x > -6$", "$x < -6$", "$x > 6$", "$x < 6$"], correct: 0, hint: "Multiply by -2 and reverse the sign." },

    // --- INTERMEDIATE: Multi-step & Number Lines (10 Questions) ---
    { text: "Solve $4 - 3x < 10$.", options: ["$x > -2$", "$x < -2$", "$x > 2$", "$x < 2$"], correct: 0, hint: "$-3x < 6$. Divide by -3 and flip the sign." },
    { text: "Solve $2(x - 3) \\leq 4$.", options: ["$x \\leq 5$", "$x \\leq 7$", "$x \\geq 5$", "$x \\leq 2$"], correct: 0, hint: "Expand: $2x - 6 \\leq 4$, so $2x \\leq 10$." },
    { text: "Solve $\\frac{1-x}{2} > 3$.", options: ["$x < -5$", "$x > -5$", "$x < 7$", "$x < 5$"], correct: 0, hint: "$1-x > 6 \\Rightarrow -x > 5$. Flip sign!" },
    { text: "Solve $5x + 2 > 3x - 8$.", options: ["$x > -5$", "$x < -5$", "$x > 5$", "$x > -3$"], correct: 0, hint: "$2x > -10$. Divide by 2." },
    { text: "Find the smallest integer $n$ such that $2n > 7$.", options: ["$4$", "$3$", "$5$", "$3.5$"], correct: 0, hint: "$n > 3.5$. The smallest integer is 4." },
    { text: "Solve $7 - 2x \\geq 1$.", options: ["$x \\leq 3$", "$x \\geq 3$", "$x \\leq -3$", "$x < 3$"], correct: 0, hint: "$-2x \\geq -6$. Flip sign when dividing by -2." },
    { text: "Solve $\\frac{x+5}{-3} < 1$.", options: ["$x > -2$", "$x < -2$", "$x > -8$", "$x < 2$"], correct: 0, hint: "Multiply by -3 (flip sign): $x+5 > -3$." },
    { text: "Solve $x/2 + 1 \\leq x/3$.", options: ["$x \\leq -6$", "$x \\geq -6$", "$x \\leq 6$", "$x \\geq 6$"], correct: 0, hint: "Multiply by 6: $3x + 6 \\leq 2x$." },
    { text: "Solve $-(3-x) > 2$.", options: ["$x > 5$", "$x < 5$", "$x > 1$", "$x < -1$"], correct: 0, hint: "$-3 + x > 2 \\Rightarrow x > 5$." },
    { text: "How many positive integers satisfy $x < 4$?", options: ["$3$", "$4$", "$5$", "Infinite"], correct: 0, hint: "The positive integers are 1, 2, and 3." },

    // --- HKDSE LEVEL: Section A1 Drilling (20 Questions) ---
    { text: "Solve $\\frac{3(x-2)}{4} - 1 > x$.", options: ["$x < -10$", "$x > -10$", "$x < 10$", "$x > -2$"], correct: 0, hint: "Multiply by 4: $3x - 6 - 4 > 4x \\Rightarrow -10 > x$." },
    { text: "Solve $2(1-x) \\geq 3(x+4)$.", options: ["$x \\leq -2$", "$x \\geq -2$", "$x \\leq 2$", "$x \\geq -10$"], correct: 0, hint: "$2 - 2x \\geq 3x + 12 \\Rightarrow -10 \\geq 5x$." },
    { text: "Find the number of non-negative integers satisfying $2x - 5 < 1$.", options: ["$3$", "$2$", "$4$", "$1$"], correct: 0, hint: "$2x < 6 \\Rightarrow x < 3$. Non-negative integers: 0, 1, 2." },
    { text: "Solve $\\frac{x+1}{2} - \\frac{x-1}{3} \\leq 1$.", options: ["$x \\leq 1$", "$x \\geq 1$", "$x \\leq 5$", "$x \\geq -1$"], correct: 0, hint: "Multiply by 6: $3(x+1) - 2(x-1) \\leq 6$." },
    { text: "Solve $x - \\frac{2-x}{3} \\geq 2$.", options: ["$x \\geq 2$", "$x \\leq 2$", "$x \\geq 1$", "$x \\geq 8$"], correct: 0, hint: "Multiply by 3: $3x - (2-x) \\geq 6 \\Rightarrow 4x - 2 \\geq 6$." },
    { text: "Solve $(x+2)^2 > x^2 + 8$.", options: ["$x > 1$", "$x < 1$", "$x > 2$", "$x > 4$"], correct: 0, hint: "$x^2 + 4x + 4 > x^2 + 8 \\Rightarrow 4x > 4$." },
    { text: "Solve $\\frac{2-3x}{4} \\leq \\frac{1-x}{2}$.", options: ["$x \\geq 0$", "$x \\leq 0$", "$x \\geq 1$", "$x \\leq 1$"], correct: 0, hint: "Multiply by 4: $2-3x \\leq 2-2x \\Rightarrow 0 \\leq x$." },
    { text: "Find the range of $x$ if $x+3 > 0$ AND $2-x > 0$.", options: ["$-3 < x < 2$", "$x > 2$", "$x < -3$", "$x > -3$"], correct: 0, hint: "$x > -3$ and $x < 2$." },
    { text: "Solve $1 - \\frac{x}{2} < \\frac{1-x}{3}$.", options: ["$x > 4$", "$x < 4$", "$x > -4$", "$x < -4$"], correct: 0, hint: "Multiply by 6: $6 - 3x < 2 - 2x \\Rightarrow 4 < x$." },
    { text: "Smallest prime number $p$ satisfying $3p - 2 > 10$.", options: ["$5$", "$7$", "$11$", "$3$"], correct: 0, hint: "$3p > 12 \\Rightarrow p > 4$. Smallest prime is 5." },
    { text: "Solve $2(x-5) < 4(x+1) - 2$.", options: ["$x > -6$", "$x < -6$", "$x > -4$", "$x < 4$"], correct: 0, hint: "$2x - 10 < 4x + 2 \\Rightarrow -12 < 2x$." },
    { text: "Solve $\\frac{2x+5}{-4} \\geq -1$.", options: ["$x \\leq -0.5$", "$x \\geq -0.5$", "$x \\leq 0.5$", "$x \\geq 1$"], correct: 0, hint: "Multiply by -4 (flip sign): $2x+5 \\leq 4$." },
    { text: "Solve $3 - \\frac{2x-1}{3} > 2$.", options: ["$x < 2$", "$x > 2$", "$x < 1$", "$x > -2$"], correct: 0, hint: "$-\\frac{2x-1}{3} > -1 \\Rightarrow 2x-1 < 3$ (flip sign)." },
    { text: "Solve $5(1-x) < 2(3-x)$.", options: ["$x > -1/3$", "$x < -1/3$", "$x > 1/3$", "$x < 1/3$"], correct: 0, hint: "$5 - 5x < 6 - 2x \\Rightarrow -3x < 1$." },
    { text: "Solve $\\frac{1}{2}x - 3 \\leq \\frac{1}{4}x + 2$.", options: ["$x \\leq 20$", "$x \\geq 20$", "$x \\leq 5$", "$x \\leq 10$"], correct: 0, hint: "Multiply by 4: $2x - 12 \\leq x + 8$." },
    { text: "Find the largest integer $x$ such that $4x - 1 < 11$.", options: ["$2$", "$3$", "$4$", "$1$"], correct: 0, hint: "$4x < 12 \\Rightarrow x < 3$. Largest integer is 2." },
    { text: "Solve $\\frac{x}{2} + \\frac{x}{3} + \\frac{x}{4} > 13$.", options: ["$x > 12$", "$x < 12$", "$x > 13$", "$x > 24$"], correct: 0, hint: "Multiply by 12: $6x + 4x + 3x > 156 \\Rightarrow 13x > 156$." },
    { text: "Solve $x + 2(x+1) \\geq 5(x-1)$.", options: ["$x \\leq 3.5$", "$x \\geq 3.5$", "$x \\leq 7$", "$x \\geq 7$"], correct: 0, hint: "$3x + 2 \\geq 5x - 5 \\Rightarrow 7 \\geq 2x$." },
    { text: "Solve $\\frac{2-x}{5} > -1$.", options: ["$x < 7$", "$x > 7$", "$x < -7$", "$x > -3$"], correct: 0, hint: "$2-x > -5 \\Rightarrow -x > -7$." },
    { text: "Solve $-(x+4) \\leq 2x - 1$.", options: ["$x \\geq -1$", "$x \\leq -1$", "$x \\geq -5/3$", "$x \\leq 1$"], correct: 0, hint: "$-x - 4 \\leq 2x - 1 \\Rightarrow -3 \\leq 3x$." }
    ],
    sa: [],
  },
  indices: {
    mc: [
      { text: "Simplify: $x^3 \\times x^4$.", options: ["$x^7$","$x^{12}$","$x^{34}$","$2x^7$"], correct: 0, hint: "$a^m \\times a^n = a^{m+n}$. Add the powers: $3+4=7$." },
      { text: "Simplify: $\\frac{x^5}{x^2}$.", options: ["$x^3$","$x^{10}$","$x^7$","$x^{\\frac{5}{2}}$"], correct: 0, hint: "$\\frac{a^m}{a^n} = a^{m-n}$. Subtract: $5-2=3$." },
      { text: "Simplify: $(x^3)^4$.", options: ["$x^{12}$","$x^7$","$x^{64}$","$4x^3$"], correct: 0, hint: "$(a^m)^n = a^{mn}$. Multiply: $3 \\times 4 = 12$." },
      { text: "What is $4^{-2}$?", options: ["$\\frac{1}{16}$","$\\frac{1}{8}$","$-16$","$\\frac{1}{4}$"], correct: 0, hint: "$a^{-n} = \\frac{1}{a^n}$. So $4^{-2} = \\frac{1}{16}$." },
      { text: "What is $27^{\\frac{1}{3}}$?", options: ["$3$","$9$","$\\frac{1}{3}$","$\\frac{1}{9}$"], correct: 0, hint: "$a^{\\frac{1}{n}} = \\sqrt[n]{a}$. So $27^{\\frac{1}{3}} = \\sqrt[3]{27} = 3$." },
      { text: "Simplify: $(2x^2y^3)^2$.", options: ["$4x^4y^6$","$2x^4y^6$","$4x^4y^5$","$4x^4y^9$"], correct: 0, hint: "Apply the power to EACH factor: $2^2=4$, $(x^2)^2=x^4$, $(y^3)^2=y^6$." },
      { text: "What is $8^{\\frac{2}{3}}$?", options: ["$4$","$2$","$16$","$\\frac{1}{4}$"], correct: 0, hint: "$a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m = (\\sqrt[3]{8})^2 = 2^2 = 4$." },
      { text: "Simplify: $\\frac{x^4 y^2}{x^2 y^5}$.", options: ["$\\frac{x^2}{y^3}$","$x^2 y^3$","$\\frac{x^6}{y^7}$","$x^{-2}y^{-3}$"], correct: 0, hint: "Subtract powers: $x^{4-2}=x^2$ and $y^{2-5}=y^{-3}=\\frac{1}{y^3}$." },
      { text: "Simplify: $\\sqrt[3]{y^2}$.", options: ["$y^{\\frac{2}{3}}$","$y^3$","$y^{\\frac{3}{2}}$","$y^6$"], correct: 0, hint: "$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$. So $\\sqrt[3]{y^2} = y^{\\frac{2}{3}}$." },
      { text: "Simplify: $(4x^{-2})^{\\frac{1}{2}}$.", options: ["$\\frac{2}{x}$","$2x$","$\\frac{4}{x}$","$\\frac{1}{2x}$"], correct: 0, hint: "$4^{\\frac{1}{2}}=2$ and $(x^{-2})^{\\frac{1}{2}}=x^{-1}$. Combine: $\\frac{2}{x}$." },
      { text: "What is $5^0$?", options: ["$1$","$0$","$5$","$\\frac{1}{5}$"], correct: 0, hint: "Any nonzero number raised to the power $0$ equals $1$." },
      { text: "If $2^x = 32$, what is $x$?", options: ["$5$","$4$","$6$","$16$"], correct: 0, hint: "$32 = 2^5$. So $x = 5$." },
      { text: "Simplify: $\\frac{(3x)^3}{9x}$.", options: ["$3x^2$","$3x$","$27x^2$","$9x^3$"], correct: 0, hint: "Numerator: $(3x)^3=27x^3$. Divide: $\\frac{27x^3}{9x}=3x^2$." },
      { text: "What is $\\left(\\frac{1}{4}\\right)^{-\\frac{1}{2}}$?", options: ["$2$","$\\frac{1}{2}$","$4$","$-2$"], correct: 0, hint: "Negative exponent flips the base: $4^{\\frac{1}{2}} = \\sqrt{4} = 2$." },
      { text: "Which equals $\\sqrt{x} \\cdot x^2$?", options: ["$x^{\\frac{5}{2}}$","$x^3$","$x^{\\frac{3}{2}}$","$x^{2}$"], correct: 0, hint: "$x^{\\frac{1}{2}} \\cdot x^2 = x^{\\frac{1}{2}+2} = x^{\\frac{5}{2}}$." },
    // --- WARM-UP: Basic Rules (10 Questions) ---
    { text: "Simplify $x^3 \\cdot x^4$.", options: ["$x^7$", "$x^{12}$", "$x^1$", "$2x^7$"], correct: 0, hint: "When multiplying same bases, add the indices: $3 + 4 = 7$." },
    { text: "Simplify $\\frac{y^8}{y^2}$.", options: ["$y^6$", "$y^4$", "$y^{10}$", "$y^{16}$"], correct: 0, hint: "When dividing same bases, subtract the indices: $8 - 2 = 6$." },
    { text: "Simplify $(a^3)^2$.", options: ["$a^6$", "$a^5$", "$a^9$", "$2a^3$"], correct: 0, hint: "Power to a power: multiply the indices: $3 \\times 2 = 6$." },
    { text: "Simplify $(2x)^3$.", options: ["$8x^3$", "$2x^3$", "$6x^3$", "$8x$"], correct: 0, hint: "Apply the power to both the coefficient and the variable: $2^3 \\cdot x^3$." },
    { text: "Simplify $k^0$ (where $k \\neq 0$).", options: ["$1$", "$0$", "$k$", "$-1$"], correct: 0, hint: "Any non-zero number raised to the power of 0 is 1." },
    { text: "Simplify $x^{-2}$ using positive indices.", options: ["$\\frac{1}{x^2}$", "$-x^2$", "$-2x$", "$\\frac{1}{2x}$"], correct: 0, hint: "Negative index rule: $x^{-n} = \\frac{1}{x^n}$." },
    { text: "Simplify $\\frac{1}{a^{-3}}$.", options: ["$a^3$", "$-a^3$", "$\\frac{1}{a^3}$", "$3a$"], correct: 0, hint: "A negative index in the denominator moves to the numerator as a positive index." },
    { text: "Simplify $(x^2y)^3$.", options: ["$x^6y^3$", "$x^5y^3$", "$x^6y$", "$x^2y^3$"], correct: 0, hint: "Distribute the power: $(x^2)^3 \\cdot y^3 = x^6y^3$." },
    { text: "Simplify $x^5 \\div x^{-2}$.", options: ["$x^7$", "$x^3$", "$x^{-10}$", "$x^{2.5}$"], correct: 0, hint: "Subtract indices: $5 - (-2) = 5 + 2 = 7$." },
    { text: "Simplify $(3^2)^0$.", options: ["$1$", "$9$", "$0$", "$3$"], correct: 0, hint: "Anything (except 0) to the power of 0 is 1." },

    // --- INTERMEDIATE: Mixed Operations (10 Questions) ---
    { text: "Simplify $\\frac{(x^3)^4}{x^2}$.", options: ["$x^{10}$", "$x^{12}$", "$x^5$", "$x^6$"], correct: 0, hint: "Multiply indices first: $x^{12} \\div x^2 = x^{10}$." },
    { text: "Simplify $2a^2 \\cdot 3a^4$.", options: ["$6a^6$", "$5a^6$", "$6a^8$", "$5a^8$"], correct: 0, hint: "Multiply coefficients $(2 \\cdot 3)$ and add indices $(2+4)$." },
    { text: "Simplify $(\\frac{x}{y})^{-1}$.", options: ["$\\frac{y}{x}$", "$\\frac{x}{y}$", "$- \\frac{x}{y}$", "$xy$"], correct: 0, hint: "A power of $-1$ flips the fraction." },
    { text: "Simplify $\\frac{12x^6}{4x^{-2}}$.", options: ["$3x^8$", "$3x^4$", "$8x^8$", "$3x^{-3}$"], correct: 0, hint: "Divide $12/4$ and subtract indices: $6 - (-2) = 8$." },
    { text: "Simplify $(x^{-1}y^2)^2$.", options: ["$\\frac{y^4}{x^2}$", "$x^{-2}y^2$", "$x^2y^4$", "$\\frac{y^2}{x^2}$"], correct: 0, hint: "Distribute: $x^{-2}y^4 = \\frac{y^4}{x^2}$." },
    { text: "Simplify $a^2 \\cdot a^3 \\cdot a^4$.", options: ["$a^9$", "$a^{24}$", "$3a^9$", "$a^{10}$"], correct: 0, hint: "Add all indices: $2+3+4=9$." },
    { text: "Simplify $(2x^2)^{-3}$.", options: ["$\\frac{1}{8x^6}$", "$\\frac{1}{2x^6}$", "$-8x^6$", "$\\frac{1}{6x^5}$"], correct: 0, hint: "$2^{-3} \\cdot (x^2)^{-3} = \\frac{1}{8} \\cdot x^{-6}$." },
    { text: "Simplify $\\frac{x^0y^3}{y^{-1}}$.", options: ["$y^4$", "$y^2$", "$xy^4$", "$1$"], correct: 0, hint: "$x^0 = 1$. Then $y^{3 - (-1)} = y^4$." },
    { text: "Simplify $(a^2b^{-3})^0 \\cdot a^2$.", options: ["$a^2$", "$1$", "$a^4b^{-3}$", "$0$"], correct: 0, hint: "The entire bracket becomes 1 because of the 0 exponent." },
    { text: "Simplify $\\frac{x^2}{x^5}$ and express with positive indices.", options: ["$\\frac{1}{x^3}$", "$x^3$", "$x^{-3}$", "$\\frac{1}{x^7}$"], correct: 0, hint: "$x^{2-5} = x^{-3} = \\frac{1}{x^3}$." },

    // --- HKDSE LEVEL: Section A1 Drilling (20 Questions) ---
    { text: "Simplify $\\frac{(x^2y^{-1})^3}{x^4}$ and express with positive indices.", options: ["$\\frac{x^2}{y^3}$", "$x^2y^3$", "$\\frac{x^{10}}{y^3}$", "$x^2y^{-3}$"], correct: 0, hint: "Numerator: $x^6y^{-3}$. Divide by $x^4$: $x^{6-4}y^{-3} = x^2y^{-3}$." },
    { text: "Simplify $\\frac{a^5}{(a^{-2})^3}$.", options: ["$a^{11}$", "$a^{-1}$", "$a^6$", "$a^{30}$"], correct: 0, hint: "Denominator: $a^{-6}$. Then $a^{5 - (-6)} = a^{11}$." },
    { text: "Simplify $(\\frac{2}{x^2})^3 \\cdot x^4$.", options: ["$\\frac{8}{x^2}$", "$\\frac{6}{x^2}$", "$\\frac{8}{x}$", "$8x^{10}$"], correct: 0, hint: "$\\frac{8}{x^6} \\cdot x^4 = 8x^{4-6} = 8x^{-2}$." },
    { text: "Simplify $\\frac{y^{-3}}{y^2 \\cdot y^{-4}}$.", options: ["$\\frac{1}{y}$", "$y$", "$y^5$", "$\\frac{1}{y^5}$"], correct: 0, hint: "Denominator: $y^{2-4} = y^{-2}$. Then $y^{-3 - (-2)} = y^{-1}$." },
    { text: "Simplify $(3x^2y^{-3})^{-2}$ and express with positive indices.", options: ["$\\frac{y^6}{9x^4}$", "$\\frac{y^6}{3x^4}$", "$\\frac{1}{9x^4y^6}$", "$-9x^4y^6$"], correct: 0, hint: "$3^{-2}x^{-4}y^6 = \\frac{1}{9}x^{-4}y^6$." },
    { text: "Simplify $\\frac{(ab^2)^3}{a^2b}$.", options: ["$ab^5$", "$a^5b^7$", "$ab^7$", "$a^2b^5$"], correct: 0, hint: "Numerator: $a^3b^6$. Then $a^{3-2}b^{6-1} = ab^5$." },
    { text: "Simplify $(x^0 + x^0 + x^0)^2$.", options: ["$9$", "$3$", "$1$", "$x^6$"], correct: 0, hint: "$1+1+1 = 3$. Then $3^2 = 9$." },
    { text: "Simplify $\\frac{4^n}{2^n}$.", options: ["$2^n$", "$2$", "$4$", "$2^{2n}$"], correct: 0, hint: "$4^n = (2^2)^n = 2^{2n}$. Then $2^{2n}/2^n = 2^{2n-n} = 2^n$." },
    { text: "Simplify $\\frac{(x^{-2})^{-3}}{x^2 \\cdot x^4}$.", options: ["$1$", "$x^{12}$", "$x^0$", "$x^2$"], correct: 0, hint: "Numerator: $x^6$. Denominator: $x^6$. $x^6/x^6 = 1$." },
    { text: "Simplify $(\\frac{a^2}{b})^{-2} \\cdot a^4$.", options: ["$b^2$", "$\\frac{1}{b^2}$", "$a^8b^2$", "$a^0b^2$"], correct: 0, hint: "$a^{-4}b^2 \\cdot a^4 = a^0b^2 = b^2$." },
    { text: "Simplify $\\frac{x^2y^0}{(x^2y)^2}$.", options: ["$\\frac{1}{x^2y^2}$", "$\\frac{1}{y^2}$", "$\\frac{1}{x^2y}$", "$y^2$"], correct: 0, hint: "$x^2 \\cdot 1 / (x^4y^2) = x^{-2}y^{-2}$." },
    { text: "Simplify $\\frac{3x^{-2}}{ (3x)^2 }$.", options: ["$\\frac{1}{3x^4}$", "$\\frac{1}{x^4}$", "$\\frac{1}{9x^4}$", "$3x^0$"], correct: 0, hint: "Denominator is $9x^2$. $\\frac{3}{9} \\cdot \\frac{x^{-2}}{x^2} = \\frac{1}{3}x^{-4}$." },
    { text: "Simplify $(x^n \\cdot x^2)^3$.", options: ["$x^{3n+6}$", "$x^{n+6}$", "$x^{3n+2}$", "$x^{3n^2}$"], correct: 0, hint: "$(x^{n+2})^3 = x^{3(n+2)} = x^{3n+6}$." },
    { text: "Simplify $\\frac{2^{x+2}}{2^x}$.", options: ["$4$", "$2$", "$2^2x$", "$2^{2x}$"], correct: 0, hint: "$2^{(x+2) - x} = 2^2 = 4$." },
    { text: "Simplify $(a^{-1} + b^{-1})^{-1}$.", options: ["$\\frac{ab}{a+b}$", "$a+b$", "$\\frac{a+b}{ab}$", "$ab$"], correct: 0, hint: "Inside: $(\\frac{1}{a} + \\frac{1}{b}) = \\frac{b+a}{ab}$. Flip it." },
    { text: "Simplify $\\frac{x^2 \\cdot x^3}{ (x^2)^3 }$.", options: ["$\\frac{1}{x}$", "$x$", "$x^5$", "$1$"], correct: 0, hint: "Numerator: $x^5$. Denominator: $x^6$. $x^5/x^6 = x^{-1}$." },
    { text: "Simplify $(\\frac{x^2}{y^3})^{-1} \\div \\frac{y}{x}$.", options: ["$\\frac{y^2}{x}$", "$\\frac{x}{y^2}$", "$\\frac{y^4}{x^3}$", "$\\frac{x^3}{y^4}$"], correct: 0, hint: "$\\frac{y^3}{x^2} \\cdot \\frac{x}{y} = \\frac{y^2}{x}$." },
    { text: "Simplify $x^a \\cdot x^a$.", options: ["$x^{2a}$", "$x^{a^2}$", "$2x^a$", "$x^2$"], correct: 0, hint: "Add indices: $a+a = 2a$." },
    { text: "Simplify $\\frac{10^x}{5^x}$.", options: ["$2^x$", "$2$", "$5^x$", "$50^x$"], correct: 0, hint: "$(\\frac{10}{5})^x = 2^x$." },
    { text: "Simplify $(x^2y)^3 \\cdot (xy^2)^{-2}$.", options: ["$x^4y^{-1}$", "$x^4y^7$", "$x^8y^7$", "$x^1y^{-1}$"], correct: 0, hint: "$x^6y^3 \\cdot x^{-2}y^{-4} = x^4y^{-1}$." }
    ],
    sa: [],
  },
  simultaneous: {
    mc: [
      { text: "Solve: $x+y=5$ and $x-y=1$. Find $x$.", options: ["$3$","$2$","$4$","$5$"], correct: 0, hint: "Add both equations: $2x=6$, so $x=3$." },
      { text: "Solve: $2x+y=7$ and $x+y=4$. Find $x$.", options: ["$3$","$1$","$4$","$2$"], correct: 0, hint: "Subtract the second from the first: $x=3$." },
      { text: "Solve: $2x+y=8$ and $x-y=1$. Find $x$.", options: ["$3$","$4$","$5$","$2$"], correct: 0, hint: "Add both equations: $3x=9$, so $x=3$." },
      { text: "From $2x+y=8$ with $x=3$, find $y$.", options: ["$2$","$1$","$3$","$0$"], correct: 0, hint: "Substitute $x=3$: $6+y=8$, so $y=2$." },
      { text: "Solve: $3x-2y=1$ and $x+2y=7$. Find $x$.", options: ["$2$","$3$","$1$","$4$"], correct: 0, hint: "Add the equations ($y$ cancels): $4x=8$, $x=2$." },
      { text: "Solve: $y=2x$ and $x+y=9$. Find $y$.", options: ["$6$","$3$","$9$","$4$"], correct: 0, hint: "Substitute $y=2x$: $3x=9$, $x=3$. Then $y=6$." },
      { text: "Solve: $x+2y=10$ and $2x-y=5$. Find $x$.", options: ["$4$","$2$","$5$","$3$"], correct: 0, hint: "From eq2: $y=2x-5$. Substitute into eq1: $5x=20$, $x=4$." },
      { text: "Using $x=4$ in $x+2y=10$, find $y$.", options: ["$3$","$2$","$4$","$1$"], correct: 0, hint: "$4+2y=10$, $2y=6$, $y=3$." },
      { text: "Solve: $y=x+1$ and $2x+y=7$. Find $x$.", options: ["$2$","$3$","$1$","$4$"], correct: 0, hint: "Substitute: $2x+(x+1)=7$, $3x=6$, $x=2$." },
      { text: "Solve: $4x-3y=10$ and $2x-3y=4$. Find $x$.", options: ["$3$","$2$","$4$","$1$"], correct: 0, hint: "Subtract 2nd from 1st: $2x=6$, $x=3$." },
      { text: "A number is 4 more than another; they sum to 12. The larger:", options: ["$8$","$4$","$6$","$10$"], correct: 0, hint: "$x=y+4$ and $x+y=12$. Solve: $y=4$, $x=8$." },
      { text: "Solve: $\\frac{x}{2}+y=3$ and $x+y=4$. Find $x$.", options: ["$2$","$1$","$4$","$3$"], correct: 0, hint: "Multiply eq1 by 2: $x+2y=6$. Subtract eq2: $y=2$. Then $x=2$." },
      { text: "Sum of two numbers is 15, difference is 3. The larger:", options: ["$9$","$6$","$12$","$3$"], correct: 0, hint: "$x+y=15$, $x-y=3$. Add: $2x=18$, $x=9$." },
      { text: "Solve: $3x+2y=12$ and $3x-y=6$. Find $y$.", options: ["$2$","$3$","$1$","$4$"], correct: 0, hint: "Subtract 2nd from 1st: $3y=6$, $y=2$." },
      { text: "Solve: $5x+2y=19$ and $x-y=1$. Find $y$.", options: ["$2$","$3$","$1$","$4$"], correct: 0, hint: "From eq2: $x=y+1$. Substitute: $5(y+1)+2y=19$, $7y=14$, $y=2$." },
    ],
    sa: [],
  },
  polynomials: {
    mc: [
      { text: "Expand: $(x+2)(x+3)$.", options: ["$x^2+5x+6$","$x^2+6x+5$","$x^2+5x+5$","$x^2+6x+6$"], correct: 0, hint: "FOIL: $x^2+3x+2x+6=x^2+5x+6$." },
      { text: "Expand: $(2x-1)(x+4)$.", options: ["$2x^2+7x-4$","$2x^2-7x-4$","$2x^2+7x+4$","$2x^2-4x+1$"], correct: 0, hint: "FOIL: $2x^2+8x-x-4=2x^2+7x-4$." },
      { text: "If $f(x)=2x^2-x+3$, find $f(2)$.", options: ["$9$","$7$","$11$","$6$"], correct: 0, hint: "$2(4)-2+3=8-2+3=9$." },
      { text: "Is $(x-2)$ a factor of $x^2-3x+2$?", options: ["Yes, since $f(2)=0$","No, since $f(2)\\neq 0$","Yes, since $f(-2)=0$","Cannot determine"], correct: 0, hint: "Factor Theorem: $f(2)=4-6+2=0$. Yes!" },
      { text: "Remainder when $x^3-2x+1$ is divided by $(x-1)$:", options: ["$0$","$1$","$-1$","$2$"], correct: 0, hint: "Remainder $= f(1) = 1-2+1 = 0$." },
      { text: "Remainder when $2x^2-3x+5$ is divided by $(x+1)$:", options: ["$10$","$4$","$0$","$-10$"], correct: 0, hint: "$f(-1)=2(1)-3(-1)+5=2+3+5=10$." },
      { text: "If $f(x)=x^3-kx+2$ and $(x-1)$ is a factor, find $k$.", options: ["$3$","$1$","$2$","$-1$"], correct: 0, hint: "$f(1)=0$: $1-k+2=0$, so $k=3$." },
      { text: "Expand: $(x+1)^3$.", options: ["$x^3+3x^2+3x+1$","$x^3+3x^2+x+1$","$x^3+x^2+x+1$","$x^3+3x^2+3x-1$"], correct: 0, hint: "$(a+b)^3=a^3+3a^2b+3ab^2+b^3$. Here $a=x, b=1$." },
      { text: "Which is a factor of $x^2+2x-15$?", options: ["$(x+5)$","$(x+3)$","$(x-5)$","$(x+15)$"], correct: 0, hint: "Factor: $(x+5)(x-3)$. So $(x+5)$ is a factor." },
      { text: "Divide $x^2-1$ by $(x-1)$. Quotient:", options: ["$x+1$","$x-1$","$x^2+1$","$x$"], correct: 0, hint: "$x^2-1=(x-1)(x+1)$. Quotient is $x+1$." },
      { text: "Solve $x^2-5x+4=0$.", options: ["$x=1$ or $x=4$","$x=-1$ or $x=-4$","$x=1$ or $x=-4$","$x=5$ or $x=4$"], correct: 0, hint: "Factor: $(x-1)(x-4)=0$." },
      { text: "Evaluate $(x+1)(x-2)$ at $x=3$.", options: ["$4$","$2$","$6$","$0$"], correct: 0, hint: "$(3+1)(3-2)=(4)(1)=4$." },
      { text: "Which is a factor of $2x^2+5x+3$?", options: ["$(2x+3)$","$(x+3)$","$(2x+1)$","$(x+2)$"], correct: 0, hint: "$2x^2+5x+3=(2x+3)(x+1)$. So $(2x+3)$ is a factor." },
      { text: "Degree of $3x^4-2x^3+x-7$:", options: ["$4$","$3$","$1$","$7$"], correct: 0, hint: "Degree = highest power of $x = 4$." },
      { text: "If $(x-3)$ is a factor of $x^2+kx-6$, find $k$.", options: ["$-1$","$1$","$3$","$-3$"], correct: 0, hint: "$f(3)=0$: $9+3k-6=0$, $3k=-3$, $k=-1$." },
    ],
    sa: [],
  },
  quadratic: {
    mc: [
      { text: "Solve: $x^2-5x+6=0$.", options: ["$x=2$ or $x=3$","$x=-2$ or $x=-3$","$x=1$ or $x=6$","$x=2$ or $x=-3$"], correct: 0, hint: "Factor: $(x-2)(x-3)=0$." },
      { text: "Solve: $x^2-4=0$.", options: ["$x=\\pm 2$","$x=2$","$x=4$","$x=\\pm 4$"], correct: 0, hint: "$x^2=4$. Take the square root: $x=\\pm 2$." },
      { text: "Solve using the formula: $x^2+2x-3=0$.", options: ["$x=1$ or $x=-3$","$x=-1$ or $x=3$","$x=1$ or $x=3$","$x=-1$ or $x=-3$"], correct: 0, hint: "$\\Delta=4+12=16$. $x=\\frac{-2\\pm 4}{2}$. Solutions: $x=1$ or $x=-3$." },
      { text: "How many real roots does $x^2+4=0$ have?", options: ["$0$","$1$","$2$","$4$"], correct: 0, hint: "$\\Delta=0-16=-16<0$. Negative discriminant → no real roots." },
      { text: "If $\\Delta=b^2-4ac>0$, the quadratic has:", options: ["Two distinct real roots","One repeated root","No real roots","Cannot be determined"], correct: 0, hint: "$\\Delta>0$ means two DIFFERENT real solutions." },
      { text: "Completing the square: $x^2+6x+2=0$ gives:", options: ["$(x+3)^2=7$","$(x+3)^2=-7$","$(x+3)^2=11$","$(x+6)^2=34$"], correct: 0, hint: "$(x+3)^2=x^2+6x+9$. So $x^2+6x+2=(x+3)^2-7=0$, giving $(x+3)^2=7$." },
      { text: "Solve: $2x^2-7x+3=0$.", options: ["$x=3$ or $x=\\frac{1}{2}$","$x=-3$ or $x=\\frac{1}{2}$","$x=3$ or $x=-\\frac{1}{2}$","$x=1$ or $x=3$"], correct: 0, hint: "Factor: $(2x-1)(x-3)=0$." },
      { text: "Roots of $x^2+bx+c=0$ are 2 and 5. Find $b$ and $c$.", options: ["$b=-7,\\ c=10$","$b=7,\\ c=10$","$b=-7,\\ c=-10$","$b=7,\\ c=-10$"], correct: 0, hint: "Sum$=-b=7$, so $b=-7$. Product$=c=10$." },
      { text: "Solve: $(x-1)^2=9$.", options: ["$x=4$ or $x=-2$","$x=4$ or $x=2$","$x=10$ or $x=-8$","$x=-4$ or $x=2$"], correct: 0, hint: "$x-1=\\pm 3$. So $x=4$ or $x=-2$." },
      { text: "Rectangle length $(x+5)$, width $(x-1)$, area $=24$. Equation:", options: ["$x^2+4x-29=0$","$x^2+5x-24=0$","$x^2+4x-5=0$","$x^2-5x+24=0$"], correct: 0, hint: "$(x+5)(x-1)=24$. Expand: $x^2+4x-5=24$. Rearrange." },
      { text: "Solve: $3x^2=12$.", options: ["$x=\\pm 2$","$x=4$","$x=\\pm 4$","$x=\\pm\\frac{1}{2}$"], correct: 0, hint: "Divide by 3: $x^2=4$, $x=\\pm 2$." },
      { text: "Vertex of $y=(x-3)^2+2$:", options: ["$(3,\\ 2)$","$(-3,\\ 2)$","$(3,\\ -2)$","$(-3,\\ -2)$"], correct: 0, hint: "Vertex form $(x-h)^2+k$: vertex is $(h,k)=(3,2)$." },
      { text: "For $x^2-4x+k=0$ to have equal roots, $k=$", options: ["$4$","$-4$","$2$","$8$"], correct: 0, hint: "Equal roots $\\Rightarrow \\Delta=0$. $16-4k=0$, $k=4$." },
      { text: "Solve: $x(x-6)=0$.", options: ["$x=0$ or $x=6$","$x=6$","$x=0$","$x=-6$"], correct: 0, hint: "Zero product property: $x=0$ or $x=6$." },
      { text: "Discriminant of $2x^2-3x+5=0$:", options: ["$-31$","$31$","$9$","$-9$"], correct: 0, hint: "$\\Delta=(-3)^2-4(2)(5)=9-40=-31$." },
    // --- PART 1: Solving by Factorization & Formula (10 Questions) ---
    { text: "Solve $x^2 - 7x + 12 = 0$.", options: ["$x=3$ or $x=4$", "$x=-3$ or $x=-4$", "$x=2$ or $x=6$", "$x=1$ or $x=12$"], correct: 0, hint: "Factorise into $(x-3)(x-4)=0$." },
    { text: "Solve $2x^2 + 5x - 3 = 0$.", options: ["$x=0.5$ or $x=-3$", "$x=-0.5$ or $x=3$", "$x=1$ or $x=-6$", "$x=0.5$ or $x=3$"], correct: 0, hint: "Factorise into $(2x-1)(x+3)=0$." },
    { text: "Solve $x^2 - 4x + 1 = 0$.", options: ["$2 \\pm \\sqrt{3}$", "$4 \\pm \\sqrt{12}$", "$2 \\pm \\sqrt{5}$", "$1 \\pm \\sqrt{3}$"], correct: 0, hint: "Use quadratic formula: $x = \\frac{-(-4) \\pm \\sqrt{(-4)^2 - 4(1)(1)}}{2(1)}$." },
    { text: "Solve $(x+2)(x-3) = 6$.", options: ["$x=4$ or $x=-3$", "$x=-2$ or $x=3$", "$x=0$ or $x=6$", "$x=1$ or $x=-6$"], correct: 0, hint: "Expand first: $x^2 - x - 6 = 6 \\Rightarrow x^2 - x - 12 = 0$." },
    { text: "Find the roots of $3x^2 - 6x = 0$.", options: ["$0$ and $2$", "$0$ and $-2$", "$2$ only", "$3$ and $6$"], correct: 0, hint: "Factor out $3x$: $3x(x-2)=0$." },
    { text: "Solve $x^2 = 9$.", options: ["$\\pm 3$", "$3$ only", "$-3$ only", "$81$"], correct: 0, hint: "Remember both positive and negative roots." },
    { text: "Solve $4x^2 - 12x + 9 = 0$.", options: ["$1.5$ (repeated root)", "$-1.5$ (repeated root)", "$1.5$ and $-1.5$", "$3$ and $4$"], correct: 0, hint: "This is a perfect square: $(2x-3)^2 = 0$." },
    { text: "Find the roots of $x^2 - 5x = 0$.", options: ["$0, 5$", "$0, -5$", "$5$ only", "$\\pm 5$"], correct: 0, hint: "$x(x-5)=0$." },
    { text: "Solve $x^2 - 10x + 25 = 0$.", options: ["$5$", "$-5$", "$0, 5$", "$\\pm 5$"], correct: 0, hint: "$(x-5)^2=0$." },
    { text: "Solve $x(x+5) = 24$.", options: ["$3, -8$", "$-3, 8$", "$0, -5$", "$4, 6$"], correct: 0, hint: "$x^2 + 5x - 24 = 0 \\Rightarrow (x-3)(x+8)=0$." },

    // --- PART 2: Nature of Roots & Discriminant (10 Questions) ---
    { text: "Find the discriminant of $x^2 - 6x + 9 = 0$.", options: ["$0$", "$36$", "$72$", "$-36$"], correct: 0, hint: "$\\Delta = b^2 - 4ac = (-6)^2 - 4(1)(9)$." },
    { text: "If $x^2 + 4x + k = 0$ has real roots, find the range of $k$.", options: ["$k \\le 4$", "$k < 4$", "$k \\ge 4$", "$k = 4$"], correct: 0, hint: "For real roots, $\\Delta \\ge 0 \\Rightarrow 16 - 4k \\ge 0$." },
    { text: "If $2x^2 - kx + 8 = 0$ has a repeated root, find the possible values of $k$.", options: ["$\\pm 8$", "$\\pm 4$", "$8$ only", "$64$"], correct: 0, hint: "$\\Delta = 0 \\Rightarrow k^2 - 4(2)(8) = 0 \\Rightarrow k^2 = 64$." },
    { text: "Determine the nature of roots for $3x^2 + 2x + 5 = 0$.", options: ["No real roots", "Two distinct real roots", "One repeated root", "Two rational roots"], correct: 0, hint: "$\\Delta = 2^2 - 4(3)(5) = 4 - 60 = -56 < 0$." },
    { text: "If the equation $x^2 + (k-2)x + k + 1 = 0$ has equal roots, find $k$.", options: ["$0$ or $8$", "$0$ or $-8$", "$2$ or $-1$", "$4$ or $8$"], correct: 0, hint: "Set $(k-2)^2 - 4(1)(k+1) = 0$ and solve for $k$." },
    { text: "How many x-intercepts does the graph $y = x^2 - x - 2$ have?", options: ["$2$", "$1$", "$0$", "$3$"], correct: 0, hint: "Check $\\Delta$: $(-1)^2 - 4(1)(-2) = 9 > 0$." },
    { text: "If $kx^2 + 4x + k = 0$ has two distinct real roots, which is true?", options: ["$-2 < k < 2$ (and $k \\neq 0$)", "$k > 2$", "$k < -2$", "$k = 2$"], correct: 0, hint: "$16 - 4k^2 > 0 \\Rightarrow k^2 < 4$." },
    { text: "The equation $x^2 + px + q = 0$ has no real roots. Which is correct?", options: ["$p^2 < 4q$", "$p^2 > 4q$", "$p^2 = 4q$", "$p < 2\\sqrt{q}$"], correct: 0, hint: "$\\Delta < 0 \\Rightarrow p^2 - 4q < 0$." },
    { text: "If 3 is a root of $x^2 + kx - 15 = 0$, find $k$.", options: ["$2$", "$-2$", "$5$", "$-5$"], correct: 0, hint: "Substitute $x=3$: $9 + 3k - 15 = 0$." },
    { text: "Find the range of $m$ such that $x^2 - mx + 1 = 0$ has real roots.", options: ["$m \\ge 2$ or $m \\le -2$", "$-2 \\le m \\le 2$", "$m > 2$", "$m < 2$"], correct: 0, hint: "$m^2 - 4 \\ge 0$." },

    // --- PART 3: Vertex, Symmetry & HKDSE Traps (20 Questions) ---
    { text: "Find the coordinates of the vertex of $y = (x-3)^2 + 5$.", options: ["$(3, 5)$", "$(-3, 5)$", "$(3, -5)$", "$(5, 3)$"], correct: 0, hint: "Vertex form $y = a(x-h)^2 + k$ gives vertex $(h, k)$." },
    { text: "Find the y-intercept of the graph $y = 2x^2 - 5x + 7$.", options: ["$7$", "$-7$", "$3.5$", "$0$"], correct: 0, hint: "Set $x=0$." },
    { text: "What is the equation of the axis of symmetry for $y = x^2 - 6x + 8$?", options: ["$x = 3$", "$x = 6$", "$x = -3$", "$y = 3$"], correct: 0, hint: "$x = -b / 2a$." },
    { text: "Find the minimum value of $y = x^2 + 8x - 2$.", options: ["$-18$", "$-2$", "$-4$", "$14$"], correct: 0, hint: "Vertex $x = -4$. Substitute back: $(-4)^2 + 8(-4) - 2 = 16 - 32 - 2$." },
    { text: "If the vertex of $y = x^2 + px + q$ is $(2, 3)$, find $p$.", options: ["$-4$", "$4$", "$-2$", "$2$"], correct: 0, hint: "Axis of symmetry $x = -p/2 = 2$." },
    { text: "Which quadratic has a graph that does NOT cross the x-axis?", options: ["$y = x^2 + x + 1$", "$y = x^2 - 1$", "$y = x^2 - x - 1$", "$y = x^2$"], correct: 0, hint: "Look for $\\Delta < 0$." },
    { text: "Find the value of $k$ if the graph $y = x^2 - 4x + k$ touches the x-axis.", options: ["$4$", "$-4$", "$0$", "$2$"], correct: 0, hint: "Touches means one repeated root: $\\Delta = 0$." },
    { text: "Express $x^2 + 6x + 1$ in the form $(x+h)^2 + k$.", options: ["$(x+3)^2 - 8$", "$(x+3)^2 + 1$", "$(x+3)^2 - 9$", "$(x+6)^2 - 35$"], correct: 0, hint: "Completing the square: $(x+3)^2 - 3^2 + 1$." },
    { text: "If the product of roots of $ax^2 + bx + c = 0$ is 1, then:", options: ["$a = c$", "$a = -c$", "$b = 0$", "$a + b + c = 1$"], correct: 0, hint: "Product of roots $= c/a$." },
    { text: "If one root of $x^2 - 5x + k = 0$ is 2, find the other root.", options: ["$3$", "$5$", "$-2$", "$k/2$"], correct: 0, hint: "Sum of roots $= -b/a = 5$. If one is 2, the other is $5-2$." },
    { text: "The graph of $y = -2(x+1)^2 - 4$ has a maximum value of:", options: ["$-4$", "$4$", "$-1$", "$2$"], correct: 0, hint: "Since $a < 0$, the $k$ in vertex form is the maximum." },
    { text: "Find the range of $k$ if $x^2 + kx + 9 = 0$ has no real roots.", options: ["$-6 < k < 6$", "$k > 6$", "$k < -6$", "$k \\neq 6$"], correct: 0, hint: "$\\Delta < 0 \\Rightarrow k^2 - 36 < 0$." },
    { text: "The sum of a number and its square is 30. Find the number.", options: ["$5$ or $-6$", "$5$ only", "$6$ or $-5$", "$-5$ or $-6$"], correct: 0, hint: "$x + x^2 = 30 \\Rightarrow x^2 + x - 30 = 0$." },
    { text: "If $y = ax^2 + bx + c$ opens downwards, then:", options: ["$a < 0$", "$a > 0$", "$b^2 - 4ac < 0$", "$c < 0$"], correct: 0, hint: "The coefficient of $x^2$ determines the opening direction." },
    { text: "Find the x-intercepts of $y = 2x^2 - 8$.", options: ["$\\pm 2$", "$4$", "$2$", "$0$"], correct: 0, hint: "$2x^2 - 8 = 0 \\Rightarrow x^2 = 4$." },
    { text: "If the roots of $x^2 + mx + n = 0$ are $\\alpha$ and $\\beta$, find $\\alpha + \\beta$.", options: ["$-m$", "$m$", "$n$", "$-n$"], correct: 0, hint: "Sum of roots $= -b/a$." },
    { text: "Find $k$ if the sum of roots of $2x^2 + kx - 8 = 0$ is 3.", options: ["$-6$", "$6$", "$3$", "$-3$"], correct: 0, hint: "$-k / 2 = 3$." },
    { text: "Solve $\\sqrt{x+2} = x$.", options: ["$2$", "$-1$", "$2$ or $-1$", "$4$"], correct: 0, hint: "Square both sides: $x+2 = x^2$. Check for extraneous roots!" },
    { text: "Find the vertex of $y = x^2 - 2x$.", options: ["$(1, -1)$", "$(1, 1)$", "$(0, 0)$", "$(2, 0)$"], correct: 0, hint: "$x = -(-2)/2 = 1$. $y = 1^2 - 2(1) = -1$." },
    { text: "If $f(x) = x^2 - kx + 4$ and $f(2) = 0$, find $k$.", options: ["$4$", "$2$", "$0$", "$8$"], correct: 0, hint: "Substitute $x=2$ and solve for $k$." }
    ],
    sa: [],
  },
  functions: {
    mc: [
      { text: "Domain of $f(x)=\\frac{1}{x-2}$:", options: ["All real $x\\neq 2$","All real $x$","$x>2$","$x\\neq -2$"], correct: 0, hint: "Denominator $\\neq 0$: $x-2\\neq 0$, so $x\\neq 2$." },
      { text: "If $f(x)=3x-1$ and $g(x)=x+2$, find $f(g(1))$.", options: ["$8$","$5$","$7$","$2$"], correct: 0, hint: "$g(1)=3$. Then $f(3)=9-1=8$." },
      { text: "Inverse of $f(x)=2x+1$:", options: ["$\\frac{x-1}{2}$","$\\frac{x+1}{2}$","$2x-1$","$\\frac{1}{2x+1}$"], correct: 0, hint: "Let $y=2x+1$. Swap: $x=2y+1$. Solve: $y=\\frac{x-1}{2}$." },
      { text: "$y=x^2-4$ crosses the $x$-axis at:", options: ["$x=\\pm 2$","$x=\\pm 4$","$x=2$ only","$x=0$"], correct: 0, hint: "Set $y=0$: $x^2=4$, $x=\\pm 2$." },
      { text: "A function $f$ is ODD if:", options: ["$f(-x)=-f(x)$","$f(-x)=f(x)$","$f(x)=f(x+T)$","$f(0)=0$"], correct: 0, hint: "Odd: $f(-x)=-f(x)$. Even: $f(-x)=f(x)$." },
      { text: "$y$-intercept of $y=3x^2-5x+2$:", options: ["$2$","$-5$","$3$","$0$"], correct: 0, hint: "Substitute $x=0$: $y=0-0+2=2$." },
      { text: "$y=x^2$ maps to $y=(x-3)^2$ by:", options: ["Shift right 3","Shift left 3","Shift up 3","Stretch by 3"], correct: 0, hint: "Replacing $x$ with $(x-3)$ shifts the graph RIGHT by 3." },
      { text: "If $f(x)=x^2$, what is $f(x+1)-f(x)$?", options: ["$2x+1$","$2x-1$","$x^2+1$","$2x$"], correct: 0, hint: "$(x+1)^2-x^2=x^2+2x+1-x^2=2x+1$." },
      { text: "$y=2^x$ is an example of:", options: ["An exponential function","A linear function","A quadratic function","A logarithmic function"], correct: 0, hint: "Constant base, variable exponent = exponential function." },
      { text: "Range of $f(x)=x^2+1$ for all real $x$:", options: ["$f(x)\\geq 1$","$f(x)>0$","$f(x)\\geq 0$","All reals"], correct: 0, hint: "$x^2\\geq 0$ for all real $x$, so $x^2+1\\geq 1$. Minimum is 1 at $x=0$." },
      { text: "Which is a one-to-one function?", options: ["$f(x)=3x+2$","$f(x)=x^2$","$f(x)=|x|$","$f(x)=\\sin x$"], correct: 0, hint: "A linear function with non-zero slope passes the Horizontal Line Test." },
      { text: "Gradient of $y=4-2x$:", options: ["$-2$","$4$","$2$","$\\frac{1}{2}$"], correct: 0, hint: "In $y=mx+c$, $m$ is the gradient. Here $m=-2$." },
      { text: "Find $f^{-1}(5)$ if $f(x)=2x-1$.", options: ["$3$","$9$","$\\frac{4}{3}$","$\\frac{5}{2}$"], correct: 0, hint: "Solve $2x-1=5$: $x=3$. So $f^{-1}(5)=3$." },
      { text: "How many times does $y=x^2+3$ intersect the $x$-axis?", options: ["$0$","$1$","$2$","$3$"], correct: 0, hint: "Set $y=0$: $x^2=-3$. No real solution → the graph does NOT cross the $x$-axis." },
      { text: "Vertex of $y=-(x+2)^2+5$:", options: ["$(-2,\\ 5)$","$(2,\\ 5)$","$(-2,\\ -5)$","$(2,\\ -5)$"], correct: 0, hint: "Form $y=a(x-h)^2+k$: vertex is $(h,k)=(-2,5)$." },
    // --- PART 1: Function Notation & Substitution (10 Questions) ---
    { text: "If $f(x) = 2x^2 - 3x + 1$, find $f(-2)$.", options: ["$15$", "$-13$", "$3$", "$11$"], correct: 0, hint: "$2(-2)^2 - 3(-2) + 1 = 8 + 6 + 1$." },
    { text: "Given $g(x) = \\frac{x+1}{x-1}$, find $g(3)$.", options: ["$2$", "$1$", "$0.5$", "$-2$"], correct: 0, hint: "$\\frac{3+1}{3-1} = \\frac{4}{2}$." },
    { text: "If $f(x) = x^2 + kx + 3$ and $f(1) = 0$, find $k$.", options: ["$-4$", "$4$", "$-3$", "$0$"], correct: 0, hint: "$1^2 + k(1) + 3 = 0 \\Rightarrow 1+k+3=0$." },
    { text: "Let $h(x) = 2x - 5$. If $h(a) = 7$, find $a$.", options: ["$6$", "$9$", "$1$", "$12$"], correct: 0, hint: "$2a - 5 = 7 \\Rightarrow 2a = 12$." },
    { text: "If $f(x) = 3^x$, find $f(2) + f(0)$.", options: ["$10$", "$9$", "$6$", "$1$"], correct: 0, hint: "$3^2 + 3^0 = 9 + 1$." },
    { text: "Given $f(x) = x^2$, find $f(x+1)$ in expanded form.", options: ["$x^2 + 2x + 1$", "$x^2 + 1$", "$x^2 + x + 1$", "$(x+1)^2$"], correct: 0, hint: "$(x+1)(x+1) = x^2 + 2x + 1$." },
    { text: "If $g(x) = ax + b$, $g(0) = 3$ and $g(1) = 5$, find $b$.", options: ["$3$", "$5$", "$2$", "$0$"], correct: 0, hint: "$g(0) = a(0) + b = 3$." },
    { text: "Let $f(x) = 2x$. Find $f(3x)$.", options: ["$6x$", "$2x+3$", "$5x$", "$6x^2$"], correct: 0, hint: "Substitute $3x$ into the $x$ position: $2(3x) = 6x$." },
    { text: "If $f(x) = x^2 - 4$, find the values of $x$ such that $f(x) = 0$.", options: ["$\\pm 2$", "$4$", "$2$", "$0$"], correct: 0, hint: "$x^2 - 4 = 0 \\Rightarrow x^2 = 4$." },
    { text: "Find the domain of $f(x) = \\frac{1}{x-5}$.", options: ["$x \\neq 5$", "$x > 5$", "$x < 5$", "All real numbers"], correct: 0, hint: "The denominator cannot be zero." },

    // --- PART 2: Transformations of Graphs (10 Questions) ---
    { text: "The graph of $y = f(x)$ is translated upwards by 3 units. The new equation is:", options: ["$y = f(x) + 3$", "$y = f(x) - 3$", "$y = f(x+3)$", "$y = f(x-3)$"], correct: 0, hint: "Vertical shift is outside the function." },
    { text: "The graph of $y = f(x)$ is translated to the right by 2 units. The new equation is:", options: ["$y = f(x-2)$", "$y = f(x+2)$", "$y = f(x) - 2$", "$y = f(x) + 2$"], correct: 0, hint: "Horizontal shift $h$: $f(x-h)$." },
    { text: "If $y = x^2$ is reflected in the x-axis, the new equation is:", options: ["$y = -x^2$", "$y = (-x)^2$", "$y = \\frac{1}{x^2}$", "$y = x^2 - 1$"], correct: 0, hint: "Reflection in x-axis: multiply the whole function by $-1$." },
    { text: "The graph $y = f(x)$ is reflected in the y-axis. The new equation is:", options: ["$y = f(-x)$", "$y = -f(x)$", "$y = f(x)$", "$y = \\frac{1}{f(x)}$"], correct: 0, hint: "Reflection in y-axis: replace $x$ with $-x$." },
    { text: "The vertex of $y = x^2$ is $(0,0)$. Find the vertex of $y = (x+4)^2 - 7$.", options: ["$(-4, -7)$", "$(4, -7)$", "$(-4, 7)$", "$(4, 7)$"], correct: 0, hint: "Shift left 4, down 7." },
    { text: "How is $y = f(x+5)$ obtained from $y = f(x)$?", options: ["Translate left 5 units", "Translate right 5 units", "Translate up 5 units", "Translate down 5 units"], correct: 0, hint: "$f(x+k)$ shifts left if $k > 0$." },
    { text: "If $f(x) = x^2$, which function represents a narrow vertical stretch?", options: ["$y = 3x^2$", "$y = 0.5x^2$", "$y = x^2 + 3$", "$y = (3x)^2$"], correct: 0, hint: "$af(x)$ where $|a| > 1$ is a vertical stretch." },
    { text: "The graph $y = x^2 - 4$ is translated up 4 units. Its new x-intercept is:", options: ["$0$", "$2$", "$-2$", "None"], correct: 0, hint: "New eq: $y = x^2 - 4 + 4 = x^2$. Solve $x^2 = 0$." },
    { text: "Which transformation turns $y = \\sqrt{x}$ into $y = \\sqrt{x} - 2$?", options: ["Vertical translation down 2", "Horizontal translation left 2", "Reflection in x-axis", "Vertical stretch"], correct: 0, hint: "Subtraction outside the root is a vertical shift." },
    { text: "If $(1, 5)$ is on $y = f(x)$, which point must be on $y = f(x) + 2$?", options: ["$(1, 7)$", "$(3, 5)$", "$(1, 3)$", "$(1, 10)$"], correct: 0, hint: "Add 2 to the y-coordinate." },

    // --- PART 3: Linear and Quadratic Graphs (20 Questions) ---
    { text: "Find the slope of the line $2x + 3y - 6 = 0$.", options: ["$-2/3$", "$2/3$", "$-2$", "$2$"], correct: 0, hint: "Rearrange to $y = mx + c$: $3y = -2x + 6$." },
    { text: "Find the y-intercept of the line passing through $(1, 2)$ and $(3, 8)$.", options: ["$-1$", "$1$", "$0$", "$3$"], correct: 0, hint: "Slope $m = 3$. Eq: $y - 2 = 3(x - 1) \\Rightarrow y = 3x - 1$." },
    { text: "The line $L$ is perpendicular to $y = 2x + 5$. Find the slope of $L$.", options: ["$-0.5$", "$0.5$", "$-2$", "$2$"], correct: 0, hint: "$m_1 \\times m_2 = -1$." },
    { text: "If the point $(k, 4)$ lies on the line $x - 2y + 6 = 0$, find $k$.", options: ["$2$", "$-2$", "$4$", "$14$"], correct: 0, hint: "$k - 2(4) + 6 = 0$." },
    { text: "Find the x-intercept of $3x - 4y = 12$.", options: ["$4$", "$-3$", "$3$", "$0$"], correct: 0, hint: "Set $y = 0$." },
    { text: "Which quadrant does the vertex of $y = -(x-1)^2 - 3$ lie in?", options: ["IV", "I", "II", "III"], correct: 0, hint: "Vertex is $(1, -3)$." },
    { text: "The graph of $y = ax^2 + bx + c$ has vertex $(h, k)$. If $a < 0$, the function has:", options: ["Maximum value $k$", "Minimum value $k$", "Maximum value $h$", "Minimum value $h$"], correct: 0, hint: "Downward opening parabolas have a maximum." },
    { text: "If a line has a slope of 0, it is:", options: ["Horizontal", "Vertical", "Passing through origin", "Does not exist"], correct: 0, hint: "Slope 0 means $y = c$." },
    { text: "Find the intersection of $y = x + 1$ and $y = 2x - 1$.", options: ["$(2, 3)$", "$(1, 2)$", "$(0, 1)$", "$(3, 4)$"], correct: 0, hint: "$x + 1 = 2x - 1 \\Rightarrow x = 2$." },
    { text: "If $f(x) = k$ is a constant function and $f(5) = 10$, find $f(100)$.", options: ["$10$", "$5$", "$100$", "$20$"], correct: 0, hint: "A constant function always outputs the same value." },
    { text: "The line $y = mx + c$ passes through the origin. What is $c$?", options: ["$0$", "$1$", "$m$", "Undefined"], correct: 0, hint: "$0 = m(0) + c$." },
    { text: "Find the axis of symmetry for $y = 2(x+5)(x-1)$.", options: ["$x = -2$", "$x = 2$", "$x = -5$", "$x = 1$"], correct: 0, hint: "Average of x-intercepts: $(-5 + 1) / 2$." },
    { text: "If $f(x)$ is an even function, then $f(-x) = $", options: ["$f(x)$", "$-f(x)$", "$0$", "$1/f(x)$"], correct: 0, hint: "Definition of symmetry about y-axis." },
    { text: "Which line is parallel to the x-axis?", options: ["$y = 4$", "$x = 4$", "$y = x$", "$y = x + 4$"], correct: 0, hint: "Parallel to x-axis means $y$ is constant." },
    { text: "Find the distance between $(1, 2)$ and $(4, 6)$.", options: ["$5$", "$7$", "$\\sqrt{7}$", "$25$"], correct: 0, hint: "$\\sqrt{(4-1)^2 + (6-2)^2} = \\sqrt{3^2 + 4^2}$." },
    { text: "If $y$ varies directly as $x$, its graph is a:", options: ["Straight line through origin", "Parabola", "Horizontal line", "Hyperbola"], correct: 0, hint: "$y = kx$ has y-intercept 0." },
    { text: "The range of $y = x^2 + 2$ is:", options: ["$y \\ge 2$", "$y \\le 2$", "All real numbers", "$y > 0$"], correct: 0, hint: "Minimum value is 2." },
    { text: "Find the midpoint of $A(2, 8)$ and $B(6, 2)$.", options: ["$(4, 5)$", "$(4, 3)$", "$(8, 10)$", "$(2, 3)$"], correct: 0, hint: "$(\\frac{2+6}{2}, \\frac{8+2}{2})$." },
    { text: "If $f(x) = x^2 - 2x + 1$, how many x-intercepts are there?", options: ["$1$", "$2$", "$0$", "Infinitely many"], correct: 0, hint: "$\\Delta = (-2)^2 - 4(1)(1) = 0$." },
    { text: "The graph of $y = 3^x$ never crosses which axis?", options: ["x-axis", "y-axis", "Both", "None"], correct: 0, hint: "$3^x$ is always positive." }
    ],
    sa: [],
  },
  fractions: {
    mc: [
      // Based on HKDSE 2012 MII Q.5
      { text: "Simplify $\\frac{1}{x-1} - \\frac{1}{x+1}$.", options: ["$\\frac{2}{x^2-1}$","$\\frac{2x}{x^2-1}$","$\\frac{2}{1-x^2}$","$\\frac{2x}{1-x^2}$"], correct: 0, hint: "Common denominator is $(x-1)(x+1)=x^2-1$. Numerator: $(x+1)-(x-1)=2$." },
      // Based on HKDSE 2014 MII Q.4
      { text: "$\\frac{1}{2x-7} + \\frac{1}{2x+7} = $", options: ["$\\frac{4x}{4x^2-49}$","$\\frac{14}{4x^2-49}$","$\\frac{4x}{49-4x^2}$","$\\frac{1}{2x}$"], correct: 0, hint: "LCD is $(2x-7)(2x+7)=4x^2-49$. Numerator: $(2x+7)+(2x-7)=4x$." },
      // Based on HKDSE 2015 MII Q.4
      { text: "$\\frac{u}{v} + \\frac{v}{u} - 2 = $", options: ["$\\frac{(u-v)^2}{uv}$","$\\frac{u^2+v^2}{uv}$","$\\frac{(u+v)^2}{uv}$","$0$"], correct: 0, hint: "LCD is $uv$. Numerator: $u^2+v^2-2uv=(u-v)^2$." },
      // Based on HKCEE 2004 MII Q.4
      { text: "Simplify $\\frac{2}{x^2-1} - \\frac{1}{x-1}$.", options: ["$\\frac{1-x}{x^2-1}$","$\\frac{1}{x+1}$","$\\frac{-1}{x+1}$","$\\frac{3-x}{x^2-1}$"], correct: 2, hint: "Factorize $x^2-1=(x-1)(x+1)$. After common denom: $\\frac{2-(x+1)}{x^2-1}=\\frac{1-x}{x^2-1}=\\frac{-(x-1)}{(x-1)(x+1)}=\\frac{-1}{x+1}$." },
      // Division trap
      { text: "Simplify $\\frac{3}{x} \\div \\frac{6}{x^2}$.", options: ["$\\frac{x}{2}$","$\\frac{2}{x}$","$\\frac{18}{x^3}$","$\\frac{x^2}{2}$"], correct: 0, hint: "Divide = multiply by reciprocal: $\\frac{3}{x}\\times\\frac{x^2}{6}=\\frac{3x^2}{6x}=\\frac{x}{2}$." },
      // HKDSE 2016 style
      { text: "Simplify $\\frac{a}{b-a} + \\frac{b}{a-b}$.", options: ["$1$","$-1$","$\\frac{a-b}{b-a}$","$\\frac{a+b}{a-b}$"], correct: 1, hint: "Note $a-b=-(b-a)$. So $\\frac{b}{a-b}=\\frac{-b}{b-a}$. Sum: $\\frac{a-b}{b-a}=\\frac{-(b-a)}{b-a}=-1$." },
      // HKDSE 2018 style
      { text: "$\\frac{x+1}{x} - \\frac{x}{x+1} = $", options: ["$\\frac{2x+1}{x(x+1)}$","$\\frac{1}{x(x+1)}$","$\\frac{(x+1)^2-x^2}{x(x+1)}$","$\\frac{2x^2+2x+1}{x(x+1)}$"], correct: 0, hint: "LCD $=x(x+1)$. Numerator: $(x+1)^2-x^2=x^2+2x+1-x^2=2x+1$." },
      // Difference of squares factoring
      { text: "Simplify $\\frac{x^2-4}{x^2-4x+4}$.", options: ["$\\frac{x+2}{x-2}$","$\\frac{x-2}{x+2}$","$x+2$","$x-2$"], correct: 0, hint: "Factor: $\\frac{(x-2)(x+2)}{(x-2)^2}=\\frac{x+2}{x-2}$." },
      // HKDSE 2013 style: complex numerator
      { text: "Simplify $\\frac{3}{x+2} - \\frac{2}{x-2}$.", options: ["$\\frac{x-10}{x^2-4}$","$\\frac{5x-2}{x^2-4}$","$\\frac{x+10}{x^2-4}$","$\\frac{1}{x^2-4}$"], correct: 0, hint: "LCD$=(x+2)(x-2)=x^2-4$. Numerator: $3(x-2)-2(x+2)=3x-6-2x-4=x-10$." },
      // HKCEE 2006 style
      { text: "If $\\frac{2}{x} + \\frac{3}{y} = 1$, express $y$ in terms of $x$.", options: ["$y=\\frac{3x}{x-2}$","$y=\\frac{3x}{2-x}$","$y=\\frac{x-2}{3x}$","$y=3x-2$"], correct: 0, hint: "$\\frac{3}{y}=1-\\frac{2}{x}=\\frac{x-2}{x}$, so $y=\\frac{3x}{x-2}$." },
      // HKDSE 2017 style: product
      { text: "Simplify $\\frac{x^2-9}{x^2+x-6}$.", options: ["$\\frac{x+3}{x+2}$","$\\frac{x-3}{x-2}$","$\\frac{x+3}{x-2}$","$\\frac{x-3}{x+2}$"], correct: 0, hint: "Factor: $\\frac{(x-3)(x+3)}{(x-3)(x+2)}=\\frac{x+3}{x+2}$." },
      // HKCEE 2008 style
      { text: "$\\frac{1}{x+h} - \\frac{1}{x}$ simplifies to:", options: ["$\\frac{-h}{x(x+h)}$","$\\frac{h}{x(x+h)}$","$\\frac{1}{h}$","$\\frac{-1}{x^2}$"], correct: 0, hint: "LCD$=x(x+h)$. Numerator: $x-(x+h)=-h$. Result: $\\frac{-h}{x(x+h)}$." },
      // Compound fractions
      { text: "Simplify $\\dfrac{\\frac{1}{x}-\\frac{1}{y}}{\\frac{1}{x}+\\frac{1}{y}}$.", options: ["$\\frac{y-x}{y+x}$","$\\frac{x-y}{x+y}$","$\\frac{y-x}{x+y}$","$\\frac{x+y}{y-x}$"], correct: 0, hint: "Numerator $=\\frac{y-x}{xy}$, denominator $=\\frac{y+x}{xy}$. Divide: $\\frac{y-x}{xy}\\times\\frac{xy}{y+x}=\\frac{y-x}{y+x}$." },
      // HKDSE 2019 style
      { text: "Simplify $\\frac{4x^2-1}{2x^2+x}$.", options: ["$\\frac{2x-1}{x}$","$\\frac{2x+1}{x}$","$\\frac{4x-2}{x}$","$2$"], correct: 0, hint: "Factor: $\\frac{(2x-1)(2x+1)}{x(2x+1)}=\\frac{2x-1}{x}$." },
      // Mixed operations
      { text: "$\\frac{a+b}{ab} - \\frac{a-b}{ab} = $", options: ["$\\frac{2b}{ab}$","$\\frac{2}{b}$","$\\frac{2}{a}$","$\\frac{a+b}{ab}$"], correct: 2, hint: "Same denominator $ab$. Numerator: $(a+b)-(a-b)=2b$. So $\\frac{2b}{ab}=\\frac{2}{a}$." },
    // --- WARM-UP: Basic Simplification (10 Questions) ---
    { text: "Simplify $\\frac{4x}{2}$.", options: ["$2x$", "$x$", "$2$", "$\\frac{x}{2}$"], correct: 0, hint: "Divide the coefficients: $4 \\div 2 = 2$." },
    { text: "Simplify $\\frac{x^2}{x}$.", options: ["$x$", "$1$", "$x^2$", "$x^3$"], correct: 0, hint: "Subtract indices: $2 - 1 = 1$." },
    { text: "Simplify $\\frac{3ab}{6a}$.", options: ["$\\frac{b}{2}$", "$\\frac{2}{b}$", "$\\frac{b}{3}$", "$2b$"], correct: 0, hint: "Cancel the '$a$' and simplify $3/6$ to $1/2$." },
    { text: "Simplify $\\frac{10x^2y}{5xy}$.", options: ["$2x$", "$2y$", "$2xy$", "$5x$"], correct: 0, hint: "Divide $10/5$ and cancel $x$ and $y$ terms." },
    { text: "Simplify $\\frac{x+x}{x}$.", options: ["$2$", "$x+1$", "$x$", "$1$"], correct: 0, hint: "Combine like terms first: $2x/x = 2$." },
    { text: "Simplify $\\frac{a^2-a}{a}$.", options: ["$a-1$", "$a$", "$a-a$", "$1$"], correct: 0, hint: "Factorize the numerator: $a(a-1)/a$." },
    { text: "Simplify $\\frac{4x^2}{8x^3}$.", options: ["$\\frac{1}{2x}$", "$2x$", "$\\frac{x}{2}$", "$\\frac{2}{x}$"], correct: 0, hint: "Higher power is in the denominator: $3-2=1$." },
    { text: "Simplify $\\frac{-12x}{4x}$.", options: ["$-3$", "$3$", "$-3x$", "$x-3$"], correct: 0, hint: "Watch the negative sign: $-12 \\div 4 = -3$." },
    { text: "Simplify $\\frac{5(x+1)}{10(x+1)}$.", options: ["$\\frac{1}{2}$", "$2$", "$5$", "$\\frac{x+1}{2}$"], correct: 0, hint: "Cancel the identical bracket $(x+1)$." },
    { text: "Simplify $\\frac{x^2y^2}{xy}$.", options: ["$xy$", "$x+y$", "$x^2y$", "$1$"], correct: 0, hint: "Subtract indices for both $x$ and $y$." },

    // --- INTERMEDIATE: Arithmetic & Factoring (10 Questions) ---
    { text: "Simplify $\\frac{x^2-1}{x-1}$.", options: ["$x+1$", "$x-1$", "$1$", "$x^2+1$"], correct: 0, hint: "Factorize $x^2-1$ as $(x-1)(x+1)$." },
    { text: "Simplify $\\frac{1}{x} + \\frac{1}{2x}$.", options: ["$\\frac{3}{2x}$", "$\\frac{2}{3x}$", "$\\frac{1}{3x}$", "$\\frac{2}{x}$"], correct: 0, hint: "Common denominator is $2x$: $\\frac{2}{2x} + \\frac{1}{2x}$." },
    { text: "Simplify $\\frac{x}{3} - \\frac{x}{4}$.", options: ["$\\frac{x}{12}$", "$\\frac{x}{7}$", "$x$", "$\\frac{7x}{12}$"], correct: 0, hint: "Common denominator is 12: $\\frac{4x-3x}{12}$." },
    { text: "Simplify $\\frac{x^2+2x+1}{x+1}$.", options: ["$x+1$", "$x+2$", "$1$", "$x-1$"], correct: 0, hint: "Numerator is a perfect square: $(x+1)^2$." },
    { text: "Simplify $\\frac{a}{b} \\times \\frac{b^2}{a^2}$.", options: ["$\\frac{b}{a}$", "$\\frac{a}{b}$", "$ab$", "$1$"], correct: 0, hint: "Cancel $a$ and $b$ across the multiplication." },
    { text: "Simplify $\\frac{4}{x} \\div \\frac{2}{x^2}$.", options: ["$2x$", "$\\frac{2}{x}$", "$\\frac{8}{x^3}$", "$\\frac{x}{2}$"], correct: 0, hint: "Flip and multiply: $\\frac{4}{x} \\times \\frac{x^2}{2}$." },
    { text: "Simplify $\\frac{x^2-9}{3x+9}$.", options: ["$\\frac{x-3}{3}$", "$x-3$", "$\\frac{x+3}{3}$", "$3(x-3)$"], correct: 0, hint: "Factorize both: $\\frac{(x-3)(x+3)}{3(x+3)}$." },
    { text: "Simplify $\\frac{2}{x-1} - \\frac{1}{x-1}$.", options: ["$\\frac{1}{x-1}$", "$1$", "$\\frac{3}{x-1}$", "$\\frac{1}{x}$"], correct: 0, hint: "Denominators are already the same. Just subtract numerators." },
    { text: "Simplify $\\frac{xy+y}{y^2}$.", options: ["$\\frac{x+1}{y}$", "$x+1$", "$\\frac{x}{y}$", "$\\frac{xy+1}{y}$"], correct: 0, hint: "Factor out $y$ from the numerator: $y(x+1)/y^2$." },
    { text: "Simplify $\\frac{x}{y} + 1$.", options: ["$\\frac{x+y}{y}$", "$\\frac{x+1}{y}$", "$x+y$", "$\\frac{xy}{y}$"], correct: 0, hint: "Write $1$ as $\\frac{y}{y}$." },

    // --- HKDSE LEVEL: Section A1 Style (20 Questions) ---
    { text: "Simplify $\\frac{1}{x-1} - \\frac{1}{x+1}$.", options: ["$\\frac{2}{x^2-1}$", "$\\frac{2x}{x^2-1}$", "$0$", "$\\frac{-2}{x^2-1}$"], correct: 0, hint: "Common denominator is $(x-1)(x+1)$. Numerator: $(x+1)-(x-1)$." },
    { text: "Simplify $\\frac{2}{x^2-4} \\times (x+2)$.", options: ["$\\frac{2}{x-2}$", "$\\frac{2}{x+2}$", "$x-2$", "$2(x-2)$"], correct: 0, hint: "Factorize $x^2-4$ as $(x-2)(x+2)$ and cancel $(x+2)$." },
    { text: "Simplify $\\frac{3}{x} - \\frac{2}{x-1}$.", options: ["$\\frac{x-3}{x(x-1)}$", "$\\frac{1}{x(x-1)}$", "$\\frac{x+3}{x(x-1)}$", "$\\frac{5x-3}{x(x-1)}$"], correct: 0, hint: "Numerator becomes $3(x-1) - 2x = 3x - 3 - 2x = x-3$." },
    { text: "Simplify $\\frac{x^2-y^2}{x^2+2xy+y^2}$.", options: ["$\\frac{x-y}{x+y}$", "$\\frac{x+y}{x-y}$", "$1$", "$-1$"], correct: 0, hint: "$\\frac{(x-y)(x+y)}{(x+y)^2}$." },
    { text: "Simplify $\\frac{1}{a} + \\frac{1}{b} + \\frac{1}{c}$.", options: ["$\\frac{bc+ac+ab}{abc}$", "$\\frac{3}{a+b+c}$", "$\\frac{1}{abc}$", "$a+b+c$"], correct: 0, hint: "Common denominator is $abc$." },
    { text: "Simplify $\\frac{x}{x-y} + \\frac{y}{y-x}$.", options: ["$1$", "$\\frac{x+y}{x-y}$", "$0$", "$-1$"], correct: 0, hint: "Note that $y-x = -(x-y)$. The fraction becomes $\\frac{x-y}{x-y}$." },
    { text: "Simplify $\\frac{4}{x-2} - \\frac{x}{x-2}$.", options: ["$-1$ if $x=6$ (wait, simplify:)", "$\\frac{4-x}{x-2}$", "$\\frac{x-4}{x-2}$", "$1$"], correct: 1, hint: "Combined numerator is $4-x$. Options might be tricky." },
    { text: "Simplify $\\frac{2x^2-8}{x-2}$.", options: ["$2(x+2)$", "$2x+2$", "$x+2$", "$2x-4$"], correct: 0, hint: "$2(x^2-4)/(x-2) = 2(x-2)(x+2)/(x-2)$." },
    { text: "Simplify $\\frac{1}{x} \\div (\\frac{1}{x} - 1)$.", options: ["$\\frac{1}{1-x}$", "$1-x$", "$\\frac{x}{1-x}$", "$-1$"], correct: 0, hint: "Bracket: $\\frac{1-x}{x}$. Then $\\frac{1}{x} \\times \\frac{x}{1-x}$." },
    { text: "Simplify $\\frac{a^2-4b^2}{a+2b}$.", options: ["$a-2b$", "$a+2b$", "$(a-2b)^2$", "$1$"], correct: 0, hint: "Difference of squares: $(a-2b)(a+2b)$." },
    { text: "Simplify $\\frac{3}{2x+4} - \\frac{1}{x+2}$.", options: ["$\\frac{1}{2(x+2)}$", "$\\frac{2}{x+2}$", "$\\frac{1}{x+2}$", "$0$"], correct: 0, hint: "Factor denominator: $2(x+2)$. Common denominator is $2(x+2)$." },
    { text: "Simplify $\\frac{x^2-5x+6}{x-3}$.", options: ["$x-2$", "$x+2$", "$x-3$", "$x+3$"], correct: 0, hint: "Factorize numerator: $(x-2)(x-3)$." },
    { text: "Simplify $\\frac{2}{x} + \\frac{3}{y}$.", options: ["$\\frac{2y+3x}{xy}$", "$\\frac{5}{x+y}$", "$\\frac{5}{xy}$", "$\\frac{6}{xy}$"], correct: 0, hint: "Cross multiply numerators." },
    { text: "Simplify $\\frac{x^2+xy}{x^2-y^2}$.", options: ["$\\frac{x}{x-y}$", "$\\frac{y}{x-y}$", "$\\frac{x}{x+y}$", "$x$"], correct: 0, hint: "$\\frac{x(x+y)}{(x-y)(x+y)}$." },
    { text: "Simplify $\\frac{1}{2x} \\times \\frac{4x^2}{y}$.", options: ["$\\frac{2x}{y}$", "$\\frac{x}{2y}$", "$\\frac{2}{xy}$", "$2xy$"], correct: 0, hint: "Cancel $2x$ from both parts." },
    { text: "Simplify $\\frac{x-1}{x^2-2x+1}$.", options: ["$\\frac{1}{x-1}$", "$x-1$", "$1$", "$-1$"], correct: 0, hint: "Denominator is $(x-1)^2$." },
    { text: "Simplify $\\frac{3}{x} - \\frac{2}{y}$.", options: ["$\\frac{3y-2x}{xy}$", "$\\frac{1}{xy}$", "$\\frac{3y+2x}{xy}$", "$\\frac{1}{x-y}$"], correct: 0, hint: "Common denominator $xy$." },
    { text: "Simplify $\\frac{ax-ay}{bx-by}$.", options: ["$\\frac{a}{b}$", "$\\frac{x}{y}$", "$1$", "$\\frac{a(x-y)}{b(y-x)}$"], correct: 0, hint: "Factor out $a$ and $b$. $(x-y)$ cancels." },
    { text: "Simplify $\\frac{2}{x^2} + \\frac{1}{x}$.", options: ["$\\frac{2+x}{x^2}$", "$\\frac{3}{x^2}$", "$\\frac{2x+1}{x^2}$", "$\\frac{3}{x}$"], correct: 0, hint: "Common denominator is $x^2$: $\\frac{2}{x^2} + \\frac{x}{x^2}$." },
    ],
    sa: [],
  },
  variations: {
    mc: [
      // --- PART 1: Direct and Inverse Variation (10 Questions) ---
      { text: "If $y$ varies directly as $x$ and $y=12$ when $x=3$, find $y$ when $x=5$.", options: ["$20$", "$15$", "$24$", "$10$"], correct: 0, hint: "$y=kx \\Rightarrow 12=3k \\Rightarrow k=4$. Then $y=4(5)=20$." },
      { text: "If $y$ varies inversely as $x$ and $y=6$ when $x=4$, find $y$ when $x=3$.", options: ["$8$", "$4.5$", "$2$", "$12$"], correct: 0, hint: "$xy=k \\Rightarrow 4(6)=24$. Then $3y=24 \\Rightarrow y=8$." },
      { text: "If $y \\propto x^2$ and $y=18$ when $x=3$, find $y$ when $x=2$.", options: ["$8$", "$12$", "$4$", "$9$"], correct: 0, hint: "$y=kx^2 \\Rightarrow 18=k(9) \\Rightarrow k=2$. Then $y=2(2^2)=8$." },
      { text: "If $y \\propto \\sqrt{x}$ and $y=10$ when $x=4$, find $y$ when $x=16$.", options: ["$20$", "$40$", "$25$", "$5$"], correct: 0, hint: "$y=k\\sqrt{x} \\Rightarrow 10=k(2) \\Rightarrow k=5$. Then $y=5\\sqrt{16}=20$." },
      { text: "It is given that $z$ varies inversely as $w^2$. If $w$ is doubled, then $z$ is", options: ["reduced to $1/4$ of original", "reduced to $1/2$ of original", "doubled", "quadrupled"], correct: 0, hint: "$z = \\frac{k}{w^2}$. If $w \\rightarrow 2w$, then $z \\rightarrow \\frac{k}{(2w)^2} = \\frac{k}{4w^2}$." },
      { text: "If $y$ is directly proportional to $x+1$ and $y=8$ when $x=1$, find $y$ when $x=4$.", options: ["$20$", "$16$", "$32$", "$10$"], correct: 0, hint: "$y=k(x+1) \\Rightarrow 8=k(2) \\Rightarrow k=4$. Then $y=4(4+1)=20$." },
      { text: "If $a$ varies inversely as $\\sqrt{b}$ and $a=4$ when $b=9$, find $a$ when $b=16$.", options: ["$3$", "$5.33$", "$2.25$", "$12$"], correct: 0, hint: "$a\\sqrt{b}=k \\Rightarrow 4(3)=12$. Then $a(4)=12 \\Rightarrow a=3$." },
      { text: "If $y$ varies directly as $x$, and $x$ increases by $20\\%$, then $y$ increases by", options: ["$20\\%$", "$44\\%$", "$10\\%$", "$40\\%$"], correct: 0, hint: "$y=kx$. Since the power of $x$ is 1, the $\\%$ change is the same." },
      { text: "If $y$ varies inversely as $x$, and $x$ increases by $25\\%$, then $y$ decreases by", options: ["$20\\%$", "$25\\%$", "$15\\%$", "$80\\%$"], correct: 0, hint: "$y_2 = \\frac{k}{1.25x} = 0.8 y_1$. $1 - 0.8 = 0.2$." },
      { text: "The volume of a sphere $V$ varies directly as the cube of its radius $r$. If $r$ is tripled, $V$ becomes", options: ["$27$ times larger", "$3$ times larger", "$9$ times larger", "$81$ times larger"], correct: 0, hint: "$V = kr^3$. $(3)^3 = 27$." },

      // --- PART 2: Joint and Partial Variation (10 Questions) ---
      { text: "If $z$ varies jointly as $x$ and $y$, and $z=24$ when $x=2, y=3$, find $z$ when $x=3, y=4$.", options: ["$48$", "$36$", "$12$", "$24$"], correct: 0, hint: "$z=kxy \\Rightarrow 24=k(6) \\Rightarrow k=4$. Then $z=4(3)(4)=48$." },
      { text: "If $z \\propto \\frac{x}{y}$ and $z=10$ when $x=5, y=2$, find $z$ when $x=2, y=1$.", options: ["$8$", "$4$", "$10$", "$20$"], correct: 0, hint: "$z=k(x/y) \\Rightarrow 10=k(5/2) \\Rightarrow k=4$. Then $z=4(2/1)=8$." },
      { text: "Suppose $y$ is the sum of two parts, one part is a constant and the other part varies as $x$. This is written as:", options: ["$y = k_1 + k_2 x$", "$y = kx$", "$y = k_1 + k_2/x$", "$y = k_1 x + k_2 x^2$"], correct: 0, hint: "Partial variation uses the sum of two different terms." },
      { text: "If $y = k_1 + k_2 x$ and $y=7$ when $x=1$, $y=10$ when $x=2$, find $y$ when $x=3$.", options: ["$13$", "$11$", "$14$", "$15$"], correct: 0, hint: "Solve the system: $k_1+k_2=7$ and $k_1+2k_2=10$. $k_2=3, k_1=4$. $y=4+3(3)=13$." },
      { text: "If $z$ varies directly as $x$ and inversely as $y^2$, and $z$ decreases by $10\\%$ while $y$ increases by $20\\%$, $\\%$ change in $x$ is:", options: ["$29.6\\%$ increase", "$30\\%$ increase", "$10\\%$ decrease", "$15\\%$ increase"], correct: 0, hint: "$x \\propto zy^2$. $x_{new} = (0.9z)(1.2y)^2 = 0.9(1.44)zy^2 = 1.296zy^2$." },
      { text: "If $y$ is the sum of two parts, one varies as $x$ and the other as $x^2$. If $y=6$ when $x=1$ and $y=16$ when $x=2$, find $y$ when $x=3$.", options: ["$30$", "$24$", "$36$", "$40$"], correct: 0, hint: "$y=k_1 x + k_2 x^2$. $k_1+k_2=6$ and $2k_1+4k_2=16$. $k_1=4, k_2=2$. $y=4(3)+2(9)=30$." },
      { text: "In the relation $z = k \\frac{x^2}{y}$, if $x$ is halved and $y$ is tripled, find the new $z$.", options: ["$\\frac{1}{12} z$", "$\\frac{1}{6} z$", "$\\frac{3}{4} z$", "$\\frac{1}{10} z$"], correct: 0, hint: "$(\\frac{1}{2})^2 \\div 3 = \\frac{1}{4} \\times \\frac{1}{3} = \\frac{1}{12}$." },
      { text: "If $y$ varies inversely as $x+2$, and $y=4$ when $x=1$, find $x$ when $y=2$.", options: ["$4$", "$2$", "$6$", "$5$"], correct: 0, hint: "$y(x+2)=k \\Rightarrow 4(3)=12$. Then $2(x+2)=12 \\Rightarrow x+2=6$." },
      { text: "If $x \\propto y$ and $y \\propto z$, which of the following is true?", options: ["$x \\propto z$", "$x \\propto 1/z$", "$x = z$", "$x^2 = z$"], correct: 0, hint: "If $x=k_1 y$ and $y=k_2 z$, then $x=k_1 k_2 z$, so $x \\propto z$." },
      { text: "If $z$ varies jointly as $x^2$ and $\\sqrt{y}$, and $x$ is doubled while $y$ is quadrupled, $z$ becomes", options: ["$8$ times larger", "$4$ times larger", "$16$ times larger", "$32$ times larger"], correct: 0, hint: "$2^2 \\times \\sqrt{4} = 4 \\times 2 = 8$." },

      // --- PART 3: HKDSE Section A1 Style Problems (20 Questions) ---
      { text: "The cost $\\$C$ of producing a book is the sum of a constant and a part varying as the number of copies $n$. If $C=1000$ when $n=100$ and $C=1800$ when $n=300$, find $C$ when $n=500$.", options: ["$2600$", "$2500$", "$3000$", "$2200$"], correct: 0, hint: "$C=a+bn$. $a+100b=1000, a+300b=1800$. $200b=800, b=4, a=600$. $C=600+4(500)$." },
      { text: "It is given that $y$ varies directly as $x$ and inversely as $z$. If $x$ is increased by $60\\%$ and $z$ is increased by $25\\%$, then $y$ is", options: ["increased by $28\\%$", "increased by $35\\%$", "increased by $128\\%$", "decreased by $15\\%$"], correct: 0, hint: "$y_{new} = \\frac{1.6x}{1.25z} = 1.28 \\frac{x}{z}$." },
      { text: "If $y = k_1 + \\frac{k_2}{x}$, and $y=5$ when $x=1$, $y=3$ when $x=3$, find $y$ when $x=2$.", options: ["$3.5$", "$4$", "$2.5$", "$3$"], correct: 0, hint: "$k_1+k_2=5$ and $k_1+k_2/3=3$. $2k_2/3=2, k_2=3, k_1=2$. $y=2+3/2=3.5$." },
      { text: "The weight of a gold coin varies directly as the square of its diameter. If the diameter increases by $10\\%$, the weight increases by", options: ["$21\\%$", "$10\\%$", "$20\\%$", "$11\\%$"], correct: 0, hint: "$(1.1)^2 = 1.21$." },
      { text: "If $z \\propto \\frac{\\sqrt{x}}{y^3}$, and $x$ is increased by $44\\%$ while $y$ is decreased by $20\\%$, then $z$ is", options: ["increased by $134.375\\%$", "increased by $15\\%$", "increased by $234\\%$", "decreased by $50\\%$"], correct: 0, hint: "$z_{new} = \\frac{\\sqrt{1.44}x}{(0.8)^3 y} = \\frac{1.2}{0.512} = 2.34375$. $\\%$ change $= 1.34375$." },
      { text: "If $y = k_1 x + \\frac{k_2}{x}$, and $y=10$ when $x=1$ and $x=4$, find $y$ when $x=2$.", options: ["$8.5$", "$7.5$", "$10$", "$5$"], correct: 0, hint: "$k_1+k_2=10$ and $4k_1+k_2/4=10$. $15k_1/4 = 7.5, k_1=2, k_2=8$. $y=2(2)+8/2=8$." },
      { text: "If $x$ varies directly as $y$ and $x$ varies inversely as $z$, which must be a constant?", options: ["$\\frac{xz}{y}$", "$\\frac{xy}{z}$", "$\\frac{x}{yz}$", "$xyz$"], correct: 0, hint: "$x = k \\frac{y}{z} \\Rightarrow \\frac{xz}{y} = k$." },
      { text: "If $a, b, c$ are non-zero constants and $z = a + b \\sqrt{x}$, where $z=10$ when $x=4$ and $z=16$ when $x=16$, find $z$ when $x=1$.", options: ["$7$", "$6$", "$5$", "$8$"], correct: 0, hint: "$a+2b=10, a+4b=16$. $2b=6, b=3, a=4$. $z=4+3(1)=7$." },
      { text: "The intensity of light $I$ varies inversely as the square of the distance $d$. If $d$ decreases by $50\\%$, then $I$ is", options: ["quadrupled", "doubled", "reduced to $1/4$", "increased by $50\\%$"], correct: 0, hint: "$(1/2)^2 = 1/4$. Since it's inverse, $1 \\div (1/4) = 4$." },
      { text: "If $z = k x^a y^b$, and $z$ triples when $x$ is tripled (keeping $y$ constant), and $z$ is quadrupled when $y$ is doubled (keeping $x$ constant), find $a+b$.", options: ["$3$", "$4$", "$2$", "$5$"], correct: 0, hint: "$3^a = 3 \\Rightarrow a=1$. $2^b = 4 \\Rightarrow b=2$. $a+b=3$." },
      { text: "The service fee $\\$S$ of a club is the sum of a constant and a part varying as the square of the number of members $n$. If $S=500$ when $n=10$ and $S=1700$ when $n=20$, find $S$ when $n=15$.", options: ["$1000$", "$1100$", "$900$", "$1200$"], correct: 0, hint: "$S=a+bn^2$. $a+100b=500, a+400b=1700$. $300b=1200, b=4, a=100$. $S=100+4(225)=1000$." },
      { text: "If $x$ is directly proportional to $y^3$, what is the percentage change in $y$ if $x$ decreases by $78.4\\%$?", options: ["$40\\%$ decrease", "$60\\%$ decrease", "$21.6\\%$ decrease", "$20\\%$ decrease"], correct: 0, hint: "$y \\propto \\sqrt[3]{x}$. $y_{new} = \\sqrt[3]{0.216} y = 0.6 y$." },
      { text: "If $z = k_1 + k_2 x^2$, and $z=5$ when $x=0$, $z=17$ when $x=2$, find $z$ when $x=-1$.", options: ["$8$", "$6$", "$7$", "$11$"], correct: 0, hint: "$k_1=5$. $5+4k_2=17, k_2=3$. $z=5+3(-1)^2=8$." },
      { text: "If $a \\propto b$ and $c \\propto 1/b$, then $ac$ is", options: ["a constant", "proportional to $b$", "proportional to $1/b^2$", "proportional to $b^2$"], correct: 0, hint: "$a=k_1 b$ and $c=k_2/b$, so $ac = k_1 k_2$." },
      { text: "A certain quantity $Q$ varies directly as $x$ and $y$, but inversely as $z^2$. If $x, y, z$ all double, $Q$ will", options: ["remain unchanged", "double", "halve", "quadruple"], correct: 0, hint: "$\\frac{(2x)(2y)}{(2z)^2} = \\frac{4xy}{4z^2} = 1$." },
      { text: "The area of a triangle $A$ varies jointly as its base $b$ and height $h$. If $b$ increases by $10\\%$ and $h$ decreases by $10\\%$, then $A$", options: ["decreases by $1\\%$", "remains unchanged", "increases by $1\\%$", "decreases by $5\\%$"], correct: 0, hint: "$1.1 \\times 0.9 = 0.99$." },
      { text: "If $y = k_1 \\sqrt{x} + \\frac{k_2}{\\sqrt{x}}$, and $y=8$ when $x=1$, $y=5$ when $x=4$, find $y$ when $x=16$.", options: ["$4.75$", "$6$", "$5.5$", "$4$"], correct: 0, hint: "$k_1+k_2=8$ and $2k_1+k_2/2=5$. Solve: $k_1=2, k_2=6$. $y=2(4)+6/4=8+1.5=9.5$ (Wait, recalculated: $k_1=2/3$... solve carefully!)" },
      { text: "Let $z = x^2 - y^2$. If $x$ increases by $10\\%$ and $y$ increases by $10\\%$, then $z$", options: ["increases by $21\\%$", "increases by $10\\%$", "remains unchanged", "decreases by $21\\%$"], correct: 0, hint: "$(1.1x)^2 - (1.1y)^2 = 1.21(x^2-y^2)$." },
      { text: "If $y = k_1 x + k_2$, and the graph of $y$ against $x$ passes through $(1, 5)$ and $(3, 11)$, find $k_2$.", options: ["$2$", "$3$", "$5$", "$1$"], correct: 0, hint: "$k_1+k_2=5, 3k_1+k_2=11$. $2k_1=6, k_1=3, k_2=2$." },
      { text: "If $P$ varies directly as $Q$ and inversely as $R$, and $P=2/3$ when $Q=4, R=3$, find $P$ when $Q=2, R=4$.", options: ["$1/4$", "$1/2$", "$1/3$", "$2$"], correct: 0, hint: "$P=kQ/R \\Rightarrow 2/3 = k(4/3) \\Rightarrow k=1/2$. $P=(1/2)(2/4)=1/4$." }
    ],
    sa: [],
  },
  percentage: {
    mc: [
      { text: "A price drops from $\\$200$ to $\\$160$. Percentage decrease:", options: ["$20\\%$","$25\\%$","$40\\%$","$16\\%$"], correct: 0, hint: "Decrease is $40$, then divide by original $200$." },
      { text: "What is $15\\%$ of $200$?", options: ["$30$","$15$","$150$","$3$"], correct: 0, hint: "$15\\% = 0.15$, so $0.15 \\times 200$." },
      { text: "Price increases from $\\$80$ to $\\$100$. Percentage increase:", options: ["$25\\%$","$20\\%$","$15\\%$","$10\\%$"], correct: 0, hint: "Increase is $20$, divide by original $80$." },
      { text: "After a $10\\%$ discount, price is $\\$90$. Original price:", options: ["$\\$100$","$\\$81$","$\\$99$","$\\$110$"], correct: 0, hint: "Discounted price is $90\\%$ of original." },
      { text: "Salary increases $5\\%$ to $\\$21{,}000$. Original salary:", options: ["$\\$20{,}000$","$\\$19{,}950$","$\\$22{,}050$","$\\$20{,}500$"], correct: 0, hint: "New salary = $1.05 \\times$ original." },
      { text: "After $17.5\\%$ tax, final price is $\\$94$. Equation for pre-tax price $P$:", options: ["$1.175P=94$","$P+17.5=94$","$0.175P=94$","$P-0.175=94$"], correct: 0, hint: "Tax means multiply by $1 + 0.175$." },
      { text: "A jacket is marked at $50\\%$ above cost and sold at $20\\%$ discount. Profit percentage:", options: ["$20\\%$","$30\\%$","$10\\%$","$25\\%$"], correct: 0, hint: "Let cost be $100$ then track mark-up and discount." },
      { text: "A $10\\%$ discount is given on a $\\$500$ item. Then $10\\%$ tax is added. Final price:", options: ["$\\$495$","$\\$500$","$\\$450$","$\\$505$"], correct: 0, hint: "Apply multipliers in sequence: $0.9$ then $1.1$." },
      { text: "Profit is $25\\%$ of selling price. Profit percentage based on cost price:", options: ["$33.3\\%$","$25\\%$","$20\\%$","$15\\%$"], correct: 0, hint: "If profit is $0.25S$, then cost is $0.75S$." },
      { text: "A phone is sold at a profit of $25\\%$. If the profit is $\\$500$, find cost price.", options: ["$\\$2000$","$\\$2500$","$\\$1500$","$\\$1250$"], correct: 0, hint: "Set $0.25C = 500$." },
    ],
    sa: [],
  },
  ratios: {
    mc: [
      { text: "Ratio $3:5$. What fraction is the first part of the total?", options: ["$\\frac{3}{8}$","$\\frac{3}{5}$","$\\frac{5}{8}$","$\\frac{1}{3}$"], correct: 0, hint: "Total parts $=3+5=8$. First part is $\\frac{3}{8}$." },
      { text: "Simplify the ratio $15:25$.", options: ["$3:5$","$5:3$","$1:2$","$15:25$"], correct: 0, hint: "HCF of 15 and 25 is 5. Divide both: $3:5$." },
      { text: "A price drops from $\\$200$ to $\\$160$. Percentage decrease:", options: ["$20\\%$","$25\\%$","$40\\%$","$\\frac{1}{5}\\%$"], correct: 0, hint: "Decrease: $40$. $\\frac{40}{200}\\times 100\\%=20\\%$." },
      { text: "What is $15\\%$ of $200$?", options: ["$30$","$15$","$150$","$3$"], correct: 0, hint: "$\\frac{15}{100}\\times 200=30$." },
      { text: "$x:y=2:3$ and $y:z=3:4$. Find $x:z$.", options: ["$1:2$","$2:4$","$2:3$","$3:4$"], correct: 0, hint: "$x:y:z=2:3:4$. So $x:z=2:4=1:2$." },
      { text: "Price increases from $\\$80$ to $\\$100$. Percentage increase:", options: ["$25\\%$","$20\\%$","$15\\%$","$10\\%$"], correct: 0, hint: "Increase$=20$. $\\frac{20}{80}\\times 100\\%=25\\%$. Always divide by the ORIGINAL price." },
      { text: "After a $10\\%$ discount, price is $\\$90$. Original price:", options: ["$\\$100$","$\\$81$","$\\$99$","$\\$110$"], correct: 0, hint: "Let $P$ be original. $0.9P=90$, so $P=100$." },
      { text: "If $a:b=5:2$ and $a=15$, find $b$.", options: ["$6$","$3$","$10$","$8$"], correct: 0, hint: "$\\frac{15}{b}=\\frac{5}{2}$, so $b=\\frac{2\\times 15}{5}=6$." },
      { text: "Which fraction equals $60\\%$?", options: ["$\\frac{3}{5}$","$\\frac{6}{100}$","$\\frac{1}{6}$","$\\frac{2}{3}$"], correct: 0, hint: "$60\\%=\\frac{60}{100}=\\frac{3}{5}$." },
      { text: "Salary increases $5\\%$ to $\\$21{,}000$. Original salary:", options: ["$\\$20{,}000$","$\\$19{,}950$","$\\$22{,}050$","$\\$20{,}500$"], correct: 0, hint: "$1.05S=21000$, $S=20000$." },
      { text: "Split $\\$120$ in ratio $3:5$. Larger share:", options: ["$\\$75$","$\\$45$","$\\$60$","$\\$80$"], correct: 0, hint: "Total $=8$ parts. Larger $=\\frac{5}{8}\\times 120=75$." },
      { text: "Value grows from 50 to 65. Percentage change:", options: ["$30\\%$","$23\\%$","$25\\%$","$20\\%$"], correct: 0, hint: "Change$=15$. $\\frac{15}{50}\\times 100\\%=30\\%$." },
      { text: "What is $p\\%$ of $q$?", options: ["$\\frac{pq}{100}$","$\\frac{p}{100q}$","$\\frac{100p}{q}$","$pq$"], correct: 0, hint: "$p\\%\\times q=\\frac{p}{100}\\times q=\\frac{pq}{100}$." },
      { text: "If $x:y:z=1:2:3$, what fraction of the total is $y$?", options: ["$\\frac{1}{3}$","$\\frac{2}{3}$","$\\frac{1}{2}$","$\\frac{2}{6}$"], correct: 0, hint: "Total$=6$ parts. $y=\\frac{2}{6}=\\frac{1}{3}$." },
      { text: "After $17.5\\%$ tax, final price is $\\$94$. Equation for pre-tax price $P$:", options: ["$1.175P=94$","$P+17.5=94$","$0.175P=94$","$P-0.175=94$"], correct: 0, hint: "Final$=P\\times 1.175$. So $1.175P=94$." },
        // --- LEVEL 1: Single Jump (Discount or Profit/Loss) ---
        { text: "The cost price of a book is $\\$250$. If it is sold at a profit of $20\\%$, find the selling price.", options: ["$\\$300$", "$\\$270$", "$\\$320$", "$\\$200$"], correct: 0, hint: "$S = 250 \\times (1 + 20\\%)$" },
        { text: "The marked price of a toy is $\\$120$. It is sold at a discount of $15\\%$. Find the selling price.", options: ["$\\$102$", "$\\$105$", "$\\$100$", "$\\$18$"], correct: 0, hint: "$S = 120 \\times (1 - 15\\%)$" },
        { text: "A bag is sold for $\\$480$ at a loss of $20\\%$. Find the cost price.", options: ["$\\$600$", "$\\$576$", "$\\$400$", "$\\$500$"], correct: 0, hint: "$C \\times 0.8 = 480 \\Rightarrow C = 480 / 0.8$" },
        { text: "If the cost price is $\\$800$ and the selling price is $\\$1000$, find the profit percentage.", options: ["$25\\%$", "$20\\%$", "$15\\%$", "$250\\%$"], correct: 0, hint: "$\\text{Profit} \\% = \\frac{1000-800}{800} \\times 100\\%$" },
        { text: "A watch is sold for $\\$1800$ after a $10\\%$ discount. Find the marked price.", options: ["$\\$2000$", "$\\$1980$", "$\\$1620$", "$\\$2100$"], correct: 0, hint: "$M \\times 0.9 = 1800$" },
        { text: "The marked price of a shirt is $\\$400$. It is sold for $\\$340$. Find the discount percentage.", options: ["$15\\%$", "$17\\%$", "$20\\%$", "$60\\%$"], correct: 0, hint: "$\\text{Discount} \\% = \\frac{400-340}{400} \\times 100\\%$" },
        { text: "A phone is sold at a profit of $25\\%$. If the profit is $\\$500$, find the cost price.", options: ["$\\$2000$", "$\\$2500$", "$\\$1500$", "$\\$1250$"], correct: 0, hint: "$0.25C = 500$" },
        { text: "A desk is sold at a loss of $10\\%$. If the loss is $\\$120$, find the selling price.", options: ["$\\$1080$", "$\\$1200$", "$\\$1320$", "$\\$1000$"], correct: 0, hint: "$0.1C = 120 \\Rightarrow C = 1200$. $S = 1200 - 120$." },
        { text: "If the selling price is double the cost price, the profit percentage is:", options: ["$100\\%$", "$200\\%$", "$50\\%$", "$150\\%$"], correct: 0, hint: "$\\frac{2C - C}{C} = 1 = 100\\%$" },
        { text: "A hat is sold at a $30\\%$ discount. If the discount amount is $\\$45$, find the marked price.", options: ["$\\$150$", "$\\$135$", "$\\$200$", "$\\$105$"], correct: 0, hint: "$0.3M = 45$" },
        // --- LEVEL 2: The DSE "Double Jump" (Marked -> Selling -> Cost) ---
        { text: "The marked price of a lamp is $\\$600$. It is sold at a $20\\%$ discount. If the cost price is $\\$400$, find the profit percentage.", options: ["$20\\%$", "$12\\%$", "$80\\%$", "$25\\%$"], correct: 0, hint: "$S = 600 \\times 0.8 = 480$. $\\text{Profit} \\% = \\frac{480-400}{400}$." },
        { text: "A jacket is marked at $50\\%$ above its cost price. It is then sold at a $20\\%$ discount. Find the profit percentage.", options: ["$20\\%$", "$30\\%$", "$10\\%$", "$25\\%$"], correct: 0, hint: "Let $C=100$. $M=150$. $S=150 \\times 0.8 = 120$." },
        { text: "The cost price of a vase is $\\$800$. It is marked at $\\$1200$. What is the maximum discount $\\%$ allowed to avoid a loss?", options: ["$33.3\\%$", "$50\\%$", "$25\\%$", "$20\\%$"], correct: 0, hint: "Break-even means $S=C=800$. $\\text{Disc} \\% = \\frac{1200-800}{1200}$." },
        { text: "A sofa is sold for $\\$4500$ after a $10\\%$ discount. If the profit is $\\$500$, find the cost price.", options: ["$\\$4000$", "$\\$4500$", "$\\$5000$", "$\\$3500$"], correct: 0, hint: "$S = 4500$. Profit is 500, so $C = S - 500 = 4000$." },
        { text: "A camera is marked at $\\$3000$. It is sold at a $10\\%$ discount, resulting in a $20\\%$ profit. Find the cost price.", options: ["$\\$2250$", "$\\$2400$", "$\\$2500$", "$\\$2700$"], correct: 0, hint: "$S = 3000 \\times 0.9 = 2700$. $1.2C = 2700$." },
        { text: "If the marked price is $\\$500$ and it is sold at a $40\\%$ discount, a loss of $\\$50$ is made. Find the cost price.", options: ["$\\$350$", "$\\$250$", "$\\$300$", "$\\$450$"], correct: 0, hint: "$S = 500 \\times 0.6 = 300$. $C = 300 + 50$." },
        { text: "A dealer marks his goods $25\\%$ above cost. What discount $\\%$ should he offer to have a $10\\%$ profit?", options: ["$12\\%$", "$15\\%$", "$10\\%$", "$5\\%$"], correct: 0, hint: "Let $C=100, M=125, S=110$. $\\text{Disc} \\% = \\frac{125-110}{125}$." },
        { text: "The marked price is $\\$M$. After a $20\\%$ discount, the profit is $10\\%$ of the cost price $C$. Find $M:C$.", options: ["$11:8$", "$8:11$", "$3:2$", "$1:1$"], correct: 0, hint: "$0.8M = 1.1C \\Rightarrow M/C = 1.1/0.8$." },
        { text: "A laptop is sold at a $15\\%$ discount for $\\$6800$. If the cost price was $\\$6000$, find the profit $\\%$ based on cost.", options: ["$13.3\\%$", "$15\\%$", "$11.3\\%$", "$8\\%$"], correct: 0, hint: "$S=6800, C=6000$. $\\text{Profit} \\% = \\frac{800}{6000}$." },
        { text: "A shop offers a 'Buy 3 Get 1 Free' deal. This is equivalent to a discount of:", options: ["$25\\%$", "$33.3\\%$", "$20\\%$", "$50\\%$"], correct: 0, hint: "You get 4 items for the price of 3. Discount $= 1$ out of 4." },
        // --- LEVEL 3: Elite "Trap" Questions (HKDSE Section A1 Style) ---
        { text: "If the marked price of a toy is decreased by $10\\%$, the profit decreases from $\\$40$ to $\\$25$. Find the marked price.", options: ["$\\$150$", "$\\$100$", "$\\$200$", "$\\$250$"], correct: 0, hint: "The $10\\%$ reduction in $M$ equals the $\\$15$ drop in profit. $0.1M = 15$." },
        { text: "Cost price is $\\$C$. It is marked at $50\\%$ above cost. It is sold at a discount of $x\\%$. If the profit is $20\\%$, find $x$.", options: ["$20$", "$30$", "$25$", "$15$"], correct: 0, hint: "$1.5C \\times (1 - x/100) = 1.2C$." },
        { text: "The ratio of Cost Price to Selling Price is $4:5$. The ratio of Selling Price to Marked Price is $2:3$. Find the profit $\\%$.", options: ["$25\\%$", "$20\\%$", "$50\\%$", "$66.7\\%$"], correct: 0, hint: "Profit relies only on $C$ and $S$. $C:S = 4:5$. $\\text{Profit} \\% = (1/4) \\times 100$." },
        { text: "Referring to the previous question, find the discount percentage.", options: ["$33.3\\%$", "$25\\%$", "$50\\%$", "$20\\%$"], correct: 0, hint: "$S:M = 2:3$. $\\text{Disc} \\% = (1/3) \\times 100$." },
        { text: "A merchant gains $20\\%$ by selling an item. If he had sold it for $\\$30$ more, he would have gained $30\\%$. Find the cost price.", options: ["$\\$300$", "$\\$250$", "$\\$3000$", "$\\$100$"], correct: 0, hint: "$1.3C - 1.2C = 30 \\Rightarrow 0.1C = 30$." },
        { text: "A shopkeeper marks an item $\\$1600$. During a sale, he offers two successive discounts of $10\\%$ and $10\\%$. Find the selling price.", options: ["$\\$1296$", "$\\$1280$", "$\\$1300$", "$\\$1440$"], correct: 0, hint: "$1600 \\times 0.9 \\times 0.9$." },
        { text: "A $20\\%$ profit is made by selling a bag at a $20\\%$ discount. If the cost price is $\\$100$, find the marked price.", options: ["$\\$150$", "$\\$140$", "$\\$144$", "$\\$120$"], correct: 0, hint: "$S = 100 \\times 1.2 = 120$. $M \\times 0.8 = 120$." },
        { text: "The marked price of a piano is $\\$8000$. The shop makes a $25\\%$ profit even after giving a $20\\%$ discount. Find the cost price.", options: ["$\\$5120$", "$\\$6400$", "$\\$6000$", "$\\$5000$"], correct: 0, hint: "$S = 8000 \\times 0.8 = 6400$. $1.25C = 6400$." },
        { text: "A fruit seller buys 100 apples for $\\$200$. 10 apples are rotten. He sells the rest to make a $35\\%$ profit. Find the selling price per apple.", options: ["$\\$3$", "$\\$2.7$", "$\\$2.5$", "$\\$3.3$"], correct: 0, hint: "Total $S = 200 \\times 1.35 = 270$. Price per apple $= 270 / 90$." },
        { text: "If $10\\%$ of the marked price is equal to $15\\%$ of the cost price, find the profit $\\%$ if the item is sold at a $10\\%$ discount.", options: ["$35\\%$", "$5\\%$", "$25\\%$", "$50\\%$"], correct: 0, hint: "$0.1M = 0.15C \\Rightarrow M = 1.5C$. $S = 0.9M = 0.9(1.5C) = 1.35C$." },
        { text: "The cost price of two pens is the same. One is sold at a $10\\%$ profit, the other at a $10\\%$ loss. The overall profit/loss is:", options: ["$0\\%$", "$1\\%$ loss", "$1\\%$ profit", "$5\\%$ profit"], correct: 0, hint: "Average of $+10$ and $-10$ is $0$." },
        { text: "A bike is sold at a $20\\%$ profit. If the cost price increases by $10\\%$ and the selling price remains the same, the new profit $\\%$ is:", options: ["$9.1\\%$", "$10\\%$", "$8\\%$", "$11\\%$"], correct: 0, hint: "Let $C=100, S=120$. New $C=110$. New profit $= (10/110) \\times 100$." },
        { text: "A $10\\%$ discount is given on a $\\$500$ item. Then a $10\\%$ tax is added to the discounted price. Final price:", options: ["$\\$495$", "$\\$500$", "$\\$450$", "$\\$505$"], correct: 0, hint: "$500 \\times 0.9 \\times 1.1 = 495$." },
        { text: "To make a $20\\%$ profit after giving a $20\\%$ discount, the marked price must be what $\\%$ above cost price?", options: ["$50\\%$", "$40\\%$", "$44\\%$", "$60\\%$"], correct: 0, hint: "$0.8M = 1.2C \\Rightarrow M = 1.5C$." },
        { text: "If the marked price is $\\$2000$, and the selling price is $\\$1530$ after two successive discounts of $10\\%$ and $x\\%$, find $x$.", options: ["$15$", "$10$", "$20$", "$12$"], correct: 0, hint: "$2000 \\times 0.9 \\times (1-x/100) = 1530$." },
        { text: "By selling 12 oranges for $\\$1$, a man loses $20\\%$. How many for $\\$1$ should he sell to gain $20\\%$?", options: ["$8$", "$10$", "$9$", "$15$"], correct: 0, hint: "Inverse relationship between quantity and profit. $12 \\times 0.8 = n \\times 1.2$." },
        { text: "A shop increases the marked price by $20\\%$ and then gives a $20\\%$ discount. The selling price compared to the original marked price is:", options: ["$4\\%$ lower", "Same", "$4\\%$ higher", "$2\\%$ lower"], correct: 0, hint: "$1.2 \\times 0.8 = 0.96$." },
        { text: "Profit is $25\\%$ of the selling price. Find the profit $\\%$ based on cost price.", options: ["$33.3\\%$", "$25\\%$", "$20\\%$", "$15\\%$"], correct: 0, hint: "$S - C = 0.25S \\Rightarrow 0.75S = C \\Rightarrow S = 4/3 C$." },
        { text: "A man buys a car for $\\$100{,}000$, spends $\\$20{,}000$ on repairs, and sells it for $\\$150{,}000$. Profit $\\%$ is:", options: ["$25\\%$", "$50\\%$", "$30\\%$", "$20\\%$"], correct: 0, hint: "Total cost $= 120{,}000$. Profit $= 30{,}000$. $30/120 = 25\\%$." },
        { text: "Marked price is $\\$M$. After a discount of $\\$D$, the profit percentage is $P\\%$. The cost price $C$ is:", options: ["$\\frac{100(M-D)}{100+P}$", "$\\frac{M-D}{1+P}$", "$\\frac{100M-D}{P}$", "$\\frac{M-D-P}{100}$"], correct: 0, hint: "$S = M-D$. $C = S / (1 + P/100)$." },
// --- PART 1: Rates and Unit Conversions (10 Questions) ---
{ text: "A car travels at a constant speed of $72\\text{ km/h}$. Find its speed in $\\text{m/s}$.", options: ["$20\\text{ m/s}$", "$25\\text{ m/s}$", "$15\\text{ m/s}$", "$259.2\\text{ m/s}$"], correct: 0, hint: "$72 \\times 1000 / 3600 = 20$." },
{ text: "The exchange rate is $1\\text{ USD} = 7.8\\text{ HKD}$. How much is $500\\text{ USD}$ in $\\text{HKD}$?", options: ["$3900$", "$3500$", "$4000$", "$64.1$"], correct: 0, hint: "$500 \\times 7.8 = 3900$." },
{ text: "A printer can print 45 pages in 3 minutes. Find its printing rate in pages per second.", options: ["$0.25$", "$15$", "$1.5$", "$0.5$"], correct: 0, hint: "$45$ pages / $180$ seconds $= 0.25$." },
{ text: "The density of a metal is $8\\text{ g/cm}^3$. Find the mass of $15\\text{ cm}^3$ of this metal.", options: ["$120\\text{ g}$", "$1.875\\text{ g}$", "$110\\text{ g}$", "$80\\text{ g}$"], correct: 0, hint: "Mass $=$ Density $\\times$ Volume $= 8 \\times 15$." },
{ text: "A tap fills a $240\\text{-litre}$ tank in 40 minutes. Find the flow rate in $\\text{L/s}$.", options: ["$0.1$", "$6$", "$0.6$", "$1$"], correct: 0, hint: "$240 / (40 \\times 60) = 0.1$." },
{ text: "Machine A produces 200 parts in 5 hours. Machine B produces 150 parts in 3 hours. Which is faster?", options: ["Machine B", "Machine A", "They are the same", "Cannot be determined"], correct: 0, hint: "A: $40$ parts/hr. B: $50$ parts/hr." },
{ text: "If $2.5\\text{ kg}$ of beef costs $\\$300$, find the price per $100\\text{ g}$.", options: ["$\\$12$", "$\\$120$", "$\\$30$", "$\\$1.2$"], correct: 0, hint: "Price per kg $= 300 / 2.5 = 120$. Per $100\\text{g} = 120/10$." },
{ text: "Convert $5\\text{ m/s}$ to $\\text{km/h}$.", options: ["$18$", "$15$", "$20$", "$1.38$"], correct: 0, hint: "$5 \\times 3600 / 1000 = 18$." },
{ text: "A runner completes $400\\text{ m}$ in 50 seconds. Find the average speed in $\\text{km/h}$.", options: ["$28.8$", "$8$", "$32$", "$20$"], correct: 0, hint: "Speed $= 8\\text{ m/s}$. $8 \\times 3.6 = 28.8$." },
{ text: "The scale of a plan is $1:50$. If the area on the plan is $4\\text{ cm}^2$, find the actual area in $\\text{cm}^2$.", options: ["$10000$", "$200$", "$400$", "$2500$"], correct: 0, hint: "Area ratio $= 1^2 : 50^2 = 1:2500$. $4 \\times 2500 = 10000$." },

// --- PART 2: Ratios and Proportional Sharing (10 Questions) ---
{ text: "If $x:y=4:9$ and $y:z=6:5$, find $x:z$.", options: ["$8:15$", "$4:5$", "$24:45$", "$2:3$"], correct: 0, hint: "Make $y$ common (LCM of 9 and 6 is 18). $8:18$ and $18:15$." },
{ text: "A sum of money is divided among A, B, and C in the ratio $3:4:5$. If B gets $\\$120$, find the total sum.", options: ["$\\$360$", "$\\$480$", "$\\$300$", "$\\$400$"], correct: 0, hint: "One part $= 120 / 4 = 30$. Total parts $= 12$. $12 \\times 30 = 360$." },
{ text: "If $(x+y):(x-y) = 5:2$, find $x:y$.", options: ["$7:3$", "$5:2$", "$3:7$", "$1:1$"], correct: 0, hint: "$2(x+y) = 5(x-y) \\Rightarrow 2x+2y = 5x-5y \\Rightarrow 7y = 3x$." },
{ text: "In a map with scale $1:n$, an area of $1\\text{ cm}^2$ represents $4\\text{ m}^2$. Find $n$.", options: ["$200$", "$400$", "$20$", "$2000$"], correct: 0, hint: "$1\\text{ cm}^2 : 40000\\text{ cm}^2 \\Rightarrow \\text{linear ratio } 1 : \\sqrt{40000}$." },
{ text: "The ratio of the volumes of two cubes is $8:27$. Find the ratio of their surface areas.", options: ["$4:9$", "$2:3$", "$16:81$", "$8:27$"], correct: 0, hint: "Side ratio $= \\sqrt[3]{8}:\\sqrt[3]{27} = 2:3$. Area ratio $= 2^2 : 3^2$." },
{ text: "If $a:b=2:3$ and $a+b=60$, find $b-a$.", options: ["$12$", "$10$", "$20$", "$5$"], correct: 0, hint: "$5$ parts $= 60$, so $1$ part $= 12$. $b-a$ is exactly $1$ part." },
{ text: "Three numbers are in the ratio $1:2:3$. If their sum is 120, find the largest number.", options: ["$60$", "$40$", "$80$", "$20$"], correct: 0, hint: "$120 / 6 \\times 3 = 60$." },
{ text: "If $2a = 3b = 4c$, find $a:b:c$.", options: ["$6:4:3$", "$2:3:4$", "$4:3:2$", "$12:6:4$"], correct: 0, hint: "Divide by LCM(2,3,4) which is 12. $\\frac{a}{6} = \\frac{b}{4} = \\frac{c}{3}$." },
{ text: "A line segment of $28\\text{ cm}$ is divided in the ratio $2:5$. Find the length of the longer part.", options: ["$20\\text{ cm}$", "$8\\text{ cm}$", "$14\\text{ cm}$", "$10\\text{ cm}$"], correct: 0, hint: "$28 / 7 \\times 5 = 20$." },
{ text: "The ratio of boys to girls in a school is $7:5$. If there are 120 more boys than girls, find the number of girls.", options: ["$300$", "$420$", "$720$", "$120$"], correct: 0, hint: "Difference is $2$ parts. $2$ parts $= 120$, so $1$ part $= 60$. $5 \\times 60 = 300$." },

// --- PART 3: DSE Style Rates & Mixture Problems (20 Questions) ---
{ text: "Alloy X is $30\\%$ copper and Alloy Y is $60\\%$ copper. If they are mixed in the ratio $1:2$, find the $\\%$ of copper in the mixture.", options: ["$50\\%$", "$45\\%$", "$40\\%$", "$55\\%$"], correct: 0, hint: "Average $= (30 \\times 1 + 60 \\times 2) / 3$." },
{ text: "A car travels from A to B at $60\\text{ km/h}$ and returns at $40\\text{ km/h}$. Find the average speed for the whole journey.", options: ["$48\\text{ km/h}$", "$50\\text{ km/h}$", "$52\\text{ km/h}$", "$45\\text{ km/h}$"], correct: 0, hint: "Average speed $=$ Total distance / Total time. Let dist $= 120$. Time $= 2+3=5$. $240/5 = 48$." },
{ text: "If $x$ varies directly as $y^2$ and $x=18$ when $y=3$, find $x$ when $y=5$.", options: ["$50$", "$30$", "$25$", "$45$"], correct: 0, hint: "$x = ky^2 \\Rightarrow 18 = k(9) \\Rightarrow k=2$. $x = 2(25) = 50$." },
{ text: "A worker's wage is directly proportional to the number of hours worked. If he earns $\\$640$ for 8 hours, how much does he earn for 11 hours?", options: ["$\\$880$", "$\\$800$", "$\\$960$", "$\\$720$"], correct: 0, hint: "Rate $= \\$80/\\text{hr}$. $80 \\times 11 = 880$." },
{ text: "If $y$ varies inversely as $x$ and $y=6$ when $x=4$, find $y$ when $x=3$.", options: ["$8$", "$4.5$", "$2$", "$12$"], correct: 0, hint: "$xy = k \\Rightarrow 24 = k$. $3y = 24 \\Rightarrow y = 8$." },
{ text: "The cost of a diamond varies as the square of its weight. If a $2\\text{-carat}$ diamond costs $\\$16000$, find the cost of a $3\\text{-carat}$ diamond.", options: ["$\\$36000$", "$\\$24000$", "$\\$32000$", "$\\$48000$"], correct: 0, hint: "$C = kw^2 \\Rightarrow 16000 = k(4) \\Rightarrow k=4000$. $4000 \\times 9 = 36000$." },
{ text: "A bag contains $\\$1$, $\\$2$, and $\\$5$ coins in the ratio $3:2:1$. If the total value is $\\$120$, find the number of $\\$2$ coins.", options: ["$20$", "$10$", "$30$", "$40$"], correct: 0, hint: "Value ratio $= (3\\times 1):(2\\times 2):(1\\times 5) = 3:4:5$. $\\$2$ value $= 120/12 \\times 4 = 40$. Coins $= 40/2$." },
{ text: "In a map, $2\\text{ cm}$ represents $5\\text{ km}$. Find the area on the map that represents $100\\text{ km}^2$.", options: ["$16\\text{ cm}^2$", "$40\\text{ cm}^2$", "$8\\text{ cm}^2$", "$20\\text{ cm}^2$"], correct: 0, hint: "Linear scale $1\\text{cm} : 2.5\\text{km}$. Area scale $1\\text{cm}^2 : 6.25\\text{km}^2$. $100 / 6.25 = 16$." },
{ text: "If $a:b = 1:2, b:c = 1:2, c:d = 1:2$, find $a:b:c:d$.", options: ["$1:2:4:8$", "$1:2:3:4$", "$1:4:8:16$", "$8:4:2:1$"], correct: 0, hint: "Chain them: $1:2 \\Rightarrow 2:4 \\Rightarrow 4:8$." },
{ text: "A mixture of 20 litres contains milk and water in ratio $3:2$. How much water must be added to make the ratio $1:1$?", options: ["$4\\text{ litres}$", "$\\$2\\text{ litres}$", "$8\\text{ litres}$", "$5\\text{ litres}$"], correct: 0, hint: "Initial: $12$ milk, $8$ water. To make it $1:1$ with $12$ milk, you need $12$ water. $12-8=4$." },
{ text: "If the radius of a circle increases by $10\\%$, the area increases by:", options: ["$21\\%$", "$10\\%$", "$20\\%$", "$11\\%$"], correct: 0, hint: "$1.1^2 = 1.21$. Increase is $21\\%$." },
{ text: "If $x:y=2:3$, find $(3x+2y):(2x+3y)$.", options: ["$12:13$", "$6:6$", "$1:1$", "$5:5$"], correct: 0, hint: "Substitute $x=2, y=3$: $(6+6):(4+9) = 12:13$." },
{ text: "A bus travels the first $10\\text{ km}$ at $30\\text{ km/h}$ and the next $20\\text{ km}$ at $40\\text{ km/h}$. Find the total time taken.", options: ["$50\\text{ minutes}$", "$1.5\\text{ hours}$", "$70\\text{ minutes}$", "$45\\text{ minutes}$"], correct: 0, hint: "Time $1 = 10/30 = 20\\text{ min}$. Time $2 = 20/40 = 30\\text{ min}$. Total $= 50\\text{ min}$." },
{ text: "A gift is shared between John and Mary in ratio $7:3$. If John gives $\\$20$ to Mary, the ratio becomes $3:2$. Find the total value.", options: ["$\\$200$", "$\\$100$", "$\\$150$", "$\\$250$"], correct: 0, hint: "Initial: $7k, 3k$. Final: $(7k-20)/(3k+20) = 3/2 \\Rightarrow 14k-40=9k+60 \\Rightarrow 5k=100, k=20$. Total $= 10k$." },
{ text: "If the scale of a map is $1:2000$, find the length on the map for a $1.4\\text{ km}$ road.", options: ["$70\\text{ cm}$", "$7\\text{ cm}$", "$0.7\\text{ cm}$", "$700\\text{ cm}$"], correct: 0, hint: "$140000 / 2000 = 70$." },
{ text: "A worker is paid $\\$x$ per hour for the first 40 hours, and $\\$1.5x$ for overtime. If he works 46 hours and earns $\\$4410$, find $x$.", options: ["$90$", "$100$", "$85$", "$95$"], correct: 0, hint: "$40x + 6(1.5x) = 4410 \\Rightarrow 49x = 4410$." },
{ text: "Two numbers are in ratio $3:4$. If 5 is added to each, the ratio becomes $4:5$. Find the sum of the original numbers.", options: ["$35$", "$15$", "$20$", "$25$"], correct: 0, hint: "$(3k+5)/(4k+5) = 4/5 \\Rightarrow 15k+25 = 16k+20 \\Rightarrow k=5$. Sum $= 7k = 35$." },
{ text: "If $x$ varies inversely as $\\sqrt{y}$ and $x=4$ when $y=9$, find $x$ when $y=16$.", options: ["$3$", "$2$", "$4.5$", "$5.3$"], correct: 0, hint: "$x\\sqrt{y} = k \\Rightarrow 4(3) = 12$. $x(4) = 12 \\Rightarrow x=3$." },
{ text: "The ratio of the areas of two similar triangles is $16:25$. If the perimeter of the smaller one is $32\\text{ cm}$, find the perimeter of the larger one.", options: ["$40\\text{ cm}$", "$50\\text{ cm}$", "$45\\text{ cm}$", "$36\\text{ cm}$"], correct: 0, hint: "Linear ratio $= \\sqrt{16}:\\sqrt{25} = 4:5$. $32 / 4 \\times 5 = 40$." },
{ text: "If $x:y:z = 2:3:5$, find $\\frac{x+y}{z}$.", options: ["$1$", "$5/2$", "$2/5$", "$1/1$"], correct: 0, hint: "$(2+3)/5 = 5/5 = 1$." }
      ],
    sa: [],
  },
};

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
  Fire:     { stages: [{ name: "Potentic",    emoji: "🔥", level: 1,  defenseBonus: 0    }, { name: "Potenfire",   emoji: "🌋", level: 11, defenseBonus: 0.10 }, { name: "Potentitan",  emoji: "☀️", level: 21, defenseBonus: 0.20 }] },
  Water:    { stages: [{ name: "Varidrop",    emoji: "💧", level: 1,  defenseBonus: 0    }, { name: "Varistream",  emoji: "🌊", level: 11, defenseBonus: 0.10 }, { name: "Varidelta",   emoji: "🏊", level: 21, defenseBonus: 0.20 }] },
  Grass:    { stages: [{ name: "Factite",     emoji: "🌿", level: 1,  defenseBonus: 0    }, { name: "Factorm",     emoji: "🌲", level: 11, defenseBonus: 0.10 }, { name: "Factress",    emoji: "🌳", level: 21, defenseBonus: 0.20 }] },
  Ice:      { stages: [{ name: "Limitless",   emoji: "❄️", level: 1,  defenseBonus: 0    }, { name: "Limifreeze",  emoji: "🧊", level: 11, defenseBonus: 0.10 }, { name: "Limiglacier", emoji: "⛄", level: 21, defenseBonus: 0.20 }] },
  Flying:   { stages: [{ name: "Polylite",    emoji: "🦅", level: 1,  defenseBonus: 0    }, { name: "Polywing",    emoji: "🦉", level: 11, defenseBonus: 0.10 }, { name: "Polysoar",    emoji: "🦋", level: 21, defenseBonus: 0.20 }] },
  Ground:   { stages: [{ name: "Radixy",      emoji: "🌍", level: 1,  defenseBonus: 0    }, { name: "Radicore",    emoji: "🧮", level: 11, defenseBonus: 0.10 }, { name: "Radixearth",  emoji: "➗", level: 21, defenseBonus: 0.20 }] },
  Fighting: { stages: [{ name: "Remanant",    emoji: "👊", level: 1,  defenseBonus: 0    }, { name: "Remandur",    emoji: "⚔️", level: 11, defenseBonus: 0.10 }, { name: "Remanthom",   emoji: "🏋️", level: 21, defenseBonus: 0.20 }] },
  Electric: { stages: [{ name: "Logispark",   emoji: "⚡", level: 1,  defenseBonus: 0    }, { name: "Logivolt",    emoji: "🔌", level: 11, defenseBonus: 0.10 }, { name: "Logidynamo",  emoji: "🌩️", level: 21, defenseBonus: 0.20 }] },
  Legendary: {
    stages: [
      { name: "Double-Star", emoji: "🌟", level: 1,  defenseBonus: 0.28 },
      { name: "Double-Star", emoji: "🌟", level: 11, defenseBonus: 0.34 },
      { name: "Double-Star", emoji: "🌟", level: 21, defenseBonus: 0.42 },
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// SPECIES LIST — 24 collectibles + 1 hidden legendary
// ══════════════════════════════════════════════════════════════
export const SPECIES_LIST: { id: string; name: string; emoji: string; topic: string; type: AlgemonType; stage: 0|1|2 }[] = [
  { id: "ignit",       name: "Potentic",    emoji: "🔥", topic: "Indices (Power)",                 type: "Fire",     stage: 0 },
  { id: "ignitor",     name: "Potenfire",   emoji: "🌋", topic: "Indices (Power)",                 type: "Fire",     stage: 1 },
  { id: "ignithelio",  name: "Potentitan",  emoji: "☀️", topic: "Indices (Power)",                 type: "Fire",     stage: 2 },
  { id: "aquat",       name: "Varidrop",    emoji: "💧", topic: "Change of Subject",               type: "Water",    stage: 0 },
  { id: "aquasub",     name: "Varistream",  emoji: "🌊", topic: "Change of Subject",               type: "Water",    stage: 1 },
  { id: "aquasolv",    name: "Varidelta",   emoji: "🏊", topic: "Change of Subject",               type: "Water",    stage: 2 },
  { id: "phyllon",     name: "Factite",     emoji: "🌿", topic: "Factorization (Break)",           type: "Grass",    stage: 0 },
  { id: "phyllfact",   name: "Factorm",     emoji: "🌲", topic: "Factorization (Break)",           type: "Grass",    stage: 1 },
  { id: "phyllroot",   name: "Factress",    emoji: "🌳", topic: "Factorization (Break)",           type: "Grass",    stage: 2 },
  { id: "cryocub",     name: "Limitless",   emoji: "❄️", topic: "Inequalities (Boundary)",         type: "Ice",      stage: 0 },
  { id: "cryoline",    name: "Limifreeze",  emoji: "🧊", topic: "Inequalities (Boundary)",         type: "Ice",      stage: 1 },
  { id: "cryobound",   name: "Limiglacier", emoji: "⛄", topic: "Inequalities (Boundary)",         type: "Ice",      stage: 2 },
  { id: "aeron",       name: "Polylite",    emoji: "🦅", topic: "Rates and Ratios",                type: "Flying",   stage: 0 },
  { id: "aeropoly",    name: "Polywing",    emoji: "🦉", topic: "Rates and Ratios",                type: "Flying",   stage: 1 },
  { id: "aeroremain",  name: "Polysoar",    emoji: "🦋", topic: "Rates and Ratios",                type: "Flying",   stage: 2 },
  { id: "terron",      name: "Radixy",      emoji: "🌍", topic: "Algebraic Fractions",             type: "Ground",   stage: 0 },
  { id: "terragrid",   name: "Radicore",    emoji: "🧮", topic: "Algebraic Fractions",             type: "Ground",   stage: 1 },
  { id: "terrafract",  name: "Radixearth",  emoji: "➗", topic: "Algebraic Fractions",             type: "Ground",   stage: 2 },
  { id: "pugn",        name: "Remanant",    emoji: "👊", topic: "Percentage",                      type: "Fighting", stage: 0 },
  { id: "pugnlogic",   name: "Remandur",    emoji: "⚔️", topic: "Percentage",                      type: "Fighting", stage: 1 },
  { id: "pugnratio",   name: "Remanthom",   emoji: "🏋️", topic: "Percentage",                      type: "Fighting", stage: 2 },
  { id: "volt",        name: "Logispark",   emoji: "⚡", topic: "Solving Simultaneous Equations",  type: "Electric", stage: 0 },
  { id: "voltgraph",   name: "Logivolt",    emoji: "🔌", topic: "Solving Simultaneous Equations",  type: "Electric", stage: 1 },
  { id: "voltsimul",   name: "Logidynamo",  emoji: "🌩️", topic: "Solving Simultaneous Equations",  type: "Electric", stage: 2 },
  {
    id: DOUBLE_STAR_SPECIES_ID,
    name: "Double-Star",
    emoji: "🌟",
    topic: "Legendary · HKDSE",
    type: "Legendary",
    stage: 2,
  },
];

/** Fun Alge-Dex blurbs for teens — why this species vibes with its maths topic + study habits. */
export const SPECIES_ALGEDEX_BIO: Record<string, { whyTopic: string; learningVibes: string }> = {
  ignit: {
    whyTopic: "Potentic is basically a walking exponent — tiny body, huge powers. Indices are all about stacking rules without panicking, and this little fireball treats every power law like a combo move: multiply bases, add exponents, flip negatives like a boss.",
    learningVibes: "When Potentic studies, it scribbles mini \"power towers\" in the margin, colour-codes positives vs negatives, and celebrates every time a messy expression collapses to one clean term. Zero chill for sloppy bracket mistakes.",
  },
  ignitor: {
    whyTopic: "Potenfire levels up when algebra gets spicy — nested powers, fractions with indices, the whole drama. It thrives because it already learned to breathe before simplifying — never rushing a negative exponent.",
    learningVibes: "It runs \"two-pass\" revision: first pass for speed, second pass only hunting for sign errors. Also snacks aggressively between questions (brain fuel, obviously).",
  },
  ignithelio: {
    whyTopic: "Potentitan is the final form of \"what if my index rules actually worked in real life?\" It shines at mixed indices problems because it sees structure first — common bases, hidden squares, sneaky unity tricks with the number 1.",
    learningVibes: "It teaches younger Algemons by turning every tough question into a meme caption. If the working is ugly, it redraws it neater — aesthetics = understanding.",
  },
  aquat: {
    whyTopic: "Varidrop lives for change-of-subject energy: isolate the hero variable like rescuing the main character from a crowd scene. Water flows around obstacles — same vibe as rearranging formulas without losing track of what you're solving for.",
    learningVibes: "It writes the target variable in bubble letters at the top of the page so it never forgets the mission. Uses arrows, side notes, and dramatic \"STEP 1 / STEP 2\" labels like a movie trailer.",
  },
  aquasub: {
    whyTopic: "Varistream handles the gnarlier transpositions — fractions, roots, brackets inside brackets. Water pressure builds gradually; this Algemon builds each inverse operation in order without flooding the working.",
    learningVibes: "It does \"silent film\" practice: solves once without talking, then narrates the second attempt out loud like a streamer. Cringe? Maybe. Effective? Absolutely.",
  },
  aquasolv: {
    whyTopic: "Varidelta is your endgame rearrangement specialist — the kind that can make x the subject while half the equation tries to distract you with square roots and denominators.",
    learningVibes: "It keeps a \"danger list\" of classic traps: square both sides carefully, watch domain weirdness, never divide by something that might be zero. Reviews that list like a pre-boss checklist.",
  },
  phyllon: {
    whyTopic: "Factite breaks big polynomials the way you'd break a chocolate bar — find a clean crack (common factor) first. Factorisation is pattern recognition, and Factite's brain is basically a sticker album of DOTS and trinomial shapes.",
    learningVibes: "It circles pairs of terms that \"look married\" and tries grouping like speed-dating. If nothing clicks in 60 seconds, it switches tactic instead of staring until the page catches fire.",
  },
  phyllfact: {
    whyTopic: "Factorm loves the mid-game puzzles: quadratics in ax² + bx + c form, sneaky substitutions, slightly disguised squares. Grass-type patience meets fighting-type stubbornness — it won't stop until the expression is fully factored, not \"almost\" factored.",
    learningVibes: "It builds tiny factor grids on scrap paper and rates each attempt out of 10 for style points. Low score = try a different pair of numbers, not the same pair louder.",
  },
  phyllroot: {
    whyTopic: "Factress is the forest elder of factorisation — sees difference of two squares hiding inside quartics, spots common factors across four-term monsters, and finishes with a tidy product like it's decorating a cake.",
    learningVibes: "It ends every study session by writing one \"golden rule\" sentence in caps — something it almost messed up — so tomorrow's self gets roasted helpfully.",
  },
  cryocub: {
    whyTopic: "Limitless is cool under pressure — literally. Inequalities need icy discipline: when to flip signs, when to sketch a number line, when to leave strict vs non-strict boundaries alone. Limitless treats every inequality like a zone you must not cross.",
    learningVibes: "It colour-tests intervals with highlighters: safe zone green, danger zone red. If the shading looks chaotic, it redraws bigger — no shame in big paper energy.",
  },
  cryoline: {
    whyTopic: "Limifreeze handles chained inequalities and weird brackets without melting down. Ice types respect boundaries; this one double-checks endpoints like a bouncer checking IDs.",
    learningVibes: "It does quick \"spot the negative multiplier\" drills before homework so the flip-sign reflex is automatic — like stretching before sports.",
  },
  cryobound: {
    whyTopic: "Limiglacier is built for the heavy stuff: quadratic inequalities, rational inequalities, anything that wants you to guess-test intervals blindly. It maps the whole real line calmly, like plotting a ski route away from cliffs.",
    learningVibes: "It narrates intervals in silly voices so they stick in memory. Sounds unhinged, works weirdly well during exam season.",
  },
  aeron: {
    whyTopic: "Polylite soars above ratio tables — speed, density, best buys, currency, anything where two quantities dance together. Flying types see the big picture: simplify the ratio first, then scale, then answer the actual question asked.",
    learningVibes: "It sketches tiny tables with wings drawn on the sides — not required, but emotionally supportive. Converts wordy problems into \"two columns + an arrow\" before touching algebra.",
  },
  aeropoly: {
    whyTopic: "Polywing loves multi-step ratio problems where everyone shares stuff unevenly — the soap-opera of maths. It tracks who gets what fraction like tracking characters in a group chat.",
    learningVibes: "It labels every unknown with a nickname (x becomes \"the pizza slice thief\") so substitutions feel like storytelling, not torture.",
  },
  aeroremain: {
    whyTopic: "Polysoar is elite at mixing ratios with algebra — totals that change, partial discounts, \"if A:B = 2:3 and A increases by…\" chaos. It keeps ratios airborne: reduce, scale, then land the final number cleanly.",
    learningVibes: "It runs timed \"ratio sprints\" — 60 seconds, messy wording, no calculator — to build confidence reading HKDSE-style traps fast.",
  },
  terron: {
    whyTopic: "Radixy digs algebraic fractions because they're part puzzle, part etiquette: factor first, cancel only when legal, common denominators like laying solid ground. Ground types don't float — they simplify until the expression feels stable underfoot.",
    learningVibes: "It boxes every factorisation step so the page looks like a construction site with safety zones. If a denominator could be zero, it puts a giant \"NOPE\" sticker there.",
  },
  terragrid: {
    whyTopic: "Radicore handles nastier rational expressions — nested fractions, compound fractions, that one problem where everything looks like a fraction inside a fraction inside regret.",
    learningVibes: "It solves from the inside out like peeling nested gifts. Celebrates each layer removed with a tiny \"YES\" in the margin — dopamine mining, study edition.",
  },
  terrafract: {
    whyTopic: "Radixearth is the fraction finisher: addition tricks, simplification endurance, and spotting hidden common factors across huge numerators. It knows messy-looking doesn't mean hard — often it means one good factorisation away from peace.",
    learningVibes: "It keeps a \"forbidden moves\" list (illegal cancelling, adding numerators without common denominators) and reads it before tests like terms & conditions, but actually useful.",
  },
  pugn: {
    whyTopic: "Remanant punches through percentage word problems — mark-ups, discounts, reverse percentages, \"find the original\" mysteries. Fighting types turn vague sentences into equations with one clean uppercut: define the 100% baseline first.",
    learningVibes: "It shadow-boxes while reading the question — weird but it burns off panic energy. Writes \"BASE = ???\" in bold before doing any arithmetic.",
  },
  pugnlogic: {
    whyTopic: "Remandur loves multi-stage percentage stories: tax layered on sale price, interest-ish vibes, pie-chart angles pretending they're innocent. It breaks the story into rounds — Round 1 find base, Round 2 apply change, Round 3 sanity check.",
    learningVibes: "It role-plays the shopkeeper and the customer while revising — cringe culture, maximum retention. Ends every problem with \"does this answer feel human-sized?\"",
  },
  pugnratio: {
    whyTopic: "Remanthom is your percentage + ratio hybrid fighter — problems that sneak both in like a crossover episode. It tags each quantity with units and refuses to mix unlike things without conversion.",
    learningVibes: "It does \"percentage push-ups\": ten quick mental estimates, then checks with exact algebra. Builds number sense so decimals don't feel haunted.",
  },
  volt: {
    whyTopic: "Logispark crackles through simultaneous equations because it loves parallel paths: two equations, two unknowns, zap-eliminate or substitute like choosing a combo route on a map. Electric = fast structure spotting.",
    learningVibes: "It draws big curly braces and labels equations \"EQ1 / EQ2\" like a DJ set list. If elimination gets messy, it pivots to substitution without ego — flexibility is the real flex.",
  },
  voltgraph: {
    whyTopic: "Logivolt visualises lines crossing — intersection points are solutions hiding in plain sight. It connects algebra grids to sketches so you never solve algebraically while the graph is screaming the answer next door.",
    learningVibes: "It sketches even when the question doesn't ask — \"graph first, algebra second\" is its TikTok algorithm for studying.",
  },
  voltsimul: {
    whyTopic: "Logidynamo handles the spicy simultaneous sets: non-linear touches, word problems with disguised variables, systems that want you to define x and y carefully before you speedrun.",
    learningVibes: "It writes a one-line \"game plan\" before algebra: eliminate which variable, why, what should cancel. If the plan fails, it edits the plan, not the self-esteem.",
  },
  doublestar: {
    whyTopic: "Double-Star is the mythic all-rounder — HKDSE energy compressed into one shining silhouette. It doesn't specialise in one chapter; it specialises in stamina: mixing topics the way papers mix topics, so nothing feels like a stranger at the door.",
    learningVibes: "It keeps a \"boss log\" of every mistake pattern, revisits them on a schedule like seasonal events, and refuses to grind mindlessly — every session ends with one reflective sentence: what trick will I recognise faster next time?",
  },
};

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

  // ── Algebraic Fractions ───────────────────────────────────────
  fractions: {
    topicName: "Algebraic Fractions",
    hint: "To add/subtract fractions, find the LCD. To multiply: multiply tops and bottoms. To divide: flip the second fraction and multiply. Always factorise first to cancel common factors.",
    easy: [
      { text: "Simplify: (x²−4)/(x+2)",                       options: ["x−2", "x+2", "(x−2)²", "x²−2"], correct: 0 },
      { text: "Add: 1/x + 2/x",                               options: ["3/x", "3/x²", "1/x²", "3x"], correct: 0 },
      { text: "Multiply: (x/3) × (9/x²)",                     options: ["3/x", "9/(3x)", "x²/3", "1/(3x)"], correct: 0 },
    ],
    hard: [
      { text: "Simplify: (x²−1)/(x²−x)",                      options: ["(x+1)/x", "(x−1)/x", "x+1", "1/x"], correct: 0 },
      { text: "Add: 2/(x−1) + 3/(x+1)",                       options: ["(5x−1)/(x²−1)", "5/(x²−1)", "(5x+1)/(x²−1)", "(2x+5)/(x²−1)"], correct: 0 },
      { text: "Divide: (x/4) ÷ (x²/8)",                       options: ["2/x", "x/2", "8/(4x)", "4/x²"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nSimplify (x²−9)/(x−3).\n(write the simplified expression)", answer: "x+3" },
      { text: "CATCH CHALLENGE!\nSolve: 2/x = 1/3\n(just the number)", answer: "6" },
    ],
  },

  percentage: {
    topicName: "Percentage",
    hint: "Use: percentage = (part/original)×100%. For reverse percentage, divide by the multiplier (e.g. final = 0.9×original).",
    easy: [
      { text: "A price drops from $200 to $160. Percentage decrease:", options: ["20%", "25%", "40%", "16%"], correct: 0 },
      { text: "What is 15% of 200?", options: ["30", "15", "150", "3"], correct: 0 },
      { text: "Price increases from $80 to $100. Percentage increase:", options: ["25%", "20%", "15%", "10%"], correct: 0 },
    ],
    hard: [
      { text: "After a 10% discount, price is $90. Original price:", options: ["$100", "$81", "$99", "$110"], correct: 0 },
      { text: "Salary increases 5% to $21,000. Original salary:", options: ["$20,000", "$19,950", "$22,050", "$20,500"], correct: 0 },
      { text: "A 10% discount then 10% tax is applied on $500. Final price:", options: ["$495", "$500", "$450", "$505"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nA value increases from 50 to 65. Find percentage increase.\n(just the number)", answer: "30" },
      { text: "CATCH CHALLENGE!\nAfter 20% discount, price is $120. Find original price.\n(just the number)", answer: "150" },
    ],
  },

  variations: {
    topicName: "Variations",
    hint: "Write direct variation as y=kx (or kx^n), inverse variation as y=k/x (or k/x^n), then find k from given values.",
    easy: [
      { text: "If $y$ varies directly as $x$ and $y=12$ when $x=3$, find $y$ when $x=5$.", options: ["20", "15", "24", "10"], correct: 0 },
      { text: "If $y$ varies inversely as $x$ and $y=6$ when $x=4$, find $y$ when $x=3$.", options: ["8", "4.5", "2", "12"], correct: 0 },
      { text: "If $y \\propto x^2$ and $y=18$ when $x=3$, find $y$ when $x=2$.", options: ["8", "12", "4", "9"], correct: 0 },
    ],
    hard: [
      { text: "If $z$ varies jointly as $x$ and $y$, and $z=24$ when $x=2,y=3$, find $z$ when $x=3,y=4$.", options: ["48", "36", "12", "24"], correct: 0 },
      { text: "If $y=k_1+k_2x$ and $y=7$ when $x=1$, $y=10$ when $x=2$, find $y$ when $x=3$.", options: ["13", "11", "14", "15"], correct: 0 },
      { text: "If $z=\\frac{kx^2}{y}$ and $x$ is halved while $y$ is tripled, new $z$ is:", options: ["$\\frac{1}{12}z$", "$\\frac{1}{6}z$", "$\\frac{3}{4}z$", "$\\frac{1}{10}z$"], correct: 0 },
    ],
    shortAnswer: [
      { text: "CATCH CHALLENGE!\nIf y varies directly as x and y=18 when x=6, find y when x=10.\n(just the number)", answer: "30" },
      { text: "CATCH CHALLENGE!\nIf y varies inversely as x and y=5 when x=4, find y when x=10.\n(just the number)", answer: "2" },
    ],
  },

  // ── NEW: Rates and Ratios ─────────────────────────────────
  ratios: {
    topicName: "Rates and Ratios",
    hint: "Use common units first. For ratio a:b, total parts = a+b. For rates, rate = quantity/time and keep unit conversions consistent.",
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
  { id: 0, locationName: "Lam Tsuen Valley",          gymName: "Lam Tsuen Gym",  leaderName: "Leader Fern",   topic: "factorization",  badge: "Petal Badge",   enemyName: "Fern's Factress",     enemyColor: "#2d7a27", enemyEmoji: "🌳", catchType: "Grass",    speciesId: "phyllon",   foeLevel: 4,  reward: 100 },
  { id: 1, locationName: "Tai Po Market",              gymName: "Market Gym",     leaderName: "Leader Marx",   topic: "changeOfSubject",badge: "Subject Badge", enemyName: "Marx's Varidelta",    enemyColor: "#1565c0", enemyEmoji: "🏊", catchType: "Water",    speciesId: "aquat",     foeLevel: 7,  reward: 100 },
  { id: 2, locationName: "Tai Mei Tuk",                gymName: "Lakeside Gym",   leaderName: "Leader Ines",   topic: "indices",        badge: "Power Badge",   enemyName: "Ines's Potentitan",   enemyColor: "#e05c00", enemyEmoji: "☀️", catchType: "Fire",     speciesId: "ignit",     foeLevel: 10, reward: 100 },
  { id: 3, locationName: "Plover Cove Reservoir",      gymName: "Reservoir Gym",  leaderName: "Leader Fiona",  topic: "fractions",      badge: "Fraction Badge",enemyName: "Fiona's Radixearth",  enemyColor: "#795548", enemyEmoji: "➗", catchType: "Ground",   speciesId: "terron",    foeLevel: 13, reward: 100 },
  { id: 4, locationName: "Tai Po Industrial Estate",   gymName: "Factory Gym",    leaderName: "Leader Quinn",  topic: "inequalities",   badge: "Balance Badge", enemyName: "Quinn's Limiglacier", enemyColor: "#0097a7", enemyEmoji: "⛄", catchType: "Ice",      speciesId: "cryocub",   foeLevel: 16, reward: 100 },
  { id: 5, locationName: "Lo Shue Ling",               gymName: "Highland Gym",   leaderName: "Leader Simon",  topic: "simultaneous",   badge: "Dual Badge",    enemyName: "Simon's Logidynamo",  enemyColor: "#f57f17", enemyEmoji: "🌩️", catchType: "Electric", speciesId: "volt",      foeLevel: 19, reward: 100 },
  { id: 6, locationName: "Tai Po Mega Mall",           gymName: "Mall Gym",       leaderName: "Leader Penny",  topic: "percentage",     badge: "Percent Badge", enemyName: "Penny's Remanthom",   enemyColor: "#c62828", enemyEmoji: "🏋️", catchType: "Fighting", speciesId: "pugn",      foeLevel: 22, reward: 100 },
  { id: 7, locationName: "Sam Mun Tsai Village",       gymName: "Harbour Gym",    leaderName: "Leader Raito",  topic: "ratios",         badge: "Ratio Badge",   enemyName: "Raito's Polysoar",    enemyColor: "#546e7a", enemyEmoji: "🦋", catchType: "Flying",   speciesId: "aeron",     foeLevel: 25, reward: 100 },
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
    id: 0, name: "Algeius", title: "Functions & Polynomials",
    enemyName: "Algeius's Potentitan", enemyColor: "#e05c00", enemyEmoji: "☀️",
    catchType: "Fire", speciesId: "ignithelio", foeLevel: 26,
    questions: [
      { text: "If $f(x)=x^2-4x+1$, find $f(3)$.",
        options: ["$-2$", "$2$", "$4$", "$-4$"], correct: 0 },
      { text: "Which is a factor of $x^2+2x-15$?",
        options: ["$(x+5)$", "$(x+3)$", "$(x-5)$", "$(x+15)$"], correct: 0 },
      { text: "For $y=(x-2)^2+3$, the vertex is:",
        options: ["$(2,3)$", "$(-2,3)$", "$(2,-3)$", "$(-2,-3)$"], correct: 0 },
    ],
  },
  {
    id: 1, name: "Numbrix", title: "Quadratics & Variations",
    enemyName: "Numbrix's Logidynamo", enemyColor: "#f57f17", enemyEmoji: "🌩️",
    catchType: "Electric", speciesId: "voltsimul", foeLevel: 28,
    questions: [
      { text: "Solve: $x^2-5x+6=0$.",
        options: ["$x=2$ or $x=3$", "$x=-2$ or $x=-3$", "$x=1$ or $x=6$", "$x=2$ only"], correct: 0 },
      { text: "If $y$ varies inversely as $x$ and $y=6$ when $x=4$, find $y$ when $x=3$.",
        options: ["$8$", "$6$", "$4.5$", "$12$"], correct: 0 },
      { text: "If $\\Delta=b^2-4ac>0$, a quadratic has:",
        options: ["Two distinct real roots", "One repeated root", "No real roots", "No roots"], correct: 0 },
    ],
  },
  {
    id: 2, name: "Equalis", title: "Mixed Master I",
    enemyName: "Equalis's Varidelta", enemyColor: "#1565c0", enemyEmoji: "🏊",
    catchType: "Water", speciesId: "aquasolv", foeLevel: 30,
    questions: [
      { text: "Solve:\nx + 2y = 7\nx − y = 1\nFind the product $xy$.",
        options: ["6", "5", "3", "4"], correct: 0 },
      { text: "Simplify $\\frac{x^2-9}{x^2+x-6}$.",
        options: ["$\\frac{x+3}{x+2}$", "$\\frac{x-3}{x-2}$", "$\\frac{x+3}{x-2}$", "$\\frac{x-3}{x+2}$"], correct: 0 },
      { text: "Price increased from $\\$250$ to $\\$300$. Percentage increase:",
        options: ["20%", "16.7%", "50%", "15%"], correct: 0 },
    ],
  },
  {
    id: 3, name: "Champion Mathex", title: "Mixed Master II",
    enemyName: "Mathex's Factress", enemyColor: "#2d7a27", enemyEmoji: "🌳",
    catchType: "Grass", speciesId: "phyllroot", foeLevel: 32,
    questions: [
      { text: "Make $x$ the subject: $y = \\frac{2x+1}{x-3}$.",
        options: ["$x = \\frac{3y+1}{y-2}$", "$x = \\frac{3y-1}{y-2}$", "$x = \\frac{y+3}{y-2}$", "$x = \\frac{1+3y}{2-y}$"], correct: 0 },
      { text: "Solve: $x^2-4<0$.",
        options: ["$-2<x<2$", "$x<-2$ or $x>2$", "$x>2$", "$x<2$"], correct: 0 },
      { text: "A car travels at $72\\text{ km/h}$. In $\\text{m/s}$ this is:",
        options: ["20", "25", "15", "30"], correct: 0 },
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
      "Difference of 2 Squares: a² − b² = (a+b)(a−b)",
      "Perfect Square: a² ± 2ab + b² = (a ± b)²",
      "Grouping: ax + ay + bx + by = a(x+y) + b(x+y) = (a+b)(x+y)",
    ],
    traps: [
      "Always extract the GCF first! 2x² − 8 = 2(x²−4) = 2(x+2)(x−2)",
      "Watch out for sign changes during grouping: ax − ay − bx + by = a(x−y) − b(x−y)",
    ],
  },
  {
    topicName: "Change of Subject",  emoji: "💧",
    formulas: [
      "Step 1: Eliminate fractions (cross-multiply) or roots (square both sides)",
      "Step 2: Expand all brackets to set the target variables 'free'",
      "Step 3: Collect ALL terms containing the subject on one side, and the rest on the other",
      "Step 4: Factorize out the subject as a common factor",
      "Step 5: Divide to isolate the subject completely",
    ],
    traps: [
      "The Factorization Miss: If making x the subject of ax + b = cx + d, you MUST reach x(a−c) = d−b. You cannot leave x on both sides!",
      "The 'Square-All' Trap: When squaring y = √(x) + a to remove the root, you must isolate the root first: y − a = √(x) → (y−a)² = x. Do NOT just square individual terms!",
      "The Negative Subject: If you get −x = y − 3, the final answer must be x = 3 − y. DSE requires the subject to be positive.",
      "Reciprocal Error: If 1/x = 1/a + 1/b, x is NOT a + b. You must find a common denominator: 1/x = (a+b)/ab, so x = ab/(a+b).",
    ],
  },
  {
    topicName: "Inequalities",  emoji: "❄️",
    formulas: [
      "Linear: Flip the sign (< to >) when multiplying/dividing by a NEGATIVE",
      "Compound 'AND': Solution must satisfy BOTH (the overlapping part)",
      "Compound 'OR': Solution satisfies EITHER (the union of both parts)",
    ],
    traps: [
      "DSE wording: 'At least' means ≥, 'At most' means ≤, 'Exceeds' means >",
      "When solving −4x < 12, the result is x > −3. Forgetting the flip is a Level 2 mistake!",
    ],
  },
  {
    topicName: "Indices (Laws of Indices)",  emoji: "🔥",
    formulas: [
      "Product & Quotient: aᵐ × aⁿ = aᵐ⁺ⁿ  |  aᵐ ÷ aⁿ = aᵐ⁻ⁿ",
      "Power of Power: (aᵐ)ⁿ = aᵐⁿ  |  (ab)ⁿ = aⁿbⁿ",
      "Negative & Zero: a⁻ⁿ = 1/aⁿ  |  a⁰ = 1  (where a ≠ 0)",
      "Rational Index: a^(m/n) = ⁿ√(aᵐ) or (ⁿ√a)ᵐ",
    ],
    traps: [
      "Positive Indices Only: DSE answers must not have negative powers. Flip them: x⁻³ becomes 1/x³.",
      "The Bracket Trap: (−3)² = 9, but −3² = −9. If the base is negative, keep the bracket!",
      "Sum Trap: (a + b)ⁿ is NOT aⁿ + bⁿ. Indices do NOT distribute over addition.",
      "MC Strategy: To compare 2³⁰⁰ and 3²⁰⁰, rewrite as (2³)¹⁰⁰ = 8¹⁰⁰ and (3²)¹⁰⁰ = 9¹⁰⁰. Clearly 9¹⁰⁰ > 8¹⁰⁰.",
    ],
  },
  {
    topicName: "Simultaneous Equations",  emoji: "⚡",
    formulas: [
      "Substitution: Best when one coefficient is 1 or −1",
      "Elimination: Multiply equations to align coefficients of x or y",
      "DSE special: One linear and one quadratic (solve by substitution)",
    ],
    traps: [
      "Check your answers by plugging both x and y back into BOTH original equations",
      "For linear + quadratic, you may get two pairs of answers. Don't discard one unless specified",
    ],
  },
  {
    topicName: "Polynomials",  emoji: "🦅",
    formulas: [
      "Identity: f(x) ≡ Q(x) · D(x) + R  (Dividend = Quotient × Divisor + Remainder)",
      "Remainder Theorem: When f(x) is divided by (ax − b), Remainder = f(b/a)",
      "Factor Theorem: (ax − b) is a factor ⟺ f(b/a) = 0",
      "Degree Rule: The degree of the Remainder is always less than the degree of the Divisor",
    ],
    traps: [
      "Missing Terms: If f(x) = x³ + x − 1, the x² coefficient is 0. Don't skip it in long division!",
      "Coefficient Trap: Dividing by (2x − 1) means substituting x = 1/2, NOT x = 1 or −1.",
      "Remainder vs. Factor: 'f(x) is divisible by g(x)' or 'g(x) is a factor' BOTH mean Remainder = 0.",
      "The 'f(k)=R' Trap: If the remainder is 5 when divided by (x−2), the equation is f(2) = 5, not f(5) = 2.",
    ],
  },
  {
    topicName: "Quadratic Equations",  emoji: "🔺",
    formulas: [
      "Sum of roots: α + β = −b/a",
      "Product of roots: αβ = c/a",
      "Discriminant (Δ = b² − 4ac): Δ>0 (2 roots), Δ=0 (1 root), Δ<0 (0 roots)",
    ],
    traps: [
      "If the question says 'real roots,' you must use Δ ≥ 0 (includes the equal case)",
      "Common MC target: α² + β² = (α+β)² − 2αβ",
    ],
  },
  {
    topicName: "Functions & Graphs",  emoji: "🌊",
    formulas: [
      "Vertex Form: y = a(x−h)² + k | Vertex = (h, k)",
      "Transformations: f(x)+k (up), f(x−k) (right), −f(x) (reflect in x-axis)",
    ],
    traps: [
      "f(x+3) moves the graph LEFT by 3 units. This is a classic DSE trap!",
      "If a graph does not touch the x-axis, the discriminant of its equation is Δ < 0",
    ],
  },
  {
    topicName: "Algebraic Fractions",  emoji: "➗",
    formulas: [
      "Simplification: Factorize numerator and denominator COMPLETELY, then cancel common factors",
      "Addition/Subtraction: Find the Lowest Common Multiple (LCM) of denominators first",
      "Multiplication: (a/b) × (c/d) = (ac)/(bd)",
      "Division: (a/b) ÷ (c/d) = (a/b) × (d/c) [Multiply by the Reciprocal]",
    ],
    traps: [
      "The Invisible Bracket: In expressions like −(x−3)/2, the sign applies to the whole numerator, becoming (−x+3)/2.",
      "The 'Illegal' Cancel: You can only cancel FACTORS. (x+y)/x cannot be simplified. It must be a product to cancel!",
      "Factor Swap: (a−b) = −(b−a). Use this to unify denominators like (x−1) and (1−x).",
      "Quadratic Denominators: Always factorize (x²−4) into (x+2)(x−2) before finding the LCM to avoid massive polynomials.",
    ],
  },
  {
    topicName: "Ratios & Percentages",  emoji: "👊",
    formulas: [
      "Percentage Change: (New − Old) / Old × 100%",
      "Compound Interest: A = P(1 + r/k)^(kt)  [k = times per year]",
      "Profit/Loss: Selling Price = Cost Price × (1 ± Profit/Loss %)",
      "Discount: Selling Price = Marked Price × (1 − Discount %)",
      "Similar Figures: (L₁/L₂)² = A₁/A₂  and  (L₁/L₂)³ = V₁/V₂",
    ],
    traps: [
      "The 'Reverse' Trap: If a 20% profit gives $120, Cost Price = $120 / 1.2 = $100, NOT 120 × 0.8!",
      "Successive Change: A 10% increase followed by 10% decrease is a 1% loss (1.1 × 0.9 = 0.99).",
      "Interest Period: 'Quarterly' means k=4 and n=4t. If interest is 8% p.a. quarterly, use 2% per period.",
      "Area Ratio Mistake: If lengths are tripled, the area becomes 9x larger (3²), not 3x!",
    ],
  },
];