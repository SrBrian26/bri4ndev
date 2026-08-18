import { useEffect } from "react";
import { startHashNavigation } from "./lib/scroll";
import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import BackgroundMark from "./components/BackgroundMark";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";
import TMC from "./sections/TMC";

export default function App() {
  // Entrar por `/#about` debe llevar a la sección y dejar la URL limpia. Va
  // aquí, ya montado, porque antes las secciones todavía no existen en el DOM.
  useEffect(startHashNavigation, []);

  return (
    <div className="sm:min-h-screen pb-16 xl:pb-0">
      <Topbar />
      <Navbar />
      <main>
        <BackgroundMark mark="brand">
          <Hero />
          <About />
          <Projects />
        </BackgroundMark>

        <BackgroundMark mark="tmc">
          <TMC />
        </BackgroundMark>

        <BackgroundMark mark="brand">
          <Contact />
        </BackgroundMark>
      </main>
      <Footer />
    </div>
  );
}
