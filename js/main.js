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
        state: 'play',
    };
    clearInterval(gRunTime);
    gField = modelField(gLevel.size);
    updateModelData();
    renderElements();
}

function setGameDifficulty(difficulty) {
    if (difficulty === 'easy') {
        gLevel.size = 5;
        gLevel.mines = 4;
        gLevel.difficulty = difficulty;
    }
    if (difficulty === 'normal') {
        gLevel.size = 8;
        gLevel.mines = 12;
        gLevel.difficulty = difficulty;
    }
    if (difficulty === 'hard') {
        gLevel.size = 12;
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
}
function checkIfCleared() {
    if ((gGame.flagedMinesCount + gGame.shownCount) === (gLevel.size ** 2)) {
        clearInterval(gRunTime);
        gGame.isOn = false;
        gGame.state = 'win';
        renderStats();
        renderElements();
    } else return
}
function loseLife() {

    if (gGame.lives === 1) {
        gGame.lives--
        gameOver()
    } else if (gGame.lives === 2) {
        gGame.lives--
        gGame.state = 'saved2'
        renderElements();
    } else { 
        gGame.lives--
        gGame.state = 'saved'
        renderElements();
    }
}

function cellClicked(event, cell) {
    var clickType = (event.type === 'click') ? 'L' : (event.type === 'contextmenu') ? 'R' : null;
    var i = +cell.dataset.i;
    var j = +cell.dataset.j;
    var modelCell = gField[i][j];

    if (modelCell.isShown) return;
    if (gGame.state !== 'play' 
    && gGame.state !== 'saved' 
    && gGame.state !== 'saved2') return;

    if (gGame.isOn === false) {
        if (clickType === 'R') return
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
            loseLife()
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

function safeClick() {
    if (!gGame.isOn) return
    var validCells = []
    for (var i = 1; i < gField.length; i++) {
        for (var j = 1; j < gField[i].length; j++) {
            var currCell = gField[i][j];
            if (currCell.isMine === false
                && currCell.isShown === false
                && currCell.isFlaged === false) {
                validCells.push(currCell)
            }
        }
    }
    if (validCells.length === []) return
    gGame.shields--
    renderShields()

    var randNum = getRandomIntInclusive(0, validCells.length - 1);
    var randCell = validCells.splice(randNum, 1)
    var pickedI = randCell[0].loc.i
    var pickedJ = randCell[0].loc.j
    var elCell = document.querySelector(`[data-i="${pickedI}"][data-j="${pickedJ}"]`)
    elCell.classList.add('safe')
    setTimeout(function(){elCell.classList.remove('safe')}, 3000)
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

    if (gGame.state === 'lost' || gGame.state === 'win') {
        var elFlagsLoc = document.querySelector('.flags-count span');
        elFlagsLoc.innerText = `${gGame.flagedMinesCount}/${gLevel.mines}`;
    } else {
        var elFlagsLoc = document.querySelector('.flags-count span');
        elFlagsLoc.innerText = gGame.flagsCount;
    }
}

function renderElements() {
    renderField();
    renderSmiley();
    renderHearts();
    renderShields();
}

function renderSmiley() {

    var elResetButton = document.querySelector('.reset');
    elResetButton.innerHTML = `<img src="img/${gGame.state}.png" alt="smiley">`;
}

function renderHearts() {
    var deadHearts = 3

    for (var i = 1; i <= gGame.lives; i++) {
        var elHeart = document.querySelector(`.heart${i}`)
        deadHearts = 3 - i
        elHeart.style.display = 'inline-block'
    }
    for (var i = 0 + deadHearts; i > 0; i--) {
        var elHeart = document.querySelector(`.heart${i}`)
        elHeart.style.display = 'none'
    }
}
function renderShields() {
    var usedShields = 3

    for (var i = 1; i <= gGame.shields; i++) {
        var elShield = document.querySelector(`.safe${i}`)
        usedShields = 3 - i
        elShield.style.display = 'inline-block'
    }
    for (var i = 0 + usedShields; i > 0; i--) {
        var elShield = document.querySelector(`.safe${i}`)
        elShield.style.display = 'none'
    }
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
            var cssClassNumColor = `${(around) ? (around) : ''}`;
            var innerInfo = (cellModel.isShown) ? around : '';
            var imgType = (cellModel.isMine && cellModel.isShown) ? 'mine' : (cellModel.isFlaged) ? 'flag' : 'empty';
            var innerImg = `<img src="img/${imgType}.png"></img>`;
            var innerDiv = `<div class="${cssClass} num${cssClassNumColor}">${innerInfo} ${innerImg}</div>`;
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












