/**
 * Generates the HTML for the dashboard
 * @param {Object} data - The data to display in the dashboard
 * @param {FormData} formData - The form data used to fetch the data
 * @returns {string} - HTML for the dashboard
 */
export function generateDashboard(data, formData, processedData) {
    // Generate table headers and rows HTML
    let headersHtml = '';
    let rowsHtml = '';
    
    if (processedData.length > 0) {
        const sampleItem = processedData[0];
        const headers = Object.keys(sampleItem);
        
        // Generate headers
        headersHtml = headers.map(header => 
            `<th class="sort-header" data-column="${header}">${header.charAt(0).toUpperCase() + header.slice(1)}</th>`
        ).join('');
        
        // Generate rows
        rowsHtml = processedData.map(item => {
            const cells = headers.map(header => {
                return `<td>${item[header] === null ? '-' : item[header]}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
    } else {
        rowsHtml = '<tr><td colspan="100">No data available</td></tr>';
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <h1>Agent Dashboard</h1>
    
    <div class="actions">
        <button onclick="window.location.href='/'">Back to Connection Form</button>
        <button onclick="refreshData()">
            <span id="refresh-text">Refresh Data</span>
            <span id="refresh-spinner" style="display: none;">
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
            </span>
        </button>
        <button onclick="downloadJson()">Download JSON</button>
    </div>

    <div class="tab-container">
        <div class="tab active" data-tab="table">Table View</div>
        <div class="tab" data-tab="chart">Chart View</div>
        <div class="tab" data-tab="json">Raw JSON</div>
    </div>

    <div id="dashboard">
        <div id="table-tab" class="tab-content active">
            <table id="data-table">
                <thead>
                    <tr>${headersHtml}</tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>
        
        <div id="chart-tab" class="tab-content">
            <div class="chart-controls">
                <div class="form-group">
                    <label for="chart-type">Chart Type:</label>
                    <select id="chart-type" onchange="updateChart()">
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="chart-data-field">Data Field (X-Axis/Labels):</label>
                    <select id="chart-data-field" onchange="updateChart()">
                        ${processedData.length > 0 ? Object.keys(processedData[0]).map(key => 
                            `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
                        ).join('') : ''}
                    </select>
                </div>
                <div class="form-group">
                    <label for="chart-count-by">Count By (Y-Axis/Values):</label>
                    <select id="chart-count-by" onchange="updateChart()">
                        <option value="count">Count</option>
                        ${processedData.length > 0 ? Object.keys(processedData[0]).map(key => 
                            `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
                        ).join('') : ''}
                    </select>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="data-chart"></canvas>
            </div>
        </div>
        
        <div id="json-tab" class="tab-content">
            <div class="json-preview">
                <code id="json-data"></code>
            </div>
        </div>
    </div>

    <script src="/dashboard.js"></script>
    <script>
        // Store form data for refresh functionality
        var savedFormData = {
            apiUrl: "${formData ? encodeURIComponent(formData.get("apiUrl") || "") : ""}",
            apiKey: "${formData ? encodeURIComponent(formData.get("apiKey") || "") : ""}",
            userInput: "${formData ? encodeURIComponent(formData.get("userInput") || "") : ""}",
            asyncOutput: ${formData && formData.get("asyncOutput") === "true" ? "true" : "false"},
            demoMode: ${formData && formData.get("demoMode") === "on" ? "true" : "false"}
        };
        
        // The data fetched from the API
        var apiData = ${JSON.stringify(data)};
        
        // Parse data for charting
        var tableData = ${JSON.stringify(processedData)};
        
        // Display raw JSON
        document.getElementById('json-data').textContent = JSON.stringify(apiData, null, 2);
        
        // Initialize dashboard when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initDashboard(tableData);
        });
        
        // Refresh data function
        function refreshData() {
            refreshData(savedFormData);
        }
        
        // Download JSON function
        function downloadJson() {
            downloadJson(apiData);
        }
    </script>
</body>
</html>`;
}