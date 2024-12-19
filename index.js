const audio = document.getElementById('audio-player');
let audioSource;
let analyser;

const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');
const background = new Image();
background.src = './assets/canvas_bg.jpg';

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

function interpolateColor(progress, startColor, endColor, alpha) {
  const r = Math.round(
    startColor[0] + (endColor[0] - startColor[0]) * progress,
  );
  const g = Math.round(
    startColor[1] + (endColor[1] - startColor[1]) * progress,
  );
  const b = Math.round(
    startColor[2] + (endColor[2] - startColor[2]) * progress,
  );
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function visualize(analyser) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  analyser.smoothingTimeConstant = 0.85;
  analyser.fftSize = 256;

  const frequencyBufferLength = analyser.frequencyBinCount;
  let frequencyData = new Uint8Array(frequencyBufferLength);

  const HISTOGRAM_SCALE = 2; // the larger the value, the larger the width of the bars and the smaller their number
  const HISTOGRAM_THRESHOLD = 2; // 2-255;
  const HISTOGRAM_GAP = 6;
  const MIN_BAR_HEIGHT = 8 * HISTOGRAM_SCALE;
  const MIN_HEIGHT_SCALE = 0.75;
  const MAX_HEIGHT_SCALE = 1.1;
  const SHADOW_K = -0.4; // coefficient showing how much bars' shadow is greater/smaller than bar (positive value - greater; negative value - smaller)
  const startColor = [140, 0, 0]; // dark red
  const endColor = [255, 255, 30]; // light yellow
  const barWidth =
    Math.round(canvas.width / frequencyBufferLength / 1.5) * HISTOGRAM_SCALE;

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(frequencyData);
    analyser.get;

    let HEIGHT_SCALE =
      (audio.volume * (MAX_HEIGHT_SCALE - MIN_HEIGHT_SCALE)) / 1 +
      MIN_HEIGHT_SCALE;

    canvasContext.drawImage(background, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < frequencyBufferLength; i += HISTOGRAM_SCALE) {
      if (
        frequencyData[i] === 0 ||
        (frequencyData[i] > 0 && frequencyData[i] < HISTOGRAM_THRESHOLD)
      ) {
        frequencyData[i] = MIN_BAR_HEIGHT;
      }

      const progress = i / frequencyBufferLength; // normalize i value

      // set the color of the top bars
      canvasContext.fillStyle = interpolateColor(
        progress,
        startColor,
        endColor,
        0.8,
      );

      // top right
      canvasContext.fillRect(
        (i / HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height - canvas.height / 2 - frequencyData[i] * HEIGHT_SCALE,
        barWidth - HISTOGRAM_GAP,
        frequencyData[i] * HEIGHT_SCALE,
      );

      // top left
      canvasContext.fillRect(
        (i / -HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
        canvas.height - canvas.height / 2 - frequencyData[i] * HEIGHT_SCALE,
        barWidth - HISTOGRAM_GAP,
        frequencyData[i] * HEIGHT_SCALE,
      );

      // set the color of the bottom bars
      canvasContext.fillStyle = interpolateColor(
        progress,
        startColor,
        endColor,
        0.32,
      );

      if (frequencyData[i] !== MIN_BAR_HEIGHT) {
        // bottom right
        canvasContext.fillRect(
          (i / HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
          canvas.height -
            canvas.height / 2 -
            frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
          barWidth - HISTOGRAM_GAP,
          frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
        );
        // bottom left
        canvasContext.fillRect(
          (i / -HISTOGRAM_SCALE) * barWidth + canvas.width / 2,
          canvas.height -
            canvas.height / 2 -
            frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
          barWidth - HISTOGRAM_GAP,
          frequencyData[i] * -(HEIGHT_SCALE + SHADOW_K),
        );
      }
    }
  }
  draw();
}
