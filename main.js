const AWS = require('aws-sdk')
const {LAT, LON, DARKSKY_API_KEY} = process.env

const handler = (event, context, callback) =>
  get_weather()
    .then(response =>
      Promise.all(['currently', 'minutely', 'hourly', 'daily'].map(k => updateIoT(k, response)))
    )
    .catch(err => callback(err))
    .then(responses => callback(null, responses))

const updateIoT = (which, weather) => new Promise((resolve, reject) =>
  new AWS.IotData({endpoint: process.env.AWS_IOT_ENDPOINT}).updateThingShadow({
    thingName: `weather_${which}`,
    payload: JSON.stringify({
      state: {
        desired: weather[which]
      }
    })
  }, (err, result) => {
    if (err)
      return reject(err)
    resolve(result)
  })
)

const get_weather = () => getContent(`https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${LAT},${LON}?exclude=flags&units=uk2`)
  .then(JSON.parse)
  .then(response => {
    response.hourly.data = response.hourly.data.slice(0, 24)
    return response
  })

const getContent = url => new Promise((resolve, reject) => {
  const lib = url.startsWith('https') ? require('https') : require('http');
  const request = lib.get(url, (response) => {
    // handle http errors
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error('Failed to load page, status code: ' + response.statusCode));
    }
    // temporary data holder
    const body = [];
    // on every content chunk, push it to the data array
    response.on('data', (chunk) => body.push(chunk));
    // we are  done, resolve promise with those joined chunks
    response.on('end', () => resolve(body.join('')));
  });
  // handle connection errors of the request
  request.on('error', (err) => reject(err))
})

exports.handler = handler