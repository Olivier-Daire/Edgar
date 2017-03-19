"use strict";

var Util = require('./util.js');

var Firefly = function() {
  this.parent = null;
  this.lightEmitter = null;
  this.particleMaterial = null;
  this.gravityCoeff = null;
  this.loaded = false;

  this.bbhelper = null;
  this.bbox = null;
  this.interactionFired = false;

  this.part1 = null;
  this.part2 = null;
  this.part3 = null;

  this.status = null;

  this.load = function(onLoad) {
    this.status = 0;
    this.gravityCoeff = 3.0;
    var _this = this;
    this.parent = new THREE.Object3D();
    this.lightEmitter = new THREE.PointLight( 0xffebbf, 1, 100, 2 );

    // FIXME gigantic performance hit on mobile
  	if(!Util.isMobile()) {
  		this.lightEmitter.castShadow = true;
  	}

    this.parent.add(this.lightEmitter);
    var loader = new THREE.TextureLoader();
    loader.load(
      'public/img/particle.png',
      function(texture) {
        _this.particleMaterial = new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
        _this.particleMaterial.color.setHex(0xffebbf);
        _this.lightEmitter.intensity = 0.7;
        var particleGeometry = new THREE.PlaneGeometry(0.3, 0.3, 10, 10);

        _this.part1 = new THREE.Mesh(particleGeometry, _this.particleMaterial);
        _this.part2 = new THREE.Mesh(particleGeometry, _this.particleMaterial);
        _this.part3 = new THREE.Mesh(particleGeometry, _this.particleMaterial);

        _this.parent.add(_this.part1);
        _this.parent.add(_this.part2);
        _this.parent.add(_this.part3);
        
        if (window.DEBUG) {
          _this.bbhelper = new THREE.BoxHelper(_this.parent, 0xffffff);
          _this.bbhelper.geometry.computeBoundingBox();
        }
        var box3 = new THREE.Box3();
        _this.bbox = box3.setFromObject( _this.parent );

        onLoad();
        
        _this.loaded = true;
        
      }
    );

  };

  this.updatePosition = function(time, scene) {
    // Update particles gravity & intensity when switching firefly status
    this.updateGravity();
    this.updateLightIntensity();
    this.interact(scene.interactableObjects, scene.character.theta); // Passer theta du perso ?

    // TODO : Update particles scale
    this.part1.position.x = Math.sin( time * 0.7 ) / this.gravityCoeff;
    this.part1.position.y = Math.cos( time * 0.5 ) / this.gravityCoeff;
    this.part1.position.z = Math.cos( time * 0.3 ) / this.gravityCoeff;

    this.part2.position.x = Math.sin( time * 0.3 ) / this.gravityCoeff;
    this.part2.position.y = Math.cos( time * 0.5 ) / this.gravityCoeff;
    this.part2.position.z = Math.cos( time * 0.7 ) / this.gravityCoeff;

    this.part3.position.x = Math.sin( time * 0.3 ) / this.gravityCoeff;
    this.part3.position.y = Math.cos( time * 0.7 ) / this.gravityCoeff;
    this.part3.position.z = Math.cos( time * 0.5 ) / this.gravityCoeff;

  };

  this.updateStatus = function() {
    // TODO More semantic status such as grouped / ungrouped
    if(this.status === 0) {
      this.status = 1;
    }
    else if(this.status === 1) {
      this.status = 0;
    }
  };

  this.updateGravity = function() {
    if(this.status === 0) {
      if(this.gravityCoeff > 3.0) {
        // If we stay a long time on status 1, we have to reduce the gravity when switching status
        if(this.gravityCoeff > 15.0) {
          this.gravityCoeff = 15.0;
        }
        this.gravityCoeff -= 0.1;
      }
    }
    else if(this.status === 1) {
      this.gravityCoeff += 0.1;
    }
  };

  this.updateLightIntensity = function() {
    if(this.status === 0) {
      if(this.lightEmitter.intensity > 0.7) {
        this.lightEmitter.intensity -= 0.01;
      }
    }
    else if(this.status === 1) {
      if(this.lightEmitter.intensity < 1.3) {
        this.lightEmitter.intensity += 0.01;
      }
    }
  };

  // FIXME trouble when object is far from the circle (gap between x and z firefly position and x and z object position)
  this.interact = function(objects, characterTheta) {
    var collide = false;

    if (window.DEBUG && this.bbhelper){
      this.bbhelper.update(this.parent);
    }
    if(this.bbox) {
      this.bbox.setFromObject(this.parent); // re-calculate AABB

      // Size of interaction box depending on angle on the circle
      var boxSize;
      if ( (characterTheta > 0.625 && characterTheta < 0.875) || (characterTheta > 0.125 && characterTheta < 0.375) ) {
        boxSize = new THREE.Vector3(1, 1, 20);
      } else {
        boxSize = new THREE.Vector3(20, 1, 1);
      }

      this.bbox.setFromCenterAndSize(this.bbox.getCenter(), boxSize);

      for (var i = 0; i < objects.length; i++) {
        collide = this.bbox.intersectsBox(objects[i].object.bbox);

        if (collide) {
          if (!this.interactionFired) {
            var event = new CustomEvent('interact', {'detail': {'id': objects[i].id, 'interaction': objects[i].interaction}});
            window.dispatchEvent(event);
            this.interactionFired = true;
          }
          break;
        }

      }
      if (!collide) {this.interactionFired = false;}
    }
  };
};

module.exports = Firefly;

