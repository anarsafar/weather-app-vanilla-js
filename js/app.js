const showSearchSectionBtn = document.querySelector("#searchBtn");
const searchSection = document.querySelector(".search");
const closeSearchSectionBtn = document.querySelector(".close-btn");
const inputBar = document.querySelector("#searchBox");
const submitBtn = document.querySelector("#submit-btn");
const citiesDiv = document.querySelector(".cities");
const weatherIcon = document.querySelector("#weather-icon");
const mainDegree = document.querySelector(".degree");
const foreCastText = document.querySelector(".forecast-text");
const locationName = document.querySelector(".locationName");
const todayDate = document.querySelector(".date");
const myLocation = document.querySelector(".myLocation");
const wind = document.querySelector(".wind-value");
const windDirection = document.querySelector(".direction");
const visibility = document.querySelector(".vis-value");
const airPressure = document.querySelector(".pressure-value");
const humidity = document.querySelector(".humid-value");
const myBar = document.querySelector("#myBar");
const celsius = document.querySelector(".c");
const fahrenheit = document.querySelector(".f");
const degreeIcon = document.querySelectorAll(".degree-icon");
const minTemp = document.querySelectorAll(".min-value");
const maxTemp = document.querySelectorAll(".max-value");

const currentLocation = {
  latitude: null,
  longitude: null,
};

//get user location by using geolocation API
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition, errorCallback);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// if user denies location then display location of Los Angeles
const errorCallback = (error) => {
  if (error.code == error.PERMISSION_DENIED) {
    getWeather(2442047);
  }
};

//update currentLocation
function getPosition(position) {
  currentLocation.latitude = position.coords.latitude;
  currentLocation.longitude = position.coords.longitude;
  getWoeIdByLocation(currentLocation);
}

//ask location onload
window.onload = () => getLocation();

//show and hide left search column
showSearchSectionBtn.addEventListener("click", () => {
  searchSection.classList.add("show");
});

closeSearchSectionBtn.addEventListener("click", () => {
  searchSection.classList.remove("show");
});

//get where on earth ID for the city
const getWoeID = async (city) => {
  const response = await fetch(
    `https://www.metaweather.com/api/location/search/?query=${city}`
  );
  const cities = await response.json();
  displayCities(cities);
};

// get city names and woeid by input value
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let value = inputBar.value;
  if (value) {
    reset();
    getWoeID(value);
  }
});

// iterate response to display cities
const displayCities = (cities) => {
  let length = cities.length >= 8 ? 8 : cities.length;
  for (let i = 0; i < length; i++) {
    citiesDiv.innerHTML += `
        <div class="city" woeid="${cities[i].woeid}">
            <span>${cities[i].title}</span>
            <span><i class="fas fa-chevron-right"></i></span>
        </div>`;
  }

  //add click event to each city element for get forecast info
  citiesDiv.childNodes.forEach((child) => {
    child.addEventListener(
      "click",
      (click = (e) => {
        let woeid = child.getAttribute("woeid");
        getWeather(woeid);
      })
    );
  });
};

//get weather by woeid
const getWeather = async (woeid) => {
  const response = await fetch(
    `https://www.metaweather.com/api/location/${woeid}/`
  );
  const data = await response.json();
  if (fahrenheit.classList.contains("active")) {
    celsiusToFahrenheit();
  }
  displayDetailedInfo(data);
  inputBar.value = "";
};

//reset event listener and main div
const reset = () => {
  citiesDiv.childNodes.forEach((child) => {
    child.removeEventListener("click", click);
  });
  citiesDiv.innerHTML = "";
};

//update UI based on data from API
const displayDetailedInfo = (data) => {
  const icons = document.querySelectorAll(".icon");

  searchSection.classList.remove("show");
  let todayWeather = data.consolidated_weather[0];
  let icon = todayWeather.weather_state_abbr;
  weatherIcon.src = `https://www.metaweather.com/static/img/weather/${icon}.svg`;
  mainDegree.innerText = todayWeather.the_temp.toFixed();
  foreCastText.innerHTML = todayWeather.weather_state_name;
  locationName.innerText = data.title;
  displayDate(data);
  icons.forEach((icon, index) => {
    icon.src = `https://www.metaweather.com/static/img/weather/${
      data.consolidated_weather[index + 1].weather_state_abbr
    }.svg`;
  });
  maxTemp.forEach(
    (max, index) =>
      (max.innerHTML = data.consolidated_weather[index + 1].max_temp.toFixed())
  );
  minTemp.forEach(
    (min, index) =>
      (min.innerHTML = data.consolidated_weather[index + 1].min_temp.toFixed())
  );
  wind.innerHTML = todayWeather.wind_speed.toFixed();
  windDirection.innerHTML = todayWeather.wind_direction_compass;
  let vis = todayWeather.visibility.toFixed(1);
  vis.split(".")[1] == 0
    ? (visibility.innerHTML = todayWeather.visibility.toFixed())
    : (visibility.innerHTML = vis);
  airPressure.innerHTML = todayWeather.air_pressure.toFixed();
  humidity.innerHTML = todayWeather.humidity;
  move(todayWeather.humidity);
};

// display date on left and right side
const displayDate = () => {
  const foreCastDay = document.querySelectorAll(".forecast-day");
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  foreCastDay.forEach((forecast, index) => {
    let getDate = new Date();
    getDate.setDate(getDate.getDate() + index + 1);
    let month = getDate.getMonth();
    let dayOfWeek = getDate.getDay();
    let dayOfMonth = getDate.getDate();
    if (index === 0) {
      forecast.innerHTML = "Tomorrow";
    } else {
      forecast.innerHTML = `${days[dayOfWeek]}, ${dayOfMonth} ${months[month]}`;
    }
    todayDate.innerHTML = `${days[dayOfWeek]}, ${dayOfMonth} ${months[month]}`;
  });
};

//update humidity progress bar
function move(humidity) {
  var i = 0;
  if (i == 0) {
    i = 1;
    var width = 0;
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= humidity) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        myBar.style.width = width + "%";
      }
    }
  }
}

celsius.addEventListener(
  "click",
  (celsiusToFahrenheit = () => {
    if (!celsius.classList.contains("active")) {
      mainDegree.innerHTML = ((mainDegree.innerHTML - 32) * (5 / 9)).toFixed();
      minTemp.forEach((min) => {
        min.innerHTML = ((min.innerHTML - 32) * (5 / 9)).toFixed();
      });
      maxTemp.forEach((max) => {
        max.innerHTML = ((max.innerHTML - 32) * (5 / 9)).toFixed();
      });
    }
    celsius.classList.add("active");
    fahrenheit.classList.remove("active");
    degreeIcon.forEach((icon) => (icon.innerHTML = "&deg;C"));
  })
);

fahrenheit.addEventListener("click", () => {
  if (!fahrenheit.classList.contains("active")) {
    mainDegree.innerHTML = (mainDegree.innerHTML * (9 / 5) + 32).toFixed();
    minTemp.forEach((min) => {
      min.innerHTML = (min.innerHTML * (9 / 5) + 32).toFixed();
    });
    maxTemp.forEach((max) => {
      max.innerHTML = (max.innerHTML * (9 / 5) + 32).toFixed();
    });
  }
  fahrenheit.classList.add("active");
  celsius.classList.remove("active");
  degreeIcon.forEach((icon) => (icon.innerHTML = "&deg;F"));
});

//get current location
myLocation.addEventListener("click", () => {
  if (currentLocation.longitude === null) {
    getWeather(2442047);
  } else {
    getWoeIdByLocation(currentLocation);
  }
});

const getWoeIdByLocation = async ({ latitude, longitude }) => {
  const response = await fetch(
    `https://www.metaweather.com/api/location/search/?lattlong=${latitude},${longitude}`
  );
  const data = await response.json();
  const currentWoeId = data[0].woeid;
  getWeather(currentWoeId);
};
