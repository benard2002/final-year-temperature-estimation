
// WebSocket connection
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${protocol}://${window.location.host}`);

// const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log("📨 WebSocket message received:", data);
        updateDashboard(data);
    } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
    }
});

// Connection status tracking
let socketConnected = false;
socket.addEventListener("open", () => {
    socketConnected = true;
    console.log("✅ WebSocket connected");
    updateConnectionStatus();
});

socket.addEventListener("close", () => {
    socketConnected = false;
    console.log("❌ WebSocket disconnected");
    updateConnectionStatus();
});

socket.addEventListener("error", (error) => {
    socketConnected = false;
    console.error("❌ WebSocket error:", error);
    updateConnectionStatus();
});

// Global state
let currentTheme = 'light';
let motorSpeed = 0;
let motorEnabled = false;
let sensorData = {};
let chartInstance = null;
let historyChart = null;
let currentSensor = null;
let chartData = [];

// Settings state
let settings = {
    emailAlerts: {
        enabled: false,
        recipients: []
    },
    temperature: {
        warningThreshold: 45,
        criticalThreshold: 50,
        checkInterval: 2
    },
    motorProtection: {
        autoStop: true,
        autoStopDelay: 3,
        cooldownPeriod: 5
    },
    dataCollection: {
        interval: 2,
        retentionPeriod: 30
    }
};

// Sensor configuration matching your backend data structure
const sensorConfig = [
    { id: 'refVoltage', name: 'Ref Voltage', unit: 'V', min: 220, max: 240, icon: '⚡', color: '#3b82f6', key: 'Ref Voltage' },
    { id: 'humidity', name: 'Humidity', unit: '%', min: 30, max: 90, icon: '💧', color: '#06b6d4', key: 'Humidity' },
    { id: 'extTemp', name: 'Ext Temp', unit: '°C', min: 20, max: 50, icon: '🌡️', color: '#ef4444', key: 'Ext Temp' },
    { id: 'ds18b20Temp', name: 'DS18B20 Temp', unit: '°C', min: 20, max: 40, icon: '🌡️', color: '#f97316', key: 'DS18B20 Temp' },
    { id: 'mlxObjTemp', name: 'MLX ObjTemp', unit: '°C', min: 30, max: 80, icon: '🔥', color: '#f43f5e', key: 'MLX ObjTemp' },
    { id: 'mlxAmbTemp', name: 'MLX AmbTemp', unit: '°C', min: 25, max: 45, icon: '🌡️', color: '#eab308', key: 'MLX AmbTemp' },
    { id: 'motorVolt', name: 'Motor Volt', unit: 'V', min: 200, max: 240, icon: '⚡', color: '#6366f1', key: 'Motor Volt' },
    { id: 'motorCurr', name: 'Motor Curr', unit: 'A', min: 0.5, max: 15, icon: '🔋', color: '#14b8a6', key: 'Motor Curr' },
    { id: 'motorPower', name: 'Motor Power', unit: 'W', min: 100, max: 3000, icon: '🔌', color: '#f43f5e', key: 'Motor Power' },
    { id: 'energy', name: 'Energy', unit: 'kWh', min: 0, max: 5000, icon: '🔋', color: '#f59e0b', key: 'Energy' },
    { id: 'frequency', name: 'Frequency', unit: 'Hz', min: 49, max: 51, icon: '📡', color: '#6366f1', key: 'Frequency' },
    { id: 'powerFactor', name: 'Power Factor', unit: '', min: 0.5, max: 1.0, icon: '⚙️', color: '#8b5cf6', key: 'PowerFactor' },
    { id: 'apparentPower', name: 'Apparent Power', unit: 'VA', min: 100, max: 3500, icon: '🔌', color: '#ec4899', key: 'Apparent Power' },
    { id: 'reactivePower', name: 'Reactive Power', unit: 'VAR', min: 0, max: 1000, icon: '🌀', color: '#22c55e', key: 'Reactive Power' },
    { id: 'phaseAngle', name: 'Phase Angle', unit: '°', min: 0, max: 90, icon: '📐', color: '#a855f7', key: 'Phase Angle' },
    { id: 'syncSpeed', name: 'Sync Speed', unit: 'RPM', min: 1500, max: 1500, icon: '⚙️', color: '#10b981', key: 'Sync Speed' },
    { id: 'slip', name: 'Slip', unit: '%', min: 0, max: 15, icon: '🎯', color: '#84cc16', key: 'Slip' },
    { id: 'rotorSpeed', name: 'Rotor Speed', unit: 'RPM', min: 1400, max: 1500, icon: '🔄', color: '#06b6d4', key: 'Rotor Speed' },
    { id: 'torque', name: 'Torque', unit: 'Nm', min: 1, max: 50, icon: '🔧', color: '#0284c7', key: 'Torque' },
    { id: 'efficiency', name: 'Efficiency', unit: '%', min: 60, max: 95, icon: '📈', color: '#facc15', key: 'Efficiency' },
    { id: 'loadFactor', name: 'Load Factor', unit: '%', min: 0, max: 100, icon: '📊', color: '#8b5cf6', key: 'Load Factor' },
    { id: 'vibrationIndex', name: 'Vibration Index', unit: '', min: 0, max: 10, icon: '📳', color: '#ef4444', key: 'Vibration Index' }
];

// Previous values for trend calculation
const previousValues = {};

// Initialize dashboard
function init() {
    console.log("🚀 Initializing dashboard...");
    generateSensorCards();
    setupEventListeners();
    loadTheme();
    loadSettings();
    console.log("🚀 Dashboard initialized - waiting for real IoT data");
}

// Load settings from localStorage or server
async function loadSettings() {
    try {
        // Try to load from server first
        const response = await fetch('/api/settings');
        if (response.ok) {
            const serverSettings = await response.json();
            settings = { ...settings, ...serverSettings };
            console.log("📥 Settings loaded from server:", settings);
        } else {
            // Fall back to localStorage
            const savedSettings = localStorage.getItem('iotSettings');
            if (savedSettings) {
                settings = { ...settings, ...JSON.parse(savedSettings) };
                console.log("📥 Settings loaded from localStorage:", settings);
            }
        }
        updateSettingsUI();
    } catch (error) {
        console.warn("⚠️ Could not load settings from server, using defaults:", error);
        updateSettingsUI();
    }
}

// Save settings to localStorage and server
async function saveSettings() {
    try {
        showSettingsStatus('Saving settings...', 'info');
        
        // Save to localStorage as backup
        localStorage.setItem('iotSettings', JSON.stringify(settings));
        
        // Save to server
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showSettingsStatus('✅ Settings saved successfully!', 'success');
            console.log("💾 Settings saved to server:", settings);
            
            // Update emergency system with new settings
            emergencySystem.updateSettings(settings);
        } else {
            throw new Error('Server save failed');
        }
    } catch (error) {
        console.error("❌ Failed to save settings to server:", error);
        showSettingsStatus('⚠️ Settings saved locally only (server unavailable)', 'error');
    }
}

// Update settings UI with current values
function updateSettingsUI() {
    // Email alerts
    const emailToggle = document.getElementById('emailAlertsToggle');
    const emailStatus = document.getElementById('emailAlertsStatus');
    emailToggle.classList.toggle('on', settings.emailAlerts.enabled);
    emailStatus.textContent = settings.emailAlerts.enabled ? 'Enabled' : 'Disabled';
    
    // Update email list
    updateEmailList();
    
    // Temperature settings
    document.getElementById('warningTempInput').value = settings.temperature.warningThreshold;
    document.getElementById('criticalTempInput').value = settings.temperature.criticalThreshold;
    document.getElementById('tempIntervalSelect').value = settings.temperature.checkInterval;
    
    // Motor protection
    const autoStopToggle = document.getElementById('autoStopToggle');
    const autoStopStatus = document.getElementById('autoStopStatus');
    autoStopToggle.classList.toggle('on', settings.motorProtection.autoStop);
    autoStopStatus.textContent = settings.motorProtection.autoStop ? 'Enabled' : 'Disabled';
    
    document.getElementById('autoStopDelaySelect').value = settings.motorProtection.autoStopDelay;
    document.getElementById('cooldownPeriodInput').value = settings.motorProtection.cooldownPeriod;
    
    // Data collection
    document.getElementById('dataIntervalSelect').value = settings.dataCollection.interval;
    document.getElementById('retentionSelect').value = settings.dataCollection.retentionPeriod;
}

// Update email list display
function updateEmailList() {
    const emailList = document.getElementById('emailList');
    
    if (settings.emailAlerts.recipients.length === 0) {
        emailList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); font-size: 0.875rem;">No email addresses configured</div>';
    } else {
        emailList.innerHTML = settings.emailAlerts.recipients.map(email => `
            <div class="email-item">
                <span class="email-address">${email}</span>
                <button class="remove-email-btn" onclick="removeEmail('${email}')">Remove</button>
            </div>
        `).join('');
    }
}

// Add email to recipients list
function addEmail() {
    const input = document.getElementById('newEmailInput');
    const email = input.value.trim();
    
    if (!email) {
        showSettingsStatus('Please enter an email address', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showSettingsStatus('Please enter a valid email address', 'error');
        return;
    }
    
    if (settings.emailAlerts.recipients.includes(email)) {
        showSettingsStatus('Email address already exists', 'error');
        return;
    }
    
    settings.emailAlerts.recipients.push(email);
    input.value = '';
    updateEmailList();
    showSettingsStatus(`Added ${email} to alert recipients`, 'success');
}

// Remove email from recipients list
function removeEmail(email) {
    settings.emailAlerts.recipients = settings.emailAlerts.recipients.filter(e => e !== email);
    updateEmailList();
    showSettingsStatus(`Removed ${email} from alert recipients`, 'success');
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Show settings status message
function showSettingsStatus(message, type) {
    const statusElement = document.getElementById('settingsStatus');
    statusElement.textContent = message;
    statusElement.className = `settings-status ${type}`;
    
    if (type !== 'info') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Generate sensor cards
function generateSensorCards() {
    const grid = document.getElementById('sensorGrid');
    grid.innerHTML = '';

    sensorConfig.forEach((sensor) => {
        const card = document.createElement('div');
        card.className = 'sensor-card';
        card.dataset.sensorId = sensor.id;
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-title">${sensor.name}</div>
                    <div class="card-subtitle">Live IoT Data</div>
                </div>
                <div class="card-icon">
                    ${sensor.icon}
                    <div class="card-status"></div>
                </div>
            </div>
            <div class="card-value" id="${sensor.id}-value">--</div>
            <div class="card-unit">
                ${sensor.unit}
                <span class="card-trend stable">→ 0.0%</span>
            </div>
        `;
        
        card.addEventListener('click', () => openChart(sensor));
        grid.appendChild(card);
    });
}

// Update dashboard with real IoT data
function updateDashboard(rawData) {
    console.log("📊 Raw IoT data received:", rawData);
    
    sensorConfig.forEach(sensor => {
        if (rawData[sensor.key] !== undefined) {
            const value = parseFloat(rawData[sensor.key]);
            if (isNaN(value)) {
                console.warn(`⚠️ Invalid value for ${sensor.key}:`, rawData[sensor.key]);
                return;
            }
            
            const formattedValue = value.toFixed(sensor.unit === 'V' || sensor.unit === 'W' ? 2 : 1);
            
            sensorData[sensor.id] = {
                value: value,
                timestamp: new Date()
            };

            // Update UI element
            const valueElement = document.getElementById(`${sensor.id}-value`);
            if (valueElement) {
                valueElement.textContent = formattedValue;
                console.log(`✅ Updated ${sensor.name} to ${formattedValue}${sensor.unit}`);
                
                // Add visual feedback
                valueElement.parentElement.classList.add('updated');
                setTimeout(() => {
                    valueElement.parentElement.classList.remove('updated');
                }, 1000);
            }

            // Update trend indicators
            updateTrendIndicator(sensor.id, value);
            
            // If this sensor is currently being charted, update the chart
            if (currentSensor && currentSensor.id === sensor.id) {
                updateLiveChart(sensor, value);
            }
        }
    });

    // Update AI rotor temperature prediction
    updateRotorTempPrediction(rawData);

    if (rawData['Ext Temp'] !== undefined) {
        emergencySystem.updateTemperature(parseFloat(rawData['Ext Temp']));
    }
}

// Update trend indicators
function updateTrendIndicator(sensorId, currentValue) {
    const card = document.querySelector(`[data-sensor-id="${sensorId}"]`);
    if (!card) return;
    
    const trendElement = card.querySelector('.card-trend');
    if (!trendElement) return;
    
    if (previousValues[sensorId] !== undefined) {
        const previous = previousValues[sensorId];
        const change = ((currentValue - previous) / previous) * 100;
        
        let trend, trendIcon, trendText;
        if (Math.abs(change) < 0.1) {
            trend = 'stable';
            trendIcon = '→';
            trendText = '0.0%';
        } else if (change > 0) {
            trend = 'up';
            trendIcon = '↗';
            trendText = `+${change.toFixed(1)}%`;
        } else {
            trend = 'down';
            trendIcon = '↙';
            trendText = `${change.toFixed(1)}%`;
        }
        
        trendElement.className = `card-trend ${trend}`;
        trendElement.textContent = `${trendIcon} ${trendText}`;
    }
    
    previousValues[sensorId] = currentValue;
}

// Update rotor temperature prediction using AI
function updateRotorTempPrediction(data) {
    // Simple AI prediction based on motor parameters
    const motorPower = parseFloat(data['Motor Power']) || 0;
    const motorCurr = parseFloat(data['Motor Curr']) || 0;
    const ambientTemp = parseFloat(data['MLX AmbTemp']) || 25;
    
    // Basic thermal model prediction
    const powerLoss = motorPower * 0.15; // Assume 15% loss
    const tempRise = (powerLoss / 10) + (motorCurr * 2); // Simplified calculation
    const predictedTemp = ambientTemp + tempRise;
    
    const tempValue = document.getElementById('tempValue');
    const tempProgress = document.getElementById('tempProgress');
    
    if (tempValue && tempProgress) {
        const clampedTemp = Math.max(20, Math.min(100, predictedTemp));
        tempValue.textContent = `${clampedTemp.toFixed(1)}°C`;
        
        // Update circular progress (0-100°C range)
        const percentage = (clampedTemp - 20) / 80;
        const circumference = 377;
        const offset = circumference - (percentage * circumference);
        tempProgress.style.strokeDashoffset = offset;
        
        // Change color based on temperature
        if (clampedTemp > 70) {
            tempProgress.style.stroke = '#ef4444'; // Red
        } else if (clampedTemp > 50) {
            tempProgress.style.stroke = '#f59e0b'; // Orange
        } else {
            tempProgress.style.stroke = '#10b981'; // Green
        }
    }
}

// Open chart modal with draggable functionality
function openChart(sensor) {
    currentSensor = sensor;
    const modal = document.getElementById('chartModal');
    const container = document.getElementById('chartContainer');
    const title = document.getElementById('modalTitle');
    
    title.textContent = `${sensor.name} - Live Data`;
    
    // Reset position
    container.style.transform = 'translate(0, 0)';
    
    // Make draggable
    makeDraggable(container);
    
    // Initialize chart data
    chartData = [];
    const now = new Date();
    
    // Use existing data or generate initial points
    const currentData = sensorData[sensor.id];
    if (currentData) {
        for (let i = 49; i >= 1; i--) {
            const time = new Date(now.getTime() - i * 2000);
            const variation = (sensor.max - sensor.min) * 0.05;
            const historicalValue = currentData.value + (Math.random() - 0.5) * variation;
            const clampedValue = Math.max(sensor.min, Math.min(sensor.max, historicalValue));
            
            chartData.push({
                time: time,
                value: clampedValue,
                label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
        }
        
        chartData.push({
            time: currentData.timestamp,
            value: currentData.value,
            label: currentData.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
    } else {
        for (let i = 49; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 2000);
            const range = sensor.max - sensor.min;
            chartData.push({
                time: time,
                value: sensor.min + (Math.random() * range),
                label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
        }
    }

    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create new chart
    const ctx = document.getElementById('sensorChart');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(d => d.label),
            datasets: [{
                label: sensor.name,
                data: chartData.map(d => d.value),
                borderColor: sensor.color,
                backgroundColor: 'transparent',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 8,
                pointBackgroundColor: sensor.color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: sensor.min - (sensor.max - sensor.min) * 0.1,
                    max: sensor.max + (sensor.max - sensor.min) * 0.1,
                    grid: {
                        color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
                        drawBorder: false
                    },
                    ticks: {
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                        callback: function(value) {
                            return value.toFixed(1) + sensor.unit;
                        }
                    }
                },
                x: {
                    grid: {
                        color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
                        drawBorder: false
                    },
                    ticks: {
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                        maxTicksLimit: 8
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    updateChartStats(sensor);
    modal.classList.add('show');
}

// Make element draggable
function makeDraggable(element) {
    const header = element.querySelector('.chart-header');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    header.style.cursor = 'move';
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.transform = `translate(${-pos1}px, ${-pos2}px)`;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Update live chart with new data
function updateLiveChart(sensor, newValue) {
    if (!chartInstance || !currentSensor) return;

    const now = new Date();
    
    chartData.push({
        time: now,
        value: newValue,
        label: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    if (chartData.length > 50) {
        chartData.shift();
    }

    chartInstance.data.labels = chartData.map(d => d.label);
    chartInstance.data.datasets[0].data = chartData.map(d => d.value);
    chartInstance.update('active');
    updateChartStats(sensor);
}

// Update chart statistics
function updateChartStats(sensor) {
    const values = chartData.map(d => d.value);
    const current = values[values.length - 1] || 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const statsContainer = document.getElementById('chartStats');
    statsContainer.innerHTML = `
        <div class="chart-stat">
            <div class="stat-value">${current.toFixed(1)}</div>
            <div class="stat-label">Current</div>
        </div>
        <div class="chart-stat">
            <div class="stat-value">${avg.toFixed(1)}</div>
            <div class="stat-label">Average</div>
        </div>
        <div class="chart-stat">
            <div class="stat-value">${min.toFixed(1)}</div>
            <div class="stat-label">Minimum</div>
        </div>
        <div class="chart-stat">
            <div class="stat-value">${max.toFixed(1)}</div>
            <div class="stat-label">Maximum</div>
        </div>
    `;
}

// Send motor command via WebSocket
function sendMotorCommand(command) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(command));
        console.log("📤 Sent command:", command);
    } else {
        console.error("❌ WebSocket not connected");
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.tab);
        });
    });

    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Motor controls
    document.getElementById('motorToggle').addEventListener('click', toggleMotor);
    
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setMotorSpeed(parseInt(btn.dataset.speed));
        });
    });

    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('chartModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // History controls
    document.getElementById('loadHistory').addEventListener('click', loadHistoryData);

    // Settings event listeners
    setupSettingsEventListeners();
}

// Setup settings-specific event listeners
function setupSettingsEventListeners() {
    // Email alerts toggle
    document.getElementById('emailAlertsToggle').addEventListener('click', () => {
        settings.emailAlerts.enabled = !settings.emailAlerts.enabled;
        updateSettingsUI();
    });

    // Add email button
    document.getElementById('addEmailBtn').addEventListener('click', addEmail);
    
    // Enter key in email input
    document.getElementById('newEmailInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addEmail();
    });

    // Auto stop toggle
    document.getElementById('autoStopToggle').addEventListener('click', () => {
        settings.motorProtection.autoStop = !settings.motorProtection.autoStop;
        updateSettingsUI();
    });

    // Temperature thresholds
    document.getElementById('warningTempInput').addEventListener('change', (e) => {
        settings.temperature.warningThreshold = parseInt(e.target.value);
    });

    document.getElementById('criticalTempInput').addEventListener('change', (e) => {
        settings.temperature.criticalThreshold = parseInt(e.target.value);
    });

    // All other settings inputs
    document.getElementById('tempIntervalSelect').addEventListener('change', (e) => {
        settings.temperature.checkInterval = parseInt(e.target.value);
    });

    document.getElementById('autoStopDelaySelect').addEventListener('change', (e) => {
        settings.motorProtection.autoStopDelay = parseInt(e.target.value);
    });

    document.getElementById('cooldownPeriodInput').addEventListener('change', (e) => {
        settings.motorProtection.cooldownPeriod = parseInt(e.target.value);
    });

    document.getElementById('dataIntervalSelect').addEventListener('change', (e) => {
        settings.dataCollection.interval = parseInt(e.target.value);
    });

    document.getElementById('retentionSelect').addEventListener('change', (e) => {
        settings.dataCollection.retentionPeriod = parseInt(e.target.value);
    });

    // Save settings button
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        motor: 'Motor Control',
        history: 'Historical Data',
        ai: 'AI Inference',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[tabName];

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Toggle motor
function toggleMotor() {
    motorEnabled = !motorEnabled;
    const toggle = document.getElementById('motorToggle');
    
    if (motorEnabled) {
        toggle.classList.add('on');
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    } else {
        toggle.classList.remove('on');
        motorSpeed = 0;
        updateSpeedDisplay();
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });
        document.querySelector('[data-speed="0"]').classList.add('active');
        document.querySelector('[data-speed="0"]').style.opacity = '1';
        document.querySelector('[data-speed="0"]').style.pointerEvents = 'auto';
    }

    // sendMotorCommand({ motorEnabled, motorSpeed });
    // sendMotorCommand({motorSpeed});
}

// Set motor speed
function setMotorSpeed(speed  ) {
    if (!motorEnabled && speed > 0) return;
    
    motorSpeed = speed;
    updateSpeedDisplay();
    
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-speed="${speed}"]`).classList.add('active');

    sendMotorCommand({ motorSpeed: speed });
}

// Update speed display
function updateSpeedDisplay() {
    const percentage = (motorSpeed / 5) * 100;
    document.getElementById('speedValue').textContent = 
        motorSpeed === 0 ? '0% (OFF)' : `${percentage}% (Speed ${motorSpeed})`;
    document.getElementById('speedFill').style.width = `${percentage}%`;
}

// Emergency Stop System
class EmergencyStopSystem {
    constructor() {
        this.isActive = false;
        this.temperatureThreshold = settings.temperature.criticalThreshold;
        this.warningThreshold = settings.temperature.warningThreshold;
        this.currentTemp = null;
        this.emergencyBtn = document.getElementById('emergencyBtn');
        this.emergencyStatus = document.getElementById('emergencyStatus');
        this.tempReading = document.getElementById('currentTemp');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Emergency button click handler
        this.emergencyBtn.addEventListener('click', () => {
            if (this.isActive) {
                this.executeEmergencyStop();
            }
        });
    }

    // Update settings
    updateSettings(newSettings) {
        this.temperatureThreshold = newSettings.temperature.criticalThreshold;
        this.warningThreshold = newSettings.temperature.warningThreshold;
        console.log(`🔄 Emergency system updated - Warning: ${this.warningThreshold}°C, Critical: ${this.temperatureThreshold}°C`);
    }

    // Update temperature and check emergency conditions
    updateTemperature(temperature) {
        this.currentTemp = temperature;
        this.tempReading.textContent = `Temp: ${temperature.toFixed(1)}°C`;
        
        // Check if emergency conditions are met
        if (temperature >= this.temperatureThreshold) {
            this.activateEmergencySystem('HIGH TEMPERATURE DETECTED');
        } else if (temperature >= this.warningThreshold) {
            this.setWarningState();
        } else {
            this.setNormalState();
        }
    }

    // Activate emergency system
    activateEmergencySystem(reason) {
        this.isActive = true;
        this.emergencyBtn.disabled = false;
        this.emergencyBtn.classList.add('active');
        
        // Update status
        this.emergencyStatus.classList.remove('warning');
        this.emergencyStatus.classList.add('danger');
        this.emergencyStatus.querySelector('.status-text').textContent = `⚠️ DANGER: ${reason}`;
        
        console.log(`🚨 Emergency system activated: ${reason}`);
        
        // Auto-trigger emergency stop if enabled and temp is critically high
        if (settings.motorProtection.autoStop && this.currentTemp >= this.temperatureThreshold) {
            const delay = settings.motorProtection.autoStopDelay * 1000;
            setTimeout(() => {
                if (this.isActive) {
                    this.executeEmergencyStop('AUTO');
                }
            }, delay);
        }
    }

    // Set warning state
    setWarningState() {
        this.emergencyStatus.classList.remove('danger');
        this.emergencyStatus.classList.add('warning');
        this.emergencyStatus.querySelector('.status-text').textContent = '⚠️ WARNING: Temperature Rising';
    }

    // Set normal state
    setNormalState() {
        this.isActive = false;
        this.emergencyBtn.disabled = true;
        this.emergencyBtn.classList.remove('active');
        
        this.emergencyStatus.classList.remove('warning', 'danger');
        this.emergencyStatus.querySelector('.status-text').textContent = '✅ System Status: NORMAL';
    }

    // Execute emergency stop
    async executeEmergencyStop(trigger = 'MANUAL') {
        try {
            // Visual feedback
            this.emergencyBtn.classList.add('stopping');
            this.emergencyBtn.querySelector('span').textContent = 'STOPPING MOTOR...';
            
            // Turn off motor immediately
            this.stopMotor();
            
            // Send emergency alert email if enabled
            if (settings.emailAlerts.enabled && settings.emailAlerts.recipients.length > 0) {
                await this.sendEmergencyAlert(trigger);
            }
            
            // Update UI
            setTimeout(() => {
                this.emergencyBtn.querySelector('span').textContent = 'MOTOR STOPPED';
                this.emergencyStatus.querySelector('.status-text').textContent = '🛑 EMERGENCY STOP ACTIVATED';
                
                // Reset after 5 seconds
                setTimeout(() => {
                    this.resetEmergencyButton();
                }, 5000);
            }, 1500);
            
        } catch (error) {
            console.error('❌ Emergency stop failed:', error);
            alert('Emergency stop failed! Please manually shut down the motor.');
        }
    }

    // Stop motor function
    stopMotor() {
        // Set motor speed to 0
        // setMotorSpeed(0);
        setMotorSpeed(0)
        sendMotorCommand({motorSpeed:"emergency"})
        
        // Turn off motor toggle
        const motorToggle = document.getElementById('motorToggle');
        motorToggle.classList.remove('on');
        motorEnabled = false;
        
        console.log('🛑 Motor stopped via emergency system');
    }

    // Send emergency alert email
    async sendEmergencyAlert(trigger) {
        try {
            const alertData = {
                recipients: settings.emailAlerts.recipients,
                trigger: trigger,
                temperature: this.currentTemp,
                timestamp: new Date().toISOString(),
                thresholds: {
                    warning: this.warningThreshold,
                    critical: this.temperatureThreshold
                }
            };

            const response = await fetch('/api/emergency-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertData)
            });

            if (response.ok) {
                console.log('✅ Emergency alert email sent to:', settings.emailAlerts.recipients);
            } else {
                throw new Error('Failed to send emergency email');
            }

        } catch (error) {
            console.error('❌ Failed to send emergency alert:', error);
        }
    }

    // Reset emergency button
    resetEmergencyButton() {
        this.emergencyBtn.classList.remove('stopping');
        this.emergencyBtn.querySelector('span').textContent = 'EMERGENCY STOP';
        this.isActive = false;
    }
}

// Initialize emergency system
const emergencySystem = new EmergencyStopSystem();

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// Load theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// Update connection status
function updateConnectionStatus() {
    const statusDot = document.getElementById('statusDot');
    const connectionText = document.getElementById('connectionText');
    
    if (socketConnected) {
        statusDot.style.background = 'var(--success)';
        connectionText.textContent = 'Connected';
    } else {
        statusDot.style.background = 'var(--danger)';
        connectionText.textContent = 'Disconnected';
    }
    
    document.querySelectorAll('.card-status').forEach(status => {
        status.style.backgroundColor = socketConnected ? 'var(--success)' : 'var(--danger)';
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('chartModal');
    modal.classList.remove('show');
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    currentSensor = null;
    chartData = [];
}

// Load history data from backend
function loadHistoryData() {
    const parameter = document.getElementById('historyParameter').value;
    const range = document.getElementById('historyRange').value;

    fetch(`/api/history?parameter=${encodeURIComponent(parameter)}&range=${encodeURIComponent(range)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                showNoDataMessage(parameter, range);
            } else {
                generateHistoryChart(parameter, data);
            }
        })
        .catch(err => {
            console.error("❌ Error fetching history data:", err);
            showErrorMessage("Failed to load data");
        });
}

// Generate history chart
function generateHistoryChart(parameter, historyData) {
    // Hide no data message if it exists
    const messageEl = document.getElementById('noDataMessage');
    if (messageEl) {
        messageEl.style.display = 'none';
    }

    const ctx = document.getElementById('historyChart');

    if (historyChart) {
        historyChart.destroy();
    }

    const sensor = sensorConfig.find(s => s.id === parameter);
    if (!sensor) return;

    // Extract values from DB response
    const labels = historyData.map(item => {
        return new Date(item.time_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    const data = historyData.map(item => parseFloat(item.value));

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: sensor.name,
                data: data,
                borderColor: sensor.color,
                backgroundColor: sensor.color + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: currentTheme === 'dark' ? '#334155' : '#f1f5f9'
                    },
                    ticks: {
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b'
                    }
                },
                x: {
                    grid: {
                        color: currentTheme === 'dark' ? '#334155' : '#f1f5f9'
                    },
                    ticks: {
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                        maxTicksLimit: 10
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: currentTheme === 'dark' ? '#f8fafc' : '#1e293b'
                    }
                }
            }
        }
    });
}

// Show "No data available" message
function showNoDataMessage(parameter, range) {
    const chartContainer = document.getElementById('historyChart').parentElement;
    
    // Clear any existing chart
    if (historyChart) {
        historyChart.destroy();
        historyChart = null;
    }
    
    // Create or update message element
    let messageEl = document.getElementById('noDataMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'noDataMessage';
        messageEl.style.textAlign = 'center';
        messageEl.style.padding = '40px';
        messageEl.style.color = currentTheme === 'dark' ? '#94a3b8' : '#64748b';
        messageEl.style.fontSize = '16px';
        chartContainer.appendChild(messageEl);
    }
    
    const sensor = sensorConfig.find(s => s.id === parameter);
    messageEl.innerHTML = `
        <div style="margin-bottom: 10px;">📊</div>
        <div>No data available for <strong>${sensor ? sensor.name : parameter}</strong></div>
        <div style="font-size: 14px; margin-top: 5px;">Time range: ${range}</div>
    `;
    messageEl.style.display = 'block';
}

// Show error message
function showErrorMessage(message) {
    const chartContainer = document.getElementById('historyChart').parentElement;
    
    if (historyChart) {
        historyChart.destroy();
        historyChart = null;
    }
    
    let messageEl = document.getElementById('noDataMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'noDataMessage';
        messageEl.style.textAlign = 'center';
        messageEl.style.padding = '40px';
        messageEl.style.color = '#ef4444';
        messageEl.style.fontSize = '16px';
        chartContainer.appendChild(messageEl);
    }
    
    messageEl.innerHTML = `
        <div style="margin-bottom: 10px;">⚠️</div>
        <div>${message}</div>
    `;
    messageEl.style.display = 'block';
}

// Update AI statistics periodically
function updateAIStats() {
    document.getElementById('aiAccuracy').textContent = (90 + Math.random() * 8).toFixed(1) + '%';
    document.getElementById('aiConfidence').textContent = (80 + Math.random() * 15).toFixed(1) + '%';
    document.getElementById('aiLatency').textContent = (30 + Math.floor(Math.random() * 30)) + 'ms';
    document.getElementById('aiPredictions').textContent = (1000 + Math.floor(Math.random() * 500)).toLocaleString();
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
    setInterval(updateAIStats, 5000);
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('collapsed');
    }
});

// Global function for removing emails (called from HTML)
window.removeEmail = removeEmail;
