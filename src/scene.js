"use strict";

function Scene(radius, debug = false) {
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.controls = null;
	this.effect = null;
	this.characterPath = null;
	this.radius = radius;

	this.debug = debug;

	this.setup();
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

	this.controls = new THREE.VRControls(this.camera);
	this.controls.standing = true;

	// Apply VR stereo rendering to renderer.
	this.effect = new THREE.VREffect(this.renderer);
	this.effect.setSize(window.innerWidth, window.innerHeight);

	this.addCharacterPath();
};

Scene.prototype.addCharacterPath = function() {
	var points = [];

	// Fill the points array with all the points necessary to draw a circle
	for (var i = 0; i <= 360; i++) {
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

		for (var i = 0; i < splinePoints.length; i++) {
			geometry.vertices.push(splinePoints[i]);
		}

		var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

		// Create the final Object3d to add to the scene
		var line = new THREE.Line( geometry, material );
		this.scene.add(line);
	}

}

module.exports = Scene;
