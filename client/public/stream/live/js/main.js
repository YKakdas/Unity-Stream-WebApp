import { getServerConfig, getRTCConfiguration } from "../../shared/js/config.js";
import { createDisplayStringArray } from "../../shared/js/stats.js";
import { VideoPlayer } from "../../shared/js/videoplayer.js";
import { RenderStreaming } from "../../../src/renderstreaming.js";
import { Signaling, WebSocketSignaling } from "../../../src/signaling.js";

/** @type {Element} */
let playButton;
/** @type {RenderStreaming} */
let renderstreaming;
/** @type {boolean} */
let useWebSocket;


const playerDiv = document.getElementById('player');
const lockMouseCheck = document.getElementById('lockMouseCheck');
const videoPlayer = new VideoPlayer();

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const starttime = urlParams.get('starttime');

console.log(videoId);
console.log(starttime);

export { videoId, starttime };


setup();

window.document.oncontextmenu = function () {
  return false;     // cancel default menu
};

window.addEventListener('resize', function () {
  videoPlayer.resizeVideo();
}, true);

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showWarningIfNeeded(res.startupMode);
  showPlayButton();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML = "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showPlayButton() {
  if (!document.getElementById('playButton')) {
    const elementPlayButton = document.createElement('img');
    elementPlayButton.id = 'playButton';
    elementPlayButton.src = '../shared/images/Play.png';
    elementPlayButton.alt = 'Start Streaming';
    playButton = document.getElementById('player').appendChild(elementPlayButton);
    playButton.addEventListener('click', onClickPlayButton);
  }
}

function onClickPlayButton() {
  playButton.style.display = 'none';

  // add video player
  videoPlayer.createPlayer(playerDiv, lockMouseCheck);
  setupRenderStreaming();
}

async function setupRenderStreaming() {
  const signaling = useWebSocket ? new WebSocketSignaling() : new Signaling();
  const config = getRTCConfiguration();
  renderstreaming = new RenderStreaming(signaling, config);
  renderstreaming.onConnect = onConnect;
  renderstreaming.onDisconnect = onDisconnect;
  renderstreaming.onTrackEvent = (data) => videoPlayer.addTrack(data.track);

  await renderstreaming.start();
  await renderstreaming.createConnection(videoId);
}

function onConnect() {
  const channel = renderstreaming.createDataChannel("input");
  showStatsMessage();
}

async function onDisconnect() {
  clearStatsMessage();

  await renderstreaming.stop();
  renderstreaming = null;
  videoPlayer.deletePlayer();
  if (this.annotationManager != null) this.annotationManager.notify();

  showPlayButton();
}


/** @type {RTCStatsReport} */
let lastStats;
/** @type {number} */
let intervalId;

function showStatsMessage() {
  intervalId = setInterval(async () => {
    if (renderstreaming == null) {
      return;
    }

    const stats = await renderstreaming.getStats();
    if (stats == null) {
      return;
    }

    const array = createDisplayStringArray(stats, lastStats);
    //console.log(array);
    lastStats = stats;
  }, 1000);
}

function clearStatsMessage() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  lastStats = null;
  intervalId = null;
}
