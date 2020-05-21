'use strict'
var gField = [];
var gLevel = { size: 4, mines: 2, difficulty: 'easy' };
var gGame = {};
var gStartTime;
var gRunTime;
var gState = 'play';


function init() {
    gStartTime = 0;
    gGame = {
        isOn: false,
        shownCount: 0,
        flagsCount: 0,
        flagedMinesCount: 0,
        secsPassed: 0
    };
    gState = 'play';
    clearInterval(gRunTime);
    gField = modelField(gLevel.size);
    updateModelData();
    renderField();
    renderSmiley();
}

function setGameDifficulty(difficulty) {
    if (difficulty === 'easy') {
        gLevel.size = 4;
        gLevel.mines = 2;
        gLevel.difficulty = difficulty;
    }
    if (difficulty === 'normal') {
        gLevel.size = 8;
        gLevel.mines = 12;
        gLevel.difficulty = difficulty;
    }
    if (difficulty === 'hard') {
        gLevel.size = 12;
        gLevel.mines = 20;
        gLevel.difficulty = difficulty;
    }
}

function gameOver() {
    clearInterval(gRunTime);
    gGame.isOn = false;
    gState = 'lost';
    renderSmiley();
    updateModelData();
    renderField();
    renderStats();
}
function checkIfCleared() {
    if ((gGame.markedMinesCount + gGame.shownCount) === (gLevel.size ** 2)) {
        clearInterval(gRunTime);
        gGame.isOn = false;
        gState = 'win';
        renderSmiley();
        updateModelData();
        renderField();
        renderStats();
    }
}




function cellClicked(event, cell) {
    var clickType = (event.type === 'click') ? 'L' : (event.type === 'contextmenu') ? 'R' : null;
    var i = +cell.dataset.i;
    var j = +cell.dataset.j;
    var modelCell = gField[i][j];

    if (gState !== 'play') return;
    if (gGame.isOn === false) {
        if (clickType === 'R') modelCell.isFlaged = true;
        if (clickType === 'L') {
            modelCell.isShown = true;
            plantMines(gLevel.mines);
            updateModelData();
            if (modelCell.minesAroundCount === 0) {
                revealSurroundings(i, j);
            }
            renderField();
        }
        gGame.isOn = true;
        gStartTime = new Date();
        gRunTime = setInterval(renderStats, 100);
        return;
    }


    if (clickType === 'L') {
        if (modelCell.isFlaged) {
            return;
        } else {
            modelCell.isShown = true;
            if (modelCell.minesAroundCount === 0) {
                revealSurroundings(i, j)
            }
        }
        if (modelCell.isMine) {
            modelCell.isShown = true;
            gameOver();
        }
    }
    if (clickType === 'R') {
        if (modelCell.isShown) return;
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

function renderStats() {

    var currTime = new Date();
    gGame.secsPassed = Math.round((currTime.getTime() - gStartTime.getTime()) / 1000);
    var elTimeLoc = document.querySelector('.timer span');
    elTimeLoc.innerText = gGame.secsPassed;

    var elFlagsLoc = document.querySelector('.flags-count span');
    elFlagsLoc.innerText = gGame.flagsCount;
}


function renderSmiley() {

    var elResetButton = document.querySelector('.reset');
    elResetButton.innerHTML = `<img src="img/${gState}.ico" alt="smiley">`;
}

function renderField() {
    var strHTML = '';

    for (var i = 0; i < gField.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gField.length; j++) {
            var cellModel = gField[i][j];
            var around = (cellModel.minesAroundCount) ? (cellModel.minesAroundCount) : '';
            var locData = `data-i="${cellModel.loc.i}" data-j="${cellModel.loc.j}"`;
            var cssClass = `${(cellModel.isFlaged) ? 'flaged' : (!cellModel.isShown) ? 'uncklicked' : (cellModel.isMine) ? 'mine' : 'show-amount'}`;
            var cssClass2 = `${(around) ? (around) : ''}`;
            var innerInfo = (cellModel.isShown) ? around : '';
            var imgType = (cellModel.isMine && cellModel.isShown) ? 'mine' : (cellModel.isFlaged) ? 'flag' : 'empty';
            var innerImg = `<img src="img/${imgType}.png"></img>`;
            var innerDiv = `<div class="${cssClass} num${cssClass2}">${innerInfo} ${innerImg}</div>`;
            strHTML += `<td ${locData} onclick="cellClicked(event,this)" oncontextmenu="cellClicked(event,this)">${innerDiv}</td>`;
        }
        strHTML += '</tr>';
    }

    var elTbody = document.querySelector('tbody');
    elTbody.innerHTML = strHTML;

}

function updateModelData() {
    var flagedMines = 0;
    var shown = 0;
    var flags = 0;

    for (var i = 0; i < gField.length; i++) {
        for (var j = 0; j < gField[i].length; j++) {
            if (gState === 'lost' && gField[i][j].isMine) {
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
    gGame.markedMinesCount = flagedMines;
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












