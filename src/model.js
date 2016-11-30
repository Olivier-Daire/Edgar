"use strict";

function Model(path, onLoad) {
	this.path = path;
	this.onLoad = onLoad;
	this.model = null;

	this.mixer = null;
	this.action = {};
	// TODO Creates these only if animated model
	this.currentAction = 'idle';
	this.actions = [ 'idle', 'walk' ];

	this.initMesh();
}


Model.prototype.initMesh = function() {
	var _this = this;
	var loader = new THREE.JSONLoader();

	loader.load(this.path , function(geometry, materials) {
		materials.forEach(function(material) {
			material.skinning = true;
		});

		_this.model = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial( materials ));

		if (typeof geometry.animations !== 'undefined') {
			// TODO Move this to function ?
			_this.mixer = new THREE.AnimationMixer(_this.model);

			_this.action.idle = _this.mixer.clipAction(geometry.animations[ 1 ]);
			_this.action.walk = _this.mixer.clipAction(geometry.animations[ 4 ]);

			_this.action.idle.setEffectiveWeight(1);
			_this.action.walk.setEffectiveWeight(1);

			_this.action.idle.enabled = true;
			_this.action.walk.enabled = true;

			_this.action.idle.play();
		}


		_this.onLoad();
	});
};


Model.prototype.fadeAction = function(name) {
  var from = this.action[ this.currentAction ].play();
  var to = this.action[ name ].play();

  from.enabled = true;
  to.enabled = true;

  if (to.loop === THREE.LoopOnce) {
    to.reset();
  }

  from.crossFadeTo(to, 0.3);
  this.currentAction = name;

}

module.exports = Model;
