const form = document.getElementById("feedbackForm");
const charCount = document.getElementById("charCount");
const textarea = document.getElementById("problem");
const popup = document.getElementById("successPopup");
const countdownEl = document.getElementById("countdown");

textarea.addEventListener("input", () => {
    charCount.textContent = `${textarea.value.length}/500`;
});


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const employeeID = document.getElementById("id").value;
    const employeeName = document.getElementById("name").value;
    const content = document.getElementById("problem").value;
    formData.append("employeeID", employeeID);
    formData.append("employeeName", employeeName);
    formData.append("content", content);
    
    console.log(employeeID); // Should log the element or null
    console.log(employeeName); // Should log the element or null
    console.log(content); // Should log the element or null
    try {
        const response = await fetch(
            "http://localhost:3000/employees/addFeedback",
            {
                method: "POST",
                // headers: {"Content-Type": "application/json"},
                body: formData
            }
        );
        
        console.log("Response received:", response);
        
        if (response.status === 400) {
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

