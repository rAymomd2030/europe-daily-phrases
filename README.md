# Europe Daily Phrases

給瑞典、德國、義大利旅行使用的單頁語言工具。使用純 HTML、CSS、JavaScript，可查字母、日常對話、數字組成公式與小數逗號讀法，並使用裝置的 Web Speech API 播放目標語言。

## 開啟方式

直接以 Safari、Chrome 或 Edge 開啟 `index.html`，或在專案根目錄啟動靜態伺服器：

```bash
python3 -m http.server 8000
```

然後開啟 `http://localhost:8000`。

## 資料結構與維護

所有語言內容集中在 `data.js` 的 `LANGUAGE_DATA`。每種語言必須提供：

```js
{
  label: "德語",
  nativeName: "Deutsch",
  speechLang: "de-DE",
  alphabet: [],
  phrases: [],
  numberRules: {
    coreNumbers: [],
    tens: [],
    rules: [],
    exceptions: [],
    decimalRules: {
      separatorName: "Komma",
      separatorSymbol: ",",
      readingRule: "",
      description: "",
      examples: [],
    },
    examples: [],
  },
}
```

### 新增句子

在目標語言的 `phrases` 加入 `phraseItem(...)`：

```js
phraseItem(
  "unique-id",
  "restaurant",
  "中文意思",
  "當地語言原文",
  "中文近似音",
  "使用情境",
)
```

分類可用 `greetings`、`polite`、`travel`、`restaurant`、`transport`、`accommodation`。

### 維護數字公式

數字頁不建立 1–100 長列表：

- `coreNumbers`：0–19。
- `tens`：20、30 至 100。
- `rules`：組合方向與公式。
- `exceptions`：不規則拼法或母音省略。
- `decimalRules`：小數逗號名稱、符號、規則與範例。
- `examples`：少量可拆解的練習數字。

可播放項目使用：

```js
{
  value: "21",
  text: "einundzwanzig",
  meaning: "二十一",
  pronunciation: "中文近似音，只顯示",
  speechText: "einundzwanzig",
  formula: "ein + und + zwanzig",
  note: "21 使用 ein",
  audioUrl: "",
}
```

`speechText` 是唯一優先送入語音引擎的欄位；`pronunciation` 與 `meaning` 永遠不可朗讀。若有錄製音檔，可填入 `audioUrl`，否則使用 Web Speech API。

### 新增語言

1. 在 `LANGUAGE_DATA` 新增語言 key。
2. 提供 `label`、`nativeName`、`flag`、`speechLang`、`alphabetNote`。
3. 加入 `alphabet`、`phrases`、`numberRules`。
4. 在 `styles.css` 加入該語言的色彩變數。
5. `speechLang` 使用 BCP 47 標籤，例如 `fr-FR`。

## 語音正確性與限制

目前標籤：

- 瑞典語：`sv-SE`
- 德語：`de-DE`
- 義大利語：`it-IT`

播放一律經過 `getSpeakableText()` 與 `speakText()`：

1. 優先讀取 `speechText`，缺漏才使用 `text`。
2. `utterance.lang` 明確指定目前語言的 `speechLang`。
3. 語音先比對完整地區標籤，再選同語系 voice。
4. 找不到 `sv`、`de` 或 `it` voice 時停止播放，不使用英文 voice 代讀。
5. `voiceschanged` 會處理瀏覽器延遲載入語音。
6. 每種語言選擇的 voice 分別儲存在 `speechVoice.swedish`、`speechVoice.german`、`speechVoice.italian`。

字母的 `speechText` 只保存該語言的字母名稱，例如瑞典語 `be`、德語 `tse`、義大利語 `ci`；不加入 `bokstaven`、`Buchstabe` 或 `lettera` 等前綴。三種語言共用同一個語速設定，切換語言時不會沿用不同的快慢值。語音品質與可用清單仍取決於瀏覽器及作業系統已安裝的語音包；建議在 Safari、Chrome、Edge 測試。

## 部署建議

### 方案 A：Vercel（推薦）

適合不想在網址露出 GitHub 帳號、希望網址像產品名稱的情境。專案名稱建議：

- `europe-daily-phrases`
- `europedailyphrase`
- `europe-daily-phrase`

預期網址可能是 `https://europe-daily-phrases.vercel.app` 或 `https://europedailyphrase.vercel.app`，實際網址依平台可用名稱而定。若已被使用，可改用 `euro-daily-phrases`、`travel-phrase-europe`、`phrasepack-europe`、`daily-euro-phrases`。

部署流程：

1. 將專案放到 GitHub repository。
2. 登入 Vercel。
3. 選擇 **Add New Project**。
4. 匯入這個 GitHub repository。
5. Framework Preset 選 **Other** 或 **Static**。
6. Build command 留空。
7. Output directory 留空或使用根目錄。
8. 選擇 **Deploy**。
9. 確認網址是專案名稱組成的 `.vercel.app` 網址。
10. 若有自己的 `.com`，到 **Project Settings → Domains** 加入，並依 Vercel 提示設定 DNS。

### 方案 B：Netlify

Netlify 也適合純靜態網站，網址可能是 `https://europedailyphrase.netlify.app` 或 `https://europe-daily-phrases.netlify.app`。

1. 將專案放到 GitHub repository。
2. 登入 Netlify。
3. 選擇 **Add new site**。
4. 選擇 **Import an existing project**。
5. 連接 GitHub repository。
6. Build command 留空。
7. Publish directory 使用專案根目錄。
8. Deploy。
9. 到 Site settings 修改 site name。
10. 若有自己的 `.com`，到 Domain management 加入自訂網域。

Netlify 的預設網址由 site name 組成，可在 site settings 修改。

### 方案 C：GitHub Pages + 自訂網域

GitHub Pages 預設網址通常包含帳號，例如 `https://你的github帳號.github.io/europe-daily-phrases/`，不建議把它當成正式產品網址。可搭配 `https://europedailyphrase.com` 或 `https://europe-daily-phrases.com`。

1. 將專案推到 GitHub repository。
2. 到 repository 的 Settings。
3. 進入 Pages。
4. 選擇 `main` branch 等部署來源。
5. 先確認 Pages 正常顯示。
6. 購買自訂網域。
7. 在 Pages 的 Custom domain 輸入自訂網域。
8. 到網域商後台設定 DNS。
9. 等待 DNS 生效。
10. 啟用 HTTPS。

## 建議網站名稱與網域

最推薦的名稱：

- Europe Daily Phrases
- Europe Phrase Kit
- Euro Travel Phrases
- Daily Euro Phrases
- Travel Phrase Europe

| 網站名稱 | 專案名稱 | 可能網址 |
| --- | --- | --- |
| Europe Daily Phrases | europe-daily-phrases | europe-daily-phrases.com |
| Europe Daily Phrase | europedailyphrase | europedailyphrase.com |
| Europe Phrase Kit | europe-phrase-kit | europe-phrase-kit.com |
| Euro Travel Phrases | euro-travel-phrases | euro-travel-phrases.com |
| Daily Euro Phrases | daily-euro-phrases | daily-euro-phrases.com |

網域是否可用需要實際查詢；若 `.com` 不可用，可考慮 `.app`、`.travel`、`.tools`、`.site`、`.net`。

專案內統一使用：

- HTML title／頁面主標題：Europe Daily Phrases
- 副標題：瑞典・德國・義大利旅行日常語言小抄
- Repository／Vercel／Netlify 名稱：`europe-daily-phrases`

## 部署後檢查清單

1. 正式網址不是 GitHub 帳號網址。
2. 手機 Safari 可正常開啟。
3. iPad Safari 可正常開啟。
4. Chrome 可正常開啟。
5. 三種語言切換正常。
6. 字母播放使用正確語言 voice。
7. 單字播放不會朗讀中文近似音。
8. 句子播放不會朗讀中文意思。
9. 數字頁是公式教學，不是 1–100 長列表。
10. 搜尋功能正常。
11. 收藏重新整理後保留。
12. 深色模式正常。
13. title 與 icon 正確。
14. 網址使用 HTTPS。
15. Console 沒有錯誤。
16. README 清楚說明資料更新方式。
17. README 說明語音依賴裝置系統語音。
18. README 沒有把 `username.github.io` 當作主要正式網址。

## 檔案

- `index.html`：單頁結構、語音設定與診斷區。
- `styles.css`：響應式版面、數字公式卡片、深淺模式。
- `data.js`：三語字母、對話、數字規則、小數逗號資料。
- `app.js`：渲染、搜尋、收藏、複製及統一語音管理。
- `README.md`：維護、語音、部署與驗收說明。
