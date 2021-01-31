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
const inputForm = $("#cityName");

/**
 * pulls information from the form and build the query URL
 * @returns {string} URL for Weather API based on form inputs
 */
function buildQueryURL(city = "Houston", type = "weather") {
  var baseURL = "http://api.openweathermap.org/data/2.5/";
  baseURL += type;

  const params = {
    q: city,
    units: "imperial",
    appid: "1424a66e027bad341d5f8deb9f817274",
  };

  baseURL += parseParams(params);

  return baseURL
}

function parseParams(p) {
  var queryString = [];

  for (const key in p) {
    queryString.push(key + "=" + p[key])
  }

  return '?' + queryString.join("&");
}

// .on("click") function associated with the Search Button
$("#city-form").on("submit", function (event) {
  // This line allows us to take advantage of the HTML "submit" property
  // This way we can hit enter on the keyboard and it registers the search
  // (in addition to clicks). Prevents the page from reloading on form submit.
  event.preventDefault();
  

  // Build the query URL for the ajax request to the weather API
  var city = inputForm.val().trim();
  var queryURL = buildQueryURL(city);
  inputForm.val("");
  var cityList = $('#city-list');
  var cityElement = $(`<button type="button" class="btn btn-outline-secondary" id="cityElement" value = ${city}>`).text(city);
  cityList.append(cityElement);
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (!searchHistory) {
      searchHistory = [];
    }
    else {
      searchHistory [q] = city;
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
      
    
  


  // Make the AJAX request to the API - GETs the JSON data at the queryURL.
  // The data then gets passed as an argument to the updatePage function
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);
});

var cityName = "";
var cityDate = "";
var temp = "";
var humidity = "";
var windSpeed = "";
var lat = "";
var lon = "";
var uvIndex = "";
var weatherConditions = "";
//function which diaplays current city weather info
function updatePage(weatherData) {
  console.log(weatherData);
  
  cityName = weatherData.name;
  cityDate = weatherData.dt;
  cityDate = moment().format("MMMM D, YYYY");
  
  temp = weatherData.main.temp;
  humidity = weatherData.main.humidity;
  windSpeed = weatherData.wind.speed;
  lat = weatherData.coord.lat;
  lon = weatherData.coord.lon;

  
  //Build UVI API
  //Make the AJAX request to the API
  var uviURL = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=1424a66e027bad341d5f8deb9f817274`;
  $.ajax({
    url: uviURL,
    method: "GET",
  }).then(setUvIndex);
  
  function setUvIndex(uvData){
    //console.log (uvData)
    uvIndex = uvData.value;
    if (uvIndex < 3) {
      //makes background green for favorable
      weatherConditions = "success";
    }
    else if (uvIndex > 5){
      //makes background red for severe
      weatherConditions = "danger";
    }
    else {
      //makes background yellow for moderate
      weatherConditions = "warning";
    }
    currentDisplay(weatherConditions);
  }
  function currentDisplay() {
    const currentCityWeather = $('#currentCityWeather');
    const cityDisplay = $('<h3 id="cityDisplay">');
    const tempDisplay = $('<p id="tempDisplay">');
    const humidityDisplay = $('<p id="humidityDisplay">');;
    const windSpeedDisplay = $('<p id="windSpeedDisplay">');
    const uvIndexLabelDisplay = $(`<p id="uvIndexLabelDisplay">`);
    const uvIndexDisplay = $(`<span id="uvIndexDisplay" class="btn btn-${weatherConditions}">`);
  
    currentCityWeather.append(cityDisplay, tempDisplay, humidityDisplay, windSpeedDisplay, uvIndexLabelDisplay, uvIndexDisplay);
  

    cityDisplay.text(`${cityName} ${cityDate}`);
    tempDisplay.text(`Temperature ${temp}`);
    humidityDisplay.text(`Humidity ${humidity}`);
    windSpeedDisplay.text(`Wind Speed ${windSpeed}`);
    uvIndexLabelDisplay.text(`UV Index `);
    uvIndexDisplay.text(`${uvIndex}`);
    //insert if statement for css change in background for UV Index
  }


}
$("#cityElement").on("click", function (event){
  var savedCityName = $(this).val();
  console.log ("test");
  buildQueryURL(savedCityName);
});
