import { Icon } from "@iconify/react";
import avatar from "../../assets/avatar.png";
import TelegramIcon from "@iconify-react/line-md/telegram";
import "./AboutCard.scss";

const TechPill = ({ icon, label, highlight }) => (
  <div className={`tech-pill ${highlight ? "tech-pill--highlight" : ""}`}>
    <Icon icon={icon} width={26} height={26} />
    <span>{label}</span>
  </div>
);

const AboutCard = () => {
  const scrollToContact = () => {
    const contactSection = document.querySelector('.contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="about-card bento-card">
      <div className="about-card__top">
        <img src={avatar} alt="Tejas Wasnik" className="about-card__avatar" />
        <div className="about-card__identity">
          <div className="about-card__freelance">
            <span className="about-card__freelance-dot" />
            <span>Available for Freelance</span>
          </div>
          <h2 className="about-card__name">Tejas Wasnik</h2>
          <p className="about-card__handle">@tezus</p>
        </div>
      </div>

      <div className="about-card__bio">
        <span className="about-card__bio-text">
          I build production-ready web using
        </span>
        <TechPill icon="material-icon-theme:react" label="React" highlight />
        <span className="about-card__bio-comma">,</span>
        <TechPill icon="skill-icons:javascript" label="JavaScript" />
        <span className="about-card__bio-comma">,</span>
        <TechPill icon="devicon:nodejs" label="Node.js" />
        <span className="about-card__bio-and">and</span>
        <TechPill icon="skill-icons:mongodb" label="MongoDB" />
      </div>

      <div className="button">
        <button onClick={scrollToContact}>
          <TelegramIcon height="1em" />
          Contact Me
        </button>
      </div>
    </div>
  );
};

export default AboutCard;
