import React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import SoftwareUpdateComponent from './SoftwareUpdateComponent';

export class SoftwareUpdateWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + '_component'}>
        <SoftwareUpdateComponent />
      </div>
    );
  }
}

export default SoftwareUpdateWidget;
