package net.irrasjonal.flippers;

import android.os.Bundle;
import android.app.Activity;
import android.util.Log;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebSettings.ZoomDensity;

public class MainActivity extends Activity {
    
    WebChromeClient chromeClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        chromeClient = new WebChromeClient() {
            public void onConsoleMessage(String message, int lineNumber, String sourceID) {
                Log.d("Flippers", message + " (" + sourceID + ":" + lineNumber + ")" );
            }
            
            public boolean onConsoleMessage(ConsoleMessage cm) {
                onConsoleMessage( cm.message(), cm.lineNumber(), cm.sourceId() );
                return true;
            }
        };
               
        WebView webview = (WebView) findViewById( R.id.webView1 );
        webview.setWebChromeClient( chromeClient );
        
        webview.setOnTouchListener( new View.OnTouchListener() {
            public boolean onTouch(View v, MotionEvent event) {
                return event.getAction() == MotionEvent.ACTION_MOVE;
            }
        });
        
        webview.getSettings().setJavaScriptEnabled( true );
        webview.getSettings().setBuiltInZoomControls( false );
        webview.getSettings().setSupportZoom( false );
        webview.getSettings().setDefaultZoom( ZoomDensity.FAR );
        
        webview.setHorizontalScrollBarEnabled(false);
        webview.setVerticalScrollBarEnabled( false );
        
        webview.loadUrl( "file:///android_asset/flippers.html" );
        
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

}
