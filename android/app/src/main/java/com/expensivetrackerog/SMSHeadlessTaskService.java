// SMSHeadlessTaskService.java
package com.expensivetrackerog;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.PowerManager;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import javax.annotation.Nullable;

public class SMSHeadlessTaskService extends HeadlessJsTaskService {
    private static final String TAG = "SMSHeadlessTaskService";
    private static PowerManager.WakeLock wakeLock;

    // Initialize wake lock - need to call only once
    private static synchronized void initWakeLock(Context context) {
        if (wakeLock == null) {
            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "ExpensiveTracker:HeadlessWakeLock"
            );
            wakeLock.setReferenceCounted(false);
        }
    }

    // Helper method to start the headless task
    public static void startTask(Context context, Intent intent, Bundle extras) {
        initWakeLock(context);
        
        // Acquire wake lock to ensure the task starts
        if (!wakeLock.isHeld()) {
            wakeLock.acquire(120000); 
        }
        
        intent.setClass(context, SMSHeadlessTaskService.class);
        if (extras != null) {
            intent.putExtras(extras);
        }
        
        // Set flags to make sure service can start in background
        intent.addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES);
        
        // Wake up the device to process the SMS
        try {
            context.startService(intent);
            Log.d(TAG, "Successfully started SMSHeadlessTaskService");
        } catch (Exception e) {
            Log.e(TAG, "Error starting service: " + e.getMessage());
            
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }
    }

    @Override
    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        if (intent == null) {
            Log.e(TAG, "Intent is null in getTaskConfig");
            releaseWakeLock();
            return null;
        }

        Bundle extras = intent.getExtras();
        if (extras == null) {
            Log.e(TAG, "Extras are null in getTaskConfig");
            releaseWakeLock();
            return null;
        }

        // Construct the SMS message object for JS
        Bundle messageData = new Bundle();
        messageData.putString("sender", extras.getString("sender", ""));
        messageData.putString("body", extras.getString("body", ""));
        
        // Create a message object similar to what we use in the JS side
        Bundle message = new Bundle();
        message.putBundle("message", messageData);

        Log.d(TAG, "Creating headless task for SMS: " + extras.getString("body", ""));
        
        // Create and return the headless task config with extended timeout
        return new HeadlessJsTaskConfig(
                "BACKGROUND_SMS_TASK",  
                Arguments.fromBundle(message),
                120000,  
                true     
        );
    }
    
    @Override
    public void onHeadlessJsTaskFinish(int taskId) {
        super.onHeadlessJsTaskFinish(taskId);
        Log.d(TAG, "Headless task finished: " + taskId);
        releaseWakeLock();
    }
    
    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            Log.d(TAG, "Wake lock released");
        }
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        releaseWakeLock();
    }
}