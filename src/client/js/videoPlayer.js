const video = document.querySelector("video");
const videoContainer = document.querySelector(".watch");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullscreen");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const playPause = () => {
  playBtn.classList.toggle("fa-play");
  playBtn.classList.toggle("fa-pause");
};

const toMute = () => {
  muteBtn.classList.remove("fa-volume-up");
  muteBtn.classList.add("fa-volume-mute");
};

const toUnmute = () => {
  muteBtn.classList.add("fa-volume-up");
  muteBtn.classList.remove("fa-volume-mute");
};

const toFull = () => {
  fullScreenBtn.classList.add("fa-compress");
  fullScreenBtn.classList.remove("fa-expand");
};

const toNotFull = () => {
  fullScreenBtn.classList.remove("fa-compress");
  fullScreenBtn.classList.add("fa-expand");
};

const handlePlay = (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playPause();
};

const handleMute = (event) => {
  if (video.muted) {
    video.muted = false;
    toUnmute();
  } else {
    video.muted = true;
    toMute();
  }
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;

  if (video.muted) {
    video.muted = false;
    toUnmute();
  }

  video.volume = value;
  volumeValue = value;

  if (video.volume === 0) {
    video.muted = true;
    toMute();
  }
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = (event) => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
  if (timeline.value === timeline.max) {
    if (playBtn.classList.contains("fa-pause")) {
      playPause();
    }
  }
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = (event) => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
};

const handleFullScreenBtn = (event) => {
  const fullscreen = document.fullscreenElement;
  fullscreen ? toFull() : toNotFull();
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.remove("hiding");
  controlsMovementTimeout = setTimeout(() => {
    videoControls.classList.add("hiding");
  }, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(() => {
    videoControls.classList.add("hiding");
  }, 500);
};

const handleVideoControllerMouseEnter = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("ended", handleEnded);
videoControls.addEventListener("mouseenter", handleVideoControllerMouseEnter);
document.addEventListener("fullscreenchange", handleFullScreenBtn);
