"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SipDispatchContext = exports.SipContext = void 0;
exports.SipProvider = SipProvider;
exports.useAudioDevices = useAudioDevices;
exports.useAudioDevices_deprecated = useAudioDevices_deprecated;
exports.useChat = useChat;
exports.useChatRoom = useChatRoom;
exports.useSIPClient = useSIPClient;
exports.useSIPClientStatus = useSIPClientStatus;
exports.useSIPPermission = useSIPPermission;
exports.useSipAccount = useSipAccount;
exports.useSipCore = useSipCore;
exports.useSipSetting = useSipSetting;
exports.useTargetAgent = useTargetAgent;
exports.useUnreadCountInfo = useUnreadCountInfo;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _index = require("./index");
var _Session = _interopRequireDefault(require("./Session"));
var _reactNativePermissions = require("react-native-permissions");
var _Permissions = _interopRequireDefault(require("./Permissions"));
var _Core = _interopRequireDefault(require("./Core"));
var _reactNativeMmkv = require("react-native-mmkv");
var _AudioDeviceStore = require("./Stores/AudioDeviceStore");
var _Message = _interopRequireDefault(require("./Message"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const isEqual = require("react-fast-compare");
/*import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider'
import database from '../src/model';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import { RealmProvider } from './realm';*/

const SipContext = /*#__PURE__*/(0, _react.createContext)({
  agents: [],
  chatRooms: [],
  callLogs: []
});
exports.SipContext = SipContext;
const SipDispatchContext = /*#__PURE__*/(0, _react.createContext)(null);
exports.SipDispatchContext = SipDispatchContext;
function SipProvider(_ref) {
  let {
    children,
    sipConfigs
  } = _ref;
  //const [agents, setAgents] = useState<UserAgent[]>([]);
  const [loading, setLoading] = (0, _react.useState)(true);
  const [callLogs, setCallLogs] = (0, _react.useState)([]);
  const {
    boot
  } = useSipSetting();
  const [chatRooms, chatRoomDispatch] = (0, _react.useReducer)(chatRoomsReducer, []);
  const [agents, dispatch] = (0, _react.useReducer)(agentsReducer, []);
  (0, _react.useEffect)(() => {
    const bootCore = async () => {
      await _Core.default.init();
      await _Core.default.start();
      boot();
      initChatRoom();
    };
    bootCore();
    return () => {
      _Core.default.stop();
    };
  }, []);
  const initChatRoom = async () => {
    let list = await _Message.default.getChatRooms();
    chatRoomDispatch({
      type: 'init',
      value: list
    });
  };
  (0, _react.useEffect)(() => {
    let handleMessage = async _event => {
      chatRoomDispatch({
        type: 'onMessage',
        value: await _Message.default.getChatRooms()
      });
    };
    _Core.default.on('messageReceived', handleMessage);
    let handleChatRoomRead = async _event => {
      chatRoomDispatch({
        type: 'onMessage',
        value: await _Message.default.getChatRooms()
      });
    };
    _Core.default.on('onChatRoomRead', handleChatRoomRead);
    return () => {
      _Core.default.off('messageReceived', handleMessage);
      _Core.default.off('onChatRoomRead', handleChatRoomRead);
    };
  }, []);
  function addUA(sipConfig) {
    const userAgent = new _index.UserAgent(sipConfig);
    return userAgent;
  }
  (0, _react.useEffect)(() => {
    const subscription = _reactNative.AppState.addEventListener('change', nextAppState => {
      if (nextAppState == 'active') {
        _Permissions.default.enterForeground();
      } else {
        _Permissions.default.enterBackground();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);
  (0, _react.useEffect)(() => {
    const getAndSetLogs = async () => {
      setTimeout(() => {
        _Core.default.getCallLogs().then(data => {
          setCallLogs(data);
        });
      }, 500);
    };
    getAndSetLogs();
    _Core.default.on('callLogUpdated', getAndSetLogs);
    return () => {
      _Core.default.off('callLogUpdated', getAndSetLogs);
    };
  }, []);
  (0, _react.useEffect)(() => {
    dispatch({
      type: 'init',
      sipConfigs
    });
    setLoading(false);
    return () => {
      agents.map(async agent => {
        await agent.stop();
      });
      dispatch({
        type: 'clear'
      });
    };
  }, [sipConfigs]);
  (0, _react.useEffect)(() => {
    function registerFunc(e) {
      dispatch({
        type: 'registered',
        userAgentId: e.id
      });
    }
    _Core.default.on('registered', registerFunc);
    function unregisteredFunc(e) {
      dispatch({
        type: 'unRegistered',
        userAgentId: e.id
      });
    }
    _Core.default.on('unregistered', unregisteredFunc);
    function registrationFailedFunc(e) {
      dispatch({
        type: 'registrationFailed',
        userAgentId: e.id,
        errorMessage: e.message
      });
    }
    _Core.default.on('registrationFailed', registrationFailedFunc);
    function registrationProgressFunc(e) {
      dispatch({
        type: 'registrationProgress',
        userAgentId: e.id
      });
    }
    _Core.default.on('registrationProgress', registrationProgressFunc);
    return () => {
      _Core.default.removeListener('registered', registerFunc);
      _Core.default.removeListener('unregistered', unregisteredFunc);
      _Core.default.removeListener('registrationFailed', registrationFailedFunc);
      _Core.default.removeListener('registrationProgress', registrationProgressFunc);
    };
  }, []);
  function createAgents(agents) {
    if (agents.length == 0) {
      return [];
    }
    let hasDefault = false;
    let result = agents.map(agent => {
      if (agent.isDefault) {
        hasDefault = true;
      }
      return agent;
    });
    if (hasDefault) {
      return result;
    } else {
      var _result$;
      (_result$ = result[0]) === null || _result$ === void 0 ? void 0 : _result$.setIsDefault(true);
      return result;
    }
  }
  function agentsReducer(agents, action) {
    switch (action.type) {
      case 'init':
        {
          const {
            sipConfigs
          } = action;
          const result = sipConfigs.map(config => {
            return addUA(config);
          });
          return createAgents(result);
        }
      case 'add':
        {
          return [...agents, addUA(action.sipConfig)];
        }
      case 'update':
        {
          /*const { sipConfig } = action;
          let targetIndx = agents.findIndex((item: UserAgent) => item.id = sipConfig.id);
          let userAgent = agents[targetIndx];
          userAgent.unregister();
          userAgent.remove();
          let newState = agents.filter((item: UserAgent) => item.id != sipConfig.id);
          const arr = [...newState, addUA(action.sipConfig)];
          //return arr;
          return createAgents(arr);*/
          /*const { sipConfig } = action;
          const filtered = agents.filter((item: UserAgent, index: number) => {
              console.warn('index:', index);
              if (item.id == sipConfig.id) {
                  item.unregister();
                  item.remove();
              }
              return item.id != sipConfig.id;
          });
          return createAgents([...filtered, addUA(action.sipConfig)]);*/
          const {
            sipConfig
          } = action;
          const arr = agents.map(item => {
            if (item.id == sipConfig.id) {
              item.unregister();
              item.remove();
              return addUA(sipConfig);
            }
            return item;
          });
          return createAgents(arr);
        }
      case 'remove':
        {
          const {
            userAgent
          } = action;
          const filtered = agents.filter(item => {
            //TODO: 这里使用username来移除会有同名不同域问题
            if (item.id == userAgent.id) {
              item.unregister();
              item.remove();
            }
            return item.id != userAgent.id;
          });
          return createAgents(filtered);
        }
      case 'setCurrent':
        {
          return agents.map(item => {
            if (item == action.userAgent) {
              item.setIsDefault(true);
            } else {
              item.setIsDefault(false);
            }
            return item;
          });
        }
      case 'registered':
        {
          return agents.map(item => {
            if (item.id == action.userAgentId) {
              item.isRegistered = true;
              item.isProgress = false;
              item.error = '';
            }
            return item;
          });
        }
      case 'unRegistered':
        {
          return agents.map(item => {
            if (item.id == action.userAgentId) {
              item.isRegistered = false;
              item.isProgress = false;
            }
            return item;
          });
        }
      case 'registrationProgress':
        {
          return agents.map(item => {
            if (item.id == action.userAgentId) {
              item.isProgress = true;
              item.error = '';
            }
            return item;
          });
        }
      case 'registrationFailed':
        {
          return agents.map(item => {
            if (item.id == action.userAgentId) {
              item.error = action.errorMessage;
              item.isProgress = false;
              item.isRegistered = false;
            }
            return item;
          });
        }
      case 'clear':
        {
          return [];
        }
      /*case 'changed': {
          return tasks.map(t => {
              if (t.id === action.task.id) {
                  return action.task;
              } else {
                  return t;
              }
          });
      }
      case 'deleted': {
          return tasks.filter(t => t.id !== action.id);
      }*/
      default:
        {
          throw Error('Unknown action: ' + action.type);
        }
    }
  }

  /**
   * <DatabaseProvider database={database}>
   *  </DatabaseProvider >
   */

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, !loading && /*#__PURE__*/_react.default.createElement(SipContext.Provider, {
    value: {
      agents,
      callLogs,
      chatRooms,
      chatRoomDispatch
    }
  }, /*#__PURE__*/_react.default.createElement(SipDispatchContext.Provider, {
    value: dispatch
  }, children)));
}

/*export function useSIPClientStatus(username: string) {
    const { agents } = useContext(SipContext);
    const index = agents.findIndex(item => item.username == username);
    if (index == -1) {
        console.error('不存在的username,无法获得anget对象');
        throw new Error('不存在的username,无法使用useSIPClient');
    }
    const ua = agents[index];

    return { isRegistered: ua && ua.isRegistered };
}*/

function useSipCore() {
  const {
    callLogs
  } = (0, _react.useContext)(SipContext);
  return {
    callLogs,
    clearCallLogs: _Core.default.clearCallLogs,
    removeCallLog: _Core.default.removeCallLog
  };
}
function useSipAccount() {
  const {
    agents
  } = (0, _react.useContext)(SipContext);
  const dispatch = (0, _react.useContext)(SipDispatchContext);
  function _checkSipConfig(sipConfig) {
    let {
      username,
      domain
    } = sipConfig;
    username = username && username.trim();
    if (!username) {
      throw new Error('用户名必须填写...');
    }
    if (!domain) {
      throw new Error('域名必须填写');
    }
    for (let item of agents) {
      if (item.username == sipConfig.username && item.domain == sipConfig.domain && sipConfig.id != item.id) {
        throw new Error("该用户名和域名已在账户中...");
      }
    }
  }
  function add(sipConfig) {
    _checkSipConfig(sipConfig);
    dispatch && dispatch({
      type: 'add',
      sipConfig
    });
  }
  function update(sipConfig) {
    _checkSipConfig(sipConfig);
    dispatch && dispatch({
      type: 'update',
      sipConfig
    });
  }
  function remove(userAgent) {
    dispatch && dispatch({
      type: 'remove',
      userAgent
    });
  }
  function setCurrent(userAgent) {
    dispatch && dispatch({
      type: 'setCurrent',
      userAgent
    });
    //return Core.setDefaultAccount(userAgent);
  }

  function registerAll() {
    agents.map(agent => {
      return agent.register();
    });
  }
  function unRegisterAll() {
    agents.map(agent => {
      return agent.unregister();
    });
  }
  return {
    agents,
    activeAgent: agents.find(item => item.isDefault),
    add,
    remove,
    setCurrent,
    update,
    registerAll,
    unRegisterAll
  };
}
function useTargetAgent(id) {
  const {
    agents
  } = (0, _react.useContext)(SipContext);
  const index = agents.findIndex(item => item.id == id);
  //console.debug('agents:', agents, 'index:', index, 'username:', username);
  if (index == -1) {
    console.error('不存在的username,无法获得anget对象');
    throw new Error('不存在的username,无法使用useSIPClient');
  }
  return agents[index];
}
function useSIPClientStatus(id) {
  if (!id) return {};
  const userAgent = useTargetAgent(id);
  if (!userAgent) return;
  async function register() {
    return await (userAgent === null || userAgent === void 0 ? void 0 : userAgent.register());
  }
  async function unRegister() {
    return await (userAgent === null || userAgent === void 0 ? void 0 : userAgent.unregister());
  }
  async function stop() {
    return await (userAgent === null || userAgent === void 0 ? void 0 : userAgent.stop());
  }
  return {
    //isRegistered,
    //isProgress,
    //error,
    register,
    unRegister,
    stop
  };
}
function useSipSetting() {
  const [_isEchoCancellationEnabled, _setIsEchoCancellationEnabled] = (0, _reactNativeMmkv.useMMKVBoolean)("linphone.isEchoCancellationEnabled");
  const [_isAdaptiveRateControlEnabled, _setIsAdaptiveRateControlEnabled] = (0, _reactNativeMmkv.useMMKVBoolean)('linphone.isAdaptiveRateControlEnabled');
  const [_dtmfSendType, _setDtmfSendType] = (0, _reactNativeMmkv.useMMKVString)("linphone.dtmfSendType");
  const [playbackDb, _setPlaybackDb] = (0, _reactNativeMmkv.useMMKVNumber)("linphone.playbackDb");
  const dtmfSendTypes = ["带内", "RFC2833", "Sip Info"];
  const boot = async () => {
    if (typeof _isEchoCancellationEnabled == 'undefined') {
      let defaultValue = await _Core.default.isEchoCancellationEnabled();
      await _Core.default.setEchoCancellationEnabled(defaultValue);
      setIsEchoCancellationEnabled(defaultValue);
    } else {
      await _Core.default.setEchoCancellationEnabled(_isEchoCancellationEnabled);
    }
    if (typeof _isAdaptiveRateControlEnabled == 'undefined') {
      let defaultValue = await _Core.default.isAdaptiveRateControlEnabled();
      await _Core.default.setAdaptiveRateControlEnabled(defaultValue);
      setIsAdaptiveRateControlEnabled(defaultValue);
    } else {
      await _Core.default.setAdaptiveRateControlEnabled(_isAdaptiveRateControlEnabled);
    }
    if (!_dtmfSendType) {
      _setDtmfSendType("RFC2833");
      setDtmfType("RFC2833");
    } else {
      setDtmfType(_dtmfSendType);
    }
    const currentPlayback = await _Core.default.getPlaybackGainDb();
    _setPlaybackDb(currentPlayback);
  };
  const setIsEchoCancellationEnabled = isEnabled => {
    _Core.default.setEchoCancellationEnabled(isEnabled);
    _setIsEchoCancellationEnabled(isEnabled);
  };
  const setIsAdaptiveRateControlEnabled = isEnabled => {
    _Core.default.setAdaptiveRateControlEnabled(isEnabled);
    _setIsAdaptiveRateControlEnabled(isEnabled);
  };
  const setPlaybackDb = async val => {
    await _Core.default.setPlaybackGainDb(val);
    _setPlaybackDb(val);
  };
  const setDtmfType = dtmfType => {
    // 检查 dtmfType 是否合法
    if (dtmfSendTypes.includes(dtmfType)) {
      if (dtmfType == "带内") {
        _Core.default.setUseInfoForDtmf(false);
        _Core.default.setUseRfc2833ForDtmf(false);
      }
      if (dtmfType == "RFC2833") {
        _Core.default.setUseInfoForDtmf(false);
        _Core.default.setUseRfc2833ForDtmf(true);
      }
      if (dtmfType == "Sip Info") {
        _Core.default.setUseInfoForDtmf(true);
        _Core.default.setUseRfc2833ForDtmf(false);
      }
      _setDtmfSendType(dtmfType);
    } else {
      console.error("不支持的 DTMF 发送类型");
    }
  };
  return {
    boot,
    isEchoCancellationEnabled: _isEchoCancellationEnabled,
    setIsEchoCancellationEnabled,
    isAdaptiveRateControlEnabled: _isAdaptiveRateControlEnabled,
    setIsAdaptiveRateControlEnabled,
    currentDtmfSendType: _dtmfSendType,
    dtmfSendTypes,
    setDtmfType,
    playbackDb,
    setPlaybackDb
  };
}
function useSIPPermission() {
  const [checkAudioResult, setCheckAudioResult] = (0, _react.useState)();
  const [checkVideoResult, setCheckVideoResult] = (0, _react.useState)();
  const [checkOverlayResult, setCheckOverlayResult] = (0, _react.useState)();
  const [checkPhoneCallResult, setCheckPhoneCallResult] = (0, _react.useState)();
  // const [isIgnoringBatteryOptimizationsResult, setIsIgnoringBatteryOptimizationsResult] = useState(false);
  (0, _react.useEffect)(() => {
    checkAll();
    checkOverlay();
    checkPhoneCall();
    // checkIgnoringBatteryOptimizations();
  }, []);

  /*const checkIgnoringBatteryOptimizations = async () => {
      let result = await Permissions.isIgnoringBatteryOptimizations();
      setIsIgnoringBatteryOptimizationsResult(result);
  }*/
  async function checkPhoneCall() {
    if (_reactNative.Platform.OS == "android") {
      let res = await (0, _reactNativePermissions.check)(_reactNativePermissions.PERMISSIONS.ANDROID.CALL_PHONE);
      setCheckPhoneCallResult(res);
    } else {
      console.debug("ios 尚未实现");
    }
  }
  async function requestPhoneCall() {
    if (_reactNative.Platform.OS == "android") {
      let res = await (0, _reactNativePermissions.request)(_reactNativePermissions.PERMISSIONS.ANDROID.CALL_PHONE);
      setCheckPhoneCallResult(res);
    } else {
      console.log("只有安卓支持该权限调用");
    }
  }
  async function checkOverlay() {
    if (_reactNative.Platform.OS == "android") {
      let result = await _Permissions.default.checkOverlayPermission();
      setCheckOverlayResult(result ? 'granted' : 'denied');
    } else {
      console.log("只有安卓支持该权限调用");
    }
  }
  let permissions = _reactNative.Platform.select({
    ios: [_reactNativePermissions.PERMISSIONS.IOS.MICROPHONE, _reactNativePermissions.PERMISSIONS.IOS.CAMERA],
    android: [_reactNativePermissions.PERMISSIONS.ANDROID.RECORD_AUDIO, _reactNativePermissions.PERMISSIONS.ANDROID.CAMERA]
  });
  async function checkAll() {
    let resultList = {
      audioResult: null,
      videoResult: null
    };
    if (permissions) {
      for (let item of permissions) {
        let result = await (0, _reactNativePermissions.check)(item);
        if (item === _reactNativePermissions.PERMISSIONS.ANDROID.RECORD_AUDIO || item === _reactNativePermissions.PERMISSIONS.IOS.MICROPHONE) {
          setCheckAudioResult(result);
          resultList.audioResult = result;
        }
        if (item === _reactNativePermissions.PERMISSIONS.ANDROID.CAMERA || item === _reactNativePermissions.PERMISSIONS.IOS.CAMERA) {
          setCheckVideoResult(result);
          resultList.videoResult = result;
        }
      }
      return resultList;
    } else {
      console.error('使用权限失败, 尚未支持的设备平台...');
      return resultList;
    }
  }
  function delay(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  async function requestAll(callback) {
    if (permissions) {
      const {
        audioResult,
        videoResult
      } = await checkAll();
      if (audioResult == _reactNativePermissions.RESULTS.GRANTED && videoResult == _reactNativePermissions.RESULTS.GRANTED) {
        return;
      }

      //console.warn("checkAudioResult:", checkAudioResult, checkVideoResult);

      if (audioResult != _reactNativePermissions.RESULTS.GRANTED && permissions[0]) {
        /*await request(permissions[0], {
            title: "需要麦克风功能",
            message: "在通话过程中，我们需要麦克风权限，从而进行通话",
            buttonPositive: "确定授权"
        });*/
        callback && callback("requestAudio");
        await delay(500);
        let res = await (0, _reactNativePermissions.request)(permissions[0], {
          title: '麦克风权限请求',
          message: '在拨打电话后，我们需要麦克风权限进行通话和录音',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许'
        });
        callback && callback("requestAudioResult", res);
      }
      if (videoResult != _reactNativePermissions.RESULTS.GRANTED && permissions[1]) {
        callback && callback("requestVideo");
        await delay(500);
        let res = await (0, _reactNativePermissions.request)(permissions[1], {
          title: "摄像头权限请求",
          message: "在拨打视频电话时，我们需要摄像头权限进行视频通话",
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许'
        });
        callback && callback("requestVideoResult", res);
      }

      //await requestMultiple(permissions);
    } else {
      console.error('请求权限失败，尚未支持的设备平台...');
    }
  }
  async function openAndCheckOverlaySettings() {
    await _Permissions.default.openOverlaySettings();
    return await checkOverlay();
  }
  return {
    checkAudioResult,
    checkVideoResult,
    checkPhoneCallResult,
    // isIgnoringBatteryOptimizationsResult,
    openSettings: _reactNativePermissions.openSettings,
    checkOverlayResult,
    RESULTS: _reactNativePermissions.RESULTS,
    requestAll,
    requestPhoneCall,
    openAndCheckOverlaySettings,
    openPowerSettings: () => {
      _Permissions.default.openPowerSettings();
    },
    openNotificationSettings: () => {
      _Permissions.default.openNotificationSettings();
    }
  };
}
function useAudioDevices() {
  const thirdAudioDevice = (0, _AudioDeviceStore.useAudioDeviceStore)(state => state.thirdAudioDevice);
  const audioDeviceTypeList = (0, _AudioDeviceStore.useAudioDeviceStore)(state => state.audioDeviceTypeList);
  const audioDeviceList = (0, _AudioDeviceStore.useAudioDeviceStore)(state => state.audioDeviceList);
  const currentInputDevice = (0, _AudioDeviceStore.useAudioDeviceStore)(state => state.currentInputDevice);
  const currentOutputDevice = (0, _AudioDeviceStore.useAudioDeviceStore)(state => state.currentOutputDevice);
  const {
    fetchAudioDevices,
    setAudioDeviceByType
  } = (0, _AudioDeviceStore.useAudioDeviceStoreActions)();
  (0, _react.useEffect)(() => {
    fetchAudioDevices();
    let intervalId = setInterval(async () => {
      fetchAudioDevices();
    }, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return {
    audioDeviceList,
    thirdAudioDevice,
    audioDeviceTypeList,
    currentInputDevice,
    currentOutputDevice,
    setAudioDeviceByType
  };
}
function useAudioDevices_deprecated() {
  const [thirdAudioDevice, setThirdAudioDevice] = (0, _react.useState)(null);
  const [audioDeviceTypeList, setAudioDeviceTypeList] = (0, _react.useState)([]);
  const [audioDeviceList, setAudioDeviceList] = (0, _react.useState)([]);
  const [currentInputDevice, setCurrentInputDevice] = (0, _react.useState)(null);
  const [currentOutputDevice, setCurrentOutputDevice] = (0, _react.useState)(null);
  const lastListRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    let intervalId = setInterval(async () => {
      try {
        let list = await _Core.default.getAudioDevices();
        // console.log('list!!!!!!!!:', list);
        if (!isEqual(lastListRef.current, list)) {
          console.debug('找到新的设备', list);
          lastListRef.current = list;
          setAudioDeviceList(list);
          let playList = [];
          let thirdAudioTmp = null;
          //只找出所有可以播放的设备
          for (let item of list) {
            if (item.capabilities != "CapabilityRecord") {
              playList.push(item);
              if (item.type != "Earpiece" && item.type != "Speaker" && item.type != "Microphone") {
                thirdAudioTmp = item;
              }
            }
          }
          let isSpeakerEnabled = await _Core.default.isCoreSpeakerEnabled();
          if (thirdAudioTmp) {
            if (isSpeakerEnabled) {
              await _Core.default.toggleCoreSpeaker();
            }
            setThirdAudioDevice(thirdAudioTmp);
            //await Core.setAudioDeviceByType(thirdAudioTmp.type);
            setAudioDeviceByType(thirdAudioTmp.type);
          } else {
            setThirdAudioDevice(null);
            setAudioDeviceByType("Earpiece");
          }
          setAudioDeviceTypeList(playList);
        }
      } catch (err) {
        console.error('查找和初始化可使用设备失败', err);
      }
    }, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  const setAudioDeviceByType = async type => {
    await _Core.default.setAudioDeviceByType(type);
    let res = await _Core.default.getCurrentAudioDevices();
    const {
      defaultInput,
      defaultOutput
    } = res;
    setCurrentInputDevice(defaultInput);
    setCurrentOutputDevice(defaultOutput);
  };

  // useEffect(() => {
  //     const boot = async () => {
  //         let list = await Core.getAudioDevices();
  //         setAudioDeviceList(list);
  //     }
  //     boot();
  // }, []);

  // useEffect(() => {
  //     Core.on('audioDevicesListUpdated', (list) => {
  //         console.warn('list改变了!!!', list);
  //         setAudioDeviceList(list);
  //     });
  // }, []);

  return {
    audioDeviceList,
    thirdAudioDevice,
    audioDeviceTypeList,
    currentInputDevice,
    currentOutputDevice,
    setAudioDeviceByType
  };
}
function useSIPClient(id) {
  const ua = useTargetAgent(id);
  const [activeSession, setActiveSession] = (0, _react.useState)(null);
  const [sessions, setSessions] = (0, _react.useState)([]);
  // const [isIncoming, setIsIncoming] = useState(false);
  //const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFailed] = (0, _react.useState)(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = (0, _react.useState)(false);
  const [isCallSpeakerEnabled, setIsCallSpeakerEnabled] = (0, _react.useState)(false);
  const [isVideoMuted, setIsVideoMuted] = (0, _react.useState)(false);
  const [isAudioMuted, setIsAudioMuted] = (0, _react.useState)(false);
  const [isOnHold, setIsOnHold] = (0, _react.useState)({});
  const [cause, setCause] = (0, _react.useState)('');
  const {
    requestAll
  } = useSIPPermission();
  (0, _react.useEffect)(() => {
    async function sessionFunc(e) {
      let session = new _Session.default(e);
      //if (!activeSession) {
      setActiveSession(session);
      //}
      setSessions(prevSessions => {
        return [...prevSessions, session];
      });
      /*let speaker = await session.isSpeakerEnabled();
      setIsSpeakerEnabled(speaker);*/
      let isSpeaker = await _Core.default.isCoreSpeakerEnabled();
      setIsSpeakerEnabled(isSpeaker);
      setIsCallSpeakerEnabled(await _Core.default.isCallSpeakerEnabled(session.callId));
      const mutedInfo = await session.isMuted();
      setIsAudioMuted(mutedInfo.audio);
      setIsVideoMuted(mutedInfo.video);
      let onHoldResult = await session.isOnHold();
      setIsOnHold(onHoldResult);
      /*if (session.originator == 'remote') {
          setIsIncoming(true);
      }*/

      /*session.once(LINPHONE_EVENT.Released, (event: any) => {
          console.warn('Session释放了:', event);
          //setIsIncoming(false);
          setIsConfirmed(false);
          // setActiveSession(null);
          let filteredSessions = sessions.filter(item => item.callId != session.callId)
          console.warn(filteredSessions);
          setSessions(filteredSessions);
          if (filteredSessions[0]) {
              setActiveSession(filteredSessions[0]);
          } else {
              setActiveSession(null);
          }
      });*/
    }

    _Core.default.on('newRTCSession', sessionFunc);
    return () => {
      _Core.default.off('newRTCSession', sessionFunc);
    };
  }, [sessions, activeSession]);
  (0, _react.useEffect)(() => {
    const handleSession = async event => {
      const {
        eventName,
        callId
      } = event;
      console.debug('这里的Event:', eventName, 'callId:', callId);
      if (eventName == 'OutgoingProgress') {
        setSessions(prevSessions => [...prevSessions]);
      }
      if (eventName == 'Connected') {
        setSessions(prevSessions => [...prevSessions]);
      }
      if (eventName == 'Error') {
        setSessions(prevSessions => [...prevSessions]);
      }
      if (eventName == 'Paused' || eventName == 'PausedByRemote' || eventName == 'Resuming') {
        setSessions(prevSessions => [...prevSessions]);
      }
      if (eventName == 'OutgoingRinging') {
        setSessions(prevSessions => [...prevSessions]);
      }
      if (eventName == 'StreamsRunning') {
        setSessions(prevSessions => [...prevSessions]);
      }
      if (eventName == 'End') {}
      if (eventName == 'Released') {
        let filteredSessions = sessions.filter(item => item.callId != callId);
        setSessions(filteredSessions);
        if (filteredSessions[0]) {
          let {
            local /*, remote*/
          } = await filteredSessions[0].isOnHold();
          if (local) {
            filteredSessions[0].toggleHold();
          }
          setActiveSession(filteredSessions[0]);
        } else {
          setActiveSession(null);
        }
      }
    };
    _Core.default.on('callStateChanged', handleSession);
    return () => {
      _Core.default.off('callStateChanged', handleSession);
    };
  }, [sessions]);
  const previewVideoViewRef = (0, _react.useRef)(null);
  const remoteVideoViewRef = (0, _react.useRef)(null);
  async function call(targetUser, callOptions) {
    const {
      needAudio,
      needVideo,
      recordFilePath,
      permissionCallback
    } = callOptions;
    requestAll(permissionCallback);
    var options = {
      'mediaConstraints': {
        'audio': needAudio,
        'video': needVideo
      },
      previewVideoViewId: (0, _reactNative.findNodeHandle)(previewVideoViewRef.current),
      remoteVideoViewId: (0, _reactNative.findNodeHandle)(remoteVideoViewRef.current),
      recordFilePath
    };
    return ua && ua.call(`sip:${targetUser}@${ua.domain}`, options);
  }
  async function terminate(session) {
    try {
      await session.terminate();
      setSessions(prevSessions => prevSessions.filter(item => item.callId != session.callId));
    } catch (err) {
      console.error(err);
      setCause("挂断失败" + JSON.stringify(err));
    }
  }
  async function answer(session, options) {
    try {
      if (!session) {
        console.warn('answer必须传入一个session');
        return;
      }
      requestAll(options.permissionCallback);
      await session.answer({
        //eventHandlers,
        mediaConstraints: {
          audio: true,
          video: false //TODO: 硬编码false，改为让原生判断，以后要让用户自行决定
        },

        previewVideoViewId: (0, _reactNative.findNodeHandle)(previewVideoViewRef.current),
        remoteVideoViewId: (0, _reactNative.findNodeHandle)(remoteVideoViewRef.current),
        recordFilePath: options.recordFilePath
      });
    } catch (err) {
      console.error("接通电话失败", err);
      setCause("接通电话失败" + JSON.stringify(err));
    }
  }
  async function answerAndHold(session, options) {
    try {
      let otherSessions = sessions.filter(item => item.callId != session.callId);
      for (let item of otherSessions) {
        let {
          local /*, remote*/
        } = await item.isOnHold();
        if (!local) {
          item.toggleHold();
        }
      }
      await answer(session, options);
      setSessions(prevSessions => [...prevSessions]);
    } catch (err) {
      console.error('接听并且保持失败', err);
      setCause("接听并且保持失败" + JSON.stringify(err));
    }
  }
  async function answerAndTerminate(session, options) {
    try {
      let otherSessions = sessions.filter(item => item.callId != session.callId);
      otherSessions.map(item => {
        terminate(item);
      });
      answer(session, options);
    } catch (err) {
      console.error('接听并且挂断失败.', err);
      setCause("接听并且挂断失败" + JSON.stringify(err));
    }
  }
  async function transfer(session, transferNumber) {
    try {
      session.transferTo(transferNumber);
    } catch (err) {
      console.error('盲转失败.', err);
      setCause("盲转失败..." + JSON.stringify(err));
    }
  }

  /*async function toggleSpeaker_DESCREAPTED() {
      if (activeSession) {
          let isSpeaker = await activeSession.toggleSpeaker();
          setIsSpeakerEnabled(isSpeaker);
      }
  }*/

  async function toggleSpeaker() {
    let isSpeaker = await _Core.default.toggleCoreSpeaker();
    setIsSpeakerEnabled(isSpeaker);
  }
  async function toggleCallSpeaker(callId) {
    let isSpeaker = await _Core.default.toggleCallSpeaker(callId);
    setIsCallSpeakerEnabled(isSpeaker);
  }
  async function toggleMute(type) {
    if (activeSession) {
      let mutedInfo = await activeSession.toggleMute(type);
      setIsAudioMuted(mutedInfo.audio);
      setIsVideoMuted(mutedInfo.video);
    }
  }
  async function toggleCamera() {
    if (activeSession) {
      await activeSession.toggleCamera();
    }
  }
  async function toggleHold() {
    try {
      if (activeSession) {
        let paused = await activeSession.toggleHold();
        setIsOnHold({
          ...isOnHold,
          local: paused
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  async function sendDTMF(numStr, session) {
    try {
      session.sendDTMF(numStr);
    } catch (err) {
      console.error(err);
    }
  }
  const toggleRecord = async (session, recordFilePath) => {
    try {
      if (session.isRecording) {
        await session.stopRecording();
      } else {
        await session.startRecording(recordFilePath);
      }
      setSessions([...sessions]);
      // setActiveSession(session);
    } catch (err) {
      console.error(err);
    }
  };

  /*setInterval(async () => {
      if(activeSession) {
          let res = await activeSession.isOnHold();
          console.warn('res:', res);
      }
  }, 5000);*/

  return {
    call,
    terminate,
    answer,
    transfer,
    sendDTMF,
    answerAndTerminate,
    answerAndHold,
    activeSession,
    sessions,
    //TODO 思考isFailed的使用逻辑
    isFailed,
    cause,
    previewVideoViewRef,
    remoteVideoViewRef,
    isSpeakerEnabled,
    isCallSpeakerEnabled,
    toggleSpeaker,
    toggleCallSpeaker,
    isAudioMuted,
    isVideoMuted,
    toggleMute,
    toggleCamera,
    toggleHold,
    isOnHold,
    getCallLogs: ua === null || ua === void 0 ? void 0 : ua.getCallLogs,
    toggleRecord
  };
}
function chatRoomsReducer(chatRooms, action) {
  switch (action.type) {
    case 'init':
      return action.value;
    case 'refresh':
      break;
    case 'onMessage':
      return action.value;
    default:
      return [];
  }
  console.error('不存在的 action 类型', action);
  return chatRooms;
}
function useUnreadCountInfo(agent) {
  const [unreadCountInfo, setUnreadCountInfo] = (0, _react.useState)({
    accounts: [],
    messageCount: 0,
    missedCallsCount: 0
  });
  const [currentAgentCountInfo, setCurrentAgentCountInfo] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    const init = async () => {
      const info = await _Core.default.getUnreadCount();
      setUnreadCountInfo(info);
    };
    init();
    const handleMessageReceived = () => {
      init();
    };
    _Core.default.on('messageReceived', handleMessageReceived);
    return () => {
      _Core.default.off('messageReceived', handleMessageReceived);
    };
  }, []);
  (0, _react.useEffect)(() => {
    // if(!agent) {
    //     console.error("未传入 agent，无法调用该方法")
    //     return null
    // }

    // return null
    if (!agent) {
      setCurrentAgentCountInfo(undefined);
    }
    for (let item of unreadCountInfo.accounts) {
      if (item.id == agent.id) {
        setCurrentAgentCountInfo(item);
      }
    }
  }, [unreadCountInfo, agent]);
  return {
    unreadCountInfo,
    currentAgentCountInfo
  };
}
function useChat() {
  const {
    chatRooms,
    chatRoomDispatch
  } = (0, _react.useContext)(SipContext);
  let init = async () => {
    chatRoomDispatch && chatRoomDispatch({
      type: 'init',
      value: await _Message.default.getChatRooms()
    });
  };
  (0, _react.useEffect)(() => {
    init();
  }, []);
  async function createChat(options) {
    let res = await _Message.default.createChatRoom(options);
    init();
    return res;
  }
  async function deleteChat(options) {
    let res = await _Message.default.deleteChatRoom(options);
    init();
    return res;
  }
  return {
    chatRooms,
    createChat,
    deleteChat,
    reload: init
  };
}
function useChatRoom(chatRoom) {
  const [messages, setMessages] = (0, _react.useState)([]);
  (0, _react.useEffect)(() => {
    const init = async () => {
      let list = await _Message.default.getChatRoomHistory(chatRoom);
      list.reverse();
      setMessages(list);
    };
    init();
  }, []);
  (0, _react.useEffect)(() => {
    const handleMessageSent = event => {
      setMessages(previousMessages => {
        return [event.message, ...previousMessages];
      });
    };
    _Core.default.on('onMessageSent', handleMessageSent);
    return () => {
      _Core.default.off('onMessageSent', handleMessageSent);
    };
  }, []);
  (0, _react.useEffect)(() => {
    const handleMessageReceived = event => {
      if (chatRoom.localAddress == event.chatRoom.localAddress && chatRoom.peerAddress == event.chatRoom.peerAddress) {
        setMessages(previousMessages => {
          return [event.message, ...previousMessages];
        });
      }
    };
    _Core.default.on('messageReceived', handleMessageReceived);
    return () => {
      _Core.default.off('messageReceived', handleMessageReceived);
    };
  }, []);
  (0, _react.useEffect)(() => {
    const handleMessageStateChange = event => {
      setMessages(previousMessages => {
        let newMessages = previousMessages.map(item => {
          if (item.messageId == event.messageId) {
            item.state = event.state;
            return item;
          } else {
            return item;
          }
        });
        return newMessages;
      });
    };
    _Core.default.on('onMessageStateChange', handleMessageStateChange);
    return () => {
      _Core.default.off('onMessageStateChange', handleMessageStateChange);
    };
  }, []);
  async function sendMessage(message) {
    let res = await _Message.default.sendMessage(chatRoom, message);
    return res;
  }
  async function markAsRead() {
    let res = await _Message.default.markAsRead(chatRoom);
    return res;
  }
  return {
    messages,
    sendMessage,
    markAsRead
  };
}

/**
 * 
 * const { isRegister, onSession } = useUserAgent('5774545');
 * 
 * if(isRegister) {
 *     showOline();
 * }
 * 
 * onSession((event) => {
 *     
 * });
 * 
 * 
 */
//# sourceMappingURL=Hooks.js.map