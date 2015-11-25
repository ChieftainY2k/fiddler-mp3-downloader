import System;
import System.Windows.Forms;
import Fiddler;

// GLOBALIZATION NOTE:
// Be sure to save this file with UTF-8 Encoding if using any non-ASCII characters
// in strings, etc.
//
// JScript Reference
// http://www.fiddlertool.com/redir/?id=msdnjsnet
//
// FiddlerScript Reference
// http://www.fiddlertool.com/redir/?id=fiddlerscriptcookbook
//
// FiddlerScript Editor: 
// http://www.fiddlertool.com/redir/?id=fiddlerscripteditor

class Handlers
{
	public static RulesOption("Hide 304s")
	var m_Hide304s: boolean = false;

	// Cause Fiddler to override the Accept-Language header with one of the defined values
	public static RulesOption("Request &Japanese Content")
	var m_Japanese: boolean = false;	

	// Cause Fiddler to override the User-Agent header with one of the defined values
	public static RulesOption("Netscape &3", "&User-Agents", true)
	var m_NS3: boolean = false;
	public static RulesOption("&Firefox 1.5", "&User-Agents", true)
	var m_FFox: boolean = false;
	public static RulesOption("IE &6 (XPSP2)", "&User-Agents", true)
	var m_IE6: boolean = false;
	public static RulesOption("IE &7 (Vista)", "&User-Agents", true)
	var m_IE7: boolean = false;
	public static RulesOption("IE &8 (Win2k3)", "&User-Agents", true, true)
	var m_IE8: boolean = false;
	public static RulesOption("&Disabled", "&User-Agents", true)
	var m_UANONE: boolean = true;

	// Cause Fiddler to delay HTTP traffic to simulate typical 56k modem conditions
	public static RulesOption("Simulate &Modem speeds", "Per&formance")
	var m_SimulateModem: boolean = false;
	
	// Removes HTTP-caching related headers and specifies "no-cache" on requests and responses
	public static RulesOption("&Disable Caching", "Per&formance")
	var m_DisableCaching: boolean = false;

	// Show the duration between the start of Request.Send and Response.Completed in Milliseconds
	public static RulesOption("&Show Time-to-Last-Byte", "Per&formance")
	var m_ShowTTLB: boolean = false;

	// Show the time of response completion
	public static RulesOption("Show Response &Timestamp", "Per&formance")
	var m_ShowTimestamp: boolean = false;

	public static RulesOption("Hide .js files")
	var m_hideJScript: boolean = false;

    public static RulesOption("Hide .css files")
    var m_hideCSS: boolean = false;
    
	// Force a manual reload of the script file.  Resets all
	// RulesOption variables to their defaults.
	public static ToolsAction("Reset Script")
	function DoManualReload(){ 
		FiddlerObject.ReloadScript();
	}

	public static ContextAction("Decode Selected Sessions")
	function DoRemoveEncoding(oSessions: Session[]){
		for (var x = 0; x < oSessions.Length; x++){
			oSessions[x].utilDecodeRequest();
			oSessions[x].utilDecodeResponse();
		}
	}

	public static ContextAction("Reissue Selected Requests")
	function ReRunSessions(oSessions: Session[]){
		if (null == oSessions){
			MessageBox.Show("Please select sessions to reissue.", "Nothing to Do");
			return;
		}
	
		for (var x = 0; x < oSessions.Length; x++){
			FiddlerObject.utilIssueRequest(oSessions[x].oRequest.headers.ToString(true, true) +
											System.Text.Encoding.UTF8.GetString(oSessions[x].requestBodyBytes));
		}
	}

    public static ContextAction("Revisit in IE")
    function RevisitSessions(oSessions: Session[]){
        if (null == oSessions){
            MessageBox.Show("Please select sessions to revisit.", "Nothing to Do");
            return;
        }
	
        for (var x = 0; x < oSessions.Length; x++){
            System.Diagnostics.Process.Start("iexplore.exe", oSessions[x].url);
        }
    }
        

    static function OnBoot(){
//		MessageBox.Show("Fiddler has finished booting");
//		System.Diagnostics.Process.Start("iexplore.exe");

		// FiddlerObject.UI.miManipulateIgnoreImages.Checked = false;

//		FiddlerObject.UI.ActivateRequestInspector("HEADERS");
//		FiddlerObject.UI.ActivateResponseInspector("HEADERS");
	}
	
	static function OnShutdown(){
//		MessageBox.Show("Fiddler has shutdown");
	}
	
	static function OnAttach(){
//		MessageBox.Show("Fiddler is now the system proxy");
//		System.Diagnostics.Process.Start("proxycfg.exe", "-u");	// Notify WinHTTP of proxy change
	}

	static function OnDetach(){
//		MessageBox.Show("Fiddler is no longer the system proxy");
//		System.Diagnostics.Process.Start("proxycfg.exe", "-u");	// Notify WinHTTP of proxy change
	}

	static function OnBeforeRequest(oSession: Session)
	{
		if ((null != gs_ReplaceToken) && (oSession.url.indexOf(gs_ReplaceToken)>-1)){      // Case sensitive
			oSession.url = oSession.url.Replace(gs_ReplaceToken, gs_ReplaceTokenWith); 
		}
		if ((null != gs_OverridenHost) && (oSession.host.toLowerCase() == gs_OverridenHost)){    
			oSession["x-overridehost"] = gs_OverrideHostWith; 
		}

		if ((null!=bpRequestURI) && oSession.uriContains(bpRequestURI)){
			oSession["x-breakrequest"]="uri";
		}		
		
		if ((null!=bpMethod) && (oSession.HTTPMethodIs(bpMethod))){
			oSession["x-breakrequest"]="method";
		}	
		
		if ((null!=uiBoldURI) && oSession.uriContains(uiBoldURI)){
			oSession["ui-bold"]="QuickExec";
		}		
		
		if (m_SimulateModem){
			// Delay sends by 300ms per KB uploaded.
			oSession["request-trickle-delay"] = "300"; 
		}

		if (m_DisableCaching){
			oSession.oRequest.headers.Remove("If-None-Match");
			oSession.oRequest.headers.Remove("If-Modified-Since");
			oSession.oRequest["Pragma"] = "no-cache";
		}

		// User-Agent Overrides
		if (m_NS3){
			oSession.oRequest["User-Agent"] = "Mozilla/3.0 (Win95; I)"; 
		}
		else
		if (m_FFox){
			oSession.oRequest["User-Agent"] = "Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.8.0.5) Gecko/20060719 Firefox/1.5.0.5)"; 
		}
		else
		if (m_IE6){
			oSession.oRequest["User-Agent"] = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)"; 
		}
		else
		if (m_IE7){
			oSession.oRequest["User-Agent"] = "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; SLCC1)"; 
		}
		else
		if (m_IE8){
			oSession.oRequest["User-Agent"] = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.2; WOW64)"; 
		}
		

		if (m_Japanese){
			oSession.oRequest["Accept-Language"] = "ja";
		}

		//if (oSession.uriContains("/sandbox/")){
		//	oSession.oFlags["x-breakrequest"] = "yup";		// The very existence of this Flag triggers breakpoint; value is unimportant.
		//}

		if (m_hideJScript && (oSession.url.lastIndexOf(".js")>0))
		{
			oSession["ui-hide"]="true";
		}
		if (m_hideCSS && (oSession.url.lastIndexOf(".css")>0))
		{
			oSession["ui-hide"]="true";
		}


	}
    
	static function OnBeforeResponse(oSession: Session)
   	{
		if (m_SimulateModem){
			// Delay receives by 150ms per KB downloaded.
			oSession["response-trickle-delay"] = "150"; 
		}
		
		if (m_DisableCaching){
			oSession.oResponse.headers.Remove("Expires");
			oSession.oResponse["Cache-Control"] = "no-cache";
		}
			
		if (m_ShowTimestamp){
			oSession["ui-customcolumn"] = DateTime.Now.ToString("H:mm:ss.ffff") + " " + oSession["ui-customcolumn"]; 
		}

		if (m_ShowTTLB){
			oSession["ui-customcolumn"] = oSession.oResponse.iTTLB + "ms " + oSession["ui-customcolumn"]; 
		}

		if (m_Hide304s && oSession.responseCode == 304){
			oSession["ui-hide"] = "true";
		}
		
		if ((bpStatus>0) && (oSession.responseCode == bpStatus)){
			oSession["x-breakresponse"]="status";
		}
		
		if ((null!=bpResponseURI) && oSession.uriContains(bpResponseURI)){
			oSession["x-breakresponse"]="uri";
		}		

		// Uncomment to reduce incidence of "unexpected socket closure" exceptions in .NET code.  
		// Note that you really should also fix your .NET code to gracefully handle unexpected connection closure.
		//
		// if ((oSession.responseCode != 401) && (oSession.responseCode != 407)){
		//   oSession.oResponse["Connection"] = "close";
		// }
		
		
		if(oSession.oResponse.headers.ExistsAndContains("Content-Type", "audio/mpeg"))
		{
            var fileToSave: String = "";

            if (oSession.oResponse.headers.Exists("etag"))
            {
                fileToSave = "c:/fiddler-downloads/" + oSession.oResponse.headers["etag"].Replace('"',"") + ".mp3";
            }
            else
            {
                fileToSave = "c:/fiddler-downloads/" + oSession.Timers.ClientBeginRequest.ToString("yyyy-MM-dd HH-mm-ss") + ".mp3";
            }
            
            oSession.SaveResponseBody(fileToSave);
            FiddlerObject.alert("File saved to " + fileToSave);
                
		}

	}
        
	static function Main()
	{
  		var today: Date = new Date();
		FiddlerObject.StatusText = " CustomRules.js was loaded at: " + today;
	}


	// These static variables are used for simple breakpointing & other QuickExec rules 
	static var bpRequestURI:String = null;
	static var bpResponseURI:String = null;
	static var bpStatus:int = -1;
	static var bpMethod: String = null;
	static var uiBoldURI: String = null;
	static var gs_ReplaceToken: String = null;
	static var gs_ReplaceTokenWith: String = null;
	static var gs_OverridenHost: String = null;
	static var gs_OverrideHostWith: String = null;
	
	// The OnExecAction function is called by either the QuickExec box in the Fiddler window,
	// or by the ExecAction.exe command line utility.
	static function OnExecAction(sParams: String[]){
	FiddlerObject.StatusText = "ExecAction: " + sParams[0];
		
	var sAction = sParams[0].toLowerCase();
	switch (sAction){
	case "bold":
		if (sParams.Length<2) {uiBoldURI=null; FiddlerObject.StatusText="Bolding cleared"; return;}
		uiBoldURI = sParams[1]; FiddlerObject.StatusText="Bolding requests for " + uiBoldURI;
		break;
	case "bp":
    		FiddlerObject.alert("bpu = breakpoint request for uri\nbpm = breakpoint request method\nbps=breakpoint response status\nbpafter = breakpoint response for URI");
		break;
	case "bps":
		if (sParams.Length<2) {bpStatus=-1; FiddlerObject.StatusText="Response Status breakpoint cleared"; return;}
		bpStatus = parseInt(sParams[1]); FiddlerObject.StatusText="Response status breakpoint for " + sParams[1];
		break;
	case "bpv":
	case "bpm":
		if (sParams.Length<2) {bpMethod=null; FiddlerObject.StatusText="Request Method breakpoint cleared"; return;}
		bpMethod = sParams[1].toUpperCase(); FiddlerObject.StatusText="Request Method breakpoint for " + bpMethod;
		break;
	case "bpu":
		if (sParams.Length<2) {bpRequestURI=null; FiddlerObject.StatusText="RequestURI breakpoint cleared"; return;}
		if (sParams[1].toLowerCase().StartsWith("http://")){sParams[1] = sParams[1].Substring(7);} 
		bpRequestURI = sParams[1]; 
		FiddlerObject.StatusText="RequestURI breakpoint for "+sParams[1];
	break;
	case "bpafter":
		if (sParams.Length<2) {bpResponseURI=null; FiddlerObject.StatusText="ResponseURI breakpoint cleared"; return;}
		if (sParams[1].toLowerCase().StartsWith("http://")){sParams[1] = sParams[1].Substring(7);} 
		bpResponseURI = sParams[1]; 
		FiddlerObject.StatusText="ResponseURI breakpoint for "+sParams[1];
	break;
	case "overridehost":
		if (sParams.Length<3) {gs_OverridenHost=null; FiddlerObject.StatusText="Host Override cleared"; return;}
		gs_OverridenHost = sParams[1].toLowerCase();
		gs_OverrideHostWith = sParams[2];
		FiddlerObject.StatusText="Connecting to [" + gs_OverrideHostWith + "] for requests to [" + gs_OverridenHost + "]";
		break;
	case "urlreplace":
		if (sParams.Length<3) {gs_ReplaceToken=null; FiddlerObject.StatusText="URL Replacement cleared"; return;}
		gs_ReplaceToken = sParams[1];
		gs_ReplaceTokenWith = sParams[2].Replace(" ", "%20");  // Simple helper
		FiddlerObject.StatusText="Replacing [" + gs_ReplaceToken + "] in URIs with [" + gs_ReplaceTokenWith + "]";
		break;
	case "select":
		if (sParams.Length<2) { FiddlerObject.StatusText="Please specify Content-Type to select."; return;}
		FiddlerObject.UI.actSelectSessionsWithResponseHeaderValue("Content-Type", sParams[1]);
		FiddlerObject.StatusText="Searching for Content-Type: " + sParams[1];
		break;
	case "allbut":
	case "keeponly":
		if (sParams.Length<2) { FiddlerObject.StatusText="Please specify Content-Type to retain during wipe."; return;}
		FiddlerObject.UI.actSelectSessionsWithResponseHeaderValue("Content-Type", sParams[1]);
		FiddlerObject.UI.actRemoveUnselectedSessions();
		FiddlerObject.UI.lvSessions.SelectedItems.Clear();
		FiddlerObject.StatusText="Removed all but Content-Type: " + sParams[1];
		break;
	case "stop":
    		FiddlerObject.UI.actDetachProxy();
    		break;
    	case "start":
    		FiddlerObject.UI.actAttachProxy();
    		break;
    	case "cls":
    	case "clear":
    		FiddlerObject.UI.actRemoveAllSessions();
    		break;
	case "g":
	case "go":
		FiddlerObject.UI.actResumeAllSessions();
		break;
    	case "help":
		System.Diagnostics.Process.Start("http://www.fiddlertool.com/redir/?id=quickexec");
    		break;
    	case "hide":
    		FiddlerObject.UI.actMinimizeToTray();
    		break;
    	case "nuke":
		FiddlerObject.UI.actClearWinINETCache();
		FiddlerObject.UI.actClearWinINETCookies(); 
	break;
    	case "show":
    		FiddlerObject.UI.actRestoreWindow();
    		break;
	case "tail":
		if (sParams.Length<2) { FiddlerObject.StatusText="Please specify # of sessions to trim the session list to."; return;}
		FiddlerObject.UI.TrimSessionList(int.Parse(sParams[1]));
		break;
    	case "quit":
    		FiddlerObject.UI.actExit();
    		break;
    	case "dump":
    		FiddlerObject.UI.actSelectAll();
    		FiddlerObject.UI.actSaveSessionsToZip(CONFIG.GetPath("Captures") + "dump.saz");
    		FiddlerObject.UI.actRemoveAllSessions();
    		FiddlerObject.StatusText = "Dumped all sessions to " + CONFIG.GetPath("Captures") + "dump.saz";
    		break;
    		
    	default:
    		if (sAction.StartsWith("http") || sAction.StartsWith("www")){
    			System.Diagnostics.Process.Start(sAction);
    		}
    		else
    		FiddlerObject.StatusText = "Requested action: " + sAction + " not found.";
    	}
	}
}





