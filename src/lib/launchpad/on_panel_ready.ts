import { INPUT_NAME, OUTPUT_NAME } from "./launchpad.js";
import Panel from "./panel.js";
import easymidi from "easymidi";

function isPanelReady() {
  return (
    easymidi.getInputs().includes(INPUT_NAME) &&
    easymidi.getOutputs().includes(OUTPUT_NAME)
  );
}

export default function onPanelReady(callback: (panel: Panel) => void) {
  if (isPanelReady()) {
    const panel = new Panel();
    callback(panel);
  } else {
    const interval = setInterval(() => {
      if (isPanelReady()) {
        const panel = new Panel();
        callback(panel);
        clearInterval(interval);
      }
    }, 500);
  }
}
