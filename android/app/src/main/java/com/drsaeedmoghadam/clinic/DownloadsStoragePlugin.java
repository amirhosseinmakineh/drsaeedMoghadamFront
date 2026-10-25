package com.drsaeedmoghadam.clinic;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.MimeTypeMap;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "DownloadsStorage")
public class DownloadsStoragePlugin extends Plugin {
    @PluginMethod
    public void save(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Direct Downloads storage requires Android 10 or newer.");
            return;
        }

        String filename = call.getString("filename");
        String base64 = call.getString("data");
        if (filename == null || filename.trim().isEmpty() || base64 == null) {
            call.reject("Filename and base64 data are required.");
            return;
        }

        filename = filename.replaceAll("[\\\\/\\r\\n\\u0000-\\u001f]", "_").trim();
        if (filename.equals(".") || filename.equals("..")) {
            call.reject("Invalid filename.");
            return;
        }

        final byte[] bytes;
        try {
            bytes = Base64.decode(base64, Base64.DEFAULT);
        } catch (IllegalArgumentException exception) {
            call.reject("Invalid file data.", exception);
            return;
        }

        String extension = MimeTypeMap.getFileExtensionFromUrl(filename);
        String mime = extension.isEmpty() ? null : MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase(java.util.Locale.ROOT));
        if (mime == null) mime = "application/octet-stream";

        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
        values.put(MediaStore.Downloads.MIME_TYPE, mime);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri uri = null;
        try {
            uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IllegalStateException("Could not create Downloads entry.");
            try (OutputStream stream = resolver.openOutputStream(uri)) {
                if (stream == null) throw new IllegalStateException("Could not open output stream.");
                stream.write(bytes);
                stream.flush();
            }
            ContentValues completed = new ContentValues();
            completed.put(MediaStore.Downloads.IS_PENDING, 0);
            resolver.update(uri, completed, null, null);
            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            call.resolve(result);
        } catch (Exception exception) {
            if (uri != null) resolver.delete(uri, null, null);
            call.reject("Failed to save file to Downloads.", exception);
        }
    }
}
