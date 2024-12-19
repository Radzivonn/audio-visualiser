const audio = document.getElementById('audio-player');
let audioSource;
let analyser;

document.getElementById('audio-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  audio.src = URL.createObjectURL(file);
  audio.load();
  audio.play();
  if (!audioSource) {
    const audioContext = new AudioContext();
    audioSource = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
  }
});

audio.addEventListener('play', () => {
  visualize(analyser);
});

function visualize(analyser) {
  const canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  analyser.smoothingTimeConstant = 0.8;
  analyser.fftSize = 256;

  const frequencyBufferLength = analyser.frequencyBinCount;
  let frequencyData = new Uint8Array(frequencyBufferLength);

  const canvasContext = canvas.getContext('2d');

  const HISTOGRAM_SCALE = 1; // the larger the value, the larger the width of the bars and the smaller their number
  const HISTOGRAM_THRESHOLD = 2; // 2-255;
  const HISTOGRAM_GAP = 2;
  const MIN_BAR_HEIGHT = 5 * HISTOGRAM_SCALE;
  const SHADOW_K = 0.25; // coefficient showing how much the shadow is greater than bar

  const barWidth =
    Math.round(canvas.width / frequencyBufferLength / 1.5) * HISTOGRAM_SCALE;

  function draw() {
    requestAnimationFrame(draw);
    canvasContext.fillStyle = 'rgb(24,24,24)';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(frequencyData);
    analyser.get;

    let HEIGHT_SCALE = (audio.volume * (1 - 0.5)) / 1 + 0.5;

    for (let i = 0; i < frequencyBufferLength; i += HISTOGRAM_SCALE) {
      if (
        frequencyData[i] === 0 ||
        (frequencyData[i] > 0 && frequencyData[i] < HISTOGRAM_THRESHOLD)
      )
        frequencyData[i] = MIN_BAR_HEIGHT;

      // RED YELLOW GREEN
      if (i <= Math.round(frequencyBufferLength / 8)) {
        canvasContext.fillStyle = `rgba(${160 + (i + 5) * 2}, 0, 0, 1)`;
      } else if (
        i > Math.round(frequencyBufferLength / 8) &&
        i < 4.8 * Math.round(frequencyBufferLength / 8)
      ) {
        canvasContext.fillStyle = `rgba(255, ${127 + i}, 0, 1)`;
      } else {
        canvasContext.fillStyle = `rgba(${(i - 20) * 2}, 218, 47, 1)`;
      }

      // top left
      canvasContext.fillRect(
        (i / HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height -
          (canvas.height / 2 + canvas.height * 0.05) -
          frequencyData[i] * HEIGHT_SCALE,
        barWidth - HISTOGRAM_GAP,
        frequencyData[i] * HEIGHT_SCALE,
      );

      // top right
      canvasContext.fillRect(
        (i / -HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height -
          (canvas.height / 2 + canvas.height * 0.05) -
          frequencyData[i] * HEIGHT_SCALE,
        barWidth - HISTOGRAM_GAP,
        frequencyData[i] * HEIGHT_SCALE,
      );

      // RED YELLOW GREEN "SHADOW"
      if (i <= Math.round(frequencyBufferLength / 8)) {
        canvasContext.fillStyle = `rgba(${160 + (i + 5) * 2}, 0, 0, 0.4)`;
      } else if (
        i > Math.round(frequencyBufferLength / 8) &&
        i < 4.8 * Math.round(frequencyBufferLength / 8)
      ) {
        canvasContext.fillStyle = `rgba(255, ${127 + i}, 0, 0.4)`;
      } else {
        canvasContext.fillStyle = `rgba(${(i - 20) * 2}, 218, 47, 0.4)`;
      }

      // "shadows"
      if (frequencyData[i] !== MIN_BAR_HEIGHT) {
        // bottom left
        canvasContext.fillRect(
          (i / HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
          canvas.height -
            (canvas.height / 2 + canvas.height * 0.03) -
            frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
          barWidth - HISTOGRAM_GAP,
          frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
        );
        // bottom right
        canvasContext.fillRect(
          (i / -HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
          canvas.height -
            (canvas.height / 2 + canvas.height * 0.03) -
            frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
          barWidth - HISTOGRAM_GAP,
          frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
        );
      }
    }
  }
  draw();
}
