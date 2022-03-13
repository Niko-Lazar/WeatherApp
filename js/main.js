/* 
*
*   Author: Lazar Nikolic
*   Project Name: Weather app
*   Created: 19/10/2021
*   Desc: Weather app with integrated
*   License: MIT
*
*/


window.addEventListener('load', function() {
    (function init() {
        console.log('locked \'n loaded!');

        const config = {
            api: 'https://www.metaweather.com/api/location/',
            units: 'celsius',
            cityID: '44418',
            tempData: null
        }

        const dom = {
            searchForPlacesBtn: document.getElementById('search_btn'),
            modalEl: document.getElementById('search_modal'),
            closeBtn: document.getElementById('close_btn'),
            gpsBtn: document.getElementById('gps'),
            searchBtn: document.getElementById('search'),
            inputSearch: document.getElementById('search_input'),
            resultsList: document.getElementById('city_list'),
            // weather elements
            currentIcon: document.getElementById('current_w_icon'),
            currentTemp: document.getElementById('current_w_temp'),
            currentTypeName: document.getElementById('current_w_type'),
            currentDate: document.getElementById('current_w_date'),
            currentLocation: document.getElementById('current_w_location'),
            tempSymbol: document.getElementById('temp_symbol'),
            // current hightlights
            windSpeed: document.getElementById('wind_speed'),
            windDirection: document.getElementById('wind_direction'),
            windCompass: document.getElementById('wind_compass'),
            humidity: document.getElementById('humidity'),
            humidityPercentage: document.getElementById('humidity_percentage'),
            visibility: document.getElementById('visibility'),
            airPressure: document.getElementById('air_pressure'),
            // days list
            days: document.getElementById('days'),
            // unit change
            unitBtn: document.querySelectorAll('button.icon-btn')
        }

        // set date
        dom.currentDate.innerText = moment().format("ddd, D MMM");

        // sets all events
        setEventListeners();

        onFetchData(config.cityID);
        onSearch('San');

        // ================ EVENTS ========================= //
        function setEventListeners() {
            // open modal
            dom.searchForPlacesBtn.addEventListener('click', openSearchModal);
            // close modal
            dom.closeBtn.addEventListener('click', closeSearchModal);
            // active gps
            dom.gpsBtn.addEventListener('click', getGeoLocation);
            // on search in modal
            dom.searchBtn.addEventListener('click', getSearchResults);
            // on inputer enter
            dom.inputSearch.addEventListener('keypress', getSearchResults)
            // unit change
            dom.unitBtn.forEach(btn => btn.addEventListener('click', changingUnits));
        }

            // ================ HELPERS ========================= //
            // unit change
            function changingUnits(event) {
                const target = event.target;
                const allTempSymbols = document.querySelectorAll('.temp_symbol');
                // sets active class for button elemennt
                dom.unitBtn.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');

                // sets the unit
                config.units = target.dataset.units;

                printResults(config.tempData);
            }

            // opens modal
            function openSearchModal() {
                dom.modalEl.style.display = 'block';
                dom.modalEl.classList.remove('animate__slideOutLeft');
                dom.modalEl.classList.add('animate__slideInLeft');
            }

            // closes modal
            function closeSearchModal() {
                dom.modalEl.classList.remove('animate__slideInLeft');
                dom.modalEl.classList.add('animate__slideOutLeft');
            }
            // Get geolocation
            function getGeoLocation() {
                if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(fetchGeoLocation);
                } else {
                    alert("your browser doesn't support geolocation")
                }
            }
            // geolocation
            function fetchGeoLocation(position) {
                openSearchModal();
                const lat = position.coords.latitude;
                const long = position.coords.longitude;

                onSearch(`${lat},${long}`, 'lattlong');
            }

            // fetching main data 4-5days              
            function onFetchData(cityId) {
                config.cityID = cityId;
                fetch(`${config.api}${cityId}`)
                    .then(response => response.json())
                    .then(data => {
                        printResults(data);
                        config.tempData = data;
                    });
            }

            function onSearch(query, type = 'query') {
                fetch(`${config.api}search/?${type}=${query}`)
                    .then(response => response.json())
                    .then(data => printSearchResults(data));
            }

            function getSearchResults(event = null) {
                const inputValue = dom.inputSearch.value;
                if(event.keyCode == 13 || event.type === 'click') {
                    onSearch(inputValue);
                }
            }

            function onSelected(event) {
                const woeid = event.target.getAttribute('data-woeid');
                
                onFetchData(woeid);
                closeSearchModal();
            }

            // display data on search
            function printSearchResults(results) {

                dom.resultsList.innerHTML = '';

                for(let result of results) {
                    const li = document.createElement('LI');
                    li.innerText = result.title;
                    li.setAttribute('data-woeid', result.woeid);
                    li.addEventListener('click', onSelected);
                    dom.resultsList.appendChild(li);
                }
            }

            // displays all data of weather
            function printResults(data) {
                displayCurrentWeather(data);
                displayHightlights(data.consolidated_weather[0]);
                displayDailyCards(data.consolidated_weather);
            }
        
            // Current weather
            function displayCurrentWeather(data) {
                const weatherData = data.consolidated_weather[0];
                const weatherIconName = weatherData.weather_state_name.replace(/\s/g, '');
                dom.currentIcon.setAttribute('src', `../img/${weatherIconName}.png`);
                // temp
                dom.currentTemp.innerText = convertNumber(parseInt(weatherData.the_temp));
                dom.currentTypeName.innerText = weatherData.weather_state_name;
                dom.currentLocation.innerText = data.title;
                dom.tempSymbol.innerHTML = displayUnit();
            }

            function displayHightlights(data) {
                // winds
                dom.windSpeed.innerText = parseInt(data.wind_speed);
                dom.windDirection.style.transform = `rotate(${data.wind_direction}deg)`;
                dom.windCompass.innerText = data.wind_direction_compass;
                // humidity
                dom.humidity.innerText = data.humidity;
                dom.humidityPercentage.style.width = `${data.humidity}%`;
                // visibility
                dom.visibility.innerText = parseInt(data.visibility);
                // air pressure
                dom.airPressure.innerText = data.air_pressure;
            }

            function displayDailyCards(data) {
                const dailyData = [...data];
                dailyData.splice(0, 1);
                dom.days.innerHTML = '';

                dailyData.forEach((daily, index) => {

                    const weatherIconName = daily.weather_state_name.replace(/\s/g, '');
                    const template = `<div class="card">
                    <div class="title">${index === 0 ? 'Tomorrow' : moment(daily.applicable_date).format("ddd, D MMM")}</div>
                    <div class="icon">
                        <img id="" src="./img/${weatherIconName}.png" alt="">
                    </div>
                    <div class="temps">
                        <div class="max">${parseInt(convertNumber(daily.max_temp))}<span class="temp_symbol">${displayUnit()}</span></div>
                        <div class="min">${parseInt(convertNumber(daily.min_temp))}<span class="temp_symbol">${displayUnit()}</span></div>
                    </div>
                    </div>`;
                    // nalepimo template na stranicu
                    dom.days.insertAdjacentHTML('beforeend', template);
                });
            }

            // funkcija za konverziju
            function convertNumber(number) {
                if(config.units === 'celsius') {
                    return number;
                }
                return number * 9 / 5 + 32;
            }

            function displayUnit() {
                if(config.units === 'celsius') {
                    return '&#176;C';
                } else {
                    return '&#176;F';
                }
            }


    })();
});