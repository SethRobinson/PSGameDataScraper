
function ExtractDataFromNode(count, node)
{
	
	var gameItem = {};
	
  kids = node.children;
  
  //console.log("node "+count+" with "+kids.length+" kids");
	for (var i=0; i < kids.length; i++)
	{
		if (kids[i].className.includes("__title"))
	{
		 gameItem.title = kids[i].textContent.trim();
	}
			
		//ignore things that end with " Demo"
	if (kids[i].textContent.trim().endsWith(" "+locale.demo))
	{
		//It's a demo, ignore
	   return null;
	}
	
	if (kids[i].textContent.trim().endsWith(" "+locale.costume))
	{
	   return null;
	}

		if (kids[i].className.includes("__details"))
		{
			var stuff = kids[i].textContent.split("|");
		 
		  if (stuff[0].trim() != locale.game)
		  {
		  	//umm.. it's probably a demo or addon, ignore this
		   return null;
	  	}
		 
			//PS only says "Game" or "App", seems pretty useless
			//gameItem.Description = stuff[0].trim();
  		 
  		gameItem.Size = stuff[1].trim();
  		gameItem.PurchaseDate = stuff[2].split("\n")[0].trim();
    
		  if (stuff[2].includes(locale.playable))
		  {
		  	consoles = stuff[2].split(locale.playable + "\n")[1].trim();
		  } else
		  {
		   	consoles = stuff[3].split(locale.playable + "\n")[1].trim();
		  }

		  consoles = consoles.split("\n");
			gameItem.Platforms = []; 
   
		  for (var i =0; i < consoles.length; i++)
		  {
		  	gameItem.Platforms.push(consoles[i].trim());
		  }
		  
		  //Oh, let's grab the product ID
		  downloadURL = node.innerHTML.trim().split('"')[1].trim();
		  gameItem.productID = downloadURL.substring(downloadURL.lastIndexOf('/')+1, downloadURL.length);
		}

	 	//console.log("node "+count+" kid "+i+" is of class "+kids[i].className+".  Text is"+kids[i].textContent);
	  }

	return gameItem;
}

function ExtractGameDataFromPage()
{
	
	var x = document.getElementsByClassName("download-list-item__left-product-info");

  processedCount = 0;
 
	for (var i=0; i < x.length; i++)
	{
		result = ExtractDataFromNode(i, x[i]);
	  if (result != null)
	  {
	  	window.jsonObject.games.push(result);
	  	processedCount += 1;
	  } else
	  {
	  	//console.warning("Error finding game data in node");	
	 	}
	}
 
 return processedCount;
}

function GetGames()
{
	
	finalGameCount = 0;
	pagesProcessed = 0;
	
	window.jsonObject= {};
  window.jsonObject.games=[];

  // Locale detection
  var locales = [
	{
		lang: "en-us",
		demo: "Demo",
		costume: "Costume",
		game: "Game",
		playable: "Playable On:"
	},
	{
		lang: "ru-ru",
		demo: "Демоверсия",
		costume: "Аватар",
		game: "Игра",
		playable: "Совместимые системы:"
	}
	// add more?
]

locale = null;

for (var i = 0; i < locales.length; i++) {
	if (window.location.href.includes(locales[i].lang)) {
		locale = locales[i];
		break;
	}
}

if (locale == null) {
	alert("Couldn't figure out locale, aborting.");
	return;
}
// If control isn't found, pop-up closes and we don't get to see the results, even if they're generated.
// Therefore, screw this thing.
/*
		startButton = document.getElementsByClassName('paginator-control__beginning paginator-control__arrow-navigation');
	  if (startButton != null && startButton.length > 0)
	  {
	  	startButton[0].click();
	  } else
	 	{
	     alert("It looks like you aren't on the right page ( https://store.playstation.com/en-us/download/list ) or you aren't logged on.  Or the HTML changed and this doesn't work anymore.");		
		 }
		 */
	
	do 
	{
		nextButtonElements = document.getElementsByClassName('paginator-control__next paginator-control__arrow-navigation');
	 
	  pagesProcessed += 1;
	  finalGameCount += ExtractGameDataFromPage();
		
		if (pagesProcessed > 100)
		{
			console.log("Uhhh.. more than 100 pages?  We're probably in an endless loop caused by Sony changing the html.  Giving up.");
			break;
		}
	
		if (nextButtonElements.length > 0 && !nextButtonElements[0].className.includes("--disabled"))
		{ 
		  nextButtonElements[0].click();	
		} else
		{
	  	console.log("Next button is missing, guess we're done");
			break;
		}
	   
	} while (1);

//console.log(JSON.stringify(window.jsonObject, null, 2));

chrome.runtime.sendMessage("STATUS: "+"Found data for "+finalGameCount+" games.");
chrome.runtime.sendMessage(JSON.stringify(window.jsonObject, null, 2));

}

