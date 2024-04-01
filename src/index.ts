import { LogLevel, setLoggerLevel } from "./lib/log/logger.js";
import Panel from "./lib/launchpad/panel.js";
import OBSBridge from "@obs/app_bridge.js";

console.log(import.meta.dirname);

setLoggerLevel(LogLevel.NONE);

const panel = new Panel();

const bridge = new OBSBridge(panel);
