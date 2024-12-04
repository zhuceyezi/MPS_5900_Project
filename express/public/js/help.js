const form = document.getElementById("feedbackForm");
const charCount = document.getElementById("charCount");
const textarea = document.getElementById("problem");
const popup = document.getElementById("successPopup");
const countdownEl = document.getElementById("countdown");

/**
 * Event listener for textarea input
 * Updates character count display as user types
 * Maximum character limit is 500
 */
textarea.addEventListener("input", () => {
    charCount.textContent = `${textarea.value.length}/500`;
});

/**
 * Form submission event handler
 * Handles the feedback submission process and displays success/error messages
 */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const employeeId = document.getElementById("id").value;
    const employeeName = document.getElementById("name").value;
    const content = document.getElementById("problem").value;
    formData.append("employeeId", employeeId);
    formData.append("employeeName", employeeName);
    formData.append("content", content);

    console.log(employeeId); // Should log the element or null
    console.log(employeeName); // Should log the element or null
    console.log(content); // Should log the element or null
    try {
        const response = await fetch(
            "http://localhost:3000/employees/addFeedback",
            {
                method: "POST",
                body: formData
            }
        );

        console.log("Response received:", response);

        if (response.status === 201) {
            showPopup();
            form.reset();
            charCount.textContent = "0/500";
        } else {
            console.error("Error in submission. Response status:", response.status);
            alert("There was an error submitting your feedback. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Could not submit feedback.");
    }
});

/**
 * Displays a success popup with countdown timer
 * After countdown completes, redirects to index page
 * @function showPopup
 * @returns {void}
 */
function showPopup() {
    popup.style.display = "block";
    let countdown = 3;
    countdownEl.textContent = countdown;
    const interval = setInterval(() => {
        countdown -= 1;
        countdownEl.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(interval);
            popup.style.display = "none";
            window.location.href = "index.html"; // Redirect to the main page
        }
    }, 1000);
}

