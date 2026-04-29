export const __esModule: boolean;
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
export function buildPushContactParams(config: any): string;
/**
 * Returns the default push provider for the current platform.
 * - iOS  → 'apns.voip' (CallKit / PushKit)
 * - Android → 'fcm'
 */
export function getDefaultPushProvider(): "apns.voip" | "fcm";
/**
 * Check whether a contact params string contains valid push notification fields.
 */
export function hasPushParams(contactParams: any): boolean;
/**
 * Parse a contact params string back into its constituent parts.
 * Returns null if the string is missing required push fields.
 */
export function parsePushContactParams(contactParams: any): {
    provider: any;
    param: any;
    prid: any;
} | null;
//# sourceMappingURL=PushNotification.d.ts.map