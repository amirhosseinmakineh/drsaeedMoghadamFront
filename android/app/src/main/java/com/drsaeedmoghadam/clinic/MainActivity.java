package com.drsaeedmoghadam.clinic;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DownloadsStoragePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
