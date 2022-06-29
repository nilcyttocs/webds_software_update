import React, { useEffect, useState } from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import { WebDSService } from "@webds/service";

import { Landing } from "./widget_landing";

import { requestAPI } from "./handler";

let alertMessage = "";

const dropboxLocation = "/var/spool/syna/softwareupdater";

const logLocation = "Synaptics/_links/Update_Daemon_Log";

const successMessage =
  "Files have been placed in Software Updater dropbox. Allow 5 minutes for update process to complete. System may reset as part of update process.";

const failureMessage = "Error occurred during update process.";

const SoftwareUpdateContainer = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [tarball, setTarball] = useState<File | null>(null);
  const [manifest, setManifest] = useState<File | null>(null);
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState<boolean>(
    false
  );
  const [snackBar, setSnackBar] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>("");

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

    const formData = new FormData();
    formData.append("files", tarball);
    formData.append("files", manifest);
    formData.append("location", dropboxLocation);

    try {
      await requestAPI<any>("filesystem", {
        body: formData,
        method: "POST"
      });
      setSnackBarMessage(successMessage);
    } catch (error) {
      console.error(`Error - POST /webds/filesystem\n${error}`);
      setSnackBarMessage(failureMessage);
    } finally {
      setSnackBar(true);
      setUpdateButtonDisabled(false);
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
    setSnackBar(false);
  };

  const initialize = async () => {
    setInitialized(true);
  };

  useEffect(() => {
    initialize();
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      <ThemeProvider theme={webdsTheme}>
        {initialized ? (
          <Landing
            tarball={tarball}
            manifest={manifest}
            selectFile={selectFile}
            doUpdate={doUpdate}
            showLog={showLog}
            snackBar={snackBar}
            snackBarMessage={snackBarMessage}
            closeSnackBar={closeSnackBar}
            updateButtonDisabled={updateButtonDisabled}
          />
        ) : (
          <>
            {alert && (
              <Alert
                severity="error"
                onClose={() => setAlert(false)}
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {alertMessage}
              </Alert>
            )}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }}
            >
              <CircularProgress color="primary" />
            </div>
          </>
        )}
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
