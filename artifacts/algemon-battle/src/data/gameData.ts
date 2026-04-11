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
export const CATCH_HP_PCT          = 0.30; // legacy soft threshold for log hints
export const CATCH_MODIFIER        = 0.85; // max catch probability at 0% foe HP
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
      { text: "If $q = \\frac{3p+2}{p-1}$, make $p$ the subject.", options: ["$p = \\frac{q+2}{q-3}$","$p = \\frac{q-2}{q+3}$","$p = \\frac{q+3}{q-2}$","$p = \\frac{3q+2}{q-1}$"], correct: 0, hint: "Cross-multiply: $q(p-1) = 3p+2$. Expand: $qp-q = 3p+2$. Group $p$ terms: $(q-3)p = q+2$." },
    ],
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
    ],
    sa: [],
  },
  coordinates: {
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
  Fire:     { stages: [{ name: "Ignit",       emoji: "🔥", level: 1,  defenseBonus: 0    }, { name: "Ignitor",     emoji: "🌋", level: 11, defenseBonus: 0.10 }, { name: "Ignithelio",  emoji: "☀️", level: 21, defenseBonus: 0.20 }] },
  Water:    { stages: [{ name: "Aquat",       emoji: "💧", level: 1,  defenseBonus: 0    }, { name: "Aquasub",     emoji: "🌊", level: 11, defenseBonus: 0.10 }, { name: "Aquasolv",    emoji: "🏊", level: 21, defenseBonus: 0.20 }] },
  Grass:    { stages: [{ name: "Phyllon",     emoji: "🌿", level: 1,  defenseBonus: 0    }, { name: "Phyllfact",   emoji: "🌲", level: 11, defenseBonus: 0.10 }, { name: "Phyllroot",   emoji: "🌳", level: 21, defenseBonus: 0.20 }] },
  Ice:      { stages: [{ name: "Cryocub",     emoji: "❄️", level: 1,  defenseBonus: 0    }, { name: "Cryoline",    emoji: "🧊", level: 11, defenseBonus: 0.10 }, { name: "Cryobound",   emoji: "⛄", level: 21, defenseBonus: 0.20 }] },
  Flying:   { stages: [{ name: "Aeron",       emoji: "🦅", level: 1,  defenseBonus: 0    }, { name: "Aeropoly",    emoji: "🦉", level: 11, defenseBonus: 0.10 }, { name: "Aeroremain",  emoji: "🦋", level: 21, defenseBonus: 0.20 }] },
  Ground:   { stages: [{ name: "Terron",      emoji: "🪨", level: 1,  defenseBonus: 0    }, { name: "Terragrid",   emoji: "🧮", level: 11, defenseBonus: 0.10 }, { name: "Terrafract",  emoji: "➗", level: 21, defenseBonus: 0.20 }] },
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
  { id: "terragrid",   name: "Terragrid",   emoji: "🧮", topic: "Algebraic Fractions", type: "Ground",   stage: 1 },
  { id: "terrafract",  name: "Terrafract",  emoji: "➗", topic: "Algebraic Fractions", type: "Ground",   stage: 2 },
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

  // ── Algebraic Fractions ───────────────────────────────────────
  coordinates: {
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
  { id: 7, locationName: "Sam Mun Tsai Village",       gymName: "Harbour Gym",    leaderName: "Leader Fiona",  topic: "functions",      badge: "Curve Badge",   enemyName: "Fiona's Terrafract",  enemyColor: "#795548", enemyEmoji: "➗", catchType: "Ground",   speciesId: "terron",    foeLevel: 20, reward: 100 },
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
    topicName: "Algebraic Fractions",  emoji: "➗",
    formulas: [
      "Simplify: factorise first, then cancel common factors",
      "Add/Subtract: find the LCD, convert, then combine numerators",
      "Multiply: multiply tops × tops, bottoms × bottoms",
      "Divide: flip the divisor, then multiply",
    ],
    traps: [
      "Cannot cancel terms that are ADDED — only cancel FACTORS: (x+2)/(x+2) ✓ but (x+2)/x ✗",
      "When dividing by a fraction, flip it first: a/b ÷ c/d = (a/b)×(d/c)",
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
