# react-native-voip

A React Native VoIP SDK built on top of [Linphone SDK](https://www.linphone.org/), supporting SIP-based audio/video calls, chat messaging, multi-account management, and more — for both Android and iOS.

## Features

- SIP account registration / unregistration
- Outgoing & incoming audio calls
- Video calls with local preview and remote view
- Multi-account SIP support
- Chat / messaging
- Call logs
- Audio device management (speaker, earpiece, Bluetooth)
- DTMF support
- Call recording
- Hold / Resume
- Call transfer
- RSA encryption utilities
- Android permission helpers (microphone, camera, overlay, battery optimization)

## Installation

```sh
npm install react-native-voip
# or
yarn add react-native-voip
```

## Setup

### iOS

1. Add the Linphone podspec source to your `Podfile`:

```ruby
source "https://gitlab.linphone.org/BC/public/podspec.git"
source "https://github.com/CocoaPods/Specs.git"
```

2. Run:

```sh
cd ios && pod install
```

### Android

1. Add the Linphone Maven repository to `android/build.gradle`:

```gradle
allprojects {
    repositories {
        maven {
            name "linphone.org maven repository"
            url "https://linphone.org/maven_repository/"
            content {
                includeGroup "org.linphone"
            }
        }
    }
}
```

2. Add the following dependency to your app's `android/app/build.gradle`:

```gradle
implementation 'androidx.media:media:1.2.0'
```

3. Add the required permissions to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

## Usage

### Initialize SIP Provider

Wrap your app with `SipProvider` and configure your SIP accounts:

```tsx
import { SipProvider } from 'react-native-voip';

export default function App() {
  return (
    <SipProvider
      accounts={[
        {
          id: 'account1',
          username: 'sip_user',
          password: 'sip_password',
          domain: 'sip.yourserver.com',
          port: 5060,
        },
      ]}
    >
      <YourApp />
    </SipProvider>
  );
}
```

### Make a Call

```tsx
import { useSIPClient } from 'react-native-voip';

function Dialer() {
  const { call, terminate, answer, activeSession } = useSIPClient('account1');

  return (
    <>
      <Button title="Call" onPress={() => call('sip:target@yourserver.com')} />
      <Button title="Hang Up" onPress={() => terminate()} />
      {activeSession && (
        <Button title="Answer" onPress={() => answer()} />
      )}
    </>
  );
}
```

### Video Call

```tsx
import { useSIPClient, PreviewVideoView, RemoteVideoView } from 'react-native-voip';

function VideoCall() {
  const { call, previewVideoViewRef, remoteVideoViewRef } = useSIPClient('account1');

  return (
    <>
      <RemoteVideoView ref={remoteVideoViewRef} style={{ flex: 1 }} />
      <PreviewVideoView ref={previewVideoViewRef} style={{ width: 120, height: 160 }} />
      <Button title="Video Call" onPress={() => call('sip:target@yourserver.com', { mediaConstraints: { audio: true, video: true } })} />
    </>
  );
}
```

### Audio Devices

```tsx
import { useAudioDevices } from 'react-native-voip';

function AudioControl() {
  const { audioDeviceList, currentOutputDevice, setAudioDeviceByType } = useAudioDevices();

  return (
    <>
      {audioDeviceList.map(device => (
        <Button
          key={device.id}
          title={device.deviceName}
          onPress={() => setAudioDeviceByType(device.type)}
        />
      ))}
    </>
  );
}
```

### Chat / Messaging

```tsx
import { useChat, useChatRoom } from 'react-native-voip';

function ChatScreen() {
  const { chatRooms, createChatRoom } = useChat('account1');
  const { messages, sendMessage } = useChatRoom(chatRooms[0]);

  return (
    <>
      {messages.map(msg => <Text key={msg.id}>{msg.text}</Text>)}
      <Button title="Send" onPress={() => sendMessage('Hello!')} />
    </>
  );
}
```

### Permissions (Android)

```tsx
import { useSIPPermission } from 'react-native-voip';

function PermissionSetup() {
  const { requestMicrophonePermission, requestCameraPermission } = useSIPPermission();

  useEffect(() => {
    requestMicrophonePermission();
    requestCameraPermission();
  }, []);
}
```

## API Reference

### Hooks

| Hook | Description |
|------|-------------|
| `useSIPClient(id)` | Main hook for call control (call, answer, terminate, hold, mute, speaker, DTMF, record, transfer) |
| `useSipAccount()` | Manage SIP accounts (add, remove, update, register) |
| `useSIPClientStatus(id)` | Registration status of a specific account |
| `useAudioDevices()` | List and switch audio devices |
| `useChat(agentId)` | Chat room management |
| `useChatRoom(chatRoom)` | Messages in a specific chat room |
| `useSipCore()` | Access call logs |
| `useSipSetting()` | App-level settings (echo cancellation, DTMF type, playback gain) |
| `useSIPPermission()` | Android permission helpers |
| `useUnreadCountInfo(agent)` | Unread message and missed call counts |

### Components

| Component | Description |
|-----------|-------------|
| `SipProvider` | Context provider — wrap your app with this |
| `PreviewVideoView` | Local camera preview for video calls |
| `RemoteVideoView` | Remote participant video display |

## Dependencies

| Package | Purpose |
|---------|---------|
| `react-native-permissions` | Permission management |
| `react-native-get-random-values` | UUID generation |
| `uuid` | Unique ID generation |
| `zustand` | Audio device state management |

## Architecture

```
JavaScript / TypeScript
        │
   Hooks & Context (Hooks.tsx)
        │
   Core EventEmitter (Core.tsx)
        │
React Native Native Module Bridge
    ┌───┴───┐
 Android   iOS
 (Kotlin) (Swift)
    │         │
Linphone SDK 5.3.x
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
