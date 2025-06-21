const $castform = $('#curr-castform');

// GIFs of all castform's forms
const castformForms = {
  sunny: ['castform-gifs/castform-3d-sunny.gif', 'castform-gifs/castform-bw2-sunny.gif'],
  rainy: ['castform-gifs/castform-3d-rainy.gif', 'castform-gifs/castform-bw2-rainy.gif'],
  snowy: ['castform-gifs/castform-3d-snowy.gif', 'castform-gifs/castform-bw2-snowy.gif'],
  normal: ['castform-gifs/castform-3d.gif', 'castform-gifs/castform-bw2.gif']
};

// Configuration values
const cityID = 5327455; // Belmont
const updateFreq = 1000 * 60 * 15; // check weather every 15 minutes
const key = 'eb473f77c86ef6f4d94c3605fec1dd3b';
const apiURL = 'https://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&units=imperial' + '&appid=' + key;
var currWeather = 'rainy'; // default weather

// -------------------------------------              CHANGING CASTFORM              -------------------------------------

// Change Castform's form based on the current weather
function changeCastform(newWeather) {
  if (newWeather != currWeather) {
    $castform.attr('src', castformForms[newWeather][Math.random() > 0.4 ? 0 : 1]);
    currWeather = newWeather;
    console.log(`Transformed to ${newWeather} form!`);
  }
}

// Using API, check the current weather in prep of changing Castform's appearance
async function checkWeather() {

  // API call
  const response = await fetch(
    apiURL
  );

  // API response (indexable dict)
  var data = await response.json();
  var temp = data['main']['temp'];
  console.log('This is the current temp: ' + temp + ' °F');
  var weatherCondition = data['weather'][0]['main'];

  if (
    weatherCondition == 'Rain' ||
    weatherCondition == 'Drizzle' ||
    weatherCondition == 'Thunderstorm'
  ) {
    changeCastform('rainy');
  } else if (temp > 65) {
    changeCastform('sunny');
  } else if (temp < 60) {
    changeCastform('snowy');
  } else {
    changeCastform('normal');
  }
}

// -------------------------------------              TIME-BASED BRIGHTNESS SETTING              -------------------------------------

// Schedule everyday dimming and brightening of Castform
function scheduleOpacityChange() {
  // Rpi bootup, loads html and script, could be any time
  var currTime = new Date();

  // Set dim time (10 PM)
  var nightTime = new Date();
  nightTime.setHours(22, 0, 0);
  if (nightTime < currTime) {
    nightTime.setDate(nightTime.getDate() + 1);
  }

  // Set brighten time (5 AM)
  var morningTime = new Date();
  morningTime.setHours(5, 0, 0);
  if (morningTime < currTime) {
    morningTime.setDate(morningTime.getDate() + 1);
  }

// Gradual dimming at night for 1 hr (in ms)
// Schedule for today specifically and then everyday
  setTimeout(() => {
    $castform.fadeTo(1000 * 60 * 60, 0);
    setInterval(() => $castform.fadeTo(1000 * 60 * 60, 0), 86400000);
    }, nightTime - currTime);

// Gradual brightening in morning for 1 (in ms)
  setTimeout(() => {
    $castform.fadeTo(1000 * 60 * 60, 1);
    setInterval(() => $castform.fadeTo(1000 * 60 * 60, 1), 86400000);
  }, morningTime - currTime);

}

// -----------------------------------                STARTUP FUNCTIONS                -----------------------------------
// Note: run checkWeather upon bootup so to not wait for interval delay initially
window.onload = () => {
  console.log("Castform: 'hello!'");
  checkWeather(cityID);
  setInterval(checkWeather, updateFreq);
  scheduleOpacityChange();
};
