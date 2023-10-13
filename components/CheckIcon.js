import React from "react";
export const CheckIcon = ({strokeWidth = 1.5, ...otherProps}) => (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 7l4.5 4.5L14 3"
      />
    </svg>
);
