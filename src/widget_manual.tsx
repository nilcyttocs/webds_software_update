import React, { useState } from "react";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

import { Page } from "./widget_container";

const WIDTH = 800;
const HEIGHT_TITLE = 70;
const HEIGHT_CONTENT = 200;
const HEIGHT_CONTROLS = 100;

const showHelp = false;

const latestTarballLink =
  " https://confluence.synaptics.com/display/PRJRN/%5BPinormOS%5D+Latest+Release";

const Input = styled("input")({
  display: "none"
});

export const Manual = (props: any): JSX.Element => {
  const [snackbar, setSnackbar] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }

    switch (event.target.id) {
      case "button-software-update-tarball":
        props.setTarball({
          ...props.tarball,
          tarball: event.target.files[0]
        });
        break;
      case "button-software-update-manifest":
        props.setTarball({
          ...props.tarball,
          manifest: event.target.files[0]
        });
        break;
      default:
        break;
    }
  };

  const doUpdate = async () => {
    try {
      setUpdating(true);
      setProgress("Transferring Tarball Files to Dropbox");
      await props.uploadTarball(props.tarball.tarball, props.tarball.manifest);
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
          {updating ? (
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
            <>
              <div
                style={{
                  width: "600px",
                  margin: "24px"
                }}
              >
                <Stack spacing={3}>
                  <label
                    htmlFor="button-software-update-tarball"
                    style={{ display: "flex" }}
                  >
                    <Input
                      id="button-software-update-tarball"
                      type="file"
                      accept=".tgz"
                      onChange={selectFile}
                    />
                    <Button
                      component="span"
                      sx={{ width: "100px", marginRight: "24px" }}
                    >
                      Tarball
                    </Button>
                    <TextField
                      id="file-software-update-tarball"
                      value={
                        props.tarball && props.tarball.tarball
                          ? props.tarball.tarball.name
                          : ""
                      }
                      InputProps={{ readOnly: true }}
                      variant="standard"
                      sx={{ width: "100%" }}
                    />
                  </label>
                  <label
                    htmlFor="button-software-update-manifest"
                    style={{ display: "flex" }}
                  >
                    <Input
                      id="button-software-update-manifest"
                      type="file"
                      accept=".tgz"
                      onChange={selectFile}
                    />
                    <Button
                      component="span"
                      sx={{ width: "100px", marginRight: "24px" }}
                    >
                      Manifest
                    </Button>
                    <TextField
                      id="file-software-update-manifest"
                      value={
                        props.tarball && props.tarball.manifest
                          ? props.tarball.manifest.name
                          : ""
                      }
                      InputProps={{ readOnly: true }}
                      variant="standard"
                      sx={{ width: "100%" }}
                    />
                  </label>
                </Stack>
              </div>
              <Button
                variant="text"
                onClick={() =>
                  window.open(latestTarballLink, "_blank")?.focus()
                }
                sx={{
                  position: "absolute",
                  bottom: "0px",
                  right: "0px",
                  transform: "translate(0%, 0%)"
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ textDecoration: "underline" }}
                >
                  Latest Tarball
                </Typography>
              </Button>
            </>
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
                props.tarball === null ||
                props.tarball.tarball === null ||
                props.tarball.manifest === null ||
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
              props.changePage(Page.Landing);
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
