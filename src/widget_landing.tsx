import React, { useState } from "react";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { requestAPI } from "./handler";

const WIDTH = 800;
const HEIGHT_TITLE = 70;
const HEIGHT_CONTENT = 200;
const HEIGHT_CONTROLS = 120;

const showHelp = false;

const sendSystemRebootRequest = async () => {
  let token: string;
  let dataToSend: any = {
    command: {
      action: "reboot",
      target: "rpi4"
    }
  };
  try {
    token = await requestAPI<any>("general", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/general\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to reboot system");
  }
  dataToSend.command.token = token;
  try {
    await requestAPI<any>("general", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/general\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to reboot system");
  }
};

export const Landing = (props: any): JSX.Element => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleOkayButton = async () => {
    try {
      await sendSystemRebootRequest();
    } catch (error) {
      console.error(error);
    }
    handleDialogClose();
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
          {props.osInfo.current.version >= props.osInfo.repo.version ||
          !props.osInfo.repo.downloaded ? (
            <Typography
              variant="h4"
              sx={{
                margin: "24px",
                color: (theme) => theme.palette.text.disabled
              }}
            >
              No Update Available
            </Typography>
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
                !props.osInfo.repo.downloaded
              }
              onClick={async () => {
                setOpenDialog(true);
              }}
              sx={{ width: "150px" }}
            >
              Install Now
            </Button>
          </div>
          <Fab
            onClick={props.showLog}
            sx={{
              position: "absolute",
              top: "50%",
              right: "24px",
              transform: "translate(0%, -50%)",
              display: "none"
            }}
          >
            <ArticleRoundedIcon />
          </Fab>
        </Box>
      </Stack>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Install PinormOS Version {props.osInfo.repo.version}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click Okay to reboot the DSDK and install PinormOS version{" "}
            {props.osInfo.repo.version}. The installation process may take
            several minutes to complete. During installation, ADB connection to
            the DSDK may be unavailable.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ width: "100px" }}>
            Cancel
          </Button>
          <Button onClick={handleOkayButton} sx={{ width: "100px" }}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
