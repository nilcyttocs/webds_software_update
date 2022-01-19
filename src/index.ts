import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { softwareUpdateIcon } from './icons';

import { SoftwareUpdateWidget } from './widget_container';

/**
 * Initialization data for the @webds/software_update extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@webds/software_update:plugin',
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer],
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer
  ) => {
    console.log('JupyterLab extension @webds/software_update is activated!');

    let widget: MainAreaWidget;
    const { commands, shell } = app;
    const command = 'webds_software_update:open';
    commands.addCommand(command, {
      label: 'DSDK Update',
      caption: 'DSDK Update',
      icon: (args: { [x: string]: any }) => {
        return args['isLauncher'] ? softwareUpdateIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new SoftwareUpdateWidget(app);
          widget = new MainAreaWidget<SoftwareUpdateWidget>({ content });
          widget.id = 'webds_software_update_widget';
          widget.title.label = 'DSDK Update';
          widget.title.icon = softwareUpdateIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget))
          tracker.add(widget);

        if (!widget.isAttached)
          shell.add(widget, 'main');

        shell.activateById(widget.id);
      },
    });

    launcher.add({ command, args: { isLauncher: true }, category: 'WebDS', rank: 2 });

    let tracker = new WidgetTracker<MainAreaWidget>({ namespace: 'webds_software_update' });
    restorer.restore(tracker, { command, name: () => 'webds_software_update' });
  }
};

export default plugin;
