package com.expensivetrackerog;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;
import android.os.PowerManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class SMSBroadcastReceiver extends BroadcastReceiver {
    private static final String TAG = "SMSBroadcastReceiver";
    private SMSReceiverModule module;
    private static PowerManager.WakeLock processingWakeLock;

    public SMSBroadcastReceiver() {
        
    }

    public void setModule(SMSReceiverModule module) {
        this.module = module;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "SMS received in broadcast receiver");

        
        if (processingWakeLock == null) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            processingWakeLock = pm.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "ExpensiveTracker:SMSProcessingWakeLock"
            );
            processingWakeLock.setReferenceCounted(false);
        }

        // Acquire wake lock to ensure processing completes
        if (!processingWakeLock.isHeld()) {
            processingWakeLock.acquire(60000); // 60 seconds timeout
        }

        try {
            if (Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) {
                SmsMessage[] messages;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    messages = Telephony.Sms.Intents.getMessagesFromIntent(intent);
                } else {
                    Bundle bundle = intent.getExtras();
                    if (bundle != null) {
                        Object[] pdus = (Object[]) bundle.get("pdus");
                        if (pdus == null) {
                            Log.e(TAG, "SmsMessage pdus is null");
                            releaseWakeLock();
                            return;
                        }

                        messages = new SmsMessage[pdus.length];
                        for (int i = 0; i < pdus.length; i++) {
                            messages[i] = SmsMessage.createFromPdu((byte[]) pdus[i]);
                        }
                    } else {
                        Log.e(TAG, "Bundle is null");
                        releaseWakeLock();
                        return;
                    }
                }

                if (messages != null && messages.length > 0) {
                    StringBuilder bodyText = new StringBuilder();
                    String sender = messages[0].getOriginatingAddress();

                    for (SmsMessage message : messages) {
                        bodyText.append(message.getMessageBody());
                    }

                    String body = bodyText.toString();
                    Log.d(TAG, "SMS from: " + sender + ", body: " + body);

                    WritableMap params = Arguments.createMap();
                    params.putString("sender", sender);
                    params.putString("body", body);

                    if (module != null) {
                        module.sendEvent("sms_received", params);
                        
                        
                        module.startSmsTask(sender, body);
                    } else {
                        Log.e(TAG, "Module reference is null. Cannot send event.");
                        
                        //  launch the service directly
                        Intent headlessIntent = new Intent("BACKGROUND_SMS_TASK");
                        Bundle smsData = new Bundle();
                        smsData.putString("sender", sender);
                        smsData.putString("body", body);
                        
                        // Try to start the service directly as a fallback
                        SMSHeadlessTaskService.startTask(context, headlessIntent, smsData);
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing SMS: " + e.getMessage());
            e.printStackTrace();
        } finally {
            releaseWakeLock();
        }
    }
    
    private void releaseWakeLock() {
        if (processingWakeLock != null && processingWakeLock.isHeld()) {
            processingWakeLock.release();
            Log.d(TAG, "SMS processing wake lock released");
        }
    }
}