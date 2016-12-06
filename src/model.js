"use strict";

function Model(path, onLoad) {
	this.path = path;
	this.model = null;

	this.mixer = null;
	this.currentAction = 0;
	this.actions = [];

	// TODO see if animation limited to character, if do
	// 	this.action = {};
	//this.currentAction = 'idle';
	//this.actions = [ 'idle', 'walk', 'run', 'hello'];

	this.initMesh(onLoad);
}

Model.prototype.initMesh = function(onLoad) {
	var _this = this;
	var loader = new THREE.JSONLoader();

	var loaded = function(geometry, materials) {
		materials.forEach(function(material) {
			material.skinning = true;
		});

		_this.model = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial( materials ));

		if (geometry && typeof geometry.animations !== 'undefined' && geometry.animations.length > 0 ) {
			_this.initAnimation(geometry);
		}

		onLoad();
	};

	loader.load(this.path , loaded);

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

Model.prototype.fadeToAction = function(nbr) {
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
