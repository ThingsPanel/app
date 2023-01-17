(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/alert-control/add-control"],{

/***/ 142:
/*!*************************************************************************************!*\
  !*** E:/project/Y-渔业可视化/app/main.js?{"page":"pages%2Falert-control%2Fadd-control"} ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(createPage) {__webpack_require__(/*! uni-pages */ 5);


var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 4));
var _addControl = _interopRequireDefault(__webpack_require__(/*! ./pages/alert-control/add-control.vue */ 143));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;createPage(_addControl.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 1)["createPage"]))

/***/ }),

/***/ 143:
/*!******************************************************************!*\
  !*** E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./add-control.vue?vue&type=template&id=1c0bc136&scoped=true& */ 144);
/* harmony import */ var _add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./add-control.vue?vue&type=script&lang=js& */ 146);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./add-control.vue?vue&type=style&index=0&id=1c0bc136&scoped=true&lang=css& */ 148);
/* harmony import */ var _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 11);

var renderjs





/* normalize component */

var component = Object(_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "1c0bc136",
  null,
  false,
  _add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/alert-control/add-control.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 144:
/*!*************************************************************************************************************!*\
  !*** E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue?vue&type=template&id=1c0bc136&scoped=true& ***!
  \*************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_16_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--16-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./add-control.vue?vue&type=template&id=1c0bc136&scoped=true& */ 145);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_16_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_16_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_16_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_16_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_template_id_1c0bc136_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 145:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--16-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue?vue&type=template&id=1c0bc136&scoped=true& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    uniDatetimePicker: function() {
      return Promise.all(/*! import() | uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker */[__webpack_require__.e("common/vendor"), __webpack_require__.e("uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker")]).then(__webpack_require__.bind(null, /*! @/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue */ 222))
    },
    uniPopup: function() {
      return __webpack_require__.e(/*! import() | uni_modules/uni-popup/components/uni-popup/uni-popup */ "uni_modules/uni-popup/components/uni-popup/uni-popup").then(__webpack_require__.bind(null, /*! @/uni_modules/uni-popup/components/uni-popup/uni-popup.vue */ 186))
    }
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  if (!_vm._isMounted) {
    _vm.e0 = function($event) {
      _vm.switchOnTwo = 0
      _vm.switchCloseTwo = 1
    }

    _vm.e1 = function($event) {
      _vm.switchOnTwo = 1
      _vm.switchCloseTwo = 0
    }

    _vm.e2 = function($event) {
      _vm.switchCloseTwo = 1
      _vm.switchOnTwo = 0
    }

    _vm.e3 = function($event) {
      _vm.switchCloseTwo = 0
      _vm.switchOnTwo = 1
    }

    _vm.e4 = function($event) {
      return _vm.$refs.addtrigPopup.close()
    }

    _vm.e5 = function($event) {
      return _vm.$refs.addtrigPopup.close()
    }

    _vm.e6 = function($event) {
      return _vm.$refs.addConPopup.close()
    }

    _vm.e7 = function($event) {
      return _vm.$refs.addConPopup.close()
    }
  }
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 146:
/*!*******************************************************************************************!*\
  !*** E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./add-control.vue?vue&type=script&lang=js& */ 147);
/* harmony import */ var _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 147:
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var _default =
{
  data: function data() {
    return {
      addType: '',
      addTrigForm: {
        eqpGroup: '',
        eqpGroupName: '',
        eqp: '',
        eqpName: '',
        condition: '',
        conditionName: '',
        filedType: '',
        symbol: '',
        symbolName: '',
        trigNum: '',
        relationship: '',
        relationshipName: '',
        cishu: 0,
        cishuName: '单次',
        dateTime: '' },

      addConForm: {
        eqpGroup: '',
        eqpGroupName: '',
        eqp: '',
        eqpName: '',
        condition: '',
        conditionName: '',
        filedType: '',
        conNum: '',
        relationship: '',
        relationshipName: '' },

      trigList: [{
        conditionType: 1,
        conditionTypeName: '设备条件类型',
        eqpGroup: '',
        eqpGroupName: '',
        eqp: '',
        eqpName: '',
        condition: '',
        conditionName: '',
        filedType: '',
        symbol: '',
        symbolName: '',
        trigNum: '',
        relationship: '',
        relationshipName: '',
        cishu: 0,
        cishuName: '单次',
        dateTime: '' }],
      // 触发条件
      controlList: [{
        eqpGroup: '',
        eqpGroupName: '',
        eqp: '',
        eqpName: '',
        condition: '',
        conditionName: '',
        filedType: '',
        conNum: '' }],

      relationshipList: [{
        name: '且',
        id: '&&' },

      {
        name: '或',
        id: '||' }],

      // 关系
      conditionList: [], // 条件
      eqpGroupsList: [], // 设备分组
      conditionTypeList: [{
        label: '设备条件类型',
        value: 1 },

      {
        label: '时间条件类型',
        value: 2 }],

      // 条件类型
      symbolList: [{
        name: '大于',
        id: '>' },

      {
        name: '小于',
        id: '<' },

      {
        name: '等于',
        id: '=' },

      {
        name: '大于等于',
        id: '≥' },

      {
        name: '小于等于',
        id: '≤' }],

      // 符号
      switchOnTwo: 0,
      switchCloseTwo: 1,
      loading: false,
      disabled: false,
      eqpList: [], //设备列表
      currentEqp: {}, //选择的设备
      toast: {
        msg: '' },

      formData: {
        describe: '',
        name: '',
        sort: 100 },

      currentTrigData: {}, // 当前触发条件
      currentConData: {}, //当前执行命令
      cishuList: [{
        name: '单次',
        id: 0 },

      {
        name: '每天',
        id: 1 }] };



  },
  onShow: function onShow() {

  },
  onLoad: function onLoad() {
    // this.getZcList()
  },
  methods: {
    changeLog: function changeLog(e) {
      console.log('change事件:', e);
    },
    bindTimeChangeAdd: function bindTimeChangeAdd(e) {
      console.log('change事件:', e);
      this.addTrigForm.dateTime = e.target.value;
    },
    bindTimeChange: function bindTimeChange(data, e) {
      if (this.addType) {
        this.addTrigForm.dateTime = e.target.value;
      } else if (this.type) {
        data.dateTime = e.target.value;
      }
    },
    validate: function validate() {
      var control = this.controlList.filter(function (item, index) {
        return !item.eqpGroup || !item.eqp || !item.condition || !item.conNum;
      });
      if (this.formData.name == '') {
        this.toast.msg = '请输入策略名称';
        this.$refs.toast.show();
        return false;
      }
      if (this.formData.describe == '') {
        this.toast.msg = '请输入描述';
        this.$refs.toast.show();
        return false;
      }
      if (this.trigList[0].conditionType == 1) {
        var trig = this.trigList.filter(function (item, index) {
          if (index == 0) {
            return !item.conditionType || !item.eqpGroup || !item.eqp || !item.condition || !item.
            symbol || !item.trigNum;
          } else {
            return !item.eqpGroup || !item.eqp || !item.condition || !item.
            symbol || !item.trigNum || !item.relationship;
          }
        });
        if (trig.length > 0) {
          this.toast.msg = '存在数据项不符合触发条件，请检查触发条件数据项';
          this.$refs.toast.show();
          return false;
        }
      } else {
        var _trig = this.trigList.filter(function (item, index) {
          return !item.cishuName || !item.dateTime;
        });
        if (_trig.length > 0) {
          this.toast.msg = '存在数据项不符合触发条件，请检查触发条件数据项';
          this.$refs.toast.show();
          return false;
        }
      }
      if (control.length > 0) {
        this.toast.msg = '存在数据项不符合执行命令，请检查执行命令数据项';
        this.$refs.toast.show();
        return false;
      }
      return true;
    },
    //保存策略
    doUpdateSubmit: function doUpdateSubmit() {var _this = this;
      if (this.validate()) {
        var switchOnOne, switchOnTwo;
        if (this.switchOnOne == 0) {
          switchOnOne = 1;
        } else {
          switchOnOne = 0;
        }
        if (this.switchOnTwo == 0) {
          switchOnTwo = 1;
        } else {
          switchOnTwo = 0;
        }
        uni.showLoading({
          title: '加载中' });

        var trigList = [];
        if (this.trigList[0].conditionType == 1) {
          this.trigList.forEach(function (item) {
            var obj = {
              asset_id: item.eqpGroup,
              device_id: item.eqp,
              field: item.condition,
              field_type: item.filedType,
              duration: '0',
              condition: item.symbol,
              value: item.trigNum,
              operator: item.relationship ? item.relationship : '' };

            trigList.push(obj);
          });
        } else {
          this.trigList.forEach(function (item) {
            var obj = {
              interval: item.cishu,
              time: item.dateTime,
              operator: item.relationship ? item.relationship : '' };

            trigList.push(obj);
          });
        }
        var controlList = [];
        this.controlList.forEach(function (item) {
          var obj = {
            asset_id: item.eqpGroup,
            device_id: item.eqp,
            field: item.condition,
            field_type: item.filedType,
            value: item.conNum,
            field_symbol: item.field_symbol };

          controlList.push(obj);
        });
        var params = {
          business_id: uni.getStorageSync('ywId'), // 业务id
          status: switchOnTwo,
          name: this.formData.name,
          sort: this.formData.sort,
          type: this.trigList[0].conditionType,
          describe: this.formData.describe,
          issued: '0',
          config: {
            rules: trigList,
            apply: controlList } };


        params.config = JSON.stringify(params.config);
        this.API.apiRequest('/api/automation/add', params, 'post').then(function (res) {
          if (res.code == 200) {
            _this.toast.msg = res.message;
            _this.$refs.toast.show();
            uni.navigateBack(-1);
          } else {
            _this.toast.msg = res.message;
            _this.$refs.toast.show();
          }
          uni.hideLoading();
        }).finally(function () {
          uni.hideLoading();
        });
      }
    },
    // 删除触发条件
    toDeltrig: function toDeltrig(data, index) {var _this2 = this;
      this.trigList.forEach(function (item, itemIndex) {
        if (itemIndex == index) {
          _this2.trigList.splice(index, 1);
        }
      });
    },
    // 删除指令
    toDelCon: function toDelCon(data, index) {var _this3 = this;
      this.controlList.forEach(function (item, itemIndex) {
        if (itemIndex == index) {
          _this3.controlList.splice(index, 1);
        }
      });
    },
    // 确定次数选择
    confirmrCishu: function confirmrCishu(item) {
      if (this.addType == 'trig') {
        this.addTrigForm.cishu = item.id;
        this.addTrigForm.cishuName = item.name;
        this.$refs.addtrigPopup.open();
      } else if (this.type == 'trig') {
        this.currentTrigData.cishu = item.id;
        this.currentTrigData.cishuName = item.name;
      }
      this.$refs.cishuPopup.close();
    },
    // 新增一行选择次数
    toSelectCishuAdd: function toSelectCishuAdd() {
      this.addType = 'trig';
      this.type = '';
      this.$refs.addtrigPopup.close();
      this.$refs.cishuPopup.open();
    },
    // 选择次数
    toSelectCishu: function toSelectCishu(data) {
      this.type = 'trig';
      this.addType = '';
      this.currentTrigData = data;
      this.$refs.cishuPopup.open();
    },
    // 确定选择关系
    confirmrRelationship: function confirmrRelationship(item) {
      if (this.addType == 'trig') {
        this.addTrigForm.relationship = item.id;
        this.addTrigForm.relationshipName = item.name;
        this.$refs.addtrigPopup.open();
      } else if (this.addType == 'con') {
        this.addConForm.relationship = item.id;
        this.addConForm.relationshipName = item.name;
        this.$refs.addConPopup.open();
      }
      this.$refs.relationshipPopup.close();
    },
    // 选择关系
    relationship: function relationship(type) {
      this.addType = type;
      this.type = '';
      if (type == 'con') {
        this.$refs.addConPopup.close();
      } else if (type == 'trig') {
        this.$refs.addtrigPopup.close();
      }
      this.$refs.relationshipPopup.open();
    },
    // 保存执行命令验证
    saveConValidate: function saveConValidate() {
      // if (!this.addConForm.relationship) {
      // 	this.toast.msg = '请选择条件为且还是或';
      // 	this.$refs.toast.show();
      // 	return false
      // }
      if (!this.addConForm.eqpGroup) {
        this.toast.msg = '请选择设备分组';
        this.$refs.toast.show();
        return false;
      }
      if (!this.addConForm.eqp) {
        this.toast.msg = '请选择设备';
        this.$refs.toast.show();
        return false;
      }
      if (!this.addConForm.condition) {
        this.toast.msg = '请选择条件';
        this.$refs.toast.show();
        return false;
      }
      if (!this.addConForm.conNum) {
        this.toast.msg = '请输入数值';
        this.$refs.toast.show();
        return false;
      }
      return true;
    },
    // 保存触发条件验证
    saveTrigValidate: function saveTrigValidate() {
      if (this.trigList[0].conditionType == 1) {
        if (!this.addTrigForm.relationship) {
          this.toast.msg = '请选择条件为且还是或';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.eqpGroup) {
          this.toast.msg = '请选择设备分组';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.eqp) {
          this.toast.msg = '请选择设备';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.condition) {
          this.toast.msg = '请选择条件';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.symbol) {
          this.toast.msg = '请选择符号';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.trigNum) {
          this.toast.msg = '请输入数值';
          this.$refs.toast.show();
          return false;
        }
      } else {
        if (!this.addTrigForm.relationship) {
          this.toast.msg = '请选择条件为且还是或';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.cishuName) {
          this.toast.msg = '请选择次数';
          this.$refs.toast.show();
          return false;
        }
        if (!this.addTrigForm.dateTime) {
          this.toast.msg = '请选择日期或时间';
          this.$refs.toast.show();
          return false;
        }
      }
      return true;
    },
    // 保存触发条件
    saveTrig: function saveTrig() {
      if (this.saveTrigValidate()) {
        if (this.trigList[0].conditionType == 1) {
          this.trigList.push({
            eqpGroup: this.addTrigForm.eqpGroup,
            eqpGroupName: this.addTrigForm.eqpGroupName,
            eqp: this.addTrigForm.eqp,
            eqpName: this.addTrigForm.eqpName,
            condition: this.addTrigForm.condition,
            conditionName: this.addTrigForm.conditionName,
            filedType: this.addTrigForm.filedType,
            symbol: this.addTrigForm.symbol,
            symbolName: this.addTrigForm.symbolName,
            trigNum: this.addTrigForm.trigNum,
            relationship: this.addTrigForm.relationship,
            relationshipName: this.addTrigForm.relationshipName });

        } else {
          this.trigList.push({
            cishu: this.addTrigForm.cishu,
            cishuName: this.addTrigForm.cishuName,
            dateTime: this.addTrigForm.dateTime,
            relationship: this.addTrigForm.relationship,
            relationshipName: this.addTrigForm.relationshipName });

        }
        this.$refs.addtrigPopup.close();
      }
      this.$forceUpdate();
    },
    saveCon: function saveCon() {
      if (this.saveConValidate()) {
        this.controlList.push({
          eqpGroup: this.addConForm.eqpGroup,
          eqpGroupName: this.addConForm.eqpGroupName,
          eqp: this.addConForm.eqp,
          eqpName: this.addConForm.eqpName,
          condition: this.addConForm.condition,
          conditionName: this.addConForm.conditionName,
          filedType: this.addConForm.filedType,
          conNum: this.addConForm.conNum });

        this.$refs.addConPopup.close();
      }
    },
    // 确定选择符号
    confirmSymbol: function confirmSymbol(item) {
      if (this.type) {
        if (this.type == 'trig') {
          this.currentTrigData.symbol = item.id;
          this.currentTrigData.symbolName = item.name;
        } else if (this.type == 'con') {
          this.currentConData.symbol = item.key;
          this.currentConData.symbolName = item.name;
        }
        this.$refs.symbolPopup.close();
      } else if (this.addType) {
        if (this.addType == 'trig') {
          this.addTrigForm.symbol = item.id;
          this.addTrigForm.symbolName = item.name;
          this.$refs.addtrigPopup.open();
        } else if (this.addType == 'con') {
          this.addConForm.symbol = item.key;
          this.addConForm.symbolName = item.name;
          this.$refs.addConPopup.open();
        }
        this.$refs.symbolPopup.close();
      }
    },
    // 选择符号新增一行
    toSelectSymbolAdd: function toSelectSymbolAdd(type) {
      this.addType = type;
      this.type = '';
      if (type == 'trig') {
        this.$refs.addtrigPopup.close();
      } else if (type == 'con') {
        this.$refs.addConPopup.close();
      }
      console.log('==');
      this.$refs.symbolPopup.open();
    },
    // 选择符号
    toSelectSymbol: function toSelectSymbol(data, type) {
      this.type = type;
      this.addType = '';
      if (type == 'trig') {
        this.currentTrigData = data;
      } else if (type == 'con') {
        this.currentConData = data;
      }
      this.$refs.symbolPopup.open();
    },
    // 确定选择条件
    confirmCondition: function confirmCondition(item) {
      if (this.type) {
        if (this.type == 'trig') {
          this.currentTrigData.condition = item.key;
          this.currentTrigData.conditionName = item.name;
          this.currentTrigData.filedType = item.type;
          this.currentTrigData.field_symbol = item.symbol;
        } else if (this.type == 'con') {
          this.currentConData.condition = item.key;
          this.currentConData.conditionName = item.name;
          this.currentConData.filedType = item.type;
          this.currentConData.field_symbol = item.symbol;
        }
      } else if (this.addType) {
        if (this.addType == 'trig') {
          this.addTrigForm.condition = item.key;
          this.addTrigForm.conditionName = item.name;
          this.addTrigForm.filedType = item.type;
          this.addTrigForm.field_symbol = item.symbol;
          this.$refs.addtrigPopup.open();
        } else if (this.addType == 'con') {
          this.addConForm.condition = item.key;
          this.addConForm.conditionName = item.name;
          this.addConForm.filedType = item.type;
          this.addConForm.field_symbol = item.symbol;
          this.$refs.addConPopup.open();
        }
      }
      this.$refs.conditionPopup.close();
    },
    // 选择条件新增一行
    toSelectConditionAdd: function toSelectConditionAdd(type) {var _this4 = this;
      this.addType = type;
      this.type = '';
      if (this.trigList[0].conditionType == 1) {
        if (type == 'trig') {
          if (!this.addTrigForm.eqp) {
            this.toast.msg = '请选择设备';
            this.$refs.toast.show();
            return;
          }
        } else if (type == 'con') {
          if (!this.addConForm.eqp) {
            this.toast.msg = '请选择设备';
            this.$refs.toast.show();
            return;
          }
        }
      }
      uni.showLoading({
        title: '加载中' });

      this.API.apiRequest('/api/automation/show', {
        bid: type == 'trig' ? this.addTrigForm.eqp : this.addConForm.eqp },
      'post').then(function (res) {
        if (res.code === 200) {
          if (res.data && res.data.length > 0) {
            _this4.conditionList = res.data;
            if (type == 'trig') {
              _this4.$refs.addtrigPopup.close();
            } else if (type == 'con') {
              _this4.$refs.addConPopup.close();
            }
            _this4.$refs.conditionPopup.open();
          } else {
            _this4.toast.msg = '暂无可选择数据';
            _this4.$refs.toast.show();
          }
        }
        uni.hideLoading();
      }).finally(function () {
        uni.hideLoading();
      });
    },
    // 选择条件
    toSelectCondition: function toSelectCondition(data, type) {var _this5 = this;
      this.type = type;
      this.addType = '';
      if (this.trigList[0].conditionType == 1) {
        if (type == 'trig') {
          this.currentTrigData = data;
          if (!this.currentTrigData.eqp) {
            this.toast.msg = '请选择设备';
            this.$refs.toast.show();
            return;
          }
        } else if (type == 'con') {
          this.currentConData = data;
          if (!this.currentConData.eqp) {
            this.toast.msg = '请选择设备';
            this.$refs.toast.show();
            return;
          }
        }
      }
      uni.showLoading({
        title: '加载中' });

      this.API.apiRequest('/api/automation/show', {
        bid: type == 'trig' ? this.currentTrigData.eqp : this.currentConData.eqp },
      'post').then(function (res) {
        if (res.code === 200) {
          if (res.data && res.data.length > 0) {
            _this5.$refs.conditionPopup.open();
            _this5.conditionList = res.data;
          } else {
            _this5.toast.msg = '暂无可选择数据';
            _this5.$refs.toast.show();
          }
        }
        uni.hideLoading();
      }).finally(function () {
        uni.hideLoading();
      });
    },
    // 确定选择设备
    comfirEqp: function comfirEqp(item) {
      if (this.type) {
        if (this.type == 'trig') {
          this.currentTrigData.eqp = item.device_id;
          this.currentTrigData.condition = '';
          this.currentTrigData.conditionName = '';
          this.currentTrigData.eqpName = item.name;
        } else if (this.type == 'con') {
          this.currentConData.condition = '';
          this.currentConData.conditionName = '';
          this.currentConData.eqp = item.device_id;
          this.currentConData.eqpName = item.name;
        }
        this.$refs.eqpPopup.close();
      } else if (this.addType) {
        if (this.addType == 'trig') {
          this.addTrigForm.eqp = item.device_id;
          this.addTrigForm.eqpName = item.name;
          this.addTrigForm.condition = '';
          this.addTrigForm.conditionName = '';
          this.$refs.addtrigPopup.open();
        } else if (this.addType == 'con') {
          this.addConForm.eqp = item.device_id;
          this.addConForm.eqpName = item.name;
          this.addConForm.condition = '';
          this.addConForm.conditionName = '';
          this.$refs.addConPopup.open();
        }
        this.$refs.eqpPopup.close();
      }
    },
    // 新增一行选择设备
    toSelectEqpAdd: function toSelectEqpAdd(type) {var _this6 = this;
      this.addType = type;
      if (this.trigList[0].conditionType == 1) {
        if (type == 'trig') {
          if (!this.addTrigForm.eqpGroup) {
            this.toast.msg = '请选择设备分组';
            this.$refs.toast.show();
            return;
          }
        } else if (type == 'con') {
          if (!this.addConForm.eqpGroup) {
            this.toast.msg = '请选择设备分组';
            this.$refs.toast.show();
            return;
          }
        }
      }
      uni.showLoading({
        title: '加载中' });

      this.API.apiRequest('/api/kv/current/asset/a', {
        asset_id: type == 'trig' ? this.addTrigForm.eqpGroup : this.addConForm.eqpGroup },
      'post').then(function (res) {
        if (res.code === 200) {
          if (res.data && res.data.devices.length > 0) {
            _this6.eqpList = res.data.devices;
            if (type == 'trig') {
              _this6.$refs.addtrigPopup.close();
            } else if (type == 'con') {
              _this6.$refs.addConPopup.close();
            }
            _this6.$refs.eqpPopup.open();
          } else {
            _this6.toast.msg = '暂无可选择数据';
            _this6.$refs.toast.show();
          }
        }
        uni.hideLoading();
      }).finally(function () {
        uni.hideLoading();
      });
    },
    // 选择设备
    toSelectEqp: function toSelectEqp(data, type) {var _this7 = this;
      this.type = type;
      this.addType = '';
      if (type == 'trig') {
        this.currentTrigData = data;
      } else if (type == 'con') {
        this.currentConData = data;
      }
      uni.showLoading({
        title: '加载中' });

      this.API.apiRequest('/api/kv/current/asset/a', {
        asset_id: type == 'trig' ? this.currentTrigData.eqpGroup : this.currentConData.eqpGroup },
      'post').then(function (res) {
        if (res.code === 200) {
          if (res.data && res.data.devices.length > 0) {
            _this7.$refs.eqpPopup.open();
            _this7.eqpList = res.data.devices;
          } else {
            _this7.toast.msg = '暂无可选择数据';
            _this7.$refs.toast.show();
          }
        }
        uni.hideLoading();
      }).finally(function () {
        uni.hideLoading();
      });
    },
    //确定选择设备分组
    toConfirmeqpGroup: function toConfirmeqpGroup(item) {
      if (this.type) {
        if (this.type == 'trig') {
          this.currentTrigData.eqpGroup = item.id;
          this.currentTrigData.eqpGroupName = item.device_group;
          this.currentTrigData.eqp = '';
          this.currentTrigData.eqpName = '';
          this.currentTrigData.condition = '';
          this.currentTrigData.conditionName = '';
        } else if (this.type == 'con') {
          this.currentConData.eqpGroup = item.id;
          this.currentConData.eqpGroupName = item.device_group;
          this.currentConData.eqp = '';
          this.currentConData.eqpName = '';
          this.currentConData.condition = '';
          this.currentConData.conditionName = '';
        }
        this.$refs.eqpGroups.close();
      } else if (this.addType) {
        if (this.addType == 'trig') {
          this.addTrigForm.eqp = '';
          this.addTrigForm.eqpName = '';
          this.addTrigForm.condition = '';
          this.addTrigForm.conditionName = '';
          this.addTrigForm.eqpGroup = item.id;
          this.addTrigForm.eqpGroupName = item.device_group;
          this.$refs.addtrigPopup.open();
        } else if (this.addType == 'con') {
          this.addConForm.eqp = '';
          this.addConForm.eqpName = '';
          this.addConForm.condition = '';
          this.addConForm.conditionName = '';
          this.addConForm.eqpGroup = item.id;
          this.addConForm.eqpGroupName = item.device_group;
          this.$refs.addConPopup.open();
        }
        this.$refs.eqpGroups.close();
      }
    },
    // 设备分组
    toSelectEqpGroup: function toSelectEqpGroup(data, type) {var _this8 = this;
      this.type = type;
      this.addType = '';
      if (type == 'trig') {
        this.currentTrigData = data;
      } else if (type == 'con') {
        this.currentConData = data;
      }
      uni.showLoading({
        title: '加载中' });

      this.API.apiRequest('/api/asset/list/d', {
        business_id: uni.getStorageSync('ywId') },
      'post').then(function (res) {
        if (res.code === 200) {
          if (res.data && res.data.length > 0) {
            _this8.$refs.eqpGroups.open();
            _this8.eqpGroupsList = res.data;
          } else {
            _this8.toast.msg = '暂无可选择数据';
            _this8.$refs.toast.show();
          }
        }
        uni.hideLoading();
      }).finally(function () {
        uni.hideLoading();
      });
    },
    // 新增一行选择设备分组
    toSelectEqpGroupAdd: function toSelectEqpGroupAdd(type) {var _this9 = this;
      this.addType = type;
      this.type = '';
      uni.showLoading({
        title: '加载中' });

      this.API.apiRequest('/api/asset/list/d', {
        business_id: uni.getStorageSync('ywId') },
      'post').then(function (res) {
        if (res.code === 200) {
          if (res.data && res.data.length > 0) {
            _this9.eqpGroupsList = res.data;
            if (type == 'trig') {
              _this9.$refs.addtrigPopup.close();
            } else if (type == 'con') {
              _this9.$refs.addConPopup.close();
            }
            _this9.$refs.eqpGroups.open();
          } else {
            _this9.toast.msg = '暂无可选择数据';
            _this9.$refs.toast.show();
          }
        }
        uni.hideLoading();
      }).finally(function () {
        uni.hideLoading();
      });
    },
    // 选择设备条件类型
    toSelectConditionType: function toSelectConditionType(data, type) {
      this.type = type;
      this.addType = '';
      if (type == 'trig') {
        this.currentTrigData = data;
      } else if (type == 'con') {
        this.currentConData = data;
      }
      this.currentTrigData = data;
      this.$refs.conditionType.open();
    },
    // 确定条件类型
    comfirConditionType: function comfirConditionType(item) {
      if (this.type == 'trig') {
        this.currentTrigData.conditionType = item.value;
        this.currentTrigData.conditionTypeName = item.label;
      } else if (this.type == 'con') {
        this.currentConData.conditionType = item.value;
        this.currentConData.conditionTypeName = item.label;
      }
      this.$refs.conditionType.close();
    },
    // 新增执行命令
    toAddCon: function toAddCon() {
      this.$refs.addConPopup.open();
    },
    // 新增触发条件
    toAddtrig: function toAddtrig() {
      this.$refs.addtrigPopup.open();
    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 1)["default"]))

/***/ }),

/***/ 148:
/*!***************************************************************************************************************************!*\
  !*** E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue?vue&type=style&index=0&id=1c0bc136&scoped=true&lang=css& ***!
  \***************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./add-control.vue?vue&type=style&index=0&id=1c0bc136&scoped=true&lang=css& */ 149);
/* harmony import */ var _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_software_HBuilderX_3_1_12_20210428_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_add_control_vue_vue_type_style_index_0_id_1c0bc136_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 149:
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!E:/project/Y-渔业可视化/app/pages/alert-control/add-control.vue?vue&type=style&index=0&id=1c0bc136&scoped=true&lang=css& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[142,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/alert-control/add-control.js.map