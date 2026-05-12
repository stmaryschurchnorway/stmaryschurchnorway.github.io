---
layout: default
title: "Live Scores — Summer Trip 2026"
extra_css:
  - /assets/css/summer-trip.css
  - /assets/css/summer-trip-scores.css
---

<!-- ═══════════ HERO ═══════════ -->
<section class="st-hero st-hero-mini" id="top" style="background-image: url('{{ '/assets/img/summer-trip-hero.png' | relative_url }}'); background-size: cover; background-position: 75% center;">
  <div class="st-hero-content">
    <span class="st-hero-label"><a href="{{ '/summer-trip-2026/' | relative_url }}" style="color: inherit; text-decoration: none;">&larr; Back to Trip</a></span>
    <h1 class="st-hero-title">Live Scores</h1>
    <p class="st-hero-tagline">Every moment counts. Every point matters.</p>
  </div>
</section>

<!-- ═══════════ LEADERBOARD ═══════════ -->
<section class="sc-section sc-section-white" id="leaderboard">
  <div class="sc-section-inner">
    <span class="sc-section-label">Leaderboard</span>
    <h2 class="sc-section-title">Team Rankings</h2>
    <p class="sc-section-desc">Scores update automatically. Keep watching!</p>

    <div class="sc-podium" id="podium">
      <!-- JS fills this -->
    </div>

    <div class="sc-last-updated">
      Last updated: <span id="last-updated">--</span>
    </div>

    <button class="sc-fullscreen-btn" id="fullscreen-btn">&#x26F6; Fullscreen</button>
  </div>
</section>

<!-- ═══════════ DETAILED SCORES ═══════════ -->
<section class="sc-section sc-section-ocean" id="details">
  <div class="sc-section-inner">
    <span class="sc-section-label">Activity Breakdown</span>
    <h2 class="sc-section-title">Score Details</h2>
    <p class="sc-section-desc">See how each team performed across every activity.</p>

    <div class="sc-table-wrap">
      <table class="sc-table" id="score-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th class="sc-activity-col">Treasure Hunt</th>
            <th class="sc-activity-col">Quiz</th>
            <th class="sc-activity-col">Photo Contest</th>
            <th class="sc-activity-col">Presentation</th>
            <th class="sc-total-col">Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- JS fills this -->
        </tbody>
      </table>
    </div>

    <div class="sc-no-data" id="no-data" style="display: none;">
      <p>&#9203; Scores haven&rsquo;t been published yet. Check back soon!</p>
    </div>
  </div>
</section>

<!-- ═══════════ SCRIPTS ═══════════ -->
<script>
(function() {
  // REPLACE with your published Google Sheet CSV URL
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTI7H-c8oUB9fFUSlorzRUURwjuTJsnx6uV4lS4EG6iM7KmAqgxPRZmyj4w39GZwvqLyaxev5iRe6VY/pub?gid=0&single=true&output=csv';

  var TEAM_MEDALS = ['🥇', '🥈', '🥉', ''];
  var TEAM_BG    = ['#ffd700', '#c0c0c0', '#cd7f32', '#e0f0ff'];
  var TEAM_FG    = ['#1a2a3a', '#1a2a3a', '#ffffff', '#1a2a3a'];

  var DEMO_DATA = [
    { team: 'Team Alpha',   scores: [85, 72, 90, 78], total: 325 },
    { team: 'Team Bethel',  scores: [70, 88, 65, 92], total: 315 },
    { team: 'Team Calvary', scores: [92, 65, 80, 70], total: 307 },
    { team: 'Team David',   scores: [60, 80, 75, 85], total: 300 }
  ];

  function parseCSV(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    var teams = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(',');
      if (cols.length < 2) continue;
      var teamName = cols[0].trim();
      var scores = [];
      var total = 0;
      for (var j = 1; j < cols.length; j++) {
        var val = parseInt(cols[j].trim()) || 0;
        scores.push(val);
        total += val;
      }
      teams.push({ team: teamName, scores: scores, total: total });
    }
    return teams;
  }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function renderPodium(teams) {
    var podium = document.getElementById('podium');
    clearChildren(podium);
    teams.forEach(function(t, i) {
      var card = el('div', 'sc-podium-card' + (i === 0 ? ' sc-podium-first' : ''));

      var rank = el('div', 'sc-podium-rank', TEAM_MEDALS[i] || '#' + (i + 1));
      rank.style.background = TEAM_BG[i] || TEAM_BG[3];
      rank.style.color = TEAM_FG[i] || TEAM_FG[3];
      card.appendChild(rank);

      card.appendChild(el('div', 'sc-podium-name', t.team));
      card.appendChild(el('div', 'sc-podium-score', String(t.total)));
      card.appendChild(el('div', 'sc-podium-label', 'points'));
      podium.appendChild(card);
    });
  }

  function renderTable(teams) {
    var tbody = document.querySelector('#score-table tbody');
    clearChildren(tbody);
    teams.forEach(function(t, i) {
      var tr = el('tr', i === 0 ? 'sc-row-leader' : '');
      tr.appendChild(el('td', 'sc-rank-cell', String(i + 1)));
      tr.appendChild(el('td', 'sc-team-cell', t.team));
      t.scores.forEach(function(s) {
        tr.appendChild(el('td', 'sc-score-cell', String(s)));
      });
      tr.appendChild(el('td', 'sc-total-cell', String(t.total)));
      tbody.appendChild(tr);
    });
  }

  function render(teams) {
    var noData = document.getElementById('no-data');
    if (!teams || teams.length === 0) {
      noData.style.display = 'block';
      return;
    }
    noData.style.display = 'none';
    teams.sort(function(a, b) { return b.total - a.total; });
    renderPodium(teams);
    renderTable(teams);
    document.getElementById('last-updated').textContent =
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function fetchScores() {
    if (!SHEET_URL) {
      render(DEMO_DATA);
      return;
    }
    fetch(SHEET_URL)
      .then(function(r) { return r.text(); })
      .then(function(csv) { render(parseCSV(csv)); })
      .catch(function() { render(DEMO_DATA); });
  }

  fetchScores();
  setInterval(fetchScores, 30000);

  // Fullscreen toggle
  var fsBtn = document.getElementById('fullscreen-btn');
  fsBtn.addEventListener('click', function() {
    var active = document.body.classList.toggle('sc-fullscreen-active');
    fsBtn.textContent = active ? '✕ Exit Fullscreen' : '⛶ Fullscreen';
    if (active && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function() {});
    } else if (!active && document.exitFullscreen) {
      document.exitFullscreen().catch(function() {});
    }
  });
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      document.body.classList.remove('sc-fullscreen-active');
      fsBtn.textContent = '⛶ Fullscreen';
    }
  });
})();
</script>
