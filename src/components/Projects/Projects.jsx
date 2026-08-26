import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import ProjectCard from "./ProjectCard";
import "./Projects.scss";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: "PixelFeed",
    description: " A full-stack social media platform with secure authentication, cloud image uploads, likes, follows, and personalized user profiles.",
    image: "https://ik.imagekit.io/pgt5y5hyw/Capture.PNG", // Add your project image path here
    liveUrl: "https://pixelfeed.onrender.com/",
    repoUrl: "https://github.com/tejaswasnik/PixelFeed",
  },
];

const Projects = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading slide in from left
      if (headingRef.current) {
        gsap.from(headingRef.current, {
          x: -80,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Subtitle fade in
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Project cards stagger up
      const cards = sectionRef.current?.querySelectorAll(".project-card");
      if (cards && cards.length) {
        gsap.from(cards, {
          y: 80,
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="projects" ref={sectionRef}>
      <div className="projects__heading" ref={headingRef}>
        <Icon icon="grommet-icons:projects" width={29} height={29} color="white" />
        <h2 className="projects__title">Featured Projects</h2>
      </div>
      <p className="projects__subtitle" ref={subtitleRef}>A collection of my most ambitious full-stack projects</p>

      <div className="projects__grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
