/* global console */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../apps/pet-2d/public/sprites/default');

fs.mkdirSync(outputDir, { recursive: true });

function createAnyaSvg({
  eyeState = 'open', // 'open' | 'blink' | 'waku' | 'closed'
  mouthState = 'smile', // 'smile' | 'open' | 'cat' | 'zzz'
  pose = 'stand', // 'stand' | 'walk1' | 'walk2' | 'fall' | 'drag' | 'climb1' | 'climb2' | 'sit'
  tilt = 0,
  dragY = 0,
}) {
  // Base body parts & offsets depending on pose
  let bodyY = 64 + dragY;
  let headY = 40 + dragY;
  let leftArm = `<path d="M 44,70 Q 36,78 40,88" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  let rightArm = `<path d="M 84,70 Q 92,78 88,88" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  let leftLeg = `<path d="M 52,100 L 50,116" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                 <ellipse cx="49" cy="118" rx="6" ry="4" fill="#78350f"/>`;
  let rightLeg = `<path d="M 76,100 L 78,116" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                  <ellipse cx="79" cy="118" rx="6" ry="4" fill="#78350f"/>`;

  if (pose === 'walk1') {
    leftArm = `<path d="M 44,70 Q 32,74 34,84" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    rightArm = `<path d="M 84,70 Q 94,80 96,92" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    leftLeg = `<path d="M 52,98 L 44,114" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
               <ellipse cx="42" cy="116" rx="6" ry="4" fill="#78350f"/>`;
    rightLeg = `<path d="M 76,98 L 84,112" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                <ellipse cx="86" cy="114" rx="6" ry="4" fill="#78350f"/>`;
  } else if (pose === 'walk2') {
    leftArm = `<path d="M 44,70 Q 34,80 32,92" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    rightArm = `<path d="M 84,70 Q 96,74 94,84" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    leftLeg = `<path d="M 52,98 L 58,112" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
               <ellipse cx="60" cy="114" rx="6" ry="4" fill="#78350f"/>`;
    rightLeg = `<path d="M 76,98 L 70,114" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                <ellipse cx="68" cy="116" rx="6" ry="4" fill="#78350f"/>`;
  } else if (pose === 'fall') {
    leftArm = `<path d="M 44,68 Q 28,52 32,40" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    rightArm = `<path d="M 84,68 Q 100,52 96,40" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    leftLeg = `<path d="M 52,98 L 42,112" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
               <ellipse cx="40" cy="114" rx="6" ry="4" fill="#78350f"/>`;
    rightLeg = `<path d="M 76,98 L 86,112" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                <ellipse cx="88" cy="114" rx="6" ry="4" fill="#78350f"/>`;
  } else if (pose === 'drag') {
    leftArm = `<path d="M 44,70 Q 30,64 34,54" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    rightArm = `<path d="M 84,70 Q 98,64 94,54" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    leftLeg = `<path d="M 52,100 L 48,118" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
               <ellipse cx="47" cy="120" rx="6" ry="4" fill="#78350f"/>`;
    rightLeg = `<path d="M 76,100 L 80,118" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                <ellipse cx="81" cy="120" rx="6" ry="4" fill="#78350f"/>`;
  } else if (pose === 'climb1' || pose === 'climb2') {
    leftArm = `<path d="M 48,68 Q 30,56 24,46" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    rightArm = `<path d="M 80,68 Q 72,56 68,44" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    leftLeg = `<path d="M 54,98 L 42,108" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
               <ellipse cx="40" cy="110" rx="6" ry="4" fill="#78350f"/>`;
    rightLeg = `<path d="M 74,98 L 68,114" stroke="#1e1e24" stroke-width="8" stroke-linecap="round"/>
                <ellipse cx="67" cy="116" rx="6" ry="4" fill="#78350f"/>`;
  } else if (pose === 'sit') {
    bodyY += 8;
    headY += 8;
    leftArm = `<path d="M 46,78 Q 42,88 52,94" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    rightArm = `<path d="M 82,78 Q 86,88 76,94" stroke="#1e1e24" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    leftLeg = `<ellipse cx="48" cy="116" rx="9" ry="5" fill="#78350f"/>`;
    rightLeg = `<ellipse cx="80" cy="116" rx="9" ry="5" fill="#78350f"/>`;
  }

  // Eyes rendering
  let eyes = '';
  if (eyeState === 'open') {
    eyes = `
      <!-- Left Eye -->
      <ellipse cx="50" cy="${headY + 6}" rx="8" ry="11" fill="#059669"/>
      <ellipse cx="50" cy="${headY + 7}" rx="6" ry="8" fill="#10b981"/>
      <circle cx="48" cy="${headY + 3}" r="3" fill="#ffffff"/>
      <circle cx="52" cy="${headY + 9}" r="1.5" fill="#ffffff"/>
      <path d="M 42,${headY - 5} Q 50,${headY - 8} 58,${headY - 5}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Right Eye -->
      <ellipse cx="78" cy="${headY + 6}" rx="8" ry="11" fill="#059669"/>
      <ellipse cx="78" cy="${headY + 7}" rx="6" ry="8" fill="#10b981"/>
      <circle cx="76" cy="${headY + 3}" r="3" fill="#ffffff"/>
      <circle cx="80" cy="${headY + 9}" r="1.5" fill="#ffffff"/>
      <path d="M 70,${headY - 5} Q 78,${headY - 8} 86,${headY - 5}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `;
  } else if (eyeState === 'blink') {
    eyes = `
      <!-- Happy squinting crescent eyes -->
      <path d="M 42,${headY + 7} Q 50,${headY + 1} 58,${headY + 7}" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 70,${headY + 7} Q 78,${headY + 1} 86,${headY + 7}" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  } else if (eyeState === 'waku') {
    eyes = `
      <!-- Super sparkle Waku Waku eyes -->
      <ellipse cx="50" cy="${headY + 6}" rx="9" ry="12" fill="#047857"/>
      <ellipse cx="50" cy="${headY + 7}" rx="7" ry="10" fill="#34d399"/>
      <polygon points="50,${headY - 1} 52,${headY + 4} 57,${headY + 4} 53,${headY + 7} 55,${headY + 12} 50,${headY + 9} 45,${headY + 12} 47,${headY + 7} 43,${headY + 4} 48,${headY + 4}" fill="#ffffff"/>
      
      <ellipse cx="78" cy="${headY + 6}" rx="9" ry="12" fill="#047857"/>
      <ellipse cx="78" cy="${headY + 7}" rx="7" ry="10" fill="#34d399"/>
      <polygon points="78,${headY - 1} 80,${headY + 4} 85,${headY + 4} 81,${headY + 7} 83,${headY + 12} 78,${headY + 9} 73,${headY + 12} 75,${headY + 7} 71,${headY + 4} 76,${headY + 4}" fill="#ffffff"/>
    `;
  } else if (eyeState === 'closed') {
    eyes = `
      <!-- Peaceful sleeping curved eyes -->
      <path d="M 42,${headY + 5} Q 50,${headY + 11} 58,${headY + 5}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M 70,${headY + 5} Q 78,${headY + 11} 86,${headY + 5}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `;
  }

  // Mouth rendering
  let mouth = `<path d="M 60,${headY + 17} Q 64,${headY + 21} 68,${headY + 17}" stroke="#e11d48" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  if (mouthState === 'open') {
    mouth = `<path d="M 59,${headY + 16} Q 64,${headY + 24} 69,${headY + 16} Z" fill="#e11d48"/>`;
  } else if (mouthState === 'cat') {
    mouth = `<path d="M 58,${headY + 16} Q 61,${headY + 19} 64,${headY + 16} Q 67,${headY + 19} 70,${headY + 16}" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (mouthState === 'zzz') {
    mouth = `
      <ellipse cx="64" cy="${headY + 17}" rx="2" ry="2" fill="#0f172a"/>
      <text x="88" y="${headY - 8}" font-family="sans-serif" font-weight="bold" font-size="12" fill="#38bdf8">Z</text>
      <text x="96" y="${headY - 18}" font-family="sans-serif" font-weight="bold" font-size="10" fill="#38bdf8">z</text>
      <text x="102" y="${headY - 26}" font-family="sans-serif" font-weight="bold" font-size="8" fill="#38bdf8">z</text>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <g transform="rotate(${tilt} 64 64)">
      <!-- Back Hair Bob -->
      <ellipse cx="64" cy="${headY + 8}" rx="32" ry="30" fill="#f472b6"/>
      <path d="M 32,${headY + 8} Q 30,${headY + 36} 44,${headY + 38} L 84,${headY + 38} Q 98,${headY + 36} 96,${headY + 8} Z" fill="#f472b6"/>

      <!-- Legs -->
      ${leftLeg}
      ${rightLeg}

      <!-- Dress Body (Eden Academy Black & Gold) -->
      <path d="M 48,${bodyY + 6} L 38,${bodyY + 34} Q 64,${bodyY + 38} 90,${bodyY + 34} L 80,${bodyY + 6} Z" fill="#1e1e24"/>
      <!-- Gold Trim on Dress Bottom -->
      <path d="M 39,${bodyY + 32} Q 64,${bodyY + 36} 89,${bodyY + 32}" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
      <!-- White Shirt Collar -->
      <polygon points="56,${bodyY + 6} 64,${bodyY + 14} 72,${bodyY + 6}" fill="#f8fafc"/>
      <polygon points="61,${bodyY + 6} 64,${bodyY + 11} 67,${bodyY + 6}" fill="#e11d48"/>

      <!-- Arms -->
      ${leftArm}
      ${rightArm}

      <!-- Head & Face -->
      <ellipse cx="64" cy="${headY}" rx="27" ry="24" fill="#fee2e2"/>
      <!-- Cheeks Blush -->
      <ellipse cx="44" cy="${headY + 11}" rx="5" ry="3" fill="#f43f5e" opacity="0.45"/>
      <ellipse cx="84" cy="${headY + 11}" rx="5" ry="3" fill="#f43f5e" opacity="0.45"/>

      <!-- Eyes & Mouth -->
      ${eyes}
      ${mouth}

      <!-- Front Hair Bangs -->
      <path d="M 36,${headY - 6} Q 40,${headY + 10} 46,${headY} Q 54,${headY + 12} 60,${headY - 2} Q 66,${headY + 12} 74,${headY} Q 80,${headY + 10} 86,${headY - 6} Q 92,${headY - 26} 64,${headY - 24} Q 36,${headY - 26} 36,${headY - 6} Z" fill="#f9a8d4"/>
      <!-- Side Strands -->
      <path d="M 37,${headY - 4} Q 32,${headY + 20} 38,${headY + 28} Q 42,${headY + 16} 41,${headY + 2}" fill="#f9a8d4"/>
      <path d="M 91,${headY - 4} Q 96,${headY + 20} 90,${headY + 28} Q 86,${headY + 16} 87,${headY + 2}" fill="#f9a8d4"/>

      <!-- Anya Hair Horn Ornaments (Cones) -->
      <!-- Left Horn -->
      <polygon points="34,${headY - 14} 24,${headY - 28} 42,${headY - 22}" fill="#1e1e24"/>
      <polygon points="32,${headY - 15} 25,${headY - 26} 30,${headY - 24}" fill="#fbbf24"/>
      <!-- Right Horn -->
      <polygon points="94,${headY - 14} 104,${headY - 28} 86,${headY - 22}" fill="#1e1e24"/>
      <polygon points="96,${headY - 15} 103,${headY - 26} 98,${headY - 24}" fill="#fbbf24"/>
    </g>
  </svg>`;
}

// Generate the 13 canonical Shimeji frames
const frames = [
  { name: 'shime1', config: { eyeState: 'open', mouthState: 'smile', pose: 'stand' } },
  { name: 'shime2', config: { eyeState: 'blink', mouthState: 'smile', pose: 'stand' } },
  { name: 'shime3', config: { eyeState: 'open', mouthState: 'smile', pose: 'walk1', tilt: -3 } },
  { name: 'shime4', config: { eyeState: 'open', mouthState: 'smile', pose: 'stand', tilt: 0 } },
  { name: 'shime5', config: { eyeState: 'open', mouthState: 'smile', pose: 'walk2', tilt: 3 } },
  { name: 'shime6', config: { eyeState: 'waku', mouthState: 'open', pose: 'fall', tilt: -5 } },
  { name: 'shime7', config: { eyeState: 'waku', mouthState: 'open', pose: 'fall', tilt: 5 } },
  { name: 'shime8', config: { eyeState: 'waku', mouthState: 'cat', pose: 'drag', dragY: -6 } },
  { name: 'shime9', config: { eyeState: 'waku', mouthState: 'open', pose: 'drag', dragY: -4, tilt: 4 } },
  { name: 'shime10', config: { eyeState: 'open', mouthState: 'smile', pose: 'climb1' } },
  { name: 'shime11', config: { eyeState: 'open', mouthState: 'smile', pose: 'climb2' } },
  { name: 'shime12', config: { eyeState: 'open', mouthState: 'smile', pose: 'sit' } },
  { name: 'shime13', config: { eyeState: 'closed', mouthState: 'zzz', pose: 'sit' } },
];

for (const { name, config } of frames) {
  const svgContent = createAnyaSvg(config);
  fs.writeFileSync(path.join(outputDir, `${name}.svg`), svgContent, 'utf8');
}

console.log(`Generated 13 Anya Chibi SVG frames in ${outputDir}`);
