/**
 * Data processor utility functions
 */

// Data store for multiple dashboards
export const dataStore = {
    dashboards: {},
    activeDashboard: null,
    loadingDashboards: {}, // Store for dashboards that are loading
    processingDashboards: {}, // Track which dashboards are currently being processed
    dashboardErrors: {}, // Store for dashboard loading errors
    
    // Add or update a dashboard
    saveDashboard(id, name, data, processedData, formData) {
        this.dashboards[id] = {
            id,
            name,
            data,
            processedData,
            formData,
            timestamp: new Date().toISOString()
        };
        
        if (!this.activeDashboard) {
            this.activeDashboard = id;
        }
        
        return id;
    },
    
    // Get a specific dashboard
    getDashboard(id) {
        return this.dashboards[id];
    },
    
    // Delete a dashboard
    deleteDashboard(id) {
        if (this.dashboards[id]) {
            delete this.dashboards[id];
            
            // If the active dashboard was deleted, set active to another one if available
            if (this.activeDashboard === id) {
                const dashboardIds = Object.keys(this.dashboards);
                this.activeDashboard = dashboardIds.length > 0 ? dashboardIds[0] : null;
            }
        }
        
        // Also delete any loading information
        if (this.loadingDashboards[id]) {
            delete this.loadingDashboards[id];
        }
        if (this.processingDashboards[id]) {
            delete this.processingDashboards[id];
        }
        if (this.dashboardErrors[id]) {
            delete this.dashboardErrors[id];
        }
    },
    
    // Get all dashboards
    getAllDashboards() {
        return Object.values(this.dashboards);
    },
    
    // Set active dashboard
    setActiveDashboard(id) {
        if (this.dashboards[id]) {
            this.activeDashboard = id;
            return true;
        }
        return false;
    },
    
    // Get active dashboard
    getActiveDashboard() {
        return this.activeDashboard ? this.dashboards[this.activeDashboard] : null;
    },
    
    // Save information about a dashboard that is loading
    saveLoadingDashboard(id, info) {
        this.loadingDashboards[id] = {
            ...info,
            startTime: new Date().toISOString()
        };
        return id;
    },
    
    // Get information about a loading dashboard
    getLoadingDashboard(id) {
        return this.loadingDashboards[id];
    },
    
    // Mark a dashboard as complete and remove it from loading state
    completeLoadingDashboard(id) {
        if (this.loadingDashboards[id]) {
            delete this.loadingDashboards[id];
        }
        if (this.processingDashboards[id]) {
            delete this.processingDashboards[id];
        }
    },
    
    // Check if a dashboard is currently being processed
    isDashboardProcessing(id) {
        return !!this.processingDashboards[id];
    },
    
    // Set dashboard processing state
    setDashboardProcessing(id, isProcessing) {
        if (isProcessing) {
            this.processingDashboards[id] = true;
        } else if (this.processingDashboards[id]) {
            delete this.processingDashboards[id];
        }
    },
    
    // Store error information for a dashboard
    setDashboardError(id, errorMessage) {
        this.dashboardErrors[id] = {
            error: errorMessage,
            timestamp: new Date().toISOString()
        };
        
        // Remove from processing state
        if (this.processingDashboards[id]) {
            delete this.processingDashboards[id];
        }
    },
    
    // Get error information for a dashboard
    getDashboardError(id) {
        return this.dashboardErrors[id];
    }
};

/**
 * Processes API data into a format suitable for the dashboard
 * @param {Object|Array} data - The raw data from the API
 * @returns {Object} - Processed data object with tableData and markdown info
 */
export function processApiData(data) {
    // Parse and extract JSON from markdown if needed
    let tableData = [];
    let isMarkdownReport = false;
    let markdownContent = null;
    
    if (data && typeof data.result === 'string') {
        // Check if this looks like a markdown report (has ###, bullet points, etc.)
        if (data.result.includes('###') && 
            (data.result.includes('- **') || data.result.includes('* **'))) {
            isMarkdownReport = true;
            markdownContent = data.result;
        }
            
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
            // Check for common array fields like "projects", "opportunities", "items", etc.
            else if (parsedResult && typeof parsedResult === 'object') {
                // Look for the first array property in the object
                const arrayProps = ['projects', 'opportunities', 'items', 'data', 'results', 'records'];
                
                // First check specifically named array properties
                for (const prop of arrayProps) {
                    if (Array.isArray(parsedResult[prop])) {
                        tableData = parsedResult[prop];
                        break;
                    }
                }
                
                // If no named arrays found, look for any array property
                if (tableData.length === 0) {
                    for (const key in parsedResult) {
                        if (Array.isArray(parsedResult[key])) {
                            tableData = parsedResult[key];
                            break;
                        }
                    }
                }
                
                // If still no arrays found but object has properties, create an array with just this object
                if (tableData.length === 0) {
                    tableData = [parsedResult];
                }
            }
        } catch (e) {
            console.log("Could not parse result as JSON:", e);
            // If we couldn't parse JSON but it's a markdown report, that's okay
            if (!isMarkdownReport) {
                // If it wasn't detected as markdown but has newlines and typical report text,
                // try to classify it as markdown anyway
                const textContent = data.result;
                if (textContent.includes('\n\n') && 
                   (textContent.includes('summary') || textContent.includes('report') || 
                    textContent.includes('analysis'))) {
                    isMarkdownReport = true;
                    markdownContent = textContent;
                }
            }
        }
    }
    // If data is already an array, use it directly
    else if (Array.isArray(data)) {
        tableData = data;
    }
    // If data is an object with arrays inside, extract the first array found
    else if (typeof data === 'object' && data !== null) {
        // Check for common array fields first
        const arrayProps = ['projects', 'opportunities', 'items', 'data', 'results', 'records'];
        
        // First check specifically named array properties
        for (const prop of arrayProps) {
            if (Array.isArray(data[prop])) {
                tableData = data[prop];
                break;
            }
        }
        
        // If no named arrays found, look for any array property
        if (tableData.length === 0) {
            for (const key in data) {
                if (Array.isArray(data[key])) {
                    tableData = data[key];
                    break;
                }
            }
        }
        
        // If no arrays found but object has properties, create an array with just this object
        if (tableData.length === 0 && Object.keys(data).length > 0) {
            tableData = [data];
        }
    }
    
    return {
        tableData,
        isMarkdownReport,
        markdownContent
    };
}

/**
 * Processes data for display - handles JIRA-like nested structure
 * @param {Object|Array} dataObj - The processed data object from processApiData
 * @returns {Object} - Object with normalized data and markdown information
 */
export function normalizeData(dataObj) {
    let processedData = [];
    const tableData = Array.isArray(dataObj) ? dataObj : (dataObj.tableData || []);
    
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
    
    // Pass through the markdown information if it exists
    return {
        data: processedData,
        isMarkdownReport: dataObj.isMarkdownReport || false,
        markdownContent: dataObj.markdownContent || null
    };
}

/**
 * Generate sample data for demo mode
 * @returns {Object} - Sample data object
 */
export function getSampleData() {
    return {
        "pipelineId": "123e4567-e89b-12d3-a456-426614174000",
        "status": "completed",
        "created": "2025-01-01T10:00:00Z",
        "completed": "2025-01-01T10:01:30Z",
        "result": "```json\n[\n    {\n        \"id\": \"10001\",\n        \"key\": \"DEMO-1\",\n        \"fields\": {\n            \"summary\": \"Update documentation for API v2\",\n            \"assignee\": {\n                \"displayName\": \"John Smith\",\n                \"emailAddress\": \"john.smith@example.com\"\n            },\n            \"status\": {\n                \"name\": \"In Progress\"\n            }\n        }\n    },\n    {\n        \"id\": \"10002\",\n        \"key\": \"DEMO-2\",\n        \"fields\": {\n            \"summary\": \"Prepare quarterly presentation\",\n            \"assignee\": {\n                \"displayName\": \"Jane Doe\",\n                \"emailAddress\": \"jane.doe@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Backlog\"\n            }\n        }\n    },\n    {\n        \"id\": \"10003\",\n        \"key\": \"DEMO-3\",\n        \"fields\": {\n            \"summary\": \"Build landing page prototype\",\n            \"assignee\": {\n                \"displayName\": \"Alex Johnson\",\n                \"emailAddress\": \"alex.johnson@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Done\"\n            }\n        }\n    },\n    {\n        \"id\": \"10004\",\n        \"key\": \"DEMO-4\",\n        \"fields\": {\n            \"summary\": \"Review vendor contracts\",\n            \"assignee\": {\n                \"displayName\": \"Sam Taylor\",\n                \"emailAddress\": \"sam.taylor@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Done\"\n            }\n        }\n    },\n    {\n        \"id\": \"10005\",\n        \"key\": \"DEMO-5\",\n        \"fields\": {\n            \"summary\": \"Competitor analysis report\",\n            \"assignee\": {\n                \"displayName\": \"Morgan Lee\",\n                \"emailAddress\": \"morgan.lee@example.com\"\n            },\n            \"status\": {\n                \"name\": \"Backlog\"\n            }\n        }\n    }\n]\n```",
        "report": null,
        "isBackupPipeline": false
    };
}

/**
 * Generate alternative sample data for demo mode
 * @returns {Object} - Alternative sample data object for demo mode
 */
export function getAnotherSampleData() {
    return {
        "pipelineId": "223e4567-e89b-12d3-a456-426614174001",
        "status": "completed",
        "created": "2025-01-02T12:00:00Z",
        "completed": "2025-01-02T12:01:45Z",
        "result": "```json\n[\n    {\n        \"id\": \"1001\",\n        \"name\": \"Project Alpha\",\n        \"budget\": 25000,\n        \"status\": \"Active\",\n        \"manager\": \"Alice Brown\",\n        \"deadline\": \"2025-06-15\"\n    },\n    {\n        \"id\": \"1002\",\n        \"name\": \"Project Beta\",\n        \"budget\": 42000,\n        \"status\": \"Planning\",\n        \"manager\": \"Bob Wilson\",\n        \"deadline\": \"2025-07-30\"\n    },\n    {\n        \"id\": \"1003\",\n        \"name\": \"Project Gamma\",\n        \"budget\": 18500,\n        \"status\": \"Completed\",\n        \"manager\": \"Carol Davis\",\n        \"deadline\": \"2025-04-10\"\n    },\n    {\n        \"id\": \"1004\",\n        \"name\": \"Project Delta\",\n        \"budget\": 33000,\n        \"status\": \"Active\",\n        \"manager\": \"Dave Smith\",\n        \"deadline\": \"2025-05-22\"\n    },\n    {\n        \"id\": \"1005\",\n        \"name\": \"Project Epsilon\",\n        \"budget\": 15000,\n        \"status\": \"Planning\",\n        \"manager\": \"Eve Johnson\",\n        \"deadline\": \"2025-08-05\"\n    }\n]\n```",
        "report": null,
        "isBackupPipeline": false
    };
}