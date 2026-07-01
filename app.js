const STORAGE_KEYS = Object.freeze({
  favorites: "europeDailyPhrases.favorites.v1",
  preferences: "europeDailyPhrases.preferences.v1",
  theme: "europeDailyPhrases.theme.v1",
  language: "europeDailyPhrases.language.v1",
});

const state = {
  language: readStorage(STORAGE_KEYS.language, "swedish"),
  view: "alphabet",
  category: "all",
  query: "",
  favorites: new Set(readStorage(STORAGE_KEYS.favorites, [])),
  preferences: readStorage(STORAGE_KEYS.preferences, {}),
  voices: [],
  currentAudio: null,
  toastTimer: null,
};

const elements = {
  body: document.body,
  languageSwitcher: document.querySelector("#language-switcher"),
  themeToggle: document.querySelector("#theme-toggle"),
  themeIcon: document.querySelector(".theme-icon"),
  themeLabel: document.querySelector(".theme-label"),
  searchInput: document.querySelector("#search-input"),
  voiceSelect: document.querySelector("#voice-select"),
  voiceStatus: document.querySelector("#voice-status"),
  speedControl: document.querySelector("#speed-control"),
  contentTabs: document.querySelector("#content-tabs"),
  categoryFilter: document.querySelector("#category-filter"),
  sectionKicker: document.querySelector("#section-kicker"),
  resultCount: document.querySelector("#result-count"),
  contentNote: document.querySelector("#content-note"),
  contentGrid: document.querySelector("#content-grid"),
  favoriteCount: document.querySelector("#favorite-count"),
  emptyState: document.querySelector("#empty-state"),
  clearFilters: document.querySelector("#clear-filters"),
  toast: document.querySelector("#toast"),
  themeMeta: document.querySelector('meta[name="theme-color"]'),
};

const speechSupported =
  "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage.`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to save ${key} to localStorage.`, error);
  }
}

function getLanguage() {
  return LANGUAGE_DATA[state.language] || LANGUAGE_DATA.swedish;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim();
}

function matchesQuery(...values) {
  if (!state.query) return true;
  const haystack = normalize(values.join(" "));
  return haystack.includes(normalize(state.query));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function preferenceFor(languageKey = state.language) {
  if (!state.preferences[languageKey]) {
    state.preferences[languageKey] = { rate: 0.85, voiceName: "" };
  }
  return state.preferences[languageKey];
}

function initializeTheme() {
  const stored = readStorage(STORAGE_KEYS.theme, "");
  const preferredDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(stored || (preferredDark ? "dark" : "light"));
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  elements.body.dataset.theme = isDark ? "dark" : "light";
  elements.themeIcon.textContent = isDark ? "☀" : "☾";
  elements.themeLabel.textContent = isDark ? "淺色" : "深色";
  elements.themeToggle.setAttribute("aria-label", `切換${isDark ? "淺色" : "深色"}模式`);
  elements.themeMeta.setAttribute("content", isDark ? "#121715" : "#f5f3ed");
  writeStorage(STORAGE_KEYS.theme, isDark ? "dark" : "light");
}

function renderLanguageSwitcher() {
  elements.languageSwitcher.innerHTML = Object.entries(LANGUAGE_DATA)
    .map(([key, language]) => {
      const selected = key === state.language;
      return `
        <button
          class="language-button"
          type="button"
          role="tab"
          data-language="${key}"
          aria-selected="${selected}"
          tabindex="${selected ? "0" : "-1"}"
        >
          <span class="flag" aria-hidden="true">${language.flag}</span>
          <span>
            <strong>${language.label}</strong>
            <small>${language.nativeName}</small>
          </span>
        </button>`;
    })
    .join("");
}

function renderCategoryFilters() {
  elements.categoryFilter.innerHTML = Object.entries(CATEGORY_LABELS)
    .map(
      ([key, label]) => `
        <button type="button" data-category="${key}" aria-pressed="${state.category === key}">
          ${label}
        </button>`,
    )
    .join("");
}

function renderSpeechControls(item, label) {
  const text = escapeHtml(item.speakText);
  const audioUrl = escapeHtml(item.audioUrl || "");
  return `
    <div class="speech-controls" aria-label="${escapeHtml(label)}發音控制">
      <button type="button" data-action="play" data-text="${text}" data-audio-url="${audioUrl}" title="播放發音" aria-label="播放${escapeHtml(label)}">▶</button>
      <button class="slow-play" type="button" data-action="play-slow" data-text="${text}" data-audio-url="${audioUrl}" title="慢速播放" aria-label="慢速播放${escapeHtml(label)}">0.72×</button>
      <button type="button" data-action="stop" title="停止播放" aria-label="停止播放">■</button>
    </div>`;
}

function renderAlphabetCard(item) {
  return `
    <article class="card alphabet-card" data-watermark="${escapeHtml(item.letter)}">
      <h3 class="letter">${escapeHtml(item.letter)}</h3>
      <p class="letter-name">${escapeHtml(item.name)}</p>
      <p class="pronunciation">中文近似音：${escapeHtml(item.pronunciation)}</p>
      ${item.note ? `<span class="foreign-tag">${escapeHtml(item.note)}</span>` : ""}
      ${renderSpeechControls(item, `字母 ${item.letter}`)}
    </article>`;
}

function renderNumberCard(item) {
  return `
    <article class="card number-card" data-watermark="${item.value}">
      <div class="number-card-header">
        <h3 class="number-value">${item.value}</h3>
      </div>
      <p class="number-word">${escapeHtml(item.word)}</p>
      <p class="pronunciation">${escapeHtml(item.pronunciation)}</p>
      ${renderSpeechControls(item, `數字 ${item.value}`)}
    </article>`;
}

function favoriteKey(languageKey, phraseId) {
  return `${languageKey}:${phraseId}`;
}

function renderPhraseCard(item, languageKey = state.language) {
  const key = favoriteKey(languageKey, item.id);
  const isFavorite = state.favorites.has(key);
  return `
    <article class="card phrase-card">
      <div class="phrase-card-header">
        <span class="category-tag">${CATEGORY_LABELS[item.category] || item.category}</span>
        <button
          class="card-action favorite-button ${isFavorite ? "is-favorite" : ""}"
          type="button"
          data-action="favorite"
          data-language="${languageKey}"
          data-id="${escapeHtml(item.id)}"
          aria-pressed="${isFavorite}"
          aria-label="${isFavorite ? "取消收藏" : "加入收藏"}：${escapeHtml(item.meaning)}"
          title="${isFavorite ? "取消收藏" : "加入收藏"}"
        >${isFavorite ? "♥" : "♡"}</button>
      </div>
      <p class="phrase-meaning">${escapeHtml(item.meaning)}</p>
      <h3 class="phrase-original" lang="${LANGUAGE_DATA[languageKey].speechLang}">${escapeHtml(item.original)}</h3>
      <p class="phrase-pronunciation">${escapeHtml(item.pronunciation)}</p>
      <p class="phrase-context">${escapeHtml(item.context)}</p>
      <div class="phrase-actions">
        ${renderSpeechControls(item, item.meaning)}
        <button
          class="card-action"
          type="button"
          data-action="copy"
          data-copy="${escapeHtml(item.original)}"
          aria-label="複製原文：${escapeHtml(item.original)}"
          title="複製原文"
        >⧉</button>
      </div>
    </article>`;
}

function getFavoritePhrases() {
  const items = [];
  Object.entries(LANGUAGE_DATA).forEach(([languageKey, language]) => {
    language.phrases.forEach((phrase) => {
      if (state.favorites.has(favoriteKey(languageKey, phrase.id))) {
        items.push({ phrase, languageKey });
      }
    });
  });
  return items;
}

function renderContent() {
  const language = getLanguage();
  let cards = [];
  let note = "";

  elements.body.dataset.language = state.language;
  elements.sectionKicker.textContent = `${language.nativeName.toUpperCase()} · ${language.label}`;
  elements.categoryFilter.classList.toggle(
    "is-hidden",
    state.view !== "phrases" && state.view !== "favorites",
  );

  elements.contentTabs.querySelectorAll("[data-view]").forEach((button) => {
    const selected = button.dataset.view === state.view;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });

  if (state.view === "alphabet") {
    note = language.alphabetNote;
    cards = language.alphabet
      .filter((item) =>
        matchesQuery(item.letter, item.name, item.pronunciation, item.note),
      )
      .map(renderAlphabetCard);
  } else if (state.view === "numbers") {
    note = "點按 ▶ 依目前設定播放；0.72× 可隨時慢速重聽。複合數字已依各語言規則產生。";
    cards = language.numbers
      .filter((item) => matchesQuery(item.value, item.word, item.pronunciation))
      .map(renderNumberCard);
  } else if (state.view === "phrases") {
    cards = language.phrases
      .filter(
        (item) =>
          (state.category === "all" || item.category === state.category) &&
          matchesQuery(item.meaning, item.original, item.pronunciation, item.context),
      )
      .map((item) => renderPhraseCard(item));
  } else {
    note = "收藏會保存在這台裝置的瀏覽器中，重新整理後仍會保留。";
    cards = getFavoritePhrases()
      .filter(
        ({ phrase }) =>
          (state.category === "all" || phrase.category === state.category) &&
          matchesQuery(
            phrase.meaning,
            phrase.original,
            phrase.pronunciation,
            phrase.context,
          ),
      )
      .map(({ phrase, languageKey }) => renderPhraseCard(phrase, languageKey));
  }

  elements.contentNote.textContent = note;
  elements.contentGrid.className = `card-grid ${
    state.view === "alphabet"
      ? "alphabet-grid"
      : state.view === "numbers"
        ? "number-grid"
        : "phrase-grid"
  }`;
  elements.contentGrid.innerHTML = cards.join("");
  elements.resultCount.textContent = `${cards.length} 筆內容`;
  elements.emptyState.classList.toggle("is-hidden", cards.length > 0);
  elements.contentGrid.classList.toggle("is-hidden", cards.length === 0);
  updateFavoriteCount();
}

function updateFavoriteCount() {
  elements.favoriteCount.textContent = String(state.favorites.size);
}

function setLanguage(languageKey) {
  if (!LANGUAGE_DATA[languageKey] || languageKey === state.language) return;
  stopPlayback();
  state.language = languageKey;
  state.category = "all";
  writeStorage(STORAGE_KEYS.language, state.language);
  renderLanguageSwitcher();
  renderCategoryFilters();
  updateVoiceOptions();
  updateSpeedControls();
  renderContent();
}

function setView(view) {
  if (!["alphabet", "phrases", "numbers", "favorites"].includes(view)) return;
  state.view = view;
  if (view !== "phrases" && view !== "favorites") state.category = "all";
  renderCategoryFilters();
  renderContent();
}

function setCategory(category) {
  if (!(category in CATEGORY_LABELS)) return;
  state.category = category;
  renderCategoryFilters();
  renderContent();
}

function toggleFavorite(languageKey, phraseId) {
  const key = favoriteKey(languageKey, phraseId);
  const adding = !state.favorites.has(key);
  if (adding) state.favorites.add(key);
  else state.favorites.delete(key);
  writeStorage(STORAGE_KEYS.favorites, [...state.favorites]);
  renderContent();
  showToast(adding ? "已加入收藏" : "已取消收藏");
}

function loadVoices() {
  if (!speechSupported) return;
  state.voices = window.speechSynthesis.getVoices();
  updateVoiceOptions();
}

function voicesForCurrentLanguage() {
  const prefix = getLanguage().speechLang.split("-")[0].toLowerCase();
  return state.voices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix));
}

function updateVoiceOptions() {
  if (!speechSupported) return;
  const language = getLanguage();
  const voices = voicesForCurrentLanguage();
  const preference = preferenceFor();
  elements.voiceSelect.innerHTML = "";

  if (!voices.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = `找不到 ${language.nativeName} 語音`;
    elements.voiceSelect.append(option);
    elements.voiceSelect.disabled = true;
    elements.voiceStatus.textContent =
      "此裝置目前沒有安裝這個語言的語音，請改用其他瀏覽器或系統語音設定。";
    return;
  }

  voices
    .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name))
    .forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} · ${voice.lang}${voice.default ? "（系統預設）" : ""}`;
      elements.voiceSelect.append(option);
    });

  const selectedExists = voices.some((voice) => voice.name === preference.voiceName);
  const selected = selectedExists
    ? preference.voiceName
    : (voices.find((voice) => voice.lang === language.speechLang) || voices[0]).name;
  elements.voiceSelect.value = selected;
  elements.voiceSelect.disabled = false;
  elements.voiceStatus.textContent = "";

  if (selected !== preference.voiceName) {
    preference.voiceName = selected;
    savePreferences();
  }
}

function updateSpeedControls() {
  const rate = Number(preferenceFor().rate || 0.85);
  elements.speedControl.querySelectorAll("[data-rate]").forEach((button) => {
    button.setAttribute("aria-checked", String(Number(button.dataset.rate) === rate));
  });
}

function savePreferences() {
  writeStorage(STORAGE_KEYS.preferences, state.preferences);
}

function stopPlayback() {
  if (speechSupported) window.speechSynthesis.cancel();
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio.currentTime = 0;
    state.currentAudio = null;
  }
}

function playSpeech(text, audioUrl = "", overrideRate = null, languageKey = state.language) {
  stopPlayback();
  const preference = preferenceFor(languageKey);
  const rate = overrideRate ?? Number(preference.rate || 0.85);

  if (audioUrl) {
    const audio = new Audio(audioUrl);
    state.currentAudio = audio;
    audio.playbackRate = rate;
    audio.addEventListener("ended", () => {
      if (state.currentAudio === audio) state.currentAudio = null;
    });
    audio.play().catch(() => {
      state.currentAudio = null;
      showToast("音檔無法播放，已改用系統語音");
      speakWithWebApi(text, rate, languageKey);
    });
    return;
  }

  speakWithWebApi(text, rate, languageKey);
}

function speakWithWebApi(text, rate, languageKey) {
  if (!speechSupported) {
    showToast("此瀏覽器不支援語音播放");
    return;
  }

  const language = LANGUAGE_DATA[languageKey] || getLanguage();
  const prefix = language.speechLang.split("-")[0].toLowerCase();
  const availableVoices = state.voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(prefix),
  );
  const preference = preferenceFor(languageKey);

  if (!availableVoices.length) {
    showToast("此裝置尚未安裝這個語言的語音");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language.speechLang;
  utterance.rate = rate;
  utterance.voice =
    availableVoices.find((voice) => voice.name === preference.voiceName) ||
    availableVoices.find((voice) => voice.lang === language.speechLang) ||
    availableVoices[0];
  utterance.onerror = (event) => {
    if (event.error !== "canceled" && event.error !== "interrupted") {
      showToast("目前無法播放語音，請檢查系統語音設定");
    }
  };
  window.speechSynthesis.speak(utterance);
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Copy command failed");
    }
    showToast("已複製原文");
  } catch {
    showToast("無法自動複製，請長按文字複製");
  }
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function handleGridAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "play" || action === "play-slow") {
    const phraseCard = button.closest(".phrase-card");
    const favoriteButton = phraseCard?.querySelector("[data-language]");
    const languageKey = favoriteButton?.dataset.language || state.language;
    playSpeech(
      button.dataset.text,
      button.dataset.audioUrl,
      action === "play-slow" ? 0.72 : null,
      languageKey,
    );
  } else if (action === "stop") {
    stopPlayback();
  } else if (action === "favorite") {
    toggleFavorite(button.dataset.language, button.dataset.id);
  } else if (action === "copy") {
    copyText(button.dataset.copy);
  }
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", () => {
    applyTheme(elements.body.dataset.theme === "dark" ? "light" : "dark");
  });

  elements.languageSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-language]");
    if (button) setLanguage(button.dataset.language);
  });

  elements.contentTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) setView(button.dataset.view);
  });

  elements.categoryFilter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderContent();
  });

  elements.searchInput.addEventListener("search", (event) => {
    state.query = event.target.value;
    renderContent();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      elements.searchInput.focus();
    }
    if (event.key === "Escape") stopPlayback();
  });

  elements.voiceSelect.addEventListener("change", () => {
    preferenceFor().voiceName = elements.voiceSelect.value;
    savePreferences();
  });

  elements.speedControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rate]");
    if (!button) return;
    preferenceFor().rate = Number(button.dataset.rate);
    savePreferences();
    updateSpeedControls();
  });

  elements.contentGrid.addEventListener("click", handleGridAction);

  elements.clearFilters.addEventListener("click", () => {
    state.query = "";
    state.category = "all";
    elements.searchInput.value = "";
    renderCategoryFilters();
    renderContent();
  });

  window.addEventListener("pagehide", stopPlayback);
}

function initializeSpeech() {
  if (!speechSupported) {
    elements.body.classList.add("no-speech");
    elements.voiceStatus.textContent =
      "此瀏覽器不支援語音播放；其他查詢、收藏與複製功能仍可正常使用。";
    return;
  }

  loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
  window.setTimeout(loadVoices, 250);
  window.setTimeout(loadVoices, 1000);
}

function initialize() {
  if (!(state.language in LANGUAGE_DATA)) state.language = "swedish";
  initializeTheme();
  renderLanguageSwitcher();
  renderCategoryFilters();
  updateSpeedControls();
  bindEvents();
  initializeSpeech();
  renderContent();
}

initialize();
