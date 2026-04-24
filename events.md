---
layout: page
title: "Holy Qurbana Schedule & Events"
permalink: /events/
description: "Holy Qurbana schedule, feast days (Oshana, Perunnal), and upcoming events at St. Mary's Malankara Syriac Orthodox Church, Oslo. Subscribe to our Malayalam Orthodox parish calendar."
---

<div class="events-intro">
  <p>Stay updated with our Holy Qurbana schedule, feast days, and community gatherings. Subscribe to our calendar to never miss an event.</p>
  <div class="calendar-actions">
    <a href="https://calendar.google.com/calendar/r?cid=stmaryschurchnorway@gmail.com" target="_blank" rel="noopener" class="btn subscribe-btn">&#128197; Subscribe to Calendar</a>
  </div>
</div>

{% include upcoming-events.html id="events-upcoming" limit=5 paginate=true %}

{% include past-events.html id="events-past" limit=6 window_days=90 paginate=true %}

{% if site.posts.size > 0 %}
<h2 class="section-title" style="margin-top:45px;">Latest News</h2>

<div class="news-list" id="news-list" data-per-page="4">
  {% for post in site.posts %}
  <a href="{{ post.url | relative_url }}" class="news-list-item">
    <span class="news-date">{{ post.date | date: "%b %d, %Y" }}</span>
    <h3>{{ post.title }}</h3>
    <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
    <span class="news-read-more">Read more &rarr;</span>
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
    if (currentPage > 1) parts.push({ label: '« Prev', page: currentPage - 1 });
    for (var i = 1; i <= totalPages; i++) parts.push({ label: String(i), page: i, active: i === currentPage });
    if (currentPage < totalPages) parts.push({ label: 'Next »', page: currentPage + 1 });
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
