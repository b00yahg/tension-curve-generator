// Initialize the tension curve data
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

// Create the chart
const ctx = document.getElementById('tension-graph').getContext('2d');
const tensionChart = new Chart(ctx, {
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
            }
        }
    }
});

function handleChartClick(e) {
    const canvasPosition = Chart.helpers.getRelativePosition(e, tensionChart);
    const dataX = tensionChart.scales.x.getValueForPixel(canvasPosition.x);
    const dataY = tensionChart.scales.y.getValueForPixel(canvasPosition.y);
    addDataPoint(dataX, dataY);
}

function addDataPoint(x, y) {
    tensionData.labels.push(x.toFixed(2));
    tensionData.datasets[0].data.push(y.toFixed(2));
    tensionChart.update();
    updateEventForm(x, y);
    provideRecommendation();
}

function updateEventForm(x, y) {
    document.getElementById('event-name').value = `Event at (${x.toFixed(2)}, ${y.toFixed(2)})`;
}

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

function saveEvent() {
    const name = document.getElementById('event-name').value;
    const description = document.getElementById('event-description').value;
    const act = document.getElementById('event-act').value;

    const x = parseFloat(tensionData.labels[tensionData.labels.length - 1]);
    const y = parseFloat(tensionData.datasets[0].data[tensionData.datasets[0].data.length - 1]);

    events.push({ x, y, name, description, act });
}

function saveCampaign() {
    const campaign = {
        tensionData: tensionData,
        acts: acts,
        events: events
    };

    localStorage.setItem('dndCampaign', JSON.stringify(campaign));
    alert('Campaign saved successfully!');
}

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
        alert('Campaign loaded successfully!');
    } else {
        alert('No saved campaign found!');
    }
}

function exportAsImage() {
    const url = tensionChart.toBase64Image();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tension_curve.png';
    a.click();
}

// Event listeners
document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveEvent();
});

document.getElementById('save-btn').addEventListener('click', saveCampaign);
document.getElementById('load-btn').addEventListener('click', loadCampaign);
document.getElementById('export-btn').addEventListener('click', exportAsImage);
document.getElementById('add-act-btn').addEventListener('click', addAct);
