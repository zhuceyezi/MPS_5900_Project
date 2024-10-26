const video = document.getElementById("video");
const canvas = document.createElement("canvas"); // Create a canvas dynamically
const capturedPhoto = document.getElementById("capturedPhoto");
const context = canvas.getContext("2d");

const captureButton = document.getElementById("regcapture");
const submitButton = document.getElementById("submit");
const retakeButton = document.getElementById("retake");

const usernameInput = document.getElementById("username");
const useridInput = document.getElementById("userid");

// Access the user's camera and stream it to the video element
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing camera: " + err);
  });

// Capture the photo from the live camera feed
captureButton.addEventListener("click", () => {
  console.log("Capturing photo...");

  // Set canvas size to video dimensions
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the current video frame to the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get the photo data URL and show it in the img element
  const photoDataURL = canvas.toDataURL("image/jpeg");
  capturedPhoto.src = photoDataURL;
  capturedPhoto.style.display = "block"; // Display captured photo
  video.style.display = "none"; // Hide the video

  console.log("Captured photo successfully!");

  // Enable the submit button
  submitButton.classList.add("active");
  submitButton.disabled = false;

  // Switch to retake photo state
  captureButton.style.display = "none";
  retakeButton.style.display = "block";
});

retakeButton.addEventListener("click", () => {
  // Restart the video stream
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Error accessing camera: " + err);
    });

  capturedPhoto.style.display = "none";
  video.style.display = "block";

  // Hide the retake button and show the capture button again
  captureButton.style.display = "block";
  retakeButton.style.display = "none"; // Hide the retake button

  // Disable the submit button
  submitButton.classList.remove("active");
  submitButton.disabled = true;
});

const form = document.getElementById("registerform");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form submission

  // Here you can handle the final submission logic
  console.log("Form submitted!");
  const username = document.getElementById("username").value;
  const userid = document.getElementById("userid").value;

  console.log("User Name:", username);
  console.log("User ID:", userid);

  // Add logic to send data to the server as needed
  //convert canvas to blob
  canvas.toBlob(
    async (blob) => {
      try {
        await sendImageToAPI(blob);
      } catch (error) {
        console.error("Error sending image:", error);
        alert("Error in registering user. Please try again.");
      }
    },
    `image/jpeg`,
    0.95
  );
});

// Function to send the image data to the API
async function sendImageToAPI(imageBlob) {
  try {
    const formData = new FormData();
    formData.append("image", imageBlob, "photo.jpg");
    formData.append("employeeName", usernameInput.value);
    formData.append("employeeId", useridInput.value);

    console.log("Sending photo and user info...");

    const response = await fetch("http://localhost:3000/facial", {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    if (response.status === 201) {
      const result = await response.json();
      console.log("Data sent successfully:", result);
      window.location.href = "/express/public/index.html";
    } else {
      const errorMessage = await response.json();
      console.log("Data sent failed:", errorMessage);
      alert("Error in registration. Please try again.");
    }
  } catch (error) {
    console.error("Error during API call:", error.message);
  }
}
