# Europe Daily Phrases

給 2026 年瑞典、德國、義大利旅行使用的單頁式語言小抄。使用純 HTML、CSS 與 JavaScript，可查字母、日常對話、數字 1–100，也能使用瀏覽器的系統語音朗讀。

## 如何開啟

最簡單的方式是直接以 Safari、Chrome 或 Edge 開啟 `index.html`。

若瀏覽器對本機檔案功能有限制，建議在專案資料夾啟動簡易靜態伺服器：

```bash
python3 -m http.server 8000
```

然後開啟 `http://localhost:8000`。

## 如何新增句子

所有語言資料集中在 `data.js` 的 `LANGUAGE_DATA`。在目標語言的 `phrases` 陣列加入一筆 `phraseItem(...)`：

```js
phraseItem(
  "unique-id",
  "restaurant",
  "中文意思",
  "當地語言原文",
  "中文近似發音",
  "使用情境",
)
```

可用分類為：

- `greetings`：招呼
- `polite`：禮貌
- `travel`：旅行
- `restaurant`：餐廳
- `transport`：交通
- `accommodation`：住宿

每筆資料會自動包含空的 `audioUrl`。若要使用預先錄製的音檔，可在物件建立後指定網址，或直接改成完整物件並填入 `audioUrl`；有音檔時會優先播放，音檔不可用時則回退到 Web Speech API。

## 如何新增語言

1. 在 `data.js` 的 `LANGUAGE_DATA` 新增語言 key。
2. 提供 `label`、`nativeName`、`flag`、`speechLang`、`accent`、`alphabetNote`。
3. 加入完整的 `alphabet`、`phrases`、`numbers` 陣列。
4. 若需要專屬配色，在 `styles.css` 增加 `body[data-language="語言 key"]` 的 CSS 變數。
5. `speechLang` 必須使用瀏覽器支援的 BCP 47 語言標籤，例如 `fr-FR`。

目前三種語言的語音標籤：

- 瑞典語：`sv-SE`
- 德語：`de-DE`
- 義大利語：`it-IT`

## 數字資料

`data.js` 以各語言獨立的基礎數字表與組字規則建立 1–100：

- 瑞典語使用十位＋個位的合寫規則。
- 德語使用個位＋`und`＋十位，並處理 16、17、整十與 `ein` 的變化。
- 義大利語處理 1、8 前的母音省略，以及尾數 3 的重音符號。

維護時可直接檢查各語言的 `build...Numbers()`，不會套用英文數字規則。

## 發音與瀏覽器支援

發音使用 `SpeechSynthesisUtterance`。語音清單、口音與自然度取決於瀏覽器與作業系統已安裝的語音包；如果找不到目前語言的語音，頁面會顯示提示，其他功能不受影響。

語音名稱與播放速度會依語言分別保存在 `localStorage`。收藏、主題與最後使用的語言也會保存在同一瀏覽器中。

建議在最新版 Safari、Chrome、Edge 測試。iPhone／iPad 上 Safari 通常會使用 iOS 的系統語音；如缺少語言，請先到系統的語音或輔助使用設定下載。

## 檔案結構

- `index.html`：頁面結構與無障礙語意。
- `styles.css`：響應式版面、三語配色、深淺模式與互動狀態。
- `data.js`：三種語言的字母、對話、數字與資料建立規則。
- `app.js`：渲染、搜尋、分類、收藏、複製、主題及語音控制。
- `README.md`：開啟方式與資料維護說明。
