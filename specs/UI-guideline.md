# HTML Prototype UI Guide
- **技術棧**：使用 shadcn/ui + Tailwind CSS + Lucide Icons 組合
- **簡化原則**：移除冗餘結構，保持代碼簡潔
- **一致性**：確保所有頁面風格統一


## 重要說明
此文件是產生所有 prototype HTML 的 UI 設計指南。所有 HTML 頁面都必須遵循這些設計模式。

## 設計模式

### Card-Based Layout
- **HTML 應用**：init.html, index.html 登入頁面
- **CSS 規格**：max-width: 400px, 居中對齊
- **簡化原則**：移除冗餘結構，保留核心功能
- **Tailwind 類別**：`max-w-md mx-auto bg-white shadow-lg rounded-lg`

### Sidebar Navigation
- **HTML 應用**：pages.html 主應用
- **響應式**：桌面展開，移動收合
- **結構**：側邊欄 + 主內容區域

### Role-Based UI
- **實現**：根據用戶角色動態顯示功能
- **權限控制**：Owner 看管理功能，Member 看基本功能

### Progressive Disclosure
- **HTML 應用**：複雜流程頁面
- **實現**：分步驟顯示，避免認知過載
- **應用**：登入流程、設定流程

## 技術棧
- shadcn/ui 組件庫
- Tailwind CSS 樣式框架
- **Lucide Icons 圖標庫**
- 響應式設計優先

## 圖標系統

### Lucide Icons 使用規範
- **官方網站**：https://lucide.dev/
- **載入方式**：CDN 引入 `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>`
- **初始化**：頁面載入後調用 `lucide.createIcons()`

#### 使用方法
```html
<!-- 基本圖標 -->
<i data-lucide="home"></i>
<i data-lucide="users"></i>
<i data-lucide="settings"></i>

<!-- 帶樣式的圖標 -->
<i data-lucide="plus" class="btn-icon"></i>
<i data-lucide="edit-2" class="action-icon"></i>
```

#### 常用圖標對照表
- **導航**：`home`, `users`, `settings`, `folder`, `file-text`
- **操作**：`plus`, `edit-2`, `trash-2`, `save`, `x`
- **狀態**：`check`, `alert-circle`, `info`, `chevron-down`
- **通訊**：`mail`, `phone`, `message-circle`, `send`
- **媒體**：`image`, `video`, `download`, `upload`

#### 樣式規範
```css
/* 導航圖標 */
.nav-item i {
    width: 20px;
    height: 20px;
}

/* 按鈕圖標 */
.btn-icon {
    width: 16px;
    height: 16px;
    margin-right: var(--space-2);
}

/* 操作圖標 */
.action-btn i {
    width: 16px;
    height: 16px;
}

/* 表單標籤圖標 */
.label-icon {
    width: 16px;
    height: 16px;
    margin-right: var(--space-2);
}
```

#### 使用原則
- **一致性**：所有頁面統一使用 Lucide 圖標，避免混用不同圖標庫
- **語義化**：選擇符合功能語義的圖標名稱
- **尺寸統一**：根據使用場景設定統一的圖標尺寸
- **顏色繼承**：圖標顏色應繼承父元素的文字顏色
- **響應式**：確保圖標在不同螢幕尺寸下正常顯示

## 簡化原則
- 移除不必要的 div 結構
- 保留核心功能和內容
- 避免過度設計
- 專注用戶體驗

## 開發者工具

### 測試帳號提示組件
用於原型頁面的開發者測試資訊顯示：

```html
<!-- 開發者測試帳號提示 -->
<div class="dev-hint" title="🧪 開發者測試帳號&#10;&#10;📧 account@example.com&#10;🔑 密碼: password&#10;🔐 登入方式: 密碼登入">
    <span class="dev-indicator"></span>
</div>
```

```css
.dev-hint {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.dev-hint:hover {
    opacity: 1;
}

.dev-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(108, 117, 125, 0.9);
    color: white;
    border-radius: 50%;
    cursor: help;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
}

.dev-indicator::before {
    content: '?';
}
```

**使用原則**：
- 固定在右下角，不影響原型展示
- 使用 emoji 和換行符提升可讀性
- 半透明設計，懸停時完全顯示
- 適用於所有需要測試帳號的原型頁面