const video = document.getElementById("video");
const photo = document.getElementById("photo");
const captureButton = document.getElementById("capture");
const employeeInfoDiv = document.getElementById("employee-info");
//const uploadButton = document.getElementById('upload');
const canvas = document.createElement("canvas"); // Create a canvas dynamically

const thresholdForFacialRec = 10; // Threshold for facial image difference
const thresholdForBackgroundImage = 1; // Threshold for background image difference

//automation button
const autoButton = document.getElementById("auto-capture");
let autoCapturing = false;
let captureInterval;

// Access the user's camera and stream it to the video element
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing camera: " + err);
  });

async function loadFaceApiModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("./faceDetectionModels");
}

window.onload = async () => {
  await loadFaceApiModels();
};

// Capture the photo from the live camera feed
captureButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // convert canvas to blob and send to api
  canvas.toBlob(
    async (blob) => {
      try {
        const base64Image = await blobToBase64(blob);
        localStorage.setItem("background", base64Image);
      } catch (error) {
        console.error("error image:", error);
      }
    },
    `image/jpeg`,
    0.95
  );
});

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
//return the percentage of difference between two images
function compareImages(image1, image2) {
  //console.log(image1, image2);
  return new Promise((resolve) => {
    resemble(image1)
      .compareTo(image2)
      .onComplete((data) => {
        resolve(data.misMatchPercentage);
      });
  });
}

const base64ToImageURl = async (base64Image) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = base64Image;
    image.onload = () => resolve(image);
  });
};

//check if there is a face in the image using face-api.js a trained model runs on browser
const detectFace = async (base64Image) => {
  const image = await base64ToImageURl(base64Image);
  const facesInImage = await faceapi.detectAllFaces(
    image,
    new faceapi.TinyFaceDetectorOptions()
  );
  URL.revokeObjectURL(image.src);
  return facesInImage.length > 0;
};

//Auto capture event listener
autoButton.addEventListener("click", () => {
  if (!autoCapturing) {
    // Start auto capturing
    autoCapturing = true;
    autoButton.textContent = "Stop Auto Capture"; // Change button text

    // Set interval to capture photo every 2 sec
    captureInterval = setInterval(() => {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // convert canvas to blob and send to api
      canvas.toBlob(
        async (blob) => {
          let curbase64Image = null;
          try {
            curbase64Image = await blobToBase64(blob);
          } catch (error) {
            console.error("error converting to base64:", error);
            return;
          }
          //check if the image is the background image
          const background = localStorage.getItem("background");
          if (background) {
            try {
              const misMatchPercentage = await compareImages(
                curbase64Image,
                background
              );
              if (misMatchPercentage <= thresholdForBackgroundImage) {
                console.log("Image is same as background image");
                return;
              }
            } catch (error) {
              console.error("error in comparing images:", error);
              return;
            }
          }

          const previousImageBase64 = localStorage.getItem("previousImage");
          if (previousImageBase64) {
            try {
              const misMatchPercentage = await compareImages(
                curbase64Image,
                previousImageBase64
              );
              if (misMatchPercentage <= thresholdForFacialRec) {
                console.log("Image is same as previous image");
                return;
              } else {
                console.log("Image is different from previous image");
              }
            } catch (error) {
              console.error("error in comparing images:", error);
              return;
            }
          }

          //check if face inside the image
          try {
            const faceDetected = await detectFace(curbase64Image);
            if (!faceDetected) {
              console.log("there is no human face in the image");
              return;
            } else {
              console.log("face detected");
            }
          } catch (error) {
            console.error("error in detecting face:", error);
            return;
          }

          localStorage.setItem("previousImage", curbase64Image);
          try {
            console.log("Sending image to API...");
            await sendImageToAPI(blob);
          } catch (error) {
            console.error("error image:", error);
          }
        },
        `image/jpeg`,
        0.95
      );
    }, 2000); // take photo every 2 sec
  } else {
    // Stop auto capturing
    autoCapturing = false;
    autoButton.textContent = "Take Photo Every 2s"; // Reset button text
    clearInterval(captureInterval);
  }
});

// Convert canvas to image and display in the img element
// const dataURL = canvas.toDataURL("image/png");
// photo.src = dataURL;

// Upload image
//     const base64Image = photo.src;
//     if (base64Image) {
//         sendImageToAPI(base64Image);
//     } else {
//         console.log("No image to upload");
//     }
// });

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
async function sendImageToAPI(imageBlob) {
  try {
    //create FormData and append the image
    const formData = new FormData();

    // use local image instead of captured image for quicker testing
    // const localImagePath = "test_photo.jpg";
    // const res = await fetch(localImagePath);

    // imageBlob = await res.blob();

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
      // window.location.href = "success.html"; //temp disable for testing autocapture
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
