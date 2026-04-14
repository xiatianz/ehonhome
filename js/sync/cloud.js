// 云端同步模块 - EdgeOne Pages KV
const { gS } = require('../storage');
const toast = require('../toast');

const API_BASE = ''; // 同域部署，使用相对路径
const SYNC_KEY = 'cloud_sync_config';

class CloudSync {
  constructor() {
    this.config = this.loadConfig();
  }
  
  // 加载同步配置
  loadConfig() {
    const sto = gS('sync');
    return sto.config || {
      enabled: false,
      token: null,
      user: null,
      lastSync: null,
      autoSync: false,
    };
  }
  
  // 保存同步配置
  saveConfig() {
    const sto = gS('sync');
    sto.config = this.config;
  }
  
  // 检查是否已登录
  isLoggedIn() {
    return !!this.config.token;
  }
  
  // 获取用户信息
  getUser() {
    return this.config.user;
  }
  
  // GitHub OAuth 登录
  async loginWithGitHub() {
    try {
      // 第一步：获取 GitHub 授权 URL
      const apiUrl = `${API_BASE}/api/auth/github`;
      console.log('Fetching auth URL from:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('Auth response:', data);
      
      // 如果需要授权，跳转到 GitHub
      if (data.needAuth && data.authUrl) {
        // 在当前窗口打开授权页面
        window.location.href = data.authUrl;
        return { success: false, needAuth: true };
      }
      
      // 监听消息
      return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'oauth-success') {
            window.removeEventListener('message', messageHandler);
            this.config.token = event.data.token;
            this.config.user = event.data.user;
            this.saveConfig();
            resolve({ success: true, user: event.data.user });
          } else if (event.data.type === 'oauth-error') {
            window.removeEventListener('message', messageHandler);
            reject(new Error(event.data.message));
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // 超时处理
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          reject(new Error('登录超时'));
        }, 120000);
      });
    } catch (error) {
      toast.show('登录失败: ' + error.message);
      throw error;
    }
  }
  
  // 退出登录
  logout() {
    this.config.token = null;
    this.config.user = null;
    this.config.lastSync = null;
    this.saveConfig();
    toast.show('已退出登录');
  }
  
  // 上传数据到云端
  async upload() {
    if (!this.isLoggedIn()) {
      toast.show('请先登录');
      return { success: false, error: 'Not logged in' };
    }
    
    try {
      // 获取本地数据
      const localData = this.getAllLocalData();
      
      const response = await fetch(`${API_BASE}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(localData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.config.lastSync = result.lastSync;
        this.saveConfig();
        toast.show('数据已同步到云端');
      } else {
        toast.show('同步失败: ' + (result.error || 'Unknown error'));
      }
      
      return result;
    } catch (error) {
      toast.show('同步失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 从云端下载数据
  async download() {
    if (!this.isLoggedIn()) {
      toast.show('请先登录');
      return { success: false, error: 'Not logged in' };
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/sync`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 合并云端数据到本地
        this.mergeCloudData(result.data);
        this.config.lastSync = result.lastSync;
        this.saveConfig();
        toast.show('数据已从云端同步');
      } else if (!result.data) {
        toast.show('云端暂无数据');
      } else {
        toast.show('下载失败: ' + (result.error || 'Unknown error'));
      }
      
      return result;
    } catch (error) {
      toast.show('下载失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 获取所有本地数据
  getAllLocalData() {
    const data = {};
    const keys = ['setting', 'link', 'says', 'hello', 'background', 'custom', 'oobe'];
    
    keys.forEach(key => {
      try {
        const sto = gS(key);
        if (sto) {
          data[key] = sto.getAll ? sto.getAll() : sto;
        }
      } catch (e) {
        console.error(`Failed to get ${key}:`, e);
      }
    });
    
    return data;
  }
  
  // 合并云端数据到本地
  mergeCloudData(cloudData) {
    // 这里可以实现更复杂的合并逻辑（如基于时间戳的冲突解决）
    // 目前简单覆盖
    Object.keys(cloudData).forEach(key => {
      if (key.startsWith('_')) return; // 跳过内部字段
      
      try {
        const sto = gS(key);
        if (sto && cloudData[key]) {
          // 保存云端数据到本地存储
          Object.assign(sto, cloudData[key]);
        }
      } catch (e) {
        console.error(`Failed to merge ${key}:`, e);
      }
    });
  }
  
  // 自动同步（如果开启）
  async autoSync() {
    if (this.config.autoSync && this.isLoggedIn()) {
      return await this.upload();
    }
  }
  
  // 获取上次同步时间
  getLastSyncTime() {
    return this.config.lastSync;
  }
}

// 创建单例
const cloudSync = new CloudSync();

module.exports = cloudSync;
