import type { SVGProps } from "react";

export function ArrowForwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m14.475 12-7.35-7.35a.948.948 0 0 1-.363-.888c.008-.342.137-.637.388-.887.25-.25.546-.375.887-.375.342 0 .638.125.888.375l7.675 7.7c.2.2.35.425.45.675.1.25.15.5.15.75s-.05.5-.15.75c-.1.25-.25.475-.45.675L8.9 21.125c-.25.25-.542.371-.875.363a1.103 1.103 0 0 1-.875-.388.961.961 0 0 1-.375-.888c0-.341.125-.637.375-.887L14.475 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
