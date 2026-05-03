# Event Share on WhatsApp — Design

**Date:** 2026-05-03  
**Scope:** Add WhatsApp sharing button to upcoming event cards to enable community members to invite friends and family.

## Goal

Enable users to easily share upcoming church events with friends and family via WhatsApp. One-click sharing with pre-filled event details + calendar link, no configuration or customization needed.

## User Flow

1. User views an upcoming event card on the homepage or events page
2. Clicks "Share on WhatsApp" button (placed next to "+ Add to Calendar")
3. WhatsApp opens (app on mobile, web on desktop) with pre-filled message
4. User selects a contact or group in WhatsApp
5. Message is sent with full event details

## UI Changes

### Event Card Footer Layout

Current footer:
```
[+ Add to Calendar]
```

New footer:
```
[+ Add to Calendar]  [Share on WhatsApp]
```

**Button styling:**
- Text button matching "+ Add to Calendar" style
- Consistent spacing and hover effects
- WhatsApp green hover state (#25D366) optional for visual context
- Responsive: stacks vertically on mobile if needed

**Placement:** Next to "+ Add to Calendar" button at bottom right of event card.

## Message Format

When user clicks "Share on WhatsApp," a pre-formatted message opens with:

```
📅 [Event Title]
🕐 [Day, Date & Time]  
📍 [Location]

[Description - first 200 characters]

🔗 [Calendar Link]
```

### Message Data Extraction

From each Google Calendar event object:
- **Title:** `event.summary`
- **Date/Time:** `event.start.dateTime` or `event.start.date` (formatted: "Friday, May 22, 2026 at 18:00")
- **Location:** `event.location`
- **Description:** `event.description` (HTML-stripped, truncated to 200 chars)
- **Calendar Link:** `https://calendar.google.com/calendar/r?cid=[calendarId]`

### Example Message

```
📅 Annual Summer Trip & Holy Qurbana
🕐 Friday, May 22, 2026 at 18:00
📍 Solstua, Lifjellyevegen 886, 3804 Bø i Telemark, Norway

Annual Summer Trip & Holy Qurbana 2026
Every year, our church community eagerly looks forward to the Annual Summer Trip, a special time of...

🔗 https://calendar.google.com/calendar/r?cid=stmaryschurchnorway@gmail.com
```

## Technical Implementation

### API & Integration

**WhatsApp Web Intent:**
```javascript
const message = encodeURIComponent(formattedMessage);
const whatsappUrl = `https://wa.me/?text=${message}`;
window.open(whatsappUrl, '_blank');
```

- No SDK required—standard WhatsApp Web Intent API
- Works on all devices: mobile (opens WhatsApp app), desktop (opens WhatsApp Web)
- WhatsApp handles platform-specific routing and fallback

### Code Changes

**File:** `_includes/upcoming-events.html`

- Modify `buildCard(ev)` function to include a new "Share on WhatsApp" button
- Add helper function `formatWhatsAppMessage(event)` to format message with emojis and details
- Attach click handler that encodes message and opens WhatsApp Intent URL

### Message Formatting Logic

1. Extract event data (title, date/time, location, description)
2. Strip HTML from description using existing `htmlToPlainText()` function
3. Truncate description to 200 characters (similar to existing `truncate()` function)
4. Construct message with emoji prefixes
5. URL-encode message for web intent

## Error Handling & Fallback

- **If WhatsApp not installed:** Browser/OS shows standard "app not available" dialog; user is offered option to install or use WhatsApp Web
- **If message too long:** WhatsApp has a ~4096 character limit; our truncation and format ensure we stay well below this
- **If location missing:** Message template still works; location line is omitted if `event.location` is empty
- **If description missing:** Message still works; description paragraph is omitted if `event.description` is empty

## No Breaking Changes

- Existing "+ Add to Calendar" button unchanged
- Event data structures unchanged
- No new dependencies, no API keys required
- Fully backward compatible

## Scope Exclusions (Out of Scope)

- Share to other platforms (Facebook, Twitter, email, SMS)
- Message customization modal or preview
- Share count tracking or analytics
- Event RSVP functionality via WhatsApp
- Share to WhatsApp Business API

## Testing Checklist

- [ ] Button renders correctly on desktop and mobile
- [ ] Button clicks open WhatsApp (web or app depending on platform)
- [ ] Message contains all event details (title, date/time, location, description, calendar link)
- [ ] Message is properly formatted with emojis and line breaks
- [ ] Description is truncated at 200 chars without cutting words
- [ ] HTML in description is stripped before sending
- [ ] Works with events missing location or description
- [ ] Message URL-encoding handles special characters correctly
- [ ] Button responsive behavior on mobile (layout doesn't break)
- [ ] Hover/focus states match "+ Add to Calendar" button

## Success Criteria

✓ Users can share events with one click  
✓ WhatsApp message includes full event context (title, date, location, description, calendar link)  
✓ No friction—button click directly opens WhatsApp with pre-filled message  
✓ Works on all devices (mobile app preferred, desktop web fallback)  
✓ No new dependencies or configuration required  
