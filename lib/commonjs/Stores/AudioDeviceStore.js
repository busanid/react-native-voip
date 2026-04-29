"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAudioDeviceStoreActions = exports.useAudioDeviceStore = void 0;
var _zustand = require("zustand");
var _reactNativeLinphoneSdk = require("react-native-linphone-sdk");
const isEqual = require("react-fast-compare");
const useAudioDeviceStore = exports.useAudioDeviceStore = (0, _zustand.create)(set => {
  let lastList = null;
  const setAudioDeviceByType = async type => {
    await _reactNativeLinphoneSdk.Core.setAudioDeviceByType(type);
    let res = await _reactNativeLinphoneSdk.Core.getCurrentAudioDevices();
    const {
      defaultInput,
      defaultOutput
    } = res;
    set(() => ({
      currentInputDevice: defaultInput,
      currentOutputDevice: defaultOutput
    }));
  };
  const fetchAudioDevices = async () => {
    try {
      let list = await _reactNativeLinphoneSdk.Core.getAudioDevices();
      // console.log('list!!!!!!!!:', list);
      if (!isEqual(lastList, list)) {
        console.debug('找到新的设备', list);
        lastList = list;
        set(() => ({
          audioDeviceList: list
        }));
        // setAudioDeviceList(list);

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
        let isSpeakerEnabled = await _reactNativeLinphoneSdk.Core.isCoreSpeakerEnabled();
        if (thirdAudioTmp) {
          if (isSpeakerEnabled) {
            await _reactNativeLinphoneSdk.Core.toggleCoreSpeaker();
          }
          set(() => ({
            thirdAudioDevice: thirdAudioTmp
          }));
          setAudioDeviceByType(thirdAudioTmp.type);
        } else {
          set(() => ({
            thirdAudioDevice: null
          }));
          setAudioDeviceByType("Earpiece");
        }
        set(() => ({
          audioDeviceTypeList: playList
        }));
      }
    } catch (err) {
      console.error('查找和初始化可使用设备失败', err);
    }
  };
  return {
    thirdAudioDevice: null,
    audioDeviceTypeList: [],
    audioDeviceList: [],
    currentInputDevice: null,
    currentOutputDevice: null,
    actions: {
      fetchAudioDevices,
      setAudioDeviceByType
    }
  };
});
const useAudioDeviceStoreActions = () => useAudioDeviceStore(state => state.actions);
exports.useAudioDeviceStoreActions = useAudioDeviceStoreActions;
//# sourceMappingURL=AudioDeviceStore.js.map