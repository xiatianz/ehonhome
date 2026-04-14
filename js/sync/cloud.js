// 云端同步模块 - Supabase Auth（基于用户登录）
const { gS } = require('../storage');
const toast = require('../toast');
const supabaseAuth = require('./auth');

const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SuO0A9cl2DH6Ru-_OPFFYA_SvOAdl-F';
const TABLE = 'sync_data';

// ── Supabase REST 请求封装 ─────────────────────────────────
async function sbFetch(path, options = {}) {
  // 获取当前用户的 access token
  const accessToken = supabaseAuth.getAccessToken();
  
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };

  // 如果已登录，使用用户的 access token；否则使用 anon key
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    // 204 No Content 直接返回 null
    if (res.status === 204) return null;

    const text = await res.text();
    if (!text || !text.trim()) return null;

    const json = JSON.parse(text);
    if (!res.ok) {
      const errMsg = json.message || json.error || json.msg || `HTTP ${res.status}`;
      throw new Error(errMsg);
    }
    return json;
  } catch (error) {
    if (error.message && error.message.includes('JSON')) {
      throw new Error('服务器响应格式错误');
    }
    throw error;
  }
}

class CloudSync {
  constructor() {
    this.config = this._loadConfig();
  }

  // ── 同步配置 ──────────────────────────────────────────────
  _loadConfig() {
    const sto = gS('sync');
    return sto.config || { lastSync: null, autoSync: false };
  }

  saveConfig() {
    const sto = gS('sync');
    sto.config = this.config;
  }

  getLastSyncTime() { return this.config.lastSync; }

  // ── 认证状态代理 ──────────────────────────────────────────
  isAuthenticated() { return supabaseAuth.isAuthenticated(); }
  getUser()         { return supabaseAuth.getUser(); }
  getEmail()        { return supabaseAuth.getEmail(); }
  getUserId()       { return supabaseAuth.getUserId(); }

  // 兼容旧接口
  isEnabled()  { return this.isAuthenticated(); }
  enable()     {}
  disable()    {}

  // ── 收集本地数据 ──────────────────────────────────────────
  getAllLocalData() {
    const keys = ['setting', 'link', 'says', 'hello', 'background', 'custom', 'oobe'];
    const data = {};
    keys.forEach(key => {
      try {
        const sto = gS(key);
        if (sto) data[key] = sto.getAll ? sto.getAll() : sto;
      } catch (e) {
        console.error(`[Sync] get "${key}" failed:`, e);
      }
    });
    return data;
  }

  // ── 合并云端数据到本地 ────────────────────────────────────
  mergeCloudData(cloudData) {
    if (!cloudData || typeof cloudData !== 'object') return;
    Object.keys(cloudData).forEach(key => {
      if (key.startsWith('_')) return;
      try {
        const sto = gS(key);
        if (sto && cloudData[key]) Object.assign(sto, cloudData[key]);
      } catch (e) {
        console.error(`[Sync] merge "${key}" failed:`, e);
      }
    });
  }

  // ── 上传到 Supabase ───────────────────────────────────────
  async upload() {
    if (!this.isAuthenticated()) {
      toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      toast.show('正在同步...');
      const data = this.getAllLocalData();
      const updated_at = new Date().toISOString();
      const user_id = this.getUserId();

      // 先查询该用户是否已有数据
      const existing = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=id`
      );

      if (existing && existing.length > 0) {
        // 已有记录，使用 PATCH 更新
        await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            data,
            updated_at,
          }),
        });
      } else {
        // 无记录，使用 POST 插入
        await sbFetch(TABLE, {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id,
            data,
            updated_at,
          }),
        });
      }

      this.config.lastSync = updated_at;
      this.saveConfig();
      toast.show('数据已同步到云端 ✓');
      return { success: true };

    } catch (error) {
      toast.show('同步失败: ' + error.message);
      console.error('[Sync] upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── 从 Supabase 下载 ──────────────────────────────────────
  async download() {
    if (!this.isAuthenticated()) {
      toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      toast.show('正在下载...');
      const user_id = this.getUserId();

      const rows = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=data,updated_at`
      );

      if (!rows || rows.length === 0) {
        toast.show('云端暂无数据');
        return { success: false, error: 'No data' };
      }

      const { data, updated_at } = rows[0];
      this.mergeCloudData(data);

      this.config.lastSync = updated_at;
      this.saveConfig();
      toast.show('数据已从云端恢复 ✓');
      return { success: true };

    } catch (error) {
      toast.show('下载失败: ' + error.message);
      console.error('[Sync] download error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── 自动同步 ──────────────────────────────────────────────
  async autoSync() {
    if (this.config.autoSync && this.isAuthenticated()) {
      return await this.upload();
    }
  }
}

const cloudSync = new CloudSync();
module.exports = cloudSync;
