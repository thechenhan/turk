var cylinderMaterial = new THREE.MeshPhongMaterial( { color: 0xD1F5FD, specular: 0xD1F5FD, shininess: 100 } );
var pinObject = new THREE.Object3D();
var revolvingCylinder = new THREE.Object3D();

var renderer, scene, camera, controls;
var ballColor = 0xCC6600;
var transitionColors = [
  0xCC6600,
  0xD17519,
  0xD68533,
  0xDB944D,
  0xE0A366,
  0xE6B280,
  0xEBC299,
  0xF0D1B2,
  0xF5E0CC,
  0xFAF0E6
];

var cylinderRadius = 20;
var keyInterval = 0.5;
var keyWidth = 1;
var cylinderLength = 88 * keyWidth + 87 * keyInterval;
var pinBaseRaidus = 0.15;
var pinTopRaidus = 0.05;


var numKeys = 88; //按键数量 88键midi钢琴

var keyRadius = 100;

var bucketRadiusToCannon = 140;
var bucketPositionOffset = 0.2;

var bucketBaseRadius = 3;
var bucketTopRadius = 5;
var bucketHeight = 12;
var bucketThickness = 1;

var darkBaseRadius = bucketBaseRadius + 0.5;
var darkBaseHeight = 1;
var blackColor = 0x000000;

var tubeRadius = 3;

var numCentralizingPipes = 7;

var ballRadius = 2;

var ballHangtime = 100;
var G = -0.1;

var initVelocity = -G * ballHangtime / 2;
var firingAngle = Math.acos(keyRadius / (ballHangtime * initVelocity));
var velocityOut = Math.cos(firingAngle) * initVelocity;

var bounceHangtime = 48;

var bounceVelocity = -G * bounceHangtime / 2;
var bounceAngle = Math.acos((bucketRadiusToCannon - keyRadius) / (bounceHangtime * bounceVelocity));
var bounceOut   = Math.cos(bounceAngle) * bounceVelocity;

var keys = [];
var balls = [];
var queue = []; // pronounced: kWEH.

var ballHeadstart = 1730;

var timeInSong = -startDelay;
var lastUpdatedTime = 0;

function Ball(keyTarget) {
  this.target = keyTarget;
  this.angle = 2 * Math.PI * keyTarget / numKeys;
  this.velocityUp = initVelocity * Math.sin(firingAngle);
  this.cannon = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 16, 16),
    new THREE.MeshPhongMaterial({ color: ballColor })
  );
  this.cannon.position.y = 0;
  this.object = new THREE.Object3D();
  this.object.add(this.cannon);
  this.object.rotation.y = this.angle;
}

function init() {
  var WIDTH = $('.rest').width(),
      HEIGHT = $('.rest').height(),
      VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  console.log('Size: ' + WIDTH + ' ' + HEIGHT);

  // create a WebGL renderer, camera
  // and a scene
  
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColorHex( 0xAAAAAA, 1.0 );
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new THREE.Scene();

  camera.position.x = 200;
  camera.position.y = 200;
  camera.position.z = 200;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $('#MusicBox').append(renderer.domElement);

  // and the camera
  scene.add(camera);

  addControls();

  // draw!
  renderer.render(scene, camera);
}

function fillScene() {
 
  addLighting(); //add the light

  addParts(); //add the main part: comb, cylinder, etc.
 
}

function addNotePins(){
  scene.remove(pinObject); //remove the notespin from scene
  revolvingCylinder.remove(pinObject); //remove the notes pin from cylinder object;
  pinObject = new THREE.Object3D();
  var pinGeo = new THREE.CylinderGeometry( pinTopRaidus, pinBaseRaidus, 3, 32 );
  var songFullTime = notes[notes.length - 1].time;

  for ( var i = 0; i < notes.length; i++) { //potential problem: the last one is the fist one. 
    var pinPosition = notes[i].note - MIDI.pianoKeyOffset
    var noteTime = notes[i].time;
    console.log(noteTime, pinPosition);

    var pin = new THREE.Mesh( pinGeo, cylinderMaterial );
    var pinTheta = noteTime / songFullTime * 2 * Math.PI;
    pin.rotation.x = - pinTheta;
    pin.position.x = (pinPosition - 1 ) * 1.5 + 0.5; 
    
    if (pinTheta >= 0 && pinTheta < 90) {
      pin.position.z = cylinderRadius * Math.sin (- pinTheta);
    pin.position.y = cylinderRadius * Math.cos (- pinTheta);

    }else if (pinTheta >= 90 && pinTheta < 180){
      pinTheta = pinTheta - 90;
      pin.position.z = - cylinderRadius * Math.cos ( pinTheta);
    pin.position.y = - cylinderRadius * Math.sin ( pinTheta);


    }else if (pinTheta >= 180 && pinTheta < 270){
       pinTheta = pinTheta - 180;
      pin.position.z = cylinderRadius * Math.sin ( pinTheta);
    pin.position.y = - cylinderRadius * Math.cos ( pinTheta);


    }else {
 pinTheta = pinTheta - 270;
      pin.position.z = cylinderRadius * Math.cos ( pinTheta);
    pin.position.y =  cylinderRadius * Math.sin ( pinTheta);


    }

    //pin.position.z = cylinderRadius * Math.sin (- pinTheta);
    //pin.position.y = cylinderRadius * Math.cos (- pinTheta);
    pinObject.add(pin);
  }

  pinObject.rotation.x = 90 / 180 * Math.PI; //change the start point from left level;
  revolvingCylinder.add(pinObject);
  scene.add(pinObject);

}



function addParts(){
  var cylinderGeo = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderLength, 32 );
  var cylinder = new THREE.Mesh( cylinderGeo, cylinderMaterial );
  cylinder.rotation.z = 90 / 180 * Math.PI;
  cylinder.position.x = cylinderLength / 2;
  
  revolvingCylinder.add(cylinder);

 
  scene.add( revolvingCylinder );

  var combAssem = new THREE.Object3D();
  var combMaterial = new THREE.MeshPhongMaterial( { color: 0x707070, specular: 0xD1F5FD, shininess: 500 } );
  
  var extrudeSettings = {
    amount      : 0.4, //base thickness
    steps     : 1,
    bevelEnabled  : false,    
  };


  var combBaseShape = new THREE.Shape();
    combBaseShape.moveTo(  0, 0 );    
    combBaseShape.lineTo(  0, 10 );
    combBaseShape.lineTo(  131.5, 30 ); 
    combBaseShape.lineTo(  131.5, 0 ); 
    combBaseShape.lineTo(  0, 0 );
  var combBaseGeo = new THREE.ExtrudeGeometry( combBaseShape, extrudeSettings );
  var combBase = new THREE.Mesh( combBaseGeo, combMaterial);
  
  combAssem.add( combBase );
  

  
  var numKeys = 88;
    var comnbFingerExtrudeSettings = {
    amount      : 0.2, //combFinger thickness
    steps     : 1,
    bevelEnabled  : false,    
  };



  for (var i = 1; i < numKeys + 1; i++){
    var baseFingerShape = new THREE.Shape();
    
    var startPointX = 1.5 * (i - 1);
    var startPointY = 10;

    baseFingerShape.moveTo( startPointX, startPointY );
    baseFingerShape.lineTo( startPointX, startPointY + 30);
    baseFingerShape.lineTo( startPointX + 1, startPointY + 30 );
    baseFingerShape.lineTo( startPointX + 1, startPointY );
    baseFingerShape.lineTo( startPointX, startPointY ); 
    var combFingerGeo = new THREE.ExtrudeGeometry( baseFingerShape, comnbFingerExtrudeSettings );
    var combFinger = new THREE.Mesh( combFingerGeo, combMaterial);
  
    combAssem.add( combFinger );
    


  }  

  scene.add( combAssem );

  combAssem.rotation.x = -90 / 180 * Math.PI;
  combAssem.position.z = cylinderRadius + 40 + 1; //the cylinder  R + width comb + gap
  combAssem.position.y = -0.35; //makesure the pin above the comb


}

function addLighting(){
  
  scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

  // LIGHTS
  var ambientLight = new THREE.AmbientLight( 0x222222 );

  var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light.position.set( 200, 400, 500 );

  var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light2.position.set( -500, 250, -200 );

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);

}






function addBall(keyTarget) {
  var ball = new Ball(keyTarget);

  queue.push(Date.now());

  balls.push(ball);

  scene.add(ball.object);
}

function animate() {
  window.requestAnimationFrame(animate);
  timeDelta = Date.now() - lastUpdatedTime
  

  
  controls.update();

  if (MIDI.Player.playing) {
     pinObject.rotation.x += timeDelta / notes[notes.length-1].time * 360 / 180 * Math.PI;
   // rotateCylinder();
  }

  //moveBalls();
  //darkenKeys();
  lastUpdatedTime = Date.now();
  renderer.render(scene, camera);
}

function rotateCylinder(){
 
  var delta = clock.getDelta();
  //revolvingCylinder.rotation.x += 
  pinObject.rotation.x += delta * 1000 / notes[notes.length-1].time * 360 / 180 * Math.PI;




}

// where the magic happens
function throwBallsToMusic() {
  if (notes.length == 0)
    return;

  lastUpdatedTime = lastUpdatedTime || Date.now();

  var delta = 0.01;
  
  var interpolatedTime = Date.now() - lastUpdatedTime;
  
  var currTime = timeInSong + interpolatedTime;

  while (notes[0].time < currTime + ballHeadstart) {
    //console.log(notes[0].note - MIDI.pianoKeyOffset);
    addBall(notes[0].note - MIDI.pianoKeyOffset);
    notes.splice(0, 1);

    if (notes.length === 0) {
      return;
    }
  }
}

function resetTimer(songTime) {
  timeInSong = songTime;
  lastUpdatedTime = Date.now();
}

function moveBalls() {
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];

    if (ball.cannon.position.y < 0) {
      if (ball.cannon.position.x >= bucketRadiusToCannon) {
        scene.remove(ball.object);
        balls.splice(i, 1);
        continue;
      } else {
        ballHeadstart = Date.now() - queue.shift(1);

        makeKeyGlow(ball.target);

        // and bounce back up!
        ball.velocityUp = bounceVelocity * Math.sin(bounceAngle);
        ball.cannon.position.y = 0;
      }
    }

    ball.velocityUp += G;

    if (ball.cannon.position.x < bucketRadiusToCannon) {
      ball.cannon.position.y += ball.velocityUp;
      ball.cannon.position.x += velocityOut;
    } else {
      ball.cannon.position.y += ball.velocityUp;
      ball.cannon.position.x += bounceOut;
    }
  }
}

function makeKeyGlow(key) {
  keys[key].material.color.setHex(transitionColors[transitionColors.length - 1]);
}

function darkenKeys() {
  for (var i = 0; i < numKeys; i++) {
    var key = keys[i];

    var state = transitionColors.indexOf(key.material.color.getHex());
    if (state === 0) {
      continue;
    } else {
      key.material.color.setHex(transitionColors[state - 1]);
    }
  }
}

function addControls() {
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 2;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 25;

    controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
}



try {
init();
fillScene();
var axisHelper = new THREE.AxisHelper( 500 );
scene.add( axisHelper );

animate();
} catch(e) {
  var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
  $('#container').append(errorReport+e);
}
