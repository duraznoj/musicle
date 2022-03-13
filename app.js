const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];

const tileDisplay = document.querySelector('.tile-container')
const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');
const buttons = document.querySelectorAll('.item-4-piano button');

const musicle = ['C', 'D', 'E', 'D', 'Eb']

const VF = Vex.Flow;
const numNotes = 2;
const contextArr = [];
let numClicks = 0;

const guessRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
]

/*boilerplate VF code - note: has to be before the guessrows for loop*/
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

guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement = document.createElement('div');
  rowElement.setAttribute('id', 'guessRow-' + guessRowIndex);
  guessRow.forEach((guess, guessIndex) => {
    const tileElement = document.createElement('div');
    tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
    tileElement.classList.add('tile');
    rowElement.append(tileElement);
  });
  tileDisplay.append(rowElement);

  guessRow.forEach((guess, guessIndex) => {
    contextArr.push(createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex)); /*need the id identifier*/
  });
});

keys.forEach(key => {
  key.addEventListener('click', () => playNote(key))
});

buttons.forEach((button) =>{
  button.addEventListener('click', () => editNote(button));
})

const editNote = (button) => {
  /*console.log('clicked');*/
  /*document.getElementsByClassName("buttons")[0].id; */
  console.log(button.id)
}
/*document.addEventListener('keydown', (e) => {
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
})*/

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
    // A quarter-note.
    new VF.StaveNote({clef: "treble", keys: [currentNote + "/4"], duration: "q" }).setStem(new VF.Stem()),
  ];

  // Create a voice in 4/4 and add the note from above
  var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
  voice.addTickables(notes);

  // Format and justify the notes to 350 pixels (50 pixels left for key and time signatures).
  var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);

  // Render voice
  /*voice.draw(context, stave);*/
  /*console.table(contextArr[1]);*/ /*undefined*/
  /*console.table(document.querySelector("svg"));
  console.table(document.querySelector(".vf-stave"));*/
  voice.draw(contextArr[numClicks-1][0], contextArr[numClicks-1][1]);
}
