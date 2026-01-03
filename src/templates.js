/**
 * Templates for ChatGPT Run Types
 * @module templates
 */

export const CATEGORIES = [
    { value: 'Note', label: '📝 Note', icon: '📝' },
    { value: 'MissionControl', label: '🎯 Mission Control', icon: '🎯' },
    { value: 'MicroResearch', label: '🔬 Micro Research', icon: '🔬' },
    { value: 'BuildBlock', label: '🧱 Build Block', icon: '🧱' },
    { value: 'NightlyDelta', label: '🌙 Nightly Delta', icon: '🌙' },
    { value: 'Artifact', label: '📦 Artifact', icon: '📦' },
    { value: 'Brief', label: '📋 Brief', icon: '📋' },
];

export const TEMPLATES = {
    MissionControl: {
        name: 'Morning Mission Control',
        icon: '🎯',
        description: 'Daily mission briefing and priority alignment',
        template: `# 🎯 MISSION CONTROL — {{DATE}}

## HUD
- **Energy:** [1-10]
- **Focus Window:** [time range]
- **Top Constraint:** [what's blocking]
- **Today Agenda:** {{AGENDA}}

## Priority Stack
1. 
2. 
3. 

## Critical Path
- [ ] 

## Risks / Blockers
- 

## Next Step
> 

---
## 60s Verify
- [ ] Priorities clear
- [ ] No conflicting commits
- [ ] Resources available

## LOG
- {{TIMESTAMP}} | Mission Control initialized
`,
    },

    MicroResearch: {
        name: 'Mid-Morning Micro Research Sprint',
        icon: '🔬',
        description: 'Focused research burst with tight scope',
        template: `# 🔬 MICRO RESEARCH — {{DATE}}

## HUD
- **Query:** [specific question]
- **Time Box:** 25 min
- **Success Criteria:** [what would be a good answer]

## Sources Checked
- [ ] 
- [ ] 
- [ ] 

## Findings
### Key Insight 1
> 

### Key Insight 2
> 

## Decision / Recommendation
> 

---
## 60s Verify
- [ ] Question answered
- [ ] Sources cited
- [ ] Actionable next step

## Failure Fixes
1. If research incomplete → scope down
2. If conflicting info → note both, flag for later
3. If no results → reframe question

## LOG
- {{TIMESTAMP}} | Research started
`,
    },

    BuildBlock: {
        name: 'Daily Build Block',
        icon: '🧱',
        description: 'Deep work implementation session',
        template: `# 🧱 BUILD BLOCK — {{DATE}}

## HUD
- **Target:** [what to ship]
- **Definition of Done:** [how we know it's done]
- **Time Box:** [hours]
- **Dependencies:** [what's needed]

## Scope (DO)
- [ ] 
- [ ] 
- [ ] 

## Out of Scope (DON'T)
- 
- 

## Progress Log
| Time | Action | Result |
|------|--------|--------|
| | | |

## Blockers Encountered
- 

## Ship Checklist
- [ ] Code works
- [ ] Tested locally
- [ ] No console errors
- [ ] Committed with clear message

---
## 60s Verify
- [ ] DoD met
- [ ] No regressions
- [ ] Ship status updated

## Failure Fixes
1. If blocked → capture state, switch task
2. If scope creep → log it, defer
3. If energy low → 10 min break, then reassess

## Delta Patch
> Changes to carry forward:

## LOG
- {{TIMESTAMP}} | Build block started
`,
    },

    NightlyDelta: {
        name: 'Nightly System Delta + Tomorrow Seed',
        icon: '🌙',
        description: 'End of day review and tomorrow prep',
        template: `# 🌙 NIGHTLY DELTA — {{DATE}}

## Today's Shipped
| Item | DoD | Status |
|------|-----|--------|
| | | ✅/❌ |

## Progress Summary
> 

## Lessons / Observations
- 

## Open Loops
- [ ] 
- [ ] 

## Tomorrow Seed
### Top 3 Priorities
1. 
2. 
3. 

### First Action (no decisions needed)
> 

### Known Blockers
- 

---
## 60s Verify
- [ ] Today reviewed
- [ ] Tomorrow prepped
- [ ] Mind clear

## LOG
- {{TIMESTAMP}} | Nightly delta complete
`,
    },
};

/**
 * Get template with placeholders filled
 * @param {string} templateKey
 * @param {Object} context
 * @returns {string}
 */
export function getFilledTemplate(templateKey, context = {}) {
    const template = TEMPLATES[templateKey];
    if (!template) return '';

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const timestamp = now.toLocaleTimeString();

    let content = template.template;
    content = content.replace(/\{\{DATE\}\}/g, date);
    content = content.replace(/\{\{TIMESTAMP\}\}/g, timestamp);
    content = content.replace(/\{\{AGENDA\}\}/g, context.agenda || '[paste today\'s agenda]');

    return content;
}

/**
 * Get all template names for UI
 * @returns {Array}
 */
export function getTemplateList() {
    return Object.entries(TEMPLATES).map(([key, val]) => ({
        key,
        name: val.name,
        icon: val.icon,
        description: val.description,
    }));
}
