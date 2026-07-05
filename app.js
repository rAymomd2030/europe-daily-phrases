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
  speechItems: new Map(),
  speechSequence: 0,
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
  voiceDiagnostic: document.querySelector("#voice-diagnostic"),
  diagnosticLanguage: document.querySelector("#diagnostic-language"),
  diagnosticTarget: document.querySelector("#diagnostic-target"),
  diagnosticVoice: document.querySelector("#diagnostic-voice"),
  diagnosticVoiceLang: document.querySelector("#diagnostic-voice-lang"),
  diagnosticMatch: document.querySelector("#diagnostic-match"),
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

function getStoredVoiceName(languageKey) {
  try {
    return localStorage.getItem(`speechVoice.${languageKey}`) || "";
  } catch {
    return "";
  }
}

function storeVoiceName(languageKey, voiceName) {
  try {
    localStorage.setItem(`speechVoice.${languageKey}`, voiceName);
  } catch (error) {
    console.warn(`Unable to save speechVoice.${languageKey}.`, error);
  }
}

function getLanguage(languageKey = state.language) {
  return LANGUAGE_DATA[languageKey] || LANGUAGE_DATA.swedish;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim();
}

function normalizeLang(lang) {
  return String(lang || "").toLowerCase().replaceAll("_", "-");
}

function matchesQuery(...values) {
  if (!state.query) return true;
  return normalize(values.join(" ")).includes(normalize(state.query));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSpeakableText(item) {
  return item?.speechText || item?.text || item?.native || "";
}

function preferenceFor(languageKey = state.language) {
  if (!state.preferences[languageKey]) {
    state.preferences[languageKey] = { rate: 0.85 };
  }
  return state.preferences[languageKey];
}

function getCurrentSpeechRate() {
  return Number(preferenceFor("swedish").rate || 0.85);
}

function setSharedSpeechRate(rate) {
  Object.keys(LANGUAGE_DATA).forEach((languageKey) => {
    preferenceFor(languageKey).rate = rate;
  });
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

function registerSpeechItem(item, languageKey) {
  const speechId = `speech-${++state.speechSequence}`;
  state.speechItems.set(speechId, { item, languageKey });
  return speechId;
}

function renderSpeechControls(item, label, languageKey = state.language) {
  const speechId = registerSpeechItem(item, languageKey);
  return `
    <div class="speech-controls" aria-label="${escapeHtml(label)}發音控制">
      <button type="button" data-action="play" data-speech-id="${speechId}" title="播放發音" aria-label="播放${escapeHtml(label)}">▶</button>
      <button class="slow-play" type="button" data-action="play-slow" data-speech-id="${speechId}" title="慢速播放" aria-label="慢速播放${escapeHtml(label)}">0.72×</button>
      <button type="button" data-action="stop" title="停止播放" aria-label="停止播放">■</button>
    </div>`;
}

function renderAlphabetCard(item) {
  return `
    <article class="card alphabet-card" data-watermark="${escapeHtml(item.text)}">
      <h3 class="letter">${escapeHtml(item.text)}</h3>
      <p class="letter-name">${escapeHtml(item.name)}</p>
      <p class="pronunciation">中文近似音：${escapeHtml(item.pronunciation)}</p>
      ${item.note ? `<span class="foreign-tag">${escapeHtml(item.note)}</span>` : ""}
      ${renderSpeechControls(item, `字母 ${item.text}`)}
    </article>`;
}

function renderNumberCard(item, variant = "") {
  return `
    <article class="card number-card ${variant}" data-watermark="${escapeHtml(item.value)}">
      <div class="number-card-header">
        <h3 class="number-value">${escapeHtml(item.value)}</h3>
        ${item.category ? `<span class="number-kind">${escapeHtml(item.category === "decimal" ? "小數" : item.category === "example" ? "練習" : "")}</span>` : ""}
      </div>
      <p class="number-word">${escapeHtml(item.text)}</p>
      ${item.meaning ? `<p class="number-meaning">${escapeHtml(item.meaning)}</p>` : ""}
      ${item.pronunciation ? `<p class="pronunciation">近似音：${escapeHtml(item.pronunciation)}</p>` : ""}
      ${item.formula ? `<p class="number-formula">${escapeHtml(item.formula)}</p>` : ""}
      ${item.note ? `<p class="number-note">${escapeHtml(item.note)}</p>` : ""}
      ${renderSpeechControls(item, `數字 ${item.value}`)}
    </article>`;
}

function renderRuleCard(rule) {
  return `
    <article class="formula-card">
      <p class="formula-label">${escapeHtml(rule.title)}</p>
      <h4>${escapeHtml(rule.formula)}</h4>
      <p>${escapeHtml(rule.description)}</p>
    </article>`;
}

function renderExceptionCard(item) {
  return `
    <article class="exception-card">
      <span aria-hidden="true">!</span>
      <div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </article>`;
}

function renderNumberSection(title, description, content, className = "") {
  if (!content) return "";
  return `
    <section class="number-rule-section ${className}">
      <div class="rule-section-heading">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
      </div>
      ${content}
    </section>`;
}

function renderNumberRules(language) {
  const data = language.numberRules;
  let count = 0;

  const core = data.coreNumbers.filter((item) =>
    matchesQuery(item.value, item.text, item.meaning, item.pronunciation, item.note),
  );
  const tens = data.tens.filter((item) =>
    matchesQuery(item.value, item.text, item.meaning, item.pronunciation, item.note),
  );
  const rules = data.rules.filter((item) =>
    matchesQuery(item.title, item.formula, item.description),
  );
  const exceptions = data.exceptions.filter((item) =>
    matchesQuery(item.title, item.text),
  );
  const examples = data.examples.filter((item) =>
    matchesQuery(
      item.value,
      item.text,
      item.meaning,
      item.pronunciation,
      item.formula,
      item.note,
    ),
  );
  const decimalHeaderMatches = matchesQuery(
    "小數點 小數逗號",
    data.decimalRules.separatorName,
    data.decimalRules.separatorSymbol,
    data.decimalRules.readingRule,
    data.decimalRules.description,
  );
  const decimals = data.decimalRules.examples.filter((item) =>
    decimalHeaderMatches ||
    matchesQuery(item.value, item.text, item.meaning, item.note),
  );

  count =
    core.length +
    tens.length +
    rules.length +
    exceptions.length +
    decimals.length +
    examples.length;

  const coreHtml = core.length
    ? `<div class="number-basics-grid">${core.map((item) => renderNumberCard(item, "compact-number")).join("")}</div>`
    : "";
  const tensHtml = tens.length
    ? `<div class="number-basics-grid tens-grid">${tens.map((item) => renderNumberCard(item, "compact-number")).join("")}</div>`
    : "";
  const rulesHtml = rules.length
    ? `<div class="formula-grid">${rules.map(renderRuleCard).join("")}</div>`
    : "";
  const exceptionHtml = exceptions.length
    ? `<div class="exception-grid">${exceptions.map(renderExceptionCard).join("")}</div>`
    : "";
  const decimalHtml = decimals.length
    ? `
      <div class="decimal-intro">
        <div class="decimal-symbol" aria-label="小數逗號">${escapeHtml(data.decimalRules.separatorSymbol)}</div>
        <div>
          <p class="formula-label">當地語言稱作「小數逗號」</p>
          <h4>${escapeHtml(data.decimalRules.separatorName)}</h4>
          <p><strong>${escapeHtml(data.decimalRules.readingRule)}</strong></p>
          <p>${escapeHtml(data.decimalRules.description)} 小數分隔符顯示為逗號 <code>,</code>，相當於中文的小數點。</p>
        </div>
      </div>
      <div class="decimal-grid">${decimals.map((item) => renderNumberCard(item, "decimal-card")).join("")}</div>`
    : "";
  const examplesHtml = examples.length
    ? `<div class="practice-grid">${examples.map((item) => renderNumberCard(item, "practice-card")).join("")}</div>`
    : "";

  return {
    count,
    html: [
      renderNumberSection("1. 核心數字", "先掌握 0–19，後面的數字就有材料可以組合。", coreHtml),
      renderNumberSection("2. 十位數", "把整十記熟，再用各語言的組合方向接上個位數。", tensHtml),
      renderNumberSection("3. 組成規則", "看懂方向與連接方式，不必死背完整 1–100。", rulesHtml, "formula-section"),
      renderNumberSection("4. 特殊變化", "這些是最值得另外記住的拼法與順序。", exceptionHtml, "exception-section"),
      renderNumberSection("5. 小數點讀法", "畫面稱為小數點；當地語言概念標示為「小數逗號」。", decimalHtml, "decimal-section"),
      renderNumberSection("6. 練習範例", "用同一套公式拆解常見的兩位數。", examplesHtml, "practice-section"),
    ].join(""),
  };
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
      <h3 class="phrase-original" lang="${getLanguage(languageKey).speechLang}">${escapeHtml(item.text)}</h3>
      <p class="phrase-pronunciation">${escapeHtml(item.pronunciation)}</p>
      <p class="phrase-context">${escapeHtml(item.context)}</p>
      <div class="phrase-actions">
        ${renderSpeechControls(item, item.meaning, languageKey)}
        <button
          class="card-action"
          type="button"
          data-action="copy"
          data-copy="${escapeHtml(item.text)}"
          aria-label="複製原文：${escapeHtml(item.text)}"
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
  let html = "";
  let count = 0;
  let note = "";

  state.speechItems.clear();
  state.speechSequence = 0;
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
    note = `${language.alphabetNote} 播放時只朗讀該語言的字母名稱，不會加入其他提示詞。`;
    cards = language.alphabet
      .filter((item) =>
        matchesQuery(item.text, item.name, item.pronunciation, item.note),
      )
      .map(renderAlphabetCard);
    count = cards.length;
    html = cards.join("");
  } else if (state.view === "numberRules") {
    note = "先學公式，再用練習卡驗證；播放只會朗讀當地語言的 speechText。";
    const result = renderNumberRules(language);
    count = result.count;
    html = result.html;
  } else if (state.view === "phrases") {
    cards = language.phrases
      .filter(
        (item) =>
          (state.category === "all" || item.category === state.category) &&
          matchesQuery(item.meaning, item.text, item.pronunciation, item.context),
      )
      .map((item) => renderPhraseCard(item));
    count = cards.length;
    html = cards.join("");
  } else {
    note = "收藏會保存在這台裝置的瀏覽器中，重新整理後仍會保留。";
    cards = getFavoritePhrases()
      .filter(
        ({ phrase }) =>
          (state.category === "all" || phrase.category === state.category) &&
          matchesQuery(
            phrase.meaning,
            phrase.text,
            phrase.pronunciation,
            phrase.context,
          ),
      )
      .map(({ phrase, languageKey }) => renderPhraseCard(phrase, languageKey));
    count = cards.length;
    html = cards.join("");
  }

  elements.contentNote.textContent = note;
  elements.contentGrid.className = `card-grid ${
    state.view === "alphabet"
      ? "alphabet-grid"
      : state.view === "numberRules"
        ? "number-rules-layout"
        : "phrase-grid"
  }`;
  elements.contentGrid.innerHTML = html;
  elements.resultCount.textContent = `${count} 筆內容`;
  elements.emptyState.classList.toggle("is-hidden", count > 0);
  elements.contentGrid.classList.toggle("is-hidden", count === 0);
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
  if (!["alphabet", "phrases", "numberRules", "favorites"].includes(view)) return;
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

function voicesForLanguage(speechLang) {
  const prefix = normalizeLang(speechLang).split("-")[0];
  return state.voices.filter((voice) =>
    normalizeLang(voice.lang).startsWith(prefix),
  );
}

function getBestVoiceForLanguage(speechLang, languageKey = state.language) {
  const target = normalizeLang(speechLang);
  const voices = voicesForLanguage(speechLang);
  if (!voices.length) return { voice: null, exact: false };

  const storedName = getStoredVoiceName(languageKey);
  const storedVoice = voices.find((voice) => voice.name === storedName);
  if (storedVoice) {
    return { voice: storedVoice, exact: normalizeLang(storedVoice.lang) === target };
  }

  const exactVoice = voices.find((voice) => normalizeLang(voice.lang) === target);
  return { voice: exactVoice || voices[0], exact: Boolean(exactVoice) };
}

function loadVoices() {
  if (!speechSupported) return;
  state.voices = window.speechSynthesis.getVoices();
  updateVoiceOptions();
}

function updateVoiceOptions() {
  const language = getLanguage();
  elements.voiceSelect.innerHTML = "";

  if (!speechSupported) {
    const option = document.createElement("option");
    option.textContent = "此瀏覽器不支援系統語音";
    elements.voiceSelect.append(option);
    elements.voiceSelect.disabled = true;
    updateVoiceDiagnostics();
    return;
  }

  const voices = voicesForLanguage(language.speechLang).sort(
    (a, b) =>
      Number(normalizeLang(b.lang) === normalizeLang(language.speechLang)) -
        Number(normalizeLang(a.lang) === normalizeLang(language.speechLang)) ||
      Number(b.default) - Number(a.default) ||
      a.name.localeCompare(b.name),
  );

  if (!voices.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "沒有找到此語言語音";
    elements.voiceSelect.append(option);
    elements.voiceSelect.disabled = true;
    showVoiceWarning(state.language, false);
    updateVoiceDiagnostics();
    return;
  }

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} · ${voice.lang}${
      normalizeLang(voice.lang) === normalizeLang(language.speechLang)
        ? "（完全符合）"
        : ""
    }`;
    elements.voiceSelect.append(option);
  });

  const best = getBestVoiceForLanguage(language.speechLang);
  elements.voiceSelect.value = best.voice?.name || voices[0].name;
  elements.voiceSelect.disabled = false;
  elements.voiceStatus.textContent = "";
  storeVoiceName(state.language, elements.voiceSelect.value);
  updateVoiceDiagnostics();
}

function updateVoiceDiagnostics() {
  const language = getLanguage();
  const best = speechSupported
    ? getBestVoiceForLanguage(language.speechLang)
    : { voice: null, exact: false };
  const hasVoice = Boolean(best.voice);

  elements.diagnosticLanguage.textContent = language.label;
  elements.diagnosticTarget.textContent = language.speechLang;
  elements.diagnosticVoice.textContent = best.voice?.name || "未找到";
  elements.diagnosticVoiceLang.textContent = best.voice?.lang || "—";
  elements.diagnosticMatch.textContent = !speechSupported
    ? "瀏覽器不支援 Web Speech API"
    : hasVoice
      ? best.exact
        ? "完全符合"
        : "同語系語音"
      : `此裝置沒有${language.label}語音，發音可能不準`;
  elements.voiceDiagnostic.classList.toggle("is-warning", !speechSupported || !hasVoice);
  elements.voiceDiagnostic.classList.toggle("is-exact", hasVoice && best.exact);
}

function showVoiceWarning(languageKey = state.language, toast = true) {
  const language = getLanguage(languageKey);
  const message =
    "此裝置目前沒有安裝這個語言的語音，發音可能不準。請到系統語音設定安裝對應語言，或改用支援該語言的瀏覽器。";
  if (languageKey === state.language) {
    elements.voiceStatus.textContent = message;
  }
  if (toast) showToast(`${language.label}：未找到對應語音，已停止播放`);
}

function updateSpeedControls() {
  const rate = getCurrentSpeechRate();
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

function speakText(item, languageKey = state.language, overrideRate = null) {
  const langConfig = getLanguage(languageKey);
  const text = getSpeakableText(item);
  if (!text) return;

  stopPlayback();
  const rate = overrideRate ?? getCurrentSpeechRate();

  if (item.audioUrl) {
    const audio = new Audio(item.audioUrl);
    state.currentAudio = audio;
    audio.playbackRate = rate;
    audio.addEventListener("ended", () => {
      if (state.currentAudio === audio) state.currentAudio = null;
    });
    audio.play().catch(() => {
      state.currentAudio = null;
      showToast("音檔無法播放，已嘗試系統語音");
      speakText({ ...item, audioUrl: "" }, languageKey, overrideRate);
    });
    return;
  }

  if (!speechSupported) {
    showToast("此瀏覽器不支援 Web Speech API");
    return;
  }

  const { voice } = getBestVoiceForLanguage(langConfig.speechLang, languageKey);
  if (!voice) {
    showVoiceWarning(languageKey);
    updateVoiceDiagnostics();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langConfig.speechLang;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.voice = voice;
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
  }, 2600);
}

function handleGridAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "play" || action === "play-slow") {
    const speechEntry = state.speechItems.get(button.dataset.speechId);
    if (!speechEntry) return;
    speakText(
      speechEntry.item,
      speechEntry.languageKey,
      action === "play-slow" ? 0.72 : null,
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
    storeVoiceName(state.language, elements.voiceSelect.value);
    elements.voiceStatus.textContent = "";
    updateVoiceDiagnostics();
  });

  elements.speedControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rate]");
    if (!button) return;
    setSharedSpeechRate(Number(button.dataset.rate));
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
      "此瀏覽器不支援 Web Speech API；查詢、收藏與複製功能仍可正常使用。";
    updateVoiceOptions();
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
