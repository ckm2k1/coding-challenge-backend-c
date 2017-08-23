const fs = require('fs');
const raw = fs.readFileSync('./data/cities_canada-usa.tsv', 'utf8');
const rawAdminCodes = fs.readFileSync('./data/admin1-codes.txt', 'utf8');
const db = [];

const adminCodes = rawAdminCodes.split('\n').map((row) => {
	const [id, name, asciiname, code] = row.split('\t');
	return {id, name, asciiname};
});

const rows = raw.split('\n');
// remove the headers
rows.shift();

rows.forEach(row => {
	let [
		id,
		name,
		asciiname,
		alternatenames,
		latitude,
		longitude,
		featureClass,
		featureCode,
		country,
		cc2,
		admin1,
		admin2,
		admin3,
		admin4,
		population,
		elevation,
		dem,
		timezone,
		modification
	] = row.split('\t');

  population = parseFloat(population);

	if (population && population >= 5000 && ['US', 'CA'].includes(country.toUpperCase())) {
		const stateOrProvince = adminCodes.find((c) => {
			return c.id === `${country}.${admin1}`;
		});

		db.push({
			id,
			name,
			asciiname,
			alternatenames: (alternatenames.length && alternatenames.split(',').map(r => r.trim())) || [],
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude),
			country,
			country2: cc2,
			population,
			timezone,
			adminCode: stateOrProvince && stateOrProvince.asciiname,
			adminCodeUtf8: stateOrProvince && stateOrProvince.name
		});
	} else {
    console.log('Missing pop', id, asciiname);
  }
});

fs.writeFileSync('./data/db.json', JSON.stringify(db, null, 2), 'utf8');