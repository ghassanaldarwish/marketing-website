import Hero from "@/components/hero/Hero"
// import Technologies from "@/components/technologies/Technologies"

export default function Page() {
  return (
    <div className="relative">
      <Hero />

      {/* <section className="relative m-auto flex h-40 w-full max-w-6xl flex-col">
        <div className="-top-10 hidden w-full lg:absolute lg:left-1/2 lg:block lg:-translate-x-1/2">
          <div className="m-auto max-w-6xl bg-background/10 px-2 backdrop-blur-xs lg:py-2 lg:text-left lg:text-lg">
            <Technologies />
          </div>
        </div>
      </section> */}
    </div>
  )
}
