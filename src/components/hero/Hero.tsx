import Image from "next/image"
 
import { Button } from "../ui/button"
// import { TypewriterEffectSmooth } from "./TypewriterEffect";
import { FlipWords } from "./LayoutTextFlip";
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
  return  <div className="relative ">

  <div className="max-w-6xl  m-auto h-full flex relative">
      <div className="self-center flex flex-col gap-8 w-1/2">




        <div className="">
      <h1 className="text-6xl mx-auto ">
      Know 
        <FlipWords words={flipWords} /> <br />
        Plan with AI.
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
