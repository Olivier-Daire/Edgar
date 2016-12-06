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
var Model = require('./model.js');

// TODO Load JSON ???
window.WebVRConfig = window.WebVRConfig || {};
window.WebVRManager = WebVRManager;

var scene1 = new Scene();

// Add a repeating grid as a skybox.
var boxSize = 15;
var loader = new THREE.TextureLoader();
loader.load('public/img/box.png', onTextureLoaded);

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
  scene1.scene.add(skybox);

  // For high end VR devices like Vive and Oculus, take into account the stage
  // parameters provided.
  setupStage();
}


// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(scene1.renderer, scene1.effect, params);


// Load 3D model
var cube = new Model('public/model/animated-character.json', 
  function() {
    cube.model.position.set(0, scene1.controls.userHeight, -1);
    cube.model.scale.x = cube.model.scale.y = cube.model.scale.z = 0.5;
    cube.castShadow = true;

    document.getElementById('loader').style.display = 'none';
    scene1.scene.add(cube.model);
  }
);


// TODO Ground scene
var ground = null;
function initGround() {
  	var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );
  	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20, 20 ), groundMaterial );
  	ground.position.set(0, scene1.controls.userHeight - 0.5, 0);
  	ground.rotation.x = - Math.PI / 2;
  	ground.receiveShadow = true;
  	scene1.scene.add( ground );
}

initGround();


// TODO Light class
function initLights() {
  var spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( 0, scene1.controls.userHeight+8, 0 );
  spotLight.castShadow = true;
  scene1.scene.add( spotLight );
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
window.addEventListener('mousemove', onMove);
// TODO Move this
window.addEventListener('click', function(e) {
  if (cube.currentAction < cube.actions.length - 1) {
    cube.fadeToAction(cube.currentAction + 1 );
  } else {
    cube.fadeToAction(0);
  }
}, true);

// Request animation frame loop function
var lastRender = 0;
var theta = 0;
var radius = 5;
var nextPos, actualPos;

function animate(timestamp) {
  var delta = Math.PI / 500;
  // Get the actual position of the model
  actualPos = cube.model.position.x; // Crash when slow internet

  lastRender = timestamp;

  // Object movement
  if(nextPos > 1 && nextPos <= 5) {
    cube.model.position.x = Math.cos(theta) * radius;
    cube.model.position.z = Math.sin(theta) * radius;
    theta += delta;
  }
  else if (nextPos < -1 && nextPos >= -5) {
    cube.model.position.x = Math.cos(theta) * radius;
    cube.model.position.z = Math.sin(theta) * radius;
    theta -= delta;
  }

  // Apply rotation to cube mesh
  //cube.model.position.x = Math.cos(theta) * radius;
  //cube.model.position.z = Math.sin(theta) * radius;

  scene1.controls.update();
  // Update model animations
  // FIXME if (cube.update.mixer !== null  ) { cube.mixer.update(delta); }
  scene1.navigation.update(scene1.clock.getDelta());
  // Render the scene through the manager.
  manager.render(scene1.scene, scene1.camera, timestamp);
  scene1.effect.render(scene1.scene, scene1.camera);

  vrDisplay.requestAnimationFrame(animate);
}

function onMove() {
  var x = (( event.clientX / window.innerWidth ) * 2 - 1) * radius;
  nextPos = x;
}

function onResize(e) {
  scene1.effect.setSize(window.innerWidth, window.innerHeight);
  scene1.camera.aspect = window.innerWidth / window.innerHeight;
  scene1.camera.updateProjectionMatrix();
  //scene1.navigation.handleResize();
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
  scene1.scene.remove(skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
  var skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  skybox.position.y = boxSize/2;
  scene1.scene.add(skybox);

  // Place the cube in the middle of the scene, at user height.
  cube.model.position.set(0, scene1.controls.userHeight, 0);
}
