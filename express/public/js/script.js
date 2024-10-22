// Loading page time countdown
const countdownElement = document.getElementById('countdown');
let timeLeft = 30;

const timer = setInterval(() => {
    timeLeft--;
    countdownElement.textContent = timeLeft;

    // If the countdown ends, stop the timer
    if (timeLeft <= 0) {
        clearInterval(timer);
        countdownElement.textContent = '0';
        window.location.href = '4.Fail Page.html'; // Jump to another page when the countdown is over.
    }

}, 1000); 