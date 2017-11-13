#darksky iot lambda poller

[![Greenkeeper badge](https://badges.greenkeeper.io/chrisns/darksky-poller-aws-iot.svg)](https://greenkeeper.io/)
Needs the env vars of `LAT, LON, DARKSKY_API_KEY` made and iot things of `weather_currently`, `weather_minutely`, `weather_hourly`, `weather_daily`.
It will periodically run and update a thing shadow with the current weather.
