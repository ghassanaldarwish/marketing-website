import React from "react"
import Docker from "./docker"
import Kubernetes from "./kubernetes"
import Ansible from "./ansible"
import Nodejs from "./nodejs"
import Python from "./python"
import Mongodb from "./mongodb"
import PostgreSQL from "./postgreSQL"
import Terraform from "./terraform"
import Jenkins from "./jenkins"
import Nginx from "./nginx"
import Bash from "./bash"
import Typescript from "./typescript"
import Kafka from "./kafka"

import Traefik from "./traefik"
import Qdrant from "./qdrant"
import OpenAI from "./openAI"
import GitHubActions from "./gitHubActions"
import Numpy from "./numpy"
import Mistral from "./mistral"
import GoogleCloud from "./googleCloud"
import Cloudflare from "./cloudflare"
import Jest from "./jest"
import Hermes from "./hermes"
import Gitlab from "./gitlab"

export default function Technologies() {
  return (
    <section className="relative lg:px-0">
      <div className="m-auto flex h-full max-w-6xl flex-col gap-4 px-2 py-8 lg:gap-8 lg:px-0 lg:py-16">
        <div className="flex flex-col gap-2 text-center lg:gap-4">
          <h1 className="text-2xl lg:text-6xl">Trusted Technologies</h1>

          <p className="text-md md:min-h-10 lg:text-xl">
            Technologies I&apos;ve used to build scalable software and AI
            solutions in production.
          </p>
        </div>
        <div className="grid grid-cols-6 gap-4 md:grid-cols-12">
          <Docker />
          <Kubernetes />
          <Ansible />
          <Nodejs />
          <Typescript className="fill-primary" />
          <Python />
          <Mongodb />
          <Traefik />
          <Hermes />

          <Cloudflare />
          <Gitlab />
          <Bash />

          <PostgreSQL />
          <Terraform />
          <Jenkins />
          <Kafka />
          <Nginx />

          <Qdrant />
          <OpenAI />
          <GitHubActions />
          <Numpy />
          <Mistral />
          <GoogleCloud />
          <Jest />
        </div>
      </div>
    </section>
  )
}

//  <section className="relative m-auto flex h-40 w-full max-w-6xl flex-col">
//         <div className="-top-10 hidden w-full lg:absolute lg:left-1/2 lg:block lg:-translate-x-1/2">
//           <div className="m-auto max-w-6xl bg-background/10 px-2 backdrop-blur-xs lg:py-2 lg:text-left lg:text-lg">
//             <Technologies />
//           </div>
//         </div>
//       </section>
