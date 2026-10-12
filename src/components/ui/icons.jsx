/**
 * Inline icon set. Path data downloaded verbatim from Figma (assets under
 * contact row 10:1085, about footnote 5:5638, banner upload 5:5325, project
 * card actions 5:5651 — see docs/DECISIONS.md step 3 — plus icon/back and
 * icon/expand from the project details page, 72:453/72:566, step 4), with
 * the baked `stroke` hex swapped for `currentColor` so each icon inherits
 * its wrapper's text color and works in both themes. No shape was redrawn.
 */

function Icon({ size = 16, viewBox, children, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function MailIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M14.6672 4.667L8.67272 8.48462C8.4693 8.60275 8.23824 8.66497 8.003 8.66497C7.76776 8.66497 7.5367 8.60275 7.33328 8.48462L1.3328 4.667M2.66624 2.6672H13.3338C14.0702 2.6672 14.6672 3.26409 14.6672 4.0004V11.9996C14.6672 12.7359 14.0702 13.3328 13.3338 13.3328H2.66624C1.9298 13.3328 1.3328 12.7359 1.3328 11.9996V4.0004C1.3328 3.26409 1.9298 2.6672 2.66624 2.6672Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function GithubIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M5.99959 14.6672V12.0003C5.95292 11.587 5.98625 11.1669 6.09959 10.7669C6.21293 10.3669 6.40628 9.99349 6.66629 9.6668C4.66618 9.6668 2.66607 8.33336 2.66607 5.99984C2.61171 5.1683 2.84733 4.34363 3.33277 3.66632C3.13276 2.89959 3.13276 2.09953 3.33277 1.3328C3.33277 1.3328 3.99948 1.3328 5.33288 2.33288C7.09298 1.99952 8.90642 1.99952 10.6665 2.33288C11.9999 1.3328 12.6666 1.3328 12.6666 1.3328C12.8533 2.09953 12.8533 2.89959 12.6666 3.66632C13.1533 4.34637 13.3867 5.16644 13.3333 5.99984C13.3333 8.33336 11.3332 9.6668 9.33311 9.6668C9.85309 10.3269 10.0926 11.1651 9.99981 12.0003V14.6672M5.99959 12.0003C2.99275 13.3338 2.66621 10.6669 1.3328 10.6669"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function LinkedinIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M13.4955 6.50459C12.7453 5.75441 11.7278 5.33297 10.6669 5.33297C9.60593 5.33297 8.58843 5.75441 7.83823 6.50459C7.08802 7.25477 6.66656 8.27223 6.66656 9.33314V14H9.33344V9.33314C9.33344 8.9795 9.47393 8.64035 9.724 8.39029C9.97406 8.14023 10.3132 7.99975 10.6669 7.99975C11.0205 7.99975 11.3597 8.14023 11.6098 8.39029C11.8598 8.64035 12.0003 8.9795 12.0003 9.33314V14H14.6672V9.33314C14.6672 8.27223 14.2457 7.25477 13.4955 6.50459Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path d="M3.99968 5.99966H1.3328V14H3.99968V5.99966Z" stroke="currentColor" strokeLinecap="round" />
      <path
        d="M2.66624 3.99958C3.40268 3.99958 3.99968 3.4026 3.99968 2.66619C3.99968 1.92978 3.40268 1.3328 2.66624 1.3328C1.9298 1.3328 1.3328 1.92978 1.3328 2.66619C1.3328 3.4026 1.9298 3.99958 2.66624 3.99958Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function TwitterIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M11.667 4.31619C12.4254 3.55783 12.8338 2.33277 12.8338 2.33277C12.8338 2.33277 11.7254 3.0328 11.0837 3.0328C9.33352 1.39939 6.47496 2.79946 7 5.24957C5.01651 5.30791 3.03302 4.43287 1.74958 2.91613C0.29113 5.59959 1.74958 9.04141 4.66648 9.91645C3.73307 10.7332 2.44964 11.1415 1.1662 11.0832C6.18327 14.4083 12.6004 10.1498 11.667 4.31619Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function ArrowUpRightIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path d="M9.9162 9.9162V4.0838H4.0838M9.9162 4.0838L4.0838 9.9162" stroke="currentColor" strokeLinecap="round" />
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M2.9162 7H11.0838M7 11.0838L11.0838 7L7 2.9162"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function CoffeeIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M5.83333 1.1662V2.33287M8.16667 1.1662V2.33287M9.33333 4.6662C9.48804 4.6662 9.63642 4.72766 9.74581 4.83705C9.85521 4.94645 9.91667 5.09482 9.91667 5.24953V9.9162C9.91667 10.535 9.67083 11.1285 9.23325 11.5661C8.79566 12.0037 8.20217 12.2495 7.58333 12.2495H4.08333C3.46449 12.2495 2.871 12.0037 2.43342 11.5661C1.99583 11.1285 1.75 10.535 1.75 9.9162V5.24953C1.75 5.09482 1.81146 4.94645 1.92085 4.83705C2.03025 4.72766 2.17862 4.6662 2.33333 4.6662H10.5C11.1188 4.6662 11.7123 4.91203 12.1499 5.34962C12.5875 5.7872 12.8333 6.38069 12.8333 6.99953C12.8333 7.61837 12.5875 8.21186 12.1499 8.64945C11.7123 9.08703 11.1188 9.33287 10.5 9.33287H9.91667M3.5 1.1662V2.33287"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function BackIcon(props) {
  return (
    <Icon viewBox="0 0 12 12" {...props}>
      <path
        d="M9.5 6H2.5M6 2.5L2.5 6L6 9.5"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ExpandIcon(props) {
  return (
    <Icon viewBox="0 0 12 12" {...props}>
      <path
        d="M10.5 4.5V1.5H7.5M10.5 1.5L7 5M1.5 7.5V10.5H4.5M1.5 10.5L5 7"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function UploadIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M8 2V10M4.66667 5.33333L8 2L11.3333 5.33333M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}
