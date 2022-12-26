import React from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import SoftwareUpdateComponent from "./SoftwareUpdateComponent";

export class SoftwareUpdateWidget extends ReactWidget {
  id: string;
  frontend: JupyterFrontEnd;

  constructor(id: string, app: JupyterFrontEnd) {
    super();
    this.id = id;
    this.frontend = app;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <SoftwareUpdateComponent frontend={this.frontend} />
      </div>
    );
  }
}

export default SoftwareUpdateWidget;
