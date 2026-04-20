---
layout: page
title: Gallery
permalink: /gallery/
description: "Videos from our church services, celebrations, and community events."
---

<div id="video-gallery" class="video-gallery-grid">
  <p class="gallery-loading">Loading videos…</p>
</div>

<script>
(function() {
  var apiKey = '{{ site.google_api_key }}';
  var channelHandle = '{{ site.youtube_channel }}';
  var gallery = document.getElementById('video-gallery');
  var allItems = [];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=' + channelHandle + '&key=' + apiKey)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.items || data.items.length === 0) {
        gallery.innerHTML = '<p>No videos found.</p>';
        return;
      }
      var uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
      return fetchAllVideos(uploadsPlaylistId, null);
    })
    .catch(function() {
      gallery.innerHTML = '<p>Unable to load videos. Please try again later.</p>';
    });

  function fetchAllVideos(playlistId, pageToken) {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistId + '&maxResults=50&key=' + apiKey;
    if (pageToken) url += '&pageToken=' + pageToken;

    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.items) {
          allItems = allItems.concat(data.items);
        }
        if (data.nextPageToken) {
          fetchAllVideos(playlistId, data.nextPageToken);
        } else {
          renderVideos();
        }
      })
      .catch(function() {
        if (allItems.length > 0) {
          renderVideos();
        } else {
          gallery.innerHTML = '<p>Unable to load videos. Please try again later.</p>';
        }
      });
  }

  function renderVideos() {
    if (allItems.length === 0) {
      gallery.innerHTML = '<p>No videos found.</p>';
      return;
    }
    var html = '';
    allItems.forEach(function(item) {
      var videoId = item.snippet.resourceId.videoId;
      var title = item.snippet.title;
      if (title === 'Private video' || title === 'Deleted video') return;
      html += '<div class="video-card">' +
        '<div class="video-thumb" data-id="' + videoId + '">' +
        '<img src="https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg" alt="' + esc(title) + '">' +
        '<div class="play-btn">&#9654;</div>' +
        '</div>' +
        '<p class="video-title">' + esc(title) + '</p>' +
        '</div>';
    });
    gallery.innerHTML = html || '<p>No videos found.</p>';

    // Click to play — replace thumbnail with iframe
    gallery.querySelectorAll('.video-thumb').forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        var wrap = document.createElement('div');
        wrap.className = 'video-wrap';
        wrap.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?rel=0&modestbranding=1&autoplay=1" allowfullscreen></iframe>';
        this.parentNode.replaceChild(wrap, this);
      });
    });
  }
})();
</script>
