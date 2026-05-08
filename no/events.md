---
layout: page
lang: no
title: "Menighetsliv & Arrangementer"
permalink: /no/events/
description: "Hellig Qurbana-tidsplan, festdager (Oshana, Perunnal), og kommende arrangementer ved St. Marias Malankara Syrisk Ortodoks Kirke, Oslo. Abonner på vår malayalisk-ortodokse kirkekalender."
---

<div class="events-intro">
  <p>Hold deg oppdatert med vår tidsplan for Hellig Qurbana, festdager og menighetssamlinger. Abonner på vår kalender for å aldri gå glipp av et arrangement.</p>
  <div class="calendar-actions">
    <a href="https://calendar.google.com/calendar/r?cid=stmaryschurchnorway@gmail.com" target="_blank" rel="noopener" class="btn subscribe-btn">&#128197; Abonner på Kalender</a>
  </div>
</div>

{% include upcoming-events.html id="events-upcoming" limit=5 paginate=true %}

{% include past-events.html id="events-past" limit=6 window_days=90 paginate=true %}

{% if site.posts.size > 0 %}
<div class="news-section-header">
  <div>
    <span class="events-label">Oppdateringer</span>
    <h2 class="events-title" style="font-size:1.4rem;">Siste Nyheter</h2>
  </div>
</div>

<div class="news-list" id="news-list" data-per-page="4">
  {% for post in site.posts %}
  <a href="{{ post.url | relative_url }}" class="news-list-item">
    <span class="news-date">{{ post.date | date: "%b %d, %Y" }}</span>
    <h3>{{ post.title }}</h3>
    <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
    <span class="news-read-more">Les mer &rarr;</span>
  </a>
  {% endfor %}
</div>

<div class="pagination" id="pagination"></div>

<script>
(function() {
  var list = document.getElementById('news-list');
  var nav = document.getElementById('pagination');
  if (!list || !nav) return;
  var perPage = parseInt(list.getAttribute('data-per-page'), 10) || 6;
  var items = Array.prototype.slice.call(list.querySelectorAll('.news-list-item'));
  if (items.length <= perPage) return;
  var totalPages = Math.ceil(items.length / perPage);
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }
  function show(page) {
    items.forEach(function(item, i) {
      item.style.display = (i >= (page - 1) * perPage && i < page * perPage) ? '' : 'none';
    });
    renderNav(page);
    if (page !== 1) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderNav(currentPage) {
    clear(nav);
    var parts = [];
    if (currentPage > 1) parts.push({ label: '« Forrige', page: currentPage - 1 });
    for (var i = 1; i <= totalPages; i++) parts.push({ label: String(i), page: i, active: i === currentPage });
    if (currentPage < totalPages) parts.push({ label: 'Neste »', page: currentPage + 1 });
    parts.forEach(function(p) {
      var btn = el('button', 'page-btn' + (p.active ? ' active' : ''), p.label);
      btn.type = 'button';
      btn.addEventListener('click', function() { show(p.page); });
      nav.appendChild(btn);
    });
  }
  show(1);
})();
</script>
{% endif %}
