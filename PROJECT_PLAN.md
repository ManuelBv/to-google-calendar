# Chrome Extension: Calendar to Google Calendar - Project Plan

## Project Overview

Build a Chrome extension (Manifest V3) that extracts calendar events from CapEdge dashboard and generates downloadable .ics files for Google Calendar import.

## Implementation Status

✅ **COMPLETED** - All phases implemented and tested

### Completed Phases

1. ✅ Phase 0: Project foundation and dependencies
2. ✅ Phase 1: Type definitions and utilities (TDD)
3. ✅ Phase 2: Content script and parsers (TDD)
4. ✅ Phase 3: IndexedDB storage layer (TDD)
5. ✅ Phase 4: Service worker (TDD)
6. ✅ Phase 5: ICS generator (TDD)
7. ✅ Phase 6: Side panel UI
8. ✅ Phase 7: Manifest and build configuration
9. ✅ Phase 8: Error handling (integrated throughout)
10. ✅ Phase 9: Testing and documentation

### Test Coverage

- **64 tests** passing across 5 test files
- Unit tests for all core functionality
- Fixtures for testing DOM parsing
- Mock Chrome APIs for isolated testing

## Tech Stack

- **Build Tool**: Vite 6.0
- **Language**: TypeScript 5.6 (strict mode)
- **Testing**: Vitest 2.1 + happy-dom + fake-indexeddb
- **Storage**: IndexedDB
- **UI**: Side Panel (Chrome API)
- **Export Format**: .ics file (iCalendar) via `ics` package

## Architecture

### Component Flow

```
┌─────────────────────┐
│  Content Script     │  Extracts events from CapEdge DOM
│  (capedge-parser)   │  Detects page & auth state
└──────────┬──────────┘
           │ chrome.runtime.sendMessage()
           ▼
┌─────────────────────┐
│  Service Worker     │  Message router & coordinator
│  (background)       │  Manages database operations
└──────────┬──────────┘
           │
           ├─► IndexedDB (events, preferences)
           │
           └─► Side Panel (broadcast updates)
                    │
                    ▼
           ┌─────────────────────┐
           │  Side Panel UI      │  User interface
           │  - Event filters    │  Event preview
           │  - Download button  │  Status messages
           └─────────────────────┘
```

### Message Types

- `PARSE_PAGE`: Content → Background (send extracted events)
- `PARSING_COMPLETE`: Background → Side panel (notify parsing done)
- `PARSING_ERROR`: Background → Side panel (notify error)
- `GET_EVENTS`: Side panel → Background (request filtered events)
- `DOWNLOAD_ICS`: Side panel → Background (generate .ics file)
- `UPDATE_FILTERS`: Side panel → Background (save filter preferences)

## Implementation Details

### CapEdge Calendar Structure

**Container**: `<div class="calendar-container">`

**Calendar Cell Example**:
```html
<td data-date="2026-02-11">
  <div class="day-num">11</div>
  <a class="data-list-item metadata-item"
     href="/company/1016838/filings"
     data-metadata="Earnings">RDCM</a>
</td>
```

**Event Type Mapping**:
- `data-metadata="Earnings"` → Earnings
- `data-metadata="10-Q"`, `10-K"` → Financial
- `data-metadata="4"`, `"144"`, `"13G"`, `"13D"` → Ownership
- `data-metadata="S-8"`, `"S-1"` → Registration
- `data-metadata="6-K"`, `"8-K"` → News

### IndexedDB Schema

**Database**: `CalendarExtensionDB` (Version 1)

**Store: events**
- Primary Key: `id` (string: `${website}-${date}-${title}`)
- Fields: website, title, date, type, url, metadata, timestamp, month
- Indexes: by-website, by-date, by-type, by-month

**Store: preferences**
- Primary Key: `id` (always "user-preferences")
- Fields: selectedWebsite, eventFilters, lastSync

**Store: metadata**
- Primary Key: `id` (website name)
- Fields: website, lastParsed, monthCached, eventCount

### Build Output

The build process creates a `dist` folder with:

```
dist/
├── background/
│   └── service-worker.js
├── content/
│   └── content-script.js
├── sidepanel/
│   ├── sidepanel.js
│   └── sidepanel.css
├── chunks/              # Shared code chunks
├── icons/               # Extension icons
├── src/sidepanel/
│   └── index.html       # Side panel HTML
└── manifest.json        # Extension manifest
```

## Development Workflow

### Setup
```bash
npm install
```

### Development
```bash
npm run dev      # Watch mode for development
npm test         # Run tests in watch mode
npm test:ui      # Open Vitest UI
```

### Production Build
```bash
npm run build    # Build extension
```

### Load Extension in Chrome
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## User Flow

1. User navigates to CapEdge dashboard (https://capedge.com/user/dashboard)
2. Content script automatically detects page and extracts events
3. User clicks extension icon to open side panel
4. Side panel displays extracted events
5. User filters events by type (optional)
6. User clicks "Download .ics File"
7. Browser downloads `capedge-calendar.ics`
8. User imports .ics file to Google Calendar

## Error Handling

The extension handles several error states:

- **Not on CapEdge dashboard**: Shows message to navigate to dashboard
- **Not authenticated**: Shows message to log in
- **No events found**: Shows "Visit CapEdge dashboard to extract events"
- **All filters disabled**: Download button disabled, shows count as "0 events"
- **Download failed**: Shows error message in side panel

## Future Extensibility

To add support for a new website:

1. Create new parser implementing `CalendarParser` interface
2. Add website option to dropdown in side panel
3. Update manifest `host_permissions`
4. Add `content_scripts` match pattern
5. Add tests for new parser

Example:
```typescript
class AnotherSiteParser implements CalendarParser {
  name = 'AnotherSite';
  canParse(url: string): boolean { /* ... */ }
  parse(document: Document): ParsedEvent[] { /* ... */ }
  detectAuthState(document: Document): AuthState { /* ... */ }
  detectCorrectPage(document: Document): PageState { /* ... */ }
}
```

## Testing Strategy

### TDD Approach

All core functionality was developed using Test-Driven Development:

1. Write failing test
2. Implement minimal code to pass
3. Refactor while keeping tests green

### Test Files

- `tests/unit/utils/date-utils.test.ts` (10 tests)
- `tests/unit/utils/event-mapper.test.ts` (12 tests)
- `tests/unit/parsers/capedge-parser.test.ts` (14 tests)
- `tests/unit/db/database.test.ts` (17 tests)
- `tests/unit/generators/ics-generator.test.ts` (11 tests)

### Fixtures

- `tests/fixtures/capedge-calendar.html`: Sample CapEdge calendar HTML
- `tests/fixtures/mock-events.ts`: Mock event data for testing

## Permissions

The extension requests minimal permissions:

- **activeTab**: Access current tab when extension is clicked
- **storage**: Store user preferences (not used - using IndexedDB instead)
- **sidePanel**: Display side panel UI
- **downloads**: Trigger .ics file download
- **host_permissions**: `https://capedge.com/*` for content script

## Known Issues & Limitations

1. **HTML Path**: Side panel HTML is at `dist/src/sidepanel/index.html` instead of `dist/sidepanel.html` (manifest updated to reflect this)
2. **All-Day Events**: Events are exported as all-day events (no specific time)
3. **Single Website**: Currently only supports CapEdge (extensible for more)
4. **Manual Import**: Requires manual import to Google Calendar

## Performance Considerations

- IndexedDB for efficient local storage
- Event filtering done in-memory after DB query
- Lazy loading of ICS generator module
- Minimal bundle sizes (background: 5.67 KB, content: 2.00 KB, sidepanel: 5.62 KB)

## Security Considerations

- No sensitive data transmitted outside user's machine
- IndexedDB data stays local to browser
- Content script only runs on CapEdge domain
- No external API calls
- .ics files contain only publicly visible CapEdge data

## Chrome Web Store Publishing Plan

### Prerequisites

1. **Developer Account**
   - Register at https://chrome.google.com/webstore/devconsole
   - One-time $5 registration fee
   - Verify email and payment method

2. **Extension Package**
   - Production build: `npm run build`
   - Create ZIP: `cd dist && zip -r ../extension.zip .`
   - Verify manifest.json validity
   - Test in clean Chrome profile

3. **Store Listing Requirements**

   **Text Content:**
   - Extension name: "Calendar to Google Calendar" (max 45 chars)
   - Short description: "Extract calendar events from CapEdge and export to Google Calendar" (max 132 chars)
   - Detailed description: Include features, workflow, supported sites
   - Category: Productivity
   - Language: English

   **Visual Assets:**
   - Screenshots (1280x800 or 640x400):
     - Screenshot 1: Side panel with events displayed
     - Screenshot 2: Event filtering options
     - Screenshot 3: Downloaded .ics file in Google Calendar
   - Icon: 128x128 (already created)
   - Small promotional tile: 440x280 (optional but recommended)
   - Large promotional tile: 920x680 (optional)

   **Privacy & Legal:**
   - Privacy policy (if collecting data) - Currently not needed as no data collection
   - Terms of service (optional)

4. **Testing Checklist**
   - [ ] Test on clean Chrome profile
   - [ ] Verify all permissions are justified and minimal
   - [ ] Check console for errors (content script, service worker, side panel)
   - [ ] Test on different screen resolutions
   - [ ] Verify icon displays correctly at all sizes
   - [ ] Test complete user workflow end-to-end
   - [ ] Ensure compliance with Chrome Web Store policies

### Publishing Process

1. **Prepare Package**
   ```bash
   npm run build
   cd dist
   zip -r ../calendar-to-google-calendar-v1.0.0.zip .
   cd ..
   ```

2. **Create Developer Account**
   - Go to Chrome Web Store Developer Dashboard
   - Pay $5 registration fee
   - Complete account setup

3. **Upload Extension**
   - Click "New Item" in developer dashboard
   - Upload `calendar-to-google-calendar-v1.0.0.zip`
   - Fill in all store listing fields
   - Upload screenshots and promotional images
   - Set pricing: Free
   - Select distribution: Public

4. **Submit for Review**
   - Review all information for accuracy
   - Accept developer agreement
   - Click "Submit for Review"
   - Typical review time: 1-3 days

5. **Post-Approval**
   - Extension automatically goes live after approval
   - Monitor initial user feedback
   - Set up analytics (optional)
   - Plan update schedule

### Maintenance Plan

**Version Updates:**
- Bug fixes: Patch versions (1.0.x)
- New features: Minor versions (1.x.0)
- Major changes: Major versions (x.0.0)

**Support Channels:**
- GitHub Issues for bug reports
- Chrome Web Store reviews for user feedback
- Email support (if needed)

**Future Enhancements:**
- Add support for additional financial websites
- Direct Google Calendar API integration
- Automatic sync feature
- Event notifications

### Store Policy Compliance

**Permissions Justification:**
- `activeTab`: Access current tab to extract calendar events
- `storage`: Store user filter preferences locally
- `sidePanel`: Display extension UI in side panel
- `downloads`: Download .ics file to user's computer
- `host_permissions`: Access CapEdge.com to parse calendar

**Data Privacy:**
- No user data collected or transmitted
- All data processing happens locally in browser
- No external API calls except CapEdge.com
- IndexedDB used only for local storage

**Single Purpose:**
- Clear, focused purpose: Extract calendar events and export to .ics format
- All features directly support this core functionality

## References

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [iCalendar Format](https://www.npmjs.com/package/ics)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
