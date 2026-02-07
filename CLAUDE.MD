# Claude CLI Context: To Google Calendar

### Intellectual Honesty

- Disagree when facts contradict my statements; prioritize truth over agreement
- Be skeptical about all data received; verify before accepting
- Double-check conclusions with a skeptical frame before presenting
- When data does not exist, explicitly state: "I couldn't find data on [X]"
- Respond with highest-probability answers (temperature=0 mindset)

### Communication Style

- Be concise and direct; no filler or hedging language
- No apologies; thank instead and ensure the error isn't repeated
- Be factual; avoid speculation without labeling it as such

### Research Protocol

- Prioritize primary sources over summaries
- For technical concepts: search for recent papers/implementations before answering
- Prioritize papers from last 12-24 months unless historical context required
- **When NOT to search**: well-established concepts, mathematical proofs, core CS theory

### Quantitative Rigor

Show working for any quantitative conclusions:

```
Given: [Input data/assumptions]
Calculation:
├── Step 1: [calculation]
├── Step 2: [calculation]
└── Step N: [calculation]
Result: [Conclusion]
```

### CTFCV Framework

Before responding to complex queries, list assumptions about:

- **C**ontext: What's the broader situation?
- **T**ask: What exactly am I being asked to do?
- **F**ormat: What output structure is expected?
- **C**onstraints: What limitations apply?
- **V**erification: How will success be measured?

Then ask clarifying questions if ambiguity exists.

### Session Management

- On chat start: Review initial prompt and suggest improvements
- Track token usage throughout session

## Session Archival Protocol

### User Command

When the user requests to "store this session" or "save this conversation", follow this protocol to create a comprehensive session archive file.

### Archive File Naming

Format: `[YYYY-MM-DD]-CLAUDE-[subject].md`

Example: `2026-02-01-CLAUDE-claude-convo-extractor-github-setup.md`

### Required Content Structure

Generate a complete session archive file with the following sections:

#### 1. Header Metadata

- Date (YYYY-MM-DD)
- Session Subject (descriptive title)
- Duration estimate
- Status (Completed/In Progress)
- Completeness indicator (100% - All conversation + technical details)

#### 2. Conversation Flow Section

For each user message, include:

- **User Request**: Exact user message text in blockquote format
- **Claude Response**: Summary of what Claude responded
- **Actions Taken**: Bullet list of what was executed
- **Sample Results**: Key outputs or file changes

#### 3. Technical Execution Details Section

For each major action/file modification, include:

- **File Path**: Absolute path to the file
- **File Details**: Total lines, language, type
- **Original Content**: Code/text before changes (in code blocks)
- **New Content**: Code/text after changes (in code blocks)
- **Changes Made**: Bullet list of modifications
- **Status**: ✅/❌ indicator

#### 4. Tool Calls & Outputs Section

For each bash/tool command executed:

- **Command**: Exact command with proper formatting
- **Output**: Complete command output
- **Exit Code**: Success/failure indicator
- **Impact**: What changed as a result

#### 5. Git History Section (if applicable)

- Commit hashes
- Commit messages
- Files changed
- Insertions/deletions
- Push status and results

#### 6. Summary & Metrics Section

Include:

- Table of all actions performed with status
- File statistics (paths, lines, actions)
- Total counts (files modified, created, renamed)
- Timeline breakdown by phase
- Key achievements checklist

#### 7. Code Review Notes (if applicable)

- Security considerations
- Performance impacts
- Testing coverage
- Breaking changes

#### 8. Complete File Listing (if applicable)

For bulk operations (file renames, creations):

- Complete numbered list of all files
- Before/after names for renames
- Status for each file

#### 9. Timeline Section

Table with columns:

- Step/Phase
- Action description
- Duration
- Status

### Quality Standards

**Completeness**: ✅ Must include ALL conversation details and technical execution

- No summarization that omits details
- Full code diffs for every edit
- Complete command outputs
- All user questions and Claude responses

**Accuracy**: ✅ All information must be factual

- Exact file paths (not approximations)
- Actual code snippets (not paraphrased)
- Real command outputs (not examples)
- Correct timestamps and dates
- Actual line numbers and file lengths

**Organization**: ✅ Logical, easy-to-navigate structure

- Clear section headings
- Numbered or bulleted lists
- Code blocks with syntax highlighting
- Tables for metrics and comparisons
- Proper markdown formatting

**Comprehensiveness**: ✅ Nothing important is left out

- Every file edited is documented
- Every command executed is shown
- Every user interaction is captured
- Full before/after for all changes
- All git operations logged

### Minimum Sections Required

1. ✅ Conversation flow with all user messages
2. ✅ Detailed technical execution for each major action
3. ✅ Complete code/content changes with diffs
4. ✅ All command outputs and results
5. ✅ Git history (if applicable)
6. ✅ Summary metrics and timeline
7. ✅ Complete status indicators

### Trigger Phrases

Create session archive when user says:

- "save this conversation"
- "store this session"
- "archive this conversation"
- "save this to conversations"
- "create a session file"
- "store this in [folder]"

### Special Instructions

- **Timestamps**: Include session date (today's date in YYYY-MM-DD format)
- **Tool Calls**: Show every bash command, read operation, edit operation
- **Outputs**: Capture actual tool outputs, not summaries
- **Code Context**: Show surrounding code and file context when possible
- **Security**: Highlight any security considerations or patterns
- **Completeness Check**: Verify every action in conversation is documented

---

## Chrome Extension: Calendar to Google Calendar

### Project Status

**Current Version**: 1.0.0 - Fully functional and tested

**Working Features**:
- ✅ Extracts calendar events from CapEdge dashboard
- ✅ Auto-retry mechanism for slow-loading calendars
- ✅ Side panel UI with event filtering
- ✅ Downloads .ics file for Google Calendar import
- ✅ Professional calendar+export icon
- ✅ Single-click side panel opening
- ✅ All 64 unit tests passing

**User Workflow**:
1. User clicks extension icon → side panel opens
2. Navigate to CapEdge dashboard → events auto-extract (with retry)
3. Filter events by type (Earnings, Financial, Ownership, Registration, News)
4. Click "Download .ics File" → browser downloads file
5. Import to Google Calendar via Settings → Import & export

### Technical Architecture

**Build System**: Vite + @crxjs/vite-plugin (for Chrome extension bundling)
- Content script: Extracts events from DOM
- Service worker: Coordinates messages, generates ICS files
- Side panel: UI for filtering and downloading

**Key Challenge Solved**: Content scripts can't use ES module imports
- Solution: @crxjs/vite-plugin creates loaders that use dynamic imports
- Content script exports `onExecute()` function for CRX loader

**ICS Generation**: Uses data URLs (not blob URLs) because service workers don't support `URL.createObjectURL()`

### Future Publishing

**Chrome Web Store Publication** (planned):
- Requires $5 developer account registration
- Need store listing assets (screenshots, descriptions)
- Review process typically takes a few days
- See README.md "Publishing to Chrome Web Store" section for full checklist

**Potential Enhancements**:
- Support for additional financial websites (extensible architecture already in place)
- Direct Google Calendar API integration (no manual import needed)
- Calendar sync (auto-update events)
- Browser notifications for upcoming events

---
