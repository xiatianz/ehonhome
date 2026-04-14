// 云端同步 UI - Supabase Auth 方案（Email + GitHub 登录）
const { SettingGroup, SettingItem, mainSetting } = require('../setting/index');
const { alert, confirm, prompt } = require('../dialog/dialog_utils');
const cloudSync = require('./cloud');
const supabaseAuth = require('./auth');
const { pushMenu, MAIN_MENU_TOP } = require('../menu/mainmenu');
const { icon } = require('../iconc');
const util = require('../util');
const dialog = require('../dialog/index');

// ── 设置分组 ──────────────────────────────────────────────
const cloudGroup = new SettingGroup({ title: '云端同步', index: 6 });
mainSetting.addNewGroup(cloudGroup);

// ── 顶部菜单按钮 ──────────────────────────────────────────
function addCloudSyncToMenu() {
  const syncIcon = new icon({
    class: 'cloud_sync',
    content: util.getGoogleIcon('e2bd'),
    offset: 'tr'
  });
  syncIcon.getIcon().onclick = e => {
    e.stopPropagation();
    if (cloudSync.isAuthenticated()) {
      cloudSync.upload();
    } else {
      showLoginDialog();
    }
  };
  pushMenu({
    title: '☁️ 同步到云端',
    icon: util.getGoogleIcon('e2bd'),
    callback: () => {
      if (cloudSync.isAuthenticated()) {
        cloudSync.upload();
      } else {
        showLoginDialog();
      }
    },
  }, MAIN_MENU_TOP);
}
setTimeout(addCloudSyncToMenu, 200);

// ── 登录/注册对话框 ────────────────────────────────────────
function showLoginDialog() {
  const d = new dialog({
    content: `
      <div class="auth-dialog">
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">登录</button>
          <button class="auth-tab" data-tab="register">注册</button>
        </div>
        <div class="auth-form" id="auth-login-form">
          <button class="auth-github-btn" id="auth-github-login-btn">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            使用 GitHub 登录
          </button>
          <div class="auth-divider"><span>或使用邮箱</span></div>
          <div class="auth-field">
            <label>邮箱</label>
            <input type="email" id="auth-email" placeholder="请输入邮箱" autocomplete="email"/>
          </div>
          <div class="auth-field">
            <label>密码</label>
            <input type="password" id="auth-password" placeholder="请输入密码" autocomplete="current-password"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-login-btn">登录</button>
            <button class="btn" id="auth-forgot-btn">忘记密码？</button>
          </div>
          <div class="auth-error" id="auth-error"></div>
        </div>
        <div class="auth-form" id="auth-register-form" style="display:none">
          <button class="auth-github-btn" id="auth-github-reg-btn">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            使用 GitHub 注册
          </button>
          <div class="auth-divider"><span>或使用邮箱</span></div>
          <div class="auth-field">
            <label>邮箱</label>
            <input type="email" id="auth-reg-email" placeholder="请输入邮箱" autocomplete="email"/>
          </div>
          <div class="auth-field">
            <label>密码</label>
            <input type="password" id="auth-reg-password" placeholder="至少6位密码" autocomplete="new-password"/>
          </div>
          <div class="auth-field">
            <label>确认密码</label>
            <input type="password" id="auth-reg-password2" placeholder="再次输入密码" autocomplete="new-password"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-register-btn">注册</button>
          </div>
          <div class="auth-error" id="auth-reg-error"></div>
        </div>
        <div class="auth-form" id="auth-forgot-form" style="display:none">
          <div class="auth-field">
            <label>邮箱</label>
            <input type="email" id="auth-reset-email" placeholder="请输入注册邮箱" autocomplete="email"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-reset-btn">发送重置邮件</button>
            <button class="btn" id="auth-back-login-btn">返回登录</button>
          </div>
          <div class="auth-error" id="auth-reset-error"></div>
        </div>
      </div>
    `,
    clickOtherToClose: true,
  });

  setTimeout(() => { d.open(); }, 10);
  const dd = d.getDialogDom();

  // ── Tab 切换 ───────────────────────────────────────────
  const tabs = dd.querySelectorAll('.auth-tab');
  const loginForm = dd.querySelector('#auth-login-form');
  const registerForm = dd.querySelector('#auth-register-form');
  const forgotForm = dd.querySelector('#auth-forgot-form');

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      loginForm.style.display = target === 'login' ? '' : 'none';
      registerForm.style.display = target === 'register' ? '' : 'none';
      forgotForm.style.display = 'none';
      // 清除错误
      dd.querySelector('#auth-error').textContent = '';
      dd.querySelector('#auth-reg-error').textContent = '';
    };
  });

  // ── GitHub 登录 ─────────────────────────────────────────
  dd.querySelector('#auth-github-login-btn').onclick = () => {
    supabaseAuth.signInWithGitHub();
  };
  dd.querySelector('#auth-github-reg-btn').onclick = () => {
    supabaseAuth.signInWithGitHub();
  };

  // ── 登录 ───────────────────────────────────────────────
  dd.querySelector('#auth-login-btn').onclick = async () => {
    const email = dd.querySelector('#auth-email').value.trim();
    const password = dd.querySelector('#auth-password').value;
    const errorEl = dd.querySelector('#auth-error');

    if (!email || !password) {
      errorEl.textContent = '请填写邮箱和密码';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-login-btn').disabled = true;
    dd.querySelector('#auth-login-btn').textContent = '登录中...';

    const result = await supabaseAuth.signIn(email, password);

    dd.querySelector('#auth-login-btn').disabled = false;
    dd.querySelector('#auth-login-btn').textContent = '登录';

    if (result.success) {
      d.close();
      setTimeout(() => { d.destroy(); }, 300);
      refreshUI();
    } else {
      errorEl.textContent = result.error || '登录失败';
    }
  };

  // Enter 键登录
  dd.querySelector('#auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') dd.querySelector('#auth-login-btn').click();
  });

  // ── 注册 ───────────────────────────────────────────────
  dd.querySelector('#auth-register-btn').onclick = async () => {
    const email = dd.querySelector('#auth-reg-email').value.trim();
    const password = dd.querySelector('#auth-reg-password').value;
    const password2 = dd.querySelector('#auth-reg-password2').value;
    const errorEl = dd.querySelector('#auth-reg-error');

    if (!email || !password) {
      errorEl.textContent = '请填写邮箱和密码';
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = '密码至少6位';
      return;
    }
    if (password !== password2) {
      errorEl.textContent = '两次密码不一致';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-register-btn').disabled = true;
    dd.querySelector('#auth-register-btn').textContent = '注册中...';

    const result = await supabaseAuth.signUp(email, password);

    dd.querySelector('#auth-register-btn').disabled = false;
    dd.querySelector('#auth-register-btn').textContent = '注册';

    if (result.success) {
      if (result.needsVerification) {
        errorEl.style.color = 'var(--theme-color)';
        errorEl.textContent = '注册成功！请查收邮件验证邮箱后登录';
      } else {
        d.close();
        setTimeout(() => { d.destroy(); }, 300);
        refreshUI();
      }
    } else {
      errorEl.textContent = result.error || '注册失败';
    }
  };

  // Enter 键注册
  dd.querySelector('#auth-reg-password2').addEventListener('keydown', e => {
    if (e.key === 'Enter') dd.querySelector('#auth-register-btn').click();
  });

  // ── 忘记密码 ───────────────────────────────────────────
  dd.querySelector('#auth-forgot-btn').onclick = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotForm.style.display = '';
    tabs.forEach(t => t.classList.remove('active'));
  };

  dd.querySelector('#auth-back-login-btn').onclick = () => {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    forgotForm.style.display = 'none';
    tabs[0].classList.add('active');
  };

  dd.querySelector('#auth-reset-btn').onclick = async () => {
    const email = dd.querySelector('#auth-reset-email').value.trim();
    const errorEl = dd.querySelector('#auth-reset-error');

    if (!email) {
      errorEl.textContent = '请填写邮箱';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-reset-btn').disabled = true;
    dd.querySelector('#auth-reset-btn').textContent = '发送中...';

    const result = await supabaseAuth.resetPassword(email);

    dd.querySelector('#auth-reset-btn').disabled = false;
    dd.querySelector('#auth-reset-btn').textContent = '发送重置邮件';

    if (result.success) {
      errorEl.style.color = 'var(--theme-color)';
      errorEl.textContent = '重置邮件已发送，请查收';
    } else {
      errorEl.textContent = result.error || '发送失败';
    }
  };
}

// ── 刷新 UI 状态 ──────────────────────────────────────────
function refreshUI() {
  if (loginStatusItem) loginStatusItem.reGet();
  if (lastSyncItem) lastSyncItem.reGet();
  if (uploadItem) uploadItem.reInit();
  if (downloadItem) downloadItem.reInit();
  if (autoSyncItem) autoSyncItem.reInit();
}

// ── 登录状态 ─────────────────────────────────────────────
const loginStatusItem = new SettingItem({
  type: 'null',
  title: '账号状态',
  index: 1,
  get() {
    if (cloudSync.isAuthenticated()) {
      return cloudSync.getEmail();
    }
    return '未登录';
  },
  callback() {
    if (cloudSync.isAuthenticated()) {
      confirm('确定要退出登录吗？', async ok => {
        if (ok) {
          await supabaseAuth.signOut();
          refreshUI();
        }
      });
    } else {
      showLoginDialog();
    }
  },
});

// ── 上传 ─────────────────────────────────────────────────
const uploadItem = new SettingItem({
  type: 'null',
  title: '上传到云端',
  message: '将本地数据备份到云端',
  index: 2,
  check() { return cloudSync.isAuthenticated(); },
  callback() {
    cloudSync.upload().then(() => lastSyncItem.reGet());
  },
});

// ── 下载 ─────────────────────────────────────────────────
const downloadItem = new SettingItem({
  type: 'null',
  title: '从云端下载',
  message: '从云端恢复数据到本地（会覆盖本地）',
  index: 3,
  check() { return cloudSync.isAuthenticated(); },
  callback() {
    confirm('下载云端数据将覆盖本地数据，确定继续吗？', ok => {
      if (ok) {
        cloudSync.download().then(res => {
          if (res.success) alert('数据已同步，请刷新页面以应用更改');
        });
      }
    });
  },
});

// ── 自动同步 ─────────────────────────────────────────────
const autoSyncItem = new SettingItem({
  type: 'boolean',
  title: '自动同步',
  message: '数据变更时自动上传到云端',
  index: 4,
  check() { return cloudSync.isAuthenticated(); },
  get()       { return cloudSync.config.autoSync; },
  callback(v) { cloudSync.config.autoSync = v; cloudSync.saveConfig(); },
});

// ── 上次同步时间 ──────────────────────────────────────────
const lastSyncItem = new SettingItem({
  type: 'null',
  title: '上次同步',
  index: 5,
  check() { return cloudSync.isAuthenticated(); },
  get() {
    const t = cloudSync.getLastSyncTime();
    return t ? new Date(t).toLocaleString('zh-CN') : '从未同步';
  },
});

// ── 加入分组 ──────────────────────────────────────────────
cloudGroup.addNewItem(loginStatusItem);
cloudGroup.addNewItem(uploadItem);
cloudGroup.addNewItem(downloadItem);
cloudGroup.addNewItem(autoSyncItem);
cloudGroup.addNewItem(lastSyncItem);

// ── 修改密码对话框 ────────────────────────────────────────
function showResetPasswordDialog() {
  const d = new dialog({
    content: `
      <div class="auth-dialog">
        <div class="auth-tabs">
          <button class="auth-tab active">设置新密码</button>
        </div>
        <div class="auth-form">
          <div class="auth-field">
            <label>新密码</label>
            <input type="password" id="auth-new-password" placeholder="至少6位新密码" autocomplete="new-password"/>
          </div>
          <div class="auth-field">
            <label>确认新密码</label>
            <input type="password" id="auth-new-password2" placeholder="再次输入新密码" autocomplete="new-password"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-update-pwd-btn">确认修改</button>
          </div>
          <div class="auth-error" id="auth-pwd-error"></div>
        </div>
      </div>
    `,
    clickOtherToClose: false,
  });

  setTimeout(() => { d.open(); }, 10);
  const dd = d.getDialogDom();

  dd.querySelector('#auth-update-pwd-btn').onclick = async () => {
    const pwd = dd.querySelector('#auth-new-password').value;
    const pwd2 = dd.querySelector('#auth-new-password2').value;
    const errorEl = dd.querySelector('#auth-pwd-error');

    if (!pwd) {
      errorEl.textContent = '请输入新密码';
      return;
    }
    if (pwd.length < 6) {
      errorEl.textContent = '密码至少6位';
      return;
    }
    if (pwd !== pwd2) {
      errorEl.textContent = '两次密码不一致';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-update-pwd-btn').disabled = true;
    dd.querySelector('#auth-update-pwd-btn').textContent = '修改中...';

    const result = await supabaseAuth.updatePassword(pwd);

    dd.querySelector('#auth-update-pwd-btn').disabled = false;
    dd.querySelector('#auth-update-pwd-btn').textContent = '确认修改';

    if (result.success) {
      d.close();
      setTimeout(() => { d.destroy(); }, 300);
      refreshUI();
    } else {
      errorEl.textContent = result.error || '修改失败';
    }
  };

  dd.querySelector('#auth-new-password2').addEventListener('keydown', e => {
    if (e.key === 'Enter') dd.querySelector('#auth-update-pwd-btn').click();
  });
}

// ── 注册密码重置回调 ──────────────────────────────────────
supabaseAuth._onPasswordRecovery = showResetPasswordDialog;

// ── 初始化：恢复登录状态 ──────────────────────────────────
supabaseAuth.init().then((isAuth) => {
  refreshUI();
  // 登录成功后自动从云端下载数据
  if (isAuth) {
    cloudSync.download().catch(() => {});
  }
});

module.exports = {};
