// 云端同步 UI 模块 - GitHub Gist 方案
const { SettingGroup, SettingItem, mainSetting } = require('../setting/index');
const { alert, confirm, prompt } = require('../dialog/dialog_utils');
const cloudSync = require('./cloud');
const { pushMenu, MAIN_MENU_TOP } = require('../menu/mainmenu');
const { icon } = require('../iconc');
const util = require('../util');

// ── 设置分组 ─────────────────────────────────────────────────
const cloudGroup = new SettingGroup({ title: '云端同步 (GitHub Gist)', index: 6 });
mainSetting.addNewGroup(cloudGroup);

// ── 菜单按钮 ─────────────────────────────────────────────────
function addCloudSyncToMenu() {
  const syncIcon = new icon({
    class: 'cloud_sync',
    content: util.getGoogleIcon('e2bd'),
    offset: 'tr'
  });

  syncIcon.getIcon().onclick = e => {
    e.stopPropagation();
    if (cloudSync.hasToken()) {
      cloudSync.upload();
    } else {
      alert('请先在 设置 → 云端同步 中填写 GitHub Token');
    }
  };

  pushMenu({
    title: '☁️ 同步到 Gist',
    icon: util.getGoogleIcon('e2bd'),
    callback: () => {
      if (cloudSync.hasToken()) {
        cloudSync.upload();
      } else {
        alert('请先在 设置 → 云端同步 中填写 GitHub Token');
      }
    }
  }, MAIN_MENU_TOP);
}
setTimeout(addCloudSyncToMenu, 200);

// ── Token 设置 ───────────────────────────────────────────────
const tokenItem = new SettingItem({
  type: 'null',
  title: 'GitHub Token',
  message: '设置 Personal Access Token（需要 gist 权限）',
  index: 1,
  get() {
    const t = cloudSync.getToken();
    if (!t) return '未设置';
    return t.slice(0, 8) + '••••••••' + t.slice(-4);
  },
  callback() {
    const current = cloudSync.getToken();
    prompt(
      '请输入 GitHub Personal Access Token\n（在 GitHub → Settings → Developer settings → Personal access tokens 中创建，需勾选 gist 权限）',
      current,
      token => {
        if (token === null) return;
        if (!token.trim()) {
          confirm('确定要清除 Token 吗？', ok => {
            if (ok) {
              cloudSync.disable();
              tokenItem.reGet();
              gistIdItem.reGet();
              updateUI();
            }
          });
          return;
        }
        cloudSync.setToken(token);
        tokenItem.reGet();
        updateUI();
        alert('Token 已保存！现在可以点击"上传到云端"进行同步。');
      }
    );
  },
});

// ── 上传 ─────────────────────────────────────────────────────
const uploadItem = new SettingItem({
  type: 'null',
  title: '上传到云端',
  message: '将本地数据备份到 GitHub Gist',
  index: 2,
  callback() {
    cloudSync.upload().then(() => {
      gistIdItem.reGet();
      lastSyncItem.reGet();
    });
  },
});

// ── 下载 ─────────────────────────────────────────────────────
const downloadItem = new SettingItem({
  type: 'null',
  title: '从云端下载',
  message: '从 GitHub Gist 恢复数据到本地',
  index: 3,
  callback() {
    confirm('下载云端数据将覆盖本地数据，确定继续吗？', ok => {
      if (ok) {
        cloudSync.download().then(res => {
          if (res.success) {
            lastSyncItem.reGet();
            alert('数据已同步，请刷新页面以应用更改');
          }
        });
      }
    });
  },
});

// ── Gist ID（上传后自动填充，也可手动输入以同步其他设备数据）──
const gistIdItem = new SettingItem({
  type: 'null',
  title: 'Gist ID',
  message: '上传后自动保存；也可输入他人 Gist ID 下载其数据',
  index: 4,
  get() {
    const id = cloudSync.getGistId();
    return id ? id.slice(0, 12) + '...' : '尚未同步';
  },
  callback() {
    const current = cloudSync.getGistId();
    prompt(
      '当前 Gist ID（可修改为其他设备的 Gist ID 以同步其数据）：',
      current,
      id => {
        if (id === null) return;
        if (id.trim()) {
          cloudSync.setGistId(id.trim());
          gistIdItem.reGet();
          alert('Gist ID 已更新，点击"从云端下载"即可同步数据');
        }
      }
    );
  },
});

// ── 复制 Gist ID（分享给其他设备使用）───────────────────────
const copyGistIdItem = new SettingItem({
  type: 'null',
  title: '复制 Gist ID',
  message: '将此 ID 填入其他设备即可同步',
  index: 5,
  callback() {
    const id = cloudSync.getGistId();
    if (!id) {
      alert('请先上传一次数据以获取 Gist ID');
      return;
    }
    navigator.clipboard.writeText(id).then(() => {
      alert('Gist ID 已复制：' + id);
    }).catch(() => {
      prompt('请手动复制此 Gist ID：', id);
    });
  },
});

// ── 自动同步 ─────────────────────────────────────────────────
const autoSyncItem = new SettingItem({
  type: 'boolean',
  title: '自动同步',
  message: '数据变更时自动上传到云端',
  index: 6,
  get()    { return cloudSync.config.autoSync; },
  callback(v) {
    cloudSync.config.autoSync = v;
    cloudSync.saveConfig();
  },
});

// ── 上次同步时间 ──────────────────────────────────────────────
const lastSyncItem = new SettingItem({
  type: 'null',
  title: '上次同步',
  index: 7,
  get() {
    const t = cloudSync.getLastSyncTime();
    return t ? new Date(t).toLocaleString('zh-CN') : '从未同步';
  },
});

// ── 添加到分组 ────────────────────────────────────────────────
cloudGroup.addNewItem(tokenItem);
cloudGroup.addNewItem(uploadItem);
cloudGroup.addNewItem(downloadItem);
cloudGroup.addNewItem(gistIdItem);
cloudGroup.addNewItem(copyGistIdItem);
cloudGroup.addNewItem(autoSyncItem);
cloudGroup.addNewItem(lastSyncItem);

// ── 根据 Token 状态显示/隐藏操作项 ───────────────────────────
function updateUI() {
  const hasToken = cloudSync.hasToken();
  if (hasToken) {
    uploadItem.show();
    downloadItem.show();
    gistIdItem.show();
    copyGistIdItem.show();
    autoSyncItem.show();
    lastSyncItem.show();
  } else {
    uploadItem.hide();
    downloadItem.hide();
    gistIdItem.hide();
    copyGistIdItem.hide();
    autoSyncItem.hide();
    lastSyncItem.hide();
  }
}

setTimeout(updateUI, 100);

module.exports = { updateUI };
