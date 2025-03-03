/**
 * Data processor utility functions
 */

/**
 * Processes API data into a format suitable for the dashboard
 * @param {Object|Array} data - The raw data from the API
 * @returns {Array} - Processed data array ready for display
 */
export function processApiData(data) {
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
    
    return tableData;
}

/**
 * Processes data for display - handles JIRA-like nested structure
 * @param {Array} tableData - The raw data array
 * @returns {Array} - Data normalized and ready for display
 */
export function normalizeData(tableData) {
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
    
    return processedData;
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