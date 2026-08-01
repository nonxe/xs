/* ==========================================================================
   XS STREAM - APPLICATION CORE JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // API Configuration
  const SEARCH_API_BASE = 'https://apis.davidcyril.name.ng/search/xvideo';
  const DETAIL_API_BASE = 'https://apis.davidcyril.name.ng/xvideo';

  // DOM Elements
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const tagsList = document.getElementById('tagsList');
  const homeLogo = document.getElementById('homeLogo');

  const videoGrid = document.getElementById('videoGrid');
  const loadingSkeleton = document.getElementById('loadingSkeleton');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  const retryBtn = document.getElementById('retryBtn');

  const sectionTitle = document.getElementById('sectionTitle');
  const resultCount = document.getElementById('resultCount');

  // Modal Elements
  const videoModal = document.getElementById('videoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const playerLoading = document.getElementById('playerLoading');
  const playerError = document.getElementById('playerError');
  const mainVideoPlayer = document.getElementById('mainVideoPlayer');
  const modalVideoTitle = document.getElementById('modalVideoTitle');
  const modalVideoDuration = document.getElementById('modalVideoDuration');
  const modalVideoQuality = document.getElementById('modalVideoQuality');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');

  // Application State
  let currentSearchQuery = 'trending';
  let currentStreamUrl = '';

  // Initialize
  init();

  function init() {
    setupEventListeners();
    performSearch(currentSearchQuery);
  }

  function setupEventListeners() {
    // Search Submit
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        currentSearchQuery = query;
        performSearch(query);
      }
    });

    // Clear Search Input
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

    // Quick Tag Clicks
    tagsList.addEventListener('click', (e) => {
      const tagBtn = e.target.closest('.tag-btn');
      if (tagBtn) {
        const query = tagBtn.dataset.query;
        searchInput.value = query;
        clearSearchBtn.classList.remove('hidden');
        currentSearchQuery = query;

        // Highlight active tag
        document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
        tagBtn.classList.add('active');

        performSearch(query);
      }
    });

    // Logo Click -> Reset to Trending
    homeLogo.addEventListener('click', (e) => {
      e.preventDefault();
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      currentSearchQuery = 'trending';
      document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
      performSearch('trending');
    });

    // Retry Button
    retryBtn.addEventListener('click', () => {
      performSearch(currentSearchQuery);
    });

    // Modal Close
    closeModalBtn.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeModal();
    });

    // ESC Key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
        closeModal();
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
  // API SEARCH & FETCH LOGIC
  // ==========================================

  async function performSearch(query) {
    showLoading();
    sectionTitle.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Results for "${escapeHtml(query)}"`;

    try {
      const apiUrl = `${SEARCH_API_BASE}?text=${encodeURIComponent(query)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        renderVideos(data.result);
      } else {
        showEmpty();
      }
    } catch (err) {
      console.error('Search error:', err);
      showError('Failed to fetch videos from server. Please check your network connection.');
    }
  }

  async function fetchVideoDetails(videoUrl, rawTitle, duration, quality) {
    openModal();
    setModalLoadingState(rawTitle, duration, quality);

    try {
      const apiUrl = `${DETAIL_API_BASE}?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && data.download_url) {
        const title = decodeHtmlEntities(data.title || rawTitle);
        setModalSuccessState(data.download_url, title);
      } else {
        throw new Error('Video stream link not found in API response.');
      }
    } catch (err) {
      console.error('Detail fetch error:', err);
      setModalErrorState('Failed to extract video playback URL.');
    }
  }

  // ==========================================
  // RENDER UI
  // ==========================================

  function renderVideos(videos) {
    hideAllStates();
    videoGrid.innerHTML = '';
    resultCount.textContent = `${videos.length} Videos`;

    videos.forEach((video) => {
      const card = document.createElement('div');
      card.className = 'video-card';

      const title = decodeHtmlEntities(video.title || 'Untitled Video');
      const cleanQuality = cleanQualityString(video.quality);
      const duration = video.duration || 'N/A';

      card.innerHTML = `
        <div class="card-thumb-container">
          <img src="${video.thumbnail}" alt="${escapeHtml(title)}" class="card-thumb" loading="lazy" onerror="this.src='https://via.placeholder.com/640x360/14141a/9ca3af?text=No+Thumbnail';" />
          <div class="card-play-overlay">
            <div class="play-icon-circle"><i class="fa-solid fa-play"></i></div>
          </div>
          ${duration ? `<span class="card-badge card-duration"><i class="fa-regular fa-clock"></i> ${duration}</span>` : ''}
          ${cleanQuality ? `<span class="card-badge card-quality">${cleanQuality}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
          <div class="card-footer">
            <span>XS Stream</span>
            <span class="play-link-btn">Watch <i class="fa-solid fa-chevron-right"></i></span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        fetchVideoDetails(video.url, title, duration, cleanQuality);
      });

      videoGrid.appendChild(card);
    });

    videoGrid.classList.remove('hidden');
  }

  // ==========================================
  // MODAL & PLAYER STATES
  // ==========================================

  function openModal() {
    videoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    videoModal.classList.add('hidden');
    document.body.style.overflow = '';
    mainVideoPlayer.pause();
    mainVideoPlayer.removeAttribute('src');
    mainVideoPlayer.load();
  }

  function setModalLoadingState(title, duration, quality) {
    playerLoading.classList.remove('hidden');
    playerError.classList.add('hidden');
    mainVideoPlayer.classList.add('hidden');

    modalVideoTitle.textContent = decodeHtmlEntities(title);
    modalVideoDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${duration || 'N/A'}`;
    modalVideoQuality.innerHTML = `<i class="fa-solid fa-sliders"></i> ${quality || 'HD'}`;

    downloadBtn.classList.add('disabled');
    downloadBtn.removeAttribute('href');
    currentStreamUrl = '';
  }

  function setModalSuccessState(streamUrl, title) {
    currentStreamUrl = streamUrl;
    playerLoading.classList.add('hidden');
    mainVideoPlayer.classList.remove('hidden');

    modalVideoTitle.textContent = title;
    mainVideoPlayer.src = streamUrl;
    mainVideoPlayer.play().catch(err => {
      console.log('Autoplay prevented by browser:', err);
    });

    downloadBtn.setAttribute('href', streamUrl);
    downloadBtn.setAttribute('download', `${slugify(title)}.mp4`);
    downloadBtn.classList.remove('disabled');
  }

  function setModalErrorState(msg) {
    playerLoading.classList.add('hidden');
    mainVideoPlayer.classList.add('hidden');
    playerError.classList.remove('hidden');
    playerError.querySelector('p').textContent = msg;
  }

  // ==========================================
  // STATE MANAGEMENT HELPER FUNCTIONS
  // ==========================================

  function showLoading() {
    hideAllStates();
    loadingSkeleton.classList.remove('hidden');
    resultCount.textContent = 'Searching...';
  }

  function showEmpty() {
    hideAllStates();
    emptyState.classList.remove('hidden');
    resultCount.textContent = '0 Videos';
  }

  function showError(msg) {
    hideAllStates();
    errorMessage.textContent = msg;
    errorState.classList.remove('hidden');
    resultCount.textContent = 'Error';
  }

  function hideAllStates() {
    videoGrid.classList.add('hidden');
    loadingSkeleton.classList.add('hidden');
    emptyState.classList.add('hidden');
    errorState.classList.add('hidden');
  }

  // ==========================================
  // UTILS
  // ==========================================

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
    // e.g. 720p720p -> 720p
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
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
