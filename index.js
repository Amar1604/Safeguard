 // Global variables
        let isSOSActive = false;
        let alertCounter = 1;
        let emergencyContacts = [];
        let currentLocation = { lat: 28.6139, lng: 77.2090 }; // Default: New Delhi
        let map, myMarker, myCircle, userMarkers = {};
        let locationInterval, watchId, keepAliveInterval;
        let lastUpdateTime = 0;
        let mapInitialized = false;
        
        // Firebase configuration loaded from config.js
        const firebaseConfig = loadFirebaseConfig();
        
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        // Load emergency contacts from Firebase with fallback to localStorage
        database.ref('emergencyContacts').on('value', (snapshot) => {
            const contacts = snapshot.val();
            if (contacts) {
                displayEmergencyContacts(contacts);
            }
        }, (error) => {
            console.log('Firebase read failed, using localStorage:', error);
            loadContactsFromLocalStorage();
        });
        
        function loadContactsFromLocalStorage() {
            const localContacts = localStorage.getItem('emergencyContacts');
            if (localContacts) {
                const contacts = JSON.parse(localContacts);
                displayEmergencyContacts(contacts);
            }
        }
        
        function displayEmergencyContacts(contacts) {
            const contactsList = document.getElementById('contactsList');
            // Clear existing Firebase contacts but keep defaults
            const existingContacts = contactsList.querySelectorAll('.contact-item:not([data-default])');
            existingContacts.forEach(contact => contact.remove());
            
            Object.keys(contacts).forEach(contactId => {
                const contact = contacts[contactId];
                const contactHTML = `
                    <div class="contact-item" data-contact-id="${contactId}">
                        <div>
                            <strong>${contact.name}</strong><br>
                            <small>📞 <a href="tel:${contact.phone}" style="color: #3498db; text-decoration: none;">${contact.phone}</a> | ${contact.relation.toUpperCase()}</small>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <span class="alert-status" style="background: #27ae60; cursor: pointer;" onclick="callContact('${contact.phone}', '${contact.name}')">CALL</span>
                            <span class="alert-status" style="background: #e74c3c; cursor: pointer;" onclick="deleteContact('${contactId}')">DELETE</span>
                        </div>
                    </div>
                `;
                contactsList.insertAdjacentHTML('beforeend', contactHTML);
            });
        }
        
        function deleteContact(contactId) {
            if (confirm('Delete this emergency contact?')) {
                database.ref('emergencyContacts/' + contactId).remove()
                    .then(() => {
                        alert('Contact deleted successfully!');
                    })
                    .catch((error) => {
                        console.log('Firebase delete failed, using localStorage:', error);
                        // Delete from localStorage as fallback
                        const localContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '{}');
                        delete localContacts[contactId];
                        localStorage.setItem('emergencyContacts', JSON.stringify(localContacts));
                        
                        // Update display
                        displayEmergencyContacts(localContacts);
                        alert('Contact deleted successfully!');
                    });
            }
        }
        
        // View-only map functions
        function viewOnlyMap() {
            initializeMap(true);
        }
        
        function closeViewOnlyMap() {
            if (map) {
                map.remove();
                map = null;
            }
            mapInitialized = false;
            document.getElementById('map').style.display = 'none';
            document.getElementById('mapPlaceholder').style.display = 'flex';
            
            // Remove all close buttons
            const closeBtns = document.querySelectorAll('#mapContainer .close-map-btn');
            closeBtns.forEach(btn => btn.remove());
        }
        
        function callContact(phone, name) {
            if (confirm(`Call ${name} at ${phone}?`)) {
                window.location.href = `tel:${phone}`;
            }
        }
        
        // Listen for emergency alerts from other users
        database.ref('alerts').on('child_added', (snapshot) => {
            const alert = snapshot.val();
            const alertUserId = snapshot.key;
            if (alertUserId !== userId) {
                showEmergencyNotification(alert, alertUserId);
            }
        });
        
        database.ref('alerts').on('child_changed', (snapshot) => {
            const alert = snapshot.val();
            const alertUserId = snapshot.key;
            if (alertUserId !== userId && alert.status === 'RESOLVED') {
                showResolvedNotification(alertUserId);
            }
        });
        
        function showEmergencyNotification(alert, alertUserId) {
            // Show popup notification
            const notification = document.createElement('div');
            notification.id = 'alert-notification-' + alertUserId;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
                background: #e74c3c; color: white; padding: 15px;
                border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                max-width: 300px; animation: slideIn 0.5s ease;
            `;
            notification.innerHTML = `
                <h4>🚨 EMERGENCY ALERT</h4>
                <p><strong>User:</strong> ${alertUserId}</p>
                <p><strong>Location:</strong> ${alert.lat.toFixed(4)}°, ${alert.lng.toFixed(4)}°</p>
                <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleTimeString()}</p>
                <button onclick="this.parentElement.remove()" style="background: white; color: #e74c3c; border: none; padding: 5px 10px; border-radius: 5px; float: right; margin-top: 10px;">Close</button>
            `;
            document.body.appendChild(notification);
            
            // Add to Active Alerts tab
            addToActiveAlerts(alert, alertUserId);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 10000);
        }
        
        function addToActiveAlerts(alert, alertUserId) {
            // Clear "no alerts" message if it exists
            const noAlertsMsg = document.querySelector('#alertsList p');
            if (noAlertsMsg) {
                noAlertsMsg.remove();
            }
            
            // Check if alert already exists
            if (document.getElementById(`external-alert-${alertUserId}`)) {
                return;
            }
            
            const alertHTML = `
                <div class="alert-item" id="external-alert-${alertUserId}">
                    <div>
                        <strong>🚨 EMERGENCY ALERT - ${alertUserId}</strong><br>
                        <small>📍 ${alert.lat.toFixed(4)}° N, ${alert.lng.toFixed(4)}° E</small><br>
                        <small>⏰ ${new Date(alert.timestamp).toLocaleString()}</small>
                    </div>
                    <span class="alert-status" style="background: #e74c3c;">ACTIVE</span>
                </div>
            `;
            
            document.getElementById('alertsList').insertAdjacentHTML('beforeend', alertHTML);
        }
        
        function showResolvedNotification(alertUserId) {
            const existingAlert = document.getElementById('alert-notification-' + alertUserId);
            if (existingAlert) {
                existingAlert.style.background = '#27ae60';
                existingAlert.innerHTML = `
                    <h4>✅ EMERGENCY RESOLVED</h4>
                    <p><strong>User:</strong> ${alertUserId}</p>
                    <p>User is now safe</p>
                `;
                setTimeout(() => existingAlert.remove(), 3000);
            }
            
            // Update alert in Active Alerts tab
            const alertInTab = document.getElementById(`external-alert-${alertUserId}`);
            if (alertInTab) {
                const statusSpan = alertInTab.querySelector('.alert-status');
                statusSpan.textContent = 'RESOLVED';
                statusSpan.style.background = '#27ae60';
                alertInTab.style.animation = 'none';
                
                // Remove after 5 seconds
                setTimeout(() => {
                    alertInTab.remove();
                    // Show "no alerts" message if no alerts left
                    const remainingAlerts = document.querySelectorAll('#alertsList .alert-item');
                    if (remainingAlerts.length === 0) {
                        document.getElementById('alertsList').insertAdjacentHTML('beforeend', 
                            '<p style="color: #7f8c8d; font-style: italic;">No active alerts at the moment</p>');
                    }
                }, 5000);
            }
        }

        // Modal functions
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'flex';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // Authentication functions
        function login() {
            // Simulate login
            alert('Login successful! You can now access all features.');
            closeModal('loginModal');
            updateUIAfterLogin();
        }

        function register() {
            // Simulate registration
            alert('Registration successful! Please verify your device ID.');
            closeModal('registerModal');
            updateUIAfterLogin();
        }

        function updateUIAfterLogin() {
            document.querySelector('.auth-section').innerHTML = `
                <span class="status-indicator status-active"></span>
                <span>Welcome, User!</span>
                <button class="btn" onclick="logout()">Logout</button>
            `;
        }

        function logout() {
            location.reload();
        }

        // SOS and Alert functions
        function triggerSOS() {
            if (isSOSActive) {
                alert('SOS already active! Help is on the way.');
                return;
            }

            isSOSActive = true;
            alertCounter++;

            // Simulate getting current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    currentLocation.lat = position.coords.latitude;
                    currentLocation.lng = position.coords.longitude;
                    createAlert();
                }, function() {
                    // Use default location if geolocation fails
                    createAlert();
                });
            } else {
                createAlert();
            }
        }

        function createAlert() {
            const timestamp = new Date().toLocaleString();
            const alertId = String(alertCounter).padStart(3, '0');
            
            // Clear "no alerts" message if it exists
            const noAlertsMsg = document.querySelector('#alertsList p');
            if (noAlertsMsg) {
                noAlertsMsg.remove();
            }

            // Create new alert item
            const alertHTML = `
                <div class="alert-item" id="alert-${alertId}">
                    <div>
                        <strong>🚨 ACTIVE ALERT #${alertId}</strong><br>
                        <small>📍 ${currentLocation.lat.toFixed(4)}° N, ${currentLocation.lng.toFixed(4)}° E</small><br>
                        <small>⏰ ${timestamp}</small>
                    </div>
                    <span class="alert-status" style="background: #e74c3c;">ACTIVE</span>
                </div>
            `;

            document.getElementById('alertsList').insertAdjacentHTML('beforeend', alertHTML);

            // Initialize map and start location sharing
            initializeMap();
            startLocationSharing();

            // Send notifications
            sendEmergencyNotifications();

            // Auto-resolve after 2 minutes for demo
            setTimeout(() => {
                resolveAlert(alertId);
            }, 120000);

            alert('🚨 SOS TRIGGERED!\n📍 Location sharing started\n📱 Emergency contacts notified');
        }

        function initializeMap(viewOnly = false) {
            if (mapInitialized) return;
            
            // Hide placeholder and show map
            document.getElementById('mapPlaceholder').style.display = 'none';
            document.getElementById('map').style.display = 'block';
            
            // Initialize Leaflet map
            map = L.map('map').setView([currentLocation.lat, currentLocation.lng], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            
            mapInitialized = true;
            
            // Add close button for view-only mode
            if (viewOnly) {
                // Remove any existing close buttons first
                const existingBtns = document.querySelectorAll('#mapContainer .close-map-btn');
                existingBtns.forEach(btn => btn.remove());
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = 'Close Map';
                closeBtn.className = 'close-map-btn';
                closeBtn.style.cssText = `
                    position: absolute; top: 10px; right: 10px; z-index: 1000;
                    background: #e74c3c; color: white; border: none;
                    padding: 10px 15px; border-radius: 5px; cursor: pointer;
                `;
                closeBtn.onclick = closeViewOnlyMap;
                document.getElementById('mapContainer').appendChild(closeBtn);
            }
            
            // Listen for other users' locations
            database.ref('locations').on('value', (snapshot) => {
                const locations = snapshot.val();
                
                // Remove markers for users no longer in locations
                Object.keys(userMarkers).forEach(markerId => {
                    if (!locations || !locations[markerId]) {
                        if (userMarkers[markerId]) {
                            map.removeLayer(userMarkers[markerId]);
                            delete userMarkers[markerId];
                        }
                        if (userMarkers[markerId + '_circle']) {
                            map.removeLayer(userMarkers[markerId + '_circle']);
                            delete userMarkers[markerId + '_circle'];
                        }
                    }
                });
                
                // Add/update markers for current users
                if (locations) {
                    const deletedMarkers = JSON.parse(localStorage.getItem('deletedMarkers') || '[]');
                    Object.keys(locations).forEach(id => {
                        if (id !== userId && !deletedMarkers.includes(id)) {
                            updateUserMarker(id, locations[id]);
                        }
                    });
                }
            });
        }
        
        function updateUserMarker(id, location) {
            if (userMarkers[id]) {
                map.removeLayer(userMarkers[id]);
            }
            if (userMarkers[id + '_circle']) {
                map.removeLayer(userMarkers[id + '_circle']);
            }
            
            const isEmergency = location.emergency === true;
            const isLastKnown = location.lastKnown === true;
            
            let markerIcon, popupContent;
            
            if (isEmergency) {
                // Red marker for active emergency
                markerIcon = L.divIcon({
                    html: '<div style="background: #e74c3c; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
                    iconSize: [20, 20],
                    className: 'emergency-marker'
                });
                popupContent = `🚨 EMERGENCY: ${id}<br>📍 ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°<br>⏰ ${new Date(location.timestamp).toLocaleTimeString()}<br><button onclick="deleteMarker('${id}')" style="background: #e74c3c; color: white; border: none; padding: 3px 8px; border-radius: 3px; margin-top: 5px;">Delete</button>`;
            } else if (isLastKnown) {
                // Gray marker for last known position
                markerIcon = L.divIcon({
                    html: '<div style="background: #95a5a6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; opacity: 0.8;"></div>',
                    iconSize: [16, 16],
                    className: 'last-known-marker'
                });
                popupContent = `📍 LAST KNOWN: ${id}<br>📍 ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°<br>⏰ Last seen: ${new Date(location.timestamp).toLocaleTimeString()}<br>🕐 Stopped: ${new Date(location.stoppedAt).toLocaleTimeString()}<br><button onclick="deleteMarker('${id}')" style="background: #e74c3c; color: white; border: none; padding: 3px 8px; border-radius: 3px; margin-top: 5px;">Delete</button>`;
            } else {
                // Blue marker for active sharing
                markerIcon = L.divIcon({
                    html: '<div style="background: #3498db; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white;"></div>',
                    iconSize: [18, 18],
                    className: 'active-marker'
                });
                popupContent = `📍 ACTIVE: ${id}<br>📍 ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°<br>⏰ ${new Date(location.timestamp).toLocaleTimeString()}<br><button onclick="deleteMarker('${id}')" style="background: #e74c3c; color: white; border: none; padding: 3px 8px; border-radius: 3px; margin-top: 5px;">Delete</button>`;
            }
                
            userMarkers[id] = L.marker([location.lat, location.lng], { icon: markerIcon })
                .bindPopup(popupContent)
                .addTo(map);
                
            // Add emergency circle for emergency locations only
            if (isEmergency) {
                userMarkers[id + '_circle'] = L.circle([location.lat, location.lng], {
                    radius: location.accuracy || 100,
                    color: 'red',
                    fillColor: '#ff0000',
                    fillOpacity: 0.2
                }).addTo(map);
            }
        }
        
        function deleteMarker(markerId) {
            if (confirm(`Delete marker for ${markerId}?`)) {
                // Remove from map
                if (userMarkers[markerId]) {
                    map.removeLayer(userMarkers[markerId]);
                    delete userMarkers[markerId];
                }
                if (userMarkers[markerId + '_circle']) {
                    map.removeLayer(userMarkers[markerId + '_circle']);
                    delete userMarkers[markerId + '_circle'];
                }
                
                // Remove from Firebase to prevent reappearance
                database.ref('locations/' + markerId).remove().catch(error => {
                    console.log('Could not remove from Firebase:', error);
                });
                
                // Add to deleted markers list to prevent reappearance
                const deletedMarkers = JSON.parse(localStorage.getItem('deletedMarkers') || '[]');
                if (!deletedMarkers.includes(markerId)) {
                    deletedMarkers.push(markerId);
                    localStorage.setItem('deletedMarkers', JSON.stringify(deletedMarkers));
                }
                
                alert('Marker deleted successfully!');
            }
        }
        
        function startLocationSharing() {
            if (!navigator.geolocation) {
                alert('Geolocation not supported');
                return;
            }
            
            // Get initial position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    updateLocation(position);
                    startEmergencyTracking();
                },
                handleLocationError,
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        }
        
        function startEmergencyTracking() {
            // Use watchPosition for continuous tracking
            watchId = navigator.geolocation.watchPosition(
                updateLocation,
                handleLocationError,
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
            );
            
            // Backup interval method
            locationInterval = setInterval(() => {
                if (Date.now() - lastUpdateTime > 8000) {
                    navigator.geolocation.getCurrentPosition(updateLocation, handleLocationError);
                }
            }, 6000);
            
            // Keep-alive for emergency
            keepAliveInterval = setInterval(() => {
                if (isSOSActive) {
                    database.ref('alerts/' + userId + '/keepAlive').set(Date.now());
                }
            }, 20000);
        }
        
        function updateLocation(position) {
            if (!isSOSActive) return;
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            currentLocation = { lat, lng };
            lastUpdateTime = Date.now();
            
            // Update Firebase with emergency status
            database.ref('locations/' + userId).set({
                lat: lat,
                lng: lng,
                accuracy: accuracy,
                timestamp: lastUpdateTime,
                emergency: true,
                userId: userId,
                keepAlive: lastUpdateTime
            });
            
            // Also update alerts for cross-device notifications
            database.ref('alerts/' + userId).set({
                lat: lat,
                lng: lng,
                timestamp: lastUpdateTime,
                status: 'ACTIVE',
                alertId: String(alertCounter).padStart(3, '0'),
                keepAlive: lastUpdateTime
            });
            
            // Update map markers
            if (myMarker) {
                map.removeLayer(myMarker);
            }
            if (myCircle) {
                map.removeLayer(myCircle);
            }
            
            myMarker = L.marker([lat, lng])
                .bindPopup('🚨 YOUR EMERGENCY LOCATION')
                .addTo(map);
            myCircle = L.circle([lat, lng], {
                radius: accuracy,
                color: 'red',
                fillColor: '#ff0000',
                fillOpacity: 0.2
            }).addTo(map);
            
            map.setView([lat, lng], 15);
            
            // Add stop sharing button to map
            if (!document.getElementById('stopSharingBtn')) {
                const stopBtn = document.createElement('button');
                stopBtn.id = 'stopSharingBtn';
                stopBtn.innerHTML = 'Stop Emergency Sharing';
                stopBtn.style.cssText = `
                    position: absolute; top: 10px; right: 10px; z-index: 1000;
                    background: #e74c3c; color: white; border: none;
                    padding: 10px 15px; border-radius: 5px; cursor: pointer;
                `;
                stopBtn.onclick = stopEmergencySharing;
                document.getElementById('mapContainer').appendChild(stopBtn);
            }
        }
        
        function handleLocationError(error) {
            console.error('Location error:', error);
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert('Location access denied. Please enable location permissions.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log('Location unavailable - retrying...');
                    setTimeout(() => {
                        if (isSOSActive) {
                            navigator.geolocation.getCurrentPosition(updateLocation, handleLocationError);
                        }
                    }, 3000);
                    break;
                case error.TIMEOUT:
                    console.log('Location timeout - retrying...');
                    setTimeout(() => {
                        if (isSOSActive) {
                            navigator.geolocation.getCurrentPosition(updateLocation, handleLocationError);
                        }
                    }, 500);
                    break;
            }
        }
        
        function stopEmergencySharing() {
            if (confirm('Stop emergency location sharing?')) {
                // Stop all tracking
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                }
                if (locationInterval) {
                    clearInterval(locationInterval);
                    locationInterval = null;
                }
                if (keepAliveInterval) {
                    clearInterval(keepAliveInterval);
                    keepAliveInterval = null;
                }
                
                // Remove markers from map
                if (myMarker) {
                    map.removeLayer(myMarker);
                    myMarker = null;
                }
                if (myCircle) {
                    map.removeLayer(myCircle);
                    myCircle = null;
                }
                
                // Update alert status in UI
                const currentAlert = document.querySelector('.alert-item[id*="alert-' + String(alertCounter).padStart(3, '0') + '"]');
                if (currentAlert) {
                    const statusSpan = currentAlert.querySelector('.alert-status');
                    statusSpan.textContent = 'RESOLVED';
                    statusSpan.style.background = '#27ae60';
                    currentAlert.style.animation = 'none';
                }
                
                // Update Firebase to show last known position
                database.ref('locations/' + userId).update({
                    lastKnown: true,
                    stoppedAt: Date.now(),
                    emergency: false
                });
                database.ref('alerts/' + userId).update({ 
                    status: 'RESOLVED',
                    resolvedAt: Date.now()
                });
                
                // Remove alert after 5 seconds
                setTimeout(() => {
                    database.ref('alerts/' + userId).remove();
                }, 5000);
                
                // Reset UI
                isSOSActive = false;
                mapInitialized = false;
                document.getElementById('map').style.display = 'none';
                document.getElementById('mapPlaceholder').style.display = 'flex';
                
                // Remove stop button
                const stopBtn = document.getElementById('stopSharingBtn');
                if (stopBtn) {
                    stopBtn.remove();
                }
                
                // Clear map if it exists
                if (map) {
                    map.remove();
                    map = null;
                }
                
                alert('✅ Emergency sharing stopped. You are marked as safe.');
            }
        }

        function resolveAlert(alertId) {
            const alertElement = document.getElementById(`alert-${alertId}`);
            if (alertElement) {
                const statusSpan = alertElement.querySelector('.alert-status');
                statusSpan.textContent = 'RESOLVED';
                statusSpan.style.background = '#27ae60';
                alertElement.style.animation = 'none';
            }

            if (alertId === String(alertCounter).padStart(3, '0')) {
                // Stop all tracking
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                }
                if (locationInterval) {
                    clearInterval(locationInterval);
                    locationInterval = null;
                }
                if (keepAliveInterval) {
                    clearInterval(keepAliveInterval);
                    keepAliveInterval = null;
                }
                
                // Remove markers
                if (myMarker) {
                    map.removeLayer(myMarker);
                    myMarker = null;
                }
                if (myCircle) {
                    map.removeLayer(myCircle);
                    myCircle = null;
                }
                
                // Update Firebase to show last known position
                database.ref('locations/' + userId).update({
                    lastKnown: true,
                    stoppedAt: Date.now(),
                    emergency: false
                });
                database.ref('alerts/' + userId).update({ 
                    status: 'RESOLVED',
                    resolvedAt: Date.now()
                });
                
                // Remove alert after 5 seconds
                setTimeout(() => {
                    database.ref('alerts/' + userId).remove();
                }, 5000);
                
                // Reset UI
                isSOSActive = false;
                document.getElementById('map').style.display = 'none';
                document.getElementById('mapPlaceholder').style.display = 'flex';
                
                // Remove stop button if exists
                const stopBtn = document.getElementById('stopSharingBtn');
                if (stopBtn) {
                    stopBtn.remove();
                }
                
                alert('✅ Emergency resolved. Location sharing stopped.');
            }
        }

        function sendEmergencyNotifications() {
            // Simulate sending SMS and email notifications
            console.log('📱 SMS sent to emergency contacts');
            console.log('📧 Email sent to emergency contacts');
            console.log('🚔 Alert sent to police');
            console.log('🏥 Alert sent to nearby hospitals');
        }

        // Contact management
        function addContact() {
            const name = document.getElementById('contactName').value;
            const phone = document.getElementById('contactPhone').value;
            const email = document.getElementById('contactEmail').value;
            const relation = document.getElementById('contactRelation').value;

            if (!name || !phone) {
                alert('Please fill in name and phone number');
                return;
            }

            const contact = { name, phone, email, relation, timestamp: Date.now() };
            const contactId = 'contact_' + Math.random().toString(36).substr(2, 9);
            
            // Try Firebase first, fallback to localStorage
            database.ref('emergencyContacts/' + contactId).set(contact)
                .then(() => {
                    clearContactForm();
                    alert('Emergency contact added successfully!');
                })
                .catch((error) => {
                    console.log('Firebase write failed, using localStorage:', error);
                    // Save to localStorage as fallback
                    const localContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '{}');
                    localContacts[contactId] = contact;
                    localStorage.setItem('emergencyContacts', JSON.stringify(localContacts));
                    
                    // Update display
                    displayEmergencyContacts(localContacts);
                    clearContactForm();
                    alert('Emergency contact added successfully (saved locally)!');
                });
        }
        
        function clearContactForm() {
            document.getElementById('contactName').value = '';
            document.getElementById('contactPhone').value = '';
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactRelation').value = 'family';
            closeModal('addContactModal');
        }

        // Resource functions
        function callHelpline(number) {
            if (confirm(`Call ${number}?`)) {
                window.location.href = `tel:${number}`;
            }
        }
        
        // Make default contacts clickable too
        function makeDefaultContactsClickable() {
            const defaultContacts = document.querySelectorAll('.contact-item');
            defaultContacts.forEach(contact => {
                const phoneText = contact.querySelector('small');
                if (phoneText && phoneText.textContent.includes('100')) {
                    contact.querySelector('.alert-status').onclick = () => callContact('100', 'Police Emergency');
                    contact.querySelector('.alert-status').style.cursor = 'pointer';
                    contact.querySelector('.alert-status').textContent = 'CALL';
                } else if (phoneText && phoneText.textContent.includes('1091')) {
                    contact.querySelector('.alert-status').onclick = () => callContact('1091', 'Women Helpline');
                    contact.querySelector('.alert-status').style.cursor = 'pointer';
                    contact.querySelector('.alert-status').textContent = 'CALL';
                }
            });
        }

        function showNearbyStations() {
            alert('🗺️ Nearby Safety Locations:\n\n🚔 Police Station: 0.5 km\n🏥 Hospital: 1.2 km\n🚔 PCR Van: 0.8 km\n\n(This would show actual nearby locations in production)');
        }

        function showSafetyTips() {
            alert('💡 Safety Tips:\n\n• Always inform someone about your location\n• Keep your device charged\n• Trust your instincts\n• Stay in well-lit areas\n• Have emergency numbers ready\n• Use the panic button when in doubt');
        }

        function showNGOs() {
            alert('🤝 Women Support Organizations:\n\n• Women Helpline: 1091\n• Domestic Violence Helpline: 181\n• CHILDLINE: 1098\n• All Women Police Stations\n• Local NGOs and Support Centers\n\n(Contact details would be location-specific)');
        }

        // Simulate hardware communication
        function simulateHardwareData() {
            // This would receive real data from ESP32/Arduino via HTTP POST or MQTT
            const hardwareData = {
                deviceId: 'SG001-2025',
                latitude: currentLocation.lat + (Math.random() - 0.5) * 0.001,
                longitude: currentLocation.lng + (Math.random() - 0.5) * 0.001,
                batteryLevel: Math.floor(Math.random() * 100),
                timestamp: new Date().toISOString()
            };

            console.log('Hardware data received:', hardwareData);
            return hardwareData;
        }

        // Clear deleted markers (optional cleanup function)
        function clearDeletedMarkers() {
            if (confirm('Clear all deleted markers? This will allow them to reappear if they are still sharing location.')) {
                localStorage.removeItem('deletedMarkers');
                alert('Deleted markers list cleared!');
            }
        }
        
        // Initialize the application
        function init() {
            console.log('SafeGuard Women Safety System Initialized');
            console.log('Ready to receive hardware alerts...');
            
            // Make default contacts clickable
            setTimeout(makeDefaultContactsClickable, 1000);

            // Simulate periodic location updates
            setInterval(() => {
                if (isSOSActive) {
                    simulateHardwareData();
                }
            }, 30000); // Every 30 seconds
        }

        // Start the application
        init();

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }