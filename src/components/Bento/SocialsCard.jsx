import { Icon } from "@iconify/react";
import "./SocialsCard.scss";

const SocialItem = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="social-item"
    aria-label={label}
  >
    <Icon icon={icon} width={54} height={54} color="white" />
    <span className="social-item__label">{label}</span>
  </a>
);

const SocialsCard = () => {
  return (
    <div className="socials-card bento-card">
      <div className="socials-card__grid">
        <SocialItem icon="mdi:github" label="GitHub" href="https://github.com/tezus" />
        <SocialItem icon="mdi:linkedin" label="Linkedin" href="https://linkedin.com/in/tejaswasnik" />
        <SocialItem icon="mingcute:social-x-line" label="X" href="https://x.com" />
        <SocialItem icon="devicon-plain:leetcode" label="LeetCode" href="https://leetcode.com" />
      </div>
    </div>
  );
};

export default SocialsCard;
