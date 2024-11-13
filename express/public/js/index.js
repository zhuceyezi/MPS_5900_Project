const video = document.getElementById("video");
const photo = document.getElementById("photo");
const employeeInfoDiv = document.getElementById("employee-info");
const canvas = document.createElement("canvas"); // Create a canvas dynamically

const thresholdForFacialRec = 20; // Threshold for facial image difference
const thresholdForBackgroundImage = 1; // Threshold for background image difference

let autoCapturing = false;
let captureInterval;

// Initial setup
window.onload = async () => {
    await loadFaceApiModels();

    // Start auto capturing when the page loads
    startAutoCapture();
};

// Access the user's camera and stream it to the video element
navigator.mediaDevices
    .getUserMedia({video: true})
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Error accessing camera: " + err);
    });


// Functions

async function loadFaceApiModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri("./faceDetectionModels");
}

// Function to start auto capturing when the page loads
function startAutoCapture() {
    autoCapturing = true;

    // Set interval to capture photo every 2 seconds
    captureInterval = setInterval(() => {
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and send to API
        canvas.toBlob(
            async (blob) => {
                let curbase64Image = null;
                try {
                    curbase64Image = await blobToBase64(blob);
                } catch (error) {
                    console.error("Error in transfer to base 64:", error);
                }

                // Check if face inside the image
                try {
                    const faceDetected = await detectFace(curbase64Image);
                    if (!faceDetected) {
                        console.log("There is no human face in the image");
                        return;
                    } else {
                        console.log("Face detected");
                    }
                } catch (error) {
                    console.error("Error in detecting face:", error);
                    return;
                }

                localStorage.setItem("previousImage", curbase64Image);
                try {
                    console.log("Sending image to API...");
                    await sendImageToAPI(blob);
                } catch (error) {
                    console.error("Error sending image:", error);
                }
            },
            `image/jpeg`,
            0.95
        );
    }, 3000); // Take photo every 3 seconds
}

/**
 * Converts a Blob object to a base64 encoded string
 * @param {Blob} blob - The Blob object to convert (usually an image)
 * @returns {Promise<string>} A promise that resolves with the base64 string
 * @description
 * Uses FileReader to convert a Blob to base64 format.
 * Useful for:
 * - Storing binary data as string in localStorage
 * - Preparing images for face detection
 */
function blobToBase64(blob) {
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
}


/**
 * Detects human faces in an image using face-api.js
 * @param {string} base64Image - Base64 encoded image string to analyze
 * @returns {Promise<boolean>} Returns true if at least one face is detected
 * @description
 * Uses face-api.js TinyFaceDetector model to detect faces in browser.
 * Process:
 * 1. Converts base64 to Image object
 * 2. Runs face detection
 * 3. Cleans up resources
 */
const detectFace = async (base64Image) => {
    // Convert base64 to Image object
    const image = await base64ToImageURl(base64Image);
    // Use the Image object for face detection
    const facesInImage = await faceapi.detectAllFaces(
        image,
        new faceapi.TinyFaceDetectorOptions()
    );
    URL.revokeObjectURL(image.src);
    return facesInImage.length > 0;
};

// Function to convert base64 string to an Image object for face detection
// Returns a Promise that resolves with the loaded Image object
const base64ToImageURl = async (base64Image) => {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = base64Image;
        image.onload = () => resolve(image);
    });
};

/**
 * Sends captured image to facial recognition API and handles employee validation
 * @param {Blob} imageBlob - The image blob to be sent to the server
 * @description
 * 1. Sends image to facial recognition endpoint
 * 2. Processes employee data if recognition successful
 * 3. Stores employee data and redirects to success page
 */
async function sendImageToAPI(imageBlob) {
    try {
        //create FormData and append the image
        const formData = new FormData();

        formData.append("image", imageBlob, "photo.jpg");

        upload_endpoint = "http://localhost:3000/facial/validate";
        const response = await fetch(upload_endpoint, {
            method: "POST",
            body: formData,
        });

        if (response.status === 200) {
            // Process successful facial recognition
            const employeeData = await response.json();
            // Log employee information for debugging
            console.log(employeeData);
            console.log("✅ Facial recognition successful!");
            console.log("Employee Information:");
            console.log("------------------------");
            console.log("ID:", employeeData.employeeId);
            console.log("Name:", employeeData.employeeName);
            console.log(
                "Last Login:",
                new Date(employeeData.lastLogin).toLocaleString()
            );
            console.log("------------------------");

            // Store employee data and redirect to success page
            sessionStorage.setItem("employeeData", JSON.stringify(employeeData));
            window.location.href = "confirmation.html";
        } else {
            console.error("Facial recognition failed:", response.statusText);
        }

    } catch (error) {
        console.error("Error during facial recognition:", error.message);
    }
}
