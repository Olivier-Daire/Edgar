"use strict";

var SCENES = require('../public/scenes.json');
var Model = require('./model.js');
var Character = require('./character.js');
var Firefly = require('./firefly.js');

function Scene(number, animate, renderer) {
	this.scene = null;
	this.camera = null;
	this.controls = null;
	this.characterPath = null;
	this.character = null;
	this.collideObjects = [];
	this.interactableObjects = [];
	this.radius = null;
	this.skybox = null;
	this.skyboxSize = null;
	this.animateFunction = animate;
	this.firefly = null;
	this.objectsList = [];
	this.objectsToDispose = [];
	this.totalObjectives = 0;
	this.achievedObjectives = 0;
	this.listener = null;
	this.sound = null;

	this.setup(number, renderer);

	return this;
}


Scene.prototype.setup = function(number, renderer) {

	// Create a three.js scene.
	this.scene = new THREE.Scene();

	// VRControls always set camera postion to (0, 0, 0) use group and dolly to move it
	// http://stackoverflow.com/a/34471170
	this.dolly = new THREE.Group();
	// Create a three.js camera.
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	//this.scene.add( this.camera );
	this.dolly.position.set( 0, 1.5, 0 ); // if camera.position.z == 0 can't get screen to world coordinates
	this.scene.add( this.dolly );
	this.dolly.add( this.camera );

	this.controls = new THREE.VRControls(this.camera);
	this.controls.standing = true;
	this.camera.position.y = this.controls.userHeight;

	var light = new THREE.AmbientLight( 0x121828 ); // soft white light
	this.scene.add( light );
	this.scene.fog = new THREE.FogExp2(0x121828, 0.07);

	this.listener = new THREE.AudioListener();

	this.loadJSON(number);
	this.addCharacterPath();
	this.addCharacter();
	this.addFirefly();

	if (window.DEBUG) {
		this.addOriginCube();
	}
};

Scene.prototype.addCharacter = function() {
  var _this = this;
  this.character = new Character();
	this.character.load('public/model/edgaranim.json', false, true, // receive, cast shadows
		function() {
			_this.character.mesh.scale.x = _this.character.mesh.scale.y = _this.character.mesh.scale.z = 8;
			_this.character.mesh.geometry.computeVertexNormals();
			_this.scene.add(_this.character.mesh);
			_this.character.mesh.geometry.computeBoundingBox();

			if (window.DEBUG) {
				_this.character.bbhelper = new THREE.BoxHelper(_this.character.mesh, 0xffffff);
				_this.scene.add(_this.character.bbhelper);
			}

			var box3 = new THREE.Box3();
			_this.character.bbox = box3.setFromObject( _this.character.mesh );

			_this.character.followPath(_this.characterPath);
    }
  );
};

Scene.prototype.addCharacterPath = function() {
  var points = [];
  var i = 0;
  // Fill the points array with all the points necessary to draw a circle
  for (i = 0; i <= 360; i++) {
    var angle = Math.PI/180 * i;
    var x = (this.radius) * Math.cos(angle);
    var y = this.controls.userHeight - 0.75;
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

    // Create the final Object3d to add to the this
    var line = new THREE.Line( geometry, material );
    this.scene.add(line);

    this.objectsToDispose.push(geometry);

  }
};

Scene.prototype.addOriginCube = function() {
	var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
	cube.position.z = -this.radius;
	cube.position.x = 0;
	cube.position.y = this.controls.userHeight - 0.5;
	cube.scale.x = cube.scale.y = cube.scale.z = 0.2;
	this.scene.add(cube);
};

Scene.prototype.addLightsHemisphere = function() {
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	this.scene.add( hemiLight );
	var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	this.scene.add( dirLight );
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	var d = 50;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = -0.0001;
};

Scene.prototype.addFirefly = function() {
	var _this = this;
	this.firefly = new Firefly();
	this.firefly.load(function() {
		_this.firefly.parent.position.set( 0, _this.controls.userHeight-1, -_this.radius+1 );
		if (window.DEBUG){
			_this.scene.add(_this.firefly.bbhelper);
		}
		_this.scene.add(_this.firefly.parent);

		_this.camera.add(_this.firefly.parent);
		_this.firefly.parent.target = _this.camera;
	});


};

Scene.prototype.addSkybox= function(path, size) {
	var loader = new THREE.TextureLoader();
	loader.load(path, onTextureLoaded);

	var _this = this;

	function onTextureLoaded(texture) {
		var geometry = new THREE.SphereGeometry(size, 60, 40);
		var uniforms = {
			texture: { type: 't', value: texture }
		};

		var material = new THREE.ShaderMaterial( {
			uniforms       : uniforms,
			vertexShader   : document.getElementById('skyVertexShader').textContent,
			fragmentShader : document.getElementById('skyFragmentShader').textContent
		});

		_this.skybox = new THREE.Mesh(geometry, material);

		_this.skybox.scale.set(-1, 1, 1);
		_this.scene.add(_this.skybox);

		_this.objectsToDispose.push(geometry);
		_this.objectsToDispose.push(material);
	}

};

Scene.prototype.loadJSON = function(number) {
	var sceneData = SCENES[number-1];

	this.radius = sceneData.radius;
	this.totalObjectives = sceneData.number_of_objectives;
	var _this = this;

	sceneData.models.forEach(function(modelData) {
		var model = new Model();
		var receiveShadow = false;
		var castShadow = false;
		if (modelData.shadow) {
			receiveShadow = true;
		}
		model.load(modelData.path, receiveShadow, castShadow, function() {

			// Position
			if (modelData.position) {
				if (modelData.position.x) {
					model.mesh.position.x =  modelData.position.x;
				}
				if (modelData.position.y) {
					model.mesh.position.y = modelData.position.y;
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

			// Rotate
			if(modelData.rotate) {
				if(modelData.rotate.x) {
					model.mesh.rotateX( (modelData.rotate.x * Math.PI)/180);
				}
				if(modelData.rotate.y) {
					model.mesh.rotateY( (modelData.rotate.y * Math.PI)/180);
				}
				if(modelData.rotate.z) {
					model.mesh.rotateZ( (modelData.rotate.z * Math.PI)/180);
				}
			}

			if (modelData.collisions) {
				model.mesh.geometry.computeBoundingBox();
				var box3 = new THREE.Box3();
				model.bbox = box3.setFromObject( model.mesh );

				if (window.DEBUG) {
					var bboxHelper = new THREE.BoxHelper(model.mesh, 0xffffff);
					_this.scene.add(bboxHelper);
				}

				_this.collideObjects.push(model);
			}

			if (modelData.interaction) {
				var interactableObject = { "id": model.mesh.id, "object": model, "interaction": modelData.interaction};
				_this.interactableObjects.push(interactableObject);
			}

			_this.scene.add(model.mesh);

		});

	});

	if (sceneData.sound) {
		var audioLoader = new THREE.AudioLoader();
		this.sound = new THREE.Audio( this.listener );

		audioLoader.load(sceneData.sound, function( buffer ) {
			_this.sound.setBuffer( buffer );
			_this.sound.setLoop(true);
			_this.sound.setVolume(0.5);
			_this.sound.play();
		});
	}

	if (sceneData.skybox) {
		this.addSkybox(sceneData.skybox.path, sceneData.skybox.size);
	}
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

  this.objectsToDispose.push(geometry);

};

Scene.prototype.deleteScene = function(){

	var _this = this;
	this.scene.children.forEach(function(object){
		_this.objectsList.push(object);
	});

	this.objectsList.forEach(function(object){
		if(object.geometry) {
			object.geometry.dispose();
		}

		if(object.material && object.material !== 'undefined') {
			if(object.material.materials) {
				for (var i = object.material.materials.length - 1; i >= 0; i--) {
					object.material.materials[i].dispose();
				}
			} else {
				object.material.dispose();
			}

		}

		if(object.texture) {
			object.texture.dispose();
		}

		_this.scene.remove(object);
		object = null;
	});

	this.objectsToDispose.forEach(function(object){
		object.dispose();
	});


	this.collideObjects.length = 0;
	this.interactableObjects.length = 0;
	this.objectsList.length = 0;
	this.objectsToDispose.length = 0;

	this.collideObjects.length = null;
	this.interactableObjects.length = null;
	this.objectsList.length = null;
	this.objectsToDispose.length = null;

	this.character.delete();
	this.character = null;
	this.firefly.delete();
	this.firefly = null;

	this.sound.stop();
	this.sound = null;
	this.listener = null;

	this.scene = null;
	this.camera = null;
	this.controls = null;
	this.characterPath = null;
	this.character = null;
	this.skybox = null;
	this.scene = null;
};

module.exports = Scene;
