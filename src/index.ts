import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService, WebDSWidget } from "@webds/service";

import { softwareUpdateIcon } from "./icons";

import SoftwareUpdateWidget from "./widget/SoftwareUpdateWidget";

namespace Attributes {
  export const command = "webds_software_update:open";
  export const id = "webds_software_update_widget";
  export const label = "DSDK Update";
  export const caption = "DSDK Update";
  export const category = "DSDK - Applications";
  export const rank = 40;
}

/**
 * Initialization data for the @webds/software_update extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/software_update:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/software_update is activated!");

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? softwareUpdateIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new SoftwareUpdateWidget(Attributes.id, app, service);
          widget = new WebDSWidget<SoftwareUpdateWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = softwareUpdateIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, { command, name: () => Attributes.id });
  }
};

export default plugin;
