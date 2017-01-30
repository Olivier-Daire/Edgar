"use strict";

var Model = require('./model.js');

var Character = function() {
	this.SPEED = 0.001;
	this.SENSITIVITY_TO_TRIGGER_MOVE = 0.3;
	this.ACCELERATIONVALUE = 0.01;
	this.DECELERATIONVALUE = 0.25; // The lower this value is, the more time the character takes to stop. Recommended value : .25
	this.DECELERATIONMOMENT = 0.3; // The higher this value is, the later the character stops. Recommended value : .3
	this.acceleration = 0;
	this.currentMovement = this.SPEED;
	this.nextPosition = null;
	this.theta = 0.75; // No idea why but it's in front of camera
	this.direction = 'right';
	this.oldDirection = 'right';
	this.path = null;

	this.followPath = function(path){
		if (path && typeof path !== undefined) {
			this.path = path;
		}
		var right = new THREE.Vector3(0, 0, 1);
		var left = new THREE.Vector3(0, 0, -1);
		var directionVector = this.direction === 'right' ? right : left;
		if(this.oldDirection !== this.direction){
			this.oldDirection = this.direction;
			this.currentMovement = this.SPEED;
		}

		this.fadeToAction('walk');
		// http://stackoverflow.com/a/11181366
		if (this.direction === 'right') {
			if (this.theta <= 1) {
				this.computeAngleAndDirection(directionVector);
				this.theta += this.currentMovement;
			} else {
				this.theta = 0;
			}
		} else {
			if (this.theta >= 0) {
				this.computeAngleAndDirection(directionVector);
				this.theta -= this.currentMovement;
			} else {
				this.theta = 1;
			}
		}
	};

	this.makeAcceleration = function(vectorLength, ratio){
		var accelerationValue = ((vectorLength + this.DECELERATIONMOMENT)- (ratio / 10));

		if(accelerationValue > 1){	// The character needs to accelerate or to keep his speed
			if(this.acceleration < 1){
				this.acceleration += this.ACCELERATIONVALUE;
			}
			else{
				this.acceleration = 1;
			}
		}
		else{ // The character needs to decelerate
			this.acceleration = ((1 * accelerationValue) - this.DECELERATIONVALUE); // The deceleration will depend of the length of the character - camera vector
		}

		this.currentMovement = this.SPEED * this.acceleration;
	};

	// TODO almost same as function above, refator
	this.computeFictiveDirection = function() {
		if (this.direction === 'right') {
			if (this.theta + this.SPEED <= 1) {
				return this.path.getPointAt(this.theta + this.SPEED);
			} else {
				return this.path.getPointAt(0);
			}
		} else {
			if (this.theta - this.SPEED >= 0) {
				return this.path.getPointAt(this.theta - this.SPEED);
			} else {
				return this.path.getPointAt(1);
			}
		}
	};

	this.computeAngleAndDirection = function(directionVector) {
		var radians = null;
		var tangent = new THREE.Vector3();
		var axis = new THREE.Vector3();

		this.mesh.position.copy( this.path.getPointAt(this.theta) );
		tangent = this.path.getTangentAt(this.theta).normalize();
		axis.crossVectors(directionVector, tangent).normalize();

		radians = Math.acos(directionVector.dot(tangent));

		this.mesh.quaternion.setFromAxisAngle(axis, radians);
	};

	this.updateCharacter = function(delta) {
		var currentPosition = this.mesh.position;

		/**
			The idea is to get two vectors :
				- one between current position and wanted position
				- another one between current position plus a little bit in this.direction
			Then compare the norm of those two vectors and if the second one is smaller than the first, it means we are going in the right direction
		 **/

		// Get vector between current position and next position (the one given by the mouse move)
		var currentToNextPosVec = new THREE.Vector3( this.nextPosition.x - currentPosition.x, 1, this.nextPosition.z - currentPosition.z ).normalize();
		// Compute a fictive position using this.direction --> current position plus next movement based on this.direction value
		var fictivePos = this.computeFictiveDirection();
		// Get vector between fictive position and next position (the one given by the mouse move)
		var fictiveToNextPosVec = new THREE.Vector3(this.nextPosition.x - fictivePos.x  , 1, this.nextPosition.z - fictivePos.z ).normalize();
		// Calculate norm (length) of both vectors
		var normCurrentToNextPosVec = Math.sqrt(currentToNextPosVec.x * currentToNextPosVec.x + currentToNextPosVec.z * currentToNextPosVec.z);
		var normFictiveToNextPosVec = Math.sqrt(fictiveToNextPosVec.x * fictiveToNextPosVec.x + fictiveToNextPosVec.z * fictiveToNextPosVec.z);

		// Create ratio depending of the postion of the camera in the vertical axis
		var ratio = (Math.pow(this.nextPosition.y, 2)/5.1)+1	;
		if(normCurrentToNextPosVec >= (this.SENSITIVITY_TO_TRIGGER_MOVE * ratio)){

			// Compare both norm is fictive position norm is greater than the other one,
				// it means that we are going in the opposite direction, hence change direction
			if (normFictiveToNextPosVec > normCurrentToNextPosVec) {
					if (this.direction === 'right') {
						this.direction = 'left';
					} else {
						this.direction = 'right';
					}
				}

			this.makeAcceleration(normCurrentToNextPosVec, ratio);
			this.followPath();

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
