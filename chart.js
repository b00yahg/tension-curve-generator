// Initialize the tension curve data
let tensionData = {
    labels: [],
    datasets: [{
        label: 'Tension',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};

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
        onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, tensionChart);
            const dataX = tensionChart.scales.x.getValueForPixel(canvasPosition.x);
            const dataY = tensionChart.scales.y.getValueForPixel(canvasPosition.y);
            addDataPoint(dataX, dataY);
        }
    }
});

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
    // This function will be implemented later to provide recommendations
    // based on the current tension curve
    document.getElementById('recommendation-text').textContent = 'Recommendations will appear here.';
}

// Event listeners
document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle form submission (to be implemented)
});

document.getElementById('save-btn').addEventListener('click', () => {
    // Handle saving the campaign (to be implemented)
});

document.getElementById('load-btn').addEventListener('click', () => {
    // Handle loading a campaign (to be implemented)
});

document.getElementById('export-btn').addEventListener('click', () => {
    // Handle exporting as image (to be implemented)
});
