import { setRequestLocale } from "next-intl/server";
import { NavbarServer } from "@/components/sections/NavbarServer";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import { MarketProblem } from "@/components/sections/MarketProblem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Experience } from "@/components/sections/Experience";
import { WelcomeBand } from "@/components/sections/WelcomeBand";
import { Benefits } from "@/components/sections/Benefits";
import { Integrations } from "@/components/sections/Integrations";
import { WhoPackages } from "@/components/sections/WhoPackages";
import { Pricing } from "@/components/sections/Pricing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <NavbarServer />
      <main id="main">
        <Hero />
        <MarketProblem />
        <HowItWorks />
        <Experience />
        <WelcomeBand />
        <Benefits />
        <Integrations />
        <WhoPackages />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
