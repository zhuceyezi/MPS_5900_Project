const video = document.getElementById("video");
const photo = document.getElementById("photo");
const captureButton = document.getElementById("capture");
const employeeInfoDiv = document.getElementById("employee-info");
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

  // convert canvas to blob
  canvas.toBlob(
    async (blob) => {
      try {
        await sendImageToAPI(blob);
      } catch (error) {
        console.error("error image:", error);
      }
    },
    `image/jpeg`,
    0.95
  );
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
    const localImagePath = "test_photo.jpg";
    const res = await fetch(localImagePath);
    imageBlob = await res.blob();

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
      window.location.href = "success.html";
    } else {
      alert("Facial recognition failed. Please try again.");
      console.error("Facial recognition failed:", response.statusText);
    }
    // const result = await response.json();
    // console.log("Image uploaded successfully:", result);
  } catch (error) {
    console.error("Error during facial recognition:", error.message);
  }
}
