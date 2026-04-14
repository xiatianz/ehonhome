// 云端同步模块 - Supabase（用户无需配置，开箱即用）
const { gS } = require('../storage');
const toast  = require('../toast');

const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SuO0A9cl2DH6Ru-_OPFFYA_SvOAdl-F';
const TABLE        = 'sync_data';
const DEVICE_ID_KEY = 'cloud_device_id';

// ── Supabase REST 请求封装 ─────────────────────────────────
const sbHeaders = {
  'apikey':        SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json',
};

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { ...sbHeaders, ...(options.headers || {}) },
  });
  if (res.status === 204) return null;          // DELETE / no content
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
  return json;
}

class CloudSync {
  constructor() {
    this.config   = this._loadConfig();
    this.deviceId = this._initDeviceId();
  }

  // ── 设备 ID（唯一标识，自动生成，长期保存）────────────────
  _initDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2, 15) +
                    Math.random().toString(36).slice(2, 15);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  getCurrentDeviceId() { return this.deviceId; }

  setDeviceId(id) {
    this.deviceId = id.trim();
    localStorage.setItem(DEVICE_ID_KEY, this.deviceId);
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

  // 兼容旧接口
  isEnabled()  { return true; }
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
    try {
      toast.show('正在同步...');
      const data       = this.getAllLocalData();
      const updated_at = new Date().toISOString();

      await sbFetch(TABLE, {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          device_id:  this.deviceId,
          data,
          updated_at,
        }),
      });

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
    try {
      toast.show('正在下载...');
      const rows = await sbFetch(
        `${TABLE}?device_id=eq.${encodeURIComponent(this.deviceId)}&select=data,updated_at`
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
    if (this.config.autoSync) return await this.upload();
  }
}

const cloudSync = new CloudSync();
module.exports = cloudSync;
