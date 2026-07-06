import Image from "next/image"
import React from "react"
import { Button } from "../ui/button"

export default function Hero() {
  return <section className=" w-screen h-full">

    <div className="max-w-6xl  m-auto h-full flex">
      <div className="self-center flex flex-col gap-8 w-1/2">

        <h1 className="text-6xl">Know your cash. Plan with AI.</h1>
        <p>Stay on top of every transaction, invoice, and forecast in one clean view.</p>
        <div className="flex gap-4 items-center">
          <div>
            <Button size='lg'>Contact</Button>
          </div>
          
         <div>Icons</div> 
          </div>
    
      </div>
      <div >

      <Image
        src="/hero.png"
        width={714}
        height={950}
        alt="Ghassan Hero"
      loading="eager"
      />
      </div>
    </div>

  </section>
}
