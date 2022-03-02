const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];

const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');

const vf = new Vex.Flow.Factory({
  //renderer: { elementId: 'score-1', width: 500, height: 200},
  renderer: { elementId: 'score-1'},
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

keys.forEach(key => {
  key.addEventListener('click', () => playNote(key))
});

document.addEventListener('keydown', (e) => {
  if(e.repeat) return
  const key = e.key;
  const whiteKeyIndex = WHITE_KEYS.indexOf(key);
  const blackKeyIndex = BLACK_KEYS.indexOf(key);

  if (whiteKeyIndex > -1)
  {
    playNote(whiteKeys[whiteKeyIndex]);
  }
  if(blackKeyIndex > -1){
    playNote(blackKeys[blackKeyIndex]);
  }
})

function playNote(key){
  /*var attribs = key.attributes;
        for(var i = 0; i < attribs.length; i++) {
            console.log(attribs[i]);
        }*/

  console.log("key: " + key.dataset.note);
  const noteAudio = document.getElementById(key.dataset.note);
  //console.log("key: "+noteAudio);
  noteAudio.currentTime = 0;
  noteAudio.play();
  key.classList.add('active');
  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active');
  })
}
