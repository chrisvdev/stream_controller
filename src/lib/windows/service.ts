import { platform } from "os";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

type Env = {
  name: string;
  value: string;
};

const env: Env[] = [];

Object.keys(process.env).forEach((key) => {
  if (key.startsWith("OBS_")) {
    env.push({
      name: key,
      value: process.env[key] || "",
    });
  }
});

const { Service, EventLogger } = require("node-windows");

const log = new EventLogger("Stream Core Service");

export default class WindowsService {
  #service: any;
  constructor(rootPath: string) {
    // Create a new service object
    this.#service = new Service({
      name: "Stream Core",
      description: "Core service for stream and more",
      script: `${rootPath}\\index.js`,
      env: env,
      dependsOn: ["Audiosrv"],
      wait: 5,
      //, workingDirectory: '...'
      //, allowServiceLogon: true
    });
    this.#service.on("install", () => {
      log.info("Stream Core Service installed");
      // @ts-ignore
      this.#service.start();
    });
    this.#service.on("uninstall", () => {
      log.info("Stream Core Service uninstalled");
      // @ts-ignore
      log.info("The service exists: ", this.#service.exists);
    });
    this.#service.on("start", () => {
      log.info("Stream Core Service started");
    });
    this.#service.on("stop", () => {
      log.info("Stream Core Service stopped");
    });
    this.#service.on("error", function (err: unknown) {
      log.error(err);
    });
    this.installService = this.installService.bind(this);
    this.uninstallService = this.uninstallService.bind(this);
    this.startService = this.startService.bind(this);
    this.stopService = this.stopService.bind(this);
  }
  installService() {
    this.#service.install();
  }
  uninstallService() {
    this.#service.uninstall();
  }
  startService() {
    this.#service.start();
  }
  stopService() {
    this.#service.stop();
  }
}

export function isWindowsServiceCompatible() {
  return platform().indexOf("win32") >= 0;
}
