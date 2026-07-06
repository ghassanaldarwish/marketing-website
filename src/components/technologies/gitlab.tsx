import React from "react";
import { cn } from "@/lib/utils";

export default function Gitlab({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      className={cn("w-14 h-14 md:w-24 md:h-24", className)}
      viewBox="0 0 48 48"
    >
      <path fill="#e53935" d="M24 43L16 20 32 20z"></path>
      <path fill="#ff7043" d="M24 43L42 20 32 20z"></path>
      <path fill="#e53935" d="M37 5L42 20 32 20z"></path>
      <path fill="#ffa726" d="M24 43L42 20 45 28z"></path>
      <path fill="#ff7043" d="M24 43L6 20 16 20z"></path>
      <path fill="#e53935" d="M11 5L6 20 16 20z"></path>
      <path fill="#ffa726" d="M24 43L6 20 3 28z"></path>
    </svg>
  );
}
