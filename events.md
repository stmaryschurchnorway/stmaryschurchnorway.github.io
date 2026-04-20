---
layout: page
title: Events
permalink: /events/
description: "Upcoming events, calendar, and news from St. Mary's MSOC, Oslo."
---

<div class="events-intro">
  <p>Stay updated with our Holy Qurbana schedule, feast days, and community gatherings. Subscribe to our calendar to never miss an event.</p>
  <div class="calendar-actions">
    <a href="https://calendar.google.com/calendar/r?cid=stmaryschurchnorway@gmail.com" target="_blank" rel="noopener" class="btn subscribe-btn">&#128197; Subscribe to Calendar</a>
  </div>
</div>

<h2 class="section-title">Upcoming Events</h2>

<div class="calendar-wrap">
  <iframe src="https://calendar.google.com/calendar/embed?src=stmaryschurchnorway%40gmail.com&ctz=Europe%2FOslo" style="border: 0" width="100%" height="600" frameborder="0" scrolling="no"></iframe>
</div>

{% if site.posts.size > 0 %}
<h2 class="section-title" style="margin-top:45px;">Past Events</h2>

<div class="news-list" id="news-list">
  {% for post in site.posts %}
  <a href="{{ post.url | relative_url }}" class="news-list-item" data-index="{{ forloop.index }}">
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
  var perPage = 6;
  var items = document.querySelectorAll('.news-list-item');
  var pagination = document.getElementById('pagination');
  var totalPages = Math.ceil(items.length / perPage);
  var currentPage = 1;

  function showPage(page) {
    currentPage = page;
    items.forEach(function(item, i) {
      item.style.display = (i >= (page - 1) * perPage && i < page * perPage) ? '' : 'none';
    });
    renderPagination();
    document.getElementById('news-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPagination() {
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    var html = '';
    if (currentPage > 1) {
      html += '<button class="page-btn" data-page="' + (currentPage - 1) + '">&laquo; Prev</button>';
    }
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    if (currentPage < totalPages) {
      html += '<button class="page-btn" data-page="' + (currentPage + 1) + '">Next &raquo;</button>';
    }
    pagination.innerHTML = html;
    pagination.querySelectorAll('.page-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        showPage(parseInt(this.getAttribute('data-page')));
      });
    });
  }

  if (items.length > 0) showPage(1);
})();
</script>
{% endif %}
