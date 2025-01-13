export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    loading: 'Loading...'
  },
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Login',
    registerBtn: 'Register'
  },
  ucenter: {
    notLoggedIn: 'Not Logged In/Register',
    clickToLogin: 'Click avatar to login/register',
    language: 'Language',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    logout: 'Logout',
    deleteAccount: 'Permanently Delete Account',
    serverAddress: 'Server Address',
    enterServerAddress: 'Please enter server address',
    warning: 'Warning',
    deleteConfirmation: 'After account deletion, data cannot be recovered and your registered personal information will be permanently deleted! Please confirm account deletion!',
    deleteSuccess: 'Account deleted successfully',
    deleteFailed: 'Delete failed',
    loading: 'Loading',
    tip: 'Tip',
    enterServerAddressToast: 'Please enter server address',
    confirm: 'Confirm',
    authDescription: 'Login authorization'
  },
  pages: {
    login: 'Login',
    register: 'Register',
    notify: 'Notifications',
    deviceList: 'Device List',
    intelligentControl: 'Intelligent Control',
    userCenter: 'User Center',
    basicInfo: 'Basic Info',
    deviceDetail: 'Device Detail',
    addDevice: 'Add Device',
    modifyName: 'Modify Name',
    modifyPhone: 'Modify Phone',
    modifyEmail: 'Modify Email',
    modifyPassword: 'Modify Password',
    historyOperation: 'Operation History',
    myDevices: 'My Devices',
    editAlertStrategy: 'Edit Alert Strategy',
    addAlertStrategy: 'Add Alert Strategy',
    addControlStrategy: 'Add Control Strategy',
    editControlStrategy: 'Edit Control Strategy',
    addSceneLinkage: 'Add Scene Linkage',
    addScene: 'Add Scene',
    myAccount: 'My Account',
    accounts: {
      title: 'Account Information',
      logout: 'Logout Current Account',
      logoutConfirm: 'Do you want to logout?',
      logoutBtn: 'Logout Now',
      logoutSuccess: 'Logout successful'
    },
    email: {
      inputPlaceholder: 'Please enter email address!',
      tips: 'Please enter your email address!',
      invalidEmail: 'Please enter a valid email address!',
      updateSuccess: 'Update successful!'
    },
    phone: {
      inputPlaceholder: 'Please enter phone number!',
      tips: 'Please enter your phone number, make sure it is correct!',
      invalidPhone: 'Please enter a valid phone number',
      updateSuccess: 'Update successful!'
    },
    realname: {
      inputPlaceholder: 'Please enter your name!',
      tips: 'Please enter your real name!',
      emptyError: 'Real name cannot be empty',
      updateSuccess: 'Settings updated successfully!'
    }
  },
  components: {
    popup: {
      title: 'Tips',
      content: 'Are you sure to approve this comment?',
      cancel: 'Cancel',
      confirm: 'Confirm'
    },
    authorize: {
      info: 'Please click [Get Authorization] below to use Smart Pig Farm',
      cancelBtn: 'Cancel Authorization',
      getAuthBtn: 'Get Authorization'
    },
    login: {
      welcome: 'Login',
      welcomeSubtitle: 'Welcome to login',
      accountPlaceholder: 'Please enter account!',
      passwordPlaceholder: 'Please enter password!',
      rememberPassword: 'Remember password',
      loginButton: 'Login',
      forgotPassword: 'Forgot password',
      loginSuccess: 'Login successful'
    },
    device: {
      placeholder: 'Device',
      selectTitle: 'Select Device',
      test: 'Test'
    },
    selectDevice: {
      group: 'Group',
      operator: 'Operator',
      propertyValue: 'Property Value',
      statusProperty: 'Status/Property',
      onlineStatus: 'Online Status',
      property: 'Property',
      noData: 'No Data!',
      online: 'Online',
      offline: 'Offline',
      onAndOff: 'Online/Offline'
    },
    selectTime: {
      triggerType: 'Trigger Type',
      single: 'Single',
      repeat: 'Repeat',
      range: 'Range',
      triggerDateTime: 'Trigger Date Time',
      singleTip: 'Execute once only, condition disappears after execution',
      repeatCycle: 'Repeat Cycle',
      startTime: 'Start Time',
      endTime: 'End Time',
      everyHour: 'Every Hour',
      everyDay: 'Every Day',
      everyWeek: 'Every Week',
      everyMonth: 'Every Month',
      customCron: 'Custom Cron',
      hourTip: 'Example: "33:00" means trigger at the 33rd minute of every hour',
      dayTip: 'Example: "18:33" means trigger at 18:33 every day',
      weekTip: 'Example: "Monday, 18:33" means trigger at 18:33 every Monday',
      monthTip: 'Example: "1st, 9:00" means trigger at 09:00 on the 1st of every month',
      day: 'Day',
      executionRule: 'Execution Date Time Rule'
    },
    notifyDialog: {
      confirmText: 'Click confirm to {action} alert',
      process: 'process',
      ignore: 'ignore',
      optional: 'Optional',
      operationSuccess: 'Operation successful'
    }
  }
  // Add more translations as needed
} 