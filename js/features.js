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
    if (validCells.length === 0) return
    gGame.shields--
    renderShields()

    var randNum = getRandomIntInclusive(0, validCells.length - 1);
    var randCell = validCells.splice(randNum, 1)
    var pickedI = randCell[0].loc.i
    var pickedJ = randCell[0].loc.j
    var elCell = document.querySelector(`[data-i="${pickedI}"][data-j="${pickedJ}"]`)
    elCell.classList.add('safe')
    setTimeout(function () { elCell.classList.remove('safe') }, 3000)
}

function glanceModeOn() {
    if (gGame.isOn === false || gOriginalState === 'hint') return
    gOriginalState = gGame.state
    gGame.state = 'hint'
    gGame.eyes--
    renderElements()
}

function undo() {
    gField = gOriginalField;
    renderElements()
}
function saveCurrField() {
    var newCopy = []

    for (var i = 0; i < gLevel.size; i++) {
        newCopy[i] = [];
        for (var j = 0; j < gLevel.size; j++) {

            var cell = {
                loc: {
                    i: gField[i][j].loc.i,
                    j: gField[i][j].loc.j,
                },
                minesAroundCount: gField[i][j].minesAroundCount,
                isShown: gField[i][j].isShown,
                isMine: gField[i][j].isMine,
                isFlaged: gField[i][j].isFlaged,
            };

            newCopy[i][j] = cell;
        }
    }
    return newCopy
}