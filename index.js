const { get } = require('lodash');
const fuelCalculator = require('./app/FuelCalculator');
const UKVehicleParser = require('./app/UKVehicleParser');

const { send, error } = require('./app/response');

exports.handler = async (event, context, callback) => {
  let body = event.body || event;
  body = JSON.parse(body);

  try {
    const { resource } = event;
    let response;

    switch(resource) {
      case '/fuel-calculator/car':
        const registration = get(body, 'registration', null);
        if (!registration) throw 'Registration not found in request';
        response = await UKVehicleParser.getCar(registration);
        break;
      case '/fuel-calculator':
        const { car, origin, destination } = body;
        if (!car || !origin || !destination ) throw 'No car/origin/destination found in request';
        response = await fuelCalculator(origin, destination, car);
        break;
    }
    
    send(callback, response);
  } catch (err) {
    console.log(err);
    error(callback, err);
  }
};