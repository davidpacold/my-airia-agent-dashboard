# Agent Dashboard for API Data

A Cloudflare Worker that creates a dashboard to visualize data from any API. It provides table and chart visualizations for JSON data, with sorting, filtering, and export capabilities.

## Features

- Connects to any API endpoint using authentication
- Visualizes data in sortable tables
- Transforms data into interactive charts
- Provides raw JSON view for debugging
- Demo mode with sample data for testing
- Responsive design for all devices

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Configuration

Edit the `wrangler.jsonc` file to configure your worker settings:

- Name and routes
- Environment variables for API keys (recommended)
- Custom domains if needed

## Usage

1. Visit the deployed worker URL
2. Enter your API endpoint and authentication key
3. Choose display options and submit
4. View, sort, chart and export your data

## License

MIT