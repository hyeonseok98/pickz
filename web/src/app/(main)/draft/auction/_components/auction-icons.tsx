import type { SVGProps } from "react";

export function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.4 10.1c.45-.9 1.27-1.4 2.6-1.4 1.55 0 2.65.75 2.65 1.85 0 1.17-1.13 1.66-2.58 1.95-1.35.27-2.5.7-2.5 1.9 0 1.1 1.05 1.9 2.72 1.9 1.17 0 2.17-.38 2.8-1.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M12 7.4v1.2M12 16.4v1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function GavelLineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m13.4 5 6.6 6.6-2.2 2.2-6.6-6.6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9.1 9.3 5.6 5.6-2.2 2.2-5.6-5.6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.5 14.7 20 20.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.7 20.3h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TimerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 13V9M9.5 3.8h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3.8v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function QueueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m16 15 2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
