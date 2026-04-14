// 云端同步模块 - Supabase Auth（基于用户登录）
// 只同步链接数据，使用 link 模块的正确接口读写 IndexedDB
const { gS } = require('../storage');
const toast = require('../toast');
const supabaseAuth = require('./auth');
const link = require('../link/index');

const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SuO0A9cl2DH6Ru-_OPFFYA_SvOAdl-F';
const TABLE = 'sync_data';

// ── Supabase REST 请求封装 ─────────────────────────────────
async function sbFetch(path, options = {}) {
  const accessToken = supabaseAuth.getAccessToken();
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
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

// ── 链接去重合并 ──────────────────────────────────────────
// 基于 title+url 去重，保留两端的链接
function mergeLinkArrays(local, cloud) {
  if (!cloud || !Array.isArray(cloud)) return local;
  if (!local || !Array.isArray(local)) return cloud;
  const merged = [...local];
  for (const cl of cloud) {
    const exists = merged.find(l => l.title === cl.title && l.url === cl.url);
    if (!exists) merged.push(cl);
  }
  return merged;
}

// ── 分类数据合并 ──────────────────────────────────────────
function mergeCateData(local, cloud) {
  if (!cloud || typeof cloud !== 'object') return local;
  if (!local || typeof local !== 'object') return cloud;
  const merged = { ...local };
  for (const cateName in cloud) {
    if (merged[cateName]) {
      // 两端都有该分类，合并链接
      merged[cateName] = mergeLinkArrays(merged[cateName], cloud[cateName]);
    } else {
      // 云端有新分类，直接添加
      merged[cateName] = cloud[cateName];
    }
  }
  return merged;
}

// ── 分类名列表合并 ────────────────────────────────────────
function mergeCateLists(local, cloud) {
  if (!cloud || !Array.isArray(cloud)) return local;
  if (!local || !Array.isArray(local)) return cloud;
  const merged = [...local];
  for (const name of cloud) {
    if (!merged.includes(name)) merged.push(name);
  }
  return merged;
}

class CloudSync {
  constructor() {
    this.config = this._loadConfig();
  }

  _loadConfig() {
    const sto = gS('sync');
    return sto.config || { lastSync: null, autoSync: false };
  }

  saveConfig() {
    const sto = gS('sync');
    sto.config = this.config;
  }

  getLastSyncTime() { return this.config.lastSync; }

  isAuthenticated() { return supabaseAuth.isAuthenticated(); }
  getUser()         { return supabaseAuth.getUser(); }
  getEmail()        { return supabaseAuth.getEmail(); }
  getUserId()       { return supabaseAuth.getUserId(); }

  isEnabled()  { return this.isAuthenticated(); }
  enable()     {}
  disable()    {}

  // ── 收集本地链接数据（通过 link 模块的正确接口）──────
  async getLocalLinkData() {
    return new Promise((resolve) => {
      link.ready(() => {
        link.getCateAll((res) => {
          const cate = res.data || {};
          link.getLinks(null, (res2) => {
            const links = res2.data || [];
            link.getCates((res3) => {
              const catelist = res3.data || [];
              resolve({ links, cate, catelist });
            });
          });
        });
      });
    });
  }

  // ── 上传到 Supabase（先合并云端数据，再上传）──────────
  async upload(silent) {
    if (!this.isAuthenticated()) {
      if (!silent) toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (!silent) toast.show('正在同步...');

      const user_id = this.getUserId();
      const localLinkData = await this.getLocalLinkData();

      // 先读取云端数据，与本地合并后再上传（避免覆盖其他设备的数据）
      let mergedLinkData = localLinkData;
      const existing = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=data`
      );

      if (existing && existing.length > 0 && existing[0].data?.link) {
        const cloudLinkData = existing[0].data.link;
        mergedLinkData = {
          links: mergeLinkArrays(localLinkData.links, cloudLinkData.links),
          cate: mergeCateData(localLinkData.cate, cloudLinkData.cate),
          catelist: mergeCateLists(localLinkData.catelist, cloudLinkData.catelist),
        };
      }

      const updated_at = new Date().toISOString();
      const data = { link: mergedLinkData };

      if (existing && existing.length > 0) {
        await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ data, updated_at }),
        });
      } else {
        await sbFetch(TABLE, {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ user_id, data, updated_at }),
        });
      }

      this.config.lastSync = updated_at;
      this.saveConfig();
      if (!silent) toast.show('同步成功 ✓');
      return { success: true };

    } catch (error) {
      if (!silent) toast.show('同步失败: ' + error.message);
      console.error('[Sync] upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── 从 Supabase 下载并合并到本地 ────────────────────────
  async download() {
    if (!this.isAuthenticated()) {
      toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      toast.show('正在同步...');
      const user_id = this.getUserId();

      const rows = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=data,updated_at`
      );

      if (!rows || rows.length === 0) {
        toast.show('云端暂无数据，先上传本地数据');
        // 云端无数据，直接上传本地数据
        return await this.upload();
      }

      const cloudLinkData = rows[0].data?.link;
      if (!cloudLinkData) {
        toast.show('云端无链接数据，先上传本地数据');
        return await this.upload();
      }

      // 读取本地链接数据
      const localLinkData = await this.getLocalLinkData();

      // 合并：本地 + 云端，基于 title+url 去重
      const mergedLinks = mergeLinkArrays(localLinkData.links, cloudLinkData.links);
      const mergedCate = mergeCateData(localLinkData.cate, cloudLinkData.cate);
      const mergedCateList = mergeCateLists(localLinkData.catelist, cloudLinkData.catelist);

      // 通过 link 模块的 setAll 写回（正确处理 IndexedDB）
      await new Promise((resolve) => {
        link.setAll(mergedLinks, mergedCate, () => {
          const sto = gS('link');
          if (sto) sto.catelist = mergedCateList;
          resolve();
        });
      });

      // 合并后上传回云端，确保云端也是最新合并数据
      const updated_at = new Date().toISOString();
      const data = { link: { links: mergedLinks, cate: mergedCate, catelist: mergedCateList } };
      await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ data, updated_at }),
      });

      this.config.lastSync = updated_at;
      this.saveConfig();

      toast.show('同步成功，数据已合并 ✓');
      return { success: true };

    } catch (error) {
      toast.show('同步失败: ' + error.message);
      console.error('[Sync] download error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── 自动同步 ──────────────────────────────────────────────
  async autoSync() {
    if (this.config.autoSync && this.isAuthenticated()) {
      return await this.upload(true);
    }
  }
}

const cloudSync = new CloudSync();
module.exports = cloudSync;
