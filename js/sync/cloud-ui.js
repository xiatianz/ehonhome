// 云端同步 UI 模块（无需登录）
const { SettingGroup, SettingItem, mainSetting } = require('../setting/index');
const { alert, confirm, prompt } = require('../dialog/dialog_utils');
const cloudSync = require('./cloud');
const { pushMenu, MAIN_MENU_TOP } = require('../menu/mainmenu');
const { icon } = require('../iconc');
const util = require('../util');

// 创建设置分组
const cloudGroup = new SettingGroup({
  title: '云端同步',
  index: 6,
});
mainSetting.addNewGroup(cloudGroup);

// 在右上角菜单添加云端同步按钮
function addCloudSyncToMenu() {
  // 同步按钮图标
  const syncIcon = new icon({
    class: 'cloud_sync',
    content: util.getGoogleIcon('e2bd'), // cloud_sync 图标
    offset: 'tr'
  });
  
  // 点击直接同步
  syncIcon.getIcon().onclick = e => {
    e.stopPropagation();
    if (cloudSync.isEnabled()) {
      // 已启用，直接上传
      cloudSync.upload();
    } else {
      // 未启用，提示启用
      alert('请先启用云端同步功能');
    }
  };
  
  // 添加到右上角菜单
  pushMenu({
    title: cloudSync.isEnabled() ? '☁️ 同步到云端' : '☁️ 启用云端同步',
    icon: util.getGoogleIcon('e2bd'),
    callback: () => {
      if (cloudSync.isEnabled()) {
        cloudSync.upload();
      } else {
        confirm('是否启用云端同步功能？', ok => {
          if (ok) {
            cloudSync.enable();
            updateMenuUI();
            alert('云端同步已启用！');
          }
        });
      }
    }
  }, MAIN_MENU_TOP);
}

// 更新菜单状态
function updateMenuUI() {
  // 重新加载页面以更新菜单
  location.reload();
}

// 初始化菜单
setTimeout(addCloudSyncToMenu, 200);

// 同步状态显示
const syncStatusItem = new SettingItem({
  type: 'null',
  title: '同步状态',
  index: 1,
  get() {
    if (cloudSync.isEnabled()) {
      return '已启用';
    }
    return '未启用';
  },
});

// 启用/禁用同步
const toggleSyncItem = new SettingItem({
  type: 'null',
  title: '启用云端同步',
  message: '开启后可将数据备份到云端',
  index: 2,
  callback() {
    if (cloudSync.isEnabled()) {
      confirm('确定要禁用云端同步吗？本地数据不会丢失。', ok => {
        if (ok) {
          cloudSync.disable();
          syncStatusItem.reGet();
          updateUI();
          alert('云端同步已禁用');
        }
      });
    } else {
      cloudSync.enable();
      syncStatusItem.reGet();
      updateUI();
      alert('云端同步已启用！');
    }
  },
});

// 上传数据
const uploadItem = new SettingItem({
  type: 'null',
  title: '上传到云端',
  message: '将本地数据备份到云端',
  index: 3,
  callback() {
    cloudSync.upload();
  },
});

// 下载数据
const downloadItem = new SettingItem({
  type: 'null',
  title: '从云端下载',
  message: '从云端恢复数据到本地',
  index: 4,
  callback() {
    confirm('下载云端数据将覆盖本地数据，确定继续吗？', ok => {
      if (ok) {
        cloudSync.download().then(() => {
          alert('数据已同步，请刷新页面以应用更改');
        });
      }
    });
  },
});

// 设备 ID 管理
const deviceIdItem = new SettingItem({
  type: 'null',
  title: '设备 ID',
  message: '用于多设备同步，点击复制',
  index: 5,
  get() {
    const id = cloudSync.getCurrentDeviceId();
    return id.substring(0, 20) + '...';
  },
  callback() {
    const deviceId = cloudSync.getCurrentDeviceId();
    // 复制到剪贴板
    navigator.clipboard.writeText(deviceId).then(() => {
      alert('设备 ID 已复制到剪贴板');
    }).catch(() => {
      prompt('设备 ID（请手动复制）：', deviceId);
    });
  },
});

// 导入设备 ID（从其他设备同步）
const importDeviceItem = new SettingItem({
  type: 'null',
  title: '导入设备数据',
  message: '输入其他设备的 ID 以同步其数据',
  index: 6,
  callback() {
    prompt('请输入其他设备的 ID：', '', deviceId => {
      if (deviceId && deviceId.trim()) {
        confirm('确定要导入该设备的数据吗？这将覆盖本地数据。', ok => {
          if (ok) {
            cloudSync.setDeviceId(deviceId.trim());
            cloudSync.download().then(() => {
              alert('数据已导入，请刷新页面以应用更改');
            });
          }
        });
      }
    });
  },
});

// 自动同步开关
const autoSyncItem = new SettingItem({
  type: 'boolean',
  title: '自动同步',
  message: '数据变更时自动上传到云端',
  index: 7,
  get() {
    return cloudSync.config.autoSync;
  },
  callback(v) {
    cloudSync.config.autoSync = v;
    cloudSync.saveConfig();
  },
});

// 上次同步时间
const lastSyncItem = new SettingItem({
  type: 'null',
  title: '上次同步',
  index: 8,
  get() {
    const lastSync = cloudSync.getLastSyncTime();
    if (lastSync) {
      const date = new Date(lastSync);
      return date.toLocaleString('zh-CN');
    }
    return '从未同步';
  },
});

// 添加所有设置项到分组
cloudGroup.addNewItem(syncStatusItem);
cloudGroup.addNewItem(toggleSyncItem);
cloudGroup.addNewItem(uploadItem);
cloudGroup.addNewItem(downloadItem);
cloudGroup.addNewItem(deviceIdItem);
cloudGroup.addNewItem(importDeviceItem);
cloudGroup.addNewItem(autoSyncItem);
cloudGroup.addNewItem(lastSyncItem);

// 根据同步状态显示/隐藏相关项
function updateUI() {
  if (cloudSync.isEnabled()) {
    toggleSyncItem.title = '禁用云端同步';
    toggleSyncItem.message = '点击禁用云端同步功能';
    uploadItem.show();
    downloadItem.show();
    deviceIdItem.show();
    importDeviceItem.show();
    autoSyncItem.show();
    lastSyncItem.show();
  } else {
    toggleSyncItem.title = '启用云端同步';
    toggleSyncItem.message = '开启后可将数据备份到云端';
    uploadItem.hide();
    downloadItem.hide();
    deviceIdItem.hide();
    importDeviceItem.hide();
    autoSyncItem.hide();
    lastSyncItem.hide();
  }
}

// 初始化 UI
setTimeout(updateUI, 100);

module.exports = {
  updateUI,
};
