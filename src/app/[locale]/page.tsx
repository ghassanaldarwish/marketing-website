import ArchitectureShowcase from "@/components/architectureShowcase/ArchitectureShowcase"
import CoreExpertise from "@/components/coreExpertise/CoreExpertise"
import EngineeringBeyondCode from "@/components/engineeringBeyondCode/EngineeringBeyondCode"
import FinalCTA from "@/components/finalCTA/FinalCTA"
import Hero from "@/components/hero/Hero"
import SelectedProjects from "@/components/selectedProjects/SelectedProjects"
import Technologies from "@/components/technologies/Technologies"
import GridBackground from "@/components/ui/GridBackground"

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
      <SelectedProjects />
      <ArchitectureShowcase />
      <FinalCTA />
    </div>
  )
}
