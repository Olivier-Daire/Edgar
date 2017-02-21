"use strict";

var Scene = require('./scene.js');

window.vrDisplay = null;
window.DEBUG = true;
// EnterVRButton for rendering enter/exit UI.
var vrButton;
var scene;
var stats;
var clock = new THREE.Clock();


document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode === 69) { // 69 keycode for 'e'
        scene.firefly.updateStatus();
        console.log(scene.firefly.status);
    }
}

function onLoad() {
  document.getElementById('loader').style.display = 'none';

  if (window.DEBUG) {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
  }

  scene = new Scene(1, animate);

  window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', onResize, true);

  // Initialize the WebVR UI.
  var uiOptions = {
    color: 'black',
    background: 'white',
    corners: 'square'
  };

  vrButton = new webvrui.EnterVRButton(scene.renderer.domElement, uiOptions);

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
    scene.character.updateCharacter(0.4 * delta);
  }

  var time = Date.now() * 0.003;
  scene.firefly.updatePosition(time);

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
