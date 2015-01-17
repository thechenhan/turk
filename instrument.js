

var renderer, scene, camera, controls;

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

var brassColor = transitionColors[0];
var ballColor = 0xD4D4BF;
var tubeColor = 0xD1D1D1;

var cannonBaseRadius = 10;
var cannonTopRadius = 15;
var cannonThickness = 3;
var cannonHeight = 40;

var shortestKeyLength = 15;
var longestKeyLength = 40;
var keyWidth = 5;
var keyThickness = 2;

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
var lastUpdatedTime;

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
  //addCannon(); //中间大的弹珠发射桶
  addLighting(); //添加环境光
  //addKeys(); //添加按键
  //addBuckets(); //旁边一圈小的弹珠接受装置
  //addTubing(); //添加其他管子
  addParts();
  //renderer.render(scene, camera);
}

function addNotePins(){
  scene.remove(notespins); //remove the notespin from scene
  revolvingCylinder.remove(notespins); //remove the notes pin from cylinder object;
  var pinGeo = new THREE.CylinderGeometry( 0.1, 0.5, 3, 32 );
    for( var i = 1; i <= 88; i ++){
    
    var pin = new THREE.Mesh( pinGeo, cylinderMaterial );
    pin.rotation.x = 90 / 180 * Math.PI;
    pin.position.x = (i-1) * 1.5 + 0.5; 
    pin.position.z = 20;
    notespins.add(pin);

  }
  
  scene.add(notespins);

}



function addParts(){
    var cylinderMaterial = new THREE.MeshPhongMaterial( { color: 0xD1F5FD, specular: 0xD1F5FD, shininess: 100 } );
var cylinderGeo = new THREE.CylinderGeometry( 20, 20, 131.5, 32 );
  var cylinder = new THREE.Mesh( cylinderGeo, cylinderMaterial );
  cylinder.rotation.z = 90 / 180 * Math.PI;
  cylinder.position.x = 65.75;
  var revolvingCylinder = new THREE.Object3D();
  revolvingCylinder.add(cylinder);

  var pinGeo = new THREE.CylinderGeometry( 0.1, 0.5, 3, 32 );
    for( var i = 1; i <= 88; i ++){
    
    var pin = new THREE.Mesh( pinGeo, cylinderMaterial );
    pin.rotation.x = 90 / 180 * Math.PI;
    pin.position.x = (i-1) * 1.5 + 0.5; 
    pin.position.z = 20;
    revolvingCylinder.add(pin);

  }
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
  combAssem.position.z = 20 + 40 + 1; //the cylinder  R + width comb + gap
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



function addLighting2() {
 var ambientLight = new THREE.AmbientLight( 0x222222 );

  var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  light.position.set( 200, 400, 500 );

  var light2 = new THREE.PointLight( 0xFFFFFF, 1, 0 );
  light.position.set( 350, 350, 350 );

  var light3 = new THREE.PointLight( 0xFFFFFF, 1, 0 );
  light.position.set( 350, 350, -50 );

  scene.add(ambientLight);
  scene.add(light);
  scene.add(light2);
  scene.add(light3);

   var light1 = new THREE.PointLight(0xFFFFFF);

  light1.position.x = 0;
  light1.position.y = 500;
  light1.position.z = 500;

  //scene.add(light1);

  var light2 = new THREE.PointLight(0xFFFFFF);

  light2.position.x = 0;
  light2.position.y = 500;
  light2.position.z = -500;

  //scene.add(light2);
}

function addCannon() {
  var cannon = new THREE.Mesh(
    new THREE.TubeGeometry(cannonTopRadius, cannonBaseRadius, cannonTopRadius - cannonThickness, cannonBaseRadius - cannonThickness, cannonHeight, 32, 1, false),
    new THREE.MeshPhongMaterial({ color: brassColor })
  );

  scene.add(cannon);

  var cannonBase = new THREE.Mesh(
    new THREE.CylinderGeometry(cannonBaseRadius, cannonBaseRadius, tubeRadius * 2, 32, 1, false),
    new THREE.MeshPhongMaterial({ color: brassColor })
  );

  cannonBase.position.y = -cannonHeight / 2;

  scene.add(cannonBase);

  var centralSphere = new THREE.Mesh(
    new THREE.SphereGeometry(cannonBaseRadius, 16, 16),
    new THREE.MeshPhongMaterial({ color: brassColor })
  );

  centralSphere.position.y = -cannonHeight / 2;

  scene.add(centralSphere);
}

function addKeys() {
  for (var i = 0; i < numKeys; i++) {
    // use linear interpolation to find key length
    var weight = i / numKeys;
    var keyLength = longestKeyLength + (shortestKeyLength - longestKeyLength) * weight;

    var key = new THREE.Mesh(
      new THREE.CubeGeometry(keyLength, keyThickness, keyWidth),
      new THREE.MeshPhongMaterial({ color: brassColor })
    );

    key.position.x = keyRadius;

    var temp = new THREE.Object3D();
    temp.add(key);

    temp.rotation.y = (i / numKeys) * 2 * Math.PI;

    scene.add(temp);

    keys.push(key);
  }
}

function addBuckets() {
  for (var i = 0; i < numKeys; i++) {
    var bucket = new THREE.Mesh(
      // new THREE.CylinderGeometry(bucketTopRadius, bucketBaseRadius, bucketHeight, 32, 1, false),
      new THREE.TubeGeometry(bucketTopRadius, bucketBaseRadius, bucketTopRadius - bucketThickness, bucketBaseRadius - bucketThickness, bucketHeight, 16, 1, false),
      new THREE.MeshPhongMaterial({ color: brassColor })
    );

    bucket.position.x = bucketRadiusToCannon - bucketPositionOffset;
    bucket.rotation.z = Math.PI / 2 - firingAngle;

    var temp = new THREE.Object3D();
    temp.add(bucket);

    temp.rotation.y = (i / numKeys) * 2 * Math.PI;

    scene.add(temp);
  }
}

function addTubing() {
  var bottomTorus = new THREE.Mesh(
    new THREE.TorusGeometry(bucketRadiusToCannon, tubeRadius, 8, numKeys, 2 * Math.PI),
    new THREE.MeshPhongMaterial({ color: tubeColor })
  );

  bottomTorus.rotation.x = Math.PI / 2;
  bottomTorus.position.y = -cannonHeight / 2;

  scene.add(bottomTorus);
  
  for (var i = 0; i < numKeys; i++) {
    var upTube = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, cannonHeight / 2, 32, 1, false),
      new THREE.MeshPhongMaterial({ color: tubeColor })
    );

    upTube.position.x = bucketRadiusToCannon;

    var darkBucketBase = new THREE.Mesh(
      new THREE.CylinderGeometry(darkBaseRadius, darkBaseRadius, darkBaseHeight, 16, 1),
      new THREE.MeshPhongMaterial({ color: blackColor })
    );

    darkBucketBase.position.y = cannonHeight / 4;
    darkBucketBase.position.x = bucketRadiusToCannon;

    var temp = new THREE.Object3D();
    temp.add(upTube);
    temp.add(darkBucketBase);

    temp.position.y = -cannonHeight / 4;
    temp.rotation.y = i * 2 * Math.PI / numKeys;

    scene.add(temp);
  }

  for (var i = 0; i < numCentralizingPipes; i++) {
    var inTube = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, bucketRadiusToCannon, 32, 1, false),
      new THREE.MeshPhongMaterial({ color: tubeColor })
    );

    inTube.position.x = bucketRadiusToCannon / 2;
    inTube.position.y = -cannonHeight / 2;
    inTube.rotation.z = Math.PI / 2;

    var tube = new THREE.Object3D();
    tube.add(inTube);

    tube.rotation.y = (i / numCentralizingPipes) * 2 * Math.PI;

    scene.add(tube);
  }
}

function addBall(keyTarget) {
  var ball = new Ball(keyTarget);

  queue.push(Date.now());

  balls.push(ball);

  scene.add(ball.object);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (musicPlaying) {
    throwBallsToMusic();
  }

  //moveBalls();
  //darkenKeys();

  renderer.render(scene, camera);
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

function drawHelpers() {
  if (ground) {
    Coordinates.drawGround({size:100});
  }
  if (gridX) {
    Coordinates.drawGrid({size:100,scale:1});
  }
  if (gridY) {
    Coordinates.drawGrid({size:100,scale:1, orientation:"y"});
  }
  if (gridZ) {
    Coordinates.drawGrid({size:100,scale:1, orientation:"z"});
  }
  if (axes) {
    Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});
  }

  if (bCube) {
    var cubeMaterial = new THREE.MeshLambertMaterial(
      { color: 0xFFFFFF, opacity: 0.7, transparent: true } );
    var cube = new THREE.Mesh(
      new THREE.CubeGeometry( 2, 2, 2 ), cubeMaterial );
    scene.add( cube );
  }
}

function setupGui() {

  effectController = {

    newCube: bCube,
    newGridX: gridX,
    newGridY: gridY,
    newGridZ: gridZ,
    newGround: ground,
    newAxes: axes
  };

  var gui = new dat.GUI();
  gui.add( effectController, "newCube").name("Show cube");
  gui.add( effectController, "newGridX").name("Show XZ grid");
  gui.add( effectController, "newGridY" ).name("Show YZ grid");
  gui.add( effectController, "newGridZ" ).name("Show XY grid");
  gui.add( effectController, "newGround" ).name("Show ground");
  gui.add( effectController, "newAxes" ).name("Show axes");
}

try {
init();
fillScene();
var axisHelper = new THREE.AxisHelper( 500 );
scene.add( axisHelper );
//setupGui();
//drawHelpers();
animate();
} catch(e) {
  var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
  $('#container').append(errorReport+e);
}
