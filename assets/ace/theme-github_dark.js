ace.define(
  'ace/theme/github_dark-css',
  ['require', 'exports', 'module'],
  function (require, exports, module) {
    module.exports =
""  }
);

ace.define(
  'ace/theme/github_dark',
  ['require', 'exports', 'module', 'ace/theme/github_dark-css', 'ace/lib/dom'],
  function (require, exports, module) {
    exports.isDark = true;
    exports.cssClass = 'ace-github-dark';
    exports.cssText = require('./github_dark-css');
    var dom = require('../lib/dom');
    dom.importCssString(exports.cssText, exports.cssClass, false);
  }
);
(function () {
  ace.require(['ace/theme/github_dark'], function (m) {
    if (typeof module == 'object' && typeof exports == 'object' && module) {
      module.exports = m;
    }
  });
})();
