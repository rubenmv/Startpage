function onSearch(e){var t=document.getElementById("search-box").value,n="https://encrypted.google.com/search?q="+t;window.location.href=n}function onSettings(e){var t=document.getElementById("settings"),n=document.getElementById("settings-controls");"none"===n.style.display?(n.style.display="inline-block",t.style.backgroundColor="#111"):(n.style.display="none",t.style.backgroundColor="inherit")}window.onload=function(e){document.getElementById("search-button").addEventListener("click",onSearch),document.getElementById("settings-button").addEventListener("click",onSettings),document.getElementById("settings-controls").style.display="none"};