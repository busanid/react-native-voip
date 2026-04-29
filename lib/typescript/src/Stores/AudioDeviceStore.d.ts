interface AudioDeviceStore {
    thirdAudioDevice: [] | null;
    audioDeviceTypeList: any[] | null;
    audioDeviceList: [] | null;
    currentInputDevice: object | null;
    currentOutputDevice: object | null;
    actions: {
        fetchAudioDevices: Function;
        setAudioDeviceByType: Function;
    };
}
export declare const useAudioDeviceStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AudioDeviceStore>>;
export declare const useAudioDeviceStoreActions: () => {
    fetchAudioDevices: Function;
    setAudioDeviceByType: Function;
};
export {};
//# sourceMappingURL=AudioDeviceStore.d.ts.map