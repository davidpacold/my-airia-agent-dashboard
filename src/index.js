/**
 * Agent Dashboard - displays data in a sortable table
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your dashboard in action
 * - Run `npm run deploy` to publish your worker
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;

		// Check if the request is a form submission to fetch data
		if (request.method === "POST" && path === "/fetch-data") {
			try {
				// Parse form data
				const formData = await request.formData();
				const apiUrl = formData.get("apiUrl");
				const apiKey = formData.get("apiKey");
				const userInput = formData.get("userInput");
				const asyncOutput = formData.get("asyncOutput") === "true";
				
				// Validate required fields
				if (!apiUrl || !apiKey) {
					return new Response("Missing required fields", {
						status: 400,
						headers: { "Content-Type": "text/plain" },
					});
				}

				let data;
				const demoMode = formData.get("demoMode") === "on";
				
				if (demoMode) {
					// DEMO MODE: Use sample data
					console.log(`Demo mode: Using sample data instead of API call`);
					
					// Use sample data
					data = {
						"pipelineId": "123e4567-e89b-12d3-a456-426614174000",
						"status": "completed",
						"created": "2025-01-01T10:00:00Z",
						"completed": "2025-01-01T10:01:30Z",
						"result": "```json\n[\n    {\n        \"id\": \"10001\",\n        \"key\": \"DEMO-1\",\n        \"fields\": {\n            \"summary\": \"Update documentation for API v2\",\n            \"assignee\": {\n                \"displayName\": \"John Smith\",\n                \"emailAddress\": \"john.smith@example.com\"\n            },\n            \"status\": {\n                \"name\": \"In Progress\"\n            }\n        }\n    },\n    {\n        \"id\": \"10002\",\n        \"key\": \"DEMO-2\",\n        \"fields\": {\n            \"summary\": \"Prepare quarterly presentation\",\n            \"assignee\": {\n                \"displayName\": \"Jane Doe\",\n                \"emailAddress\": \"jane.doe@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Backlog\"\n            }\n        }\n    },\n    {\n        \"id\": \"10003\",\n        \"key\": \"DEMO-3\",\n        \"fields\": {\n            \"summary\": \"Build landing page prototype\",\n            \"assignee\": {\n                \"displayName\": \"Alex Johnson\",\n                \"emailAddress\": \"alex.johnson@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Done\"\n            }\n        }\n    },\n    {\n        \"id\": \"10004\",\n        \"key\": \"DEMO-4\",\n        \"fields\": {\n            \"summary\": \"Review vendor contracts\",\n            \"assignee\": {\n                \"displayName\": \"Sam Taylor\",\n                \"emailAddress\": \"sam.taylor@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Done\"\n            }\n        }\n    },\n    {\n        \"id\": \"10005\",\n        \"key\": \"DEMO-5\",\n        \"fields\": {\n            \"summary\": \"Competitor analysis report\",\n            \"assignee\": {\n                \"displayName\": \"Morgan Lee\",\n                \"emailAddress\": \"morgan.lee@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Backlog\"\n            }\n        }\n    }\n]\n```",
						"report": null,
						"isBackupPipeline": false
					};
				} else {
					// LIVE MODE: Make actual API request
					const response = await fetch(apiUrl, {
						method: "POST",
						headers: {
							"X-API-KEY": apiKey,
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							userInput: userInput || "Example user input",
							asyncOutput: asyncOutput
						})
					});

					if (!response.ok) {
						throw new Error(`API request failed with status ${response.status}`);
					}
					
					data = await response.json();
				}
				
				// Return HTML with the dashboard
				return new Response(generateDashboard(data, formData), {
					headers: {
						"Content-Type": "text/html;charset=UTF-8",
					},
				});
			} catch (error) {
				return new Response(`Error fetching data: ${error.message}`, {
					status: 500,
					headers: {
						"Content-Type": "text/plain",
					},
				});
			}
		} else {
			// Show the connection form for GET requests or other paths
			return new Response(generateConnectionForm(), {
				headers: {
					"Content-Type": "text/html;charset=UTF-8",
				},
			});
		}
	},
};

/**
 * Generates the HTML for the connection form
 */
function generateConnectionForm() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Agent Dashboard - Connect</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			line-height: 1.5;
			padding: 2rem;
			max-width: 800px;
			margin: 0 auto;
			color: #333;
		}
		h1 {
			color: #2563eb;
			margin-bottom: 1.5rem;
		}
		.form-container {
			background-color: #f9fafb;
			border-radius: 8px;
			padding: 2rem;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		}
		.form-group {
			margin-bottom: 1.5rem;
		}
		label {
			display: block;
			margin-bottom: 0.5rem;
			font-weight: 500;
		}
		input[type="text"],
		input[type="url"],
		textarea {
			width: 100%;
			padding: 0.75rem;
			border: 1px solid #d1d5db;
			border-radius: 4px;
			font-size: 1rem;
			font-family: inherit;
		}
		.checkbox-group {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
		.checkbox-group label {
			margin-bottom: 0;
			font-weight: normal;
		}
		input[type="checkbox"] {
			width: 1rem;
			height: 1rem;
		}
		button {
			background-color: #2563eb;
			color: white;
			border: none;
			border-radius: 4px;
			padding: 0.75rem 1.5rem;
			font-size: 1rem;
			font-weight: 500;
			cursor: pointer;
			transition: background-color 0.2s;
		}
		button:hover {
			background-color: #1d4ed8;
		}
		.hint {
			margin-top: 0.5rem;
			font-size: 0.875rem;
			color: #6b7280;
		}
	</style>
</head>
<body>
	<h1>Agent Dashboard</h1>
	
	<div class="form-container">
		<form id="connection-form" action="/fetch-data" method="POST">
			<div class="form-group">
				<label for="apiUrl">API Endpoint URL</label>
				<input 
					type="url" 
					id="apiUrl" 
					name="apiUrl" 
					placeholder="https://api.example.com/v1/data" 
					required
				>
				<div class="hint">The complete URL for the API endpoint</div>
			</div>
			
			<div class="form-group">
				<label for="apiKey">API Key</label>
				<input 
					type="text" 
					id="apiKey" 
					name="apiKey" 
					placeholder="Your API Key" 
					required
				>
				<div class="hint">Your X-API-KEY for authentication</div>
			</div>
			
			<div class="form-group checkbox-group">
				<input type="checkbox" id="demoMode" name="demoMode" checked>
				<label for="demoMode">Use Demo Mode</label>
				<div class="hint">When checked, will use sample data instead of making an actual API call</div>
			</div>
			
			<div class="form-group">
				<label for="userInput">User Input</label>
				<textarea 
					id="userInput" 
					name="userInput" 
					rows="3" 
					placeholder="Example user input"
				></textarea>
				<div class="hint">Optional. Default is "Example user input"</div>
			</div>
			
			<div class="form-group checkbox-group">
				<input type="checkbox" id="asyncOutput" name="asyncOutput" value="true">
				<label for="asyncOutput">Async Output</label>
				<div class="hint">Whether to process the request asynchronously</div>
			</div>
			
			<button type="submit" id="submit-btn">
				<span id="submit-text">Connect & Fetch Data</span>
				<span id="submit-spinner" style="display: none;">
					<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="display: inline-block; width: 1em; height: 1em; vertical-align: middle; animation: spin 1s linear infinite;">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Processing...
				</span>
			</button>
		</form>
	</div>

	<script>
		// Form validation and submission
		document.getElementById('connection-form').addEventListener('submit', function(e) {
			var apiUrl = document.getElementById('apiUrl').value;
			var apiKey = document.getElementById('apiKey').value;
			
			if (!apiUrl || !apiKey) {
				e.preventDefault();
				alert('Please fill in all required fields');
				return;
			}
			
			// Show loading spinner
			document.getElementById('submit-text').style.display = 'none';
			document.getElementById('submit-spinner').style.display = 'inline';
			document.getElementById('submit-btn').disabled = true;
		});
	</script>
</body>
</html>`;
}

/**
 * Generates the HTML for the dashboard
 */
function generateDashboard(data, formData) {
	// Parse and extract JSON from markdown if needed
	let tableData = [];
	if (data && typeof data.result === 'string') {
		try {
			// Clean up the result string if it contains markdown code blocks
			let jsonStr = data.result;
			
			// Remove markdown code blocks if present
			if (jsonStr.includes("```")) {
				const start = jsonStr.indexOf("\n", jsonStr.indexOf("```"));
				const end = jsonStr.lastIndexOf("```");
				if (start > 0 && end > start) {
					jsonStr = jsonStr.substring(start + 1, end);
				}
			}
			
			// Try to parse the result string as JSON
			const parsedResult = JSON.parse(jsonStr);
			
			// If the parsed result is already an array, use it directly
			if (Array.isArray(parsedResult)) {
				tableData = parsedResult;
			}
			// If parsing succeeded and result contains a "projects" array, use it
			else if (parsedResult && Array.isArray(parsedResult.projects)) {
				tableData = parsedResult.projects;
			}
			// If parsing succeeded and result is an object, use it
			else if (typeof parsedResult === 'object' && parsedResult !== null) {
				tableData = [parsedResult];
			}
		} catch (e) {
			console.log("Could not parse result as JSON:", e);
		}
	}
	// If data is already an array, use it directly
	else if (Array.isArray(data)) {
		tableData = data;
	}
	// If data is an object with arrays inside, extract the first array found
	else if (typeof data === 'object' && data !== null) {
		for (const key in data) {
			if (Array.isArray(data[key])) {
				tableData = data[key];
				break;
			}
		}
		
		// If no arrays found but object has properties, create an array with just this object
		if (tableData.length === 0 && Object.keys(data).length > 0) {
			tableData = [data];
		}
	}
	
	// Process data for display and charting - handle JIRA-like nested structure
	let processedData = [];
	
	if (tableData.length > 0) {
		// Check if we have JIRA-like structure with 'fields' property
		const hasFields = tableData[0].fields && typeof tableData[0].fields === 'object';
		
		processedData = tableData.map(item => {
			// Create a normalized item
			let normalizedItem = {};
			
			if (hasFields) {
				// Add id and key from the main object
				normalizedItem.id = item.id || '';
				normalizedItem.key = item.key || '';
				
				// Extract fields from the nested 'fields' object
				if (item.fields) {
					// Process each field in the fields object
					Object.keys(item.fields).forEach(fieldKey => {
						const value = item.fields[fieldKey];
						
						// Extract useful values from nested objects
						if (typeof value === 'object' && value !== null) {
							if (value.displayName) {
								normalizedItem[fieldKey] = value.displayName;
							} else if (value.name) {
								normalizedItem[fieldKey] = value.name;
							} else if (value.emailAddress) {
								normalizedItem[fieldKey] = value.emailAddress;
							} else {
								normalizedItem[fieldKey] = JSON.stringify(value);
							}
						} else {
							// For non-object values
							normalizedItem[fieldKey] = value === null ? '-' : value;
						}
					});
				}
			} else {
				// For data that's not in the JIRA structure, just copy all properties
				normalizedItem = { ...item };
				
				// Process any nested objects in the item
				Object.keys(normalizedItem).forEach(key => {
					const value = normalizedItem[key];
					if (typeof value === 'object' && value !== null) {
						if (value.displayName) {
							normalizedItem[key] = value.displayName;
						} else if (value.name) {
							normalizedItem[key] = value.name;
						} else if (value.emailAddress) {
							normalizedItem[key] = value.emailAddress;
						}
					}
				});
			}
			
			return normalizedItem;
		});
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
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			line-height: 1.5;
			padding: 2rem;
			max-width: 1200px;
			margin: 0 auto;
		}
		h1 {
			color: #2563eb;
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
		.loading {
			display: none;
			margin-left: 1rem;
			font-style: italic;
			color: #6b7280;
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
	</style>
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
		
		// Chart instance
		var chartInstance = null;
		
		// Initialize the chart when the page loads
		document.addEventListener('DOMContentLoaded', function() {
			// Initialize the chart if we have data
			if (tableData.length > 0) {
				updateChart();
			}
		});
		
		// Function to update the chart based on selected options
		function updateChart() {
			// Get the selected chart type and data field
			var chartType = document.getElementById('chart-type').value;
			var dataField = document.getElementById('chart-data-field').value;
			var countBy = document.getElementById('chart-count-by').value;
			
			// Get canvas element
			var ctx = document.getElementById('data-chart').getContext('2d');
			
			// Destroy existing chart if it exists
			if (chartInstance) {
				chartInstance.destroy();
			}
			
			// Process data for the chart
			var chartData = processDataForChart(tableData, dataField, chartType, countBy);
			
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
		
		// Function to process data for different chart types
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
			var groups = {};
			var uniqueLabels = [];
			
			data.forEach(function(item) {
				var key = String(item[field] || '-');
				
				if (!groups[key]) {
					groups[key] = [];
					uniqueLabels.push(key);
				}
				
				groups[key].push(item);
			});
			
			// Sort labels
			var allNumbers = uniqueLabels.every(function(val) {
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
			var colors = generateColors(uniqueLabels.length);
			
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
				var uniqueCountByValues = [];
				var countByValueMap = {};
				
				// Extract unique count-by values across all data
				data.forEach(function(item) {
					var value = String(item[countBy] || '-');
					if (!countByValueMap[value]) {
						countByValueMap[value] = true;
						uniqueCountByValues.push(value);
					}
				});
				
				// Sort the count-by values
				uniqueCountByValues.sort();
				
				if (chartType === 'bar') {
					// Create a dataset for each count-by value
					var datasets = uniqueCountByValues.map(function(countByValue, index) {
						var color = colors[index % colors.length];
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
					var datasets = uniqueCountByValues.map(function(countByValue, index) {
						var color = colors[index % colors.length];
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
					var pieData = [];
					var pieLabels = [];
					var pieColors = [];
					
					uniqueLabels.forEach(function(label, labelIndex) {
						uniqueCountByValues.forEach(function(countByValue, countByIndex) {
							var count = groups[label].filter(function(item) {
								return String(item[countBy] || '-') === countByValue;
							}).length;
							
							if (count > 0) {
								pieData.push(count);
								pieLabels.push(label + ' / ' + countByValue);
								
								// Calculate a mixed color
								var colorIndex = (labelIndex * uniqueCountByValues.length + countByIndex) % colors.length;
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
		
		// Generate colors for chart elements
		function generateColors(count) {
			var colors = [];
			var baseHues = [0, 60, 120, 180, 240, 300]; // Red, Yellow, Green, Cyan, Blue, Magenta
			
			for (var i = 0; i < count; i++) {
				var hue = baseHues[i % baseHues.length];
				var lightness = 50 + (Math.floor(i / baseHues.length) * 10); // Adjust lightness for more colors
				colors.push('hsl(' + hue + ', 70%, ' + Math.min(lightness, 80) + '%)');
			}
			
			return colors;
		}
		
		// Function to refresh data - using a form submission approach for better browser compatibility
		function refreshData() {
			try {
				// Show loading spinner
				document.getElementById('refresh-text').style.display = 'none';
				document.getElementById('refresh-spinner').style.display = 'inline';
				
				// Create a form element
				var form = document.createElement('form');
				form.method = 'POST';
				form.action = '/fetch-data';
				form.style.display = 'none';
				
				// Add all the form fields
				function addField(name, value) {
					var input = document.createElement('input');
					input.type = 'hidden';
					input.name = name;
					input.value = value;
					form.appendChild(input);
				}
				
				// Add required fields
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
				
				// Append the form to the body and submit it
				document.body.appendChild(form);
				form.submit();
			} catch (error) {
				// Reset UI if there's an error
				document.getElementById('refresh-text').style.display = 'inline';
				document.getElementById('refresh-spinner').style.display = 'none';
				alert("Error refreshing data: " + error.message);
			}
		}
		
		// Function to download the JSON data
		function downloadJson() {
			var dataStr = JSON.stringify(apiData, null, 2);
			var dataBlob = new Blob([dataStr], {type: 'application/json'});
			var url = URL.createObjectURL(dataBlob);
			var link = document.createElement('a');
			link.download = 'data.json';
			link.href = url;
			link.click();
		}
		
		// Setup tab navigation
		var tabs = document.querySelectorAll('.tab');
		for (var i = 0; i < tabs.length; i++) {
			tabs[i].addEventListener('click', function() {
				// Remove active class from all tabs
				var allTabs = document.querySelectorAll('.tab');
				for (var j = 0; j < allTabs.length; j++) {
					allTabs[j].classList.remove('active');
				}
				
				var allTabContents = document.querySelectorAll('.tab-content');
				for (var j = 0; j < allTabContents.length; j++) {
					allTabContents[j].classList.remove('active');
				}
				
				// Add active class to clicked tab
				this.classList.add('active');
				
				// Activate corresponding content
				var tabName = this.getAttribute('data-tab');
				document.getElementById(tabName + '-tab').classList.add('active');
				
				// Refresh the chart if we're switching to the chart tab
				if (tabName === 'chart' && tableData.length > 0) {
					updateChart();
				}
			});
		}
		
		// Sort table when header is clicked
		var headers = document.querySelectorAll('.sort-header');
		var currentSort = null;
		var currentSortDir = 'asc';
		
		for (var i = 0; i < headers.length; i++) {
			headers[i].addEventListener('click', function() {
				var column = this.getAttribute('data-column');
				
				// Toggle sort direction
				if (currentSort === column) {
					currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
				} else {
					currentSort = column;
					currentSortDir = 'asc';
				}
				
				// Remove sort classes from all headers
				for (var j = 0; j < headers.length; j++) {
					headers[j].classList.remove('sort-asc', 'sort-desc');
				}
				
				// Add sort class to clicked header
				this.classList.add(currentSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
				
				// Sort the table
				sortTable(column, currentSortDir);
			});
		}
		
		// Sort table
		function sortTable(column, direction) {
			var table = document.getElementById('data-table');
			var tbody = table.getElementsByTagName('tbody')[0];
			var rows = Array.from(tbody.getElementsByTagName('tr'));
			
			// Sort rows
			rows.sort(function(a, b) {
				var aValue = a.cells[getColumnIndex(column)].textContent;
				var bValue = b.cells[getColumnIndex(column)].textContent;
				
				// Try to convert to numbers if possible
				var aNum = Number(aValue);
				var bNum = Number(bValue);
				
				if (!isNaN(aNum) && !isNaN(bNum)) {
					return direction === 'asc' ? aNum - bNum : bNum - aNum;
				}
				
				// Otherwise sort as strings
				return direction === 'asc' ? 
					aValue.localeCompare(bValue) : 
					bValue.localeCompare(aValue);
			});
			
			// Re-add rows in sorted order
			for (var i = 0; i < rows.length; i++) {
				tbody.appendChild(rows[i]);
			}
		}
		
		// Get column index by name
		function getColumnIndex(columnName) {
			var headers = document.querySelectorAll('.sort-header');
			for (var i = 0; i < headers.length; i++) {
				if (headers[i].getAttribute('data-column') === columnName) {
					return i;
				}
			}
			return 0;
		}
	</script>
</body>
</html>`;
}