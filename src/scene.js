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
