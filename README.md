# Calendar to Google Calendar - Chrome Extension

A Chrome extension that extracts calendar events from CapEdge dashboard and exports them to Google Calendar via .ics file format.

## Features

- **Automatic Event Extraction**: Automatically detects and extracts calendar events from CapEdge dashboard
- **Event Type Filtering**: Filter events by type (Earnings, Financial, Ownership, Registration, News)
- **Google Calendar Import**: Downloads events as .ics file format for easy import into Google Calendar
- **Side Panel UI**: Clean, intuitive interface in Chrome's side panel
- **Persistent Storage**: Saves events and preferences locally using IndexedDB
- **Event Preview**: View all extracted events before downloading

## Supported Event Types

- **Earnings**: Company earnings reports
- **Financial**: 10-K, 10-Q filings
- **Ownership**: Form 4, 13G, 13D, 144 filings
- **Registration**: S-8, S-1 filings
- **News**: 6-K, 8-K filings

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Chrome Browser**: Version 114 or higher (for Side Panel API support)
- **CapEdge Account**: Active account at https://capedge.com

## Installation

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ManuelBv/to-google-calendar.git
   cd to-google-calendar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

### Production Build

For a production-ready build:

```bash
npm run build
```

The built extension will be in the `dist` folder.

## Usage

### Complete Workflow

#### Step 1: Extract Events from CapEdge

1. **Log in to CapEdge**
   - Navigate to https://capedge.com and log in to your account
   - Go to your dashboard at https://capedge.com/user/dashboard

2. **Open the Extension**
   - Click the Calendar Export extension icon in your Chrome toolbar
   - The side panel will open automatically on the right side

3. **Automatic Event Detection**
   - The extension automatically detects the calendar and extracts events
   - If the calendar is loading slowly, it will retry automatically (up to 5 times)
   - You'll see the event count update (e.g., "5 events")

4. **Review and Filter Events**
   - All extracted events are displayed in the side panel with:
     - Event title (e.g., "RDCM", "GILT")
     - Date (e.g., "2026-02-11")
     - Type badge (Earnings, Financial, Ownership, Registration, News)
   - Use the checkboxes to filter which event types to export:
     - ✓ **Earnings** (default: ON) - Company earnings reports
     - ✓ **Financial** (default: ON) - 10-K, 10-Q filings
     - ☐ **Ownership** (default: OFF) - Form 4, 13G, 13D, 144
     - ☐ **Registration** (default: OFF) - S-8, S-1 filings
     - ☐ **News** (default: OFF) - 6-K, 8-K filings
   - The event list and count update immediately when you change filters

5. **Download .ics File**
   - Click the **"⬇️ Download .ics File"** button
   - Your browser will download `capedge-calendar.ics`
   - A success message appears: "✅ ICS file downloaded successfully!"

#### Step 2: Import to Google Calendar

1. **Open Google Calendar**
   - Go to https://calendar.google.com
   - Make sure you're logged in to the correct Google account

2. **Access Import Settings**
   - Click the **gear icon** (⚙️) in the top-right corner
   - Select **"Settings"** from the dropdown menu
   - In the left sidebar, click **"Import & export"**

3. **Import the .ics File**
   - Click **"Select file from your computer"**
   - Choose the downloaded `capedge-calendar.ics` file
   - Select which Google Calendar to add the events to
   - Click **"Import"**

4. **Verify Import**
   - Google Calendar will show a confirmation: "Imported X events"
   - Navigate to the dates in your calendar to see the events
   - Events will show as:
     - Title: "COMPANY_SYMBOL - EVENT_TYPE" (e.g., "RDCM - Earnings")
     - Date: All-day event on the specified date
     - Description: Contains event type, metadata, and link to CapEdge filing

### Tips

- **Refresh Events**: If the calendar doesn't load immediately, wait a few seconds for the automatic retry
- **Multiple Imports**: You can import multiple times; Google Calendar will merge duplicate events
- **Filter Before Export**: Adjust filters before downloading to only get the events you want
- **Re-import**: If you change your filters, download a new .ics file and import again

## Development

### Available Scripts

- **`npm run dev`**: Start development server with watch mode
- **`npm run build`**: Build the extension for production
- **`npm test`**: Run tests in watch mode
- **`npm test:ui`**: Run tests with Vitest UI
- **`npm test:coverage`**: Generate test coverage report
- **`npm run type-check`**: Run TypeScript type checking

### Project Structure

```
src/
├── background/              # Service worker
│   └── service-worker.ts
├── content/                 # Content scripts
│   ├── content-script.ts
│   └── parsers/
│       ├── parser-interface.ts
│       └── capedge-parser.ts
├── sidepanel/              # Side panel UI
│   ├── index.html
│   ├── sidepanel.ts
│   └── styles/
│       └── sidepanel.css
├── shared/                 # Shared utilities
│   ├── types/             # TypeScript type definitions
│   ├── db/                # IndexedDB wrapper
│   ├── generators/        # ICS file generator
│   ├── utils/             # Utility functions
│   └── constants.ts
└── manifest.json          # Extension manifest

tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
├── fixtures/              # Test fixtures
└── setup/                 # Test configuration
```

### Architecture

The extension uses a message-passing architecture:

```
Content Script (CapEdge Page)
      ↓
Service Worker (Background)
      ↓
IndexedDB Storage
      ↓
Side Panel UI
```

1. **Content Script**: Runs on CapEdge dashboard, extracts events from DOM
2. **Service Worker**: Coordinates message passing, stores events in IndexedDB
3. **Side Panel**: Displays events, allows filtering, triggers ICS download

### Testing

The project uses Test-Driven Development (TDD) with Vitest:

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **Coverage Target**: 80%+ overall coverage

Run tests:
```bash
npm test
```

Generate coverage report:
```bash
npm test:coverage
```

### Tech Stack

- **Build Tool**: Vite
- **Language**: TypeScript
- **Testing**: Vitest + happy-dom + fake-indexeddb
- **Storage**: IndexedDB
- **Calendar Format**: .ics (iCalendar) via `ics` package
- **Chrome APIs**: Manifest V3 (Side Panel, Content Scripts, Service Worker)

## Adding Support for New Websites

The extension is designed to be extensible. To add support for a new website:

1. **Create a new parser**:
   ```typescript
   // src/content/parsers/newsite-parser.ts
   export class NewSiteParser implements CalendarParser {
     name = 'NewSite';
     canParse(url: string): boolean { /* ... */ }
     parse(document: Document): ParsedEvent[] { /* ... */ }
     // ... implement other methods
   }
   ```

2. **Register the parser** in content script

3. **Update manifest.json** with new host_permissions and content_scripts

4. **Add tests** for the new parser

## Known Limitations

- Only supports CapEdge currently (extensible to other sites)
- Requires manual import to Google Calendar
- Events are exported as all-day events
- Requires user to be logged in to CapEdge

## Troubleshooting

### Extension Not Detecting Events

- Ensure you're on the CapEdge dashboard page (`/user/dashboard`)
- Verify you're logged in to CapEdge
- Check the browser console for errors
- Try refreshing the page

### .ics File Not Downloading

- Check Chrome's download settings
- Ensure the "Downloads" permission is enabled
- Verify events are visible in the side panel preview

### Events Not Importing to Google Calendar

- Ensure the .ics file downloaded successfully
- Check the file is not empty (should contain calendar events)
- Try importing to a different calendar
- Verify the event dates are valid

## Publishing to Chrome Web Store

### Future Plans

This extension is planned for publication on the Chrome Web Store. Publishing checklist:

#### Pre-Publication Requirements

1. **Chrome Web Store Developer Account**
   - One-time $5 registration fee
   - Register at https://chrome.google.com/webstore/devconsole

2. **Extension Package**
   - Build production version: `npm run build`
   - Create ZIP file of `dist` folder
   - Ensure manifest.json is valid

3. **Store Listing Assets**
   - [ ] Extension description (132 characters max for summary)
   - [ ] Detailed description with features and benefits
   - [ ] Screenshots (1280x800 or 640x400)
     - Side panel with events displayed
     - Filter options
     - Google Calendar import result
   - [ ] Promotional images (optional)
     - Small tile: 440x280
     - Large tile: 920x680
   - [ ] Category: Productivity
   - [ ] Privacy policy URL (if collecting user data)

4. **Testing & Review**
   - [ ] Test on clean Chrome profile
   - [ ] Verify all permissions are necessary
   - [ ] Test on different screen sizes
   - [ ] Ensure no console errors
   - [ ] Review Chrome Web Store policies

#### Publication Steps

1. **Prepare Package**
   ```bash
   npm run build
   cd dist
   zip -r ../extension.zip .
   ```

2. **Upload to Chrome Web Store**
   - Go to Developer Dashboard
   - Click "New Item"
   - Upload extension.zip
   - Fill in store listing details
   - Set pricing (free)
   - Submit for review

3. **Review Process**
   - Typically takes a few days
   - May require changes based on reviewer feedback
   - Once approved, extension goes live automatically

#### Post-Publication

- Monitor user reviews and ratings
- Respond to user feedback
- Plan updates for bug fixes and new features
- Consider adding support for additional financial websites

### Version History

- **v1.0.0** (Current) - Initial release with CapEdge support

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

ISC

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/ManuelBv/to-google-calendar/issues) page.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Uses [ics](https://www.npmjs.com/package/ics) for calendar file generation
- Tested with [Vitest](https://vitest.dev/)
