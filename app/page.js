import Hero from "@/components/home/Hero";
import SearchBar from "@/components/home/SearchBar";
import StatsBar from "@/components/home/StatsBar";
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
      <div className="relative z-20 -mt-24 px-4 sm:-mt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SearchBar />
        </div>
      </div>
      <StatsBar />
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
