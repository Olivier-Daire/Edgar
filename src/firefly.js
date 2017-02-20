"use strict";

var Util = require('./util.js');

var Firefly = function() {
  this.parent = null;
  this.lightEmitter = null;

  this.part1 = null;
  this.part2 = null;
  this.part3 = null;

  this.load = function() {
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
        var particleMaterial = new THREE.MeshBasicMaterial( { map: texture, transparent: true} );
        var particleGeometry = new THREE.PlaneGeometry(0.3, 0.3, 10, 10);

        _this.part1 = new THREE.Mesh(particleGeometry, particleMaterial);
        _this.part2 = new THREE.Mesh(particleGeometry, particleMaterial);
        _this.part3 = new THREE.Mesh(particleGeometry, particleMaterial);

        _this.parent.add(_this.part1);
        _this.parent.add(_this.part2);
        _this.parent.add(_this.part3);
      }
    );

  };

  this.updatePosition = function(time) {
    this.part1.position.x = Math.sin( time * 0.7 ) / 3;
    this.part1.position.y = Math.cos( time * 0.5 ) / 4;
    this.part1.position.z = Math.cos( time * 0.3 ) / 3;

    this.part2.position.x = Math.sin( time * 0.3 ) / 3;
    this.part2.position.y = Math.cos( time * 0.5 ) / 4;
    this.part2.position.z = Math.cos( time * 0.7 ) / 3;

    this.part3.position.x = Math.sin( time * 0.3 ) / 3;
    this.part3.position.y = Math.cos( time * 0.7 ) / 4;
    this.part3.position.z = Math.cos( time * 0.5 ) / 3;
  };
};

module.exports = Firefly;
