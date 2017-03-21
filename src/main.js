"use strict";

var Scene = require('./scene.js');
var Util = require('./util.js');
var SceneUtil = require('./sceneUtil.js');

window.vrDisplay = null;
window.DEBUG = false;
// EnterVRButton for rendering enter/exit UI.
var vrButton;
var scene;
var stats;
var clock = new THREE.Clock();
var renderer = null;
var effect = null;
var inGame = false;

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode === 69) { // 69 keycode for 'e'
      scene.firefly.updateStatus();
    }
    else if (e.keyCode === 13) { // 13 keycode for enter
      SceneUtil.transitionScene(2, scene);
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

  // Apply VR stereo rendering to renderer.
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

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
  document.addEventListener('mousedown', function(e) {
    if (inGame) { // Prevent click on VR/not VR buttons
      scene.firefly.updateStatus();
    }
  }, true);
  window.addEventListener('interact', function(e) {
    // e.detail.id contains object id
    // e.detail.interaction contains interaction type e.g "move"

    // Can only interact if firefly is grouped
    if (scene.firefly.status === 1) {
      // TODO Add all cases
      SceneUtil.interact(e.detail, scene);
    }

  }, false);
  window.addEventListener('load-level', function(e) {
     scene = new Scene(e.detail.number, animate, renderer);
  } );

  // Initialize the WebVR UI.
  var uiOptions = {
    color: 'black',
    background: 'white',
    corners: 'square'
  };

  vrButton = new webvrui.EnterVRButton(renderer.domElement, uiOptions);

  vrButton.on('enter', function() {
    inGame = true;
  });

  vrButton.on('exit', function() {
    scene.camera.quaternion.set(0, 0, 0, 1);
    scene.camera.position.set(0, scene.controls.userHeight, 0);
    inGame = false;
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

    inGame = true;
    vrButton.requestEnterFullscreen();
  });

}

// Request animation frame loop function
function animate() {
  if(window.DEBUG) {
    stats.begin();
  }
  var delta = clock.getDelta();

  if (scene.character) {
    if (scene.character.mesh !== null) {
      // Update character nextPosition
      scene.character.nextPosition = scene.camera.getWorldDirection().multiplyScalar(scene.radius);
      // Update character position along path
      scene.character.updateCharacter(0.4 * delta, scene);
    }
  }
  

  var time = Date.now() * 0.003;

  if(scene.firefly) {
    if(scene.firefly.loaded){ scene.firefly.updatePosition(time, scene); }
  }
  

  if (scene.controls) {
    scene.controls.update();
  }

   // Only update controls if we're presenting.
  if (vrButton.isPresenting()) {
    scene.controls.update();
  }

  effect.render(scene.scene, scene.camera);
  window.vrDisplay.requestAnimationFrame(animate);

  if(window.DEBUG) {
    stats.end();
  }
}

function onResize(e) {
  effect.setSize(window.innerWidth, window.innerHeight);
  scene.camera.aspect = window.innerWidth / window.innerHeight;
  scene.camera.updateProjectionMatrix();
}


window.addEventListener('load', onLoad);
