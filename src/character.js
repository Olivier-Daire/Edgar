"use strict";

var Model = require('./model.js');

var Character = function() {
	this.SPEED = 0.0005;
	this.SENSITIVITY_TO_TRIGGER_MOVE = 0.1;
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
		if (direction === 'right') {
			if (this.theta <= 1) {
				this.model.position.copy( path.getPointAt(this.theta) );
				tangent = path.getTangentAt(this.theta).normalize();
				axis.crossVectors(currentDirection, tangent).normalize();

				radians = Math.acos(currentDirection.dot(tangent));

				this.model.quaternion.setFromAxisAngle(axis, radians);
				this.theta += this.SPEED;
			} else {
				this.theta = 0;
			}
		} else { // FIXME Refactor
			if (this.theta >= 0) {
				this.model.position.copy( path.getPointAt(this.theta) );
				tangent = path.getTangentAt(this.theta).normalize();
				axis.crossVectors(currentDirection, tangent).normalize();

				radians = Math.acos(currentDirection.dot(tangent));

				this.model.quaternion.setFromAxisAngle(axis, radians);
				this.theta -= this.SPEED;
			} else {
				this.theta = 1;
			}
		}
	};

	this.updateCharacter = function(characterPath, delta) {
		var currentPosition = this.model.position;

		if(this.nextPosition.x - currentPosition.x >= this.SENSITIVITY_TO_TRIGGER_MOVE || this.nextPosition.z - currentPosition.z >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
				this.followPath(characterPath, 'right');
		}
		if (this.nextPosition.x - currentPosition.x <= -this.SENSITIVITY_TO_TRIGGER_MOVE || this.nextPosition.z - currentPosition.z <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
				this.followPath(characterPath, 'left');
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
