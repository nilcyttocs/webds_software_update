import React, { useState } from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { styled, ThemeProvider } from '@mui/material/styles';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

import webdsTheme from './webdsTheme';
import { requestAPI } from './handler';

const dropboxLocation = '/var/spool/syna/softwareupdater';
const successMessage = 'Files have been placed in Software Updater dropbox. \
  Allow 5 minutes for update process to complete. \
  System may reset as part of update process.';
const failureMessage = 'Error occurred during update process.'

const SoftwareUpdateComponent = (): JSX.Element => {
  const [tarball, setTarball] = useState<File|null>(null);
  const [manifest, setManifest] = useState<File|null>(null);
  const [snack, setSnack] = useState<boolean>(false);
  const [snackMessage, setSnackMessage] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  const Input = styled('input')({
    display: 'none',
  });

  const selectFile = (event:React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }

    switch (event.target.id) {
      case 'button-software-update-tarball':
        setTarball(event.target.files[0]);
        break;
      case 'button-software-update-manifest':
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

    setButtonDisabled(true);

    const formData = new FormData();
    formData.append('files', tarball);
    formData.append('files', manifest);
    formData.append('location', dropboxLocation);

    try {
      const response = await requestAPI<any>('filesystem', {
        body: formData,
        method: 'POST'
      });
      console.log(response);
      setSnackMessage(successMessage);
    } catch (error) {
      if (error) {
        console.error(error);
      }
      setSnackMessage(failureMessage);
    } finally {
      setSnack(true);
      setButtonDisabled(false);
    }
  };

  const closeSnackBar = () => {
    setSnack(false);
  };

  return (
    <ThemeProvider theme={webdsTheme}>
      <div>
        <Stack
          spacing={5}
          divider={<Divider orientation='horizontal' sx={{width:475}} />}
          sx={{marginLeft:5, marginTop:5}}
        >
          <Stack
            spacing={2}
            sx={{whiteSpace:'nowrap'}}
          >
            <label htmlFor='button-software-update-tarball'>
              <Input
                id='button-software-update-tarball'
                type='file'
                accept='.tgz'
                onChange={selectFile}
              />
              <Button
                variant='contained'
                component='span'
                sx={{minWidth:100, maxWidth:100, marginRight:3}}
              >
                Tarball
              </Button>
              <TextField
                id='file-software-update-tarball'
                defaultValue={tarball? tarball.name: ''}
                value={tarball? tarball.name: ''}
                InputProps={{readOnly: true}}
                variant='standard'
                sx={{width:350}}
              />
            </label>
            <label htmlFor='button-software-update-manifest'>
              <Input
                id='button-software-update-manifest'
                type='file'
                accept='.tgz'
                onChange={selectFile}
              />
              <Button
                variant='contained'
                component='span'
                sx={{minWidth:100, maxWidth:100, marginRight:3}}
              >
                Manifest
              </Button>
              <TextField
                id='file-software-update-manifest'
                defaultValue={manifest? manifest.name: ''}
                value={manifest? manifest.name: ''}
                InputProps={{readOnly: true}}
                variant='standard'
                sx={{width:350}}
              />
            </label>
          </Stack>
          <Fab
            variant='extended'
            color='primary'
            size='medium'
            disabled={buttonDisabled || (tarball === null || manifest === null)}
            onClick={doUpdate}
            sx={{minWidth:200, maxWidth:200}}>
              <ArrowForwardIosRoundedIcon sx={{mr:1}} />
              Update
            </Fab>
        </Stack>
        <Snackbar
          open={snack}
          autoHideDuration={7000}
          anchorOrigin={{vertical:'bottom', horizontal:'center'}}
          message={snackMessage}
          onClose={closeSnackBar}
        />
      </div>
    </ThemeProvider>
  );
};

export class SoftwareUpdateWidget extends ReactWidget {
  constructor() {
    super();
    this.addClass('jp-webdsSoftwareUpdateWidget');
  }

  render(): JSX.Element {
    return <SoftwareUpdateComponent />;
  }
}
