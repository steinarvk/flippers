package net.irrasjonal.flippers;

import java.lang.reflect.InvocationTargetException;

import android.os.Bundle;
import android.app.Activity;
import android.content.res.Configuration;
import android.util.Log;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebSettings.RenderPriority;
import android.webkit.WebSettings.ZoomDensity;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    Bundle webviewBundle;
    WebChromeClient chromeClient;
    WebView webview;
    FrameLayout webviewPlaceholder;
    JsInterface jsInterface;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d( "Flippers", "new activity created!" );
        
        initializeUI();
    }
    
    void initializeUI() {
        webviewPlaceholder = (FrameLayout) findViewById( R.id.webViewPlaceholder );
        
        Log.d( "Flippers", "Webview placeholder: " + webviewPlaceholder );
        
        if( webview == null ) {
            Log.d( "Flippers", "no previous webview, must create a new one" );
            chromeClient = new WebChromeClient() {
                public void onConsoleMessage(String message, int lineNumber, String sourceID) {
                    Log.d("Flippers", message + " (" + sourceID + ":" + lineNumber + ")" );
                }
                
                public boolean onConsoleMessage(ConsoleMessage cm) {
                    onConsoleMessage( cm.message(), cm.lineNumber(), cm.sourceId() );
                    return true;
                }
            };
            
            webview = new WebView(this);
            webview.setLayoutParams( new ViewGroup.LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
                   
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
            
            webview.getSettings().setRenderPriority( RenderPriority.HIGH );
            webview.getSettings().setCacheMode( WebSettings.LOAD_NO_CACHE );
            
            webview.setHorizontalScrollBarEnabled(false);
            webview.setVerticalScrollBarEnabled( false );
            
            jsInterface = new JsInterface( this );
            
            webview.addJavascriptInterface( jsInterface, "AndroidJava" );
            
            webview.loadUrl( "file:///android_asset/flippers.html" );
        } else {
            Log.d( "Flippers", "previous webview exists, no need to create a new one" );
        }
        
        webview.requestFocus( View.FOCUS_DOWN );
        
        webviewPlaceholder.addView( webview );
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        Log.d( "Flippers", "Configuration changed!" );
        webviewPlaceholder.removeAllViews();
        
        super.onConfigurationChanged( newConfig );
        
        setContentView(R.layout.activity_main);
        
        initializeUI();
    }
    
    protected void onPause() {
        super.onPause();
        
    /*
        webviewBundle = new Bundle();
        Log.d("Flippers", "saving state to bundle" );
        webview.saveState( webviewBundle );
        
        Log.d("Flippers", "onPause" );
        
        try {
            WebView.class
                .getMethod( "onPause", (Class[]) null )
                .invoke( webview, (Object[]) null );
        }
        catch( IllegalAccessException e ) {
            Log.d("Flippers", "onPause illegal access" );
        }
        catch( InvocationTargetException e ) {
            Log.d("Flippers", "onPause invocation target" );
        }
        catch( NoSuchMethodException e ) {
            Log.d("Flippers", "onPause no such method" );
        }
    */
    }
    
    protected void onStart() {
        super.onStart();
        Log.d( "Flippers", "OnStart()" );
    }
    
    protected void onRestart() {
        super.onRestart();
        Log.d( "Flippers", "OnRestart()" );
    }
    
    protected void onStop() {
        super.onStop();
        Log.d( "Flippers", "OnStop()" );
    }
    
    protected void onSaveInstanceState(Bundle outstate) {
        Log.d( "Flippers", "onSaveInstanceState()" );
        webview.saveState( outstate );
    }
    
    protected void onRestoreInstanceState(Bundle state) {
        super.onRestoreInstanceState(state);
        webview.restoreState(state);
    }
    
    protected void onResume() {
        super.onResume();
        
    /*
        if( webviewBundle != null ) {
            Log.d("Flippers", "loading state from bundle!" );
            webview.restoreState( webviewBundle );
            webviewBundle = null;
        } else {
            Log.d( "Flippers", "bundle is null!" );
        }
        
        Log.d("Flippers", "onResume" );
        
        try {
            WebView.class
                .getMethod( "onResume", (Class[]) null )
                .invoke( webview, (Object[]) null );
        }
        catch( IllegalAccessException e ) {
            Log.d("Flippers", "onResume illegal access" );
        }
        catch( InvocationTargetException e ) {
            Log.d("Flippers", "onResume invocation target" );
        }
        catch( NoSuchMethodException e ) {
            Log.d("Flippers", "onResume no such method" );
        }
    */
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

}
