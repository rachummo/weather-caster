// GIFs of all castform's forms
var castformForms = {
   sunny:'https://www.professorlotus.com/Sprites/Castform_Sunny.gif',
   rainy:'https://www.professorlotus.com/Sprites/Castform_Rainy.gif',
   cloudy:'https://www.professorlotus.com/Sprites/Castform_Snowy.gif',
   normal:'https://www.professorlotus.com/Sprites/Castform.gif'
};

var cityID = 5327684;
var updateFreq = 1000 * 60 * 15;
var brightFreq = 1000 * 60;
var currWeather = 'dummy';

// Change Castform's form based on the current weather
 function changeCastform(newWeather) {
      // console.log(currWeather, newWeather);
      if (newWeather != currWeather) {
         document.getElementById('curr-castform').src = castformForms[newWeather];
         currWeather = newWeather;
      }
  };

// Gradually change opacity of castform once it's nightime or morning
function changeBrightness(initialBright) {
   if (initialBright == 1) {
      var brightnessFactor = -0.01;
   } else {
      var brightnessFactor = 0.01;
   }
   var currBright = initialBright;
   var interval = setInterval(function () {
      currBright += brightnessFactor;
      document.getElementById('curr-castform').style.filter = "brightness(" + currBright + ")";
      if (currBright <= 0 || currBright >= 1) {
         clearInterval(interval);
      }
   }, brightFreq);
}

// Using API, check the current weather in prep of changing Castform's appearance
async function checkWeather(cityID) {
      var key = 'eb473f77c86ef6f4d94c3605fec1dd3b';
      var apiURL = 'https://api.openweathermap.org/data/2.5/weather?id=';
      
      // API call
      const response = await fetch(apiURL + cityID + '&units=imperial' +   '&appid=' + key);
      
      // API response (indexable dict)
      //console.log(await response.json());
      var data = await response.json();
      var temp = data['main']['temp'];
      console.log("This is the current temp: " + temp + " °F");
      var weatherCondition = data['weather'][0]['main'];
      
      if (weatherCondition == 'Rain' || weatherCondition == 'Drizzle' || weatherCondition =='Thunderstorm') {
         changeCastform('rainy');
      }
      else if (temp > 65) {
         changeCastform('sunny');
      }
      else if (temp < 55) {
         changeCastform('cloudy');
      } else {
         changeCastform('normal')
      }
}

// Sleep functionality
function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

// Check whether it is nightime or morning time
async function checkTime() {
   // Rpi bootup, loads html and script, could be any time
   var currTime = new Date();
   // We want to start dimming at ie. 12 am
   var nightTime = new Date();
   
   nightTime.setDate(nightTime.getDate() + 1);
   nightTime.setHours(0, 0, 0);
   // We want to start raising brightness at ie. 6 am
   var morningTime = new Date();
   morningTime.setDate(morningTime.getDate() + 1);
   morningTime.setHours(6, 0, 0);
      
   // Find number of ms until it's nighttime and morning time
   var untilNight = nightTime - currTime;
   var untilDawn = morningTime - currTime;
      
   // Wait x number of ms to run changeBrightness for the first time (night and morning versions)
   console.log('Waiting ' + untilNight + ' miliseconds until 12 AM');
   await sleep(untilNight);
   changeBrightness(1);
   // Run changeBrightnesss at night every 24 hrs
   setInterval(changeBrightness, 1000 * 60 * 60 * 24, 1);
   
   console.log('Waiting ' + untilDawn + ' miliseconds until 6 AM');
   await sleep(untilDawn);
   changeBrightness(0);
   // Run changeBrightnesss at morning every 24 hrs
   setInterval(changeBrightness, 1000 * 60 * 60 * 24, 0);
}

// On bootup, run functions
window.onload = () => {
   console.log("hello");
   checkWeather(cityID);
   setInterval(checkWeather, updateFreq, cityID);
   checkTime();
}
