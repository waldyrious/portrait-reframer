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
				if (metadata.ImageDescription && metadata.ImageDescription.value) {
					var description = metadata.ImageDescription.value;
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
					var categories = categoriesStr.split("|");
					if (categories.length > 0 && categories[0] !== "") {
						catSpan.textContent = categories.join(", ");
					} else {
						catSpan.textContent = "(no categories)";
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
