import React from "react";
import Docker from "./docker";
import Kubernetes from "./kubernetes";
import Ansible from "./ansible";
import Nodejs from "./nodejs";
import Reactjs from "./reactjs";
import Mongodb from "./mongodb";
import Tailwindcss from "./tailwindcss";
import Terraform from "./terraform";
import Jenkins from "./jenkins";
import Nginx from "./nginx";
import Git from "./git";
import Typescript from "./typescript";
import Kafka from "./kafka";

import Traefik from "./traefik";

import { InfiniteMovingCards } from "./infinite-moving-cards";

export default function Technologies() {
  return (
    <InfiniteMovingCards>
      <Docker />
      <Kubernetes />
      <Ansible />
      <Nodejs />
      <Typescript className="fill-primary" />
      <Reactjs />
      <Mongodb />
      <Traefik />
      <Tailwindcss />
      <Terraform />
      <Jenkins />
      <Kafka />
      <Nginx />
      <Git />
    </InfiniteMovingCards>
  );
}
