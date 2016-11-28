"use strict";
/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var WebVRManager = require('./webvr-manager.js');
var Scene = require('./scene.js');

// TODO Load JSON ???
window.WebVRConfig = window.WebVRConfig || {};
window.WebVRManager = WebVRManager;

var Scene = new Scene();

// Add a repeating grid as a skybox.
var boxSize = 5;
var loader = new THREE.TextureLoader();
loader.load('img/box.png', onTextureLoaded);

function onTextureLoaded(texture) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(boxSize, boxSize);

  var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x01BE00,
    side: THREE.BackSide
  });

  // Align the skybox to the floor (which is at y=0).
  var skybox = new THREE.Mesh(geometry, material);
  skybox.position.y = boxSize/2;
  Scene.scene.add(skybox);

  // For high end VR devices like Vive and Oculus, take into account the stage
  // parameters provided.
  setupStage();
}


// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(Scene.renderer, Scene.effect, params);


// TODO model class
// Load 3D model
var model = null;
function initMesh() {
  var loader = new THREE.JSONLoader();
  loader.load('asset_src/test_model.json' , function(geometry, materials) {
    model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
    model.scale.x = model.scale.y = model.scale.z = 0.15;
    Scene.scene.add(model);
    model.position.set(0, Scene.controls.userHeight, -1);
  });
}

initMesh();


// TODO Light class
function initLights() {
    var light = new THREE.AmbientLight(0xffffff);
    Scene.scene.add(light);
}

initLights();

// // Create 3D objects.
// var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// var material = new THREE.MeshNormalMaterial();
// var cube = new THREE.Mesh(geometry, material);

// // Position cube mesh to be right in front of you.
//cube.position.set(0, controls.userHeight, -1);

// // Add cube mesh to your three.js scene
// scene.add(cube);

window.addEventListener('resize', onResize, true);
window.addEventListener('vrdisplaypresentchange', onResize, true);

// Request animation frame loop function
var lastRender = 0;
function animate(timestamp) {
  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  // Apply rotation to cube mesh
  model.rotation.y += delta * 0.0006;

  Scene.controls.update();
  // Render the scene through the manager.
  manager.render(Scene.scene, Scene.camera, timestamp);
  Scene.effect.render(Scene.scene, Scene.camera);

  vrDisplay.requestAnimationFrame(animate);
}

function onResize(e) {
  Scene.effect.setSize(window.innerWidth, window.innerHeight);
  Scene.camera.aspect = window.innerWidth / window.innerHeight;
  Scene.camera.updateProjectionMatrix();
}

var vrDisplay;

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
  Scene.scene.scene.remove(skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
  var skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  skybox.position.y = boxSize/2;
  Scene.scene.add(skybox);

  // Place the cube in the middle of the scene, at user height.
  model.position.set(0, Scene.controls.userHeight, 0);
}
