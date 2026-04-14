// 云端同步 UI - Supabase 方案（用户无需配置）
const { SettingGroup, SettingItem, mainSetting } = require('../setting/index');
const { alert, confirm, prompt } = require('../dialog/dialog_utils');
const cloudSync = require('./cloud');
const { pushMenu, MAIN_MENU_TOP } = require('../menu/mainmenu');
const { icon } = require('../iconc');
const util = require('../util');

// ── 设置分组 ──────────────────────────────────────────────
const cloudGroup = new SettingGroup({ title: '云端同步', index: 6 });
mainSetting.addNewGroup(cloudGroup);

// ── 顶部菜单按钮 ──────────────────────────────────────────
function addCloudSyncToMenu() {
  const syncIcon = new icon({
    class: 'cloud_sync',
    content: util.getGoogleIcon('e2bd'),
    offset: 'tr'
  });
  syncIcon.getIcon().onclick = e => {
    e.stopPropagation();
    cloudSync.upload();
  };
  pushMenu({
    title: '☁️ 同步到云端',
    icon: util.getGoogleIcon('e2bd'),
    callback: () => cloudSync.upload(),
  }, MAIN_MENU_TOP);
}
setTimeout(addCloudSyncToMenu, 200);

// ── 上传 ─────────────────────────────────────────────────
const uploadItem = new SettingItem({
  type: 'null',
  title: '上传到云端',
  message: '将本地数据备份到云端',
  index: 1,
  callback() {
    cloudSync.upload().then(() => lastSyncItem.reGet());
  },
});

// ── 下载 ─────────────────────────────────────────────────
const downloadItem = new SettingItem({
  type: 'null',
  title: '从云端下载',
  message: '从云端恢复数据到本地（会覆盖本地）',
  index: 2,
  callback() {
    confirm('下载云端数据将覆盖本地数据，确定继续吗？', ok => {
      if (ok) {
        cloudSync.download().then(res => {
          if (res.success) alert('数据已同步，请刷新页面以应用更改');
        });
      }
    });
  },
});

// ── 设备 ID（复制给其他设备使用）────────────────────────
const deviceIdItem = new SettingItem({
  type: 'null',
  title: '我的同步码',
  message: '点击复制，在其他设备输入此码即可同步',
  index: 3,
  get() {
    const id = cloudSync.getCurrentDeviceId();
    return id.slice(0, 16) + '...';
  },
  callback() {
    const id = cloudSync.getCurrentDeviceId();
    navigator.clipboard.writeText(id).then(() => {
      alert('同步码已复制！\n\n在其他设备：设置 → 云端同步 → 导入同步码，粘贴即可');
    }).catch(() => {
      prompt('请手动复制此同步码：', id);
    });
  },
});

// ── 导入其他设备的同步码 ──────────────────────────────────
const importDeviceItem = new SettingItem({
  type: 'null',
  title: '导入同步码',
  message: '输入其他设备的同步码，下载其云端数据',
  index: 4,
  callback() {
    prompt('请输入其他设备的同步码：', '', id => {
      if (!id || !id.trim()) return;
      confirm('确定要导入该设备的数据吗？这将覆盖本地数据。', ok => {
        if (ok) {
          cloudSync.setDeviceId(id.trim());
          cloudSync.download().then(res => {
            if (res.success) alert('数据已导入，请刷新页面以应用更改');
          });
        }
      });
    });
  },
});

// ── 自动同步 ─────────────────────────────────────────────
const autoSyncItem = new SettingItem({
  type: 'boolean',
  title: '自动同步',
  message: '数据变更时自动上传到云端',
  index: 5,
  get()       { return cloudSync.config.autoSync; },
  callback(v) { cloudSync.config.autoSync = v; cloudSync.saveConfig(); },
});

// ── 上次同步时间 ──────────────────────────────────────────
const lastSyncItem = new SettingItem({
  type: 'null',
  title: '上次同步',
  index: 6,
  get() {
    const t = cloudSync.getLastSyncTime();
    return t ? new Date(t).toLocaleString('zh-CN') : '从未同步';
  },
});

// ── 加入分组 ──────────────────────────────────────────────
cloudGroup.addNewItem(uploadItem);
cloudGroup.addNewItem(downloadItem);
cloudGroup.addNewItem(deviceIdItem);
cloudGroup.addNewItem(importDeviceItem);
cloudGroup.addNewItem(autoSyncItem);
cloudGroup.addNewItem(lastSyncItem);

module.exports = {};
