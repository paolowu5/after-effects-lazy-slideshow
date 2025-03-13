// Main function to create the slideshow
function createSlideshow(folder) {
    if (app.project === null) {
        app.newProject();
    }

    // Convert folder name to uppercase and replace spaces
    var folderNameUpper = folder.name.toUpperCase().replace(/%20/g, ' ');

    var files = folder.getFiles(function (file) {
        return file instanceof File && file.name.match(/\.(jpg|jpeg|png|tif|tiff|avif|webp)$/i);
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
        imgLayer.startTime = timeOffset;
        imgLayer.inPoint = timeOffset;
        imgLayer.outPoint = timeOffset + 6;
        timeOffset += 5;

        fitToCompWidth(imgLayer);
        animateZoom(imgLayer);

        if (j > 0) {
            applyCrossFadeIn(imgLayer, imgLayer.inPoint);
        }
    }

    // Add a new composition for the loop
    createLoopingComp(comp);

    comp.workAreaDuration = compDuration;
    comp.duration = comp.workAreaDuration;

    app.endUndoGroup();
}

// Function that creates the composition for the loop
function createLoopingComp(originalComp) {
    // Convert composition name to uppercase and replace spaces
    var loopCompNameUpper = originalComp.name.toUpperCase().replace(/%20/g, ' ') + " LOOP";

    // Create a new composition with the loop duration
    var loopComp = app.project.items.addComp(loopCompNameUpper, originalComp.width, originalComp.height, originalComp.pixelAspect, originalComp.duration, originalComp.frameRate);

    // Add the original composition to the new composition
    var loopLayer = loopComp.layers.add(originalComp);
    loopLayer.startTime = 0;

    // Duplicate the first 24 frames and move them to the end
    var frameDuration = 24 / originalComp.frameRate;
    var startLayer = loopLayer.duplicate();
    startLayer.startTime = originalComp.duration - frameDuration;

    // Apply opacity animation from 0 to 100 on the first 24 frames
    var opacity = startLayer.property("Opacity");
    opacity.setValueAtTime(startLayer.startTime, 0);
    opacity.setValueAtTime(startLayer.startTime + frameDuration, 100);

    // Set the work area from frame 25
    loopComp.workAreaStart = frameDuration;
    loopComp.workAreaDuration = originalComp.duration - frameDuration;

    loopComp.openInViewer(); // Opens the loop composition in the After Effects viewer
}

// Function that scales the layer to fit the width to the composition
function fitToCompWidth(layer) {
    var compWidth = layer.containingComp.width;
    var compHeight = layer.containingComp.height;
    var imageWidth = layer.source.width;
    var imageHeight = layer.source.height;

    var scaleFactor = (compWidth / imageWidth) * 100;
    layer.property("Scale").setValue([scaleFactor, scaleFactor]);
}

// Function to animate a proportional zoom-in
function animateZoom(layer) {
    var scaleProp = layer.property("Scale");

    var startTime = layer.inPoint;
    var endTime = layer.outPoint;

    var startScale = scaleProp.value;

    // Set a proportional zoom of 12%
    var zoomPercentage = 1.12; // 12% zoom

    // Calculate the new scale value as a percentage of the initial scale
    var endScale = [startScale[0] * zoomPercentage, startScale[1] * zoomPercentage];

    // Apply the values at the beginning and end of the animation
    scaleProp.setValueAtTime(startTime, startScale);
    scaleProp.setValueAtTime(endTime, endScale);
}

// Function that applies a cross-fade (fade in) to the next photo
function applyCrossFadeIn(layer, fadeStartTime) {
    var opacity = layer.property("Opacity");
    opacity.setValueAtTime(fadeStartTime, 0);
    opacity.setValueAtTime(fadeStartTime + 1, 100);
}

// Function to run the slideshow on all subfolders
function createSlideshowsInSubfolders() {
    var folder = Folder.selectDialog("Select a folder with photos and subfolders");

    if (folder === null) {
        alert("No folder selected!");
        return;
    }

    // First check if there are images in the main folder
    var imagesInMainFolder = folder.getFiles(function (file) {
        return file instanceof File && file.name.match(/\.(jpg|jpeg|png|tif|tiff|avif)$/i);
    });

    if (imagesInMainFolder.length > 0) {
        // If we find images in the main folder, create the slideshow
        createSlideshow(folder);
    }

    // Now check the subfolders
    var subfolders = folder.getFiles(function (file) {
        return file instanceof Folder;
    });

    if (subfolders.length === 0 && imagesInMainFolder.length === 0) {
        // If there are neither subfolders nor images, show a warning
        alert("No images or subfolders found in the selected folder.");
        return;
    }

    // For each subfolder found, create the slideshow
    for (var i = 0; i < subfolders.length; i++) {
        createSlideshow(subfolders[i]);
    }
}

// Run the slideshow directly for all subfolders or images in the main folder
createSlideshowsInSubfolders();