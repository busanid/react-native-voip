"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useCallScreening = useCallScreening;
var _react = require("react");
var _Core = _interopRequireDefault(require("./Core"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Match a caller URI or username against a screening rule pattern.
 * Supports exact match, username match, and '*' wildcard.
 */
function matchesPattern(remoteAddress, pattern) {
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
function useCallScreening(options) {
  const [rules, setRules] = (0, _react.useState)([]);
  const rulesRef = (0, _react.useRef)([]);

  // Keep ref in sync so the listener always reads the latest rules
  (0, _react.useEffect)(() => {
    rulesRef.current = rules;
  }, [rules]);
  (0, _react.useEffect)(() => {
    const handleNewSession = async event => {
      const session = event;
      const remoteAddress = session.remoteAddress || '';
      for (const rule of rulesRef.current) {
        if (matchesPattern(remoteAddress, rule.pattern)) {
          if (rule.action === 'reject') {
            var _options$onScreened;
            try {
              var _terminate, _ref;
              await ((_terminate = (_ref = session).terminate) === null || _terminate === void 0 ? void 0 : _terminate.call(_ref));
            } catch {}
            options === null || options === void 0 || (_options$onScreened = options.onScreened) === null || _options$onScreened === void 0 || _options$onScreened.call(options, session, 'reject');
          } else if (rule.action === 'silence') {
            var _options$onScreened2;
            // Silence: emit event so UI can show a silent incoming call
            options === null || options === void 0 || (_options$onScreened2 = options.onScreened) === null || _options$onScreened2 === void 0 || _options$onScreened2.call(options, session, 'silence');
          } else {
            var _options$onScreened3;
            // action === 'allow' — let it through
            options === null || options === void 0 || (_options$onScreened3 = options.onScreened) === null || _options$onScreened3 === void 0 || _options$onScreened3.call(options, session, 'allow');
          }
          return;
        }
      }
    };
    _Core.default.on('newRTCSession', handleNewSession);
    return () => {
      _Core.default.off('newRTCSession', handleNewSession);
    };
  }, []);
  const addRule = (0, _react.useCallback)(rule => {
    setRules(prev => {
      if (prev.find(r => r.id === rule.id)) {
        return prev.map(r => r.id === rule.id ? rule : r);
      }
      return [...prev, rule];
    });
  }, []);
  const removeRule = (0, _react.useCallback)(id => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);
  const clearRules = (0, _react.useCallback)(() => {
    setRules([]);
  }, []);
  const updateRule = (0, _react.useCallback)((id, patch) => {
    setRules(prev => prev.map(r => r.id === id ? {
      ...r,
      ...patch
    } : r));
  }, []);
  return {
    rules,
    addRule,
    removeRule,
    clearRules,
    updateRule
  };
}
//# sourceMappingURL=CallScreening.js.map