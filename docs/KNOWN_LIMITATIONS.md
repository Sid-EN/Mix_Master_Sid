# 已知限制與待驗證項目

本檔記錄目前受環境限制而**無法在本機完成驗證**的項目，以及尚未接上實際
服務的功能。每項均註明已完成的部分、未能驗證的部分，以及後續補驗的步驟。

> 這些不是缺陷，而是「程式已寫好但需要外部條件才能證實可用」的項目。
> 在補驗完成前，不應將其視為已驗證可用。

---

## 1. 推播通知的實際送達

**狀態**：程式已完成，端到端送達未驗證
**版本**：2.5.0 導入

### 已完成並驗證

- 訂閱管理端點（登錄、取消、多裝置、換帳號時的歸屬轉移）
- 發送邏輯，含推送服務回報 404／410 時清除失效訂閱、
  其他錯誤視為暫時性而保留訂閱
- Service Worker 的 `push` 與 `notificationclick` 處理器
- 前端訂閱介面的各種狀態（不支援、未設定金鑰、權限被封鎖、可開啟、已開啟）
- 後端 17 項測試（以模擬方式取代實際網路呼叫）

### 未能驗證

**瀏覽器 → 推送服務 → Service Worker 的實際送達。**

實測結果：

| 環境 | 結果 |
|---|---|
| headless Chromium（一般 context） | `AbortError: Registration failed - permission denied`；並回報 Chrome 於無痕模式不支援 Push API |
| headless Chromium（持久化設定檔） | `AbortError: Registration failed - push service not available` |

headless 環境不會連線至瀏覽器廠商的推送服務，因此無法取得真實的
subscription endpoint，自然也無從驗證送達。

### 後續補驗步驟

1. 於有圖形介面的實際瀏覽器開啟站台（需 HTTPS 或 `localhost`）
2. 登入後至 `/account` 開啟推播通知，確認瀏覽器出現權限請求
3. 確認訂閱已寫入資料庫：
   ```bash
   docker exec mixmaster-db psql -U mixmaster -d mixmaster \
     -c "select id, user_id, left(endpoint, 60) from push_subscriptions;"
   ```
4. 呼叫測試端點，確認裝置收到通知：
   ```bash
   curl -X POST http://localhost:8000/api/v1/push/test \
     -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' \
     -d '{"title":"MixMaster","body":"測試通知","url":"/recipes"}'
   ```
5. 點擊通知，確認會開啟指定頁面（且已開啟的分頁會被聚焦而非另開新視窗）

---

## 2. 密碼重設信件的寄送

**狀態**：流程已完成，但未接上電子郵件服務
**版本**：1.4.0 導入

### 現況

重設權杖的產生、雜湊儲存、時效與單次使用限制均已完成並通過測試。
但**重設連結目前僅輸出至伺服器日誌**：

```
INFO mixmaster.auth 密碼重設連結（user@example.com）：/account/reset?token=...
```

這在開發時堪用，但正式環境的使用者看不到伺服器日誌，等同無法自行重設密碼。

刻意不將權杖放入 API 回應——那會讓任何人都能為他人的信箱申請重設並取得權杖，
形同帳號接管。

### 後續補足步驟

1. 選定電子郵件服務（SMTP 或 SendGrid、Resend 之類的 API 服務）
2. 於 `backend/.env` 加入該服務的認證資訊
3. 將 `routes_auth.forgot_password` 中的 `logger.info` 替換為寄信呼叫
4. 寄信失敗時仍應回傳 202，以免因回應差異而洩漏該信箱是否已註冊

---

## 3. SyncAgent 的攔截機制無法於單元測試驗證

**狀態**：機制有效（已於真實瀏覽器實測），但 jsdom 無法驗證

SyncAgent 以覆寫 `localStorage.setItem` 的方式偵測本機變更——同分頁的寫入
不會觸發 `storage` 事件，因此無法改用事件監聽。

實測比較：

| 環境 | 賦值後成為自有屬性 | 攔截器被呼叫 |
|---|---|---|
| 真實 Chromium | 是 | 是 |
| jsdom | 否 | 否 |

jsdom 將 Storage 的屬性賦值一律視為「儲存同名項目」，因此覆寫不生效。
這是 jsdom 與規範的落差，非程式缺陷。

該機制改由 E2E 涵蓋（`tests/e2e/account.spec.ts`：
「登入後的變更會自動上傳至伺服器」）；單元測試僅驗證 jsdom 下確實可
觀察的部分（掛載時的合併同步、事件發出、未登入不動作、錯誤處理）。

> 若日後 jsdom 修正此行為，可將攔截機制的驗證移回單元測試。

---

## 4. 執行環境相關

- **速率限制於開發環境停用**（`RATE_LIMIT_ENABLED=false`）。
  這是刻意設定：測試會在數秒內送出數百次請求，開啟限流會造成隨機失敗。
  限流本身另以獨立的應用實例搭配極低限制值驗證（7 項測試）。
- **repo 專用的 token 無法觸發或重跑 workflow**。
  該 token 僅具 Contents 與 Workflows 權限，
  `workflow_dispatch` 與 rerun 皆回 403（Resource not accessible）。
  需要重跑時的作法：推送一個 commit 至 main，或由具權限者於網頁介面操作。
  若日後要讓自動化能重跑，需為該 token 加上 Actions 的寫入權限。
- **`react-hooks/set-state-in-effect` 降為警告**（24 處）。
  本專案的客戶端資料存於 localStorage，必須在 effect 中讀取後 setState，
  否則首次渲染會伺服器／瀏覽器不一致。此為 SSR 的標準水合寫法，
  該規則針對的是尚未採用的 React Compiler。
