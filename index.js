document.addEventListener('DOMContentLoaded', () => {
    const startModal = document.getElementById('start-modal');
    const instructionsModal = document.getElementById('instructions-modal');
    const playerNameInput = document.getElementById('player-name');
    const startButton = document.querySelector('#start-modal button');
    const errorMessage = document.getElementById('name-error');
    const buttonClickSound = new Audio('sounds/typing.mp3');
    const errorSound = new Audio('sounds/error.mp3');
    const typingSound = new Audio('sounds/typing.mp3');

    errorMessage.style.display = 'none';

    function openModal(modal) {
        modal.style.display = 'block';
        if (modal === startModal) {
            playerNameInput.focus();
        }
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    document.querySelector('.start-btn').addEventListener('click', () => {
        buttonClickSound.play();
        openModal(startModal);
    });

    document.querySelector('.instructions-btn').addEventListener('click', () => {
        buttonClickSound.play();
        openModal(instructionsModal);
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            buttonClickSound.play();
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal(startModal);
            closeModal(instructionsModal);
        }
    });

    function startGame() {
        const playerName = playerNameInput.value.trim();

        if (playerName === "") {
            errorSound.play();
            errorMessage.textContent = "Name is required!";
            errorMessage.style.display = 'block';
            playerNameInput.classList.add('shake');
            setTimeout(() => playerNameInput.classList.remove('shake'), 500);
        } else {
            errorMessage.style.display = 'none';
            localStorage.setItem("playerName", playerName);
            closeModal(startModal);
            window.location.href = `main.html`;
        }
    }

    startButton.addEventListener('click', () => {
        buttonClickSound.play();
        startGame();
    });

    playerNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            buttonClickSound.play();
            startGame();
        }
    });

    playerNameInput.addEventListener('input', () => {
        typingSound.currentTime = 0; 
        typingSound.play();
        startButton.disabled = playerNameInput.value.trim() === "";
    });
});