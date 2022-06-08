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
center: [-98.5795, 33.8283] // starting center
});

async function geojsonFetch() {
let response = await fetch("assets/us-states.geojson");
let states = await response.json();
let response2 = await fetch("assets/demographics.json");
let demographics = await response2.json();
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

    /**
     * Adds a State to the dashboard when clicked
     */
    map.on('click', ({point}) => {
        const state = map.queryRenderedFeatures(point, {
            layers: ['stateData-layer']
        });
        const names = document.querySelectorAll('.stateName');
        if (names.length < 3 && notInList(state, names)) {
            addStateCard(state);
        }
    });

    /**
     * Checks whether a State card is already on the dashboard
     * @returns false if in the deck already, else true
     */
    function notInList(state, names) {
        var contains = true;
        names.forEach((name) => {
            if (name.innerHTML === state[0].properties.NAME) {
                contains = false;
           }
        })
        return contains;
    }

    /**
     * When a state is clicked: adds a card to dashboard containing:
     * State Name, list of top 3 hate crimes, demographics chart
     */
    function addStateCard(state) {

        const card = document.createElement('div');
        card.className = 'stateCard';

        const name = document.createElement('div');
        name.innerHTML = state[0].properties.NAME;
        name.className = 'stateName';

        const remove = document.createElement('div');
        remove.className = 'remove';
        remove.addEventListener('click', removeCard);

        // Creates the pie charts
        var data = [{
            type: 'pie',
            values: demographics[state[0].properties.NAME].values,
            labels: demographics[state[0].properties.NAME].labels,
            automargin: true,
            textinfo: 'none'
        }];
        var layout = {
            height: 180,
            width: 180,
            margin: {"t": 0, "b": 0, "l": 0, "r": 0},
            showlegend: false
        }
        const pieChart = document.createElement('div');
        pieChart.className = 'pieChart';
        Plotly.newPlot(pieChart, data, layout);

        const list = document.createElement('div');
        list.className = 'stateList';

        const topCrimesString = state[0].properties.top_3_hate_crimes;
        const topCrimes = topCrimesString.substring(1, topCrimesString.length - 1).split(',');

        const ol = document.createElement('ol');
        const li1 = document.createElement('li');
        li1.innerHTML = topCrimes[0].substring(1,topCrimes[0].length-1);

        const li2 = document.createElement('li');
        li2.innerHTML = topCrimes[1].substring(1,topCrimes[1].length-1);

        const li3 = document.createElement('li');
        li3.innerHTML = topCrimes[2].substring(1,topCrimes[2].length-1);

        const note = document.createElement('h3');
        note.innerHTML = 'Top Hate Crimes';

        ol.appendChild(li1);
        ol.appendChild(li2);
        ol.appendChild(li3);
        list.appendChild(ol);

        const dataScreen = document.createElement('div');
        dataScreen.className = 'data';

        dataScreen.appendChild(remove);
        dataScreen.appendChild(name);
        dataScreen.appendChild(note);
        dataScreen.appendChild(list);

        card.appendChild(dataScreen);
        card.appendChild(pieChart);

        document.getElementById('dashboard').appendChild(card);
    }

    /**
     * Removes the card that was clicked on
     */
    function removeCard() {
        this.parentElement.parentElement.remove();
    }

    /**
     * Updates the dashboard with the name of the State Hovered Over
     * TODO: Add the # of hate crimes from the db
     */
    map.on('mousemove', ({point}) => {
        const state = map.queryRenderedFeatures(point, {
            layers: ['stateData-layer']
        });
        document.getElementById('hoveredState').innerHTML = state.length ?
        `# of Race Based Hate Crimes in 2019 for ${state[0].properties.NAME}: ${state[0].properties.hate_crime_data_rates}` :
        `Hover over a State for quick stats, or click for more in depth results.`;
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