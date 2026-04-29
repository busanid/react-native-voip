export const __esModule: boolean;
/**
 * React hook for call screening.
 *
 * Intercepts every incoming call before the app's UI reacts to it.
 * Rules are evaluated in order — first match wins.
 * If no rule matches, the call is allowed through.
 *
 * @example
 * const { addRule, removeRule } = useCallScreening({
 *   onScreened: (session, action) => {
 *     if (action === 'reject') {
 *       console.log('Auto-rejected:', session.remote_username);
 *     }
 *   }
 * });
 *
 * // Block a specific number
 * addRule({ id: '1', pattern: '12345', action: 'reject', label: 'Spam' });
 *
 * // Silence all anonymous callers
 * addRule({ id: '2', pattern: 'anonymous', action: 'silence' });
 */
export function useCallScreening(options: any): {
    rules: never[];
    addRule: (rule: any) => void;
    removeRule: (id: any) => void;
    clearRules: () => void;
    updateRule: (id: any, patch: any) => void;
};
//# sourceMappingURL=CallScreening.d.ts.map