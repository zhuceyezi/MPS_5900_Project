const video = document.getElementById("video");
const photo = document.getElementById("photo");
//const captureButton = document.getElementById("capture");
const employeeInfoDiv = document.getElementById("employee-info");
//const uploadButton = document.getElementById('upload');
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

// Function to convert blob to base64
function blobToBase64(blob) {
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
}


//Function to check if there is a face in the image using face-api.js a trained model runs on browser
const detectFace = async (base64Image) => {
    const image = await base64ToImageURl(base64Image);
    const facesInImage = await faceapi.detectAllFaces(
        image,
        new faceapi.TinyFaceDetectorOptions()
    );
    URL.revokeObjectURL(image.src);
    return facesInImage.length > 0;
};

// // Function to convert canvas to image and display in the img element
// const base64ToImageURl = async (base64Image) => {
//     return new Promise((resolve) => {
//         const image = new Image();
//         image.src = base64Image;
//         image.onload = () => resolve(image);
//     });
// };

// Function to send the image data to the API
async function sendImageToAPI(imageBlob) {
    try {
        //create FormData and append the image
        const formData = new FormData();

        formData.append("image", imageBlob, "photo.jpg");

        upload_endpoint = "http://localhost:3000/facial/validate";
        const response = await fetch(upload_endpoint, {
            method: "POST",
            body: formData,
            // headers: {
            //     "Content-Type": "application/json",
            // },
            // body: JSON.stringify({ image: base64Image }),
        });

        if (response.status === 200) {
            const employeeData = await response.json();
            //Test in console
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

            //store info for next page
            sessionStorage.setItem("employeeData", JSON.stringify(employeeData));
            // Redirect to the employee info page
            window.location.href = "success.html"; //temp disable for testing autocapture
        } else {
            // alert("Facial recognition failed. Please try again."); //temp disable for testing autocapture
            console.error("Facial recognition failed:", response.statusText);
        }
        // const result = await response.json();
        // console.log("Image uploaded successfully:", result);
    } catch (error) {
        console.error("Error during facial recognition:", error.message);
    }
}
