//MAJOR PROJECT 385
//(NUCLEAR) HOLIDAY

//sound variables
var soundscape;
var modulator;
var lpfArr = [];
var envArr = [];
var filterArr = [];
var lowpassArr = [];

var notes = [20, 25,37,33,32,40];
var numVoices = 10;

//create an oscillator array
var mainOsc = [];
var modulator = [];

//create an array to hold the colours from the pixels
var colAr = [];
var lineSize = 500;

//video variables
var vid1;

//variables for glitch function
var modulo = 0;
var glitch = false;
var currentMils = 0;

function preload(){
  //load soundfile
  soundFormats('mp3', 'ogg', 'wav');
  soundscape = loadSound('assets/Ocean_Waves-Mike_Koenig-980635527.wav');
}

function setup(){
  createCanvas(windowWidth,windowHeight);
  userStartAudio();
  //hide the cursor
  noCursor();

  //the video setup
  vid1 = createVideo(['/assets/MVI_6067.MOV']);
  vid1.size(windowWidth,windowHeight);
  vid1.position(0,0);
  vid1.loop();
  vid1.volume(0.0);
  vid1.hide();

  //the sound setup
  soundscape.setVolume(0.5);
  soundscape.loop();
  //create an fft to analyse the centroid
  fft = new p5.FFT(0.64);

  //forloop to set up the additive synthesis arays
  for(i = 0; i < numVoices; i++){
    envArr[i] = new p5.Env();
    envArr[i].setADSR(5, 5, 0.0, 0.5);
    envArr[i].setRange(1, 0); //setAttackLevel, set releaseLevel
    envArr[i].setExp();

    filterArr[i] = new p5.Env();
    filterArr[i].setADSR(2, 1, 0.0, 0.5);
    filterArr[i].setRange(1000, 0); //setAttackLevel, set releaseLevel

    lowpassArr[i] = new p5.LowPass();
    lowpassArr[i].freq(filterArr[i]);
    lowpassArr[i].res(18); //18 is arbitrary

    mainOsc[i] = new p5.Oscillator();
    mainOsc[i].setType('sine');
    mainOsc[i].amp(envArr[i]);
    mainOsc[i].disconnect();
    mainOsc[i].connect(lowpassArr[i]);
    mainOsc[i].start();

    modulator[i] = new p5.Oscillator();
    modulator[i].setType('sine');
    modulator[i].amp(50,0.1);
    modulator[i].freq(50);
  }

  //create the colours of the lines
  for(i = 0; i < lineSize; i++){
    //get a random pixel from the canvas and use as the colour for the line
    colAr[i] = get(random(0,windowWidth), random(0, windowHeight));
  }

}

function draw(){

  //the sound draw functions

  if(frameCount%100 == 0){
    for(i = 0; i<numVoices; i++){
      var randAttack = random(2,5); //random attack between 1s and 5s
      var randDecay = random(0.1,2);
      envArr[i].setADSR(randAttack,randDecay, 0.0, 0.5);
      envArr[i].setRange(random(0.05,0),0); //count to a smaller value due to lots of voices

      filterArr[i].setADSR(randAttack,randDecay, 0.0, 0.5);
      filterArr[i].setRange(random(100,1000),0);

      envArr[i].play();
      filterArr[i].play();

      var randomNote = int(random(0,notes.length-1));
      randomNote = notes[randomNote];

      mainOsc[i].freq(midiToFreq(randomNote)*4);
    }
  }

//when the mouseX value is greater than the threshold, trigger the change
  if(mouseX > (windowWidth/4)*3){
    mangle();
    mangleSynth();
    soundscape.setVolume(0.5);

    //invert the video and draw to the canvas
    image(vid1, 0,0);

    modulo = round(random(200, 800));

    //code to create a pixeleted effect at random i could not get working
    //if the modulo value is reached, set the glitch value to true
    /**
    if(frameCount%modulo == 0){
      glitch = true;
    }

    //if the glitch value is true, run the pixelated video, then set back to original
    if(glitch == true){
      currentMils = millis();
      image(pixelVid(),0,0);
      filter(INVERT);
      lines();
      if((millis()-currentMils) == 500){
        glitch = false;
        modulo = round(random(200,800));
        currentMils = 0;
        background(255);
        image(vid1, 0,0);
      }
    }
     **/
    filter(INVERT);
    lines();
  }

//set this back to normal when the x value is within the acceptable range
  else{
    //set the sound back to normal

    soundscape.disconnect();
    soundscape.connect();
    soundscape.setVolume(0.3);

    //set the oscillators back to normal
    for(var i = 0; i< numVoices; i++){
    modulator[i].disconnect();
    mainOsc[i].disconnect();
    mainOsc[i].connect();
  }

  //the non effected video
  image(vid1, 0,0);
  }
}

//-----------------------------------------------------------------------------

//the sound functions!!
function mangle(){
dis = new p5.Distortion(0.03,'none');

soundscape.disconnect();
soundscape.setVolume(0.2);
soundscape.connect(dis);
}

function mangleSynth(){
  for(var i = 0; i < numVoices; i++){
  modulator[i].disconnect();
  modulator[i].start();

  mainOsc[i].freq(modulator[i]);
  var ran = random(20, 500);

  lowpassArr[i].res(ran, 10);

}
}

//function to create lines
function lines(){
  for(var i = 0; i < 500; i++){
    var x = random(0, windowWidth);
    var y = random(100, windowHeight);

    stroke(0);
    strokeWeight(0.035);
    line(x,0,x,y);
  }

  for(var i = 0; i < 50; i++){
    var x = random(0, windowWidth);
    var y = random(400, windowHeight);

    stroke(100);
    strokeWeight(0.05);
    line(x,0,x,y);
  }
}

/**
//pixelate the video
function pixelVid(){

  vid1.loadPixels();
  for (var y = 0; y < height; y += 8) {
    for (var x = 0; x < width; x += 8) {
      var offset = ((y*width)+x)*4;
      fill(vid1.pixels[offset],
        vid1.pixels[offset+1],
        vid1.pixels[offset+2]);
      rect(x, y, 8, 8);
    }
  }
}

**/
