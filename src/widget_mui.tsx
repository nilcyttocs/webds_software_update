import React from "react";

import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

const dividerWidth = 200 + 40 + 40;

export const SoftwareUpdateMui = (props: any): JSX.Element => {
  const Input = styled("input")({
    display: "none"
  });

  return (
    <>
      <Stack
        spacing={5}
        divider={
          <Divider
            orientation="horizontal"
            sx={{ width: dividerWidth + "px" }}
          />
        }
      >
        <Stack spacing={2}>
          <label htmlFor="button-software-update-tarball">
            <Input
              id="button-software-update-tarball"
              type="file"
              accept=".tgz"
              onChange={props.selectFile}
            />
            <Button
              component="span"
              sx={{ width: "100px", marginRight: "25px" }}
            >
              Tarball
            </Button>
            <TextField
              id="file-software-update-tarball"
              defaultValue={props.tarball ? props.tarball.name : ""}
              value={props.tarball ? props.tarball.name : ""}
              InputProps={{ readOnly: true }}
              variant="standard"
              sx={{ width: "350px" }}
            />
          </label>
          <label htmlFor="button-software-update-manifest">
            <Input
              id="button-software-update-manifest"
              type="file"
              accept=".tgz"
              onChange={props.selectFile}
            />
            <Button
              component="span"
              sx={{ width: "100px", marginRight: "25px" }}
            >
              Manifest
            </Button>
            <TextField
              id="file-software-update-manifest"
              defaultValue={props.manifest ? props.manifest.name : ""}
              value={props.manifest ? props.manifest.name : ""}
              InputProps={{ readOnly: true }}
              variant="standard"
              sx={{ width: "350px" }}
            />
          </label>
        </Stack>
        <Stack spacing={5} direction="row" sx={{ width: dividerWidth + "px" }}>
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
            sx={{ minWidth: "200px", maxWidth: "200px" }}
          >
            <ArrowForwardIosRoundedIcon sx={{ mr: 1 }} />
            Update
          </Fab>
          {props.logButtonDisabled === false ? (
            <Fab onClick={props.showLog}>
              <ArticleRoundedIcon />
            </Fab>
          ) : null}
        </Stack>
      </Stack>
      <Snackbar
        open={props.snack}
        autoHideDuration={7000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={props.snackMessage}
        onClose={props.closeSnackBar}
      />
    </>
  );
};
