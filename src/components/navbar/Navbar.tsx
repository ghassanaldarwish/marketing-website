import React from "react"
import Logo from "./Logo"
import ModeToggle from "./ModeToggle"

const navbar = ['link 1', 'link 2','link 3', 'link 4']
export default function Navbar() {
  return <nav className="w-screen h-14 ">
    <div className="max-w-6xl  m-auto h-full flex justify-between items-center">
    
  <Logo/>
   
     <ul className=" w-1/2 flex justify-center  gap-10">
     {
     navbar.map((i)=>( <i key={i} className="text-center">{i}</i>))
    }
     </ul>
     <div>
     <ModeToggle/>
     </div>
    </div>
  
    </nav>
}
