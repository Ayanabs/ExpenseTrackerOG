package com.expensivetrackerog;

import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Telephony;
import android.os.PowerManager;
import android.content.Context;

import androidx.annotation.NonNull;
import android.os.Bundle;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SMSReceiverModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private SMSBroadcastReceiver smsReceiver;
    private boolean receiverRegistered = false;
    private static final String TAG = "SMSReceiverModule";
    private PowerManager.WakeLock wakeLock;

    public SMSReceiverModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // Initialize a wake lock to keep the CPU running during SMS processing
        PowerManager powerManager = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK, 
            "ExpensiveTracker:SMSWakeLock"
        );
        wakeLock.setReferenceCounted(false);
    }

    @NonNull
    @Override
    public String getName() {
        return "SMSReceiverModule";
    }

    public void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @ReactMethod
    public void startSmsListener(Promise promise) {
        try {
            // Always unregister existing receiver first to avoid duplicates
            if (receiverRegistered && smsReceiver != null) {
                try {
                    reactContext.unregisterReceiver(smsReceiver);
                } catch (Exception e) {
                    // Silently handle if the receiver wasn't registered
                }
                receiverRegistered = false;
            }
            
            // Create and register a new receiver
            smsReceiver = new SMSBroadcastReceiver();
            smsReceiver.setModule(this);

            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(Telephony.Sms.Intents.SMS_RECEIVED_ACTION);
            intentFilter.setPriority(999); // High priority
            reactContext.registerReceiver(smsReceiver, intentFilter);

            receiverRegistered = true;
            promise.resolve("SMS listener started with high priority");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to start SMS listener: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopSmsListener(Promise promise) {
        try {
            if (receiverRegistered && smsReceiver != null) {
                reactContext.unregisterReceiver(smsReceiver);
                receiverRegistered = false;
                promise.resolve("SMS listener stopped");
            } else {
                promise.resolve("SMS listener not running");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to stop SMS listener: " + e.getMessage());
        }
    }

    @ReactMethod
    public boolean isListenerRunning(Promise promise) {
        promise.resolve(receiverRegistered);
        return receiverRegistered;
    }

    public void startSmsTask(String sender, String body) {
        // Acquire wake lock to ensure the task completes
        if (!wakeLock.isHeld()) {
            wakeLock.acquire(60000); // Acquire for 60 seconds max
        }
        
        Intent intent = new Intent("BACKGROUND_SMS_TASK");

        Bundle smsData = new Bundle();
        smsData.putString("sender", sender);
        smsData.putString("body", body);

        SMSHeadlessTaskService.startTask(reactContext, intent, smsData);
    }
    
    // Release wake lock when app is destroyed
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
}