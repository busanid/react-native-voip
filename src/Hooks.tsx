import React, { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer, useRef, useState, useCallback } from 'react';
import { findNodeHandle, Platform, AppState } from 'react-native';
import { UserAgent, Configuration as sipConfig } from './index';
import { buildPushContactParams, parsePushContactParams } from './PushNotification';
import { useCallScreening } from './CallScreening';
export { useCallScreening };
import Session from './Session';
import type { Target, isOnHoldResult } from './Session';
import { check, PERMISSIONS, RESULTS, openSettings, PermissionStatus, request } from 'react-native-permissions';
import Permissions from './Permissions';
import Core from './Core';
import { useMMKVBoolean, useMMKVNumber, useMMKVString } from 'react-native-mmkv';
import type { AudioDeviceType } from './Core';
import { useAudioDeviceStore, useAudioDeviceStoreActions } from './Stores/AudioDeviceStore';
import Message, { ChatRoom, IChatInfoEvent, IMessage, IMessageReceivedEvent, IMessageStateChangeEvent } from './Message';
const isEqual = require("react-fast-compare");
/*import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider'
import database from '../src/model';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import { RealmProvider } from './realm';*/

export interface SipContextType {
    agents: UserAgent[],
    chatRooms: ChatRoom[]
    chatRoomDispatch?: Function
    callLogs: any[]
}
export const SipContext = createContext<SipContextType>({ agents: [], chatRooms: [], callLogs: [] });

export interface SipDispatchType {
    type: string,
    sipConfig?: sipConfig,
    username?: string,
    userAgent?: UserAgent
}
export const SipDispatchContext = createContext<Dispatch<SipDispatchType> | null>(null);

export type SipProviderConfiguration = {
    children: ReactNode,
    sipConfigs: sipConfig[]
}

export function SipProvider({ children, sipConfigs }: SipProviderConfiguration) {

    //const [agents, setAgents] = useState<UserAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [callLogs, setCallLogs] = useState([]);
    const { boot } = useSipSetting();
    const [chatRooms, chatRoomDispatch] = useReducer(
        chatRoomsReducer,
        []
    )
    const [agents, dispatch] = useReducer(
        agentsReducer,
        []
    );

    useEffect(() => {
        const bootCore = async () => {
            await Core.init();
            await Core.start();
            boot();

            initChatRoom();
        }

        bootCore();

        return () => {
            Core.stop();
        }
    }, []);

    const initChatRoom = async () => {
        let list = await Message.getChatRooms();
        chatRoomDispatch({
            type: 'init',
            value: list
        });
    }

    useEffect(() => {
        let handleMessage = async (_event: any) => {
            chatRoomDispatch({
                type: 'onMessage',
                value: await Message.getChatRooms()
            })
        }
        Core.on('messageReceived', handleMessage)

        let handleChatRoomRead = async (_event: any) => {
            chatRoomDispatch({
                type: 'onMessage',
                value: await Message.getChatRooms()
            })
        }

        Core.on('onChatRoomRead', handleChatRoomRead)

        return () => {
            Core.off('messageReceived', handleMessage)
            Core.off('onChatRoomRead', handleChatRoomRead)
        }
    }, []);

    function addUA(sipConfig: sipConfig) {
        const userAgent = new UserAgent(sipConfig);
        return userAgent;
    }

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState == 'active') {
                Permissions.enterForeground();
            } else {
                Permissions.enterBackground();
            }
        })

        return () => {
            subscription.remove();
        }
    }, []);

    useEffect(() => {
        const getAndSetLogs = async () => {
            setTimeout(() => {
                Core.getCallLogs().then((data) => {
                    setCallLogs(data);
                });
            }, 500);
        }

        getAndSetLogs();

        Core.on('callLogUpdated', getAndSetLogs);

        return () => {
            Core.off('callLogUpdated', getAndSetLogs)
        }
    }, []);

    useEffect(() => {

        dispatch({
            type: 'init',
            sipConfigs
        })

        setLoading(false);

        return () => {
            agents.map(async (agent: { stop: () => any; }) => {
                await agent.stop();
            });
            dispatch({ type: 'clear' });
        }
    }, [sipConfigs]);

    useEffect(() => {
        function registerFunc(e: any) {
            dispatch({
                type: 'registered',
                userAgentId: e.id
            })
        }
        Core.on('registered', registerFunc);

        function unregisteredFunc(e: any) {
            dispatch({
                type: 'unRegistered',
                userAgentId: e.id
            })
        }
        Core.on('unregistered', unregisteredFunc);

        function registrationFailedFunc(e: any) {
            dispatch({
                type: 'registrationFailed',
                userAgentId: e.id,
                errorMessage: e.message
            })
        }
        Core.on('registrationFailed', registrationFailedFunc);

        function registrationProgressFunc(e: any) {
            dispatch({
                type: 'registrationProgress',
                userAgentId: e.id
            })
        }
        Core.on('registrationProgress', registrationProgressFunc);

        return () => {
            Core.removeListener('registered', registerFunc);
            Core.removeListener('unregistered', unregisteredFunc);
            Core.removeListener('registrationFailed', registrationFailedFunc);
            Core.removeListener('registrationProgress', registrationProgressFunc);
        }
    }, [])

    function createAgents(agents: UserAgent[]) {
        if (agents.length == 0) {
            return [];
        }
        let hasDefault = false;
        let result = agents.map(agent => {
            if (agent.isDefault) {
                hasDefault = true
            }
            return agent
        });
        if (hasDefault) {
            return result
        } else {
            result[0]?.setIsDefault(true);
            return result;
        }
    }

    function agentsReducer(agents: any, action: any) {
        switch (action.type) {
            case 'init': {
                const { sipConfigs } = action;
                const result = sipConfigs.map((config: any) => {
                    return addUA(config);
                })
                return createAgents(result);
            }
            case 'add': {
                return [...agents, addUA(action.sipConfig)];
            }
            case 'update': {
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
                const { sipConfig } = action;
                const arr = agents.map((item: UserAgent) => {
                    if (item.id == sipConfig.id) {
                        item.unregister();
                        item.remove();

                        return addUA(sipConfig);
                    }
                    return item;
                });
                return createAgents(arr);
            }
            case 'remove': {
                const { userAgent } = action;
                const filtered = agents.filter((item: UserAgent) => {
                    //TODO: 这里使用username来移除会有同名不同域问题
                    if (item.id == userAgent.id) {
                        item.unregister();
                        item.remove();
                    }
                    return item.id != userAgent.id
                });
                return createAgents(filtered);
            }
            case 'setCurrent': {
                return agents.map((item: UserAgent) => {
                    if (item == action.userAgent) {
                        item.setIsDefault(true);
                    } else {
                        item.setIsDefault(false);
                    }
                    return item
                })
            }
            case 'registered': {
                return agents.map((item: UserAgent) => {
                    if (item.id == action.userAgentId) {
                        item.isRegistered = true;
                        item.isProgress = false;
                        item.error = '';
                    }
                    return item;
                })
            }
            case 'unRegistered': {
                return agents.map((item: UserAgent) => {
                    if (item.id == action.userAgentId) {
                        item.isRegistered = false;
                        item.isProgress = false;
                    }
                    return item;
                })
            }
            case 'registrationProgress': {
                return agents.map((item: UserAgent) => {
                    if (item.id == action.userAgentId) {
                        item.isProgress = true
                        item.error = '';
                    }
                    return item;
                })
            }
            case 'registrationFailed': {
                return agents.map((item: UserAgent) => {
                    if (item.id == action.userAgentId) {
                        item.error = action.errorMessage;
                        item.isProgress = false;
                        item.isRegistered = false;
                    }
                    return item;
                })
            }
            case 'clear': {
                return []
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
            default: {
                throw Error('Unknown action: ' + action.type);
            }
        }
    }

    /**
     * <DatabaseProvider database={database}>
     *  </DatabaseProvider >
     */

    return (
        <>
            {!loading && <SipContext.Provider value={{ agents, callLogs, chatRooms, chatRoomDispatch }}>
                <SipDispatchContext.Provider value={dispatch}>
                    {children}
                </SipDispatchContext.Provider>
            </SipContext.Provider>}
        </>
    );
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



export function useSipCore() {
    const { callLogs } = useContext(SipContext);

    return { callLogs, clearCallLogs: Core.clearCallLogs, removeCallLog: Core.removeCallLog };
}

export function useSipAccount() {
    const { agents } = useContext(SipContext);
    const dispatch = useContext(SipDispatchContext);

    function _checkSipConfig(sipConfig: sipConfig) {
        let { username, domain } = sipConfig;
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

    function add(sipConfig: sipConfig) {
        _checkSipConfig(sipConfig);
        dispatch && dispatch({
            type: 'add',
            sipConfig
        });
    }

    function update(sipConfig: sipConfig) {
        _checkSipConfig(sipConfig);
        dispatch && dispatch({
            type: 'update',
            sipConfig
        })
    }

    function remove(userAgent: UserAgent) {
        dispatch && dispatch({
            type: 'remove',
            userAgent
        })
    }

    function setCurrent(userAgent: UserAgent) {
        dispatch && dispatch({
            type: 'setCurrent',
            userAgent
        })
        //return Core.setDefaultAccount(userAgent);
    }

    function registerAll() {
        agents.map(agent => {
            return agent.register();
        })
    }

    function unRegisterAll() {
        agents.map(agent => {
            return agent.unregister();
        })
    }

    return { agents, activeAgent: agents.find(item => item.isDefault), add, remove, setCurrent, update, registerAll, unRegisterAll }
}

export function useTargetAgent(id: string) {
    const { agents } = useContext(SipContext);
    const index = agents.findIndex(item => item.id == id);
    //console.debug('agents:', agents, 'index:', index, 'username:', username);
    if (index == -1) {
        console.error('不存在的username,无法获得anget对象');
        throw new Error('不存在的username,无法使用useSIPClient');
    }
    return agents[index];
}

export type useSIPClientStatusOptions = {
    onRegistered: Function | null
}

export function useSIPClientStatus(id: string) {
    if (!id) return {};
    const userAgent = useTargetAgent(id);
    if (!userAgent) return;

    async function register() {
        return await userAgent?.register();
    }

    async function unRegister() {
        return await userAgent?.unregister();
    }

    async function stop() {
        return await userAgent?.stop();
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

export function useSipSetting() {
    const [_isEchoCancellationEnabled, _setIsEchoCancellationEnabled] = useMMKVBoolean("linphone.isEchoCancellationEnabled");
    const [_isAdaptiveRateControlEnabled, _setIsAdaptiveRateControlEnabled] = useMMKVBoolean('linphone.isAdaptiveRateControlEnabled');
    const [_dtmfSendType, _setDtmfSendType] = useMMKVString("linphone.dtmfSendType");
    const [playbackDb, _setPlaybackDb] = useMMKVNumber("linphone.playbackDb")
    const dtmfSendTypes = ["带内", "RFC2833", "Sip Info"];

    const boot = async () => {
        if (typeof _isEchoCancellationEnabled == 'undefined') {
            let defaultValue = await Core.isEchoCancellationEnabled();
            await Core.setEchoCancellationEnabled(defaultValue);
            setIsEchoCancellationEnabled(defaultValue);
        } else {
            await Core.setEchoCancellationEnabled(_isEchoCancellationEnabled);
        }

        if (typeof _isAdaptiveRateControlEnabled == 'undefined') {
            let defaultValue = await Core.isAdaptiveRateControlEnabled();
            await Core.setAdaptiveRateControlEnabled(defaultValue);
            setIsAdaptiveRateControlEnabled(defaultValue);
        } else {
            await Core.setAdaptiveRateControlEnabled(_isAdaptiveRateControlEnabled);
        }

        if (!_dtmfSendType) {
            _setDtmfSendType("RFC2833");
            setDtmfType("RFC2833");
        } else {
            setDtmfType(_dtmfSendType);
        }

        const currentPlayback = await Core.getPlaybackGainDb();
        _setPlaybackDb(currentPlayback);
    }

    const setIsEchoCancellationEnabled = (isEnabled: boolean) => {
        Core.setEchoCancellationEnabled(isEnabled);
        _setIsEchoCancellationEnabled(isEnabled);
    }

    const setIsAdaptiveRateControlEnabled = (isEnabled: boolean) => {
        Core.setAdaptiveRateControlEnabled(isEnabled);
        _setIsAdaptiveRateControlEnabled(isEnabled);
    }

    const setPlaybackDb = async (val: number) => {
        await Core.setPlaybackGainDb(val)
        _setPlaybackDb(val)
    }

    const setDtmfType = (dtmfType: string) => {
        // 检查 dtmfType 是否合法
        if (dtmfSendTypes.includes(dtmfType)) {
            if (dtmfType == "带内") {
                Core.setUseInfoForDtmf(false);
                Core.setUseRfc2833ForDtmf(false);
            }
            if (dtmfType == "RFC2833") {
                Core.setUseInfoForDtmf(false);
                Core.setUseRfc2833ForDtmf(true);
            }
            if (dtmfType == "Sip Info") {
                Core.setUseInfoForDtmf(true);
                Core.setUseRfc2833ForDtmf(false);
            }
            _setDtmfSendType(dtmfType);
        } else {
            console.error("不支持的 DTMF 发送类型");
        }
    }
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

type checkResult = {
    audioResult: string | null,
    videoResult: string | null
}

export function useSIPPermission() {
    const [checkAudioResult, setCheckAudioResult] = useState<PermissionStatus>();
    const [checkVideoResult, setCheckVideoResult] = useState<PermissionStatus>();
    const [checkOverlayResult, setCheckOverlayResult] = useState<PermissionStatus>();
    const [checkPhoneCallResult, setCheckPhoneCallResult] = useState<PermissionStatus>();
    // const [isIgnoringBatteryOptimizationsResult, setIsIgnoringBatteryOptimizationsResult] = useState(false);
    useEffect(() => {
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
        if (Platform.OS == "android") {
            let res = await check(PERMISSIONS.ANDROID.CALL_PHONE);
            setCheckPhoneCallResult(res);
        } else {
            console.debug("ios 尚未实现");
        }
    }

    async function requestPhoneCall() {
        if (Platform.OS == "android") {
            let res = await request(PERMISSIONS.ANDROID.CALL_PHONE);
            setCheckPhoneCallResult(res)
        } else {
            console.log("只有安卓支持该权限调用");
        }
    }

    async function checkOverlay() {
        if (Platform.OS == "android") {
            let result = await Permissions.checkOverlayPermission();
            setCheckOverlayResult(result ? 'granted' : 'denied')
        } else {
            console.log("只有安卓支持该权限调用");
        }
    }

    let permissions = Platform.select({
        ios: [PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.CAMERA],
        android: [PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.CAMERA]
    });

    async function checkAll() {
        let resultList: checkResult = {
            audioResult: null,
            videoResult: null
        }

        if (permissions) {
            for (let item of permissions) {
                let result = await check(item);
                if (item === PERMISSIONS.ANDROID.RECORD_AUDIO || item === PERMISSIONS.IOS.MICROPHONE) {
                    setCheckAudioResult(result);
                    resultList.audioResult = result;
                }
                if (item === PERMISSIONS.ANDROID.CAMERA || item === PERMISSIONS.IOS.CAMERA) {
                    setCheckVideoResult(result);
                    resultList.videoResult = result;
                }
            }

            return resultList;
        } else {
            console.error('使用权限失败, 尚未支持的设备平台...');
            return resultList
        }
    }

    function delay(ms: number | undefined) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    async function requestAll(callback?: Function) {
        if (permissions) {

            const { audioResult, videoResult } = await checkAll();

            if (audioResult == RESULTS.GRANTED && videoResult == RESULTS.GRANTED) {
                return;
            }

            //console.warn("checkAudioResult:", checkAudioResult, checkVideoResult);

            if (audioResult != RESULTS.GRANTED && permissions[0]) {
                /*await request(permissions[0], {
                    title: "需要麦克风功能",
                    message: "在通话过程中，我们需要麦克风权限，从而进行通话",
                    buttonPositive: "确定授权"
                });*/
                callback && callback("requestAudio");
                await delay(500);
                let res = await request(permissions[0], {
                    title: '麦克风权限请求',
                    message: '在拨打电话后，我们需要麦克风权限进行通话和录音',
                    buttonNeutral: '稍后询问',
                    buttonNegative: '拒绝',
                    buttonPositive: '允许',
                })
                callback && callback("requestAudioResult", res);
            }

            if (videoResult != RESULTS.GRANTED && permissions[1]) {
                callback && callback("requestVideo");
                await delay(500);
                let res = await request(permissions[1], {
                    title: "摄像头权限请求",
                    message: "在拨打视频电话时，我们需要摄像头权限进行视频通话",
                    buttonNeutral: '稍后询问',
                    buttonNegative: '拒绝',
                    buttonPositive: '允许',
                })
                callback && callback("requestVideoResult", res);
            }

            //await requestMultiple(permissions);
        } else {
            console.error('请求权限失败，尚未支持的设备平台...');
        }
    }

    async function openAndCheckOverlaySettings() {
        await Permissions.openOverlaySettings();
        return await checkOverlay()
    }

    return {
        checkAudioResult,
        checkVideoResult,
        checkPhoneCallResult,
        // isIgnoringBatteryOptimizationsResult,
        openSettings,
        checkOverlayResult,
        RESULTS,
        requestAll,
        requestPhoneCall,
        openAndCheckOverlaySettings,
        openPowerSettings: () => {
            Permissions.openPowerSettings();
        },
        openNotificationSettings: () => {
            Permissions.openNotificationSettings();
        }
    };
}

export function useAudioDevices() {
    const thirdAudioDevice = useAudioDeviceStore((state) => state.thirdAudioDevice);
    const audioDeviceTypeList = useAudioDeviceStore((state) => state.audioDeviceTypeList)
    const audioDeviceList = useAudioDeviceStore((state) => state.audioDeviceList);
    const currentInputDevice = useAudioDeviceStore((state) => state.currentInputDevice);
    const currentOutputDevice = useAudioDeviceStore((state) => state.currentOutputDevice);

    const { fetchAudioDevices, setAudioDeviceByType } = useAudioDeviceStoreActions();

    useEffect(() => {
        fetchAudioDevices();

        let intervalId = setInterval(async () => {
            fetchAudioDevices();
        }, 2000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    return {
        audioDeviceList,
        thirdAudioDevice,
        audioDeviceTypeList,
        currentInputDevice,
        currentOutputDevice,

        setAudioDeviceByType
    }
}

export function useAudioDevices_deprecated() {

    const [thirdAudioDevice, setThirdAudioDevice] = useState(null);
    const [audioDeviceTypeList, setAudioDeviceTypeList] = useState<any[]>([]);
    const [audioDeviceList, setAudioDeviceList] = useState([]);
    const [currentInputDevice, setCurrentInputDevice] = useState(null);
    const [currentOutputDevice, setCurrentOutputDevice] = useState(null);
    const lastListRef = useRef(null);

    useEffect(() => {
        let intervalId = setInterval(async () => {
            try {
                let list = await Core.getAudioDevices()
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

                    let isSpeakerEnabled = await Core.isCoreSpeakerEnabled();
                    if (thirdAudioTmp) {
                        if (isSpeakerEnabled) {
                            await Core.toggleCoreSpeaker();
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
        }
    }, []);

    const setAudioDeviceByType = async (type: AudioDeviceType) => {
        await Core.setAudioDeviceByType(type);
        let res = await Core.getCurrentAudioDevices();
        const { defaultInput, defaultOutput } = res;
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
    }
}

export function useSIPClient(id: string) {
    const ua = useTargetAgent(id);

    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    // const [isIncoming, setIsIncoming] = useState(false);
    //const [isConfirmed, setIsConfirmed] = useState(false);
    const [isFailed] = useState(false);
    const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
    const [isCallSpeakerEnabled, setIsCallSpeakerEnabled] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState<isOnHoldResult | null>({});
    const [cause, setCause] = useState('');

    const { requestAll } = useSIPPermission();

    useEffect(() => {
        async function sessionFunc(e: { session: Session; originator: any; }) {
            let session = new Session(e);
            //if (!activeSession) {
            setActiveSession(session);
            //}
            setSessions(prevSessions => {
                return [...prevSessions, session]
            });
            /*let speaker = await session.isSpeakerEnabled();
            setIsSpeakerEnabled(speaker);*/
            let isSpeaker = await Core.isCoreSpeakerEnabled();
            setIsSpeakerEnabled(isSpeaker);
            setIsCallSpeakerEnabled(await Core.isCallSpeakerEnabled(session.callId));
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

        Core.on('newRTCSession', sessionFunc);

        return () => {
            Core.off('newRTCSession', sessionFunc);
        }
    }, [sessions, activeSession]);

    useEffect(() => {
        const handleSession = async (event: any) => {
            const { eventName, callId } = event;

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

            if (eventName == 'End') {

            }

            if (eventName == 'Released') {
                let filteredSessions = sessions.filter(item => item.callId != callId)
                setSessions(filteredSessions);
                if (filteredSessions[0]) {
                    let { local/*, remote*/ } = await filteredSessions[0].isOnHold();
                    if (local) {
                        filteredSessions[0].toggleHold();
                    }
                    setActiveSession(filteredSessions[0]);
                } else {
                    setActiveSession(null);
                }
            }
        };
        Core.on('callStateChanged', handleSession)

        return () => {
            Core.off('callStateChanged', handleSession);
        }
    }, [sessions]);


    const previewVideoViewRef = useRef(null);
    const remoteVideoViewRef = useRef(null);
    async function call(targetUser: string, callOptions: any) {
        const { needAudio, needVideo, recordFilePath, permissionCallback } = callOptions;
        requestAll(permissionCallback);
        var options = {
            'mediaConstraints': { 'audio': needAudio, 'video': needVideo },
            previewVideoViewId: findNodeHandle(previewVideoViewRef.current),
            remoteVideoViewId: findNodeHandle(remoteVideoViewRef.current),
            recordFilePath
        };
        return ua && ua.call(`sip:${targetUser}@${ua.domain}`, options);
    }

    async function terminate(session: Session) {
        try {
            await session.terminate();
            setSessions(prevSessions => prevSessions.filter(item => item.callId != session.callId));
        } catch (err) {
            console.error(err);
            setCause("挂断失败" + JSON.stringify(err))
        }
    }

    async function answer(session: Session, options: any) {
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
                previewVideoViewId: findNodeHandle(previewVideoViewRef.current),
                remoteVideoViewId: findNodeHandle(remoteVideoViewRef.current),
                recordFilePath: options.recordFilePath
            })
        } catch (err) {
            console.error("接通电话失败", err);
            setCause("接通电话失败" + JSON.stringify(err))
        }
    }

    async function answerAndHold(session: Session, options: any) {
        try {
            let otherSessions = sessions.filter(item => item.callId != session.callId);
            for (let item of otherSessions) {
                let { local/*, remote*/ } = await item.isOnHold();
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

    async function answerAndTerminate(session: Session, options: any) {
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

    async function transfer(session: Session, transferNumber: String) {
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
        let isSpeaker = await Core.toggleCoreSpeaker();
        setIsSpeakerEnabled(isSpeaker);
    }

    async function toggleCallSpeaker(callId: String) {
        let isSpeaker = await Core.toggleCallSpeaker(callId);
        setIsCallSpeakerEnabled(isSpeaker);
    }

    async function toggleMute(type: Target) {
        if (activeSession) {
            let mutedInfo = await activeSession.toggleMute(type);
            setIsAudioMuted(mutedInfo.audio);
            setIsVideoMuted(mutedInfo.video)
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

    async function sendDTMF(numStr: String, session: Session) {
        try {
            session.sendDTMF(numStr)
        } catch (err) {
            console.error(err);
        }
    }

    const toggleRecord = async (session: Session, recordFilePath: String) => {
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
    }

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
        getCallLogs: ua?.getCallLogs,
        toggleRecord
    };
}

function chatRoomsReducer(chatRooms: ChatRoom[], action: any) {
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

export interface AccountUnreadCountItem {
    id: string
    messageCount: number
    missedCallsCount: number
}

export interface UnreadCountInfo {
    accounts: AccountUnreadCountItem[]
    messageCount: number
    missedCallsCount: number
}

export function useUnreadCountInfo(agent: UserAgent) {

    const [unreadCountInfo, setUnreadCountInfo] = useState<UnreadCountInfo>({
        accounts: [],
        messageCount: 0,
        missedCallsCount: 0
    });
    const [currentAgentCountInfo, setCurrentAgentCountInfo] = useState<AccountUnreadCountItem>()

    useEffect(() => {
        const init = async () => {
            const info = await Core.getUnreadCount();
            setUnreadCountInfo(info)
        }

        init();

        const handleMessageReceived = () => {
            init();
        }
        Core.on('messageReceived', handleMessageReceived);

        return () => {
            Core.off('messageReceived', handleMessageReceived);
        }
    }, []);

    useEffect(() => {
        // if(!agent) {
        //     console.error("未传入 agent，无法调用该方法")
        //     return null
        // }


        // return null
        if (!agent) {
            setCurrentAgentCountInfo(undefined)
        }

        for (let item of unreadCountInfo.accounts) {
            if (item.id == agent.id) {
                setCurrentAgentCountInfo(item)
            }
        }

    }, [unreadCountInfo, agent])

    return { unreadCountInfo, currentAgentCountInfo }
}

export function useChat() {

    const { chatRooms, chatRoomDispatch } = useContext(SipContext);

    let init = async () => {
        chatRoomDispatch && chatRoomDispatch({
            type: 'init',
            value: await Message.getChatRooms()
        })
    }

    useEffect(() => {
        init();
    }, [])

    async function createChat(options: { targetSipUri: string }) {
        let res = await Message.createChatRoom(options);
        init();
        return res;
    }

    async function deleteChat(options: { targetSipUri: string }) {
        let res = await Message.deleteChatRoom(options);
        init();
        return res;
    }

    return { chatRooms, createChat, deleteChat, reload: init }
}

export function useChatRoom(chatRoom: ChatRoom) {

    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {
        const init = async () => {
            let list = await Message.getChatRoomHistory(chatRoom);
            list.reverse();
            setMessages(list);
        }
        init();
    }, [])

    useEffect(() => {
        const handleMessageSent = (event: IChatInfoEvent) => {
            setMessages(previousMessages => {
                return [event.message, ...previousMessages]
            });
        }
        Core.on('onMessageSent', handleMessageSent)

        return () => {
            Core.off('onMessageSent', handleMessageSent)
        }
    }, []);

    useEffect(() => {
        const handleMessageReceived = (event: IMessageReceivedEvent) => {
            if (chatRoom.localAddress == event.chatRoom.localAddress && chatRoom.peerAddress == event.chatRoom.peerAddress) {
                setMessages(previousMessages => {
                    return [event.message, ...previousMessages]
                });
            }
        }
        Core.on('messageReceived', handleMessageReceived)

        return () => {
            Core.off('messageReceived', handleMessageReceived)
        }
    }, []);

    useEffect(() => {
        const handleMessageStateChange = (event: IMessageStateChangeEvent) => {
            setMessages(previousMessages => {
                let newMessages = previousMessages.map(item => {
                    if (item.messageId == event.messageId) {
                        item.state = event.state
                        return item
                    } else {
                        return item;
                    }
                })
                return newMessages
            });
        }
        Core.on('onMessageStateChange', handleMessageStateChange);

        return () => {
            Core.off('onMessageStateChange', handleMessageStateChange);
        }
    }, []);

    async function sendMessage(message: string) {
        let res = await Message.sendMessage(chatRoom, message);
        return res;
    }

    async function markAsRead() {
        let res = await Message.markAsRead(chatRoom);
        return res;
    }

    return { messages, sendMessage, markAsRead }
}

/**
 * Hook for push notification registration.
 *
 * Handles building the SIP contact params string and applying it to a
 * specific SIP account so the server can route incoming calls via push.
 *
 * @example
 * const { registerPushToken, clearPushToken, pushConfig } = usePushNotification('account1');
 *
 * // Call after receiving a FCM/APNs token
 * await registerPushToken({ provider: 'fcm', param: 'mySenderId', prid: fcmToken });
 */
export function usePushNotification(agentId: string) {
  const { agents } = useContext(SipContext);
  const agent = agents.find((a) => a.id === agentId);

  const [pushConfig, setPushConfig] = useState(() => {
    if (!agent) return null;
    return parsePushContactParams(agent.getConfiguration().contactParams ?? '');
  });

  const registerPushToken = useCallback(
    async (config: Parameters<typeof buildPushContactParams>[0]) => {
      if (!agent) {
        console.warn('usePushNotification: agent not found for id', agentId);
        return;
      }
      const contactParams = buildPushContactParams(config);
      await agent.setContactParameters(contactParams);
      setPushConfig(config);
    },
    [agent, agentId]
  );

  const clearPushToken = useCallback(async () => {
    if (!agent) return;
    await agent.setContactParameters('');
    setPushConfig(null);
  }, [agent]);

  return { pushConfig, registerPushToken, clearPushToken };
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