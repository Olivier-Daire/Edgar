"use strict";

var SceneUtil = {};

// TODO Pass scene ? 
SceneUtil.interact = function(e, scene) {
  var object = null;
  switch(e.interaction.type) {

    case 'move':
      object = scene.scene.getObjectById(e.id);
      this.moveInteraction(e.interaction, object);

      // Get object in interactableObjects array
      var interactableObject =  scene.interactableObjects.filter(function( obj ) {
        return obj.id === e.id;
      })[0];

      // Check if interaction not already completed
      if (!interactableObject.done || interactableObject.done === false) {
        scene.achievedObjectives++;
        interactableObject.done = true;
      }
      break;

    case 'light':
      object = scene.scene.getObjectById(e.id);
      var on = this.lightInteraction(object, scene);
      on ? scene.achievedObjectives++ : scene.achievedObjectives--; // jshint ignore:line

      break;

    case 'end-level':
      this.endLevelInteraction(e.interaction.value, scene);

      break;

    default:
      console.log("Implement switch case for " + e.interaction.type);  // jshint ignore:line
  }

  // If an object trigger an event that should end the level
  // e.g move an object then end level
  if(e.interaction.end) {
    this.endLevelInteraction(e.interaction.goto, scene);
  }
};

SceneUtil.moveInteraction = function(interaction, object) {
  var movementStep = 0.05;
  var intervalStep = 10;

  switch(interaction.operation) {
    case '+':
      switch(interaction.axis) {
        case 'x':
            setInterval(function(){ 
              if(object.position.x < -interaction.value){
                object.position.x += movementStep;
              }
            }, intervalStep);
          break;
        case 'y':
            setInterval(function(){ 
              if(object.position.y < -interaction.value){
                object.position.y += movementStep;
              }
            }, intervalStep);
          break;
        case 'z':
            setInterval(function(){ 
              if(object.position.z < -interaction.value){
                object.position.z += movementStep;
              }
            }, intervalStep);
          break;
      }
      break;
    case '-':
      switch(interaction.axis) {
        case 'x':
            setInterval(function(){ 
              if(object.position.x > -interaction.value){
                object.position.x -= movementStep;
              }
            }, intervalStep);
          break;
        case 'y':
            setInterval(function(){ 
              if(object.position.y > -interaction.value){
                object.position.y -= movementStep;
              }
            }, intervalStep);
          break;
        case 'z':
            setInterval(function(){ 
              if(object.position.z > -interaction.value){
                object.position.z -= movementStep;
              }
            }, intervalStep);
          break;
      }
      break;
  } 
};

SceneUtil.lightInteraction = function(object, scene) {
  var on = false;
  if (!object.userData.light_on || object.userData.light_on === "undefined") {
    var light = new THREE.PointLight( 0xfffdcc, 2, 2, 0.9 );
    // Get real position of object http://stackoverflow.com/a/14225370
    var position = new THREE.Vector3();
    var boundingBox = object.geometry.boundingBox;
    position.subVectors(boundingBox.max, boundingBox.min);
    position.multiplyScalar( 0.5 );
    position.add( boundingBox.min );
    position.applyMatrix4( object.matrixWorld );

    light.position.set(position.x,position.y,position.z);
    // store light so we can interact with it again
    object.userData = { light_on: true, light_id: light.id };
    scene.scene.add( light );

    on = true;
  } else {
    scene.scene.remove(scene.scene.getObjectById(object.userData.light_id));
    object.userData = { light_on: false};

    on = false;
  }
  return on;
};

SceneUtil.endLevelInteraction = function(nextLevel, scene) {
  if (scene.achievedObjectives === scene.totalObjectives) {
    this.transitionScene(nextLevel, scene);
  } else {
    document.getElementById('objectives').style.display = 'block';
    setTimeout(function() { document.getElementById('objectives').style.display = 'none'; }, 2500);
  }
};

SceneUtil.transitionScene = function(number, scene) {
  function opacityHandler(value){
    opacity = opacity+value*negative;
    screen.style.opacity = opacity;

    if(opacity >= 1.2){
      negative = -1;

    } else if (opacity <= 0) {

      var elt = document.getElementById('blackBackground');
      elt.parentNode.removeChild(elt);
      clearInterval(blackScreenTransition);
    }
  }

  var screen = document.createElement('div');
  screen.id="blackBackground";
  screen.style = "width:100%; height:100%; position:fixed; top:0; left:0; background-color:black; z-index:10000; opacity:0;";
  document.body.appendChild(screen);
  var frameRate = 10, totalTime = 1000, opacity = 0, negative = 1;

  var blackScreenTransition = setInterval(function(){
    opacityHandler(frameRate / totalTime);
  }, frameRate);

  setTimeout(function(){
    if (scene.controls) {
      scene.controls.resetPose();
    }
    scene.deleteScene();


    var event = new CustomEvent('load-level', {'detail': {'number':number}});
    window.dispatchEvent(event);

  }, totalTime);

};

module.exports = SceneUtil;

