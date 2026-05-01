---
layout: page
title: Gallery
permalink: /gallery/
description: "Videos of Holy Qurbana, Oshana (Palm Sunday), Perunnal feasts, and parish life at St. Mary's Malankara Syriac Orthodox Church, Oslo. Watch our services and celebrations."
---

<div id="video-gallery">
  <p class="gallery-loading">Loading videos&hellip;</p>
</div>

<script>
(function() {
  var apiKey = '{{ site.google_api_key }}';
  var playlistIds = [{% for pl in site.gallery_playlists %}'{{ pl }}'{% unless forloop.last %},{% endunless %}{% endfor %}];
  var container = document.getElementById('video-gallery');
  var PER_SECTION = 6;

  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildCard(item) {
    var videoId = item.snippet.resourceId.videoId;
    var title = item.snippet.title;
    var card = el('div', 'video-card');
    var thumb = el('div', 'video-thumb');
    thumb.setAttribute('data-id', videoId);
    var img = document.createElement('img');
    img.src = 'https://img.youtube.com/vi/' + encodeURIComponent(videoId) + '/mqdefault.jpg';
    img.alt = title;
    img.loading = 'lazy';
    thumb.appendChild(img);
    var play = el('div', 'play-btn');
    play.textContent = '▶';
    thumb.appendChild(play);
    thumb.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var wrap = el('div', 'video-wrap');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?rel=0&modestbranding=1&autoplay=1';
      iframe.setAttribute('allowfullscreen', '');
      wrap.appendChild(iframe);
      this.parentNode.replaceChild(wrap, this);
    });
    card.appendChild(thumb);
    card.appendChild(el('p', 'video-title', title));
    return card;
  }

  function renderSection(title, items, parent) {
    var filtered = items.filter(function(item) {
      var t = item.snippet.title;
      return t !== 'Private video' && t !== 'Deleted video';
    });
    if (filtered.length === 0) return;

    var section = el('div', 'gallery-playlist-section');
    section.appendChild(el('h2', 'gallery-playlist-title', title));

    var grid = el('div', 'video-gallery-grid');
    section.appendChild(grid);

    if (filtered.length <= PER_SECTION) {
      filtered.forEach(function(item) { grid.appendChild(buildCard(item)); });
    } else {
      var nav = el('div', 'pagination');
      section.appendChild(nav);
      var totalPages = Math.ceil(filtered.length / PER_SECTION);

      function showPage(page) {
        clear(grid);
        var start = (page - 1) * PER_SECTION;
        filtered.slice(start, start + PER_SECTION).forEach(function(item) {
          grid.appendChild(buildCard(item));
        });
        renderNav(page);
        if (page !== 1) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      function renderNav(currentPage) {
        clear(nav);
        if (totalPages <= 1) return;
        var parts = [];
        if (currentPage > 1) parts.push({ label: '« Prev', page: currentPage - 1 });
        for (var i = 1; i <= totalPages; i++) parts.push({ label: String(i), page: i, active: i === currentPage });
        if (currentPage < totalPages) parts.push({ label: 'Next »', page: currentPage + 1 });
        parts.forEach(function(p) {
          var btn = el('button', 'page-btn' + (p.active ? ' active' : ''), p.label);
          btn.type = 'button';
          btn.addEventListener('click', function() { showPage(p.page); });
          nav.appendChild(btn);
        });
      }

      showPage(1);
    }

    parent.appendChild(section);
  }

  function fetchAllItems(playlistId, pageToken, collected, callback) {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' +
      encodeURIComponent(playlistId) + '&maxResults=50&key=' + encodeURIComponent(apiKey);
    if (pageToken) url += '&pageToken=' + encodeURIComponent(pageToken);

    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.items) collected = collected.concat(data.items);
        if (data.nextPageToken) {
          fetchAllItems(playlistId, data.nextPageToken, collected, callback);
        } else {
          callback(collected);
        }
      })
      .catch(function() { callback(collected); });
  }

  function fetchPlaylistTitle(playlistId, callback) {
    fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' +
      encodeURIComponent(playlistId) + '&key=' + encodeURIComponent(apiKey))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var title = (data.items && data.items.length > 0) ? data.items[0].snippet.title : 'Videos';
        callback(title);
      })
      .catch(function() { callback('Videos'); });
  }

  var completed = 0;
  var results = [];

  playlistIds.forEach(function(plId, index) {
    results[index] = { title: '', items: [] };
    var done = 0;

    fetchPlaylistTitle(plId, function(title) {
      results[index].title = title;
      done++;
      if (done === 2) checkComplete();
    });

    fetchAllItems(plId, null, [], function(items) {
      results[index].items = items;
      done++;
      if (done === 2) checkComplete();
    });
  });

  function checkComplete() {
    completed++;
    if (completed < playlistIds.length) return;

    clear(container);
    var hasVideos = false;
    results.forEach(function(r) {
      if (r.items.length > 0) hasVideos = true;
      renderSection(r.title, r.items, container);
    });
    if (!hasVideos) {
      container.appendChild(el('p', null, 'No videos found.'));
    }
  }
})();
</script>
