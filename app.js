/*CONSTANTS*/
/*const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];*/ /*only need this for keyboard input*/

/*select range of pitches we want to use for the piano keys*/
const pitches = [];
const lowest_pitch = 60; 
const highest_pitch = 83;

/*create corresponding array for note names for use with vexflow*/
const note_letters = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const note_names_lower = note_letters.map((val) => val + '/4');
const note_names_higher = note_letters.map((val) => val + '/5');
const note_names = note_names_lower.concat(note_names_higher);

/*create array of key colors for use in generating piano*/
const key_colors_basic = ["white", "black", "white", "black", "white", "white", "black", "white", "black", "white", "black", "white"]
const key_colors = key_colors_basic.concat(key_colors_basic)

/*define constants for accessing and creating html elements*/
const body = document.querySelector('body');
const tileDisplay = document.querySelector('.tile-container');
const messageDisplay = document.querySelector('.message-container');
const piano = document.querySelector('.item-4-piano')

/*boolean for game status*/
let isGameOver = false;

/*choose melody for the game*/
const key_sig = 'D';
const treble_in = [48,49,50,51,52];
/*convert melody array of numbers to an array of strings for comparing with div attributes later on*/
let treble = treble_in.map(val => val.toString());
/*console.log(treble)*/

const VF = Vex.Flow;
const contextArr = [];
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

/*MAIN*/
/*populate pitches array for use in generating piano keys*/
for(let p = lowest_pitch; p <= highest_pitch; p++){
  pitches.push(p);
};

/*define middle pitch for rendering bass vs treble clef*/
const middle_pitch = pitches[Math.floor((highest_pitch - lowest_pitch) / 2) + 1];
/*console.log(highest_pitch)
console.log(middle_pitch)
console.log(lowest_pitch)*/

/*create lookup table from the pitches, vexflow note names and piano key colors for converting between them*/
let conversion_lookup = {};
for (let i=0; i < pitches.length; i++) {
  /*populate conversion_lookup object indices with the elements of pitches, and assign data to the indices from the pitches, note_names, and key_colors arrays
  can concat multiple variables for the index if we want more details*/
  conversion_lookup[pitches[i]] = {"pitch" : pitches[i],"note_name" : note_names[i],"key_color" : key_colors[i]}; 
}
/*console.log(conversion_lookup[48].key_color)*/

/*console.table(typeof(conversion_lookup[48].pitch))*/

/*function to convert between midi pitch number and vexflow note names*/
const convert_pitches = (in_pitches) => {
  let out_notes = [];
  in_pitches.forEach((pitch) => {
    out_notes.push(conversion_lookup[pitch].note_name);
  });
  return(out_notes);
};

/*create elements for list of note audio element*/
pitches.forEach((pitch, index) => {
  const audio_element = document.createElement('audio');
  audio_element.setAttribute('id', pitch);
  audio_element.src = "notes/notes_" + pitch + ".wav";
  body.append(audio_element);
});

/*create enter button*/
const enter_button = document.createElement('button');
enter_button.setAttribute('id', 'enter');
enter_button.textContent = 'Enter';
piano.append(enter_button);

/*create html elements to represent keys for piano and append relevant properties from lookup table*/
pitches.forEach((pitch, index) => {
  const key_element = document.createElement('div');
  key_element.classList.add("key", conversion_lookup[pitch].key_color); /*comma used to separate multiple classes*/
  key_element.setAttribute('data-note', pitch);
  piano.append(key_element);
});

/*create delete button*/
const delete_button = document.createElement('button');
delete_button.setAttribute('id', 'delete');
delete_button.textContent = 'Delete';
piano.append(delete_button);


/*get newly created elements*/
const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');
const buttons = document.querySelectorAll('.item-4-piano button');

/*console.table(keys)*/


/*boilerplate VF code - note: has to be before the guessrows for loop*/
const createContext = (divID, hasClef) => {
  /*const VF = Vex.Flow;*/
  /*const div = document.getElementById(divID)*/
  const div = document.querySelector(divID)
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  /*renderer.resize(300, 100);*/
  const context = renderer.getContext();
  /*context.setViewBox(0, 0, 300, 100); //size

  /*add stave*/
  const stave = new VF.Stave(10, 0, 280).addClef('treble').addKeySignature(key_sig);
  stave.setContext(context).draw();

  return [context, stave]; /*store context and stave objects so we can have something to draw notes on later*/
}

/*create tiles for music notes*/
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

  /*render staves within the tiles */
  guessRow.forEach((guess, guessIndex) => {
    /*contextArr.push(createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex)); /*need the id identifier*/
    contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex);
  });

});

/*console.table(contextRows);*/

/*function to show messages after guesses and at end of game*/
const showMessage = (message) => {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageDisplay.append(messageElement);
  setTimeout(() => messageDisplay.removeChild(messageElement), 2000);

}

/*function to color tiles based on guesses*/
const flipTile = () => {
  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  rowTiles.forEach((tile, index) => {
    const dataNote = tile.getAttribute('data');
    if(dataNote == treble[index]){
      tile.classList.add('green-overlay');
    } else if(treble.includes(dataNote)){
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
      /*console.table(guessRows)*/
    }
  });
});

buttons.forEach((button) =>{
  button.addEventListener('click', () => editNote(button));
});


/*function to handle what happens when you click the enter or delete buttons*/
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
  /*if the enter button is pressed and 5 tiles have been populated then check if the guess is correct*/
  else if(button.id == "enter" && currentTile > 4){

    const guess = guessRows[currentRow].join('');
    const treble_join = treble.join('');
    console.log('guess = ' + guess + " treble= " + treble_join);
    /*console.log(guess === treble_join)*/

    /*color tile based on guess accuracy using the flipTile() function*/
    flipTile();

    if(guess === treble_join){
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

/*function to play note audio, store note in guessRows matrix, and render note on vexflow staves in the tile elements*/
function playNote(key){

  var current_note = key.dataset.note;
  console.log("key: " + current_note);
  /*console.log(guessRows);*/

  /*store note in guessRows matrix*/
  guessRows[currentRow][currentTile] = current_note;

  /*add note value to element data value*/
  const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
  tile.setAttribute('data', current_note);

  const noteAudio = document.getElementById(key.dataset.note);
  //console.log("key: "+noteAudio);
  noteAudio.currentTime = 0;
  noteAudio.play();
  key.classList.add('active');
  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active');
  })

  /*convert midi pitch to note name for vexflow*/
  const current_note_name = conversion_lookup[current_note].note_name;
  console.log(current_note_name)

  var stave_note = [
    // A quarter-note.
    new VF.StaveNote({clef: "treble", keys: [current_note_name + "/5"], duration: "q" }).setStem(new VF.Stem()),
  ];

  // Create a voice in 4/4 and add the note from above
  var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
  voice.addTickables(stave_note);

  // Format and justify the notes to 350 pixels (50 pixels left for key and time signatures).
  var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);

  // Render voice
  /*voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]); /* args = [context, stave]*/
  voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]);

  currentTile++;
}

