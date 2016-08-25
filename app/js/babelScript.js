'use strict';

(function () {
	var startButton = document.getElementById('start');
	startButton.addEventListener('click', start);
	var stopButton = document.getElementById('stop');
	stopButton.addEventListener('click', stop);
	// adding the event for key press
	document.addEventListener('keydown', changeDirection);
	genMatrix();
})();

var play = true,
    DIR = { left: -1, down: 0, right: 1 },


// directions
xAxis = { back: 1, default: 0 },


// values for verical movement
intervalTime = 800,


// the period of time for an interval function call

block,


// the current moving block
movingBlock,


// for the repositioning the block after a certain time interval

// used to trace the block, (using indexes to identify the right position easier)
startingRow = 1,
    startingColl = 6,
    currentRow = 1,
    currentColl = 6,
    lastRow = 1,
    lastColl = 6,
    nextRow = 2,
    nextColl = 6,


// positions in the matrix
lastX = 6,
    lastY = 1,
    startingPoz = document.getElementsByClassName('coll-' + startingColl)[0],


// this is a column in the first row of the table
lastPoz,


// the last position of the moving block
nextAvailableCell,


// the next available cell for the moving block
lastOccupiedCell,


// the last occupied cell for the moving block
// global vars
maxRow = 15,
    maxColl = 10,
    minColl = 1,
    matrix = [],
    score = 0,


// colors for the blocks background
colors = ['#be0000', '#becf00', '#2cbe00', '#001ebe', '#be009a']; // the colors of the moving block

function genMatrix() {
	var i, j;
	for (i = 1; i <= maxRow; i++) {
		matrix[i] = [];
		for (j = 1; j <= maxColl; j++) {
			matrix[i][j] = 0;
		}
	}
}

function start() {
	play = true;
	if (matrix.length === 0) {
		genMatrix();
	}
	checkForFullRow();
	block = generateBlock();
	raiseScore();
	showScore();
	movingBlock = setInterval(reposition, intervalTime);
}

function stop() {
	play = false;
	lastY += 1;
	lowerScore();
	deleteLastPosition();
	alert("Game stoped!");
}

/*
	The function creates a block, and sets a color to the block before appending
	it to the starting position of the board
*/
function generateBlock() {
	var blockGen = document.createElement('div');
	blockGen.className = 'active-block';
	blockGen.style.background = generateBackgroundColor();
	startingPoz.appendChild(blockGen);
	nextAvailableCell = getnextAvailableCell(DIR.down, xAxis.default);

	setThePositions(startingRow, startingColl, startingRow, startingColl);

	return blockGen;
}

/*
	the function starts when a key is pressed and it directs a particular event to a coresponding case
*/
function changeDirection(event) {
	event = event || window.event;
	//clearInterval(movingBlock);
	if (event.keyCode == '37') {
		// left arrow
		if (verifyVacancy(DIR.left, xAxis.back)) {
			try {
				moveTo(block, DIR.left, xAxis.back);
				setThePositions(currentRow, currentColl, nextRow - xAxis.back, nextColl + DIR.left, nextRow, nextColl + DIR.left);
			} catch (err) {
				console.log(err);
			}
			deleteLastPosition();
		}
	} else if (event.keyCode == '39') {
		// right arrow
		if (verifyVacancy(DIR.right, xAxis.back)) {
			try {
				moveTo(block, DIR.right, xAxis.back);
				setThePositions(currentRow, currentColl, nextRow - xAxis.back, nextColl + DIR.right, nextRow, nextColl + DIR.right);
			} catch (err) {
				console.log(err);
			}
			deleteLastPosition();
		}
	} else if (event.keyCode == '40') {
		// down arrow
		if (verifyVacancy(DIR.down, xAxis.default)) {
			try {
				moveTo(block, DIR.down, xAxis.default);
				setThePositions(currentRow, currentColl, nextRow - xAxis.default, nextColl + DIR.down);
			} catch (err) {
				console.log(err);
			}
			deleteLastPosition();
		}
	}
}
/*
	if there is an available position next the function will reposition the block,
	otherwise it will clear the last position and create a new block from the beginning
*/
function reposition() {

	if (play && isGameOver() === true) {
		if (verifyVacancy(DIR.down, xAxis.default)) {
			try {
				moveTo(block, DIR.down, xAxis.default);
				setThePositions(currentRow, currentColl, nextRow - xAxis.default, nextColl + DIR.down);
			} catch (err) {
				console.log(err);
			}
			deleteLastPosition();
		} else {
			block.className = 'positioned-block';
			matrix[currentRow][currentColl] = 1;
			resetPositions();
			clearInterval(movingBlock);
			start();
		}
	} else {
		clearInterval(movingBlock);
		play = true;
	}
}

// verify if the next position in a certain direction is open
function verifyVacancy(direction, goBack) {
	if (currentRow < maxRow && currentColl + direction >= minColl && currentColl + direction <= maxColl) {
		if (isPositionOpen(direction, goBack)) {
			return true;
		}
	}
	return false;
}
/*
 moves the element to a specified direction
 @currentBlock - the last elment genereted.
 @direction - specifies the direction of the block
 @goBack - specifies the number of rows rows to which a block is set back
*/
function moveTo(currentBlock, direction, goBack) {
	if (typeof currentBlock === 'undefined' || currentBlock === null) {
		throw new Error("Block is not defined!");
	}
	if (typeof direction === 'undefined' || direction === null) {
		throw new Error("The direction isn't specified!");
	}
	if (typeof goBack === 'undefined' || goBack === null) {
		goBack = 0;
	}
	var newBlock = document.createElement('div');
	newBlock.className = 'active-block';
	newBlock.style.background = block.style.background;

	// set a trace in the matrix
	matrix[currentRow][currentColl] = 2;
	lastX = currentColl;
	lastY = currentRow;
	nextAvailableCell = getnextAvailableCell(direction, goBack);
	//lastOccupiedCell = getnextAvailableCell(direction, goBack);

	nextAvailableCell.appendChild(newBlock);
}

// this function removes the first child element from a specified position of the table.
// used to delete the last position of the block.
function deleteLastPosition() {
	//delete the trace of the block in the matrix
	matrix[lastY][lastX] = 0;
	var parent = document.getElementsByClassName('coll-' + lastX)[lastY - 1];
	parent.removeChild(parent.children[0]);
}
/*
 	function checks if a targeted position is empty
 	@direction - specifies the direction of the block
 	@goBack - specifies if the block should go back one row
*/
function isPositionOpen(direction, goBack) {
	if (matrix[nextRow][nextColl + direction] === 0) {
		return true;
	}
	return false;
}

/* setting the global variables for the blocks position*/
function setThePositions(currentR, currentC, nextR, nextC, incrNextRow, incrNextColl) {
	if (currentR && currentC && currentR !== null && currentC !== null) {
		lastRow = currentR;
		lastColl = currentC;
	}
	if (nextR && nextC && nextR !== null && nextC !== null) {
		currentRow = nextR;
		currentColl = nextC;
	}
	if (incrNextRow && incrNextColl && incrNextRow !== null && incrNextColl !== null) {
		nextRow = incrNextRow;
		nextColl = incrNextColl;
	} else {
		nextRow = currentRow + 1;
		nextColl = currentColl;
	}
}

/*
  returns an td element which represents the next position
  @direction - specifies the direction of the block
  @goBack - specifies if the block should go back one row
*/
function getnextAvailableCell(direction, goBack) {
	if (typeof direction === 'undefined' || direction === null) {
		direction = 0;
	}
	if (typeof goBack === 'undefined' || goBack === null) {
		goBack = 0;
	}
	return document.getElementsByClassName('coll-' + (nextColl + direction))[nextRow - goBack - 1];
}

/*
  generate a index which will point to a specific position in an array with hex colors as strings
*/
function generateBackgroundColor() {
	var color,
	    randNr = randomNumber(0, 4);
	color = colors[randNr];
	return color;
}

/* resets the positions to the initial values */
function resetPositions() {
	currentRow = startingRow;
	currentColl = startingColl;
	lastRow = startingRow;
	lastColl = startingColl;
	nextRow = startingRow + 1;
	nextColl = startingColl;
}

// the function checks if the game is over
function isGameOver() {
	for (var i = minColl; i <= maxColl; i++) {
		if (matrix[1][i] === 1) {
			updateBestScore();
			alert("Game Over");
			detachEvents();
			play = false;
			return false;
		}
	}
	return true;
}

// checks if the last row is full
function checkForFullRow() {
	var full = true;
	for (var i = minColl; i <= maxColl; i++) {
		if (matrix[maxRow][i] !== 1) full = false;
	}
	if (full) {
		clearLastRow();
		repositionBlocks();
	}
}

// clears the last row
// triggered if the last row is full
function clearLastRow() {
	//clear matrix last row
	for (var i = minColl; i <= maxColl; i++) {
		matrix[maxRow][i] = 0;
	}
	//clear DOM table last row
	var theLastRow = document.getElementsByClassName('rows')[maxRow - 1];
	for (var j = minColl - 1; j < maxColl; j++) {
		var td = theLastRow.children[j];
		td.removeChild(td.children[0]);
	}
}

// reposition all the blocks with one position lower after clearing the last row
function repositionBlocks() {
	var sourceRow, destRow, sourceColl, destColl;
	for (var i = maxRow - 2; i >= 1; i--) {
		sourceRow = document.getElementsByClassName('rows')[i];
		destRow = document.getElementsByClassName('rows')[i + 1];
		for (var j = minColl - 1; j < maxColl; j++) {
			sourceColl = sourceRow.children[j];
			if (sourceColl.children.length > 0) {
				// modify the matrix
				matrix[i + 2][j + 1] = 1;
				// append the block from the upper element to the one positioned lower
				destColl = destRow.children[j];
				destColl.appendChild(sourceColl.children[0]);
				// modify the matrix
				matrix[i + 1][j + 1] = 0;
			} else {
				// modify the matrix
				matrix[i + 2][j + 1] = 0;
			}
		}
	}
}
/*
	This function rises the score of the game.
*/
function raiseScore() {
	score += 1;
}

/*
This function rises the score of the game.
*/
function lowerScore() {
	score -= 1;
}

/*
	This function verifies if there is a best score and updates it if the current
	score is higher then the best one.
*/
function updateBestScore() {
	if (typeof Storage !== 'undefined') {
		var bestScoreContainer = document.getElementsByClassName('score__best')[0];
		var bestValue = parseInt(localStorage.bestScore);
		if (!isNaN(bestValue) && score > bestValue) {
			localStorage.bestScore = score;
			alert("New Record:" + score + " points!");
		}
	} else {
		alert("Your browser doesn't support Web Storage.");
	}
}

/*
	This function interacts with the DOM and inserts the specific values
	for the current score and the best one.
*/
function showScore() {
	var scoreContainer = document.getElementsByClassName('score__current')[0];
	var bestScoreContainer = document.getElementsByClassName('score__best')[0];

	scoreContainer.innerHTML = "Score:" + score;
	if (!localStorage.bestScore) {
		localStorage.bestScore = 0;
	}
	bestScoreContainer.innerHTML = "Best Score:" + localStorage.bestScore;
}

function randomNumber(minVal, maxVal) {
	return Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
}

function detachEvents() {
	document.getElementById('start').removeEventListener('click', start);
	document.getElementById('stop').removeEventListener('click', stop);
	document.removeEventListener('keydown', changeDirection);
}
//# sourceMappingURL=script.js.map
//# sourceMappingURL=script.js.map
//# sourceMappingURL=script.js.map
//# sourceMappingURL=babelScript.js.map
