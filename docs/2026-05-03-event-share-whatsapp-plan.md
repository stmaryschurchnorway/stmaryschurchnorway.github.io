# WhatsApp Event Sharing Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Share on WhatsApp" button to event cards that opens WhatsApp with a pre-filled message containing full event details and a calendar link.

**Architecture:** Single-file modification to `_includes/upcoming-events.html`. Add a helper function to format the WhatsApp message (title, date/time, location, description, calendar link with emojis), then add the button to the `buildCard()` function and attach a click handler that opens the WhatsApp Web Intent API.

**Tech Stack:** Vanilla JavaScript, WhatsApp Web Intent API (no SDK needed)

---

### Task 1: Add WhatsApp message formatter function

**Files:**
- Modify: `_includes/upcoming-events.html` (after line 87, before `showEmpty()`)

- [ ] **Step 1: Add formatWhatsAppMessage helper function**

After the `truncate()` function (around line 87), add this new helper function:

```javascript
  function formatWhatsAppMessage(ev) {
    var isAllDay = !ev.start.dateTime;
    var startIso = ev.start.dateTime || ev.start.date;
    var dt = new Date(startIso);
    
    var dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
    var dateStr = dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    var timeStr = isAllDay ? '' : dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    var dateTime = timeStr ? dayName + ', ' + dateStr + ' at ' + timeStr : dayName + ', ' + dateStr;
    
    var description = htmlToPlainText(ev.description);
    description = truncate(description, 200);
    
    var location = ev.location || '(No location specified)';
    var calendarUrl = 'https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(calId);
    
    var message = '📅 ' + (ev.summary || 'Untitled Event') + '\n';
    message += '🕐 ' + dateTime + '\n';
    message += '📍 ' + location + '\n\n';
    if (description) {
      message += description + '\n\n';
    }
    message += '🔗 ' + calendarUrl;
    
    return message;
  }
```

- [ ] **Step 2: Verify syntax**

Check that the function is properly indented and closes correctly. The function should be inserted between the `truncate()` function (line ~87) and the `showEmpty()` function (line ~89).

- [ ] **Step 3: Commit**

```bash
git add _includes/upcoming-events.html
git commit -m "feat: add WhatsApp message formatter function for events"
```

---

### Task 2: Add "Share on WhatsApp" button to buildCard function

**Files:**
- Modify: `_includes/upcoming-events.html` (line ~140, in the `buildCard()` function)

- [ ] **Step 1: Locate the button insertion point**

Find the line in `buildCard()` that adds the "+ Add to Calendar" button (around line 140):

```javascript
    card.appendChild(el('span', 'event-add-cal', '+ Add to Calendar'));
```

- [ ] **Step 2: Add the WhatsApp share button after it**

Add this line immediately after the "+ Add to Calendar" button:

```javascript
    var shareBtn = el('span', 'event-share-whatsapp', 'Share on WhatsApp');
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.marginLeft = '12px';
    card.appendChild(shareBtn);
```

The full section should now look like:

```javascript
    card.appendChild(dateBox);
    card.appendChild(body);
    card.appendChild(el('span', 'event-add-cal', '+ Add to Calendar'));
    
    var shareBtn = el('span', 'event-share-whatsapp', 'Share on WhatsApp');
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.marginLeft = '12px';
    card.appendChild(shareBtn);
    return card;
```

- [ ] **Step 3: Verify the button is added**

Check that the button element is created and appended to the card, and that the return statement comes after both buttons.

- [ ] **Step 4: Commit**

```bash
git add _includes/upcoming-events.html
git commit -m "feat: add Share on WhatsApp button to event cards"
```

---

### Task 3: Add click handler to open WhatsApp with pre-filled message

**Files:**
- Modify: `_includes/upcoming-events.html` (in the `buildCard()` function, after the shareBtn creation)

- [ ] **Step 1: Add click handler to the share button**

After creating the `shareBtn` element (from Task 2), add the click handler:

```javascript
    shareBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var message = formatWhatsAppMessage(ev);
      var encodedMessage = encodeURIComponent(message);
      var whatsappUrl = 'https://wa.me/?text=' + encodedMessage;
      window.open(whatsappUrl, '_blank', 'noopener');
    });
```

The full button section should now look like:

```javascript
    var shareBtn = el('span', 'event-share-whatsapp', 'Share on WhatsApp');
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.marginLeft = '12px';
    shareBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var message = formatWhatsAppMessage(ev);
      var encodedMessage = encodeURIComponent(message);
      var whatsappUrl = 'https://wa.me/?text=' + encodedMessage;
      window.open(whatsappUrl, '_blank', 'noopener');
    });
    card.appendChild(shareBtn);
```

- [ ] **Step 2: Verify the event handler is attached**

Check that the click handler is properly indented and inside the `addEventListener` call, and that it accesses the `ev` object (which is in scope from the `buildCard()` function parameter).

- [ ] **Step 3: Commit**

```bash
git add _includes/upcoming-events.html
git commit -m "feat: add WhatsApp share click handler with pre-filled message"
```

---

### Task 4: Test on desktop and mobile

**Files:**
- Test: Manual testing (no automated tests needed for this feature)

- [ ] **Step 1: Start the Jekyll dev server**

```bash
cd /Users/t888651/repos-telenor/church
bundle exec jekyll serve --livereload
```

Expected: Server starts on `http://localhost:4000`

- [ ] **Step 2: Open homepage in desktop browser**

Navigate to `http://localhost:4000/` and scroll to the "Upcoming Events" section.

- [ ] **Step 3: Test desktop WhatsApp share**

Click the "Share on WhatsApp" button on any event card. Expected:
- New tab/window opens
- If logged into WhatsApp Web: WhatsApp Web opens with pre-filled message
- If not logged in: Redirected to install/login page or WhatsApp download page
- Message includes: event title, date/time, location, description (truncated), calendar link
- Message uses emojis (📅, 🕐, 📍, 🔗)

- [ ] **Step 4: Test mobile view (Chrome DevTools)**

Open DevTools → Toggle device toolbar → Select iPhone 12 or similar.

- [ ] **Step 5: Test mobile WhatsApp share**

Click the "Share on WhatsApp" button on an event card. Expected:
- Opens WhatsApp mobile app (if installed)
- If not installed: Shows install prompt or opens WhatsApp Web
- Pre-filled message appears with all event details

- [ ] **Step 6: Verify message content on a few events**

Test with 2-3 different events to ensure:
- Title renders correctly
- Date and time format correctly (including all-day events)
- Location displays (or shows "(No location specified)" if missing)
- Description truncates at ~200 chars without cutting words mid-word
- Calendar link is present and clickable in WhatsApp

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: manual testing of WhatsApp share feature on desktop and mobile"
```

---

### Task 5: Add CSS styling for the WhatsApp button (optional polish)

**Files:**
- Modify: `assets/css/style.css` (optional, for visual consistency)

- [ ] **Step 1: Check existing "+ Add to Calendar" button styling**

Search `assets/css/style.css` for `.event-add-cal` to see how the existing button is styled.

- [ ] **Step 2: Add styling for `.event-share-whatsapp`**

Add this CSS rule near the `.event-add-cal` styling (around line 1330 or wherever `.event-add-cal` is defined):

```css
.event-share-whatsapp {
  display: inline-block;
  color: #25D366;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s, opacity 0.2s;
  margin-left: 12px;
}

.event-share-whatsapp:hover {
  color: #128C7E;
  opacity: 0.85;
}
```

- [ ] **Step 3: Remove inline styles from JavaScript**

Update the `buildCard()` function to remove the inline `style` attributes from the shareBtn creation:

Change from:
```javascript
    var shareBtn = el('span', 'event-share-whatsapp', 'Share on WhatsApp');
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.marginLeft = '12px';
```

To:
```javascript
    var shareBtn = el('span', 'event-share-whatsapp', 'Share on WhatsApp');
```

- [ ] **Step 4: Test styling**

Refresh `http://localhost:4000/` and verify:
- Button appears in WhatsApp green (#25D366)
- Hover state changes to darker green (#128C7E)
- Proper spacing between "+ Add to Calendar" and "Share on WhatsApp" buttons

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css _includes/upcoming-events.html
git commit -m "style: add WhatsApp share button styling with hover effects"
```

---

### Task 6: Final verification and push

**Files:**
- No new files, only modifications

- [ ] **Step 1: Run git status to verify all changes are committed**

```bash
git status
```

Expected: Clean working tree, no uncommitted changes.

- [ ] **Step 2: View commit log**

```bash
git log --oneline -5
```

Expected: 5 recent commits including:
- "feat: add WhatsApp message formatter function for events"
- "feat: add Share on WhatsApp button to event cards"
- "feat: add WhatsApp share click handler with pre-filled message"
- "test: manual testing of WhatsApp share feature on desktop and mobile"
- "style: add WhatsApp share button styling with hover effects"

- [ ] **Step 3: Push to remote**

```bash
git push origin main
```

Expected: All commits pushed successfully.

- [ ] **Step 4: Verify on live site**

Once pushed, visit `https://stmarysmsoc.no/` and scroll to "Upcoming Events". Click "Share on WhatsApp" on any event and verify:
- Opens WhatsApp with pre-filled message
- Message contains all event details
- Button styling matches desktop/mobile designs
