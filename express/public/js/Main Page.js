const video = document.getElementById("video");
const photo = document.getElementById("photo");
const captureButton = document.getElementById("capture");
//const uploadButton = document.getElementById('upload');
const canvas = document.createElement("canvas"); // Create a canvas dynamically

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
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image and display in the img element
    const dataURL = canvas.toDataURL("image/png");
    photo.src = dataURL;

    // Upload image
    const base64Image = photo.src;
    if (base64Image) {
        sendImageToAPI(base64Image);
    } else {
        console.log("No image to upload");
    }
});

// Upload button event listener
/*uploadButton.addEventListener('click', () => {
                const base64Image = photo.src;
                if (base64Image) {
                    sendImageToAPI(base64Image);
                } else {
                    console.log('No image to upload');
                }
            });*/

// Function to send the image data to the API
async function sendImageToAPI(base64Image) {
    try {
        // TODO: change backend API
        upload_endpoint = "https://httpbin.org/post";
        const response = await fetch(upload_endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
        });
        const result = await response.json();
        console.log("Image uploaded successfully:", result);
    } catch (error) {
        console.error("Error uploading image:", error);
    }
}
