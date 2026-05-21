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

<!-- ═══════════ WINNER OVERLAY ═══════════ -->
<div class="sc-winner-overlay" id="winner-overlay">
  <canvas class="sc-confetti-canvas" id="confetti-canvas"></canvas>
  <div class="sc-winner-content" id="winner-content">
    <div class="sc-winner-prelude" id="winner-prelude">And the winner is&hellip;</div>
    <div class="sc-winner-line" id="winner-line"></div>
    <div class="sc-winner-trophy" id="winner-trophy">🏆</div>
    <div class="sc-winner-name" id="winner-name"></div>
    <div class="sc-winner-points" id="winner-points"></div>
    <div class="sc-winner-points-label" id="winner-points-label">points</div>
  </div>
</div>

<!-- ═══════════ SCRIPTS ═══════════ -->
<script>
(function() {
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTI7H-c8oUB9fFUSlorzRUURwjuTJsnx6uV4lS4EG6iM7KmAqgxPRZmyj4w39GZwvqLyaxev5iRe6VY/pub?gid=0&single=true&output=csv';

  var TEAM_BG    = ['#e0f0ff', '#e0f0ff', '#e0f0ff', '#e0f0ff', '#e0f0ff'];
  var TEAM_FG    = ['#1a2a3a', '#1a2a3a', '#1a2a3a', '#1a2a3a', '#1a2a3a'];

  var DEMO_DATA = [
    { team: 'Team Alpha',   scores: [85, 72, 90, 78], total: 325, winner: false },
    { team: 'Team Bethel',  scores: [70, 88, 65, 92], total: 315, winner: false },
    { team: 'Team Calvary', scores: [92, 65, 80, 70], total: 307, winner: false },
    { team: 'Team David',   scores: [60, 80, 75, 85], total: 300, winner: false }
  ];

  var winnerAnimationPlayed = false;

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
      var isWinner = false;
      for (var j = 1; j < cols.length; j++) {
        var raw = cols[j].trim().toUpperCase();
        if (raw === 'YES') {
          isWinner = true;
        } else {
          var val = parseInt(raw) || 0;
          scores.push(val);
          total += val;
        }
      }
      teams.push({ team: teamName, scores: scores, total: total, winner: isWinner });
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
      var cls = 'sc-podium-card' + (t.winner ? ' sc-podium-winner' : '');
      var card = el('div', cls);

      var rank = el('div', 'sc-podium-rank', '#' + (i + 1));
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
      var tr = el('tr', t.winner ? 'sc-row-winner' : '');
      tr.appendChild(el('td', 'sc-rank-cell', String(i + 1)));
      tr.appendChild(el('td', 'sc-team-cell', t.team));
      t.scores.forEach(function(s) {
        tr.appendChild(el('td', 'sc-score-cell', String(s)));
      });
      tr.appendChild(el('td', 'sc-total-cell', String(t.total)));
      tbody.appendChild(tr);
    });
  }

  // --- Confetti engine ---
  function startConfetti(canvas, duration) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width = window.innerWidth;
    var H = canvas.height = window.innerHeight;
    var particles = [];
    var colors = ['#f0c050', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#fff', '#c0c0c0'];

    for (var i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }

    var start = Date.now();
    var fadeStart = duration - 1500;

    function frame() {
      var elapsed = Date.now() - start;
      if (elapsed > duration) { ctx.clearRect(0, 0, W, H); return; }

      ctx.clearRect(0, 0, W, H);
      var globalFade = elapsed > fadeStart ? 1 - (elapsed - fadeStart) / 1500 : 1;

      particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vy += 0.05;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; p.vy = Math.random() * 3 + 2; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.opacity * globalFade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // --- Winner animation ---
  function playWinnerAnimation(team) {
    var overlay = document.getElementById('winner-overlay');
    var prelude = document.getElementById('winner-prelude');
    var line = document.getElementById('winner-line');
    var trophy = document.getElementById('winner-trophy');
    var nameEl = document.getElementById('winner-name');
    var pointsEl = document.getElementById('winner-points');
    var pointsLabel = document.getElementById('winner-points-label');
    var canvas = document.getElementById('confetti-canvas');

    nameEl.textContent = team.team;
    pointsEl.textContent = String(team.total);

    overlay.classList.add('sc-winner-visible');

    setTimeout(function() { prelude.classList.add('sc-winner-show'); }, 1500);
    setTimeout(function() { line.classList.add('sc-winner-show'); }, 4000);
    setTimeout(function() {
      trophy.classList.add('sc-winner-show');
      nameEl.classList.add('sc-winner-show');
    }, 6000);
    setTimeout(function() {
      pointsEl.classList.add('sc-winner-show');
      pointsLabel.classList.add('sc-winner-show');
      startConfetti(canvas, 8000);
    }, 7500);

    setTimeout(function() {
      overlay.classList.add('sc-winner-fadeout');
    }, 14000);
    setTimeout(function() {
      overlay.classList.remove('sc-winner-visible', 'sc-winner-fadeout');
      prelude.classList.remove('sc-winner-show');
      line.classList.remove('sc-winner-show');
      trophy.classList.remove('sc-winner-show');
      nameEl.classList.remove('sc-winner-show');
      pointsEl.classList.remove('sc-winner-show');
      pointsLabel.classList.remove('sc-winner-show');
    }, 15500);
  }

  function render(teams) {
    var noData = document.getElementById('no-data');
    if (!teams || teams.length === 0) {
      noData.style.display = 'block';
      return;
    }
    noData.style.display = 'none';
    renderPodium(teams);
    renderTable(teams);
    document.getElementById('last-updated').textContent =
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    if (!winnerAnimationPlayed) {
      var winner = null;
      teams.forEach(function(t) { if (t.winner) winner = t; });
      if (winner) {
        winnerAnimationPlayed = true;
        playWinnerAnimation(winner);
      }
    }
  }

  function fetchScores() {
    if (!SHEET_URL) {
      render(DEMO_DATA);
      return;
    }
    fetch(SHEET_URL + '&_t=' + Date.now(), { cache: 'no-store' })
      .then(function(r) { return r.text(); })
      .then(function(csv) { render(parseCSV(csv)); })
      .catch(function() { render(DEMO_DATA); });
  }

  fetchScores();
  setInterval(fetchScores, 10000);

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
