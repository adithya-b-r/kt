const { Country } = require('country-state-city');

const countries = Country.getAllCountries();
const us = countries.filter(c => c.name.includes('United'));
console.log('Countries with United:', us.map(c => c.name));
