// 云端同步模块 - EdgeOne Pages KV（无需登录）
const { gS } = require('../storage');
const toast = require('../toast');

const API_BASE = ''; // 同域部署，使用相对路径
const SYNC_KEY = 'cloud_sync_config';
const DEVICE_ID_KEY = 'cloud_device_id';

class CloudSync {
  constructor() {
    this.config = this.loadConfig();
    this.deviceId = this.getDeviceId();
  }
  
  // 生成或获取设备 ID
  getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // 生成随机设备 ID
      deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }
  
  // 加载同步配置
  loadConfig() {
    const sto = gS('sync');
    return sto.config || {
      enabled: false,
      lastSync: null,
      autoSync: false,
    };
  }
  
  // 保存同步配置
  saveConfig() {
    const sto = gS('sync');
    sto.config = this.config;
  }
  
  // 检查是否已启用同步
  isEnabled() {
    return this.config.enabled;
  }
  
  // 启用同步
  enable() {
    this.config.enabled = true;
    this.saveConfig();
    toast.show('云端同步已启用');
  }
  
  // 禁用同步
  disable() {
    this.config.enabled = false;
    this.saveConfig();
    toast.show('云端同步已禁用');
  }
  
  // 上传数据到云端
  async upload() {
    if (!this.isEnabled()) {
      toast.show('请先启用云端同步');
      return { success: false, error: 'Sync not enabled' };
    }
    
    try {
      // 获取本地数据
      const localData = this.getAllLocalData();
      
      const response = await fetch(`${API_BASE}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceId,
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
    if (!this.isEnabled()) {
      toast.show('请先启用云端同步');
      return { success: false, error: 'Sync not enabled' };
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/sync`, {
        method: 'GET',
        headers: {
          'X-Device-ID': this.deviceId,
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
    if (this.config.autoSync && this.isEnabled()) {
      return await this.upload();
    }
  }
  
  // 获取上次同步时间
  getLastSyncTime() {
    return this.config.lastSync;
  }
  
  // 获取设备 ID（用于在其他设备上同步）
  getCurrentDeviceId() {
    return this.deviceId;
  }
  
  // 设置设备 ID（从其他设备同步数据）
  setDeviceId(deviceId) {
    this.deviceId = deviceId;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    this.saveConfig();
  }
}

// 创建单例
const cloudSync = new CloudSync();

module.exports = cloudSync;
