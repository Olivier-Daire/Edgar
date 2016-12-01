(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var Emitter = require('./emitter.js');
var Modes = require('./modes.js');
var Util = require('./util.js');

/**
 * Everything having to do with the WebVR button.
 * Emits a 'click' event when it's clicked.
 */
function ButtonManager(opt_root) {
  var root = opt_root || document.body;
  this.loadIcons_();

  // Make the fullscreen button.
  var fsButton = this.createButton();
  fsButton.src = this.ICONS.fullscreen;
  fsButton.title = 'Fullscreen mode';
  var s = fsButton.style;
  s.bottom = 0;
  s.right = 0;
  fsButton.addEventListener('click', this.createClickHandler_('fs'));
  root.appendChild(fsButton);
  this.fsButton = fsButton;

  // Make the VR button.
  var vrButton = this.createButton();
  vrButton.src = this.ICONS.cardboard;
  vrButton.title = 'Virtual reality mode';
  s = vrButton.style;
  s.bottom = 0;
  s.right = '48px';
  vrButton.addEventListener('click', this.createClickHandler_('vr'));
  root.appendChild(vrButton);
  this.vrButton = vrButton;

  this.isVisible = true;

}
ButtonManager.prototype = new Emitter();

ButtonManager.prototype.createButton = function() {
  var button = document.createElement('img');
  button.className = 'webvr-button';
  var s = button.style;
  s.position = 'absolute';
  s.width = '24px';
  s.height = '24px';
  s.backgroundSize = 'cover';
  s.backgroundColor = 'transparent';
  s.border = 0;
  s.userSelect = 'none';
  s.webkitUserSelect = 'none';
  s.MozUserSelect = 'none';
  s.cursor = 'pointer';
  s.padding = '12px';
  s.zIndex = 1;
  s.display = 'none';
  s.boxSizing = 'content-box';

  // Prevent button from being selected and dragged.
  button.draggable = false;
  button.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // Style it on hover.
  button.addEventListener('mouseenter', function(e) {
    s.filter = s.webkitFilter = 'drop-shadow(0 0 5px rgba(255,255,255,1))';
  });
  button.addEventListener('mouseleave', function(e) {
    s.filter = s.webkitFilter = '';
  });
  return button;
};

ButtonManager.prototype.setMode = function(mode, isVRCompatible) {
  isVRCompatible = isVRCompatible || window.WebVRConfig.FORCE_ENABLE_VR;
  if (!this.isVisible) {
    return;
  }
  switch (mode) {
    case Modes.NORMAL:
      this.fsButton.style.display = 'block';
      this.fsButton.src = this.ICONS.fullscreen;
      this.vrButton.style.display = (isVRCompatible ? 'block' : 'none');
      break;
    case Modes.MAGIC_WINDOW:
      this.fsButton.style.display = 'block';
      this.fsButton.src = this.ICONS.exitFullscreen;
      this.vrButton.style.display = 'none';
      break;
    case Modes.VR:
      this.fsButton.style.display = 'none';
      this.vrButton.style.display = 'none';
      break;
  }

  // Hack for Safari Mac/iOS to force relayout (svg-specific issue)
  // http://goo.gl/hjgR6r
  var oldValue = this.fsButton.style.display;
  this.fsButton.style.display = 'inline-block';
  //this.fsButton.offsetHeight;
  this.fsButton.style.display = oldValue;
};

ButtonManager.prototype.setVisibility = function(isVisible) {
  this.isVisible = isVisible;
  this.fsButton.style.display = isVisible ? 'block' : 'none';
  this.vrButton.style.display = isVisible ? 'block' : 'none';
};

ButtonManager.prototype.createClickHandler_ = function(eventName) {
  return function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.emit(eventName);
  }.bind(this);
};

ButtonManager.prototype.loadIcons_ = function() {
  // Preload some hard-coded SVG.
  this.ICONS = {};
  this.ICONS.cardboard = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMjAuNzQgNkgzLjIxQzIuNTUgNiAyIDYuNTcgMiA3LjI4djEwLjQ0YzAgLjcuNTUgMS4yOCAxLjIzIDEuMjhoNC43OWMuNTIgMCAuOTYtLjMzIDEuMTQtLjc5bDEuNC0zLjQ4Yy4yMy0uNTkuNzktMS4wMSAxLjQ0LTEuMDFzMS4yMS40MiAxLjQ1IDEuMDFsMS4zOSAzLjQ4Yy4xOS40Ni42My43OSAxLjExLjc5aDQuNzljLjcxIDAgMS4yNi0uNTcgMS4yNi0xLjI4VjcuMjhjMC0uNy0uNTUtMS4yOC0xLjI2LTEuMjh6TTcuNSAxNC42MmMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTMgMS4xOCAwIDIuMTIuOTYgMi4xMiAyLjEzcy0uOTUgMi4xMi0yLjEyIDIuMTJ6bTkgMGMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTNzMi4xMi45NiAyLjEyIDIuMTMtLjk1IDIuMTItMi4xMiAyLjEyeiIvPgogICAgPHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgyNHYyNEgwVjB6Ii8+Cjwvc3ZnPgo=');
  this.ICONS.fullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNyAxNEg1djVoNXYtMkg3di0zem0tMi00aDJWN2gzVjVINXY1em0xMiA3aC0zdjJoNXYtNWgtMnYzek0xNCA1djJoM3YzaDJWNWgtNXoiLz4KPC9zdmc+Cg==');
  this.ICONS.exitFullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNSAxNmgzdjNoMnYtNUg1djJ6bTMtOEg1djJoNVY1SDh2M3ptNiAxMWgydi0zaDN2LTJoLTV2NXptMi0xMVY1aC0ydjVoNVY4aC0zeiIvPgo8L3N2Zz4K');
  this.ICONS.settings = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNMTkuNDMgMTIuOThjLjA0LS4zMi4wNy0uNjQuMDctLjk4cy0uMDMtLjY2LS4wNy0uOThsMi4xMS0xLjY1Yy4xOS0uMTUuMjQtLjQyLjEyLS42NGwtMi0zLjQ2Yy0uMTItLjIyLS4zOS0uMy0uNjEtLjIybC0yLjQ5IDFjLS41Mi0uNC0xLjA4LS43My0xLjY5LS45OGwtLjM4LTIuNjVDMTQuNDYgMi4xOCAxNC4yNSAyIDE0IDJoLTRjLS4yNSAwLS40Ni4xOC0uNDkuNDJsLS4zOCAyLjY1Yy0uNjEuMjUtMS4xNy41OS0xLjY5Ljk4bC0yLjQ5LTFjLS4yMy0uMDktLjQ5IDAtLjYxLjIybC0yIDMuNDZjLS4xMy4yMi0uMDcuNDkuMTIuNjRsMi4xMSAxLjY1Yy0uMDQuMzItLjA3LjY1LS4wNy45OHMuMDMuNjYuMDcuOThsLTIuMTEgMS42NWMtLjE5LjE1LS4yNC40Mi0uMTIuNjRsMiAzLjQ2Yy4xMi4yMi4zOS4zLjYxLjIybDIuNDktMWMuNTIuNCAxLjA4LjczIDEuNjkuOThsLjM4IDIuNjVjLjAzLjI0LjI0LjQyLjQ5LjQyaDRjLjI1IDAgLjQ2LS4xOC40OS0uNDJsLjM4LTIuNjVjLjYxLS4yNSAxLjE3LS41OSAxLjY5LS45OGwyLjQ5IDFjLjIzLjA5LjQ5IDAgLjYxLS4yMmwyLTMuNDZjLjEyLS4yMi4wNy0uNDktLjEyLS42NGwtMi4xMS0xLjY1ek0xMiAxNS41Yy0xLjkzIDAtMy41LTEuNTctMy41LTMuNXMxLjU3LTMuNSAzLjUtMy41IDMuNSAxLjU3IDMuNSAzLjUtMS41NyAzLjUtMy41IDMuNXoiLz4KPC9zdmc+Cg==');
};

module.exports = ButtonManager;

},{"./emitter.js":2,"./modes.js":5,"./util.js":7}],2:[function(require,module,exports){
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

function Emitter() {
  this.callbacks = {};
}

Emitter.prototype.emit = function(eventName) {
  var callbacks = this.callbacks[eventName];
  if (!callbacks) {
    //console.log('No valid callback specified.');
    return;
  }
  var args = [].slice.call(arguments);
  // Eliminate the first param (the callback).
  args.shift();
  for (var i = 0; i < callbacks.length; i++) {
    callbacks[i].apply(this, args);
  }
};

Emitter.prototype.on = function(eventName, callback) {
  if (eventName in this.callbacks) {
    this.callbacks[eventName].push(callback);
  } else {
    this.callbacks[eventName] = [callback];
  }
};

module.exports = Emitter;

},{}],3:[function(require,module,exports){
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
var cube = new Model('asset_src/animated-character.json', function() {
  cube.model.position.set(0, scene1.controls.userHeight, -1);
  cube.model.scale.x = cube.model.scale.y = cube.model.scale.z = 0.5;
  // TODO Move to constructor ?
  scene1.scene.add(cube.model);
});


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
// TODO Move this 
window.addEventListener('click', function(e) {
  if (cube.currentAction < cube.actions.length - 1) {
    cube.fadeAction(cube.currentAction + 1 );
  } else {
    cube.fadeAction(0);
  }
}, true);

// Request animation frame loop function
var lastRender = 0;
var theta = 0;
function animate(timestamp) {
  var delta = Math.PI / 100;
  var radius = 5;

  lastRender = timestamp;

  // Apply rotation to cube mesh
  //cube.model.position.x = Math.cos(theta) * radius;
  //cube.model.position.z = Math.sin(theta) * radius;
  theta += delta;

  scene1.controls.update();
  // Update model animations
  cube.mixer.update(delta);
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

},{"./model.js":4,"./scene.js":6,"./webvr-manager.js":8}],4:[function(require,module,exports){
"use strict";

function Model(path, onLoad) {
	this.path = path;
	this.onLoad = onLoad;
	this.model = null;

	this.mixer = null;
	this.currentAction = 0;
	this.actions = [];

	this.initMesh();
}


Model.prototype.initMesh = function() {
	var _this = this;
	var loader = new THREE.JSONLoader();

	loader.load(this.path , function(geometry, materials) {
		materials.forEach(function(material) {
			material.skinning = true;
		});

		_this.model = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial( materials ));

		if (typeof geometry.animations !== 'undefined') {
			_this.initAnimation(geometry);
		}

		_this.onLoad();
	});
};

Model.prototype.initAnimation = function(geometry) {
	var _this = this;
	this.mixer = new THREE.AnimationMixer(this.model);
	var i = 0;

	geometry.animations.forEach(function(animation) {
		_this.actions[i] = _this.mixer.clipAction(animation);
		_this.actions[i].setEffectiveWeight(1);
		_this.actions[i++].enabled = true;
	});

	this.actions[this.currentAction].play();
};

Model.prototype.fadeAction = function(nbr) {
	var from = this.actions[ this.currentAction ].play();
	var to = this.actions[ nbr ].play();

	from.enabled = true;
	to.enabled = true;

	if (to.loop === THREE.LoopOnce) {
		to.reset();
	}

	from.crossFadeTo(to, 0.3);
	this.currentAction = nbr;

};

module.exports = Model;

},{}],5:[function(require,module,exports){
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

var Modes = {
  UNKNOWN: 0,
  // Not fullscreen, just tracking.
  NORMAL: 1,
  // Magic window immersive mode.
  MAGIC_WINDOW: 2,
  // Full screen split screen VR mode.
  VR: 3,
};

module.exports = Modes;

},{}],6:[function(require,module,exports){
"use strict";

function Scene() {
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.controls = null;
	this.effect = null;

	this.setup();
}


Scene.prototype.setup = function() {
	// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
	// Only enable it if you actually need to.
	this.renderer = new THREE.WebGLRenderer({antialias: true});
	this.renderer.shadowMapEnabled = true;
	this.renderer.setPixelRatio(window.devicePixelRatio);

	// Append the canvas element created by the renderer to document body element.
	document.body.appendChild(this.renderer.domElement);

	// Create a three.js scene.
	this.scene = new THREE.Scene();

	// Create a three.js camera.
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

	this.controls = new THREE.VRControls(this.camera);
	this.controls.standing = true;
	this.controls.standing = true;

	// Apply VR stereo rendering to renderer.
	this.effect = new THREE.VREffect(this.renderer);
	this.effect.setSize(window.innerWidth, window.innerHeight);
};

module.exports = Scene;

},{}],7:[function(require,module,exports){
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

var Util = {};

Util.base64 = function(mimeType, base64) {
  return 'data:' + mimeType + ';base64,' + base64;
};

Util.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))){check = true;}})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Util.isFirefox = function() {
  return /firefox/i.test(navigator.userAgent);
};

Util.isIOS = function() {
  return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
};

Util.isIFrame = function() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

Util.appendQueryParameter = function(url, key, value) {
  // Determine delimiter based on if the URL already GET parameters in it.
  var delimiter = (url.indexOf('?') < 0 ? '?' : '&');
  url += delimiter + key + '=' + value;
  return url;
};

// From http://goo.gl/4WX3tg
Util.getQueryParameter = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Util.isLandscapeMode = function() {
  return (window.orientation === 90 || window.orientation === -90);
};

Util.getScreenWidth = function() {
  return Math.max(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

Util.getScreenHeight = function() {
  return Math.min(window.screen.width, window.screen.height) *
      window.devicePixelRatio;
};

module.exports = Util;

},{}],8:[function(require,module,exports){
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

var ButtonManager = require('./button-manager.js');
var Emitter = require('./emitter.js');
var Modes = require('./modes.js');
var Util = require('./util.js');

/**
 * Helper for getting in and out of VR mode.
 */
function WebVRManager(renderer, effect, params) {
  this.params = params || {};

  this.mode = Modes.UNKNOWN;

  // Set option to hide the button.
  this.hideButton = this.params.hideButton || false;
  // Whether or not the FOV should be distorted or un-distorted. By default, it
  // should be distorted, but in the case of vertex shader based distortion,
  // ensure that we use undistorted parameters.
  this.predistorted = !!this.params.predistorted;

  // Save the THREE.js renderer and effect for later.
  this.renderer = renderer;
  this.effect = effect;
  var polyfillWrapper = document.querySelector('.webvr-polyfill-fullscreen-wrapper');
  this.button = new ButtonManager(polyfillWrapper);

  this.isFullscreenDisabled = !!Util.getQueryParameter('no_fullscreen');
  this.startMode = Modes.NORMAL;
  var startModeParam = parseInt(Util.getQueryParameter('start_mode'));
  if (!isNaN(startModeParam)) {
    this.startMode = startModeParam;
  }

  if (this.hideButton) {
    this.button.setVisibility(false);
  }

  // Check if the browser is compatible with WebVR.
  this.getDeviceByType_(VRDisplay).then(function(hmd) {
    this.hmd = hmd;

    // Only enable VR mode if there's a VR device attached or we are running the
    // polyfill on mobile.
    if (!this.isVRCompatibleOverride) {
      this.isVRCompatible =  !hmd.isPolyfilled || Util.isMobile();
    }

    switch (this.startMode) {
      case Modes.MAGIC_WINDOW:
        this.setMode_(Modes.MAGIC_WINDOW);
        break;
      case Modes.VR:
        this.enterVRMode_();
        this.setMode_(Modes.VR);
        break;
      default:
        this.setMode_(Modes.NORMAL);
    }

    this.emit('initialized');
  }.bind(this));

  // Hook up button listeners.
  this.button.on('fs', this.onFSClick_.bind(this));
  this.button.on('vr', this.onVRClick_.bind(this));

  // Bind to fullscreen events.
  document.addEventListener('webkitfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('mozfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('msfullscreenchange',
      this.onFullscreenChange_.bind(this));

  // Bind to VR* specific events.
  window.addEventListener('vrdisplaypresentchange',
      this.onVRDisplayPresentChange_.bind(this));
  window.addEventListener('vrdisplaydeviceparamschange',
      this.onVRDisplayDeviceParamsChange_.bind(this));
}

WebVRManager.prototype = new Emitter();

// Expose these values externally.
WebVRManager.Modes = Modes;

WebVRManager.prototype.render = function(scene, camera, timestamp) {
  // Scene may be an array of two scenes, one for each eye.
  if (scene instanceof Array) {
    this.effect.render(scene[0], camera);
  } else {
    this.effect.render(scene, camera);
  }
};

WebVRManager.prototype.setVRCompatibleOverride = function(isVRCompatible) {
  this.isVRCompatible = isVRCompatible;
  this.isVRCompatibleOverride = true;

  // Don't actually change modes, just update the buttons.
  this.button.setMode(this.mode, this.isVRCompatible);
};

WebVRManager.prototype.setFullscreenCallback = function(callback) {
  this.fullscreenCallback = callback;
};

WebVRManager.prototype.setVRCallback = function(callback) {
  this.vrCallback = callback;
};

WebVRManager.prototype.setExitFullscreenCallback = function(callback) {
  this.exitFullscreenCallback = callback;
};

/**
 * Promise returns true if there is at least one HMD device available.
 */
WebVRManager.prototype.getDeviceByType_ = function(type) {
  return new Promise(function(resolve, reject) {
    navigator.getVRDisplays().then(function(displays) {
      // Promise succeeds, but check if there are any displays actually.
      for (var i = 0; i < displays.length; i++) {
        if (displays[i] instanceof type) {
          resolve(displays[i]);
          break;
        }
      }
      resolve(null);
    }, function() {
      // No displays are found.
      resolve(null);
    });
  });
};

/**
 * Helper for entering VR mode.
 */
WebVRManager.prototype.enterVRMode_ = function() {
  this.hmd.requestPresent([{
    source: this.renderer.domElement,
    predistorted: this.predistorted
  }]);
};

WebVRManager.prototype.setMode_ = function(mode) {
  var oldMode = this.mode;
  if (mode === this.mode) {
    //console.warn('Not changing modes, already in %s', mode);
    return;
  }
  // console.log('Mode change: %s => %s', this.mode, mode);
  this.mode = mode;
  this.button.setMode(mode, this.isVRCompatible);

  // Emit an event indicating the mode changed.
  this.emit('modechange', mode, oldMode);
};

/**
 * Main button was clicked.
 */
WebVRManager.prototype.onFSClick_ = function() {
  switch (this.mode) {
    case Modes.NORMAL:
      // TODO: Remove this hack if/when iOS gets real fullscreen mode.
      // If this is an iframe on iOS, break out and open in no_fullscreen mode.
      if (Util.isIOS() && Util.isIFrame()) {
        if (this.fullscreenCallback) {
          this.fullscreenCallback();
        } else {
          var url = window.location.href;
          url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
          url = Util.appendQueryParameter(url, 'start_mode', Modes.MAGIC_WINDOW);
          top.location.href = url;
          return;
        }
      }
      this.setMode_(Modes.MAGIC_WINDOW);
      this.requestFullscreen_();
      break;
    case Modes.MAGIC_WINDOW:
      if (this.isFullscreenDisabled) {
        window.history.back();
        return;
      }
      if (this.exitFullscreenCallback) {
        this.exitFullscreenCallback();
      }
      this.setMode_(Modes.NORMAL);
      this.exitFullscreen_();
      break;
  }
};

/**
 * The VR button was clicked.
 */
WebVRManager.prototype.onVRClick_ = function() {
  // TODO: Remove this hack when iOS has fullscreen mode.
  // If this is an iframe on iOS, break out and open in no_fullscreen mode.
  if (this.mode === Modes.NORMAL && Util.isIOS() && Util.isIFrame()) {
    if (this.vrCallback) {
      this.vrCallback();
    } else {
      var url = window.location.href;
      url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
      url = Util.appendQueryParameter(url, 'start_mode', Modes.VR);
      top.location.href = url;
      return;
    }
  }
  this.enterVRMode_();
};

WebVRManager.prototype.requestFullscreen_ = function() {
  var canvas = document.body;
  //var canvas = this.renderer.domElement;
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
};

WebVRManager.prototype.exitFullscreen_ = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

WebVRManager.prototype.onVRDisplayPresentChange_ = function(e) {
  //console.log('onVRDisplayPresentChange_', e);
  if (this.hmd.isPresenting) {
    this.setMode_(Modes.VR);
  } else {
    this.setMode_(Modes.NORMAL);
  }
};

WebVRManager.prototype.onVRDisplayDeviceParamsChange_ = function(e) {
  //console.log('onVRDisplayDeviceParamsChange_', e);
};

WebVRManager.prototype.onFullscreenChange_ = function(e) {
  // If we leave full-screen, go back to normal mode.
  if (document.webkitFullscreenElement === null ||
      document.mozFullScreenElement === null) {
    this.setMode_(Modes.NORMAL);
  }
};

module.exports = WebVRManager;

},{"./button-manager.js":1,"./emitter.js":2,"./modes.js":5,"./util.js":7}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYnV0dG9uLW1hbmFnZXIuanMiLCJzcmMvZW1pdHRlci5qcyIsInNyYy9tYWluLmpzIiwic3JjL21vZGVsLmpzIiwic3JjL21vZGVzLmpzIiwic3JjL3NjZW5lLmpzIiwic3JjL3V0aWwuanMiLCJzcmMvd2VidnItbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLypcbiAqIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuL2VtaXR0ZXIuanMnKTtcbnZhciBNb2RlcyA9IHJlcXVpcmUoJy4vbW9kZXMuanMnKTtcbnZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbi8qKlxuICogRXZlcnl0aGluZyBoYXZpbmcgdG8gZG8gd2l0aCB0aGUgV2ViVlIgYnV0dG9uLlxuICogRW1pdHMgYSAnY2xpY2snIGV2ZW50IHdoZW4gaXQncyBjbGlja2VkLlxuICovXG5mdW5jdGlvbiBCdXR0b25NYW5hZ2VyKG9wdF9yb290KSB7XG4gIHZhciByb290ID0gb3B0X3Jvb3QgfHwgZG9jdW1lbnQuYm9keTtcbiAgdGhpcy5sb2FkSWNvbnNfKCk7XG5cbiAgLy8gTWFrZSB0aGUgZnVsbHNjcmVlbiBidXR0b24uXG4gIHZhciBmc0J1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKCk7XG4gIGZzQnV0dG9uLnNyYyA9IHRoaXMuSUNPTlMuZnVsbHNjcmVlbjtcbiAgZnNCdXR0b24udGl0bGUgPSAnRnVsbHNjcmVlbiBtb2RlJztcbiAgdmFyIHMgPSBmc0J1dHRvbi5zdHlsZTtcbiAgcy5ib3R0b20gPSAwO1xuICBzLnJpZ2h0ID0gMDtcbiAgZnNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNyZWF0ZUNsaWNrSGFuZGxlcl8oJ2ZzJykpO1xuICByb290LmFwcGVuZENoaWxkKGZzQnV0dG9uKTtcbiAgdGhpcy5mc0J1dHRvbiA9IGZzQnV0dG9uO1xuXG4gIC8vIE1ha2UgdGhlIFZSIGJ1dHRvbi5cbiAgdmFyIHZyQnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oKTtcbiAgdnJCdXR0b24uc3JjID0gdGhpcy5JQ09OUy5jYXJkYm9hcmQ7XG4gIHZyQnV0dG9uLnRpdGxlID0gJ1ZpcnR1YWwgcmVhbGl0eSBtb2RlJztcbiAgcyA9IHZyQnV0dG9uLnN0eWxlO1xuICBzLmJvdHRvbSA9IDA7XG4gIHMucmlnaHQgPSAnNDhweCc7XG4gIHZyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jcmVhdGVDbGlja0hhbmRsZXJfKCd2cicpKTtcbiAgcm9vdC5hcHBlbmRDaGlsZCh2ckJ1dHRvbik7XG4gIHRoaXMudnJCdXR0b24gPSB2ckJ1dHRvbjtcblxuICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XG5cbn1cbkJ1dHRvbk1hbmFnZXIucHJvdG90eXBlID0gbmV3IEVtaXR0ZXIoKTtcblxuQnV0dG9uTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlQnV0dG9uID0gZnVuY3Rpb24oKSB7XG4gIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgYnV0dG9uLmNsYXNzTmFtZSA9ICd3ZWJ2ci1idXR0b24nO1xuICB2YXIgcyA9IGJ1dHRvbi5zdHlsZTtcbiAgcy5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIHMud2lkdGggPSAnMjRweCc7XG4gIHMuaGVpZ2h0ID0gJzI0cHgnO1xuICBzLmJhY2tncm91bmRTaXplID0gJ2NvdmVyJztcbiAgcy5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICBzLmJvcmRlciA9IDA7XG4gIHMudXNlclNlbGVjdCA9ICdub25lJztcbiAgcy53ZWJraXRVc2VyU2VsZWN0ID0gJ25vbmUnO1xuICBzLk1velVzZXJTZWxlY3QgPSAnbm9uZSc7XG4gIHMuY3Vyc29yID0gJ3BvaW50ZXInO1xuICBzLnBhZGRpbmcgPSAnMTJweCc7XG4gIHMuekluZGV4ID0gMTtcbiAgcy5kaXNwbGF5ID0gJ25vbmUnO1xuICBzLmJveFNpemluZyA9ICdjb250ZW50LWJveCc7XG5cbiAgLy8gUHJldmVudCBidXR0b24gZnJvbSBiZWluZyBzZWxlY3RlZCBhbmQgZHJhZ2dlZC5cbiAgYnV0dG9uLmRyYWdnYWJsZSA9IGZhbHNlO1xuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSk7XG5cbiAgLy8gU3R5bGUgaXQgb24gaG92ZXIuXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oZSkge1xuICAgIHMuZmlsdGVyID0gcy53ZWJraXRGaWx0ZXIgPSAnZHJvcC1zaGFkb3coMCAwIDVweCByZ2JhKDI1NSwyNTUsMjU1LDEpKSc7XG4gIH0pO1xuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICBzLmZpbHRlciA9IHMud2Via2l0RmlsdGVyID0gJyc7XG4gIH0pO1xuICByZXR1cm4gYnV0dG9uO1xufTtcblxuQnV0dG9uTWFuYWdlci5wcm90b3R5cGUuc2V0TW9kZSA9IGZ1bmN0aW9uKG1vZGUsIGlzVlJDb21wYXRpYmxlKSB7XG4gIGlzVlJDb21wYXRpYmxlID0gaXNWUkNvbXBhdGlibGUgfHwgd2luZG93LldlYlZSQ29uZmlnLkZPUkNFX0VOQUJMRV9WUjtcbiAgaWYgKCF0aGlzLmlzVmlzaWJsZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGVzLk5PUk1BTDpcbiAgICAgIHRoaXMuZnNCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLmZzQnV0dG9uLnNyYyA9IHRoaXMuSUNPTlMuZnVsbHNjcmVlbjtcbiAgICAgIHRoaXMudnJCdXR0b24uc3R5bGUuZGlzcGxheSA9IChpc1ZSQ29tcGF0aWJsZSA/ICdibG9jaycgOiAnbm9uZScpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBNb2Rlcy5NQUdJQ19XSU5ET1c6XG4gICAgICB0aGlzLmZzQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgdGhpcy5mc0J1dHRvbi5zcmMgPSB0aGlzLklDT05TLmV4aXRGdWxsc2NyZWVuO1xuICAgICAgdGhpcy52ckJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBNb2Rlcy5WUjpcbiAgICAgIHRoaXMuZnNCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIHRoaXMudnJCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gSGFjayBmb3IgU2FmYXJpIE1hYy9pT1MgdG8gZm9yY2UgcmVsYXlvdXQgKHN2Zy1zcGVjaWZpYyBpc3N1ZSlcbiAgLy8gaHR0cDovL2dvby5nbC9oamdSNnJcbiAgdmFyIG9sZFZhbHVlID0gdGhpcy5mc0J1dHRvbi5zdHlsZS5kaXNwbGF5O1xuICB0aGlzLmZzQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgLy90aGlzLmZzQnV0dG9uLm9mZnNldEhlaWdodDtcbiAgdGhpcy5mc0J1dHRvbi5zdHlsZS5kaXNwbGF5ID0gb2xkVmFsdWU7XG59O1xuXG5CdXR0b25NYW5hZ2VyLnByb3RvdHlwZS5zZXRWaXNpYmlsaXR5ID0gZnVuY3Rpb24oaXNWaXNpYmxlKSB7XG4gIHRoaXMuaXNWaXNpYmxlID0gaXNWaXNpYmxlO1xuICB0aGlzLmZzQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBpc1Zpc2libGUgPyAnYmxvY2snIDogJ25vbmUnO1xuICB0aGlzLnZyQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBpc1Zpc2libGUgPyAnYmxvY2snIDogJ25vbmUnO1xufTtcblxuQnV0dG9uTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlQ2xpY2tIYW5kbGVyXyA9IGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuZW1pdChldmVudE5hbWUpO1xuICB9LmJpbmQodGhpcyk7XG59O1xuXG5CdXR0b25NYW5hZ2VyLnByb3RvdHlwZS5sb2FkSWNvbnNfID0gZnVuY3Rpb24oKSB7XG4gIC8vIFByZWxvYWQgc29tZSBoYXJkLWNvZGVkIFNWRy5cbiAgdGhpcy5JQ09OUyA9IHt9O1xuICB0aGlzLklDT05TLmNhcmRib2FyZCA9IFV0aWwuYmFzZTY0KCdpbWFnZS9zdmcreG1sJywgJ1BITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGRwWkhSb1BTSXlOSEI0SWlCb1pXbG5hSFE5SWpJMGNIZ2lJSFpwWlhkQ2IzZzlJakFnTUNBeU5DQXlOQ0lnWm1sc2JEMGlJMFpHUmtaR1JpSStDaUFnSUNBOGNHRjBhQ0JrUFNKTk1qQXVOelFnTmtnekxqSXhRekl1TlRVZ05pQXlJRFl1TlRjZ01pQTNMakk0ZGpFd0xqUTBZekFnTGpjdU5UVWdNUzR5T0NBeExqSXpJREV1TWpob05DNDNPV011TlRJZ01DQXVPVFl0TGpNeklERXVNVFF0TGpjNWJERXVOQzB6TGpRNFl5NHlNeTB1TlRrdU56a3RNUzR3TVNBeExqUTBMVEV1TURGek1TNHlNUzQwTWlBeExqUTFJREV1TURGc01TNHpPU0F6TGpRNFl5NHhPUzQwTmk0Mk15NDNPU0F4TGpFeExqYzVhRFF1TnpsakxqY3hJREFnTVM0eU5pMHVOVGNnTVM0eU5pMHhMakk0VmpjdU1qaGpNQzB1TnkwdU5UVXRNUzR5T0MweExqSTJMVEV1TWpoNlRUY3VOU0F4TkM0Mk1tTXRNUzR4TnlBd0xUSXVNVE10TGprMUxUSXVNVE10TWk0eE1pQXdMVEV1TVRjdU9UWXRNaTR4TXlBeUxqRXpMVEl1TVRNZ01TNHhPQ0F3SURJdU1USXVPVFlnTWk0eE1pQXlMakV6Y3kwdU9UVWdNaTR4TWkweUxqRXlJREl1TVRKNmJUa2dNR010TVM0eE55QXdMVEl1TVRNdExqazFMVEl1TVRNdE1pNHhNaUF3TFRFdU1UY3VPVFl0TWk0eE15QXlMakV6TFRJdU1UTnpNaTR4TWk0NU5pQXlMakV5SURJdU1UTXRMamsxSURJdU1USXRNaTR4TWlBeUxqRXllaUl2UGdvZ0lDQWdQSEJoZEdnZ1ptbHNiRDBpYm05dVpTSWdaRDBpVFRBZ01HZ3lOSFl5TkVnd1ZqQjZJaTgrQ2p3dmMzWm5QZ289Jyk7XG4gIHRoaXMuSUNPTlMuZnVsbHNjcmVlbiA9IFV0aWwuYmFzZTY0KCdpbWFnZS9zdmcreG1sJywgJ1BITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGRwWkhSb1BTSXlOSEI0SWlCb1pXbG5hSFE5SWpJMGNIZ2lJSFpwWlhkQ2IzZzlJakFnTUNBeU5DQXlOQ0lnWm1sc2JEMGlJMFpHUmtaR1JpSStDaUFnSUNBOGNHRjBhQ0JrUFNKTk1DQXdhREkwZGpJMFNEQjZJaUJtYVd4c1BTSnViMjVsSWk4K0NpQWdJQ0E4Y0dGMGFDQmtQU0pOTnlBeE5FZzFkalZvTlhZdE1rZzNkaTB6ZW0wdE1pMDBhREpXTjJnelZqVklOWFkxZW0weE1pQTNhQzB6ZGpKb05YWXROV2d0TW5ZemVrMHhOQ0ExZGpKb00zWXphREpXTldndE5Yb2lMejRLUEM5emRtYytDZz09Jyk7XG4gIHRoaXMuSUNPTlMuZXhpdEZ1bGxzY3JlZW4gPSBVdGlsLmJhc2U2NCgnaW1hZ2Uvc3ZnK3htbCcsICdQSE4yWnlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhkcFpIUm9QU0l5TkhCNElpQm9aV2xuYUhROUlqSTBjSGdpSUhacFpYZENiM2c5SWpBZ01DQXlOQ0F5TkNJZ1ptbHNiRDBpSTBaR1JrWkdSaUkrQ2lBZ0lDQThjR0YwYUNCa1BTSk5NQ0F3YURJMGRqSTBTREI2SWlCbWFXeHNQU0p1YjI1bElpOCtDaUFnSUNBOGNHRjBhQ0JrUFNKTk5TQXhObWd6ZGpOb01uWXROVWcxZGpKNmJUTXRPRWcxZGpKb05WWTFTRGgyTTNwdE5pQXhNV2d5ZGkwemFETjJMVEpvTFRWMk5YcHRNaTB4TVZZMWFDMHlkalZvTlZZNGFDMHplaUl2UGdvOEwzTjJaejRLJyk7XG4gIHRoaXMuSUNPTlMuc2V0dGluZ3MgPSBVdGlsLmJhc2U2NCgnaW1hZ2Uvc3ZnK3htbCcsICdQSE4yWnlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhkcFpIUm9QU0l5TkhCNElpQm9aV2xuYUhROUlqSTBjSGdpSUhacFpYZENiM2c5SWpBZ01DQXlOQ0F5TkNJZ1ptbHNiRDBpSTBaR1JrWkdSaUkrQ2lBZ0lDQThjR0YwYUNCa1BTSk5NQ0F3YURJMGRqSTBTREI2SWlCbWFXeHNQU0p1YjI1bElpOCtDaUFnSUNBOGNHRjBhQ0JrUFNKTk1Ua3VORE1nTVRJdU9UaGpMakEwTFM0ek1pNHdOeTB1TmpRdU1EY3RMams0Y3kwdU1ETXRMalkyTFM0d055MHVPVGhzTWk0eE1TMHhMalkxWXk0eE9TMHVNVFV1TWpRdExqUXlMakV5TFM0Mk5Hd3RNaTB6TGpRMll5MHVNVEl0TGpJeUxTNHpPUzB1TXkwdU5qRXRMakl5YkMweUxqUTVJREZqTFM0MU1pMHVOQzB4TGpBNExTNDNNeTB4TGpZNUxTNDVPR3d0TGpNNExUSXVOalZETVRRdU5EWWdNaTR4T0NBeE5DNHlOU0F5SURFMElESm9MVFJqTFM0eU5TQXdMUzQwTmk0eE9DMHVORGt1TkRKc0xTNHpPQ0F5TGpZMVl5MHVOakV1TWpVdE1TNHhOeTQxT1MweExqWTVMams0YkMweUxqUTVMVEZqTFM0eU15MHVNRGt0TGpRNUlEQXRMall4TGpJeWJDMHlJRE11TkRaakxTNHhNeTR5TWkwdU1EY3VORGt1TVRJdU5qUnNNaTR4TVNBeExqWTFZeTB1TURRdU16SXRMakEzTGpZMUxTNHdOeTQ1T0hNdU1ETXVOall1TURjdU9UaHNMVEl1TVRFZ01TNDJOV010TGpFNUxqRTFMUzR5TkM0ME1pMHVNVEl1TmpSc01pQXpMalEyWXk0eE1pNHlNaTR6T1M0ekxqWXhMakl5YkRJdU5Ea3RNV011TlRJdU5DQXhMakE0TGpjeklERXVOamt1T1Roc0xqTTRJREl1TmpWakxqQXpMakkwTGpJMExqUXlMalE1TGpReWFEUmpMakkxSURBZ0xqUTJMUzR4T0M0ME9TMHVOREpzTGpNNExUSXVOalZqTGpZeExTNHlOU0F4TGpFM0xTNDFPU0F4TGpZNUxTNDVPR3d5TGpRNUlERmpMakl6TGpBNUxqUTVJREFnTGpZeExTNHlNbXd5TFRNdU5EWmpMakV5TFM0eU1pNHdOeTB1TkRrdExqRXlMUzQyTkd3dE1pNHhNUzB4TGpZMWVrMHhNaUF4TlM0MVl5MHhMamt6SURBdE15NDFMVEV1TlRjdE15NDFMVE11TlhNeExqVTNMVE11TlNBekxqVXRNeTQxSURNdU5TQXhMalUzSURNdU5TQXpMalV0TVM0MU55QXpMalV0TXk0MUlETXVOWG9pTHo0S1BDOXpkbWMrQ2c9PScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25NYW5hZ2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKCkge1xuICB0aGlzLmNhbGxiYWNrcyA9IHt9O1xufVxuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrc1tldmVudE5hbWVdO1xuICBpZiAoIWNhbGxiYWNrcykge1xuICAgIC8vY29uc29sZS5sb2coJ05vIHZhbGlkIGNhbGxiYWNrIHNwZWNpZmllZC4nKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIC8vIEVsaW1pbmF0ZSB0aGUgZmlyc3QgcGFyYW0gKHRoZSBjYWxsYmFjaykuXG4gIGFyZ3Muc2hpZnQoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cbn07XG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICBpZiAoZXZlbnROYW1lIGluIHRoaXMuY2FsbGJhY2tzKSB7XG4gICAgdGhpcy5jYWxsYmFja3NbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNhbGxiYWNrc1tldmVudE5hbWVdID0gW2NhbGxiYWNrXTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG52YXIgV2ViVlJNYW5hZ2VyID0gcmVxdWlyZSgnLi93ZWJ2ci1tYW5hZ2VyLmpzJyk7XG52YXIgU2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lLmpzJyk7XG52YXIgTW9kZWwgPSByZXF1aXJlKCcuL21vZGVsLmpzJyk7XG5cbi8vIFRPRE8gTG9hZCBKU09OID8/P1xud2luZG93LldlYlZSQ29uZmlnID0gd2luZG93LldlYlZSQ29uZmlnIHx8IHt9O1xud2luZG93LldlYlZSTWFuYWdlciA9IFdlYlZSTWFuYWdlcjtcblxudmFyIHNjZW5lMSA9IG5ldyBTY2VuZSgpO1xuXG4vLyBBZGQgYSByZXBlYXRpbmcgZ3JpZCBhcyBhIHNreWJveC5cbnZhciBib3hTaXplID0gMTU7XG52YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcbmxvYWRlci5sb2FkKCdpbWcvYm94LnBuZycsIG9uVGV4dHVyZUxvYWRlZCk7XG5cbmZ1bmN0aW9uIG9uVGV4dHVyZUxvYWRlZCh0ZXh0dXJlKSB7XG4gIHRleHR1cmUud3JhcFMgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgdGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICB0ZXh0dXJlLnJlcGVhdC5zZXQoYm94U2l6ZSwgYm94U2l6ZSk7XG5cbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJveFNpemUsIGJveFNpemUsIGJveFNpemUpO1xuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIG1hcDogdGV4dHVyZSxcbiAgICBjb2xvcjogMHgwMUJFMDAsXG4gICAgc2lkZTogVEhSRUUuQmFja1NpZGVcbiAgfSk7XG5cbiAgLy8gQWxpZ24gdGhlIHNreWJveCB0byB0aGUgZmxvb3IgKHdoaWNoIGlzIGF0IHk9MCkuXG4gIHZhciBza3lib3ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICBza3lib3gucG9zaXRpb24ueSA9IGJveFNpemUvMjtcbiAgc2NlbmUxLnNjZW5lLmFkZChza3lib3gpO1xuXG4gIC8vIEZvciBoaWdoIGVuZCBWUiBkZXZpY2VzIGxpa2UgVml2ZSBhbmQgT2N1bHVzLCB0YWtlIGludG8gYWNjb3VudCB0aGUgc3RhZ2VcbiAgLy8gcGFyYW1ldGVycyBwcm92aWRlZC5cbiAgc2V0dXBTdGFnZSgpO1xufVxuXG5cbi8vIENyZWF0ZSBhIFZSIG1hbmFnZXIgaGVscGVyIHRvIGVudGVyIGFuZCBleGl0IFZSIG1vZGUuXG52YXIgcGFyYW1zID0ge1xuICBoaWRlQnV0dG9uOiBmYWxzZSwgLy8gRGVmYXVsdDogZmFsc2UuXG4gIGlzVW5kaXN0b3J0ZWQ6IGZhbHNlIC8vIERlZmF1bHQ6IGZhbHNlLlxufTtcbnZhciBtYW5hZ2VyID0gbmV3IFdlYlZSTWFuYWdlcihzY2VuZTEucmVuZGVyZXIsIHNjZW5lMS5lZmZlY3QsIHBhcmFtcyk7XG5cblxuLy8gTG9hZCAzRCBtb2RlbFxudmFyIGN1YmUgPSBuZXcgTW9kZWwoJ2Fzc2V0X3NyYy9hbmltYXRlZC1jaGFyYWN0ZXIuanNvbicsIGZ1bmN0aW9uKCkge1xuICBjdWJlLm1vZGVsLnBvc2l0aW9uLnNldCgwLCBzY2VuZTEuY29udHJvbHMudXNlckhlaWdodCwgLTEpO1xuICBjdWJlLm1vZGVsLnNjYWxlLnggPSBjdWJlLm1vZGVsLnNjYWxlLnkgPSBjdWJlLm1vZGVsLnNjYWxlLnogPSAwLjU7XG4gIC8vIFRPRE8gTW92ZSB0byBjb25zdHJ1Y3RvciA/XG4gIHNjZW5lMS5zY2VuZS5hZGQoY3ViZS5tb2RlbCk7XG59KTtcblxuXG4vLyBUT0RPIEdyb3VuZCBzY2VuZVxudmFyIGdyb3VuZCA9IG51bGw7XG5mdW5jdGlvbiBpbml0R3JvdW5kKCkge1xuICBcdHZhciBncm91bmRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCggeyBjb2xvcjogMHhmZmZmZmYgfSApO1xuICBcdGdyb3VuZCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSggMjAsIDIwICksIGdyb3VuZE1hdGVyaWFsICk7XG4gIFx0Z3JvdW5kLnBvc2l0aW9uLnNldCgwLCBzY2VuZTEuY29udHJvbHMudXNlckhlaWdodCAtIDAuNSwgMCk7XG4gIFx0Z3JvdW5kLnJvdGF0aW9uLnggPSAtIE1hdGguUEkgLyAyO1xuICBcdGdyb3VuZC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgXHRzY2VuZTEuc2NlbmUuYWRkKCBncm91bmQgKTtcbn1cblxuaW5pdEdyb3VuZCgpO1xuXG5cbi8vIFRPRE8gTGlnaHQgY2xhc3NcbmZ1bmN0aW9uIGluaXRMaWdodHMoKSB7XG4gIHZhciBzcG90TGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KCAweGZmZmZmZiApO1xuICBzcG90TGlnaHQucG9zaXRpb24uc2V0KCAwLCBzY2VuZTEuY29udHJvbHMudXNlckhlaWdodCs4LCAwICk7XG4gIHNwb3RMaWdodC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgc2NlbmUxLnNjZW5lLmFkZCggc3BvdExpZ2h0ICk7XG59XG5cbmluaXRMaWdodHMoKTtcblxuLy8gLy8gQ3JlYXRlIDNEIG9iamVjdHMuXG4vLyB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMC41LCAwLjUsIDAuNSk7XG4vLyB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKCk7XG4vLyB2YXIgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cbi8vIC8vIFBvc2l0aW9uIGN1YmUgbWVzaCB0byBiZSByaWdodCBpbiBmcm9udCBvZiB5b3UuXG4vL2N1YmUucG9zaXRpb24uc2V0KDAsIGNvbnRyb2xzLnVzZXJIZWlnaHQsIC0xKTtcblxuLy8gLy8gQWRkIGN1YmUgbWVzaCB0byB5b3VyIHRocmVlLmpzIHNjZW5lXG4vLyBzY2VuZS5hZGQoY3ViZSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvblJlc2l6ZSwgdHJ1ZSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndnJkaXNwbGF5cHJlc2VudGNoYW5nZScsIG9uUmVzaXplLCB0cnVlKTtcbi8vIFRPRE8gTW92ZSB0aGlzIFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICBpZiAoY3ViZS5jdXJyZW50QWN0aW9uIDwgY3ViZS5hY3Rpb25zLmxlbmd0aCAtIDEpIHtcbiAgICBjdWJlLmZhZGVBY3Rpb24oY3ViZS5jdXJyZW50QWN0aW9uICsgMSApO1xuICB9IGVsc2Uge1xuICAgIGN1YmUuZmFkZUFjdGlvbigwKTtcbiAgfVxufSwgdHJ1ZSk7XG5cbi8vIFJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGxvb3AgZnVuY3Rpb25cbnZhciBsYXN0UmVuZGVyID0gMDtcbnZhciB0aGV0YSA9IDA7XG5mdW5jdGlvbiBhbmltYXRlKHRpbWVzdGFtcCkge1xuICB2YXIgZGVsdGEgPSBNYXRoLlBJIC8gMTAwO1xuICB2YXIgcmFkaXVzID0gNTtcblxuICBsYXN0UmVuZGVyID0gdGltZXN0YW1wO1xuXG4gIC8vIEFwcGx5IHJvdGF0aW9uIHRvIGN1YmUgbWVzaFxuICAvL2N1YmUubW9kZWwucG9zaXRpb24ueCA9IE1hdGguY29zKHRoZXRhKSAqIHJhZGl1cztcbiAgLy9jdWJlLm1vZGVsLnBvc2l0aW9uLnogPSBNYXRoLnNpbih0aGV0YSkgKiByYWRpdXM7XG4gIHRoZXRhICs9IGRlbHRhO1xuXG4gIHNjZW5lMS5jb250cm9scy51cGRhdGUoKTtcbiAgLy8gVXBkYXRlIG1vZGVsIGFuaW1hdGlvbnNcbiAgY3ViZS5taXhlci51cGRhdGUoZGVsdGEpO1xuICAvLyBSZW5kZXIgdGhlIHNjZW5lIHRocm91Z2ggdGhlIG1hbmFnZXIuXG4gIG1hbmFnZXIucmVuZGVyKHNjZW5lMS5zY2VuZSwgc2NlbmUxLmNhbWVyYSwgdGltZXN0YW1wKTtcbiAgc2NlbmUxLmVmZmVjdC5yZW5kZXIoc2NlbmUxLnNjZW5lLCBzY2VuZTEuY2FtZXJhKTtcblxuICB2ckRpc3BsYXkucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xufVxuXG5mdW5jdGlvbiBvblJlc2l6ZShlKSB7XG4gIHNjZW5lMS5lZmZlY3Quc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgc2NlbmUxLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgc2NlbmUxLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG59XG5cbnZhciB2ckRpc3BsYXk7XG5cbi8vIEdldCB0aGUgSE1ELCBhbmQgaWYgd2UncmUgZGVhbGluZyB3aXRoIHNvbWV0aGluZyB0aGF0IHNwZWNpZmllc1xuLy8gc3RhZ2VQYXJhbWV0ZXJzLCByZWFycmFuZ2UgdGhlIHNjZW5lLlxuZnVuY3Rpb24gc2V0dXBTdGFnZSgpIHtcbiAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMoKS50aGVuKGZ1bmN0aW9uKGRpc3BsYXlzKSB7XG4gICAgaWYgKGRpc3BsYXlzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZyRGlzcGxheSA9IGRpc3BsYXlzWzBdO1xuICAgICAgaWYgKHZyRGlzcGxheS5zdGFnZVBhcmFtZXRlcnMpIHtcbiAgICAgICAgc2V0U3RhZ2VEaW1lbnNpb25zKHZyRGlzcGxheS5zdGFnZVBhcmFtZXRlcnMpO1xuICAgICAgfVxuICAgICAgdnJEaXNwbGF5LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRTdGFnZURpbWVuc2lvbnMoc3RhZ2UpIHtcbiAgLy8gTWFrZSB0aGUgc2t5Ym94IGZpdCB0aGUgc3RhZ2UuXG4gIHZhciBtYXRlcmlhbCA9IHNreWJveC5tYXRlcmlhbDtcbiAgc2NlbmUxLnNjZW5lLnJlbW92ZShza3lib3gpO1xuXG4gIC8vIFNpemUgdGhlIHNreWJveCBhY2NvcmRpbmcgdG8gdGhlIHNpemUgb2YgdGhlIGFjdHVhbCBzdGFnZS5cbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KHN0YWdlLnNpemVYLCBib3hTaXplLCBzdGFnZS5zaXplWik7XG4gIHZhciBza3lib3ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuXG4gIC8vIFBsYWNlIGl0IG9uIHRoZSBmbG9vci5cbiAgc2t5Ym94LnBvc2l0aW9uLnkgPSBib3hTaXplLzI7XG4gIHNjZW5lMS5zY2VuZS5hZGQoc2t5Ym94KTtcblxuICAvLyBQbGFjZSB0aGUgY3ViZSBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzY2VuZSwgYXQgdXNlciBoZWlnaHQuXG4gIGN1YmUubW9kZWwucG9zaXRpb24uc2V0KDAsIHNjZW5lMS5jb250cm9scy51c2VySGVpZ2h0LCAwKTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBNb2RlbChwYXRoLCBvbkxvYWQpIHtcblx0dGhpcy5wYXRoID0gcGF0aDtcblx0dGhpcy5vbkxvYWQgPSBvbkxvYWQ7XG5cdHRoaXMubW9kZWwgPSBudWxsO1xuXG5cdHRoaXMubWl4ZXIgPSBudWxsO1xuXHR0aGlzLmN1cnJlbnRBY3Rpb24gPSAwO1xuXHR0aGlzLmFjdGlvbnMgPSBbXTtcblxuXHR0aGlzLmluaXRNZXNoKCk7XG59XG5cblxuTW9kZWwucHJvdG90eXBlLmluaXRNZXNoID0gZnVuY3Rpb24oKSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXG5cdGxvYWRlci5sb2FkKHRoaXMucGF0aCAsIGZ1bmN0aW9uKGdlb21ldHJ5LCBtYXRlcmlhbHMpIHtcblx0XHRtYXRlcmlhbHMuZm9yRWFjaChmdW5jdGlvbihtYXRlcmlhbCkge1xuXHRcdFx0bWF0ZXJpYWwuc2tpbm5pbmcgPSB0cnVlO1xuXHRcdH0pO1xuXG5cdFx0X3RoaXMubW9kZWwgPSBuZXcgVEhSRUUuU2tpbm5lZE1lc2goZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKSk7XG5cblx0XHRpZiAodHlwZW9mIGdlb21ldHJ5LmFuaW1hdGlvbnMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRfdGhpcy5pbml0QW5pbWF0aW9uKGdlb21ldHJ5KTtcblx0XHR9XG5cblx0XHRfdGhpcy5vbkxvYWQoKTtcblx0fSk7XG59O1xuXG5Nb2RlbC5wcm90b3R5cGUuaW5pdEFuaW1hdGlvbiA9IGZ1bmN0aW9uKGdlb21ldHJ5KSB7XG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHRoaXMubWl4ZXIgPSBuZXcgVEhSRUUuQW5pbWF0aW9uTWl4ZXIodGhpcy5tb2RlbCk7XG5cdHZhciBpID0gMDtcblxuXHRnZW9tZXRyeS5hbmltYXRpb25zLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0aW9uKSB7XG5cdFx0X3RoaXMuYWN0aW9uc1tpXSA9IF90aGlzLm1peGVyLmNsaXBBY3Rpb24oYW5pbWF0aW9uKTtcblx0XHRfdGhpcy5hY3Rpb25zW2ldLnNldEVmZmVjdGl2ZVdlaWdodCgxKTtcblx0XHRfdGhpcy5hY3Rpb25zW2krK10uZW5hYmxlZCA9IHRydWU7XG5cdH0pO1xuXG5cdHRoaXMuYWN0aW9uc1t0aGlzLmN1cnJlbnRBY3Rpb25dLnBsYXkoKTtcbn07XG5cbk1vZGVsLnByb3RvdHlwZS5mYWRlQWN0aW9uID0gZnVuY3Rpb24obmJyKSB7XG5cdHZhciBmcm9tID0gdGhpcy5hY3Rpb25zWyB0aGlzLmN1cnJlbnRBY3Rpb24gXS5wbGF5KCk7XG5cdHZhciB0byA9IHRoaXMuYWN0aW9uc1sgbmJyIF0ucGxheSgpO1xuXG5cdGZyb20uZW5hYmxlZCA9IHRydWU7XG5cdHRvLmVuYWJsZWQgPSB0cnVlO1xuXG5cdGlmICh0by5sb29wID09PSBUSFJFRS5Mb29wT25jZSkge1xuXHRcdHRvLnJlc2V0KCk7XG5cdH1cblxuXHRmcm9tLmNyb3NzRmFkZVRvKHRvLCAwLjMpO1xuXHR0aGlzLmN1cnJlbnRBY3Rpb24gPSBuYnI7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWw7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG52YXIgTW9kZXMgPSB7XG4gIFVOS05PV046IDAsXG4gIC8vIE5vdCBmdWxsc2NyZWVuLCBqdXN0IHRyYWNraW5nLlxuICBOT1JNQUw6IDEsXG4gIC8vIE1hZ2ljIHdpbmRvdyBpbW1lcnNpdmUgbW9kZS5cbiAgTUFHSUNfV0lORE9XOiAyLFxuICAvLyBGdWxsIHNjcmVlbiBzcGxpdCBzY3JlZW4gVlIgbW9kZS5cbiAgVlI6IDMsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIFNjZW5lKCkge1xuXHR0aGlzLnJlbmRlcmVyID0gbnVsbDtcblx0dGhpcy5zY2VuZSA9IG51bGw7XG5cdHRoaXMuY2FtZXJhID0gbnVsbDtcblx0dGhpcy5jb250cm9scyA9IG51bGw7XG5cdHRoaXMuZWZmZWN0ID0gbnVsbDtcblxuXHR0aGlzLnNldHVwKCk7XG59XG5cblxuU2NlbmUucHJvdG90eXBlLnNldHVwID0gZnVuY3Rpb24oKSB7XG5cdC8vIFNldHVwIHRocmVlLmpzIFdlYkdMIHJlbmRlcmVyLiBOb3RlOiBBbnRpYWxpYXNpbmcgaXMgYSBiaWcgcGVyZm9ybWFuY2UgaGl0LlxuXHQvLyBPbmx5IGVuYWJsZSBpdCBpZiB5b3UgYWN0dWFsbHkgbmVlZCB0by5cblx0dGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWV9KTtcblx0dGhpcy5yZW5kZXJlci5zaGFkb3dNYXBFbmFibGVkID0gdHJ1ZTtcblx0dGhpcy5yZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcblxuXHQvLyBBcHBlbmQgdGhlIGNhbnZhcyBlbGVtZW50IGNyZWF0ZWQgYnkgdGhlIHJlbmRlcmVyIHRvIGRvY3VtZW50IGJvZHkgZWxlbWVudC5cblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG5cdC8vIENyZWF0ZSBhIHRocmVlLmpzIHNjZW5lLlxuXHR0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cblx0Ly8gQ3JlYXRlIGEgdGhyZWUuanMgY2FtZXJhLlxuXHR0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg3NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDAuMSwgMTAwMDApO1xuXG5cdHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuVlJDb250cm9scyh0aGlzLmNhbWVyYSk7XG5cdHRoaXMuY29udHJvbHMuc3RhbmRpbmcgPSB0cnVlO1xuXHR0aGlzLmNvbnRyb2xzLnN0YW5kaW5nID0gdHJ1ZTtcblxuXHQvLyBBcHBseSBWUiBzdGVyZW8gcmVuZGVyaW5nIHRvIHJlbmRlcmVyLlxuXHR0aGlzLmVmZmVjdCA9IG5ldyBUSFJFRS5WUkVmZmVjdCh0aGlzLnJlbmRlcmVyKTtcblx0dGhpcy5lZmZlY3Quc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2NlbmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbnZhciBVdGlsID0ge307XG5cblV0aWwuYmFzZTY0ID0gZnVuY3Rpb24obWltZVR5cGUsIGJhc2U2NCkge1xuICByZXR1cm4gJ2RhdGE6JyArIG1pbWVUeXBlICsgJztiYXNlNjQsJyArIGJhc2U2NDtcbn07XG5cblV0aWwuaXNNb2JpbGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNoZWNrID0gZmFsc2U7XG4gIChmdW5jdGlvbihhKXtpZigvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vL2kudGVzdChhKXx8LzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHNcXC0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8XFwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3XFwtKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG1cXC18Y2VsbHxjaHRtfGNsZGN8Y21kXFwtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjXFwtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnxcXC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoXFwtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmXFwtNXxnXFwtbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZFxcLShtfHB8dCl8aGVpXFwtfGhpKHB0fHRhKXxocCggaXxpcCl8aHNcXC1jfGh0KGMoXFwtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aVxcLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHxcXC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Y1xcLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHxcXC1bYS13XSl8bGlid3xseW54fG0xXFwtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG1cXC1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dChcXC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKVxcLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8XFwtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuXFwtMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0XFwtZ3xxYVxcLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8XFwtWzItN118aVxcLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGhcXC18b298cFxcLSl8c2RrXFwvfHNlKGMoXFwtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaFxcLXxzaGFyfHNpZShcXC18bSl8c2tcXC0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGhcXC18dlxcLXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbFxcLXx0ZGdcXC18dGVsKGl8bSl8dGltXFwtfHRcXC1tb3x0byhwbHxzaCl8dHMoNzB8bVxcLXxtM3xtNSl8dHhcXC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXxcXC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKFxcLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhc1xcLXx5b3VyfHpldG98enRlXFwtL2kudGVzdChhLnN1YnN0cigwLDQpKSl7Y2hlY2sgPSB0cnVlO319KShuYXZpZ2F0b3IudXNlckFnZW50fHxuYXZpZ2F0b3IudmVuZG9yfHx3aW5kb3cub3BlcmEpO1xuICByZXR1cm4gY2hlY2s7XG59O1xuXG5VdGlsLmlzRmlyZWZveCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gL2ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xufTtcblxuVXRpbC5pc0lPUyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gLyhpUGFkfGlQaG9uZXxpUG9kKS9nLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG59O1xuXG5VdGlsLmlzSUZyYW1lID0gZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cblV0aWwuYXBwZW5kUXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbih1cmwsIGtleSwgdmFsdWUpIHtcbiAgLy8gRGV0ZXJtaW5lIGRlbGltaXRlciBiYXNlZCBvbiBpZiB0aGUgVVJMIGFscmVhZHkgR0VUIHBhcmFtZXRlcnMgaW4gaXQuXG4gIHZhciBkZWxpbWl0ZXIgPSAodXJsLmluZGV4T2YoJz8nKSA8IDAgPyAnPycgOiAnJicpO1xuICB1cmwgKz0gZGVsaW1pdGVyICsga2V5ICsgJz0nICsgdmFsdWU7XG4gIHJldHVybiB1cmw7XG59O1xuXG4vLyBGcm9tIGh0dHA6Ly9nb28uZ2wvNFdYM3RnXG5VdGlsLmdldFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24obmFtZSkge1xuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sIFwiXFxcXFtcIikucmVwbGFjZSgvW1xcXV0vLCBcIlxcXFxdXCIpO1xuICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiW1xcXFw/Jl1cIiArIG5hbWUgKyBcIj0oW14mI10qKVwiKSxcbiAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gXCJcIiA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xufTtcblxuVXRpbC5pc0xhbmRzY2FwZU1vZGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICh3aW5kb3cub3JpZW50YXRpb24gPT09IDkwIHx8IHdpbmRvdy5vcmllbnRhdGlvbiA9PT0gLTkwKTtcbn07XG5cblV0aWwuZ2V0U2NyZWVuV2lkdGggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIE1hdGgubWF4KHdpbmRvdy5zY3JlZW4ud2lkdGgsIHdpbmRvdy5zY3JlZW4uaGVpZ2h0KSAqXG4gICAgICB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbn07XG5cblV0aWwuZ2V0U2NyZWVuSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBNYXRoLm1pbih3aW5kb3cuc2NyZWVuLndpZHRoLCB3aW5kb3cuc2NyZWVuLmhlaWdodCkgKlxuICAgICAgd2luZG93LmRldmljZVBpeGVsUmF0aW87XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbnZhciBCdXR0b25NYW5hZ2VyID0gcmVxdWlyZSgnLi9idXR0b24tbWFuYWdlci5qcycpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCcuL2VtaXR0ZXIuanMnKTtcbnZhciBNb2RlcyA9IHJlcXVpcmUoJy4vbW9kZXMuanMnKTtcbnZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbi8qKlxuICogSGVscGVyIGZvciBnZXR0aW5nIGluIGFuZCBvdXQgb2YgVlIgbW9kZS5cbiAqL1xuZnVuY3Rpb24gV2ViVlJNYW5hZ2VyKHJlbmRlcmVyLCBlZmZlY3QsIHBhcmFtcykge1xuICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcblxuICB0aGlzLm1vZGUgPSBNb2Rlcy5VTktOT1dOO1xuXG4gIC8vIFNldCBvcHRpb24gdG8gaGlkZSB0aGUgYnV0dG9uLlxuICB0aGlzLmhpZGVCdXR0b24gPSB0aGlzLnBhcmFtcy5oaWRlQnV0dG9uIHx8IGZhbHNlO1xuICAvLyBXaGV0aGVyIG9yIG5vdCB0aGUgRk9WIHNob3VsZCBiZSBkaXN0b3J0ZWQgb3IgdW4tZGlzdG9ydGVkLiBCeSBkZWZhdWx0LCBpdFxuICAvLyBzaG91bGQgYmUgZGlzdG9ydGVkLCBidXQgaW4gdGhlIGNhc2Ugb2YgdmVydGV4IHNoYWRlciBiYXNlZCBkaXN0b3J0aW9uLFxuICAvLyBlbnN1cmUgdGhhdCB3ZSB1c2UgdW5kaXN0b3J0ZWQgcGFyYW1ldGVycy5cbiAgdGhpcy5wcmVkaXN0b3J0ZWQgPSAhIXRoaXMucGFyYW1zLnByZWRpc3RvcnRlZDtcblxuICAvLyBTYXZlIHRoZSBUSFJFRS5qcyByZW5kZXJlciBhbmQgZWZmZWN0IGZvciBsYXRlci5cbiAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICB0aGlzLmVmZmVjdCA9IGVmZmVjdDtcbiAgdmFyIHBvbHlmaWxsV3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53ZWJ2ci1wb2x5ZmlsbC1mdWxsc2NyZWVuLXdyYXBwZXInKTtcbiAgdGhpcy5idXR0b24gPSBuZXcgQnV0dG9uTWFuYWdlcihwb2x5ZmlsbFdyYXBwZXIpO1xuXG4gIHRoaXMuaXNGdWxsc2NyZWVuRGlzYWJsZWQgPSAhIVV0aWwuZ2V0UXVlcnlQYXJhbWV0ZXIoJ25vX2Z1bGxzY3JlZW4nKTtcbiAgdGhpcy5zdGFydE1vZGUgPSBNb2Rlcy5OT1JNQUw7XG4gIHZhciBzdGFydE1vZGVQYXJhbSA9IHBhcnNlSW50KFV0aWwuZ2V0UXVlcnlQYXJhbWV0ZXIoJ3N0YXJ0X21vZGUnKSk7XG4gIGlmICghaXNOYU4oc3RhcnRNb2RlUGFyYW0pKSB7XG4gICAgdGhpcy5zdGFydE1vZGUgPSBzdGFydE1vZGVQYXJhbTtcbiAgfVxuXG4gIGlmICh0aGlzLmhpZGVCdXR0b24pIHtcbiAgICB0aGlzLmJ1dHRvbi5zZXRWaXNpYmlsaXR5KGZhbHNlKTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHRoZSBicm93c2VyIGlzIGNvbXBhdGlibGUgd2l0aCBXZWJWUi5cbiAgdGhpcy5nZXREZXZpY2VCeVR5cGVfKFZSRGlzcGxheSkudGhlbihmdW5jdGlvbihobWQpIHtcbiAgICB0aGlzLmhtZCA9IGhtZDtcblxuICAgIC8vIE9ubHkgZW5hYmxlIFZSIG1vZGUgaWYgdGhlcmUncyBhIFZSIGRldmljZSBhdHRhY2hlZCBvciB3ZSBhcmUgcnVubmluZyB0aGVcbiAgICAvLyBwb2x5ZmlsbCBvbiBtb2JpbGUuXG4gICAgaWYgKCF0aGlzLmlzVlJDb21wYXRpYmxlT3ZlcnJpZGUpIHtcbiAgICAgIHRoaXMuaXNWUkNvbXBhdGlibGUgPSAgIWhtZC5pc1BvbHlmaWxsZWQgfHwgVXRpbC5pc01vYmlsZSgpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5zdGFydE1vZGUpIHtcbiAgICAgIGNhc2UgTW9kZXMuTUFHSUNfV0lORE9XOlxuICAgICAgICB0aGlzLnNldE1vZGVfKE1vZGVzLk1BR0lDX1dJTkRPVyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBNb2Rlcy5WUjpcbiAgICAgICAgdGhpcy5lbnRlclZSTW9kZV8oKTtcbiAgICAgICAgdGhpcy5zZXRNb2RlXyhNb2Rlcy5WUik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5zZXRNb2RlXyhNb2Rlcy5OT1JNQUwpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdCgnaW5pdGlhbGl6ZWQnKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICAvLyBIb29rIHVwIGJ1dHRvbiBsaXN0ZW5lcnMuXG4gIHRoaXMuYnV0dG9uLm9uKCdmcycsIHRoaXMub25GU0NsaWNrXy5iaW5kKHRoaXMpKTtcbiAgdGhpcy5idXR0b24ub24oJ3ZyJywgdGhpcy5vblZSQ2xpY2tfLmJpbmQodGhpcykpO1xuXG4gIC8vIEJpbmQgdG8gZnVsbHNjcmVlbiBldmVudHMuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLFxuICAgICAgdGhpcy5vbkZ1bGxzY3JlZW5DaGFuZ2VfLmJpbmQodGhpcykpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3pmdWxsc2NyZWVuY2hhbmdlJyxcbiAgICAgIHRoaXMub25GdWxsc2NyZWVuQ2hhbmdlXy5iaW5kKHRoaXMpKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbXNmdWxsc2NyZWVuY2hhbmdlJyxcbiAgICAgIHRoaXMub25GdWxsc2NyZWVuQ2hhbmdlXy5iaW5kKHRoaXMpKTtcblxuICAvLyBCaW5kIHRvIFZSKiBzcGVjaWZpYyBldmVudHMuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd2cmRpc3BsYXlwcmVzZW50Y2hhbmdlJyxcbiAgICAgIHRoaXMub25WUkRpc3BsYXlQcmVzZW50Q2hhbmdlXy5iaW5kKHRoaXMpKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3ZyZGlzcGxheWRldmljZXBhcmFtc2NoYW5nZScsXG4gICAgICB0aGlzLm9uVlJEaXNwbGF5RGV2aWNlUGFyYW1zQ2hhbmdlXy5iaW5kKHRoaXMpKTtcbn1cblxuV2ViVlJNYW5hZ2VyLnByb3RvdHlwZSA9IG5ldyBFbWl0dGVyKCk7XG5cbi8vIEV4cG9zZSB0aGVzZSB2YWx1ZXMgZXh0ZXJuYWxseS5cbldlYlZSTWFuYWdlci5Nb2RlcyA9IE1vZGVzO1xuXG5XZWJWUk1hbmFnZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHRpbWVzdGFtcCkge1xuICAvLyBTY2VuZSBtYXkgYmUgYW4gYXJyYXkgb2YgdHdvIHNjZW5lcywgb25lIGZvciBlYWNoIGV5ZS5cbiAgaWYgKHNjZW5lIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICB0aGlzLmVmZmVjdC5yZW5kZXIoc2NlbmVbMF0sIGNhbWVyYSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5lZmZlY3QucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9XG59O1xuXG5XZWJWUk1hbmFnZXIucHJvdG90eXBlLnNldFZSQ29tcGF0aWJsZU92ZXJyaWRlID0gZnVuY3Rpb24oaXNWUkNvbXBhdGlibGUpIHtcbiAgdGhpcy5pc1ZSQ29tcGF0aWJsZSA9IGlzVlJDb21wYXRpYmxlO1xuICB0aGlzLmlzVlJDb21wYXRpYmxlT3ZlcnJpZGUgPSB0cnVlO1xuXG4gIC8vIERvbid0IGFjdHVhbGx5IGNoYW5nZSBtb2RlcywganVzdCB1cGRhdGUgdGhlIGJ1dHRvbnMuXG4gIHRoaXMuYnV0dG9uLnNldE1vZGUodGhpcy5tb2RlLCB0aGlzLmlzVlJDb21wYXRpYmxlKTtcbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUuc2V0RnVsbHNjcmVlbkNhbGxiYWNrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdGhpcy5mdWxsc2NyZWVuQ2FsbGJhY2sgPSBjYWxsYmFjaztcbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUuc2V0VlJDYWxsYmFjayA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIHRoaXMudnJDYWxsYmFjayA9IGNhbGxiYWNrO1xufTtcblxuV2ViVlJNYW5hZ2VyLnByb3RvdHlwZS5zZXRFeGl0RnVsbHNjcmVlbkNhbGxiYWNrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdGhpcy5leGl0RnVsbHNjcmVlbkNhbGxiYWNrID0gY2FsbGJhY2s7XG59O1xuXG4vKipcbiAqIFByb21pc2UgcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBITUQgZGV2aWNlIGF2YWlsYWJsZS5cbiAqL1xuV2ViVlJNYW5hZ2VyLnByb3RvdHlwZS5nZXREZXZpY2VCeVR5cGVfID0gZnVuY3Rpb24odHlwZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMoKS50aGVuKGZ1bmN0aW9uKGRpc3BsYXlzKSB7XG4gICAgICAvLyBQcm9taXNlIHN1Y2NlZWRzLCBidXQgY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBkaXNwbGF5cyBhY3R1YWxseS5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGRpc3BsYXlzW2ldIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgIHJlc29sdmUoZGlzcGxheXNbaV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXNvbHZlKG51bGwpO1xuICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gTm8gZGlzcGxheXMgYXJlIGZvdW5kLlxuICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEhlbHBlciBmb3IgZW50ZXJpbmcgVlIgbW9kZS5cbiAqL1xuV2ViVlJNYW5hZ2VyLnByb3RvdHlwZS5lbnRlclZSTW9kZV8gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5obWQucmVxdWVzdFByZXNlbnQoW3tcbiAgICBzb3VyY2U6IHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCxcbiAgICBwcmVkaXN0b3J0ZWQ6IHRoaXMucHJlZGlzdG9ydGVkXG4gIH1dKTtcbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUuc2V0TW9kZV8gPSBmdW5jdGlvbihtb2RlKSB7XG4gIHZhciBvbGRNb2RlID0gdGhpcy5tb2RlO1xuICBpZiAobW9kZSA9PT0gdGhpcy5tb2RlKSB7XG4gICAgLy9jb25zb2xlLndhcm4oJ05vdCBjaGFuZ2luZyBtb2RlcywgYWxyZWFkeSBpbiAlcycsIG1vZGUpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb25zb2xlLmxvZygnTW9kZSBjaGFuZ2U6ICVzID0+ICVzJywgdGhpcy5tb2RlLCBtb2RlKTtcbiAgdGhpcy5tb2RlID0gbW9kZTtcbiAgdGhpcy5idXR0b24uc2V0TW9kZShtb2RlLCB0aGlzLmlzVlJDb21wYXRpYmxlKTtcblxuICAvLyBFbWl0IGFuIGV2ZW50IGluZGljYXRpbmcgdGhlIG1vZGUgY2hhbmdlZC5cbiAgdGhpcy5lbWl0KCdtb2RlY2hhbmdlJywgbW9kZSwgb2xkTW9kZSk7XG59O1xuXG4vKipcbiAqIE1haW4gYnV0dG9uIHdhcyBjbGlja2VkLlxuICovXG5XZWJWUk1hbmFnZXIucHJvdG90eXBlLm9uRlNDbGlja18gPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIE1vZGVzLk5PUk1BTDpcbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGhhY2sgaWYvd2hlbiBpT1MgZ2V0cyByZWFsIGZ1bGxzY3JlZW4gbW9kZS5cbiAgICAgIC8vIElmIHRoaXMgaXMgYW4gaWZyYW1lIG9uIGlPUywgYnJlYWsgb3V0IGFuZCBvcGVuIGluIG5vX2Z1bGxzY3JlZW4gbW9kZS5cbiAgICAgIGlmIChVdGlsLmlzSU9TKCkgJiYgVXRpbC5pc0lGcmFtZSgpKSB7XG4gICAgICAgIGlmICh0aGlzLmZ1bGxzY3JlZW5DYWxsYmFjaykge1xuICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbkNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgIHVybCA9IFV0aWwuYXBwZW5kUXVlcnlQYXJhbWV0ZXIodXJsLCAnbm9fZnVsbHNjcmVlbicsICd0cnVlJyk7XG4gICAgICAgICAgdXJsID0gVXRpbC5hcHBlbmRRdWVyeVBhcmFtZXRlcih1cmwsICdzdGFydF9tb2RlJywgTW9kZXMuTUFHSUNfV0lORE9XKTtcbiAgICAgICAgICB0b3AubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0TW9kZV8oTW9kZXMuTUFHSUNfV0lORE9XKTtcbiAgICAgIHRoaXMucmVxdWVzdEZ1bGxzY3JlZW5fKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1vZGVzLk1BR0lDX1dJTkRPVzpcbiAgICAgIGlmICh0aGlzLmlzRnVsbHNjcmVlbkRpc2FibGVkKSB7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZXhpdEZ1bGxzY3JlZW5DYWxsYmFjaykge1xuICAgICAgICB0aGlzLmV4aXRGdWxsc2NyZWVuQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0TW9kZV8oTW9kZXMuTk9STUFMKTtcbiAgICAgIHRoaXMuZXhpdEZ1bGxzY3JlZW5fKCk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuLyoqXG4gKiBUaGUgVlIgYnV0dG9uIHdhcyBjbGlja2VkLlxuICovXG5XZWJWUk1hbmFnZXIucHJvdG90eXBlLm9uVlJDbGlja18gPSBmdW5jdGlvbigpIHtcbiAgLy8gVE9ETzogUmVtb3ZlIHRoaXMgaGFjayB3aGVuIGlPUyBoYXMgZnVsbHNjcmVlbiBtb2RlLlxuICAvLyBJZiB0aGlzIGlzIGFuIGlmcmFtZSBvbiBpT1MsIGJyZWFrIG91dCBhbmQgb3BlbiBpbiBub19mdWxsc2NyZWVuIG1vZGUuXG4gIGlmICh0aGlzLm1vZGUgPT09IE1vZGVzLk5PUk1BTCAmJiBVdGlsLmlzSU9TKCkgJiYgVXRpbC5pc0lGcmFtZSgpKSB7XG4gICAgaWYgKHRoaXMudnJDYWxsYmFjaykge1xuICAgICAgdGhpcy52ckNhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgIHVybCA9IFV0aWwuYXBwZW5kUXVlcnlQYXJhbWV0ZXIodXJsLCAnbm9fZnVsbHNjcmVlbicsICd0cnVlJyk7XG4gICAgICB1cmwgPSBVdGlsLmFwcGVuZFF1ZXJ5UGFyYW1ldGVyKHVybCwgJ3N0YXJ0X21vZGUnLCBNb2Rlcy5WUik7XG4gICAgICB0b3AubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgdGhpcy5lbnRlclZSTW9kZV8oKTtcbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUucmVxdWVzdEZ1bGxzY3JlZW5fID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5ib2R5O1xuICAvL3ZhciBjYW52YXMgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gIGlmIChjYW52YXMucmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICBjYW52YXMucmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgfSBlbHNlIGlmIChjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4pIHtcbiAgICBjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcbiAgfSBlbHNlIGlmIChjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICBjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgfSBlbHNlIGlmIChjYW52YXMubXNSZXF1ZXN0RnVsbHNjcmVlbikge1xuICAgIGNhbnZhcy5tc1JlcXVlc3RGdWxsc2NyZWVuKCk7XG4gIH1cbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUuZXhpdEZ1bGxzY3JlZW5fID0gZnVuY3Rpb24oKSB7XG4gIGlmIChkb2N1bWVudC5leGl0RnVsbHNjcmVlbikge1xuICAgIGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuKCk7XG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbikge1xuICAgIGRvY3VtZW50Lm1vekNhbmNlbEZ1bGxTY3JlZW4oKTtcbiAgfSBlbHNlIGlmIChkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbikge1xuICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbikge1xuICAgIGRvY3VtZW50Lm1zRXhpdEZ1bGxzY3JlZW4oKTtcbiAgfVxufTtcblxuV2ViVlJNYW5hZ2VyLnByb3RvdHlwZS5vblZSRGlzcGxheVByZXNlbnRDaGFuZ2VfID0gZnVuY3Rpb24oZSkge1xuICAvL2NvbnNvbGUubG9nKCdvblZSRGlzcGxheVByZXNlbnRDaGFuZ2VfJywgZSk7XG4gIGlmICh0aGlzLmhtZC5pc1ByZXNlbnRpbmcpIHtcbiAgICB0aGlzLnNldE1vZGVfKE1vZGVzLlZSKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnNldE1vZGVfKE1vZGVzLk5PUk1BTCk7XG4gIH1cbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUub25WUkRpc3BsYXlEZXZpY2VQYXJhbXNDaGFuZ2VfID0gZnVuY3Rpb24oZSkge1xuICAvL2NvbnNvbGUubG9nKCdvblZSRGlzcGxheURldmljZVBhcmFtc0NoYW5nZV8nLCBlKTtcbn07XG5cbldlYlZSTWFuYWdlci5wcm90b3R5cGUub25GdWxsc2NyZWVuQ2hhbmdlXyA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gSWYgd2UgbGVhdmUgZnVsbC1zY3JlZW4sIGdvIGJhY2sgdG8gbm9ybWFsIG1vZGUuXG4gIGlmIChkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCA9PT0gbnVsbCB8fFxuICAgICAgZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgPT09IG51bGwpIHtcbiAgICB0aGlzLnNldE1vZGVfKE1vZGVzLk5PUk1BTCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV2ViVlJNYW5hZ2VyO1xuIl19
