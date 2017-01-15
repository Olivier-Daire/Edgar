"use strict";

var WebVRManager = require('./webvr-manager.js');
var Scene = require('./scene.js');
var Character = require('./character.js');

// TODO Load JSON ???
window.WebVRConfig = window.WebVRConfig || {};
window.WebVRManager = WebVRManager;
window.vrDisplay = null;
window.DEBUG = true;

window.addEventListener('resize', onResize, true);
window.addEventListener('vrdisplaypresentchange', onResize, true);

// Capture pointer on click
// TODO Move this elsewhere and check mobile compatibility
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
  window.addEventListener('click', function() {
    document.body.requestPointerLock =  document.body.requestPointerLock ||  document.body.mozRequestPointerLock ||  document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
  }, false);
}

var scene1 = new Scene(1, animate);
var lastRender = 0;

// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(scene1.renderer, scene1.effect, params);

// Load 3D model
var edgar = new Character();
edgar.load('public/model/animated-character.json',
  function() {
    edgar.mesh.scale.x = edgar.mesh.scale.y = edgar.mesh.scale.z = 0.5;
    document.getElementById('loader').style.display = 'none';
    scene1.scene.add(edgar.mesh);
    edgar.followPath(scene1.characterPath);
  }
);

// Request animation frame loop function
function animate(timestamp) {
  var delta = Math.PI / 500;

  lastRender = timestamp;

  if (edgar.mesh !== null) {
    // Update edgar nextPosition
    edgar.nextPosition = scene1.camera.getWorldDirection().multiplyScalar(scene1.radius);
    // Update character position along path
    edgar.updateCharacter(delta);
  }

  scene1.controls.update();
  // Render the scene through the manager.
  manager.render(scene1.scene, scene1.camera, timestamp);
  scene1.effect.render(scene1.scene, scene1.camera);
  window.vrDisplay.requestAnimationFrame(animate);
}

function onResize(e) {
  scene1.effect.setSize(window.innerWidth, window.innerHeight);
  scene1.camera.aspect = window.innerWidth / window.innerHeight;
  scene1.camera.updateProjectionMatrix();
}

