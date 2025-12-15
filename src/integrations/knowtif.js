/**
 * knowtif Integration
 * 
 * GitHub event monitoring and notification system
 * Integrates with the knowtif npm package
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Supported GitHub events
 */
export const GITHUB_EVENTS = {
    push: {
        name: 'Push',
        description: 'Code pushed to repository',
        icon: '🚀',
        trigger: 'push',
    },
    release: {
        name: 'Release',
        description: 'New release published',
        icon: '🎉',
        trigger: 'release',
    },
    pr: {
        name: 'Pull Request',
        description: 'Pull request opened or merged',
        icon: '📝',
        trigger: 'pull_request',
    },
    issue: {
        name: 'Issue',
        description: 'Issue opened or closed',
        icon: '🐛',
        trigger: 'issues',
    },
    star: {
        name: 'Star',
        description: 'Repository starred',
        icon: '⭐',
        trigger: 'watch',
    },
    fork: {
        name: 'Fork',
        description: 'Repository forked',
        icon: '🍴',
        trigger: 'fork',
    },
    discussion: {
        name: 'Discussion',
        description: 'Discussion created or answered',
        icon: '💬',
        trigger: 'discussion',
    },
    deployment: {
        name: 'Deployment',
        description: 'Deployment completed',
        icon: '📦',
        trigger: 'deployment_status',
    },
};

/**
 * Notification channels
 */
export const NOTIFICATION_CHANNELS = {
    webhook: {
        name: 'Webhook',
        description: 'Send to Discord, Slack, or custom webhook',
        requiresSecret: 'NOTIFY_WEBHOOK_URL',
    },
    email: {
        name: 'Email',
        description: 'Send email notifications',
        requiresSecret: ['SMTP_USER', 'SMTP_PASS', 'NOTIFY_EMAIL'],
    },
    github: {
        name: 'GitHub Actions',
        description: 'Post to workflow summary',
        requiresSecret: null,
    },
};

/**
 * Initialize knowtif configuration
 */
export async function initKnowtif(config = {}) {
    const knowtifConfig = {
        enabled: config.enabled ?? true,
        events: config.events || ['push', 'release'],
        channels: config.channels || ['webhook'],
        webhook: config.webhook || null,
        email: config.email || null,
        includeStats: config.includeStats ?? true,
        templates: config.templates || {},
    };

    return knowtifConfig;
}

/**
 * Try to use knowtif package if available
 */
export async function tryKnowtifPackage() {
    try {
        const knowtif = await import('knowtif');
        return knowtif;
    } catch {
        return null;
    }
}

/**
 * Generate notification payload
 */
export function generateNotificationPayload(event, data, config = {}) {
    const eventInfo = GITHUB_EVENTS[event] || { name: event, icon: '📬' };
    const timestamp = new Date().toISOString();

    // Base payload
    const payload = {
        event,
        eventName: eventInfo.name,
        icon: eventInfo.icon,
        timestamp,
        repository: data.repository || '',
        actor: data.actor || '',
        message: '',
        details: {},
    };

    // Event-specific data
    switch (event) {
        case 'push':
            payload.message = `${eventInfo.icon} New push to ${data.repository}`;
            payload.details = {
                branch: data.ref?.replace('refs/heads/', '') || 'main',
                commits: data.commits?.length || 0,
                pusher: data.pusher?.name || data.actor,
            };
            break;

        case 'release':
            payload.message = `${eventInfo.icon} New release: ${data.release?.tag_name || 'unknown'}`;
            payload.details = {
                tag: data.release?.tag_name,
                name: data.release?.name,
                prerelease: data.release?.prerelease || false,
                url: data.release?.html_url,
            };
            break;

        case 'pr':
            const prAction = data.action || 'opened';
            payload.message = `${eventInfo.icon} PR ${prAction}: ${data.pull_request?.title || 'Unknown'}`;
            payload.details = {
                action: prAction,
                number: data.pull_request?.number,
                title: data.pull_request?.title,
                author: data.pull_request?.user?.login,
                url: data.pull_request?.html_url,
                merged: data.pull_request?.merged || false,
            };
            break;

        case 'issue':
            payload.message = `${eventInfo.icon} Issue ${data.action || 'opened'}: ${data.issue?.title || 'Unknown'}`;
            payload.details = {
                action: data.action,
                number: data.issue?.number,
                title: data.issue?.title,
                author: data.issue?.user?.login,
                url: data.issue?.html_url,
                labels: data.issue?.labels?.map(l => l.name) || [],
            };
            break;

        case 'star':
            payload.message = `${eventInfo.icon} New star from ${data.sender?.login || 'unknown'}`;
            payload.details = {
                stargazer: data.sender?.login,
                totalStars: data.repository?.stargazers_count,
            };
            break;

        case 'fork':
            payload.message = `${eventInfo.icon} Repository forked by ${data.sender?.login || 'unknown'}`;
            payload.details = {
                forker: data.sender?.login,
                forkUrl: data.forkee?.html_url,
                totalForks: data.repository?.forks_count,
            };
            break;

        default:
            payload.message = `${eventInfo.icon} ${eventInfo.name} event in ${data.repository}`;
    }

    // Add stats if enabled
    if (config.includeStats && data.stats) {
        payload.stats = {
            totalLines: data.stats.totalLines,
            languages: Object.keys(data.stats.languages || {}).slice(0, 5),
        };
    }

    return payload;
}

/**
 * Format notification for Discord webhook
 */
export function formatDiscordEmbed(payload) {
    const colorMap = {
        push: 0x28a745,
        release: 0x6f42c1,
        pr: 0x0366d6,
        issue: 0xd73a49,
        star: 0xf1c40f,
        fork: 0x17a2b8,
    };

    const embed = {
        title: payload.message,
        color: colorMap[payload.event] || 0x586069,
        timestamp: payload.timestamp,
        footer: {
            text: `doccc + knowtif • ${payload.repository}`,
        },
        fields: [],
    };

    // Add detail fields
    for (const [key, value] of Object.entries(payload.details)) {
        if (value !== null && value !== undefined) {
            embed.fields.push({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value),
                inline: true,
            });
        }
    }

    // Add stats if present
    if (payload.stats) {
        embed.fields.push({
            name: '📊 Code Stats',
            value: `${payload.stats.totalLines?.toLocaleString() || 0} lines • ${payload.stats.languages?.join(', ') || 'N/A'}`,
            inline: false,
        });
    }

    return { embeds: [embed] };
}

/**
 * Format notification for Slack webhook
 */
export function formatSlackBlock(payload) {
    return {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: payload.message,
                    emoji: true,
                },
            },
            {
                type: 'section',
                fields: Object.entries(payload.details)
                    .filter(([_, v]) => v !== null)
                    .slice(0, 10)
                    .map(([key, value]) => ({
                        type: 'mrkdwn',
                        text: `*${key}:* ${value}`,
                    })),
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `📍 ${payload.repository} • ${new Date(payload.timestamp).toLocaleString()}`,
                    },
                ],
            },
        ],
    };
}

/**
 * Generate GitHub Actions workflow for notifications
 */
export function generateKnowtifWorkflow(config) {
    const events = config.events || ['push', 'release'];
    const triggers = events.map(e => {
        const info = GITHUB_EVENTS[e];
        if (!info) return null;

        switch (e) {
            case 'push':
                return `  push:\n    branches: [main, master]`;
            case 'release':
                return `  release:\n    types: [published]`;
            case 'pr':
                return `  pull_request:\n    types: [opened, closed, merged]`;
            case 'issue':
                return `  issues:\n    types: [opened, closed]`;
            case 'star':
                return `  watch:\n    types: [started]`;
            case 'fork':
                return `  fork:`;
            default:
                return null;
        }
    }).filter(Boolean);

    let notifySteps = '';

    if (config.webhook) {
        notifySteps += `
      - name: Send Notification
        if: always()
        env:
          WEBHOOK_URL: \${{ secrets.NOTIFY_WEBHOOK_URL }}
          EVENT_NAME: \${{ github.event_name }}
          REPO: \${{ github.repository }}
          ACTOR: \${{ github.actor }}
          REF: \${{ github.ref }}
        run: |
          # Build message based on event
          case "$EVENT_NAME" in
            push)
              MSG="🚀 New push to $REPO by $ACTOR"
              ;;
            release)
              MSG="🎉 New release: \${{ github.event.release.tag_name }}"
              ;;
            pull_request)
              MSG="📝 PR \${{ github.event.action }}: \${{ github.event.pull_request.title }}"
              ;;
            issues)
              MSG="🐛 Issue \${{ github.event.action }}: \${{ github.event.issue.title }}"
              ;;
            watch)
              MSG="⭐ New star from \${{ github.event.sender.login }}"
              ;;
            fork)
              MSG="🍴 Forked by \${{ github.event.sender.login }}"
              ;;
            *)
              MSG="📬 Event: $EVENT_NAME in $REPO"
              ;;
          esac
          
          # Send webhook
          curl -s -X POST -H "Content-Type: application/json" \\
            -d "{\\"content\\": \\"$MSG\\", \\"embeds\\": [{\\"title\\": \\"$MSG\\", \\"color\\": 2664261, \\"footer\\": {\\"text\\": \\"doccc + knowtif\\"}}]}" \\
            "$WEBHOOK_URL"`;
    }

    return `name: GitHub Event Notifications

on:
${triggers.join('\n')}
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      ${notifySteps}
      
      - name: Job Summary
        run: |
          echo "### 📬 Notification Processed" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Property | Value |" >> $GITHUB_STEP_SUMMARY
          echo "|----------|-------|" >> $GITHUB_STEP_SUMMARY
          echo "| Event | \${{ github.event_name }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Actor | \${{ github.actor }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Repository | \${{ github.repository }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Timestamp | $(date -u) |" >> $GITHUB_STEP_SUMMARY
`;
}

/**
 * Write knowtif workflow file
 */
export function writeKnowtifWorkflow(config, outputPath = '.github/workflows/knowtif.yml') {
    const workflow = generateKnowtifWorkflow(config);
    const dir = join(process.cwd(), '.github/workflows');

    mkdirSync(dir, { recursive: true });
    writeFileSync(join(process.cwd(), outputPath), workflow, 'utf-8');

    return outputPath;
}
