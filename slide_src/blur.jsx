// Main function to create the slideshow
function createSlideshow(folder) {
    if (app.project === null) {
        app.newProject();
    }

    // Convert folder name to uppercase and replace spaces
    var folderNameUpper = folder.name.toUpperCase().replace(/%20/g, ' ');

    var files = folder.getFiles(function (file) {
        return file instanceof File && file.name.match(/\.(jpg|jpeg|png|tif|tiff|avif)$/i);
    });

    if (files.length === 0) {
        alert("No images found in folder: " + folder.name);
        return;
    }

    app.beginUndoGroup("Create Slideshow: " + folderNameUpper);

    // Create the project folder with the modified name
    var projectFolder = app.project.items.addFolder(folderNameUpper);

    var totalImages = files.length;
    var compDuration = totalImages * 5;

    // Create the composition with the modified name
    var comp = app.project.items.addComp(folderNameUpper, 1920, 1080, 1, compDuration, 25);
    comp.parentFolder = projectFolder;

    var importedItems = [];
    for (var i = 0; i < files.length; i++) {
        var importOptions = new ImportOptions(files[i]);
        if (importOptions.canImportAs(ImportAsType.FOOTAGE)) {
            var footage = app.project.importFile(importOptions);
            footage.parentFolder = projectFolder;
            importedItems.push(footage);
        }
    }

    var timeOffset = 0;
    for (var j = 0; j < importedItems.length; j++) {
        var imgLayer = comp.layers.add(importedItems[j]);

        // Set time values for the main layer
        imgLayer.startTime = timeOffset;
        imgLayer.inPoint = timeOffset;
        imgLayer.outPoint = timeOffset + 6;
        timeOffset += 5;

        // Check if the photo is portrait
        var isPortrait = importedItems[j].width < importedItems[j].height;
        if (isPortrait) {
            fitToCompHeight(imgLayer);

            var blurredLayer = imgLayer.duplicate();
            fitToCompWidth(blurredLayer);
            applyGaussianBlur(blurredLayer, 50);

            blurredLayer.moveAfter(imgLayer);

            blurredLayer.startTime = imgLayer.startTime;
            blurredLayer.inPoint = imgLayer.inPoint;
            blurredLayer.outPoint = imgLayer.outPoint;

            animateZoom(blurredLayer, 1.05);

            if (j > 0) {
                applyCrossFadeIn(blurredLayer, blurredLayer.inPoint);
            }

        } else {
            fitToCompWidth(imgLayer);
        }

        animateZoom(imgLayer, 1.12);

        if (j > 0) {
            applyCrossFadeIn(imgLayer, imgLayer.inPoint);
        }
    }

    createLoopingComp(comp);

    comp.workAreaDuration = compDuration;
    comp.duration = comp.workAreaDuration;

    app.endUndoGroup();
}

// Function that creates the composition for the loop
function createLoopingComp(originalComp) {
    var loopCompNameUpper = originalComp.name.toUpperCase().replace(/%20/g, ' ') + " LOOP";
    var loopComp = app.project.items.addComp(loopCompNameUpper, originalComp.width, originalComp.height, originalComp.pixelAspect, originalComp.duration, originalComp.frameRate);
    var loopLayer = loopComp.layers.add(originalComp);
    loopLayer.startTime = 0;

    var frameDuration = 24 / originalComp.frameRate;
    var startLayer = loopLayer.duplicate();
    startLayer.startTime = originalComp.duration - frameDuration;

    var opacity = startLayer.property("Opacity");
    opacity.setValueAtTime(startLayer.startTime, 0);
    opacity.setValueAtTime(startLayer.startTime + frameDuration, 100);

    loopComp.workAreaStart = frameDuration;
    loopComp.workAreaDuration = originalComp.duration - frameDuration;

    loopComp.openInViewer();
}

// Function that scales the layer to fit the width to the composition
function fitToCompWidth(layer) {
    var compWidth = layer.containingComp.width;
    var imageWidth = layer.source.width;
    var scaleFactor = (compWidth / imageWidth) * 100;
    layer.property("Scale").setValue([scaleFactor, scaleFactor]);
}

// Function that scales the layer to fit the height to the composition
function fitToCompHeight(layer) {
    var compHeight = layer.containingComp.height;
    var imageHeight = layer.source.height;
    var scaleFactor = (compHeight / imageHeight) * 100;
    layer.property("Scale").setValue([scaleFactor, scaleFactor]);
}

// Function to apply proportional zoom-in
function animateZoom(layer, zoomPercentage) {
    var scaleProp = layer.property("Scale");

    var startTime = layer.inPoint;
    var endTime = layer.outPoint;

    var startScale = scaleProp.value;
    var endScale = [startScale[0] * zoomPercentage, startScale[1] * zoomPercentage];

    scaleProp.setValueAtTime(startTime, startScale);
    scaleProp.setValueAtTime(endTime, endScale);
}

// Function to apply a cross-fade (fade in)
function applyCrossFadeIn(layer, fadeStartTime) {
    var opacity = layer.property("Opacity");
    opacity.setValueAtTime(fadeStartTime, 0);
    opacity.setValueAtTime(fadeStartTime + 1, 100);
}

// Function to apply Gaussian Blur
function applyGaussianBlur(layer, blurAmount) {
    var blurEffect = layer.Effects.addProperty("ADBE Gaussian Blur 2");
    blurEffect.property("Blurriness").setValue(blurAmount);
    blurEffect.property("Repeat Edge Pixels").setValue(true); // Option to avoid black edges
}

// Function to run the slideshow on all subfolders or images in the main folder
function createSlideshowsInSubfolders() {
    var folder = Folder.selectDialog("Select a folder with photos and subfolders");

    if (folder === null) {
        alert("No folder selected!");
        return;
    }

    // Check if there are images in the main folder
    var imagesInMainFolder = folder.getFiles(function (file) {
        return file instanceof File && file.name.match(/\.(jpg|jpeg|png|tif|tiff|avif)$/i);
    });

    if (imagesInMainFolder.length > 0) {
        // Create slideshow for images in the main folder
        createSlideshow(folder);
    }

    // Check if there are subfolders
    var subfolders = folder.getFiles(function (file) {
        return file instanceof Folder;
    });

    if (subfolders.length === 0 && imagesInMainFolder.length === 0) {
        alert("No images or subfolders found in the selected folder.");
        return;
    }

    // Create a slideshow for each subfolder
    for (var i = 0; i < subfolders.length; i++) {
        createSlideshow(subfolders[i]);
    }
}

// Run the slideshow directly for all subfolders or images in the main folder
createSlideshowsInSubfolders();