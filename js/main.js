const wordText = document.querySelector(".word"),
      hintText = document.querySelector(".hint span"),
      timeText = document.querySelector(".time-text"),
      progressCircle = document.querySelector(".progress"),
      inputField = document.querySelector("input"),
      refreshBtn = document.querySelector(".refresh-word"),
      checkBtn = document.querySelector(".check-word"),
      messageBox = document.querySelector(".message-box"),
      messageText = document.querySelector(".message-text"),
      leaderboardList = document.querySelector(".leaderboard-list"),
      scoreDisplay = document.querySelector(".score-container"),
      shuffleBtn = document.querySelector(".shuffle-btn");

const logoutBtn = document.getElementById("logout-btn");
const modal = document.getElementById("confirmation-modal");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");
const correctWordsList = document.getElementById("correct-words-list");

const congratsModal = document.getElementById("congratsModal"); 
const closeCongratsModalBtn = document.querySelector(".congrats-btn");
const exitBtn = document.querySelector(".exit-btn");

const clickSound = new Audio('sounds/clicksound.mp3');
const successSound = new Audio('sounds/success.mp3');
const errorSound = new Audio('sounds/error1.mp3');
const wrongAnswerSound = new Audio('sounds/error.mp3');
const typingSound = new Audio('sounds/typing.mp3');

let correctWord, timer, countdownTime = 60, score = 0, roundsCompleted = 0;
const totalCircumference = 2 * Math.PI * 45;
let isMuted = false;
let correctGuesses = [];
const usedWords = new Set();    

const showMessage = (message) => {
    messageText.innerText = message;
    messageBox.style.display = "block"; 
    setTimeout(() => messageBox.style.display = "none", 3000); 
};

const updateCorrectWordsList = () => {
    correctWordsList.innerHTML = ''; 
    
    correctGuesses.forEach(word => {
        const listItem = document.createElement("li");
        listItem.textContent = `🎯 ${word.toUpperCase()}`;
        correctWordsList.appendChild(listItem);
    });
};

const playSound = (sound) => {
    sound.play();
};

const shuffleLetters = () => {
    let wordArray = correctWord.split("");
    for (let i = wordArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    wordText.innerText = wordArray.join("");
    playSound(clickSound);
};

const updateScoreDisplay = () => {
    const playerName = localStorage.getItem("playerName") || "Player"; 
    scoreDisplay.textContent = `Score: ${score}`;
};

const initTimer = (maxTime) => {
    clearInterval(timer);
    countdownTime = maxTime;

    timer = setInterval(() => {
        if (countdownTime >= 0) {
            timeText.textContent = countdownTime;
            let offset = totalCircumference * (1 - countdownTime / 60);
            progressCircle.style.strokeDashoffset = offset;
            countdownTime--;
        } else {
            clearInterval(timer);
            showMessage(`Time off! ${correctWord.toUpperCase()} was the correct word`);
            playSound(errorSound);
            score -= 5;
            if (score < 0) score = 0;
            updateScoreDisplay();
            updateLeaderboard("Player", score);
            initGame();
        }
    }, 1000);
};

const initGame = () => {
    roundsCompleted++;
    let adjustedTime = 60;
    if (roundsCompleted >= 5) adjustedTime = 45;
    if (roundsCompleted >= 10) adjustedTime = 30;
    if (roundsCompleted >= 15) adjustedTime = 15;

    updateScoreDisplay(); 
    initTimer(adjustedTime);

    const availableWords = words.filter(w => !usedWords.has(w.word.toLowerCase()));
    
    if (availableWords.length === 0) {
        congratsModal.style.display = "flex"; 
        return;
    }

    let randomObj = availableWords[Math.floor(Math.random() * availableWords.length)];
    let wordArray = randomObj.word.split("");

    for (let i = wordArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }

    wordText.innerText = wordArray.join("");
    hintText.innerText = randomObj.hint;
    correctWord = randomObj.word.toLowerCase();
    inputField.value = "";
    inputField.setAttribute("maxlength", correctWord.length);
};

const checkWord = () => {
    let userWord = inputField.value.toLowerCase();
    if (!userWord) {
        showMessage("Please enter the word to check!");
        playSound(errorSound);
        return;
    }
    if (userWord !== correctWord) {
        showMessage(`Oops! ${userWord} is incorrect`);
        playSound(wrongAnswerSound);
        return;
    }

    showMessage(`Congrats! ${correctWord.toUpperCase()} is correct!`);
    playSound(successSound);
    clearInterval(timer);
    score += 10;
    updateScoreDisplay(); 
    
    correctGuesses.push(correctWord);
    updateCorrectWordsList(); 
    
    const playerName = localStorage.getItem("playerName") || "Player";
    updateLeaderboard(playerName, score);
    initGame();
    usedWords.add(correctWord);
    updateWordProgress();
};

const updateWordProgress = () => {
    const totalWords = words.length;
    const completedWords = usedWords.size;
    const wordProgressElem = document.getElementById("word-progress");
    if (wordProgressElem) {
        wordProgressElem.textContent = `Completed: ${completedWords} / ${totalWords}`;
    }
};

const updateLeaderboard = (playerName, score) => {
    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const existingPlayerIndex = scores.findIndex(player => player.name === playerName);
    
    if (existingPlayerIndex !== -1) {
        scores[existingPlayerIndex].score = score;
    } else {
        scores.push({ name: playerName, score });
    }

    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);

    localStorage.setItem("leaderboard", JSON.stringify(scores));

    leaderboardList.innerHTML = scores.map((s, i) => 
        `<li>${i + 1}. ${s.name} - ${s.score} pts</li>`
    ).join("");
};

const loadLeaderboard = () => {
    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboardList.innerHTML = scores.map((s, i) => 
        `<li>${i + 1}. ${s.name} - ${s.score} pts</li>`
    ).join("");
};

shuffleBtn.addEventListener("click", shuffleLetters);
refreshBtn.addEventListener("click", initGame);
checkBtn.addEventListener("click", checkWord);
window.addEventListener("load", () => {
    loadLeaderboard();
    initGame();
    const playerName = localStorage.getItem("playerName");
    if (playerName) {
        document.getElementById("player-name-display").innerText = playerName;
    }
});

inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkWord();
        playSound(clickSound);
    }
});

inputField.addEventListener("input", () => {
    playSound(typingSound);
});

logoutBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

confirmYes.addEventListener("click", () => {
    localStorage.removeItem("playerName"); 
    window.location.href = "index.html"; 
});

confirmNo.addEventListener("click", () => {
    modal.style.display = "none"; 
});

closeCongratsModalBtn.addEventListener("click", () => {
    congratsModal.style.display = "none";  
    window.location.reload();
});

exitBtn.addEventListener("click", () => {
    window.location.href = "index.html";  // Exit to the main page
});