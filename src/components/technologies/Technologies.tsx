import { useTranslations } from "next-intl"

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
  const t = useTranslations("home.technologies")

  return (
    <section className="relative">
      <div
        className="relative m-auto flex h-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:gap-16 lg:py-24"
        data-layout-container="technologies"
      >
        <div className="flex flex-col gap-2 lg:gap-4">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div
          className="grid grid-cols-5 gap-6 md:grid-cols-8 md:gap-8 xl:grid-cols-12"
          data-testid="technology-grid"
        >
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
