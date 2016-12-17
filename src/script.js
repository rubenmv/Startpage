function onSearch(event) {
	var searchText = document.getElementById("search-box").value;
	var strSearch = "https://encrypted.google.com/search?q=" + searchText;
	window.location.href = strSearch;
}
function onSettings(event) {
	var parent = document.getElementById("settings"),
		controls = document.getElementById("settings-controls");
	if (controls.style.display === "none") {
		controls.style.display = "inline-block";
		parent.style.backgroundColor = "#111";
	}
	else {
		controls.style.display = "none";
		parent.style.backgroundColor = "inherit";
	}
}
window.onload = function (event) {
	document.getElementById("search-button").addEventListener('click', onSearch);
	document.getElementById("settings-button").addEventListener('click', onSettings);
	document.getElementById("settings-controls").style.display = "none";
}
