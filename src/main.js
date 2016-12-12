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

var radius = 5;
var scene1 = new Scene(radius);
var lastRender = 0;
var theta = 0;
var nextPos, actualPos;

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
var edgar = new Model('public/model/animated-character.json',
  function() {
    edgar.model.position.set(0, scene1.controls.userHeight, -1);
    edgar.model.scale.x = edgar.model.scale.y = edgar.model.scale.z = 0.5;

    document.getElementById('loader').style.display = 'none';
    scene1.scene.add(edgar.model);
  }
);


// TODO MOVE THIS
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

// TODO MOVE THIS
function initLights() {
  var spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( 0, scene1.controls.userHeight+8, 0 );
  spotLight.castShadow = true;
  scene1.scene.add( spotLight );
}
initLights();

window.addEventListener('resize', onResize, true);
window.addEventListener('vrdisplaypresentchange', onResize, true);
window.addEventListener('mousemove', onMove);

// TODO Refactor this shit !
var tangent = new THREE.Vector3();
var axis = new THREE.Vector3();
var up = new THREE.Vector3(0, 0, 1);
var speed = 0.0005;
function updateMainCharacter(delta) { // FIXME delta ?
  if(nextPos > 1 && nextPos <= 5) {
     if (theta <= 1) {
        edgar.fadeToAction('walk');
        edgar.model.position.copy( scene1.characterPath.getPointAt(theta) );

        tangent = scene1.characterPath.getTangentAt(theta).normalize();

        axis.crossVectors(up, tangent).normalize();

        var radians = Math.acos(up.dot(tangent));

        edgar.model.quaternion.setFromAxisAngle(axis, radians);
        theta += speed;
    } else {
      theta = 0
    }
  } else if (nextPos < -1 && nextPos >= -5) {
     if (theta >= 0) {
        edgar.fadeToAction('walk');
        edgar.model.position.copy( scene1.characterPath.getPointAt(theta) );

        tangent = scene1.characterPath.getTangentAt(theta).normalize();

        axis.crossVectors(up, tangent).normalize();

        var radians = Math.acos(up.dot(tangent));

        edgar.model.quaternion.setFromAxisAngle(axis, radians);
        theta -= speed;
    } else {
      theta = 1;
    }
  }

  edgar.fadeToAction('idle');
  // Update model animations
  edgar.mixer.update(delta); // FIXME delta ?
}

// Request animation frame loop function

function animate(timestamp) {
  var delta = Math.PI / 500;

  lastRender = timestamp;

  if (edgar.model !== null) {
    updateMainCharacter(delta);
  }

  scene1.controls.update();
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
}

var vrDisplay;

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
