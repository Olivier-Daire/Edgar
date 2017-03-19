"use strict";

var Scene = require('./scene.js');
var Util = require('./util.js');

window.vrDisplay = null;
window.DEBUG = false;
// EnterVRButton for rendering enter/exit UI.
var vrButton;
var scene;
var stats;
var clock = new THREE.Clock();
var renderer = null;

document.onkeydown = checkKey;


function transitionScene(number){

  function opacityHandler(value){

    opacity = opacity+value*negative;
    screen.style.opacity = opacity;

    if(opacity >= 1.2){

      negative = -1;

    }else if(opacity <= 0){

      var elt = document.getElementById('blackBackground');
      elt.parentNode.removeChild(elt);
      clearInterval(blackScreenTransition);


    }

  }
    
  var screen = document.createElement('div');
  screen.id="blackBackground";
  screen.style = "width:100%; height:100%; position:fixed; top:0; left:0; background-color:black; z-index:10000; opacity:0;";
  document.body.appendChild(screen);
  var frameRate = 10, totalTime = 1000, opacity = 0, negative = 1;
  
  var blackScreenTransition = setInterval(function(){ 
    
    opacityHandler(frameRate / totalTime);
  
  }, frameRate);

  setTimeout(function(){

    scene.deleteScene();
    scene = new Scene(number, animate, renderer); 

  }, totalTime);
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode === 69) { // 69 keycode for 'e'
        scene.firefly.updateStatus();
    }
    else if (e.keyCode === 13) { // 13 keycode for enter
      transitionScene(2);
    }
}

function initRender(){

  // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
  // Only enable it if you actually need to.
  var rendererParams = {};
  if(!Util.isMobile()) {
    rendererParams = {antialias : true};
  }
  renderer = new THREE.WebGLRenderer(rendererParams);
  renderer.shadowMap.enabled = true;

  renderer.setPixelRatio(window.devicePixelRatio);
  if (window.DEBUG) {
    // Set clear color to white to see better
    renderer.setClearColor( 0xffffff, 1 );
  }

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);

}

function onLoad() {
  document.getElementById('loader').style.display = 'none';

  if (window.DEBUG) {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
  }

  initRender();
  scene = new Scene(1, animate, renderer);

  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      window.vrDisplay = displays[0];
      if (window.vrDisplay.stageParameters) {
        scene.setStageDimensions(window.vrDisplay.stageParameters);
      }
      window.vrDisplay.requestAnimationFrame(animate);
    }
  });


  window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', onResize, true);
  window.addEventListener('interact', function(e) {
    // e.detail.id contains object id
    // e.detail.interaction contains interaction type e.g "move"

    // Can only interact if firefly is grouped
    if (scene.firefly.status === 1) {
      // TODO Add all cases
      switch(e.detail.interaction) {
        case 'move':
          scene.scene.getObjectById(e.detail.id).position.x = 6;
          break;
        case 'light':
          var object = scene.scene.getObjectById(e.detail.id);
          var on = false;
          for (var i = 0; i < object.material.materials.length; i++ ) {
               if (object.material.materials[i].emissive.getHexString() === '000000') {
                object.material.materials[i].emissive.setHex(0xfffde5); // Light on
                on = true;
               } else {
                object.material.materials[i].emissive.setHex(0x000000); // Light off
               }
          }
          on ? scene.achievedObjectives++ : scene.achievedObjectives--; // jshint ignore:line
          break;
        case 'end-level':
          if (scene.achievedObjectives === scene.totalObjectives) { // jshint ignore:line
            transitionScene(2);
            // FIXME @Guilhem Load Next level and then remove --> // jshint ignore:line
          } else { // jshint ignore:line
            document.getElementById('objectives').style.display = 'block';
            setTimeout(function() { document.getElementById('objectives').style.display = 'none'; }, 2500);
          }
          break;
        default:
          console.log("Implement switch case for " + e.detail.interaction);  // jshint ignore:line
      }
    }

  }, false);

  // Initialize the WebVR UI.
  var uiOptions = {
    color: 'black',
    background: 'white',
    corners: 'square'
  };

  vrButton = new webvrui.EnterVRButton(renderer.domElement, uiOptions);

  vrButton.on('exit', function() {
    scene.camera.quaternion.set(0, 0, 0, 1);
    scene.camera.position.set(0, scene.controls.userHeight, 0);
  });

  vrButton.on('hide', function() {
    document.getElementById('ui').style.display = 'none';
  });

  vrButton.on('show', function() {
    document.getElementById('ui').style.display = 'inherit';
  });

  document.getElementById('vr-button').appendChild(vrButton.domElement);

  document.getElementById('magic-window').addEventListener('click', function() {
    // Capture pointer
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
        document.body.requestPointerLock =  document.body.requestPointerLock ||  document.body.mozRequestPointerLock ||  document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
    }

    // Group / Ungroup firelfy on click
    window.addEventListener('click', function(e) {
      scene.firefly.updateStatus();
    }, true);

    vrButton.requestEnterFullscreen();
  });

}

// Request animation frame loop function
function animate() {
  if(window.DEBUG) {
    stats.begin();
  }
  var delta = clock.getDelta();

  if (scene.character.mesh !== null) {
    // Update character nextPosition
    scene.character.nextPosition = scene.camera.getWorldDirection().multiplyScalar(scene.radius);
    // Update character position along path
    scene.character.updateCharacter(0.4 * delta, scene);
  }

  var time = Date.now() * 0.003;

  if(scene.firefly.loaded){ scene.firefly.updatePosition(time, scene); }

  scene.controls.update();

   // Only update controls if we're presenting.
  if (vrButton.isPresenting()) {
    scene.controls.update();
  }

  scene.effect.render(scene.scene, scene.camera);
  window.vrDisplay.requestAnimationFrame(animate);

  if(window.DEBUG) {
    stats.end();
  }
}

function onResize(e) {
  scene.effect.setSize(window.innerWidth, window.innerHeight);
  scene.camera.aspect = window.innerWidth / window.innerHeight;
  scene.camera.updateProjectionMatrix();
}


window.addEventListener('load', onLoad);
