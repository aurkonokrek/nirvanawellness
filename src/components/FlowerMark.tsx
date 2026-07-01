import type { SVGProps } from "react";

/**
 * Simplified 8-petal flower mark used at small sizes (favicon, header, watermark).
 * Uses currentColor so it can inherit gold, cream, or navy from context.
 */
export function FlowerMark(props: SVGProps<SVGSVGElement>) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g transform="translate(32 32)">
        {petals.map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-15"
            rx="5.5"
            ry="13"
            transform={`rotate(${deg})`}
            opacity="0.92"
          />
        ))}
        <circle cx="0" cy="0" r="4.5" />
      </g>
    </svg>
  );
}
