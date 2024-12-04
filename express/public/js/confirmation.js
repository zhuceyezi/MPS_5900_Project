//let countdownDuration = 5;

const countdownElement = document.getElementById('countdown');
const nextPage = document.body.dataset.nextPage;

// Get countdown duration from data attribute, fallback to 20 seconds if not provided
const countdownDuration = parseInt(document.body.dataset.countdownDuration) || 20;


/**
 * Window onload event handler
 * Initializes the countdown and displays employee information
 */
window.onload = () => {
    startCountdown(countdownDuration);

    // Retrieve employee data from session storage
    const rawEmployeeData = sessionStorage.getItem('employeeData');
    console.log(rawEmployeeData);
    const employeeData = JSON.parse(sessionStorage.getItem('employeeData'));
    console.log(employeeData);

    // If employee data exists, update the UI
    if (employeeData) {

        document.getElementById('employeeId').textContent = employeeData.employeeId;
        document.getElementById('employeeName').textContent = employeeData.employeeName;
        document.getElementById('employeeName2').textContent = employeeData.employeeName;
        document.getElementById('lastLogin').textContent = new Date(employeeData.lastLogin).toLocaleString();
    }
};

/**
 * Starts a countdown timer that updates every second
 * @param {number} duration - The countdown duration in seconds
 */
const startCountdown = (duration) => {
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




