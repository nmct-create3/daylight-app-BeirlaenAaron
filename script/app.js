let KEY = "224fb176ba4af6617cd08617f229e08f"

const _convertTime = (t) => {
	const time = new Date('0001-01-01 ' + t);
	const formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

const _parseMilliseconds = (timestamp) => {
	const time = new Date(timestamp * 1000);

	const hours = time.getHours();
	const minutes = time.getMinutes();

	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

let itBeNight = () => {
	document.querySelector('html').classList.add('is-night');
}

let itBeDay = () => {
	document.querySelector('html').classList.remove('is-night');
}

const updateSun = (sunElement, left, bottom, now) => {
	sunElement.style.left = `${left}%`;
	sunElement.style.bottom = `${bottom}%`;

	const currentTimeStamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
	sunElement.setAttribute('data-time', currentTimeStamp);
}

// 5 TODO: maak updateSun functie

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	const sun = document.querySelector('.js-sun'), minutesLeft = document.querySelector('.js-time-left');
	// Bepaal het aantal minuten dat de zon al op is.
	const now = new Date(), sunriseDate = new Date(sunrise *1000);

	let minutesSunUp = (now.getHours() * 60 + now.getMinutes()) - (sunriseDate.getHours() * 60 + sunriseDate.getMinutes());
	const percentage = (100/totalMinutes) * minutesSunUp, 
	sunLeft = percentage, 
	sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;

	updateSun(sun, sunLeft, sunBottom, now);
	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	minutesLeft.innerText = totalMinutes - minutesSunUp;
	// Nu maken we een functie die de zon elke minuut zal updaten
	const t = setInterval(() => {
		// Bekijk of de zon niet nog onder of reeds onder is
		if (minutesSunUp > totalMinutes) {
			clearInterval(t);
			itBeNight();
		} else if (minutesSunUp < 0) { 
			itBeNight();
		} else {
			itBeDay();
			// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
			const now = new Date(),
				left = (100 / totalMinutes) * minutesSunUp,
				bottom = left < 50 ? left * 2 : (100 - left) * 2;

			// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
			updateSun(sun, left, bottom, now);
			minutesLeft.innerText = totalMinutes - minutesSunUp;
		}
	}, 60000);
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	console.log({queryResponse});
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	document.querySelector('.js-location').innerText = `${queryResponse.city.name}, ${queryResponse.city.country}`;
	document.querySelector('.js-sunrise').innerText = _parseMilliseconds(queryResponse.city.sunrise);
	document.querySelector('.js-sunset').innerText = _parseMilliseconds(queryResponse.city.sunset);
	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	const timeDifference = (queryResponse.city.sunset - queryResponse.city.sunrise) / 60; // api = seconden -> /60 voor minuten
	placeSunAndStartMoving(timeDifference, queryResponse.city.sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
	// Eerst bouwen we onze url op
	// Met de fetch API proberen we de data op te halen.
	// Als dat gelukt is, gaan we naar onze showResult functie.
	const data = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric&lang=nl&cnt=1`)
		.then((r) => r.json())
		.catch((err) => console.error('An error occured:', err));
	showResult(data);
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8027841, 3.2097454);
});
