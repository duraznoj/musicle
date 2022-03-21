/*CONSTANTS*/
/*const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];*/ /*only need this for keyboard input*/

/*select range of pitches we want to use for the piano keys*/
const pitches = [];
const lowestPitch = 60;
const highestPitch = 83;

/*create corresponding array for note names for use with vexflow*/
const noteLetters = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const noteNamesLower = noteLetters.map((val) => val + '/4');
const noteNamesHigher = noteLetters.map((val) => val + '/5');
const noteNames = noteNamesLower.concat(noteNamesHigher);

const keySignatures = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']; //add case for key of Gb?

/*create array of key colors for use in generating piano*/
const keyColorsBasic = ["white", "black", "white", "black", "white", "white", "black", "white", "black", "white", "black", "white"]
const keyColors = keyColorsBasic.concat(keyColorsBasic)

/*define constants for accessing and creating html elements*/
const body = document.querySelector('body');
const tileDisplay = document.querySelector('.tile-container');
const messageDisplay = document.querySelector('.message-container');
const piano = document.querySelector('.item-4-piano')
const pianoKeys = document.querySelector('.item-4-piano.key');
/*const body = document.querySelector('body');*/


/*boolean for game status*/
let isGameOver = false;

/*choose melody for the game*/
//const keySig = 'D';
//const treble_in = [68,69,70,81,72];
/*convert melody array of numbers to an array of strings for comparing with div attributes later on*/
//let treble = treble_in.map(val => val.toString());

/*console.log(treble)*/

const VF = Vex.Flow;
//const contextArr = [];
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
for(let p = lowestPitch; p <= highestPitch; p++){
  pitches.push(p);
};

/*define middle pitch for rendering bass vs treble clef*/
const middlePitch = pitches[Math.floor((highestPitch - lowestPitch) / 2) + 1];
/*console.log(highestPitch)
console.log(middlePitch)
console.log(lowestPitch)*/

/*create lookup table from the pitches, vexflow note names and piano key colors for converting between them*/
let conversionLookup = {};
for (let i=0; i < pitches.length; i++) {
  /*populate conversionLookup object indices with the elements of pitches, and assign data to the indices from the pitches, noteNames, and keyColors arrays
  can concat multiple variables for the index if we want more details*/
  conversionLookup[pitches[i]] = {"pitch" : pitches[i],"noteName" : noteNames[i],"keyColor" : keyColors[i]}; 
}
/*console.log(conversionLookup[48].keyColor)*/

/*console.table(typeof(conversionLookup[48].pitch))*/

/*function to convert between midi pitch number and vexflow note names*/
const convertPitches = (inPitches) => {
  let outNotes = [];
  inPitches.forEach((pitch) => {
    outNotes.push(conversionLookup[pitch].noteName);
  });
  return(outNotes);
};

/*create elements for list of note audio element*/
pitches.forEach((pitch, index) => {
  const audioElement = document.createElement('audio');
  audioElement.setAttribute('id', pitch);
  audioElement.src = "notes/notes_" + pitch + ".wav";
  body.append(audioElement);
});

/*create enter button*/
const enterButton = document.createElement('button');
enterButton.setAttribute('id', 'enter');
enterButton.textContent = 'Enter';
piano.append(enterButton);

/*create html elements to represent keys for piano and append relevant properties from lookup table*/
pitches.forEach((pitch, index) => {
  const keyElement = document.createElement('div');
  keyElement.classList.add("key", conversionLookup[pitch].keyColor); /*comma used to separate multiple classes*/
  keyElement.setAttribute('data-note', pitch);
  piano.append(keyElement);
});

/*create delete button*/
const deleteButton = document.createElement('button');
deleteButton.setAttribute('id', 'delete');
deleteButton.textContent = 'Delete';
piano.append(deleteButton);


/*get newly created elements*/
const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');
const buttons = document.querySelectorAll('.item-4-piano button');

/*console.table(keys)*/


/*boilerplate VF code - note: has to be before the guessRows for loop*/
const createContext = (divID, keySig) => {
  /*const VF = Vex.Flow;*/
  /*const div = document.getElementById(divID)*/
  const div = document.querySelector(divID)
  const divHeight = div.clientHeight;
  const divWidth = div.clientWidth;
  //const divHeight = window.getComputedStyle(div, null).getPropertyValue('height');
  //const divWidth = window.getComputedStyle(div, null).getPropertyValue('width');
  //console.log("h: " + divHeight + " w: " + divWidth);  
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(divWidth, divHeight); // (width, height)
  //console.log("h2: " + divHeight + " w2: " + divWidth);  

  /*const divHeight = div.clientHeight;
  const divWidth = div.innerWidth;*/
  //renderer.resize(divWidth/2, divHeight); // (width, height)
  /*console.log(div.clientWidth);*/
  const context = renderer.getContext();
  //context.setViewBox(0, 0); //x, y, width, height
  /*add stave*/
  const stave = new VF.Stave(10, -20, divWidth * 0.85).addClef('treble').addKeySignature(keySig); //(x, y, width)
  stave.setContext(context).draw();
  return [context, stave]; /*store context and stave objects so we can have something to draw notes on later*/
}


//console.table(contextRows);

/*function to show messages after guesses and at end of game*/
const showMessage = (message) => {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageDisplay.append(messageElement);
  setTimeout(() => messageDisplay.removeChild(messageElement), 2000);

}

/*function to color tiles based on guesses*/
const flipTile = (treble) => {
  console.log("flipTile: " + treble);
  //console.log(typeof(treble))
  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  //console.table(rowTiles);
  let checkTreble = treble; //copy of treble that we will remove letters from
  const guess = []; //storing the letters we have guessed

  //extract notes from tile 'data' attribute (which we set in the playNote function) and store
  //along with default grey overlay color in the 'guess' array
  rowTiles.forEach(tile => {
    guess.push({note: tile.getAttribute('data'), color: 'grey-overlay'});
  });

  /*console.log("checkTreble: \n");
  console.table(checkTreble)
  console.log("guess: \n");
  console.table(guess);*/
  
  guess.forEach((guess, index) => {
    if(guess.note === checkTreble[index]) { //don't forget to reference the note itself
      console.log("equals - green")
      guess.color = 'green-overlay';
      checkTreble.splice(index, 1, ' '); //splice(start, deleteCount, item1)
      guess.note = '';
      console.log("guess.note: " + guess.note)
    } /*else if(checkTreble.includes(guess.note)){
      guess.color = 'yellow-overlay';
      checkTreble.splice(index, 1, ''); //splice(start, deleteCount, item1)
    }*/
  });

  /*console.log("checkTreble: \n");
  console.table(checkTreble)
  console.log("guess: \n");
  console.table(guess);*/

  guess.forEach((guess, index) => {
    if(checkTreble.includes(guess.note)){
      console.log('includes - yellow')
      console.log("guess.note: " + guess.note)
      guess.color = 'yellow-overlay';
      checkTreble.splice(index, 1, ' '); //splice(start, deleteCount, item1)
      guess.note = '';

    }
  });

  /*console.log("checkTreble: \n");
  console.table(checkTreble)
  console.log("guess: \n");
  console.table(guess);*/

  rowTiles.forEach((tile, index) => {
    const dataNote = tile.getAttribute('data'); //data_note = key.dataset.note is a string
    const currentKey = document.querySelector('[data-note="' + dataNote + '"]');
    //console.log('[data-note="' + dataNote + '"]');

    setTimeout(() => {
      tile.classList.add('flip');
      tile.classList.add(guess[index].color);
      currentKey.classList.add(guess[index].color);
      
      /*if(dataNote == checkTreble[index]){
        tile.classList.add('green-overlay');
        currentKey.classList.add('green-overlay');
        checkTreble.splice(index, 1, ' '); //splice(start, deleteCount, item1)
        console.log("checkTreble: \n");
        console.table(checkTreble)

      } else if(checkTreble.includes(dataNote)){
        tile.classList.add('yellow-overlay');
        currentKey.classList.add('yellow-overlay');
        checkTreble.splice(index, 1, ' '); //splice(start, deleteCount, item1)
        console.log("checkTreble: \n");
        console.table(checkTreble)
  
      } else {
        tile.classList.add('grey-overlay');
        currentKey.classList.add('grey-overlay');
        console.log("checkTreble: \n");
        console.table(checkTreble)
  
      }*/
    }, 500 * index);
    
  });


};

/*function to handle what happens when you click the enter or delete buttons*/
const editNote = (button, treble) => {
  /*console.log('clicked');*/
  /*document.getElementsByClassName("buttons")[0].id; */
  console.log(button.id)
  console.table("editNote: " + treble);

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
    const trebleJoin = treble.join('');
    console.log('guess = ' + guess + " treble = " + trebleJoin);
    /*console.log(guess === trebleJoin)*/

    /*color tile based on guess accuracy using the flipTile() function*/
    flipTile(treble);

    if(guess === trebleJoin){
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

  var currentNote = key.dataset.note;
  console.log("key: " + currentNote);
  //console.log("type: " + typeof(currentNote));
  /*console.log(guessRows);*/

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

  /*convert midi pitch to note name for vexflow*/
  const currentNoteName = conversionLookup[currentNote].noteName;
  console.log(currentNoteName)

  var staveNote = [
    // A quarter-note.
    new VF.StaveNote({clef: "treble", keys: [currentNoteName + "/5"], duration: "q" }).setStem(new VF.Stem()),
  ];

  // Create a voice in 4/4 and add the note from above
  var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
  voice.addTickables(staveNote);

  // Format and justify the notes to 350 pixels (50 pixels left for key and time signatures).
  var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);

  // Render voice
  /*voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]); /* args = [context, stave]*/
  voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]);

  currentTile++;
}

function xmur3(str) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
  } return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
  }
}

function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Create xmur3 state:
//var seed = xmur3("20220320");

//var rand = mulberry32(seed());
//var rand = mulberry32(20220320);


/*old_range = (1 - 0)  
new_range = (200 - 1)  
NewValue = (((rand() - OldMin) * NewRange) / OldRange) + NewMin

var rand_idx = rand()
console.log(rand())
console.log(rand())
console.log(rand())
console.log(rand())
console.log(rand())*/

//import local json containing melodies
const importJSON = () => {

  let melodyJSON;
  fetch("./melody_processing/processed/intro_pitches.json")
  .then(response => response.json())
  .then(data => melodyJSON = data)
  .then(() => {
    //console.log(melodyJSON);
    //console.log(melodyJSON.intro_pitches[1])
    //choose which song to use and store in song variable
    const song = melodyJSON.intro_pitches[1]
    //convert song variable elements to strings for later comparisons
    let treble = song.notes.map(val => val.toString()); //need this for "includes" checking for overlays
    //console.log(treble.includes('65'));
    //console.log(treble[0] == '66');
    const keySigIn = song.key_signature[0];
    let keySig = keySignatures[keySigIn - 1];

    const outArr = [treble, keySig];
  
    console.log("treble: " + treble + " key: " + keySig);
    
    /*var promises = outArr.map(function(o) {
      return o;
    });*/
    return Promise.all(outArr);
    //return [treble, keySig];
    //let treble = treble_in.map(val => val.toString());
    //mainFunc(treble, keySig);

    /*song.forEach(s => {
      //convert song variable elements to strings for later comparisons
    var treble = s.notes.map(val => val.toString());
    const keySigIn = s.keySignature[0];
    var keySig = keySignatures[keySigIn-1];*/

    /*if(!treble | !keySig){
      //console.log("missing data")
    } else {
      //console.log("treble: " + treble + " key: " + keySig);
    }*/
    //console.log("check - treble: " + treble + " key: " + keySig);
  
  });
}

/*importJSON().then((t) => {
  console.table(t);
});*/

  //console.log(" mainFunc treble: " + treble + " key: " + keySig);

//create tiles for music notes
guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement = document.createElement('div');
  rowElement.setAttribute('id', 'guessRow-' + guessRowIndex);
  rowElement.classList.add('guessRow');
  guessRow.forEach((guess, guessIndex) => {
    const tileElement = document.createElement('div');
    tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
    tileElement.classList.add('tile');
    //tileElement.style.width ="100%";
    //tileElement.style.height ="100%";
    rowElement.append(tileElement);
  });
  tileDisplay.append(rowElement);

  //render staves within the tiles
  guessRow.forEach((guess, guessIndex) => {
    /*importJSON().then((treble_arr) => {
      console.log(treble_arr);*/
      //contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, treble_arr[1]);
    //})
    //contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
  });
});

keys.forEach(key => {
  key.addEventListener('click', () => {
    if(currentTile < 5 && currentRow < 6){
      playNote(key);
      //console.table(guessRows)
    }
  });
});

//console.log(" mainFunc treble: " + treble + " key: " + keySig);

buttons.forEach((button) =>{
  //button.addEventListener('click', () => editNote(button, treble));
  button.addEventListener('click', () => {
    importJSON().then(treble_arr => {
      editNote(button, treble_arr[1]);
    });
  });
});





//main function for use in async fetch call
/*const mainFunc = (treble, keySig) => {
  //console.log(" mainFunc treble: " + treble + " key: " + keySig);

  //create tiles for music notes
  guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex);
    rowElement.classList.add('guessRow');
    guessRow.forEach((guess, guessIndex) => {
      const tileElement = document.createElement('div');
      tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
      tileElement.classList.add('tile');
      //tileElement.style.width ="100%";
      //tileElement.style.height ="100%";
      rowElement.append(tileElement);
    });
    tileDisplay.append(rowElement);

    //render staves within the tiles
    guessRow.forEach((guess, guessIndex) => {
      staveKeySig = importJSON().then(treble_arr => {
        contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, treble_arr[1]);
      })
      //contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
    });
  });

  keys.forEach(key => {
    key.addEventListener('click', () => {
      if(currentTile < 5 && currentRow < 6){
        playNote(key);
        //console.table(guessRows)
      }
    });
  });

  //console.log(" mainFunc treble: " + treble + " key: " + keySig);

  buttons.forEach((button) =>{
    //button.addEventListener('click', () => editNote(button, treble));
    button.addEventListener('click', () => {
      importJSON().then(treble_arr => {
        editNote(button, treble_arr[1]);
      });
    });
  });
}*/






