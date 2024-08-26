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
                        return events[context.dataIndex] ? events[context.dataIndex].name : '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    color: '#483C32',
                    display: false // Hidden by default
                },
                annotation: {
                    annotations: []
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
    const data = tensionData.datasets[0].data;
    const lastPoint = Math.round(parseFloat(data[data.length - 1]));
    const secondLastPoint = data.length > 1 ? Math.round(parseFloat(data[data.length - 2])) : 0;

    let recommendation = "";
    let changeAmount = 0;
    let direction = "";

    if (data.length < 2) {
        recommendation = "Add more points to get a recommendation. For the first point, consider a moderate rise in tension (around 20-30%).";
    } else {
        changeAmount = lastPoint - secondLastPoint;
        direction = changeAmount > 0 ? "up" : "down";

        if (direction === "up") {
            const suggestedChange = Math.min(Math.max(5, changeAmount - 5), 100 - lastPoint);
            recommendation = `Tension has gone up by ${changeAmount}%. Consider decreasing it by about ${suggestedChange}%.`;
        } else {
            const suggestedChange = Math.min(Math.max(5, Math.abs(changeAmount) + 5), lastPoint);
            recommendation = `Tension has gone down by ${Math.abs(changeAmount)}%. Consider increasing it by about ${suggestedChange}%.`;
        }

        if (data.length > 5 && Math.random() < 0.3) {
            recommendation += " Alternatively, you might consider starting a new arc or dramatically changing the current situation.";
        }
    }

    recommendation += "\n\nConsider the following methods to adjust tension:\n";

    if (direction === "down" || data.length < 2) {
        recommendation += "1. Make the Goal More Ambitious: Add a new goal or expand the current one.\n";
        recommendation += "2. Increase Obstacle Difficulty: Add new challenges or intensify existing ones.\n";
        recommendation += "3. Raise the Stakes: Increase the consequences of failure or benefits of success.\n";
    } else {
        recommendation += "1. Provide an Alternate Goal: Offer a less intense but still satisfying objective.\n";
        recommendation += "2. Remove or Reduce Obstacles: Make the current challenges easier to overcome.\n";
        recommendation += "3. Lower the Stakes: Decrease the immediate consequences or benefits.\n";
    }

    document.getElementById('recommendation-text').innerHTML = recommendation.replace(/\n/g, '<br>');
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
function saveEvent(e) {
    e.preventDefault();
    const name = document.getElementById('event-name').value;
    const description = document.getElementById('event-description').value;
    const act = document.getElementById('event-act').value;
    const index = parseInt(document.getElementById('event-index').value);

    const event = {
        x: tensionData.labels[index],
        y: tensionData.datasets[0].data[index],
        name,
        description,
        act
    };

    events[index] = event;

    updateEventsList();
    tensionChart.update(); // Force chart update to refresh tooltips
    console.log('Event saved:', event); // Add this line for debugging
    alert('Event saved successfully!');
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
    document.getElementById('event-index').value = index;
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
