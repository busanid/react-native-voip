import linphonesw
//import linphone
import Foundation

enum LinphoneError: Error {
    case defaultError
    case missingValue
}

@objc(LinphoneSdk)
class LinphoneSdk: RCTEventEmitter {
    
    var core: Core!
    var coreListener: CoreDelegate!
  var chatRoomListener: ChatRoomDelegate!
    
    public static var shared:LinphoneSdk?
    override init() {
        super.init()
        LinphoneSdk.shared = self
    }
    
    private func sendEventToJS(name: String!, body: Any!) {
        LinphoneSdk.shared?.sendEvent(withName: name, body: body);
    }
    
    private func throwError(message: String) throws{
        throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: message])
    }
    
    private func processDictionary(dictionary: NSDictionary, key: String) throws -> Any {
        guard let value = dictionary[key] else {
            throw LinphoneError.missingValue
        }
        
        return value
    }

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }
    
    /**
     
     @ReactMethod()
       fun init(promise: Promise) {
         try {
           val factory = Factory.instance()
           factory.setDebugMode(true, "debug")
           core = factory.createCore(null, null, reactApplicationContext)
           core.addListener(coreListener)
           core.isPushNotificationEnabled = true
           core.isVideoCaptureEnabled = true
           core.isVideoDisplayEnabled = true
           promise.resolve(true)
         } catch (e: Exception) {
           promise.reject("初始化linphone-sdk失败.", e)
         }
       }
     */
    
    @objc(initCore:rejecter:)
    func initCore(_ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock) -> Void {
        do {
            LoggingService.Instance.logLevel = LogLevel.Debug
            try core = Factory.Instance.createCore(configPath: "", factoryConfigPath: "", systemContext: nil)
            core.videoCaptureEnabled = true
            core.videoDisplayEnabled = true
            core.videoActivationPolicy!.automaticallyAccept = true
//            core.nativeRingingEnabled = true
            coreListener = CoreDelegateStub(
                onCallStateChanged: { (core: Core, call: Call, state: Call.State, message: String) in
                    /**
                     val params = Arguments.createMap().apply {
                             putMap("data", Arguments.createMap().apply {
                               putString("cause", message)
                             })
                             putString("callId", call.callLog.callId)
                             putString("callStatus", call.callLog.status.toString())
                           }
                     */
                    var params = [String: Any]()
                    params["data"] = ["cause": message]
                    params["callId"] = call.callLog?.callId
                    params["callStatus"] = self.convertCallStatusToString(rawvalue: call.callLog?.status.rawValue ?? -1)
                    switch state {
                    case .IncomingEarlyMedia:
                        break
                    case .PushIncomingReceived:
                        params["originator"] = "remote"
                    case .IncomingReceived:
                        break
                    /**
                     Call.State.OutgoingInit -> {
                               //params.putString("originator", "local");
                               params.putString("eventName", "OutgoingInit")


                               params.putString("remoteAddress", call.remoteAddress.asString())
                               params.putString("displayName", call.remoteAddress.displayName)
                               params.putString("remoteUsername", call.remoteAddress.username)
                               params.putString("localAddress", call.callLog.localAddress.asString())
                               /*params.putMap("account", Arguments.createMap().apply {
                                 putString("id", call.currentParams.account?.params?.idkey);
                               })*/
                               sendEvent(reactApplicationContext, "callStateChanged", params)
                             }
                     */
                    case .OutgoingInit:
                        params["eventName"] = "OutgoingInit"
                        params["remoteAddress"] = call.remoteAddress?.asString()
                        params["displayName"] = call.remoteAddress?.displayName
                        params["remoteUsername"] = call.remoteAddress?.username
                        params["localAddress"] = call.callLog?.localAddress?.asString()
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    /**
                     Call.State.OutgoingProgress -> {
                               params.putString("originator", "local")
                               params.putString("eventName", "OutgoingProgress")

                               params.putString("remoteAddress", call.remoteAddress.asString())
                               params.putString("displayName", call.remoteAddress.displayName)
                               params.putString("remoteUsername", call.remoteAddress.username)
                               params.putString("localAddress", call.callLog.localAddress.asString())
                               /*params.putMap("account", Arguments.createMap().apply {
                                 putString("id", call.currentParams.account?.params?.idkey);
                               })*/
                               sendEvent(reactApplicationContext, "callStateChanged", params)
                             }
                     */
                    case .OutgoingProgress:
                        params["originator"] = "local"
                        params["eventName"] = "OutgoingProgress"
                        params["remoteAddress"] = call.remoteAddress?.asString()
                        params["displayName"] = call.remoteAddress?.displayName
                        params["remoteUsername"] = call.remoteAddress?.username
                        params["localAddress"] = call.callLog?.localAddress?.asString()
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    /**
                     Call.State.OutgoingRinging -> {
                               params.putString("eventName", "OutgoingRinging")

                               params.putString("remoteAddress", call.remoteAddress.asString())
                               params.putString("displayName", call.remoteAddress.displayName);
                               sendEvent(reactApplicationContext, "callStateChanged", params)
                             }
                     */
                    case .OutgoingRinging:
                        params["eventName"] = "OutgoingRinging"
                        params["remoteAddress"] = call.remoteAddress?.asString()
                        params["displayName"] = call.remoteAddress?.displayName
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                        /**
                         Call.State.OutgoingEarlyMedia -> {
                                   params.putString("eventName", "OutgoingEarlyMedia")
                                   sendEvent(reactApplicationContext, "callStateChanged", params)
                                 }
                         */
                    case .OutgoingEarlyMedia:
                        params["eventName"] = "OutgoingEarlyMedia"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    /**
                     Call.State.Connected -> {
                               params.putString("eventName", "Connected")
                               sendEvent(reactApplicationContext, "callStateChanged", params)
                             }
                     */
                    case .Connected:
                        params["eventName"] = "Connected"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    /**
                     Call.State.StreamsRunning -> {
                              val wtf = call.currentParams?.receivedFramerate
                              val wtf2 = call.remoteParams?.receivedFramerate
                              val wtf3 = call.params.receivedFramerate

                              params.putString("eventName", "StreamsRunning")
                              sendEvent(reactApplicationContext, "callStateChanged", params)
                     */
                    case .StreamsRunning:
                        params["eventName"] = "StreamsRunning"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    /**
                     Call.State.Paused -> {
                               params.putString("eventName", "Paused")
                               sendEvent(reactApplicationContext, "callStateChanged", params)
                               // When you put a call in pause, it will became Paused
                     //            findViewById<Button>(R.id.pause).text = "Resume"
                     //            findViewById<Button>(R.id.toggle_video).isEnabled = false
                             }
                     */
                    case .Paused:
                        params["eventName"] = "Paused"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .PausedByRemote:
                        params["eventName"] = "PausedByRemote"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .Resuming:
                        params["eventName"] = "Resuming"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .Updating:
                        params["eventName"] = "Updating"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .UpdatedByRemote:
                        params["eventName"] = "UpdatedByRemote"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    /**
                     Call.State.Released -> {
                               params.putString("eventName", "Released")
                               sendEvent(reactApplicationContext, "callStateChanged", params)
                               // Call state will be released shortly after the End state
                     //            findViewById<EditText>(R.id.remote_address).isEnabled = true
                     //            findViewById<Button>(R.id.call).isEnabled = true
                     //            findViewById<Button>(R.id.pause).isEnabled = false
                     //            findViewById<Button>(R.id.pause).text = "Pause"
                     //            findViewById<Button>(R.id.toggle_video).isEnabled = false
                     //            findViewById<Button>(R.id.hang_up).isEnabled = false
                     //            findViewById<Button>(R.id.toggle_camera).isEnabled = false
                             }
                     */
                    case .Released:
                        params["eventName"] = "Released"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .End:
                        params["eventName"] = "End"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .Error:
                        params["eventName"] = "Error"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .Idle:
                        params["eventName"] = "Idle"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .Pausing:
                        params["eventName"] = "Pausing"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .Referred:
                        params["eventName"] = "Referred"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .EarlyUpdatedByRemote:
                        params["eventName"] = "EarlyUpdatedByRemote"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    case .EarlyUpdating:
                        params["eventName"] = "EarlyUpdating"
                        self.sendEventToJS(name: "callStateChanged", body: params)
//                        self.sendEvent(withName: "callStateChanged", body: params)
                    }
                },
                onCallLogUpdated: { core, callLog in
                    //sendEvent(reactApplicationContext, "callLogUpdated", extractCallLog(callLog))
                    self.sendEventToJS(name: "callLogUpdated", body: self.extractCallLog(callLog: callLog))
//                    self.sendEvent(withName: "callLogUpdated", body: self.extractCallLog(callLog: callLog))
                },
                onCallCreated: { (core: Core, call: Call) in
                    var params: [String: Any] = [:]
                    let originator = call.dir == Call.Dir.Incoming ? "remote" : "local"
                    let isVideo: Bool
                    if call.dir == Call.Dir.Incoming {
                        isVideo = call.remoteParams?.videoEnabled ?? false
                    } else {
                        isVideo = call.params?.videoEnabled ?? false
                    }
                    params["callId"] = call.callLog?.callId
                    params["originator"] = originator
                    params["remoteAddress"] = call.remoteAddress?.asString()
                    params["remoteDisplayName"] = call.remoteAddress?.displayName
                    params["remoteUsername"] = call.remoteAddress?.username
                    params["localAddress"] = call.callLog?.localAddress?.asString()
                    params["localUserName"] = call.callLog?.localAddress?.username
                    params["isVideo"] = isVideo
                    self.sendEventToJS(name: "newRTCSession", body: params)
//                    self.sendEvent(withName: "newRTCSession", body: params)
                },
                onAudioDeviceChanged: { (core: Core, device: AudioDevice) in
                        // This callback will be triggered when a successful audio device has been changed
                },
                onAudioDevicesListUpdated: { (core: Core) in
                        // This callback will be triggered when the available devices list has changed,
                        // for example after a bluetooth headset has been connected/disconnected.
                },
                /**
                 override fun onAccountRegistrationStateChanged(core: Core, account: Account, state: RegistrationState, message: String) {
                       // If account has been configured correctly, we will go through Progress and Ok states
                       // Otherwise, we will be Failed.
                       //findViewById<TextView>(R.id.registration_status).text = message
                       val params = Arguments.createMap().apply {
                         putString("message", message)
                         val authInfo = account.findAuthInfo()
                         putString("username", authInfo?.username)
                         putString("domain", authInfo?.domain)
                         putString("id", account.params.idkey)
                       }
                       if(state == RegistrationState.Failed) {
                         //params.putString("eventName", "registrationFailed")
                         sendEvent(reactApplicationContext, "registrationFailed", params)
                       }
                       if(state == RegistrationState.Cleared) {
                         //params.putString("eventName", "unregistered")
                         sendEvent(reactApplicationContext, "unregistered", params)
                       }
                       if(state == RegistrationState.Ok) {
                         //params.putString("eventName", "registered")
                         sendEvent(reactApplicationContext, "registered", params)
                       }
                       if(state == RegistrationState.Progress) {
                         sendEvent(reactApplicationContext, "registrationProgress", params)
                       }
                     }
                 */
                onAccountRegistrationStateChanged: {(core: Core, account: Account, state: RegistrationState, message: String) in
                    let authInfo = account.findAuthInfo()
                    var params = [String: Any]()
                    params["message"] = message
                    params["username"] = authInfo?.username
                    params["domain"] = authInfo?.domain
                    params["id"] = account.params?.idkey
                    if(state == .Failed) {
                        self.sendEventToJS(name: "registrationFailed", body: params)
//                        self.sendEvent(withName: "registrationFailed", body: params)
                    }
                    if(state == .Cleared) {
                        self.sendEventToJS(name: "unregistered", body: params)
//                        self.sendEvent(withName: "unregistered", body: params)
                    }
                    if(state == .Ok) {
                        self.sendEventToJS(name: "registered", body: params)
//                        self.sendEvent(withName: "registered", body: params)
                    }
                    if(state == .Progress || state == .Refreshing) {
                        self.sendEventToJS(name: "registrationProgress", body: params)
//                        self.sendEvent(withName: "registrationProgress", body: params)
                    }
                })
            
            core.addDelegate(delegate: coreListener)
            resolve(true)
        } catch {
            reject(nil, "初始化Core失败", nil)
        }
    }
    
    /**
     @ReactMethod
       fun start(promise: Promise) {
         try {
           core.start()
           promise.resolve(true)
         } catch(err: Exception) {
           promise.reject(err)
         }
       }
     */
    @objc(start:rejecter:)
    func start(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ) {
        do {
            try core.start()
            resolve(true)
        } catch {
            reject(nil, "调用start失败", nil)
        }
    }
    
    /**
     @ReactMethod
       fun stop(promise: Promise){
         try {
           core.stop()
           promise.resolve(true)
         } catch(err: Exception) {
           promise.reject(err)
         }
       }
     */
    @objc(stop:rejecter:)
    func stop(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            core.stop()
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用stop失败", error)
        }
    }
    
    @objc(userAgentInit:withResolver:withRejecter:)
    func userAgentInit(options: NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        do {
            let linphoneUsername = options.value(forKey: "username") as! String
            let password = options.value(forKey: "password") as! String
            let domain = options.value(forKey: "domain") as! String
            let displayName = options.value(forKey: "displayName") as? String
            let id = options.value(forKey: "id") as! String
            let proxyDomain = options.value(forKey: "proxyDomain") as? String
            let transportType = options.value(forKey: "transportType") as? String
            let stunDomain = options.value(forKey: "stunDomain")
            let stunPort = options.value(forKey: "stunPort")
            let stunEnabled = options.value(forKey: "stunEnabled")
            let contactParams = options.value(forKey: "contactParams") as? String
            let isDefault = options.value(forKey: "isDefault") as! Bool
            
            if(linphoneUsername.isEmpty || domain.isEmpty) {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "username 或domain 为空，无法初始化用户"])
            }
            
            let authInfo = try Factory.Instance.createAuthInfo(username: linphoneUsername, userid: nil, passwd: password, ha1: nil, realm: nil, domain: domain)
            let accountParams = try core.createAccountParams()
            let identity = try Factory.Instance.createAddress(addr: "sip:\(linphoneUsername)@\(domain)")
            try identity.setDisplayname(newValue: displayName ?? "")
            try accountParams.setIdentityaddress(newValue: identity)
            accountParams.contactUriParameters = contactParams ?? ""
            accountParams.idkey = id
//            let proxyAddress = Factory.Instance.createAddress("sip:\(proxyDomain.isEmpty ? domain : proxyDomain)")
            let proxyAddress = try Factory.Instance.createAddress(addr: "sip:\(proxyDomain ?? domain)")
            let targetTransportType: TransportType
            switch transportType {
            case "UDP":
                targetTransportType = TransportType.Udp
            case "TCP":
                targetTransportType = TransportType.Tcp
            case "TLS":
                targetTransportType = TransportType.Tls
            default:
                targetTransportType = TransportType.Udp
            }
            try proxyAddress.setTransport(newValue: targetTransportType)
            /**
             stun 逻辑以后实现
             val newNatPolicy = accountParams.natPolicy?.clone() ?: core.createNatPolicy()
                     if(stunDomain.isNotEmpty() && stunPort.isNotEmpty() && stunEnabled) {
                       val serverDomain = "${stunDomain}"
                       newNatPolicy.isTurnEnabled = true
                       //core.natPolicy?.isIceEnabled = true
                       newNatPolicy.isIceEnabled = true
                       newNatPolicy.stunServer = serverDomain//"${stunDomain}:${stunPort}"
                       val authInfo = findTargetAuthInfo("cube", stunDomain)
                       if(authInfo == null) {
                         core.addAuthInfo(Factory.instance().createAuthInfo("cube", null, "cube", null, null, serverDomain, null))
                       }
                       newNatPolicy.stunServerUsername = "cube"
                       newNatPolicy.isStunEnabled = stunEnabled
                     }
            */
            //accountParams?.natPolicy
            try accountParams.setServeraddress(newValue: proxyAddress)
            accountParams.registerEnabled = false
            accountParams.expires = 30
            
            let account = try core.createAccount(params: accountParams)
            core.addAuthInfo(info: authInfo)
            try core.addAccount(account: account)
            if(isDefault) {
                core.defaultAccount = account
            }
            core.videoActivationPolicy?.automaticallyAccept = true
            core.config?.setBool(section: "video", key: "auto_resize_preview_to_keep_ratio", value: true)
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用userAgentInit失败:\(error.localizedDescription)", nil)
        }
    }
    
    private func findAccountByUsernameAndDomain(username: String, domain: String) -> Account?{
        var targetAccount: Account? = nil
        if(core == nil) {
            return nil
        }
        for account in core.accountList {
            let accountParams = account.params
            let targetIdentity = accountParams?.identityAddress
            if username == targetIdentity?.username && domain == targetIdentity?.domain{
                targetAccount = account
            }
        }
        return targetAccount
    }
    
    /**
     @ReactMethod
       fun setUserAgent(options: ReadableMap, promise: Promise){
         try {
           val name = options.getString("name")
           val version = options.getString("version")
           core.setUserAgent(name, version);
           promise.resolve(true)
         } catch (err: Exception) {
           promise.reject("调用setUserAgent失败.", err)
         }
       }
     */
    @objc(setUserAgent:withResolver:withRejecter:)
    func setUserAgent(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ) {
        let name = options["name"] as? String
        let version = options["version"] as? String
        core.setUserAgent(name: name, version: version)
        resolve(true)
    }
    
    @objc(setDefaultAccount:withResolver:withRejecter:)
    func setDefaultAccount(options: NSDictionary,
                           resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) {
        do {
            let username = options.value(forKey: "username") as! String
            if(username.isEmpty) {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "username参数必须传"])
            }
            let domain = options.value(forKey: "domain") as! String
            if(domain.isEmpty) {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "domain参数必须传"])
            }
            let account = findAccountByUsernameAndDomain(username: username, domain: domain)
            if(account == nil) {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "通过\(username) & \(domain) 找不到对应的account"])
            }
            core.defaultAccount = account
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用setDefaultAccount失败:\(error.localizedDescription)", error)
        }
    }
    
    @objc(isEchoCancellationEnabled:rejecter:)
    func isEchoCancellationEnabled(_ resolve: RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        resolve(true)
    }
    
    @objc(setEchoCancellationEnabled:withResolver:withRejecter:)
    func setEchoCancellationEnabled(
        isEnabled: Bool,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ) {
        core.echoCancellationEnabled = isEnabled
        resolve(true)
    }
    
    /**
     @ReactMethod
       fun register(options: ReadableMap, promise: Promise){
         try {
           val id =  options.getString("id") ?: throw Exception("账户id必须传入");
           val account = core.getAccountByIdkey(id) ?: throw Exception("找不到对应的account");
           val clonedParams = account.params.clone()
           clonedParams.isRegisterEnabled = true
           account.params = clonedParams
           promise.resolve(true)
         } catch (err: Exception) {
           promise.reject("调用register失败", err)
         }
       }
     */
    
    @objc(registerIt:withResolver:withRejecter:)
    func registerIt(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let id = options["id"] as! String
            let account = core.getAccountByIdkey(idkey: id)
            if(account == nil) {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "通过id:\(id)找不到对应的account"])
            }
            let clonedParams = account?.params?.clone()
            clonedParams?.registerEnabled = true
            account?.params = clonedParams
            resolve(true)
        } catch {
            reject(nil, "调用register失败", nil)
        }
    }
    
    /**
     val id =  options.getString("id") ?: throw Exception("账户id必须传入");
           val account = core.getAccountByIdkey(id) ?: throw Exception("找不到对应的account");
           val clonedParams = account.params.clone()
           clonedParams.isRegisterEnabled = false
           account.params = clonedParams
           promise.resolve(true)
     */
    @objc(unregister:withResolver:withRejecter:)
    func unregister(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let id = options["id"] as! String
            let account = core.getAccountByIdkey(idkey: id)
            let clonedParams = account?.params?.clone()
            clonedParams?.registerEnabled = false
            account?.params = clonedParams
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用unregister失败", error)
        }
    }
    
    private func findTargetAuthInfo(username: String, domain: String) -> AuthInfo? {
//        return core.authInfoList.find { it.username == username && it.domain == domain }
        let result = core.authInfoList.first(where: {authInfo in
            return authInfo.username == username && authInfo.domain == domain
        })
        return result
      }
    
    /**
     @ReactMethod
       fun remove(prevSipConfig: ReadableMap, promise: Promise){
         try {
           val username = prevSipConfig.getString("username")
           val password = prevSipConfig.getString("password")
           val domain = prevSipConfig.getString("domain")
           val id = prevSipConfig.getString("id")

           if(username != null && domain != null) {
             val account = core.getAccountByIdkey(id)
             val authInfo = findTargetAuthInfo(username, domain)
             if(account == null || authInfo == null) {
               throw Exception("无法找到之前的sip账号，移除失败")
             }
             core.removeAuthInfo(authInfo)
             core.removeAccount(account)
             promise.resolve(true)
           } else {
             throw Exception("没有username或domain参数，无法移除Sip账号")
           }
         } catch (err: Exception) {
           promise.reject("移除sip账号失败.", err)
         }
       }
     */
    @objc(remove:withResolver:withRejecter:)
    func remove(
        prevSipConfig: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let username = prevSipConfig["username"] as! String
            let password = prevSipConfig["password"] as! String
            let domain = prevSipConfig["domain"] as! String
            let id = prevSipConfig["id"] as! String
            if(username.isEmpty || domain.isEmpty) {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "没有username或domain参数，无法移除Sip账号"])
            }
            let account = core.getAccountByIdkey(idkey: id)!
            let authInfo = findTargetAuthInfo(username: username, domain: domain)!
//            if(account == nil || authInfo == nil) {
//                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "无法找到之前的sip账号authinfo，移除失败"])
//            }
            core.removeAccount(account: account)
            core.removeAuthInfo(info: authInfo)
            resolve(true)
        } catch let error as NSError {
            reject(nil, "移除sip账号失败", error)
        }
    }
    
    @objc(getDefaultRingtoneUri:rejecter:)
    func getDefaultRingtoneUri(_ resolve: RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        resolve(nil)
    }
    
    /**
     @ReactMethod
       fun setUseInfoForDtmf(isUse: Boolean, promise: Promise) {
         try {
           core.useInfoForDtmf = isUse;
           promise.resolve(core.useInfoForDtmf);
         } catch (err: Exception) {
           promise.reject("设置useInfo DTmf失败", err);
         }
       }

       @ReactMethod
       fun isUseInfoForDtmf(promise: Promise) {
         try {
           promise.resolve(core.useInfoForDtmf)
         } catch (err: Exception) {
           promise.reject("获取useInfoForDtmf失败", err);
         }
       }

       @ReactMethod
       fun setUseRfc2833ForDtmf(isUse: Boolean, promise: Promise) {
         try {
           core.useRfc2833ForDtmf = isUse;
           promise.resolve(core.useRfc2833ForDtmf);
         } catch (err: Exception) {
           promise.reject("设置useRfc2833ForDtmf DTmf失败", err);
         }
       }
     */
    @objc(setUseInfoForDtmf:withResolver:withRejecter:)
    func setUseInfoForDtmf(
        isUse: Bool,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        core.useInfoForDtmf = isUse
        resolve(core.useInfoForDtmf)
    }
    
    @objc(isUseInfoForDtmf:rejecter:)
    func isUseInfoForDtmf(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        resolve(core.useInfoForDtmf)
    }
    
    @objc(isUseRfc2833ForDtmf:rejecter:)
    func isUseRfc2833ForDtmf(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        resolve(core.useRfc2833ForDtmf)
    }
    
    @objc(setUseRfc2833ForDtmf:withResolver:withRejecter:)
    func setUseRfc2833ForDtmf(
        isUse: Bool,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        core.useRfc2833ForDtmf = isUse
        resolve(core.useRfc2833ForDtmf)
    }
    
    /**
     @ReactMethod
       fun getAudioDevices(promise: Promise) {
         try {
           val result = Arguments.createArray();
           core.reloadSoundDevices()
           for (audioDevice in core.audioDevices) {
             val audioItem = Arguments.createMap();
             audioItem.putString("id", audioDevice.id)
             audioItem.putString("deviceName", audioDevice.deviceName)
             audioItem.putString("type", audioDevice.type.toString())
             audioItem.putString("driverName", audioDevice.driverName)
             audioItem.putString("capabilities", audioDevice.capabilities.toString())
             result.pushMap(audioItem)
           }
           promise.resolve(result)
         } catch (err: Exception) {
           promise.reject("获取所有外放设备失败", err)
         }
       }
     */
    @objc(getAudioDevices:rejecter:)
    func getAudioDevices(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ) {
        do {
            var result: [[String: Any]] = []
            core.reloadSoundDevices()
            for audioDevice in core.audioDevices {
                let audioItem = extractAudioDevice(audioDevice: audioDevice)
                result.append(audioItem)
            }
            resolve(result)
        } catch {
            reject(nil, "调用getAudioDevices失败", nil)
        }
    }
    
    private func convertCapabilitiesToString(rawvalue: Int) -> String? {
        switch rawvalue {
        case AudioDevice.Capabilities.CapabilityAll.rawValue:
            return "CapabilityAll"
        case AudioDevice.Capabilities.CapabilityPlay.rawValue:
            return "CapabilityPlay"
        case AudioDevice.Capabilities.CapabilityRecord.rawValue:
            return "CapabilityRecord"
//        case AudioDeviceCapabilities.CapabilityAll.rawValue:
//            return "CapabilityAll"
//        case AudioDeviceCapabilities.CapabilityPlay.rawValue:
//            return "CapabilityPlay"
//        case AudioDeviceCapabilities.CapabilityRecord.rawValue:
//            return "CapabilityRecord"
        default:
            return nil
        }
    }
    
    private func convertCallStatusToString(rawvalue: Int) -> String? {
        switch rawvalue {
        case Call.Status.Success.rawValue:
            return "Success"
        case Call.Status.Aborted.rawValue:
            return "Aborted"
        /// The call was missed (incoming call timed out without being answered or hanged
        /// up)
        case Call.Status.Missed.rawValue:
            return "Missed"
        /// The call was declined, either locally or by remote end.
        case Call.Status.Declined.rawValue:
            return "Declined"
        /// The call was aborted before being advertised to the application - for protocol
        /// reasons.
        case Call.Status.EarlyAborted.rawValue:
            return "EarlyAborted"
        /// The call was answered on another device.
        case Call.Status.AcceptedElsewhere.rawValue:
            return "AcceptedElsewhere"
        /// The call was declined on another device.
        case Call.Status.DeclinedElsewhere.rawValue:
            return "DeclinedElsewhere"
        default:
            return "unkown"
        }
    }
    
    private func convertAudioDeviceTypetoString(rawvalue: Int) -> String? {
        switch rawvalue {
        case AudioDevice.Kind.Unknown.rawValue:
            return "Unknown";
        case AudioDevice.Kind.Microphone.rawValue:
            return "Microphone"
        case AudioDevice.Kind.Earpiece.rawValue:
            return "Earpiece"
        case AudioDevice.Kind.Speaker.rawValue:
            return "Speaker"
        case AudioDevice.Kind.Bluetooth.rawValue:
            return "Bluetooth"
        case AudioDevice.Kind.BluetoothA2DP.rawValue:
            return "BluetoothA2DP"
        case AudioDevice.Kind.Telephony.rawValue:
            return "Telephony"
        case AudioDevice.Kind.AuxLine.rawValue:
            return "AuxLine"
        case AudioDevice.Kind.GenericUsb.rawValue:
            return "GenericUsb"
        case AudioDevice.Kind.Headset.rawValue:
            return "Headset"
        case AudioDevice.Kind.Headphones.rawValue:
            return "Headphones"
        case AudioDevice.Kind.HearingAid.rawValue:
            return "HearingAid"
//        case AudioDeviceType.Unknown.rawValue:
//            return "Unknown";
//        case AudioDeviceType.Microphone.rawValue:
//            return "Microphone"
//        case AudioDeviceType.Earpiece.rawValue:
//            return "Earpiece"
//        case AudioDeviceType.Speaker.rawValue:
//            return "Speaker"
//        case AudioDeviceType.Bluetooth.rawValue:
//            return "Bluetooth"
//        case AudioDeviceType.BluetoothA2DP.rawValue:
//            return "BluetoothA2DP"
//        case AudioDeviceType.Telephony.rawValue:
//            return "Telephony"
//        case AudioDeviceType.AuxLine.rawValue:
//            return "AuxLine"
//        case AudioDeviceType.GenericUsb.rawValue:
//            return "GenericUsb"
//        case AudioDeviceType.Headset.rawValue:
//            return "Headset"
//        case AudioDeviceType.Headphones.rawValue:
//            return "Headphones"
//        case AudioDeviceType.HearingAid.rawValue:
//            return "HearingAid"
        default:
            return nil
        }
    }
    
    /**
     private fun _isCoreSpeakerEnabled():Boolean {
         val currentAudioDevice = core.outputAudioDevice
         return currentAudioDevice?.type == AudioDevice.Type.Speaker
       }
     */
    private func _isCoreSpeakerEnabled() -> Bool {
        let currentAudioDevice = core.outputAudioDevice
        return currentAudioDevice?.type == AudioDevice.Kind.Speaker
    }
    
    /*
     @ReactMethod
       fun isCoreSpeakerEnabled(promise: Promise) {
         promise.resolve(_isCoreSpeakerEnabled())
       }
     */
    @objc(isCoreSpeakerEnabled:rejecter:)
    func isCoreSpeakerEnabled(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        resolve(_isCoreSpeakerEnabled())
    }
    
    /**
     @ReactMethod
       fun toggleCoreSpeaker(promise: Promise) {
         try {
           val speakerEnabled = _isCoreSpeakerEnabled()

           // We can get a list of all available audio devices using
           // Note that on tablets for example, there may be no Earpiece device
           for (audioDevice in core.audioDevices) {
             if (speakerEnabled && audioDevice.type == AudioDevice.Type.Earpiece) {
               core.outputAudioDevice = audioDevice
               core.defaultOutputAudioDevice = audioDevice
               return promise.resolve(false)
             } else if (!speakerEnabled && audioDevice.type == AudioDevice.Type.Speaker) {
               core.outputAudioDevice = audioDevice
               core.defaultOutputAudioDevice = audioDevice
               return promise.resolve(true)
             }/* If we wanted to route the audio to a bluetooth headset
                 else if (audioDevice.type == AudioDevice.Type.Bluetooth) {
                     core.currentCall?.outputAudioDevice = audioDevice
                 }*/
           }
         } catch (err: Exception) {
           promise.reject("更改Core是否外放失败.", err)
         }
       }
     */
    @objc(toggleCoreSpeaker:rejecter:)
    func toggleCoreSpeaker(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            let speakerEnabled = _isCoreSpeakerEnabled()
            
            var finded = false;
            for audioDevice in core.audioDevices {
                if(speakerEnabled) {
                    if(audioDevice.type == AudioDevice.Kind.Earpiece) {
                        core.outputAudioDevice = audioDevice
                        core.defaultOutputAudioDevice = audioDevice
                        finded = true
                    }
                }
                if(!speakerEnabled && audioDevice.type == AudioDevice.Kind.Speaker) {
                    core.outputAudioDevice = audioDevice
                    core.defaultOutputAudioDevice = audioDevice
                    finded = true
                }
            }
            
            //苹果在切换外放的时候，会出现没有 Earpiece 设备
            if(!finded) {
                for audioDevice in core.audioDevices {
                    if(speakerEnabled && audioDevice.capabilities == AudioDevice.Capabilities.CapabilityAll
                       && audioDevice.type != AudioDevice.Kind.Speaker) {
                        core.outputAudioDevice = audioDevice
                        core.defaultOutputAudioDevice = audioDevice
                    }
                }
            }
            resolve(_isCoreSpeakerEnabled())
        } catch {
            reject(nil, "更改Core是否外放失败", nil)
        }
    }
    
    private func _isCallSpeakerEnabled(callId: String) -> Bool {
        guard let call = core.getCallByCallid(callId: callId) else {
            fatalError("不存在的callId，无法获取外放状态")
        }
        return call.outputAudioDevice?.type == AudioDevice.Kind.Speaker
    }
    
    @objc(isCallSpeakerEnabled:withResolver:withRejecter:)
    func isCallSpeakerEnabled(
        callId: String,
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        resolve(_isCallSpeakerEnabled(callId: callId))
    }
    
    @objc(toggleCallSpeaker:withResolver:withRejecter:)
    func toggleCallSpeaker(
        callId: String,
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            let speakerEnabled = _isCallSpeakerEnabled(callId: callId)
            
            guard let call = core.getCallByCallid(callId: callId) else {
                fatalError("不存在的callId，无法修改外放状态")
            }
            
            for audioDevice in core.audioDevices {
                if(speakerEnabled && audioDevice.type == AudioDevice.Kind.Microphone) {
                    call.outputAudioDevice = audioDevice
                    
                    return resolve(false)
                }
                
                if(!speakerEnabled && audioDevice.type == AudioDevice.Kind.Speaker) {
                    core.outputAudioDevice = audioDevice
                    
                    return resolve(true)
                }
            }
            
        } catch let error as NSError {
            reject(nil, "修改外放状态失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun getCurrentAudioDevices(promise: Promise) {
         try {
           val inputAudioDevice = core.inputAudioDevice
           val outputAudioDevice = core.outputAudioDevice
           val defaultInputAudioDevice = core.defaultInputAudioDevice
           val defaultOutputAudioDevice = core.defaultOutputAudioDevice
           val result = Arguments.createMap();
           if(inputAudioDevice != null) {
             result.putMap("input", extractAudioDevice(inputAudioDevice))
           }
           if(defaultInputAudioDevice != null) {
             result.putMap("defaultInput", extractAudioDevice(defaultInputAudioDevice))
           }
           if(outputAudioDevice != null) {
             result.putMap("output", extractAudioDevice(outputAudioDevice))
           }
           if(defaultOutputAudioDevice != null) {
             result.putMap("defaultOutput", extractAudioDevice(defaultOutputAudioDevice))
           }
           promise.resolve(result);
         } catch (err:Exception) {
           promise.reject("获取当前输入输出设备失败", err);
         }
       }
     */
    @objc(getCurrentAudioDevices:rejecter:)
    func getCurrentAudioDevices(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            let inputAudioDevice = core.inputAudioDevice
            let outputAudioDevice = core.outputAudioDevice
            let defaultInputAudioDevice = core.defaultInputAudioDevice
            let defaultOutputAudioDevice = core.defaultOutputAudioDevice
            var result:[String: Any] = [:];
            if(inputAudioDevice != nil) {
                result["input"] = extractAudioDevice(audioDevice: inputAudioDevice!)
            }
            if(defaultInputAudioDevice != nil) {
                result["defaultInput"] = extractAudioDevice(audioDevice: defaultInputAudioDevice!)
            }
            if(outputAudioDevice != nil) {
                result["output"] = extractAudioDevice(audioDevice: outputAudioDevice!)
            }
            if(defaultOutputAudioDevice != nil) {
                result["defaultOutput"] = extractAudioDevice(audioDevice: defaultOutputAudioDevice!)
            }
            resolve(result)
        } catch {
            reject(nil, "调用getCurrentAudioDevices失败", nil)
        }
    }
    
    /**
     private fun extractAudioDevice(audioDevice: AudioDevice) : WritableMap {
         val audioItem = Arguments.createMap();
         audioItem.putString("id", audioDevice.id)
         audioItem.putString("deviceName", audioDevice.deviceName)
         audioItem.putString("type", audioDevice.type.toString())
         audioItem.putString("driverName", audioDevice.driverName)
         audioItem.putString("capabilities", audioDevice.capabilities.toString())
         return audioItem;
       }
     */
    private func extractAudioDevice(audioDevice: AudioDevice) -> [String: Any] {
        var audioItem = [String: Any]()
        // 将音频设备的各个属性添加到字典中
        audioItem["id"] = audioDevice.id
        audioItem["deviceName"] = audioDevice.deviceName
        audioItem["type"] = convertAudioDeviceTypetoString(rawvalue: audioDevice.type.rawValue)
        audioItem["driverName"] = audioDevice.driverName
        audioItem["capabilities"] = convertCapabilitiesToString(rawvalue: audioDevice.capabilities.rawValue)
        return audioItem;
    }
    
    /**
     @ReactMethod
       fun getDefaultAccount(promise: Promise) {
         try {
           val defaultAccount = core.defaultAccount ?: return promise.resolve(null)
           val account = Arguments.createMap()
           val authInfo = defaultAccount.findAuthInfo() ?: throw Exception("没有找到default account的authInfo")
           account.putString("username", authInfo.username)
           account.putString("domain", authInfo.domain)
           return promise.resolve(account)
         } catch(err: Exception) {
           promise.reject("调用getDefaultAccount失败", err)
         }
       }
     */
    @objc(getDefaultAccount:rejecter:)
    func getDefaultAccount(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            let defaultAccount = core.defaultAccount
            if(defaultAccount == nil) {
                return resolve(nil)
            }
            var account = [String: Any]()
            let authInfo = defaultAccount?.findAuthInfo()!
            account["username"] = authInfo?.username
            account["domain"] = authInfo?.domain
            return resolve(account)
        } catch let error as NSError {
            reject(nil, "调用getDefaultAccount失败", error)
        }
    }
    
    @objc(getIdentity:rejecter:)
    func getIdentity(
        _ resolve:RCTPromiseResolveBlock,rejecter reject:RCTPromiseRejectBlock
    ){
        resolve(core.identity)
    }
    
    /**
     fun call(target: String, options: ReadableMap, promise: Promise) {
         try {
           val mediaConstraints = options.getMap("mediaConstraints") ?: throw Exception("呼叫参数错误...")
           val needAudio = mediaConstraints.getBoolean("audio")
           val needVideo = mediaConstraints.getBoolean("video")
           val previewVideoViewId = options.getInt("previewVideoViewId")
           val remoteVideoViewId = options.getInt("remoteVideoViewId")
           val recordFilePath = options.getString("recordFilePath")
           core.nativePreviewWindowId = currentActivity?.findViewById(previewVideoViewId)
           core.nativeVideoWindowId = currentActivity?.findViewById(remoteVideoViewId)
           if(needAudio) {
             //_requestPermissions("audio");
           }
           if(needVideo) {
             //_requestPermissions("video")
             core.isVideoCaptureEnabled = true
             core.isVideoDisplayEnabled = true;
           }
           val remoteAddress = Factory.instance().createAddress(target);
           val params: CallParams? = core.createCallParams(null)
           params ?: return
           params.mediaEncryption = MediaEncryption.None
           params.isAudioEnabled = needAudio
           params.isVideoEnabled = needVideo
           val fileExt = if (needVideo) "mkv" else "wav"
           params.recordFile = "$recordFilePath.$fileExt"

           if (remoteAddress != null) {
             val call: Call? = core.inviteAddressWithParams(remoteAddress, params)
             val callId = call?.callLog?.callId
             promise.resolve(callId);
           } else {
             throw Exception("呼叫失败，没有目标账号。");
           }
         } catch (e: Exception) {
           promise.reject(e);
         }
       }
     */
    @objc(call:withOptions:withResolver:withRejecter:)
    func call(
        target: String,
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ){
        do {
            let mediaConstraints = options["mediaConstraints"] as! [String: Any]
            let needAudio = mediaConstraints["audio"] as? Bool ?? false
            let needVideo = mediaConstraints["video"] as? Bool ?? false
            let previewVideoViewId = options["previewVideoViewId"] as? NSNumber
            let remoteVideoViewId = options["remoteVideoViewId"] as? NSNumber
            let recordFilePath = options["recordFilePath"]
            if #available(iOS 13.0, *) {
              core.nativeVideoWindow = LinphoneVideoCaptureTextureView.nativeVideoWindow
              core.nativePreviewWindow = LinphoneVideoCaptureTextureView.previewVideoWindow
            } else {
              // Fallback on earlier versions
            }
            if(needVideo) {
              core.videoCaptureEnabled = true
              core.videoDisplayEnabled = true;
            }
            let remoteAddress = try Factory.Instance.createAddress(addr: target)
            let params = try core.createCallParams(call: nil)
            params.mediaEncryption = MediaEncryption.None
            params.audioEnabled = needAudio
            params.videoEnabled = needVideo
            let fileExt = needVideo ? "mkv" : "wav"
            if let filePath = recordFilePath {
                params.recordFile = "\(filePath).\(fileExt)"
            }
            if (remoteAddress != nil) {
                let call = core.inviteAddressWithParams(addr: remoteAddress, params: params)//core.inviteAddressWithParams(remoteAddress, params)
                let callId = call?.callLog?.callId
                resolve(callId);
            } else {
                throw NSError(domain: "com.shenou.soc", code: -1, userInfo: [NSLocalizedDescriptionKey: "呼叫失败，没有目标账号。"])
            }
        } catch let error as NSError {
            reject(nil, "调用Call失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun answer(options: ReadableMap, promise: Promise) {
         try {
           val mediaConstraints = options.getMap("mediaConstraints")
           val needAudio = mediaConstraints?.getBoolean("audio")
           val needVideo = mediaConstraints?.getBoolean("video")
           val previewVideoViewId = options.getInt("previewVideoViewId")
           val remoteVideoViewId = options.getInt("remoteVideoViewId")
           val recordFilePath = options.getString("recordFilePath")
           val callId = options.getString("callId")
           core.nativePreviewWindowId = currentActivity?.findViewById(previewVideoViewId)
           core.nativeVideoWindowId = currentActivity?.findViewById(remoteVideoViewId)
           //TODO 这里不能直接拿currentCall，如果是多账户的话
           val call = core.getCallByCallid(callId) ?: throw Exception("主动接通失败，不存在的callId")
           val callParams = call.params
           //callParams?.mediaEncryption = MediaEncryption.None
           if (needAudio != null) {
             call.params.isAudioEnabled = needAudio
           }
           //TODO 这里要优化为用户控制，目前暂时以对方拨打的时候为视频通话来判断
           /*if(needVideo == true) {
             call?.params?.isVideoEnabled = needVideo
           }*/
           if (call.remoteParams?.isVideoEnabled == true) {
             call.params.isVideoEnabled = true
           }

           val fileExt = if (call.params.isVideoEnabled) "mkv" else "wav"
           if(!recordFilePath.isNullOrEmpty()) {
             call.params.recordFile = "$recordFilePath.$fileExt"
           }

           val bool = call.currentParams?.isVideoEnabled
           val boo2 = call.params?.isVideoEnabled
           val boo3 = call.remoteParams?.isVideoEnabled
           val boo4 = call.videoStats
           val boo5 = call.remoteParams?.videoDirection
           val boo6 = call.remoteParams?.receivedVideoDefinition
           val boo7 = call.callLog?.isVideoEnabled
           val boo8 = call.remoteParams?.receivedFramerate

           val result = call.accept()
           if(result == 0) {
             promise.resolve(true)
           } else {
             throw Exception("调用accept失败...")
           }
         } catch(err:Exception) {
           promise.reject(err);
         }
       }
     */
    
    @objc(answer:withResolver:withRejecter:)
    func answer(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let mediaConstraints = options["mediaConstraints"] as! [String: Any]
            let needAudio = mediaConstraints["audio"] as? Bool ?? false
            let needVideo = mediaConstraints["video"] as? Bool ?? false
            let previewVideoViewId = options["previewVideoViewId"] as? NSNumber
            let remoteVideoViewId = options["remoteVideoViewId"] as? NSNumber
            let recordFilePath = options["recordFilePath"] as? String ?? nil
            let callId = options["callId"] as! String
            DispatchQueue.main.async {
                if let view = self.bridge.uiManager.view(forReactTag: previewVideoViewId) {
                    self.core.nativePreviewWindow = view
                }
                if let view2 = self.bridge.uiManager.view(forReactTag: remoteVideoViewId) {
                    self.core.nativeVideoWindow = view2
                }
            }
            if let call = core.getCallByCallid(callId: callId) {
                call.params?.audioEnabled = needAudio
                call.params?.videoEnabled = needVideo
                let fileExt = needVideo ? "mkv" : "wav"
                if let filePath = recordFilePath {
                    call.params?.recordFile = "\(filePath).\(fileExt)"
                }
                try call.accept()
            } else {
                try self.throwError(message: "通过 callId 无法找到对应的 call，接听失败")
            }
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用 answer 失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun terminate(options: ReadableMap, promise: Promise) {
         try {
           /*if (core.callsNb == 0) {
             throw Exception("当前不存在通话.无法挂断")
           }*/

           val callId = options.getString("linphoneCallId")
           // If the call state isn't paused, we can get it using core.currentCall
           /*val call = if (core.currentCall != null) core.currentCall else core.calls[0]
           call ?: return promise.resolve(0)

           // Terminating a call is quite simple
           promise.resolve(call.terminate())*/
           val call = core.getCallByCallid(callId) ?: throw Exception("不存在的callId，无法挂断。");
           call.terminate();
           promise.resolve(true)
         } catch (e: Exception) {
           promise.reject(e);
         }
       }
     */
    @objc(terminate:withResolver:withRejecter:)
    func terminate(
        options: NSDictionary,
        _ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock
    ){
        DispatchQueue.main.async {
            do {
                let callId = options["linphoneCallId"] as! String
                let call = self.core.getCallByCallid(callId: callId)!
                try call.terminateWithErrorInfo(ei: nil )
                resolve(true)
            } catch let error as NSError {
                reject(nil, "调用 terminate 失败", error)
            }
        }
    }
    
    /**
     private fun _getMutedInfo(): WritableMap? {
         val params = Arguments.createMap()
         params.putBoolean("audio", !core.isMicEnabled)
         params.putBoolean("video", !core.isVideoCaptureEnabled)
         return params;
       }
       @ReactMethod
       fun isMuted(promise: Promise) {
         promise.resolve(_getMutedInfo())
       }
     */
    private func _getMutedInfo() -> [String: Any] {
        var params = [String: Any]()
        params["audio"] = !core.micEnabled
        params["video"] = !core.videoCaptureEnabled
        return params
    }
    
    @objc(isMuted:rejecter:)
    func isMuted(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ){
        resolve(_getMutedInfo())
    }
    
    /**
     @ReactMethod
       fun toggleMute(options: ReadableMap, promise: Promise) {
         val needAudioToggle = options.getBoolean("audio")
         val needVideoToggle = options.getBoolean("video")

         if(needAudioToggle) {
           core.isMicEnabled = !core.isMicEnabled
         }
         if(needVideoToggle) {
           core.isVideoCaptureEnabled = !core.isVideoCaptureEnabled
         }

         promise.resolve(_getMutedInfo())
       }
     */
    @objc(toggleMute:withResolver:withRejecter:)
    func toggleMute(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ){
        let needAudioToggle = options["audio"] as? Bool ?? false
        let needVideoToggle = options["video"] as? Bool ?? false
        if(needAudioToggle) {
            core.micEnabled = !core.micEnabled
        }
        if(needVideoToggle) {
            core.videoCaptureEnabled = !core.videoCaptureEnabled
        }
        resolve(_getMutedInfo())
    }
    
    /**
     private fun _isSpeakerEnabled():Boolean {
         val currentAudioDevice = core.currentCall?.outputAudioDevice
         return currentAudioDevice?.type == AudioDevice.Type.Speaker
       }
     */
    //TODO是否可以改成根据callId获取
    private func _isSpeakerEnabled() -> Bool{
        let currentAudioDevice = core.currentCall?.outputAudioDevice
        return currentAudioDevice?.type == AudioDevice.Kind.Speaker
    }
    
    /**
     @ReactMethod
       fun refreshRegisters(promise: Promise) {
         try {
           core.refreshRegisters()
           promise.resolve(true)
         } catch (err: Exception) {
           promise.reject("主动刷新注册信息失败.", err)
         }
       }
     */
    @objc(refreshRegisters:rejecter:)
    func refreshRegisters(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ){
        core.refreshRegisters()
        resolve(true)
    }
    
    /**
     @ReactMethod
       fun playDTMF(dtmf: String, duration: Int, promise: Promise) {
         try {
           core.playDtmf(dtmf.toCharArray()[0], duration)
           promise.resolve(true)
         } catch(err: Exception) {
           promise.reject("播放拨号键音频失败.", err)
         }
       }
     */
    @objc(playDTMF:withDuration:withResolver:withRejecter:)
    func playDTMF(
        dtmf: String,
        duration: Int,
        _ resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ) {
        core.playDtmf(dtmf: dtmf.utf8CString[0], durationMs: duration)
        resolve(true)
    }
    
    /**
     @ReactMethod
       fun sendDTMF(options: ReadableMap, promise: Promise) {
         try {
           val dtmf = options.getString("dtmf") ?: throw Exception("dtmf没传，无法调用sendDTMF")
           val callId = options.getString("callId") ?: throw Exception("callId没传，无法调用sendDTMF")
           val call = core.getCallByCallid(callId) ?: throw Exception("无法通过callId:${callId}找到call对象.")
           call.sendDtmf(dtmf.toCharArray()[0])
           promise.resolve(true)
         } catch(err: Exception) {
           promise.reject("调用sendDTMF失败.", err)
         }
       }
     */
    @objc(sendDTMF:withResolver:withRejecter:)
    func sendDTMF(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ) {
        do {
            let dtmf = options["dtmf"] as? String
            if((dtmf == nil)) {
                try throwError(message: "dtmf 未传")
            }
            let callId = options["callId"]
            if(callId == nil) {
                try throwError(message: "callId 未传")
            }
            let call = core.getCallByCallid(callId: callId as! String)
            try call?.sendDtmf(dtmf: dtmf!.utf8CString[0])
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用 sendDTMF 失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun startRecording(options: ReadableMap, promise: Promise){
         try {
           //val recordFilePath = options.getString("recordFilePath") ?: throw Exception("必须传入recordFilePath")
           val callId = options.getString("callId") ?: throw Exception("callId没传")
           val call = core.getCallByCallid(callId) ?: throw Exception("无法通过callId:${callId}找到call对象")
           /*if(call.state != Call.State.StreamsRunning) {
             throw Exception("当前不处于通话状态，无法录音")
           }*/
           if(call.params.isRecording) {
             return
           }
           call.startRecording()
           promise.resolve(call.params.isRecording)
         } catch (err: Exception) {
           promise.reject("调用开始录音失败.", err);
         }
       }
     */
    @objc(startRecording:withResolver:withRejecter:)
    func startRecording(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ) {
        do {
            let callId = options["callId"] as! String
            let call = core.getCallByCallid(callId: callId)
            if(call == nil) {
                try throwError(message: "无法通过 callId 找到 call 对象")
            }
            if((call?.params?.isRecording) != nil) {
                try throwError(message: "正在录音中请勿重复调用")
            }
            call?.startRecording()
            resolve(call?.params?.isRecording)
        } catch let error as NSError {
            reject(nil, "调用 startRecording 失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun stopRecording(options: ReadableMap, promise: Promise) {
         try {
           val callId = options.getString("callId") ?: throw Exception("callId没传")
           val call = core.getCallByCallid(callId) ?: throw Exception("无法通过callId:${callId}找到call对象")
           if(!call.params.isRecording) {
             throw Exception("当前call未在录音，无需关闭录音")
           }
           call.stopRecording()
           promise.resolve(call.params.isRecording)
         } catch(err: Exception) {
           promise.reject("调用停止录音失败.", err)
         }
       }
     */
    @objc(stopRecording:withResolver:withRejecter:)
    func stopRecording(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ) {
        do {
            let callId = try processDictionary(
                dictionary: options, key: "callId"
            ) as! String
            let call = core.getCallByCallid(callId: callId)
            if(call == nil) {
                try throwError(message: "无法通过 callId 找到 call 对象")
            }
            if((call?.params?.isRecording) != nil) {
                try throwError(message: "正在录音中请勿重复调用")
            }
            call?.startRecording()
            resolve(call?.params?.isRecording)
        } catch let error as NSError {
            reject(nil, "调用 stopRecording 失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun transferTo(options: ReadableMap, promise: Promise) {
         try {
           val targetUri = options.getString("targetUri") ?: throw Exception("targetUri参数必传")
           val callId = options.getString("callId") ?: throw Exception("callId没传")
           val call = core.getCallByCallid(callId) ?: throw Exception("无法通过callId:${callId}找到call对象")
           val toAddress = core.interpretUrl(targetUri) ?: throw Exception("盲转对方地址创建失败")
           promise.resolve(call.transferTo(toAddress))
         } catch (err: Exception) {
           promise.reject("调用盲转失败.", err)
         }
       }
     */
    @objc(transferTo:withResolver:withRejecter:)
    func transferTo(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock
    ) {
        do {
            let targetUri = try processDictionary(
                dictionary: options, key: "targetUri"
            ) as! String
            let callId = try processDictionary(
                dictionary: options, key: "callId"
            ) as! String
            let call = core.getCallByCallid(callId: callId)
            let toAddress = core.interpretUrl(url: targetUri, applyInternationalPrefix: false)!
            resolve(try call?.transferTo(referTo: toAddress))
        } catch let error as NSError {
            reject(nil, "调用 transferTo 失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun setAudioDeviceByType(type: String, promise: Promise) {
         try {
           core.reloadSoundDevices()
           for(audioDevice in core.audioDevices) {
             if(type == "Earpiece" && audioDevice.type == AudioDevice.Type.Earpiece) {
               core.defaultOutputAudioDevice = audioDevice
               core.outputAudioDevice = audioDevice
             }
             if((type == "Earpiece" || type == "Speaker") && audioDevice.type == AudioDevice.Type.Microphone) {
               core.inputAudioDevice = audioDevice;
               core.defaultInputAudioDevice = audioDevice
             }
             if(type == "Speaker" && audioDevice.type == AudioDevice.Type.Speaker) {
               core.outputAudioDevice = audioDevice;
               core.defaultOutputAudioDevice = audioDevice;
             }
             if(audioDevice.type == AudioDevice.Type.Bluetooth && type == "Bluetooth") {
               when (audioDevice?.capabilities) {
                   AudioDevice.Capabilities.CapabilityAll -> {
                     core.outputAudioDevice = audioDevice
                     core.inputAudioDevice = audioDevice
                     core.defaultOutputAudioDevice = audioDevice
                     core.defaultInputAudioDevice = audioDevice
                   }
                   AudioDevice.Capabilities.CapabilityPlay -> {
                     core.outputAudioDevice = audioDevice
                     core.defaultOutputAudioDevice = audioDevice
                   }
                   AudioDevice.Capabilities.CapabilityRecord -> {
                     core.inputAudioDevice = audioDevice;
                     core.defaultInputAudioDevice = audioDevice
                   }
                   else -> {

                   }
               }
             }
             if(audioDevice.type == AudioDevice.Type.Headset && type == "Headset") {
               when (audioDevice?.capabilities) {
                 AudioDevice.Capabilities.CapabilityAll -> {
                   core.outputAudioDevice = audioDevice
                   core.inputAudioDevice = audioDevice
                   core.defaultOutputAudioDevice = audioDevice
                   core.defaultInputAudioDevice = audioDevice
                 }
                 AudioDevice.Capabilities.CapabilityPlay -> {
                   core.outputAudioDevice = audioDevice
                   core.defaultOutputAudioDevice = audioDevice
                 }
                 AudioDevice.Capabilities.CapabilityRecord -> {
                   core.inputAudioDevice = audioDevice
                   core.defaultInputAudioDevice = audioDevice
                 }
                 else -> {

                 }
               }
             }
           }
           promise.resolve(true);
         } catch (err: Exception) {
           promise.reject("使用type设置外放设备失败", err)
         }
       }
     
     */
    @objc(setAudioDeviceByType:withResolver:withRejecter:)
    func setAudioDeviceByType(
        type: String,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            core.reloadSoundDevices()
            for audioDevice in core.audioDevices {
                if(type == "Earpiece" && audioDevice.type == AudioDevice.Kind.Earpiece) {
                  core.defaultOutputAudioDevice = audioDevice
                  core.outputAudioDevice = audioDevice
                }
                if(type == "Speaker" && audioDevice.type == AudioDevice.Kind.Speaker) {
                  core.outputAudioDevice = audioDevice;
                  core.defaultOutputAudioDevice = audioDevice;
                }
                if((type == "Earpiece" || type == "Speaker") && audioDevice.type == AudioDevice.Kind.Microphone) {
                  core.inputAudioDevice = audioDevice;
                  core.defaultInputAudioDevice = audioDevice
                }
                
                if(audioDevice.type == AudioDevice.Kind.Bluetooth && type == "Bluetooth") {
                    let capabilities = audioDevice.capabilities
                    switch capabilities {
                    case .CapabilityAll:
                        core.outputAudioDevice = audioDevice
                        core.inputAudioDevice = audioDevice
                        core.defaultOutputAudioDevice = audioDevice
                        core.defaultInputAudioDevice = audioDevice
                    case .CapabilityPlay:
                        core.outputAudioDevice = audioDevice
                        core.defaultOutputAudioDevice = audioDevice
                    case .CapabilityRecord:
                        core.inputAudioDevice = audioDevice
                        core.defaultInputAudioDevice = audioDevice
                    default:
                        break
                    }
                }
                
                if(audioDevice.type == AudioDevice.Kind.Headset && type == "Headset") {
                    let capabilities = audioDevice.capabilities
                    switch capabilities {
                    case .CapabilityAll:
                        core.outputAudioDevice = audioDevice
                        core.inputAudioDevice = audioDevice
                        core.defaultOutputAudioDevice = audioDevice
                        core.defaultInputAudioDevice = audioDevice
                    case .CapabilityPlay:
                        core.outputAudioDevice = audioDevice
                        core.defaultOutputAudioDevice = audioDevice
                    case .CapabilityRecord:
                        core.inputAudioDevice = audioDevice
                        core.defaultInputAudioDevice = audioDevice
                    default:
                        break
                    }
                }
            }
            
            resolve(true)
        } catch {
            reject(nil, "调用setAudioDeviceByType失败", nil)
        }
    }
    
    /**
     @ReactMethod
       fun isOnHold(options: ReadableMap, promise: Promise){
         try {
           if (core.callsNb == 0) return
           val callId = options.getString("callId")
           val call = core.getCallByCallid(callId) ?: throw Exception("不存在的callId，无法获取是否保持的状态.")

           val params = Arguments.createMap();
           params.putBoolean("local", call.state == Call.State.Paused || call.state == Call.State.Pausing)
           params.putBoolean("remote", call.state == Call.State.PausedByRemote)
           promise.resolve(params)
         } catch (err: Exception) {
           promise.reject(err)
         }
       }
     */
    @objc(isOnHold:withResolver:withRejecter:)
    func isOnHold(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            if(core.callsNb == 0) {
                try throwError(message: "不存在的callId，无法获取是否保持的状态.")
            }
            
            let callId = options["callId"] as! String
            let call = core.getCallByCallid(callId: callId)
            var params = [String: Any]()
            params["local"] = call?.state == .Paused || call?.state == .Pausing
            params["remote"] = call?.state == .PausedByRemote
            resolve(params)
        } catch let error as NSError {
            reject(nil, "调用isOnHold失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun toggleHold(options: ReadableMap, promise: Promise) {
         try {
           if (core.callsNb == 0) throw Exception("没有激活的通话，无法修改保持")

           val callId = options.getString("callId")
           val call = core.getCallByCallid(callId) ?: throw Exception("不存在的callId，无法修改保持")

           if (call.state != Call.State.Paused && call.state != Call.State.Pausing) {
             // If our call isn't paused, let's pause it
             call.pause()
             promise.resolve(true)
           } else if (call.state != Call.State.Resuming) {
             // Otherwise let's resume it
             call.resume()
             promise.resolve(false)
           }
         } catch (err: Exception) {
           promise.reject("暂停通话失败", err)
         }
       }
     */
    @objc(toggleHold:withResolver:withRejecter:)
    func toggleHold(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            if(core.callsNb == 0) {
                try throwError(message: "不存在的callId，无法修改保持")
            }
        } catch let error as NSError {
            reject(nil, "暂停通话失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun getCallLogs(promise: Promise) {
         try {
           val callLogs = core.callLogs;
           val result = Arguments.createArray();
           for(callLog in callLogs) {
             result.pushMap(extractCallLog(callLog))
           }
           promise.resolve(result)
         } catch(err: Exception) {
           promise.reject(err)
         }
       }
     */
    @objc(getCallLogs:rejecter:)
    func getCallLogs(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            var result = [[String: Any]]()
            for callLog in core.callLogs {
                result.append(extractCallLog(callLog: callLog))
            }
            resolve(result)
        } catch let error as NSError {
            reject(nil, "调用getCallLogs失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun removeCallLog(callLogItem: ReadableMap, promise: Promise) {
         try {
           val callId = callLogItem.getString("callId") ?: return
           val callLog = core.findCallLogFromCallId(callId) ?: return
           core.removeCallLog(callLog);
           promise.resolve(true)
         } catch (err: Exception) {
           promise.reject("删除通话记录失败", err);
         }
       }
     */
    @objc(removeCallLog:withResolver:withRejecter:)
    func removeCallLog(
        callLogItem: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let callId = callLogItem["callId"] as! String
            let callLog = core.findCallLogFromCallId(callId: callId)!
            core.removeCallLog(callLog: callLog)
            resolve(true)
        } catch let error as NSError {
            reject(nil, "删除通话记录失败", error)
        }
    }
    
    /**
     @ReactMethod
       fun clearCallLogs(promise: Promise) {
         try {
           core.clearCallLogs()
           promise.resolve(true)
         } catch (err: Exception) {
           promise.reject("清空通话记录失败...", err)
         }
       }
     */
    @objc(clearCallLogs:rejecter:)
    func clearCallLogs(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ){
        do {
            core.clearCallLogs()
            resolve(true)
        } catch let error as NSError {
            reject(nil, "清空通话记录失败...", error)
        }
    }
    
    /**
     private fun extractCallLog(callLog: CallLog) : WritableMap {
         val map = Arguments.createMap()
         map.putString("remoteAddress", callLog.remoteAddress.asString())
         map.putString("localAddress", callLog.localAddress.asString())
         map.putString("callId", callLog.callId)
         map.putString("direction", callLog.dir.toString())
         map.putString("duration", callLog.duration.toString())
         map.putBoolean("isVideo", callLog.isVideoEnabled)
         map.putString("status", callLog.status.toString())
         map.putString("toAddress", callLog.toAddress.asString())
         map.putString("toAddressUsername", callLog.toAddress.username)
         map.putString("toAddressDisplayName", callLog.toAddress.displayName)
         map.putString("fromAddress", callLog.fromAddress.asString())
         map.putString("fromAddressUsername", callLog.fromAddress.username)
         map.putString("fromAddressDisplayName", callLog.fromAddress.displayName)
         map.putString("startDate", callLog.startDate.toString())
         return map
       }
     */
    private func extractCallLog(callLog: CallLog) -> [String: Any] {
        var map = [String: Any]()
        map["remoteAddress"] = callLog.remoteAddress?.asString()
        map["localAddress"] = callLog.localAddress?.asString()
        map["callId"] = callLog.callId
        map["direction"] = callLog.dir.rawValue == Call.Dir.Incoming.rawValue ? "Incoming" : "Outgoing"
        map["duration"] = callLog.duration
        map["isVideo"] = callLog.videoEnabled
        map["status"] = convertCallStatusToString(rawvalue: callLog.status.rawValue)
        map["toAddress"] = callLog.toAddress?.asString()
        map["toAddressUsername"] = callLog.toAddress?.username
        map["toAddressDisplayName"] = callLog.toAddress?.displayName
        map["fromAddress"] = callLog.fromAddress?.asString()
        map["fromAddressUsername"] = callLog.fromAddress?.username
        map["fromAddressDisplayName"] = callLog.fromAddress?.displayName
        map["startDate"] = callLog.startDate
        return map
    }
    
    /**
     @ReactMethod
       fun setContactUriParameters(options: ReadableMap, promise: Promise) {
         try {
           val contactUriParameters = options.getString("contactUriParameters")
          /* val username = options.getString("username") ?: throw Exception("username参数必须传")
           val domain = options.getString("domain") ?: throw Exception("domain参数必须传")
           val account = findAccountByUsernameAndDomain(username, domain) ?: throw Exception("通过 $username & $domain 找不到对应的account")*/
           val id = options.getString("id")
           val account = core.getAccountByIdkey(id) ?: throw Exception("通过 $id 找不到对应的account");
           //account.params.contactParameters = contactParameters
           val accountParams = account.params.clone()
           accountParams.contactUriParameters = contactUriParameters
           account.params = accountParams
           promise.resolve(true)
         } catch (err: Exception) {
           promise.reject("调用setContactParameters失败", err)
         }
       } */
    @objc(setContactUriParameters:withResolver:withRejecter:)
    func setContactUriParameters(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let contactUriParameters = options["contactUriParameters"] as! String
            let id = options["id"] as! String
            let account = core.getAccountByIdkey(idkey: id)!
            let accountParams = account.params?.clone()
            accountParams?.contactUriParameters = contactUriParameters
            account.params = accountParams
            resolve(true)
        } catch let error as NSError {
            reject(nil, "调用setContactUriParameters失败", error)
        }
    }

    /**
       @ReactMethod
       fun getContactUriParameters(options: ReadableMap, promise: Promise) {
         try {
           /*val username = options.getString("username") ?: throw Exception("username参数必须传")
           val domain = options.getString("domain") ?: throw Exception("domain参数必须传")
           val account = findAccountByUsernameAndDomain(username, domain) ?: throw Exception("通过 $username & $domain 找不到对应的account")*/
           val id = options.getString("id") ?: throw Exception("id参数必须传");
           val account = core.getAccountByIdkey(id) ?: throw Exception("通过 $id 找不到对应的account");
           promise.resolve(account.params.contactUriParameters)
         } catch (err: Exception) {
           promise.reject("调用getContactParameters失败", err)
         }
       }
     */
    @objc(getContactUriParameters:withResolver:withRejecter:)
    func getContactUriParameters(
        options: NSDictionary,
        resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock
    ){
        do {
            let id = options["id"] as! String
            let account = core.getAccountByIdkey(idkey: id)!
            resolve(account.params?.contactUriParameters)
        } catch let error as NSError {
            reject(nil, "调用getContactUriParameters失败", error)
        }
    }
}
