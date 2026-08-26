import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./components/Hero/Hero";
import BentoGrid from "./components/Bento/BentoGrid";
import Projects from "./components/Projects/Projects";
import Contact from "./components/Contact/Contact";
import ScrollProgress from "./components/ScrollProgress/ScrollProgress";
import "./main.scss";

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  useEffect(() => {
    // Refresh ScrollTrigger after all content loads
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="app">
      <ScrollProgress />
      <main className="content">
        {/* Hero */}
        <Hero />

        {/* Bento grid */}
        <section className="page-section">
          <BentoGrid />
        </section>

        {/* Featured projects */}
        <section className="page-section page-section--projects">
          <Projects />
        </section>

        {/* Contact */}
        <section className="page-section page-section--contact">
          <Contact />
        </section>
      </main>
    </div>
  );
};

export default App;
