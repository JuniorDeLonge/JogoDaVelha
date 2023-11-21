// @juniordelonge
const icons = ['<i class="fas fa-times"></i>', '<i class="fas fa-circle"></i>'];
const board = document.getElementById('board');
const cells = [];
const messageDiv = document.getElementById('message');
let currentPlayer = 0;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let wins = 0;
let losses = 0;
let draws = 0;

function createCell(index) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = index;
    cell.addEventListener('click', () => makeMove(index));
    board.appendChild(cell);
    cells.push(cell);
    setRandomBackgroundColor(cell);
}

function setRandomBackgroundColor(element) {
    const vibrantColor = getRandomVibrantColor();
    element.style.backgroundColor = vibrantColor;
}

function resetBoard() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('win-cell', 'clicked');
        cell.style.pointerEvents = 'auto';
        setRandomBackgroundColor(cell);
    });
    messageDiv.innerHTML = '';
    currentPlayer = 0;
}

function makeMove(index) {
    if (gameBoard[index] === '' && !checkWinner()) {
        const icon = currentPlayer === 0 ? icons[0] : icons[1];
        cells[index].innerHTML = icon;
        cells[index].classList.add('clicked');
        setRandomBackgroundColor(cells[index]);
        gameBoard[index] = icon;

        if (checkWinner()) {
            if (currentPlayer === 0) {
                messageDiv.innerHTML = `<i class="fas fa-trophy"></i> Player ${icon} venceu!`;
                wins++;
            } else {
                messageDiv.innerHTML = '<i class="fas fa-robot"></i> Computador venceu!';
                losses++;
            }
            highlightWinningCells();
            updateScore();
            setTimeout(resetBoard, 2000);
            return;
        }

        if (gameBoard.indexOf('') === -1) {
            messageDiv.innerHTML = 'Empate! <i class="fas fa-handshake"></i>';
            draws++;
            updateScore();
            setTimeout(resetBoard, 2000);
            return;
        }

        currentPlayer = 1 - currentPlayer;

        if (currentPlayer === 1) {
            setTimeout(makeComputerMove, 500);
        }
    }
}

function makeComputerMove() {
    const emptyCells = gameBoard.reduce((acc, val, index) => (val === '' ? acc.concat(index) : acc), []);
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    makeMove(emptyCells[randomIndex]);
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] !== '' && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return pattern;
        }
    }

    return null;
}

function updateScore() {
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('draws').textContent = draws;
}

function highlightWinningCells() {
    const winningCells = checkWinner();
    if (winningCells) {
        for (const index of winningCells) {
            cells[index].classList.add('win-cell');
        }
    }
}

function getRandomVibrantColor() {
    const vibrantColors = ['#FF5733', '#FFBD33', '#33FF57', '#339FFF', '#FF33A1', '#A133FF',
        '#FF3333', '#33FFC1', '#FF336B', '#E633FF', '#33FFEC', '#69f50c'];

    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
}

for (let i = 0; i < 9; i++) {
    createCell(i);
}
