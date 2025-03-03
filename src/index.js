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
					assetPath = '/css/styles.css';
				} else if (path === '/dashboard.js') {
					assetPath = '/js/dashboard.js';
				}
				
				// Use the ASSETS binding to serve static files from public directory
				return env.ASSETS.fetch(new Request(url));
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