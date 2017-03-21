"use strict";

var Model = function(){
	this.mesh = null;

	this.mixer = null;
	this.actions = {};
	this.activeAction = null;
	this.bbox = null;

	this.load = function(path, receiveShadow, castShadow, onLoad) {
		var _this = this;
		var loader = new THREE.JSONLoader();

		var loaded = function(geometry, materials) {
			if (typeof geometry.bones !== 'undefined' && geometry.bones.length > 0) {
				_this.mesh = new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial( materials ));
			} else {
				_this.mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial( materials ));
			}

			// fix transpancy model bug
			for( var i = 0; i < materials.length; i ++ ) {
				var material = materials[ i ];
				material.alphaTest = 0.5;
				material.side = THREE.DoubleSide;
				material.transparent = false;
			}

			if (typeof geometry.animations !== 'undefined' && geometry.animations.length > 0 ) {
				materials.forEach(function(material) {
					material.skinning = true;
				});

				_this.initAnimation(geometry);
			}

			if (receiveShadow) {
				_this.mesh.receiveShadow = true;
			}

			if (castShadow) {
				_this.mesh.traverse(function(child) {
					 if (child instanceof THREE.Mesh) {
						child.castShadow = true;
					}
				});
				_this.mesh.castShadow = true;
			}
			_this.mesh.name = path;

			onLoad();
		};

		var error = function(e) {
			console.error('Error loading mesh', e.target.status + " : " + e.target.statusText); // jshint ignore:line
		};

		var progress = undefined; // jshint ignore:line

		loader.load(path , loaded, progress, error);

	};

	this.initAnimation = function(geometry) {
		var _this = this;
		this.mixer = new THREE.AnimationMixer(this.mesh);

		geometry.animations.forEach(function(animation, index) {
			// Set first action as default
			if (index === 0 ) {
				_this.activeAction = animation.name;
			}
			_this.actions[animation.name] = _this.mixer.clipAction(animation);
			_this.actions[animation.name].setEffectiveWeight(1);
			_this.actions[animation.name].enabled = true;
			_this.actions[animation.name].timeScale = 4;
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
