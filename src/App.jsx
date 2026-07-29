import DotGrid from "./components/Background/components/DotGrid";
import Hero from "./components/Hero/Hero";
import BentoGrid from "./components/Bento/BentoGrid";
import Projects from "./components/Projects/Projects";
import Contact from "./components/Contact/Contact";
import "./main.scss";

const App = () => {
  return (
    <div className="app">
      {/* Interactive dot-grid background */}
      <div className="background">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#2F293A"
          activeColor="#A855F7"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

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
