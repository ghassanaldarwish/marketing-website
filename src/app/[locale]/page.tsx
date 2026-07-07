import Benefits from "@/components/benefits/Benefits"
import GridBackground from "@/components/gridBackground/GridBackground"
import Hero from "@/components/hero/Hero"
// import Technologies from "@/components/technologies/Technologies"

export default function Page() {
  return (
    <div className="">
      <div className="relative">
        <GridBackground />
        <Hero />
        <Benefits />
      </div>

      {/* <Technologies /> */}
    </div>
  )
}
