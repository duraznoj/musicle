const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];

const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');

const VF = Vex.Flow;
/*const numNotes = 2;*/
const divIDArr = ["#score-1", "#score-2",]/* "score-3", "score-4"]*/
var contextArr = []
let numClicks = 0;

/*boilerplate VF code*/
const createContext = (divID) => {
  /*const VF = Vex.Flow;*/
  /*const div = document.getElementById(divID)*/
  const div = document.querySelector(divID)
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(300, 100);
  const context = renderer.getContext();

  /*add stave*/
  const stave = new VF.Stave(10, 0, 300).addClef('treble');
  stave.setContext(context).draw();
  return [context, stave];
}

divIDArr.forEach((div) => {
  contextArr.push(createContext(div));
});

/*console.table(contextArr);*/

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

  /*console.log("key: " + key.dataset.note);*/

  numClicks += 1;
  console.log(numClicks);

  var currentNote = key.dataset.note;
  console.log("key: " + currentNote);
  const noteAudio = document.getElementById(key.dataset.note);
  //console.log("key: "+noteAudio);
  noteAudio.currentTime = 0;
  noteAudio.play();
  key.classList.add('active');
  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active');
  })
  /* to do - add logic for listening for sequence of notes then rendering at end...
  but also want to have feedback for user as to which notes have been enterered*/
  var notes = [
    // A quarter-note C.
    new VF.StaveNote({clef: "treble", keys: [currentNote + "/4"], duration: "q" }).setStem(new VF.Stem()),

    /*new VF.StaveNote({clef: "treble", keys: ["c/4"], duration: "q" }).setStem(new VF.Stem()),*/

    // A quarter-note D.
    /*new VF.StaveNote({clef: "treble", keys: ["d/4"], duration: "q" }).setStem(new VF.Stem()),

    // A quarter-note rest. Note that the key (b/4) specifies the vertical
    // position of the rest.
    new VF.StaveNote({clef: "treble", keys: ["b/4"], duration: "qr" }).setStem(new VF.Stem()),

    // A C-Major chord.
    new VF.StaveNote({clef: "treble", keys: ["c/4", "e/4", "g/4"], duration: "q" }).setStem(new VF.Stem())*/
  ];

  // Create a voice in 4/4 and add the notes from above
  var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
  voice.addTickables(notes);

  // Format and justify the notes to 350 pixels (50 pixels left for key and time signatures).
  var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);

  // Render voice
  /*voice.draw(context, stave);*/
  /*console.table(contextArr[0][1]);*/
  voice.draw(contextArr[numClicks-1][0], contextArr[numClicks-1][1]);
}
