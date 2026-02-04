const { Country } = require('country-state-city');

const countries = Country.getAllCountries();
const india = countries.find(c => c.name === 'India');
console.log('Searching for "India":', india);

const indiafuzzy = countries.find(c => c.name.toLowerCase().includes('india'));
console.log('Fuzzy "india":', indiafuzzy);
