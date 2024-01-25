$(document).ready(function () {

    // making required variables

    //API KEY for getting weather data
    const Weather_KEY = '',
        //API KEY for getting the picture of the location searched
        Picture_Client_ID = '',
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    // getting required elements
        parent = $(".parent"),
        location = $("header h1"),
        country = $("header h2"),
        time = $(".date_time .time"),
        day_date = $(".date_time .date"),
        temperature = $(".temperature_conditions p").first(),
        humidity = $(".temperature_conditions li:eq(0) p"),
        wind_velocity = $(".temperature_conditions li:eq(1) p"),
        atm_pressure = $(".temperature_conditions li:eq(2) p"),

        condition = $(".weather_blob"),
        record_slider = $(".record_slider");

    //showing messages
    const showMessage = (msg, shouldDisappear = true) => {
        let message = $("#message");
        message.html(`<p class='p-0 m-0'>${msg}</p>`).removeClass('inactive');
        if(shouldDisappear){
            setTimeout(() => {
                message.html("").addClass('inactive');
            }, 4000);
        }
    }

    //for checkign if the user is online ?
    const isOnline = () => {
        if(!navigator.onLine){
            return false;
        }
        return true;
    }

    //making new date
    const makeDate = (date) => {
        return new Date(date);
    }

    //clicking on search icon
    $(".search_icon").on('click', function () {
        $(this).siblings('form').toggleClass('inactive');
    });

    //sliding weather records
    $(".navigation li:eq(0) a").click((e) => {
        e.preventDefault();
        $(e.target).addClass('active');
        $(e.target).parent().siblings('li').children('a').removeClass('active');
        record_slider.css('right', '0');
    });
    $(".navigation li:eq(1) a").click((e) => {
        e.preventDefault();
        $(e.target).addClass('active');
        $(e.target).parent().siblings('li').children('a').removeClass('active');
        record_slider.css('right', '100%');
    });

    // submitting the search form
    $("form").on('submit', function (e) {
        e.preventDefault();
        let val = $(this).children('input').val().trim();
        getWeatherData(val);  //getting weaher data of the searched location
        $(this).trigger('reset'); //erasing the search form value
    });

    //getting the location picture
    const getLocationPic = (whichLocation) => {
        fetch(`https://api.unsplash.com/search/photos?page=1&per_page=1&query=${whichLocation}&client_id=${Picture_Client_ID}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // setting the location picture as backgroud
                // parent.css('background-image', `url(https://source.unsplash.com/${data.results[0].id}),linear-gradient(rgb(255, 255, 255), rgb(148, 148, 148))`);
                parent.css('background-image', `url(https://source.unsplash.com/${data.results[0].id})`);
            });
    }

    //putting the fetched weather data in fields
    const putData = (data) => {
        let date_time = (data.current.last_updated).split(" ");
        let dateComp = makeDate(date_time[0]);

        let day = days[dateComp.getDay()];
        let date = dateComp.getDate();
        let month = months[dateComp.getMonth()];
        let year = dateComp.getFullYear();

        location.html(data.location.name + "," + data.location.region);
        country.html((data.location.country).toUpperCase());
        time.html(date_time[1]);
        day_date.html(`<span>${day}</span>-<span>${date} ${month},${year}</span>`)
        temperature.html(`${data.current.temp_c}&deg;`);
        humidity.html(`${data.current.humidity}%`);
        wind_velocity.html(`${data.current.wind_kph} km/h`);
        atm_pressure.html(`${data.current.pressure_in} In`);
        condition.html(`<img src='${data.current.condition.icon}' /><h3 class='text-center'>${data.current.condition.text}</h3>`);

        let current_record = $(".current_record ul");
        let forecast_record = $(".forecast_record ul");
        forecast_record.html("");
        current_record.html("");

        //putting hourly forecast data
        for (let item of data.forecast.forecastday[0].hour) {
            current_record.append(`<li class="d-flex justify-content-between align-items-center">
                                    <h4 class="m-0 p-0">${(item.time).split(" ")[1]}</h4> 
                                    <p class="m-0 p-0">${item.temp_c}&deg;C</p>
                                </li>`);
        }

        //putting forecast data of next ten days
        for (let item of data.forecast.forecastday) {
            let forecast_date = makeDate(item.date);
            let forecast_temp = item.day.avgtemp_c;
            let forecast_day = days[forecast_date.getDay()];
            let forecast_condition = item.day.condition.text;
            let forecast_icon = item.day.condition.icon;

            forecast_record.append(`<li class="d-flex justify-content-between align-items-center">
                                    <h4 class="m-0 p-0">${forecast_day}</h4> 
                                    <div class="forecast_condition d-flex justify-content-around align-items-center">
                                        <img src="${forecast_icon}" alt="${forecast_condition}">
                                        <p class="m-0 p-0">${forecast_condition}, ${forecast_temp}&deg;C</p>
                                    </div>
                                </li>`);

        }

        //getting location picture and setting as background
        getLocationPic(data.location.region);
    }

    //loading weather data
    const getWeatherData = (...parametres) => {
        fetch(`http://api.weatherapi.com/v1/forecast.json?key=${Weather_KEY}&q=${parametres.toString()}&days=7`)
            .then(response => {
                if (response.status == 200) {
                    return response.json();
                } else {
                    return ({ error: response.status, message: "Location not found!" });
                }
            })
            .then(data => {
                if (data.hasOwnProperty('error')) {
                    showMessage(data.message);
                } else {
                    putData(data);
                }
            })
            .catch(error => {
                showMessage(error);
            });
    }

    //loading initial weather data (will belong to the user's current location)
    const laodInitialData = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (e) {
                const latitude = e.coords.latitude;
                const longitude = e.coords.longitude;
                getWeatherData(latitude, longitude);
            });
        }
    }

    //checking if the user is online ?
    if(isOnline()){
        parent.removeClass('inactive');
        laodInitialData();
    }else{
        parent.addClass('inactive');
        showMessage('You are offline!', false);
    }

});
