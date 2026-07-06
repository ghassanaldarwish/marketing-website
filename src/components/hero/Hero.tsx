import Image from "next/image"
 
import { Button } from "../ui/button"
// import { TypewriterEffectSmooth } from "./TypewriterEffect";
import { FlipWords } from "./FlipWords";
import { ColourfulText } from "./ColourfulText";
import { cn } from "@/lib/utils";

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
  const flipWords = ["better", "cute", "beautiful", "modern"];
  return  <div className="relative flex h-[50rem] w-full items-center justify-center bg-white dark:bg-black">
  <div
    className={cn(
      "absolute inset-0",
      "[background-size:40px_40px]",
      "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
      "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
    )}
  />
  {/* Radial gradient for the container to give a faded look */}
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
  <div className="max-w-6xl  m-auto h-full flex relative">
      <div className="self-center flex flex-col gap-8 w-1/2">




        <div className="">
      <h1 className="text-6xl mx-auto ">
      Know 
        <FlipWords words={flipWords} /> <br />
        Plan with <ColourfulText text="AI." /> 
        {/* <TypewriterEffectSmooth words={words} /> */}
      </h1>
    </div>
      



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
</div>
  
  
  
  

}
