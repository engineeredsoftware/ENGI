# MCP Integration Examples

## Claude Desktop

### Setup
```
Add to ~/.config/claude/mcp-servers.json:
{
  "mcpServers": {
    "bitcode": {
      "command": "npx",
      "args": ["@bitcode/mcp-server"],
      "env": { "BITCODE_API_KEY": "your-api-key" }
    }
  }
}
```

### Example Usage
```
"Create a React component for file uploads with drag-and-drop functionality"
```

### Features
- Real-time streaming
- Rich responses
- Interactive tables

---

## VS Code

### Setup
```
Install the Bitcode MCP extension and configure with API key
```

### Example Usage
```
Right-click file → "Analyze with Bitcode MCP"
```

### Features
- IDE integration
- Code actions
- Inline suggestions

---

## GitHub Actions

### Setup
```
- uses: bitcode/mcp-action@v1
  with:
    tool: "bitcode://pipelines/asset-pack/execute"
    token: ${{ secrets.BITCODE_API_KEY }}
```

### Example Usage
```
Automated implementation and validation on every PR
```

### Features
- CI/CD integration
- Automated workflows
- Quality gates

---

## Custom API

### Setup
```
const client = new MCPClient({ apiKey: process.env.BITCODE_API_KEY });
```

### Example Usage
```
await client.callTool("bitcode://pipelines/asset-pack/execute", args);
```

### Features
- REST API
- WebSocket streaming
- Custom integrations

---
