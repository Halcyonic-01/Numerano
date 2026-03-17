import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Activities from './pages/Activities';
import Faculty from './pages/Faculty';
import Members from './pages/Members';
import Teams from './pages/Teams';
import Feedback from './pages/Feedback';
import BrainBuffPage from './pages/BrainBuffPage';
import SiteBackground from './components/SiteBackground';
import { motion, useScroll, useSpring } from 'framer-motion';

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteBackground />

      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-numerano-accent origin-left z-50"
          style={{ scaleX }}
        />

        <div className="pointer-events-auto">
          <Navbar />
        </div>

        <main className="flex-grow pointer-events-none">
          <Routes>
            <Route path="/" element={
              <>
                <section id="home" className="pointer-events-none"><Home /></section>
                <section id="teams" className="pointer-events-auto"><Teams /></section>
                <section id="activities" className="pointer-events-auto"><Activities /></section>
                <section id="faculty" className="pointer-events-auto"><Faculty /></section>
                <section id="members" className="pointer-events-auto"><Members /></section>
                <section id="feedback" className="pointer-events-auto"><Feedback /></section>
              </>
            } />
            <Route path="/brainbuff" element={<div className="pointer-events-auto"><BrainBuffPage /></div>} />
          </Routes>
        </main>

        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
