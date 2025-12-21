import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import ContestsSection from "@/components/ContestsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      <Navbar />
      <main>
        <Hero />
        <ContestsSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
