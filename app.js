/* ==========================================================================
   XS STREAM - ULTRA-SMOOTH LOGIC & API ENGINE
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

  const videoGrid = document.getElementById('videoGrid');
  const loadingSkeleton = document.getElementById('loadingSkeleton');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  const retryBtn = document.getElementById('retryBtn');

  const sectionTitle = document.getElementById('sectionTitle');
  const sectionSubtitle = document.getElementById('sectionSubtitle');
  const resultCount = document.getElementById('resultCount');

  // Sheet Modal Elements
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

  // State
  let currentSearchQuery = 'trending';
  let currentStreamUrl = '';

  init();

  function init() {
    setupEventListeners();
    performSearch(currentSearchQuery);
  }

  function setupEventListeners() {
    // Form Submit
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        currentSearchQuery = query;
        performSearch(query);
      }
    });

    // Input Clear Toggle
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

    // Tag Filter Bar
    tagsList.addEventListener('click', (e) => {
      const pillBtn = e.target.closest('.filter-pill');
      if (pillBtn) {
        const query = pillBtn.dataset.query;
        searchInput.value = query;
        clearSearchBtn.classList.remove('hidden');
        currentSearchQuery = query;

        // Active State
        document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        pillBtn.classList.add('active');

        performSearch(query);
      }
    });

    // Brand Click -> Reset
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      currentSearchQuery = 'trending';
      document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
      const firstTag = document.querySelector('.filter-pill[data-query="trending"]');
      if (firstTag) firstTag.classList.add('active');
      performSearch('trending');
    });

    // Retry Action
    retryBtn.addEventListener('click', () => {
      performSearch(currentSearchQuery);
    });

    // Modal Actions
    closeModalBtn.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeModal();
    });

    // Keyboard ESC to exit modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Copy Link Action
    copyUrlBtn.addEventListener('click', () => {
      if (currentStreamUrl) {
        navigator.clipboard.writeText(currentStreamUrl).then(() => {
          showToast('Direct stream link copied to clipboard!');
        }).catch(() => {
          showToast('Unable to copy link.');
        });
      }
    });
  }

  // ==========================================
  // FETCH SEARCH RESULTS
  // ==========================================

  async function performSearch(query) {
    showLoading();
    sectionTitle.textContent = `Results for "${query}"`;
    sectionSubtitle.textContent = `Showing instant video streams for "${query}"`;

    // Smooth scroll up on mobile/desktop
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        renderVideoCards(data.result);
      } else {
        showEmpty();
      }
    } catch (err) {
      console.error('Search failed:', err);
      showError('Unable to connect to video server. Please check your internet connection.');
    }
  }

  async function fetchVideoDetails(videoUrl, rawTitle, duration, quality) {
    openModal();
    setModalLoadingState(rawTitle, duration, quality);

    try {
      const url = `${DETAIL_API_BASE}?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && data.download_url) {
        const title = decodeHtmlEntities(data.title || rawTitle);
        setModalSuccessState(data.download_url, title);
      } else {
        throw new Error('Video source stream could not be extracted.');
      }
    } catch (err) {
      console.error('Detail fetch failed:', err);
      setModalErrorState('Failed to load stream link. Stream source may be restricted.');
    }
  }

  // ==========================================
  // RENDER UI CARDS
  // ==========================================

  function renderVideoCards(videos) {
    hideAllStates();
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
            <span class="watch-text">Play <i class="fa-solid fa-chevron-right"></i></span>
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
  // MODAL PLAYER MANAGEMENT
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
      console.log('Autoplay prevented:', err);
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
  // HELPERS & UTILS
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
