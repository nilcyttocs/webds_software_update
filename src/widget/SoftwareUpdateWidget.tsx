import React from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import { WebDSService } from "@webds/service";

import SoftwareUpdateComponent from "./SoftwareUpdateComponent";

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
    return (
      <div id={this.id + "_component"}>
        <SoftwareUpdateComponent
          frontend={this.frontend}
          service={this.service}
        />
      </div>
    );
  }
}

export default SoftwareUpdateWidget;
