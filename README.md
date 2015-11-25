# WHAT IS IT ?

This is Fiddler script to automatically save all audio responses (content-type: audio/mpeg) to your local drive.
   
# WHAT IS FIDDLER ?

Fiddler (http://www.telerik.com/fiddler) is the free web proxy for any browser.

# INSTALLATION:

* Download and install Fiddler (http://www.telerik.com/fiddler)
* Run Fiddler
* Press CTRL-R (or Choose MENU -> Rules -> Customize Rules)
* After the editor window shows up, delete all code replacing it with the content from the CustomRules.js file from this repository.
* Create directory c:/fiddler-downloads/ where all audio files will be saved.


# USAGE

* Run FIDDLER
* Visit any website that plays mp3/audio files
* Play the file from the website
* Fiddler will intercept the response, show alert box and save the file to the c:/fiddler-downloads/ directory.
 
 