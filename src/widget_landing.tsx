import React, { useState } from "react";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

import { Page } from "./widget_container";

const WIDTH = 800;
const HEIGHT_TITLE = 70;
const HEIGHT_CONTENT = 200;
const HEIGHT_CONTROLS = 100;

const showHelp = false;

let alertMessage = "";
const alertMessageDownloadTarball = "Failed to download tarball from server.";
const alertMessageDownloadManifest = "Failed to download manifest from server.";

export const Landing = (props: any): JSX.Element => {
  const [alert, setAlert] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");

  const doUpdate = async () => {
    setUpdating(true);

    let tarballFile: File;
    let manifestFile: File;

    if (!props.tarball) {
      setProgress("Downloading Tarball from Server");
      const requestHeaders: HeadersInit = new Headers();
      requestHeaders.set("Content-Type", "application/x-tgz");

      let request = new Request(props.osInfo.repo.tarball, {
        method: "GET",
        mode: "cors",
        headers: requestHeaders,
        referrerPolicy: "no-referrer"
      });
      let response: Response;
      try {
        response = await fetch(request);
      } catch (error) {
        console.error(`Error - GET ${props.osInfo.repo.tarball}\n${error}`);
        alertMessage = alertMessageDownloadTarball;
        setAlert(true);
        setProgress("");
        setUpdating(false);
        return;
      }
      const tarballBlob = await response.blob();
      let tarballName = props.osInfo.repo.tarball.split("/");
      tarballName = tarballName[tarballName.length - 1];
      tarballFile = new File([tarballBlob], tarballName);
      console.log(tarballFile);

      request = new Request(props.osInfo.repo.manifest, {
        method: "GET",
        mode: "cors",
        headers: requestHeaders,
        referrerPolicy: "no-referrer"
      });
      try {
        response = await fetch(request);
      } catch (error) {
        console.error(`Error - GET ${props.osInfo.repo.manifest}\n${error}`);
        alertMessage = alertMessageDownloadManifest;
        setAlert(true);
        setProgress("");
        setUpdating(false);
        return;
      }
      const manifestBlob = await response.blob();
      let manifestName = props.osInfo.repo.manifest.split("/");
      manifestName = manifestName[manifestName.length - 1];
      manifestFile = new File([manifestBlob], manifestName);
      console.log(manifestFile);

      props.setTarball({
        tarball: tarballFile,
        manifest: manifestFile
      });
    } else {
      tarballFile = props.tarball.tarball;
      manifestFile = props.tarball.manifest;
    }

    try {
      setProgress("Transferring Tarball Files to Dropbox");
      await props.uploadTarball(tarballFile, manifestFile);
      setProgress("Performing Update");
      await props.monitorUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setProgress("");
      setUpdating(false);
      props.updateOSInfo();
    }
  };

  return (
    <>
      {alert && (
        <Alert
          severity="error"
          onClose={() => setAlert(false)}
          sx={{ marginBottom: "16px", whiteSpace: "pre-wrap" }}
        >
          {alertMessage}
        </Alert>
      )}
      <Stack spacing={2}>
        <Box
          sx={{
            width: WIDTH + "px",
            height: HEIGHT_TITLE + "px",
            position: "relative",
            bgcolor: "section.main"
          }}
        >
          <Typography
            variant="h5"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            DSDK Update
          </Typography>
          {showHelp && (
            <Button
              variant="text"
              sx={{
                position: "absolute",
                top: "50%",
                left: "16px",
                transform: "translate(0%, -50%)"
              }}
            >
              <Typography variant="body2" sx={{ textDecoration: "underline" }}>
                Help
              </Typography>
            </Button>
          )}
        </Box>
        <Box
          sx={{
            width: WIDTH + "px",
            minHeight: HEIGHT_CONTENT + "px",
            position: "relative",
            bgcolor: "section.main",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {props.osInfo.current.version >= props.osInfo.repo.version ? (
            <Typography
              variant="h4"
              sx={{
                margin: "24px",
                color: (theme) => theme.palette.text.disabled
              }}
            >
              No Update Available
            </Typography>
          ) : updating ? (
            <div
              style={{
                margin: "24px"
              }}
            >
              <Typography variant="h5">
                {progress +
                  (props.updateStatus === ""
                    ? props.updateStatus
                    : ` (${props.updateStatus})`)}
              </Typography>
              <LinearProgress />
            </div>
          ) : (
            <Typography
              variant="h4"
              sx={{
                margin: "24px"
              }}
            >
              Version {props.osInfo.repo.version} Available
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: WIDTH + "px",
            minHeight: HEIGHT_CONTROLS + "px",
            position: "relative",
            bgcolor: "section.main",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              margin: "24px"
            }}
          >
            <Button
              disabled={
                props.osInfo.current.version >= props.osInfo.repo.version ||
                updating
              }
              onClick={async () => {
                setSnackbar(true);
                await doUpdate();
              }}
              sx={{ width: "200px" }}
            >
              Update
            </Button>
          </div>
          <Fab
            onClick={props.showLog}
            sx={{
              position: "absolute",
              top: "50%",
              right: "16px",
              transform: "translate(0%, -50%)"
            }}
          >
            <ArticleRoundedIcon />
          </Fab>
          <Button
            variant="text"
            disabled={updating}
            onClick={(event) => {
              if (event.detail < 3) {
                return;
              }
              props.changePage(Page.Manual);
            }}
            sx={{
              position: "absolute",
              bottom: "0px",
              left: "0px",
              cursor: "default",
              "&:hover": {
                backgroundColor: "transparent"
              }
            }}
          >
            <Typography></Typography>
          </Button>
        </Box>
      </Stack>
      <Snackbar
        open={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={10000}
        onClose={() => setSnackbar(false)}
      >
        <Alert severity="info" onClose={() => setSnackbar(false)}>
          Update in progress. This may take several minutes to complete.
        </Alert>
      </Snackbar>
    </>
  );
};
