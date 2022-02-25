//import Vex from 'https://cdn.jsdelivr.net/npm/vexflow@4.0.0/build/vexflow.js';

const vf = new Vex.Flow.Factory({
  renderer: { elementId: 'boo', width: 50, height: 20 },
});

const score = vf.EasyScore();
const system = vf.System();

system
  .addStave({
    voices: [
      score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
      score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    ],
  })
  .addClef('treble')
  .addTimeSignature('4/4');

vf.draw();
