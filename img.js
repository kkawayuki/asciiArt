const fileInput = document.getElementById("imageInput");
const widthInput = document.getElementById("widthInput");

let currentImage = null; 

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        console.log(reader.result);

        const img = new Image();
        img.onload = () => {
            currentImage = img;
            generateAscii(img);
        };
        img.src = reader.result;
    };

    reader.readAsDataURL(file);
});

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => loadImage(reader.result);
    reader.readAsDataURL(file);
});

widthInput.addEventListener("input", (event) => {
    updateTextInput(event.target.value);
    if(!currentImage) return;
    generateAscii(currentImage);
});

function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        generateAscii(img);
    };
    img.src = src;
}

document.querySelectorAll("#samples img").forEach((thumb) => {
    thumb.addEventListener("click", () => loadImage(thumb.src));
});

//helper functions -------------------------------

function updateTextInput(val) {
    document.getElementById('textInput').value=val; 
}

function generateAscii(img)
{
    const canvas = document.getElementById("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
    );

    //ascii grid dimensions (u = chars) and the pixel block size each char covers (b)
    const imgRatio = canvas.height / canvas.width;
    const uWidth = Math.floor(Number(document.getElementById("widthInput").value));
    const uHeight = imgRatio * uWidth;
    const bWidth = canvas.width / uWidth;
    const bHeight = canvas.height / uHeight;

    let asciiString = "";

    for (let j = 0; j < uHeight; j++) {
        for (let i = 0; i < uWidth; i++) { 
            let xStart = i * bWidth;
            let yStart = j * bHeight;

            const cLuminance = avgLuminance(
                imageData,
                xStart,
                yStart,
                bWidth,
                bHeight,
                canvas.width,
                canvas.height,
            );
            asciiString += luminanceToChar(cLuminance);
        }
        asciiString +='\n';
    }
    const htmlOutputElement = document.getElementById("asciiOutput");
    htmlOutputElement.textContent = asciiString; 
}

//returns average luminance of a locale
function avgLuminance(
    imageData,
    xInit,
    yInit,
    bWidth,
    bHeight,
    cWidth,
    cHeight,
) {
    let lumTotal = 0;
    let numPixels = 0;

    // xInit/yInit can be fractional thus, floor starting positions
    const xStart = Math.floor(xInit);
    const yStart = Math.floor(yInit);
    const xEnd = Math.min(Math.floor(xInit + bWidth), cWidth);
    const yEnd = Math.min(Math.floor(yInit + bHeight), cHeight);

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            //convert this (x, y) pair into the matching flat index in imageData.data
            let i = (y * cWidth + x) * 4;

            let r = imageData.data[i];
            let g = imageData.data[i + 1];
            let b = imageData.data[i + 2];
            //skip alpha (i + 3); weights are the Rec. 601 perceived-brightness formula
            let luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            lumTotal += luminance;
            numPixels++;
        }
    }

    return numPixels > 0 ? lumTotal / numPixels : 0;
}

function luminanceToChar(luminance) {
    //dark -> light, 10 levels of ~25 luminance each
    const lMap = "@%#*+=-:. ";

    switch (true) {
        case luminance < 25:
            return lMap[0];
        case luminance < 50:
            return lMap[1];
        case luminance < 75:
            return lMap[2];
        case luminance < 100:
            return lMap[3];
        case luminance < 125:
            return lMap[4];
        case luminance < 150:
            return lMap[5];
        case luminance < 175:
            return lMap[6];
        case luminance < 200:
            return lMap[7];
        case luminance < 225:
            return lMap[8];
        default:
            return lMap[9];
    }
}
