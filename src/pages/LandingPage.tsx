import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import Problem from "../components/landing/Problem";
import USPs from "../components/landing/USPs";
import HowItWorks from "../components/landing/HowItWorks";
import Showcase from "../components/landing/Showcase";
import CompetitorTable from "../components/landing/CompetitorTable";
import SocialProof from "../components/landing/SocialProof";
import Pricing from "../components/landing/Pricing";
import BossBanner from "../components/landing/BossBanner";
import FAQ from "../components/landing/FAQ";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

import { ThemeProvider } from "../components/landing/ThemeContext";

export function LandingPage() {
  return (
    <ThemeProvider>
      <main className="relative flex flex-col font-sans w-full min-h-screen">
        <Header />
        <div className="w-full flex-grow pt-16">
          <Hero />
          <Problem />
          <USPs />
          <HowItWorks />
          <Showcase />
          <CompetitorTable />
          <SocialProof />
          <Pricing />
          <BossBanner />
          <FAQ />
          <FinalCTA />
        </div>
        <Footer />
      </main>
    </ThemeProvider>
  );
}
