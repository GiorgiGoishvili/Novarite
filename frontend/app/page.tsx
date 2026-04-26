import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import MarketplacePreview from "@/components/MarketplacePreview";
import CreatorDashboardPreview from "@/components/CreatorDashboardPreview";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-nr-void">
      <Header />
      <Hero />
      <FeatureGrid />
      <MarketplacePreview />
      <CreatorDashboardPreview />
      <Footer />
    </main>
  );
}
