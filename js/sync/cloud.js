// 云端同步模块 - GitHub Gist（无需服务器，直接调用 GitHub API）
const { gS } = require('../storage');
const toast = require('../toast');

const GIST_TOKEN_KEY  = 'cloud_gist_token';   // GitHub Personal Access Token
const GIST_ID_KEY     = 'cloud_gist_id';      // Gist ID（上传后保存，用于后续更新）
const GIST_FILENAME   = 'ehon-sync-data.json'; // Gist 中的文件名
const DEVICE_ID_KEY   = 'cloud_device_id';    // 本机设备标识
const SYNC_CONFIG_KEY = 'cloud_sync_config';   // 同步配置

class CloudSync {
  constructor() {
    this.config = this.loadConfig();
    this.deviceId = this._initDeviceId();
  }

  // ── 设备 ID ──────────────────────────────────────────────
  _initDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'device_' + Math.random().toString(36).slice(2, 15) +
                       Math.random().toString(36).slice(2, 15);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  getCurrentDeviceId() { return this.deviceId; }

  // ── 配置 ─────────────────────────────────────────────────
  loadConfig() {
    const sto = gS('sync');
    return sto.config || { lastSync: null, autoSync: false };
  }

  saveConfig() {
    const sto = gS('sync');
    sto.config = this.config;
  }

  getLastSyncTime() { return this.config.lastSync; }

  // ── GitHub Token ──────────────────────────────────────────
  getToken()       { return localStorage.getItem(GIST_TOKEN_KEY) || ''; }
  setToken(token)  { localStorage.setItem(GIST_TOKEN_KEY, token.trim()); }
  hasToken()       { return !!this.getToken(); }

  // ── Gist ID ───────────────────────────────────────────────
  getGistId()      { return localStorage.getItem(GIST_ID_KEY) || ''; }
  setGistId(id)    { localStorage.setItem(GIST_ID_KEY, id.trim()); }

  // ── 本地数据收集 ──────────────────────────────────────────
  getAllLocalData() {
    const keys = ['setting', 'link', 'says', 'hello', 'background', 'custom', 'oobe'];
    const data = {};
    keys.forEach(key => {
      try {
        const sto = gS(key);
        if (sto) data[key] = sto.getAll ? sto.getAll() : sto;
      } catch (e) {
        console.error(`[CloudSync] Failed to get "${key}":`, e);
      }
    });
    return data;
  }

  // ── 合并云端数据到本地 ─────────────────────────────────────
  mergeCloudData(cloudData) {
    Object.keys(cloudData).forEach(key => {
      if (key.startsWith('_')) return;
      try {
        const sto = gS(key);
        if (sto && cloudData[key]) Object.assign(sto, cloudData[key]);
      } catch (e) {
        console.error(`[CloudSync] Failed to merge "${key}":`, e);
      }
    });
  }

  // ── GitHub API 请求封装 ───────────────────────────────────
  async _githubFetch(url, options = {}) {
    const token = this.getToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return json;
  }

  // ── 上传到 GitHub Gist ────────────────────────────────────
  async upload() {
    if (!this.hasToken()) {
      toast.show('请先在设置中填写 GitHub Token');
      return { success: false, error: 'No token' };
    }

    try {
      const data = this.getAllLocalData();
      data._lastSync  = new Date().toISOString();
      data._deviceId  = this.deviceId;
      const content   = JSON.stringify(data, null, 2);
      const files     = { [GIST_FILENAME]: { content } };

      let result;
      const gistId = this.getGistId();

      if (gistId) {
        // 更新已有 Gist
        result = await this._githubFetch(
          `https://api.github.com/gists/${gistId}`,
          { method: 'PATCH', body: JSON.stringify({ files }) }
        );
      } else {
        // 创建新 Gist
        result = await this._githubFetch(
          'https://api.github.com/gists',
          {
            method: 'POST',
            body: JSON.stringify({
              description: 'Ehon起始页同步数据',
              public: false,
              files,
            }),
          }
        );
        this.setGistId(result.id);
      }

      this.config.lastSync = data._lastSync;
      this.saveConfig();
      toast.show('数据已同步到 GitHub Gist ✓');
      return { success: true, gistId: result.id };

    } catch (error) {
      toast.show('同步失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 从 GitHub Gist 下载 ───────────────────────────────────
  async download() {
    if (!this.hasToken()) {
      toast.show('请先在设置中填写 GitHub Token');
      return { success: false, error: 'No token' };
    }

    const gistId = this.getGistId();
    if (!gistId) {
      toast.show('请先上传数据，或在设置中填写 Gist ID');
      return { success: false, error: 'No gist ID' };
    }

    try {
      const gist    = await this._githubFetch(`https://api.github.com/gists/${gistId}`);
      const file    = gist.files[GIST_FILENAME];
      if (!file) throw new Error('Gist 中没有找到同步数据文件');

      // 如果内容被截断需要单独获取
      const content = file.truncated
        ? await (await fetch(file.raw_url)).text()
        : file.content;

      const cloudData = JSON.parse(content);
      this.mergeCloudData(cloudData);

      this.config.lastSync = cloudData._lastSync || new Date().toISOString();
      this.saveConfig();
      toast.show('数据已从 GitHub Gist 恢复 ✓');
      return { success: true };

    } catch (error) {
      toast.show('下载失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 自动同步 ──────────────────────────────────────────────
  async autoSync() {
    if (this.config.autoSync && this.hasToken()) {
      return await this.upload();
    }
  }

  // ── 兼容旧接口（enable / disable / isEnabled）─────────────
  isEnabled()  { return this.hasToken(); }
  enable()     { toast.show('请在设置中填写 GitHub Token 以启用同步'); }
  disable()    {
    localStorage.removeItem(GIST_TOKEN_KEY);
    localStorage.removeItem(GIST_ID_KEY);
    toast.show('已清除同步配置');
  }
}

const cloudSync = new CloudSync();
module.exports = cloudSync;
