"use strict";

var WebVRManager = require('./webvr-manager.js');
var Scene = require('./scene.js');
var Character = require('./character.js');

// TODO Load JSON ???
window.WebVRConfig = window.WebVRConfig || {};
window.WebVRManager = WebVRManager;
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

var radius = 4;
var scene1 = new Scene(radius);
var lastRender = 0;
var vrDisplay;
var boxSize = 15;

var loader = new THREE.TextureLoader();
loader.load('public/img/nightSky.jpg', onTextureLoaded);

function onTextureLoaded(texture) {
var geometry = new THREE.SphereGeometry(boxSize, 60, 40);
var uniforms = {
  texture: { type: 't', value: texture }
};

var material = new THREE.ShaderMaterial( {
  uniforms:       uniforms,
  vertexShader:   document.getElementById('skyVertexShader').textContent,
  fragmentShader: document.getElementById('skyFragmentShader').textContent
});

var skybox = new THREE.Mesh(geometry, material);

skybox.scale.set(-1, 1, 1);
scene1.scene.add(skybox);
setupStage();
}


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
    edgar.model.scale.x = edgar.model.scale.y = edgar.model.scale.z = 0.5;

    document.getElementById('loader').style.display = 'none';
    scene1.scene.add(edgar.model);
    edgar.followPath(scene1.characterPath);
  }
);

if (window.DEBUG) {
  // Cube at origin
  var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
  cube.position.z = -radius;  cube.position.x = 0;  cube.position.y = scene1.controls.userHeight;
  cube.scale.x = cube.scale.y = cube.scale.z = 0.2;
  scene1.scene.add(cube);
}

// Request animation frame loop function
function animate(timestamp) {
  var delta = Math.PI / 500;

  lastRender = timestamp;

  if (edgar.model !== null) {
    // Update edgar nextPosition
    edgar.nextPosition = scene1.camera.getWorldDirection().multiplyScalar(radius);
    // Update character position along path
    edgar.updateCharacter(delta);
  }

  scene1.controls.update();
  // Render the scene through the manager.
  manager.render(scene1.scene, scene1.camera, timestamp);
  scene1.effect.render(scene1.scene, scene1.camera);
  vrDisplay.requestAnimationFrame(animate);
}

function onResize(e) {
  scene1.effect.setSize(window.innerWidth, window.innerHeight);
  scene1.camera.aspect = window.innerWidth / window.innerHeight;
  scene1.camera.updateProjectionMatrix();
}

// TODO Move all the functions below in scene.js ?
// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
function setupStage() {
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      vrDisplay = displays[0];
      if (vrDisplay.stageParameters) {
        setStageDimensions(vrDisplay.stageParameters);
      }
      vrDisplay.requestAnimationFrame(animate);
    }
  });
}

function setStageDimensions(stage) {
  // Make the skybox fit the stage.
  var material = skybox.material;
  scene1.scene.remove(skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
  var skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  skybox.position.y = boxSize/2;
  scene1.scene.add(skybox);

  // Place edgar in the middle of the scene, at user height.
  edgar.model.position.set(0, scene1.controls.userHeight, 0);
}
