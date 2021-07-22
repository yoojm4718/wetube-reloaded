const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {}; //this will listen to the event 'dataavailable'
  recorder.start();
  setTimeout(() => {
    recorder.stop(); //after this method, the event 'dataavailable' will be fired
  }, 10000);
};

const handleStop = () => {
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleStart);
};

const init = async () => {
  //to use async and await in frontend JS, we need to install regeneratorRuntime
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
