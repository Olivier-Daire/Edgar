"use strict";

var Model = require('./model.js');

var Character = function() {
	this.SPEED = 0.005;
	this.SENSITIVITY_TO_TRIGGER_MOVE = 0.1;
	this.nextPosition = null;
	this.theta = 0.75; // No idea why but it's in front of camera

	this.followPath = function(path, direction){
		var right = new THREE.Vector3(0, 0, 1);
		var left = new THREE.Vector3(0, 0, -1);
		var directionVector = direction === 'right' ? right : left;

		this.fadeToAction('walk');
		// http://stackoverflow.com/a/11181366
		if (direction === 'right') {
			if (this.theta <= 1) {
				this.computeAngleAndDirection(path, directionVector);
				this.theta += this.SPEED;
			} else {
				this.theta = 0;
			}
		} else {
			if (this.theta >= 0) {
				this.computeAngleAndDirection(path, directionVector);
				this.theta -= this.SPEED;
			} else {
				this.theta = 1;
			}
		}
	};

	this.computeAngleAndDirection = function(path, directionVector) {
		var radians = null;
		var tangent = new THREE.Vector3();
		var axis = new THREE.Vector3();

		this.model.position.copy( path.getPointAt(this.theta) );
		tangent = path.getTangentAt(this.theta).normalize();
		axis.crossVectors(directionVector, tangent).normalize();

		radians = Math.acos(directionVector.dot(tangent));

		this.model.quaternion.setFromAxisAngle(axis, radians);
	};

	this.updateCharacter = function(characterPath, delta) {
		var currentPosition = this.model.position;
		//console.debug('X', this.nextPosition.x - currentPosition.x)
		//console.debug('Z', this.nextPosition.z - currentPosition.z)


		// if (this.nextPosition.x - currentPosition.x >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
		// 	console.log('this.nextPosition.x - currentPosition.x >= this.SENSITIVITY_TO_TRIGGER_MOVE TRUE')
		// }
		// if (this.nextPosition.z - currentPosition.z >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
		// 	console.log('this.nextPosition.z - currentPosition.z >= this.SENSITIVITY_TO_TRIGGER_MOVE TRUE')
		// }
		// if (this.nextPosition.x - currentPosition.x <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
		// 	console.log('this.nextPosition.x - currentPosition.x <= -this.SENSITIVITY_TO_TRIGGER_MOVE TRUE')
		// }
		// if (this.nextPosition.z - currentPosition.z <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
		// 	console.log('this.nextPosition.x - currentPosition.x >= this.SENSITIVITY_TO_TRIGGER_MOVE TRUE')
		// }


		var test = new THREE.Vector3( this.nextPosition.x - currentPosition.x, 1, this.nextPosition.z - currentPosition.z ).normalize();
		//console.log(test)
		if (currentPosition.z <= 0) {
			//console.log('1er')
			if (this.nextPosition.x - currentPosition.x >= this.SENSITIVITY_TO_TRIGGER_MOVE || this.nextPosition.z - currentPosition.z >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
				this.followPath(characterPath, 'right');
			}
			// else if (this.nextPosition.x - currentPosition.x <= -this.SENSITIVITY_TO_TRIGGER_MOVE || this.nextPosition.z - currentPosition.z <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
			// 	this.followPath(characterPath, 'left');
			// }
		} else {
			//console.log('2eme')
			// if (this.nextPosition.x - currentPosition.x >= this.SENSITIVITY_TO_TRIGGER_MOVE  || this.nextPosition.z - currentPosition.z >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
			// 	this.followPath(characterPath, 'left');
			// }
			if (this.nextPosition.x - currentPosition.x <= -this.SENSITIVITY_TO_TRIGGER_MOVE  || this.nextPosition.z - currentPosition.z <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
				this.followPath(characterPath, 'right');
			}
		}
		// FIXME Bug with Z : can't rely on Z axis to choose direction
		// if(Math.abs(this.nextPosition.x - currentPosition.x) >= this.SENSITIVITY_TO_TRIGGER_MOVE || Math.abs(this.nextPosition.z - currentPosition.z) <= -this.SENSITIVITY_TO_TRIGGER_MOVE) {
		// 		this.followPath(characterPath, 'right');
		// 		console.debug('X', this.nextPosition.x - currentPosition.x)
		// console.debug('Z', this.nextPosition.z - currentPosition.z)
		// 		console.log('right')
		// }
		// // FIXME Something wrong with the condition : need to be inside 0.2 box to move 
		// else if (Math.abs(currentPosition.x - this.nextPosition.x)  >= this.SENSITIVITY_TO_TRIGGER_MOVE || Math.abs(this.nextPosition.z - currentPosition.z) >= this.SENSITIVITY_TO_TRIGGER_MOVE) {
		// 		this.followPath(characterPath, 'left');
		// 		console.log('left')
		// }

		this.fadeToAction('idle');
		// Update model animations
		this.mixer.update(delta);
	};

	return this;
};

// Inherit from Model
Character.prototype = new Model();

module.exports = Character;
