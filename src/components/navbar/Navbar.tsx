import React from "react"

const navbar = ['link 1', 'link 2','link 3', 'link 4']
export default function Navbar() {
  return <nav className="w-screen h-14 ">
    <div className="max-w-6xl bg-amber-500 m-auto h-full flex justify-between items-center">
     <div>logo</div>
   
     <ul className=" w-1/2 flex justify-center gap-4">
     {
     navbar.map((i)=>( <i key={i} className="bg-yellow-500 w-1/2 text-center">{i}</i>))
    }
     </ul>
     <div>sittings</div>
    </div>
  
    </nav>
}
