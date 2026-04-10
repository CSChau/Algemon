// ══════════════════════════════════════════════════════════════
// ALGEMON SVG SPRITES — 24 species (8 types × 3 stages)
// Retro pixel-art aesthetic | viewBox 0 0 80 80 | center (40,40)
// ══════════════════════════════════════════════════════════════
import { AlgemonType } from "../data/gameData";

interface AlgemonSVGProps {
  type:     AlgemonType;
  stage:    0 | 1 | 2;
  size?:    number;
  isEnemy?: boolean;
  fainted?: boolean;
  animate?: boolean;
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
};

const AURA_COLORS: Record<AlgemonType, string> = {
  Fire:     "#ffee55", Water:    "#88eeff", Grass:    "#ccff66",
  Ice:      "#ddeeff", Flying:   "#ccaaff", Ground:   "#ffddaa",
  Fighting: "#ffaaaa", Electric: "#fff066",
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
      <ellipse cx="40" cy="51" rx="13" ry="12" fill="#ff6600"/>
      <polygon points="40,13 53,38 27,38" fill="#ff4400"/>
      <polygon points="40,17 50,34 30,34" fill="#ff7700"/>
      <polygon points="40,21 46,32 34,32" fill="#ffcc00"/>
      <rect x="30" y="45" width="6" height="6" fill="#fff"/>
      <rect x="44" y="45" width="6" height="6" fill="#fff"/>
      <rect x="31" y="46" width="4" height="4" fill="#220000"/>
      <rect x="45" y="46" width="4" height="4" fill="#220000"/>
      <rect x="31" y="46" width="2" height="2" fill="#ff3300"/>
      <rect x="45" y="46" width="2" height="2" fill="#ff3300"/>
      <rect x="33" y="57" width="14" height="3" fill="#cc3300"/>
      <rect x="30" y="61" width="8" height="4" fill="#cc4400"/>
      <rect x="42" y="61" width="8" height="4" fill="#cc4400"/>
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
      {/* Teardrop body */}
      <ellipse cx="40" cy="50" rx="13" ry="14" fill="#1166cc"/>
      <polygon points="40,18 53,44 27,44" fill="#1166cc"/>
      <ellipse cx="40" cy="30" rx="10" ry="12" fill="#1166cc"/>
      {/* Shine */}
      <ellipse cx="35" cy="24" rx="4" ry="5" fill="#44aaff" opacity="0.7"/>
      {/* Eyes */}
      <circle cx="34" cy="44" r="5" fill="#fff"/>
      <circle cx="46" cy="44" r="5" fill="#fff"/>
      <circle cx="34" cy="44" r="3" fill="#002244"/>
      <circle cx="46" cy="44" r="3" fill="#002244"/>
      <circle cx="33" cy="43" r="1" fill="#fff"/>
      <circle cx="45" cy="43" r="1" fill="#fff"/>
      {/* Mouth */}
      <rect x="35" y="54" width="10" height="2" fill="#003388" rx="1"/>
      {/* Base */}
      <ellipse cx="40" cy="63" rx="11" ry="4" fill="#0055bb"/>
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
      {/* Body */}
      <circle cx="40" cy="50" r="14" fill="#22aa22"/>
      {/* Single leaf */}
      <ellipse cx="40" cy="30" rx="10" ry="7" fill="#55cc33" transform="rotate(-15 40 30)"/>
      <ellipse cx="40" cy="30" rx="10" ry="7" fill="#88ee44" transform="rotate(-15 40 30)" opacity="0.5"/>
      <line x1="40" y1="36" x2="40" y2="28" stroke="#115511" strokeWidth="2"/>
      {/* Stem */}
      <rect x="38" y="35" width="4" height="6" fill="#664422"/>
      {/* Eyes */}
      <circle cx="34" cy="48" r="4" fill="#fff"/>
      <circle cx="46" cy="48" r="4" fill="#fff"/>
      <circle cx="34" cy="48" r="2.5" fill="#001100"/>
      <circle cx="46" cy="48" r="2.5" fill="#001100"/>
      <circle cx="33" cy="47" r="1" fill="#fff"/>
      <circle cx="45" cy="47" r="1" fill="#fff"/>
      {/* Happy mouth */}
      <path d="M 35,54 Q 40,58 45,54" stroke="#115511" strokeWidth="2" fill="none"/>
      {/* Base */}
      <ellipse cx="40" cy="63" rx="10" ry="3" fill="#1a8a1a"/>
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
      {/* Icy cube body */}
      <rect x="26" y="34" width="28" height="28" rx="4" fill="#aaddff"/>
      <rect x="28" y="36" width="24" height="24" rx="3" fill="#cceeff"/>
      {/* Ice facet highlights */}
      <polygon points="28,36 42,36 28,50" fill="#ddf4ff" opacity="0.7"/>
      {/* Eyes */}
      <rect x="30" y="40" width="7" height="7" fill="#4488cc"/>
      <rect x="43" y="40" width="7" height="7" fill="#4488cc"/>
      <rect x="32" y="42" width="3" height="3" fill="#fff"/>
      <rect x="45" y="42" width="3" height="3" fill="#fff"/>
      {/* Snowflake on forehead */}
      <rect x="38" y="36" width="4" height="10" fill="#88ccff" opacity="0.8"/>
      <rect x="34" y="40" width="12" height="3" fill="#88ccff" opacity="0.8"/>
      {/* Mouth (tiny) */}
      <rect x="35" y="55" width="10" height="2" fill="#6699cc"/>
      {/* Bottom */}
      <ellipse cx="40" cy="63" rx="13" ry="3" fill="#88bbdd"/>
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
      {/* Wings */}
      <polygon points="40,42 22,32 18,50 32,52" fill="#6644cc"/>
      <polygon points="40,42 58,32 62,50 48,52" fill="#6644cc"/>
      <polygon points="22,32 18,50 28,44" fill="#8866ee"/>
      <polygon points="58,32 62,50 52,44" fill="#8866ee"/>
      {/* Body */}
      <ellipse cx="40" cy="50" rx="11" ry="13" fill="#7755dd"/>
      {/* Head */}
      <circle cx="40" cy="38" r="10" fill="#7755dd"/>
      {/* Beak */}
      <polygon points="40,36 35,41 45,41" fill="#ffcc00"/>
      {/* Eyes */}
      <circle cx="35" cy="35" r="4" fill="#fff"/>
      <circle cx="45" cy="35" r="4" fill="#fff"/>
      <circle cx="35" cy="35" r="2.5" fill="#220044"/>
      <circle cx="45" cy="35" r="2.5" fill="#220044"/>
      <circle cx="34" cy="34" r="1" fill="#fff"/>
      <circle cx="44" cy="34" r="1" fill="#fff"/>
      {/* Tail */}
      <polygon points="34,62 40,56 46,62 40,70" fill="#5533bb"/>
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
      {/* Rocky shell pieces on top */}
      <polygon points="28,26 36,34 22,36" fill="#553311"/>
      <polygon points="40,22 48,34 32,34" fill="#664422"/>
      <polygon points="52,26 58,36 44,36" fill="#553311"/>
      {/* Body */}
      <circle cx="40" cy="52" r="16" fill="#885533"/>
      <circle cx="40" cy="52" r="13" fill="#996644"/>
      {/* Snout */}
      <ellipse cx="40" cy="60" rx="7" ry="5" fill="#aa7755"/>
      <circle cx="38" cy="60" r="2" fill="#442211"/>
      <circle cx="42" cy="60" r="2" fill="#442211"/>
      {/* Eyes */}
      <circle cx="31" cy="48" r="5" fill="#fff"/>
      <circle cx="49" cy="48" r="5" fill="#fff"/>
      <circle cx="31" cy="48" r="3" fill="#220000"/>
      <circle cx="49" cy="48" r="3" fill="#220000"/>
      <circle cx="30" cy="47" r="1" fill="#fff"/>
      <circle cx="48" cy="47" r="1" fill="#fff"/>
      {/* Paws */}
      <rect x="24" y="62" width="10" height="6" rx="3" fill="#774433"/>
      <rect x="46" y="62" width="10" height="6" rx="3" fill="#774433"/>
      {/* Claws */}
      <rect x="25" y="66" width="3" height="4" rx="1" fill="#553311"/>
      <rect x="29" y="67" width="3" height="4" rx="1" fill="#553311"/>
      <rect x="47" y="66" width="3" height="4" rx="1" fill="#553311"/>
      <rect x="51" y="67" width="3" height="4" rx="1" fill="#553311"/>
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

function Terracoord() {
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
      {/* Body */}
      <circle cx="40" cy="48" r="15" fill="#cc3322"/>
      {/* Fists */}
      <rect x="16" y="42" width="14" height="14" rx="5" fill="#cc3322"/>
      <rect x="18" y="44" width="10" height="10" rx="3" fill="#ee5544"/>
      <rect x="50" y="42" width="14" height="14" rx="5" fill="#cc3322"/>
      <rect x="52" y="44" width="10" height="10" rx="3" fill="#ee5544"/>
      {/* Knuckle lines */}
      <rect x="19" y="50" width="2" height="4" fill="#aa2211" rx="1"/>
      <rect x="22" y="50" width="2" height="4" fill="#aa2211" rx="1"/>
      <rect x="25" y="50" width="2" height="4" fill="#aa2211" rx="1"/>
      <rect x="53" y="50" width="2" height="4" fill="#aa2211" rx="1"/>
      <rect x="56" y="50" width="2" height="4" fill="#aa2211" rx="1"/>
      <rect x="59" y="50" width="2" height="4" fill="#aa2211" rx="1"/>
      {/* Eyes */}
      <rect x="31" y="42" width="7" height="8" fill="#fff"/>
      <rect x="42" y="42" width="7" height="8" fill="#fff"/>
      <rect x="32" y="43" width="5" height="6" fill="#220000"/>
      <rect x="43" y="43" width="5" height="6" fill="#220000"/>
      <rect x="33" y="44" width="2" height="2" fill="#ff5544"/>
      <rect x="44" y="44" width="2" height="2" fill="#ff5544"/>
      {/* Determined mouth */}
      <rect x="33" y="56" width="14" height="3" fill="#881111"/>
      {/* Legs */}
      <rect x="30" y="62" width="9" height="7" rx="2" fill="#aa2211"/>
      <rect x="41" y="62" width="9" height="7" rx="2" fill="#aa2211"/>
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
      {/* Lightning bolts - 4 directions */}
      {/* North */}
      <polygon points="40,12 36,24 40,22 36,36 44,36 40,22 44,24" fill="#ffcc00"/>
      {/* South */}
      <polygon points="40,68 36,56 40,58 36,44 44,44 40,58 44,56" fill="#ffcc00"/>
      {/* West */}
      <polygon points="12,40 24,36 22,40 36,36 36,44 22,40 24,44" fill="#ffcc00"/>
      {/* East */}
      <polygon points="68,40 56,36 58,40 44,36 44,44 58,40 56,44" fill="#ffcc00"/>
      {/* Body */}
      <circle cx="40" cy="40" r="16" fill="#ffdd00"/>
      <circle cx="40" cy="40" r="12" fill="#ffee55"/>
      {/* Spark eyes */}
      <polygon points="31,36 35,40 31,44 29,40" fill="#1a1a00"/>
      <polygon points="49,36 45,40 49,44 51,40" fill="#1a1a00"/>
      <polygon points="31,38 33,40 31,42 30,40" fill="#ffffaa"/>
      <polygon points="49,38 47,40 49,42 50,40" fill="#ffffaa"/>
      {/* Smile */}
      <path d="M 34,46 Q 40,52 46,46" stroke="#cc8800" strokeWidth="2.5" fill="none"/>
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

// ── Sprite lookup ──────────────────────────────────────────────
const SPRITES: Record<string, () => JSX.Element> = {
  ignit: Ignit, ignitor: Ignitor, ignithelio: Ignithelio,
  aquat: Aquat, aquasub: Aquasub, aquasolv: Aquasolv,
  phyllon: Phyllon, phyllfact: Phyllfact, phyllroot: Phyllroot,
  cryocub: Cryocub, cryoline: Cryoline, cryobound: Cryobound,
  aeron: Aeron, aeropoly: Aeropoly, aeroremain: Aeroremain,
  terron: Terron, terragrid: Terragrid, terracoord: Terracoord,
  pugn: Pugn, pugnlogic: Pugnlogic, pugnratio: Pugnratio,
  volt: Volt, voltgraph: Voltgraph, voltsimul: Voltsimul,
};

// Fallback sprite (used for unknown enemy speciesIds)
function FallbackSprite({ type }: { type: AlgemonType }) {
  const BODY: Record<AlgemonType, string> = {
    Fire: "#ff6600", Water: "#1166cc", Grass: "#22aa22", Ice: "#aaddff",
    Flying: "#6644cc", Ground: "#885533", Fighting: "#cc3322", Electric: "#ffdd00",
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
export function AlgemonSVG({ type, stage, size = 80, isEnemy = false, fainted = false, animate = true }: AlgemonSVGProps) {
  const speciesId = `${type.toLowerCase()}${stage === 0 ? "" : stage === 1 ? "sub" : "final"}`; // fallback key
  // Build speciesId from EVOLUTION_DATA stage name (lowercased)
  const STAGE_IDS: Record<AlgemonType, [string, string, string]> = {
    Fire:     ["ignit",    "ignitor",   "ignithelio"],
    Water:    ["aquat",    "aquasub",   "aquasolv"],
    Grass:    ["phyllon",  "phyllfact", "phyllroot"],
    Ice:      ["cryocub",  "cryoline",  "cryobound"],
    Flying:   ["aeron",    "aeropoly",  "aeroremain"],
    Ground:   ["terron",   "terragrid", "terracoord"],
    Fighting: ["pugn",     "pugnlogic", "pugnratio"],
    Electric: ["volt",     "voltgraph", "voltsimul"],
  };

  const sid      = STAGE_IDS[type]?.[stage] ?? speciesId;
  const SpriteFn = SPRITES[sid];

  const bobClass  = !animate ? "" : (isEnemy ? "sprite-bob-enemy" : "sprite-bob");
  const transform = isEnemy ? "scale(-1,1) translate(-80,0)" : undefined;

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
      <g transform={transform}>
        {SpriteFn ? <SpriteFn /> : <FallbackSprite type={type} />}
        {stage === 2 && animate && <MathOrbit type={type} />}
      </g>
    </svg>
  );
}
