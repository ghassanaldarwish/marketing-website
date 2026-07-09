import ArchitectureShowcase from "@/components/architectureShowcase/ArchitectureShowcase"
import CoreExpertise from "@/components/coreExpertise/CoreExpertise"
import EngineeringBeyondCode from "@/components/engineeringBeyondCode/EngineeringBeyondCode"
import FeaturedEngineering from "@/components/featuredEngineering/FeaturedEngineering"
import FinalCTA from "@/components/finalCTA/FinalCTA"
import Hero from "@/components/hero/Hero"
import LatestArticles from "@/components/latestArticles/LatestArticles"
import SelectedProjects from "@/components/selectedProjects/SelectedProjects"
import Technologies from "@/components/technologies/Technologies"
import WhyWorkWithMe from "@/components/whyWorkWithMe/WhyWorkWithMe"

export default function Page() {
  return (
    <div className="relative">
      <Hero />

      <Technologies />

      <EngineeringBeyondCode/>
      <CoreExpertise/>
      <FeaturedEngineering/>
      <SelectedProjects/>
      <ArchitectureShowcase/>
      <LatestArticles/>
      <WhyWorkWithMe/>
      <FinalCTA/>
    </div>
  )
}
