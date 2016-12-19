"use strict";

var Model = require('./model.js');

var Character = function() {
	this.SPEED = 0.0005;
	this.SENSITIVITY_TO_TRIGGER_MOVE = 0.2;
	this.currentPosition = null;
	this.nextPosition = null;
	this.theta = 0.75; // No idea why but it's in front of camera

	this.followPath = function(path, direction){
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
			this.theta += this.SPEED;
		} else {
			this.theta -= this.SPEED;
		}
	};

	this.updateCharacter = function(characterPath, delta) {
		this.currentPosition = this.model.position.x;
		if(this.nextPosition - this.currentPosition >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
			if (this.theta <= 1) {
				this.followPath(characterPath, 'right');
			} else {
				this.theta = 0;
			}
		}
		if (this.nextPosition - this.currentPosition <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
			if (this.theta >= 0) {
				this.followPath(characterPath, 'left');
			} else {
				this.theta = 1;
			}
		}
		this.fadeToAction('idle');
		// Update model animations
		this.mixer.update(delta);
	};

	return this;
};

// Inherit from Model
Character.prototype = new Model();

module.exports = Character;
