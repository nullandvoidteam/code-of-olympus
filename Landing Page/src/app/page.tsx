import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import USPs from "@/components/USPs";
import HowItWorks from "@/components/HowItWorks";
import Showcase from "@/components/Showcase";
import CompetitorTable from "@/components/CompetitorTable";
import SocialProof from "@/components/SocialProof";
import Pricing from "@/components/Pricing";
import BossBanner from "@/components/BossBanner";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
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
  );
}
