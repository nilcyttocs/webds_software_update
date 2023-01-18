import React, { useEffect, useState } from 'react';

import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';

import { requestAPI } from './local_exports';
import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';

const sendSystemRebootRequest = async () => {
  let token: string;
  let dataToSend: any = {
    command: {
      action: 'reboot',
      target: 'rpi4'
    }
  };
  try {
    token = await requestAPI<any>('general', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/general\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to reboot system');
  }
  dataToSend.command.token = token;
  try {
    await requestAPI<any>('general', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/general\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to reboot system');
  }
};

export const Landing = (props: any): JSX.Element => {
  const [installing, setInstalling] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleOkayButton = async () => {
    setInstalling(true);
    handleDialogClose();
  };

  useEffect(() => {
    if (installing) {
      setTimeout(async () => {
        try {
          await sendSystemRebootRequest();
        } catch (error) {
          console.error(error);
        }
      }, 100);
    }
  }, [installing]);

  return (
    <>
      <Canvas title="DSDK Update">
        <Content
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {props.osInfo.current.version >= props.osInfo.repo.version ||
          !props.osInfo.repo.downloaded ? (
            <Typography
              variant="h4"
              sx={{
                margin: '24px',
                color: theme => theme.palette.text.disabled
              }}
            >
              No Update Available
            </Typography>
          ) : (
            <Typography
              variant="h4"
              sx={{
                margin: '24px'
              }}
            >
              Version {props.osInfo.repo.version} Available
            </Typography>
          )}
        </Content>
        <Controls
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              margin: '24px'
            }}
          >
            <Button
              disabled={
                props.osInfo.current.version >= props.osInfo.repo.version ||
                !props.osInfo.repo.downloaded ||
                installing
              }
              onClick={async () => {
                setOpenDialog(true);
              }}
              sx={{ width: '150px' }}
            >
              {installing ? 'Installing...' : 'Install Now'}
            </Button>
          </div>
          <Fab
            onClick={props.showLog}
            sx={{
              position: 'absolute',
              top: '50%',
              right: '24px',
              transform: 'translate(0%, -50%)',
              display: 'none'
            }}
          >
            <ArticleRoundedIcon />
          </Fab>
        </Controls>
      </Canvas>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Install PinormOS Version {props.osInfo.repo.version}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click Okay to reboot the DSDK and install PinormOS version{' '}
            {props.osInfo.repo.version}. The installation process may take
            several minutes to complete. During installation, ADB connection to
            the DSDK may be unavailable and you may wish to close WebDS during
            this time. Once ADB connection has been re-established, you can then
            do ADB port forwarding and re-open WebDS.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ width: '100px' }}>
            Cancel
          </Button>
          <Button onClick={handleOkayButton} sx={{ width: '100px' }}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Landing;
