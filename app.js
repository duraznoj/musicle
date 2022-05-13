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
const jsonIndices = [99, 4, 37, 109, 82, 52, 19, 75, 10, 
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
//console.table(jsonIndices);

//set currentJSON Index to 0 the first time we load the page
let currentJSONIndex;
//get song index from jsonIndices
//let currentSongIndex = jsonIndices[currentJSONIndex];
let currentSongIndex;

//define stats variables
let totalGames;
let currentStreak;
let totalWins;

//define settings variables
let hardMode = false;
let hardModeViolated = false;
let hardModeDisabled = false;

/*select range of pitches we want to use for the piano keys*/
const pitches = [];
const lowestPitch = 60;
const highestPitch = 84;

//import json containing melodies
let songName;
let treble;
var keySig;

//extend storage objects
Storage.prototype.setObj = function(key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
  return JSON.parse(this.getItem(key))
}

const WHITE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''];
const BLACK_KEYS = ['w', 'e', 't', 'y', 'u', 'o', 'p'];

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
const tileDisplay = document.querySelector('.tile-container');
//var tileDisplay = document.querySelector('.tile-container');
const messageDisplay = document.querySelector('.message-container');
const piano = document.querySelector('.item-4-piano')
const pianoKeys = document.querySelector('.item-4-piano.key');
/*const body = document.querySelector('body');*/

//get the hard mode slider checkbox input
const hardModeCheckBox = document.getElementById("hardModeCheckBox");
const hardModeSlider = document.getElementById("hardModeSlider")

//screen resolution variables
const devResList = ['350px', '375px', '400px', '820px'];
const divWidthMultiplierList = [1.9, 1.9, 1.9, 1.6];
const xPosList = [0, 0, 0, -15];
const yPosList = [0, 0, 0, 10];

let deviceResolution;
let divWidthMultiplier;
let xPos;
let yPos;

/*boolean for game status*/
let isGameOver = false;

const VF = Vex.Flow;
//const contextArr = [];
let currentRow = 0;
let currentTile = 0;
let storedCurrentRow = 0;

let guessRows = [ //previously was defined with 'var' - before that 'let'
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

let contextRows = [ //previously was defined with 'var' - before that - 'let'
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

let checkRows = [];


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

      window.localStorage.setObj("guessRows", guessRows);
      window.localStorage.setObj("checkRows", checkRows); //seems to help with checkRows null error
      
    }).catch(err => console.log(err));

}

//function to convert between midi pitch number and vexflow note names
const convertPitch = (inPitch) => {
  let outNote;
  //convert midi pitch to note name for vexflow
  if (keySigFlats.includes(keySig)) {
    outNote = conversionLookup[inPitch].noteNameFlat;

  } else if (keySigSharps.includes(keySig)){
    outNote = conversionLookup[inPitch].noteNameSharp;
  }

  return outNote;
};

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
  });
}

//function to check device resolution so we can draw staves for each screen size
const checkDeviceResolution = (devRes, devResInd) => {
  // Create a condition that targets viewports at least 'x' px wide
  const mediaQuery = window.matchMedia('(min-width: ' + devRes + ')');

  /*mediaQuery.onchange = (event) => {
    if (event.matches) {
      console.log('This screen is in the ' + devRes + ' wide interval.')
      deviceResolution = devResList[devResInd];
      console.log("devRes: " + deviceResolution);
    } else {
      
    }
  }*/

  if (mediaQuery.matches) {
    //console.log('This screen is in the ' + devRes + ' wide interval.')
    deviceResolution = devResList[devResInd];
    divWidthMultiplier = divWidthMultiplierList[devResInd];
    xPos = xPosList[devResInd];
    yPos = yPosList[devResInd];
    //console.log("devRes: " + deviceResolution);
  }
}



const createContext = (divID, keySig) => {
  //const VF = Vex.Flow;
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
  //context.scale(.5,.8);
  //console.log("type context: " + typeof(Object.values(context)) + "\ncontext: " + Object.values(context));
  //context.setViewBox(divWidth * 0.15, divHeight * 0.2, divWidth * 1, divHeight * 1.5); //x, y, width, height
  context.setViewBox(25, 0, divWidth * 1, divHeight * 2); //x, y, width, height
  
  //console.log(deviceResolution);

  //add stave
  //const stave = new VF.Stave(10, -20, divWidth * 0.85).addClef('treble').addKeySignature(keySig); //(x, y, width)
  //const stave = new VF.Stave(10, -12, divWidth * 0.85).addClef('treble').addKeySignature(keySig); //(x, y, width) --> good for desktop
  //const stave = new VF.Stave(10, 0, divWidth * 0.85).addClef('treble').addKeySignature(keySig); //(x, y, width) --> good for mobile
  ////const stave = new VF.Stave(0, 0, divWidth * 1.9).addClef('treble').addKeySignature(keySig); //(x, y, width) --> good for 360 px width
  const stave = new VF.Stave(xPos, yPos, divWidth * divWidthMultiplier).addClef('treble').addKeySignature(keySig); //(x, y, width) --> good for 360 px width

  //context.setViewBox(divWidth*.5, divHeight*0.1, divWidth * 2, divHeight * 2); //x, y, width, height

  stave.setContext(context).draw();
  return [context, stave]; //store context and stave objects so we can have something to draw notes on later
  //return context;
}

/*const createStave = (inContext, keySig) => {
  const stave = new VF.Stave(10, -20, 150 * 0.85).addClef('treble').addKeySignature(keySig); //(x, y, width)
  stave.setContext(inContext).draw();
  console.log("Create stave")
  //return [context, stave]; //store context and stave objects so we can have something to draw notes on later
  return stave;
}*/

//console.table(contextRows);

//function to remove localStorage items when we need to create a new game state
function resetGameState() {
  window.localStorage.removeItem("currentDate");
  //window.localStorage.removeItem("songIndex");
  window.localStorage.removeItem("songName");
  window.localStorage.removeItem("treble");
  window.localStorage.removeItem("keySig");
  window.localStorage.removeItem("guessRows");
  window.localStorage.removeItem("checkRows");
  window.localStorage.removeItem("currentRow");
  window.localStorage.removeItem("isGameOver");
  window.localStorage.removeItem("hardMode");
  window.localStorage.removeItem("hardModeDisabled");
  //window.localStorage.removeItem("contextRows");
  //window.localStorage.removeItem("staveRows");
  //window.localStorage.removeItem("tileDisplay");
  //window.localStorage.removeItem("guessedWordCount");
  //window.localStorage.removeItem("guessedsongs");
  //window.localStorage.removeItem("keyboardContainer");
  //window.localStorage.removeItem("boardContainer");
  //window.localStorage.removeItem("availableSpace");
}

const initLocalStorage = () => {
  const storedCurrentDate = window.localStorage.getItem("currentDate");
  
  //const storedCurrentSongIndex = window.localStorage.getItem("currentSongIndex");
  //const storedSong
  //const storedTreble = window.localStorage.getObj("treble");

  currentJSONIndex = Number(window.localStorage.getItem("currentJSONIndex")) || 0;
  console.log("currentJSONIndex: " + currentJSONIndex);

  currentSongIndex = jsonIndices[currentJSONIndex];
  console.log("currentSongIndex: " + currentSongIndex);

  totalGames = window.localStorage.getItem("totalGames") || 0;

  console.log("totalGames");
  console.table(totalGames);

  currentStreak = window.localStorage.getItem("currentStreak") || 0;

  console.log("currentStreak");
  console.table(currentStreak);

  totalWins = window.localStorage.getItem("totalWins") || 0;

  console.log("totalWins");
  console.table(totalWins);

  if(storedCurrentDate) { //could add check for if other items exist...
    if(currentDate === storedCurrentDate) {
      console.log("stored date === currentDate")
      
      //load data
      songName = window.localStorage.getItem("songName");
      console.log("storedSongName: " + songName);
      treble = window.localStorage.getObj("treble");
      console.log("storedTreble: \n" + treble);
      keySig = window.localStorage.getItem("keySig");
      console.log("storedKeySig: " + keySig);
      
      guessRows = window.localStorage.getObj("guessRows");
      //console.log("storedGuessRows: \n")
      //console.table(guessRows);

      checkRows = window.localStorage.getObj("checkRows");
      //console.log("storedCheckRows: \n")
      //console.table(checkRows);

      storedCurrentRow = window.localStorage.getItem("currentRow");
      //console.log("storedCurrentRow: \n")
      //console.log(storedCurrentRow);

      isGameOver = window.localStorage.getItem("isGameOver");
      //console.log("storedIsGameOver: " + isGameOver);

      //hardMode = window.localStorage.getObj("hardMode") || 0;
      //console.log("storedHardMode: " + hardMode);

      //hardModeDisabled = window.localStorage.getObj("hardModeDisabled") || false;
      //console.log("storedHardModeDisabled: " + hardModeDisabled);

      //hardModeCheckBox.disabled = false;


      //create tiles
      createTiles();

      //console.log("currentRow: " + currentRow);
      //console.log("currentTile: " + currentTile);
      //console.log("isGameOver? " + isGameOver);

      //render staves within the tiles
      guessRows.forEach((guessRow, guessRowIndex) => {
        guessRow.forEach((guess, guessIndex) => {
          contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
        });
      });

      if(!storedCurrentRow) {
        //currentRow = 0;

      } else {
        guessRows.slice(0, storedCurrentRow+1).forEach((guessRow, guessRowIndex) => { //only want to iterate up to the currentRow
          //console.log("iter guessRow: " + guessRow);
  
          guessRow.forEach((guess, guessIndex) => {
            if(checkRows[guessRowIndex]) {
              const colorToBeAdded = checkRows[guessRowIndex][guessIndex].color;
              const tileToBeColored = document.querySelector("#guessRow-" + currentRow).childNodes;
              //console.log("html element to be selected: " + '[data-note="' + guessRows[currentRow][currentTile] + '"]');
              const keyToBeColored = document.querySelector('[data-note="' + guessRows[currentRow][currentTile] + '"]');
              
              tileToBeColored[guessIndex].classList.add(colorToBeAdded);
              keyToBeColored.classList.add(colorToBeAdded);

            } //else {
              //console.log("No color");
            //}

            //console.log("note to be drawn: " + guessRows[guessRowIndex][guessIndex]);
            drawNote(guessRows[guessRowIndex][guessIndex]); //note: currentTile changes within drawNote function
            
            if(guessIndex !== 0 && guessIndex % 4 === 0) {
              //currentRow++;
              currentTile = 0;
              //console.log("currentTile in init guessRow loop: " + currentTile);
            }
          });

          currentRow++;
          //console.log("currentRow in init guessRow loop: " + currentRow);
        });
  
        currentRow = storedCurrentRow;
        currentTile = 0; //reset currentTile
      }
      
      //console.log("currentRow: " + currentRow);
      //console.log("currentTile: " + currentTile);
      //console.log("isGameOver? " + isGameOver);

    } else if (currentDate !== storedCurrentDate) {
      console.log("stored date !== currentDate");
      currentJSONIndex++; //move to next song
      currentSongIndex = jsonIndices[currentJSONIndex];
      //reset game state and initialize new game state
      resetGameState();
      //store current date and songIndex to local storage
      window.localStorage.setItem("currentDate", currentDate);
      window.localStorage.setItem("currentJSONIndex", currentJSONIndex.toString());
      //window.localStorage.setItem("currentSongIndex", currentSongIndex);
      //call getTreble() async function that stores the treble data and contextRows to local storage
      getTreble();
      //create tile html elements
      createTiles();
    }
  } else if (!storedCurrentDate) {
    console.log("no date stored");
    //store current date and songIndex to local storage
    window.localStorage.setItem("currentDate", currentDate);
    window.localStorage.setItem("currentJSONIndex", currentJSONIndex.toString());
    //window.localStorage.setItem("currentSongIndex", currentSongIndex);
    //call getTreble() async function that stores the treble data and contextRows to local storage
    getTreble();
    //create tile html elements
    createTiles();
  }
}

const updateStatsModal = () => {
  //const currentStreak = window.localStorage.getItem("currentStreak");
  //const totalWins = window.localStorage.getItem("totalWins");
  //const totalGames = window.localStorage.getItem("totalGames");

  document.getElementById("total-played").textContent = totalGames;
  document.getElementById("total-wins").textContent = totalWins;
  document.getElementById("current-streak").textContent = currentStreak;

  const winPct = Math.round((totalWins / totalGames) * 100) || 0;
  document.getElementById("win-pct").textContent = winPct;
}

const initStatsModal = () => {
  const modal = document.getElementById("stats-modal");
  const modalContent = document.getElementById("stats-modal-content");
  const img = document.getElementById("stats-img");

  // Get the button that opens the modal
  const btn = document.getElementById("stats");

  // Get the <span> element that closes the modal
  const span = document.getElementById("close-stats");

  // When the user clicks on the button, open the modal
  btn.addEventListener("click", function () {
    updateStatsModal();
    //modal.style.display = "block";
    modalContent.style.display = "block";
  });

  // When the user clicks on the button image, open the modal
  img.addEventListener("click", function () {
    updateStatsModal();
    //modal.style.display = "block";
    modalContent.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", function () {
    //modal.style.display = "none";
    modalContent.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  /*window.addEventListener("click", function (event) {
    if (event.target !== modalContent && event.target !== btn && event.target !== img) {
      modalContent.style.display = "none";
    }
  });*/

}

const initHelpModal = () => {
  const modal = document.getElementById("help-modal");
  const modalContent = document.getElementById("help-modal-content");
  const img = document.getElementById("help-img");

  // Get the button that opens the modal
  const btn = document.getElementById("help");

  // Get the <span> element that closes the modal
  const span = document.getElementById("close-help");

  // When the user clicks on the button, open the modal
  btn.addEventListener("click", function () {
    //modal.style.display = "block";
    modalContent.style.display = "block";
  });

  // When the user clicks on the button image, open the modal
  img.addEventListener("click", function () {
    updateStatsModal();
    //modal.style.display = "block";
    modalContent.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", function () {
    //modal.style.display = "none";
    modalContent.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  /*window.addEventListener("click", function (event) {
    if (event.target !== modalContent && event.target !== btn && event.target !== img) {
      modalContent.style.display = "none";
    }
  });*/
}

const initSettingsModal = () => {
  const modal = document.getElementById("settings-modal");
  const modalContent = document.getElementById("settings-modal-content");
  const img = document.getElementById("settings-img");
  const warningText = document.getElementById("hard-mode-warning");

  // Get the button that opens the modal
  const btn = document.getElementById("settings");

  // Get the <span> element that closes the modal
  const span = document.getElementById("close-settings");

  //get hardMode variables from local storage
  hardMode = window.localStorage.getObj("hardMode") || false;
  hardModeDisabled = window.localStorage.getObj("hardModeDisabled") || false;
  console.log("storedHardMode: \n");
  console.log((hardMode));
  console.log("storedHardModeDisabled: \n");
  console.log((hardModeDisabled));
  warningText.style.display = "none";

  //set hardmode checkbox checked or unchecked depending on stored value - keeps checkbox position constant upon refresh
  hardModeCheckBox.checked = hardMode;

  //if game is in progress can't activate hard mode, otherwise slider controls hard mode
  hardModeSlider.addEventListener("click", function () {
    if(currentRow > 0) {
      hardModeDisabled = true;
      hardModeCheckBox.disabled = true;
      window.localStorage.setObj("hardModeDisabled", hardModeDisabled);
      warningText.style.display = "block";

    } else if (currentRow === 0) {
      //listen for changes in the checkbox input value
      hardModeCheckBox.addEventListener("change", function () {
      if (this.checked) {
        hardMode = true;
        hardModeDisabled = true;
        window.localStorage.setObj("hardMode", hardMode);
        window.localStorage.setObj("hardModeDisabled", hardModeDisabled);

      } else if (!this.checked) {
        hardMode = false;
        hardModeDisabled = false;
        window.localStorage.setObj("hardMode", hardMode);
        window.localStorage.setObj("hardModeDisabled", hardModeDisabled);
      };
    });
    };
  });

  // When the user clicks on the button, open the modal
  btn.addEventListener("click", function () {
    updateStatsModal();
    //modal.style.display = "block";
    modalContent.style.display = "block";
  });

  // When the user clicks on the button image, open the modal
  img.addEventListener("click", function () {
    updateStatsModal();
    //modal.style.display = "block";
    modalContent.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", function () {
    //modal.style.display = "none";
    modalContent.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  /*window.addEventListener("click", function (event) {
    if (event.target !== modalContent && event.target !== btn && event.target !== img) {
      modalContent.style.display = "none";
    }
  });*/

}

//function to show messages after guesses and at end of game
const showMessage = (message) => {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageDisplay.append(messageElement);
  setTimeout(() => messageDisplay.removeChild(messageElement), 4000);

}

//function to color tiles based on guesses
const flipTile = () => {

  //get all notes in the previous rows
  let alreadyGuessed = [];
  //console.log("guessRows in flipTile: \n");
  for(let row = 0; row < currentRow; row++){
    guessRows[row].forEach((tile) => {
      //console.log(tile);
      alreadyGuessed.push(tile);
    });
  }

  //get unique notes in the array of previously guessed notes
  let uniqueGuesses = [... new Set(alreadyGuessed)];

  //console.log(alreadyGuessed);
  console.log(uniqueGuesses);

  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  //let checkTreble = treble; //copy of treble that we will remove letters from !DOES NOT WORK AS OBJECTS ARE MUTABLE!
  //let checkTreble = Object.assign({}, treble); //works
  let checkTreble = treble.map(val => val.toString());
  //console.log("checkTreble as assigned: \n");
  //console.table(checkTreble);
  //console.log("FIrst val: " + checkTreble[0]);
  let guess = []; //storing the letters we have guessed
  let currentRowGuess = [];

  //extract notes from tile 'data' attribute (which we set in the playNote function) and store
  //along with default grey overlay color in the 'guess' array
  rowTiles.forEach(tile => {
    guess.push({note: tile.getAttribute('data'), color: 'grey-overlay'});
    currentRowGuess.push(tile.getAttribute('data'));
  });

  console.log("currentRowGuess: \n");
  console.log(currentRowGuess);


  //if hard mode is activated, valid guesses have to contain all unique previously guessed notes
  (function(){
    uniqueGuesses.forEach((prevGuess, prevIdx) => {
      if(hardMode && !currentRowGuess.includes(prevGuess) && currentRow > 0){
        hardModeViolated = true;

        if(prevIdx === 0){ //only show warning message once
          showMessage("MUST USE NOTES FROM PREVIOUS GUESSES");
        }
      }
    });

    if((hardMode && !hardModeViolated) || !hardMode) {
  
      guess.forEach((guess, index) => {
        //console.log("check green guess.note: " + guess.note);
        //console.log("check green checkTreble[index]: " + checkTreble[index]);
        if(guess.note == treble[index]) { //don't forget to reference the note itself -- should be  check treble?
          //console.log("equals - green")
          guess.color = 'green-overlay';
          checkTreble[index] = 'checkedTreble'; //important to set the 'checked' str differently for checkTreble vs guess.notes
          guess.note = 'checkedGuess';
        }
      });

      guess.forEach((guess, index) => {
        //console.log("check yellow guess.note: " + guess.note);
        //console.log("check yellow checkTreble[index]: " + checkTreble[index]);
        
        if(checkTreble.includes(guess.note)){
          //console.log('includes - yellow')
          guess.color = 'yellow-overlay';
          const noteForRemoval = checkTreble.indexOf(guess.note);
          checkTreble[noteForRemoval] = 'checkedTreble';
          //checkTreble[index] = 'checkedTreble'; //need to remove the actual element that was guessed...
        }
        //console.log("checkTreble: \n");
        //console.table(checkTreble)
      });

      rowTiles.forEach((tile, index) => {
        const dataNote = tile.getAttribute('data'); //data_note = key.dataset.note is a string
        const currentKey = document.querySelector('[data-note="' + dataNote + '"]');
        //console.log('flipTile currentKey: ' + '[data-note="' + dataNote + '"]');

        setTimeout(() => {
          tile.classList.add('flip');
          tile.classList.add(guess[index].color);
          currentKey.classList.add(guess[index].color);

        }, 500 * index);
        
      });

      checkRows.push(guess);
    } else {
      //return;
    }
  })();
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
    //const currentContext = contextRows[currentRow][currentTile];
    //const currentStave = staveRows[currentRow][currentTile];
    context.svg.removeChild(context.svg.lastChild); //delete note from stave
    guessRows[currentRow][currentTile] = ''; //delete note from matrix
    console.log(guessRows);
  }
  //if the enter button is pressed and 5 tiles have been populated then check if the guess is correct
  else if(button.id == "Enter" && currentTile > 4){
    const guess = guessRows[currentRow].join('');
    const trebleJoin = treble.join('');
    //console.log('editNote scope: guess = ' + guess + " treble = " + trebleJoin);
    //console.log(guess === trebleJoin)
    //window.localStorage.setItem('guessRows', guessRows);

    //color tile based on guess accuracy using the flipTile() function
    flipTile();

    if(hardModeViolated){
      hardModeViolated = false;
      return;
    } else if(guess === trebleJoin && !isGameOver){
      showMessage("OUTSTANDING!");
      showMessage("TREBLE " + currentJSONIndex);
      showMessage("SONG: " + songName);
      isGameOver = true;
      window.localStorage.setItem('isGameOver', isGameOver);
      window.localStorage.setItem('currentRow', currentRow);
      window.localStorage.setObj('checkRows', checkRows);
      window.localStorage.setObj('guessRows', guessRows);
      totalGames = ((Number(totalGames)) + 1).toString();
      window.localStorage.setItem("totalGames", totalGames);
      currentStreak = ((Number(currentStreak)) + 1).toString();
      window.localStorage.setItem("currentStreak", currentStreak);
      totalWins = ((Number(totalWins)) + 1).toString();
      window.localStorage.setItem("totalWins", totalWins);
      return;
    } else if(currentRow >= 5 && !isGameOver){
      showMessage("GAME OVER");
      showMessage("TREBLE " + currentJSONIndex);
      showMessage("SONG: " + songName);      
      isGameOver = true;
      window.localStorage.setItem('isGameOver', isGameOver);
      window.localStorage.setItem('currentRow', currentRow);
      window.localStorage.setObj('checkRows', checkRows);
      window.localStorage.setObj('guessRows', guessRows);
      totalGames = ((Number(totalGames)) + 1).toString()
      window.localStorage.setItem("totalGames", totalGames);
      currentStreak = 0;
      window.localStorage.setItem("currentStreak", currentStreak);
      return;
    } else if(currentRow < 5){
      currentRow++;
      currentTile = 0;
      //window.localStorage.setItem('currentRow', currentRow);
      //window.localStorage.setObj('checkRows', checkRows);
      //window.localStorage.setObj('guessRows', guessRows);
    }
    
    window.localStorage.setItem('currentRow', currentRow);
    window.localStorage.setObj('checkRows', checkRows);
    window.localStorage.setObj('guessRows', guessRows);
  }
}

const drawNote = (inNote) => {
  if(inNote) {
    //console.log("note to be drawn in drawNote: " + inNote +"\n");
    //const currentNoteName = conversionLookup[inNote].noteName;
    const currentNoteName = convertPitch(Number(inNote));
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

    //console.log("drawNote - currentRow: " + currentRow + " currentTile: " + currentTile + "\n");

    //Draw note
    voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]); //have to make sure currentRow is correct

    // increment tile counter
    currentTile++;
    //console.log("currentTile in drawNote: " + currentTile);
  }
  else {
    //console.log("No note");
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

  drawNote(currentNote);

  /*//const currentNoteName = conversionLookup[currentNote].noteName;
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

  //Draw note
  voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]);

  // increment tile counter
  currentTile++;*/
}


////////////////////////////////// MAIN ///////////////////////////////////////

//load game state if it was saved and it's not yet time to generate a new treble, otherwise initalize game state and store first objects
// initLocalStorage(); used to be here

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

//load game state if it was saved and it's not yet time to generate a new treble, otherwise initalize game state and store first objects
//initLocalStorage();

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
    //console.log('Enter is pressed!');
    let keyButton = {id:"Enter"};
    editNote(keyButton);
  } else if (e.code === "Backspace" || e.code === "Delete") {
    //console.log('Delete is pressed!');
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
  //console.log("keydown event listener- currentRow: " + currentRow + " currentTile: " + currentTile + " isGameOver: " + isGameOver);
  if (!isGameOver && currentRow <= 5 & currentTile <= 4){
    if (whiteKeyIndex > -1 && whiteKeyIndex <= 14) {
      //console.log("whiteKeyIndex: " + whiteKeyIndex)
      playNote(whiteKeys[whiteKeyIndex + whiteOctaveShift]);
    }
    if (blackKeyIndex > -1 & blackKeyIndex <= 9) {
      //console.log("blackKeyIndex: " + blackKeyIndex)
      playNote(blackKeys[blackKeyIndex + blackOctaveShift]);
    }
  }

  //}  
});

keys.forEach(key => {
  key.addEventListener('click', () => {
    if(!isGameOver && currentRow <= 5 & currentTile <= 4){
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

//loop through screen resolutions to find the size of the current user's screen
devResList.forEach((res, resInd) => {
  checkDeviceResolution(res, resInd);
});

console.log(deviceResolution);


//load game state if it was saved and it's not yet time to generate a new treble, otherwise initalize game state and store first objects
initLocalStorage();
initHelpModal();
initStatsModal();
initSettingsModal();

