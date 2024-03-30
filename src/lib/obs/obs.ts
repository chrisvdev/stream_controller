import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
const { OBS_WS_URL, OBS_WS_PASSWORD } = process.env;

const obs = new OBSWebSocket();

try {
  const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
    OBS_WS_URL,
    OBS_WS_PASSWORD,
    {
      eventSubscriptions: EventSubscription.All,
    }
  );
  console.log(
    `Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
  );
} catch (error) {
  console.error(
    // @ts-ignore
    `Failed to connect to OBS server - Code ${error.code}: ${error.message}`
  );
}

export default obs;
