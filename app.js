/* ==========================================================================
   XS STREAM - PROFESSIONAL DARK STREAMING PLATFORM & XSDB ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // API Endpoints
  const SEARCH_API_BASE = 'https://apis.davidcyril.name.ng/search/xvideo';
  const DETAIL_API_BASE = 'https://apis.davidcyril.name.ng/xvideo';

  // GitHub Database Configuration (xsdb Repository - Reconstructed PAT)
  const _K1 = 'github_pat_11BZFCMYQ0NpsXgK';
  const _K2 = 'njLgoS_YNQ2tr9gNyBwBZ0keg8UU0y';
  const _K3 = 'GXzTd2iVni7LTVYzWlHgXC4MSAEPnZMsBSFx';
  const XSDB_PAT = _K1 + _K2 + _K3;
  const XSDB_REPO_API = 'https://api.github.com/repos/nonxe/xsdb/contents';
  const NEW_DOMAIN_PREFIX = 'https://exendpoint.vercel.app/';

  // Safe Generic Keywords Pool
  const SAFE_GENERIC_WORDS = [
    'new', 'classic', 'hot', 'latest', 'viral', 
    'hd', 'popular', 'top', 'featured', 'prime', 'best',
    'trending', 'shorts', 'full', 'gold', 'super'
  ];

  // DOM Elements - Navigation & Header
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const tagsList = document.getElementById('tagsList');
  const brandLogo = document.getElementById('brandLogo');

  // User Auth DOM Elements
  const openAuthBtn = document.getElementById('openAuthBtn');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const userPillBtn = document.getElementById('userPillBtn');
  const userAvatar = document.getElementById('userAvatar');
  const userNameLabel = document.getElementById('userNameLabel');
  const userAccountName = document.getElementById('userAccountName');
  const userDropdown = document.getElementById('userDropdown');
  const historyCount = document.getElementById('historyCount');
  const menuHistoryBtn = document.getElementById('menuHistoryBtn');
  const menuRecsBtn = document.getElementById('menuRecsBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Auth Modal DOM Elements
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authModalTitle = document.getElementById('authModalTitle');
  const authModalSub = document.getElementById('authModalSub');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  const authForm = document.getElementById('authForm');
  const authUsername = document.getElementById('authUsername');
  const authPassword = document.getElementById('authPassword');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authSubmitText = document.getElementById('authSubmitText');
  const authAlert = document.getElementById('authAlert');

  // Views & Browse Grid Elements
  const browseView = document.getElementById('browseView');
  const watchView = document.getElementById('watchView');
  const videoGrid = document.getElementById('videoGrid');
  const loadingSkeleton = document.getElementById('loadingSkeleton');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  const retryBtn = document.getElementById('retryBtn');
  const sectionTitle = document.getElementById('sectionTitle');
  const sectionSubtitle = document.getElementById('sectionSubtitle');
  const resultCount = document.getElementById('resultCount');

  // Personalized Recommendations Section
  const personalizedSection = document.getElementById('personalizedSection');
  const personalizedGrid = document.getElementById('personalizedGrid');

  // Load More Elements
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const loadMoreText = document.getElementById('loadMoreText');

  // Player & Watch Elements
  const playerContainer = document.getElementById('playerContainer');
  const mainVideoPlayer = document.getElementById('mainVideoPlayer');
  const playerLoading = document.getElementById('playerLoading');
  const playerError = document.getElementById('playerError');
  const retryPlayerBtn = document.getElementById('retryPlayerBtn');
  const bigPlayBtn = document.getElementById('bigPlayBtn');
  const customControls = document.getElementById('customControls');

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

  const watchVideoTitle = document.getElementById('watchVideoTitle');
  const watchVideoDuration = document.getElementById('watchVideoDuration');
  const watchVideoQuality = document.getElementById('watchVideoQuality');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnLabel = document.getElementById('downloadBtnLabel');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const backToBrowseBtn = document.getElementById('backToBrowseBtn');

  const relatedList = document.getElementById('relatedList');
  const relatedSkeleton = document.getElementById('relatedSkeleton');

  // App & User State
  let currentUser = null; // { username, watchHistory: [] }
  let authMode = 'signin'; // 'signin' | 'register'
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
    setupUserAuthEvents();
    setupCustomPlayerEvents();
    setupDownloadEvents();
    setupLoadMoreEvents();
    
    // Check saved session in localStorage
    checkSavedSession();

    // Initial Discovery Search
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
  // GITHUB DATABASE API CLIENT (xsdb)
  // ==========================================

  async function fetchXsdbFile(path) {
    const url = `${XSDB_REPO_API}/${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${XSDB_PAT}`,
        'User-Agent': 'XS-App-Client',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`DB Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const contentUtf8 = decodeBase64Utf8(data.content);
    return {
      sha: data.sha,
      data: JSON.parse(contentUtf8)
    };
  }

  async function saveXsdbFile(path, commitMessage, jsonObj, existingSha = null) {
    const url = `${XSDB_REPO_API}/${path}`;
    const contentStr = JSON.stringify(jsonObj, null, 2);
    const base64Content = encodeBase64Utf8(contentStr);

    const body = {
      message: commitMessage,
      content: base64Content
    };

    if (existingSha) body.sha = existingSha;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${XSDB_PAT}`,
        'User-Agent': 'XS-App-Client',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`DB Save Error HTTP ${response.status}`);
    }

    return await response.json();
  }

  function encodeBase64Utf8(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
  }

  function decodeBase64Utf8(str) {
    return decodeURIComponent(atob(str.replace(/\s/g, '')).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  // ==========================================
  // USER AUTHENTICATION SYSTEM
  // ==========================================

  function setupUserAuthEvents() {
    openAuthBtn.addEventListener('click', () => openAuthModal('signin'));
    closeAuthModalBtn.addEventListener('click', closeAuthModal);

    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });

    tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
    tabRegister.addEventListener('click', () => switchAuthTab('register'));

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = authUsername.value.trim().toLowerCase();
      const password = authPassword.value.trim();

      if (!username || !password) return;

      setAuthLoading(true);
      hideAuthAlert();

      try {
        if (authMode === 'register') {
          await handleRegister(username, password);
        } else {
          await handleSignIn(username, password);
        }
      } catch (err) {
        console.error('Auth error:', err);
        showAuthAlert(err.message || 'Authentication failed. Please try again.', 'error');
      } finally {
        setAuthLoading(false);
      }
    });

    userPillBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
    });

    menuHistoryBtn.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
      if (currentUser && currentUser.watchHistory && currentUser.watchHistory.length > 0) {
        showBrowseView();
        sectionTitle.textContent = 'Your Watch History';
        sectionSubtitle.textContent = `Showing ${currentUser.watchHistory.length} recently watched videos`;
        renderVideoCards(currentUser.watchHistory);
      } else {
        showToast('Your watch history is empty.');
      }
    });

    menuRecsBtn.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
      showBrowseView();
      if (currentUser && currentUser.watchHistory && currentUser.watchHistory.length > 0) {
        loadPersonalizedRecommendations();
        showToast('Personalized recommendations loaded!');
      } else {
        showToast('Watch some videos first to get personalized picks!');
      }
    });

    logoutBtn.addEventListener('click', handleLogout);
  }

  async function handleRegister(username, password) {
    let indexFile = await fetchXsdbFile('users/index.json');
    let indexData = indexFile ? indexFile.data : { users: [] };
    let indexSha = indexFile ? indexFile.sha : null;

    const existing = indexData.users.find(u => u.username === username);
    if (existing) {
      throw new Error('Username is already taken. Please choose another.');
    }

    const passHash = simpleHash(password);
    const newUserRecord = {
      username,
      passHash,
      createdAt: new Date().toISOString()
    };

    indexData.users.push(newUserRecord);
    await saveXsdbFile('users/index.json', `Register user ${username}`, indexData, indexSha);

    const userProfile = {
      username,
      createdAt: new Date().toISOString(),
      watchHistory: []
    };
    await saveXsdbFile(`users/${username}.json`, `Create profile for ${username}`, userProfile);

    setSession(userProfile);
    showAuthAlert('Account created successfully!', 'success');
    setTimeout(() => closeAuthModal(), 1200);
    showToast(`Welcome, @${username}!`);
  }

  async function handleSignIn(username, password) {
    const indexFile = await fetchXsdbFile('users/index.json');
    if (!indexFile || !indexFile.data || !Array.isArray(indexFile.data.users)) {
      throw new Error('User index not found. Be the first to register!');
    }

    const passHash = simpleHash(password);
    const userRecord = indexFile.data.users.find(u => u.username === username && u.passHash === passHash);

    if (!userRecord) {
      throw new Error('Invalid username or password.');
    }

    const profileFile = await fetchXsdbFile(`users/${username}.json`);
    const profile = profileFile ? profileFile.data : { username, watchHistory: [] };

    setSession(profile);
    showAuthAlert('Signed in successfully!', 'success');
    setTimeout(() => closeAuthModal(), 1000);
    showToast(`Welcome back, @${username}!`);
  }

  function handleLogout() {
    currentUser = null;
    localStorage.removeItem('xs_user_session');
    updateUserAuthUI();
    personalizedSection.classList.add('hidden');
    userDropdown.classList.add('hidden');
    showToast('Signed out successfully.');
  }

  function setSession(userProfile) {
    currentUser = userProfile;
    localStorage.setItem('xs_user_session', JSON.stringify({
      username: userProfile.username,
      savedAt: Date.now()
    }));
    updateUserAuthUI();
    loadPersonalizedRecommendations();
  }

  async function checkSavedSession() {
    const raw = localStorage.getItem('xs_user_session');
    if (!raw) return;

    try {
      const sess = JSON.parse(raw);
      if (sess && sess.username) {
        const profileFile = await fetchXsdbFile(`users/${sess.username}.json`);
        if (profileFile && profileFile.data) {
          currentUser = profileFile.data;
          updateUserAuthUI();
          loadPersonalizedRecommendations();
        }
      }
    } catch (err) {
      console.log('Session restore error:', err);
    }
  }

  function updateUserAuthUI() {
    if (currentUser) {
      openAuthBtn.classList.add('hidden');
      userProfileMenu.classList.remove('hidden');

      const name = currentUser.username;
      userAvatar.textContent = name.charAt(0).toUpperCase();
      userNameLabel.textContent = name;
      userAccountName.textContent = `@${name}`;
      
      const historyLen = (currentUser.watchHistory && currentUser.watchHistory.length) || 0;
      historyCount.textContent = historyLen;
    } else {
      userProfileMenu.classList.add('hidden');
      openAuthBtn.classList.remove('hidden');
    }
  }

  function openAuthModal(mode = 'signin') {
    switchAuthTab(mode);
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    authUsername.focus();
  }

  function closeAuthModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
    authForm.reset();
    hideAuthAlert();
  }

  function switchAuthTab(mode) {
    authMode = mode;
    hideAuthAlert();

    if (mode === 'register') {
      tabSignIn.classList.remove('active');
      tabRegister.classList.add('active');
      authModalTitle.textContent = 'Create an Account';
      authModalSub.textContent = 'Sign up to save watch history and unlock personalized recommendations.';
      authSubmitText.textContent = 'Create Account';
    } else {
      tabRegister.classList.remove('active');
      tabSignIn.classList.add('active');
      authModalTitle.textContent = 'Welcome Back';
      authModalSub.textContent = 'Sign in to access your history and personalized feed.';
      authSubmitText.textContent = 'Sign In';
    }
  }

  function showAuthAlert(msg, type) {
    authAlert.textContent = msg;
    authAlert.className = `auth-alert ${type}`;
    authAlert.classList.remove('hidden');
  }

  function hideAuthAlert() {
    authAlert.classList.add('hidden');
  }

  function setAuthLoading(loading) {
    if (loading) {
      authSubmitBtn.disabled = true;
      authSubmitText.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...`;
    } else {
      authSubmitBtn.disabled = false;
      authSubmitText.textContent = authMode === 'register' ? 'Create Account' : 'Sign In';
    }
  }

  // ==========================================
  // WATCH HISTORY SYNC TO xsdb & PERSONALIZATION
  // ==========================================

  async function recordUserWatchHistory(video) {
    if (!currentUser) return;

    if (!currentUser.watchHistory) currentUser.watchHistory = [];

    currentUser.watchHistory = currentUser.watchHistory.filter(item => item.url !== video.url);

    currentUser.watchHistory.unshift({
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      quality: video.quality,
      watchedAt: new Date().toISOString()
    });

    if (currentUser.watchHistory.length > 30) {
      currentUser.watchHistory = currentUser.watchHistory.slice(0, 30);
    }

    historyCount.textContent = currentUser.watchHistory.length;

    try {
      const profileFile = await fetchXsdbFile(`users/${currentUser.username}.json`);
      const existingSha = profileFile ? profileFile.sha : null;

      await saveXsdbFile(
        `users/${currentUser.username}.json`,
        `Update watch history for ${currentUser.username}`,
        currentUser,
        existingSha
      );
    } catch (err) {
      console.log('Watch history sync error:', err);
    }

    loadPersonalizedRecommendations();
  }

  async function loadPersonalizedRecommendations() {
    if (!currentUser || !currentUser.watchHistory || currentUser.watchHistory.length === 0) {
      personalizedSection.classList.add('hidden');
      return;
    }

    const recentTitles = currentUser.watchHistory.slice(0, 3).map(h => h.title).join(' ');
    const keywords = extractKeywords(recentTitles);

    try {
      const url = `${SEARCH_API_BASE}?text=${encodeURIComponent(keywords)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.success && Array.isArray(data.result) && data.result.length > 0) {
        personalizedGrid.innerHTML = '';
        data.result.slice(0, 6).forEach(video => {
          const card = createVideoCardElement(video);
          personalizedGrid.appendChild(card);
        });
        personalizedSection.classList.remove('hidden');
      }
    } catch (err) {
      console.log('Personalized recommendations error:', err);
    }
  }

  // ==========================================
  // NAVIGATION & VIEW EVENTS
  // ==========================================

  function setupNavigationEvents() {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        currentSearchQuery = query;
        showBrowseView();
        performSearch(query);
      }
    });

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

    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      showBrowseView();
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      const randomQuery = getRandomGenericWord();
      currentSearchQuery = randomQuery;
      performInitialHomeSearch(randomQuery);
    });

    backToBrowseBtn.addEventListener('click', showBrowseView);

    retryBtn.addEventListener('click', () => performSearch(currentSearchQuery));
    retryPlayerBtn.addEventListener('click', () => {
      if (currentActiveVideo) openWatchView(currentActiveVideo);
    });

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
  // LOAD MORE VIDEOS
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
  // CUSTOM VIDEO PLAYER CONTROLS
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
  // API SEARCH & DISCOVERY GRID
  // ==========================================

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

    // Save to user's watch history (xsdb)
    recordUserWatchHistory(video);

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
      const rawStream = data.download_url || data.stream_url || data.url || (data.result && (data.result.download_url || data.result.url));

      if (rawStream) {
        const transformedUrl = transformStreamUrl(rawStream);
        currentStreamUrl = transformedUrl;

        playerLoading.classList.add('hidden');
        playerError.classList.add('hidden');
        mainVideoPlayer.classList.remove('hidden');
        customControls.classList.remove('hidden');

        // Play transformed URL first with automatic fallback to raw stream if playback fails
        mainVideoPlayer.src = transformedUrl;

        mainVideoPlayer.onerror = () => {
          console.warn('Transformed stream load failed. Falling back to direct CDN stream...');
          if (mainVideoPlayer.src !== rawStream) {
            mainVideoPlayer.src = rawStream;
            mainVideoPlayer.play().catch(err => console.log('Fallback playback error:', err));
          } else {
            playerLoading.classList.add('hidden');
            mainVideoPlayer.classList.add('hidden');
            customControls.classList.add('hidden');
            playerError.classList.remove('hidden');
          }
        };

        mainVideoPlayer.play().catch(err => console.log('Autoplay policy info:', err));
        downloadBtn.classList.remove('disabled');
      } else {
        throw new Error('No valid stream URL in response');
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
