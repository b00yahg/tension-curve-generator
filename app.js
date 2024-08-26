// Global variables
let tensionData = {
    labels: [],
    datasets: [{
        label: 'Tension',
        data: [],
        borderColor: 'rgb(139, 69, 19)',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        tension: 0.1,
        fill: true
    }]
};

let acts = [];
let events = [];
let tensionChart;

// Initialize the application
function initApp() {
    createChart();
    setupEventListeners();
}

// Create the tension curve chart
function createChart() {
    const ctx = document.getElementById('tension-graph').getContext('2d');
    tensionChart = new Chart(ctx, {
        type: 'line',
        data: tensionData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Tension'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Story Progress'
                    }
                }
            },
            onClick: handleChartClick,
            plugins: {
                annotation: {
                    annotations: []
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const event = events.find(e => e.x === context.parsed.x && e.y === context.parsed.y);
                            return event ? event.name : `Tension: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Handle click events on the chart
function handleChartClick(e) {
    const canvasPosition = Chart.helpers.getRelativePosition(e, tensionChart);
    const dataX = tensionChart.scales.x.getValueForPixel(canvasPosition.x);
    const dataY = tensionChart.scales.y.getValueForPixel(canvasPosition.y);
    addDataPoint(dataX, dataY);
}

// Add a new data point to the chart
function addDataPoint(x, y) {
    tensionData.labels.push(x.toFixed(2));
    tensionData.datasets[0].data.push(y.toFixed(2));
    tensionChart.update();
    updateEventForm(x, y);
    provideRecommendation();
}

// Update the event form with new coordinates
function updateEventForm(x, y) {
    document.getElementById('event-name').value = `Event at (${x.toFixed(2)}, ${y.toFixed(2)})`;
}

// Provide recommendations based on the current tension curve
function provideRecommendation() {
    const data = tensionData.datasets[0].data;
    const lastPoint = data[data.length - 1];
    const secondLastPoint = data[data.length - 2];

    let recommendation = "Based on the tension curve principles: ";

    if (data.length < 2) {
        recommendation += "Add more points to get a recommendation.";
    } else if (lastPoint > secondLastPoint) {
        recommendation += "Consider decreasing tension slightly for variety, or maintain for building suspense.";
    } else if (lastPoint < secondLastPoint) {
        recommendation += "Think about raising tension soon to maintain engagement.";
    } else {
        recommendation += "Consider creating a significant change in tension to drive the story forward.";
    }

    document.getElementById('recommendation-text').textContent = recommendation;
}

// Add a new act/chapter division
function addAct() {
    const actX = tensionData.labels.length > 0 ? 
        parseFloat(tensionData.labels[tensionData.labels.length - 1]) : 0;
    
    acts.push(actX);
    
    tensionChart.options.plugins.annotation.annotations.push({
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: actX,
        borderColor: 'rgb(105, 105, 105)',
        borderWidth: 2,
        label: {
            content: `Act ${acts.length}`,
            enabled: true
        }
    });

    tensionChart.update();
}

// Save event details
function saveEvent() {
    const name = document.getElementById('event-name').value;
    const description = document.getElementById('event-description').value;
    const act = document.getElementById('event-act').value;

    const x = parseFloat(tensionData.labels[tensionData.labels.length - 1]);
    const y = parseFloat(tensionData.datasets[0].data[tensionData.datasets[0].data.length - 1]);

    events.push({ x, y, name, description, act });
    updateEventsList();
}

// Update the list of events in the sidebar
function updateEventsList() {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';
    events.forEach((event, index) => {
        const li = document.createElement('li');
        li.textContent = `${event.name} (Act ${event.act})`;
        li.onclick = () => showEventDetails(index);
        eventsList.appendChild(li);
    });
}

// Show event details when clicked in the list
function showEventDetails(index) {
    const event = events[index];
    document.getElementById('event-name').value = event.name;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-act').value = event.act;
}

// Save the campaign to local storage
function saveCampaign() {
    const campaign = {
        tensionData: tensionData,
        acts: acts,
        events: events
    };

    localStorage.setItem('dndCampaign', JSON.stringify(campaign));
    alert('Campaign saved successfully!');
}

// Load the campaign from local storage
function loadCampaign() {
    const savedCampaign = localStorage.getItem('dndCampaign');
    if (savedCampaign) {
        const campaign = JSON.parse(savedCampaign);
        tensionData = campaign.tensionData;
        acts = campaign.acts;
        events = campaign.events;

        tensionChart.data = tensionData;
        tensionChart.options.plugins.annotation.annotations = acts.map((act, index) => ({
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: act,
            borderColor: 'rgb(105, 105, 105)',
            borderWidth: 2,
            label: {
                content: `Act ${index + 1}`,
                enabled: true
            }
        }));

        tensionChart.update();
        updateEventsList();
        alert('Campaign loaded successfully!');
    } else {
        alert('No saved campaign found!');
    }
}

// Export the chart as an image
function exportAsImage() {
    const url = tensionChart.toBase64Image();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tension_curve.png';
    a.click();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
    });

    document.getElementById('save-btn').addEventListener('click', saveCampaign);
    document.getElementById('load-btn').addEventListener('click', loadCampaign);
    document.getElementById('export-btn').addEventListener('click', exportAsImage);
    document.getElementById('add-act-btn').addEventListener('click', addAct);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
