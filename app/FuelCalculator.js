const _ = require('lodash');
const UKVehicleParser = require('./UKVehicleParser');

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.FC_GOOGLE_API_KEY,
  Promise: Promise,
});

const _getDirections = async (origin, destination) => await googleMapsClient.directions({
  origin,
  destination,
}).asPromise();

const _getAverageSpeed = (distance, time) => distance/time * 2.237;

const _isJourneyContainsMotorway = (summary) => /[mM]{1}[1234567890]+/.test(summary);

const _getMPG = (car, leg) => {
  const summary = leg.summary;
  if (_isJourneyContainsMotorway(summary)) {
    return car.combined;
  }
  return car.urban;
}

const _getJourneyCost = (mpg, distance, fuelPrice) => {
  const gallons = distance/mpg;
  const pricePerGallon = fuelPrice * 4.54 / 100;
  return gallons * pricePerGallon;
};

const _getFuelUsed = (mpg, distance, capacity) => {
  const gallons = distance/mpg
  const litresUsed = (gallons * 4.54).toFixed(1);
  const tanksUsed = (litresUsed / capacity).toFixed(2);

  return {
    litresUsed,
    tanksUsed,
  }
};

module.exports = async (origin, destination, car) => {
  const response = await _getDirections(origin, destination);
  const leg = _.get(response, 'json.routes[0].legs[0]', null);

  if (!leg) throw 'Problem fetching route, please try again.';

  const distance = (leg.distance.value * 0.000621371).toFixed(2);
  const duration = ((leg.duration.value) / 60).toFixed(2);

  const averageSpeed = _getAverageSpeed(leg.distance.value, leg.duration.value).toFixed(2);
  
  let fuelPrice = await UKVehicleParser.getFuelPrice();

  if (car.fuelType === 'PETROL') {
    fuelPrice = fuelPrice.unleaded.inPence / 10;
  } else {
    fuelPrice = fuelPrice.diesel.inPence / 10;
  }

  const mpg = _getMPG(car, response.json.routes[0]);
  
  const journeyCost = _getJourneyCost(mpg, distance, fuelPrice).toFixed(2);

  const fuelTankCapacity = car.fuelTankCapacity;

  const fuelData = _getFuelUsed(mpg, distance, fuelTankCapacity);

  return {
    duration,
    distance,
    fuelTankCapacity,
    tanksUsed: fuelData.tanksUsed,
    litresUsed: fuelData.litresUsed,
    start: leg.start_address,
    end: leg.end_address,
    averageSpeed,
    journeyCost,
    mpg,
  }
}
