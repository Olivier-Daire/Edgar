"use strict";

function Scene(radius, debug) {
	this.renderer = null;
	this.scene = null;
	this.dolly = null;
	this.camera = null;
	this.controls = null;
	this.effect = null;
	this.characterPath = null;
	this.radius = radius;

	this.debug = typeof debug !== 'undefined' ? debug : false;

	this.setup();

	return this;
}


Scene.prototype.setup = function() {
	// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
	// Only enable it if you actually need to.
	this.renderer = new THREE.WebGLRenderer({antialias: true});
	this.renderer.shadowMap.enabled = true;
	this.renderer.setPixelRatio(window.devicePixelRatio);

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

	this.addGround();
	this.addCharacterPath();
	this.addLights();
};

Scene.prototype.addCharacterPath = function() {
	var points = [];
	var i = 0;
	// Fill the points array with all the points necessary to draw a circle
	for (i = 0; i <= 360; i++) {
		var angle = Math.PI/180 * i;
		var x = (this.radius) * Math.cos(angle);
		var y = this.controls.userHeight;
		var z= (this.radius) * Math.sin(angle);

		points.push(new THREE.Vector3(x, y, z));
	}

	// Create curve using theses points
	this.characterPath = new THREE.SplineCurve3(points );

	if (this.debug) {
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

Scene.prototype.addGround = function() {
	var ground = null;
	var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20, 20 ), groundMaterial );
	ground.position.set(0, this.controls.userHeight - 0.5, 0);
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;
	this.scene.add( ground );
};

Scene.prototype.addLights = function() {
	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 0, this.controls.userHeight+8, 0 );
	spotLight.castShadow = true;
	this.scene.add( spotLight );
};

module.exports = Scene;
