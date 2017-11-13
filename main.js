const AWS = require('aws-sdk')
const request = require('request-promise')
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
    thingName: `weather_${k}`,
    payload: JSON.stringify({
      state: {
        desired: response[k]
      }
    })
  }, (err, result) => {
    if (err)
      return reject(err)
    resolve(result)
  })
)

const get_weather = () => request(`https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${LAT},${LON}?exclude=flags&units=uk2`)
  .then(JSON.parse)
  .then(response => {
    response.hourly.data = response.hourly.data.slice(0, 24)
    return response
  })

exports.handler = handler