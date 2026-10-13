import SectionDivider from "@/components/ui/SectionDivider";
import MessageMeTrigger from "@/components/public/MessageMeTrigger";
import TrackedLink from "@/components/public/TrackedLink";
import {
  MailIcon,
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";

/**
 * Contact links row (Figma 10:1085). "Message me" opens the real
 * contact modal (step 5) unconditionally — it doesn't need a visitor-
 * facing email on file, since it emails siteSettings.notificationEmail,
 * not profile.socialLinks.email. The social cells still skip empty
 * links entirely per PRD 2.2.4.
 * @param {{ socialLinks: { email?: string, github?: string, linkedin?: string, twitter?: string } | undefined }} props
 */
export default function ContactLinksRow({ socialLinks }) {
  const links = socialLinks ?? {};
  const cells = [
    links.github
      ? {
          key: "github",
          href: links.github,
          icon: <GithubIcon size={16} />,
          label: "GitHub",
          external: true,
          target: "GitHub profile",
        }
      : null,
    links.linkedin
      ? {
          key: "linkedin",
          href: links.linkedin,
          icon: <LinkedinIcon size={16} />,
          label: "LinkedIn",
          external: true,
          target: "LinkedIn",
        }
      : null,
    links.twitter
      ? {
          key: "twitter",
          href: links.twitter,
          icon: <TwitterIcon size={14} />,
          label: "Twitter",
          external: true,
          target: "Twitter / X",
        }
      : null,
  ].filter(Boolean);

  return (
    <section id="contact" aria-label="Contact links">
      <SectionDivider />
      <div className="grid grid-cols-2 divide-x divide-y divide-border-subtle md:flex md:divide-y-0">
        <MessageMeTrigger icon={<MailIcon size={16} />} label="Message me" />
        {cells.map((cell) => (
          <TrackedLink
            key={cell.key}
            trackTarget={cell.target}
            href={cell.href}
            target={cell.external ? "_blank" : undefined}
            rel={cell.external ? "noopener noreferrer" : undefined}
            className="lift press flex flex-1 items-center justify-center gap-2.5 bg-bg px-5 py-5"
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
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}
