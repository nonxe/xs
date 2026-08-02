/* ==========================================================================
   XS STREAM - YOUTUBE-STYLE LOGIC & RECOMMENDATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // API Endpoints
  const SEARCH_API_BASE = 'https://apis.davidcyril.name.ng/search/xvideo';
  const DETAIL_API_BASE = 'https://apis.davidcyril.name.ng/xvideo';

  // DOM Elements
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const tagsList = document.getElementById('tagsList');
  const brandLogo = document.getElementById('brandLogo');

  // Views
  const browseView = document.getElementById('browseView');
  const watchView = document.getElementById('watchView');

  // Browse View Elements
  const videoGrid = document.getElementById('videoGrid');
  const loadingSkeleton = document.getElementById('loadingSkeleton');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  const retryBtn = document.getElementById('retryBtn');
  const sectionTitle = document.getElementById('sectionTitle');
  const sectionSubtitle = document.getElementById('sectionSubtitle');
  const resultCount = document.getElementById('resultCount');

  // Watch View Elements
  const playerLoading = document.getElementById('playerLoading');
  const playerError = document.getElementById('playerError');
  const retryPlayerBtn = document.getElementById('retryPlayerBtn');
  const mainVideoPlayer = document.getElementById('mainVideoPlayer');
  const watchVideoTitle = document.getElementById('watchVideoTitle');
  const watchVideoDuration = document.getElementById('watchVideoDuration');
  const watchVideoQuality = document.getElementById('watchVideoQuality');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const backToBrowseBtn = document.getElementById('backToBrowseBtn');

  // Recommendations Elements
  const relatedList = document.getElementById('relatedList');
  const relatedSkeleton = document.getElementById('relatedSkeleton');

  // State
  let currentSearchQuery = 'trending';
  let currentActiveVideo = null;
  let currentStreamUrl = '';

  init();

  function init() {
    setupEventListeners();
    performSearch(currentSearchQuery);
  }

  function setupEventListeners() {
    // Search Form Submit
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        currentSearchQuery = query;
        showBrowseView();
        performSearch(query);
      }
    });

    // Search Input Clear Toggle
    searchInput.addEventListener('input', () => {
      if (searchInput.value.length > 0) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      searchInput.focus();
    });

    // Tag Filter Pills
    tagsList.addEventListener('click', (e) => {
      const pillBtn = e.target.closest('.filter-pill');
      if (pillBtn) {
        const query = pillBtn.dataset.query;
        searchInput.value = query;
        clearSearchBtn.classList.remove('hidden');
        currentSearchQuery = query;

        // Active state styling
        document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        pillBtn.classList.add('active');

        showBrowseView();
        performSearch(query);
      }
    });

    // Brand Logo -> Go Home (Browse View)
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      showBrowseView();
      if (!searchInput.value) {
        currentSearchQuery = 'trending';
        performSearch('trending');
      }
    });

    // Back to Search Button
    backToBrowseBtn.addEventListener('click', () => {
      showBrowseView();
    });

    // Retry Buttons
    retryBtn.addEventListener('click', () => performSearch(currentSearchQuery));
    retryPlayerBtn.addEventListener('click', () => {
      if (currentActiveVideo) {
        openWatchView(currentActiveVideo);
      }
    });

    // Copy Link Action
    copyUrlBtn.addEventListener('click', () => {
      if (currentStreamUrl) {
        navigator.clipboard.writeText(currentStreamUrl).then(() => {
          showToast('Direct video stream URL copied to clipboard!');
        }).catch(() => {
          showToast('Failed to copy link.');
        });
      }
    });
  }

  // ==========================================
  // VIEW SWITCHING
  // ==========================================

  function showBrowseView() {
    watchView.classList.add('hidden');
    browseView.classList.remove('hidden');
    mainVideoPlayer.pause();
    mainVideoPlayer.removeAttribute('src');
    mainVideoPlayer.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showWatchView() {
    browseView.classList.add('hidden');
    watchView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // API SEARCH & BROWSE GRID
  // ==========================================

  async function performSearch(query) {
    showLoading();
    sectionTitle.textContent = `Results for "${query}"`;
    sectionSubtitle.textContent = `Showing top results for "${query}"`;

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        renderVideoCards(data.result);
      } else {
        showEmpty();
      }
    } catch (err) {
      console.error('Search failed:', err);
      showError('Unable to fetch videos. Please check your internet connection.');
    }
  }

  function renderVideoCards(videos) {
    hideAllBrowseStates();
    videoGrid.innerHTML = '';
    resultCount.textContent = `${videos.length} Videos`;

    videos.forEach((video) => {
      const card = document.createElement('div');
      card.className = 'video-card-item';

      const title = decodeHtmlEntities(video.title || 'Untitled Video');
      const cleanQuality = cleanQualityString(video.quality);
      const duration = video.duration || 'N/A';

      card.innerHTML = `
        <div class="card-media">
          <img src="${video.thumbnail}" alt="${escapeHtml(title)}" class="card-img" loading="lazy" onerror="this.src='https://via.placeholder.com/640x360/121216/9ca3af?text=No+Preview';" />
          <div class="card-play-glass">
            <div class="glass-play-btn"><i class="fa-solid fa-play"></i></div>
          </div>
          ${duration ? `<span class="pill-tag pill-duration"><i class="fa-regular fa-clock"></i> ${duration}</span>` : ''}
          ${cleanQuality ? `<span class="pill-tag pill-quality">${cleanQuality}</span>` : ''}
        </div>
        <div class="card-meta">
          <h3 class="card-heading" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
          <div class="card-footer-info">
            <span>XS Stream</span>
            <span class="watch-text">Watch <i class="fa-solid fa-chevron-right"></i></span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openWatchView(video);
      });

      videoGrid.appendChild(card);
    });

    videoGrid.classList.remove('hidden');
  }

  // ==========================================
  // YOUTUBE WATCH PAGE & RECOMMENDATIONS
  // ==========================================

  async function openWatchView(video) {
    currentActiveVideo = video;
    showWatchView();

    const title = decodeHtmlEntities(video.title || 'Untitled Video');
    const duration = video.duration || 'N/A';
    const cleanQuality = cleanQualityString(video.quality);

    // Reset player loading UI
    playerLoading.classList.remove('hidden');
    playerError.classList.add('hidden');
    mainVideoPlayer.classList.add('hidden');

    watchVideoTitle.textContent = title;
    watchVideoDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${duration}`;
    watchVideoQuality.innerHTML = `<i class="fa-solid fa-sliders"></i> ${cleanQuality}`;

    downloadBtn.classList.add('disabled');
    downloadBtn.removeAttribute('href');
    currentStreamUrl = '';

    // 1. Fetch Video Details (Stream URL)
    fetchStreamUrl(video.url, title);

    // 2. Fetch Related Videos based on title keywords (YouTube style)
    fetchRelatedRecommendations(title);
  }

  async function fetchStreamUrl(videoUrl, title) {
    try {
      const url = `${DETAIL_API_BASE}?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && data.download_url) {
        currentStreamUrl = data.download_url;
        playerLoading.classList.add('hidden');
        mainVideoPlayer.classList.remove('hidden');

        mainVideoPlayer.src = data.download_url;
        mainVideoPlayer.play().catch(err => console.log('Autoplay policy prevented audio/video:', err));

        downloadBtn.setAttribute('href', data.download_url);
        downloadBtn.setAttribute('download', `${slugify(title)}.mp4`);
        downloadBtn.classList.remove('disabled');
      } else {
        throw new Error('No stream URL in API output');
      }
    } catch (err) {
      console.error('Stream fetch failed:', err);
      playerLoading.classList.add('hidden');
      mainVideoPlayer.classList.add('hidden');
      playerError.classList.remove('hidden');
    }
  }

  async function fetchRelatedRecommendations(title) {
    relatedSkeleton.classList.remove('hidden');
    relatedList.innerHTML = '';

    // Extract search keywords from active title
    const keywords = extractKeywords(title);

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(keywords)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();

      relatedSkeleton.classList.add('hidden');

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        // Filter out current playing video if exact same URL
        const recommendations = data.result.filter(item => item.url !== currentActiveVideo.url);
        renderRelatedList(recommendations.length > 0 ? recommendations : data.result);
      } else {
        // Fallback: search trending if keyword search yields empty
        fetchFallbackRecommendations();
      }
    } catch (err) {
      console.error('Recommendations error:', err);
      relatedSkeleton.classList.add('hidden');
      fetchFallbackRecommendations();
    }
  }

  async function fetchFallbackRecommendations() {
    try {
      const url = `${SEARCH_API_BASE}?text=trending`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.success && Array.isArray(data.result)) {
        renderRelatedList(data.result);
      }
    } catch (err) {
      console.error('Fallback recommendations failed:', err);
    }
  }

  function renderRelatedList(videos) {
    relatedList.innerHTML = '';

    videos.slice(0, 10).forEach(video => {
      const card = document.createElement('div');
      card.className = 'related-card';

      const title = decodeHtmlEntities(video.title || 'Recommended Video');
      const duration = video.duration || '';

      card.innerHTML = `
        <div class="related-thumb-box">
          <img src="${video.thumbnail}" alt="${escapeHtml(title)}" class="related-img" loading="lazy" onerror="this.src='https://via.placeholder.com/280x160/121216/9ca3af?text=No+Preview';" />
          ${duration ? `<span class="related-duration">${duration}</span>` : ''}
        </div>
        <div class="related-info">
          <h4 class="related-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h4>
          <span class="related-channel">XS Recommended</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openWatchView(video);
      });

      relatedList.appendChild(card);
    });
  }

  // ==========================================
  // HELPERS & UTILS
  // ==========================================

  function extractKeywords(title) {
    if (!title) return 'trending';
    // Clean string, remove punctuation, split into words
    const words = title.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3);
    if (words.length >= 2) {
      return `${words[0]} ${words[1]}`;
    } else if (words.length === 1) {
      return words[0];
    }
    return 'trending';
  }

  function showLoading() {
    hideAllBrowseStates();
    loadingSkeleton.classList.remove('hidden');
    resultCount.textContent = 'Searching...';
  }

  function showEmpty() {
    hideAllBrowseStates();
    emptyState.classList.remove('hidden');
    resultCount.textContent = '0 Videos';
  }

  function showError(msg) {
    hideAllBrowseStates();
    errorMessage.textContent = msg;
    errorState.classList.remove('hidden');
    resultCount.textContent = 'Error';
  }

  function hideAllBrowseStates() {
    videoGrid.classList.add('hidden');
    loadingSkeleton.classList.add('hidden');
    emptyState.classList.add('hidden');
    errorState.classList.add('hidden');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  function decodeHtmlEntities(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value.replace(/&period;/g, '.');
  }

  function cleanQualityString(q) {
    if (!q) return 'HD';
    const match = q.match(/(\d+p)/i);
    return match ? match[1] : q;
  }

  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '_')
      .replace(/^-+/, '')
      .replace(/-+$/, '') || 'video';
  }

  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast-pill';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
});
