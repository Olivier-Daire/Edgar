"use strict";

function Scene() {
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.navigation = null;
	this.controls = null;
	this.effect = null;
	this.clock = null;

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

	// Create a three.js clock.
	this.clock = new THREE.Clock();

	// Create a three.js scene.
	this.scene = new THREE.Scene();

	// Create a three.js camera.
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

	// Create a three.js first person camera
	this.navigation = new THREE.FirstPersonControls(this.camera);
	this.navigation.movementSpeed = 500;
	this.navigation.lookSpeed = 0.05;
	this.navigation.lookVertical = false;

	this.controls = new THREE.VRControls(this.camera);
	this.controls.standing = true;

	// Apply VR stereo rendering to renderer.
	this.effect = new THREE.VREffect(this.renderer);
	this.effect.setSize(window.innerWidth, window.innerHeight);
};

module.exports = Scene;
