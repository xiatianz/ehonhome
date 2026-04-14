// 云端同步 UI 模块
const { SettingGroup, SettingItem, mainSetting } = require('../setting/index');
const { alert, confirm } = require('../dialog/dialog_utils');
const cloudSync = require('./cloud');

// 创建设置分组
const cloudGroup = new SettingGroup({
  title: '云端同步',
  index: 6,
});
mainSetting.addNewGroup(cloudGroup);

// 登录状态显示
const loginStatusItem = new SettingItem({
  type: 'null',
  title: '登录状态',
  index: 1,
  get() {
    if (cloudSync.isLoggedIn()) {
      const user = cloudSync.getUser();
      return user ? `已登录: ${user.login}` : '已登录';
    }
    return '未登录';
  },
});

// GitHub 登录
const loginItem = new SettingItem({
  type: 'null',
  title: 'GitHub 登录',
  message: '使用 GitHub 账号登录以启用云端同步',
  index: 2,
  callback() {
    cloudSync.loginWithGitHub().then(result => {
      if (result.success) {
        loginStatusItem.reGet();
        logoutItem.show();
        loginItem.hide();
        uploadItem.show();
        downloadItem.show();
        alert('登录成功！');
      }
    }).catch(error => {
      alert('登录失败: ' + error.message);
    });
  },
});

// 退出登录
const logoutItem = new SettingItem({
  type: 'null',
  title: '退出登录',
  message: '退出当前账号',
  index: 3,
  callback() {
    confirm('确定要退出登录吗？本地数据不会丢失。', ok => {
      if (ok) {
        cloudSync.logout();
        loginStatusItem.reGet();
        logoutItem.hide();
        loginItem.show();
        uploadItem.hide();
        downloadItem.hide();
      }
    });
  },
});

// 上传数据
const uploadItem = new SettingItem({
  type: 'null',
  title: '上传到云端',
  message: '将本地数据备份到云端',
  index: 4,
  callback() {
    cloudSync.upload();
  },
});

// 下载数据
const downloadItem = new SettingItem({
  type: 'null',
  title: '从云端下载',
  message: '从云端恢复数据到本地',
  index: 5,
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

// 自动同步开关
const autoSyncItem = new SettingItem({
  type: 'boolean',
  title: '自动同步',
  message: '数据变更时自动上传到云端',
  index: 6,
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
  index: 7,
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
cloudGroup.addNewItem(loginStatusItem);
cloudGroup.addNewItem(loginItem);
cloudGroup.addNewItem(logoutItem);
cloudGroup.addNewItem(uploadItem);
cloudGroup.addNewItem(downloadItem);
cloudGroup.addNewItem(autoSyncItem);
cloudGroup.addNewItem(lastSyncItem);

// 根据登录状态显示/隐藏相关项
function updateUI() {
  if (cloudSync.isLoggedIn()) {
    loginItem.hide();
    logoutItem.show();
    uploadItem.show();
    downloadItem.show();
  } else {
    loginItem.show();
    logoutItem.hide();
    uploadItem.hide();
    downloadItem.hide();
  }
}

// 初始化 UI
setTimeout(updateUI, 100);

module.exports = {
  updateUI,
};
