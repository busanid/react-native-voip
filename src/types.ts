// ─── Call State ──────────────────────────────────────────────────────────────

export enum CallState {
  Idle = 'Idle',
  IncomingReceived = 'IncomingReceived',
  PushIncomingReceived = 'PushIncomingReceived',
  OutgoingInit = 'OutgoingInit',
  OutgoingProgress = 'OutgoingProgress',
  OutgoingRinging = 'OutgoingRinging',
  OutgoingEarlyMedia = 'OutgoingEarlyMedia',
  Connected = 'Connected',
  StreamsRunning = 'StreamsRunning',
  Pausing = 'Pausing',
  Paused = 'Paused',
  PausedByRemote = 'PausedByRemote',
  Resuming = 'Resuming',
  Referred = 'Referred',
  Error = 'Error',
  End = 'End',
  Released = 'Released',
  Updating = 'Updating',
  UpdatedByRemote = 'UpdatedByRemote',
  EarlyUpdating = 'EarlyUpdating',
  EarlyUpdatedByRemote = 'EarlyUpdatedByRemote',
}

// ─── Call Direction ───────────────────────────────────────────────────────────

export enum CallDirection {
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}

// ─── Call Status ──────────────────────────────────────────────────────────────

export enum CallStatus {
  Success = 'Success',
  Aborted = 'Aborted',
  Missed = 'Missed',
  Declined = 'Declined',
  EarlyAborted = 'EarlyAborted',
  AcceptedElsewhere = 'AcceptedElsewhere',
  DeclinedElsewhere = 'DeclinedElsewhere',
}

// ─── Registration State ───────────────────────────────────────────────────────

export enum RegistrationState {
  None = 'None',
  Progress = 'Progress',
  Ok = 'Ok',
  Cleared = 'Cleared',
  Failed = 'Failed',
  Refreshing = 'Refreshing',
}

// ─── Audio Device ─────────────────────────────────────────────────────────────

export type AudioDeviceKind =
  | 'Unknown'
  | 'Microphone'
  | 'Earpiece'
  | 'Speaker'
  | 'Bluetooth'
  | 'BluetoothA2DP'
  | 'Telephony'
  | 'AuxLine'
  | 'GenericUsb'
  | 'Headset'
  | 'Headphones'
  | 'HearingAid';

export type AudioDeviceCapabilities =
  | 'CapabilityAll'
  | 'CapabilityPlay'
  | 'CapabilityRecord';

export interface AudioDevice {
  id: string;
  deviceName: string;
  type: AudioDeviceKind;
  driverName: string;
  capabilities: AudioDeviceCapabilities;
}

export interface CurrentAudioDevices {
  input?: AudioDevice;
  defaultInput?: AudioDevice;
  output?: AudioDevice;
  defaultOutput?: AudioDevice;
}

// ─── Call Log ─────────────────────────────────────────────────────────────────

export interface CallLogEntry {
  callId: string;
  remoteAddress: string;
  localAddress: string;
  direction: CallDirection;
  duration: number;
  isVideo: boolean;
  status: CallStatus;
  toAddress: string;
  toAddressUsername: string;
  toAddressDisplayName: string;
  fromAddress: string;
  fromAddressUsername: string;
  fromAddressDisplayName: string;
  startDate: number;
}

export interface GroupedCallLog extends CallLogEntry {
  subLog?: CallLogEntry[];
}

// ─── SIP Configuration ───────────────────────────────────────────────────────

export type TransportType = 'UDP' | 'TCP' | 'TLS';

export interface SipConfiguration {
  id: string;
  username: string;
  password: string;
  domain: string;
  displayName: string;
  remark: string;
  isDefault: boolean;
  proxyDomain: string;
  transportType: TransportType;
  stunDomain: string;
  stunPort: string;
  stunEnabled: boolean;
  /** SIP contact URI params. Used for push notification: pn-provider;pn-param;pn-prid */
  contactParams: string;
}

// ─── Session / Call Events ────────────────────────────────────────────────────

export interface CallStateChangedEvent {
  callId: string;
  eventName: CallState;
  remoteAddress?: string;
  displayName?: string;
  remoteUsername?: string;
  localAddress?: string;
  originator?: 'local' | 'remote';
  callStatus?: CallStatus;
  data?: { cause?: string };
}

export interface NewRTCSessionEvent {
  callId: string;
  originator: 'local' | 'remote';
  remoteAddress: string;
  remoteDisplayName: string;
  remoteUsername: string;
  localAddress: string;
  localUserName: string;
  isVideo: boolean;
}

export interface RegisterStateChangedEvent {
  id: string;
  message: string;
  username: string;
  domain: string;
}

// ─── Media Constraints ────────────────────────────────────────────────────────

export interface MediaConstraints {
  audio: boolean;
  video: boolean;
}

export interface CallOptions {
  mediaConstraints: MediaConstraints;
  previewVideoViewId?: number | null;
  remoteVideoViewId?: number | null;
  recordFilePath?: string;
}

// ─── Push Notification ────────────────────────────────────────────────────────

export type PushProvider = 'apns' | 'apns.voip' | 'fcm';

export interface PushNotificationConfig {
  provider: PushProvider;
  /** iOS: bundle ID / Android: Firebase Sender ID */
  param: string;
  /** Device push token */
  prid: string;
}

// ─── Call Screening ───────────────────────────────────────────────────────────

export type CallScreeningAction = 'allow' | 'reject' | 'silence';

export interface CallScreeningRule {
  id: string;
  /** SIP username or full SIP URI to match. Supports '*' wildcard for all callers */
  pattern: string;
  action: CallScreeningAction;
  label?: string;
}

// ─── DTMF ─────────────────────────────────────────────────────────────────────

export type DtmfSendType = 'InBand' | 'RFC2833' | 'SipInfo';

// ─── Muted Info ───────────────────────────────────────────────────────────────

export interface MutedInfo {
  audio: boolean;
  video: boolean;
}

// ─── Hold State ───────────────────────────────────────────────────────────────

export interface HoldState {
  local: boolean;
  remote: boolean;
}
