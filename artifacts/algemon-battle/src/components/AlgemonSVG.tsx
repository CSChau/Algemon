// ══════════════════════════════════════════════════════════════
// ALGEMON SVG SPRITES — 24 species (8 types × 3 stages)
// Retro pixel-art aesthetic | viewBox 0 0 80 80 | center (40,40)
// ══════════════════════════════════════════════════════════════
import type { ReactElement } from "react";
import { AlgemonType, DOUBLE_STAR_SPECIES_ID } from "../data/gameData";

interface AlgemonSVGProps {
  type:       AlgemonType;
  stage:      0 | 1 | 2;
  /** When set (e.g. Double-Star legendary), renders that sprite instead of type/stage default. */
  speciesId?: string;
  size?:      number;
  isEnemy?:   boolean;
  fainted?:   boolean;
  animate?:   boolean;
  shiny?:     boolean;
}

// ── Math symbol aura orbit (Stage 2) ─────────────────────────
const MATH_SYMBOLS: Record<AlgemonType, [string, string, string]> = {
  Fire:     ["θ",  "△", "∞"],
  Water:    ["√",  "∫", "≡"],
  Grass:    ["×",  "ᵃ²","ᵇ²"],
  Ice:      ["≤",  "≥", "≠"],
  Flying:   ["xⁿ", "∝", "()"],
  Ground:   ["d",  "m", "∠"],
  Fighting: ["%",  "÷", "∶"],
  Electric: ["=",  "x", "y"],
  Legendary: ["5",  "★", "★"],
};

const AURA_COLORS: Record<AlgemonType, string> = {
  Fire:     "#ffee55", Water:    "#88eeff", Grass:    "#ccff66",
  Ice:      "#ddeeff", Flying:   "#ccaaff", Ground:   "#ffddaa",
  Fighting: "#ffaaaa", Electric: "#fff066", Legendary: "#ffd700",
};

function MathOrbit({ type }: { type: AlgemonType }) {
  const syms  = MATH_SYMBOLS[type];
  const color = AURA_COLORS[type];
  const r     = 34;
  const path  = `M ${r},0 A ${r},${r} 0 1,1 ${r},0.001`;
  return (
    <g transform="translate(40,40)">
      {syms.map((sym, i) => (
        <text
          key={i} fontSize="9" fontWeight="bold" fontFamily="monospace"
          textAnchor="middle" dominantBaseline="middle" fill={color}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        >
          {sym}
          <animateMotion dur={`${5 + i * 0.9}s`} repeatCount="indefinite"
            begin={`${-(i * (5 + i * 0.9) / 3).toFixed(2)}s`} path={path} />
        </text>
      ))}
    </g>
  );
}

// ── FIRE ──────────────────────────────────────────────────────
function Ignit() {
  return (
    <g>
      {/* Potentic — red panda base, binary-ring tail */}
      <ellipse cx="40" cy="49" rx="15" ry="14" fill="#c2471f"/>
      <ellipse cx="40" cy="42" rx="12" ry="10" fill="#d45a2d"/>
      <polygon points="30,34 34,24 38,34" fill="#f0c9a0"/>
      <polygon points="50,34 46,24 42,34" fill="#f0c9a0"/>
      <ellipse cx="40" cy="44" rx="8" ry="6" fill="#f3d8bc"/>
      <circle cx="35" cy="43" r="2.4" fill="#220000"/>
      <circle cx="45" cy="43" r="2.4" fill="#220000"/>
      <circle cx="36" cy="42" r="0.8" fill="#fff"/>
      <circle cx="46" cy="42" r="0.8" fill="#fff"/>
      <ellipse cx="40" cy="47" rx="2.4" ry="1.6" fill="#9b3d20"/>
      <path d="M 36,50 Q 40,53 44,50" stroke="#7a2812" strokeWidth="1.8" fill="none"/>
      {/* Fluffy tail with 0/1 rings */}
      <ellipse cx="56" cy="54" rx="9" ry="12" fill="#f28d5c" transform="rotate(28 56 54)"/>
      <ellipse cx="56" cy="48" rx="6.2" ry="1.8" fill="#f8d1b0" transform="rotate(28 56 48)"/>
      <ellipse cx="57" cy="53" rx="6.2" ry="1.8" fill="#f8d1b0" transform="rotate(28 57 53)"/>
      <ellipse cx="58" cy="58" rx="6.2" ry="1.8" fill="#f8d1b0" transform="rotate(28 58 58)"/>
      <text x="53" y="50" fontSize="4.8" fill="#7a2812" fontFamily="monospace" fontWeight="bold">0</text>
      <text x="56" y="56" fontSize="4.8" fill="#7a2812" fontFamily="monospace" fontWeight="bold">1</text>
      <rect x="31" y="60" width="7" height="6" rx="2" fill="#9b3d20"/>
      <rect x="42" y="60" width="7" height="6" rx="2" fill="#9b3d20"/>
    </g>
  );
}

function Ignitor() {
  return (
    <g>
      {/* Lava-rock shoulders */}
      <polygon points="10,40 24,32 24,56 12,58" fill="#663322"/>
      <polygon points="70,40 56,32 56,56 68,58" fill="#663322"/>
      <polygon points="12,58 24,52 22,64 10,66" fill="#442211"/>
      <polygon points="68,58 56,52 58,64 70,66" fill="#442211"/>
      {/* Body */}
      <ellipse cx="40" cy="50" rx="18" ry="16" fill="#ff6600"/>
      {/* Central flame */}
      <polygon points="40,8 56,34 24,34" fill="#ff4400"/>
      {/* Side flames */}
      <polygon points="26,20 36,34 18,34" fill="#ff5500"/>
      <polygon points="54,20 62,34 44,34" fill="#ff5500"/>
      <polygon points="40,12 52,30 28,30" fill="#ff7700"/>
      <polygon points="40,16 48,28 32,28" fill="#ffcc00"/>
      {/* Eyes */}
      <rect x="27" y="43" width="9" height="9" fill="#fff"/>
      <rect x="44" y="43" width="9" height="9" fill="#fff"/>
      <rect x="28" y="44" width="7" height="7" fill="#220000"/>
      <rect x="45" y="44" width="7" height="7" fill="#220000"/>
      <rect x="29" y="45" width="3" height="3" fill="#ff5500"/>
      <rect x="46" y="45" width="3" height="3" fill="#ff5500"/>
      {/* Mouth */}
      <rect x="31" y="57" width="18" height="4" fill="#aa2200"/>
      {/* Feet */}
      <rect x="26" y="63" width="12" height="5" fill="#884422"/>
      <rect x="42" y="63" width="12" height="5" fill="#884422"/>
    </g>
  );
}

function Ignithelio() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = i * 45 * (Math.PI / 180);
    const la = (i * 45 + 22.5) * (Math.PI / 180);
    const ra = (i * 45 - 22.5) * (Math.PI / 180);
    const tip  = [40 + Math.cos(a) * 38, 40 + Math.sin(a) * 38];
    const bas1 = [40 + Math.cos(la) * 18, 40 + Math.sin(la) * 18];
    const bas2 = [40 + Math.cos(ra) * 18, 40 + Math.sin(ra) * 18];
    return (
      <polygon key={i}
        points={`${tip[0].toFixed(1)},${tip[1].toFixed(1)} ${bas1[0].toFixed(1)},${bas1[1].toFixed(1)} ${bas2[0].toFixed(1)},${bas2[1].toFixed(1)}`}
        fill={i % 2 === 0 ? "#ffcc00" : "#ff8800"}
      />
    );
  });
  return (
    <g>
      {rays}
      <circle cx="40" cy="40" r="17" fill="#ff9900"/>
      <circle cx="40" cy="40" r="13" fill="#ffcc00"/>
      <circle cx="40" cy="40" r="9"  fill="#fff8c0"/>
      <rect x="29" y="34" width="8" height="9" fill="#fff"/>
      <rect x="43" y="34" width="8" height="9" fill="#fff"/>
      <rect x="30" y="35" width="6" height="7" fill="#ff4400"/>
      <rect x="44" y="35" width="6" height="7" fill="#ff4400"/>
      <rect x="31" y="36" width="3" height="3" fill="#ffcc00"/>
      <rect x="45" y="36" width="3" height="3" fill="#ffcc00"/>
      <polygon points="34,46 46,46 40,51" fill="#dd4400"/>
    </g>
  );
}

// ── WATER ─────────────────────────────────────────────────────
function Aquat() {
  return (
    <g>
      {/* Varidrop — sea otter with variable shell */}
      <ellipse cx="40" cy="50" rx="14" ry="16" fill="#7a5635"/>
      <ellipse cx="40" cy="44" rx="11" ry="9" fill="#8d6641"/>
      <circle cx="33" cy="43" r="2.4" fill="#1f1208"/>
      <circle cx="47" cy="43" r="2.4" fill="#1f1208"/>
      <circle cx="34" cy="42" r="0.8" fill="#fff"/>
      <circle cx="48" cy="42" r="0.8" fill="#fff"/>
      <ellipse cx="40" cy="47" rx="2.2" ry="1.4" fill="#2f1a0c"/>
      <path d="M 36,50 Q 40,53 44,50" stroke="#2f1a0c" strokeWidth="1.6" fill="none"/>
      <ellipse cx="28" cy="52" rx="5" ry="4" fill="#8d6641"/>
      <ellipse cx="52" cy="52" rx="5" ry="4" fill="#8d6641"/>
      {/* Variable shell changes color */}
      <ellipse cx="40" cy="56" rx="8" ry="6" fill="#5bc0eb">
        <animate attributeName="fill" values="#5bc0eb;#7ed957;#ffd166;#5bc0eb" dur="3.2s" repeatCount="indefinite" />
      </ellipse>
      <text x="36.3" y="58.4" fontSize="6.4" fill="#173b52" fontFamily="monospace" fontWeight="bold">x</text>
      <rect x="32" y="63" width="6" height="4" rx="2" fill="#5f4028"/>
      <rect x="42" y="63" width="6" height="4" rx="2" fill="#5f4028"/>
    </g>
  );
}

function Aquasub() {
  return (
    <g>
      {/* Fin arms */}
      <polygon points="16,38 28,36 26,54 14,52" fill="#004499"/>
      <polygon points="64,38 52,36 54,54 66,52" fill="#004499"/>
      {/* Body */}
      <ellipse cx="40" cy="46" rx="18" ry="18" fill="#1166cc"/>
      <polygon points="40,14 56,40 24,40" fill="#1166cc"/>
      <ellipse cx="40" cy="26" rx="14" ry="14" fill="#1166cc"/>
      {/* Shine */}
      <ellipse cx="34" cy="18" rx="5" ry="7" fill="#66ccff" opacity="0.6"/>
      {/* Tail fin */}
      <polygon points="29,62 40,56 51,62 40,70" fill="#004499"/>
      {/* Eyes */}
      <circle cx="32" cy="42" r="6" fill="#fff"/>
      <circle cx="48" cy="42" r="6" fill="#fff"/>
      <circle cx="32" cy="42" r="4" fill="#002244"/>
      <circle cx="48" cy="42" r="4" fill="#002244"/>
      <circle cx="31" cy="41" r="1.5" fill="#fff"/>
      <circle cx="47" cy="41" r="1.5" fill="#fff"/>
      {/* Mouth */}
      <polygon points="36,51 44,51 40,55" fill="#0044aa"/>
    </g>
  );
}

function Aquasolv() {
  return (
    <g>
      {/* Wide manta wings */}
      <polygon points="4,42 24,30 26,54 8,60" fill="#004499"/>
      <polygon points="76,42 56,30 54,54 72,60" fill="#004499"/>
      <polygon points="8,60 26,52 28,66 10,68" fill="#003388"/>
      <polygon points="72,60 54,52 52,66 70,68" fill="#003388"/>
      {/* Body */}
      <ellipse cx="40" cy="44" rx="20" ry="18" fill="#1166cc"/>
      {/* Crystal forehead */}
      <polygon points="40,16 46,28 34,28" fill="#88ddff"/>
      <polygon points="40,14 44,22 36,22" fill="#ccf0ff"/>
      {/* Shine */}
      <ellipse cx="33" cy="30" rx="6" ry="8" fill="#55bbff" opacity="0.5"/>
      {/* Tendrils */}
      <rect x="26" y="58" width="4" height="14" rx="2" fill="#0055bb" transform="rotate(-10 28 58)"/>
      <rect x="38" y="60" width="4" height="12" rx="2" fill="#0055bb"/>
      <rect x="50" y="58" width="4" height="14" rx="2" fill="#0055bb" transform="rotate(10 52 58)"/>
      {/* Eyes */}
      <circle cx="32" cy="40" r="7" fill="#fff"/>
      <circle cx="48" cy="40" r="7" fill="#fff"/>
      <circle cx="32" cy="40" r="5" fill="#001133"/>
      <circle cx="48" cy="40" r="5" fill="#001133"/>
      <circle cx="30" cy="38" r="2" fill="#fff"/>
      <circle cx="46" cy="38" r="2" fill="#fff"/>
    </g>
  );
}

// ── GRASS ─────────────────────────────────────────────────────
function Phyllon() {
  return (
    <g>
      {/* Factite — armadillo with geometric block armor */}
      <ellipse cx="40" cy="52" rx="15" ry="12" fill="#5f6b76"/>
      <ellipse cx="40" cy="50" rx="12" ry="9" fill="#7f8a94"/>
      <polygon points="30,45 36,41 42,45 36,49" fill="#9aa6b1"/>
      <polygon points="38,45 44,41 50,45 44,49" fill="#8f9ca8"/>
      <polygon points="34,50 40,46 46,50 40,54" fill="#a8b3bd"/>
      <ellipse cx="40" cy="58" rx="8" ry="5" fill="#b6a186"/>
      <circle cx="36" cy="56" r="1.8" fill="#20140c"/>
      <circle cx="44" cy="56" r="1.8" fill="#20140c"/>
      <path d="M 37,60 Q 40,62 43,60" stroke="#7c674e" strokeWidth="1.4" fill="none"/>
      <rect x="28" y="61" width="6" height="5" rx="2" fill="#5f6b76"/>
      <rect x="46" y="61" width="6" height="5" rx="2" fill="#5f6b76"/>
    </g>
  );
}

function Phyllfact() {
  return (
    <g>
      {/* Left leaf */}
      <ellipse cx="22" cy="32" rx="10" ry="6" fill="#55cc33" transform="rotate(-30 22 32)"/>
      {/* Right leaf */}
      <ellipse cx="58" cy="32" rx="10" ry="6" fill="#55cc33" transform="rotate(30 58 32)"/>
      {/* Top leaf */}
      <ellipse cx="40" cy="22" rx="9" ry="7" fill="#88ee44"/>
      <line x1="40" y1="28" x2="40" y2="18" stroke="#115511" strokeWidth="2"/>
      {/* Trunk */}
      <rect x="36" y="36" width="8" height="10" fill="#664422"/>
      {/* Body */}
      <circle cx="40" cy="50" r="18" fill="#22aa22"/>
      {/* Bark texture */}
      <rect x="38" y="42" width="4" height="8" fill="#1a8a1a" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="32" cy="47" r="5" fill="#fff"/>
      <circle cx="48" cy="47" r="5" fill="#fff"/>
      <circle cx="32" cy="47" r="3.5" fill="#001100"/>
      <circle cx="48" cy="47" r="3.5" fill="#001100"/>
      <circle cx="31" cy="46" r="1.5" fill="#fff"/>
      <circle cx="47" cy="46" r="1.5" fill="#fff"/>
      {/* Smile */}
      <path d="M 34,54 Q 40,59 46,54" stroke="#115511" strokeWidth="2.5" fill="none"/>
      {/* Roots */}
      <rect x="30" y="64" width="5" height="8" rx="2" fill="#664422" transform="rotate(-15 32 64)"/>
      <rect x="43" y="64" width="5" height="8" rx="2" fill="#664422" transform="rotate(15 45 64)"/>
    </g>
  );
}

function Phyllroot() {
  return (
    <g>
      {/* Root system */}
      <rect x="18" y="60" width="6" height="16" rx="3" fill="#553311" transform="rotate(-25 21 60)"/>
      <rect x="30" y="62" width="6" height="14" rx="3" fill="#553311" transform="rotate(-10 33 62)"/>
      <rect x="44" y="62" width="6" height="14" rx="3" fill="#553311" transform="rotate(10 47 62)"/>
      <rect x="56" y="60" width="6" height="16" rx="3" fill="#553311" transform="rotate(25 59 60)"/>
      {/* Canopy leaves */}
      <circle cx="40" cy="24" r="16" fill="#55cc33"/>
      <circle cx="26" cy="30" r="10" fill="#66dd44"/>
      <circle cx="54" cy="30" r="10" fill="#66dd44"/>
      <circle cx="40" cy="24" r="12" fill="#88ee44"/>
      {/* Flower on top */}
      {[0,60,120,180,240,300].map((a, i) => {
        const r2 = a * Math.PI / 180;
        return <circle key={i} cx={40 + Math.cos(r2) * 9} cy={14 + Math.sin(r2) * 9} r="4" fill={i%2===0?"#ffee44":"#ff8888"}/>;
      })}
      <circle cx="40" cy="14" r="4" fill="#ffdd00"/>
      {/* Body */}
      <circle cx="40" cy="48" r="18" fill="#22aa22"/>
      {/* Bark */}
      <rect x="36" y="34" width="8" height="20" fill="#553311" opacity="0.3"/>
      {/* Eyes */}
      <circle cx="31" cy="45" r="6" fill="#fff"/>
      <circle cx="49" cy="45" r="6" fill="#fff"/>
      <circle cx="31" cy="45" r="4" fill="#001100"/>
      <circle cx="49" cy="45" r="4" fill="#001100"/>
      <circle cx="29" cy="43" r="1.5" fill="#fff"/>
      <circle cx="47" cy="43" r="1.5" fill="#fff"/>
      {/* Wise expression */}
      <path d="M 33,53 Q 40,57 47,53" stroke="#115511" strokeWidth="2.5" fill="none"/>
    </g>
  );
}

// ── ICE ───────────────────────────────────────────────────────
function Cryocub() {
  return (
    <g>
      {/* Limitless — snowy owl with < and > talons */}
      <ellipse cx="40" cy="48" rx="14" ry="15" fill="#ecf3ff"/>
      <ellipse cx="40" cy="44" rx="11" ry="10" fill="#ffffff"/>
      <circle cx="34" cy="43" r="3.8" fill="#ffd54f"/>
      <circle cx="46" cy="43" r="3.8" fill="#ffd54f"/>
      <circle cx="34" cy="43" r="2.2" fill="#1b2430"/>
      <circle cx="46" cy="43" r="2.2" fill="#1b2430"/>
      <polygon points="40,47 36,52 44,52" fill="#f7b733"/>
      <path d="M 30,52 L24,56 L30,59" stroke="#d5e5ff" strokeWidth="3" fill="none"/>
      <path d="M 50,52 L56,56 L50,59" stroke="#d5e5ff" strokeWidth="3" fill="none"/>
      {/* inequality talons */}
      <text x="30" y="67" fontSize="8" fill="#9cc3ff" fontFamily="monospace" fontWeight="bold">&lt;</text>
      <text x="45" y="67" fontSize="8" fill="#9cc3ff" fontFamily="monospace" fontWeight="bold">&gt;</text>
    </g>
  );
}

function Cryoline() {
  return (
    <g>
      {/* Hexagonal body */}
      <polygon points="40,20 60,32 60,56 40,68 20,56 20,32" fill="#aaddff"/>
      <polygon points="40,24 56,34 56,54 40,64 24,54 24,34" fill="#cceeff"/>
      {/* Crystal facets */}
      <line x1="40" y1="24" x2="40" y2="64" stroke="#88bbdd" strokeWidth="1.5" opacity="0.5"/>
      <line x1="24" y1="34" x2="56" y2="54" stroke="#88bbdd" strokeWidth="1.5" opacity="0.5"/>
      <line x1="56" y1="34" x2="24" y2="54" stroke="#88bbdd" strokeWidth="1.5" opacity="0.5"/>
      {/* Ice spike top */}
      <polygon points="40,8 44,22 36,22" fill="#ddeeff"/>
      <polygon points="40,6 42,14 38,14" fill="#ffffff"/>
      {/* Eyes */}
      <rect x="28" y="38" width="9" height="9" fill="#4488cc"/>
      <rect x="43" y="38" width="9" height="9" fill="#4488cc"/>
      <rect x="30" y="40" width="5" height="5" fill="#aaddff"/>
      <rect x="45" y="40" width="5" height="5" fill="#aaddff"/>
      <rect x="31" y="41" width="2" height="2" fill="#fff"/>
      <rect x="46" y="41" width="2" height="2" fill="#fff"/>
      {/* Cold mouth */}
      <rect x="34" y="54" width="12" height="3" fill="#6699cc"/>
      <rect x="36" y="57" width="8" height="2" fill="#aaddff"/>
    </g>
  );
}

function Cryobound() {
  // 6-pointed snowflake body
  const arms = Array.from({ length: 6 }, (_, i) => {
    const a = i * 60 * (Math.PI / 180);
    const tx = 40 + Math.cos(a) * 32;
    const ty = 40 + Math.sin(a) * 32;
    const lx = 40 + Math.cos(a) * 18;
    const ly = 40 + Math.sin(a) * 18;
    const p1a = (i * 60 + 90) * (Math.PI / 180);
    const p1x = lx + Math.cos(p1a) * 5;
    const p1y = ly + Math.sin(p1a) * 5;
    const p2x = lx - Math.cos(p1a) * 5;
    const p2y = ly - Math.sin(p1a) * 5;
    return (
      <g key={i}>
        <polygon points={`${tx},${ty} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`} fill="#ddf4ff"/>
        <line x1="40" y1="40" x2={tx} y2={ty} stroke="#88ccff" strokeWidth="6" strokeLinecap="round"/>
        {/* Side crystals */}
        {[0.45, 0.7].map((t, j) => {
          const cx2 = 40 + Math.cos(a) * 32 * t;
          const cy2 = 40 + Math.sin(a) * 32 * t;
          const sa = (i * 60 + 90) * (Math.PI / 180);
          return (
            <g key={j}>
              <line x1={cx2 + Math.cos(sa) * 6} y1={cy2 + Math.sin(sa) * 6}
                    x2={cx2 - Math.cos(sa) * 6} y2={cy2 - Math.sin(sa) * 6}
                    stroke="#aaddff" strokeWidth="4" strokeLinecap="round"/>
            </g>
          );
        })}
      </g>
    );
  });
  return (
    <g>
      {arms}
      <circle cx="40" cy="40" r="16" fill="#aaddff"/>
      <circle cx="40" cy="40" r="11" fill="#cceeff"/>
      <circle cx="40" cy="40" r="7" fill="#eef8ff"/>
      {/* Eyes */}
      <rect x="30" y="36" width="8" height="9" fill="#4488cc"/>
      <rect x="42" y="36" width="8" height="9" fill="#4488cc"/>
      <rect x="32" y="38" width="4" height="5" fill="#aaddff"/>
      <rect x="44" y="38" width="4" height="5" fill="#aaddff"/>
      <rect x="33" y="39" width="2" height="2" fill="#fff"/>
      <rect x="45" y="39" width="2" height="2" fill="#fff"/>
      {/* Determined mouth */}
      <rect x="33" y="48" width="14" height="3" fill="#6699cc"/>
    </g>
  );
}

// ── FLYING ────────────────────────────────────────────────────
function Aeron() {
  return (
    <g>
      {/* Polylite — sugar glider, bracket membrane */}
      <ellipse cx="40" cy="50" rx="11" ry="12" fill="#b9a38f"/>
      <circle cx="40" cy="39" r="11" fill="#c6b19a"/>
      <path d="M 22,34 Q 16,50 22,64" stroke="#7e6b57" strokeWidth="4" fill="none"/>
      <path d="M 58,34 Q 64,50 58,64" stroke="#7e6b57" strokeWidth="4" fill="none"/>
      <path d="M 28,40 Q 22,52 28,60" stroke="#d7c7b7" strokeWidth="6" fill="none" opacity="0.9"/>
      <path d="M 52,40 Q 58,52 52,60" stroke="#d7c7b7" strokeWidth="6" fill="none" opacity="0.9"/>
      <circle cx="34" cy="38" r="4.8" fill="#fff"/>
      <circle cx="46" cy="38" r="4.8" fill="#fff"/>
      <circle cx="34" cy="38" r="3.1" fill="#1f1a17"/>
      <circle cx="46" cy="38" r="3.1" fill="#1f1a17"/>
      <ellipse cx="40" cy="43" rx="2.2" ry="1.7" fill="#3f332b"/>
      <path d="M 36,46 Q 40,49 44,46" stroke="#5f4c40" strokeWidth="1.6" fill="none"/>
      <ellipse cx="40" cy="65" rx="3" ry="5" fill="#8a7460"/>
    </g>
  );
}

function Aeropoly() {
  return (
    <g>
      {/* Large layered wings */}
      <polygon points="40,44 14,28 10,54 28,58" fill="#6644cc"/>
      <polygon points="40,44 66,28 70,54 52,58" fill="#6644cc"/>
      <polygon points="14,28 10,54 22,46" fill="#9977ff"/>
      <polygon points="66,28 70,54 58,46" fill="#9977ff"/>
      <polygon points="40,44 18,32 16,48 28,52" fill="#7755ee"/>
      <polygon points="40,44 62,32 64,48 52,52" fill="#7755ee"/>
      {/* Body */}
      <ellipse cx="40" cy="52" rx="14" ry="14" fill="#7755dd"/>
      {/* Head */}
      <circle cx="40" cy="36" r="13" fill="#7755dd"/>
      {/* Armored beak */}
      <polygon points="40,34 33,42 47,42" fill="#ffcc00"/>
      <polygon points="40,32 35,38 45,38" fill="#ffee88"/>
      {/* Eyes */}
      <circle cx="33" cy="31" r="6" fill="#fff"/>
      <circle cx="47" cy="31" r="6" fill="#fff"/>
      <circle cx="33" cy="31" r="4" fill="#220044"/>
      <circle cx="47" cy="31" r="4" fill="#220044"/>
      <circle cx="31" cy="29" r="1.5" fill="#fff"/>
      <circle cx="45" cy="29" r="1.5" fill="#fff"/>
      {/* Talons */}
      <polygon points="30,64 34,58 28,58" fill="#ffcc00"/>
      <polygon points="50,64 46,58 52,58" fill="#ffcc00"/>
      {/* Tail plume */}
      <polygon points="32,64 40,58 48,64 46,72 34,72" fill="#5533bb"/>
    </g>
  );
}

function Aeroremain() {
  return (
    <g>
      {/* Outer wing lobes */}
      <ellipse cx="15" cy="34" rx="14" ry="10" fill="#9977ff" transform="rotate(-20 15 34)"/>
      <ellipse cx="65" cy="34" rx="14" ry="10" fill="#9977ff" transform="rotate(20 65 34)"/>
      <ellipse cx="12" cy="54" rx="12" ry="8" fill="#7755ee" transform="rotate(20 12 54)"/>
      <ellipse cx="68" cy="54" rx="12" ry="8" fill="#7755ee" transform="rotate(-20 68 54)"/>
      {/* Wing pattern markings */}
      <circle cx="15" cy="34" r="5" fill="#ccaaff" opacity="0.7"/>
      <circle cx="65" cy="34" r="5" fill="#ccaaff" opacity="0.7"/>
      <circle cx="12" cy="54" r="4" fill="#aaccff" opacity="0.6"/>
      <circle cx="68" cy="54" r="4" fill="#aaccff" opacity="0.6"/>
      {/* Inner wings */}
      <polygon points="40,44 20,30 16,52 30,56" fill="#8866ff"/>
      <polygon points="40,44 60,30 64,52 50,56" fill="#8866ff"/>
      {/* Body */}
      <ellipse cx="40" cy="50" rx="13" ry="14" fill="#7755dd"/>
      {/* Head */}
      <circle cx="40" cy="34" r="12" fill="#7755dd"/>
      {/* Glowing antennae */}
      <line x1="35" y1="22" x2="28" y2="10" stroke="#ccaaff" strokeWidth="2"/>
      <line x1="45" y1="22" x2="52" y2="10" stroke="#ccaaff" strokeWidth="2"/>
      <circle cx="28" cy="10" r="4" fill="#eeddff"/>
      <circle cx="52" cy="10" r="4" fill="#eeddff"/>
      {/* Eyes */}
      <circle cx="33" cy="32" r="6" fill="#fff"/>
      <circle cx="47" cy="32" r="6" fill="#fff"/>
      <circle cx="33" cy="32" r="4" fill="#220044"/>
      <circle cx="47" cy="32" r="4" fill="#220044"/>
      <circle cx="31" cy="30" r="1.5" fill="#fff"/>
      <circle cx="45" cy="30" r="1.5" fill="#fff"/>
      {/* Elegant mouth */}
      <path d="M 35,40 Q 40,44 45,40" stroke="#5533bb" strokeWidth="2" fill="none"/>
    </g>
  );
}

// ── GROUND ────────────────────────────────────────────────────
function Terron() {
  return (
    <g>
      {/* Radixy — hedgehog with sqrt quills */}
      <ellipse cx="40" cy="52" rx="15" ry="12" fill="#8a6849"/>
      <ellipse cx="40" cy="55" rx="9" ry="7" fill="#c7a27e"/>
      <circle cx="36" cy="52" r="2.1" fill="#23170f"/>
      <circle cx="44" cy="52" r="2.1" fill="#23170f"/>
      <ellipse cx="40" cy="56" rx="1.8" ry="1.4" fill="#5f4028"/>
      {[24,30,36,42,48,54].map((x, i) => (
        <text key={i} x={x} y={36 + (i % 2) * 2} fontSize="6.5" fill="#5b4633" fontFamily="monospace">√</text>
      ))}
      <path d="M 36,59 Q 40,62 44,59" stroke="#6d4f37" strokeWidth="1.4" fill="none"/>
      <rect x="29" y="62" width="7" height="5" rx="2" fill="#7a5a3d"/>
      <rect x="44" y="62" width="7" height="5" rx="2" fill="#7a5a3d"/>
    </g>
  );
}

function Terragrid() {
  return (
    <g>
      {/* Large rocky armor shell */}
      <polygon points="20,24 32,14 40,22 48,14 60,24 52,36 40,32 28,36" fill="#553311"/>
      <polygon points="22,26 34,18 40,24 46,18 58,26 52,34 40,30 28,34" fill="#664422"/>
      {/* Grid lines on armor */}
      <line x1="34" y1="16" x2="46" y2="32" stroke="#442211" strokeWidth="1.5" opacity="0.6"/>
      <line x1="28" y1="24" x2="52" y2="24" stroke="#442211" strokeWidth="1.5" opacity="0.6"/>
      {/* Body */}
      <circle cx="40" cy="52" r="20" fill="#885533"/>
      <circle cx="40" cy="52" r="16" fill="#996644"/>
      {/* Grid markings on body */}
      <line x1="28" y1="44" x2="52" y2="44" stroke="#664422" strokeWidth="1.5" opacity="0.4"/>
      <line x1="28" y1="52" x2="52" y2="52" stroke="#664422" strokeWidth="1.5" opacity="0.4"/>
      <line x1="28" y1="60" x2="52" y2="60" stroke="#664422" strokeWidth="1.5" opacity="0.4"/>
      <line x1="34" y1="38" x2="34" y2="66" stroke="#664422" strokeWidth="1.5" opacity="0.4"/>
      <line x1="40" y1="36" x2="40" y2="68" stroke="#664422" strokeWidth="1.5" opacity="0.4"/>
      <line x1="46" y1="38" x2="46" y2="66" stroke="#664422" strokeWidth="1.5" opacity="0.4"/>
      {/* Snout */}
      <ellipse cx="40" cy="60" rx="9" ry="6" fill="#aa7755"/>
      <circle cx="37" cy="60" r="2.5" fill="#442211"/>
      <circle cx="43" cy="60" r="2.5" fill="#442211"/>
      {/* Eyes */}
      <circle cx="30" cy="46" r="6" fill="#fff"/>
      <circle cx="50" cy="46" r="6" fill="#fff"/>
      <circle cx="30" cy="46" r="4" fill="#220000"/>
      <circle cx="50" cy="46" r="4" fill="#220000"/>
      <circle cx="28" cy="44" r="1.5" fill="#fff"/>
      <circle cx="48" cy="44" r="1.5" fill="#fff"/>
      {/* Big claws */}
      <polygon points="18,66 26,58 28,70" fill="#553311"/>
      <polygon points="62,66 54,58 52,70" fill="#553311"/>
    </g>
  );
}

function Terrafract() {
  return (
    <g>
      {/* Heavy stone body */}
      <rect x="18" y="28" width="44" height="44" rx="6" fill="#885533"/>
      <rect x="22" y="32" width="36" height="36" rx="4" fill="#996644"/>
      {/* Coordinate axis engravings */}
      <line x1="40" y1="36" x2="40" y2="64" stroke="#553311" strokeWidth="2.5"/>
      <line x1="26" y1="50" x2="54" y2="50" stroke="#553311" strokeWidth="2.5"/>
      <polygon points="40,34 37,40 43,40" fill="#553311"/>
      <polygon points="56,50 50,47 50,53" fill="#553311"/>
      <text x="44" y="42" fontSize="7" fill="#ddaa66" fontFamily="monospace">x</text>
      <text x="34" y="42" fontSize="7" fill="#ddaa66" fontFamily="monospace">y</text>
      {/* Rock shoulder armor */}
      <polygon points="8,36 18,28 18,52 10,56" fill="#664422"/>
      <polygon points="72,36 62,28 62,52 70,56" fill="#664422"/>
      <polygon points="10,56 18,50 18,66 8,68" fill="#442211"/>
      <polygon points="70,56 62,50 62,66 72,68" fill="#442211"/>
      {/* Face */}
      <rect x="26" y="34" width="12" height="10" rx="2" fill="#fff"/>
      <rect x="42" y="34" width="12" height="10" rx="2" fill="#fff"/>
      <rect x="28" y="36" width="8" height="6" fill="#442211"/>
      <rect x="44" y="36" width="8" height="6" fill="#442211"/>
      <rect x="30" y="38" width="3" height="3" fill="#ddaa66"/>
      <rect x="46" y="38" width="3" height="3" fill="#ddaa66"/>
      {/* Determined mouth */}
      <rect x="28" y="56" width="24" height="4" rx="2" fill="#553311"/>
      {/* Stone fists */}
      <rect x="8" y="58" width="12" height="12" rx="3" fill="#885533"/>
      <rect x="60" y="58" width="12" height="12" rx="3" fill="#885533"/>
    </g>
  );
}

// ── FIGHTING ──────────────────────────────────────────────────
function Pugn() {
  return (
    <g>
      {/* Remanant — axolotl, dotted remainder gills */}
      <ellipse cx="40" cy="50" rx="15" ry="13" fill="#f08aa0"/>
      <ellipse cx="40" cy="44" rx="12" ry="10" fill="#f7a8ba"/>
      <circle cx="35" cy="44" r="2.5" fill="#3d2230"/>
      <circle cx="45" cy="44" r="2.5" fill="#3d2230"/>
      <circle cx="36" cy="43" r="0.8" fill="#fff"/>
      <circle cx="46" cy="43" r="0.8" fill="#fff"/>
      <path d="M 35,49 Q 40,53 45,49" stroke="#7a3d52" strokeWidth="1.7" fill="none"/>
      <circle cx="24" cy="41" r="2.1" fill="#ff9db4"/>
      <circle cx="20" cy="45" r="1.9" fill="#ff9db4"/>
      <circle cx="24" cy="49" r="2.1" fill="#ff9db4"/>
      <circle cx="56" cy="41" r="2.1" fill="#ff9db4"/>
      <circle cx="60" cy="45" r="1.9" fill="#ff9db4"/>
      <circle cx="56" cy="49" r="2.1" fill="#ff9db4"/>
      <rect x="30" y="61" width="7" height="5" rx="2" fill="#e37f96"/>
      <rect x="43" y="61" width="7" height="5" rx="2" fill="#e37f96"/>
    </g>
  );
}

function Pugnlogic() {
  return (
    <g>
      {/* Big fists */}
      <rect x="8" y="38" width="20" height="20" rx="6" fill="#cc3322"/>
      <rect x="10" y="40" width="16" height="16" rx="4" fill="#ee5544"/>
      <rect x="52" y="38" width="20" height="20" rx="6" fill="#cc3322"/>
      <rect x="54" y="40" width="16" height="16" rx="4" fill="#ee5544"/>
      {/* Knuckle lines */}
      {[11,15,19].map((x, i) => (
        <rect key={i} x={x} y="50" width="2.5" height="6" fill="#aa2211" rx="1"/>
      ))}
      {[55,59,63].map((x, i) => (
        <rect key={i} x={x} y="50" width="2.5" height="6" fill="#aa2211" rx="1"/>
      ))}
      {/* Body */}
      <circle cx="40" cy="48" r="20" fill="#cc3322"/>
      {/* Armor belt */}
      <rect x="22" y="54" width="36" height="8" fill="#884422"/>
      <rect x="24" y="56" width="32" height="4" fill="#aa6633"/>
      <rect x="36" y="54" width="8" height="8" fill="#ffcc22"/>
      {/* Headband */}
      <rect x="22" y="30" width="36" height="6" fill="#cc0000"/>
      <rect x="36" y="28" width="8" height="4" fill="#ff4444"/>
      {/* Eyes */}
      <rect x="28" y="38" width="10" height="10" fill="#fff"/>
      <rect x="42" y="38" width="10" height="10" fill="#fff"/>
      <rect x="29" y="39" width="8" height="8" fill="#220000"/>
      <rect x="43" y="39" width="8" height="8" fill="#220000"/>
      <rect x="31" y="41" width="3" height="3" fill="#ff4444"/>
      <rect x="45" y="41" width="3" height="3" fill="#ff4444"/>
      {/* Fierce mouth */}
      <rect x="30" y="54" width="6" height="3" fill="#881111"/>
      <rect x="44" y="54" width="6" height="3" fill="#881111"/>
      {/* Legs */}
      <rect x="28" y="64" width="12" height="8" rx="3" fill="#aa2211"/>
      <rect x="40" y="64" width="12" height="8" rx="3" fill="#aa2211"/>
    </g>
  );
}

function Pugnratio() {
  return (
    <g>
      {/* Massive armored body */}
      <rect x="14" y="26" width="52" height="46" rx="8" fill="#cc3322"/>
      <rect x="18" y="30" width="44" height="38" rx="6" fill="#dd4433"/>
      {/* Ratio belt buckle - center element */}
      <rect x="18" y="50" width="44" height="10" fill="#884422"/>
      <rect x="20" y="52" width="40" height="6" fill="#aa6633"/>
      <rect x="30" y="49" width="20" height="12" fill="#cc9944"/>
      <text x="40" y="57" fontSize="8" fill="#331100" textAnchor="middle" fontFamily="monospace" fontWeight="bold">3:2</text>
      {/* Shoulders / pauldrons */}
      <polygon points="6,28 18,22 18,44 8,48" fill="#aa2211"/>
      <polygon points="74,28 62,22 62,44 72,48" fill="#aa2211"/>
      {/* Massive fists */}
      <rect x="4" y="46" width="16" height="16" rx="5" fill="#bb3322"/>
      <rect x="60" y="46" width="16" height="16" rx="5" fill="#bb3322"/>
      {/* Knuckle marks on fists */}
      {[6,10,14].map((x, i) => <rect key={i} x={x} y="56" width="2.5" height="5" rx="1" fill="#881111"/>)}
      {[62,66,70].map((x, i) => <rect key={i} x={x} y="56" width="2.5" height="5" rx="1" fill="#881111"/>)}
      {/* Headband */}
      <rect x="16" y="28" width="48" height="8" fill="#cc0000"/>
      <rect x="36" y="26" width="8" height="6" fill="#ff4444"/>
      {/* Eyes */}
      <rect x="24" y="34" width="13" height="12" fill="#fff"/>
      <rect x="43" y="34" width="13" height="12" fill="#fff"/>
      <rect x="25" y="35" width="11" height="10" fill="#220000"/>
      <rect x="44" y="35" width="11" height="10" fill="#220000"/>
      <rect x="27" y="37" width="4" height="4" fill="#ff4444"/>
      <rect x="46" y="37" width="4" height="4" fill="#ff4444"/>
      {/* Warrior expression */}
      <rect x="28" y="48" width="24" height="3" fill="#881111"/>
      {/* Boots */}
      <rect x="24" y="70" width="14" height="8" rx="3" fill="#662211"/>
      <rect x="42" y="70" width="14" height="8" rx="3" fill="#662211"/>
    </g>
  );
}

// ── ELECTRIC ──────────────────────────────────────────────────
function Volt() {
  return (
    <g>
      {/* Logispark — fennec fox with logic-signal ears */}
      <ellipse cx="40" cy="51" rx="13" ry="12" fill="#e6b77f"/>
      <circle cx="40" cy="42" r="10" fill="#f0c690"/>
      <polygon points="28,37 23,19 36,33" fill="#f0c690"/>
      <polygon points="52,37 57,19 44,33" fill="#f0c690"/>
      <polygon points="29,35 26,24 34,32" fill="#ffdcae"/>
      <polygon points="51,35 54,24 46,32" fill="#ffdcae"/>
      <line x1="28" y1="22" x2="20" y2="16" stroke="#ffd54f" strokeWidth="1.5"/>
      <line x1="52" y1="22" x2="60" y2="16" stroke="#ffd54f" strokeWidth="1.5"/>
      <circle cx="20" cy="16" r="2" fill="#ffe680"/>
      <circle cx="60" cy="16" r="2" fill="#ffe680"/>
      <circle cx="35" cy="42" r="2.2" fill="#25160b"/>
      <circle cx="45" cy="42" r="2.2" fill="#25160b"/>
      <ellipse cx="40" cy="46" rx="2.2" ry="1.5" fill="#7a4d28"/>
      <path d="M 36,48.5 Q 40,51.5 44,48.5" stroke="#7a4d28" strokeWidth="1.5" fill="none"/>
      <polygon points="31,61 40,57 49,61 40,68" fill="#d9a86f"/>
      <text x="34.2" y="61.5" fontSize="5.5" fill="#84531d" fontFamily="monospace" fontWeight="bold">f(x)</text>
    </g>
  );
}

function Voltgraph() {
  return (
    <g>
      {/* 6 lightning bolts */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const a1 = deg * Math.PI / 180;
        const a2 = (deg + 30) * Math.PI / 180;
        const a3 = (deg - 30) * Math.PI / 180;
        const tip = [40 + Math.cos(a1) * 38, 40 + Math.sin(a1) * 38];
        const mid = [40 + Math.cos(a1) * 22, 40 + Math.sin(a1) * 22];
        const midL = [mid[0] + Math.cos(a2) * 6, mid[1] + Math.sin(a2) * 6];
        const midR = [mid[0] + Math.cos(a3) * 6, mid[1] + Math.sin(a3) * 6];
        const base = [40 + Math.cos(a1) * 18, 40 + Math.sin(a1) * 18];
        const baseL = [base[0] + Math.cos(a2) * 7, base[1] + Math.sin(a2) * 7];
        const baseR = [base[0] + Math.cos(a3) * 7, base[1] + Math.sin(a3) * 7];
        const pts = `${tip[0].toFixed(1)},${tip[1].toFixed(1)} ${midL[0].toFixed(1)},${midL[1].toFixed(1)} ${baseL[0].toFixed(1)},${baseL[1].toFixed(1)} ${baseR[0].toFixed(1)},${baseR[1].toFixed(1)} ${midR[0].toFixed(1)},${midR[1].toFixed(1)}`;
        return <polygon key={i} points={pts} fill={i % 2 === 0 ? "#ffcc00" : "#ffee55"}/>;
      })}
      {/* Body */}
      <circle cx="40" cy="40" r="18" fill="#ffdd00"/>
      <circle cx="40" cy="40" r="14" fill="#ffee55"/>
      {/* Circuit lines */}
      <line x1="30" y1="36" x2="50" y2="36" stroke="#cc8800" strokeWidth="1.5" opacity="0.6"/>
      <line x1="32" y1="40" x2="48" y2="40" stroke="#cc8800" strokeWidth="1.5" opacity="0.6"/>
      <line x1="30" y1="44" x2="50" y2="44" stroke="#cc8800" strokeWidth="1.5" opacity="0.6"/>
      <line x1="36" y1="30" x2="36" y2="50" stroke="#cc8800" strokeWidth="1.5" opacity="0.6"/>
      <line x1="40" y1="28" x2="40" y2="52" stroke="#cc8800" strokeWidth="1.5" opacity="0.6"/>
      <line x1="44" y1="30" x2="44" y2="50" stroke="#cc8800" strokeWidth="1.5" opacity="0.6"/>
      {/* Spark eyes */}
      <polygon points="29,34 34,40 29,46 26,40" fill="#1a1a00"/>
      <polygon points="51,34 46,40 51,46 54,40" fill="#1a1a00"/>
      <polygon points="30,38 32,40 30,42 29,40" fill="#ffffaa"/>
      <polygon points="50,38 48,40 50,42 51,40" fill="#ffffaa"/>
      {/* Wide grin */}
      <path d="M 32,48 Q 40,55 48,48" stroke="#cc8800" strokeWidth="2.5" fill="none"/>
    </g>
  );
}

function Voltsimul() {
  return (
    <g>
      {/* Electric rings */}
      <circle cx="40" cy="40" r="38" fill="none" stroke="#ffcc00" strokeWidth="2" opacity="0.4"/>
      <circle cx="40" cy="40" r="30" fill="none" stroke="#ffdd00" strokeWidth="2.5" opacity="0.5"/>
      {/* Crown of bolts */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => {
        const a = deg * Math.PI / 180;
        const tipX = 40 + Math.cos(a) * 36;
        const tipY = 40 + Math.sin(a) * 36;
        const b1a = (deg + 18) * Math.PI / 180;
        const b2a = (deg - 18) * Math.PI / 180;
        const b1X = 40 + Math.cos(b1a) * 22;
        const b1Y = 40 + Math.sin(b1a) * 22;
        const b2X = 40 + Math.cos(b2a) * 22;
        const b2Y = 40 + Math.sin(b2a) * 22;
        return <polygon key={i} points={`${tipX.toFixed(1)},${tipY.toFixed(1)} ${b1X.toFixed(1)},${b1Y.toFixed(1)} ${b2X.toFixed(1)},${b2Y.toFixed(1)}`} fill={i % 2 === 0 ? "#ffcc00" : "#ffee88"}/>;
      })}
      {/* Body core */}
      <circle cx="40" cy="40" r="20" fill="#ffdd00"/>
      <circle cx="40" cy="40" r="16" fill="#ffee55"/>
      <circle cx="40" cy="40" r="10" fill="#ffffff" opacity="0.6"/>
      {/* Intense spark eyes */}
      <polygon points="27,33 34,40 27,47 23,40" fill="#1a1a00"/>
      <polygon points="53,33 46,40 53,47 57,40" fill="#1a1a00"/>
      <polygon points="28,38 31,40 28,42 26,40" fill="#ffff88"/>
      <polygon points="52,38 49,40 52,42 54,40" fill="#ffff88"/>
      {/* Power expression */}
      <rect x="32" y="46" width="16" height="4" rx="2" fill="#cc8800"/>
      <rect x="34" y="46" width="12" height="4" rx="2" fill="#ffcc44"/>
    </g>
  );
}

// ── Double-Star (hidden legendary): glowing gold 5 ★★ ─────────
function DoubleStarLegend() {
  return (
    <g>
      <g>
        <animateTransform
          attributeName="transform" type="translate" additive="sum"
          values="0,0; 0,-1.5; 0,0" dur="2.5s" repeatCount="indefinite"
        />
        <circle cx="40" cy="40" r="32" fill="none" stroke="#ffd54f" strokeWidth="1.5" opacity="0.45">
          <animate attributeName="opacity" values="0.35;0.7;0.35" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" r="24" fill="#3d2e0a" opacity="0.25" />
        <text
          x="22" y="54" fontSize="42" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif"
          fill="#ffe082" stroke="#b8860b" strokeWidth="0.6"
          style={{ filter: "drop-shadow(0 0 8px #ffd700) drop-shadow(0 0 14px #ffab00)" }}
        >
          5
        </text>
        <text
          x="50" y="38" fontSize="16" fontWeight="bold" fill="#fff9c4"
          style={{ filter: "drop-shadow(0 0 6px #ffd700)" }}
        >
          ★
        </text>
        <text
          x="62" y="38" fontSize="16" fontWeight="bold" fill="#fff9c4"
          style={{ filter: "drop-shadow(0 0 6px #ffd700)" }}
        >
          ★
        </text>
      </g>
    </g>
  );
}

// ── Sprite lookup ──────────────────────────────────────────────
const SPRITES: Record<string, () => ReactElement> = {
  [DOUBLE_STAR_SPECIES_ID]: DoubleStarLegend,
  ignit: Ignit, ignitor: Ignitor, ignithelio: Ignithelio,
  aquat: Aquat, aquasub: Aquasub, aquasolv: Aquasolv,
  phyllon: Phyllon, phyllfact: Phyllfact, phyllroot: Phyllroot,
  cryocub: Cryocub, cryoline: Cryoline, cryobound: Cryobound,
  aeron: Aeron, aeropoly: Aeropoly, aeroremain: Aeroremain,
  terron: Terron, terragrid: Terragrid, terrafract: Terrafract,
  pugn: Pugn, pugnlogic: Pugnlogic, pugnratio: Pugnratio,
  volt: Volt, voltgraph: Voltgraph, voltsimul: Voltsimul,
};

// Fallback sprite (used for unknown enemy speciesIds)
function FallbackSprite({ type }: { type: AlgemonType }) {
  const BODY: Record<AlgemonType, string> = {
    Fire: "#ff6600", Water: "#1166cc", Grass: "#22aa22", Ice: "#aaddff",
    Flying: "#6644cc", Ground: "#885533", Fighting: "#cc3322", Electric: "#ffdd00",
    Legendary: "#d4af37",
  };
  const col = BODY[type] ?? "#888";
  return (
    <g>
      <circle cx="40" cy="44" r="18" fill={col}/>
      <rect x="30" y="38" width="7" height="8" fill="#fff"/>
      <rect x="43" y="38" width="7" height="8" fill="#fff"/>
      <rect x="32" y="40" width="3" height="4" fill="#222"/>
      <rect x="45" y="40" width="3" height="4" fill="#222"/>
      <rect x="33" y="52" width="14" height="3" fill="rgba(0,0,0,0.3)"/>
    </g>
  );
}

// ── Main export ───────────────────────────────────────────────
export function AlgemonSVG({ type, stage, speciesId: speciesOverride, size = 80, isEnemy = false, fainted = false, animate = true, shiny = false }: AlgemonSVGProps) {
  const fallbackKey = `${type.toLowerCase()}${stage === 0 ? "" : stage === 1 ? "sub" : "final"}`;
  const STAGE_IDS: Record<AlgemonType, [string, string, string]> = {
    Fire:     ["ignit",    "ignitor",   "ignithelio"],
    Water:    ["aquat",    "aquasub",   "aquasolv"],
    Grass:    ["phyllon",  "phyllfact", "phyllroot"],
    Ice:      ["cryocub",  "cryoline",  "cryobound"],
    Flying:   ["aeron",    "aeropoly",  "aeroremain"],
    Ground:   ["terron",   "terragrid", "terrafract"],
    Fighting: ["pugn",     "pugnlogic", "pugnratio"],
    Electric: ["volt",     "voltgraph", "voltsimul"],
    Legendary: [DOUBLE_STAR_SPECIES_ID, DOUBLE_STAR_SPECIES_ID, DOUBLE_STAR_SPECIES_ID],
  };

  const sid =
    speciesOverride === DOUBLE_STAR_SPECIES_ID || type === "Legendary"
      ? DOUBLE_STAR_SPECIES_ID
      : (STAGE_IDS[type]?.[stage] ?? fallbackKey);
  const SpriteFn = SPRITES[sid];

  const bobClass  = !animate ? "" : (isEnemy ? "sprite-bob-enemy" : "sprite-bob");
  const transform = isEnemy && sid !== DOUBLE_STAR_SPECIES_ID ? "scale(-1,1) translate(-80,0)" : undefined;
  const showOrbit = stage === 2 && animate && sid !== DOUBLE_STAR_SPECIES_ID;

  const shinyFilter = shiny ? { filter: "hue-rotate(145deg) saturate(1.35) brightness(1.15)" } as const : undefined;
  /** Mirror sparkles in viewBox when the sprite is enemy-flipped (sparkles must not share `scale(-1,1) translate(-80,0)` or they leave the viewBox). */
  const sparkleMirror = isEnemy && sid !== DOUBLE_STAR_SPECIES_ID ? "matrix(-1 0 0 1 80 0)" : undefined;

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={bobClass}
      style={{
        opacity:         fainted ? 0.15 : 1,
        transition:      "opacity 0.5s",
        imageRendering:  "pixelated",
        overflow:        "visible",
        display:         "block",
        flexShrink:      0,
      }}
    >
      <g style={shinyFilter}>
        <g transform={transform}>
          {SpriteFn ? <SpriteFn /> : <FallbackSprite type={type} />}
          {showOrbit && <MathOrbit type={type} />}
        </g>
        {shiny && (
          <g transform={sparkleMirror}>
            <text x="10" y="12" fontSize="8" fill="#fff59d">✦</text>
            <text x="63" y="14" fontSize="7" fill="#fff9c4">✧</text>
            <text x="68" y="70" fontSize="8" fill="#fff59d">✦</text>
          </g>
        )}
      </g>
    </svg>
  );
}
