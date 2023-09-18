// Docs: https://commons.wikimedia.org/w/api.php?action=help&amp;modules=query%2Bcategorymembers
fetch("https://commons.wikimedia.org/w/api.php?action=query&amp;list=categorymembers&amp;cmtitle=Category:Portraits&amp;cmtype=file&amp;cmprop=title&amp;cmlimit=100&amp;format=json&amp;origin=*")
.then(response => response.json())
.then(data => {
	const images = data.query.categorymembers.filter(member => /\.(jpg|jpeg|png|gif|bmp)$/i.test(member.title));
	var image = images[1];
	var imgTag = document.getElementById("portrait-image");
	imgTag.setAttribute("src", "https://commons.wikimedia.org/wiki/Special:FilePath/" + image.title + "?width=300");
	document.body.appendChild(imgTag);
});

async function submit() {
	// Determine category intersections from selected options
	// TODO

	// Prepare and submit changes
	// TODO

	// Return without doing anything (the code below is a draft)
	return;

	// Get the user's choice from your radio buttons. Assuming they have values "man" or "woman".
	const userChoice = document.querySelector('input[name="gender"]:checked').value;

	// Construct new category based on user choice
	const newCategory = userChoice === 'man' ? 'Category:Photographs_of_men' : 'Category:Photographs_of_women';

	// Page title here (the file you're editing)
	const pageTitle = 'File:Some_image.jpg';

	// CSRF token for editing (probably will need to be changed when OAuth is implemented)
	const token = 'YOUR_CSRF_TOKEN_HERE';

	// First, fetch the current content of the page
	const fetchContentResponse = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${pageTitle}&prop=revisions&rvprop=content&format=json`);
	const fetchContentData = await fetchContentResponse.json();
	let pageContent = fetchContentData.query.pages[Object.keys(fetchContentData.query.pages)[0]].revisions[0]['*'];

	// Remove the generic category
	pageContent = pageContent.replace(/\[\[Category:Portraits\]\]/g, '');

	// Append the new category
	pageContent += `\n[[${newCategory}]]`;

	// Update the page
	const formData = new URLSearchParams({
		'action': 'edit',
		'title': pageTitle,
		'text': pageContent,
		'token': token,
		'format': 'json'
	});
	const editResponse = await fetch('https://commons.wikimedia.org/w/api.php', {
		method: 'POST',
		body: formData,
		headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
		credentials: 'include'
	});

	const editResult = await editResponse.json();

	if (editResult.edit && editResult.edit.result === 'Success') {
		alert("Category updated!");
	} else {
		alert("Failed to update category.");
	}

	// Load next image
	// TODO
}
