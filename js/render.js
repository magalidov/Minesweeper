function renderElements() {
    renderField();
    renderSmiley();
    renderHearts();
    renderShields();
    renderEyes();
}

function renderSmiley() {
    var elResetButton = document.querySelector('.reset');
    elResetButton.innerHTML = `<img src="img/${gGame.state}.png" alt="smiley">`;
}

function renderHearts() {
    var deadHearts = 3;

    for (var i = 1; i <= gGame.lives; i++) {
        var elHeart = document.querySelector(`.heart${i}`);
        elHeart.style.display = 'inline-block';
        deadHearts = 3 - i;
    }
    for (var i = 0 + deadHearts; i > 0; i--) {
        var elHeart = document.querySelector(`.heart${i}`);
        elHeart.style.display = 'none';
    }
}
function renderShields() {
    var usedShields = 3;

    for (var i = 1; i <= gGame.shields; i++) {
        var elShield = document.querySelector(`.safe${i}`);
        elShield.style.display = 'inline-block';
        usedShields = 3 - i;
    }
    for (var i = 0 + usedShields; i > 0; i--) {
        var elShield = document.querySelector(`.safe${i}`);
        elShield.style.display = 'none';
    }
}
function renderEyes() {
    var usedEyes = 3
    for (var i = 1; i <= gGame.eyes; i++) {
        var elEye = document.querySelector(`.hint${i}`);
        elEye.style.display = 'inline-block';
        usedEyes = 3 - i;
    }
    for (var i = 0 + usedEyes; i > 0; i--) {
        var elEye = document.querySelector(`.hint${i}`);
        elEye.style.display = 'none';
    }
}

function renderStats() {
    //Timer:
    var currTime = new Date();
    gGame.secsPassed = Math.round((currTime.getTime() - gStartTime.getTime()) / 1000);
    var elTimeLoc = document.querySelector('.timer span');
    elTimeLoc.innerText = gGame.secsPassed;
    //Flaged Counter
    if (gGame.state === 'lost' || gGame.state === 'win') {
        var elFlagsLoc = document.querySelector('.flags-count span');
        elFlagsLoc.innerText = `${gGame.flagedMinesCount}/${gLevel.mines}`;
    } else {
        var elFlagsLoc = document.querySelector('.flags-count span');
        elFlagsLoc.innerText = gGame.flagsCount;
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
            var cssClassMode = `${(gGame.state === 'hint') ? 'glance' : ''}`;
            var innerInfo = (cellModel.isShown) ? around : '';
            var imgType = (cellModel.isMine && cellModel.isShown) ? 'mine' : (cellModel.isFlaged) ? 'flag' : 'empty';
            var innerImg = `<img src="img/${imgType}.png"></img>`;
            var innerDiv = `<div class="${cssClass} num${cssClassNumColor} ${cssClassMode}">${innerInfo} ${innerImg}</div>`;
            strHTML += `<td ${locData} onclick="cellClicked(event,this)" oncontextmenu="cellClicked(event,this)">${innerDiv}</td>`;
        }
        strHTML += '</tr>';
    }

    var elTbody = document.querySelector('tbody');
    elTbody.innerHTML = strHTML;

}


function renderUndoAvailble(display) {
var elUndoButton = document.querySelector('.undo');
elUndoButton.style.display= display;
}

function renderBottomText(insert){
    var elInformer = document.querySelector('.informer')
    elInformer.innerText= insert
}