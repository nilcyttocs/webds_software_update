import React, { useEffect, useRef, useState } from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import { OSInfo, WebDSService } from "@webds/service";

import { Landing } from "./widget_landing";

import { Manual } from "./widget_manual";

import { requestAPI } from "./handler";

export enum Page {
  Landing = "LANDING",
  Manual = "MANUAL"
}

export interface Tarball {
  tarball: File;
  manifest: File;
}

const SSE_CLOSED = 2;

let eventSource: EventSource | undefined = undefined;

const dropboxLocation = "/var/spool/syna/softwareupdater";

const logLocation = "Synaptics/_links/Update_Daemon_Log";

let alertMessage = "";

const alertMessageUploadTarball = "Failed to upload tarball files to dropbox.";

let progressPromise: Promise<string>;

const SoftwareUpdateContainer = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [page, setPage] = useState<Page>(Page.Landing);
  const [osInfo, setOSInfo] = useState<OSInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [tarballAuto, setTarballAuto] = useState<Tarball | null>(null);
  const [tarballManual, setTarballManual] = useState<Tarball | null>(null);

  const updateStatusRef = useRef(updateStatus);

  const { commands, shell } = props.frontend;

  const eventHandler = (event: any) => {
    const data = JSON.parse(event.data);
    const status = data.status.toLowerCase();
    setUpdateStatus(status);
    updateStatusRef.current = status;
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState !== SSE_CLOSED) {
      eventSource.removeEventListener("software-update", eventHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const errorHandler = (error: any) => {
    removeEvent();
    console.error(`Error - GET /webds/software-update\n${error}`);
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }

    eventSource = new window.EventSource("/webds/software-update");
    eventSource.addEventListener("software-update", eventHandler, false);
    eventSource.addEventListener("error", errorHandler, false);
  };

  const updateOSInfo = () => {
    setOSInfo(props.service.pinormos.getOSInfo());
  };

  const monitorUpdate = (): Promise<string> => {
    progressPromise = new Promise(function (resolve, reject) {
      const checkProgress = () => {
        if (updateStatusRef.current === "idle") {
          setUpdateStatus("");
          updateStatusRef.current = "";
          removeEvent();
          resolve("done");
        } else {
          setTimeout(checkProgress, 500);
        }
      };
      setTimeout(checkProgress, 500);
    });
    addEvent();
    return progressPromise;
  };

  const uploadTarball = async (tarball: File, manifest: File) => {
    if (!tarball || !manifest) {
      return;
    }

    const formData = new FormData();
    formData.append("files", tarball);
    formData.append("files", manifest);
    formData.append("location", dropboxLocation);

    try {
      await requestAPI<any>("filesystem", {
        body: formData,
        method: "POST"
      });
    } catch (error) {
      console.error(`Error - POST /webds/filesystem\n${error}`);
      alertMessage = alertMessageUploadTarball;
      setAlert(true);
      return Promise.reject("Failed to upload tarball files to dropbox");
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

  const changePage = (newPage: Page) => {
    setPage(newPage);
  };

  const displayPage = (): JSX.Element | null => {
    switch (page) {
      case Page.Landing:
        return (
          <Landing
            showLog={showLog}
            changePage={changePage}
            tarball={tarballAuto}
            setTarball={setTarballAuto}
            uploadTarball={uploadTarball}
            monitorUpdate={monitorUpdate}
            updateStatus={updateStatus}
            osInfo={osInfo}
            updateOSInfo={updateOSInfo}
          />
        );
      case Page.Manual:
        return (
          <Manual
            showLog={showLog}
            changePage={changePage}
            tarball={tarballManual}
            setTarball={setTarballManual}
            uploadTarball={uploadTarball}
            monitorUpdate={monitorUpdate}
            updateStatus={updateStatus}
            updateOSInfo={updateOSInfo}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      updateOSInfo();
      setInitialized(true);
    };
    initialize();
    return () => {
      removeEvent();
    };
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      <ThemeProvider theme={webdsTheme}>
        {alert && (
          <Alert
            severity="error"
            onClose={() => setAlert(false)}
            sx={{ marginBottom: "16px", whiteSpace: "pre-wrap" }}
          >
            {alertMessage}
          </Alert>
        )}
        {initialized ? (
          displayPage()
        ) : (
          <>
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
      <div id={this.id + "_container"} className="jp-webds-widget-container">
        <div id={this.id + "_content"} className="jp-webds-widget">
          <SoftwareUpdateContainer
            frontend={this.frontend}
            service={this.service}
          />
        </div>
        <div className="jp-webds-widget-shadow jp-webds-widget-shadow-top"></div>
        <div className="jp-webds-widget-shadow jp-webds-widget-shadow-bottom"></div>
      </div>
    );
  }
}
