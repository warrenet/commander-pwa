/**
 * Standard Capture Templates
 * @module templates
 */

export const TEMPLATES = [
    // === Basic Templates ===
    {
        id: 'bug',
        icon: '🐛',
        label: 'Bug Report',
        content: `[BUG] 
Context: 
Expected: 
Actual: `
    },
    {
        id: 'idea',
        icon: '💡',
        label: 'Idea',
        content: `[IDEA] 
Goal: 
First Step: `
    },
    {
        id: 'log',
        icon: '🪵',
        label: 'Daily Log',
        content: `#log 
Wins: 
Blockers: `
    },
    {
        id: 'meeting',
        icon: '📅',
        label: 'Meeting Note',
        content: `[MEETING] 
Who: 
Action Items:
- `
    },
    // === Schedule Templates (MacroDroid) ===
    {
        id: 'MissionControl',
        icon: '🎯',
        label: 'Morning Mission Control',
        content: `## 🎯 MISSION CONTROL — {{DATE}}

### HUD
- Energy: /10
- Focus Target: 

### BODY
Top 3 Priorities:
1. 
2. 
3. 

### CLOSE BLOCK
- Review at: 
- Success = 

### LOG
#morning #mission-control`
    },
    {
        id: 'MicroResearch',
        icon: '🔬',
        label: 'Micro Research Sprint',
        content: `## 🔬 MICRO RESEARCH — {{DATE}} {{TIME}}

### HUD
- Topic: 
- Time Box: 25min

### BODY
Question: 
Sources:
- 

Key Findings:
- 

### CLOSE BLOCK
Next Step: 

### LOG
#research #micro-sprint`
    },
    {
        id: 'BuildBlock',
        icon: '🔨',
        label: 'Daily Build Block',
        content: `## 🔨 BUILD BLOCK — {{DATE}}

### HUD
- Project: 
- Branch: 
- Time: {{TIME}}

### BODY
Goal: 

Steps:
1. 
2. 
3. 

### CLOSE BLOCK
Definition of Done: 
Commit Message: 

### LOG
#build #dev`
    },
    {
        id: 'NightlyDelta',
        icon: '🌙',
        label: 'Nightly System Delta',
        content: `## 🌙 NIGHTLY DELTA — {{DATE}}

### HUD
- Mood: /10
- Energy EOD: /10

### BODY
Shipped Today:
- 

Blockers Hit:
- 

Tomorrow's Focus:
- 

### CLOSE BLOCK
Gratitude: 
Learning: 

### LOG
#nightly #reflection`
    }
];

/**
 * Get all templates
 * @returns {Array}
 */
export function getTemplateList() {
    return TEMPLATES;
}

/**
 * Get a specific template content with date/time filled
 * @param {string} id 
 * @param {Object} options - Optional overrides
 * @returns {string}
 */
export function getFilledTemplate(id, options = {}) {
    const t = TEMPLATES.find(x => x.id === id || x.id.toLowerCase() === id?.toLowerCase());
    if (!t) return '';

    let content = t.content;

    // Replace date/time placeholders
    const now = new Date();
    content = content.replace(/\{\{DATE\}\}/g, now.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    }));
    content = content.replace(/\{\{TIME\}\}/g, now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    }));

    return content;
}

/**
 * Generate a save-as name suggestion based on template
 * @param {string} templateId 
 * @returns {string}
 */
export function getSaveAsSuggestion(templateId) {
    const t = TEMPLATES.find(x => x.id === templateId);
    if (!t) return '';

    const date = new Date().toISOString().split('T')[0];
    return `${t.id}_${date}`;
}
