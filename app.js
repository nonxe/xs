/* ==========================================================================
   XS STREAM - PROFESSIONAL DARK STREAMING PLATFORM & ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // API Endpoints
  const SEARCH_API_BASE = 'https://apis.davidcyril.name.ng/search/xvideo';
  const DETAIL_API_BASE = 'https://apis.davidcyril.name.ng/xvideo';

  // Domain Rewriting Configuration
  const NEW_DOMAIN_PREFIX = 'https://exendpoint.vercel.app/';

  // Safe Generic Keywords Pool for Initial Load & Load More
  const SAFE_GENERIC_WORDS = [
    'new', 'classic', 'hot', 'latest', 'viral', 
    'hd', 'popular', 'top', 'featured', 'prime', 'best',
    'trending', 'shorts', 'full', 'gold', 'super'
  ];

  // DOM Elements - Navigation & Views
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const tagsList = document.getElementById('tagsList');
  const brandLogo = document.getElementById('brandLogo');

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

  // Load More Elements
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const loadMoreText = document.getElementById('loadMoreText');

  // Watch View & Custom Player Elements
  const playerContainer = document.getElementById('playerContainer');
  const mainVideoPlayer = document.getElementById('mainVideoPlayer');
  const playerLoading = document.getElementById('playerLoading');
  const playerError = document.getElementById('playerError');
  const retryPlayerBtn = document.getElementById('retryPlayerBtn');
  const bigPlayBtn = document.getElementById('bigPlayBtn');
  const customControls = document.getElementById('customControls');

  // Player Controls
  const playPauseBtn = document.getElementById('playPauseBtn');
  const progressArea = document.getElementById('progressArea');
  const progressFill = document.getElementById('progressFill');
  const progressBuffer = document.getElementById('progressBuffer');
  const progressHandle = document.getElementById('progressHandle');
  const muteBtn = document.getElementById('muteBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const currentTimeElem = document.getElementById('currentTime');
  const totalDurationElem = document.getElementById('totalDuration');
  const speedBtn = document.getElementById('speedBtn');
  const speedText = document.getElementById('speedText');
  const speedMenu = document.getElementById('speedMenu');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Metadata & Action Elements
  const watchVideoTitle = document.getElementById('watchVideoTitle');
  const watchVideoDuration = document.getElementById('watchVideoDuration');
  const watchVideoQuality = document.getElementById('watchVideoQuality');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnLabel = document.getElementById('downloadBtnLabel');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const backToBrowseBtn = document.getElementById('backToBrowseBtn');

  // Recommendations Elements
  const relatedList = document.getElementById('relatedList');
  const relatedSkeleton = document.getElementById('relatedSkeleton');

  // State Variables
  let currentSearchQuery = '';
  let lastUsedKeywords = [];
  let currentActiveVideo = null;
  let currentStreamUrl = '';
  let totalLoadedVideosCount = 0;
  let controlsHideTimeout = null;
  let isScrubbing = false;
  let isLoadingMore = false;

  init();

  function init() {
    setupNavigationEvents();
    setupCustomPlayerEvents();
    setupDownloadEvents();
    setupLoadMoreEvents();
    
    // Pick a random generic keyword on initial load / refresh
    const initialRandomQuery = getRandomGenericWord();
    currentSearchQuery = initialRandomQuery;
    performInitialHomeSearch(initialRandomQuery);
  }

  function getRandomGenericWord() {
    const availableWords = SAFE_GENERIC_WORDS.filter(w => !lastUsedKeywords.includes(w));
    const pool = availableWords.length > 0 ? availableWords : SAFE_GENERIC_WORDS;
    const idx = Math.floor(Math.random() * pool.length);
    const chosen = pool[idx];
    
    lastUsedKeywords.push(chosen);
    if (lastUsedKeywords.length > 6) lastUsedKeywords.shift();
    
    return chosen;
  }

  // ==========================================
  // NAVIGATION & VIEW SWITCHING
  // ==========================================

  function setupNavigationEvents() {
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

    // Tag Filter Pills
    tagsList.addEventListener('click', (e) => {
      const pillBtn = e.target.closest('.filter-pill');
      if (pillBtn) {
        const query = pillBtn.dataset.query;
        searchInput.value = query;
        clearSearchBtn.classList.remove('hidden');
        currentSearchQuery = query;

        document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        pillBtn.classList.add('active');

        showBrowseView();
        performSearch(query);
      }
    });

    // Logo Click -> Go Home
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      showBrowseView();
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      const randomQuery = getRandomGenericWord();
      currentSearchQuery = randomQuery;
      performInitialHomeSearch(randomQuery);
    });

    // Back to Home Button
    backToBrowseBtn.addEventListener('click', showBrowseView);

    // Retries
    retryBtn.addEventListener('click', () => performSearch(currentSearchQuery));
    retryPlayerBtn.addEventListener('click', () => {
      if (currentActiveVideo) openWatchView(currentActiveVideo);
    });

    // Copy Link (Uses Rewritten Vercel Endpoint Domain)
    copyUrlBtn.addEventListener('click', () => {
      if (currentStreamUrl) {
        navigator.clipboard.writeText(currentStreamUrl).then(() => {
          showToast('Direct stream link copied to clipboard!');
        }).catch(() => showToast('Failed to copy link.'));
      }
    });
  }

  function showBrowseView() {
    watchView.classList.add('hidden');
    browseView.classList.remove('hidden');
    pauseVideo();
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
  // LOAD MORE VIDEOS HANDLER
  // ==========================================

  function setupLoadMoreEvents() {
    loadMoreBtn.addEventListener('click', async () => {
      if (isLoadingMore) return;

      isLoadingMore = true;
      loadMoreBtn.classList.add('disabled');
      loadMoreText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;

      const nextKeyword = getRandomGenericWord();

      try {
        const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(nextKeyword)}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
          appendVideoCards(data.result);
          showToast('Loaded more videos!');
        } else {
          showToast('No more videos found.');
        }
      } catch (err) {
        console.error('Load more failed:', err);
        showToast('Failed to load more videos.');
      } finally {
        isLoadingMore = false;
        loadMoreBtn.classList.remove('disabled');
        loadMoreText.textContent = 'Load More Videos';
      }
    });
  }

  // ==========================================
  // DOMAIN REWRITING HELPER
  // ==========================================

  function transformStreamUrl(rawUrl) {
    if (!rawUrl) return '';
    return rawUrl.replace(/^https?:\/\/mp4-cdn77\.xvideos-cdn\.com\//i, NEW_DOMAIN_PREFIX);
  }

  // ==========================================
  // DIRECT FILE DOWNLOAD ACTION
  // ==========================================

  function setupDownloadEvents() {
    downloadBtn.addEventListener('click', () => {
      if (!currentStreamUrl) return;

      const titleText = watchVideoTitle.textContent || 'video';
      const filename = `${slugify(titleText)}.mp4`;

      showToast('Starting file download to device...');
      downloadBtnLabel.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Downloading...`;

      fetch(currentStreamUrl)
        .then(res => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          showToast('Download complete!');
          downloadBtnLabel.textContent = 'Download Video';
        })
        .catch(() => {
          const link = document.createElement('a');
          link.href = currentStreamUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloadBtnLabel.textContent = 'Download Video';
        });
    });
  }

  // ==========================================
  // CUSTOM VIDEO PLAYER CONTROLS & LOGIC
  // ==========================================

  function setupCustomPlayerEvents() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    bigPlayBtn.addEventListener('click', togglePlayPause);
    mainVideoPlayer.addEventListener('click', togglePlayPause);

    mainVideoPlayer.addEventListener('play', () => {
      updatePlayPauseIcons(true);
      bigPlayBtn.classList.add('hidden');
      startControlsTimer();
    });

    mainVideoPlayer.addEventListener('pause', () => {
      updatePlayPauseIcons(false);
      bigPlayBtn.classList.remove('hidden');
      showControls();
    });

    mainVideoPlayer.addEventListener('timeupdate', updateProgress);
    mainVideoPlayer.addEventListener('progress', updateBuffer);
    mainVideoPlayer.addEventListener('loadedmetadata', () => {
      totalDurationElem.textContent = formatTime(mainVideoPlayer.duration);
    });

    progressArea.addEventListener('click', seekVideo);
    progressArea.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      seekVideo(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isScrubbing) seekVideo(e);
    });

    document.addEventListener('mouseup', () => {
      isScrubbing = false;
    });

    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      mainVideoPlayer.volume = vol;
      mainVideoPlayer.muted = vol === 0;
      updateVolumeIcon(vol, mainVideoPlayer.muted);
    });

    muteBtn.addEventListener('click', () => {
      mainVideoPlayer.muted = !mainVideoPlayer.muted;
      updateVolumeIcon(mainVideoPlayer.volume, mainVideoPlayer.muted);
    });

    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      speedMenu.classList.add('hidden');
    });

    speedMenu.addEventListener('click', (e) => {
      const option = e.target.closest('.speed-option');
      if (option) {
        const speed = parseFloat(option.dataset.speed);
        mainVideoPlayer.playbackRate = speed;
        speedText.textContent = speed === 1 ? '1x' : `${speed}x`;

        document.querySelectorAll('.speed-option').forEach(btn => btn.classList.remove('active'));
        option.classList.add('active');
        speedMenu.classList.add('hidden');
      }
    });

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    playerContainer.addEventListener('mousemove', showControls);
    playerContainer.addEventListener('mouseleave', () => {
      if (!mainVideoPlayer.paused) {
        customControls.classList.add('autohide');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (watchView.classList.contains('hidden')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        muteBtn.click();
      }
    });
  }

  function togglePlayPause() {
    if (mainVideoPlayer.paused || mainVideoPlayer.ended) {
      playVideo();
    } else {
      pauseVideo();
    }
  }

  function playVideo() {
    mainVideoPlayer.play().catch(err => console.log('Playback error:', err));
  }

  function pauseVideo() {
    mainVideoPlayer.pause();
  }

  function updatePlayPauseIcons(isPlaying) {
    playPauseBtn.innerHTML = isPlaying 
      ? '<i class="fa-solid fa-pause"></i>' 
      : '<i class="fa-solid fa-play"></i>';
  }

  function updateProgress() {
    if (!mainVideoPlayer.duration || isNaN(mainVideoPlayer.duration)) return;

    const current = mainVideoPlayer.currentTime;
    const duration = mainVideoPlayer.duration;
    const pct = (current / duration) * 100;

    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;
    currentTimeElem.textContent = formatTime(current);
  }

  function updateBuffer() {
    if (!mainVideoPlayer.duration) return;
    try {
      if (mainVideoPlayer.buffered.length > 0) {
        const bufferedEnd = mainVideoPlayer.buffered.end(mainVideoPlayer.buffered.length - 1);
        const pct = (bufferedEnd / mainVideoPlayer.duration) * 100;
        progressBuffer.style.width = `${pct}%`;
      }
    } catch (e) {}
  }

  function seekVideo(e) {
    if (!mainVideoPlayer.duration) return;
    const rect = progressArea.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = pos / rect.width;
    mainVideoPlayer.currentTime = pct * mainVideoPlayer.duration;
    updateProgress();
  }

  function updateVolumeIcon(vol, isMuted) {
    if (isMuted || vol === 0) {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      volumeSlider.value = 0;
    } else if (vol < 0.5) {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
      volumeSlider.value = vol;
    } else {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      volumeSlider.value = vol;
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (playerContainer.requestFullscreen) {
        playerContainer.requestFullscreen();
      } else if (playerContainer.webkitRequestFullscreen) {
        playerContainer.webkitRequestFullscreen();
      }
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }
  }

  function showControls() {
    customControls.classList.remove('autohide');
    startControlsTimer();
  }

  function startControlsTimer() {
    clearTimeout(controlsHideTimeout);
    if (!mainVideoPlayer.paused) {
      controlsHideTimeout = setTimeout(() => {
        customControls.classList.add('autohide');
      }, 3000);
    }
  }

  // ==========================================
  // API FETCH & GRID DISCOVERY
  // ==========================================

  // Initial Home Page Load Search
  async function performInitialHomeSearch(queryWord) {
    showLoading();
    sectionTitle.textContent = 'Discover Videos';
    sectionSubtitle.textContent = 'Explore high-quality streams and instant downloads';

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(queryWord)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        renderVideoCards(data.result);
      } else {
        showEmpty();
      }
    } catch (err) {
      console.error('Initial search failed:', err);
      showError('Unable to fetch videos. Please check your network connection.');
    }
  }

  // Explicit User Search (Shows "Results for ...")
  async function performSearch(query) {
    showLoading();
    sectionTitle.textContent = `Results for "${query}"`;
    sectionSubtitle.textContent = `Showing top video streams for "${query}"`;

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        renderVideoCards(data.result);
      } else {
        showEmpty();
      }
    } catch (err) {
      console.error('Search failed:', err);
      showError('Unable to fetch videos. Please check your network connection.');
    }
  }

  function renderVideoCards(videos) {
    hideAllBrowseStates();
    videoGrid.innerHTML = '';
    totalLoadedVideosCount = videos.length;
    resultCount.textContent = `${totalLoadedVideosCount} Videos`;

    videos.forEach((video) => {
      const card = createVideoCardElement(video);
      videoGrid.appendChild(card);
    });

    videoGrid.classList.remove('hidden');
    loadMoreContainer.classList.remove('hidden');
  }

  function appendVideoCards(newVideos) {
    newVideos.forEach((video) => {
      const card = createVideoCardElement(video);
      videoGrid.appendChild(card);
    });

    totalLoadedVideosCount += newVideos.length;
    resultCount.textContent = `${totalLoadedVideosCount} Videos`;
  }

  function createVideoCardElement(video) {
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

    card.addEventListener('click', () => openWatchView(video));
    return card;
  }

  // ==========================================
  // WATCH PAGE & SUGGESTED RECOMMENDATIONS
  // ==========================================

  async function openWatchView(video) {
    currentActiveVideo = video;
    showWatchView();

    const title = decodeHtmlEntities(video.title || 'Untitled Video');
    const duration = video.duration || 'N/A';
    const cleanQuality = cleanQualityString(video.quality);

    // Reset Player UI
    playerLoading.classList.remove('hidden');
    playerError.classList.add('hidden');
    mainVideoPlayer.classList.add('hidden');
    customControls.classList.add('hidden');
    bigPlayBtn.classList.add('hidden');

    watchVideoTitle.textContent = title;
    watchVideoDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${duration}`;
    watchVideoQuality.innerHTML = `<i class="fa-solid fa-sliders"></i> ${cleanQuality}`;

    downloadBtn.classList.add('disabled');
    downloadBtnLabel.textContent = 'Download Video';
    currentStreamUrl = '';

    // Fetch Stream & Recommendations
    fetchStreamUrl(video.url, title);
    fetchRelatedRecommendations(title);
  }

  async function fetchStreamUrl(videoUrl, title) {
    try {
      const url = `${DETAIL_API_BASE}?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data && data.success && data.download_url) {
        currentStreamUrl = transformStreamUrl(data.download_url);

        playerLoading.classList.add('hidden');
        mainVideoPlayer.classList.remove('hidden');
        customControls.classList.remove('hidden');

        mainVideoPlayer.src = currentStreamUrl;
        mainVideoPlayer.play().catch(err => console.log('Autoplay policy info:', err));

        downloadBtn.classList.remove('disabled');
      } else {
        throw new Error('No stream URL in response');
      }
    } catch (err) {
      console.error('Stream fetch failed:', err);
      playerLoading.classList.add('hidden');
      mainVideoPlayer.classList.add('hidden');
      customControls.classList.add('hidden');
      playerError.classList.remove('hidden');
    }
  }

  async function fetchRelatedRecommendations(title) {
    relatedSkeleton.classList.remove('hidden');
    relatedList.innerHTML = '';

    const keywords = extractKeywords(title);

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(keywords)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Recommendation fetch failed');

      const data = await response.json();
      relatedSkeleton.classList.add('hidden');

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        const recs = data.result.filter(item => item.url !== currentActiveVideo.url);
        renderRelatedList(recs.length > 0 ? recs : data.result);
      } else {
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
      const randomWord = getRandomGenericWord();
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(randomWord)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.success && Array.isArray(data.result)) {
        renderRelatedList(data.result);
      }
    } catch (err) {}
  }

  function renderRelatedList(videos) {
    relatedList.innerHTML = '';

    videos.slice(0, 10).forEach(video => {
      const card = document.createElement('div');
      card.className = 'related-card';

      const title = decodeHtmlEntities(video.title || 'Suggested Video');
      const duration = video.duration || '';

      card.innerHTML = `
        <div class="related-thumb-box">
          <img src="${video.thumbnail}" alt="${escapeHtml(title)}" class="related-img" loading="lazy" onerror="this.src='https://via.placeholder.com/280x160/121216/9ca3af?text=No+Preview';" />
          ${duration ? `<span class="related-duration">${duration}</span>` : ''}
        </div>
        <div class="related-info">
          <h4 class="related-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h4>
          <span class="related-channel">Suggested Stream</span>
        </div>
      `;

      card.addEventListener('click', () => openWatchView(video));
      relatedList.appendChild(card);
    });
  }

  // ==========================================
  // UTILS & FORMATTING
  // ==========================================

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function extractKeywords(title) {
    if (!title) return getRandomGenericWord();
    const words = title.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3);
    if (words.length >= 2) return `${words[0]} ${words[1]}`;
    if (words.length === 1) return words[0];
    return getRandomGenericWord();
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
    loadMoreContainer.classList.add('hidden');
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
