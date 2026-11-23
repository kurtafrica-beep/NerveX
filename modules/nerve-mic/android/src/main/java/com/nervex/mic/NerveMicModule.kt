package com.nervex.mic

import android.content.Context
import android.content.IntentFilter
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Makes Android record from a connected headset's microphone.
//
// Left alone, Android records from the phone's own mic even with Bluetooth
// earbuds in. A Bluetooth mic only works while the headset's call link is open,
// and that link is opened by choosing the headset as the "communication device"
// (the way a calling app does). The device passed to Android has to be the
// headset's speaker side, from availableCommunicationDevices; passing its mic
// side is ignored without an error.
class NerveMicModule : Module() {
  private var held = false
  private var modeBefore: Int? = null

  private val audio: AudioManager?
    get() = appContext.reactContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

  private fun kindOf(type: Int): String = when (type) {
    AudioDeviceInfo.TYPE_BLUETOOTH_SCO, AudioDeviceInfo.TYPE_BLE_HEADSET -> "bluetooth"
    AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_USB_HEADSET, AudioDeviceInfo.TYPE_USB_DEVICE -> "wired"
    AudioDeviceInfo.TYPE_BUILTIN_MIC -> "phone"
    else -> "other"
  }

  private fun describe(d: AudioDeviceInfo): Map<String, Any?> = mapOf(
    "id" to d.id.toString(),
    "type" to d.type,
    "kind" to kindOf(d.type),
    "name" to (d.productName?.toString() ?: "")
  )

  private fun inputs(am: AudioManager): List<AudioDeviceInfo> =
    am.getDevices(AudioManager.GET_DEVICES_INPUTS).toList()

  // Whether the headset's call link is up. Android keeps the last state as a sticky broadcast.
  private fun scoConnected(context: Context): Boolean? {
    return try {
      val filter = IntentFilter(AudioManager.ACTION_SCO_AUDIO_STATE_UPDATED)
      val sticky = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(null, filter, Context.RECEIVER_EXPORTED)
      } else {
        context.registerReceiver(null, filter)
      }
      val state = sticky?.getIntExtra(AudioManager.EXTRA_SCO_AUDIO_STATE, AudioManager.SCO_AUDIO_STATE_ERROR)
        ?: return null
      state == AudioManager.SCO_AUDIO_STATE_CONNECTED
    } catch (e: Exception) {
      null
    }
  }

  private fun result(kind: String, name: String, connected: Boolean, note: String): Map<String, Any?> =
    mapOf("kind" to kind, "name" to name, "connected" to connected, "note" to note)

  @Suppress("DEPRECATION")
  private fun openHeadset(): Map<String, Any?> {
    val am = audio ?: return result("phone", "", false, "no audio service")
    val context = appContext.reactContext ?: return result("phone", "", false, "no context")
    val mics = inputs(am)

    val wired = mics.firstOrNull { kindOf(it.type) == "wired" }
    val bluetoothMic = mics.firstOrNull { kindOf(it.type) == "bluetooth" }
    // The headset as Android offers it for calls (its speaker side). Some phones
    // only list the mic side once the call link is open, so either one counts.
    val callDevice = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      am.availableCommunicationDevices.firstOrNull { bluetoothMic != null && it.type == bluetoothMic.type }
        ?: am.availableCommunicationDevices.firstOrNull { kindOf(it.type) == "bluetooth" }
    } else {
      null
    }

    if (bluetoothMic == null && callDevice == null) {
      // A wired or USB mic is used by Android without any help.
      return if (wired != null) {
        result("wired", wired.productName?.toString() ?: "", true, "")
      } else {
        result("phone", "", false, "no headset mic found")
      }
    }

    val name = (bluetoothMic ?: callDevice)?.productName?.toString() ?: ""
    val classic = (bluetoothMic ?: callDevice)?.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
    var asked = false
    var note = ""
    try {
      // Calling apps hold this mode; it keeps the headset link from being dropped
      // in the moment between the start beep and the recording.
      if (modeBefore == null) modeBefore = am.mode
      am.mode = AudioManager.MODE_IN_COMMUNICATION
    } catch (e: Exception) {
      note = "mode: ${e.message}"
    }
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (callDevice != null) {
          asked = am.setCommunicationDevice(callDevice)
          if (!asked) note = "Android refused the headset"
        } else {
          note = "headset has no call link"
        }
      } else {
        am.startBluetoothSco()
        am.isBluetoothScoOn = true
        asked = true
      }
    } catch (e: Exception) {
      note = "route: ${e.message}"
    }
    held = true
    if (!asked) {
      closeHeadset()
      return result("phone", name, false, note)
    }

    // Wait for the link. Classic Bluetooth reports it; LE Audio headsets don't, so they get a fixed wait.
    var connected = false
    if (classic) {
      var waited = 0
      while (waited < 4000) {
        Thread.sleep(100)
        waited += 100
        val up = scoConnected(context)
        if (up == true) {
          connected = true
          break
        }
        if (up == null && waited >= 1500) break
      }
      // A beat for the audio route to follow the link.
      Thread.sleep(250)
    } else {
      Thread.sleep(900)
      connected = true
    }
    return result("bluetooth", name, connected, if (connected) "" else "link not confirmed")
  }

  @Suppress("DEPRECATION")
  private fun closeHeadset() {
    if (!held) return
    held = false
    val am = audio ?: return
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        am.clearCommunicationDevice()
      } else {
        am.isBluetoothScoOn = false
        am.stopBluetoothSco()
      }
    } catch (e: Exception) {
      // nothing to hand back
    }
    try {
      am.mode = modeBefore ?: AudioManager.MODE_NORMAL
    } catch (e: Exception) {
      // leave the mode as it is
    }
    modeBefore = null
  }

  override fun definition() = ModuleDefinition {
    Name("NerveMic")

    // Opens the headset's mic if there is one. Resolves once it is ready to record from.
    AsyncFunction<Map<String, Any?>>("start") {
      openHeadset()
    }

    // Hands the headset back, so music and playback sound normal again.
    Function<Boolean>("stop") {
      closeHeadset()
      true
    }

    // Every microphone Android can see right now.
    Function<List<Map<String, Any?>>>("inputs") {
      val am = audio
      if (am == null) emptyList() else inputs(am).map { describe(it) }
    }

    // Which kind of microphone a recording in progress is really coming from: "" when unknown.
    Function<String>("recordingFrom") {
      val device = audio?.activeRecordingConfigurations?.firstOrNull()?.audioDevice
      if (device == null) "" else kindOf(device.type)
    }

    OnDestroy {
      closeHeadset()
    }
  }
}
