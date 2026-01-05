/**
 * Advanced AI Prompts (No API - Clipboard Based)
 * 14 powerful prompt templates for free AI assistants
 * @module utils/ai-prompts
 */

import { getState } from '../state.js';

/**
 * Get current state summary for prompts
 * @returns {string}
 */
function getStateSummary() {
    const state = getState();
    const inbox = state.inbox || [];
    const next = state.next || [];
    const shipToday = state.shipToday || [];
    const logs = (state.logs || []).slice(0, 10);

    let summary = `## My Current Tasks\n\n`;

    summary += `### 🚀 Ship Today (${shipToday.length})\n`;
    shipToday.forEach(t => summary += `- ${t.text}\n`);

    summary += `\n### 📋 Next (${next.length})\n`;
    next.forEach(t => summary += `- ${t.text}\n`);

    summary += `\n### 📥 Inbox (${inbox.length})\n`;
    inbox.forEach(t => summary += `- ${t.text}\n`);

    if (logs.length > 0) {
        summary += `\n### 📝 Recent Logs\n`;
        logs.forEach(l => {
            const date = new Date(l.createdAt).toLocaleDateString();
            summary += `- [${date}] ${(l.content || '').substring(0, 100)}...\n`;
        });
    }

    return summary;
}

/**
 * All available AI prompts
 */
export const AI_PROMPTS = {
    // === PRIORITIZATION ===
    prioritize: {
        id: 'prioritize',
        name: '🎯 Prioritize My Tasks',
        description: 'Rank tasks by importance and urgency',
        generate: () => `You are a productivity expert. Based on my current tasks, help me prioritize.

${getStateSummary()}

Please:
1. Identify my TOP 3 priorities for today
2. Explain WHY each should be prioritized (impact, urgency, dependencies)
3. Suggest which tasks can WAIT
4. Flag any tasks that seem vague or too large

Be direct and actionable.`
    },

    // === TASK BREAKDOWN ===
    breakdown: {
        id: 'breakdown',
        name: '🔨 Break Down Task',
        description: 'Split a big task into steps',
        generate: (taskText) => `Help me break down this task into smaller, actionable steps:

**Task:** "${taskText || '[paste your task here]'}"

Requirements:
1. Each sub-task should take 30 minutes or less
2. Steps should be specific and concrete (not vague)
3. Order them logically
4. Include any prep work needed

Return as a numbered list I can copy directly into my task manager.`
    },

    // === DAY PLANNING ===
    planDay: {
        id: 'planDay',
        name: '📅 Plan My Day',
        description: 'Create a time-blocked schedule',
        generate: () => {
            const today = new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
            });
            return `Create a realistic time-blocked schedule for my day.

**Today is:** ${today}

${getStateSummary()}

Please:
1. Create a schedule from 8 AM to 6 PM
2. Prioritize "Ship Today" items
3. Include 15-min breaks every 90 minutes
4. Add 30-min buffer for unexpected items
5. Account for energy levels (hard tasks in morning)

Format as a clear time-blocked schedule.`;
        }
    },

    // === WEEKLY RETROSPECTIVE ===
    weeklyRetro: {
        id: 'weeklyRetro',
        name: '📊 Weekly Retrospective',
        description: 'Analyze your week for insights',
        generate: () => `Analyze my productivity for this week.

${getStateSummary()}

Please provide:
1. **Wins**: What did I accomplish?
2. **Patterns**: What themes do you see in my tasks?
3. **Blockers**: What might be slowing me down?
4. **Suggestions**: 3 specific improvements for next week
5. **Focus Areas**: What should I prioritize going forward?

Be constructive and specific.`
    },

    // === GTD PROCESSING ===
    gtdProcess: {
        id: 'gtdProcess',
        name: '📥 GTD Inbox Processing',
        description: 'Process inbox items GTD-style',
        generate: () => {
            const state = getState();
            const inbox = state.inbox || [];

            let items = inbox.map(t => `- ${t.text}`).join('\n');

            return `Help me process my inbox using GTD (Getting Things Done) methodology.

**My Inbox Items:**
${items || '(No items)'}

For EACH item, determine:
1. **Is it actionable?** (Yes/No)
2. If No: Should I delete it, file it for reference, or add to "someday/maybe"?
3. If Yes: What's the NEXT physical action? (be specific)
4. Does it belong to a larger project?
5. Can it be done in <2 minutes? (Do it now)
6. Should I delegate it?
7. What section: Ship Today / Next / Someday?

Process each item systematically.`;
        }
    },

    // === MEETING PREP ===
    meetingPrep: {
        id: 'meetingPrep',
        name: '🤝 Meeting Prep',
        description: 'Generate talking points for a meeting',
        generate: (topic) => `Help me prepare for a meeting.

**Meeting Topic:** "${topic || '[describe meeting]'}"

${getStateSummary()}

Please generate:
1. **Key Talking Points**: 3-5 main things to discuss
2. **Questions to Ask**: Important questions for clarity
3. **Updates to Share**: What I should report
4. **Decisions Needed**: What needs to be decided?
5. **Action Items Template**: Format for capturing next steps

Keep it concise and actionable.`
    },

    // === GOAL ALIGNMENT ===
    goalAlignment: {
        id: 'goalAlignment',
        name: '🎯 Goal Alignment Check',
        description: 'Check if tasks align with goals',
        generate: (goals) => `Check if my tasks align with my goals.

**My Goals:**
${goals || '1. [Goal 1]\n2. [Goal 2]\n3. [Goal 3]'}

${getStateSummary()}

Please analyze:
1. Which tasks DIRECTLY support my goals?
2. Which tasks are DISTRACTIONS?
3. What important tasks am I MISSING?
4. How can I better align my daily work with my goals?

Be honest about misalignment.`
    },

    // === DAILY DEBRIEF ===
    dailyDebrief: {
        id: 'dailyDebrief',
        name: '🧠 Daily Debrief',
        description: 'Grade your day and extract lessons',
        generate: () => {
            const state = getState();
            const logs = (state.logs || []).slice(0, 5);
            const shipped = (state.shipped || []).slice(0, 5);

            let logText = logs.map(l => `- ${l.content || 'Log entry'}`).join('\n');
            let shippedText = shipped.map(s => `- ${s.text || s}`).join('\n');

            return `Review and grade my day.

**What I Shipped:**
${shippedText || '(Nothing shipped today)'}

**My Logs/Notes:**
${logText || '(No logs)'}

${getStateSummary()}

Please:
1. **Grade my day**: A/B/C/D/F with explanation
2. **Wins**: What went well?
3. **Lessons**: What can I learn?
4. **Tomorrow**: One thing to do differently
5. **Momentum Score**: 1-10 for my current momentum`;
        }
    },

    // === STUCK TASK HELPER ===
    stuckHelper: {
        id: 'stuckHelper',
        name: '🚧 Stuck Task Helper',
        description: 'Get unstuck on a difficult task',
        generate: (taskText) => `I'm stuck on this task and need help getting unstuck.

**Task I'm stuck on:** "${taskText || '[paste task]'}"

**Why I think I'm stuck:**
[Describe what's blocking you]

Please help by:
1. **Reframe it**: Is there a simpler way to think about this?
2. **First step**: What's the SMALLEST possible action?
3. **Resources**: What might help me complete this?
4. **Timeboxing**: How long should I spend before asking for help?
5. **Alternative**: Is there a different approach entirely?`
    },

    // === PROCRASTINATION BUSTER ===
    procrastBuster: {
        id: 'procrastBuster',
        name: '⚡ Procrastination Buster',
        description: 'Overcome resistance to a task',
        generate: (taskText) => `Help me overcome procrastination on this task.

**Task I'm avoiding:** "${taskText || '[paste task]'}"

Please provide:
1. **Why might I be avoiding this?** (fear, overwhelm, boredom, unclear?)
2. **Reframe**: How can I make this feel more appealing?
3. **2-Minute Start**: What's a tiny action to just BEGIN?
4. **Reward**: What treat can I give myself after?
5. **Accountability**: How can I commit to doing it?

Make it motivating!`
    },

    // === WEEKLY PLANNING ===
    weeklyPlan: {
        id: 'weeklyPlan',
        name: '🗓️ Weekly Planning',
        description: 'Plan your entire week',
        generate: () => {
            const nextMonday = getNextMonday();
            return `Help me plan my week.

**Week of:** ${nextMonday}

${getStateSummary()}

Please create:
1. **Theme/Focus**: What should this week be about?
2. **Top 3 Outcomes**: What must be accomplished?
3. **Daily Breakdown**: Key task for each day (Mon-Fri)
4. **Buffer Time**: When to handle unexpected items?
5. **Self-Care**: When to rest and recharge?

Make it realistic and achievable.`;
        }
    },

    // === PROJECT KICKSTART ===
    projectKickstart: {
        id: 'projectKickstart',
        name: '🚀 Project Kickstart',
        description: 'Plan a new project from scratch',
        generate: (projectName) => `Help me kickstart a new project.

**Project:** "${projectName || '[project name]'}"

Please provide:
1. **Outcome**: What does "done" look like?
2. **Milestones**: 3-5 key milestones
3. **First Actions**: 5 concrete next actions to start
4. **Resources Needed**: What do I need?
5. **Risks**: What could go wrong?
6. **Timeline**: Rough estimate

Be practical and actionable.`
    },

    // === ENERGY MATCHING ===
    energyMatch: {
        id: 'energyMatch',
        name: '🔋 Energy-Task Matching',
        description: 'Match tasks to energy levels',
        generate: () => `Help me match my tasks to my energy levels.

${getStateSummary()}

For each task, categorize:
- **🔥 High Energy Required**: Deep focus, creative, complex
- **⚡ Medium Energy**: Routine but requires attention
- **🌙 Low Energy OK**: Admin, organizing, simple

Then create a schedule:
- **Morning (Peak Energy)**: Hardest tasks
- **Afternoon (Dip)**: Meetings, routine work
- **Late Afternoon (Second Wind)**: Medium tasks
- **Evening (Wind Down)**: Low-energy tasks`
    },

    // === AUTOMATION FINDER ===
    automationFinder: {
        id: 'automationFinder',
        name: '🤖 Automation Finder',
        description: 'Find tasks to automate',
        generate: () => `Analyze my tasks and find automation opportunities.

${getStateSummary()}

Please identify:
1. **Repetitive Tasks**: What keeps appearing?
2. **Template Candidates**: What could use a template?
3. **Delegation Opportunities**: What could someone else do?
4. **Tool Suggestions**: Apps/tools that could help?
5. **Process Improvements**: How to do things faster?

Focus on practical, easy wins.`
    }
};

/**
 * Get next Monday's date string
 * @returns {string}
 */
function getNextMonday() {
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Get all prompt IDs
 * @returns {string[]}
 */
export function getPromptIds() {
    return Object.keys(AI_PROMPTS);
}

/**
 * Get a prompt by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getPrompt(id) {
    return AI_PROMPTS[id] || null;
}

/**
 * Generate a prompt's text
 * @param {string} id
 * @param {string} [input] - Optional input for prompts that need it
 * @returns {string}
 */
export function generatePrompt(id, input) {
    const prompt = AI_PROMPTS[id];
    if (!prompt) return '';
    return prompt.generate(input);
}

/**
 * Copy prompt to clipboard
 * @param {string} id
 * @param {string} [input]
 * @returns {Promise<boolean>}
 */
export async function copyPrompt(id, input) {
    const text = generatePrompt(id, input);
    if (!text) return false;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        console.error('[AI-Prompts] Copy failed:', e);
        return false;
    }
}

/**
 * Get all prompts as array
 * @returns {Array<{id: string, name: string, description: string}>}
 */
export function getAllPrompts() {
    return Object.values(AI_PROMPTS).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description
    }));
}

export default {
    AI_PROMPTS,
    getPromptIds,
    getPrompt,
    generatePrompt,
    copyPrompt,
    getAllPrompts
};
