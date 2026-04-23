---
layout: page
title: Gallery
permalink: /gallery/
description: "Videos of Holy Qurbana, Oshana (Palm Sunday), Perunnal feasts, and parish life at St. Mary's Malankara Syriac Orthodox Church, Oslo. Watch our services and celebrations."
---

<div id="video-gallery" data-per-page="6">
  <p class="gallery-loading">Loading videos&hellip;</p>
</div>

<script>
(function() {
  var apiKey = '{{ site.google_api_key }}';
  var channelHandle = '{{ site.youtube_channel }}';
  var container = document.getElementById('video-gallery');
  var perPage = parseInt(container.getAttribute('data-per-page'), 10) || 6;
  var allItems = [];

  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }
  function showMessage(text) {
    clear(container);
    container.appendChild(el('p', null, text));
  }

  fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=' + channelHandle + '&key=' + apiKey)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.items || data.items.length === 0) {
        showMessage('No videos found.');
        return;
      }
      fetchAllVideos(data.items[0].contentDetails.relatedPlaylists.uploads, null);
    })
    .catch(function() {
      showMessage('Unable to load videos. Please try again later.');
    });

  function fetchAllVideos(playlistId, pageToken) {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' +
      encodeURIComponent(playlistId) + '&maxResults=50&key=' + encodeURIComponent(apiKey);
    if (pageToken) url += '&pageToken=' + encodeURIComponent(pageToken);

    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.items) allItems = allItems.concat(data.items);
        if (data.nextPageToken) {
          fetchAllVideos(playlistId, data.nextPageToken);
        } else {
          renderVideos();
        }
      })
      .catch(function() {
        if (allItems.length > 0) renderVideos();
        else showMessage('Unable to load videos. Please try again later.');
      });
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

  function renderVideos() {
    var items = allItems.filter(function(item) {
      var t = item.snippet.title;
      return t !== 'Private video' && t !== 'Deleted video';
    });
    if (items.length === 0) { showMessage('No videos found.'); return; }

    clear(container);
    var grid = el('div', 'video-gallery-grid');
    var nav = el('div', 'pagination');
    container.appendChild(grid);
    container.appendChild(nav);

    var totalPages = Math.ceil(items.length / perPage);

    function showPage(page) {
      clear(grid);
      var start = (page - 1) * perPage;
      items.slice(start, start + perPage).forEach(function(item) {
        grid.appendChild(buildCard(item));
      });
      renderNav(page);
      if (page !== 1) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
})();
</script>
