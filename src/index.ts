import { LogLevel, setLoggerLevel } from "./lib/log/logger.js";
import onPanelReady from "./lib/launchpad/on_panel_ready.js";
import type Panel from "./lib/launchpad/panel.js";
import OBSBridge from "@obs/app_bridge.js";

setLoggerLevel(LogLevel.NONE);

function init(panel: Panel) {
  const bridge = new OBSBridge(panel);
}

onPanelReady(init);
