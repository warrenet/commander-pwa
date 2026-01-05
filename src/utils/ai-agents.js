/**
 * AI Agent Integration (Multi-Agent Support)
 * Enables ChatGPT, Gemini, Claude to interact with Commander
 * @module utils/ai-agents
 */

/**
 * AI Agent Configuration
 * Templates for different AI assistants
 */
const AI_AGENTS = {
    chatgpt: {
        name: 'ChatGPT',
        icon: '🤖',
        promptPrefix: `You are helping me manage my task list in Commander PWA. `,
        capabilities: ['task-breakdown', 'prioritization', 'time-estimation', 'suggestions']
    },
    gemini: {
        name: 'Gemini',
        icon: '✨',
        promptPrefix: `Act as my productivity assistant for Commander PWA. `,
        capabilities: ['task-breakdown', 'prioritization', 'context-analysis', 'scheduling']
    },
    claude: {
        name: 'Claude',
        icon: '🧠',
        promptPrefix: `Help me organize my tasks in Commander PWA. `,
        capabilities: ['task-breakdown', 'prioritization', 'reasoning', 'suggestions']
    }
};

/**
 * Generate context prompt from current state
 * @param {Object} state - Current app state
 * @returns {string} Formatted context for AI
 */
export function generateContextPrompt(state) {
    const inbox = state.inbox || [];
    const next = state.next || [];
    const shipToday = state.shipToday || [];
    const logs = (state.logs || []).slice(0, 5); // Last 5 logs

    let context = `## Current Task State\n\n`;

    context += `### Ship Today (${shipToday.length} items)\n`;
    shipToday.forEach(item => {
        context += `- ${item.text}${item.tags ? ` [${item.tags.join(', ')}]` : ''}\n`;
    });

    context += `\n### Next (${next.length} items)\n`;
    next.forEach(item => {
        context += `- ${item.text}${item.tags ? ` [${item.tags.join(', ')}]` : ''}\n`;
    });

    context += `\n### Inbox (${inbox.length} items)\n`;
    inbox.forEach(item => {
        context += `- ${item.text}${item.tags ? ` [${item.tags.join(', ')}]` : ''}\n`;
    });

    if (logs.length > 0) {
        context += `\n### Recent Logs\n`;
        logs.forEach(log => {
            const date = new Date(log.createdAt).toLocaleDateString();
            context += `- [${date}] ${log.content?.substring(0, 100) || 'Log entry'}...\n`;
        });
    }

    return context;
}

/**
 * Generate AI prompt for specific actions
 * @param {'prioritize' | 'breakdown' | 'review' | 'plan' | 'suggest'} action
 * @param {Object} state
 * @param {Object} [options]
 * @returns {string}
 */
export function generateAIPrompt(action, state, options = {}) {
    const context = generateContextPrompt(state);
    const agent = AI_AGENTS[options.agent] || AI_AGENTS.chatgpt;

    const prompts = {
        prioritize: `${agent.promptPrefix}

Based on my current tasks, help me prioritize what to focus on today.

${context}

Please:
1. Identify the 3 most important tasks for today
2. Explain why each should be prioritized
3. Suggest tasks that can wait

Return a prioritized list with brief reasoning.`,

        breakdown: `${agent.promptPrefix}

I need help breaking down a task into smaller, actionable steps.

${options.task ? `Task to break down: "${options.task}"` : ''}

${context}

Please:
1. Break this into 3-5 concrete sub-tasks
2. Each should be completable in under 30 minutes
3. Order them logically

Return as a bullet list I can copy directly into Commander.`,

        review: `${agent.promptPrefix}

Review my task list and provide feedback on my productivity system.

${context}

Please analyze:
1. Are there any stale tasks that should be archived or deleted?
2. Are tasks specific enough to be actionable?
3. What patterns do you see in my task types?
4. Suggestions for improvement

Be constructive and specific.`,

        plan: `${agent.promptPrefix}

Help me plan my day based on my current tasks.

${context}

Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.

Please:
1. Create a time-blocked schedule
2. Account for breaks and buffer time
3. Prioritize Ship Today items
4. Suggest when to tackle Inbox items

Format as a clear schedule.`,

        suggest: `${agent.promptPrefix}

Based on my task history and patterns, suggest new tasks or habits I should add.

${context}

Consider:
1. Gaps in my current task categories
2. Recurring themes that might benefit from automation
3. Personal/professional balance
4. Quick wins I might be missing

Provide 3-5 specific, actionable suggestions.`
    };

    return prompts[action] || prompts.suggest;
}

/**
 * Copy AI prompt to clipboard
 * @param {'prioritize' | 'breakdown' | 'review' | 'plan' | 'suggest'} action
 * @param {Object} state
 * @param {Object} [options]
 * @returns {Promise<boolean>}
 */
export async function copyAIPrompt(action, state, options = {}) {
    const prompt = generateAIPrompt(action, state, options);

    try {
        await navigator.clipboard.writeText(prompt);
        return true;
    } catch (error) {
        console.error('[AI-Agents] Failed to copy prompt:', error);
        return false;
    }
}

/**
 * Parse AI response into actionable tasks
 * @param {string} response - AI response text
 * @returns {string[]} Array of task strings
 */
export function parseAIResponse(response) {
    // Extract bullet points and numbered items
    const lines = response.split('\n');
    const tasks = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // Match: - task, * task, 1. task, 1) task
        const match = trimmed.match(/^[-*•]\s+(.+)$|^\d+[.)]\s+(.+)$/);
        if (match) {
            const task = match[1] || match[2];
            // Clean up task text
            const cleaned = task
                .replace(/^\*\*(.+)\*\*$/, '$1') // Remove bold
                .replace(/^\[.\]\s*/, '') // Remove checkboxes
                .trim();

            if (cleaned.length > 0 && cleaned.length < 200) {
                tasks.push(cleaned);
            }
        }
    }

    return tasks;
}

/**
 * Generate deep link for AI response
 * @param {string[]} tasks - Array of tasks to add
 * @param {Object} [options]
 * @returns {string} Deep link URL
 */
export function generateBatchLink(tasks, options = {}) {
    const baseUrl = window.location.origin;
    const encoded = encodeURIComponent(JSON.stringify(tasks));
    return `${baseUrl}/share.html?batch=${encoded}&source=${options.source || 'ai'}`;
}

/**
 * Get available AI actions
 * @returns {Array<{id: string, label: string, icon: string, description: string}>}
 */
export function getAIActions() {
    return [
        { id: 'prioritize', label: 'Prioritize', icon: '🎯', description: 'Help me focus on what matters' },
        { id: 'breakdown', label: 'Break Down', icon: '🔨', description: 'Split a task into steps' },
        { id: 'review', label: 'Review', icon: '🔍', description: 'Analyze my task list' },
        { id: 'plan', label: 'Plan Day', icon: '📅', description: 'Create a daily schedule' },
        { id: 'suggest', label: 'Suggest', icon: '💡', description: 'Recommend new tasks' }
    ];
}

/**
 * Get supported AI agents
 * @returns {Object}
 */
export function getAIAgents() {
    return AI_AGENTS;
}

export default {
    generateContextPrompt,
    generateAIPrompt,
    copyAIPrompt,
    parseAIResponse,
    generateBatchLink,
    getAIActions,
    getAIAgents,
    AI_AGENTS
};
