import { LogLevel, setLoggerLevel } from "./lib/log/logger.js";
import onPanelReady from "./lib/launchpad/on_panel_ready.js";
import type Panel from "./lib/launchpad/panel.js";
import OBSBridge from "@obs/app_bridge.js";

setLoggerLevel(LogLevel.NONE);

function init(panel: Panel) {
  const oBSbridge = new OBSBridge(panel);
}

/* const toLoad: Promise<any>[] = [];

toLoad.push(import("./lib/example/index.js"));

Promise.all(toLoad).then((modules) => {
  const [mod1] = modules;
  const Example = mod1.default;
  const ex1 = new Example();
  const ex2 = new Example();
  console.log(ex1.getId());
  console.log(ex2.getId());
});*/

onPanelReady(init);
