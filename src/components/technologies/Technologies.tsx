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
    <div className="">
      <div className="relative m-auto grid h-full max-w-6xl grid-cols-6 gap-4 md:grid-cols-12">
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
  )
}
