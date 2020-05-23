'use strict'
var gField = [];
var gLevel = { size: 5, mines: 4, difficulty: 'easy' };
var gGame = {};
var gStartTime;
var gRunTime;


function init() {
    gStartTime = 0;
    gGame = {
        isOn: false,
        shownCount: 0,
        flagsCount: 0,
        flagedMinesCount: 0,
        secsPassed: 0,
        lives: 3,
        shields: 3,
        eyes: 3,
        state: 'play',
    };
    clearInterval(gRunTime);
    gField = modelField(gLevel.size);
    updateModelData();
    renderElements();
    renderUndoAvailble('none')
    renderBottomText('Good Luck')
}

function setGameDifficulty(difficulty) {
    if (difficulty === 'easy') {
        gLevel.size = 5;
        gLevel.mines = 4;
        gLevel.difficulty = difficulty;
    }
    if (difficulty === 'normal') {
        gLevel.size = 7;
        gLevel.mines = 10;
        gLevel.difficulty = difficulty;
    }
    if (difficulty === 'hard') {
        gLevel.size = 10;
        gLevel.mines = 25;
        gLevel.difficulty = difficulty;
    }
}

function gameOver() {
    clearInterval(gRunTime);
    gGame.isOn = false;
    gGame.state = 'lost';
    renderStats();
    renderElements();
    renderUndoAvailble('none');
    renderBottomText('Game Over');
}
function checkIfCleared() {
    if ((gGame.flagedMinesCount + gGame.shownCount) === (gLevel.size ** 2)) {
        clearInterval(gRunTime);
        gGame.isOn = false;
        gGame.state = 'win';
        renderStats();
        renderElements();
        renderUndoAvailble('none');
        renderBottomText('All Clear');
    } else return;
}
function loseLife() {
    
    if (gGame.lives === 1) {
        gGame.lives--;
        gameOver();
    } else if (gGame.lives === 2) {
        gGame.lives--;
        gGame.state = 'saved2';
        renderElements();
    } else {
        gGame.lives--;
        gGame.state = 'saved';
        renderElements();
    }
}

function cellClicked(event, cell) {
    var clickType = (event.type === 'click') ? 'L' : (event.type === 'contextmenu') ? 'R' : null;
    var i = +cell.dataset.i;
    var j = +cell.dataset.j;
    var modelCell = gField[i][j];
    
    if (gGame.state === 'win' || gGame.state === 'lost' || gOriginalState === 'hint') return;
    if (modelCell.isShown) return;

    if (gGame.isOn === false) {
        if (clickType === 'R') return;
        if (clickType === 'L') {
            modelCell.isShown = true;
            plantMines(gLevel.mines);
            updateModelData();
            if (modelCell.minesAroundCount === 0) revealSurroundings(i, j);
            renderField();
            gOriginalField = saveCurrField();
            gGame.isOn = true;
            gStartTime = new Date();
            gRunTime = setInterval(renderStats, 100);
            return;
        }
    }
    if (clickType === 'L') {
        gOriginalField = saveCurrField();
        if (gGame.state === 'hint') {
            revealSurroundings(i, j);
            renderElements();
            gGame.state = gOriginalState;
            gOriginalState = 'hint';
            setTimeout(function () {
                gField = gOriginalField;
                gOriginalState = gGame.state;
                renderElements();
            }, 1400)
            return;
        }
        if (modelCell.isFlaged){
            return;
        } else {
            gOriginalGame = saveCurrGameData();
            renderUndoAvailble('block');
            modelCell.isShown = true;
            if (modelCell.isMine){
                loseLife();
            } else if (modelCell.minesAroundCount === 0) revealSurroundings(i, j);
        }
        
    } else if (clickType === 'R') {
        gOriginalField = saveCurrField();
        if (gGame.state === 'hint') {
            gGame.state = gOriginalState;
            gGame.eyes++;
            renderElements();
            return;
        }
        if (modelCell.isShown) return;
        gOriginalGame = saveCurrGameData();
        renderUndoAvailble('block');
        modelCell.isFlaged = !modelCell.isFlaged;
    }
    updateModelData();
    checkIfCleared();
    renderField();
}


function revealSurroundings(cellI, cellJ) {

    for (var i = (cellI - 1); i <= (cellI + 1); i++) {
        if (i < 0 || i >= gField.length) continue;

        for (var j = (cellJ - 1); j <= (cellJ + 1); j++) {

            if (j < 0 || j >= gField[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            var currCell = gField[i][j];

            if (gGame.state === 'hint') {
                if (gField[cellI][cellJ].isShown === false) gField[cellI][cellJ].isShown = true
                if (currCell.isShown === false) currCell.isShown = true
                continue
            }

            if (currCell.isMine || currCell.isFlaged || currCell.isShown) {
                continue;
            } else {
                currCell.isShown = true;
                if (currCell.minesAroundCount === 0) {
                    revealSurroundings(i, j);
                }
            }
        }
    }
}

function updateModelData() {
    var flagedMines = 0;
    var shown = 0;
    var flags = 0;

    for (var i = 0; i < gField.length; i++) {
        for (var j = 0; j < gField[i].length; j++) {
            if (gGame.state === 'lost' && gField[i][j].isMine) {
                gField[i][j].isShown = true;
            }
            if (gGame.isOn === false) {
                if (gField[i][j].isMine) continue;
                gField[i][j].minesAroundCount = howManyMines(i, j);
            }
            if (gField[i][j].isShown) shown++;
            if (gField[i][j].isFlaged) flags++;
            if (gField[i][j].isMine && gField[i][j].isFlaged) flagedMines++;
        }
    }
    gGame.flagedMinesCount = flagedMines;
    gGame.shownCount = shown;
    gGame.flagsCount = flags;
}

function howManyMines(cellI, cellJ) {
    var minesSum = 0;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gField.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gField[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gField[i][j].isMine) minesSum++;
        }
    }
    return minesSum;
}

function plantMines(amount) {

    for (var mine = amount; mine > 0; mine--) {
        var randI = getRandomIntInclusive(0, gField.length - 1);
        var randJ = getRandomIntInclusive(0, gField.length - 1);
        var currCell = gField[randI][randJ];
        if (!currCell.isMine && !currCell.isShown) {
            currCell.isMine = true;
        } else mine++;
    }
}

function modelField(size) {
    var fieldModel = [];

    for (var i = 0; i < size; i++) {
        fieldModel[i] = [];
        for (var j = 0; j < size; j++) {

            var cell = {
                loc: {
                    i: i,
                    j: j,
                },
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isFlaged: false
            };

            fieldModel[i][j] = cell;
        }
    }
    return fieldModel;
}












