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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const event = events[index];
                            return event ? `${event.name}: Tension ${context.parsed.y}%` : `Tension: ${context.parsed.y}%`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value, context) {
                        return events[context.dataIndex].name;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    color: '#483C32',
                    display: false // Hidden by default
                }
            }
        }
    });

    Chart.register(ChartDataLabels);
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
    const index = tensionData.labels.push(x.toFixed(2)) - 1;
    tensionData.datasets[0].data.push(y.toFixed(2));
    
    // Create a temporary event
    const tempEvent = {
        x: x.toFixed(2),
        y: y.toFixed(2),
        name: `Event at (${x.toFixed(2)}, ${y.toFixed(2)})`,
        description: '',
        act: ''
    };
    
    events.push(tempEvent);
    
    tensionChart.update();
    updateEventForm(tempEvent, index);
    provideRecommendation();
}

// Update the event form with new coordinates
function updateEventForm(event, index) {
    document.getElementById('event-name').value = event.name;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-act').value = event.act;
    document.getElementById('event-index').value = index;
}

// Provide Recommendations
function provideRecommendation() {
    // ... (keeping this function as is)
}

// Add a new act/chapter division
function addAct() {
    // ... (keeping this function as is)
}

// Save event details
function saveEvent(e) {
    // ... (keeping this function as is)
}

// Update the list of events in the sidebar
function updateEventsList() {
    // ... (keeping this function as is)
}

// Show event details when clicked in the list
function showEventDetails(index) {
    // ... (keeping this function as is)
}

// Save the campaign to local storage
function saveCampaign() {
    // ... (keeping this function as is)
}

// Load the campaign from local storage
function loadCampaign() {
    // ... (keeping this function as is)
}

// Export the chart as an image
function exportAsImage() {
    // Temporarily enable the datalabels plugin
    tensionChart.options.plugins.datalabels.display = true;
    tensionChart.update();

    // Create a new canvas with more height to accommodate labels
    const newCanvas = document.createElement('canvas');
    const scaleFactor = 2; // Increase this for higher resolution
    newCanvas.width = tensionChart.canvas.width * scaleFactor;
    newCanvas.height = tensionChart.canvas.height * scaleFactor;
    const newCtx = newCanvas.getContext('2d');
    newCtx.scale(scaleFactor, scaleFactor);

    // Draw the chart on the new canvas
    newCtx.drawImage(tensionChart.canvas, 0, 0);

    // Convert the new canvas to a data URL
    const url = newCanvas.toDataURL('image/png');

    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tension_curve_with_labels.png';
    a.click();

    // Disable the datalabels plugin again
    tensionChart.options.plugins.datalabels.display = false;
    tensionChart.update();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('event-form').addEventListener('submit', saveEvent);
    document.getElementById('save-btn').addEventListener('click', saveCampaign);
    document.getElementById('load-btn').addEventListener('click', loadCampaign);
    document.getElementById('export-btn').addEventListener('click', exportAsImage);
    document.getElementById('add-act-btn').addEventListener('click', addAct);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
