const startBtn = document.getElementById("startBtn");

const handleStart = async () => {
  //to use async and await in frontend JS, we need to install regeneratorRuntime
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  console.log("Hello");
};

startBtn.addEventListener("click", handleStart);
