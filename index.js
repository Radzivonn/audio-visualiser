const audio = document.getElementById('audio-player');
audio.volume = 0.8;
let analyser;

document.getElementById('audio-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  audio.src = URL.createObjectURL(file);
  audio.load();
  audio.play();
  const audioContext = new AudioContext();
  const audioSource = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
});

audio.addEventListener('play', () => {
  visualize(analyser);
});

function visualize(analyser) {
  const canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  analyser.smoothingTimeConstant = 0.9;
  analyser.fftSize = 256;

  const frequencyBufferLength = analyser.frequencyBinCount;
  let frequencyData = new Uint8Array(frequencyBufferLength);

  audio.play();

  const canvasContext = canvas.getContext('2d');

  const MIN_HUE = 0;
  const MAX_HUE = 255;
  const HISTOGRAM_SCALE = 1;
  const barWidth =
    Math.round(canvas.width / frequencyBufferLength / 1.5) * HISTOGRAM_SCALE;

  function draw() {
    requestAnimationFrame(draw);
    canvasContext.fillStyle = 'rgb(24,24,24)';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(frequencyData);
    analyser.get;

    let HEIGHT_SCALE = (audio.volume * (0.7 - 0.3)) / 1 + 0.3;

    const MIN_D = 0.012;
    const MAX_D = 0.032;
    let d = (audio.volume * (MAX_D - MIN_D)) / 1 + MIN_D; // direction

    for (let i = 0; i < frequencyBufferLength; i += HISTOGRAM_SCALE) {
      if (i % 15 === 0) d = -d;
      HEIGHT_SCALE -= d;

      const normalizedFrequency =
        (frequencyData[i] - MIN_HUE) / (MAX_HUE - MIN_HUE);

      const r = (normalizedFrequency - 0.1) * MAX_HUE;
      const b = (1 - normalizedFrequency) * MAX_HUE;

      if (normalizedFrequency < 0.45) {
        canvasContext.fillStyle = `rgb(${0},${b},${b})`;
      } else canvasContext.fillStyle = `rgb(${r},${b},${b})`;

      // top left
      canvasContext.fillRect(
        (i / HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height - canvas.height / 2 - frequencyData[i] * HEIGHT_SCALE,
        barWidth - 1,
        frequencyData[i] * HEIGHT_SCALE,
      );
      // bottom left
      canvasContext.fillRect(
        (i / HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height - canvas.height / 2 - frequencyData[i] * -HEIGHT_SCALE,
        barWidth - 1,
        frequencyData[i] * -HEIGHT_SCALE,
      );
      // top right
      canvasContext.fillRect(
        (i / -HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height - canvas.height / 2 - frequencyData[i] * HEIGHT_SCALE,
        barWidth - 1,
        frequencyData[i] * HEIGHT_SCALE,
      );
      // bottom right
      canvasContext.fillRect(
        (i / -HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height - canvas.height / 2 - frequencyData[i] * -HEIGHT_SCALE,
        barWidth - 1,
        frequencyData[i] * -HEIGHT_SCALE,
      );
    }
  }
  draw();
}
