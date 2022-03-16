const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];
/*const KEY_DICT = 
[
  {'c/3':'48'}, 
  'c#/3':'49', 'd/3':'50', 'd#/3':'51'}*/ /*to-do- finish this*/

const tileDisplay = document.querySelector('.tile-container');
const messageDisplay = document.querySelector('.message-container');
const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');
const buttons = document.querySelectorAll('.item-4-piano button');
let isGameOver = false;

const musicle = 'CDEFEb'

const VF = Vex.Flow;
const contextArr = [];
/*let numClicks = 0;*/
let currentRow = 0;
let currentTile = 0;


const guessRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

const contextRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

/*boilerplate VF code - note: has to be before the guessrows for loop*/
const createContext = (divID, hasClef) => {
  /*const VF = Vex.Flow;*/
  /*const div = document.getElementById(divID)*/
  const div = document.querySelector(divID)
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(300, 100);
  const context = renderer.getContext();

  /*add stave*/
  const stave = new VF.Stave(10, 0, 300).addClef('treble');
  stave.setContext(context).draw();
  return [context, stave]; /*store context and stave objects so we can have something to draw notes on later*/
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
    /*contextArr.push(createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex)); /*need the id identifier*/
    contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex);
  });
});

/*console.table(contextRows);*/

const showMessage = (message) => {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageDisplay.append(messageElement);
  setTimeout(() => messageDisplay.removeChild(messageElement), 2000);

}

const flipTile = () => {
  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  rowTiles.forEach((tile, index) => {
    const dataNote = tile.getAttribute('data');
    if(dataNote == musicle[index]){
      tile.classList.add('green-overlay');
    } else if(musicle.includes(dataNote)){  /*to-do - decide on convention for note naming*/
      tile.classList.add('yellow-overlay');
    } else {
      tile.classList.add('grey-overlay');
    }
  });
};

keys.forEach(key => {
  key.addEventListener('click', () => {
    if(currentTile < 5 && currentRow < 6){
      playNote(key);
    }
  });
});

buttons.forEach((button) =>{
  button.addEventListener('click', () => editNote(button));
});



const editNote = (button) => {
  /*console.log('clicked');*/
  /*document.getElementsByClassName("buttons")[0].id; */
  console.log(button.id)
  if(button.id == "delete" && currentTile > 0){
    currentTile--; /*go back to previous tile*/
    const context = contextRows[currentRow][currentTile][0]; /*get context - consider making this a single value for all functions?*/
    context.svg.removeChild(context.svg.lastChild); /* delete note from stave*/
    guessRows[currentRow][currentTile] = ''; /*delete note from matrix*/
    console.log(guessRows);
  }
  else if(button.id == "enter" && currentTile > 4){

    const guess = guessRows[currentRow].join('');
    console.log('guess = ' + guess + "musicle= " + musicle);

    flipTile();

    if(guess == musicle){
      showMessage("Outstanding!");
      isGameOver == true;
      return;
    } else if(currentRow >= 5){
      showMessage("Game over.");
      isGameOver = true;
      return;
    } else if(currentRow < 5){
      currentRow++;
      currentTile = 0;
    }
  }
}

function playNote(key){
  /*numClicks += 1;
  console.log(numClicks);*/

  var currentNote = key.dataset.note;
  console.log("key: " + currentNote);
  console.log(guessRows);

  /*store note in guessRows matrix*/
  guessRows[currentRow][currentTile] = currentNote;

  /*add note value to element data value*/
  const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
  tile.setAttribute('data', currentNote);

  const noteAudio = document.getElementById(key.dataset.note);
  //console.log("key: "+noteAudio);
  noteAudio.currentTime = 0;
  noteAudio.play();
  key.classList.add('active');
  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active');
  })

  /*var stave_note = [
    // A quarter-note.
    new VF.StaveNote({clef: "treble", keys: [currentNote + "/4"], duration: "q" }).setStem(new VF.Stem()),
  ];

  // Create a voice in 4/4 and add the note from above
  var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
  voice.addTickables(stave_note);

  // Format and justify the notes to 350 pixels (50 pixels left for key and time signatures).
  var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);

  // Render voice
  /*voice.draw(context, stave);*/
  /*console.table(contextArr[1]);*/ /*undefined*/
  /*console.table(document.querySelector("svg"));
  console.table(document.querySelector(".vf-stave"));*/
  /*voice.draw(contextArr[numClicks-1][0], contextArr[numClicks-1][1]);*/
  /*voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]); /* args = [context, stave]*/
  
  currentTile++;
}

