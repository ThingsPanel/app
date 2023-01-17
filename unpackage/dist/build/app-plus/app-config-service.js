
var isReady=false;var onReadyCallbacks=[];
var isServiceReady=false;var onServiceReadyCallbacks=[];
var __uniConfig = {"pages":["pages/login/login","pages/fishery-monitor/fishery-monitor","pages/intelligent-control/intelligent-control","pages/ucenter/ucenter","pages/accounts/accounts","pages/fishery-monitor/deviceDetail","pages/fishery-monitor/addMonitor","pages/accounts/realname","pages/accounts/phone","pages/accounts/email","pages/change-pwd/change-pwd","pages/history-operate/history-operate","pages/device/device","pages/alert-strategy/edit-strategy","pages/alert-strategy/alert-strategy","pages/alert-control/add-control","pages/alert-control/edit-control"],"window":{"navigationBarTextStyle":"black","navigationBarTitleText":"ThingsPanel","navigationBarBackgroundColor":"#EEEEEE","backgroundColor":"#EEEEEE"},"tabBar":{"color":"#908F92","selectedColor":"#207AF5","height":"52px","backgroundColor":"#FFFFFF","borderStyle":"white","list":[{"pagePath":"pages/fishery-monitor/fishery-monitor","text":"设备列表","iconPath":"static/tabbar/eqp.png","selectedIconPath":"static/tabbar/eqp_on.png"},{"pagePath":"pages/intelligent-control/intelligent-control","text":"智能控制","iconPath":"static/tabbar/intelligentControl.png","selectedIconPath":"static/tabbar/intelligentControlSel.png"},{"pagePath":"pages/ucenter/ucenter","text":"我的账户","iconPath":"static/tabbar/ucenter.png","selectedIconPath":"static/tabbar/ucenterSel.png"}]},"nvueCompiler":"uni-app","nvueStyleCompiler":"uni-app","renderer":"auto","splashscreen":{"alwaysShowBeforeRender":true,"autoclose":false},"appname":"物联网平台","compilerVersion":"3.5.3","entryPagePath":"pages/login/login","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000}};
var __uniRoutes = [{"path":"/pages/login/login","meta":{"isQuit":true},"window":{"navigationBarTitleText":"登录","enablePullDownRefresh":false,"navigationStyle":"custom"}},{"path":"/pages/fishery-monitor/fishery-monitor","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"猪场监测","enablePullDownRefresh":false,"navigationStyle":"custom"}},{"path":"/pages/intelligent-control/intelligent-control","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"智能控制","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#EEEEEE"}},{"path":"/pages/ucenter/ucenter","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"个人中心","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#EEEEEE"}},{"path":"/pages/accounts/accounts","meta":{},"window":{"navigationBarTitleText":"基本资料","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}},{"path":"/pages/fishery-monitor/deviceDetail","meta":{},"window":{"navigationBarTitleText":"设备详情","enablePullDownRefresh":false,"navigationStyle":"custom"}},{"path":"/pages/fishery-monitor/addMonitor","meta":{},"window":{"navigationBarTitleText":"添加设备","enablePullDownRefresh":false,"navigationStyle":"custom"}},{"path":"/pages/accounts/realname","meta":{},"window":{"navigationBarTitleText":"修改姓名","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FAFAFA","scrollIndicator":"none","bounce":"none","titleNView":{"buttons":[{"color":"#333333","colorPressed":"#009933","float":"right","fontWeight":"normal","fontSize":"14px","text":"保存","width":"40px"}]}}},{"path":"/pages/accounts/phone","meta":{},"window":{"navigationBarTitleText":"修改手机","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FAFAFA","scrollIndicator":"none","bounce":"none","titleNView":{"buttons":[{"color":"#333333","colorPressed":"#009933","float":"right","fontWeight":"normal","fontSize":"14px","text":"保存","width":"40px"}]}}},{"path":"/pages/accounts/email","meta":{},"window":{"navigationBarTitleText":"修改邮箱","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FAFAFA","scrollIndicator":"none","bounce":"none","titleNView":{"buttons":[{"color":"#333333","colorPressed":"#009933","float":"right","fontWeight":"normal","fontSize":"14px","text":"保存","width":"40px"}]}}},{"path":"/pages/change-pwd/change-pwd","meta":{},"window":{"navigationBarTitleText":"修改密码","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FAFAFA"}},{"path":"/pages/history-operate/history-operate","meta":{},"window":{"navigationBarTitleText":"历史操作","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}},{"path":"/pages/device/device","meta":{},"window":{"navigationBarTitleText":"我的设备","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}},{"path":"/pages/alert-strategy/edit-strategy","meta":{},"window":{"navigationBarTitleText":"编辑告警策略","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}},{"path":"/pages/alert-strategy/alert-strategy","meta":{},"window":{"navigationBarTitleText":"新增告警策略","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}},{"path":"/pages/alert-control/add-control","meta":{},"window":{"navigationBarTitleText":"新增控制策略","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}},{"path":"/pages/alert-control/edit-control","meta":{},"window":{"navigationBarTitleText":"编辑控制策略","enablePullDownRefresh":false,"navigationBarBackgroundColor":"#FFFFFF"}}];
__uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
__uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:Math.round(f/20)})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:void 0,window:void 0,document:void 0,frames:void 0,self:void 0,location:void 0,navigator:void 0,localStorage:void 0,history:void 0,Caches:void 0,screen:void 0,alert:void 0,confirm:void 0,prompt:void 0,fetch:void 0,XMLHttpRequest:void 0,WebSocket:void 0,webkit:void 0,print:void 0}}}});
