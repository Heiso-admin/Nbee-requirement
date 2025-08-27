// 團隊管理系統 - 主要 JavaScript 文件

class TeamManagementApp {
    constructor() {
        this.currentUser = {
            name: 'Owner',
            email: 'owner@heisoo.com',
            role: 'owner'
        };
        
        this.members = [
            {
                id: 1,
                name: 'Owner',
                email: 'owner@heisoo.com',
                role: 'owner',
                joinedAt: '2024-01-01'
            },
            {
                id: 2,
                name: 'Test User',
                email: 'test@heisoo.com',
                role: 'member',
                joinedAt: '2024-01-15'
            }
        ];
        
        this.currentPage = 'login';
        this.loginStep = 1;
        this.userCount = 0; // 模擬用戶數量，0 表示需要註冊
        
        // 模擬用戶登入方式設定
        this.userLoginMethods = {
            'owner@heisoo.com': 'password',  // Owner 可以使用密碼登入
            'test@heisoo.com': 'otp',        // Test 用戶只能使用 OTP 登入
            'admin@heisoo.com': 'both'       // Admin 用戶需要密碼+OTP雙重驗證
        };
        
        // 模擬用戶密碼數據（僅用於密碼登入驗證）
        this.userPasswords = {
            'owner@heisoo.com': 'test!123',
            'admin@heisoo.com': 'test!123'
        };
        
        // 添加邀請鏈接相關屬性
        this.inviteLinks = new Map(); // 儲存生成的邀請鏈接
        this.currentInviteTab = 'email'; // 當前邀請標籤頁
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkUserCount();
        // team.html 沒有 login-page，這裡做容錯
        if (document.getElementById('login-page')) {
            this.showPage('login');
        } else if (document.getElementById('dashboard-page')) {
            this.showPage('dashboard');
            this.updateUserInfo();
            // 預設顯示 Team 區塊
            this.showDashboardContent('team');
            this.renderMembersList();
        }
    }
    
    bindEvents() {
        // 登入表單事件（加存在檢查）
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.addEventListener('click', () => this.handleNextStep());
        
        // 添加缺少的登入方式選擇按鈕事件
        const choosePasswordBtn = document.getElementById('choose-password');
        if (choosePasswordBtn) choosePasswordBtn.addEventListener('click', () => this.showPasswordStep());
        
        const chooseOtpBtn = document.getElementById('choose-otp');
        if (chooseOtpBtn) chooseOtpBtn.addEventListener('click', () => this.showOtpStep());
        
        const chooseBothBtn = document.getElementById('choose-both');
        if (chooseBothBtn) chooseBothBtn.addEventListener('click', () => this.showBothStep());
        
        // 選項頁面的返回按鈕
        const backBtnOptions = document.getElementById('back-btn-options');
        if (backBtnOptions) backBtnOptions.addEventListener('click', () => this.showEmailStep());
        const backPwd = document.getElementById('back-btn-password');
        if (backPwd) backPwd.addEventListener('click', () => this.showEmailStep());
        const backOtp = document.getElementById('back-btn-otp');
        if (backOtp) backOtp.addEventListener('click', () => this.showEmailStep());
        const verifyOtpBtn = document.getElementById('verify-otp-btn');
        if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', () => this.handleOtpLogin());
        const resendOtpBtn = document.getElementById('resend-otp-btn');
        if (resendOtpBtn) resendOtpBtn.addEventListener('click', () => this.resendOtp());
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // 問號logo點擊事件
        const helpLogo = document.getElementById('help-logo');
        if (helpLogo) helpLogo.addEventListener('click', () => this.showTestAccounts());
        
        // 測試帳號彈窗關閉事件
        const closeTestModal = document.getElementById('close-test-modal');
        if (closeTestModal) closeTestModal.addEventListener('click', () => this.hideTestAccounts());
        
        // 點擊彈窗背景關閉
        const testModal = document.getElementById('test-accounts-modal');
        if (testModal) {
            testModal.addEventListener('click', (e) => {
                if (e.target === testModal) this.hideTestAccounts();
            });
        }
        
        // 註冊表單事件
        const regForm = document.getElementById('register-form');
        if (regForm) regForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // 用戶初始設定表單事件
        const initUserForm = document.getElementById('init-user-form');
        if (initUserForm) initUserForm.addEventListener('submit', (e) => this.handleInitUser(e));
        
        // 密碼顯示切換
        const userPasswordToggle = document.getElementById('user-password-toggle');
        if (userPasswordToggle) userPasswordToggle.addEventListener('click', () => this.togglePasswordVisibility('user-password'));
        
        const userPasswordConfirmToggle = document.getElementById('user-password-confirm-toggle');
        if (userPasswordConfirmToggle) userPasswordConfirmToggle.addEventListener('click', () => this.togglePasswordVisibility('user-password-confirm'));
        
        // 導航事件（安全：若沒有也不會報錯）
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.showDashboardContent(page);
            });
        });
        
        // 用戶選單事件
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userMenuBtn) userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // 團隊管理事件
        const inviteBtn = document.getElementById('invite-member-btn');
        if (inviteBtn) inviteBtn.addEventListener('click', () => this.showModal('invite-modal'));
        
        // 邀請彈窗標籤頁切換事件
        document.querySelectorAll('.invite-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabType = tab.dataset.tab;
                this.switchInviteTab(tabType);
            });
        });
        
        // 生成/複製邀請鏈接事件
        const genLinkBtn = document.getElementById('generate-link-btn');
        if (genLinkBtn) genLinkBtn.addEventListener('click', () => this.generateInviteLink());
        const copyLinkBtn = document.getElementById('copy-link-btn');
        if (copyLinkBtn) copyLinkBtn.addEventListener('click', () => this.copyInviteLink());
        
        // 彈窗關閉（若不存在也不會報錯）
        document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = btn.dataset.modal;
                if (modalId) this.hideModal(modalId); else this.hideAllModals();
            });
        });
        
        // 點擊遮罩關閉彈窗
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) this.hideAllModals();
            });
        }
        
        // ESC 關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideAllModals();
        });
        
        // 擁有者轉移確認
        const confirmTransfer = document.getElementById('confirm-transfer-btn');
        if (confirmTransfer) confirmTransfer.addEventListener('click', () => this.handleTransferOwnership());
    }
    
    checkUserCount() {
        // index.html 是系統已有 Owner 後的登入頁面
        // 不需要檢查用戶數量或顯示註冊功能
        const hasUsers = localStorage.getItem('hasUsers') === 'true';
        this.userCount = hasUsers ? 1 : 0;
    }
    
    showPage(pageId) {
        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 顯示指定頁面
        document.getElementById(`${pageId}-page`).classList.add('active');
        this.currentPage = pageId;
    }
    
    showEmailStep() {
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-1').classList.add('active');
        this.loginStep = 1;
    }
    
    handleNextStep() {
        const email = document.getElementById('email').value;
        if (!email) {
            alert('請先輸入 Email 地址');
            return;
        }
        
        // 基本 email 驗證
        if (!this.isValidEmail(email)) {
            alert('請輸入有效的 Email 地址');
            return;
        }
        
        // 檢查用戶是否存在
        if (!this.userLoginMethods[email]) {
            alert('用戶不存在，請檢查 Email 地址');
            return;
        }
        
        // 根據用戶的登入方式直接跳轉
        const loginMethod = this.userLoginMethods[email];
        
        if (loginMethod === 'otp') {
            this.showOtpStep();
        } else if (loginMethod === 'password') {
            this.showPasswordStep();
        } else if (loginMethod === 'both') {
            this.showBothStep();
        }
    }
    
    showOptionsStep() {
        const email = document.getElementById('email').value;
        
        document.getElementById('user-email-display-options').textContent = email;
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-2-options').classList.add('active');
        this.loginStep = 2;
    }
    
    showPasswordStep() {
        const email = document.getElementById('email').value;
        
        document.getElementById('user-email-display-password').textContent = email;
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-2-password').classList.add('active');
        this.loginStep = 2;
        
        // 聚焦到密碼輸入框
        setTimeout(() => {
            document.getElementById('password').focus();
        }, 100);
    }
    
    showOtpStep() {
        const email = document.getElementById('email').value;
        
        // 模擬發送 OTP
        this.sendOtp(email);
        
        document.getElementById('user-email-display-otp').textContent = email;
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-2-otp').classList.add('active');
        this.loginStep = 2;
        
        // 聚焦到 OTP 輸入框
        setTimeout(() => {
            document.getElementById('otp-code').focus();
        }, 100);
    }
    
    sendOtp(email) {
        // 模擬發送 OTP
        this.currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`模擬發送 OTP 到 ${email}: ${this.currentOtp}`);
        alert(`模擬：驗證碼 ${this.currentOtp} 已發送到 ${email}`);
    }
    
    resendOtp() {
        const email = document.getElementById('email').value;
        this.sendOtp(email);
    }
    
    handleOtpLogin() {
        const otpCode = document.getElementById('otp-code').value;
        
        if (!otpCode) {
            alert('請輸入驗證碼');
            return;
        }
        
        if (otpCode.length !== 6) {
            alert('驗證碼必須是 6 位數');
            return;
        }
        
        // 模擬 OTP 驗證
        const verifyBtn = document.getElementById('verify-otp-btn');
        this.showLoadingState(verifyBtn, '驗證中...');
        
        setTimeout(() => {
            this.hideLoadingState(verifyBtn, '驗證並登入');
            
            if (otpCode === this.currentOtp) {
                // OTP 驗證成功，更新當前用戶資訊
                const email = document.getElementById('email').value;
                const member = this.members.find(m => m.email === email);
                if (member) {
                    this.currentUser = {
                        name: member.name,
                        email: member.email,
                        role: member.role
                    };
                }
                this.showPage('dashboard');
                this.updateUserInfo();
                // 刪除這行
                this.renderMembersList();
            } else {
                alert('驗證碼錯誤，請重新輸入');
                document.getElementById('otp-code').value = '';
                document.getElementById('otp-code').focus();
            }
        }, 1500);
    }
    
    handleVerify() {
        const email = document.getElementById('email').value;
        if (!email) {
            alert('請輸入 Email 地址');
            return;
        }
        
        // 模擬驗證過程
        this.showLoadingState('verify-btn', '驗證中...');
        
        setTimeout(() => {
            this.hideLoadingState('verify-btn', 'Verify');
            // 模擬用戶存在，直接跳到密碼步驟
            this.showPasswordStep();
        }, 1500);
    }
    
    showBothStep() {
        // 先顯示密碼步驟，驗證成功後再要求OTP
        this.currentLoginMethod = 'both';
        this.showPasswordStep();
    }
    
    // 修改handleLogin函數以支援both模式
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!password) {
            alert('請輸入密碼');
            return;
        }
        
        // 驗證密碼
        if (this.userPasswords[email] && this.userPasswords[email] === password) {
            if (this.currentLoginMethod === 'both') {
                // 密碼驗證成功，繼續OTP驗證
                this.showOtpStep();
                return;
            } else {
                // 僅密碼登入，直接成功
                this.loginSuccess();
            }
        } else {
            alert('密碼錯誤，請重新輸入');
        }
    }
    
    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        if (!name || !email || !password) {
            this.showError('請填寫所有必填欄位');
            return;
        }
        
        // 基本 email 驗證
        if (!this.isValidEmail(email)) {
            this.showError('請輸入有效的 Email 地址');
            return;
        }
        
        // 密碼強度檢查
        if (password.length < 6) {
            this.showError('密碼至少需要 6 個字符');
            return;
        }
        
        // 模擬註冊過程
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.showLoadingState(submitBtn, 'Creating Account...');
        
        setTimeout(() => {
            this.hideLoadingState(submitBtn, 'Create Owner Account');
            
            // 模擬註冊成功 - 自動成為 Owner
            this.currentUser = { name, email, role: 'owner' };
            
            // 更新系統狀態 - 現在有用戶了
            localStorage.setItem('hasUsers', 'true');
            localStorage.setItem('ownerInfo', JSON.stringify(this.currentUser));
            this.userCount = 1;
            
            // 更新成員列表，將新用戶設為 Owner
            this.members = [{
                id: 1,
                name: name,
                email: email,
                role: 'owner',
                joinedAt: new Date().toISOString().split('T')[0]
            }];
            
            // 顯示成功訊息並跳轉
            this.showSuccess('Owner account created successfully! You are now logged in.');
            
            setTimeout(() => {
                this.showPage('dashboard');
                this.updateUserInfo();
                this.renderMembersList();
            }, 1500);
            
        }, 2000);
    }
    
    handleLogout() {
        this.showPage('login');
        this.loginStep = 1;
        this.showEmailStep();
        // 清空表單
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
    }
    
    showDashboardContent(contentId) {
        // 更新導航高亮
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${contentId}"]`).classList.add('active');
        
        // 更新頁面標題
        const titles = {
            'dashboard': '儀表板',
            'team': '團隊管理',
            'settings': '設定'
        };
        document.getElementById('page-title').textContent = titles[contentId] || '儀表板';
        
        // 顯示對應內容
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        if (contentId === 'team') {
            document.getElementById('team-content').classList.add('active');
            this.renderMembersList();
        } else {
            document.getElementById('dashboard-content').classList.add('active');
        }
    }
    
    updateUserInfo() {
        document.getElementById('current-user-name').textContent = this.currentUser.name;
        document.getElementById('current-user-role').textContent = `(${this.getRoleDisplayName(this.currentUser.role)})`;
        document.getElementById('welcome-user-name').textContent = this.currentUser.name;
    }
    
    renderMembersList() {
        const membersList = document.getElementById('members-list');
        membersList.innerHTML = '';
        
        this.members.forEach(member => {
            const memberCard = this.createMemberCard(member);
            membersList.appendChild(memberCard);
        });
        
        // 更新成員計數
        document.getElementById('members-count').textContent = `${this.members.length} users`;
    }
    
    createMemberCard(member) {
        const row = document.createElement('div');
        row.className = 'member-row';
        
        const isCurrentUser = member.email === this.currentUser.email;
        const canManage = this.currentUser.role === 'owner' && !isCurrentUser;
        const isYou = isCurrentUser ? ' <span class="badge">You</span>' : '';
        
        // 隨機狀態（僅用於演示）
        let status = '';
        if (member.id > 2 && Math.random() > 0.5) {
            status = '<span class="badge">Invited</span>';
        } else if (member.id > 4 && Math.random() > 0.7) {
            status = '<span class="badge dark">Active</span>';
        }
        
        row.innerHTML = `
            <div class="user-col">
                <div class="user-avatar"></div>
                <div class="user-email">${member.email}${isYou}</div>
            </div>
            <div>${status}</div>
            <div>${this.getRoleDisplayName(member.role)}</div>
            <div class="row-actions">
                ${canManage ? `
                    <button class="btn btn-sm" onclick="app.editMemberRole(${member.id})">Edit</button>
                    <button class="btn-icon" onclick="app.showMoreOptions(${member.id})">
                        <i data-lucide="more-horizontal"></i>
                    </button>
                ` : `
                    <button class="btn btn-sm" disabled>Edit</button>
                `}
            </div>
        `;
        
        // 初始化圖標
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({
                icons: ['more-horizontal'],
                element: row
            });
        }
        
        return row;
    }
    
    getRoleDisplayName(role) {
        const roleNames = {
            'owner': 'Owner',
            'admin': 'Admin',
            'member': 'Member'
        };
        return roleNames[role] || role;
    }
    
    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('active');
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal && overlay) {
            overlay.classList.remove('hidden');
            modal.classList.remove('hidden');
            
            // 如果是邀請模態框，重置到 Email 標籤頁
            if (modalId === 'invite-modal') {
                this.switchInviteTab('email');
                this.resetInviteForm();
            }
            
            // 添加動畫效果
            setTimeout(() => {
                overlay.classList.add('opacity-100');
                modal.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal && overlay) {
            // 添加關閉動畫
            overlay.classList.remove('opacity-100');
            modal.classList.remove('scale-100', 'opacity-100');
            
            setTimeout(() => {
                overlay.classList.add('hidden');
                modal.classList.add('hidden');
            }, 200);
        }
    }
    
    hideAllModals() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        
        // 清空表單
        document.querySelectorAll('.modal form').forEach(form => {
            form.reset();
        });
    }
    
    // 切換邀請標籤頁
    switchInviteTab(tabType) {
        this.currentInviteTab = tabType;
        
        // 更新標籤頁樣式
        document.querySelectorAll('.invite-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
        
        // 切換內容區域
        document.querySelectorAll('.invite-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabType}-invite`).classList.add('active');
    }
    
    // 生成邀請鏈接
    generateInviteLink() {
        const email = document.getElementById('invite-email').value;
        if (!email) {
            this.showError('請輸入 Email 地址');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('請輸入有效的 Email 地址');
            return;
        }
        
        // 生成邀請 token（實際應用中應該是後端生成）
        const token = this.generateToken();
        
        // 構建邀請鏈接，包含 email 和 token 參數
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        const inviteLink = `${baseUrl}init-user.html?email=${encodeURIComponent(email)}&token=${token}`;
        
        // 顯示生成的鏈接
        document.getElementById('generated-link').value = inviteLink;
        document.getElementById('link-result').style.display = 'block';
        
        // 儲存邀請記錄（可選）
        this.saveInviteRecord(email, token);
        
        this.showSuccess('邀請鏈接已生成！');
    }
    
    generateToken() {
        // 簡單的 token 生成（實際應用中應該更安全）
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    saveInviteRecord(email, token) {
        // 儲存邀請記錄到 localStorage（實際應用中應該儲存到後端）
        const invites = JSON.parse(localStorage.getItem('pendingInvites') || '[]');
        invites.push({
            email: email,
            token: token,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('pendingInvites', JSON.stringify(invites));
    }
    
    // 複製邀請鏈接
    async copyInviteLink() {
        const linkInput = document.getElementById('generated-link');
        const copyBtn = document.getElementById('copy-link-btn');
        
        try {
            await navigator.clipboard.writeText(linkInput.value);
            
            // 更新按鈕狀態
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 mr-2"></i>已複製';
            copyBtn.classList.add('btn-success');
            
            // 重新渲染圖標
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('btn-success');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 2000);
            
            this.showSuccess('鏈接已複製到剪貼板！');
        } catch (err) {
            // 降級方案：選中文字
            linkInput.select();
            linkInput.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                this.showSuccess('鏈接已複製到剪貼板！');
            } catch (e) {
                this.showError('複製失敗，請手動複製鏈接');
            }
        }
    }
    
    // 生成唯一 ID
    generateUniqueId() {
        return 'inv_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    // 重置邀請表單
    resetInviteForm() {
        // 重置鏈接表單
        document.querySelector('input[name="link-role"][value="member"]').checked = true;
        document.getElementById('link-expiry').value = '7';
        document.getElementById('generated-link').value = '';
        document.getElementById('link-result').classList.add('hidden');
        document.getElementById('copy-link-btn').disabled = true;
        document.getElementById('link-info').innerHTML = '';
    }
    
    editMemberRole(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;
        
        const newRole = prompt(`請選擇 ${member.name} 的新角色：\n1. admin\n2. member`, member.role);
        if (newRole && ['admin', 'member'].includes(newRole)) {
            member.role = newRole;
            this.renderMembersList();
            alert('角色已更新！');
        }
    }
    
    removeMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;
        
        if (confirm(`確定要移除 ${member.name} 嗎？`)) {
            this.members = this.members.filter(m => m.id !== memberId);
            this.renderMembersList();
            alert('成員已移除！');
        }
    }
    
    showTransferModal(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;
        
        document.getElementById('transfer-user-name').textContent = member.name;
        document.getElementById('transfer-user-email').textContent = `(${member.email})`;
        
        // 儲存要轉移的成員 ID
        this.transferTargetId = memberId;
        
        this.showModal('transfer-modal');
    }
    
    handleTransferOwnership() {
        if (!this.transferTargetId) return;
        
        const targetMember = this.members.find(m => m.id === this.transferTargetId);
        const currentOwner = this.members.find(m => m.role === 'owner');
        
        if (!targetMember || !currentOwner) return;
        
        // 執行轉移
        targetMember.role = 'owner';
        currentOwner.role = 'admin';
        
        // 更新當前用戶資訊
        if (currentOwner.email === this.currentUser.email) {
            this.currentUser.role = 'admin';
            this.updateUserInfo();
        }
        
        this.renderMembersList();
        this.hideAllModals();
        
        alert(`擁有者權限已轉移給 ${targetMember.name}！`);
    }
    
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(inputId + '-toggle');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '🙈';
        } else {
            input.type = 'password';
            toggle.textContent = '👁️';
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showError(message) {
        alert('錯誤：' + message);
    }
    
    showSuccess(message) {
        alert('成功：' + message);
    }
    
    showLoadingState(button, text) {
        if (typeof button === 'string') {
            button = document.getElementById(button);
        }
        button.disabled = true;
        button.textContent = text;
        button.classList.add('loading');
    }
    
    hideLoadingState(button, originalText) {
        button.disabled = false;
        button.textContent = originalText;
        button.classList.remove('loading');
    }
    
    showTestAccounts() {
        const modal = document.getElementById('test-accounts-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideTestAccounts() {
        const modal = document.getElementById('test-accounts-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// 創建全域 app 實例
const app = new TeamManagementApp();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 Lucide 圖標
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // 初始化應用
    app.init();
    // 修正：移除不存在的頁面 ID 呼叫
    // app.showPage('role-management-page');
});

// 在第837行的 } 之前添加：
//     loginSuccess() {
//         // 登入成功，跳轉到 dashboard
//         const email = document.getElementById('email').value;
//         
//         // 設定當前用戶（這裡可以根據 email 找到對應的用戶信息）
//         this.currentUser = {
//             email: email,
//             name: email.split('@')[0], // 簡單從 email 提取用戶名
//             role: email === 'owner@heisoo.com' ? 'owner' : 'member'
//         };
//         
//         // 跳轉到 dashboard 頁面
//         this.showPage('dashboard');
//         this.updateUserInfo();
//         this.renderMembersList();
//     }
// }
// 然後刪除第855-870行的重複定義

    // 處理用戶初始設定表單
    handleInitUser(e) {
        e.preventDefault();
        
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const termsAgree = document.getElementById('terms-agree').checked;
        
        // 驗證必填欄位
        if (!name) {
            this.showError('請輸入姓名');
            return;
        }
        
        if (!email) {
            this.showError('Email 地址不能為空');
            return;
        }
        
        if (!password) {
            this.showError('請設定密碼');
            return;
        }
        
        // 驗證密碼強度
        if (password.length < 8) {
            this.showError('密碼至少需要 8 個字符');
            return;
        }
        
        if (!termsAgree) {
            this.showError('請同意服務條款和隱私政策');
            return;
        }
        
        // 驗證邀請 token（可選）
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token && !this.validateInviteToken(email, token)) {
            this.showError('邀請鏈接無效或已過期');
            return;
        }
        
        // 模擬用戶設定過程
        this.showLoadingState('正在完成設定...');
        
        setTimeout(() => {
            // 更新用戶資料
            this.currentUser = {
                id: Date.now(),
                name: name,
                email: email,
                role: 'member',
                status: 'active',
                loginMethod: 'password',
                createdAt: new Date().toISOString()
            };
            
            // 儲存密碼
            this.userPasswords[email] = password;
            this.userLoginMethods[email] = 'password';
            
            // 更新成員列表
            this.members.push(this.currentUser);
            
            // 標記邀請為已使用
            if (token) {
                this.markInviteAsUsed(email, token);
            }
            
            // 儲存到 localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('userPasswords', JSON.stringify(this.userPasswords));
            localStorage.setItem('userLoginMethods', JSON.stringify(this.userLoginMethods));
            localStorage.setItem('members', JSON.stringify(this.members));
            
            this.hideLoadingState();
            this.showSuccess('帳號設定完成！正在跳轉...');
            
            // 跳轉到團隊頁面
            setTimeout(() => {
                window.location.href = 'team.html';
            }, 1500);
        }, 2000);
    }
}
validateInviteToken(email, token) {
    const invites = JSON.parse(localStorage.getItem('pendingInvites') || '[]');
    const invite = invites.find(inv => inv.email === email && inv.token === token && inv.status === 'pending');
    
    if (!invite) {
        return false;
    }
    
    // 檢查邀請是否過期（例如：7天有效期）
    const createdAt = new Date(invite.createdAt);
    const now = new Date();
    const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    return daysDiff <= 7;
}

markInviteAsUsed(email, token) {
    const invites = JSON.parse(localStorage.getItem('pendingInvites') || '[]');
    const inviteIndex = invites.findIndex(inv => inv.email === email && inv.token === token);
    
    if (inviteIndex !== -1) {
        invites[inviteIndex].status = 'used';
        invites[inviteIndex].usedAt = new Date().toISOString();
        localStorage.setItem('pendingInvites', JSON.stringify(invites));
    }
}