# NBEE 團隊角色認證系統 API 文檔

本文檔定義了 NBEE 團隊角色認證系統前後端分離架構下的 API 接口。

## API 總覽

系統共有 **20 個 API 端點**，分為以下四大類：

### 1. 認證相關 API (5 個)
- `POST /api/v1.0/system/initialize` - 系統初始化
- `POST /api/v1.0/auth/check-email` - 檢查電子郵件
- `POST /api/v1.0/auth/login-password` - 密碼登入
- `POST /api/v1.0/auth/request-otp` - 請求 OTP 驗證碼
- `POST /api/v1.0/auth/verify-otp` - 驗證 OTP 並登入
- `POST /api/v1.0/auth/logout` - 登出

### 2. 用戶與團隊管理 API (8 個)
- `GET /api/v1.0/members` - 獲取團隊成員列表
- `POST /api/v1.0/members` - 直接新增成員
- `DELETE /api/v1.0/members/:id` - 移除成員
- `POST /api/v1.0/members/:id/suspend` - 暫停成員帳戶
- `DELETE /api/v1.0/members/:id/suspend` - 恢復成員帳戶
- `POST /api/v1.0/invitations` - 發送邀請
- `GET /api/v1.0/invitations/generate-link` - 生成邀請連結
- `GET /api/v1.0/invitations/verify/:token` - 驗證邀請連結
- `POST /api/v1.0/invitations/accept/:token` - 接受邀請並設置密碼

### 3. 角色與權限管理 API (6 個)
- `GET /api/v1.0/roles` - 獲取所有角色
- `POST /api/v1.0/roles` - 創建新角色
- `PUT /api/v1.0/roles/:id` - 更新角色
- `DELETE /api/v1.0/roles/:id` - 刪除角色
- `PUT /api/v1.0/members/:id/role` - 更新成員角色
- `PUT /api/v1.0/members/:id/login-method` - 更新成員登入方式

### 4. 系統管理 API (3 個)
- `PUT /api/v1.0/system/transfer-ownership` - 轉移擁有者權限
- `GET /api/v1.0/me` - 獲取當前用戶資料
- `PUT /api/v1.0/me/password` - 更改密碼

## 目錄

1. [認證相關 API](#1-認證相關-api)
2. [用戶與團隊管理 API](#2-用戶與團隊管理-api)
3. [角色與權限管理 API](#3-角色與權限管理-api)
4. [系統管理 API](#4-系統管理-api)
5. [技術實現建議](#5-技術實現建議)

## 1. 認證相關 API

### 1.1 系統初始化

**端點:** `POST /api/system/initialize`

**描述:** 初始化系統並創建 Owner 帳號

**請求參數:**
```json
{
  "email": "owner@example.com",
  "password": "secure_password",
  "name": "System Owner"
}
```

**返回:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "System Owner",
    "email": "owner@example.com",
    "role": "owner"
  }
}
```

### 1.2 用戶登入流程

#### 1.2.1 檢查電子郵件

**端點:** `POST /api/auth/check-email`

**描述:** 檢查電子郵件並返回登入方式

**請求參數:**
```json
{
  "email": "user@example.com"
}
```

**返回:**
```json
{
  "exists": true,
  "loginMethod": "password" // 或 "otp"
}
```

#### 1.2.2 密碼登入

**端點:** `POST /api/auth/login-password`

**描述:** 使用密碼進行登入

**請求參數:**
```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

**返回:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "member"
  }
}
```

#### 1.2.3 OTP 登入流程

**端點:** `POST /api/auth/request-otp`

**描述:** 請求 OTP 驗證碼

**請求參數:**
```json
{
  "email": "user@example.com"
}
```

**返回:**
```json
{
  "success": true,
  "message": "OTP 已發送至您的電子郵件"
}
```

**端點:** `POST /api/auth/verify-otp`

**描述:** 驗證 OTP 並登入

**請求參數:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**返回:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "member"
  }
}
```

#### 1.2.4 登出

**端點:** `POST /api/auth/logout`

**描述:** 登出系統

**請求參數:** 無

**返回:**
```json
{
  "success": true
}
```

## 2. 用戶與團隊管理 API

### 2.1 成員管理

#### 2.1.1 獲取團隊成員列表

**端點:** `GET /api/members`

**描述:** 獲取團隊所有成員的列表

**返回:**
```json
{
  "members": [
    {
      "id": "user_id_1",
      "name": "User One",
      "email": "user1@example.com",
      "role": "owner",
      "loginMethod": "password",
      "status": "active"
    },
    {
      "id": "user_id_2",
      "name": "User Two",
      "email": "user2@example.com",
      "role": "admin",
      "loginMethod": "otp",
      "status": "active"
    }
  ]
}
```

#### 2.1.2 直接新增成員

**端點:** `POST /api/members`

**描述:** 直接新增團隊成員

**請求參數:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "initial_password",
  "role": "member"
}
```

**返回:**
```json
{
  "success": true,
  "member": {
    "id": "new_user_id",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "member",
    "loginMethod": "password",
    "status": "active"
  }
}
```

#### 2.1.3 移除成員

**端點:** `DELETE /api/members/:id`

**描述:** 從團隊中移除成員

**返回:**
```json
{
  "success": true
}
```

### 2.2 邀請功能

#### 2.2.1 發送邀請

**端點:** `POST /api/invitations`

**描述:** 發送邀請郵件給新成員

**請求參數:**
```json
{
  "email": "invite@example.com",
  "role": "member"
}
```

**返回:**
```json
{
  "success": true,
  "invitation": {
    "id": "invitation_id",
    "token": "invitation_token",
    "expiresAt": "2023-12-31T23:59:59Z"
  }
}
```

#### 2.2.2 生成邀請連結

**端點:** `GET /api/v1.0/invitations/generate-link`

**描述:** 生成可分享的邀請連結和臨時密碼

**請求參數:**
```json
{
  "role": "member"
}
```

**返回:**
```json
{
  "success": true,
  "invitationLink": "https://app.example.com/join?token=invitation_token",
  "tempPassword": "123456",
  "expiresAt": "2023-12-31T23:59:59Z"
}
```

#### 2.2.3 驗證邀請連結

**端點:** `GET /api/v1.0/invitations/verify/:token`

**描述:** 驗證邀請連結是否有效

**返回:**
```json
{
  "valid": true,
  "role": "member",
  "expiresAt": "2023-12-31T23:59:59Z"
}
```

#### 2.2.4 使用臨時密碼登入

**端點:** `POST /api/v1.0/invitations/login-temp`

**描述:** 使用邀請連結和臨時密碼登入

**請求參數:**
```json
{
  "token": "invitation_token",
  "tempPassword": "123456"
}
```

**返回:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "requirePasswordChange": true,
  "user": {
    "id": "user_id",
    "email": "invited@example.com",
    "role": "member"
  }
}
```

#### 2.2.5 接受邀請

**端點:** `POST /api/v1.0/invitations/accept/:token`

**描述:** 接受邀請並設置新密碼

**請求參數:**
```json
{
  "name": "Invited User",
  "password": "new_password"
}
```

**返回:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "new_user_id",
    "name": "Invited User",
    "email": "invite@example.com",
    "role": "member"
  }
}
```

## 3. 角色與權限管理 API

### 3.1 角色管理

#### 3.1.1 獲取所有角色

**端點:** `GET /api/roles`

**描述:** 獲取系統中所有角色的列表

**返回:**
```json
{
  "roles": [
    {
      "id": "role_id_1",
      "name": "Owner",
      "permissions": ["all"],
      "loginMethods": ["password", "otp"]
    },
    {
      "id": "role_id_2",
      "name": "Admin",
      "permissions": ["manage_members", "view_reports"],
      "loginMethods": ["password", "otp"]
    },
    {
      "id": "role_id_3",
      "name": "Member",
      "permissions": ["view_reports"],
      "loginMethods": ["password"]
    }
  ]
}
```

#### 3.1.2 創建新角色

**端點:** `POST /api/roles`

**描述:** 創建新的角色

**請求參數:**
```json
{
  "name": "Editor",
  "permissions": ["edit_content", "view_reports"],
  "loginMethods": ["password"]
}
```

**返回:**
```json
{
  "success": true,
  "role": {
    "id": "new_role_id",
    "name": "Editor",
    "permissions": ["edit_content", "view_reports"],
    "loginMethods": ["password"]
  }
}
```

#### 3.1.3 更新角色

**端點:** `PUT /api/roles/:id`

**描述:** 更新現有角色的設定

**請求參數:**
```json
{
  "name": "Senior Editor",
  "permissions": ["edit_content", "publish_content", "view_reports"],
  "loginMethods": ["password", "otp"]
}
```

**返回:**
```json
{
  "success": true,
  "role": {
    "id": "role_id",
    "name": "Senior Editor",
    "permissions": ["edit_content", "publish_content", "view_reports"],
    "loginMethods": ["password", "otp"]
  }
}
```

#### 3.1.4 刪除角色

**端點:** `DELETE /api/roles/:id`

**描述:** 刪除角色

**返回:**
```json
{
  "success": true
}
```

### 3.2 用戶角色與登入方式管理

#### 3.2.1 更新成員角色

**端點:** `PUT /api/members/:id/role`

**描述:** 更新成員的角色

**請求參數:**
```json
{
  "roleId": "role_id"
}
```

**返回:**
```json
{
  "success": true
}
```

#### 3.2.2 更新成員登入方式

**端點:** `PUT /api/members/:id/login-method`

**描述:** 更新成員的登入方式

**請求參數:**
```json
{
  "loginMethod": "password" // 或 "otp" 或 "both"
}
```

**返回:**
```json
{
  "success": true
}
```

## 4. 系統管理 API

### 4.1 擁有者管理

#### 4.1.1 轉移擁有者權限

**端點:** `PUT /api/system/transfer-ownership`

**描述:** 將擁有者權限轉移給另一成員

**請求參數:**
```json
{
  "memberId": "user_id"
}
```

**返回:**
```json
{
  "success": true
}
```

### 4.2 用戶個人資料

#### 4.2.1 獲取當前用戶資料

**端點:** `GET /api/me`

**描述:** 獲取當前登入用戶的資料和權限

**返回:**
```json
{
  "user": {
    "id": "user_id",
    "name": "Current User",
    "email": "user@example.com",
    "role": "admin"
  },
  "permissions": ["manage_members", "view_reports"]
}
```

#### 4.2.2 更改密碼

**端點:** `PUT /api/me/password`

**描述:** 更改當前用戶的密碼

**請求參數:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**返回:**
```json
{
  "success": true
}
```

## 5. 技術實現建議

### 5.1 認證機制
- 使用 JWT (JSON Web Token) 進行身份驗證
- Token 有效期設置為較短時間（如 1 小時），並實現刷新 Token 機制
- 敏感操作需要重新驗證

### 5.2 API 安全
- 實現 CORS 策略，限制允許的來源
- 添加 Rate Limiting 防止暴力攻擊
- 所有請求使用 HTTPS
- 實現請求驗證，防止 CSRF 攻擊

### 5.3 錯誤處理
- 統一的錯誤響應格式：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### 5.4 API 版本控制
- 使用 URL 前�� prefix 進行版本管理，如 `/api/v1/`
- 主要版本變更時增加版本號

### 5.5 文檔
- 使用 Swagger/OpenAPI 生成 API 文檔
- 提供 Postman 集合方便測試