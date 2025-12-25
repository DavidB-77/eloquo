# @eloquo/mcp

Eloquo MCP Server - Prompt optimization directly in your IDE.

## Installation

```bash
npm install -g @eloquo/mcp
```

Or run directly with npx:

```bash
npx @eloquo/mcp
```

## Setup

### 1. Get Your API Key

Get your API key from: https://eloquo.io/dashboard/settings?tab=api-keys

### 2. Configure Your IDE

**For Cursor:** Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "eloquo": {
      "command": "npx",
      "args": ["-y", "@eloquo/mcp"],
      "env": {
        "ELOQUO_API_KEY": "elk_pro_your_key_here"
      }
    }
  }
}
```

**For Claude Desktop:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "eloquo": {
      "command": "npx",
      "args": ["-y", "@eloquo/mcp"],
      "env": {
        "ELOQUO_API_KEY": "elk_pro_your_key_here"
      }
    }
  }
}
```

### 3. Restart Your IDE

After saving the config, restart your IDE to load the MCP server.

## Usage

Once configured, use Eloquo in your AI chat:

```
"Use eloquo to optimize this prompt: [your prompt]"
"Check my eloquo usage"
"Analyze this prompt with eloquo: [your prompt]"
"Orchestrate this with eloquo: [complex request]"
```

## Available Tools

| Tool | Description | Credits |
|------|-------------|---------|
| `eloquo_optimize` | Optimize a single prompt | 1 |
| `eloquo_orchestrate` | Break into multiple prompts | 1 + premium |
| `eloquo_analyze` | Analyze without optimizing | FREE |
| `eloquo_usage` | Check your status | FREE |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ELOQUO_API_KEY` | Your API key (required) | - |
| `ELOQUO_API_URL` | API base URL | https://eloquo.io |

## Requirements

- Node.js 18+
- Eloquo Pro, Team, or Enterprise subscription
- MCP-compatible IDE (Cursor, Claude Desktop)

## Support

- Website: https://eloquo.io
- Documentation: https://eloquo.io/docs
- Email: support@eloquo.io
