const cityInput = document.querySelector("#cityInput");

const searchButton = document.querySelector("#searchBtn");

const locationButton = document.querySelector("#location-btn");

const currentWeatherDiv = document.querySelector("#Current-weather");

const weatherCardsDiv = document.querySelector("#weather-cards");

const API_KEY = "a83d431217c3fc0797f761884720b1b1"; // Your API key



const createWeatherCard = (cityName, weatherItem, index) => {
    const icon = weatherItem.weather[0].icon;
    if (index === 0) { // HTML for Main Weather Card
        return ` 
            <div id="details">
                <h2 class="text-[1.7rem]">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4 class="mt-3 text-[1rem] font-medium">Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
                <h4 class="mt-3 text-[1rem] font-medium">wind: ${weatherItem.wind.speed} M/S</h4>
                <h4 class="mt-3 text-[1rem] font-medium">Humidity:  ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="text-center">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="Weather-icon" class="max-w-[120px] -mt-[15px]" />
                <h4 class="-mt-[10px] capitalize">${weatherItem.weather[0].description}</h4>
            </div>
        `;
    } else {
        const date = weatherItem.dt_txt.split(" ")[0];
        const temp = (weatherItem.main.temp - 273.15).toFixed(2);
        return `
            <li class="list-none text-white p-[18px] rounded bg-gray-600 w-full sm:w-[calc(100%/2-10px)] md:w-[calc(100%/3-15px)] lg:w-[calc(100%/4-15px)] xl:w-[calc(100%/5)]">
                <h3>${date}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather-icon" class="max-w-[70px] my-[5px] -mb-[12px]" />
                <h4 class="mt-3 text-[1rem] font-medium">Temp: ${temp}°C</h4>
                <h4 class="mt-3 text-[1rem] font-medium">Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4 class="mt-3 text-[1rem] font-medium">Humidity: ${weatherItem.main.humidity}%</h4>
            </li>
        `;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) throw new Error("Weather API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch((err) => {
            console.error(err);
            alert("An error occurred while fetching the Weather Forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) throw new Error("Geocoding API error: " + res.status);
            return res.json();
        })
        .then(data => {
            if (!data.length) return alert(`No Coordinates Found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch((err) => {
            console.error(err);
            alert("An error occurred while fetching the coordinates!");
        });
    };


const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position =>{
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

        fetch(REVERSE_GEOCODING_URL)
        .then(res => {
            if (!res.ok) throw new Error("Geocoding API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const { name} = data[0];
            getWeatherDetails(name, latitude, longitude);
        })
        .catch((err) => {
            console.error(err);
            alert("An error occurred while fetching the City!");
        });
            
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation Request Denied. Please reset location.")
            }
        }
    );

}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());