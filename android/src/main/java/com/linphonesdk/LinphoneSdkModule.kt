package com.linphonesdk

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.telecom.TelecomManager
import android.util.Base64
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.linphone.core.*
import org.linphone.core.tools.Log
import java.security.KeyFactory
import java.security.spec.X509EncodedKeySpec
import javax.crypto.Cipher


class LinphoneSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private lateinit var core: Core
  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }

  override fun getConstants(): MutableMap<String, Any> {
    val constants: MutableMap<String, Any> = HashMap()

    val callState: MutableMap<String, Any> = HashMap()
    val states: Array<Call.State> = Call.State.values()
    for (state in states) {
      callState[state.name] = state.toInt()
    }
    constants["CALL_STATE"] = callState

    val callStatus: MutableMap<String, Any> = HashMap()
    val status: Array<Call.State> = Call.State.values()
    for (state in status) {
      callStatus[state.name] = state.toInt()
    }
    constants["CALL_STATUS"] = callStatus
    return constants
  }

  companion object {
    const val NAME = "LinphoneSdk"
  }

  private val coreListener = object: CoreListenerStub() {
    /*override fun onAudioDevicesListUpdated(core: Core) {
      super.onAudioDevicesListUpdated(core)
      val devices = Arguments.createArray()
      for(audioDevice in core.audioDevices) {
        val deviceItem = extractAudioDevice(audioDevice)
        devices.pushMap(deviceItem)
      }
      sendEvent(reactApplicationContext, "audioDevicesListUpdated", devices)
    }*/

    override fun onAudioDeviceChanged(core: Core, audioDevice: AudioDevice) {
      super.onAudioDeviceChanged(core, audioDevice)
      sendEvent(reactApplicationContext, "audioDeviceChanged", extractAudioDevice(audioDevice))
    }

    override fun onCallLogUpdated(core: Core, callLog: CallLog) {
      super.onCallLogUpdated(core, callLog)
      sendEvent(reactApplicationContext, "callLogUpdated", extractCallLog(callLog))
    }
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
        putString("customHeader.userAgent", account.getCustomHeader("User-Agent"))
      }
      if (state == RegistrationState.Failed) {
        //params.putString("eventName", "registrationFailed")
        sendEvent(reactApplicationContext, "registrationFailed", params)
      }
      if (state == RegistrationState.Cleared) {
        //params.putString("eventName", "unregistered")
        sendEvent(reactApplicationContext, "unregistered", params)
      }
      if (state == RegistrationState.Ok) {
        //params.putString("eventName", "registered")
        sendEvent(reactApplicationContext, "registered", params)
      }
      if (state == RegistrationState.Progress) {
        sendEvent(reactApplicationContext, "registrationProgress", params)
      }
    }

    override fun onMessageSent(core: Core, chatRoom: ChatRoom, message: ChatMessage) {
      super.onMessageSent(core, chatRoom, message)
      val params = extractChatInfo(core, chatRoom, message)
      sendEvent(reactApplicationContext, "onMessageSent", params)
      message.addListener(object : ChatMessageListenerStub() {
        override fun onMsgStateChanged(message: ChatMessage, state: ChatMessage.State) {
          val messageEvent = Arguments.createMap().apply {
            putString("messageId", message.messageId)
            putString("state", message.state.toString())
          }
          when (state) {
            ChatMessage.State.InProgress -> {
              sendEvent(reactApplicationContext, "onMessageStateChange", messageEvent)
            }
            ChatMessage.State.Delivered -> {
              sendEvent(reactApplicationContext, "onMessageStateChange", messageEvent)
            }
            ChatMessage.State.NotDelivered -> {
              sendEvent(reactApplicationContext, "onMessageStateChange", messageEvent)
            }
            ChatMessage.State.Displayed -> {
              sendEvent(reactApplicationContext, "onMessageStateChange", messageEvent)
            }
            else -> {
              sendEvent(reactApplicationContext, "onMessageStateChange", messageEvent)
            }
          }
        }

//        override fun onMsgFileTransferProgressChanged(message: ChatMessage, progress: Float) {
//          // 文件传输进度更新
//        }
//
//        override fun onMsgFileTransferRecv(message: ChatMessage, content: Content) {
//          // 文件接收
//        }
//
//        override fun onMsgFileTransferSent(message: ChatMessage, content: Content) {
//          // 文件发送
//        }
      })
    }

    override fun onChatRoomRead(core: Core, chatRoom: ChatRoom) {
      super.onChatRoomRead(core, chatRoom)
      val params = Arguments.createMap().apply {
        val chatRoomParams = Arguments.createMap().apply {
          putInt("unreadCount", chatRoom.unreadMessagesCount)
          putString("peerAddress", chatRoom.peerAddress.asString())
          putString("localAddress", chatRoom.localAddress.asString())
          putString("state", chatRoom.state.toString())
        }
        putMap("chatRoom", chatRoomParams);
      }
      sendEvent(reactApplicationContext, "onChatRoomRead", params)
    }

    override fun onMessageReceived(core: Core, chatRoom: ChatRoom, message: ChatMessage) {
      super.onMessageReceived(core, chatRoom, message)
      val params = Arguments.createMap().apply {
        putString("fromAddress", message.fromAddress.asString())
        putString("localAddress", message.localAddress.asString())
        val chatRoomParams = Arguments.createMap().apply {
          putInt("unreadCount", chatRoom.unreadMessagesCount)
          putString("peerAddress", chatRoom.peerAddress.asString())
          putString("localAddress", chatRoom.localAddress.asString())
          putString("state", chatRoom.state.toString())
        }
        putMap("chatRoom", chatRoomParams);
        val messageParams = Arguments.createMap().apply {
          putString("text", message.utf8Text)
          putString("messageId", message.messageId)
          putString("contentType", message.contentType)
          putString("fromAddress", message.fromAddress.asString())
        }
        putMap("message", messageParams)
      }
      sendEvent(reactApplicationContext, "messageReceived", params)
    }

    override fun onMessagesReceived(core: Core, chatRoom: ChatRoom, messages: Array<out ChatMessage>) {
      super.onMessagesReceived(core, chatRoom, messages)
      for (message in messages) {
        val params = Arguments.createMap().apply {
          putString("fromAddress", message.fromAddress.toString())
        }
        sendEvent(reactApplicationContext, "messageReceived", params)
      }
    }

    override fun onMessageReceivedUnableDecrypt(core: Core, chatRoom: ChatRoom, message: ChatMessage) {
      super.onMessageReceivedUnableDecrypt(core, chatRoom, message)
    }

    override fun onCallCreated(core: Core, call: Call) {
      super.onCallCreated(core, call)
      val params = Arguments.createMap().apply {
        putString("callId", call.callLog.callId)
      }

      val originator = if(call.dir == Call.Dir.Incoming) {
        "remote"
      } else {
        "local"
      }

      val isVideo = if(call.dir == Call.Dir.Incoming) {
        call.remoteParams?.isVideoEnabled == true
      } else {
        call.params.isVideoEnabled
      }
      params.putString("originator", originator)
      params.putString("remoteAddress", call.remoteAddress.asString())
      params.putString("remoteDisplayName", call.remoteAddress.displayName)
      params.putString("remoteUsername", call.remoteAddress.username)
      params.putString("localAddress", call.callLog.localAddress.asString())
      params.putString("localUserName", call.callLog.localAddress.username)
      /*params.putMap("account", Arguments.createMap().apply {
        putString("id", call.currentParams.account?.params?.idkey);
      })*/
      params.putBoolean("isVideo", isVideo)
      /*params.putMap("videoInfo", Arguments.createMap().apply {

      })
      val address = call.callLog.localAddress.asString()
      val address2 = call.callLog.fromAddress.asString()
      val address3 = call.callLog.toAddress.asString()
      val address4 = call.toAddress.asString()

      val bool = call.remoteParams?.videoDirection
      val bool2 = call.remoteParams?.receivedVideoDefinition
      val bool3 = call.remoteParams?.sentVideoDefinition
      //val boo4 = call.remoteParams?.getCustomSdpMediaAttribute(StreamType.Video, )
      val boo5 = call.remoteParams?.userData.toString()
      val boo6 = call.remoteParams?.receivedFramerate

      val boo7 = call.remoteParams?.isVideoEnabled
      val boo8 = call.currentParams?.isVideoEnabled
      val boo9 = call.params?.isVideoEnabled

      val wtf = "wtf"*/
      sendEvent(reactApplicationContext, "newRTCSession", params)
    }

    override fun onCallStateChanged(
      core: Core,
      call: Call,
      state: Call.State?,
      message: String
    ) {
      // This function will be called each time a call state changes,
      // which includes new incoming/outgoing calls
//        findViewById<TextView>(R.id.call_status).text = message
      val params = Arguments.createMap().apply {
        putMap("data", Arguments.createMap().apply {
          putString("cause", message)
        })
        putString("callId", call.callLog.callId)
        putString("callStatus", call.callLog.status.toString())
      }
      when (state) {
        Call.State.IncomingEarlyMedia -> {
          params.putString("wtf", "wtf")
        }
        Call.State.PushIncomingReceived -> {
          params.putString("originator", "remote")
        }
        Call.State.IncomingReceived -> {
          params.putString("originator", "remote")
          params.putString("eventName", "IncomingReceived");

          params.putString("remoteAddress", call.remoteAddress.asString())
          params.putString("displayName", call.remoteAddress.displayName)
          params.putString("remoteUsername", call.remoteAddress.username)
          params.putString("localAddress", call.callLog.localAddress.asString())
          /*params.putMap("account", Arguments.createMap().apply {
            putString("id", call.currentParams.account?.params?.idkey);
          })*/
          /*val address = call.callLog.localAddress.asString()
          val address2 = call.callLog.fromAddress.asString()
          val address3 = call.callLog.toAddress.asString()
          val address4 = call.toAddress.asString()*/

          params.putString("remoteContact", call.remoteContact)
          //sendEvent(reactApplicationContext, "newRTCSession", params)
        }
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
        Call.State.OutgoingRinging -> {
          params.putString("eventName", "OutgoingRinging")

          params.putString("remoteAddress", call.remoteAddress.asString())
          params.putString("displayName", call.remoteAddress.displayName);
          sendEvent(reactApplicationContext, "callStateChanged", params)
        }
        Call.State.OutgoingEarlyMedia -> {
          params.putString("eventName", "OutgoingEarlyMedia")
          sendEvent(reactApplicationContext, "callStateChanged", params)
        }
        Call.State.Connected -> {
          params.putString("eventName", "Connected")
          sendEvent(reactApplicationContext, "callStateChanged", params)
        }
        Call.State.StreamsRunning -> {
          val wtf = call.currentParams?.receivedFramerate
          val wtf2 = call.remoteParams?.receivedFramerate
          val wtf3 = call.params.receivedFramerate

          params.putString("eventName", "StreamsRunning")
          sendEvent(reactApplicationContext, "callStateChanged", params)
          // This state indicates the call is active.
          // You may reach this state multiple times, for example after a pause/resume
          // or after the ICE negotiation completes
          // Wait for the call to be connected before allowing a call update
//            findViewById<Button>(R.id.pause).isEnabled = true
//            findViewById<Button>(R.id.pause).text = "Pause"
//            findViewById<Button>(R.id.toggle_video).isEnabled = true

          // Only enable toggle camera button if there is more than 1 camera and the video is enabled
          // We check if core.videoDevicesList.size > 2 because of the fake camera with static image created by our SDK (see below)
//            findViewById<Button>(R.id.toggle_camera).isEnabled = core.videoDevicesList.size > 2 && call.currentParams.videoEnabled()
        }
        Call.State.Paused -> {
          params.putString("eventName", "Paused")
          sendEvent(reactApplicationContext, "callStateChanged", params)
          // When you put a call in pause, it will became Paused
//            findViewById<Button>(R.id.pause).text = "Resume"
//            findViewById<Button>(R.id.toggle_video).isEnabled = false
        }
        Call.State.PausedByRemote -> {
          params.putString("eventName", "PausedByRemote")
          sendEvent(reactApplicationContext, "callStateChanged", params)
          // When the remote end of the call pauses it, it will be PausedByRemote
        }
        Call.State.Resuming -> {
          params.putString("eventName", "Resuming")
          sendEvent(reactApplicationContext, "callStateChanged", params)
        }
        Call.State.Updating -> {
          params.putString("eventName", "Updating")
          sendEvent(reactApplicationContext, "callStateChanged", params)
          // When we request a call update, for example when toggling video
        }
        Call.State.UpdatedByRemote -> {
          params.putString("eventName", "UpdatedByRemote")
          sendEvent(reactApplicationContext, "callStateChanged", params)
          // When the remote requests a call update
        }
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
        Call.State.End -> {
          params.putString("eventName", "End")
          sendEvent(reactApplicationContext, "callStateChanged", params)
        }
        Call.State.Error -> {
          params.putString("eventName", "Error")
          sendEvent(reactApplicationContext, "callStateChanged", params)
        }
        else -> {

        }
      }
    }
  }

  @ReactMethod()
  fun initCore(promise: Promise) {
    try {
      val factory = Factory.instance()
      factory.setDebugMode(true, "debug")
      core = factory.createCore(null, null, reactApplicationContext)
      core.addListener(coreListener)
      core.isPushNotificationEnabled = true
      core.isVideoCaptureEnabled = true
      core.isVideoDisplayEnabled = true
      core.playbackGainDb = 3.0f
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("初始化linphone-sdk失败.", e)
    }
  }

  @ReactMethod
  fun start(promise: Promise) {
    try {
      core.start()
      core.config.setBool("misc", "hide_empty_chat_rooms", false)
      core.addContentTypeSupport("text/html")
      promise.resolve(true)
    } catch(err: Exception) {
      promise.reject(err)
    }
  }

  @ReactMethod
  fun stop(promise: Promise){
    try {
      core.stop()
      promise.resolve(true)
    } catch(err: Exception) {
      promise.reject(err)
    }
  }

  @ReactMethod
  fun userAgentInit(options: ReadableMap, promise: Promise) {
    try {
      //为了兼容jssip的api，所以username取出来的内容实际对应linphone-sdk是address
      /*val addressAll = options.getString("username").toString()
      val regex = "sip:(.*)@(.*)".toRegex()

      val matchResult = regex.find(addressAll)
      val linphoneUsername: String?;
      val domain: String?;
      if (matchResult != null) {
        linphoneUsername = matchResult.groupValues[1]
        domain = matchResult.groupValues[2]
      } else {
        throw Exception("configuration中的username格式不对.无法分拆成适用于linphone-sdk的username和domain");
      }*/

      val linphoneUsername = options.getString("username").toString()
      val password = options.getString("password").toString()
      val domain = options.getString("domain").toString()
      val displayName = options.getString("displayName").toString()
      val id = options.getString("id").toString()
      val proxyDomain = options.getString("proxyDomain")
      val transportType = options.getString("transportType").toString()
      val stunDomain = options.getString("stunDomain").toString()
      val stunPort = options.getString("stunPort").toString()
      val stunEnabled = options.getBoolean("stunEnabled")
      val contactParams = options.getString("contactParams").toString()
      val isDefault = options.getBoolean("isDefault")
      if(linphoneUsername.isNotEmpty() && domain.isNotEmpty()) {
        val authInfo = Factory.instance().createAuthInfo(linphoneUsername, null, password, null, null, domain, null)
        val accountParams = core.createAccountParams()
        val identity = Factory.instance().createAddress("sip:$linphoneUsername@$domain")
        identity?.displayName = displayName
        //identity?.setUriParams(contactParams)
        accountParams.identityAddress = identity
        accountParams.contactUriParameters = contactParams
        accountParams.idkey = id;
        val proxyAddress = Factory.instance().createAddress("sip:${if(proxyDomain.isNullOrEmpty()) domain else proxyDomain  }")
        //proxyAddress?.setUriParams(contactParams)
        //TODO("displayName")
        //proxyAddress?.displayName = options.getString("displayName")
        val targetTransportType = when (transportType) {
          "UDP" -> TransportType.Udp
          "TCP" -> TransportType.Tcp
          "TLS" -> TransportType.Tls
          else -> TransportType.Udp
        }
        proxyAddress?.transport = targetTransportType

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
        accountParams.natPolicy = newNatPolicy
        accountParams.serverAddress = proxyAddress
        accountParams.isRegisterEnabled = false
        //accountParams.isRegisterEnabled = true
        accountParams.pushNotificationAllowed = false
        accountParams.expires = 30

        if (!core.isPushNotificationAvailable) {
          core.isPushNotificationAvailable;
        }

        core.isNativeRingingEnabled = true;
        /*for (audioDevice in core.audioDevices) {
          if (audioDevice.type == AudioDevice.Type.Earpiece) {
            core.defaultOutputAudioDevice = audioDevice
          }
        }*/

        val account = core.createAccount(accountParams)
        core.addAuthInfo(authInfo)
        core.addAccount(account)
        if(isDefault) {
          core.defaultAccount = account
        }
        core.videoActivationPolicy.automaticallyAccept = true;
        core.config.setBool("video", "auto_resize_preview_to_keep_ratio", true)
        // We can also register a callback on the Account object
        account.addListener { _, state, message ->
          // There is a Log helper in org.linphone.core.tools package
          Log.i("[Account] Registration state changed: $state, $message")
        }
      } else {
        throw Exception("configuration中的username以及domain不能为空.");
      }
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  @ReactMethod
  fun registerIt(options: ReadableMap, promise: Promise){
    try {
      /*val username = options.getString("username") ?: throw Error("用户名参数为必须")
      val domain = options.getString("domain") ?: throw Error("域名参数为必须")
      val account = findAccountByUsernameAndDomain(username, domain) ?: throw Error("找不到对应的account")*/
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

  @ReactMethod
  fun unregister(options: ReadableMap, promise: Promise) {
    try {
      /*val username = options.getString("username") ?: throw Error("用户名参数为必须")
      val domain = options.getString("domain") ?: throw Error("域名参数为必须")
      val account = findAccountByUsernameAndDomain(username, domain) ?: throw Error("找不到对应的account")*/
      val id =  options.getString("id") ?: throw Exception("账户id必须传入");
      val account = core.getAccountByIdkey(id) ?: throw Exception("找不到对应的account");
      val clonedParams = account.params.clone()
      clonedParams.isRegisterEnabled = false
      account.params = clonedParams
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("调用unregister失败", e)
    }
  }

  private fun findTargetAuthInfo(username: String, domain: String): AuthInfo? {
    return core.authInfoList.find { it.username == username && it.domain == domain }
  }

  private fun findAccountByUsernameAndDomain(username: String, domain: String): Account? {
    val identity = Factory.instance().createAddress("sip:$username@$domain")
    var targetAccount: Account? = null;
    for(account in core.accountList) {
      val accountParams = account.params;
      val targetIdentity = accountParams.identityAddress;
      if(username == targetIdentity?.username && domain == targetIdentity.domain) {
        targetAccount = account
      }
      /*if (identity != null && targetIdentity != null) {
        if(identity.equal(targetIdentity)) {
          targetAccount = account
        }
      }*/
    }
    return targetAccount
  }

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

  @ReactMethod
  fun updateAccount(options: ReadableMap, promise: Promise) {
    try {
      /*val linphoneUsername = options.getString("username").toString()
      val password = options.getString("password").toString()
      val domain = options.getString("domain").toString()*/

      val prevSipConfig = options.getMap("prevSipConfig")
      val newSipConfig = options.getMap("newSipConfig")

      val prevLinphoneUsername = prevSipConfig?.getString("username").toString()
      var prevPassword = prevSipConfig?.getString("password").toString()
      var prevDomain = prevSipConfig?.getString("domain").toString()
      if(prevLinphoneUsername.isNotEmpty() && prevDomain.isNotEmpty()) {
        val targetAccount = findAccountByUsernameAndDomain(prevLinphoneUsername, prevDomain)
        val targetAuthInfo = findTargetAuthInfo(prevLinphoneUsername, prevDomain)

        if(targetAccount != null && targetAuthInfo != null) {
          val linphoneUsername = newSipConfig?.getString("username").toString()
          val password = newSipConfig?.getString("password").toString()
          val domain = newSipConfig?.getString("domain").toString()

          val identity = Factory.instance().createAddress("sip:$linphoneUsername@$domain")

          targetAuthInfo.username = linphoneUsername;
          targetAuthInfo.password = password;
          targetAuthInfo.domain = domain;

          targetAccount.params.identityAddress = identity
          promise.resolve(true)
        } else {
          throw Exception("无法找到之前的账户信息,更新账号失败.")
        }
      } else {
        throw Exception("更新Sip账户前的username和domain为空.无法更新")
      }


      /*if(linphoneUsername.isNotEmpty() && domain.isNotEmpty()) {

      } else {
        throw Exception("username或者域名不能为空");
      }*/
    } catch (err: Exception) {
      promise.reject("更新Sip信息失败.", err)
    }
  }

  @ReactMethod
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

  @ReactMethod
  fun answer(options: ReadableMap, promise: Promise) {
    try {
      val mediaConstraints = options.getMap("mediaConstraints")
      val needAudio = mediaConstraints?.getBoolean("audio")
      val needVideo = mediaConstraints?.getBoolean("video")
      val previewVideoViewId = options.getInt("previewVideoViewId")
      val remoteVideoViewId = options.getInt("remoteVideoViewId")
      val recordFilePath = options.getString("recordFilePath")
      val callId = options.getString("callId") ?: throw Exception("callId必须传入")
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

  @ReactMethod
  fun terminate(options: ReadableMap, promise: Promise) {
    try {
      /*if (core.callsNb == 0) {
        throw Exception("当前不存在通话.无法挂断")
      }*/

      val callId = options.getString("linphoneCallId") ?: throw Exception("linphoneCallId必须传入")
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

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: Any?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  @ReactMethod
  fun addListener(eventName: String) {
    var wtf:String
  }

  @ReactMethod
  fun removeListeners(count: Int) {
  }

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

  private fun _isSpeakerEnabled():Boolean {
    val currentAudioDevice = core.currentCall?.outputAudioDevice
    return currentAudioDevice?.type == AudioDevice.Type.Speaker
  }

  private fun _isCoreSpeakerEnabled():Boolean {
    val currentAudioDevice = core.outputAudioDevice
    return currentAudioDevice?.type == AudioDevice.Type.Speaker
  }

  @ReactMethod
  fun isSpeakerEnabled(promise: Promise){
    promise.resolve(_isSpeakerEnabled())
  }

  private fun _isCallSpeakerEnabled(callId: String): Boolean {
    val call = core.getCallByCallid(callId) ?: throw Exception("不存在的callId，无法获取外放状态")
    return call.outputAudioDevice?.type == AudioDevice.Type.Speaker
  }

  @ReactMethod
  fun isCallSpeakerEnabled(callId: String, promise: Promise) {
    try {
      promise.resolve(_isCallSpeakerEnabled(callId))
    } catch (err: Exception) {
      promise.reject("判断当前通话是否为外放失败", err)
    }
  }

  @ReactMethod
  fun isCoreSpeakerEnabled(promise: Promise) {
    promise.resolve(_isCoreSpeakerEnabled())
  }

  @ReactMethod
  fun toggleSpeaker(promise: Promise) {
    // Get the currently used audio device
    /*val currentAudioDevice = core.currentCall?.outputAudioDevice*/
    try {
      val speakerEnabled = _isSpeakerEnabled()

      // We can get a list of all available audio devices using
      // Note that on tablets for example, there may be no Earpiece device
      for (audioDevice in core.audioDevices) {
        if (speakerEnabled && audioDevice.type == AudioDevice.Type.Earpiece) {
          core.currentCall?.outputAudioDevice = audioDevice
          return promise.resolve(false)
        } else if (!speakerEnabled && audioDevice.type == AudioDevice.Type.Speaker) {
          core.currentCall?.outputAudioDevice = audioDevice
          return promise.resolve(true)
        } /*else if (audioDevice.type == AudioDevice.Type.Bluetooth) {
           If we wanted to route the audio to a bluetooth headset
          core.currentCall?.outputAudioDevice = audioDevice
        }*/
      }
    } catch (err: Exception) {
      promise.reject("更改是否外放失败.", err)
    }
  }

  @ReactMethod
  fun toggleCallSpeaker(callId: String, promise: Promise) {
    try {
      val speakerEnabled = _isCallSpeakerEnabled(callId)
      val call = core.getCallByCallid(callId) ?: throw Exception("不存在的callId，无法修改外放状态")
      for (audioDevice in core.audioDevices) {
        if (speakerEnabled && audioDevice.type == AudioDevice.Type.Earpiece) {
          call.outputAudioDevice = audioDevice
          return promise.resolve(false)
        } else if (!speakerEnabled && audioDevice.type == AudioDevice.Type.Speaker) {
          call.outputAudioDevice = audioDevice
          return promise.resolve(true)
        } /*else if (audioDevice.type == AudioDevice.Type.Bluetooth) {
           If we wanted to route the audio to a bluetooth headset
          core.currentCall?.outputAudioDevice = audioDevice
        }*/
      }
      throw Exception("无法找到对应的外放设备，切换外放模式失败")
    } catch (err: Exception) {
      return promise.reject("更改Core是否外放失败.", err)
    }
  }

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
        promise.resolve(_isCoreSpeakerEnabled())
      }
    } catch (err: Exception) {
      promise.reject("更改Core是否外放失败.", err)
    }
  }

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

  @ReactMethod
  fun setAudioDeviceById(id: String, promise: Promise) {
    try {
      core.reloadSoundDevices()
      for (audioDevice in core.audioDevices) {
        if(audioDevice.id == id) {

        }
      }
    } catch (err: Exception) {
      promise.reject("使用id设置外放设备失败", err)
    }
  }

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

  @ReactMethod
  fun toggleCamera(promise: Promise) {
    // Currently used camera
    val currentDevice = core.videoDevice

    // Let's iterate over all camera available and choose another one
    for (camera in core.videoDevicesList) {
      // All devices will have a "Static picture" fake camera, and we don't want to use it
      if (camera != currentDevice && camera != "StaticImage: Static picture") {
        core.videoDevice = camera
        promise.resolve(camera)
        break
      }
    }
  }

  @ReactMethod
  fun isOnHold(options: ReadableMap, promise: Promise){
    try {
      if (core.callsNb == 0) return
      val callId = options.getString("callId") ?: throw Exception("必须传入callId")
      val call = core.getCallByCallid(callId) ?: throw Exception("不存在的callId，无法获取是否保持的状态.")

      val params = Arguments.createMap();
      params.putBoolean("local", call.state == Call.State.Paused || call.state == Call.State.Pausing)
      params.putBoolean("remote", call.state == Call.State.PausedByRemote)
      promise.resolve(params)
    } catch (err: Exception) {
      promise.reject(err)
    }
  }

  @ReactMethod
  fun toggleHold(options: ReadableMap, promise: Promise) {
    try {
      if (core.callsNb == 0) throw Exception("没有激活的通话，无法修改保持")

      val callId = options.getString("callId") ?: throw Exception("必须传入callId")
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

  private fun extractAudioDevice(audioDevice: AudioDevice) : WritableMap {
    val audioItem = Arguments.createMap();
    audioItem.putString("id", audioDevice.id)
    audioItem.putString("deviceName", audioDevice.deviceName)
    audioItem.putString("type", audioDevice.type.toString())
    audioItem.putString("driverName", audioDevice.driverName)
    audioItem.putString("capabilities", audioDevice.capabilities.toString())
    return audioItem;
  }

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

  @ReactMethod
  fun clearCallLogs(promise: Promise) {
    try {
      core.clearCallLogs()
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("清空通话记录失败...", err)
    }
  }

  private fun checkOverlay(): Boolean {
    return Settings.canDrawOverlays(reactApplicationContext)
  }

  @ReactMethod
  fun checkOverlayPermission(promise: Promise){
    try{
      val result = checkOverlay()
      promise.resolve(result)
    } catch(err:Exception) {
      promise.reject("检测悬浮窗权限出错...", err)
    }
  }

  @ReactMethod
  fun openOverlaySettings(promise: Promise){
    try {

      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:" + reactApplicationContext.packageName)
      )
      val bundle = Bundle()
      reactApplicationContext.startActivityForResult(intent, 0, bundle)
      reactApplicationContext.addActivityEventListener(object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
          promise.resolve(checkOverlay())
        }
      })
    } catch(err: Exception) {
      promise.reject("打开悬浮窗权限失败...", err);
    }
  }

  @ReactMethod
  fun openPowerSettings(promise: Promise) {
    try {
        val intent = Intent(
          Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
          Uri.parse("package:" + reactApplicationContext.packageName)
        )
        val bundle = Bundle()
        promise.resolve(reactApplicationContext.startActivityForResult(intent, 0, bundle))
    } catch (err: Exception) {
      promise.reject("打开电源管理失败", err);
    }
  }

  @ReactMethod
  fun isIgnoringBatteryOptimizations(promise: Promise) {
    try {
      val powerManager = reactApplicationContext.getSystemService(ReactApplicationContext.POWER_SERVICE) as PowerManager
      promise.resolve(powerManager.isIgnoringBatteryOptimizations(reactApplicationContext.packageName))
    } catch (err: Exception) {
      promise.reject("获取电源是否被优化状态失败", err);
    }
  }

  @ReactMethod
  fun openNotificationSettings(promise: Promise){
    try {
      val intent = Intent(
        Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS,
        Uri.parse("package:" + reactApplicationContext.packageName)
      )
      val bundle = Bundle()
      promise.resolve(reactApplicationContext.startActivityForResult(intent, 0, bundle))
    } catch (err: Exception) {
      promise.reject("打开通知管理失败", err);
    }
  }

  @ReactMethod
  fun enterForeground(promise: Promise){
    try {
      core.enterForeground()
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("通知Linphone进入前台状态失败...", err);
    }
  }

  @ReactMethod
  fun enterBackground(promise: Promise){
    try {
      core.enterBackground()
      promise.resolve(true)
    } catch(err: Exception) {
      promise.reject("通知Linphone进入后台失败...", err)
    }
  }

  @ReactMethod
  fun getDefaultRingtoneUri(promise: Promise) {
    try {
      val uri = RingtoneManager.getActualDefaultRingtoneUri(reactApplicationContext, RingtoneManager.TYPE_RINGTONE);
      promise.resolve(uri.toString())
    } catch(err: Exception) {
      promise.reject("获取默认铃声失败...", err)
    }
  }

  @ReactMethod
  fun processPushNotification(promise: Promise) {
    try {
      core.ensureRegistered()
      promise.resolve(true)
    } catch(err: Exception) {
      promise.reject("手动接收推送失败.", err)
    }
  }

  @ReactMethod
  fun refreshRegisters(promise: Promise) {
    try {
      core.refreshRegisters()
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("主动刷新注册信息失败.", err)
    }
  }

  @ReactMethod
  fun playDTMF(dtmf: String, duration: Int, promise: Promise) {
    try {
      core.playDtmf(dtmf.toCharArray()[0], duration)
      promise.resolve(true)
    } catch(err: Exception) {
      promise.reject("播放拨号键音频失败.", err)
    }
  }

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

  @ReactMethod
  fun setStunServer(server: String, promise: Promise) {
    try {
      core.stunServer = server
      promise.resolve(true)
    } catch(err: Exception) {
      promise.reject("调用设置stun失败", err)
    }
  }

  @ReactMethod
  fun getStatus(options: ReadableMap, promise: Promise){
    try {
      val callId = options.getString("callId") ?: throw Exception("callId没传")
      val call = core.getCallByCallid(callId) ?: throw Exception("无法通过callId:${callId}找到call对象")

      promise.resolve(call.callLog.status)
    } catch(err: Exception) {
      promise.reject("调用Session状态失败", err)
    }
  }

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
  }

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

  @ReactMethod
  fun setContactParameters(options: ReadableMap, promise: Promise) {
    try {
      val contactParameters = options.getString("contactParameters")
      /*val username = options.getString("username") ?: throw Exception("username参数必须传")
      val domain = options.getString("domain") ?: throw Exception("domain参数必须传")
      val account = findAccountByUsernameAndDomain(username, domain) ?: throw Exception("通过 $username & $domain 找不到对应的account")*/
      val id = options.getString("id") ?: throw Exception("id参数必须传");
      val account = core.getAccountByIdkey(id) ?: throw Exception("通过 $id 找不到对应的account");
      //account.params.contactParameters = contactParameters
      val accountParams = account.params.clone()
      accountParams.contactParameters = contactParameters
      account.params = accountParams
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("调用setContactParameters失败", err)
    }
  }

  @ReactMethod
  fun getContactParameters(options: ReadableMap, promise: Promise) {
    try {
//      val username = options.getString("username") ?: throw Exception("username参数必须传")
//      val domain = options.getString("domain") ?: throw Exception("domain参数必须传")
//      val account = findAccountByUsernameAndDomain(username, domain) ?: throw Exception("通过 $username & $domain 找不到对应的account")
      val id = options.getString("id") ?: throw Exception("id参数必须传");
      val account = core.getAccountByIdkey(id) ?: throw Exception("通过 $id 找不到对应的account");
      promise.resolve(account.params.contactParameters)
    } catch (err: Exception) {
      promise.reject("调用getContactParameters失败", err)
    }
  }

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

  @ReactMethod
  fun setDefaultAccount(options: ReadableMap, promise: Promise) {
    try {
      val username = options.getString("username") ?: throw Exception("username参数必须传")
      val domain = options.getString("domain") ?: throw Exception("domain参数必须传")
      val account = findAccountByUsernameAndDomain(username, domain) ?: throw Exception("通过 $username & $domain 找不到对应的account")
      core.defaultAccount = account
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("调用setDefaultAccount失败", err)
    }
  }

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

  @ReactMethod
  fun getIdentity(promise: Promise) {
    try {
      promise.resolve(core.identity)
    } catch (err: Exception) {
      promise.reject("调用getIdentity失败", err)
    }
  }

  @ReactMethod
  fun isEchoCancellationEnabled(promise: Promise) {
    try {
      promise.resolve(core.isEchoCancellationEnabled);
    } catch (err: Exception) {
      promise.reject("调用回声消除是否启用失败", err)
    }
  }

  @ReactMethod
  fun setEchoCancellationEnabled(isEnabled: Boolean, promise: Promise) {
    try {
      core.isEchoCancellationEnabled = isEnabled
      promise.resolve(core.isEchoCancellationEnabled);
    } catch (err: Exception) {
      promise.reject("设置回声消除失败", err);
    }
  }

  @ReactMethod
  fun isAdaptiveRateControlEnabled(promise: Promise) {
    try {
      promise.resolve(core.isAdaptiveRateControlEnabled);
    } catch (err: Exception) {
      promise.reject("调用比特率自适应是否启用失败", err);
    }
  }

  @ReactMethod
  fun setAdaptiveRateControlEnabled(isEnabled: Boolean, promise: Promise) {
    try {
      core.isAdaptiveRateControlEnabled = isEnabled;
      promise.resolve(core.isAdaptiveRateControlEnabled);
    } catch (err: Exception) {
      promise.reject("设置音频比特率自适应失败", err);
    }
  }

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

  @ReactMethod
  fun isUseRfc2833ForDtmf(promise: Promise) {
    try {
      promise.resolve(core.useRfc2833ForDtmf);
    } catch (err: Exception) {
      promise.reject("获取useInfoForDtmf失败", err);
    }
  }

  private val pre_encode_length = 117
  private val pre_decode_length = 128

  @ReactMethod
  fun encryptByPublicKey(publicKey: String, data: String, promise: Promise) {
    try {
      val res = EncryptionUtil.encryptByPublicKey(publicKey, data);
      promise.resolve(res);
    } catch (err: Error) {
      promise.reject("通过公钥加密失败", err);
    }
  }

  @ReactMethod
  fun decryptByPublicKey(publicKey: String, data: String?, promise: Promise) {
    try {
      // 得到公钥
      val keySpec = X509EncodedKeySpec(Base64.decode(publicKey, Base64.DEFAULT))
      val kf = KeyFactory.getInstance("RSA")
      val keyPublic = kf.generatePublic(keySpec)
      // 数据解密
      val b_data = Base64.decode(data, Base64.DEFAULT)
      var re_data = ""
      var index = 0
      while (index * pre_decode_length < b_data.size) {
        var len_byte = pre_decode_length
        if ((index + 1) * pre_decode_length > b_data.size) len_byte =
          b_data.size - index * pre_decode_length
        val tmp_data = ByteArray(len_byte)
        System.arraycopy(b_data, index * pre_decode_length, tmp_data, 0, len_byte)
        val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
        cipher.init(Cipher.DECRYPT_MODE, keyPublic)
        val tmp_re_data = cipher.doFinal(tmp_data)
        re_data = re_data + String(tmp_re_data)
        index++
      }
      promise.resolve(re_data);
    } catch (err: Exception) {
      promise.reject("通过公钥解密数据失败", err);
    }
  }

  @ReactMethod
  fun createChatRoom(options: ReadableMap, promise: Promise) {
    try {
      val account = core.defaultAccount
      val targetSipUri = options.getString("targetSipUri") ?: throw Exception("没有传入聊天对象的地址")
      if (account == null) {
        promise.reject("创建聊天失败", "没有设置默认账户，无法创建")
        return
      }

      val targetAddress = core.createAddress(targetSipUri)
      if(targetAddress == null) {
        promise.reject("创建聊天失败", "无法找到目标地址")
        return
      }

      // 获取默认的 ChatRoomParams
      val chatRoomParams = core.createDefaultChatRoomParams()
      chatRoomParams.isGroupEnabled = false
//      chatRoomParams.isEncryptionEnabled = true
      chatRoomParams.subject = options.getString("subject") ?: targetAddress.username
//      chatRoomParams.backend = ChatRoom.Backend.FlexisipChat

      // 获取默认账户的联系人地址
      val localAddress = account.params.identityAddress
      if (localAddress == null) {
        promise.reject("ERROR_NULL_SELF_ADDRESS", "Self address is null, unable to create chat room")
        return
      }

      // 查找目标地址
//      val targetAccount = findAccountByUsernameAndDomain("8002", "192.168.250.148")
//      if (targetAccount == null) {
//        promise.reject("ERROR_NULL_TARGET_ADDRESS", "Target address is null, unable to add to chat room")
//        return
//      }

      // 创建参与者列表
//      val participants = arrayListOf<Address>()
//      participants.add(targetAddress)
      val participants = arrayOf(targetAddress)

      // 创建聊天房间
      val chatRoom: ChatRoom? = core.createChatRoom(chatRoomParams, localAddress, participants)
      if (chatRoom == null) {
        promise.reject("ERROR_CREATING_CHATROOM", "Failed to create chat room")
      } else {
        if(chatRoom.subject == null) {
          chatRoom.subject = chatRoomParams.subject
        }
        val chatRoomMap = Arguments.createMap().apply {
          putString("targetAddress", targetAddress.asString())
          putString("peerAddress", chatRoom.peerAddress.asStringUriOnly())
          putString("state", chatRoom.state.toString())
          putString("subject", chatRoom.subject)
        }
//        chatRoom.createEmptyMessage()
//        chatRoom.createMessageFromUtf8("测试一下")
//        val message = chatRoom.createEmptyMessage()
//        message.addUtf8TextContent("ceshi yixia")
//        message.send()
        promise.resolve(chatRoomMap)  // 成功时返回 chatRoom 的信息
      }
    } catch (err: Exception) {
      promise.reject("创建聊天失败", err)
    }
  }

  @ReactMethod
  fun getChatRooms(promise: Promise){
    try {
      val account = core.defaultAccount ?: throw Exception("没有找到默认账户")
      val chatRooms = account.chatRooms
      val chatRoomList = Arguments.createArray()

      /*chatRooms.forEach { chatRoom ->
        val chatRoomMap = Arguments.createMap()
        chatRoomMap.putString("peerAddress", chatRoom.peerAddress.asStringUriOnly())
        chatRoomMap.putString("localAddress", chatRoom.localAddress.toString())
        chatRoomMap.putString("state", chatRoom.state.toString())
        chatRoomList.pushMap(chatRoomMap)
      }*/

      for (chatRoom in chatRooms) {
        val chatRoomMap = Arguments.createMap()
        chatRoomMap.putString("peerAddress", chatRoom.peerAddress.asStringUriOnly())
        chatRoomMap.putString("localAddress", chatRoom.localAddress.asString())
        chatRoomMap.putString("state", chatRoom.state.toString())
        chatRoomMap.putString("subject", chatRoom.subject)
        chatRoomMap.putInt("unreadCount", chatRoom.unreadMessagesCount)
        val lastMessage = chatRoom.lastMessageInHistory
        chatRoomMap.putMap("message", lastMessage?.let { extractMessage(it) })
        chatRoomList.pushMap(chatRoomMap)
      }

      promise.resolve(chatRoomList)
    } catch (err: Exception) {
      promise.reject("获取聊天列表失败", err)
    }
  }

  @ReactMethod
  fun deleteChatRoom(options: ReadableMap, promise: Promise){
    try {
      val targetSipUri = options.getString("targetSipUri") ?: throw Exception("没有传输聊天室对象，无法删除")
      val targetAddress = core.createAddress(targetSipUri)
      val participants = arrayOf(targetAddress)
      val chatRoom = core.searchChatRoom(null, null, null, participants)
        ?: throw Exception("无法找到聊天对象，删除失败")
      core.deleteChatRoom(chatRoom)
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("删除聊天失败", err)
    }
  }

  @ReactMethod
  fun sendMessage(options: ReadableMap, promise: Promise){
    try {
      val targetSipUri = options.getString("targetSipUri") ?: throw Exception("没有传输聊天室对象账号")
      val message = options.getString("message") ?: throw Exception("消息内容不能为空")
      val targetAddress = core.createAddress(targetSipUri)
      val participants = arrayOf(targetAddress)
      val chatRoom = core.searchChatRoom(null, null, null, participants)
        ?: throw Exception("无法找到聊天室")
      val chatMessage = chatRoom.createMessageFromUtf8(message)
      chatMessage.send()
      val result = Arguments.createMap().apply {
        putString("state", chatMessage.state.toString())
        putString("message", message)
      }
      promise.resolve(result)
    } catch (err: Exception) {
      promise.reject("发送消息失败", err)
    }
  }

  @ReactMethod
  fun getChatRoomHistory(options: ReadableMap, promise: Promise) {
    try {
      val targetSipUri = options.getString("targetSipUri") ?: throw Exception("没有传输聊天室对象账号")
      val targetAddress = core.createAddress(targetSipUri)
      val participants = arrayOf(targetAddress)
      val chatRoom = core.searchChatRoom(null, null, null, participants)
        ?: throw Exception("无法找到聊天室")
      val messages = chatRoom.getHistoryRange(0, chatRoom.historySize);
      val list = Arguments.createArray()
      for(message in messages) {
        val messageMap = extractMessage(message)
        list.pushMap(messageMap)
      }
      promise.resolve(list)
    } catch (err: Exception) {
      promise.reject("获取聊天室历史数据失败", err)
    }
  }

  @ReactMethod
  fun getUnreadCount(promise: Promise){
    try {
      val params = Arguments.createMap().apply {
        putInt("messageCount", core.unreadChatMessageCount)
        putInt("missedCallsCount", core.missedCallsCount)
      }
      val accountsWithUnread = Arguments.createArray();
      for(account in core.accountList) {
        val accountParams = Arguments.createMap().apply {
          putString("id", account.params.idkey)
          putInt("messageCount", account.unreadChatMessageCount)
          putInt("missedCallsCount", account.missedCallsCount)
        }
        accountsWithUnread.pushMap(accountParams)
      }
      params.putArray("accounts", accountsWithUnread)
      promise.resolve(params)
    } catch (err: Exception) {
      promise.reject("获取未读统计失败", err)
    }
  }

  @ReactMethod
  fun markAsRead(options: ReadableMap, promise: Promise) {
    try {
      val chatRoom = _searchChatRoom(options)
      chatRoom.markAsRead()
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("标记聊天室已读失败", err)
    }
  }

  @SuppressLint("MissingPermission")
  @ReactMethod
  fun makePhoneCall(options: ReadableMap, promise: Promise) {
    try {
      val uri = Uri.fromParts(options.getString("type"), options.getString("number"), null)
      val extras = Bundle()
      extras.putBoolean(TelecomManager.EXTRA_START_CALL_WITH_SPEAKERPHONE, true)
      val telecomManager = reactApplicationContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
      telecomManager.placeCall(uri, extras)
      promise.resolve(true)
    } catch (err: Exception) {
      promise.reject("拨打原生电话失败", err)
    }
  }

  private fun _searchChatRoom(options: ReadableMap): ChatRoom {
    val targetSipUri =
      options.getString("targetSipUri") ?: throw Exception("没有传输聊天室对象账号")
    val targetAddress = core.createAddress(targetSipUri)
    val participants = arrayOf(targetAddress)
    val account = core.defaultAccount ?: throw Exception("没有默认账号，无法查找聊天室对象")
    val localAddress = account.params.identityAddress
    return core.searchChatRoom(null, localAddress, null, participants)
      ?: throw Exception("没有找到对应的聊天室")
  }

  private fun extractChatInfo(core: Core, chatRoom: ChatRoom, message: ChatMessage): WritableMap {
    val result = Arguments.createMap().apply {
      putString("fromAddress", message.fromAddress.asString())
      putString("localAddress", message.localAddress.asString())
      val chatRoomParams = Arguments.createMap().apply {
        putInt("unreadCount", chatRoom.unreadMessagesCount)
        putString("peerAddress", chatRoom.peerAddress.asString())
        putString("localAddress", chatRoom.localAddress.asString())
        putString("state", chatRoom.state.toString())
      }
      putMap("chatRoom", chatRoomParams);
      val messageParams = Arguments.createMap().apply {
        putString("text", message.utf8Text)
        putString("messageId", message.messageId)
        putString("contentType", message.contentType)
        putString("fromAddress", message.fromAddress.asString())
        putString("toAddress", message.toAddress.asString())
        putString("state", message.state.toString())
        putString("messageId", message.messageId)
      }
      putMap("message", messageParams)
    }
    return result
  }

  private fun extractMessage(message: ChatMessage) : WritableMap{
    val result = Arguments.createMap().apply {
      putString("messageId", message.messageId)
      putString("text", message.utf8Text)
      putDouble("time", message.time.toDouble())
      putString("contentType", message.contentType)
      putString("fromAddress", message.fromAddress.asString())
      putString("toAddress", message.toAddress.asString())
      putString("state", message.state.toString())
      putBoolean("isForward", message.isForward)
      putBoolean("isOutgoing", message.isOutgoing)
      putBoolean("isRead", message.isRead)
      putBoolean("isReply", message.isReply)
      putBoolean("isEphemeral", message.isEphemeral)
    }

    return result
  }

  @ReactMethod
  fun getPlaybackGainDb(promise: Promise){
    try {
      promise.resolve(core.playbackGainDb)
    } catch (err:Exception) {
      promise.reject("获取 playback 失败", err)
    }
  }

  @ReactMethod
  fun setPlaybackGainDb(value: Float, promise: Promise) {
    try {
      core.playbackGainDb = value
      promise.resolve(value)
    } catch (err: Exception) {
      promise.reject("设置 Playback 失败", err)
    }
  }

  /*@ReactMethod
  fun startRecorder(options: ReadableMap, promise: Promise){
    try {
      val recordFilePath = options.getString("recordFilePath") ?: throw Exception("recordFilePath参数必须传入")
      val recorderParams = core.createRecorderParams()
      recorderParams.fileFormat = RecorderFileFormat.Mkv;
      val recorder = core.createRecorder(recorderParams)
      recorder.open(recordFilePath)
      recorder.start()
    } catch (err: Exception) {
      promise.reject("调用startRecorder失败", err)
    }
  }

  @ReactMethod
  fun togglePause(promise: Promise) {
    try {
      if (core.callsNb == 0) return
      val call = if (core.currentCall != null) core.currentCall else core.calls[0]
      call ?: return

      if (call.state != Call.State.Paused && call.state != Call.State.Pausing) {
        call.pause()
        promise.resolve(call.state)
      } else if (call.state != Call.State.Resuming) {
        call.resume()
      }
    } catch (err: Exception) {
      promise.reject("切换暂停状态失败", err)
    }
  }*/


  /*@RequiresApi(Build.VERSION_CODES.M)
  private fun _requestPermissions(type: String){
    val activity: Activity? = currentActivity
    if(activity != null) {
      val packageManager = activity.packageManager
      val packageName = activity.packageName

      if(type == "audio") {
        if (packageManager.checkPermission(Manifest.permission.RECORD_AUDIO, packageName) != PackageManager.PERMISSION_GRANTED) {
          activity.requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), 0)
        }
      }

      if(type == "video") {
        if (packageManager.checkPermission(Manifest.permission.CAMERA, packageName) != PackageManager.PERMISSION_GRANTED) {
          activity.requestPermissions(arrayOf(Manifest.permission.CAMERA), 0)
          return
        }
      }
    }
  }*/
}
