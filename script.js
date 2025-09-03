const ROWCOUNT = 3;
const COLCOUNT = 3;

const playerOne = createPlayer("X", 1);
const playerTwo = createPlayer("O", 2);

function createPlayer(char, num) {
    return {char, num};
}


const gameBoard = (function(playerOne, playerTwo) {

    const EMPTY = " ";
    const ONE = playerOne.char;
    const TWO = playerTwo.char;
    const ONENUM = playerOne.num;
    const TWONUM = playerTwo.num;

    const board = [
        [EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY]
    ];

    function printBoard() {
        console.log(board[0]);
        console.log(board[1]);
        console.log(board[2]);
    }

    function makeMove(row, col, num) {
        if (board[row][col] === EMPTY) {
            board[row][col] = (num === ONENUM ? ONE : TWO);
            return true;
        }

        return false;
    }

    // Returns 0 if no one won, returns the number of the
    // player that won otherwise.
    function playerWon() {
        for (let row = 0; row < ROWCOUNT; row++) {
            if (board[row][0] != EMPTY && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
                highlightWinning([[row, 0], [row, 1], [row, 2]]);
                return (board[row][0] === ONE ? 1 : 2);
            }
        }


        for (let col = 0; col < COLCOUNT; col++) {
            if (board[0][col] != EMPTY && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
                highlightWinning([[0, col], [1, col], [2, col]]);
                return (board[0][col] === ONE ? 1 : 2);
            }
        }

        // Check diagonals
        if (board[0][0] != EMPTY && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            highlightWinning([[0, 0], [1, 1], [2, 2]]);
            return (board[0][0] === ONE ? 1 : 2);
        }

        else if (board[2][0] != EMPTY && board[2][0] === board[1][1] && board[1][1] === board[0][2]) {
            highlightWinning([[2, 0], [1, 1], [0, 2]]);
            return (board[2][0] === ONE ? 1 : 2);
        }

        for (let row = 0; row < ROWCOUNT; row++) {
            for (let col = 0; col < COLCOUNT; col++) {
                if (board[row][col] === EMPTY) return 0;
            }
        }

        return -1;
    }

    function highlightWinning(boxes) {
        const boxElements = document.querySelectorAll(".box");

        boxes.forEach(box => boxElements[box[0] * COLCOUNT + box[1]].classList.add("winning"));
    }

    function resetBoard() {
        for (let row = 0; row < ROWCOUNT; row++) {
            for (let col = 0; col < COLCOUNT; col++) {
                board[row][col] = EMPTY;
            }
        }
    }

    return {printBoard, makeMove, playerWon, resetBoard};
}) (playerOne, playerTwo);

const createBox = function(gameManager, board, row, col) {
    const box = document.createElement("div");

    box.classList.add("box");
    box.row = row;
    box.col = col;

    return box;
}  

const gameManager = (function(board, playerOne, playerTwo) {
    const content = document.querySelector(".content");
    const text = document.querySelector("div.turn-text");
    const buttonContainer = document.querySelector(".button-container");

    let currentPlayer;

    const playGame = function() {  
        currentPlayer = playerOne;
        createBoxes();
        playerText();
        createResetButton();
    }

    const createBoxes = function() {

        for (let row = 0; row < ROWCOUNT; row++) {
            for (let col = 0; col < COLCOUNT; col++) {
                const box = createBox(gameManager, board, row, col);

                content.appendChild(box);
            }
        }

        content.addEventListener("click", chooseBox);
    }

    const switchTurn = function() {
        const boardState = board.playerWon();


        if (boardState != 0) {
            content.removeEventListener("click", chooseBox);
            
            boardState === -1 ? tieText() : winText();
            const boxes = document.querySelectorAll(".box");
            boxes.forEach(box => box.classList.add("game-over"));   

            return;
        }
        currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
        playerText();
    }

    const chooseBox = function(event) {
        if (!event.target.classList.contains("box") || event.target.hasChildNodes()) return;

        const box = event.target;
        const moveIcon = document.createElement("span");
        box.classList.add("selected");

        moveIcon.innerText = gameManager.getCurrentPlayer().char;
        box.appendChild(moveIcon);

        board.makeMove(box.row, box.col, gameManager.getCurrentPlayer().num);

        gameManager.switchTurn();
    }

    const playerText = function() {

        text.innerText = `${currentPlayer.username}'s Turn`;
    }

    const winText = function() {
        text.innerText = `${currentPlayer.username} Wins!`;
    }

    const tieText = function() {
        text.innerText = `Tie! No One Wins`;
    }

    const createResetButton = function() {
        const resetButton = document.createElement("button");
        resetButton.classList.add("reset");
        resetButton.innerText = "Reset Game";

        resetButton.addEventListener("click", resetGame);
        buttonContainer.appendChild(resetButton);
    }

    const resetGame = function() {
        const boxElements = document.querySelectorAll(".box");
        boxElements.forEach(box => box.remove());
        board.resetBoard();
        text.innerText = "";

        if (buttonContainer.hasChildNodes()) buttonContainer.firstChild.remove();
        playGame();
    }

    const getCurrentPlayer = () => currentPlayer;
   

    return {playGame, getCurrentPlayer, switchTurn};

}) (gameBoard, playerOne, playerTwo);


const playerManager = (function(gameManager, playerOne, playerTwo) {
    
    const namesContainer = document.querySelector(".player-names-div");

    const createForm = function() {
        const form = document.createElement("form");
        form.classList.add("player-names");

        const playerOneInput = createPlayerInput("player-one", "Player One's Name");
        const playerTwoInput = createPlayerInput("player-two", "Player Two's Name");

        const readyButton = document.createElement("input");
        readyButton.type = "submit";
        readyButton.value = "Ready!!";
        readyButton.classList.add("ready-button");

        form.appendChild(playerOneInput);
        form.appendChild(readyButton);
        form.appendChild(playerTwoInput);

        namesContainer.appendChild(form);

        form.addEventListener("submit", function(event) {

            const nameInputs = document.querySelectorAll("input.player-name");
            const nameOne = (nameInputs[0].value.trim().length === 0 ? "Player 1" : nameInputs[0].value.trim());
            const nameTwo = (nameInputs[1].value.trim().length === 0 ? "Player 2" : nameInputs[1].value.trim());

            createNameDisplays(`${nameOne} - ${playerOne.char}` , `${nameTwo} - ${playerTwo.char}`);
            playerOne.username = nameOne;
            playerTwo.username = nameTwo;
            gameManager.playGame();
            form.remove();
            event.preventDefault();
        });

        function createPlayerInput(playerClass, text) {
            const playerDiv = document.createElement("div");
            const playerLabel = document.createElement("label");
            const playerInput = document.createElement("input");

            playerDiv.classList.add("player-name");

            playerLabel.for = playerClass;
            playerLabel.innerText = text;
            playerInput.type = "text";
            playerInput.id = playerClass;
            playerInput.classList.add("player-name");
            playerInput.name = "player-name";
            playerInput.maxLength = "10";

            playerDiv.appendChild(playerLabel);
            playerDiv.appendChild(playerInput);
            return playerDiv;
        }

        function createNameDisplays(nameOne, nameTwo) {

            const nameDisplayContainer = document.createElement("div");
            nameDisplayContainer.classList.add("name-display");

            const displayOne = document.createElement("div");
            const displayTwo = document.createElement("div");

            displayOne.classList.add("display-one");
            displayTwo.classList.add("display-two");

            displayOne.innerText = nameOne;
            displayTwo.innerText = nameTwo;

            nameDisplayContainer.appendChild(displayOne);
            nameDisplayContainer.appendChild(displayTwo);

            namesContainer.appendChild(nameDisplayContainer);
        }
    }

    return {createForm};
}) (gameManager, playerOne, playerTwo);



playerManager.createForm();
