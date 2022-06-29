import React from "react";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

const WIDTH = 800;
const HEIGHT_TITLE = 70;
const HEIGHT_CONTENT = 200;
const HEIGHT_CONTROLS = 100;

const Input = styled("input")({
  display: "none"
});

export const Landing = (props: any): JSX.Element => {
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
          <Button
            variant="text"
            sx={{
              position: "absolute",
              top: "50%",
              left: "8px",
              transform: "translate(0%, -50%)"
            }}
          >
            <Typography variant="body2" sx={{ textDecoration: "underline" }}>
              Help
            </Typography>
          </Button>
        </Box>
        <Box
          sx={{
            width: WIDTH + "px",
            height: HEIGHT_CONTENT + "px",
            position: "relative",
            bgcolor: "section.main"
          }}
        >
          <div
            style={{
              width: "600px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
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
                  onChange={props.selectFile}
                />
                <Button
                  component="span"
                  sx={{ width: "100px", marginRight: "24px" }}
                >
                  Tarball
                </Button>
                <TextField
                  id="file-software-update-tarball"
                  value={props.tarball ? props.tarball.name : ""}
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
                  onChange={props.selectFile}
                />
                <Button
                  component="span"
                  sx={{ width: "100px", marginRight: "24px" }}
                >
                  Manifest
                </Button>
                <TextField
                  id="file-software-update-manifest"
                  value={props.manifest ? props.manifest.name : ""}
                  InputProps={{ readOnly: true }}
                  variant="standard"
                  sx={{ width: "100%" }}
                />
              </label>
            </Stack>
          </div>
        </Box>
        <Box
          sx={{
            width: WIDTH + "px",
            height: HEIGHT_CONTROLS + "px",
            position: "relative",
            bgcolor: "section.main"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            <Stack spacing={5} direction="row">
              <Fab
                variant="extended"
                color="primary"
                size="medium"
                disabled={
                  props.updateButtonDisabled ||
                  props.tarball === null ||
                  props.manifest === null
                }
                onClick={props.doUpdate}
                sx={{ width: "200px" }}
              >
                <ArrowForwardIosRoundedIcon sx={{ mr: 2 }} />
                Update
              </Fab>
              <Fab onClick={props.showLog}>
                <ArticleRoundedIcon />
              </Fab>
            </Stack>
            <Snackbar
              open={props.snackBar}
              autoHideDuration={7000}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              message={props.snackBarMessage}
              onClose={props.closeSnackBar}
            />
          </div>
        </Box>
      </Stack>
    </>
  );
};
