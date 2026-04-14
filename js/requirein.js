var getEventHandle = require('./event.js');
var util = require('./util.js');
var toast = require('./toast.js');
var iconc = require('./iconc/index.js');
var { storage } = require('./storage.js');
var dialog = require('./dialog/index.js');
let { alert, confirm, prompt } = require('./dialog/dialog_utils.js');
var menu = require('./menu/index.js');
var mainmenu = require('./menu/mainmenu.js');
var setting = require('./setting/index.js');
var Setting = setting.Setting;
var SettingGroup = setting.SettingGroup;
var SettingItem = setting.SettingItem;
var mainSetting = setting.mainSetting;
var tyGroup = setting.tyGroup;
var omnibox = require('./omnibox/index.js');
var link = require('./link/index.js');
var says = require('./says/index.js');
var card = require('./card/index.js');
var guidecreator = require('./guidecreator.js');
var fcard = require('./fcard/index.js');
var custom = require('./custom/index.js');
var background = require('./background/index.js');
var searchEditor = require('./search/editor.js');
var notice = require('./notice/index.js');
// require('./notice/tuisong'); // 禁用通知推送
require('./safe.js');
var addon = { getAddonList: function(){return [];} };
var sync = require('./sync/index.js');
require('./hotkey.js'); 
require('./ignores/index.js');
require('./update.js');
require('./oobe/index.js');
require('./rainbowegg/index.js');
require('./hello/index.js');

window.quik = {
  searchEditor,
  guidecreator,
  fcard,
  custom,
  sync,
  addon,
  storage,
  omnibox,
  util,
  link,
  dialog,
  toast,
  says,
  menu,
  iconc,
  background,
  mainmenu,
  Setting,
  SettingGroup,
  SettingItem,
  mainSetting,
  notice,
  tyGroup,
  alert,
  confirm,
  prompt,
  card,
  getEventHandle
}
window.util = util;