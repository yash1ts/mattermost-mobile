package com.tupp.share;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.tupp.app.MainApplication;

public class ShareActivity extends ReactActivity {
    @Override
    protected String getMainComponentName() {
        return "TuppShare";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MainApplication app = (MainApplication) this.getApplication();
        app.sharedExtensionIsOpened = true;
    }
}
