//CONSTANTS AND IMPORTS
import { DateTime } from "luxon";
import { Vex } from "vexflow";

//import melody data
import melodyJSON from "../melody_processing/processed/intro_pitches.json";

//for testing without json import:
//let inTreble = [59,62,59,64,59];
//let treble = inTreble.map(val => val.toString());
//let keySig = 'D'
//let checkTreble = Object.assign({}, treble); 
//if we want a copy of the original element that can withstand changes without mutating the original we have to use Object.assign();
//we can also map the objects to a new array, which we need to do anyway to compare between same type;
//let checkTreble = treble.map(val => val.toString());

//Get current date in desired format,
const currentDate = DateTime.utc().toFormat('yyyyMMddHHmm'); //UTC time - use minutes for testing

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

//set currentJSON Index to 0 the first time we load the page
let currentJSONIndex; //UNCOMMENT WHEN DONE TESTING STAVE PARAMETERS ON DEVICE RESOLUTIONS
//let currentJSONIndex = 167; //for testing screen resolutions
let currentSongIndex; //only use if loading from local JSON

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
let keySig;

//variable to hold all names of songs to create list of possible valid guesses
let songNamesList = [];

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

/*define constants for accessing and creating html elements*/
const body = document.querySelector('body');
const tileDisplay = document.querySelector('.tile-container');
const messageDisplay = document.querySelector('.message-container');
const piano = document.querySelector('.piano-container')
const pianoKeys = document.querySelector('.piano-container.key');

//get the hard mode slider checkbox input
const hardModeCheckBox = document.getElementById("hardModeCheckBox");
const hardModeSlider = document.getElementById("hardModeSlider")

//screen resolution variables
const devResWdthList = ['320px', '360px', '375px', '400px', '540px', '595px', '600px', '768px', '820px', '889px', '1024px', '1180px', '1200px'];
//const devResHghtList = ['350px', '350px', '350px', '375px', '400px', '540px', '595px', '600px', '768px', '8200px', '889px', '1024px', '1200px'];
const divWidthMultiplierList = [2.2, 1.95, 1.95, 1.75, 1.90, 1.6, 1.95, 1.5, 1.95, 1.90, 1.5, 1.5, 1.55];
const xPosList = [-10, 0, 0, 10, 0, -5, 0, 35, 0, 10, 50, 60, 60];
const yPosList = [5, 10, 10, 15, -15, 10, -15, -10, -10, -10, 15, 20, 20];

let deviceWidth;
let deviceHeight;
let divWidthMultiplier;
let xPos;
let yPos;

/*boolean for game status*/
let isGameOver = false;
let winningRow = 'X';

const VF = Vex.Flow;
//const contextArr = [];
let currentRow = 0;
let currentTile = 0;
let storedCurrentRow = 0;

//variables for redrawing staves upon window resize
let len = 0;
let lastPopulatedRow = 0;

//let guessRows = Array(6).fill().map(() => Array.fill(5));
//console.table(guessRows);

let guessRows = Array(6).fill(null).map(() => Array(5).fill(null));
//console.table(guessRows);

//console.log(typeof guessRows[0][0])

/*let guessRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];*/

let drawNoteBuffer = Array(5).fill(null);

let contextRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

let checkRows = []; //this is the matrix we use to store the guesses 

//MAIN

//SET UP PITCHES AND CONVERSION TABLE
//populate pitches array for use in generating piano keys
for(let p = lowestPitch; p <= highestPitch; p++){
  pitches.push(p);
};

//define middle pitch for rendering bass vs treble clef
const middlePitch = pitches[Math.floor((highestPitch - lowestPitch) / 2) + 1];

/*create lookup table from the pitches, vexflow note names and piano key colors for converting between them*/
let conversionLookup = {};
for (let i=0; i < pitches.length; i++) {
  /*populate conversionLookup object indices with the elements of pitches, and assign data to the indices from the pitches, noteNames, and keyColors arrays
  can concat multiple variables for the index if we want more details*/
  conversionLookup[pitches[i]] = {"pitch" : pitches[i],"noteNameFlat" : noteNamesFlats[i], "noteNameSharp" : noteNamesSharps[i], "keyColor" : keyColors[i]}; 
}

/*create lookup table from device resolution widths and heights, and associated stave rendering parameters*/
let devResLookup = {};
for (let i=0; i < devResWdthList.length; i++) {
  //devResLookup[i] = {"width" : devResWdthList[i], "height"  : devResHghtList[i], "divWidthMultiplier": divWidthMultiplierList[i], "xPos": xPosList[i], "yPos": yPosList[i]}; 
  devResLookup[i] = {"width" : devResWdthList[i], "divWidthMultiplier": divWidthMultiplierList[i], "xPos": xPosList[i], "yPos": yPosList[i]}; 
}

// OTHER FUNCTIONS

//function to shift input pitches to the correct octave for our piano keyboard
const shiftPitches = (inPitches) => {
  //assumes intro melodies are never more than two octaves apart
  const minTreblePitch = Math.min(...inPitches);
  const maxTreblePitch = Math.max(...inPitches);
  let shiftedPitches;
  let octaveDifference;
  if (minTreblePitch < lowestPitch) {
    if (minTreblePitch % 12 === 0) {
      octaveDifference = (lowestPitch - minTreblePitch);
    } else {
      octaveDifference = ((Math.floor((lowestPitch - minTreblePitch) / 12) + 1) * 12);
    }
    shiftedPitches = inPitches.map(p => p + octaveDifference)
    
  } else if (maxTreblePitch > highestPitch) {
    if (maxTreblePitch % 12 === 0) {
      octaveDifference = (maxTreblePitch - highestPitch);
    } else {
      octaveDifference = ((Math.floor((maxTreblePitch - highestPitch) / 12) + 1) * 12)
    }
    shiftedPitches = inPitches.map(val => val - octaveDifference);
  } else {
    shiftedPitches = inPitches;
  }
  return shiftedPitches;
}

//function to check device resolution so we can select the appropriate stave drawing parameters for that device
const checkDeviceResolution = () => {

  for(let i = 0; i < devResWdthList.length; i++) {
    // Create a condition that targets viewports at least 'x' px wide
    //const mediaQuery = window.matchMedia('(min-width: ' + devResLookup[i].width + ') and (min-height: ' + devResLookup[i].height + ')');
    const mediaQuery = window.matchMedia('(min-width: ' + devResLookup[i].width + ')');

    if (mediaQuery.matches) {
      deviceWidth = devResLookup[i].width;
      divWidthMultiplier = devResLookup[i].divWidthMultiplier;
      xPos = devResLookup[i].xPos;
      yPos = devResLookup[i].yPos;
    }
  }

  let lastSVG = document.querySelector("#guessRow-5-tile-4 > svg");

  //if the last tile has been drawn, then re-render staves (in other words- waiting for getTreble to finish)
  if(!!lastSVG) {
    reDrawStaves();

  } else if(!lastSVG) { // else if the last tile has not been drawn yet, don't do anything

  }
}

//function to re-draw staves and notes if page was resized
const reDrawStaves = () => {
  
  //have to set currentTile and currentRow to 0 so that can redraw notes from the beginning
  currentTile = 0;
  currentRow = 0;

  //render staves within the tiles
  //loop through each row in guess rows
  guessRows.forEach((guessRow, guessRowIndex) => {

    //get length of notes that have been drawn for current row
    const newLen = guessRows[guessRowIndex].filter(Boolean).length;

    //if the length of notes that have been drawn for current row is greater than the length for previous row
    //update the length variable to the new length and set lastPopulatedRow to the current row index

    if(newLen > 0) {
      len = newLen;
      lastPopulatedRow = guessRowIndex;
    }

    //loop through each tile in each guess row
    guessRow.forEach((guess, guessIndex) => {

      //remove old staves
      const oldStave = document.querySelector('#guessRow-' + guessRowIndex + '-tile-' + guessIndex + " svg");
      oldStave.remove(); //delete note from stave

      //create new staves with proper render settings
      contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);

      //re-draw the previously guessed note
      drawNote(guess);

      //when you get to the fifth tile you have to reset the currentTile counter to zero to mimic what happens in the actual editNote fuction
      if(guessIndex !== 0 && guessIndex % 4 === 0) {
        if(guessRowIndex !== 5) {
          currentRow++;
          currentTile = 0;

        } else if (guessRowIndex === 5) { //if you have completed the last row you need to reset the variables for the current game state

          //if there are no stored guesses (i.e. enter has not been pressed after rendering five notes)
          //or the last row that was populated has an undefined length (in other words some notes have been drawn but guess has not been submitted)
          //then we set the current tile to the length of the current guessRows row (which coincides with the n+1 position of the rendered notes)
          //we also set the current row to delete or render notes from to the last populated row
          if(checkRows.length === 0 || checkRows[lastPopulatedRow] === undefined) { //note: using typeof seems to create an error
            currentTile = len;
            currentRow = lastPopulatedRow;
          //if the last populated row is defined (in other words a guess has successfull been submitted, then we reset the currentTile counter to zero
          //so that we can start drawing at the first tile in the next row and advance the current row to the next row following the last populated row
          } else if(checkRows[lastPopulatedRow] !== undefined) {
            currentTile = 0; //reset currentTile to zero
            currentRow = lastPopulatedRow + 1; //iterate to next row so now we can't delete notes from the previous row
          }
        }
      }
    });
  });
}

//function to get treble and save items to local storage
const getTreble = () => {

  //get song from json
  let melody = melodyJSON.intro_pitches[currentSongIndex]; //if loading from local JSON

  //get name of song, notes in the melody and key signature
  songName = melody.song_name.replaceAll('_', ' ').toUpperCase();
  let inTreble = melody.notes;
  keySig = keySignatures[melody.key_signature]; //source is in integer notation
  let shiftedTreble = shiftPitches(inTreble);
  treble = shiftedTreble.map(val => val.toString());

  //get all names of songs
  melodyJSON.intro_pitches.forEach((song, songIdx) => {
    songNamesList.push(song.song_name.replaceAll('_', ' ').toUpperCase());
  });

  //store items in local storage
  window.localStorage.setItem("songName", songName);
  window.localStorage.setObj("treble", treble);
  window.localStorage.setItem("keySig", keySig);
  window.localStorage.setObj("songNamesList", songNamesList);

  //render staves within the tiles
  guessRows.forEach((guessRow, guessRowIndex) => {
    guessRow.forEach((guess, guessIndex) => {
      contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
    });
  });

  window.localStorage.setObj("guessRows", guessRows);
  window.localStorage.setObj("checkRows", checkRows); //seems to help with checkRows null error

  //update help modal with names of songs
  const helpModalSongParagraph = document.getElementById("help-modal-song-paragraph");
  const helpModalSongList = document.getElementById("help-modal-song-list");
  helpModalSongParagraph.textContent = "SONG LIST: ";
  songNamesList.forEach((songName)=>{
    let listElem = document.createElement("li");
    listElem.innerText = songName;
    helpModalSongList.appendChild(listElem);
  });
};

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
      rowElement.append(tileElement);
    });
    tileDisplay.append(rowElement);
  });
}

const createContext = (divID, keySig) => {
  const div = document.querySelector(divID)
  const divHeight = div.clientHeight;
  const divWidth = div.clientWidth;
  //const divHeight = window.getComputedStyle(div, null).getPropertyValue('height');
  //const divWidth = window.getComputedStyle(div, null).getPropertyValue('width');
  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  renderer.resize(divWidth, divHeight); // (width, height)
  ////console.log("h2: " + divHeight + " w2: " + divWidth); 
  const svgID = document.querySelector(divID + ' > svg');
  svgID.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  //const divHeight = div.clientHeight;
  //const divWidth = div.innerWidth;
  //renderer.resize(divWidth/2, divHeight); // (width, height)
  ////console.log(div.clientWidth);
  const context = renderer.getContext();
  //context.scale(.5,.8);

  context.setViewBox(0, 0, divWidth * 1, divHeight * 2); //x, y, width, height //CURRENTLY USING
  
  //add stave
  const stave = new VF.Stave(xPos, yPos, divWidth * divWidthMultiplier).addClef('treble').addKeySignature(keySig); //(x, y, width)

  //context.setViewBox(divWidth*.5, divHeight*0.1, divWidth * 2, divHeight * 2); //x, y, width, height

  stave.setContext(context).draw();
  return [context, stave]; //store context and stave objects so we can have something to draw notes on later
  //return context;
}

//function to remove localStorage items when we need to create a new game state
function resetGameState() {
  window.localStorage.removeItem("currentDate");
  window.localStorage.removeItem("songName");
  window.localStorage.removeItem("treble");
  window.localStorage.removeItem("keySig");
  window.localStorage.removeItem("guessRows");
  window.localStorage.removeItem("checkRows");
  window.localStorage.removeItem("currentRow");
  window.localStorage.removeItem("isGameOver");
  window.localStorage.removeItem("winningRow");
  window.localStorage.removeItem("hardModeDisabled");
  
}

const initLocalStorage = () => {
  const storedCurrentDate = window.localStorage.getItem("currentDate");

  currentJSONIndex = Number(window.localStorage.getItem("currentJSONIndex")) || 0; //UNCOMMENT WHEN DONE TESTING STAVE PARAMETERS ON DEVICE RESOLUTIONS
  currentSongIndex = jsonIndices[currentJSONIndex];
  totalGames = window.localStorage.getItem("totalGames") || 0;
  currentStreak = window.localStorage.getItem("currentStreak") || 0;
  totalWins = window.localStorage.getItem("totalWins") || 0;

  if(storedCurrentDate) {
    if(currentDate === storedCurrentDate) {
      
      //load data
      songName = window.localStorage.getItem("songName");
      treble = window.localStorage.getObj("treble");
      keySig = window.localStorage.getItem("keySig");
      songNamesList = window.localStorage.getObj("songNamesList");

      //update help modal with names of songs
      const helpModalSongParagraph = document.getElementById("help-modal-song-paragraph");
      const helpModalSongList = document.getElementById("help-modal-song-list");
      helpModalSongParagraph.textContent = "SONG LIST: ";
      songNamesList.forEach((songName)=>{
        let listElem = document.createElement("li");
        listElem.innerText = songName;
        helpModalSongList.appendChild(listElem);
      });

      guessRows = window.localStorage.getObj("guessRows");
      checkRows = window.localStorage.getObj("checkRows");
      storedCurrentRow = window.localStorage.getItem("currentRow");
      isGameOver = window.localStorage.getItem("isGameOver");
      winningRow = window.localStorage.getItem("winningRow");

      //create tiles
      createTiles();

      //render staves within the tiles
      guessRows.forEach((guessRow, guessRowIndex) => {
        guessRow.forEach((guess, guessIndex) => {
          contextRows[guessRowIndex][guessIndex] = createContext('#guessRow-' + guessRowIndex + '-tile-' + guessIndex, keySig);
        });
      });

      //if user has completed one row, redraw all stave notes and tile colors up to that current row
      if(storedCurrentRow) {
        guessRows.slice(0, storedCurrentRow+1).forEach((guessRow, guessRowIndex) => { //only want to iterate up to the currentRow
  
          guessRow.forEach((guess, guessIndex) => {
            if(checkRows[guessRowIndex]) {
              const colorToBeAdded = checkRows[guessRowIndex][guessIndex].color;
              const tileToBeColored = document.querySelector("#guessRow-" + currentRow).childNodes;
              const keyToBeColored = document.querySelector('[data-note="' + guessRows[currentRow][currentTile] + '"]');
              
              tileToBeColored[guessIndex].classList.add(colorToBeAdded);
              keyToBeColored.classList.add(colorToBeAdded);

            }

            drawNote(guessRows[guessRowIndex][guessIndex]); //note: currentTile changes within drawNote function
            
            if(guessIndex !== 0 && guessIndex % 4 === 0) {
              currentTile = 0;
            }
          });

          currentRow++;
        });
  
        currentRow = storedCurrentRow;
        currentTile = 0; //reset currentTile
      }

    } else if (currentDate !== storedCurrentDate) {
      currentJSONIndex++; //move to next song //UNCOMMENT WHEN DONE TESTING STAVE PARAMETERS ON DEVICE RESOLUTIONS
      currentSongIndex = jsonIndices[currentJSONIndex];
      //reset game state and initialize new game state
      resetGameState();
      //store current date and songIndex to local storage
      window.localStorage.setItem("currentDate", currentDate);
      window.localStorage.setItem("currentJSONIndex", currentJSONIndex.toString());

      //create tile html elements (called before getTreble when loading json from bundle)
      createTiles();

      //call getTreble() function that stores the treble data and contextRows to local storage
      getTreble();
      
    }
  } else if (!storedCurrentDate) {
    //console.log("no date stored");
    //store current date and songIndex to local storage
    window.localStorage.setItem("currentDate", currentDate);
    window.localStorage.setItem("currentJSONIndex", currentJSONIndex.toString());

    //create tile html elements
    createTiles();

    //call getTreble() function that stores the treble data and contextRows to local storage
    getTreble();
    
  }
}

const updateStatsModal = () => {

  document.getElementById("total-played").textContent = totalGames;
  document.getElementById("total-wins").textContent = totalWins;
  document.getElementById("current-streak").textContent = currentStreak;
  const winPct = Math.round((totalWins / totalGames) * 100) || 0;
  document.getElementById("win-pct").textContent = winPct;
  
}

//function to initalize the different types of modals
const initModal = (modalType) => {
  const modal = document.getElementById(modalType + "-modal");
  const modalContent = document.getElementById(modalType + "-modal-content");

  // Get the button that opens the modal
  const btn = document.getElementById(modalType);

  // Get the <span> element that closes the modal
  const span = document.getElementById("close-" + modalType);

  if(modalType === "settings") { //if it's the settings modal we need to set up the hard mode slider
    const warningText = document.getElementById("hard-mode-warning");

    //get hardMode variables from local storage
    hardMode = window.localStorage.getObj("hardMode") || false;
    hardModeDisabled = window.localStorage.getObj("hardModeDisabled") || false;

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
  }

  // When the user clicks on the button, open the modal
  btn.addEventListener("click", function () {
    updateStatsModal();
    modalContent.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", function () {
    modalContent.style.display = "none";
  });

}

//function to show messages after guesses and at end of game
const showMessage = (message) => {

  //only show the message if there is no prior message currently being displayed to avoid spamming messages
  if(message === "MUST USE GREEN/YELLOW TILES FROM PREVIOUS GUESSES" && !messageDisplay.hasChildNodes()){
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageDisplay.append(messageElement);
    setTimeout(() => messageDisplay.removeChild(messageElement), 4000);
  } else if(message !== "MUST USE GREEN/YELLOW TILES FROM PREVIOUS GUESSES") {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageDisplay.append(messageElement);
    setTimeout(() => messageDisplay.removeChild(messageElement), 2000);
  }
}

//function to color tiles based on guesses
const flipTile = () => {

  //create new array to store green/yello tile guesses
  let greenOrYellowGuesses = [];

  checkRows.forEach((row, rowIdx) => {
    row.forEach((tile, tileIdx) => {
      if(tile.color === "green-overlay" | tile.color === "yellow-overlay") {
        greenOrYellowGuesses.push(guessRows[rowIdx][tileIdx]);
      }
    })
  });

  //get unique notes in the array of previously guessed green/yellow tile notes
  let uniqueGuesses = [... new Set(greenOrYellowGuesses)];

  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  //let checkTreble = treble; //copy of treble that we will remove letters from !DOES NOT WORK AS OBJECTS ARE MUTABLE!
  //let checkTreble = Object.assign({}, treble); //works
  let checkTreble = treble.map(val => val.toString()); //prev working version

  let guess = []; //storing the letters we have guessed //prev working version
  let currentRowGuess = [];

  //extract notes from tile 'data' attribute (which we set in the playNote function) and store
  //along with default grey overlay color in the 'guess' array
  rowTiles.forEach(tile => {
    guess.push({note: tile.getAttribute('data'), color: 'grey-overlay'});
    currentRowGuess.push(tile.getAttribute('data'));
  });

  //if hard mode is activated, valid guesses have to contain all unique previously guessed notes
  (function(){
    uniqueGuesses.forEach((prevGuess, prevIdx) => {
      if(hardMode && !currentRowGuess.includes(prevGuess) && currentRow > 0){
        hardModeViolated = true;
        showMessage("MUST USE GREEN/YELLOW TILES FROM PREVIOUS GUESSES");
      }
    });

    if((hardMode && !hardModeViolated) || !hardMode) {
  
      guess.forEach((guess, index) => {
        if(guess.note == treble[index]) { //don't forget to reference the note itself -- should be  check treble?
          guess.color = 'green-overlay';
          checkTreble[index] = 'checkedTreble'; //important to set the 'checked' str differently for checkTreble vs guess.notes
          guess.note = 'checkedGuess';
        }
      });

      guess.forEach((guess, index) => {
        
        if(checkTreble.includes(guess.note)){
          guess.color = 'yellow-overlay';
          const noteForRemoval = checkTreble.indexOf(guess.note);
          checkTreble[noteForRemoval] = 'checkedTreble';
        }

      });

      rowTiles.forEach((tile, index) => {
        const dataNote = tile.getAttribute('data'); //data_note = key.dataset.note is a string
        const currentKey = document.querySelector('[data-note="' + dataNote + '"]');

        tile.classList.add(guess[index].color);
        currentKey.classList.add(guess[index].color);

        /*setTimeout(() => {
          tile.classList.add('flip');
          tile.classList.add(guess[index].color);
          currentKey.classList.add(guess[index].color);

        }, 300 * index);*/
        
      });

      checkRows.push(guess);
    }

  })();
};

/*function to handle what happens when you click the enter or delete buttons*/
const editNote = (button) => {

  if(button.id == "Delete" && currentTile > 0){
    currentTile--; //go back to previous tile
    const context = contextRows[currentRow][currentTile][0]; //get context - consider making this a single value for all functions?
    context.svg.removeChild(context.svg.lastChild); //delete note from stave
    //guessRows[currentRow][currentTile] = ''; //delete note from matrix
    guessRows[currentRow][currentTile] = null; //delete note from matrix
  }
  //if the enter button is pressed and 5 tiles have been populated then check if the guess is correct
  else if(button.id == "Enter" && currentTile > 4){
    const guess = guessRows[currentRow].join('');
    const trebleJoin = treble.join('');

    //color tile based on guess accuracy using the flipTile() function
    flipTile();

    if(hardModeViolated){
      hardModeViolated = false;
      return;
    } else if(guess === trebleJoin && !isGameOver){
      showMessage("OUTSTANDING!");
      showMessage("TREBLE " + currentJSONIndex);
      showMessage("SONG: " + songName);
      winningRow = currentRow + 1;
      isGameOver = true;
      window.localStorage.setItem('isGameOver', isGameOver);
      window.localStorage.setItem('winningRow', winningRow);
      window.localStorage.setItem('currentRow', currentRow);
      window.localStorage.setObj('checkRows', checkRows);
      window.localStorage.setObj('guessRows', guessRows);
      totalGames = ((Number(totalGames)) + 1).toString();
      window.localStorage.setItem("totalGames", totalGames);
      currentStreak = ((Number(currentStreak)) + 1).toString();
      window.localStorage.setItem("currentStreak", currentStreak);
      totalWins = ((Number(totalWins)) + 1).toString();
      window.localStorage.setItem("totalWins", totalWins);
      updateShareMessage();
      return;
    } else if(currentRow >= 5 && !isGameOver){
      showMessage("GAME OVER");
      showMessage("TREBLE " + currentJSONIndex);
      showMessage("SONG: " + songName);      
      isGameOver = true;
      winningRow = 'X';
      window.localStorage.setItem('isGameOver', isGameOver);
      window.localStorage.setItem('winningRow', winningRow);
      window.localStorage.setItem('currentRow', currentRow);
      window.localStorage.setObj('checkRows', checkRows);
      window.localStorage.setObj('guessRows', guessRows);
      totalGames = ((Number(totalGames)) + 1).toString();
      window.localStorage.setItem("totalGames", totalGames);
      currentStreak = 0;
      window.localStorage.setItem("currentStreak", currentStreak);
      updateShareMessage();
      return;
    } else if(currentRow < 5){
      currentRow++;
      currentTile = 0;
    }
    
    window.localStorage.setItem('currentRow', currentRow);
    window.localStorage.setObj('checkRows', checkRows);
    window.localStorage.setObj('guessRows', guessRows);
  }
}

const drawNote = (inNote) => {
  if(inNote) {
    const currentNoteName = convertPitch(Number(inNote));

    //var staveNote = [
    const staveNote = [
      // A quarter-note.
      new VF.StaveNote({clef: "treble", keys: [currentNoteName + "/5"], duration: "q" }).setStem(new VF.Stem()),
    ];

    // Create a voice in 4/4 and add the note from above
    // var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
    const voice = new VF.Voice({num_beats: 1,  beat_value: 4});
    voice.addTickables(staveNote);

    // Format and justify the notes to 350 pixels (50 pixels left for key and time signatures).
    //var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);
    const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 350);

    //Draw note
    voice.draw(contextRows[currentRow][currentTile][0], contextRows[currentRow][currentTile][1]); //have to make sure currentRow is correct

    // increment tile counter
    currentTile++;
  }
  
}

//function to play note audio, store note in guessRows matrix, and render note on vexflow staves in the tile elements
function playNote(key){

   //var currentNote = key.dataset.note;
   const currentNote = key.dataset.note;

  //console.log(`typeof currentNote: ${typeof currentNote}`); currentNote has string type

  /* this code seems to be where it is slowing down */
  //store note in guessRows matrix
  //guessRows[currentRow][currentTile] = Number(currentNote); //seems to be a point that slows it down
  //console.table(guessRows);

  /*//add note value to element data value
  const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
  tile.setAttribute('data', currentNote);

  const noteAudio = document.getElementById(key.dataset.note);
  noteAudio.currentTime = 0;
  //noteAudio.play();
  key.classList.add('active');
  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active');
  })*/

  drawNote(currentNote);

  /*if(currentTile === 1) {
    drawNoteBuffer = Array(5).fill(null); //reassign array to array of nulls
  }
  //console.log(currentTile)

  drawNoteBuffer[currentTile - 1] = Number(currentNote); //push current note to the buffer (note that currentTile gets incremented during drawNote hence why we subtract 1 from it)
  //console.table(drawNoteBuffer);

  if(currentTile === 5) {
    drawNoteBuffer.forEach((bufNote, bufIdx) => guessRows[currentRow][bufIdx] = bufNote); //only at the last tile do we update guessRows
    //console.table(guessRows);
  }*/

}



////////////////////////////////// MAIN ///////////////////////////////////////

function fixHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
};

addEventListener('load', fixHeight);
addEventListener('resize', fixHeight);
addEventListener('orientationchange', fixHeight);

//load game state if it was saved and it's not yet time to generate a new treble, otherwise initalize game state and store first objects

//create elements for list of note audio element
pitches.forEach((pitch, index) => {
  const audioElement = document.createElement('audio');
  audioElement.setAttribute('id', pitch);
  audioElement.src = "notes/notes_" + pitch + ".mp3"; //use mp3 for smaller file sizes
  body.append(audioElement);
});

//create enter button
/*const enterButton = document.createElement('button');
enterButton.setAttribute('id', 'Enter');
enterButton.innerHTML = '\u23CE';
piano.append(enterButton);*/

//create html elements to represent keys for piano and append relevant properties from lookup table*/
pitches.forEach((pitch, index) => {
  const keyElement = document.createElement('div');
  keyElement.classList.add("key", conversionLookup[pitch].keyColor); //comma used to separate multiple classes
  keyElement.setAttribute('data-note', pitch);
  piano.append(keyElement);
});

//create delete button
/*const deleteButton = document.createElement('button');
deleteButton.setAttribute('id', 'Delete');
deleteButton.innerHTML = '\u232b';
piano.append(deleteButton);*/

//get newly created elements
const keys = document.querySelectorAll('.key');
const whiteKeys = document.querySelectorAll('.key.white'); //have to add period for space
const blackKeys = document.querySelectorAll('.key.black');
const buttons = document.querySelectorAll('.piano-container button');

//define variables for keydown logic
let whiteKeyIndex;
let blackKeyIndex;

let whiteOctaveShift = 0;
let blackOctaveShift = 0;

let maxWhiteKeyIdx = 10;
let maxBlackKeyIdx = 6;

document.addEventListener('keydown', (e) => {
  
  if (e.code === 'Enter') { 
    let keyButton = {id:"Enter"};
    editNote(keyButton);
  } else if (e.code === "Backspace" || e.code === "Delete") {
    let keyButton = {id:"Delete"};
    editNote(keyButton);
  }
  if (e.key === '1') {
    whiteOctaveShift = 0;
    blackOctaveShift = 0;
    maxWhiteKeyIdx = 10;
    maxBlackKeyIdx = 6;
  } else if(e.key === '2') {
    console.log("octave shift for keyboard: 7")
    whiteOctaveShift = 7;
    blackOctaveShift = 5;
    maxWhiteKeyIdx = 7;
    maxBlackKeyIdx = 4;
  } else if (e.key === "CapsLock") { 
    showMessage("CAPS LOCK IS TURNED ON - TURN OFF CAPS LOCK TO USE MUSICAL TYPING")
  }
  if (e.repeat) return
  const key = e.key;

  whiteKeyIndex = WHITE_KEYS.indexOf(key); //+ whiteOctaveShift; //can't have addition of octaveShift at this step
  blackKeyIndex = BLACK_KEYS.indexOf(key); //+ blackOctaveShift;

  if (!isGameOver && currentRow <= 5 & currentTile <= 4){
      if (whiteKeyIndex > -1 && whiteKeyIndex <= maxWhiteKeyIdx) {
        playNote(whiteKeys[whiteKeyIndex + whiteOctaveShift]);
      }
      if (blackKeyIndex > -1 & blackKeyIndex <= maxBlackKeyIdx) {
        playNote(blackKeys[blackKeyIndex + blackOctaveShift]);
    }
  }

});

keys.forEach(key => {
  key.addEventListener('click', () => {

    if(!isGameOver && currentRow <= 5 & currentTile <= 4){
      playNote(key);
    }
  });
});


buttons.forEach((button) =>{
  button.addEventListener('click', () => {
    if(!isGameOver){
      editNote(button);
    }
  });
});

//check the current screen resolution
checkDeviceResolution();

//also add listener so that we check the device resolution every time the window resizes
window.addEventListener('resize', checkDeviceResolution); //note: this event listener may fire multiple times when a browser window is resized

//load game state if it was saved and it's not yet time to generate a new treble, otherwise initalize game state and store first objects
initLocalStorage();
initModal("help");
initModal("stats");
initModal("settings");

//function to add share results button and copy results to clipboard
const updateShareMessage = () => {
  const greenSquare = String.fromCodePoint(0x1F7E9);
  const yellowSquare = String.fromCodePoint(0x1F7E8);
  const greySquare = String.fromCodePoint(0x2B1C);
  let shareGraph = "";

  checkRows.forEach((row, rowIdx) => {
    row.forEach((tile, tileIdx) => {
      switch(tile.color) {
        case "green-overlay":
          shareGraph+=greenSquare + " ";
          break;
        case "yellow-overlay":
          shareGraph+=yellowSquare + " ";
          break;
        case "grey-overlay":
          shareGraph+=greySquare + " ";
          break;
      }
      if(tileIdx === 4 && rowIdx < 5) {
        shareGraph += "\n";
      }
    });
  });

  let shareMessage = "TREBLE " + currentJSONIndex + " " + winningRow + "/6\n" + shareGraph;

  const shareButton = document.querySelector("#stats-modal-content button");
  const shareText = document.getElementById("share-text");
  shareButton.style.display = "block";
  shareButton.addEventListener('click', () => {
    navigator.clipboard.writeText(shareMessage);
    shareText.style.display = "block";
    setTimeout(() => shareText.style.display = "none", 2000);
  });

  //update the stats
  updateStatsModal();

  //show the modal at the end so the user knows there is a result to share
  const statsModalContent = document.querySelector("#stats-modal-content");
  statsModalContent.style.display = "block";
}