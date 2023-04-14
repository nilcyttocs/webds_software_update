import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import { OSInfo } from '@webds/service';

import Landing from './Landing';
import { frontend, webdsService } from './local_exports';

const LOG_LOCATION = 'Synaptics/_links/Update_Daemon_Log';

let repo: any;
let timerID: number | null = null;

function useForceUpdate() {
  const [render, setRender] = useState<boolean>(false);
  return () => setRender(!render);
}

export const SoftwareUpdateComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [osInfo, setOSInfo] = useState<OSInfo>();

  const webdsTheme = webdsService.ui.getWebDSTheme();

  const { commands, shell } = frontend;

  const forceUpdate = useForceUpdate();

  const pollOSInfo = () => {
    let doForceUpdate = false;
    const info = webdsService.pinormos.getOSInfo();
    if (repo && JSON.stringify(info.repo) !== JSON.stringify(repo)) {
      doForceUpdate = true;
    }
    repo = Object.assign({}, info.repo);
    setOSInfo(info);
    if (doForceUpdate) {
      forceUpdate();
    }
  };

  const showLog = async () => {
    commands
      .execute('docmanager:open', {
        path: LOG_LOCATION,
        factory: 'Editor',
        options: { mode: 'split-right' }
      })
      .then((widget: any) => {
        widget.id = 'update_daemon_log';
        widget.title.closable = true;
        if (!widget.isAttached) shell.add(widget, 'main');
        shell.activateById(widget.id);
      });
  };

  useEffect(() => {
    const initialize = () => {
      pollOSInfo();
      timerID = setInterval(pollOSInfo, 2000);
      setInitialized(true);
    };
    initialize();
    return () => {
      repo = null;
      if (timerID) {
        clearInterval(timerID);
        timerID = null;
      }
    };
  }, []);

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert !== undefined && (
            <Alert
              severity="error"
              onClose={() => setAlert(undefined)}
              sx={{ whiteSpace: 'pre-wrap' }}>
              {alert}
            </Alert>
          )}
          {initialized && (
            <Landing setAlert={setAlert} osInfo={osInfo} showLog={showLog} />
          )}
        </div>
        {!initialized && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
            <CircularProgress color="primary" />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default SoftwareUpdateComponent;
