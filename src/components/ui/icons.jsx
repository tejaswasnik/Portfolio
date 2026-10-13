/**
 * Inline icon set. Path data downloaded verbatim from Figma (assets under
 * contact row 10:1085, about footnote 5:5638, banner upload 5:5325, project
 * card actions 5:5651 — see docs/DECISIONS.md step 3 — plus icon/back and
 * icon/expand from the project details page, 72:453/72:566, step 4; plus
 * the admin login (57:2) and admin shell (53:3/53:95) icons, step 7; plus
 * icon/copy from the media library, 71:646, step 12), with the baked
 * `stroke` hex swapped for `currentColor` so each icon inherits its
 * wrapper's text color and works in both themes. No shape was redrawn.
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

export function XIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M1.75 1.75L12.25 12.25M12.25 1.75L1.75 12.25"
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

export function DownloadIcon(props) {
  return (
    <Icon viewBox="0 0 12 12" {...props}>
      <path
        d="M10.5 7.5V9.5C10.5 9.76522 10.3946 10.0196 10.2071 10.2071C10.0196 10.3946 9.76522 10.5 9.5 10.5H2.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5V7.5M8.5 5L6 7.5L3.5 5M6 7.5V1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function LockIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M12.6667 7.33333H3.33333C2.59695 7.33333 2 7.93029 2 8.66667V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V8.66667C14 7.93029 13.403 7.33333 12.6667 7.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66667 7.33333V4.66667C4.66667 3.78261 5.01786 2.93477 5.64298 2.30964C6.2681 1.68452 7.11594 1.33333 8 1.33333C8.88405 1.33333 9.7319 1.68452 10.357 2.30964C10.9821 2.93477 11.3333 3.78261 11.3333 4.66667V7.33333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function EyeIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M1.20283 6.797C1.15422 6.92797 1.15422 7.07203 1.20283 7.203C1.67633 8.35108 2.48005 9.33273 3.51212 10.0235C4.54418 10.7142 5.75811 11.083 7 11.083C8.24189 11.083 9.45582 10.7142 10.4879 10.0235C11.5199 9.33273 12.3237 8.35108 12.7972 7.203C12.8458 7.07203 12.8458 6.92797 12.7972 6.797C12.3237 5.64892 11.5199 4.66727 10.4879 3.97652C9.45582 3.28578 8.24189 2.91703 7 2.91703C5.75811 2.91703 4.54418 3.28578 3.51212 3.97652C2.48005 4.66727 1.67633 5.64892 1.20283 6.797Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 8.75C7.9665 8.75 8.75 7.9665 8.75 7C8.75 6.0335 7.9665 5.25 7 5.25C6.0335 5.25 5.25 6.0335 5.25 7C5.25 7.9665 6.0335 8.75 7 8.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ShieldIcon(props) {
  return (
    <Icon viewBox="0 0 12 12" {...props}>
      <path
        d="M10 6.5C10 9 8.25 10.25 6.17 10.975C6.06108 11.0119 5.94277 11.0101 5.835 10.97C3.75 10.25 2 9 2 6.5V3C2 2.86739 2.05268 2.74021 2.14645 2.64645C2.24021 2.55268 2.36739 2.5 2.5 2.5C3.5 2.5 4.75 1.9 5.62 1.14C5.72593 1.0495 5.86068 0.999775 6 0.999775C6.13932 0.999775 6.27407 1.0495 6.38 1.14C7.255 1.905 8.5 2.5 9.5 2.5C9.63261 2.5 9.75979 2.55268 9.85355 2.64645C9.94732 2.74021 10 2.86739 10 3V6.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M7 11.0833L2.91667 7L7 2.91667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11.0833 7H2.91667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function DashboardIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M6 2H2.66667C2.29848 2 2 2.29848 2 2.66667V7.33333C2 7.70152 2.29848 8 2.66667 8H6C6.36819 8 6.66667 7.70152 6.66667 7.33333V2.66667C6.66667 2.29848 6.36819 2 6 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3333 2H10C9.63181 2 9.33333 2.29848 9.33333 2.66667V4.66667C9.33333 5.03486 9.63181 5.33333 10 5.33333H13.3333C13.7015 5.33333 14 5.03486 14 4.66667V2.66667C14 2.29848 13.7015 2 13.3333 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3333 8H10C9.63181 8 9.33333 8.29848 9.33333 8.66667V13.3333C9.33333 13.7015 9.63181 14 10 14H13.3333C13.7015 14 14 13.7015 14 13.3333V8.66667C14 8.29848 13.7015 8 13.3333 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.6667H2.66667C2.29848 10.6667 2 10.9651 2 11.3333V13.3333C2 13.7015 2.29848 14 2.66667 14H6C6.36819 14 6.66667 13.7015 6.66667 13.3333V11.3333C6.66667 10.9651 6.36819 10.6667 6 10.6667Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function FolderIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M13.3333 13.3333C13.687 13.3333 14.0261 13.1929 14.2761 12.9428C14.5262 12.6928 14.6667 12.3536 14.6667 12V5.33333C14.6667 4.97971 14.5262 4.64057 14.2761 4.39052C14.0261 4.14048 13.687 4 13.3333 4H8.06667C7.84368 4.00219 7.6237 3.94841 7.42687 3.84359C7.23004 3.73877 7.06264 3.58625 6.94 3.4L6.4 2.6C6.27859 2.41565 6.11332 2.26432 5.919 2.1596C5.72468 2.05488 5.50741 2.00004 5.28667 2H2.66667C2.31304 2 1.97391 2.14048 1.72386 2.39052C1.47381 2.64057 1.33333 2.97971 1.33333 3.33333V12C1.33333 12.3536 1.47381 12.6928 1.72386 12.9428C1.97391 13.1929 2.31304 13.3333 2.66667 13.3333H13.3333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function LayersIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M8.55333 1.45333C8.37962 1.3741 8.19093 1.3331 8 1.3331C7.80907 1.3331 7.62037 1.3741 7.44667 1.45333L1.73333 4.05333C1.61503 4.1055 1.51445 4.19093 1.44384 4.29924C1.37323 4.40754 1.33564 4.53404 1.33564 4.66333C1.33564 4.79262 1.37323 4.91912 1.44384 5.02743C1.51445 5.13573 1.61503 5.22117 1.73333 5.27333L7.45333 7.88C7.62704 7.95923 7.81574 8.00024 8.00667 8.00024C8.19759 8.00024 8.38629 7.95923 8.56 7.88L14.28 5.28C14.3983 5.22784 14.4989 5.1424 14.5695 5.0341C14.6401 4.92579 14.6777 4.79929 14.6777 4.67C14.6777 4.54071 14.6401 4.41421 14.5695 4.3059C14.4989 4.1976 14.3983 4.11216 14.28 4.06L8.55333 1.45333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6667 11.7667L8.55333 14.54C8.37962 14.6192 8.19093 14.6602 8 14.6602C7.80907 14.6602 7.62038 14.6192 7.44667 14.54L1.33333 11.7667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6667 8.43333L8.55333 11.2067C8.37962 11.2859 8.19093 11.3269 8 11.3269C7.80907 11.3269 7.62038 11.2859 7.44667 11.2067L1.33333 8.43333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function UserIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M12.6667 14V12.6667C12.6667 11.9594 12.3857 11.2811 11.8856 10.781C11.3855 10.281 10.7072 10 10 10H6C5.29276 10 4.61448 10.281 4.11438 10.781C3.61428 11.2811 3.33333 11.9594 3.33333 12.6667V14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ImageIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 7.33333C6.73638 7.33333 7.33333 6.73638 7.33333 6C7.33333 5.26362 6.73638 4.66667 6 4.66667C5.26362 4.66667 4.66667 5.26362 4.66667 6C4.66667 6.73638 5.26362 7.33333 6 7.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 10L11.9427 7.94267C11.6926 7.6927 11.3536 7.55228 11 7.55228C10.6464 7.55228 10.3074 7.6927 10.0573 7.94267L4 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function GlobeIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 8C5.33333 5.51783 6.28816 3.13077 8 1.33333C9.71184 3.13077 10.6667 5.51783 10.6667 8C10.6667 10.4822 9.71184 12.8692 8 14.6667C6.28816 12.8692 5.33333 10.4822 5.33333 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1.33333 8H14.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function PanelsIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 6H14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14V6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function SlidersIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path d="M14 2.66667H9.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66667 2.66667H2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33333 8H2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 13.3333H10.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13.3333H2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.33333 1.33333V4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33333 6.66667V9.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6667 12V14.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function LogOutIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M5.25 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V2.91667C1.75 2.60725 1.87292 2.3105 2.09171 2.09171C2.3105 1.87292 2.60725 1.75 2.91667 1.75H5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33333 9.91667L12.25 7L9.33333 4.08333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.25 7H5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function SearchIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M6.41667 11.0833C8.994 11.0833 11.0833 8.994 11.0833 6.41667C11.0833 3.83934 8.994 1.75 6.41667 1.75C3.83934 1.75 1.75 3.83934 1.75 6.41667C1.75 8.994 3.83934 11.0833 6.41667 11.0833Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.25 12.25L9.74167 9.74167" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function PlusIcon(props) {
  return (
    <Icon viewBox="0 0 12 12" {...props}>
      <path d="M2.5 6H9.5M6 2.5V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function GripIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M5.25 4.08333C5.57217 4.08333 5.83333 3.82217 5.83333 3.5C5.83333 3.17783 5.57217 2.91667 5.25 2.91667C4.92783 2.91667 4.66667 3.17783 4.66667 3.5C4.66667 3.82217 4.92783 4.08333 5.25 4.08333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 7.58333C5.57217 7.58333 5.83333 7.32217 5.83333 7C5.83333 6.67783 5.57217 6.41667 5.25 6.41667C4.92783 6.41667 4.66667 6.67783 4.66667 7C4.66667 7.32217 4.92783 7.58333 5.25 7.58333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 11.0833C5.57217 11.0833 5.83333 10.8222 5.83333 10.5C5.83333 10.1778 5.57217 9.91667 5.25 9.91667C4.92783 9.91667 4.66667 10.1778 4.66667 10.5C4.66667 10.8222 4.92783 11.0833 5.25 11.0833Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 4.08333C9.07217 4.08333 9.33333 3.82217 9.33333 3.5C9.33333 3.17783 9.07217 2.91667 8.75 2.91667C8.42783 2.91667 8.16667 3.17783 8.16667 3.5C8.16667 3.82217 8.42783 4.08333 8.75 4.08333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 7.58333C9.07217 7.58333 9.33333 7.32217 9.33333 7C9.33333 6.67783 9.07217 6.41667 8.75 6.41667C8.42783 6.41667 8.16667 6.67783 8.16667 7C8.16667 7.32217 8.42783 7.58333 8.75 7.58333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 11.0833C9.07217 11.0833 9.33333 10.8222 9.33333 10.5C9.33333 10.1778 9.07217 9.91667 8.75 9.91667C8.42783 9.91667 8.16667 10.1778 8.16667 10.5C8.16667 10.8222 8.42783 11.0833 8.75 11.0833Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function PencilIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M9.91667 1.75C10.0652 1.57444 10.249 1.43153 10.4563 1.3304C10.6635 1.22926 10.8897 1.17211 11.1205 1.16259C11.3512 1.15307 11.5814 1.19139 11.7964 1.2751C12.0114 1.35881 12.2065 1.48609 12.3692 1.6488C12.5319 1.81152 12.6587 2.00612 12.7415 2.22019C12.8243 2.43426 12.8612 2.66311 12.85 2.89215C12.8388 3.1212 12.7797 3.34541 12.6764 3.5505C12.573 3.75559 12.4278 3.93705 12.25 4.08333L4.375 11.9583L1.16667 12.8333L2.04167 9.625L9.91667 1.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function TrashIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M1.75 3.5H12.25M11.0833 3.5V11.6667C11.0833 11.9761 10.9604 12.2728 10.7416 12.4916C10.5228 12.7104 10.2261 12.8333 9.91667 12.8333H4.08333C3.77391 12.8333 3.47717 12.7104 3.25838 12.4916C3.03958 12.2728 2.91667 11.9761 2.91667 11.6667V3.5M4.66667 3.5V2.33333C4.66667 2.02391 4.78958 1.72717 5.00838 1.50838C5.22717 1.28958 5.52391 1.16667 5.83333 1.16667H8.16667C8.47609 1.16667 8.77283 1.28958 8.99162 1.50838C9.21042 1.72717 9.33333 2.02391 9.33333 2.33333V3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function AlertIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M12.6758 10.5L8.00917 2.33333C7.90741 2.15379 7.75985 2.00444 7.58154 1.90054C7.40323 1.79664 7.20054 1.74189 6.99417 1.74189C6.78779 1.74189 6.58511 1.79664 6.40679 1.90054C6.22848 2.00444 6.08092 2.15379 5.97917 2.33333L1.3125 10.5C1.20965 10.6781 1.15572 10.8803 1.15617 11.086C1.15663 11.2917 1.21145 11.4936 1.31509 11.6712C1.41873 11.8489 1.5675 11.996 1.74632 12.0977C1.92514 12.1993 2.12765 12.2519 2.33333 12.25H11.6667C11.8714 12.2498 12.0724 12.1957 12.2496 12.0932C12.4268 11.9908 12.5739 11.8435 12.6761 11.6661C12.7784 11.4888 12.8322 11.2877 12.8321 11.083C12.8321 10.8783 12.7782 10.6773 12.6758 10.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 5.25V7.58333M7 9.91667H7.00583"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M11.6667 3.5L5.25 9.91667L2.33333 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ArchiveIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M12.25 1.75H1.75C1.42783 1.75 1.16667 2.01117 1.16667 2.33333V4.08333C1.16667 4.4055 1.42783 4.66667 1.75 4.66667H12.25C12.5722 4.66667 12.8333 4.4055 12.8333 4.08333V2.33333C12.8333 2.01117 12.5722 1.75 12.25 1.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.33333 4.66667V11.0833C2.33333 11.3928 2.45625 11.6895 2.67504 11.9083C2.89383 12.1271 3.19058 12.25 3.5 12.25H10.5C10.8094 12.25 11.1062 12.1271 11.325 11.9083C11.5437 11.6895 11.6667 11.3928 11.6667 11.0833V4.66667M5.83333 7H8.16667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ReplyIcon(props) {
  return (
    <Icon viewBox="0 0 12 12" {...props}>
      <path d="M4.5 8.5L2 6L4.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M10 9V8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function FileIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M10 1.33333H4C3.64638 1.33333 3.30724 1.47381 3.05719 1.72386C2.80714 1.97391 2.66667 2.31304 2.66667 2.66667V13.3333C2.66667 13.687 2.80714 14.0261 3.05719 14.2761C3.30724 14.5262 3.64638 14.6667 4 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V4.66667L10 1.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33333 1.33333V4C9.33333 4.35362 9.47381 4.69276 9.72386 4.94281C9.97391 5.19286 10.313 5.33333 10.6667 5.33333H13.3333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function CopyIcon(props) {
  return (
    <Icon viewBox="0 0 14 14" {...props}>
      <path
        d="M11.6667 5.25H6.41667C5.77233 5.25 5.25 5.77233 5.25 6.41667V11.6667C5.25 12.311 5.77233 12.8333 6.41667 12.8333H11.6667C12.311 12.8333 12.8333 12.311 12.8333 11.6667V6.41667C12.8333 5.77233 12.311 5.25 11.6667 5.25Z"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.91667 8.75H2.33333C2.02391 8.75 1.72717 8.62708 1.50838 8.40829C1.28958 8.1895 1.16667 7.89275 1.16667 7.58333V2.33333C1.16667 2.02391 1.28958 1.72717 1.50838 1.50838C1.72717 1.28958 2.02391 1.16667 2.33333 1.16667H7.58333C7.89275 1.16667 8.1895 1.28958 8.40829 1.50838C8.62708 1.72717 8.75 2.02391 8.75 2.33333V2.91667"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ChevronUpIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function InfoIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M8 14.6667A6.6667 6.6667 0 1 0 8 1.3333a6.6667 6.6667 0 0 0 0 13.3334Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M8 7.3333V11.3333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 5.3333h.0067" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Icon>
  );
}

export function MenuIcon(props) {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
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
