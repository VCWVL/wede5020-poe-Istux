/* global L */
// Interactive Maps functionality for The Green Basket
class InteractiveMap {
    constructor() {
        this.map = null;
        this.marker = null;
        this.userMarker = null;
        this.storeLocation = [-29.8587, 31.0218]; // Durban coordinates
        this.initMap();
        this.initMapControls();
    }

    initMap() {
        // Initialize the map
        this.map = L.map('map').setView(this.storeLocation, 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add custom marker for the store
        const greenIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#2d572c" d="M16 2C10.477 2 6 6.477 6 12c0 8 10 18 10 18s10-10 10-18c0-5.523-4.477-10-10-10z"/>
                    <circle fill="white" cx="16" cy="12" r="4"/>
                </svg>
            `),
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        this.marker = L.marker(this.storeLocation, { icon: greenIcon })
            .addTo(this.map)
            .bindPopup(`
                <div style="text-align: center;">
                    <strong>The Green Basket</strong><br>
                    123 Green Street<br>
                    Durban, KwaZulu-Natal<br>
                    <em>Organic Grocery Store</em>
                </div>
            `)
            .openPopup();

        // Add click event to map
        this.map.on('click', (e) => {
            this.showCoordinates(e.latlng);
        });
    }

    initMapControls() {
        // Get Directions button
        document.getElementById('getDirections').addEventListener('click', () => {
            this.getDirections();
        });

        // Locate Me button
        document.getElementById('locateMe').addEventListener('click', () => {
            this.locateUser();
        });

        // Reset Map button
        document.getElementById('resetMap').addEventListener('click', () => {
            this.resetMap();
        });
    }

    getDirections() {
        const instructions = document.getElementById('mapInstructions');
        instructions.innerHTML = `
            <div class="directions-info">
                <h4>Getting to The Green Basket:</h4>
                <p><strong>From City Center:</strong> Take the M4 south, exit at Green Street</p>
                <p><strong>Public Transport:</strong> Bus routes 123, 456 stop nearby</p>
                <p><strong>Parking:</strong> Free parking available behind the store</p>
                <a href="https://www.google.com/maps/dir//-29.8587,31.0218" target="_blank" class="directions-link">
                    Open in Google Maps for detailed directions
                </a>
            </div>
        `;
        instructions.style.display = 'block';
    }

    locateUser() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        const instructions = document.getElementById('mapInstructions');
        instructions.innerHTML = '<p>Locating your position...</p>';
        instructions.style.display = 'block';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const userLocation = [userLat, userLng];

                // Add user location marker
                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker);
                }

                const blueIcon = L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle fill="#007bff" cx="12" cy="12" r="10"/>
                            <circle fill="white" cx="12" cy="12" r="4"/>
                        </svg>
                    `),
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                this.userMarker = L.marker(userLocation, { icon: blueIcon })
                    .addTo(this.map)
                    .bindPopup('Your current location')
                    .openPopup();

                // Calculate distance
                const distance = this.calculateDistance(userLocation, this.storeLocation);
                
                instructions.innerHTML = `
                    <div class="location-info">
                        <h4>You are ${distance.toFixed(1)} km from The Green Basket</h4>
                        <p>Estimated travel time: ${this.estimateTravelTime(distance)}</p>
                        <button id="routeToStore" class="route-btn">Show Route</button>
                    </div>
                `;

                // Add route button event
                document.getElementById('routeToStore').addEventListener('click', () => {
                    this.showRoute(userLocation, this.storeLocation);
                });

            },
            (error) => {
                let errorMessage = "Unable to retrieve your location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied. Please enable location services.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out.";
                        break;
                }
                instructions.innerHTML = `<p style="color: #ff6b6b;">${errorMessage}</p>`;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    calculateDistance(loc1, loc2) {
        const [lat1, lon1] = loc1;
        const [lat2, lon2] = loc2;
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    estimateTravelTime(distance) {
        const drivingSpeed = 40; // km/h average in city
        const drivingTime = (distance / drivingSpeed) * 60; // minutes
        return `${Math.ceil(drivingTime)} minutes by car`;
    }

    showRoute(start, end) {
        // Simulate route drawing (in real implementation, use routing service)
        const routeCoordinates = [
            start,
            [start[0] + (end[0] - start[0]) * 0.3, start[1] + (end[1] - start[1]) * 0.3],
            [start[0] + (end[0] - start[0]) * 0.7, start[1] + (end[1] - start[1]) * 0.7],
            end
        ];

        const routeLine = L.polyline(routeCoordinates, {
            color: '#2d572c',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(this.map);

        // Fit map to show entire route
        this.map.fitBounds(routeLine.getBounds());

        const instructions = document.getElementById('mapInstructions');
        instructions.innerHTML += `
            <div class="route-details">
                <p><strong>Route displayed:</strong> Green dashed line shows approximate route</p>
            </div>
        `;
    }

    showCoordinates(latlng) {
        const instructions = document.getElementById('mapInstructions');
        instructions.innerHTML = `
            <p>Clicked coordinates: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}</p>
            <p>Distance from store: ${this.calculateDistance([latlng.lat, latlng.lng], this.storeLocation).toFixed(2)} km</p>
        `;
        instructions.style.display = 'block';
    }

    resetMap() {
        this.map.setView(this.storeLocation, 15);
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
            this.userMarker = null;
        }
        document.getElementById('mapInstructions').style.display = 'none';
        
        // Remove any route lines
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
                this.map.removeLayer(layer);
            }
        });
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('map')) {
        new InteractiveMap();
    }
});