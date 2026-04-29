// ─── Call State ──────────────────────────────────────────────────────────────

export let CallState = /*#__PURE__*/function (CallState) {
  CallState["Idle"] = "Idle";
  CallState["IncomingReceived"] = "IncomingReceived";
  CallState["PushIncomingReceived"] = "PushIncomingReceived";
  CallState["OutgoingInit"] = "OutgoingInit";
  CallState["OutgoingProgress"] = "OutgoingProgress";
  CallState["OutgoingRinging"] = "OutgoingRinging";
  CallState["OutgoingEarlyMedia"] = "OutgoingEarlyMedia";
  CallState["Connected"] = "Connected";
  CallState["StreamsRunning"] = "StreamsRunning";
  CallState["Pausing"] = "Pausing";
  CallState["Paused"] = "Paused";
  CallState["PausedByRemote"] = "PausedByRemote";
  CallState["Resuming"] = "Resuming";
  CallState["Referred"] = "Referred";
  CallState["Error"] = "Error";
  CallState["End"] = "End";
  CallState["Released"] = "Released";
  CallState["Updating"] = "Updating";
  CallState["UpdatedByRemote"] = "UpdatedByRemote";
  CallState["EarlyUpdating"] = "EarlyUpdating";
  CallState["EarlyUpdatedByRemote"] = "EarlyUpdatedByRemote";
  return CallState;
}({});

// ─── Call Direction ───────────────────────────────────────────────────────────

export let CallDirection = /*#__PURE__*/function (CallDirection) {
  CallDirection["Incoming"] = "Incoming";
  CallDirection["Outgoing"] = "Outgoing";
  return CallDirection;
}({});

// ─── Call Status ──────────────────────────────────────────────────────────────

export let CallStatus = /*#__PURE__*/function (CallStatus) {
  CallStatus["Success"] = "Success";
  CallStatus["Aborted"] = "Aborted";
  CallStatus["Missed"] = "Missed";
  CallStatus["Declined"] = "Declined";
  CallStatus["EarlyAborted"] = "EarlyAborted";
  CallStatus["AcceptedElsewhere"] = "AcceptedElsewhere";
  CallStatus["DeclinedElsewhere"] = "DeclinedElsewhere";
  return CallStatus;
}({});

// ─── Registration State ───────────────────────────────────────────────────────

export let RegistrationState = /*#__PURE__*/function (RegistrationState) {
  RegistrationState["None"] = "None";
  RegistrationState["Progress"] = "Progress";
  RegistrationState["Ok"] = "Ok";
  RegistrationState["Cleared"] = "Cleared";
  RegistrationState["Failed"] = "Failed";
  RegistrationState["Refreshing"] = "Refreshing";
  return RegistrationState;
}({});

// ─── Audio Device ─────────────────────────────────────────────────────────────

// ─── Call Log ─────────────────────────────────────────────────────────────────

// ─── SIP Configuration ───────────────────────────────────────────────────────

// ─── Session / Call Events ────────────────────────────────────────────────────

// ─── Media Constraints ────────────────────────────────────────────────────────

// ─── Push Notification ────────────────────────────────────────────────────────

// ─── Call Screening ───────────────────────────────────────────────────────────

// ─── DTMF ─────────────────────────────────────────────────────────────────────

// ─── Muted Info ───────────────────────────────────────────────────────────────

// ─── Hold State ───────────────────────────────────────────────────────────────
//# sourceMappingURL=types.js.map