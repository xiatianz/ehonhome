// 云端同步模块 - Supabase Auth（基于用户登录）
// 只同步链接数据，使用 link 模块的正确接口读写 IndexedDB
// 支持增删同步：通过快照对比计算本地增删，应用到云端
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

// ── 兼容旧格式数据（之前上传的 {code:0,data:[...]} 包装对象）────
function unwrapData(obj) {
  if (!obj) return obj;
  // 如果是数组，直接返回
  if (Array.isArray(obj)) return obj;
  // 如果是 {code:0, data:[...]} 包装对象，提取 .data
  if (obj && typeof obj === 'object' && obj.data !== undefined && obj.code !== undefined) {
    return obj.data;
  }
  return obj;
}

// ── 链接标识（用于去重和对比）──────────────────────────────
function linkKey(l) {
  return l.title + '\x00' + l.url;
}

// ── 基于快照的智能合并 ────────────────────────────────────
// snapshot: 上次同步后的数据快照
// local: 当前本地数据
// cloud: 当前云端数据
// 逻辑：
//   本地新增 = local 有但 snapshot 没有的 → 加入结果
//   本地删除 = snapshot 有但 local 没有的 → 从结果中移除
//   云端新增 = cloud 有但 snapshot 没有的 → 加入结果（另一设备的添加）
//   云端删除 = snapshot 有但 cloud 没有的 → 从结果中移除（另一设备的删除）
//   两端都有 = 保留
function smartMergeLinks(local, cloud, snapshot) {
  const localArr = Array.isArray(local) ? local : [];
  const cloudArr = Array.isArray(cloud) ? cloud : [];
  const snapArr = Array.isArray(snapshot) ? snapshot : [];

  const snapSet = new Set(snapArr.map(linkKey));
  const localSet = new Set(localArr.map(linkKey));
  const cloudSet = new Set(cloudArr.map(linkKey));

  // 本地删除的链接：快照中有但本地没有
  const localDeleted = new Set();
  snapSet.forEach(k => { if (!localSet.has(k)) localDeleted.add(k); });

  // 云端删除的链接：快照中有但云端没有
  const cloudDeleted = new Set();
  snapSet.forEach(k => { if (!cloudSet.has(k)) cloudDeleted.add(k); });

  // 合并：取本地和云端的并集，再移除两端删除的
  const merged = [];
  const seen = new Set();

  // 先加本地链接
  for (const l of localArr) {
    const k = linkKey(l);
    if (!seen.has(k) && !cloudDeleted.has(k)) {
      merged.push(l);
      seen.add(k);
    }
  }
  // 再加云端链接（本地没有的）
  for (const l of cloudArr) {
    const k = linkKey(l);
    if (!seen.has(k) && !localDeleted.has(k)) {
      merged.push(l);
      seen.add(k);
    }
  }

  return merged;
}

// ── 分类数据智能合并 ──────────────────────────────────────
function smartMergeCate(local, cloud, snapshot) {
  const localCate = local && typeof local === 'object' ? local : {};
  const cloudCate = cloud && typeof cloud === 'object' ? cloud : {};
  const snapCate = snapshot && typeof snapshot === 'object' ? snapshot : {};

  // 收集所有分类名
  const allCateNames = new Set([
    ...Object.keys(localCate),
    ...Object.keys(cloudCate),
    ...Object.keys(snapCate),
  ]);

  const merged = {};
  for (const name of allCateNames) {
    const localLinks = localCate[name] || [];
    const cloudLinks = cloudCate[name] || [];
    const snapLinks = snapCate[name] || [];

    // 如果本地和云端都没有该分类的链接了，跳过（分类被删除）
    if (localLinks.length === 0 && cloudLinks.length === 0) continue;

    merged[name] = smartMergeLinks(localLinks, cloudLinks, snapLinks);
    // 如果合并后为空，移除该分类
    if (merged[name].length === 0) delete merged[name];
  }

  return merged;
}

// ── 分类名列表智能合并 ────────────────────────────────────
function smartMergeCateLists(local, cloud, snapshot) {
  const localList = Array.isArray(local) ? local : [];
  const cloudList = Array.isArray(cloud) ? cloud : [];
  const snapList = Array.isArray(snapshot) ? snapshot : [];

  const snapSet = new Set(snapList);
  const localSet = new Set(localList);
  const cloudSet = new Set(cloudList);

  // 本地删除的分类：快照中有但本地没有
  const localDeleted = new Set();
  snapSet.forEach(k => { if (!localSet.has(k)) localDeleted.add(k); });

  // 云端删除的分类：快照中有但云端没有
  const cloudDeleted = new Set();
  snapSet.forEach(k => { if (!cloudSet.has(k)) cloudDeleted.add(k); });

  const merged = [];
  const seen = new Set();

  for (const name of localList) {
    if (!seen.has(name) && !cloudDeleted.has(name)) {
      merged.push(name);
      seen.add(name);
    }
  }
  for (const name of cloudList) {
    if (!seen.has(name) && !localDeleted.has(name)) {
      merged.push(name);
      seen.add(name);
    }
  }

  return merged;
}

class CloudSync {
  constructor() {
    this.config = this._loadConfig();
  }

  _loadConfig() {
    const sto = gS('sync');
    return sto.config || { lastSync: null, autoSync: false, snapshot: null };
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
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('读取本地数据超时'));
      }, 10000);
      link.ready(() => {
        link.getCateAll((res) => {
          const cate = res.data || {};
          link.getLinks(null, (res2) => {
            const links = res2.data || [];
            link.getCates((res3) => {
              const catelist = res3.data || [];
              clearTimeout(timeout);
              resolve({ links, cate, catelist });
            });
          });
        });
      });
    });
  }

  // ── 保存快照 ────────────────────────────────────────────
  _saveSnapshot(linkData) {
    this.config.snapshot = linkData;
    this.saveConfig();
  }

  // ── 获取快照 ────────────────────────────────────────────
  _getSnapshot() {
    return this.config.snapshot || null;
  }

  // ── 上传到 Supabase（基于快照的增删同步）──────────────
  async upload(silent) {
    if (!this.isAuthenticated()) {
      if (!silent) toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (!silent) toast.show('正在同步...');

      const user_id = this.getUserId();
      const localLinkData = await this.getLocalLinkData();
      const snapshot = this._getSnapshot();

      // 读取云端数据
      let cloudLinkData = null;
      const existing = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=data`
      );
      if (existing && existing.length > 0 && existing[0].data?.link) {
        cloudLinkData = existing[0].data.link;
        // 兼容旧格式：解包 {code:0, data:[...]} 包装对象
        cloudLinkData = {
          links: unwrapData(cloudLinkData.links) || [],
          cate: unwrapData(cloudLinkData.cate) || {},
          catelist: unwrapData(cloudLinkData.catelist) || [],
        };
      }

      // 基于快照智能合并
      let mergedLinkData;
      if (snapshot && cloudLinkData) {
        mergedLinkData = {
          links: smartMergeLinks(localLinkData.links, cloudLinkData.links, snapshot.links),
          cate: smartMergeCate(localLinkData.cate, cloudLinkData.cate, snapshot.cate),
          catelist: smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, snapshot.catelist),
        };
      } else if (cloudLinkData) {
        // 无快照（首次同步），只做简单合并（添加不删除）
        mergedLinkData = {
          links: smartMergeLinks(localLinkData.links, cloudLinkData.links, []),
          cate: smartMergeCate(localLinkData.cate, cloudLinkData.cate, {}),
          catelist: smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, []),
        };
      } else {
        mergedLinkData = localLinkData;
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

      // 更新快照为合并后的数据
      this._saveSnapshot(mergedLinkData);
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
        return await this.upload();
      }

      let cloudLinkData = rows[0].data?.link;
      if (cloudLinkData) {
        // 兼容旧格式：解包 {code:0, data:[...]} 包装对象
        cloudLinkData = {
          links: unwrapData(cloudLinkData.links) || [],
          cate: unwrapData(cloudLinkData.cate) || {},
          catelist: unwrapData(cloudLinkData.catelist) || [],
        };
      }
      if (!cloudLinkData) {
        toast.show('云端无链接数据，先上传本地数据');
        return await this.upload();
      }

      const localLinkData = await this.getLocalLinkData();
      const snapshot = this._getSnapshot();

      // 基于快照智能合并
      let mergedLinks, mergedCate, mergedCateList;
      if (snapshot) {
        mergedLinks = smartMergeLinks(localLinkData.links, cloudLinkData.links, snapshot.links);
        mergedCate = smartMergeCate(localLinkData.cate, cloudLinkData.cate, snapshot.cate);
        mergedCateList = smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, snapshot.catelist);
      } else {
        // 无快照（首次同步），只做简单合并
        mergedLinks = smartMergeLinks(localLinkData.links, cloudLinkData.links, []);
        mergedCate = smartMergeCate(localLinkData.cate, cloudLinkData.cate, {});
        mergedCateList = smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, []);
      }

      // 写回本地
      await new Promise((resolve) => {
        link.setAll(mergedLinks, mergedCate, () => {
          const sto = gS('link');
          if (sto) sto.catelist = mergedCateList;
          resolve();
        });
      });

      // 上传合并结果到云端
      const updated_at = new Date().toISOString();
      const mergedLinkData = { links: mergedLinks, cate: mergedCate, catelist: mergedCateList };
      const data = { link: mergedLinkData };
      await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ data, updated_at }),
      });

      // 更新快照
      this._saveSnapshot(mergedLinkData);
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
