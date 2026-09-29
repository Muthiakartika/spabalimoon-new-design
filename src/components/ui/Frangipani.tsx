import { useId } from "react";

/**
 * Frangipani ornaments, drawn exactly as on the live site: five rotated
 * petals filled with a gold-to-white gradient, a gold radial glow at the heart.
 * Class names are the live CSS-module names (renamed, see src/styles/live.css).
 */
const PETAL = "M18 6C34 -12 52 -28 56 -54C60 -80 44 -103 16 -105C-12 -107 -32 -90 -31 -64C-30 -40 -16 -14 -12 6Z";
const STROKE = "rgba(150, 118, 44, 0.28)";

/** React ids contain characters that are awkward inside url(#…). */
const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");

function PetalGradient({ id }: { id: string }) {
  return (
    <linearGradient id={`${id}-p`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-106">
      <stop offset="0%" stopColor="#D9A52C" />
      <stop offset="16%" stopColor="#F3D488" />
      <stop offset="42%" stopColor="#FCF2DE" />
      <stop offset="100%" stopColor="#FFFFFF" />
    </linearGradient>
  );
}

function HeartGradient({ id }: { id: string }) {
  return (
    <radialGradient id={`${id}-c`}>
      <stop offset="0%" stopColor="#C79422" stopOpacity="0.85" />
      <stop offset="45%" stopColor="#DCAE3A" stopOpacity="0.45" />
      <stop offset="100%" stopColor="#DCAE3A" stopOpacity="0" />
    </radialGradient>
  );
}

function Petals({ id }: { id: string }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          transform={`rotate(${72 * i})`}
          d={PETAL}
          fill={`url(#${id}-p)`}
          stroke={STROKE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      ))}
      <circle r="42" fill={`url(#${id}-c)`} />
    </>
  );
}

/** A whole flower. */
export function Bloom({ className }: { className?: string }) {
  const id = useSvgId();
  return (
    <svg className={className} viewBox="-120 -120 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <PetalGradient id={id} />
        <HeartGradient id={id} />
      </defs>
      <Petals id={id} />
    </svg>
  );
}

/** A single loose petal. */
export function Petal({ className }: { className?: string }) {
  const id = useSvgId();
  return (
    <svg className={className} viewBox="-36 -112 96 124" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <PetalGradient id={id} />
      </defs>
      <path d={PETAL} fill={`url(#${id}-p)`} stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** The drifting spray of three flowers and two petals behind the hero. */
export function FrangipaniSpray() {
  return (
    <div className="frangipani-spray__spray" aria-hidden="true">
      <span className="frangipani-spray__glow" />
      <Bloom className="frangipani-spray__bloom frangipani-spray__one" />
      <Bloom className="frangipani-spray__bloom frangipani-spray__two" />
      <Bloom className="frangipani-spray__bloom frangipani-spray__three" />
      <Petal className="frangipani-spray__petal frangipani-spray__petal-a" />
      <Petal className="frangipani-spray__petal frangipani-spray__petal-b" />
    </div>
  );
}

/** Rule · bud · flower · bud · rule, above the hero title. */
export function FrangipaniMark() {
  return (
    <span className="frangipani-spray__mark" aria-hidden="true">
      <i className="frangipani-spray__rule" />
      <Bloom className="frangipani-spray__mark-bud" />
      <Bloom className="frangipani-spray__mark-bloom" />
      <Bloom className="frangipani-spray__mark-bud" />
      <i className="frangipani-spray__rule frangipani-spray__rule-flip" />
    </span>
  );
}

const SIDEBAR_BLOOMS = [
  { x: 78, y: 121, scale: 0.63, opacity: 0.8 },
  { x: 291, y: 60, scale: 0.35, opacity: 0.55 },
  { x: 197, y: 150, scale: 0.2, opacity: 0.45 },
];

/** Three flowers along the foot of the mobile menu. */
export function SidebarBloom() {
  const id = useSvgId();
  return (
    <div aria-hidden="true" className="jsx-sidebar-bloom sidebar-bloom frangipani-spray__sidebar-bloom">
      <div className="jsx-sidebar-bloom frangipani-spray__sidebar-inner">
        <svg
          viewBox="0 0 360 190"
          preserveAspectRatio="xMidYMax meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="jsx-sidebar-bloom frangipani-spray__sidebar-art"
        >
          <defs>
            <PetalGradient id={id} />
            <HeartGradient id={id} />
            <g id={`${id}-b`}>
              <Petals id={id} />
            </g>
          </defs>
          {SIDEBAR_BLOOMS.map((b) => (
            <use
              key={`${b.x}-${b.y}`}
              href={`#${id}-b`}
              transform={`translate(${b.x} ${b.y}) scale(${b.scale})`}
              opacity={b.opacity}
              className="jsx-sidebar-bloom"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
