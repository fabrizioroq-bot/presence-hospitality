import { setRequestLocale } from "next-intl/server";
import { NavbarServer } from "@/components/sections/NavbarServer";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import { MarketProblem } from "@/components/sections/MarketProblem";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <NavbarServer />
      <main id="main">
        <Hero />
        <MarketProblem />
      </main>
      <Footer />
    </>
  );
}
