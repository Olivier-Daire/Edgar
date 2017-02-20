var soundFileName = "http://guilhemcompain.fr/sounds/Confrontation.mp3";

console.log('launched');

// Detect if the audio context is supported.
window.AudioContext = (
  window.AudioContext ||
  window.webkitAudioContext ||
  null
);

if (!AudioContext) {
  throw new Error("AudioContext not supported!");
}

// Create a new audio context.
var ctx = new AudioContext();

// Create a AudioGainNode to control the main volume.
var mainVolume = ctx.createGain();
// Connect the main volume node to the context destination.
mainVolume.connect(ctx.destination);

// Create an object with a sound source and a volume control.
var sound = {};
sound.source = ctx.createBufferSource();
sound.volume = ctx.createGain();

// Connect the sound source to the volume control.
sound.source.connect(sound.volume);
// Hook up the sound volume control to the main volume.
sound.volume.connect(mainVolume);

// Make the sound source loop.
sound.source.loop = true;

// Load a sound file using an ArrayBuffer XMLHttpRequest.

console.log('before loading');




var request = createCORSRequest('GET', soundFileName);
if (!request) {
  throw new Error('CORS not supported');
}

request.send();


function createCORSRequest(method, url) {
  var request = new XMLHttpRequest();
  if ("withCredentials" in request || typeof XDomainRequest != "undefined")
  {
    if("withCredentials" in request)
    {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      request.open(method, url, true);

    }else if (typeof XDomainRequest != "undefined")
    {

      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      request = new XDomainRequest();
      request.open(method, url);

    }

    request.setRequestHeader('Access-Control-Allow-Credentials', true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {

      // Create a buffer from the response ArrayBuffer.
      ctx.decodeAudioData(this.response, function onSuccess(buffer) {
        sound.buffer = buffer;

        // Make the sound source use the buffer and start playing it.
        sound.source.buffer = sound.buffer;
        sound.source.start(ctx.currentTime);
        console.log('sounds start');
      }, function onFailure() {
        alert("Decoding the audio buffer failed");
      });

    }
  }
  else
  {
    // Otherwise, CORS is not supported by the browser.
    request = null;
    console.log('fail');
  }

  return request;
}
