// Supabase Auth 认证模块 - 使用 Email 登录
const { gS } = require('../storage');
const toast = require('../toast');

const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SuO0A9cl2DH6Ru-_OPFFYA_SvOAdl-F';

// ── Supabase Auth API 封装 ─────────────────────────────────
class SupabaseAuth {
  constructor() {
    this.currentUser = null;
    this.session = null;
    this.config = this._loadConfig();
  }

  // ── 配置管理 ──────────────────────────────────────────────
  _loadConfig() {
    const sto = gS('sync');
    return sto.authConfig || { 
      lastSync: null, 
      autoSync: false,
      rememberMe: true 
    };
  }

  saveConfig() {
    const sto = gS('sync');
    sto.authConfig = this.config;
  }

  // ── 认证状态管理 ──────────────────────────────────────────
  _saveSession(session) {
    if (this.config.rememberMe && session) {
      localStorage.setItem('sb_session', JSON.stringify(session));
    }
    this.session = session;
    this.currentUser = session?.user || null;
  }

  _loadSession() {
    const saved = localStorage.getItem('sb_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // 检查是否过期
        if (session.expires_at && new Date(session.expires_at * 1000) > new Date()) {
          this.session = session;
          this.currentUser = session.user;
          return true;
        }
      } catch (e) {
        console.error('[Auth] Load session error:', e);
      }
    }
    return false;
  }

  _clearSession() {
    localStorage.removeItem('sb_session');
    this.session = null;
    this.currentUser = null;
  }

  // ── API 请求封装 ──────────────────────────────────────────
  async _request(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/auth/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };

    // 仅对需要认证的端点添加 Authorization header
    // token/signup/recover 等端点不需要 Authorization
    const authEndpoints = ['user', 'logout'];
    const needsAuth = authEndpoints.some(ep => endpoint.startsWith(ep) || endpoint === ep);
    if (needsAuth && this.session?.access_token) {
      headers['Authorization'] = `Bearer ${this.session.access_token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
      });

      const text = await res.text();
      
      if (!text || !text.trim()) {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return null;
      }

      const json = JSON.parse(text);
      
      if (!res.ok) {
        const errMsg = json.msg || json.message || json.error_description || json.error || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      return json;
    } catch (error) {
      console.error('[Auth] Request error:', error);
      throw error;
    }
  }

  // ── 注册 ──────────────────────────────────────────────────
  async signUp(email, password) {
    try {
      toast.show('正在注册...');
      
      const result = await this._request('signup', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        }),
      });

      if (result.user) {
        if (result.session) {
          // 如果不需要邮箱验证，直接登录
          this._saveSession(result.session);
          toast.show('注册成功！已自动登录 ✓');
        } else {
          // 需要邮箱验证
          toast.show('注册成功！请查收邮件并验证邮箱');
        }
        return { success: true, user: result.user, needsVerification: !result.session };
      }

      throw new Error('注册失败');
    } catch (error) {
      // 友好化常见错误提示
      let msg = error.message;
      if (msg.includes('user_already_exists') || msg.includes('User already registered')) {
        msg = '该邮箱已注册，请直接登录';
      } else if (msg.includes('Password should be')) {
        msg = '密码强度不足，至少需要6位';
      } else if (msg.includes('Invalid email')) {
        msg = '邮箱格式不正确';
      } else if (msg.includes('422')) {
        msg = '该邮箱已注册，请直接登录';
      }
      toast.show('注册失败: ' + msg);
      return { success: false, error: msg, code: 'user_already_exists' };
    }
  }

  // ── 登录 ──────────────────────────────────────────────────
  async signIn(email, password) {
    try {
      toast.show('正在登录...');
      
      // Supabase Auth: grant_type 必须作为 URL 查询参数
      const result = await this._request('token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (result.access_token) {
        const session = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + result.expires_in,
          user: result.user,
        };
        
        this._saveSession(session);
        toast.show('登录成功 ✓');
        return { success: true, user: result.user };
      }

      throw new Error('登录失败');
    } catch (error) {
      // 友好化常见错误提示
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) {
        msg = '邮箱或密码不正确';
      } else if (msg.includes('Email not confirmed')) {
        msg = '邮箱未验证，请查收验证邮件';
      } else if (msg.includes('429')) {
        msg = '请求过于频繁，请稍后再试';
      }
      toast.show('登录失败: ' + msg);
      return { success: false, error: msg };
    }
  }

  // ── GitHub OAuth 登录 ────────────────────────────────────
  signInWithGitHub() {
    // Supabase OAuth 流程：
    // 1. 重定向到 Supabase 的 /auth/v1/authorize 端点
    // 2. Supabase 回调到自己的 /auth/v1/callback
    // 3. Supabase 重定向到 redirect_to，在 URL hash 中携带 token
    // redirect_to 必须在 Supabase Dashboard → Authentication → Redirect URLs 中配置
    const redirectTo = window.location.origin + window.location.pathname;
    const url = `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  }

  // ── 处理 OAuth 回调（页面加载时从 URL hash 恢复 session）────
  handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;
    
    const params = new URLSearchParams(hash);
    
    // 优先检查错误（如 otp_expired、access_denied 等）
    const error = params.get('error');
    const error_code = params.get('error_code');
    const error_description = params.get('error_description');
    if (error) {
      // 友好化错误提示
      if (error_code === 'otp_expired' || error_description?.includes('expired')) {
        this._oauthError = '链接已过期，请重新发送重置邮件';
      } else if (error === 'access_denied') {
        this._oauthError = '访问被拒绝';
      } else {
        this._oauthError = error_description || error;
      }
      this._cleanHash();
      return false;
    }
    
    const access_token = params.get('access_token');
    if (!access_token) return false;
    
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const expires_at = params.get('expires_at');
    const type = params.get('type'); // 'signup' | 'recovery' | etc.
    
    // 解析 JWT 获取用户信息
    let user = null;
    try {
      const payload = access_token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      user = {
        id: decoded.sub,
        email: decoded.email || '',
        aud: decoded.aud,
        role: decoded.role,
        user_metadata: decoded.user_metadata || {},
        app_metadata: decoded.app_metadata || {},
      };
    } catch (e) {
      console.error('[Auth] Parse token error:', e);
    }
    
    const session = {
      access_token,
      refresh_token,
      expires_at: expires_at ? parseInt(expires_at) : Math.floor(Date.now() / 1000) + parseInt(expires_in || 3600),
      token_type: params.get('token_type') || 'bearer',
      user,
    };
    
    this._saveSession(session);
    this._oauthSuccess = true;
    this._oauthType = type;
    
    // 清除 URL hash，避免 token 暴露在地址栏
    this._cleanHash();
    
    return true;
  }

  // ── 清除 URL hash ────────────────────────────────────────
  _cleanHash() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  // ── 登出 ──────────────────────────────────────────────────
  async signOut() {
    try {
      if (this.session?.access_token) {
        await this._request('logout', {
          method: 'POST',
        });
      }
      
      this._clearSession();
      toast.show('已退出登录');
      return { success: true };
    } catch (error) {
      // 即使 API 失败，也清除本地 session
      this._clearSession();
      toast.show('已退出登录');
      return { success: true };
    }
  }

  // ── 获取当前用户 ──────────────────────────────────────────
  async getCurrentUser() {
    if (!this.session?.access_token) {
      return null;
    }

    try {
      const user = await this._request('user');
      this.currentUser = user;
      return user;
    } catch (error) {
      // 网络错误不清除 session（可能是 SW 拦截或临时断网）
      // 只有 401/403 等认证错误才清除
      if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('JWT'))) {
        this._clearSession();
      }
      return null;
    }
  }

  // ── 重置密码 ──────────────────────────────────────────────
  async resetPassword(email) {
    try {
      toast.show('正在发送重置邮件...');
      
      await this._request('recover', {
        method: 'POST',
        body: JSON.stringify({ 
          email,
          redirectTo: `${window.location.origin}?reset-password=true`
        }),
      });

      toast.show('重置邮件已发送，请查收');
      return { success: true };
    } catch (error) {
      toast.show('发送失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 更新密码 ──────────────────────────────────────────────
  async updatePassword(newPassword) {
    try {
      toast.show('正在更新密码...');
      
      const result = await this._request('user', {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });

      toast.show('密码已更新 ✓');
      return { success: true, user: result };
    } catch (error) {
      toast.show('更新失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 刷新 Token ────────────────────────────────────────────
  async refreshSession() {
    if (!this.session?.refresh_token) {
      return false;
    }

    try {
      // Supabase Auth: grant_type 必须作为 URL 查询参数
      const result = await this._request('token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: this.session.refresh_token,
        }),
      });

      if (result.access_token) {
        const session = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + result.expires_in,
          user: result.user,
        };
        
        this._saveSession(session);
        return true;
      }
    } catch (error) {
      console.error('[Auth] Refresh session error:', error);
      this._clearSession();
    }
    
    return false;
  }

  // ── 初始化（自动恢复 session + 处理 OAuth 回调）──────────
  async init() {
    // 优先检查 OAuth 回调（URL hash 中有 token）
    if (this.handleOAuthCallback()) {
      // 延迟显示 toast，等 toast 模块初始化完成
      setTimeout(() => {
        if (this._oauthSuccess) {
          if (this._oauthType === 'recovery') {
            toast.show('密码重置验证成功，请设置新密码');
            // 触发密码重置回调，让 cloud-ui 弹出修改密码对话框
            if (this._onPasswordRecovery) this._onPasswordRecovery();
          } else {
            toast.show('GitHub 登录成功 ✓');
          }
          this._oauthSuccess = false;
        }
      }, 500);
      return this.isAuthenticated();
    }

    // OAuth 回调有错误
    if (this._oauthError) {
      const err = this._oauthError;
      this._oauthError = null;
      setTimeout(() => { toast.show('登录失败: ' + err); }, 500);
      return false;
    }

    // 尝试从 localStorage 恢复 session
    if (this._loadSession()) {
      // 验证 session 是否仍然有效（异步，不阻塞初始化）
      this.getCurrentUser().then(user => {
        if (!user) {
          // 验证失败，尝试用 refresh_token 刷新
          this.refreshSession();
        }
      });
    }
    
    return this.isAuthenticated();
  }

  // ── 状态检查 ──────────────────────────────────────────────
  isAuthenticated() {
    return !!this.currentUser && !!this.session?.access_token;
  }

  getUser() {
    return this.currentUser;
  }

  getUserId() {
    return this.currentUser?.id || null;
  }

  getEmail() {
    if (!this.currentUser) return null;
    // 优先显示 email，GitHub 用户可能没有 email 则显示用户名
    return this.currentUser.email || this.currentUser.user_metadata?.preferred_username || this.currentUser.user_metadata?.full_name || this.currentUser.user_metadata?.name || '已登录';
  }

  getAccessToken() {
    return this.session?.access_token || null;
  }
}

const supabaseAuth = new SupabaseAuth();
module.exports = supabaseAuth;
