/**
 * Agent Dashboard - displays data in a sortable table
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your dashboard in action
 * - Run `npm run deploy` to publish your worker
 */

import { generateConnectionForm } from './components/connectionForm';
import { generateDashboard } from './components/dashboard';
import { processApiData, normalizeData, getSampleData } from './utils/dataProcessor';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;

		// Serve static assets using the Assets binding
		if (path.startsWith('/css/') || path.startsWith('/js/') || path === '/styles.css' || path === '/dashboard.js') {
			try {
				// Map root URLs to their actual paths in public directory
				let assetPath = path;
				if (path === '/styles.css') {
					assetPath = 'css/styles.css';
				} else if (path === '/dashboard.js') {
					assetPath = 'js/dashboard.js';
				} else {
					// Remove the leading slash for other asset paths
					assetPath = path.replace(/^\//, '');
				}
				
				// Since we're not using Workers Sites, we'll serve the CSS and JS inline
				if (assetPath === 'css/styles.css') {
					return new Response(`
						/* Main styles for Agent Dashboard */
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
						
						/* Form Styles */
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
						
						/* Dashboard Styles */
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
						
						/* Tab Navigation */
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
						
						/* Chart Controls */
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
					`, {
						headers: {
							'Content-Type': 'text/css',
						},
					});
				} else if (assetPath === 'js/dashboard.js') {
					return new Response(`
						// Dashboard functionality
						let tableData = [];
						let chartInstance = null;
						
						// Initialize dashboard when data is loaded
						function initDashboard(data) {
							tableData = data;
							setupTabs();
							setupTableSorting();
							if (tableData.length > 0) {
								updateChart();
							}
						}
						
						// Initialize and update chart
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
						
						// Generate colors for chart elements
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
						
						// Setup tab navigation
						function setupTabs() {
							const tabs = document.querySelectorAll('.tab');
							for (let i = 0; i < tabs.length; i++) {
								tabs[i].addEventListener('click', function() {
									// Remove active class from all tabs
									const allTabs = document.querySelectorAll('.tab');
									for (let j = 0; j < allTabs.length; j++) {
										allTabs[j].classList.remove('active');
									}
									
									const allTabContents = document.querySelectorAll('.tab-content');
									for (let j = 0; j < allTabContents.length; j++) {
										allTabContents[j].classList.remove('active');
									}
									
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
							}
						}
						
						// Setup table sorting
						function setupTableSorting() {
							const headers = document.querySelectorAll('.sort-header');
							let currentSort = null;
							let currentSortDir = 'asc';
							
							for (let i = 0; i < headers.length; i++) {
								headers[i].addEventListener('click', function() {
									const column = this.getAttribute('data-column');
									
									// Toggle sort direction
									if (currentSort === column) {
										currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
									} else {
										currentSort = column;
										currentSortDir = 'asc';
									}
									
									// Remove sort classes from all headers
									for (let j = 0; j < headers.length; j++) {
										headers[j].classList.remove('sort-asc', 'sort-desc');
									}
									
									// Add sort class to clicked header
									this.classList.add(currentSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
									
									// Sort the table
									sortTable(column, currentSortDir);
								});
							}
						}
						
						// Sort table
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
							for (let i = 0; i < rows.length; i++) {
								tbody.appendChild(rows[i]);
							}
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
						
						// Function to download the JSON data
						function downloadJson(data) {
							const dataStr = JSON.stringify(data, null, 2);
							const dataBlob = new Blob([dataStr], {type: 'application/json'});
							const url = URL.createObjectURL(dataBlob);
							const link = document.createElement('a');
							link.download = 'data.json';
							link.href = url;
							link.click();
						}
						
						// Function to refresh data with current form data
						function refreshData(formData) {
							try {
								// Show loading spinner
								document.getElementById('refresh-text').style.display = 'none';
								document.getElementById('refresh-spinner').style.display = 'inline';
								
								// Create a form element
								const form = document.createElement('form');
								form.method = 'POST';
								form.action = '/fetch-data';
								form.style.display = 'none';
								
								// Add all the form fields
								function addField(name, value) {
									const input = document.createElement('input');
									input.type = 'hidden';
									input.name = name;
									input.value = value;
									form.appendChild(input);
								}
								
								// Add required fields
								addField('apiUrl', decodeURIComponent(formData.apiUrl));
								addField('apiKey', decodeURIComponent(formData.apiKey));
								
								// Add optional fields
								if (formData.userInput) {
									addField('userInput', decodeURIComponent(formData.userInput));
								}
								
								if (formData.asyncOutput) {
									addField('asyncOutput', 'true');
								}
								
								if (formData.demoMode) {
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
					`, {
						headers: {
							'Content-Type': 'application/javascript',
						},
					});
				} else {
					return new Response('Asset not found', { status: 404 });
				}
			} catch (error) {
				console.error('Error serving static asset:', error);
				return new Response('Asset not found', { status: 404 });
			}
		}
		
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
					data = getSampleData();
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
				
				// Process data for the dashboard
				const tableData = processApiData(data);
				const processedData = normalizeData(tableData);
				
				// Return HTML with the dashboard
				return new Response(generateDashboard(data, formData, processedData), {
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