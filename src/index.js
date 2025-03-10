/**
 * Agent Dashboard - displays data in a sortable table
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your dashboard in action
 * - Run `npm run deploy` to publish your worker
 */

import { generateConnectionForm } from './components/connectionForm';
import { generateDashboard } from './components/dashboard';
import { processApiData, normalizeData, getSampleData, getAnotherSampleData, dataStore } from './utils/dataProcessor';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';

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
						
						/* Saved Dashboards list */
						.saved-dashboards {
							margin-top: 2rem;
							background-color: #f9fafb;
							border-radius: 8px;
							padding: 1rem;
						}
						
						.saved-dashboards h2 {
							margin-top: 0;
							font-size: 1.25rem;
						}
						
						.dashboard-list {
							list-style: none;
							padding: 0;
						}
						
						.dashboard-item {
							display: flex;
							justify-content: space-between;
							align-items: center;
							padding: 0.75rem;
							border-bottom: 1px solid #e5e7eb;
						}
						
						.dashboard-item:last-child {
							border-bottom: none;
						}
						
						.dashboard-info {
							flex-grow: 1;
						}
						
						.dashboard-name {
							font-weight: 500;
						}
						
						.dashboard-date {
							font-size: 0.875rem;
							color: #6b7280;
						}
						
						.dashboard-actions {
							display: flex;
							gap: 0.5rem;
						}
						
						.dashboard-actions button {
							padding: 0.5rem 0.75rem;
							font-size: 0.875rem;
						}
					`, {
						headers: {
							'Content-Type': 'text/css',
						},
					});
				} else if (assetPath === 'js/dashboard.js') {
					return new Response(`
						// Dashboard functionality will be loaded in the dashboard pages
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
		
		// API endpoint to get all dashboards
		if (path === "/dashboards" && request.method === "GET") {
			return new Response(JSON.stringify(dataStore.getAllDashboards().map(d => ({
				id: d.id,
				name: d.name,
				timestamp: d.timestamp
			}))), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
		
		// Delete a dashboard
		if (path.startsWith("/dashboard/") && request.method === "DELETE") {
			const dashboardId = path.split("/").pop();
			dataStore.deleteDashboard(dashboardId);
			return new Response(JSON.stringify({ success: true }), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
		
		// Handle viewing a specific dashboard
		if (path.startsWith("/dashboard/") && request.method === "GET") {
			const dashboardId = path.split("/").pop();
			const dashboard = dataStore.getDashboard(dashboardId);
			
			if (!dashboard) {
				return new Response("Dashboard not found", { status: 404 });
			}
			
			// Set this as the active dashboard
			dataStore.setActiveDashboard(dashboardId);
			
			// Generate the dashboard HTML
			return new Response(generateDashboard(
				dashboard.data, 
				dashboard.formData, 
				dashboard.processedData,
				dashboardId,
				dataStore.getAllDashboards()
			), {
				headers: {
					"Content-Type": "text/html;charset=UTF-8",
				},
			});
		}
		
		// Handle refreshing a specific dashboard
		if (path.startsWith("/refresh-dashboard/") && request.method === "POST") {
			const dashboardId = path.split("/").pop();
			const dashboard = dataStore.getDashboard(dashboardId);
			
			if (!dashboard) {
				return new Response("Dashboard not found", { status: 404 });
			}
			
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
					// DEMO MODE: Alternate between sample data sets to make refreshes noticeable
					console.log(`Demo mode: Using sample data instead of API call`);
					// Use the other sample data format if this is a refresh
					if (dashboard.data.pipelineId === "123e4567-e89b-12d3-a456-426614174000") {
						data = getAnotherSampleData();
					} else {
						data = getSampleData();
					}
				} else {
					// LIVE MODE: Make actual API request with 3-minute timeout
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes in milliseconds
					
					try {
						const response = await fetch(apiUrl, {
							method: "POST",
							headers: {
								"X-API-KEY": apiKey,
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								userInput: userInput || "Example user input",
								asyncOutput: asyncOutput
							}),
							signal: controller.signal
						});

						clearTimeout(timeoutId); // Clear the timeout if the request completes

						if (!response.ok) {
							throw new Error(`API request failed with status ${response.status}`);
						}
						
						data = await response.json();
					} catch (error) {
						if (error.name === 'AbortError') {
							throw new Error('API request timed out after 3 minutes');
						}
						throw error;
					}
				}
				
				// Process data for the dashboard
				const processedData = processApiData(data);
				const normalizedData = normalizeData(processedData);
				
				// Update the dashboard with new data
				dataStore.saveDashboard(
					dashboardId,
					dashboard.name,
					data,
					normalizedData,
					formData
				);
				
				// Return HTML with the updated dashboard
				return new Response(generateDashboard(
					data, 
					formData, 
					normalizedData,
					dashboardId,
					dataStore.getAllDashboards()
				), {
					headers: {
						"Content-Type": "text/html;charset=UTF-8",
					},
				});
			} catch (error) {
				return new Response(`Error refreshing data: ${error.message}`, {
					status: 500,
					headers: {
						"Content-Type": "text/plain",
					},
				});
			}
		}
		
		// Create a loading dashboard page
		if (path === "/loading-dashboard") {
			try {
				// Get query parameters
				const params = Object.fromEntries(url.searchParams);
				const { dashboardName, apiUrl, apiKey, userInput, asyncOutput, saveDashboard, demoMode } = params;
				
				// Validate required fields
				if (!dashboardName || !apiUrl || !apiKey) {
					return new Response("Missing required fields", {
						status: 400,
						headers: { "Content-Type": "text/plain" },
					});
				}
				
				// Generate a unique ID for the dashboard
				const dashboardId = uuidv4();
				
				// Store the request parameters for later processing
				dataStore.saveLoadingDashboard(dashboardId, {
					dashboardName,
					apiUrl,
					apiKey,
					userInput,
					asyncOutput: asyncOutput === "true",
					saveDashboard: saveDashboard === "true",
					demoMode: demoMode === "on"
				});
				
				// Get all existing dashboards to show on the loading page
				const existingDashboards = dataStore.getAllDashboards();
                const existingDashboardsHtml = existingDashboards.length > 0 ? `
                <div id="saved-dashboards" class="saved-dashboards">
                    <h2>Your Dashboards</h2>
                    <div class="dashboard-list">
                        ${existingDashboards.map(dashboard => {
                            const dashboardDate = new Date(dashboard.timestamp);
                            const formattedDate = dashboardDate.toLocaleString();
                            
                            return `<div class="dashboard-item">
                                <div class="dashboard-info">
                                    <div class="dashboard-name">${dashboard.name}</div>
                                    <div class="dashboard-date">Created: ${formattedDate}</div>
                                </div>
                                <div class="dashboard-actions">
                                    <button onclick="window.location.href='/dashboard/${dashboard.id}'">View</button>
                                    <button onclick="deleteDashboard('${dashboard.id}')">Delete</button>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>` : '';
                
				// Return a loading page that will poll for results and show existing dashboards
				return new Response(`<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Loading Dashboard - Agent Dashboard</title>
					<link rel="stylesheet" href="/styles.css">
					<style>
						.page-container {
							max-width: 1200px;
							margin: 0 auto;
							padding: 2rem;
						}
						.loading-container {
							display: flex;
							flex-direction: column;
							align-items: center;
							text-align: center;
							padding: 2rem;
							margin-bottom: 2rem;
							background-color: #f9fafb;
							border-radius: 8px;
							box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
						}
						.spinner-large {
							width: 4rem;
							height: 4rem;
							border-radius: 50%;
							border: 0.5rem solid #f3f3f3;
							border-top: 0.5rem solid #2563eb;
							animation: spin 1s linear infinite;
							margin-bottom: 2rem;
						}
						.loading-message {
							font-size: 1.25rem;
							margin-bottom: 1rem;
							color: #333;
						}
						.loading-progress {
							color: #6b7280;
							font-style: italic;
							margin-bottom: 2rem;
						}
						.loading-status {
							width: 100%;
							max-width: 600px;
							background-color: white;
							padding: 1rem;
							border-radius: 0.5rem;
							margin-top: 1rem;
							text-align: left;
							border: 1px solid #e5e7eb;
						}
						.actions {
							margin-top: 1.5rem;
							display: flex;
							gap: 1rem;
							justify-content: center;
						}
						.actions button {
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
                        .secondary-btn {
                            background-color: #6b7280 !important;
                        }
                        .actions button:hover {
                            background-color: #1d4ed8;
                        }
                        .section-divider {
                            margin: 2rem 0;
                            border-top: 1px solid #e5e7eb;
                        }
						@keyframes spin {
							from { transform: rotate(0deg); }
							to { transform: rotate(360deg); }
						}
                        
                        /* Saved Dashboards Styles */
                        .saved-dashboards {
                            margin-top: 2rem;
                            background-color: #f9fafb;
                            border-radius: 8px;
                            padding: 1rem;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                        }
                        .saved-dashboards h2 {
                            margin-top: 0;
                            font-size: 1.25rem;
                            margin-bottom: 1rem;
                        }
                        .dashboard-list {
                            list-style: none;
                            padding: 0;
                        }
                        .dashboard-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 0.75rem;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .dashboard-item:last-child {
                            border-bottom: none;
                        }
                        .dashboard-info {
                            flex-grow: 1;
                        }
                        .dashboard-name {
                            font-weight: 500;
                        }
                        .dashboard-date {
                            font-size: 0.875rem;
                            color: #6b7280;
                        }
                        .dashboard-actions {
                            display: flex;
                            gap: 0.5rem;
                        }
                        .dashboard-actions button {
                            padding: 0.5rem 0.75rem;
                            font-size: 0.875rem;
                        }
					</style>
				</head>
				<body>
					<div class="page-container">
						<h1>Agent Dashboard</h1>
						
						<div class="loading-container">
							<div class="spinner-large"></div>
							<div class="loading-message">Loading "${dashboardName}" dashboard...</div>
							<div class="loading-progress">This may take up to 3 minutes. You can use your existing dashboards or create a new one while waiting.</div>
							<div id="loading-status" class="loading-status">
								<p>✓ Dashboard request started</p>
								<p id="api-status">⏳ Waiting for API response...</p>
								<p id="processing-status" style="display:none;">⏳ Processing data...</p>
								<p id="completion-status" style="display:none;">✓ Complete! Redirecting...</p>
							</div>
							<div class="actions">
								<button onclick="window.location.href='/'">Create Another Dashboard</button>
								<button class="secondary-btn" onclick="cancelLoading()">Cancel</button>
							</div>
						</div>
						
						${existingDashboardsHtml}
					</div>
					
					<script>
						const dashboardId = "${dashboardId}";
						let checkInterval;
						let timeoutTimer;
						
						// Start polling for dashboard data
						function startPolling() {
							checkInterval = setInterval(checkDashboardStatus, 2000);
							// Set a timeout of 3 minutes
							timeoutTimer = setTimeout(() => {
								clearInterval(checkInterval);
								document.getElementById('api-status').textContent = "⚠️ API request is taking longer than expected. You can continue waiting or try again.";
							}, 180000);
						}
						
						// Check if dashboard data is ready
						function checkDashboardStatus() {
							fetch('/dashboard-status/' + dashboardId)
								.then(response => response.json())
								.then(data => {
									if (data.status === 'complete') {
										clearInterval(checkInterval);
										clearTimeout(timeoutTimer);
										document.getElementById('api-status').textContent = "✓ API response received";
										document.getElementById('processing-status').style.display = 'block';
										document.getElementById('processing-status').textContent = "✓ Data processed successfully";
										document.getElementById('completion-status').style.display = 'block';
										
										// Redirect to the dashboard
										setTimeout(() => {
											window.location.href = '/dashboard/' + dashboardId;
										}, 1000);
									} else if (data.status === 'error') {
										clearInterval(checkInterval);
										clearTimeout(timeoutTimer);
										document.getElementById('api-status').textContent = "❌ Error: " + data.error;
									}
									// If status is 'loading', continue polling
								})
								.catch(error => {
									console.error('Error checking dashboard status:', error);
								});
						}
						
						// Cancel loading and return to home page
						function cancelLoading() {
							if (confirm('Are you sure you want to cancel loading this dashboard?')) {
								fetch('/cancel-loading/' + dashboardId, { method: 'POST' })
									.then(() => {
										window.location.href = '/';
									})
									.catch(error => {
										console.error('Error canceling dashboard:', error);
										// Redirect anyway
										window.location.href = '/';
									});
							}
						}
						
						// Function to delete a dashboard
						function deleteDashboard(id) {
							if (confirm('Are you sure you want to delete this dashboard?')) {
								fetch('/dashboard/' + id, {
									method: 'DELETE'
								})
								.then(response => {
									if (response.ok) {
										// Remove the dashboard from the UI
										const dashboardItems = document.querySelectorAll('.dashboard-item');
										for (const item of dashboardItems) {
											if (item.querySelector('button').getAttribute('onclick').includes(id)) {
												item.remove();
												break;
											}
										}
										
										// If no more dashboards, hide the container
										if (document.querySelectorAll('.dashboard-item').length === 0) {
											document.getElementById('saved-dashboards').style.display = 'none';
										}
									} else {
										alert('Failed to delete dashboard');
									}
								})
								.catch(error => console.error('Error deleting dashboard:', error));
							}
						}
						
						// Start polling when page loads
						window.addEventListener('load', startPolling);
					</script>
				</body>
				</html>`, {
					headers: {
						"Content-Type": "text/html;charset=UTF-8",
					},
				});
			} catch (error) {
				return new Response(`Error creating loading dashboard: ${error.message}`, {
					status: 500,
					headers: { "Content-Type": "text/plain" },
				});
			}
		}
		
		// Cancel a loading dashboard
		if (path.startsWith("/cancel-loading/") && request.method === "POST") {
			const dashboardId = path.split("/").pop();
			
			// Remove the dashboard from loading state
			dataStore.completeLoadingDashboard(dashboardId);
			dataStore.setDashboardProcessing(dashboardId, false);
			
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		}
		
		// API endpoint to check dashboard status
		if (path.startsWith("/dashboard-status/") && request.method === "GET") {
			const dashboardId = path.split("/").pop();
			const loadingInfo = dataStore.getLoadingDashboard(dashboardId);
			
			// Check if dashboard processing is already complete
			const dashboard = dataStore.getDashboard(dashboardId);
			if (dashboard) {
				return new Response(JSON.stringify({ status: 'complete' }), {
					headers: { "Content-Type": "application/json" },
				});
			}
			
			// Check for errors
			const error = dataStore.getDashboardError(dashboardId);
			if (error) {
				return new Response(JSON.stringify({ 
					status: 'error', 
					error: error.error 
				}), {
					headers: { "Content-Type": "application/json" },
				});
			}
			
			// If no loading info, dashboard not found
			if (!loadingInfo) {
				return new Response(JSON.stringify({ 
					status: 'error', 
					error: 'Dashboard not found' 
				}), {
					headers: { "Content-Type": "application/json" },
				});
			}
			
			// Process the dashboard in the background if not already processing
			if (!dataStore.isDashboardProcessing(dashboardId)) {
				dataStore.setDashboardProcessing(dashboardId, true);
				ctx.waitUntil(this.processDashboardAsync(dashboardId, loadingInfo));
			}
			
			// Return loading status
			return new Response(JSON.stringify({ status: 'loading' }), {
				headers: { "Content-Type": "application/json" },
			});
		}
		
		// Check if the request is a form submission to fetch data and create a new dashboard
		if (request.method === "POST" && path === "/fetch-data") {
			try {
				// Parse form data
				const formData = await request.formData();
				const dashboardName = formData.get("dashboardName");
				const apiUrl = formData.get("apiUrl");
				const apiKey = formData.get("apiKey");
				const userInput = formData.get("userInput");
				const asyncOutput = formData.get("asyncOutput") === "true";
				const saveDashboard = formData.get("saveDashboard") === "true";
				const demoMode = formData.get("demoMode") === "on";
				
				// Validate required fields
				if (!dashboardName || !apiUrl || !apiKey) {
					return new Response("Missing required fields", {
						status: 400,
						headers: { "Content-Type": "text/plain" },
					});
				}
				
				// Redirect to loading page
				const params = new URLSearchParams({
					dashboardName,
					apiUrl,
					apiKey,
					userInput: userInput || "",
					asyncOutput: asyncOutput.toString(),
					saveDashboard: saveDashboard.toString(),
					demoMode: demoMode ? "on" : "off"
				});
				
				return new Response(null, {
					status: 302,
					headers: {
						"Location": `/loading-dashboard?${params.toString()}`
					}
				});
			} catch (error) {
				return new Response(`Error processing form: ${error.message}`, {
					status: 500,
					headers: {
						"Content-Type": "text/plain",
					},
				});
			}
		} else {
			// Show the connection form for GET requests or other paths
			return new Response(generateConnectionForm(dataStore.getAllDashboards()), {
				headers: {
					"Content-Type": "text/html;charset=UTF-8",
				},
			});
		}
	},
	
	// Async function to process dashboard data
	async processDashboardAsync(dashboardId, loadingInfo) {
		try {
			const { dashboardName, apiUrl, apiKey, userInput, asyncOutput, saveDashboard, demoMode } = loadingInfo;
			
			let data;
			
			if (demoMode) {
				// DEMO MODE: Use sample data
				console.log(`Demo mode: Using sample data instead of API call`);
				data = getSampleData();
			} else {
				// LIVE MODE: Make actual API request with 3-minute timeout
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes in milliseconds
				
				try {
					const response = await fetch(apiUrl, {
						method: "POST",
						headers: {
							"X-API-KEY": apiKey,
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							userInput: userInput || "Example user input",
							asyncOutput: asyncOutput
						}),
						signal: controller.signal
					});

					clearTimeout(timeoutId); // Clear the timeout if the request completes

					if (!response.ok) {
						throw new Error(`API request failed with status ${response.status}`);
					}
					
					data = await response.json();
				} catch (error) {
					if (error.name === 'AbortError') {
						throw new Error('API request timed out after 3 minutes');
					}
					throw error;
				}
			}
			
			// Process data for the dashboard
			const processedData = processApiData(data);
			const normalizedData = normalizeData(processedData);
			
			// Prepare form data for saving
			const formData = new FormData();
			formData.append("dashboardName", dashboardName);
			formData.append("apiUrl", apiUrl);
			formData.append("apiKey", apiKey);
			if (userInput) formData.append("userInput", userInput);
			if (asyncOutput) formData.append("asyncOutput", "true");
			if (demoMode) formData.append("demoMode", "on");
			
			// Save the dashboard if requested
			if (saveDashboard) {
				dataStore.saveDashboard(
					dashboardId,
					dashboardName,
					data,
					normalizedData,
					formData
				);
			}
			
			// Mark dashboard as complete and remove from loading state
			dataStore.completeLoadingDashboard(dashboardId);
			
			return { success: true, dashboardId };
		} catch (error) {
			// Store error information
			dataStore.setDashboardError(dashboardId, error.message);
			console.error(`Error processing dashboard ${dashboardId}:`, error);
			return { success: false, error: error.message };
		}
	}
};