"use strict";

var Model = function(){
	this.model = null;

	this.mixer = null;
	this.actions = {};
	this.activeAction = null;

	this.load = function(path, onLoad) {
		var _this = this;
		var loader = new THREE.JSONLoader();

		var loaded = function(geometry, materials) {

			_this.model = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial( materials ));

			if (typeof geometry.animations !== 'undefined' && geometry.animations.length > 0 ) {
				materials.forEach(function(material) {
					material.skinning = true;
				});

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

		var error = function(e) {
			console.error('Error loading model', e.target.status + " : " + e.target.statusText); // jshint ignore:line
		};

		var progress = undefined; // jshint ignore:line

		loader.load(path , loaded, progress, error);

	};

	this.initAnimation = function(geometry) {
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

	this.fadeToAction = function(name) {
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

	return this;
};

module.exports = Model;
