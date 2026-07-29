import { Icon } from "@iconify/react";
import "./SkillsCard.scss";

const SkillBadge = ({ icon, label }) => (
  <div className="skill-badge">
    <Icon icon={icon} width={26} height={26} />
    <span>{label}</span>
  </div>
);

const SkillsCard = () => {
  return (
    <div className="skills-card bento-card">
      <div className="skills-card__header">
        <Icon icon="ri:stack-fill" width={20} height={20} color="#6A6A6A" />
        <span className="skills-card__label">SKILLS &amp; STACK</span>
      </div>

      <div className="skills-card__section">
        <p className="skills-card__section-label">FRONTEND</p>
        <div className="skills-card__row">
          <SkillBadge icon="material-icon-theme:react" label="React" />
          <SkillBadge icon="material-icon-theme:html" label="HTML" />
          <SkillBadge icon="selfhst:css3" label="CSS" />
        </div>
        <div className="skills-card__row">
          <SkillBadge icon="simple-icons:gsap" label="GSAP" />
          <SkillBadge icon="skill-icons:javascript" label="JavaScript" />
        </div>
      </div>

      <div className="skills-card__section">
        <p className="skills-card__section-label">BACKEND</p>
        <div className="skills-card__row">
          <SkillBadge icon="devicon:nodejs" label="Node.js" />
          <SkillBadge icon="griddy-icons:expressjs" label="Express.js" />
        </div>
        <div className="skills-card__row">
          <SkillBadge icon="skill-icons:mongodb" label="MongoDB" />
          <SkillBadge icon="simple-icons:redis" label="Redis" />
        </div>
      </div>

      <div className="skills-card__section">
        <p className="skills-card__section-label">TOOLS</p>
        <div className="skills-card__row">
          <SkillBadge icon="mdi:git" label="Git" />
          <SkillBadge icon="devicon:figma" label="Figma" />
          <SkillBadge icon="devicon:postman" label="Postman" />
        </div>
      </div>
    </div>
  );
};

export default SkillsCard;
