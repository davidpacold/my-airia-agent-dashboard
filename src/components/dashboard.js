/**
 * Generates the HTML for the dashboard
 * @param {Object} data - The data to display in the dashboard
 * @param {FormData} formData - The form data used to fetch the data
 * @param {Object} processedData - The processed data ready for display with markdown info
 * @param {string} dashboardId - The ID of the current dashboard
 * @param {Array} allDashboards - All available dashboards
 * @returns {string} - HTML for the dashboard
 */
export function generateDashboard(data, formData, processedDataObj, dashboardId, allDashboards = []) {
    // Extract processed data and markdown information
    const processedData = processedDataObj.data || [];
    const isMarkdownReport = processedDataObj.isMarkdownReport || false;
    const markdownContent = processedDataObj.markdownContent || '';
    
    // If we have markdown, convert it to HTML
    let markdownHtml = '';
    if (isMarkdownReport && markdownContent) {
        try {
            // Use imported marked function directly
            markdownHtml = marked.parse(markdownContent);
        } catch (e) {
            console.error("Error converting markdown to HTML:", e);
            // Fallback to simple formatting if marked fails
            markdownHtml = markdownContent
                .replace(/###\s+(.*?)(\n|$)/g, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n-\s+(.*?)(\n|$)/g, '<br>• $1');
        }
    }
    
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
    } else if (!isMarkdownReport) {
        rowsHtml = '<tr><td colspan="100">No data available</td></tr>';
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* Dashboard Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            color: #333;
        }
        h1 {
            color: #2563eb;
            margin-bottom: 1.5rem;
        }
        .actions {
            margin-bottom: 1rem;
        }
        .actions button {
            background-color: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-right: 0.5rem;
        }
        .actions button:hover {
            background-color: #1d4ed8;
        }
        .spinner {
            display: inline-block;
            width: 1em;
            height: 1em;
            vertical-align: middle;
            animation: spin 1s linear infinite;
            margin-right: 0.25rem;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f9fafb;
            cursor: pointer;
            user-select: none;
        }
        th:hover {
            background-color: #f3f4f6;
        }
        tr:hover {
            background-color: #f9fafb;
        }
        .sort-header::after {
            content: "⇕";
            margin-left: 0.25rem;
            font-size: 0.75rem;
        }
        .sort-asc::after {
            content: "↑";
        }
        .sort-desc::after {
            content: "↓";
        }
        .json-preview {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            font-family: monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            max-height: 300px;
            overflow-y: auto;
        }
        .tab-container {
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
        }
        .tab {
            display: inline-block;
            padding: 0.5rem 1rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        .tab.active {
            border-bottom: 2px solid #2563eb;
            color: #2563eb;
            font-weight: 500;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .chart-controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            background-color: #f9fafb;
            padding: 1rem;
            border-radius: 8px;
        }
        .chart-controls .form-group {
            display: flex;
            flex-direction: column;
            min-width: 200px;
        }
        .chart-controls label {
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .chart-controls select {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        .chart-container {
            height: 400px;
            position: relative;
        }
        
        /* Markdown Report Styles */
        .markdown-report {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            padding: 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .markdown-report h3 {
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .markdown-report ul {
            padding-left: 1.5rem;
            list-style-type: disc;
        }
        
        .markdown-report li {
            margin-bottom: 0.5rem;
        }
        
        .markdown-report strong {
            color: #4b5563;
            font-weight: 600;
        }
        
        .markdown-report p {
            margin-bottom: 1rem;
        }
        
        /* Dashboard Tabs Styles */
        .dashboard-tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1.5rem;
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 2px;
        }
        .dashboard-tab {
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-size: 0.875rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            margin-right: 4px;
        }
        .dashboard-tab.active {
            border-bottom: 2px solid #2563eb;
            color: #2563eb;
            font-weight: 500;
        }
        .dashboard-tab:hover {
            background-color: #f3f4f6;
        }
        .dashboard-tab.add-tab {
            color: #6b7280;
        }
        .dashboard-tab svg {
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <h1>Agent Dashboard</h1>
    
    ${allDashboards && allDashboards.length > 1 ? `
    <div class="dashboard-tabs">
        ${allDashboards.map(dashboard => 
            `<div class="dashboard-tab ${dashboard.id === dashboardId ? 'active' : ''}" 
                  data-id="${dashboard.id}" 
                  onclick="window.location.href='/dashboard/${dashboard.id}'">
                ${dashboard.name}
            </div>`
        ).join('')}
        <div class="dashboard-tab add-tab" onclick="window.location.href='/'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            New
        </div>
    </div>` : ''}
    
    <div class="actions">
        <button onclick="window.location.href='/'">New Dashboard</button>
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
        <button onclick="deleteDashboard('${dashboardId}')" style="background-color: #ef4444;">Delete Dashboard</button>
    </div>

    <div class="tab-container">
        <div class="tab ${!isMarkdownReport ? 'active' : ''}" data-tab="table">Table View</div>
        <div class="tab" data-tab="chart">Chart View</div>
        ${isMarkdownReport ? `<div class="tab active" data-tab="report">Report View</div>` : ''}
        <div class="tab" data-tab="json">Raw JSON</div>
    </div>

    <div id="dashboard">
        <div id="table-tab" class="tab-content ${!isMarkdownReport ? 'active' : ''}">
            <table id="data-table">
                <thead>
                    <tr>${headersHtml}</tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>
        
        ${isMarkdownReport ? `
        <div id="report-tab" class="tab-content active">
            <div class="markdown-report">
                ${markdownHtml}
            </div>
        </div>` : ''}
        
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

    <script>
        // Store all required data
        const apiData = ${JSON.stringify(data)};
        const tableData = ${JSON.stringify(processedData)};
        const dashboardId = "${dashboardId}";
        const savedFormData = {
            apiUrl: "${formData ? encodeURIComponent(formData.get("apiUrl") || "") : ""}",
            apiKey: "${formData ? encodeURIComponent(formData.get("apiKey") || "") : ""}",
            userInput: "${formData ? encodeURIComponent(formData.get("userInput") || "") : ""}",
            asyncOutput: ${formData && formData.get("asyncOutput") === "true" ? "true" : "false"},
            demoMode: ${formData && formData.get("demoMode") === "on" ? "true" : "false"}
        };
        
        // Display raw JSON data
        document.getElementById('json-data').textContent = JSON.stringify(apiData, null, 2);
        
        // Chart instance
        let chartInstance = null;
        
        // Refresh data function for current dashboard
        function refreshData() {
            try {
                // Show loading spinner
                document.getElementById('refresh-text').style.display = 'none';
                document.getElementById('refresh-spinner').style.display = 'inline';
                
                // Create a form element
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/refresh-dashboard/' + dashboardId;
                form.style.display = 'none';
                
                // Add required fields
                function addField(name, value) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                }
                
                addField('apiUrl', decodeURIComponent(savedFormData.apiUrl));
                addField('apiKey', decodeURIComponent(savedFormData.apiKey));
                
                // Add optional fields
                if (savedFormData.userInput) {
                    addField('userInput', decodeURIComponent(savedFormData.userInput));
                }
                
                if (savedFormData.asyncOutput) {
                    addField('asyncOutput', 'true');
                }
                
                if (savedFormData.demoMode) {
                    addField('demoMode', 'on');
                }
                
                // Submit the form
                document.body.appendChild(form);
                form.submit();
            } catch (error) {
                // Reset UI if there's an error
                document.getElementById('refresh-text').style.display = 'inline';
                document.getElementById('refresh-spinner').style.display = 'none';
                alert("Error refreshing data: " + error.message);
            }
        }
        
        // Download JSON function  
        function downloadJson() {
            const dataStr = JSON.stringify(apiData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.download = 'data.json';
            link.href = url;
            link.click();
        }
        
        // Delete dashboard function
        function deleteDashboard(id) {
            if (confirm('Are you sure you want to delete this dashboard?')) {
                fetch('/dashboard/' + id, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        alert('Failed to delete dashboard');
                    }
                })
                .catch(error => {
                    console.error('Error deleting dashboard:', error);
                    alert('Error deleting dashboard: ' + error.message);
                });
            }
        }
        
        // Setup tab navigation
        function setupTabs() {
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Activate corresponding content
                    const tabName = this.getAttribute('data-tab');
                    document.getElementById(tabName + '-tab').classList.add('active');
                    
                    // Refresh the chart if we're switching to the chart tab
                    if (tabName === 'chart' && tableData.length > 0) {
                        updateChart();
                    }
                });
            });
        }
        
        // Setup table sorting
        function setupTableSorting() {
            const headers = document.querySelectorAll('.sort-header');
            let currentSort = null;
            let currentSortDir = 'asc';
            
            headers.forEach(header => {
                header.addEventListener('click', function() {
                    const column = this.getAttribute('data-column');
                    
                    // Toggle sort direction
                    if (currentSort === column) {
                        currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSort = column;
                        currentSortDir = 'asc';
                    }
                    
                    // Remove sort classes from all headers
                    headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
                    
                    // Add sort class to clicked header
                    this.classList.add(currentSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
                    
                    // Sort the table
                    sortTable(column, currentSortDir);
                });
            });
        }
        
        // Sort table function
        function sortTable(column, direction) {
            const table = document.getElementById('data-table');
            const tbody = table.getElementsByTagName('tbody')[0];
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            
            // Sort rows
            rows.sort(function(a, b) {
                const aValue = a.cells[getColumnIndex(column)].textContent;
                const bValue = b.cells[getColumnIndex(column)].textContent;
                
                // Try to convert to numbers if possible
                const aNum = Number(aValue);
                const bNum = Number(bValue);
                
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                // Otherwise sort as strings
                return direction === 'asc' ? 
                    aValue.localeCompare(bValue) : 
                    bValue.localeCompare(aValue);
            });
            
            // Re-add rows in sorted order
            rows.forEach(row => tbody.appendChild(row));
        }
        
        // Get column index by name
        function getColumnIndex(columnName) {
            const headers = document.querySelectorAll('.sort-header');
            for (let i = 0; i < headers.length; i++) {
                if (headers[i].getAttribute('data-column') === columnName) {
                    return i;
                }
            }
            return 0;
        }
        
        // Process data for different chart types
        function processDataForChart(data, field, chartType, countBy) {
            // For empty data
            if (!data || data.length === 0) {
                return {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: []
                    }]
                };
            }
            
            // Group data by the field
            const groups = {};
            const uniqueLabels = [];
            
            data.forEach(function(item) {
                const key = String(item[field] || '-');
                
                if (!groups[key]) {
                    groups[key] = [];
                    uniqueLabels.push(key);
                }
                
                groups[key].push(item);
            });
            
            // Sort labels
            const allNumbers = uniqueLabels.every(function(val) {
                return !isNaN(Number(val)) && val !== '-';
            });
            
            if (allNumbers) {
                uniqueLabels.sort(function(a, b) {
                    return Number(a) - Number(b);
                });
            } else {
                uniqueLabels.sort();
            }
            
            // Generate colors for the chart
            const colors = generateColors(uniqueLabels.length);
            
            // If we're just counting occurrences
            if (countBy === 'count') {
                if (chartType === 'line' || chartType === 'bar') {
                    return {
                        labels: uniqueLabels,
                        datasets: [{
                            label: 'Count',
                            data: uniqueLabels.map(function(label) { return groups[label].length; }),
                            backgroundColor: chartType === 'line' ? colors[0] : colors,
                            borderColor: chartType === 'line' ? colors[0] : 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1
                        }]
                    };
                } else if (chartType === 'pie' || chartType === 'doughnut') {
                    return {
                        labels: uniqueLabels,
                        datasets: [{
                            data: uniqueLabels.map(function(label) { return groups[label].length; }),
                            backgroundColor: colors,
                            hoverOffset: 4
                        }]
                    };
                }
            } 
            // If we're aggregating by another field
            else {
                // Find all unique values of the count-by field for datasets
                const uniqueCountByValues = [];
                const countByValueMap = {};
                
                // Extract unique count-by values across all data
                data.forEach(function(item) {
                    const value = String(item[countBy] || '-');
                    if (!countByValueMap[value]) {
                        countByValueMap[value] = true;
                        uniqueCountByValues.push(value);
                    }
                });
                
                // Sort the count-by values
                uniqueCountByValues.sort();
                
                if (chartType === 'bar') {
                    // Create a dataset for each count-by value
                    const datasets = uniqueCountByValues.map(function(countByValue, index) {
                        const color = colors[index % colors.length];
                        return {
                            label: countByValue,
                            data: uniqueLabels.map(function(label) {
                                // Count items in this group with this count-by value
                                return groups[label].filter(function(item) {
                                    return String(item[countBy] || '-') === countByValue;
                                }).length;
                            }),
                            backgroundColor: color,
                            borderWidth: 1
                        };
                    });
                    
                    return {
                        labels: uniqueLabels,
                        datasets: datasets
                    };
                } else if (chartType === 'line') {
                    // Create a dataset for each count-by value
                    const datasets = uniqueCountByValues.map(function(countByValue, index) {
                        const color = colors[index % colors.length];
                        return {
                            label: countByValue,
                            data: uniqueLabels.map(function(label) {
                                // Count items in this group with this count-by value
                                return groups[label].filter(function(item) {
                                    return String(item[countBy] || '-') === countByValue;
                                }).length;
                            }),
                            backgroundColor: 'transparent',
                            borderColor: color,
                            pointBackgroundColor: color,
                            borderWidth: 2
                        };
                    });
                    
                    return {
                        labels: uniqueLabels,
                        datasets: datasets
                    };
                } else if (chartType === 'pie' || chartType === 'doughnut') {
                    // For pie/doughnut, we'll need to adjust the approach
                    // We'll count combinations of field and countBy
                    const pieData = [];
                    const pieLabels = [];
                    const pieColors = [];
                    
                    uniqueLabels.forEach(function(label, labelIndex) {
                        uniqueCountByValues.forEach(function(countByValue, countByIndex) {
                            const count = groups[label].filter(function(item) {
                                return String(item[countBy] || '-') === countByValue;
                            }).length;
                            
                            if (count > 0) {
                                pieData.push(count);
                                pieLabels.push(label + ' / ' + countByValue);
                                
                                // Calculate a mixed color
                                const colorIndex = (labelIndex * uniqueCountByValues.length + countByIndex) % colors.length;
                                pieColors.push(colors[colorIndex]);
                            }
                        });
                    });
                    
                    return {
                        labels: pieLabels,
                        datasets: [{
                            data: pieData,
                            backgroundColor: pieColors,
                            hoverOffset: 4
                        }]
                    };
                }
            }
        }
        
        // Generate colors for chart
        function generateColors(count) {
            const colors = [];
            const baseHues = [0, 60, 120, 180, 240, 300]; // Red, Yellow, Green, Cyan, Blue, Magenta
            
            for (let i = 0; i < count; i++) {
                const hue = baseHues[i % baseHues.length];
                const lightness = 50 + (Math.floor(i / baseHues.length) * 10); // Adjust lightness for more colors
                colors.push('hsl(' + hue + ', 70%, ' + Math.min(lightness, 80) + '%)');
            }
            
            return colors;
        }
        
        // Update chart function
        function updateChart() {
            // Get the selected chart type and data field
            const chartType = document.getElementById('chart-type').value;
            const dataField = document.getElementById('chart-data-field').value;
            const countBy = document.getElementById('chart-count-by').value;
            
            // Get canvas element
            const ctx = document.getElementById('data-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            // Process data for the chart
            const chartData = processDataForChart(tableData, dataField, chartType, countBy);
            
            // Create the new chart
            chartInstance = new Chart(ctx, {
                type: chartType,
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: countBy === 'count' 
                                ? dataField.charAt(0).toUpperCase() + dataField.slice(1) + ' Distribution'
                                : dataField.charAt(0).toUpperCase() + dataField.slice(1) + ' by ' + countBy.charAt(0).toUpperCase() + countBy.slice(1),
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
        }
        
        // Initialize when the page loads
        document.addEventListener('DOMContentLoaded', function() {
            setupTabs();
            setupTableSorting();
            if (tableData.length > 0) {
                updateChart();
            }
        });
    </script>
</body>
</html>`;
}