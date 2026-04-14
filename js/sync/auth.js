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

    // 如果有 session，添加 access token
    if (this.session?.access_token) {
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
        throw new Error(json.message || json.error_description || json.error || `HTTP ${res.status}`);
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
      toast.show('注册失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 登录 ──────────────────────────────────────────────────
  async signIn(email, password) {
    try {
      toast.show('正在登录...');
      
      const result = await this._request('token', {
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'password',
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
      toast.show('登录失败: ' + error.message);
      return { success: false, error: error.message };
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
    const access_token = params.get('access_token');
    if (!access_token) return false;
    
    // 检查是否有错误
    const error = params.get('error');
    const error_description = params.get('error_description');
    if (error) {
      toast.show('登录失败: ' + (error_description || error));
      this._cleanHash();
      return false;
    }
    
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
    
    // 清除 URL hash，避免 token 暴露在地址栏
    this._cleanHash();
    
    // 显示提示
    if (type === 'recovery') {
      toast.show('密码重置验证成功 ✓');
    } else {
      toast.show('GitHub 登录成功 ✓');
    }
    
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
      // Token 可能已过期
      this._clearSession();
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
      const result = await this._request('token', {
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'refresh_token',
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
      return this.isAuthenticated();
    }

    // 尝试从 localStorage 恢复 session
    if (this._loadSession()) {
      // 验证 session 是否仍然有效
      const user = await this.getCurrentUser();
      if (!user) {
        // Session 无效，尝试刷新
        await this.refreshSession();
      }
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
    return this.currentUser?.email || null;
  }

  getAccessToken() {
    return this.session?.access_token || null;
  }
}

const supabaseAuth = new SupabaseAuth();
module.exports = supabaseAuth;
