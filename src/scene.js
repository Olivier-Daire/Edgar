"use strict";
var SCENES = require('./scenes.json');
var Model = require('./model.js');
var Character = require('./character.js');
var Util = require('./util.js');

function Scene(number, animate) {
	this.renderer = null;
	this.scene = null;
	this.dolly = null;
	this.camera = null;
	this.controls = null;
	this.effect = null;
	this.characterPath = null;
	this.character = null;
	this.radius = null;
	this.skybox = null;
	this.skyboxSize = null;
	this.animateFunction = animate;

	this.setup(number);

	return this;
}


Scene.prototype.setup = function(number) {
	// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
	// Only enable it if you actually need to. --> disable on mobile
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.shadowMap.enabled = true;
	this.renderer.setPixelRatio(window.devicePixelRatio);
	if (window.DEBUG) {
		// Set clear color to white to see better
		this.renderer.setClearColor( 0xffffff, 1 );
	}

	// Append the canvas element created by the renderer to document body element.
	document.body.appendChild(this.renderer.domElement);

	// Create a three.js scene.
	this.scene = new THREE.Scene();

	// Create a three.js camera.
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

	// VRControls always set camera postion to (0, 0, 0) use group and dolly to move it
	// http://stackoverflow.com/a/34471170
	this.dolly = new THREE.Group();
	this.dolly.position.set( 0, 0, 1 ); // if camera.position.z == 0 can't get screen to world coordinates
	this.scene.add( this.dolly );
	this.dolly.add( this.camera );

	this.controls = new THREE.VRControls(this.camera);
	this.controls.standing = true;

	// Apply VR stereo rendering to renderer.
	this.effect = new THREE.VREffect(this.renderer);
	this.effect.setSize(window.innerWidth, window.innerHeight);

	this.loadJSON(number);
	this.addGround();
	this.addCharacterPath();
	this.addCharacter();
	this.addLights();
	this.addTorchLight();

	if (window.DEBUG) {
		this.addOriginCube();
	}
};

Scene.prototype.addCharacterPath = function() {
	var points = [];
	var i = 0;
	// Fill the points array with all the points necessary to draw a circle
	for (i = 0; i <= 360; i++) {
		var angle = Math.PI/180 * i;
		var x = (this.radius) * Math.cos(angle);
		var y = this.controls.userHeight;
		var z = (this.radius) * Math.sin(angle);

		points.push(new THREE.Vector3(x, y, z));
	}

	// Create curve using theses points
	this.characterPath = new THREE.SplineCurve3(points );

	if (window.DEBUG) {
		var geometry = new THREE.Geometry();
		var splinePoints = this.characterPath.getPoints(50); // nbr of point to smoothen curve

		for (i = 0; i < splinePoints.length; i++) {
			geometry.vertices.push(splinePoints[i]);
		}

		var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

		// Create the final Object3d to add to the scene
		var line = new THREE.Line( geometry, material );
		this.scene.add(line);
	}
};

Scene.prototype.addCharacter = function() {
	var _this = this;
	this.character = new Character();
	this.character.load('public/model/animated-character.json',
		function() {
			_this.character.mesh.scale.x = _this.character.mesh.scale.y = _this.character.mesh.scale.z = 0.5;
			// FIXME Dirty
			document.getElementById('loader').style.display = 'none';
			_this.scene.add(_this.character.mesh);

			_this.character.followPath(_this.characterPath);
		}
	);
};

Scene.prototype.addGround = function() {
	var ground = null;
	var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20, 20 ), groundMaterial );
	ground.position.set(0, this.controls.userHeight - 0.5, 0);
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;
	this.scene.add( ground );
};

Scene.prototype.addOriginCube = function() {
	var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
	cube.position.z = -this.radius;
	cube.position.x = 0;
	cube.position.y = this.controls.userHeight;
	cube.scale.x = cube.scale.y = cube.scale.z = 0.2;
	this.scene.add(cube);
};

Scene.prototype.addLights = function() {
	var spotLight = new THREE.PointLight( 0xffffff, 0.2, 0 );
	spotLight.position.set( 0, this.controls.userHeight+8, 0 );
	//spotLight.castShadow = true;
	this.scene.add( spotLight );
};

Scene.prototype.addTorchLight = function() {
	var lightSphere = new THREE.SphereGeometry( 0.03, 25, 5 );
	var lightEmitter = new THREE.PointLight( 0xffee88, 1, 100, 2 );
	var matSphere = new THREE.MeshStandardMaterial( {
			emissive: 0xffffee,
			emissiveIntensity: 1,
			color: 0x000000
		});
	lightEmitter.add( new THREE.Mesh( lightSphere, matSphere ) );
	lightEmitter.position.set( 0, this.controls.userHeight-1, -this.radius-1 );
	// FIXME gigantic performance hit on mobile
	if(!Util.isMobile()) {
		lightEmitter.castShadow = true;
	}
	this.camera.add(lightEmitter);
	lightEmitter.target = this.camera;
};


Scene.prototype.addSkybox= function(path, size) {
	var loader = new THREE.TextureLoader();
	loader.load(path, onTextureLoaded);

	var _this = this;

	function onTextureLoaded(texture) {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(size, size);

		var geometry = new THREE.BoxGeometry(size, size, size);
		var material = new THREE.MeshBasicMaterial({
			map: texture,
			color: 0x01BE00,
			side: THREE.BackSide
		});

		// Align the skybox to the floor (which is at y=0).
		_this.skybox = new THREE.Mesh(geometry, material);
		_this.skybox.position.y = size/2;
		_this.scene.add(_this.skybox);
		_this.setupStage();
	}

};

Scene.prototype.loadJSON = function(number) {
	var sceneData = SCENES[number-1];

	this.radius = sceneData.radius;
	var _this = this;

	sceneData.models.forEach(function(modelData) {
		var model = new Model();
		model.load(modelData.path, function() {

			// Position
			if (modelData.position) {
				if (modelData.position.x) {
					model.mesh.position.x =  modelData.position.x;
				}
				if (modelData.position.y) {
					model.mesh.position.y = modelData.position.x;
				}  else {
					// By default set to user height
					model.mesh.position.y = _this.controls.userHeight;
				}
				if (modelData.position.z) {
					model.mesh.position.z =  modelData.position.z;
				}
			}

			// Scale
			if(modelData.scale) {
				if(modelData.scale.x) {
					model.mesh.scale.x = modelData.scale.x;
				}
				if(modelData.scale.y) {
					model.mesh.scale.y = modelData.scale.y;
				}
				if(modelData.scale.z) {
					model.mesh.scale.z = modelData.scale.z;
				}
			}

			_this.scene.add(model.mesh);
		});

	});

	if (sceneData.skybox) {
		this.addSkybox(sceneData.skybox.path, sceneData.skybox.size);
	}
};

// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
Scene.prototype.setupStage = function() {
	var _this = this;
	navigator.getVRDisplays().then(function(displays) {
		if (displays.length > 0) {
			window.vrDisplay = displays[0];
			if (window.vrDisplay.stageParameters) {
				_this.setStageDimensions(window.vrDisplay.stageParameters);
			}
			window.vrDisplay.requestAnimationFrame(_this.animateFunction);
		}
	});
};

Scene.prototype.setStageDimensions = function(stage) {
  // Make the skybox fit the stage.
  var material = this.skybox.material;
  this.scene.remove(this.scene.skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, this.skyboxSize, stage.sizeZ);
  this.skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  this.skybox.position.y = this.skyboxSize/2;
  this.scene.add(this.skybox);

};

module.exports = Scene;
