"use strict";

function Model(path, onLoad) {
	this.path = path;
	this.onLoad = onLoad;
	this.model = null;

	this.initMesh();
}


Model.prototype.initMesh = function() {
	var _this = this;
	var loader = new THREE.JSONLoader();

	loader.load(this.path , function(geometry, materials) {
		_this.model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
		_this.onLoad();
	});
};

module.exports = Model;
