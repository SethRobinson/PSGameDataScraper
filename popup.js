// Inject the payload.js script into the current tab after the popout has loaded
window.addEventListener('load', function (evt) 
{
	chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, 
	{
		file: 'payload.js'
	});;
});



document.addEventListener('DOMContentLoaded', function() 
{
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function()
   {

    chrome.tabs.getSelected(null, function(tab)
     {
 
      chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, 
	{
		code: 'GetGames();'
	});;
    });
  }, false);
}, false);


// Listen to messages from the payload.js script and write to popout.html
chrome.runtime.onMessage.addListener(function (message)
 {
 	
 	if (message.startsWith("STATUS:"))
 	{
 		alert(message);
 		
 	} else
 		{
	 var textbox = document.getElementById('gamedata');
	 textbox.textContent = message;

}
});