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
    tensionChart.update();
    console.log('Event saved:', event);
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

function exportAsImage() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tensionChart.width + 400; // More space for the key
    tempCanvas.height = Math.max(tensionChart.height + 50, events.length * 30 + 100); // Ensure enough height for all events
    const tempCtx = tempCanvas.getContext('2d');

    // Fill background
    tempCtx.fillStyle = '#f4e6c5';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw original chart
    tempCtx.drawImage(tensionChart.canvas, 0, 25, tensionChart.width, tensionChart.height);

    // Add numbered markers for each point
    tensionData.labels.forEach((label, index) => {
        const point = tensionChart.getDatasetMeta(0).data[index];
        tempCtx.beginPath();
        tempCtx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        tempCtx.fillStyle = 'white';
        tempCtx.fill();
        tempCtx.strokeStyle = 'black';
        tempCtx.stroke();
        tempCtx.fillStyle = 'black';
        tempCtx.font = 'bold 12px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(index + 1, point.x, point.y);
    });

    // Add Event Key
    tempCtx.font = 'bold 16px Arial';
    tempCtx.textAlign = 'left';
    tempCtx.fillText('Event Key:', tensionChart.width + 20, 30);

    let keyY = 60;
    events.forEach((event, index) => {
        tempCtx.font = 'bold 14px Arial';
        tempCtx.fillText(`${index + 1}. ${event.name}`, tensionChart.width + 20, keyY);
        keyY += 25;

        tempCtx.font = '12px Arial';
        const descriptionLines = getLines(tempCtx, event.description, 370);
        descriptionLines.forEach(line => {
            tempCtx.fillText(line, tensionChart.width + 40, keyY);
            keyY += 20;
        });
        keyY += 10; // Extra space between events
    });

    // Convert to image and trigger download
    const url = tempCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tension_curve_with_key.png';
    a.click();
}

// Helper function to wrap text (add this if it's not already in your code)
function getLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
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
