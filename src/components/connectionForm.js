/**
 * Generates the HTML for the connection form
 * @returns {string} - HTML for the connection form
 */
export function generateConnectionForm() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Dashboard - Connect</title>
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
                    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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