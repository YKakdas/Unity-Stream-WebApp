let isPlaying = false;

export { isPlaying };

export class VideoPlayer {
  constructor() {
    this.playerElement = null;
    this.lockMouseCheck = null;
    this.videoElement = null;
    this.fullScreenButtonElement = null;
    this.inputRemoting = null;
    this.sender = null;
    this.inputSenderChannel = null;
    this.recordedData = [];
  }

  /**
 * @param {Element} playerElement parent element for create video player
 * @param {HTMLInputElement} lockMouseCheck use checked propety for lock mouse 
 */
  createPlayer(playerElement, lockMouseCheck) {
    this.playerElement = playerElement;
    this.lockMouseCheck = lockMouseCheck;

    this.videoElement = document.createElement('video');
    this.videoElement.id = 'Video';
    this.videoElement.style.touchAction = 'none';
    this.videoElement.playsInline = true;
    this.videoElement.srcObject = new MediaStream();
    this.videoElement.addEventListener('loadedmetadata', this._onLoadedVideo.bind(this), true);
    this.videoElement.muted = true;
    this.playerElement.appendChild(this.videoElement);

    // add fullscreen button
    this.fullScreenButtonElement = document.createElement('img');
    this.fullScreenButtonElement.id = 'fullscreenButton';
    this.fullScreenButtonElement.src = '../shared/images/FullScreen.png';
    this.fullScreenButtonElement.addEventListener("click", this._onClickFullscreenButton.bind(this));
    this.playerElement.appendChild(this.fullScreenButtonElement);

    document.addEventListener('webkitfullscreenchange', this._onFullscreenChange.bind(this));
    document.addEventListener('fullscreenchange', this._onFullscreenChange.bind(this));
  }

  _onLoadedVideo() {
    this.videoElement.play();
    this.resizeVideo();
    isPlaying = true;
    console.log("Joined to stream");
  }

  _onStreamEnded() {
    console.log("Stream ended");
    isPlaying = false;
  }


  _onClickFullscreenButton() {
    document.documentElement.requestFullscreen();
  }

  _onFullscreenChange() {
    if (document.fullscreenElement) {
      this.videoElement.style.position = "absolute";
      this.fullScreenButtonElement.style.display = 'none';
    } else {
      this.videoElement.style.position = "unset";
      this.fullScreenButtonElement.style.display = 'block';
    }
  }

  /**
   * @param {MediaStreamTrack} track 
   */
  addTrack(track) {
    if (!this.videoElement.srcObject) {
      return;
    }

    this.videoElement.srcObject.addTrack(track);
  }

  resizeVideo() {
    if (!this.videoElement) {
      return;
    }

    const clientRect = this.videoElement.getBoundingClientRect();
    const videoRatio = this.videoWidth / this.videoHeight;
    const clientRatio = clientRect.width / clientRect.height;

    this._videoScale = videoRatio > clientRatio ? clientRect.width / this.videoWidth : clientRect.height / this.videoHeight;
    const videoOffsetX = videoRatio > clientRatio ? 0 : (clientRect.width - this.videoWidth * this._videoScale) * 0.5;
    const videoOffsetY = videoRatio > clientRatio ? (clientRect.height - this.videoHeight * this._videoScale) * 0.5 : 0;
    this._videoOriginX = clientRect.left + videoOffsetX;
    this._videoOriginY = clientRect.top + videoOffsetY;
  }

  get videoWidth() {
    return this.videoElement.videoWidth;
  }

  get videoHeight() {
    return this.videoElement.videoHeight;
  }

  get videoOriginX() {
    return this._videoOriginX;
  }

  get videoOriginY() {
    return this._videoOriginY;
  }

  get videoScale() {
    return this._videoScale;
  }

  deletePlayer() {
    if (this.inputRemoting) {
      this.inputRemoting.stopSending();
    }
    this.inputRemoting = null;
    this.sender = null;
    this.inputSenderChannel = null;

    while (this.playerElement.firstChild) {
      this.playerElement.removeChild(this.playerElement.firstChild);
    }

    this.playerElement = null;
    this.lockMouseCheck = null;
    this._onStreamEnded();
  }

}