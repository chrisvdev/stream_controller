import { LogLevel, setLoggerLevel } from "./lib/log/logger.js";
import Panel from "./lib/launchpad/panel.js";
import OBSBridge from "@obs/app_bridge.js";

setLoggerLevel(LogLevel.DEBUG);

const panel = new Panel();

const bridge = new OBSBridge(panel);
