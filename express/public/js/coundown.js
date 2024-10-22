
//let countdownDuration = 5;

const countdownElement = document.getElementById('countdown');
const nextPage = document.body.dataset.nextPage;

const countdownDuration = parseInt(document.body.dataset.countdownDuration) || 20; // 如果没有提供，则默认为 20 秒

function startCountdown(duration) {
    let timeLeft = duration;

    // Update the countdown display
    countdownElement.textContent = timeLeft;

    const timer = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;

        // If the countdown ends, stop the timer
        if (timeLeft <= 0) {
            clearInterval(timer);
            countdownElement.textContent = '0';
            window.location.href = nextPage; // Jump to another page when the countdown is over.
        }

    }, 1000);
}


window.onload = function() {
    startCountdown(countdownDuration); // 启动倒计时
};


