const city_search_form = $("#city-form");
const city_search_input = $("#city-name");
const city_search_history = $("#city-list");
const current_city = $("#city");
const current_date = $("#current_date");
const current_icon = $("#current_icon");
const current_humidity = $("#current_humidity");
const current_wind_speed = $("#current_wind_speed");
const uvi_index = $("#uvi_index");
const current_temp = $("#current_temp");
const forecast_date = $("#forecast_date");
const forecast_icon = $("#forecast_icon");
const forecast_temp = $("#forecast_temp");
const forecast_humidity = $("#forecast_humidity");
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
  console.log(response);
  var curr_date = response.dt;
  curr_date = moment().format("MMMM D, YYYY");
  current_city.text(`${response.name}`);
  current_date.text(`${curr_date}`);
  current_temp.text(response.main.temp);
  current_humidity.text(response.main.humidity);
  current_wind_speed.text(response.wind.speed);
  var currIcon = (response.weather[0].icon);
  var current_icon_URL = `https://openweathermap.org/img/wn/${currIcon}@2x.png`;
  $("#current_icon").attr("style", "visibility:visible");
  $("#current_icon").attr("src", current_icon_URL);
  $.ajax({
    url: buildQueryURL("uvi", response.coord.lat, response.coord.lon),
    method: "GET",
  }).then(displayUVI);
}
// displays 5 day forecast
function displayForecast(response) {
  console.log(response);
  var forecast_group =$("#forecast_group");
  forecast_group.empty();
//loops through forecast object to find one forecast for each day
  for (var i = 0; i < 40; i = i + 8) {
    var forecast_card = $('<div class="card bg-primary mb-2" id="forecast_card">');
    var forecast_body = $('<div class="card-body" id="forecast_body">');
    var forecast_date = $('<p class="card-text" id="forecast_date">');
    var forecastIcon = (response.list[i].weather[0].icon);
    var forecast_icon_URL = `https://openweathermap.org/img/wn/${forecastIcon}@2x.png`;
    var forecast_icon_img = $(`<img id="forecast_icon" alt="icon" src="${forecast_icon_URL}">`);
    var forecast_temp = $('<p class="card-text" id="forecast_temp">');
    var forecast_humidity = $('<p class="card-text" id="forecast_humidity">');
    forecast_body.append(forecast_date, forecast_icon_img, forecast_temp, forecast_humidity);
    forecast_card.append(forecast_body);
    forecast_group.append(forecast_card);
    console.log (forecast_icon_URL);
    
    var fc_date = moment(response.list[i].dt_txt).format("MM/DD/YYYY");
    forecast_date.text(`${fc_date}`);
    forecast_temp.text(`Temp: ${(response.list[i].main.temp)}`);
    forecast_humidity.text(`Humidity: ${(response.list[i].main.humidity)}`);
    
  }
}
//displays UVI Index with background change to reflect favorable, moderate or severe
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
//empties city-list
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
//checks for saved city matches and removes redundancies
function updateSearchHistory(city) {
  searchHistory = searchHistory.filter(function (city_in_history) {
    return city_in_history !== city;
  });
//pushes the current city to localstorage to the first position in the array
  searchHistory.unshift(city);

  setSearchHistory(searchHistory);

  displaySearchHistory();
}

