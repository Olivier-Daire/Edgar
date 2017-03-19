"use strict";

var Scene = require('./scene.js');

window.vrDisplay = null;
window.DEBUG = false;
// EnterVRButton for rendering enter/exit UI.
var vrButton;
var scene;
var stats;
var clock = new THREE.Clock();


document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode === 69) { // 69 keycode for 'e'
        scene.firefly.updateStatus();
    }
}

function onLoad() {
  document.getElementById('loader').style.display = 'none';

  if (window.DEBUG) {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
  }

  scene = new Scene(1, animate);


  window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', onResize, true);
  window.addEventListener('interact', function(e) {
    // e.detail.id contains object id
    // e.detail.interaction contains interaction type e.g "move"

    // Can only interact if firefly is grouped
    if (scene.firefly.status === 1) {
      // TODO Add all cases
      switch(e.detail.interaction) {
        case 'move':
          scene.scene.getObjectById(e.detail.id).position.x = 6;
          break;
        case 'light':
          var object = scene.scene.getObjectById(e.detail.id);
          var on = false;
          for (var i = 0; i < object.material.materials.length; i++ ) {
               if (object.material.materials[i].emissive.getHexString() === '000000') {
                object.material.materials[i].emissive.setHex(0xfffde5); // Light on
                on = true;
               } else {
                object.material.materials[i].emissive.setHex(0x000000); // Light off
               }
          }
          on ? scene.achievedObjectives++ : scene.achievedObjectives--; // jshint ignore:line
          break;
        case 'end-level':
          if (scene.achievedObjectives === scene.totalObjectives) { // jshint ignore:line
            // FIXME @Guilhem Load Next level and then remove --> // jshint ignore:line
          } else { // jshint ignore:line
            document.getElementById('objectives').style.display = 'block';
            setTimeout(function() { document.getElementById('objectives').style.display = 'none'; }, 2500);
          }
          break;
        default:
          console.log("Implement switch case for " + e.detail.interaction);  // jshint ignore:line
      }
    }

  }, false);

  // Initialize the WebVR UI.
  var uiOptions = {
    color: 'black',
    background: 'white',
    corners: 'square'
  };

  vrButton = new webvrui.EnterVRButton(scene.renderer.domElement, uiOptions);

  vrButton.on('exit', function() {
    scene.camera.quaternion.set(0, 0, 0, 1);
    scene.camera.position.set(0, scene.controls.userHeight, 0);
  });

  vrButton.on('hide', function() {
    document.getElementById('ui').style.display = 'none';
  });

  vrButton.on('show', function() {
    document.getElementById('ui').style.display = 'inherit';
  });

  document.getElementById('vr-button').appendChild(vrButton.domElement);

  document.getElementById('magic-window').addEventListener('click', function() {
    // Capture pointer
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
        document.body.requestPointerLock =  document.body.requestPointerLock ||  document.body.mozRequestPointerLock ||  document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
    }

    // Group / Ungroup firelfy on click
    window.addEventListener('click', function(e) {
      scene.firefly.updateStatus();
    }, true);

    vrButton.requestEnterFullscreen();
  });

}

// Request animation frame loop function
function animate() {
  if(window.DEBUG) {
    stats.begin();
  }
  var delta = clock.getDelta();

  if (scene.character.mesh !== null) {
    // Update character nextPosition
    scene.character.nextPosition = scene.camera.getWorldDirection().multiplyScalar(scene.radius);
    // Update character position along path
    scene.character.updateCharacter(0.4 * delta, scene);
  }

  var time = Date.now() * 0.003;
  scene.firefly.updatePosition(time, scene);

  scene.controls.update();

   // Only update controls if we're presenting.
  if (vrButton.isPresenting()) {
    scene.controls.update();
  }

  scene.effect.render(scene.scene, scene.camera);
  window.vrDisplay.requestAnimationFrame(animate);

  if(window.DEBUG) {
    stats.end();
  }
}

function onResize(e) {
  scene.effect.setSize(window.innerWidth, window.innerHeight);
  scene.camera.aspect = window.innerWidth / window.innerHeight;
  scene.camera.updateProjectionMatrix();
}


window.addEventListener('load', onLoad);
