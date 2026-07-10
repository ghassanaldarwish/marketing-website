import ArchitectureShowcase from "@/components/architectureShowcase/ArchitectureShowcase"
import CoreExpertise from "@/components/coreExpertise/CoreExpertise"
import EngineeringBeyondCode from "@/components/engineeringBeyondCode/EngineeringBeyondCode"
import FeaturedEngineering from "@/components/featuredEngineering/FeaturedEngineering"
import FinalCTA from "@/components/finalCTA/FinalCTA"
import Hero from "@/components/hero/Hero"
import LatestArticles from "@/components/latestArticles/LatestArticles"
import SelectedProjects from "@/components/selectedProjects/SelectedProjects"
import Technologies from "@/components/technologies/Technologies"
import GridBackground from "@/components/ui/GridBackground"
import WhyWorkWithMe from "@/components/whyWorkWithMe/WhyWorkWithMe"

export default function Page() {
  return (
    <div className="relative">
      <div className="relative">
        <GridBackground />
        <Hero />

        <Technologies />
        <EngineeringBeyondCode />
      </div>

      <CoreExpertise />
      <FeaturedEngineering />
      <SelectedProjects />
      <ArchitectureShowcase />
      <LatestArticles />
      <WhyWorkWithMe />
      <FinalCTA />
    </div>
  )
}
