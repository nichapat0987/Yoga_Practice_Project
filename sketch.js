// ml5.js: Pose Classification
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/Courses/ml5-beginners-guide/7.2-pose-classification.html
// https://youtu.be/FYgYyq-xqAw

// All code: https://editor.p5js.org/codingtrain/sketches/JoZl-QRPK

// Separated into three sketches
// 1: Data Collection: https://editor.p5js.org/codingtrain/sketches/kTM0Gm-1q
// 2: Model Training: https://editor.p5js.org/codingtrain/sketches/-Ywq20rM9
// 3: Model Deployment: https://editor.p5js.org/codingtrain/sketches/c5sDNr8eM

let video;
let poseNet;
let pose;
let skeleton;
let poseLabel = "Do Pose"
let brain;

let state = 'waiting';
let targeLabel;

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
  //brain.loadData('yogastyle.json', dataReady);
}

function brainLoaded(){
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
  let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      brain.classify(inputs, gotResult);
  } else {
  console.log("Pose not found !")
  setTimeout(classifyPose, 100);
}
}

function gotResult(error,results) {
  poseLabel = results[0].label;
  console.log(results[0].confidence);
  classifyPose()
}

function dataReady() {
  brain.normalizeData()
  brain.train({epochs: 50}, finished);
}

function finished() {
  console.log('model trained');
  brain.save();
}

function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(8);
      stroke(244,194,194);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
  pop();
  
  noStroke();
  textSize(50);
  textAlign(CENTER, BOTTOM);
  if (poseLabel == 'r'){
    fill(255,0,0);
    text("wrong pose!",width/2,height/2);
  }
  if (poseLabel == 'q'){
    fill(81,159,96);
    text("tree pose correct!",width/2,height/2);
  }
  if (poseLabel == 'w'){
    fill(86,149,232);
    text("warrior pose correct!",width/2,height/2);
  }
  if (poseLabel == 'e'){
    fill(245,189,224);
    text("salute pose correct!",width/2,height/2);
  }
}