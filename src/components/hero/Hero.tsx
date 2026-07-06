import Image from "next/image"
 
import { Button } from "../ui/button"
import { TypewriterEffectSmooth } from "./TypewriterEffect";

export default function Hero() {
  const words = [
    {
      text: "Plan",
    },
    {
      text: "with",
    },
    {
      text: "AI.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return <section className=" w-screen ">

    <div className="max-w-6xl  m-auto h-full flex relative">
      <div className="self-center flex flex-col gap-8 w-1/2">
<div>  <h1 className="text-6xl mb-4">Know your cash</h1>
        <TypewriterEffectSmooth words={words} /></div>
      
        <p>Stay on top of every transaction, invoice, and forecast in one clean view.</p>
        <div className="flex gap-4 items-center">
          <div>
            <Button size='lg' className="text-lg">Contact Me</Button>
          </div>
          
         <div>Icons</div> 
          </div>
    
      </div>
      <div >

      <Image
        src="/hero.png"
        width={794}
        height={930}
        className="h-full w-full pt-14 "
        alt="Ghassan Hero"
      loading="eager"
      />

      </div>
    </div>

  </section>
}
