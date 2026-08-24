import Hero from "@/components/home/Hero";
import SearchBar from "@/components/home/SearchBar";
import ExploreServices from "@/components/home/ExploreServices";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import ProjectsSection from "@/components/home/ProjectsSection";
import PopularLocations from "@/components/home/PopularLocations";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import InsightsSection from "@/components/home/InsightsSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <ExploreServices />
      <FeaturedProperties />
      <ProjectsSection />
      <PopularLocations />
      <WhyChooseUs />
      <InsightsSection />
      <CtaBanner />
    </>
  );
}
