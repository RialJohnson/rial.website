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
        'Rhode Island', 'Delaware', 'Arizona'
    ];

    // createWorldMap(visitedCountries); // Temporarily disabled
    createUSMap(visitedStates);

    console.log('Travel maps initialized successfully');
}


function createUSMap(visitedStates) {
    const usMapContainer = document.getElementById('us-map');

    // Add responsive class for styling
    usMapContainer.classList.add('responsive-map');

    // Create Leaflet map centered on US
    const map = L.map(usMapContainer, {
        zoomControl: false,
        attributionControl: false
    }).setView([39.8283, -98.5795], 4);

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Load US states GeoJSON
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    const stateName = feature.properties.name;
                    const isVisited = visitedStates.includes(stateName);

                    return {
                        fillColor: isVisited ? '#63b3ed' : '#4a5568',
                        weight: 1,
                        opacity: 1,
                        color: '#2d3748',
                        fillOpacity: isVisited ? 0.8 : 0.4
                    };
                },
                onEachFeature: function(feature, layer) {
                    const stateName = feature.properties.name;
                    const isVisited = visitedStates.includes(stateName);

                    layer.bindTooltip(`${stateName}${isVisited ? ' ✓' : ''}`, {
                        permanent: false,
                        direction: 'auto'
                    });

                    layer.on({
                        mouseover: function(e) {
                            const layer = e.target;
                            layer.setStyle({
                                fillColor: isVisited ? '#4299e1' : '#718096',
                                weight: 2,
                                fillOpacity: isVisited ? 0.9 : 0.6
                            });
                        },
                        mouseout: function(e) {
                            const layer = e.target;
                            layer.setStyle({
                                fillColor: isVisited ? '#63b3ed' : '#4a5568',
                                weight: 1,
                                fillOpacity: isVisited ? 0.8 : 0.4
                            });
                        }
                    });
                }
            }).addTo(map);

            // Handle responsive resizing
            window.addEventListener('resize', function() {
                setTimeout(function() {
                    map.invalidateSize();
                }, 100);
            });

            // Force initial sizing after map loads
            setTimeout(function() {
                map.invalidateSize();
                console.log('Map container size:', usMapContainer.offsetWidth, 'x', usMapContainer.offsetHeight);
            }, 500);
        })
        .catch(error => {
            console.error('Error loading US states:', error);
            // Fallback: show error message
            usMapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #e53e3e;">Unable to load US map</div>';
        });
}