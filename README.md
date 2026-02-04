<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Practice Genie

A React-based infinite whiteboard for generating and managing educational exercises using AI.

**View in AI Studio:** [Practice Genie on AI Studio](https://ai.studio/apps/drive/1aUZbAFYiXsVN5Gep4k8FMcmihEZPEJNJ)

## Development Guidelines

**Please read [AGENTS.md](./AGENTS.md) for detailed workspace rules, coding standards ("vibe coding"), and architectural guidelines.**

## Run Locally

**Prerequisites:** Node.js, pnpm (recommended)

1. **Install dependencies:**
   ```bash
   pnpm install
   # or npm install
   ```

2. **Setup Environment:**
   Copy `.env.example` to `.env.local` and set the `MISTRAL_API_KEY` to your Mistral API key.

3. **Run the app:**
   ```bash
   pnpm dev
   # or npm run dev
   ```

## Deployment

### Build for Production

To create a production-ready build:

```bash
pnpm build
# or npm run build
```

This will create a `dist/` directory with optimized, minified files ready for deployment.

### Deploy to Vercel (Recommended)

1. Push your code to a Git repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard:
   - `MISTRAL_API_KEY`: Your Mistral API key
4. Vercel will automatically detect the Vite project and build it

### Deploy to Other Platforms

For other platforms, ensure you:
1. Build the project with `pnpm build`
2. Serve the `dist/` directory with a web server
3. Set the `MISTRAL_API_KEY` environment variable
4. Configure your server to serve `index.html` for all routes (SPA fallback)

### Environment Variables

- `MISTRAL_API_KEY`: Required. Your Mistral API key for AI functionality.
