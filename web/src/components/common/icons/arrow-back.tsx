import type { SVGProps } from "react";

export function ArrowBackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.85 13 10.7 15.85c.2.2.296.433.287.7-.008.267-.104.5-.287.7a.961.961 0 0 1-.713.313.954.954 0 0 1-.712-.288L4.7 12.7A.97.97 0 0 1 4.4 12c0-.267.1-.5.3-.7l4.575-4.575a.954.954 0 0 1 .712-.287c.275.008.513.112.713.312.183.2.279.433.287.7.01.267-.086.5-.287.7L7.85 11H19a.96.96 0 0 1 .713.288c.191.191.287.429.287.712a.97.97 0 0 1-.287.713A.97.97 0 0 1 19 13H7.85Z"
        fill="currentColor"
      />
    </svg>
  );
}
