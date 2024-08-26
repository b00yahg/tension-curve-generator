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
    updateEventsList();
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
        li.innerHTML = `
            ${event.name} (Act ${event.act})
            <button onclick="showEventDetails(${index})">Edit</button>
            <button onclick="removePoint(${index})">Remove</button>
        `;
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

// Prompt for campaign name
function getCampaignName() {
    return prompt("Enter your campaign name:", "My D&D Campaign");
}

function exportAsImage() {
    const campaignName = getCampaignName();
    if (!campaignName) return; // Cancel export if no name is provided

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Calculate required width and height
    const graphWidth = tensionChart.width;
    const graphHeight = tensionChart.height;
    const keyWidth = 300;
    const padding = 40;
    
    // Calculate total height based on events
    let totalHeight = graphHeight + padding * 3; // Extra padding for title
    let keyHeight = padding * 3; // Start with padding for title and 'Event Key' text
    let currentAct = '';
    
    events.forEach((event, index) => {
        if (event.act !== currentAct) {
            keyHeight += 25; // Act title
            currentAct = event.act;
        }
        keyHeight += 25; // Event name
        const descriptionLines = getLines(ctx, event.description, keyWidth - padding);
        keyHeight += descriptionLines.length * 20; // Description lines
        keyHeight += 10; // Spacing between events
    });
    
    totalHeight = Math.max(totalHeight, keyHeight);

    tempCanvas.width = graphWidth + keyWidth + padding * 3;
    tempCanvas.height = totalHeight;

    // Create parchment-like background
    const gradient = ctx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
    gradient.addColorStop(0, '#f4e6c5');
    gradient.addColorStop(1, '#e8d5a9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Add subtle texture
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
        ctx.fillRect(Math.random() * tempCanvas.width, Math.random() * tempCanvas.height, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Draw a border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, tempCanvas.width - 20, tempCanvas.height - 20);

    // Draw original chart
    ctx.drawImage(tensionChart.canvas, padding, padding * 2, graphWidth, graphHeight);

    // Add numbered markers for each point
    tensionData.labels.forEach((label, index) => {
        const point = tensionChart.getDatasetMeta(0).data[index];
        ctx.beginPath();
        ctx.arc(point.x + padding, point.y + padding * 2, 12, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 12px "Bookman Old Style", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, point.x + padding, point.y + padding * 2);
    });

    // Add title
    ctx.font = 'bold 24px "Bookman Old Style", Georgia, serif';
    ctx.fillStyle = '#8B4513';
    ctx.textAlign = 'center';
    ctx.fillText(`${campaignName} - D&D Tension Curve`, tempCanvas.width / 2, padding);

    // Add Event Key
    ctx.font = 'bold 18px "Bookman Old Style", Georgia, serif';
    ctx.textAlign = 'left';
    let keyY = padding * 2;
    ctx.fillText('Event Key:', graphWidth + padding * 2, keyY);
    keyY += 30;

    currentAct = '';
    events.forEach((event, index) => {
        if (event.act !== currentAct) {
            ctx.font = 'bold 16px "Bookman Old Style", Georgia, serif';
            ctx.fillText(`Act ${event.act}`, graphWidth + padding * 2, keyY);
            keyY += 25;
            currentAct = event.act;
        }

        ctx.font = 'bold 14px "Bookman Old Style", Georgia, serif';
        ctx.fillText(`${index + 1}. ${event.name}`, graphWidth + padding * 2, keyY);
        keyY += 20;

        ctx.font = '12px "Bookman Old Style", Georgia, serif';
        const descriptionLines = getLines(ctx, event.description, keyWidth - padding);
        descriptionLines.forEach(line => {
            ctx.fillText(line, graphWidth + padding * 2 + 10, keyY);
            keyY += 20;
        });
        keyY += 10; // Extra space between events
    });

    // Convert to image and trigger download
    const url = tempCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaignName} - D&D Tension Curve.png`;
    a.click();
}

// Helper function to wrap text
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

// Helper function to wrap text
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

// Remove a point from the chart
function removePoint(index) {
    tensionData.labels.splice(index, 1);
    tensionData.datasets[0].data.splice(index, 1);
    events.splice(index, 1);
    tensionChart.update();
    updateEventsList();
}

// Setup event listeners (continued)
function setupEventListeners() {
    document.getElementById('event-form').addEventListener('submit', saveEvent);
    document.getElementById('save-btn').addEventListener('click', saveCampaign);
    document.getElementById('load-btn').addEventListener('click', loadCampaign);
    document.getElementById('export-btn').addEventListener('click', exportAsImage);
    document.getElementById('add-act-btn').addEventListener('click', addAct);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// You may want to add any additional utility functions or event handlers here

// For example, if you want to add a clear all function:
function clearAll() {
    tensionData.labels = [];
    tensionData.datasets[0].data = [];
    events = [];
    acts = [];
    tensionChart.update();
    updateEventsList();
    document.getElementById('recommendation-text').innerHTML = '';
}

// Don't forget to add the clear all button to your HTML and connect it here:
// document.getElementById('clear-all-btn').addEventListener('click', clearAll);

// If you want to add a function to edit act divisions:
function editAct(index) {
    const newPosition = prompt("Enter new position for this act division:", acts[index]);
    if (newPosition !== null && !isNaN(newPosition)) {
        acts[index] = parseFloat(newPosition);
        tensionChart.options.plugins.annotation.annotations[index].value = parseFloat(newPosition);
        tensionChart.update();
    }
}

// Remember to update your HTML to include edit buttons for acts and connect them to this function

// You might also want to add a function to remove act divisions:
function removeAct(index) {
    acts.splice(index, 1);
    tensionChart.options.plugins.annotation.annotations.splice(index, 1);
    tensionChart.update();
}

// Again, update your HTML to include remove buttons for acts and connect them to this function

// If you want to add data validation before saving events:
function validateEventData(name, description, act) {
    if (name.trim() === '') {
        alert('Event name cannot be empty');
        return false;
    }
    if (isNaN(act) || act < 1) {
        alert('Act must be a positive number');
        return false;
    }
    return true;
}

// Then modify your saveEvent function to use this validation:
function saveEvent(e) {
    e.preventDefault();
    const name = document.getElementById('event-name').value;
    const description = document.getElementById('event-description').value;
    const act = document.getElementById('event-act').value;
    const index = parseInt(document.getElementById('event-index').value);

    if (!validateEventData(name, description, act)) {
        return;
    }

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

// This completes the app.js file with all the functionality we've discussed
// and some additional utility functions that might be useful.
