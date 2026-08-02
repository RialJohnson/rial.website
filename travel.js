// Travel Maps Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize maps after navigation loads
    setTimeout(function() {
        initTravelMaps();
    }, 100);
});

function initTravelMaps() {
    console.log('Initializing travel maps...');

    // US States I've visited (using state names)
    const visitedStates = [
        'Montana', 'Washington', 'California', 'Colorado', 'Wyoming',
        'Idaho', 'Oregon', 'Utah', 'Nevada', 'Massachusetts',
        'New York', 'Illinois', 'New Jersey', 'North Dakota', 'South Dakota',
        'Minnesota', 'Wisconsin', 'Iowa', 'Missouri', 'Michigan', 'Indiana', 'Ohio',
        'Pennsylvania','New Hampshire', 'Maine', 'Vermont', 'Connecticut',
        'Rhode Island', 'Delaware', 'Arizona', 'Nebraska'
    ];

    // Countries I've visited (names must match GeoJSON `name` property)
    const visitedCountries = [
        'United States',
        'Canada',
        'Japan',
        'France',
        'Italy',
        'United Kingdom',
        'Ireland',
    ];

    createUSMap(visitedStates);
    createWorldMap(visitedCountries);

    const statesCount = document.getElementById('states-count');
    const countriesCount = document.getElementById('countries-count');
    if (statesCount) {
        statesCount.textContent = `${visitedStates.length}/50`;
    }
    if (countriesCount) {
        countriesCount.textContent = `${visitedCountries.length}/195`;
    }

    console.log('Travel maps initialized successfully');
}

function getRegionStyle(isVisited) {
    return {
        fillColor: isVisited ? '#63b3ed' : '#4a5568',
        weight: 1,
        opacity: 1,
        color: '#2d3748',
        fillOpacity: isVisited ? 0.8 : 0.4
    };
}

function getRegionHoverStyle(isVisited) {
    return {
        fillColor: isVisited ? '#4299e1' : '#718096',
        weight: 2,
        fillOpacity: isVisited ? 0.9 : 0.6
    };
}

function bindRegionInteractions(layer, name, isVisited) {
    layer.bindTooltip(`${name}${isVisited ? ' ✓' : ''}`, {
        permanent: false,
        direction: 'auto'
    });

    layer.on({
        mouseover: function(e) {
            e.target.setStyle(getRegionHoverStyle(isVisited));
        },
        mouseout: function(e) {
            e.target.setStyle(getRegionStyle(isVisited));
        }
    });
}

function setupMapResponsiveness(map, container) {
    window.addEventListener('resize', function() {
        setTimeout(function() {
            map.invalidateSize();
        }, 100);
    });

    setTimeout(function() {
        map.invalidateSize();
        console.log('Map container size:', container.offsetWidth, 'x', container.offsetHeight);
    }, 500);
}

// Keep maps on a single world copy (no infinite horizontal wrap)
const WORLD_BOUNDS = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));

// All 50 states as drawn in the US GeoJSON (Alaska extends past -180)
const US_BOUNDS = L.latLngBounds(L.latLng(17.5, -189.5), L.latLng(71.8, -65));

function createBaseMap(container, center, zoom, options = {}) {
    const maxBounds = options.maxBounds || WORLD_BOUNDS;

    const map = L.map(container, {
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: false,
        maxBounds: maxBounds,
        maxBoundsViscosity: 1.0,
        minZoom: options.minZoom
    }).setView(center, zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        noWrap: true,
        bounds: maxBounds
    }).addTo(map);

    return map;
}

function createUSMap(visitedStates) {
    const usMapContainer = document.getElementById('us-map');
    if (!usMapContainer) return;

    usMapContainer.classList.add('responsive-map');

    const map = createBaseMap(usMapContainer, [39.8283, -98.5795], 4, {
        minZoom: 3,
        maxBounds: US_BOUNDS
    });

    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    const isVisited = visitedStates.includes(feature.properties.name);
                    return getRegionStyle(isVisited);
                },
                onEachFeature: function(feature, layer) {
                    const stateName = feature.properties.name;
                    const isVisited = visitedStates.includes(stateName);
                    bindRegionInteractions(layer, stateName, isVisited);
                }
            }).addTo(map);

            setupMapResponsiveness(map, usMapContainer);
        })
        .catch(error => {
            console.error('Error loading US states:', error);
            usMapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #e53e3e;">Unable to load US map</div>';
        });
}

function createWorldMap(visitedCountries) {
    const worldMapContainer = document.getElementById('world-map');
    if (!worldMapContainer) return;

    worldMapContainer.classList.add('responsive-map');

    const map = createBaseMap(worldMapContainer, [20, 0], 1, { minZoom: 1 });

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    const isVisited = visitedCountries.includes(feature.properties.name);
                    return getRegionStyle(isVisited);
                },
                onEachFeature: function(feature, layer) {
                    const countryName = feature.properties.name;
                    const isVisited = visitedCountries.includes(countryName);
                    bindRegionInteractions(layer, countryName, isVisited);
                }
            }).addTo(map);

            setupMapResponsiveness(map, worldMapContainer);
        })
        .catch(error => {
            console.error('Error loading countries:', error);
            worldMapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #e53e3e;">Unable to load world map</div>';
        });
}
