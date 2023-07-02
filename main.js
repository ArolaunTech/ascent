//Main js file

//GL context
var trajCanvas = document.getElementById('trajectory-display');
console.log('trajCanvas:');
console.log(trajCanvas);

var gltraj = trajCanvas.getContext('webgl2');

//Error throw
if (!gltraj) {
  alert("Your browser doesn't appear to support WebGL.");
  throw "Your browser doesn't appear to support WebGL.";
}
