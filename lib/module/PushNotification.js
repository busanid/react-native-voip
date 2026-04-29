import { Platform } from 'react-native';
/**
 * Build the SIP contact params string required by Linphone to route
 * push notifications to your device.
 *
 * The resulting string is set on `Configuration.contactParams` before
 * registering an account.
 *
 * Format: `pn-provider=<provider>;pn-param=<param>;pn-prid=<prid>`
 *
 * @example
 * const params = buildPushContactParams({
 *   provider: 'fcm',       // Android
 *   param: 'my-sender-id',
 *   prid: firebaseToken,
 * });
 * // => "pn-provider=fcm;pn-param=my-sender-id;pn-prid=<token>"
 */
export function buildPushContactParams(config) {
  return `pn-provider=${config.provider};pn-param=${config.param};pn-prid=${config.prid}`;
}

/**
 * Returns the default push provider for the current platform.
 * - iOS  → 'apns.voip' (CallKit / PushKit)
 * - Android → 'fcm'
 */
export function getDefaultPushProvider() {
  return Platform.OS === 'ios' ? 'apns.voip' : 'fcm';
}

/**
 * Parse a contact params string back into its constituent parts.
 * Returns null if the string is missing required push fields.
 */
export function parsePushContactParams(contactParams) {
  const providerMatch = contactParams.match(/pn-provider=([^;]+)/);
  const paramMatch = contactParams.match(/pn-param=([^;]+)/);
  const pridMatch = contactParams.match(/pn-prid=([^;]+)/);
  if (!providerMatch || !paramMatch || !pridMatch) return null;
  return {
    provider: providerMatch[1],
    param: paramMatch[1],
    prid: pridMatch[1]
  };
}

/**
 * Check whether a contact params string contains valid push notification fields.
 */
export function hasPushParams(contactParams) {
  return parsePushContactParams(contactParams) !== null;
}
//# sourceMappingURL=PushNotification.js.map