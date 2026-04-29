import { useEffect, useRef, useState, useCallback } from 'react';
import Core from './Core';
import type { CallScreeningRule, CallScreeningAction } from './types';
import type Session from './Session';

export type { CallScreeningRule, CallScreeningAction };

/**
 * Match a caller URI or username against a screening rule pattern.
 * Supports exact match, username match, and '*' wildcard.
 */
function matchesPattern(remoteAddress: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (remoteAddress === pattern) return true;
  // Match against username portion: sip:username@domain
  const usernameMatch = remoteAddress.match(/sip:([^@]+)@/);
  if (usernameMatch && usernameMatch[1] === pattern) return true;
  return false;
}

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
export function useCallScreening(options?: {
  onScreened?: (session: Session, action: CallScreeningAction) => void;
}) {
  const [rules, setRules] = useState<CallScreeningRule[]>([]);
  const rulesRef = useRef<CallScreeningRule[]>([]);

  // Keep ref in sync so the listener always reads the latest rules
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  useEffect(() => {
    const handleNewSession = async (event: any) => {
      const session = event as Session & { remoteAddress: string };
      const remoteAddress: string = session.remoteAddress || '';

      for (const rule of rulesRef.current) {
        if (matchesPattern(remoteAddress, rule.pattern)) {
          if (rule.action === 'reject') {
            try {
              await (session as any).terminate?.();
            } catch {}
            options?.onScreened?.(session as unknown as Session, 'reject');
          } else if (rule.action === 'silence') {
            // Silence: emit event so UI can show a silent incoming call
            options?.onScreened?.(session as unknown as Session, 'silence');
          } else {
            // action === 'allow' — let it through
            options?.onScreened?.(session as unknown as Session, 'allow');
          }
          return;
        }
      }
    };

    Core.on('newRTCSession', handleNewSession);
    return () => {
      Core.off('newRTCSession', handleNewSession);
    };
  }, []);

  const addRule = useCallback((rule: CallScreeningRule) => {
    setRules((prev) => {
      if (prev.find((r) => r.id === rule.id)) {
        return prev.map((r) => (r.id === rule.id ? rule : r));
      }
      return [...prev, rule];
    });
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearRules = useCallback(() => {
    setRules([]);
  }, []);

  const updateRule = useCallback((id: string, patch: Partial<Omit<CallScreeningRule, 'id'>>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  return { rules, addRule, removeRule, clearRules, updateRule };
}
