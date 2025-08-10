// // const ws = new WebSocket(`ws://${window.location.host}`);
// // ws.onmessage = (event) => {
// //     const data = JSON.parse(event.data);
// //     console.log("Live data:", data);
// //     // Here we’ll update cards + charts
// // };


// const socket = new WebSocket(`ws://${window.location.host}`);

// socket.addEventListener("message", (event) => {
//   const data = JSON.parse(event.data);
//   updateDashboard(data);
// });





// // Global state
// let currentTheme = 'light';
// let motorSpeed = 0;
// let motorEnabled = false;
// let sensorData = {};
// let chartInstance = null;
// let updateInterval = null;
// let liveChartInterval = null;
// let currentSensor = null;
// let chartData = [];
// let sidebarDocked = false;
// let sidebarCollapsed = false;

// // Sensor configuration with icons and colors
// const sensorConfig = [
//   { id: 'refVoltage', name: 'Ref Voltage', unit: 'V', min: 220, max: 240, icon: '⚡', color: '#3b82f6' },
//   { id: 'humidity', name: 'Humidity', unit: '%', min: 30, max: 90, icon: '💧', color: '#06b6d4' },
//   { id: 'extTemp', name: 'Ext Temp', unit: '°C', min: 20, max: 45, icon: '🌡️', color: '#ef4444' },
//   { id: 'ds18b20Temp', name: 'DS18B20 Temp', unit: '°C', min: 20, max: 45, icon: '🌡️', color: '#f97316' },
//   { id: 'mlxObjTemp', name: 'MLX ObjTemp', unit: '°C', min: 30, max: 80, icon: '🔥', color: '#f43f5e' },
//   { id: 'mlxAmbTemp', name: 'MLX AmbTemp', unit: '°C', min: 25, max: 45, icon: '🌡️', color: '#eab308' },
//   { id: 'motorVolt', name: 'Motor Volt', unit: 'V', min: 210, max: 240, icon: '⚡', color: '#6366f1' },
//   { id: 'motorCurr', name: 'Motor Curr', unit: 'A', min: 0.5, max: 15, icon: '🔋', color: '#14b8a6' },
//   { id: 'motorPower', name: 'Motor Power', unit: 'W', min: 100, max: 3000, icon: '🔌', color: '#f43f5e' },
//   { id: 'energy', name: 'Energy', unit: 'kWh', min: 0, max: 20000, icon: '🔋', color: '#f59e0b' },
//   { id: 'frequency', name: 'Frequency', unit: 'Hz', min: 49.5, max: 50.5, icon: '📡', color: '#6366f1' },
//   { id: 'powerFactor', name: 'PowerFactor', unit: '', min: 0.7, max: 1.0, icon: '⚙️', color: '#8b5cf6' },
//   { id: 'apparentPower', name: 'Apparent Power', unit: 'VA', min: 100, max: 3500, icon: '🔌', color: '#ec4899' },
//   { id: 'reactivePower', name: 'Reactive Power', unit: 'VAR', min: 0, max: 1000, icon: '🌀', color: '#22c55e' },
//   { id: 'phaseAngle', name: 'Phase Angle', unit: '°', min: 0, max: 90, icon: '📐', color: '#a855f7' },
//   { id: 'syncSpeed', name: 'Sync Speed', unit: 'RPM', min: 1500, max: 1500, icon: '⚙️', color: '#10b981' },
//   { id: 'slip', name: 'Slip', unit: '%', min: 0, max: 10, icon: '🎯', color: '#84cc16' },
//   { id: 'rotorSpeed', name: 'Rotor Speed', unit: 'RPM', min: 1300, max: 1500, icon: '🔄', color: '#06b6d4' },
//   { id: 'torque', name: 'Torque', unit: 'Nm', min: 1, max: 50, icon: '🔧', color: '#0284c7' },
//   { id: 'efficiency', name: 'Efficiency', unit: '%', min: 60, max: 95, icon: '📈', color: '#facc15' }
// ];


// // Initialize dashboard
// function init() {
//     generateSensorCards();
//     generateHeatMap();
//     startDataSimulation();
//     setupEventListeners();
//     loadTheme();
// }

// // Generate sensor cards
// function generateSensorCards() {
//     const grid = document.getElementById('sensorGrid');
//     grid.innerHTML = '';

//     sensorConfig.forEach((sensor, index) => {
//         const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';
//         const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↙' : '→';
//         const trendText = trend === 'up' ? '+2.1%' : trend === 'down' ? '-1.8%' : '0.0%';
        
//         const card = document.createElement('div');
//         card.className = 'sensor-card';
//         card.dataset.sensorId = sensor.id;
//         card.innerHTML = `
//             <div class="card-header">
//                 <div class="card-title-section">
//                     <div class="card-title">${sensor.name}</div>
//                     <div class="card-subtitle">Live Sensor Data</div>
//                 </div>
//                 <div class="card-icon">
//                     ${sensor.icon}
//                     <div class="card-status"></div>
//                 </div>
//             </div>
//             <div class="card-value" id="${sensor.id}-value">--</div>
//             <div class="card-unit">
//                 ${sensor.unit}
//                 <span class="card-trend ${trend}">${trendIcon} ${trendText}</span>
//             </div>
//         `;
        
//         card.addEventListener('click', () => openChart(sensor));
//         grid.appendChild(card);
//     });
// }

// // Generate heat map
// function generateHeatMap() {
//     const grid = document.getElementById('heatGrid');
//     grid.innerHTML = '';

//     for (let i = 0; i < 100; i++) {
//         const cell = document.createElement('div');
//         cell.className = 'heat-cell';
//         cell.style.backgroundColor = getHeatColor(Math.random());
//         grid.appendChild(cell);
//     }
// }

// // Get heat map color
// function getHeatColor(intensity) {
//     const colors = [
//         '#3b82f6', // Blue (cool)
//         '#10b981', // Green
//         '#f59e0b', // Yellow
//         '#f97316', // Orange
//         '#ef4444'  // Red (hot)
//     ];
//     const index = Math.floor(intensity * (colors.length - 1));
//     return colors[index];
// }

// // Simulate sensor data
// function simulateSensorData() {
//     sensorConfig.forEach(sensor => {
//         const range = sensor.max - sensor.min;
//         const value = sensor.min + (Math.random() * range);
//         const formattedValue = value.toFixed(sensor.unit === 'V' || sensor.unit === 'W' ? 2 : 1);
        
//         sensorData[sensor.id] = {
//             value: parseFloat(formattedValue),
//             timestamp: new Date()
//         };

//         // Update UI
//         const valueElement = document.getElementById(`${sensor.id}-value`);
//         if (valueElement) {
//             valueElement.textContent = formattedValue;
//         }
//     });

//     // Update heat map
//     updateHeatMap();
// }

// // Update heat map
// function updateHeatMap() {
//     const cells = document.querySelectorAll('.heat-cell');
//     cells.forEach(cell => {
//         cell.style.backgroundColor = getHeatColor(Math.random());
//     });
// }

// // Start data simulation
// function startDataSimulation() {
//     simulateSensorData();
//     updateInterval = setInterval(simulateSensorData, 2000);
// }

// // Open chart modal with live updates
// function openChart(sensor) {
//     currentSensor = sensor;
//     const modal = document.getElementById('chartModal');
//     const title = document.getElementById('modalTitle');
//     title.textContent = `${sensor.name} - Live Data`;

//     // Initialize chart data array
//     chartData = [];
//     const now = new Date();
    
//     // Generate initial 50 data points
//     for (let i = 49; i >= 0; i--) {
//         const time = new Date(now.getTime() - i * 2000); // 2 second intervals
//         const range = sensor.max - sensor.min;
//         chartData.push({
//             time: time,
//             value: sensor.min + (Math.random() * range),
//             label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
//         });
//     }

//     // Destroy existing chart
//     if (chartInstance) {
//         chartInstance.destroy();
//     }

//     // Create new chart
//     const ctx = document.getElementById('sensorChart');
//     chartInstance = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: chartData.map(d => d.label),
//             datasets: [{
//                 label: sensor.name,
//                 data: chartData.map(d => d.value),
//                 borderColor: sensor.color,
//                 backgroundColor: 'transparent',
//                 borderWidth: 3,
//                 fill: false,
//                 tension: 0.4,
//                 pointRadius: 3,
//                 pointHoverRadius: 8,
//                 pointBackgroundColor: sensor.color,
//                 pointBorderColor: '#ffffff',
//                 pointBorderWidth: 2,
//                 pointHoverBackgroundColor: sensor.color,
//                 pointHoverBorderColor: '#ffffff',
//                 pointHoverBorderWidth: 3,
//                 shadowColor: sensor.color,
//                 shadowBlur: 10
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             animation: {
//                 duration: 750,
//                 easing: 'easeInOutQuart'
//             },
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     min: sensor.min - (sensor.max - sensor.min) * 0.1,
//                     max: sensor.max + (sensor.max - sensor.min) * 0.1,
//                     grid: {
//                         color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
//                         drawBorder: false,
//                         lineWidth: 1
//                     },
//                     ticks: {
//                         color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
//                         callback: function(value) {
//                             return value.toFixed(1) + sensor.unit;
//                         },
//                         font: {
//                             size: 12,
//                             weight: '500'
//                         },
//                         padding: 8
//                     },
//                     border: {
//                         display: false
//                     }
//                 },
//                 x: {
//                     grid: {
//                         color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
//                         drawBorder: false,
//                         lineWidth: 1
//                     },
//                     ticks: {
//                         color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
//                         maxTicksLimit: 8,
//                         font: {
//                             size: 11,
//                             weight: '500'
//                         },
//                         padding: 8
//                     },
//                     border: {
//                         display: false
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
//                     titleColor: currentTheme === 'dark' ? '#f8fafc' : '#1e293b',
//                     bodyColor: currentTheme === 'dark' ? '#cbd5e1' : '#64748b',
//                     borderColor: sensor.color,
//                     borderWidth: 2,
//                     cornerRadius: 12,
//                     displayColors: false,
//                     titleFont: {
//                         size: 14,
//                         weight: '600'
//                     },
//                     bodyFont: {
//                         size: 13,
//                         weight: '500'
//                     },
//                     padding: 12,
//                     caretPadding: 8,
//                     callbacks: {
//                         title: function(context) {
//                             return context[0].label;
//                         },
//                         label: function(context) {
//                             return `${sensor.name}: ${context.parsed.y.toFixed(2)}${sensor.unit}`;
//                         }
//                     }
//                 }
//             },
//             interaction: {
//                 intersect: false,
//                 mode: 'index'
//             },
//             elements: {
//                 line: {
//                     borderCapStyle: 'round',
//                     borderJoinStyle: 'round'
//                 },
//                 point: {
//                     hoverBackgroundColor: sensor.color,
//                     hoverBorderWidth: 3
//                 }
//             }
//         }
//     });

//     // Update chart stats
//     updateChartStats(sensor);

//     // Start live updates
//     if (liveChartInterval) {
//         clearInterval(liveChartInterval);
//     }
    
//     liveChartInterval = setInterval(() => {
//         updateLiveChart(sensor);
//     }, 2000); // Update every 2 seconds

//     modal.classList.add('show');
// }

// // Update live chart with new data
// function updateLiveChart(sensor) {
//     if (!chartInstance || !currentSensor) return;

//     const now = new Date();
//     const range = sensor.max - sensor.min;
//     const newValue = sensor.min + (Math.random() * range);
    
//     // Add new data point
//     chartData.push({
//         time: now,
//         value: newValue,
//         label: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
//     });

//     // Keep only last 50 points
//     if (chartData.length > 50) {
//         chartData.shift();
//     }

//     // Update chart with smooth animation
//     chartInstance.data.labels = chartData.map(d => d.label);
//     chartInstance.data.datasets[0].data = chartData.map(d => d.value);
//     chartInstance.data.datasets[0].borderColor = sensor.color;
//     chartInstance.data.datasets[0].pointBackgroundColor = sensor.color;
//     chartInstance.data.datasets[0].pointHoverBackgroundColor = sensor.color;
//     chartInstance.options.plugins.tooltip.borderColor = sensor.color;
    
//     chartInstance.update('active'); // Smooth animation for live updates

//     // Update stats
//     updateChartStats(sensor);
// }

// // Update chart statistics
// function updateChartStats(sensor) {
//     const values = chartData.map(d => d.value);
//     const current = values[values.length - 1] || 0;
//     const min = Math.min(...values);
//     const max = Math.max(...values);
//     const avg = values.reduce((a, b) => a + b, 0) / values.length;

//     const statsContainer = document.getElementById('chartStats');
//     statsContainer.innerHTML = `
//         <div class="chart-stat">
//             <div class="stat-value">${current.toFixed(1)}</div>
//             <div class="stat-label">Current</div>
//         </div>
//         <div class="chart-stat">
//             <div class="stat-value">${avg.toFixed(1)}</div>
//             <div class="stat-label">Average</div>
//         </div>
//         <div class="chart-stat">
//             <div class="stat-value">${min.toFixed(1)}</div>
//             <div class="stat-label">Minimum</div>
//         </div>
//         <div class="chart-stat">
//             <div class="stat-value">${max.toFixed(1)}</div>
//             <div class="stat-label">Maximum</div>
//         </div>
//     `;
// }

// // Setup event listeners
// function setupEventListeners() {
//     // Menu toggle
//     document.getElementById('menuToggle').addEventListener('click', () => {
//         toggleSidebar();
//     });

//     // Dock controls
//     document.getElementById('dockBtn').addEventListener('click', () => {
//         toggleDock();
//     });

//     document.getElementById('collapseBtn').addEventListener('click', () => {
//         collapseSidebar();
//     });

//     // Theme toggle
//     document.getElementById('themeToggle').addEventListener('click', toggleTheme);

//     // Motor toggle
//     document.getElementById('motorToggle').addEventListener('click', toggleMotor);

//     // Navigation tabs
//     document.querySelectorAll('.nav-tab').forEach(tab => {
//         tab.addEventListener('click', (e) => {
//             e.preventDefault();
//             switchTab(tab.dataset.tab);
//         });
//     });

//     // Motor speed controls
//     document.querySelectorAll('.speed-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             if (motorEnabled) {
//                 setMotorSpeed(parseInt(btn.dataset.speed));
//             }
//         });
//     });

//     // Modal close
//     document.getElementById('closeModal').addEventListener('click', closeModal);
//     document.getElementById('chartModal').addEventListener('click', (e) => {
//         if (e.target === e.currentTarget) closeModal();
//     });

//     // Click outside sidebar on mobile
//     document.addEventListener('click', (e) => {
//         if (window.innerWidth <= 768 && !sidebarDocked) {
//             const sidebar = document.getElementById('sidebar');
//             const menuToggle = document.getElementById('menuToggle');
//             const dockControls = sidebar.querySelector('.dock-controls');
            
//             if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !dockControls.contains(e.target)) {
//                 sidebar.classList.add('collapsed');
//                 sidebarCollapsed = true;
//                 updateMainContent();
//             }
//         }
//     });
// }

// // Toggle sidebar
// function toggleSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     sidebarCollapsed = !sidebarCollapsed;
    
//     if (sidebarCollapsed) {
//         sidebar.classList.add('collapsed');
//     } else {
//         sidebar.classList.remove('collapsed');
//     }
    
//     updateMainContent();
// }

// // Toggle dock
// function toggleDock() {
//     const sidebar = document.getElementById('sidebar');
//     const dockBtn = document.getElementById('dockBtn');
    
//     sidebarDocked = !sidebarDocked;
    
//     if (sidebarDocked) {
//         sidebar.classList.add('docked');
//         dockBtn.innerHTML = '📍';
//         dockBtn.title = 'Unpin Sidebar';
//         sidebarCollapsed = false;
//         sidebar.classList.remove('collapsed');
//     } else {
//         sidebar.classList.remove('docked');
//         dockBtn.innerHTML = '📌';
//         dockBtn.title = 'Pin Sidebar';
//     }
    
//     updateMainContent();
// }

// // Collapse sidebar
// function collapseSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     sidebarCollapsed = true;
//     sidebar.classList.add('collapsed');
//     updateMainContent();
// }

// // Update main content layout
// function updateMainContent() {
//     const mainContent = document.getElementById('mainContent');
    
//     if (sidebarDocked) {
//         mainContent.classList.add('sidebar-docked');
//         if (!sidebarCollapsed) {
//             mainContent.classList.add('sidebar-visible');
//         } else {
//             mainContent.classList.remove('sidebar-visible');
//         }
//     } else {
//         mainContent.classList.remove('sidebar-docked', 'sidebar-visible');
//     }
// }

// // Switch tabs
// function switchTab(tabName) {
//     // Update nav tabs
//     document.querySelectorAll('.nav-tab').forEach(tab => {
//         tab.classList.remove('active');
//     });
//     document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

//     // Update content sections
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.classList.remove('active');
//     });
//     document.getElementById(`${tabName}-content`).classList.add('active');

//     // Update page title
//     const titles = {
//         dashboard: 'Dashboard',
//         motor: 'Motor Control',
//         ai: 'AI Inference',
//         heatmap: 'Heat Map',
//         settings: 'Settings'
//     };
//     document.getElementById('pageTitle').textContent = titles[tabName];

//     // Close sidebar on mobile
//     if (window.innerWidth <= 768 && !sidebarDocked) {
//         toggleSidebar();
//     }
// }

// // Toggle motor on/off
// function toggleMotor() {
//     motorEnabled = !motorEnabled;
//     const toggle = document.getElementById('motorToggle');
//     const speedButtons = document.querySelectorAll('.speed-btn');
//     const statusIcon = document.getElementById('statusIcon');
//     const statusMain = document.getElementById('statusMain');
//     const statusSub = document.getElementById('statusSub');
//     const speedValue = document.getElementById('speedValue');
//     const speedFill = document.getElementById('speedFill');

//     if (motorEnabled) {
//         // Motor ON
//         toggle.classList.add('on');
//         statusIcon.classList.add('on');
//         statusMain.textContent = 'Motor Ready';
//         statusSub.textContent = 'Select speed level to operate';
        
//         // Enable speed buttons
//         speedButtons.forEach(btn => {
//             btn.classList.add('enabled');
//         });
        
//         // If no speed is selected, default to speed 1
//         if (motorSpeed === 0) {
//             setMotorSpeed(1);
//         }
        
//     } else {
//         // Motor OFF
//         toggle.classList.remove('on');
//         statusIcon.classList.remove('on');
//         statusMain.textContent = 'Motor Stopped';
//         statusSub.textContent = 'Click toggle to start motor';
        
//         // Disable speed buttons and reset
//         speedButtons.forEach(btn => {
//             btn.classList.remove('enabled', 'active');
//         });
//         speedButtons[0].classList.add('active'); // OFF button
        
//         motorSpeed = 0;
//         speedValue.textContent = '0% (OFF)';
//         speedFill.style.width = '0%';
//         speedFill.classList.remove('active');
//     }

//     // Update sidebar indicator
//     updateMotorIndicator();
    
//     // Simulate API call to ESP32
//     console.log(`Motor ${motorEnabled ? 'enabled' : 'disabled'}`);
// }

// // Set motor speed
// function setMotorSpeed(speed) {
//     if (!motorEnabled && speed > 0) return;
    
//     motorSpeed = speed;
//     const speedValue = document.getElementById('speedValue');
//     const speedFill = document.getElementById('speedFill');
//     const statusSub = document.getElementById('statusSub');
    
//     // Update speed buttons
//     document.querySelectorAll('.speed-btn').forEach(btn => {
//         btn.classList.remove('active');
//     });
//     document.querySelector(`[data-speed="${speed}"]`).classList.add('active');

//     // Calculate percentage (0-100%)
//     const percentage = (speed / 5) * 100;
    
//     // Update speed display
//     if (speed === 0) {
//         speedValue.textContent = '0% (OFF)';
//         speedFill.classList.remove('active');
//         if (motorEnabled) {
//             statusSub.textContent = 'Motor idle - Select speed level';
//         }
//     } else {
//         speedValue.textContent = `${percentage}% (Speed ${speed})`;
//         speedFill.classList.add('active');
//         statusSub.textContent = `Running at ${percentage}% capacity`;
//     }
    
//     // Update progress bar
//     speedFill.style.width = `${percentage}%`;

//     // Update sidebar motor status
//     updateMotorIndicator();

//     // Simulate API call to ESP32
//     console.log(`Motor speed set to: ${speed} (${percentage}%)`);
// }

// // Update motor indicator in sidebar
// function updateMotorIndicator() {
//     const indicator = document.getElementById('motorIndicator');
//     const statusText = document.getElementById('motorStatusText');
    
//     if (!motorEnabled) {
//         indicator.classList.remove('on');
//         statusText.textContent = 'OFF';
//     } else if (motorSpeed === 0) {
//         indicator.classList.add('on');
//         statusText.textContent = 'IDLE';
//         indicator.style.background = 'var(--warning)';
//     } else {
//         indicator.classList.add('on');
//         statusText.textContent = `${(motorSpeed / 5) * 100}%`;
//         indicator.style.background = 'var(--success)';
//     }
// }

// // Toggle theme
// function toggleTheme() {
//     currentTheme = currentTheme === 'light' ? 'dark' : 'light';
//     document.documentElement.setAttribute('data-theme', currentTheme);
//     localStorage.setItem('theme', currentTheme);

//     // Update chart colors if modal is open
//     if (chartInstance) {
//         chartInstance.options.scales.y.grid.color = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
//         chartInstance.options.scales.y.ticks.color = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
//         chartInstance.options.scales.x.grid.color = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
//         chartInstance.options.scales.x.ticks.color = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
//         chartInstance.options.plugins.legend.labels.color = currentTheme === 'dark' ? '#f8fafc' : '#1e293b';
//         chartInstance.update();
//     }
// }

// // Load saved theme
// function loadTheme() {
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     currentTheme = savedTheme;
//     document.documentElement.setAttribute('data-theme', currentTheme);
// }

// // Close modal
// function closeModal() {
//     const modal = document.getElementById('chartModal');
//     modal.classList.remove('show');
    
//     // Stop live updates
//     if (liveChartInterval) {
//         clearInterval(liveChartInterval);
//         liveChartInterval = null;
//     }
    
//     if (chartInstance) {
//         chartInstance.destroy();
//         chartInstance = null;
//     }
    
//     currentSensor = null;
//     chartData = [];
// }

// // Handle window resize
// window.addEventListener('resize', () => {
//     if (window.innerWidth > 768) {
//         const sidebar = document.getElementById('sidebar');
//         if (!sidebarDocked) {
//             sidebar.classList.remove('collapsed');
//             sidebarCollapsed = false;
//         }
//     }
//     updateMainContent();
// });

// // Simulate AI inference updates
// function updateAIStats() {
//     const accuracy = document.getElementById('aiAccuracy');
//     const inferences = document.getElementById('aiInferences');
//     const latency = document.getElementById('aiLatency');
//     const confidence = document.getElementById('aiConfidence');

//     // Simulate changing values
//     accuracy.textContent = (92 + Math.random() * 6).toFixed(1) + '%';
//     inferences.textContent = (1200 + Math.floor(Math.random() * 100)).toLocaleString();
//     latency.textContent = (20 + Math.floor(Math.random() * 15)) + 'ms';
//     confidence.textContent = (85 + Math.random() * 10).toFixed(1) + '%';
// }

// // Update AI stats periodically
// setInterval(updateAIStats, 5000);

// // Keyboard shortcuts
// document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape' && document.getElementById('chartModal').classList.contains('show')) {
//         closeModal();
//     }
    
//     // Tab switching with numbers
//     if (e.altKey && e.key >= '1' && e.key <= '5') {
//         e.preventDefault();
//         const tabs = ['dashboard', 'motor', 'ai', 'heatmap', 'settings'];
//         switchTab(tabs[parseInt(e.key) - 1]);
//     }
// });

// // Initialize dashboard when page loads
// document.addEventListener('DOMContentLoaded', init);

// // Simulate WebSocket connection status
// let connectionStatus = true;
// function updateConnectionStatus() {
//     connectionStatus = Math.random() > 0.1; // 90% uptime simulation
//     document.querySelectorAll('.card-status').forEach(status => {
//         status.style.backgroundColor = connectionStatus ? 'var(--success)' : 'var(--danger)';
//     });
// }

// setInterval(updateConnectionStatus, 10000);

// // Add touch gestures for mobile
// let touchStartX = 0;
// let touchEndX = 0;

// document.addEventListener('touchstart', e => {
//     touchStartX = e.changedTouches[0].screenX;
// });

// document.addEventListener('touchend', e => {
//     touchEndX = e.changedTouches[0].screenX;
//     handleGesture();
// });

// function handleGesture() {
//     if (window.innerWidth <= 768) {
//         const sidebar = document.getElementById('sidebar');
//         const threshold = 100;
        
//         if (touchEndX < touchStartX - threshold && !sidebarDocked) {
//             // Swipe left - close sidebar
//             sidebar.classList.add('collapsed');
//             sidebarCollapsed = true;
//             updateMainContent();
//         }
        
//         if (touchEndX > touchStartX + threshold && touchStartX < 50 && !sidebarDocked) {
//             // Swipe right from edge - open sidebar
//             sidebar.classList.remove('collapsed');
//             sidebarCollapsed = false;
//             updateMainContent();
//         }
//     }
// }

// // Service Worker registration for PWA capabilities
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(registration => console.log('SW registered'))
//             .catch(registrationError => console.log('SW registration failed'));
//     });
// }



// v1 above


// const socket = new WebSocket(`ws://${window.location.host}`);

// socket.addEventListener("message", (event) => {
//   const data = JSON.parse(event.data);
//   updateDashboard(data);
// });

// // WebSocket connection status
// let socketConnected = false;
// socket.addEventListener("open", () => {
//   socketConnected = true;
//   console.log("✅ WebSocket connected");
//   updateConnectionStatus();
//   updateConnectionStatusUI(); // Add this line
// });

// socket.addEventListener("close", () => {
//   socketConnected = false;
//     console.log("❌ WebSocket disconnected");
//     updateConnectionStatus();
//     updateConnectionStatusUI(); // Add this line
// });

// socket.addEventListener("error", (error) => {
//    socketConnected = false;
//     console.error("❌ WebSocket error:", error);
//     updateConnectionStatus();
//     updateConnectionStatusUI(); // Add this line
// });

// // Global state
// let currentTheme = 'light';
// let motorSpeed = 0;
// let motorEnabled = false;
// let sensorData = {};
// let chartInstance = null;
// let updateInterval = null;
// let liveChartInterval = null;
// let currentSensor = null;
// let chartData = [];
// let sidebarDocked = false;
// let sidebarCollapsed = false;

// // Sensor configuration with icons and colors
// const sensorConfig = [
//   { id: 'refVoltage', name: 'Ref Voltage', unit: 'V', min: 220, max: 240, icon: '⚡', color: '#3b82f6' },
//   { id: 'humidity', name: 'Humidity', unit: '%', min: 30, max: 90, icon: '💧', color: '#06b6d4' },
//   { id: 'extTemp', name: 'Ext Temp', unit: '°C', min: 20, max: 45, icon: '🌡️', color: '#ef4444' },
//   { id: 'ds18b20Temp', name: 'DS18B20 Temp', unit: '°C', min: 20, max: 45, icon: '🌡️', color: '#f97316' },
//   { id: 'mlxObjTemp', name: 'MLX ObjTemp', unit: '°C', min: 30, max: 80, icon: '🔥', color: '#f43f5e' },
//   { id: 'mlxAmbTemp', name: 'MLX AmbTemp', unit: '°C', min: 25, max: 45, icon: '🌡️', color: '#eab308' },
//   { id: 'motorVolt', name: 'Motor Volt', unit: 'V', min: 210, max: 240, icon: '⚡', color: '#6366f1' },
//   { id: 'motorCurr', name: 'Motor Curr', unit: 'A', min: 0.5, max: 15, icon: '🔋', color: '#14b8a6' },
//   { id: 'motorPower', name: 'Motor Power', unit: 'W', min: 100, max: 3000, icon: '🔌', color: '#f43f5e' },
//   { id: 'energy', name: 'Energy', unit: 'kWh', min: 0, max: 20000, icon: '🔋', color: '#f59e0b' },
//   { id: 'frequency', name: 'Frequency', unit: 'Hz', min: 49.5, max: 50.5, icon: '📡', color: '#6366f1' },
//   { id: 'powerFactor', name: 'PowerFactor', unit: '', min: 0.7, max: 1.0, icon: '⚙️', color: '#8b5cf6' },
//   { id: 'apparentPower', name: 'Apparent Power', unit: 'VA', min: 100, max: 3500, icon: '🔌', color: '#ec4899' },
//   { id: 'reactivePower', name: 'Reactive Power', unit: 'VAR', min: 0, max: 1000, icon: '🌀', color: '#22c55e' },
//   { id: 'phaseAngle', name: 'Phase Angle', unit: '°', min: 0, max: 90, icon: '📐', color: '#a855f7' },
//   { id: 'syncSpeed', name: 'Sync Speed', unit: 'RPM', min: 1500, max: 1500, icon: '⚙️', color: '#10b981' },
//   { id: 'slip', name: 'Slip', unit: '%', min: 0, max: 10, icon: '🎯', color: '#84cc16' },
//   { id: 'rotorSpeed', name: 'Rotor Speed', unit: 'RPM', min: 1300, max: 1500, icon: '🔄', color: '#06b6d4' },
//   { id: 'torque', name: 'Torque', unit: 'Nm', min: 1, max: 50, icon: '🔧', color: '#0284c7' },
//   { id: 'efficiency', name: 'Efficiency', unit: '%', min: 60, max: 95, icon: '📈', color: '#facc15' }
// ];

// // NEW: Function to handle real sensor data from AWS IoT
// function updateDashboard(iotData) {
//   console.log("📊 Updating dashboard with IoT data:", iotData);
  
//   // Update sensor data with real values
//   Object.keys(iotData).forEach(key => {
//     if (key !== 'timestamp') {
//       const sensor = sensorConfig.find(s => s.id === key);
//       if (sensor) {
//         const value = parseFloat(iotData[key]);
//         const formattedValue = value.toFixed(sensor.unit === 'V' || sensor.unit === 'W' ? 2 : 1);
        
//         sensorData[key] = {
//           value: value,
//           timestamp: new Date(iotData.timestamp || Date.now())
//         };

//         // Update UI element
//         const valueElement = document.getElementById(`${key}-value`);
//         if (valueElement) {
//           valueElement.textContent = formattedValue;
          
//           // Add visual feedback for updated values
//           valueElement.parentElement.classList.add('updated');
//           setTimeout(() => {
//             valueElement.parentElement.classList.remove('updated');
//           }, 1000);
//         }

//         // Update trend indicators
//         updateTrendIndicator(key, value);
        
//         // If this sensor is currently being charted, update the chart
//         if (currentSensor && currentSensor.id === key) {
//           updateLiveChartWithRealData(sensor, value);
//         }
//       }
//     }
//   });

//   // Update heat map with new data
//   updateHeatMapWithRealData();
// }

// // NEW: Update trend indicators based on previous values
// const previousValues = {};
// function updateTrendIndicator(sensorId, currentValue) {
//   const card = document.querySelector(`[data-sensor-id="${sensorId}"]`);
//   if (!card) return;
  
//   const trendElement = card.querySelector('.card-trend');
//   if (!trendElement) return;
  
//   if (previousValues[sensorId] !== undefined) {
//     const previous = previousValues[sensorId];
//     const change = ((currentValue - previous) / previous) * 100;
    
//     let trend, trendIcon, trendText;
//     if (Math.abs(change) < 0.1) {
//       trend = 'stable';
//       trendIcon = '→';
//       trendText = '0.0%';
//     } else if (change > 0) {
//       trend = 'up';
//       trendIcon = '↗';
//       trendText = `+${change.toFixed(1)}%`;
//     } else {
//       trend = 'down';
//       trendIcon = '↙';
//       trendText = `${change.toFixed(1)}%`;
//     }
    
//     trendElement.className = `card-trend ${trend}`;
//     trendElement.textContent = `${trendIcon} ${trendText}`;
//   }
  
//   previousValues[sensorId] = currentValue;
// }

// // NEW: Update heat map with real sensor data
// function updateHeatMapWithRealData() {
//   const cells = document.querySelectorAll('.heat-cell');
//   const temperatureSensors = ['extTemp', 'ds18b20Temp', 'mlxObjTemp', 'mlxAmbTemp'];
  
//   cells.forEach((cell, index) => {
//     // Use real temperature data to influence heat map
//     const sensorIndex = index % temperatureSensors.length;
//     const sensorId = temperatureSensors[sensorIndex];
//     const sensorValue = sensorData[sensorId];
    
//     if (sensorValue) {
//       const sensor = sensorConfig.find(s => s.id === sensorId);
//       const normalizedValue = (sensorValue.value - sensor.min) / (sensor.max - sensor.min);
//       cell.style.backgroundColor = getHeatColor(Math.max(0, Math.min(1, normalizedValue)));
//     } else {
//       // Fallback to random if no real data yet
//       cell.style.backgroundColor = getHeatColor(Math.random());
//     }
//   });
// }

// // MODIFIED: Update live chart with real data
// function updateLiveChartWithRealData(sensor, newValue) {
//   if (!chartInstance || !currentSensor) return;

//   const now = new Date();
  
//   // Add new data point with real value
//   chartData.push({
//     time: now,
//     value: newValue,
//     label: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
//   });

//   // Keep only last 50 points
//   if (chartData.length > 50) {
//     chartData.shift();
//   }

//   // Update chart with real data
//   chartInstance.data.labels = chartData.map(d => d.label);
//   chartInstance.data.datasets[0].data = chartData.map(d => d.value);
//   chartInstance.update('active');

//   // Update stats
//   updateChartStats(sensor);
// }

// // Initialize dashboard
// function init() {
//     generateSensorCards();
//     generateHeatMap();
//     setupEventListeners();
//     loadTheme();
    
//     // Remove the old simulation interval since we're using real data
//     // startDataSimulation(); // REMOVED
    
//     console.log("🚀 Dashboard initialized - waiting for real IoT data");
// }

// // Generate sensor cards
// function generateSensorCards() {
//     const grid = document.getElementById('sensorGrid');
//     grid.innerHTML = '';

//     sensorConfig.forEach((sensor, index) => {
//         const card = document.createElement('div');
//         card.className = 'sensor-card';
//         card.dataset.sensorId = sensor.id;
//         card.innerHTML = `
//             <div class="card-header">
//                 <div class="card-title-section">
//                     <div class="card-title">${sensor.name}</div>
//                     <div class="card-subtitle">Live IoT Data</div>
//                 </div>
//                 <div class="card-icon">
//                     ${sensor.icon}
//                     <div class="card-status"></div>
//                 </div>
//             </div>
//             <div class="card-value" id="${sensor.id}-value">--</div>
//             <div class="card-unit">
//                 ${sensor.unit}
//                 <span class="card-trend stable">→ 0.0%</span>
//             </div>
//         `;
        
//         card.addEventListener('click', () => openChart(sensor));
//         grid.appendChild(card);
//     });
// }

// // Generate heat map
// function generateHeatMap() {
//     const grid = document.getElementById('heatGrid');
//     grid.innerHTML = '';

//     for (let i = 0; i < 100; i++) {
//         const cell = document.createElement('div');
//         cell.className = 'heat-cell';
//         cell.style.backgroundColor = getHeatColor(Math.random());
//         grid.appendChild(cell);
//     }
// }

// // Get heat map color
// function getHeatColor(intensity) {
//     const colors = [
//         '#3b82f6', // Blue (cool)
//         '#10b981', // Green
//         '#f59e0b', // Yellow
//         '#f97316', // Orange
//         '#ef4444'  // Red (hot)
//     ];
//     const index = Math.floor(intensity * (colors.length - 1));
//     return colors[index];
// }

// // MODIFIED: Open chart modal - now uses real data
// function openChart(sensor) {
//     currentSensor = sensor;
//     const modal = document.getElementById('chartModal');
//     const title = document.getElementById('modalTitle');
//     title.textContent = `${sensor.name} - Live IoT Data`;

//     // Initialize chart data array with historical data if available
//     chartData = [];
//     const now = new Date();
    
//     // If we have recent data, use it; otherwise generate some initial points
//     const currentData = sensorData[sensor.id];
//     if (currentData) {
//         // Create initial data points leading up to current value
//         for (let i = 49; i >= 1; i--) {
//             const time = new Date(now.getTime() - i * 2000);
//             // Simulate historical values around current value
//             const variation = (sensor.max - sensor.min) * 0.1;
//             const historicalValue = currentData.value + (Math.random() - 0.5) * variation;
//             const clampedValue = Math.max(sensor.min, Math.min(sensor.max, historicalValue));
            
//             chartData.push({
//                 time: time,
//                 value: clampedValue,
//                 label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
//             });
//         }
        
//         // Add current real value as the latest point
//         chartData.push({
//             time: currentData.timestamp,
//             value: currentData.value,
//             label: currentData.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
//         });
//     } else {
//         // Fallback: generate initial data points if no real data yet
//         for (let i = 49; i >= 0; i--) {
//             const time = new Date(now.getTime() - i * 2000);
//             const range = sensor.max - sensor.min;
//             chartData.push({
//                 time: time,
//                 value: sensor.min + (Math.random() * range),
//                 label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
//             });
//         }
//     }

//     // Destroy existing chart
//     if (chartInstance) {
//         chartInstance.destroy();
//     }

//     // Create new chart
//     const ctx = document.getElementById('sensorChart');
//     chartInstance = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: chartData.map(d => d.label),
//             datasets: [{
//                 label: sensor.name,
//                 data: chartData.map(d => d.value),
//                 borderColor: sensor.color,
//                 backgroundColor: 'transparent',
//                 borderWidth: 3,
//                 fill: false,
//                 tension: 0.4,
//                 pointRadius: 3,
//                 pointHoverRadius: 8,
//                 pointBackgroundColor: sensor.color,
//                 pointBorderColor: '#ffffff',
//                 pointBorderWidth: 2,
//                 pointHoverBackgroundColor: sensor.color,
//                 pointHoverBorderColor: '#ffffff',
//                 pointHoverBorderWidth: 3,
//                 shadowColor: sensor.color,
//                 shadowBlur: 10
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             animation: {
//                 duration: 750,
//                 easing: 'easeInOutQuart'
//             },
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     min: sensor.min - (sensor.max - sensor.min) * 0.1,
//                     max: sensor.max + (sensor.max - sensor.min) * 0.1,
//                     grid: {
//                         color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
//                         drawBorder: false,
//                         lineWidth: 1
//                     },
//                     ticks: {
//                         color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
//                         callback: function(value) {
//                             return value.toFixed(1) + sensor.unit;
//                         },
//                         font: {
//                             size: 12,
//                             weight: '500'
//                         },
//                         padding: 8
//                     },
//                     border: {
//                         display: false
//                     }
//                 },
//                 x: {
//                     grid: {
//                         color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
//                         drawBorder: false,
//                         lineWidth: 1
//                     },
//                     ticks: {
//                         color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
//                         maxTicksLimit: 8,
//                         font: {
//                             size: 11,
//                             weight: '500'
//                         },
//                         padding: 8
//                     },
//                     border: {
//                         display: false
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
//                     titleColor: currentTheme === 'dark' ? '#f8fafc' : '#1e293b',
//                     bodyColor: currentTheme === 'dark' ? '#cbd5e1' : '#64748b',
//                     borderColor: sensor.color,
//                     borderWidth: 2,
//                     cornerRadius: 12,
//                     displayColors: false,
//                     titleFont: {
//                         size: 14,
//                         weight: '600'
//                     },
//                     bodyFont: {
//                         size: 13,
//                         weight: '500'
//                     },
//                     padding: 12,
//                     caretPadding: 8,
//                     callbacks: {
//                         title: function(context) {
//                             return context[0].label;
//                         },
//                         label: function(context) {
//                             return `${sensor.name}: ${context.parsed.y.toFixed(2)}${sensor.unit}`;
//                         }
//                     }
//                 }
//             },
//             interaction: {
//                 intersect: false,
//                 mode: 'index'
//             },
//             elements: {
//                 line: {
//                     borderCapStyle: 'round',
//                     borderJoinStyle: 'round'
//                 },
//                 point: {
//                     hoverBackgroundColor: sensor.color,
//                     hoverBorderWidth: 3
//                 }
//             }
//         }
//     });

//     // Update chart stats
//     updateChartStats(sensor);

//     modal.classList.add('show');
// }

// // Update chart statistics
// function updateChartStats(sensor) {
//     const values = chartData.map(d => d.value);
//     const current = values[values.length - 1] || 0;
//     const min = Math.min(...values);
//     const max = Math.max(...values);
//     const avg = values.reduce((a, b) => a + b, 0) / values.length;

//     const statsContainer = document.getElementById('chartStats');
//     statsContainer.innerHTML = `
//         <div class="chart-stat">
//             <div class="stat-value">${current.toFixed(1)}</div>
//             <div class="stat-label">Current</div>
//         </div>
//         <div class="chart-stat">
//             <div class="stat-value">${avg.toFixed(1)}</div>
//             <div class="stat-label">Average</div>
//         </div>
//         <div class="chart-stat">
//             <div class="stat-value">${min.toFixed(1)}</div>
//             <div class="stat-label">Minimum</div>
//         </div>
//         <div class="chart-stat">
//             <div class="stat-value">${max.toFixed(1)}</div>
//             <div class="stat-label">Maximum</div>
//         </div>
//     `;
// }

// // Setup event listeners
// function setupEventListeners() {
//     // Menu toggle
//     document.getElementById('menuToggle').addEventListener('click', () => {
//         toggleSidebar();
//     });

//     // Dock controls
//     document.getElementById('dockBtn').addEventListener('click', () => {
//         toggleDock();
//     });

//     document.getElementById('collapseBtn').addEventListener('click', () => {
//         collapseSidebar();
//     });

//     // Theme toggle
//     document.getElementById('themeToggle').addEventListener('click', toggleTheme);

//     // Motor toggle
//     document.getElementById('motorToggle').addEventListener('click', toggleMotor);

//     // Navigation tabs
//     document.querySelectorAll('.nav-tab').forEach(tab => {
//         tab.addEventListener('click', (e) => {
//             e.preventDefault();
//             switchTab(tab.dataset.tab);
//         });
//     });

//     // Motor speed controls
//     document.querySelectorAll('.speed-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             if (motorEnabled) {
//                 setMotorSpeed(parseInt(btn.dataset.speed));
//             }
//         });
//     });

//     // Modal close
//     document.getElementById('closeModal').addEventListener('click', closeModal);
//     document.getElementById('chartModal').addEventListener('click', (e) => {
//         if (e.target === e.currentTarget) closeModal();
//     });

//     // Click outside sidebar on mobile
//     document.addEventListener('click', (e) => {
//         if (window.innerWidth <= 768 && !sidebarDocked) {
//             const sidebar = document.getElementById('sidebar');
//             const menuToggle = document.getElementById('menuToggle');
//             const dockControls = sidebar.querySelector('.dock-controls');
            
//             if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !dockControls.contains(e.target)) {
//                 sidebar.classList.add('collapsed');
//                 sidebarCollapsed = true;
//                 updateMainContent();
//             }
//         }
//     });
// }

// // Toggle sidebar
// function toggleSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     sidebarCollapsed = !sidebarCollapsed;
    
//     if (sidebarCollapsed) {
//         sidebar.classList.add('collapsed');
//     } else {
//         sidebar.classList.remove('collapsed');
//     }
    
//     updateMainContent();
// }

// // Toggle dock
// function toggleDock() {
//     const sidebar = document.getElementById('sidebar');
//     const dockBtn = document.getElementById('dockBtn');
    
//     sidebarDocked = !sidebarDocked;
    
//     if (sidebarDocked) {
//         sidebar.classList.add('docked');
//         dockBtn.innerHTML = '📍';
//         dockBtn.title = 'Unpin Sidebar';
//         sidebarCollapsed = false;
//         sidebar.classList.remove('collapsed');
//     } else {
//         sidebar.classList.remove('docked');
//         dockBtn.innerHTML = '📌';
//         dockBtn.title = 'Pin Sidebar';
//     }
    
//     updateMainContent();
// }

// // Collapse sidebar
// function collapseSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     sidebarCollapsed = true;
//     sidebar.classList.add('collapsed');
//     updateMainContent();
// }

// // Update main content layout
// function updateMainContent() {
//     const mainContent = document.getElementById('mainContent');
    
//     if (sidebarDocked) {
//         mainContent.classList.add('sidebar-docked');
//         if (!sidebarCollapsed) {
//             mainContent.classList.add('sidebar-visible');
//         } else {
//             mainContent.classList.remove('sidebar-visible');
//         }
//     } else {
//         mainContent.classList.remove('sidebar-docked', 'sidebar-visible');
//     }
// }

// // Switch tabs
// function switchTab(tabName) {
//     // Update nav tabs
//     document.querySelectorAll('.nav-tab').forEach(tab => {
//         tab.classList.remove('active');
//     });
//     document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

//     // Update content sections
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.classList.remove('active');
//     });
//     document.getElementById(`${tabName}-content`).classList.add('active');

//     // Update page title
//     const titles = {
//         dashboard: 'Dashboard',
//         motor: 'Motor Control',
//         ai: 'AI Inference',
//         heatmap: 'Heat Map',
//         settings: 'Settings'
//     };
//     document.getElementById('pageTitle').textContent = titles[tabName];

//     // Close sidebar on mobile
//     if (window.innerWidth <= 768 && !sidebarDocked) {
//         toggleSidebar();
//     }
// }

// // Toggle motor on/off
// function toggleMotor() {
//     motorEnabled = !motorEnabled;
//     const toggle = document.getElementById('motorToggle');
//     const speedButtons = document.querySelectorAll('.speed-btn');
//     const statusIcon = document.getElementById('statusIcon');
//     const statusMain = document.getElementById('statusMain');
//     const statusSub = document.getElementById('statusSub');
//     const speedValue = document.getElementById('speedValue');
//     const speedFill = document.getElementById('speedFill');

//     if (motorEnabled) {
//         // Motor ON
//         toggle.classList.add('on');
//         statusIcon.classList.add('on');
//         statusMain.textContent = 'Motor Ready';
//         statusSub.textContent = 'Select speed level to operate';
        
//         // Enable speed buttons
//         speedButtons.forEach(btn => {
//             btn.classList.add('enabled');
//         });
        
//         // If no speed is selected, default to speed 1
//         if (motorSpeed === 0) {
//             setMotorSpeed(1);
//         }
        
//     } else {
//         // Motor OFF
//         toggle.classList.remove('on');
//         statusIcon.classList.remove('on');
//         statusMain.textContent = 'Motor Stopped';
//         statusSub.textContent = 'Click toggle to start motor';
        
//         // Disable speed buttons and reset
//         speedButtons.forEach(btn => {
//             btn.classList.remove('enabled', 'active');
//         });
//         speedButtons[0].classList.add('active'); // OFF button
        
//         motorSpeed = 0;
//         speedValue.textContent = '0% (OFF)';
//         speedFill.style.width = '0%';
//         speedFill.classList.remove('active');
//     }

//     // Update sidebar indicator
//     updateMotorIndicator();
    
//     // TODO: Send command to ESP32 via WebSocket or MQTT
//     console.log(`Motor ${motorEnabled ? 'enabled' : 'disabled'}`);
// }

// // Set motor speed
// function setMotorSpeed(speed) {
//     if (!motorEnabled && speed > 0) return;
    
//     motorSpeed = speed;
//     const speedValue = document.getElementById('speedValue');
//     const speedFill = document.getElementById('speedFill');
//     const statusSub = document.getElementById('statusSub');
    
//     // Update speed buttons
//     document.querySelectorAll('.speed-btn').forEach(btn => {
//         btn.classList.remove('active');
//     });
//     document.querySelector(`[data-speed="${speed}"]`).classList.add('active');

//     // Calculate percentage (0-100%)
//     const percentage = (speed / 5) * 100;
    
//     // Update speed display
//     if (speed === 0) {
//         speedValue.textContent = '0% (OFF)';
//         speedFill.classList.remove('active');
//         if (motorEnabled) {
//             statusSub.textContent = 'Motor idle - Select speed level';
//         }
//     } else {
//         speedValue.textContent = `${percentage}% (Speed ${speed})`;
//         speedFill.classList.add('active');
//         statusSub.textContent = `Running at ${percentage}% capacity`;
//     }
    
//     // Update progress bar
//     speedFill.style.width = `${percentage}%`;

//     // Update sidebar motor status
//     updateMotorIndicator();

//     // TODO: Send speed command to ESP32 via WebSocket or MQTT
//     console.log(`Motor speed set to: ${speed} (${percentage}%)`);
// }

// // Update motor indicator in sidebar
// function updateMotorIndicator() {
//     const indicator = document.getElementById('motorIndicator');
//     const statusText = document.getElementById('motorStatusText');
    
//     if (!motorEnabled) {
//         indicator.classList.remove('on');
//         statusText.textContent = 'OFF';
//     } else if (motorSpeed === 0) {
//         indicator.classList.add('on');
//         statusText.textContent = 'IDLE';
//         indicator.style.background = 'var(--warning)';
//     } else {
//         indicator.classList.add('on');
//         statusText.textContent = `${(motorSpeed / 5) * 100}%`;
//         indicator.style.background = 'var(--success)';
//     }
// }

// // Toggle theme
// function toggleTheme() {
//     currentTheme = currentTheme === 'light' ? 'dark' : 'light';
//     document.documentElement.setAttribute('data-theme', currentTheme);
//     localStorage.setItem('theme', currentTheme);

//     // Update chart colors if modal is open
//     if (chartInstance) {
//         chartInstance.options.scales.y.grid.color = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
//         chartInstance.options.scales.y.ticks.color = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
//         chartInstance.options.scales.x.grid.color = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
//         chartInstance.options.scales.x.ticks.color = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
//         chartInstance.options.plugins.legend.labels.color = currentTheme === 'dark' ? '#f8fafc' : '#1e293b';
//         chartInstance.update();
//     }
// }

// // Load saved theme
// function loadTheme() {
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     currentTheme = savedTheme;
//     document.documentElement.setAttribute('data-theme', currentTheme);
// }

// // Close modal
// function closeModal() {
//     const modal = document.getElementById('chartModal');
//     modal.classList.remove('show');
    
//     if (chartInstance) {
//         chartInstance.destroy();
//         chartInstance = null;
//     }
    
//     currentSensor = null;
//     chartData = [];
// }

// // Handle window resize
// window.addEventListener('resize', () => {
//     if (window.innerWidth > 768) {
//         const sidebar = document.getElementById('sidebar');
//         if (!sidebarDocked) {
//             sidebar.classList.remove('collapsed');
//             sidebarCollapsed = false;
//         }
//     }
//     updateMainContent();
// });

// // Simulate AI inference updates
// function updateAIStats() {
//     const accuracy = document.getElementById('aiAccuracy');
//     const inferences = document.getElementById('aiInferences');
//     const latency = document.getElementById('aiLatency');
//     const confidence = document.getElementById('aiConfidence');

//     // Simulate changing values
//     accuracy.textContent = (92 + Math.random() * 6).toFixed(1) + '%';
//     inferences.textContent = (1200 + Math.floor(Math.random() * 100)).toLocaleString();
//     latency.textContent = (20 + Math.floor(Math.random() * 15)) + 'ms';
//     confidence.textContent = (85 + Math.random() * 10).toFixed(1) + '%';
// }

// // Update AI stats periodically
// setInterval(updateAIStats, 5000);

// // MODIFIED: Connection status now reflects WebSocket connection
// function updateConnectionStatus() {
//     document.querySelectorAll('.card-status').forEach(status => {
//         status.style.backgroundColor = socketConnected ? 'var(--success)' : 'var(--danger)';
//         status.title = socketConnected ? 'Connected to AWS IoT Core' : 'Disconnected from AWS IoT Core';
//     });
// }

// // Keyboard shortcuts
// document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape' && document.getElementById('chartModal').classList.contains('show')) {
//         closeModal();
//     }
    
//     // Tab switching with numbers
//     if (e.altKey && e.key >= '1' && e.key <= '5') {
//         e.preventDefault();
//         const tabs = ['dashboard', 'motor', 'ai', 'heatmap', 'settings'];
//         switchTab(tabs[parseInt(e.key) - 1]);
//     }
// });

// // Initialize dashboard when page loads
// document.addEventListener('DOMContentLoaded', init);

// // Add touch gestures for mobile
// let touchStartX = 0;
// let touchEndX = 0;

// document.addEventListener('touchstart', e => {
//     touchStartX = e.changedTouches[0].screenX;
// });

// document.addEventListener('touchend', e => {
//     touchEndX = e.changedTouches[0].screenX;
//     handleGesture();
// });

// function handleGesture() {
//     if (window.innerWidth <= 768) {
//         const sidebar = document.getElementById('sidebar');
//         const threshold = 100;
        
//         if (touchEndX < touchStartX - threshold && !sidebarDocked) {
//             // Swipe left - close sidebar
//             sidebar.classList.add('collapsed');
//             sidebarCollapsed = true;
//             updateMainContent();
//         }
        
//         if (touchEndX > touchStartX + threshold && touchStartX < 50 && !sidebarDocked) {
//             // Swipe right from edge - open sidebar
//             sidebar.classList.remove('collapsed');
//             sidebarCollapsed = false;
//             updateMainContent();
//         }
//     }
// }

// // Service Worker registration for PWA capabilities
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(registration => console.log('SW registered'))
//             .catch(registrationError => console.log('SW registration failed'));
//     });
// }


// last version
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("📨 WebSocket message received:", data);
    updateDashboard(data);
  } catch (error) {
    console.error("❌ Error parsing WebSocket message:", error);
    console.log("Raw message:", event.data);
  }
});

// WebSocket connection status
let socketConnected = false;
socket.addEventListener("open", () => {
  socketConnected = true;
  console.log("✅ WebSocket connected to", socket.url);
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
let updateInterval = null;
let liveChartInterval = null;
let currentSensor = null;
let chartData = [];
let sidebarDocked = false;
let sidebarCollapsed = false;

// Sensor configuration with icons and colors - Updated to match your ESP32 data
const sensorConfig = [
  { id: 'refVoltage', name: 'Ref Voltage', unit: 'V', min: 220, max: 240, icon: '⚡', color: '#3b82f6' },
  { id: 'humidity', name: 'Humidity', unit: '%', min: 30, max: 90, icon: '💧', color: '#06b6d4' },
  { id: 'extTemp', name: 'Ext Temp', unit: '°C', min: 20, max: 50, icon: '🌡️', color: '#ef4444' },
  { id: 'ds18b20Temp', name: 'DS18B20 Temp', unit: '°C', min: 20, max: 40, icon: '🌡️', color: '#f97316' },
  { id: 'mlxObjTemp', name: 'MLX ObjTemp', unit: '°C', min: 30, max: 80, icon: '🔥', color: '#f43f5e' },
  { id: 'mlxAmbTemp', name: 'MLX AmbTemp', unit: '°C', min: 25, max: 45, icon: '🌡️', color: '#eab308' },
  { id: 'motorVolt', name: 'Motor Volt', unit: 'V', min: 200, max: 240, icon: '⚡', color: '#6366f1' },
  { id: 'motorCurr', name: 'Motor Curr', unit: 'A', min: 0.5, max: 15, icon: '🔋', color: '#14b8a6' },
  { id: 'motorPower', name: 'Motor Power', unit: 'W', min: 100, max: 3000, icon: '🔌', color: '#f43f5e' },
  { id: 'energy', name: 'Energy', unit: 'kWh', min: 0, max: 5000, icon: '🔋', color: '#f59e0b' },
  { id: 'frequency', name: 'Frequency', unit: 'Hz', min: 49, max: 51, icon: '📡', color: '#6366f1' },
  { id: 'powerFactor', name: 'Power Factor', unit: '', min: 0.5, max: 1.0, icon: '⚙️', color: '#8b5cf6' },
  { id: 'apparentPower', name: 'Apparent Power', unit: 'VA', min: 100, max: 3500, icon: '🔌', color: '#ec4899' },
  { id: 'reactivePower', name: 'Reactive Power', unit: 'VAR', min: 0, max: 1000, icon: '🌀', color: '#22c55e' },
  { id: 'phaseAngle', name: 'Phase Angle', unit: '°', min: 0, max: 90, icon: '📐', color: '#a855f7' },
  { id: 'syncSpeed', name: 'Sync Speed', unit: 'RPM', min: 1500, max: 1500, icon: '⚙️', color: '#10b981' },
  { id: 'slip', name: 'Slip', unit: '%', min: 0, max: 15, icon: '🎯', color: '#84cc16' },
  { id: 'rotorSpeed', name: 'Rotor Speed', unit: 'RPM', min: 1400, max: 1500, icon: '🔄', color: '#06b6d4' },
  { id: 'torque', name: 'Torque', unit: 'Nm', min: 1, max: 50, icon: '🔧', color: '#0284c7' },
  { id: 'efficiency', name: 'Efficiency', unit: '%', min: 60, max: 95, icon: '📈', color: '#facc15' },
  { id: 'loadFactor', name: 'Load Factor', unit: '%', min: 0, max: 100, icon: '📊', color: '#8b5cf6' },
  { id: 'vibrationIndex', name: 'Vibration Index', unit: '', min: 0, max: 10, icon: '📳', color: '#ef4444' }
];

// NEW: Function to map ESP32 field names to frontend field names
function mapSensorData(rawData) {
  const fieldMapping = {
    'Ref Voltage': 'refVoltage',
    'Humidity': 'humidity', 
    'Ext Temp': 'extTemp',
    'DS18B20 Temp': 'ds18b20Temp',
    'MLX ObjTemp': 'mlxObjTemp',
    'MLX AmbTemp': 'mlxAmbTemp',
    'Motor Volt': 'motorVolt',
    'Motor Curr': 'motorCurr', 
    'Motor Power': 'motorPower',
    'Energy': 'energy',
    'Frequency': 'frequency',
    'PowerFactor': 'powerFactor',
    'Apparent Power': 'apparentPower',
    'Reactive Power': 'reactivePower',
    'Phase Angle': 'phaseAngle',
    'Sync Speed': 'syncSpeed',
    'Slip': 'slip',
    'Rotor Speed': 'rotorSpeed',
    'Torque': 'torque',
    'Efficiency': 'efficiency',
    'Load Factor': 'loadFactor',
    'Vibration Index': 'vibrationIndex'
  };

  const mappedData = {};
  
  // Map the fields from ESP32 format to frontend format
  Object.keys(rawData).forEach(key => {
    if (fieldMapping[key]) {
      mappedData[fieldMapping[key]] = rawData[key];
      console.log(`🔄 Mapped "${key}" → "${fieldMapping[key]}" = ${rawData[key]}`);
    } else if (key === 'timestamp') {
      mappedData[key] = rawData[key];
    } else {
      console.warn(`⚠️ Unknown field: "${key}" with value: ${rawData[key]}`);
    }
  });

  console.log("🔄 Final mapped data:", mappedData);
  return mappedData;
}

// NEW: Function to handle real sensor data from AWS IoT
function updateDashboard(rawIotData) {
  console.log("📊 Raw IoT data received:", rawIotData);
  
  // Map the data to frontend field names
  const iotData = mapSensorData(rawIotData);
  console.log("📊 Updating dashboard with mapped data:", iotData);
  
  // Update sensor data with real values
  Object.keys(iotData).forEach(key => {
    if (key !== 'timestamp') {
      const sensor = sensorConfig.find(s => s.id === key);
      if (sensor) {
        const value = parseFloat(iotData[key]);
        if (isNaN(value)) {
          console.warn(`⚠️ Invalid value for ${key}:`, iotData[key]);
          return;
        }
        
        const formattedValue = value.toFixed(sensor.unit === 'V' || sensor.unit === 'W' ? 2 : 1);
        
        sensorData[key] = {
          value: value,
          timestamp: new Date(iotData.timestamp || Date.now())
        };

        // Update UI element
        const valueElement = document.getElementById(`${key}-value`);
        if (valueElement) {
          valueElement.textContent = formattedValue;
          console.log(`✅ Updated ${key} to ${formattedValue}${sensor.unit}`);
          
          // Add visual feedback for updated values
          valueElement.parentElement.classList.add('updated');
          setTimeout(() => {
            valueElement.parentElement.classList.remove('updated');
          }, 1000);
        } else {
          console.warn(`⚠️ Element not found: ${key}-value`);
        }

        // Update trend indicators
        updateTrendIndicator(key, value);
        
        // If this sensor is currently being charted, update the chart
        if (currentSensor && currentSensor.id === key) {
          updateLiveChartWithRealData(sensor, value);
        }
      } else {
        console.warn(`⚠️ Sensor config not found for: ${key}`);
      }
    }
  });

  // Update heat map with new data
  updateHeatMapWithRealData();
}

// NEW: Update trend indicators based on previous values
const previousValues = {};
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

// NEW: Update heat map with real sensor data
function updateHeatMapWithRealData() {
  const cells = document.querySelectorAll('.heat-cell');
  const temperatureSensors = ['extTemp', 'ds18b20Temp', 'mlxObjTemp', 'mlxAmbTemp'];
  
  cells.forEach((cell, index) => {
    // Use real temperature data to influence heat map
    const sensorIndex = index % temperatureSensors.length;
    const sensorId = temperatureSensors[sensorIndex];
    const sensorValue = sensorData[sensorId];
    
    if (sensorValue) {
      const sensor = sensorConfig.find(s => s.id === sensorId);
      const normalizedValue = (sensorValue.value - sensor.min) / (sensor.max - sensor.min);
      cell.style.backgroundColor = getHeatColor(Math.max(0, Math.min(1, normalizedValue)));
    } else {
      // Fallback to random if no real data yet
      cell.style.backgroundColor = getHeatColor(Math.random());
    }
  });
}

// MODIFIED: Update live chart with real data
function updateLiveChartWithRealData(sensor, newValue) {
  if (!chartInstance || !currentSensor) return;

  const now = new Date();
  
  // Add new data point with real value
  chartData.push({
    time: now,
    value: newValue,
    label: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });

  // Keep only last 50 points
  if (chartData.length > 50) {
    chartData.shift();
  }

  // Update chart with real data
  chartInstance.data.labels = chartData.map(d => d.label);
  chartInstance.data.datasets[0].data = chartData.map(d => d.value);
  chartInstance.update('active');

  // Update stats
  updateChartStats(sensor);
}

// Initialize dashboard
function init() {
    console.log("🚀 Initializing dashboard...");
    generateSensorCards();
    generateHeatMap();
    setupEventListeners();
    loadTheme();
    
    // Debug: List all sensor card elements that were created
    sensorConfig.forEach(sensor => {
        const element = document.getElementById(`${sensor.id}-value`);
        console.log(`🔍 Sensor element check: ${sensor.id}-value`, element ? '✅ Found' : '❌ Missing');
    });
    
    console.log("🚀 Dashboard initialized - waiting for real IoT data");
    console.log("📋 Expected sensor fields:", sensorConfig.map(s => s.id));
}

// Generate sensor cards
function generateSensorCards() {
    const grid = document.getElementById('sensorGrid');
    grid.innerHTML = '';

    sensorConfig.forEach((sensor, index) => {
        const card = document.createElement('div');
        card.className = 'sensor-card';
        card.dataset.sensorId = sensor.id;
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title-section">
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

// Generate heat map
function generateHeatMap() {
    const grid = document.getElementById('heatGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'heat-cell';
        cell.style.backgroundColor = getHeatColor(Math.random());
        grid.appendChild(cell);
    }
}

// Get heat map color
function getHeatColor(intensity) {
    const colors = [
        '#3b82f6', // Blue (cool)
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#f97316', // Orange
        '#ef4444'  // Red (hot)
    ];
    const index = Math.floor(intensity * (colors.length - 1));
    return colors[index];
}

// MODIFIED: Open chart modal - now uses real data
function openChart(sensor) {
    currentSensor = sensor;
    const modal = document.getElementById('chartModal');
    const title = document.getElementById('modalTitle');
    title.textContent = `${sensor.name} - Live IoT Data`;

    // Initialize chart data array with historical data if available
    chartData = [];
    const now = new Date();
    
    // If we have recent data, use it; otherwise generate some initial points
    const currentData = sensorData[sensor.id];
    if (currentData) {
        // Create initial data points leading up to current value
        for (let i = 49; i >= 1; i--) {
            const time = new Date(now.getTime() - i * 2000);
            // Simulate historical values around current value
            const variation = (sensor.max - sensor.min) * 0.1;
            const historicalValue = currentData.value + (Math.random() - 0.5) * variation;
            const clampedValue = Math.max(sensor.min, Math.min(sensor.max, historicalValue));
            
            chartData.push({
                time: time,
                value: clampedValue,
                label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
        }
        
        // Add current real value as the latest point
        chartData.push({
            time: currentData.timestamp,
            value: currentData.value,
            label: currentData.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
    } else {
        // Fallback: generate initial data points if no real data yet
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
                pointBorderWidth: 2,
                pointHoverBackgroundColor: sensor.color,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3,
                shadowColor: sensor.color,
                shadowBlur: 10
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
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                        callback: function(value) {
                            return value.toFixed(1) + sensor.unit;
                        },
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        padding: 8
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        color: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                        maxTicksLimit: 8,
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        padding: 8
                    },
                    border: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
                    titleColor: currentTheme === 'dark' ? '#f8fafc' : '#1e293b',
                    bodyColor: currentTheme === 'dark' ? '#cbd5e1' : '#64748b',
                    borderColor: sensor.color,
                    borderWidth: 2,
                    cornerRadius: 12,
                    displayColors: false,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13,
                        weight: '500'
                    },
                    padding: 12,
                    caretPadding: 8,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `${sensor.name}: ${context.parsed.y.toFixed(2)}${sensor.unit}`;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round'
                },
                point: {
                    hoverBackgroundColor: sensor.color,
                    hoverBorderWidth: 3
                }
            }
        }
    });

    // Update chart stats
    updateChartStats(sensor);

    modal.classList.add('show');
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

// Setup event listeners
function setupEventListeners() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        toggleSidebar();
    });

    // Dock controls
    document.getElementById('dockBtn').addEventListener('click', () => {
        toggleDock();
    });

    document.getElementById('collapseBtn').addEventListener('click', () => {
        collapseSidebar();
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Motor toggle
    document.getElementById('motorToggle').addEventListener('click', toggleMotor);

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(tab.dataset.tab);
        });
    });

    // Motor speed controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (motorEnabled) {
                setMotorSpeed(parseInt(btn.dataset.speed));
            }
        });
    });

    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('chartModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Click outside sidebar on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebarDocked) {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            const dockControls = sidebar.querySelector('.dock-controls');
            
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !dockControls.contains(e.target)) {
                sidebar.classList.add('collapsed');
                sidebarCollapsed = true;
                updateMainContent();
            }
        }
    });
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
    
    updateMainContent();
}

// Toggle dock
function toggleDock() {
    const sidebar = document.getElementById('sidebar');
    const dockBtn = document.getElementById('dockBtn');
    
    sidebarDocked = !sidebarDocked;
    
    if (sidebarDocked) {
        sidebar.classList.add('docked');
        dockBtn.innerHTML = '📍';
        dockBtn.title = 'Unpin Sidebar';
        sidebarCollapsed = false;
        sidebar.classList.remove('collapsed');
    } else {
        sidebar.classList.remove('docked');
        dockBtn.innerHTML = '📌';
        dockBtn.title = 'Pin Sidebar';
    }
    
    updateMainContent();
}

// Collapse sidebar
function collapseSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebarCollapsed = true;
    sidebar.classList.add('collapsed');
    updateMainContent();
}

// Update main content layout
function updateMainContent() {
    const mainContent = document.getElementById('mainContent');
    
    if (sidebarDocked) {
        mainContent.classList.add('sidebar-docked');
        if (!sidebarCollapsed) {
            mainContent.classList.add('sidebar-visible');
        } else {
            mainContent.classList.remove('sidebar-visible');
        }
    } else {
        mainContent.classList.remove('sidebar-docked', 'sidebar-visible');
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        motor: 'Motor Control',
        ai: 'AI Inference',
        heatmap: 'Heat Map',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[tabName];

    // Close sidebar on mobile
    if (window.innerWidth <= 768 && !sidebarDocked) {
        toggleSidebar();
    }
}


// send motor speed to backend via Websocket
function sendMotorSpeed(level){
    socket.send(JSON.stringify({motorSpeed: level}));
}
// Toggle motor on/off
function toggleMotor() {
    motorEnabled = !motorEnabled;
    const toggle = document.getElementById('motorToggle');
    const speedButtons = document.querySelectorAll('.speed-btn');
    const statusIcon = document.getElementById('statusIcon');
    const statusMain = document.getElementById('statusMain');
    const statusSub = document.getElementById('statusSub');
    const speedValue = document.getElementById('speedValue');
    const speedFill = document.getElementById('speedFill');

    if (motorEnabled) {
        // Motor ON
        toggle.classList.add('on');
        statusIcon.classList.add('on');
        statusMain.textContent = 'Motor Ready';
        statusSub.textContent = 'Select speed level to operate';
        
        // Enable speed buttons
        speedButtons.forEach(btn => {
            btn.classList.add('enabled');
        });
        
        // If no speed is selected, default to speed 1
        if (motorSpeed === 0) {
            setMotorSpeed(1);
        }
        
    } else {
        // Motor OFF
        toggle.classList.remove('on');
        statusIcon.classList.remove('on');
        statusMain.textContent = 'Motor Stopped';
        statusSub.textContent = 'Click toggle to start motor';
        
        // Disable speed buttons and reset
        speedButtons.forEach(btn => {
            btn.classList.remove('enabled', 'active');
        });
        speedButtons[0].classList.add('active'); // OFF button
        
        motorSpeed = 0;
        speedValue.textContent = '0% (OFF)';
        speedFill.style.width = '0%';
        speedFill.classList.remove('active');
    }

    // Update sidebar indicator
    updateMotorIndicator();
    
    // TODO: Send command to ESP32 via WebSocket or MQTT
    console.log(`Motor ${motorEnabled ? 'enabled' : 'disabled'}`);
    motorEnabled ? "" : sendMotorSpeed(0); // by me
    
}

// Set motor speed
function setMotorSpeed(speed) {
    if (!motorEnabled && speed > 0) return;
    
    motorSpeed = speed;
    const speedValue = document.getElementById('speedValue');
    const speedFill = document.getElementById('speedFill');
    const statusSub = document.getElementById('statusSub');
    
    // Update speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-speed="${speed}"]`).classList.add('active');

    // Calculate percentage (0-100%)
    const percentage = (speed / 5) * 100;
    
    // Update speed display
    if (speed === 0) {
        speedValue.textContent = '0% (OFF)';
        speedFill.classList.remove('active');
        if (motorEnabled) {
            statusSub.textContent = 'Motor idle - Select speed level';
        }
    } else {
        speedValue.textContent = `${percentage}% (Speed ${speed})`;
        speedFill.classList.add('active');
        statusSub.textContent = `Running at ${percentage}% capacity`;
    }
    
    // Update progress bar
    speedFill.style.width = `${percentage}%`;

    // Update sidebar motor status
    updateMotorIndicator();

    // TODO: Send speed command to ESP32 via WebSocket or MQTT
    console.log(`Motor speed set to: ${speed} (${percentage}%)`);
    sendMotorSpeed(speed)
}

// Update motor indicator in sidebar
function updateMotorIndicator() {
    const indicator = document.getElementById('motorIndicator');
    const statusText = document.getElementById('motorStatusText');
    
    if (!motorEnabled) {
        indicator.classList.remove('on');
        statusText.textContent = 'OFF';
    } else if (motorSpeed === 0) {
        indicator.classList.add('on');
        statusText.textContent = 'IDLE';
        indicator.style.background = 'var(--warning)';
    } else {
        indicator.classList.add('on');
        statusText.textContent = `${(motorSpeed / 5) * 100}%`;
        indicator.style.background = 'var(--success)';
    }
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);

    // Update chart colors if modal is open
    if (chartInstance) {
        chartInstance.options.scales.y.grid.color = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
        chartInstance.options.scales.y.ticks.color = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
        chartInstance.options.scales.x.grid.color = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
        chartInstance.options.scales.x.ticks.color = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
        chartInstance.options.plugins.legend.labels.color = currentTheme === 'dark' ? '#f8fafc' : '#1e293b';
        chartInstance.update();
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
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

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebarDocked) {
            sidebar.classList.remove('collapsed');
            sidebarCollapsed = false;
        }
    }
    updateMainContent();
});

// Simulate AI inference updates
function updateAIStats() {
    const accuracy = document.getElementById('aiAccuracy');
    const inferences = document.getElementById('aiInferences');
    const latency = document.getElementById('aiLatency');
    const confidence = document.getElementById('aiConfidence');

    // Simulate changing values
    accuracy.textContent = (92 + Math.random() * 6).toFixed(1) + '%';
    inferences.textContent = (1200 + Math.floor(Math.random() * 100)).toLocaleString();
    latency.textContent = (20 + Math.floor(Math.random() * 15)) + 'ms';
    confidence.textContent = (85 + Math.random() * 10).toFixed(1) + '%';
}

// Update AI stats periodically
setInterval(updateAIStats, 5000);

// MODIFIED: Connection status now reflects WebSocket connection
function updateConnectionStatus() {
    document.querySelectorAll('.card-status').forEach(status => {
        status.style.backgroundColor = socketConnected ? 'var(--success)' : 'var(--danger)';
        status.title = socketConnected ? 'Connected to AWS IoT Core' : 'Disconnected from AWS IoT Core';
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('chartModal').classList.contains('show')) {
        closeModal();
    }
    
    // Tab switching with numbers
    if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabs = ['dashboard', 'motor', 'ai', 'heatmap', 'settings'];
        switchTab(tabs[parseInt(e.key) - 1]);
    }
});

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', init);

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
});

function handleGesture() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const threshold = 100;
        
        if (touchEndX < touchStartX - threshold && !sidebarDocked) {
            // Swipe left - close sidebar
            sidebar.classList.add('collapsed');
            sidebarCollapsed = true;
            updateMainContent();
        }
        
        if (touchEndX > touchStartX + threshold && touchStartX < 50 && !sidebarDocked) {
            // Swipe right from edge - open sidebar
            sidebar.classList.remove('collapsed');
            sidebarCollapsed = false;
            updateMainContent();
        }
    }
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}












