const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
var start_city = '';
var dest_city = '';
var distance_data = '';
var cities_wheather_details = [];

function get_city() {
  return new Promise((resolve, reject) => {
    https.get('https://random-data-api.com/api/address/random_address', (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        data = JSON.parse(data);
        if (start_city == '') {
          start_city = data['state'];
        } else if (dest_city == '') {
          dest_city = data['state'];
        }
        resolve((data));
      });

      resp.on('error', (error) => {
        reject(error);
      });
    });
  });
}

function get_weather(city) {
  return new Promise((resolve, reject) => {
    var base_url = 'http://api.openweathermap.org/data/2.5/weather?q='
    var app_key = '&appid=96f939d4f34813b2dead1dbe9fccea77';
    var weather_full_url = base_url + city + app_key;

    http.get(weather_full_url, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        console.log("-----------------");
        console.log(city);
        data = JSON.parse(data);
        cities_wheather_details.push(data);
        resolve((data));
      });

      resp.on('error', (error) => {
        reject(error);
      });
    });
  });
}

function get_distance(start, dest) {
  return new Promise((resolve, reject) => {
    var base_url = 'https://www.distance24.org/route.json?stops=';
    var full_url = base_url + start + '|' + dest;
    const theURL = url.parse(full_url);
    console.log(theURL.href);

    https.get(theURL.href, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        data = JSON.parse(data);
        console.log(data['stops'][0]['nearByCities']);
        distance_data = data;
        resolve((data));
      });

      resp.on('error', (error) => {
        reject(error);
      });
    });
  });
}

async function makeSyncRequestCity(request) {
  try {
    let http_promise = get_city();
    let response_body = await http_promise;
    console.log(response_body);

  } catch (error) {
    console.log(error);
  }
}

async function makeSyncRequestWeather(request, city) {
  try {
    console.log(request);
    console.log(city);
    let http_promise = get_weather(city);
    let response_body = await http_promise;
    console.log(response_body);
  } catch (error) {
    console.log(error);
  }
}

async function makeSyncRequestDistance(request, start, dest) {
  try {
    let http_promise = get_distance(start, dest);
    let response_body = await http_promise;
    console.log(response_body);
  } catch (error) {
    console.log(error);
  }
}

http.createServer(function(req, res) {
  var q = url.parse(req.url, true);

  if (q.pathname == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("<h4>The application use an API to return two random cities. Then with another API, calculate the distance between the two points and return the nearby cities for each city.Then foreach nearby city, it showthe weather using another API.</h4>");
    res.write("<a href=\"/app\"><input type=\"submit\" value=\"Go to app\"></a>")
    res.end();

  } else if (q.pathname == '/app') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    fs.readFile('./index.html', null, function(error, content) {
      if (error) {
        res.write('File not found !');
      } else {
        res.write(content);
      }
    });

    (async function() {
      await makeSyncRequestCity();
      res.write('<div class="column">The start state is ' + start_city + '</div>');
      res.write("<br>")
      await makeSyncRequestCity();
      res.write('<div class="column">The destination state is ' + dest_city + '</div></div>');
      await makeSyncRequestDistance('', start_city, dest_city);

      res.write(`<p>The distance between ${start_city} and ${dest_city} is ${distance_data['distance']} km.</p>`)
      res.write(`<p>Nearby cities for ${start_city} : </p> <ul>`);
      nearby_cities = distance_data['stops'][0]['nearByCities'];
      for (let i = 0; i < nearby_cities.length; i++) {
        await makeSyncRequestWeather('', nearby_cities[i]['city']);
      }
      for (let i = 0; i < cities_wheather_details.length; i++) {
        //  res.write(cities_wheather_details.weather[0].main);
        res.write(`<li>The weather in ${cities_wheather_details[i].name} is :
                   ${cities_wheather_details[i].weather[0].main}
                   <img src="http://openweathermap.org/img/w/${cities_wheather_details[i].weather[0].icon}.png"</li>`);
      }
      res.end();
    })();

  }
}).listen(port, hostname, function() {
  console.log(`Server running at port http://${hostname}:${port}`);
});
