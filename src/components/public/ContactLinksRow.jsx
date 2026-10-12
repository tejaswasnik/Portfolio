import SectionDivider from "@/components/ui/SectionDivider";
import {
  MailIcon,
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";

/**
 * Contact links row (Figma 10:1085). "Message me" opens the contact
 * modal once step 5 builds it; until then it degrades to a mailto link
 * against profile.socialLinks.email (docs/DECISIONS.md). Empty links
 * are skipped entirely per PRD 2.2.4 — including "Message me" itself
 * when no email is set.
 * @param {{ socialLinks: { email?: string, github?: string, linkedin?: string, twitter?: string } | undefined }} props
 */
export default function ContactLinksRow({ socialLinks }) {
  const links = socialLinks ?? {};
  const cells = [
    links.email
      ? {
          key: "message",
          href: `mailto:${links.email}`,
          icon: <MailIcon size={16} />,
          label: "Message me",
          accent: true,
        }
      : null,
    links.github
      ? {
          key: "github",
          href: links.github,
          icon: <GithubIcon size={16} />,
          label: "GitHub",
          external: true,
        }
      : null,
    links.linkedin
      ? {
          key: "linkedin",
          href: links.linkedin,
          icon: <LinkedinIcon size={16} />,
          label: "LinkedIn",
          external: true,
        }
      : null,
    links.twitter
      ? {
          key: "twitter",
          href: links.twitter,
          icon: <TwitterIcon size={14} />,
          label: "Twitter",
          external: true,
        }
      : null,
  ].filter(Boolean);

  if (cells.length === 0) return null;

  return (
    <section id="contact" aria-label="Contact links">
      <SectionDivider />
      <div className="flex divide-x divide-border-subtle">
        {cells.map((cell) => (
          <a
            key={cell.key}
            href={cell.href}
            target={cell.external ? "_blank" : undefined}
            rel={cell.external ? "noopener noreferrer" : undefined}
            className="flex flex-1 items-center justify-center gap-2.5 bg-bg px-5 py-5"
          >
            <span
              className={`flex size-8 items-center justify-center rounded-lg border ${
                cell.accent
                  ? "border-border-default bg-surface-3 text-accent"
                  : "border-border-icon bg-surface-icon-alt text-text-secondary"
              }`}
            >
              {cell.icon}
            </span>
            <span
              className={`text-[13px] font-semibold ${cell.accent ? "text-accent" : "text-text-secondary"}`}
            >
              {cell.label}
            </span>
            {cell.external ? (
              <ArrowUpRightIcon size={14} className="text-text-secondary" />
            ) : null}
          </a>
        ))}
      </div>
    </section>
  );
}
