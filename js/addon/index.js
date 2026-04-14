// 插件模块 - 仅保留核心API，移除UI（图标、弹窗、设置）
var core = require('./_core.js');
var coreup = require('./core_up.js');
core = coreup(core);
module.exports = core;
