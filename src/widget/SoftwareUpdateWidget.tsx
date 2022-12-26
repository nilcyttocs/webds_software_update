import React from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import { WebDSService } from "@webds/service";

import SoftwareUpdateComponent from "./SoftwareUpdateComponent";

export let webdsService: WebDSService;

export class SoftwareUpdateWidget extends ReactWidget {
  id: string;
  frontend: JupyterFrontEnd;
  service: WebDSService;

  constructor(id: string, app: JupyterFrontEnd, service: WebDSService) {
    super();
    this.id = id;
    this.frontend = app;
    this.service = service;
  }

  render(): JSX.Element {
    webdsService = this.service;
    return (
      <div id={this.id + "_component"}>
        <SoftwareUpdateComponent frontend={this.frontend} />
      </div>
    );
  }
}

export default SoftwareUpdateWidget;
