import Navbar from "@/components/Navbar";
import AboutSection from "@/components/landing/AboutSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PricingSection />
      <AboutSection />

    </main>
  );
}
