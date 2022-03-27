//CONSTANTS AND IMPORTS

//for testing without json import:
//let inTreble = [59,62,59,64,59];
//let treble = inTreble.map(val => val.toString());
//let keySig = 'D'
//let checkTreble = Object.assign({}, treble); 
//if we want a copy of the original element that can withstand changes without mutating the original we have to use Object.assign();
//we can also map the objects to a new array, which we need to do anyway to compare between same type;
//let checkTreble = treble.map(val => val.toString());

//Get current date in yyyyMMdd format,
//const dt = luxon.DateTime.utc().toFormat('yyyyMMdd'); //UTC time
const currentDate = luxon.DateTime.utc().toFormat('yyyyMMddHHmm'); //UTC time - use minutes for testing
console.log("Date: " + currentDate);

//create array of json indices in random order (generated with basic python script)
const json_indices = [99, 4, 37, 109, 82, 52, 19, 75, 10, 
  92, 80, 165, 54, 144, 102, 77, 163, 90, 61, 39, 73, 71, 
  128, 162, 170, 158, 30, 28, 66, 179, 7, 112, 148, 145, 
  110, 74, 60, 33, 2, 139, 38, 86, 137, 161, 63, 36, 140, 184, 169, 
  97, 138, 25, 108, 141, 142, 16, 149, 151, 26, 111, 
  51, 157, 147, 31, 120, 41, 155, 143, 95, 3, 22, 42, 
  160, 173, 136, 53, 93, 35, 84, 49, 123, 43, 94, 78, 
  124, 62, 135, 182, 70, 55, 5, 107, 133, 122, 88, 104, 
  181, 191, 177, 29, 116, 8, 153, 114, 127, 13, 106, 154, 
  50, 87, 11, 172, 98, 12, 105, 190, 44, 113, 174, 132, 
  101, 9, 76, 129, 81, 18, 167, 89, 175, 15, 56, 150, 83, 
  103, 164, 180, 24, 20, 152, 134, 48, 65, 188, 6, 40, 
  168, 178, 45, 187, 185, 100, 146, 166, 130, 91, 46, 96, 69, 
  189, 121, 159, 183, 176, 79, 17, 58, 186, 23, 0, 72, 171, 
  117, 85, 59, 64, 47, 27, 67, 34, 57, 156, 119, 1, 118, 126, 
  115, 131, 125, 32, 14, 192, 68, 21,];
//console.table(json_indices);

//set currentJSON Index to 0 the first time we load the page
let currentJSONIndex = 0;
//get song indexc from json_indices
let currentSongIndex = json_indices[currentJSONIndex];

/*var contextRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];*/

/*select range of pitches we want to use for the piano keys*/
const pitches = [];
const lowestPitch = 60;
const highestPitch = 84;

//import json containing melodies
let songName;
let treble;
let keySig;
//let shiftedPitches;
//let octaveDifference;

//shiftPitches() used to be here

//getTreble() used to be here

//extend storage objects
Storage.prototype.setObj = function(key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
  return JSON.parse(this.getItem(key))
}

//initLocalStorage() etc used to be here

//const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
//const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j']; /*only need this for keyboard input*/

const WHITE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''];
const BLACK_KEYS = ['w', 'e', 't', 'y', 'u', 'o', 'p'];

/*select range of pitches we want to use for the piano keys
const pitches = [];
const lowestPitch = 60;
const highestPitch = 83;*/

//create corresponding arrays for note names for use with vexflow
//define two arrays - one for flats and one for sharps so that we can draw the appropriate note for the given key signature
const noteLettersFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const noteLettersSharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const noteNamesFlatsLower = noteLettersFlats.map((val) => val + '/4');
const noteNamesFlatsHigher = noteLettersFlats.map((val) => val + '/5');
const noteNamesFlats = noteNamesFlatsLower.concat(noteNamesFlatsHigher)
noteNamesFlats.push('C/6'); //add extra 'C' to have full second octave

const noteNamesSharpsLower = noteLettersSharps.map((val) => val + '/4');
const noteNamesSharpsHigher = noteLettersSharps.map((val) => val + '/5');
const noteNamesSharps = noteNamesSharpsLower.concat(noteNamesSharpsHigher);
noteNamesSharps.push('C/6'); //add extra 'C' to have full second octave

const keySignatures = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']; //add case for key of Gb?
const keySigFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Eb'];
const keySigSharps = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];

/*create array of key colors for use in generating piano*/
const keyColorsBasic = ["white", "black", "white", "black", "white", "white", "black", "white", "black", "white", "black", "white"];
const keyColors = keyColorsBasic.concat(keyColorsBasic);
keyColors.push("white"); //add extra white key to have full second octave
//console.table(keyColors);

/*define constants for accessing and creating html elements*/
const body = document.querySelector('body');
//const tileDisplay = document.querySelector('.tile-container');
var tileDisplay = document.querySelector('.tile-container');
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

var guessRows = [ //previously was defined with 'let'
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

var contextRows = [ //previously was defined with 'let'
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

//MAIN

//SET UP PITCHES AND CONVERSION TABLE
//populate pitches array for use in generating piano keys
for(let p = lowestPitch; p <= highestPitch; p++){
  pitches.push(p);
};

//define middle pitch for rendering bass vs treble clef
const middlePitch = pitches[Math.floor((highestPitch - lowestPitch) / 2) + 1];
/*console.log(highestPitch)
console.log(middlePitch)
console.log(lowestPitch)*/

/*create lookup table from the pitches, vexflow note names and piano key colors for converting between them*/
let conversionLookup = {};
for (let i=0; i < pitches.length; i++) {
  /*populate conversionLookup object indices with the elements of pitches, and assign data to the indices from the pitches, noteNames, and keyColors arrays
  can concat multiple variables for the index if we want more details*/
  conversionLookup[pitches[i]] = {"pitch" : pitches[i],"noteNameFlat" : noteNamesFlats[i], "noteNameSharp" : noteNamesSharps[i], "keyColor" : keyColors[i]}; 
}

//console.table(conversionLookup)

// OTHER FUNCTIONS

//function to shift input pitches to the correct octave for our piano keyboard
const shiftPitches = (inPitches) => {
  //assumes intro melodies are never more than two octaves apart
  console.log("inPitches: " + inPitches);
  const minTreblePitch = Math.min(...inPitches);
  const maxTreblePitch = Math.max(...inPitches);
  let shiftedPitches;
  let octaveDifference;
  if (minTreblePitch < lowestPitch) {
    if (minTreblePitch % 12 === 0) {
      console.log('min: multiple of 12');
      console.log(lowestPitch - minTreblePitch);
      octaveDifference = (lowestPitch - minTreblePitch);
      console.log("low octave difference: " + octaveDifference);
    } else {
      octaveDifference = ((Math.floor((lowestPitch - minTreblePitch) / 12) + 1) * 12);
      console.log("low octave difference: " + octaveDifference);
    }
    shiftedPitches = inPitches.map(p => p + octaveDifference)
    //console.log("low octave difference: " + octaveDifference);
    console.log("low: " + shiftedPitches);
    
  } else if (maxTreblePitch > highestPitch) {
    if (maxTreblePitch % 12 === 0) {
      console.log('max: multiple of 12');
      console.log(maxTreblePitch - highestPitch);
      octaveDifference = (maxTreblePitch - highestPitch);
    } else {
      octaveDifference = ((Math.floor((maxTreblePitch - highestPitch) / 12) + 1) * 12)
    }
    console.log("high octave difference: " + ((octaveDifference + 1) * 12));
    shiftedPitches = inPitches.map(val => val - octaveDifference);
    console.log("high: " + shiftedPitches);

  } else {
    console.log("No difference");
    shiftedPitches = inPitches;
  }
  console.log("out shifted: " + shiftedPitches);
  return shiftedPitches;
}

//console.log("shift global scope out: " + shiftPitches(inTreble));
//console.log( "shift global scope out: " + shiftedPitches);


//function to get treble and save items to local storage
const getTreble = () => {
  fetch("./melody_processing/processed/intro_pitches.json")
    .then(response => response.json())
    .then(json => {
      //let melody_json = json.intro_pitches

      //generate random index so we can select a new song every day
      //const numSongs = Object.keys(json.intro_pitches).length;
      //console.log(numSongs);
      //let currentSongIndex = getRandIndex(numSongs - 1);
      console.log("currentSongIndex: " + currentSongIndex);
      //let currentSongIndex = '20220323';

      //get song from json
      let melody = json.intro_pitches[currentSongIndex];

      //get name of song, notes in the melody and key signature
      songName = melody.song_name.replaceAll('_', ' ').toUpperCase();
      let inTreble = melody.notes;
      keySig = keySignatures[melody.key_signature]; //source is in integer notation

      //console.log("melody.notes: " + melody.notes.join);
      let shiftedTreble = shiftPitches(inTreble);
      treble = shiftedTreble.map(val => val.toString());

      //store items in local storage
      //window.localStorage.setItem("currentDate", currentDate);
      //window.localStorage.setItem("currentSongIndex", currentSongIndex);
      window.localStorage.setItem("songName", songName);
      window.localStorage.setObj("treble", treble);
      window.localStorage.setItem("keySig", keySig);


      console.log(melody);
      console.log(songName);
      console.log(treble);
      console.log(keySig);

      //render staves within the tiles
      guessRows.forEach((guessRow, guessRowIndex) => {
        guessRow.forEach((guess, guessIndex) => {
          contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
        });
      });
      
      //save context in local storage
      window.localStorage.setObj("contextRows", contextRows);
      tileDisplay = document.querySelector(".tile-container"); //don't need to define this earlier? Could add createTiles() above the stave rendering?
      console.log("tileDisplay to be stored: "+ tileDisplay.innerHTML);
      window.localStorage.setItem("tileDisplay", tileDisplay.innerHTML);
    
    }).catch(err => console.log(err));

}
//getTreble();

//function to convert between midi pitch number and vexflow note names
const convertPitch = (inPitch) => {
  let outNote;
  //convert midi pitch to note name for vexflow
  if (keySigFlats.includes(keySig)) {
    outNote = conversionLookup[inPitch].noteNameFlat;

  } else if (keySigSharps.includes(keySig)){
    outNote = conversionLookup[inPitch].noteNameSharp;
  }
  /*let outNotes = [];
  inPitches.forEach((pitch) => {
    outNotes.push(conversionLookup[pitch].noteName);
  });
  return(outNotes);*/
  return outNote;
};

//guessRows.forEach etc used to be here
//create tiles for music notes
const createTiles = () => {
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
    /*guessRow.forEach((guess, guessIndex) => {
      contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
    });*/
  });
}

//boilerplate VF code - note: has to be before the guessRows for loop
const createContext = (divID, keySig) => {
  //const VF = Vex.Flow;
  //const div = document.getElementById(divID)
  const div = document.querySelector(divID)
  const divHeight = div.clientHeight;
  const divWidth = div.clientWidth;
  //const divHeight = window.getComputedStyle(div, null).getPropertyValue('height');
  //const divWidth = window.getComputedStyle(div, null).getPropertyValue('width');
  //console.log("h: " + divHeight + " w: " + divWidth);  
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(divWidth, divHeight); // (width, height)
  //console.log("h2: " + divHeight + " w2: " + divWidth);  

  //const divHeight = div.clientHeight;
  //const divWidth = div.innerWidth;
  //renderer.resize(divWidth/2, divHeight); // (width, height)
  //console.log(div.clientWidth);
  const context = renderer.getContext();
  //context.setViewBox(0, 0); //x, y, width, height
  //add stave
  const stave = new VF.Stave(10, -20, divWidth * 0.85).addClef('treble').addKeySignature(keySig); //(x, y, width)
  stave.setContext(context).draw();
  return [context, stave]; //store context and stave objects so we can have something to draw notes on later
}
//console.table(contextRows);

//initLocalStorage();
/*initHelpModal();
initStatsModal();
createSquares();
addKeyboardClicks();
loadLocalStorage();*/

/*const initGameState = () => {
  window.localStorage.setItem("currentDate", currentDate);
  window.localStorage.setItem("currentSongIndex", currentSongIndex);
  getTreble()
  window.localStorage.setItem("treble", currentDate);



  
}*/

//function to remove localStorage items when we need to create a new game state
function resetGameState() {
  window.localStorage.removeItem("currentDate");
  window.localStorage.removeItem("songIndex");
  window.localStorage.removeItem("songName");
  window.localStorage.removeItem("treble");
  window.localStorage.removeItem("keySig");
  //window.localStorage.removeItem("contextRows");
  window.localStorage.removeItem("tileDisplay");
  //window.localStorage.removeItem("guessedWordCount");
  //window.localStorage.removeItem("guessedsongs");
  //window.localStorage.removeItem("keyboardContainer");
  //window.localStorage.removeItem("boardContainer");
  //window.localStorage.removeItem("availableSpace");
}

function initLocalStorage() {
  const storedCurrentDate = window.localStorage.getItem("currentDate");
  //const storedCurrentSongIndex = window.localStorage.getItem("currentSongIndex");
  //const storedSong
  //const storedTreble = window.localStorage.getObj("treble");

  if(storedCurrentDate) { //could add check for if other items exist...
    if(currentDate === storedCurrentDate) {
      console.log("stored date === currentDate")
      //load data
      currentSongIndex = Number(window.localStorage.getItem("currentSongIndex"));
      console.log("storedCurrentSongIndex: " + currentSongIndex);
      songName = window.localStorage.getItem("songName");
      console.log("storedSongName: " + songName);
      treble = window.localStorage.getObj("treble");
      console.log("storedTreble: \n" + treble);
      keySig = window.localStorage.getItem("keySig");
      console.log("storedKeySig: " + keySig);
      //contextRows = window.localStorage.getObj("contextRows")
      //console.log("storedContextRows: \n")
      //console.table(contextRows);
      const storedTileDisplay = window.localStorage.getItem("tileDisplay");
      if (storedTileDisplay) {
        document.querySelector(".tile-container").innerHTML = storedTileDisplay;
      }

      //render staves within the tiles
      guessRows.forEach((guessRow, guessRowIndex) => {
        guessRow.forEach((guess, guessIndex) => {
          contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
        });
      });

    } else if (currentDate !== storedCurrentDate) {
      console.log("stored date !== currentDate");
      //reset game state and initialize new game state
      resetGameState();
      //store current date and songIndex to local storage
      window.localStorage.setItem("currentDate", currentDate);
      window.localStorage.setItem("currentSongIndex", currentSongIndex);
      //call getTreble() async function that stores the treble data and contextRows to local storage
      getTreble();
      //create tile html elements
      createTiles();
      
    }
  } else if (!storedCurrentDate) {
    console.log("no date stored")
    //store current date and songIndex to local storage
    window.localStorage.setItem("currentDate", currentDate);
    window.localStorage.setItem("currentSongIndex", currentSongIndex);
    //call getTreble() async function that stores the treble data and contextRows to local storage
    getTreble();
    //create tile html elements
    createTiles();
  }
}



/*function loadLocalStorage() {
  currentSongIndex =
    Number(window.localStorage.getItem("currentSongIndex")) ||
    currentSongIndex;
  guessedWordCount =
    Number(window.localStorage.getItem("guessedWordCount")) ||
    guessedWordCount;
  availableSpace =
    Number(window.localStorage.getItem("availableSpace")) || availableSpace;
  guessedsongs =
    JSON.parse(window.localStorage.getItem("guessedsongs")) || guessedsongs;

  currentSong = songs[currentSongIndex];

  const storedBoardContainer = window.localStorage.getItem("boardContainer");
  if (storedBoardContainer) {
    document.getElementById("board-container").innerHTML =
      storedBoardContainer;
  }

  const storedKeyboardContainer =
    window.localStorage.getItem("keyboardContainer");
  if (storedKeyboardContainer) {
    document.getElementById("keyboard-container").innerHTML =
      storedKeyboardContainer;

    addKeyboardClicks();
  }
}


function createSquares() {
  const gameBoard = document.getElementById("board");

  for (let i = 0; i < 30; i++) {
    let square = document.createElement("div");
    square.classList.add("animate__animated");
    square.classList.add("square");
    square.setAttribute("id", i + 1);
    gameBoard.appendChild(square);
  }
}

function preserveGameState() {
  window.localStorage.setItem("guessedsongs", JSON.stringify(guessedsongs));

  const keyboardContainer = document.getElementById("keyboard-container");
  window.localStorage.setItem(
    "keyboardContainer",
    keyboardContainer.innerHTML
  );

  const boardContainer = document.getElementById("board-container");
  window.localStorage.setItem("boardContainer", boardContainer.innerHTML);
}

function updateTotalGames() {
  const totalGames = window.localStorage.getItem("totalGames") || 0;
  window.localStorage.setItem("totalGames", Number(totalGames) + 1);
}

function showResult() {
  const finalResultEl = document.getElementById("final-score");
  finalResultEl.textContent = "Wordle 1 - You win!";

  const totalWins = window.localStorage.getItem("totalWins") || 0;
  window.localStorage.setItem("totalWins", Number(totalWins) + 1);

  const currentStreak = window.localStorage.getItem("currentStreak") || 0;
  window.localStorage.setItem("currentStreak", Number(currentStreak) + 1);
}

function showLosingResult() {
  const finalResultEl = document.getElementById("final-score");
  finalResultEl.textContent = `Wordle 1 - Unsuccessful Today!`;

  window.localStorage.setItem("currentStreak", 0);
}

function updateWordIndex() {
  console.log({ currentSongIndex });
  window.localStorage.setItem("currentSongIndex", currentSongIndex + 1);
}

function initHelpModal() {
  const modal = document.getElementById("help-modal");

  // Get the button that opens the modal
  const btn = document.getElementById("help");

  // Get the <span> element that closes the modal
  const span = document.getElementById("close-help");

  // When the user clicks on the button, open the modal
  btn.addEventListener("click", function () {
    modal.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

function updateStatsModal() {
  const currentStreak = window.localStorage.getItem("currentStreak");
  const totalWins = window.localStorage.getItem("totalWins");
  const totalGames = window.localStorage.getItem("totalGames");

  document.getElementById("total-played").textContent = totalGames;
  document.getElementById("total-wins").textContent = totalWins;
  document.getElementById("current-streak").textContent = currentStreak;

  const winPct = Math.round((totalWins / totalGames) * 100) || 0;
  document.getElementById("win-pct").textContent = winPct;
}

function initStatsModal() {
  const modal = document.getElementById("stats-modal");

  // Get the button that opens the modal
  const btn = document.getElementById("stats");

  // Get the <span> element that closes the modal
  const span = document.getElementById("close-stats");

  // When the user clicks on the button, open the modal
  btn.addEventListener("click", function () {
    updateStatsModal();
    modal.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}
});*/

//function to show messages after guesses and at end of game
const showMessage = (message) => {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageDisplay.append(messageElement);
  setTimeout(() => messageDisplay.removeChild(messageElement), 2000);

}

//function to color tiles based on guesses
const flipTile = () => {
  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  //let checkTreble = treble; //copy of treble that we will remove letters from !DOES NOT WORK AS OBJECTS ARE MUTABLE!
  //let checkTreble = Object.assign({}, treble); //works
  let checkTreble = treble.map(val => val.toString());
  //console.log("checkTreble as assigned: \n");
  //console.table(checkTreble);
  //console.log("FIrst val: " + checkTreble[0]);
  let guess = []; //storing the letters we have guessed

  //extract notes from tile 'data' attribute (which we set in the playNote function) and store
  //along with default grey overlay color in the 'guess' array
  rowTiles.forEach(tile => {
    guess.push({note: tile.getAttribute('data'), color: 'grey-overlay'});
  });

  /*console.log("flipTile scope: Before checking green: \n");
  console.log("checkTreble: \n");
  console.log(checkTreble)
  console.log("guess: \n");
  console.table(guess);*/
  //console.log("source treble: \n");
  //console.table(treble);
  
  guess.forEach((guess, index) => {
    console.log("check green guess.note: " + guess.note);
    console.log("check green checkTreble[index]: " + checkTreble[index]);
    if(guess.note == treble[index]) { //don't forget to reference the note itself -- should be  check treble?
      console.log("equals - green")
      guess.color = 'green-overlay';
      checkTreble[index] = 'checkedTreble'; //important to set the 'checked' str differently for checkTreble vs guess.notes
      guess.note = 'checkedGuess';
    }
  });

  /*console.log("Before checking yellow: \n");
  console.log("checkTreble: \n");
  console.table(checkTreble)
  console.log("guess: \n");
  console.table(guess);*/
  //console.log("source treble: \n");
  //console.table(treble);

  guess.forEach((guess, index) => {
    console.log("check yellow guess.note: " + guess.note);
    console.log("check yellow checkTreble[index]: " + checkTreble[index]);
    
    if(checkTreble.includes(guess.note)){
      console.log('includes - yellow')
      guess.color = 'yellow-overlay';
      const noteForRemoval = checkTreble.indexOf(guess.note);
      checkTreble[noteForRemoval] = 'checkedTreble';
      //checkTreble[index] = 'checkedTreble'; //need to remove the actual element that was guessed...
    }
    console.log("checkTreble: \n");
    console.table(checkTreble)
  });

  /*console.log("After checking yellow and before adding classlist variables: \n");
  console.log("checkTreble: \n");
  console.table(checkTreble)
  console.log("guess: \n");
  console.table(guess);*/
  //console.log("source treble: \n");
  //console.table(treble);

  rowTiles.forEach((tile, index) => {
    const dataNote = tile.getAttribute('data'); //data_note = key.dataset.note is a string
    const currentKey = document.querySelector('[data-note="' + dataNote + '"]');
    //console.log('[data-note="' + dataNote + '"]');

    setTimeout(() => {
      tile.classList.add('flip');
      tile.classList.add(guess[index].color);
      currentKey.classList.add(guess[index].color);

    }, 500 * index);
    
  });

};

/*function to handle what happens when you click the enter or delete buttons*/
const editNote = (button) => {
  /*console.log('clicked');*/
  /*document.getElementsByClassName("buttons")[0].id; */
  console.log(button.id)
  //console.table("editNote: " + treble);

  if(button.id == "Delete" && currentTile > 0){
    currentTile--; //go back to previous tile
    const context = contextRows[currentRow][currentTile][0]; //get context - consider making this a single value for all functions?
    context.svg.removeChild(context.svg.lastChild); //delete note from stave
    guessRows[currentRow][currentTile] = ''; //delete note from matrix
    console.log(guessRows);
  }
  //if the enter button is pressed and 5 tiles have been populated then check if the guess is correct
  else if(button.id == "Enter" && currentTile > 4){
    const guess = guessRows[currentRow].join('');
    const trebleJoin = treble.join('');
    console.log('editNote scope: guess = ' + guess + " treble = " + trebleJoin);
    //console.log(guess === trebleJoin)

    //color tile based on guess accuracy using the flipTile() function
    flipTile();

    if(guess === trebleJoin && !isGameOver){
      showMessage("OUTSTANDING!");
      showMessage("SONG: " + songName);
      isGameOver = true;
      return;
    } else if(currentRow >= 5 && !isGameOver){
      showMessage("GAME OVER");
      showMessage("SONG: " + songName);
      isGameOver = true;
      return;
    } else if(currentRow < 5){
      currentRow++;
      currentTile = 0;
    }
  }
}

//function to play note audio, store note in guessRows matrix, and render note on vexflow staves in the tile elements
function playNote(key){

  var currentNote = key.dataset.note;
  console.log("key: " + currentNote);
  //console.log("type: " + typeof(currentNote));
  //console.log(guessRows);

  //store note in guessRows matrix
  guessRows[currentRow][currentTile] = currentNote;

  //add note value to element data value
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

  //const currentNoteName = conversionLookup[currentNote].noteName;
  const currentNoteName = convertPitch(currentNote);
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
  voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]); //args = [context, stave]

  // increment tile counter
  currentTile++;
}


////////////////////////////////// MAIN ///////////////////////////////////////

//load game state if it was saved and it's not yet time to generate a new treble, otherwise initalize game state and store first objects
initLocalStorage();

//create elements for list of note audio element
pitches.forEach((pitch, index) => {
  const audioElement = document.createElement('audio');
  audioElement.setAttribute('id', pitch);
  audioElement.src = "notes/notes_" + pitch + ".wav";
  body.append(audioElement);
});

//create enter button
const enterButton = document.createElement('button');
enterButton.setAttribute('id', 'Enter');
enterButton.textContent = 'Enter';
piano.append(enterButton);

//create html elements to represent keys for piano and append relevant properties from lookup table*/
pitches.forEach((pitch, index) => {
  const keyElement = document.createElement('div');
  keyElement.classList.add("key", conversionLookup[pitch].keyColor); //comma used to separate multiple classes
  keyElement.setAttribute('data-note', pitch);
  piano.append(keyElement);
});

//create delete button
const deleteButton = document.createElement('button');
deleteButton.setAttribute('id', 'Delete');
deleteButton.textContent = 'Delete';
piano.append(deleteButton);


//get newly created elements
const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');
const buttons = document.querySelectorAll('.item-4-piano button');


//createContext(), showMessage(), flipTile(), editNote(), playNote(), createTiles() used to be here

let whiteOctaveShift = 0;
let blackOctaveShift = 0;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') { 
    console.log('Enter is pressed!');
    let keyButton = {id:"Enter"};
    editNote(keyButton);
  } else if (e.code === "Backspace" || e.code === "Delete") {
    console.log('Delete is pressed!');
    let keyButton = {id:"Delete"};
    editNote(keyButton);
  }
  if (e.key === '1') {
    console.log("octave shift for keyboard: 0")
    whiteOctaveShift = 0;
    blackOctaveShift = 0;
  } else if(e.key === '2') {
    console.log("octave shift for keyboard: 7")
    whiteOctaveShift = 7;
    blackOctaveShift = 5;
  } //else {
  if (e.repeat) return
  const key = e.key;
  console.log("e.key: " + e.key);
  const whiteKeyIndex = WHITE_KEYS.indexOf(key); //+ whiteOctaveShift; //can't have addition of octaveShift at this step
  const blackKeyIndex = BLACK_KEYS.indexOf(key); //+ blackOctaveShift;
  if (!isGameOver && currentRow <= 5 & currentTile <= 4){
    if (whiteKeyIndex > -1 && whiteKeyIndex <= 14) {
      console.log("whiteKeyIndex: " + whiteKeyIndex)
      playNote(whiteKeys[whiteKeyIndex + whiteOctaveShift]);
    }
    if (blackKeyIndex > -1 & blackKeyIndex <= 9) {
      console.log("blackKeyIndex: " + blackKeyIndex)
      playNote(blackKeys[blackKeyIndex + blackOctaveShift]);
    }
  }

  //}  
});

keys.forEach(key => {
  key.addEventListener('click', () => {
    if(currentTile < 5 && currentRow < 6){
      playNote(key);
      //console.table(guessRows)
    }
  });
});


buttons.forEach((button) =>{
  button.addEventListener('click', () => {
    if(!isGameOver){
      editNote(button);
    }
    //editNote(button);
  });
});





