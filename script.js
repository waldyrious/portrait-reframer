// Global variables to track state
var images = [];
var currentIndex = 0;

// Category mappings for each option
var imageTypeCategories = {
	"color-photo": "Color portrait photographs",
	"bw-photo": "Black and white portrait photographs",
	"painting": "Portrait paintings",
	"drawing": "Portrait drawings",
	"other": ""
};

var subjectCategories = {
	"man": "Portraits of men",
	"woman": "Portraits of women",
	"boy": "Portraits of boys",
	"girl": "Portraits of girls",
	"other": ""
};

var framingCategories = {
	"extreme-close-up": "Extreme close-up portraits",
	"close-up": "Close-up portraits",
	"shoulder-length": "Portraits at shoulder length",
	"bust-length": "Portraits at bust length",
	"half-length": "Portraits at half length",
	"three-quarter-length": "Portraits at three-quarter length",
	"full-length": "Portraits at full length",
	"other": ""
};

// Fetch images from the Portraits category
// Docs: https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bcategorymembers
var apiUrl = "https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Portraits&cmtype=file&cmprop=title&cmlimit=100&format=json&origin=*";

var request = new XMLHttpRequest();
request.open("GET", apiUrl, true);
request.onload = function() {
	if (request.status === 200) {
		var data = JSON.parse(request.responseText);
		var members = data.query.categorymembers;
		
		// Filter to only image files
		for (var i = 0; i < members.length; i++) {
			var title = members[i].title;
			if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(title)) {
				images.push(title);
			}
		}
		
		// Show first image
		if (images.length > 0) {
			showImage(0);
		}
	}
};
request.send();

// Display the image at the given index
function showImage(index) {
	currentIndex = index;
	var imgTag = document.getElementById("portrait-image");
	var imageTitle = images[currentIndex];
	imgTag.setAttribute("src", "https://commons.wikimedia.org/wiki/Special:FilePath/" + imageTitle + "?width=300");
	
	// Update counter display
	var counter = document.getElementById("image-counter");
	counter.textContent = "Image " + (currentIndex + 1) + " of " + images.length;
	
	// Update file link
	var fileLink = document.getElementById("file-link");
	fileLink.href = "https://commons.wikimedia.org/wiki/" + imageTitle;
	fileLink.textContent = imageTitle.replace("File:", "");
	
	// Reset radio buttons to "other" defaults
	document.getElementById("image-type-other").checked = true;
	document.getElementById("subject-other").checked = true;
	document.getElementById("framing-other").checked = true;
}

// Navigate to previous image
function prevImage() {
	if (currentIndex > 0) {
		showImage(currentIndex - 1);
	}
}

// Skip to next image without saving
function skipImage() {
	if (currentIndex < images.length - 1) {
		showImage(currentIndex + 1);
	}
}

// Save current selection and move to next image
function saveAndNext() {
	// Get selected values
	var imageType = document.querySelector('input[name="image-type"]:checked').value;
	var subject = document.querySelector('input[name="subject"]:checked').value;
	var framing = document.querySelector('input[name="framing"]:checked').value;
	
	// Build list of categories to add
	var categoriesToAdd = [];
	
	if (imageTypeCategories[imageType] !== "") {
		categoriesToAdd.push(imageTypeCategories[imageType]);
	}
	if (subjectCategories[subject] !== "") {
		categoriesToAdd.push(subjectCategories[subject]);
	}
	if (framingCategories[framing] !== "") {
		categoriesToAdd.push(framingCategories[framing]);
	}
	
	// Only generate command if at least one category was selected
	if (categoriesToAdd.length > 0) {
		var fileTitle = images[currentIndex];
		
		// Build QuickCategories command
		// Format: File:Example.jpg|+Category:New category|-Category:Old category
		var command = fileTitle;
		
		for (var i = 0; i < categoriesToAdd.length; i++) {
			command = command + "|+Category:" + categoriesToAdd[i];
		}
		
		// Remove from generic Portraits category
		command = command + "|-Category:Portraits";
		
		// Add to output
		var output = document.getElementById("output");
		output.value = output.value + command + "\n";
	}
	
	// Move to next image
	if (currentIndex < images.length - 1) {
		showImage(currentIndex + 1);
	}
}
