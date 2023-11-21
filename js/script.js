// @juniordelonge
let playerXName = 'Player X';
let playerOName = 'Player O';

if (playerXName.trim() === '' || playerOName.trim() === '') {
    console.error('Nomes de jogadores não podem estar vazios.');
}

const game = {
    board: ['', '', '', '', '', '', '', '', ''],
    active: true,
    currentPlayer: 'X',
    playerXScore: 0,
    playerOScore: 0,
    drawScore: 0,
};

resetGame();

let isPlayerTurn = true;

async function placeMark(cell) {
    if (!game.active || !isPlayerTurn) return;

    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    if (game.board[cellIndex] !== '') return;

    isPlayerTurn = false;

    game.board[cellIndex] = game.currentPlayer;
    cell.innerHTML = game.currentPlayer === 'X' ? '<i class="fas fa-times"></i>' : '<i class="fas fa-circle"></i>';
    checkWinner();
    togglePlayer();
    await animateCell(cell);
    isPlayerTurn = true;

    makeComputerMove();
}

function animateCell(cell) {
    return new Promise(resolve => {
        cell.style.transition = 'background-color 0.3s';
        cell.style.backgroundColor = getRandomColor();

        requestAnimationFrame(() => {
            cell.classList.add('cell-played');

            cell.addEventListener('transitionend', function transitionEnd() {
                cell.removeEventListener('transitionend', transitionEnd);
                cell.classList.remove('cell-played');
                cell.style.transition = '';
                resolve();
            });
        });
    });
}

async function makeComputerMove() {
    if (game.currentPlayer === 'O' && game.active) {
        const bestMove = getBestMove();
        const cell = document.querySelector(`.cell:nth-child(${bestMove + 1})`);

        isPlayerTurn = false;

        await animateCell(cell);
        await sleep(2500);
        placeMark(cell);
        checkWinner();
        isPlayerTurn = true;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function togglePlayer() {
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    updateStatusMessage();
}

function updateStatusMessage() {
    document.getElementById('status-message').textContent = `Vez de ${getCurrentPlayerName()}`;
}

function getCurrentPlayerName() {
    return game.currentPlayer === 'X' ? playerXName : playerOName;
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (game.board[a] !== '' && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
            endGame(`Jogador ${game.currentPlayer} venceu!`, pattern);
            return;
        }
    }

    if (!game.board.includes('') && game.active) {
        endGame('Empate! O jogo terminou.', null);
    }
}

function endGame(message, winningCells) {
    game.active = false;
    document.getElementById('status-message').textContent = message;
    if (winningCells) highlightWinnerCells(winningCells);
    updateScore(game.currentPlayer === 'X' ? 'X' : 'O');
    showNotification(message);
    vibrateScreen();
    if (!winningCells) shakePanel();
}

function highlightWinnerCells(cells) {
    cells.forEach(index => {
        const cellElement = document.querySelector(`.cell:nth-child(${index + 1})`);
        cellElement.style.backgroundColor = '#c0ffd1';
        cellElement.classList.add('cell-winner');
    });
}

function updateScore(winner) {
    const scoreKey = winner === 'X' ? 'playerXScore' : winner === 'O' ? 'playerOScore' : 'drawScore';
    game[scoreKey]++;
    document.getElementById(`${winner === 'draw' ? 'draw' : 'player' + winner.toUpperCase() + 'Score'}`).textContent = game[scoreKey];
}

function resetGame() {
    game.board = ['', '', '', '', '', '', '', '', ''];
    game.active = true;
    game.currentPlayer = 'X';

    const cells = document.getElementById('game-board').children;

    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = '';
        cells[i].style.backgroundColor = getRandomColor();
        cells[i].classList.remove('cell-winner');
    }

    updateStatusMessage();
}

function getRandomColor() {
    const vibrantColors = [
        '#FF5733', '#FFBD33', '#33FF57', '#339FFF', '#FF33A1', '#A133FF',
        '#FF3333', '#33FFC1', '#FF336B', '#E633FF', '#33FFEC', '#FF9333'
    ];
    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function shakePanel() {
    const panel = document.getElementById('game-board');
    panel.classList.add('shake');

    panel.addEventListener('animationend', function () {
        panel.classList.remove('shake');
    });
}

function vibrateScreen() {
    try {
        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
        if (navigator.vibrate) {
            navigator.vibrate([500]);
            console.log('Vibrando...');
        } else {
            simulateVibration();
        }
    } catch (error) {
        console.error('Erro ao tentar vibrar:', error);
    }
}

function simulateVibration() {
    const body = document.body;
    const originalBackgroundColor = body.style.backgroundColor;
    body.style.transition = 'background-color 0.1s';

    body.style.backgroundColor = '#fff';
    setTimeout(() => {
        body.style.backgroundColor = originalBackgroundColor;
    }, 100);
}

function makeComputerMove() {
    if (game.currentPlayer === 'O' && game.active) {
        const bestMove = getBestMove();
        placeMark(document.querySelector(`.cell:nth-child(${bestMove + 1})`));
        checkWinner();
    }
}

function getBestMove() {
    const boardCopy = [...game.board];
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < boardCopy.length; i++) {
        if (boardCopy[i] === '') {
            boardCopy[i] = 'O';
            let score = minimax(boardCopy, 0, false);
            boardCopy[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const result = evaluate(board);

    if (result !== null) {
        return result;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function evaluate(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
            return board[a] === 'O' ? 10 : -10;
        }
    }

    if (!board.includes('')) {
        return 0;
    }

    return null;
}

function updatePlayerName(player, name) {
    if (player === 'X') {
        playerXName = name;
    } else if (player === 'O') {
        playerOName = name;
    }
    document.getElementById(`player${player}Name`).textContent = name;
    updateStatusMessage();
}

updateStatusMessage();
