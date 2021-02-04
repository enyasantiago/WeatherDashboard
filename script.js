// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
const city_search_form = $("#city-form");
const city_search_input = $("#city-name");
const city_search_history = $("#city-list");
const uvi_index = $("#uvi_index");
const current_temp = $("#current_temp");
let searchHistory = getSearchHistory();

displaySearchHistory();
// .on("click") function associated with the Search Button
city_search_form.on("submit", searchFormSubmit);

function getSearchHistory() {
  return JSON.parse(localStorage.getItem("searchHistory")) || [];
}
function setSearchHistory(newSearchHistory) {
  localStorage.setItem("searchHistory", JSON.stringify(newSearchHistory));
}

function buildQueryURL(type = "weather") {
  console.log(arguments)
  var baseURL = "https://api.openweathermap.org/data/2.5/";
  baseURL += type;

  const params = {
    units: "imperial",
    appid: "1424a66e027bad341d5f8deb9f817274",
  };

  if(type === "weather" || type === "forecast"){
    params.q = arguments[1]
  }
  else if(type === "uvi"){
    params.lat = arguments[1]
    params.lon = arguments[2]
  }

  baseURL += parseParams(params);

  return baseURL;
}

function parseParams(p) {
  var queryString = [];

  for (const key in p) {
    queryString.push(key + "=" + p[key]);
  }

  return "?" + queryString.join("&");
}
function getWeather(city) {
  // Make the AJAX request to the API - GETs the JSON data at the queryURL.
  // The data then gets passed as an argument to the updatePage function
  $.ajax({
    url: buildQueryURL("weather", city),
    method: "GET",
  }).then(displayWeather);

  $.ajax({
    url: buildQueryURL("forecast", city),
    method: "GET",
  }).then(displayForecast);
}

function displayWeather(response) {
  current_temp.text(response.main.temp);
  
  $.ajax({
    url: buildQueryURL("uvi", response.coord.lat, response.coord.lon),
    method: "GET",
  }).then(displayUVI);
}
function displayForecast(response) {
  console.log(response);
}
function displayUVI(response) {
  if(response.value < 3){
    $("#uvi_index").attr("class","btn btn-success");  
  }
  else if(response.value > 5){
    $("#uvi_index").attr("class","btn btn-danger");

  }
  else {
    $("#uvi_index").attr("class","btn btn-warning");
  }

  uvi_index.text(response.value)
}

function displaySearchHistory() {
  if (!searchHistory.length) return;

  getWeather(searchHistory[0]);

  city_search_history.empty();
  for (const city of searchHistory) {
    const li = $("<li class='list-group-item'>");
    li.text(city);
    li.click(searchElement);
    city_search_history.append(li);
  }
}

function searchElement(event) {
  const city = $(event.target).text();
  updateSearchHistory(city);
}
function searchFormSubmit(event) {
  // This line allows us to take advantage of the HTML "submit" property
  // This way we can hit enter on the keyboard and it registers the search
  // (in addition to clicks). Prevents the page from reloading on form submit.
  event.preventDefault();

  // Build the query URL for the ajax request to the weather API
  const city = city_search_input.val().trim();
  city_search_input.val("");

  updateSearchHistory(city);
}
function updateSearchHistory(city) {
  searchHistory = searchHistory.filter(function (city_in_history) {
    return city_in_history !== city;
  });

  searchHistory.unshift(city);

  setSearchHistory(searchHistory);

  displaySearchHistory();
}

// var cityName = "";
// var cityDate = "";
// var currIcon = "";
// var temp = "";
// var humidity = "";
// var windSpeed = "";
// var lat = "";
// var lon = "";
// var uvIndex = "";
// var weatherConditions = "";
// const currentCityWeather = $("#currentCityWeather");
// const cityDisplay = $('<h3 id="cityDisplay">');
// const currIconDisplay = $(
//   '<img id="currIconDisplay" alt="icon" style="visibility:hidden">'
// );
// const tempDisplay = $('<p id="tempDisplay">');
// const humidityDisplay = $('<p id="humidityDisplay">');
// const windSpeedDisplay = $('<p id="windSpeedDisplay">');
// const uvIndexLabelDisplay = $(`<p id="uvIndexLabelDisplay">`);
// const uvIndexDisplay = $(`<span id="uvIndexDisplay">`);
// //??????????
// uvIndexLabelDisplay.append(uvIndexDisplay);

// currentCityWeather.append(
//   cityDisplay,
//   currIconDisplay,
//   tempDisplay,
//   humidityDisplay,
//   windSpeedDisplay,
//   uvIndexLabelDisplay
// );
//function which diaplays current city weather info
// function updatePage(weatherData) {
//   console.log(weatherData);

//   cityName = weatherData.name;
//   currIcon = weatherData.weather[0].icon;
//   cityDate = weatherData.dt;
//   cityDate = moment().format("MMMM D, YYYY");

//   temp = weatherData.main.temp;
//   humidity = weatherData.main.humidity;
//   windSpeed = weatherData.wind.speed;
//   lat = weatherData.coord.lat;
//   lon = weatherData.coord.lon;

//   //Build UVI API
//   //Make the AJAX request to the API
//   var uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=1424a66e027bad341d5f8deb9f817274`;
//   $.ajax({
//     url: uviURL,
//     method: "GET",
//   }).then(setUvIndex);

//   function setUvIndex(uvData) {
//     uvIndex = uvData.value;
//     if (uvIndex < 3) {
//       //makes background green for favorable
//       weatherConditions = "success";
//     } else if (uvIndex > 5) {
//       //makes background red for severe
//       weatherConditions = "danger";
//     } else {
//       //makes background yellow for moderate
//       weatherConditions = "warning";
//     }
//     currentDisplay(weatherConditions);
//   }
//   currIconURL = `https://openweathermap.org/img/wn/${currIcon}@2x.png`;

//   function currentDisplay() {
//     console.log(weatherConditions);
//     //sett attr class="btn btn-${weatherConditions}"
//     $("#uvIndexDisplay").attr("class", `btn btn-${weatherConditions}`);
//     $("#currIconDisplay").attr("src", currIconURL);
//     $("#currIconDisplay").attr("style", "visibility:visible");

//     //displays current city weather
//     cityDisplay.text(`${cityName} ${cityDate}`);
//     tempDisplay.text(`Temperature ${temp} "&#176F" F`);
//     humidityDisplay.text(`Humidity ${humidity}`);
//     windSpeedDisplay.text(`Wind Speed ${windSpeed}`);
//     uvIndexLabelDisplay.text(`UV Index `);
//     uvIndexDisplay.text(`${uvIndex}`);
//   }
// }
// var fiveDayForecast = $("#fcGroup");
// var fcCard = $(
//   '<div class="card bg-primary bg-gradient" id="fiveDayForecast" style="visibility:hidden">'
// );
// var fcIcon = $('<img id="icon" alt="icon" style="visibility:hidden">');
// var fcBody = $('<div class="card-body" id="fiveDayForecast">');
// var fcDate = $('<p class="card-text id="forecastDate">');
// var fcTemp = $('<p class="card-text id="forecastTemp">');
// var fcHumidity = $('<p id="forecastHumidity">');
// fcBody.append(fcDate, fcIcon, fcTemp, fcHumidity);
// fcCard.append(fcBody);
// fiveDayForecast.append(fcCard);
// //display forecast
// function updateForecast(forecastData) {
//   console.log(forecastData);
//   $("#fiveDayForecast").removeAttr("style");
//   $("#icon").removeAttr("style");
//   for (var i = 0; i < 40; i = i + 8) {
//     forecastDate = forecastData.list[i].dt_txt;
//     forecastIcon = forecastData.list[i].weather[0].icon;
//     forecastTemp = forecastData.list[i].main.temp;
//     forecastHumidity = forecastData.list[i].main.humidity;

//     iconURL = `https://openweathermap.org/img/wn/${forecastIcon}@2x.png`;
//     console.log(iconURL);

//     $("#icon").attr("src", iconURL);
//     fcDate.text(forecastDate);
//     fcTemp.text(`Temp: ${forecastTemp} F`);
//     fcHumidity.text(`Humidity: ${forecastHumidity}`);
//   }
// }
// $("#cityElement").on("click", function (event) {
//   var savedCityName = $(this).val();
//   console.log("test");
//   buildQueryURL(savedCityName);
// });
