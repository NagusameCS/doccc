/**
 * Notify Command
 * 
 * Configure GitHub event notifications using knowtif
 */

import inquirer from 'inquirer';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Configure notifications
 */
export async function notify(options = {}) {
    // Interactive setup
    if (options.interactive || options.setup) {
        return await interactiveSetup();
    }

    // Test notification
    if (options.test) {
        return await sendTestNotification(options);
    }

    // Configure from options
    const config = {
        events: options.events?.split(',').map(e => e.trim()) || ['push', 'release'],
        webhook: options.webhook || null,
        email: options.email || null,
    };

    // Update doccc config
    await updateKnowtifConfig(config);

    // Generate GitHub Action if needed
    if (config.webhook || config.email) {
        await generateNotifyAction(config);
    }

    return { configured: true, config };
}

/**
 * Interactive notification setup
 */
async function interactiveSetup() {
    console.log(chalk.bold('\n📬 knowtif Notification Setup\n'));

    const answers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'events',
            message: 'Which GitHub events should trigger notifications?',
            choices: [
                { name: 'Push to main branch', value: 'push', checked: true },
                { name: 'New release published', value: 'release', checked: true },
                { name: 'Pull request opened', value: 'pr' },
                { name: 'Issue opened', value: 'issue' },
                { name: 'Repository starred', value: 'star' },
                { name: 'Repository forked', value: 'fork' },
            ],
        },
        {
            type: 'checkbox',
            name: 'channels',
            message: 'Select notification channels:',
            choices: [
                { name: 'Webhook (Discord, Slack, etc.)', value: 'webhook' },
                { name: 'Email', value: 'email' },
                { name: 'GitHub Actions summary', value: 'actions' },
            ],
        },
        {
            type: 'input',
            name: 'webhook',
            message: 'Webhook URL:',
            when: (ans) => ans.channels.includes('webhook'),
            validate: (input) => {
                if (!input) return 'Webhook URL is required';
                try {
                    new URL(input);
                    return true;
                } catch {
                    return 'Please enter a valid URL';
                }
            },
        },
        {
            type: 'input',
            name: 'email',
            message: 'Notification email:',
            when: (ans) => ans.channels.includes('email'),
            validate: (input) => {
                if (!input) return 'Email is required';
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email';
            },
        },
        {
            type: 'confirm',
            name: 'includeStats',
            message: 'Include code stats in notifications?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'generateAction',
            message: 'Generate GitHub Action for notifications?',
            default: true,
        },
    ]);

    const config = {
        enabled: true,
        events: answers.events,
        webhook: answers.webhook || null,
        email: answers.email || null,
        includeStats: answers.includeStats,
    };

    // Update doccc config
    await updateKnowtifConfig(config);

    // Generate GitHub Action
    if (answers.generateAction) {
        await generateNotifyAction(config);
        console.log(chalk.green('\n✓ Generated .github/workflows/notify.yml'));
    }

    // Create secrets reminder
    if (answers.webhook || answers.email) {
        console.log(chalk.yellow('\n⚠️  Remember to add GitHub Secrets:'));
        if (answers.webhook) {
            console.log(chalk.gray('  → NOTIFY_WEBHOOK_URL: Your webhook URL'));
        }
        if (answers.email) {
            console.log(chalk.gray('  → NOTIFY_EMAIL: Target email'));
            console.log(chalk.gray('  → SMTP_USER: SMTP username'));
            console.log(chalk.gray('  → SMTP_PASS: SMTP password'));
        }
    }

    return { configured: true, config };
}

/**
 * Send test notification
 */
async function sendTestNotification(options) {
    console.log(chalk.blue('\n📤 Sending test notification...\n'));

    // Try to load knowtif
    try {
        const { sendNotification } = await import('knowtif');

        const result = await sendNotification({
            title: '🧪 Test Notification from doccc',
            message: 'Your notification system is working correctly!',
            webhook: options.webhook,
            email: options.email,
        });

        console.log(chalk.green('✓ Test notification sent successfully!'));
        return { success: true, result };
    } catch (error) {
        // Fallback: simple webhook test
        if (options.webhook) {
            try {
                const response = await fetch(options.webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: '🧪 **Test Notification from doccc**\n\nYour notification system is working correctly!',
                        embeds: [{
                            title: 'doccc Test',
                            description: 'This is a test notification',
                            color: 0x28a745,
                            timestamp: new Date().toISOString(),
                        }],
                    }),
                });

                if (response.ok) {
                    console.log(chalk.green('✓ Webhook test successful!'));
                    return { success: true };
                } else {
                    throw new Error(`Webhook returned ${response.status}`);
                }
            } catch (e) {
                console.log(chalk.red(`✗ Webhook test failed: ${e.message}`));
                return { success: false, error: e.message };
            }
        }

        console.log(chalk.yellow('⚠️  knowtif not available, skipping advanced notifications'));
        return { success: false, error: error.message };
    }
}

/**
 * Update knowtif config in doccc.config.js
 */
async function updateKnowtifConfig(knowtifConfig) {
    const configPath = 'doccc.config.js';

    if (!existsSync(configPath)) {
        console.log(chalk.yellow('No doccc.config.js found. Run `doccc init` first.'));
        return;
    }

    // Simple config update - in production would use AST
    let content = readFileSync(configPath, 'utf-8');

    // Replace knowtif section
    const knowtifRegex = /knowtif:\s*\{[\s\S]*?\},/;
    const newKnowtif = `knowtif: ${JSON.stringify(knowtifConfig, null, 2).replace(/"/g, "'")},`;

    if (knowtifRegex.test(content)) {
        content = content.replace(knowtifRegex, newKnowtif);
    } else {
        // Add knowtif section before the closing brace
        content = content.replace(/\};?\s*$/, `  ${newKnowtif}\n};`);
    }

    writeFileSync(configPath, content, 'utf-8');
}

/**
 * Generate GitHub Action for notifications
 */
async function generateNotifyAction(config) {
    const workflowDir = '.github/workflows';
    mkdirSync(workflowDir, { recursive: true });

    const triggers = [];

    if (config.events.includes('push')) {
        triggers.push(`  push:
    branches: [main]`);
    }

    if (config.events.includes('release')) {
        triggers.push(`  release:
    types: [published]`);
    }

    if (config.events.includes('pr')) {
        triggers.push(`  pull_request:
    types: [opened, closed]`);
    }

    if (config.events.includes('issue')) {
        triggers.push(`  issues:
    types: [opened]`);
    }

    if (config.events.includes('star')) {
        triggers.push(`  watch:
    types: [started]`);
    }

    if (config.events.includes('fork')) {
        triggers.push(`  fork:`);
    }

    let notifyStep = '';

    if (config.webhook) {
        notifyStep = `
      - name: Send Webhook Notification
        run: |
          EVENT_NAME="\${{ github.event_name }}"
          REPO="\${{ github.repository }}"
          ACTOR="\${{ github.actor }}"
          
          if [ "$EVENT_NAME" = "push" ]; then
            MESSAGE="🚀 New push to $REPO by $ACTOR"
          elif [ "$EVENT_NAME" = "release" ]; then
            MESSAGE="🎉 New release published: \${{ github.event.release.tag_name }}"
          elif [ "$EVENT_NAME" = "pull_request" ]; then
            MESSAGE="📝 PR \${{ github.event.action }}: \${{ github.event.pull_request.title }}"
          else
            MESSAGE="📬 GitHub event: $EVENT_NAME in $REPO"
          fi
          
          curl -X POST -H "Content-Type: application/json" \\
            -d "{\\"content\\": \\"$MESSAGE\\"}" \\
            "\${{ secrets.NOTIFY_WEBHOOK_URL }}"`;
    }

    const workflow = `name: GitHub Notifications

on:
${triggers.join('\n')}

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      ${notifyStep}
      
      - name: Summary
        run: |
          echo "### 📬 Notification Sent" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Event:** \${{ github.event_name }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Actor:** \${{ github.actor }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Time:** $(date -u)" >> $GITHUB_STEP_SUMMARY
`;

    writeFileSync(join(workflowDir, 'notify.yml'), workflow, 'utf-8');
}
