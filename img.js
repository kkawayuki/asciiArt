const fileInput = document.getElementById("imageInput");
const widthInput = document.getElementById("widthInput");

let currentImage = null; 

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    //instantiate filereader webAPI
    const reader = new FileReader();

    //define behavior for when file has been successfully read (onload)
    reader.onload = () => {
        console.log(reader.result); //log data as string to console (test)

        //create image -> define behavior for decoding it
        const img = new Image();
        img.onload = () => {
            currentImage = img; //load into global
            generateAscii(img);
        };
        img.src = reader.result;
    };

    reader.readAsDataURL(file); //read in file
});

widthInput.addEventListener("change", (event) => {
    generateAscii(currentImage); //load from global
});

//helper functions -------------------------------

function updateTextInput(val) {
    document.getElementById('textInput').value=val; 
}

function generateAscii(img)
{
    //use existing canvas
    const canvas = document.getElementById("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d"); //ctx = context = javascript canvas painting tool
    ctx.drawImage(img, 0, 0); //have ctx drop in image from 0,0 coordinates

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
    ); //gather image data

    //[BIG IDEA] for each group of pixels, determine luminance

    //determine height and width of ascii art [grid dimensions], use to determine group sizes
    const imgRatio = canvas.height / canvas.width; //double
    const uWidth = Math.floor(Number(document.getElementById("widthInput").value)); //uWidth = number of blocks in width
    const uHeight = imgRatio * uWidth; //uHeight = number of blocks in Height

    //determine sizes of blocks based on grid dimensions
    const bWidth = canvas.width / uWidth; //bWidth = block width
    const bHeight = canvas.height / uHeight; //bHeight = block height

    //for building the ascii art
    let asciiString = "";

    //for each cell created by user (rows outer, cols inner)
    for (let j = 0; j < uHeight; j++) {
        

        for (let i = 0; i < uWidth; i++) { 
            let xStart = i * bWidth;
            let yStart = j * bHeight;

            //find the average luminosity of the pixels that constitute its block
            const cLuminance = avgLuminance(
                imageData,
                xStart,
                yStart,
                bWidth,
                bHeight,
                canvas.width,
                canvas.height,
            );
            //console.log(luminanceToChar(cLuminance)); //temporary — just to confirm real values are coming out
            asciiString += luminanceToChar(cLuminance); //temp
        }
        asciiString +='\n';
    }
    //console.log(asciiString); //tmp
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

            //grab rgb values based on index
            let r = imageData.data[i];
            let g = imageData.data[i + 1];
            let b = imageData.data[i + 2];
            //a is unneeded, drop every 4th array value

            //luminance equation
            let luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            lumTotal += luminance;
            numPixels++;
        }
    }

    return numPixels > 0 ? lumTotal / numPixels : 0;
}

//map luminance int to char value
function luminanceToChar(luminance) {
    // light -> dark " .:-=+*#%@", 10 levels, 255/10 is about 25 per level
    const lMap = "@%#*+=-:. ";

    switch (true) {
        case luminance < 25:
            return lMap[0]; // " "
        case luminance < 50:
            return lMap[1]; // "."
        case luminance < 75:
            return lMap[2]; // ":"
        case luminance < 100:
            return lMap[3]; // "-"
        case luminance < 125:
            return lMap[4]; // "="
        case luminance < 150:
            return lMap[5]; // "+"
        case luminance < 175:
            return lMap[6]; // "*"
        case luminance < 200:
            return lMap[7]; // "#"
        case luminance < 225:
            return lMap[8]; // "%"
        default:
            return lMap[9]; // "@" (luminance values 225-255)
    }
}
