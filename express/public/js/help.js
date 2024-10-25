const problemInput = document.getElementById('problem');
const charCount = document.getElementById('charCount');
const feedbackForm = document.getElementById('feedbackForm');
const successPopup = document.getElementById('successPopup');
const countdownElement = document.getElementById('countdown');

problemInput.addEventListener('input', () => {
    charCount.textContent = `${problemInput.value.length}/420`;
});

feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        id: document.getElementById('id').value,
        problem: problemInput.value
    };

    try {
        // Send the data to the server (adjust the URL to your backend endpoint)
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Show the success popup
            successPopup.style.display = 'block';

            // Start the countdown and redirect after 3 seconds
            let countdown = 3;
            const interval = setInterval(() => {
                countdown -= 1;
                countdownElement.textContent = countdown;
                if (countdown === 0) {
                    clearInterval(interval);
                    window.location.href = "1.Main Page.html"; // Redirect to the main page
                }
            }, 1000);
        } else {
            alert('Failed to submit feedback. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
