import React from "react"
import Logo from "./Logo"
import ModeToggle from "./ModeToggle"
import { FloatingNav } from "./FloatingNav";

const navbar = ['link 1', 'link 2','link 3', 'link 4']
export default function Navbar() {
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Contact",
      link: "#contact",
     
    },
  ];
  return <nav className="w-screen  ">
    <FloatingNav className="max-w-6xl bg-background m-auto  flex justify-between items-center rounded-xl px-2 fixed w-full h-(--navbar-height) top-2 left-1/2 -translate-x-1/2 z-50">
    
  <Logo/>
   
     <ul className=" w-1/2 flex justify-center  gap-10">
     {
     navbar.map((i)=>( <i key={i} className="text-center">{i}</i>))
    }
     </ul>
     <div>
     <ModeToggle/>
     </div>
    </FloatingNav>
  
    </nav>
}
