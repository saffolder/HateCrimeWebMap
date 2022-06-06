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
zoom: 3.5, // starting zoom
center: [-98.5795, 35.8283] // starting center
});

async function geojsonFetch() {
let response = await fetch("assets/us-states.geojson");
let states = await response.json();
map.on("load", function loadingData() {
    map.addSource('states', {
        type: 'geojson',
        data: states
    });

    map.addLayer({
        'id': 'stateData-layer',
        'type': 'fill',
        'source': 'states',
        'paint': {
            'fill-color': [
            'step',
            ['get', 'hate_crime_data_counts'], // we ought to change the colors if we're using dark theme
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

            /*map.on('click', 'stateData-layer', (event) => {
          // TODO FILL IN WITH ADDING STATE CARD
        });

    map.on('click', ({point}) => {
        const state = map.queryRenderedFeatures(point, {
            layers: ['stateData-layer']
        });
        addStateCard();
    });*/

    /**
     * Updates the dashboard with the name of the State Hovered Over
     * TODO: Add the # of hate crimes from the db
     */
    map.on('mousemove', ({point}) => {
        const state = map.queryRenderedFeatures(point, {
            layers: ['stateData-layer']
        });
        document.getElementById('hoveredState').innerHTML = state.length ?
        `# of Hate Crimes in 2019 for ${state[0].properties.NAME}: ${state[0].properties.hate_crime_data_counts}` :
        `Hover over a State`;
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