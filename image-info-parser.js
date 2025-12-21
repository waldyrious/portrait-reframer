// Patterns for hidden categories that should not be shown in the UI
// Loaded from hidden-cats-regex.txt
var hiddenCategoryPatterns = [];

// Load hidden category patterns from file
fetch("hidden-cats-regex.txt")
	.then(function(response) { return response.text(); })
	.then(function(text) {
		var lines = text.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].trim();
			// Skip empty lines and comments
			if (line !== "" && line.charAt(0) !== "#") {
				hiddenCategoryPatterns.push(line);
			}
		}
	});

// Check if a category name matches any hidden category pattern
function isHiddenCategory(categoryName) {
	for (var i = 0; i < hiddenCategoryPatterns.length; i++) {
		var pattern = new RegExp("^" + hiddenCategoryPatterns[i] + "$", "i");
		if (pattern.test(categoryName)) {
			return true;
		}
	}
	return false;
}

// Filter out hidden categories from a list
function filterVisibleCategories(categories) {
	var visible = [];
	for (var i = 0; i < categories.length; i++) {
		if (!isHiddenCategory(categories[i])) {
			visible.push(categories[i]);
		}
	}
	return visible;
}

// Fetch description and categories from file page using imageinfo API
function fetchFileInfo(fileTitle) {
	var descSpan = document.getElementById("file-description");
	var catSpan = document.getElementById("file-categories");
	
	// Show loading state
	descSpan.textContent = "Loading...";
	catSpan.textContent = "Loading...";
	
	// Fetch the file's metadata using imageinfo with extmetadata
	// Docs: https://www.mediawiki.org/wiki/API:Imageinfo
	var infoUrl = "https://commons.wikimedia.org/w/api.php?action=query&titles=" + encodeURIComponent(fileTitle) + "&prop=imageinfo&iiprop=extmetadata&format=json&origin=*";
	
	var infoRequest = new XMLHttpRequest();
	infoRequest.open("GET", infoUrl, true);
	infoRequest.onload = function() {
		if (infoRequest.status === 200) {
			var data = JSON.parse(infoRequest.responseText);
			var pages = data.query.pages;
			var pageId = Object.keys(pages)[0];
			
			if (pages[pageId].imageinfo && pages[pageId].imageinfo[0].extmetadata) {
				var metadata = pages[pageId].imageinfo[0].extmetadata;
				
				// Extract description from ImageDescription field
				// (or ObjectName field for files using the Artwork template)
				var description = "";
				if (metadata.ImageDescription && metadata.ImageDescription.value) {
					description = metadata.ImageDescription.value;
				} else if (metadata.ObjectName && metadata.ObjectName.value) {
					description = metadata.ObjectName.value;
				}
				
				if (description) {
					// Strip HTML tags for plain text display
					description = description.replace(/<[^>]*>/g, "");
					description = description.trim();
					descSpan.textContent = description || "(no description)";
				} else {
					descSpan.textContent = "(no description)";
				}
				
				// Extract categories from Categories field
				if (metadata.Categories && metadata.Categories.value) {
					var categoriesStr = metadata.Categories.value;
					// Categories are pipe-separated in the API response
					var allCategories = categoriesStr.split("|");
					// Filter out hidden categories
					var visibleCategories = filterVisibleCategories(allCategories);
					if (visibleCategories.length > 0) {
						catSpan.textContent = visibleCategories.join(", ");
					} else {
						catSpan.textContent = "(no visible categories)";
					}
				} else {
					catSpan.textContent = "(no categories)";
				}
			} else {
				descSpan.textContent = "(could not load)";
				catSpan.textContent = "(could not load)";
			}
		}
	};
	infoRequest.send();
}
