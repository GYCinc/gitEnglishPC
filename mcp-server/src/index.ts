import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAppTool, registerAppResource } from '@modelcontextprotocol/ext-apps/server';
import { createUIResource } from '@mcp-ui/server';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Basic in-memory stores for telemetry (in a real app, this might be saved to files or DB)
let gamificationState = { xp: 0, level: 1, streak: 0, lastActiveDate: null };
let recentActivities: any[] = [];
let coreMemory: any[] = [];

const CORE_MEMORY_FILE = path.join(process.cwd(), 'CORE_MEMORY.json');
if (fs.existsSync(CORE_MEMORY_FILE)) {
  try {
    coreMemory = JSON.parse(fs.readFileSync(CORE_MEMORY_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to parse CORE_MEMORY.json', e);
  }
}

// --- EXPRESS SERVER FOR INGESTION ---
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/telemetry', (req, res) => {
  const payload = req.body;
  // payload is expected to be an Activity session payload
  if (payload.activities && Array.isArray(payload.activities)) {
    recentActivities = [...payload.activities, ...recentActivities].slice(0, 50); // keep last 50
  }
  res.json({ status: 'ok' });
});

app.post('/api/gamification', (req, res) => {
  if (req.body) {
    gamificationState = { ...gamificationState, ...req.body };
  }
  res.json({ status: 'ok' });
});

app.post('/api/memory', (req, res) => {
  if (req.body) {
    coreMemory.push(req.body);
    fs.writeFileSync(CORE_MEMORY_FILE, JSON.stringify(coreMemory, null, 2));
  }
  res.json({ status: 'ok' });
});

app.get('/api/state', (req, res) => {
  res.json({ gamification: gamificationState, activities: recentActivities, coreMemory });
});

// Start Express server in the background (so MCP standard I/O works smoothly)
const PORT = 3040;
app.listen(PORT, () => {
  console.error(`Telemetry Ingestion Server running on port ${PORT}`);
});

// --- MCP SERVER WITH UI ---
const mcp = new McpServer({
  name: 'gitenglishpc-stats',
  version: '1.0.0',
});

// Register Core Memory Ingest Tool
mcp.tool('memory_ingest', 'Ingest an architectural decision, rule, or preference into the CORE_MEMORY graph.', {
  content: z.string().describe('A concise, standalone statement of the decision/fact.'),
  tags: z.array(z.string()).describe('Array of tags like #decision, #architecture, scope:project'),
  valid_from: z.string().describe('ISO 8601 timestamp'),
  confidence: z.number().describe('Confidence level (e.g. 1.0)'),
  provenance: z.string().describe('Source of truth, e.g., User instruction')
}, async (args) => {
  coreMemory.push(args);
  fs.writeFileSync(CORE_MEMORY_FILE, JSON.stringify(coreMemory, null, 2));
  return {
    content: [{ type: 'text', text: 'Successfully ingested memory into CORE_MEMORY graph.' }]
  };
});

// 1. Gamification UI Resource
const gamificationUI = createUIResource({
  uri: 'ui://gitenglishpc/gamification',
  content: {
    type: 'rawHtml',
    htmlString: `
      <div style="font-family: sans-serif; padding: 20px; background: #f0fdf4; border-radius: 12px; max-width: 400px;">
        <h2 style="margin-top: 0; color: #166534;">Gamification Stats</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>Level:</strong> <span id="val-level">Loading...</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>XP:</strong> <span id="val-xp">Loading...</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <strong>Streak:</strong> <span id="val-streak">Loading...</span>
        </div>
        <script>
          // Poll the local state to stay updated without refreshing the widget
          async function fetchState() {
            try {
              const res = await fetch('http://localhost:${PORT}/api/state');
              const data = await res.json();
              document.getElementById('val-level').innerText = data.gamification.level;
              document.getElementById('val-xp').innerText = data.gamification.xp;
              document.getElementById('val-streak').innerText = data.gamification.streak + " days";
            } catch (err) {
              console.error(err);
            }
          }
          fetchState();
          setInterval(fetchState, 5000);
        </script>
      </div>
    `
  },
  encoding: 'text',
});

// Register the Gamification Resource
registerAppResource(mcp, 'gamification_ui', gamificationUI.resource.uri, {}, async () => ({
  contents: [gamificationUI.resource]
}));

// Register Tool to show Gamification UI
registerAppTool(mcp, 'show_gamification_stats', {
  description: 'Displays an interactive widget showing the current gamification stats (XP, Level, Streak) for the student.',
  inputSchema: { student_id: z.string().optional() },
  _meta: { ui: { resourceUri: gamificationUI.resource.uri } }
}, async () => {
  return {
    content: [{
      type: 'text',
      text: `Currently Level ${gamificationState.level} with ${gamificationState.xp} XP and a ${gamificationState.streak}-day streak.`
    }]
  };
});

// 2. Recent Activities UI Resource
const activitiesUI = createUIResource({
  uri: 'ui://gitenglishpc/activities',
  content: {
    type: 'rawHtml',
    htmlString: `
      <div style="font-family: sans-serif; padding: 20px; background: #fffbeb; border-radius: 12px; max-width: 500px;">
        <h2 style="margin-top: 0; color: #92400e;">Recent Activities</h2>
        <ul id="activity-list" style="padding-left: 20px; color: #b45309;">
          <li>Loading...</li>
        </ul>
        <script>
          async function fetchState() {
            try {
              const res = await fetch('http://localhost:${PORT}/api/state');
              const data = await res.json();
              const list = document.getElementById('activity-list');
              list.innerHTML = '';
              if (!data.activities || data.activities.length === 0) {
                list.innerHTML = '<li>No recent activities found.</li>';
                return;
              }
              data.activities.slice(0, 5).forEach(act => {
                const li = document.createElement('li');
                li.innerText = act.activity_name + " (" + act.duration_seconds + "s)";
                list.appendChild(li);
              });
            } catch (err) {
              console.error(err);
            }
          }
          fetchState();
          setInterval(fetchState, 5000);
        </script>
      </div>
    `
  },
  encoding: 'text',
});

// Register the Activities Resource
registerAppResource(mcp, 'activities_ui', activitiesUI.resource.uri, {}, async () => ({
  contents: [activitiesUI.resource]
}));

// Register Tool to show Activities UI
registerAppTool(mcp, 'show_recent_activities', {
  description: 'Displays an interactive widget showing the recent activities completed by the student.',
  inputSchema: { student_id: z.string().optional() },
  _meta: { ui: { resourceUri: activitiesUI.resource.uri } }
}, async () => {
  const summary = recentActivities.slice(0, 3).map(a => `${a.activity_name} (${a.duration_seconds}s)`).join(', ');
  return {
    content: [{
      type: 'text',
      text: summary ? `Recent activities: ${summary}` : 'No recent activities.'
    }]
  };
});

// Start MCP Server Transport
async function run() {
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
  console.error("GitEnglishPC MCP Server is running on stdio");
}

run().catch((err) => {
  console.error("Fatal error", err);
  process.exit(1);
});
