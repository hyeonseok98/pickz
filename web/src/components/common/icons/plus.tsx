import type { SVGProps } from "react";

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M11 13H6a.965.965 0 0 1-.713-.288A.965.965 0 0 1 5 12c0-.283.096-.52.287-.713A.965.965 0 0 1 6 11h5V6c0-.283.096-.52.287-.713A.965.965 0 0 1 12 5c.283 0 .52.096.713.287.191.192.287.43.287.713v5h5c.283 0 .52.096.713.287.191.192.287.43.287.713a.965.965 0 0 1-.287.712A.965.965 0 0 1 18 13h-5v5a.965.965 0 0 1-.287.712A.965.965 0 0 1 12 19a.965.965 0 0 1-.713-.288A.965.965 0 0 1 11 18v-5Z"
        fill="currentColor"
      />
    </svg>
  );
}
