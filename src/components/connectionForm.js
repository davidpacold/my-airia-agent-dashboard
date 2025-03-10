/**
 * Generates the HTML for the connection form
 * @returns {string} - HTML for the connection form
 */
export function generateConnectionForm(savedDashboards = []) {
    // Generate HTML for saved dashboards
    const savedDashboardsHtml = savedDashboards.length > 0 ? `
    <div id="saved-dashboards" class="saved-dashboards">
        <h2>Saved Dashboards</h2>
        <div id="dashboard-list" class="dashboard-list">
            ${savedDashboards.map(dashboard => {
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

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Dashboard - Connect</title>
    <link rel="stylesheet" href="/styles.css">
    <style>
        /* Inline styles for form */
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
        
        /* Saved Dashboards Styles */
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
    </style>
</head>
<body>
    <h1>Agent Dashboard</h1>
    
    <div class="form-container">
        <form id="connection-form" action="/fetch-data" method="POST">
            <div class="form-group">
                <label for="dashboardName">Dashboard Name</label>
                <input 
                    type="text" 
                    id="dashboardName" 
                    name="dashboardName" 
                    placeholder="My Dashboard" 
                    required
                >
                <div class="hint">Name your dashboard for easy identification</div>
            </div>
            
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
            
            <div class="form-group checkbox-group">
                <input type="checkbox" id="saveDashboard" name="saveDashboard" value="true" checked>
                <label for="saveDashboard">Save Dashboard</label>
                <div class="hint">Save this query as a named dashboard for future use</div>
            </div>
            
            <button type="submit" id="submit-btn">
                <span id="submit-text">Connect & Fetch Data</span>
                <span id="submit-spinner" style="display: none;">
                    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </span>
            </button>
        </form>
    </div>

    ${savedDashboardsHtml}

    <script>
        // Form validation and submission
        document.getElementById('connection-form').addEventListener('submit', function(e) {
            var dashboardName = document.getElementById('dashboardName').value;
            var apiUrl = document.getElementById('apiUrl').value;
            var apiKey = document.getElementById('apiKey').value;
            
            if (!dashboardName || !apiUrl || !apiKey) {
                e.preventDefault();
                alert('Please fill in all required fields');
                return;
            }
            
            // Show loading spinner
            document.getElementById('submit-text').style.display = 'none';
            document.getElementById('submit-spinner').style.display = 'inline';
            document.getElementById('submit-btn').disabled = true;
        });
        
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
    </script>
</body>
</html>`;
}