import React, { useState } from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import { ThemeProvider } from "@mui/material/styles";

import { WebDSService } from "@webds/service";

import { SoftwareUpdateMui } from "./widget_mui";

import { requestAPI } from "./handler";

const dropboxLocation = "/var/spool/syna/softwareupdater";
const logLocation = "Synaptics/_links/Update_Daemon_Log";

const successMessage =
  "Files have been placed in Software Updater dropbox. \
  Allow 5 minutes for update process to complete. \
  System may reset as part of update process.";
const failureMessage = "Error occurred during update process.";

const SoftwareUpdateContainer = (props: any): JSX.Element => {
  const [tarball, setTarball] = useState<File | null>(null);
  const [manifest, setManifest] = useState<File | null>(null);
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState<boolean>(
    false
  );
  const [logButtonDisabled, setLogButtonDisabled] = useState<boolean>(false);
  const [snack, setSnack] = useState<boolean>(false);
  const [snackMessage, setSnackMessage] = useState<string>("");

  const { commands, shell } = props.frontend;

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }

    switch (event.target.id) {
      case "button-software-update-tarball":
        setTarball(event.target.files[0]);
        break;
      case "button-software-update-manifest":
        setManifest(event.target.files[0]);
        break;
      default:
        break;
    }
  };

  const doUpdate = async () => {
    if (!tarball || !manifest) {
      return;
    }

    setUpdateButtonDisabled(true);
    setLogButtonDisabled(false);

    const formData = new FormData();
    formData.append("files", tarball);
    formData.append("files", manifest);
    formData.append("location", dropboxLocation);

    try {
      const response = await requestAPI<any>("filesystem", {
        body: formData,
        method: "POST"
      });
      console.log(response);
      setSnackMessage(successMessage);
    } catch (error) {
      console.error(`Error - POST /webds/filesystem\n${error}`);
      setSnackMessage(failureMessage);
    } finally {
      setSnack(true);
      setUpdateButtonDisabled(false);
      setLogButtonDisabled(false);
    }
  };

  const showLog = async () => {
    commands
      .execute("docmanager:open", {
        path: logLocation,
        factory: "Editor",
        options: { mode: "split-right" }
      })
      .then((widget: any) => {
        widget.id = "update_daemon_log";
        widget.title.closable = true;
        if (!widget.isAttached) shell.add(widget, "main");
        shell.activateById(widget.id);
      });
  };

  const closeSnackBar = () => {
    setSnack(false);
  };

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      <ThemeProvider theme={webdsTheme}>
        <SoftwareUpdateMui
          tarball={tarball}
          manifest={manifest}
          updateButtonDisabled={updateButtonDisabled}
          logButtonDisabled={logButtonDisabled}
          snack={snack}
          snackMessage={snackMessage}
          selectFile={selectFile}
          doUpdate={doUpdate}
          showLog={showLog}
          closeSnackBar={closeSnackBar}
        />
      </ThemeProvider>
    </div>
  );
};

export class SoftwareUpdateWidget extends ReactWidget {
  frontend: JupyterFrontEnd | null = null;
  service: WebDSService | null = null;

  constructor(app: JupyterFrontEnd, service: WebDSService) {
    super();
    this.frontend = app;
    this.service = service;
  }

  render(): JSX.Element {
    return (
      <div className="jp-webds-widget">
        <SoftwareUpdateContainer
          frontend={this.frontend}
          service={this.service}
        />
      </div>
    );
  }
}
