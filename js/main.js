/**
 * JS for index.html
 */
'use strict';
(function() {
window.addEventListener("load", init);


mapboxgl.accessToken =
'pk.eyJ1IjoibGlhbWdlYXJ5dXciLCJhIjoiY2t2YmRzOTd1Mnd2bTJubm5pZjZ2dWN6NCJ9.MSvwXgu6CcpGE5Zw4ukudw'; // access token
function init() {
const map = new mapboxgl.Map({
container: "map", // container ID
style: "mapbox://styles/mapbox/dark-v10", // map style
zoom: 4, // starting zoom
center: [-98.5795, 39.8283] // starting center
});

async function geojsonFetch() {
let response = await fetch("assets/us-states.geojson");
let stateData = await response.json();
map.on("load", function loadingData() {
    map.addSource('stateData', {
        type: 'geojson',
        data: stateData
    });

    map.addLayer({
        'id': 'stateData-layer',
        'type': 'fill',
        'source': 'stateData',
        'paint': {
            'fill-color': [
            'step',
            ['get', 'hate_crime_data_rates'], // we ought to change the colors if we're using dark theme
            '#FFEDA0',                        // something less bright would be better
            10,
            '#FED976',
            20,
            '#FEB24C',
            50,
            '#FD8D3C',
            100,
            '#FC4E2A',
            200,
            '#E31A1C',
            ],
            'fill-outline-color': '#BBBBBB',
            'fill-opacity': 0.75,
        }
    });

    const layers = [
    '0-9',
    '10-19',
    '20-49',
    '50-99',
    '100-199',
    '200+'
    ];
    const colors = [    // if/when we change choropleth colors, don't forget to change them here, too.
        '#FFEDA070',
        '#FED97670',
        '#FEB24C70',
        '#FD8D3C70',
        '#FC4E2A70',
        '#E31A1C70',
    ];

    const legend = document.getElementById('legend');
    legend.innerHTML = '<p><b>Number of hate crimes by state</b></p>'

    layers.forEach((layer, i) => {
        const color = colors[i];
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        const value = document.createElement('span');
        value.innerHTML = `${layer}`;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    });
});
};

geojsonFetch();
}
})();