"use strict";

// TODO Generic model class and specific Edgar class that inherits model class
function Model(path, onLoad) {
	this.path = path;
	this.model = null;

	this.mixer = null;
	this.actions = {};
	this.activeAction = null;

	// TODO All of these are for model movement, move them to specific Edgar class
	this.speed = 0.0005;
	this.theta = 0.75; // No idea why but it's in front of camera

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

		if (typeof geometry.animations !== 'undefined' && geometry.animations.length > 0 ) {
			_this.initAnimation(geometry);
		}

		_this.model.traverse(function(child) {
			 if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		_this.model.castShadow = true;

		onLoad();
	};

	loader.load(this.path , loaded);

};

Model.prototype.initAnimation = function(geometry) {
	var _this = this;
	this.mixer = new THREE.AnimationMixer(this.model);

	geometry.animations.forEach(function(animation, index) {
		// Set first action as default
		if (index === 0 ) {
			_this.activeAction = animation.name;
		}
		_this.actions[animation.name] = _this.mixer.clipAction(animation);
		_this.actions[animation.name].setEffectiveWeight(1);
		_this.actions[animation.name].enabled = true;
	});

	this.actions[this.activeAction].play();
};

Model.prototype.fadeToAction = function(name) {
	if (this.activeAction !== name) {
		var from = this.actions[ this.activeAction ].play();
		var to = this.actions[ name ].play();

		from.enabled = true;
		to.enabled = true;

		if (to.loop === THREE.LoopOnce) {
			to.reset();
		}

		from.crossFadeTo(to, 0.3);
		this.activeAction = name;
	}

};

Model.prototype.followPath = function(path, direction){
	var radians = null;
	var tangent = new THREE.Vector3();
	var axis = new THREE.Vector3();
	var right = new THREE.Vector3(0, 0, 1);
	var left = new THREE.Vector3(0, 0, -1);
	var currentDirection = direction === 'right' ? right : left;

	this.fadeToAction('walk');
	// http://stackoverflow.com/a/11181366
	this.model.position.copy( path.getPointAt(this.theta) );
	tangent = path.getTangentAt(this.theta).normalize();
	axis.crossVectors(currentDirection, tangent).normalize();

	radians = Math.acos(currentDirection.dot(tangent));

	this.model.quaternion.setFromAxisAngle(axis, radians);

	if (direction === 'right') {
		this.theta += this.speed;
	} else {
		this.theta -= this.speed;
	}
};

module.exports = Model;
