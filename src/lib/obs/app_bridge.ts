import type Panel from "@launchpad/panel.js";
import RGBPixel from "@launchpad/rgb_pixel.js";
import { getColor } from "@launchpad/utils.js";
import { AxisCoordinate, PalletCode } from "@launchpad/types.js";
import StaticPixel from "@launchpad/static_pixel.js";
import PulsingPixel from "@launchpad/pulsing_pixel.js";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
import Logger from "../log/logger.js";
const { OBS_WS_URL, OBS_WS_PASSWORD } = process.env;
const MODULE_NAME = "OBS Bridge";
const moduleLogger = new Logger(MODULE_NAME);
const { log, warn, error } = moduleLogger;

type OnSceneChangedListener = (scene: string) => void;
type OnInputChangedListener = (state: boolean) => void;
type OnInputChangedListeners = {
  [key: string]: OnInputChangedListener;
};

class OBSBridge {
  private panel: Panel;
  private obs = new OBSWebSocket();
  private currentScene: string = "";
  private onSceneChangedListeners: OnSceneChangedListener[] = [];
  private onInputChangedListeners: OnInputChangedListeners = {};
  constructor(panel: Panel) {
    this.panel = panel;
    this.connectWithObs();
  }
  private connectWithObs() {
    this.obs
      .connect(
        OBS_WS_URL,
        OBS_WS_PASSWORD,
        {
          eventSubscriptions: EventSubscription.All,
        }
        // @ts-ignore
      )
      .then(({ obsWebSocketVersion, negotiatedRpcVersion }) => {
        log(
          `Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion}), starting initialization in 5 seconds...`
        );
        setTimeout(this.onInit.bind(this), 5000);
        // @ts-ignore
      })
      .catch((err) => {
        error(
          // @ts-ignore
          `Failed to connect to OBS server - Code ${err.code}: ${err.message}. Retrying in 5 seconds...`
        );
        setTimeout(this.connectWithObs.bind(this), 5000);
      });
  }
  private setSceneButton(
    x: AxisCoordinate,
    y: AxisCoordinate,
    scene: string,
    defaultColor: PalletCode
  ) {
    const btn = this.panel.getButton(x, y);
    btn?.setDefaultPixelMaker((x, y) => {
      return new StaticPixel(x, y, defaultColor);
    });
    btn?.setDefaultPixel();
    btn?.onPressSuscribe(() => {
      this.obs.call("SetCurrentProgramScene", { sceneName: scene });
    });
    this.onSceneChangedSuscribe((sceneName) => {
      if (sceneName === scene) btn?.setPulsing(getColor(3, 3, 3, true));
      else btn?.setDefaultPixel();
    });
  }
  private async runSceneEventListener() {
    const { currentProgramSceneName } = await this.obs.call("GetSceneList");
    this.currentScene = currentProgramSceneName;
    this.onSceneChanged();
    this.obs.on("CurrentProgramSceneChanged", (event) => {
      const { sceneName } = event;
      this.currentScene = sceneName;
      this.onSceneChanged();
    });
  }
  private onSceneChanged() {
    this.onSceneChangedListeners.forEach((cb) => {
      cb(this.currentScene);
    });
  }
  private onSceneChangedSuscribe(cb: OnSceneChangedListener) {
    this.onSceneChangedListeners.push(cb);
  }
  private setInputButton(
    x: AxisCoordinate,
    y: AxisCoordinate,
    input: string,
    defaultColor: PalletCode
  ) {
    const btn = this.panel.getButton(x, y);
    btn?.setDefaultPixelMaker((x, y) => {
      return new StaticPixel(x, y, defaultColor);
    });
    btn?.setDefaultPixel();
    btn?.onPressSuscribe(() => {
      this.obs.call("ToggleInputMute", { inputName: input });
    });
    this.onInputChangedSuscribe(input, (state) => {
      if (state) btn?.setFlashing(getColor(1, 0, 0), defaultColor);
      else btn?.setDefaultPixel();
    });
  }
  private runInputEventListener() {
    Object.keys(this.onInputChangedListeners).forEach(async (inputName) => {
      const { inputMuted } = await this.obs.call("GetInputMute", { inputName });
      // @ts-ignore
      this.onInputChangedListeners[inputName](inputMuted);
    });
    this.obs.on("InputMuteStateChanged", (event) => {
      const { inputName, inputMuted } = event;
      if (this.onInputChangedListeners[inputName])
        // @ts-ignore
        this.onInputChangedListeners[inputName](inputMuted);
    });
  }
  private onInputChangedSuscribe(
    inputName: string,
    cb: OnInputChangedListener
  ) {
    this.onInputChangedListeners[inputName] = cb;
  }
  private async setStreamStatus(x: AxisCoordinate, y: AxisCoordinate) {
    const btn = this.panel.getButton(x, y);
    btn?.setDefaultPixelMaker((x, y) => {
      return new StaticPixel(x, y, getColor(0, 3, 0));
    });
    btn?.setDefaultPixel();
    const { outputActive } = await this.obs.call("GetStreamStatus");
    if (outputActive) btn?.setPulsing(getColor(3, 0, 0));
    else btn?.setDefaultPixel();
    this.obs.on("StreamStateChanged", (event) => {
      const { outputActive } = event;
      if (outputActive) btn?.setPulsing(getColor(3, 0, 0));
      else btn?.setDefaultPixel();
    });
  }
  private async setButtonStreamStatus(x: AxisCoordinate, y: AxisCoordinate) {
    const btn = this.panel.getButton(x, y);
    btn?.setDefaultPixelMaker((x, y) => {
      return new PulsingPixel(x, y, getColor(0, 3, 0));
    });
    btn?.setDefaultPixel();
    const { outputActive } = await this.obs.call("GetStreamStatus");
    if (outputActive) btn?.setPulsing(getColor(3, 0, 0));
    else btn?.setDefaultPixel();
    btn?.onPressSuscribe(async () => {
      const { outputActive } = await this.obs.call("ToggleStream");
      if (outputActive) btn?.setStatic(getColor(3, 0, 0));
      else btn?.setDefaultPixel();
    });
  }
  private onInit() {
    this.setSceneButton(8, 7, "Negro", getColor(0, 3, 0));
    this.setSceneButton(8, 6, "Ya arrancamos 2", getColor(0, 3, 0));
    this.setSceneButton(8, 5, "Ya arrancamos", getColor(0, 3, 0));
    this.setSceneButton(8, 4, "Solo camara", getColor(0, 0, 3));
    this.setSceneButton(8, 3, "Combo PC", getColor(0, 0, 3));
    this.setSceneButton(8, 2, "Solo PC", getColor(0, 0, 3));
    this.setSceneButton(7, 7, "Combo PC 2", getColor(2, 0, 3));
    this.setSceneButton(7, 6, "With Invited", getColor(0, 3, 3));
    this.setSceneButton(7, 5, "Combo PC With Invited", getColor(0, 3, 3));
    this.runSceneEventListener();
    this.setInputButton(8, 0, "Mic", getColor(3, 1, 0));
    this.setInputButton(8, 1, "Desktop", getColor(3, 1, 0));
    this.setInputButton(0, 7, "Edge", getColor(1, 1, 3));
    this.setInputButton(0, 6, "Discord", getColor(3, 0, 3));
    this.runInputEventListener();
    this.setStreamStatus(8, 8);
    this.setButtonStreamStatus(7, 8);
    this.obs.on("ExitStarted", this.onClose.bind(this));
  }
  private onClose() {
    this.obs.disconnect();
    this.obs = new OBSWebSocket();
    this.panel.resetButton(8, 7);
    this.panel.resetButton(8, 6);
    this.panel.resetButton(8, 5);
    this.panel.resetButton(8, 4);
    this.panel.resetButton(8, 3);
    this.panel.resetButton(8, 2);
    this.panel.resetButton(8, 1);
    this.panel.resetButton(7, 7);
    this.panel.resetButton(7, 6);
    this.panel.resetButton(7, 5);
    this.panel.resetButton(7, 4);
    this.panel.resetButton(8, 0);
    this.panel.resetButton(0, 7);
    this.panel.resetButton(0, 6);
    this.panel.resetButton(0, 5);
    this.panel.resetButton(0, 4);
    this.panel.resetButton(0, 3);
    this.panel.resetButton(8, 8);
    this.panel.resetButton(7, 8);
    setTimeout(this.connectWithObs.bind(this), 10000);
  }
}

export default OBSBridge;
