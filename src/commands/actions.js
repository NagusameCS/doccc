/**
 * GitHub Actions Generator Command
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function generateActions(options = {}) {
    const {
        schedule = '0 0 * * *',
        onPush = true,
        onRelease = true,
        withStats = true,
        withNotify = false,
    } = options;

    const workflowDir = '.github/workflows';
    mkdirSync(workflowDir, { recursive: true });

    const triggers = ['  workflow_dispatch:'];

    if (schedule) {
        triggers.push(`  schedule:\n    - cron: '${schedule}'`);
    }

    if (onPush) {
        triggers.push('  push:\n    branches: [main, master]');
    }

    if (onRelease) {
        triggers.push('  release:\n    types: [published]');
    }

    let steps = `
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build README
        run: npx doccc build`;

    if (withStats) {
        steps += `
      
      - name: Generate Statistics
        run: npx doccc stats --format badge --output ./assets`;
    }

    if (withNotify) {
        steps += `
      
      - name: Send Notification
        if: success()
        env:
          WEBHOOK_URL: \${{ secrets.NOTIFY_WEBHOOK_URL }}
        run: |
          curl -s -X POST -H "Content-Type: application/json" \\
            -d '{"content": "README updated successfully!"}' \\
            "$WEBHOOK_URL" || true`;
    }

    steps += `
      
      - name: Commit and Push
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'docs: auto-update README [skip ci]'
          file_pattern: 'README.md assets/*'
      
      - name: Summary
        run: |
          echo "### README Updated" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- Generated at: $(date -u)" >> $GITHUB_STEP_SUMMARY
          echo "- Triggered by: \${{ github.event_name }}" >> $GITHUB_STEP_SUMMARY`;

    const workflow = `name: Update README

on:
${triggers.join('\n')}

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:${steps}
`;

    writeFileSync(join(workflowDir, 'doccc.yml'), workflow, 'utf-8');

    return { path: join(workflowDir, 'doccc.yml') };
}
