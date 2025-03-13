// Get the path of the current folder (where the main script is located)
var currentFolder = File($.fileName).parent;

// Function to run the "normal.jsx" script
function runNormalSlide() {
    try {
        var scriptFile = new File(currentFolder.fsName + "/slide_src/normal.jsx");
        if (scriptFile.exists) {
            scriptFile.open("r");
            var scriptContent = scriptFile.read();
            scriptFile.close();
            eval(scriptContent);
        } else {
            alert("The file normal.jsx was not found.");
        }
    } catch (err) {
        alert("Error executing the normal script: " + err.toString());
    }
}

// Function to run the "blur.jsx" script
function runBlurSlide() {
    try {
        var scriptFile = new File(currentFolder.fsName + "/slide_src/blur.jsx");
        if (scriptFile.exists) {
            scriptFile.open("r");
            var scriptContent = scriptFile.read();
            scriptFile.close();
            eval(scriptContent);
        } else {
            alert("The file blur.jsx was not found.");
        }
    } catch (err) {
        alert("Error executing the blur script: " + err.toString());
    }
}

// Creation of the user interface window as a dockable panel
var myPanel = (this instanceof Panel) ? this : new Window("panel", "SLIDEMAKER v4.1", undefined);
myPanel.orientation = "column";

// Creation of buttons
var normalButton = myPanel.add("button", undefined, "NORMAL SLIDE");
var blurButton = myPanel.add("button", undefined, "SLIDE WITH BLUR");

// Creation of the version label
var versionLabel = myPanel.add("statictext", undefined, "Made for lazy people");
versionLabel.alignment = "center"; // Center the label under the buttons

// Association of buttons with functions
normalButton.onClick = runNormalSlide;
blurButton.onClick = runBlurSlide;

// Show the window
if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
} else {
    myPanel.layout.layout(true);
}