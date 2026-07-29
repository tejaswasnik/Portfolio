import Hero from "./components/Hero/Hero";
import BentoGrid from "./components/Bento/BentoGrid";
import Projects from "./components/Projects/Projects";
import Contact from "./components/Contact/Contact";
import "./main.scss";

const App = () => {
  return (
    <div className="app">
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
