const { confirm, alert } = require("../dialog/dialog_utils");
const util = require("../util");
const dialog = require("../dialog/index");
var lichtml = require('./text/license.html');

function getLicense() {
  return lichtml;
}

module.exports = {
  lic: lichtml
};
