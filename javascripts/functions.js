class Key { //Key
	constructor(x, y, dxl, dxr) {
		this.x = x;
		this.y = y;
		this.dxl = dxl;
		this.dxr = dxr;
	}

	setFromString(str) { //Read and interpret string as key/value pair.
		var eqind = str.indexOf('=');
		var rightside = str.substr(eqind+1).trim();
		var nums = rightside.split(' ');
		for (var i = 0; i < nums.length; i++) {
			nums[i] = parseFloat(nums[i]);
		}
		this.x = nums[0];
		this.y = nums[1];

		this.dxl = undefined;
		if (nums.length > 2) {
			this.dxl = nums[2];
		}
		this.dxr = undefined;
		if (nums.length > 3) {
			this.dxr = nums[3];
		}
	}
}

class FloatCurve { //Float curve made out of keys
	contructor(keys) {
		this.keys = keys;
	}

	setFromKeyList(strlist) {
		this.keys = [];
		for (var i = 0; i < strlist.length; i++) {
			var newkey = new Key(0,0,0,0);
			newkey.setFromString(strlist[i]);
			this.keys.push(newkey);
		}
	}

	setFromKeyString(str) {
		str.replaceAll('\t', '');
		var lines = str.split('\n');
		var nl = [];
		for (var i = 0; i < lines.length; i++) {
			if (lines != '') {
				nl.push(lines[i]);
			}
		}
		this.setFromKeyList(nl);
	}

	setAsConst(val, min, max) {
		this.keys = [];
		this.keys.push(new Key(min, val, 0, 0));
		this.keys.push(new Key(max, val, 0, 0));
	}

	valueAt(xv) {
		//Find value of curve at x-value x
		//Determine which cubic segment to choose
		var startind = 0;
		for (var i = 0; i < this.keys.length-1; i++) {
			if ((this.keys[i].x <= xv) && (this.keys[i+1].x >= xv)) {
				startind = i;
			}
		}

		if (xv > this.keys[this.keys.length-1].x) {
			return [this.keys[this.keys.length-1].y + this.keys[this.keys.length-1].dxr*(xv-this.keys[this.keys.length-1].x), this.keys[this.keys.length-1].dxr];
		}
		if (xv < this.keys[0].x) {
			return [this.keys[0].y + this.keys[0].dxl*(xv-this.keys[0].x), this.keys[0].dxl];
		}
		
		//Determine cube
		var key1 = this.keys[startind];
		var key2 = this.keys[startind + 1];

		var k1x = key1.x;
		var k1y = key1.y;
		var k1dr = key1.dxr;

		var k2x = key2.x;
		var k2y = key2.y;
		var k2dl = key2.dxl;

		var xint = (xv-k1x)/(k2x-k1x);

		var x0 = 0;
		var x1 = 1;

		var y0 = k1y;
		var y1 = k2y;

		var d0 = k1dr*(k2x-k1x);
		var d1 = k2dl*(k2x-k1x);

		var d = y0;
		var c = d0;
		var a = d1 + d0 + 2*(y0 - y1);
		var b = y1 - y0 - d0 - a;

		return [a*xint*xint*xint+b*xint*xint+c*xint+d, 3*a*xint*xint+2*b*xint+c];
	}

	fixDerivatives() {
		//Make up derivatives if none exist
		//Special case: first and last keys
		if (this.keys[0].dxr == undefined) {
			this.keys[0].dxr = 0;
		}
		if (this.keys[this.keys.length-1].dxl == undefined) {
			this.keys[this.keys.length-1].dxl = 0;
		}
		this.keys[0].dxl = 0;
		this.keys[this.keys.length-1].dxr = 0;
		//Create derivatives for rest of elements
		for (var i = 1; i < this.keys.length-1; i++) {
			if (this.keys[i].dxl == undefined) {
				this.keys[i].dxl = (this.keys[i+1].y-this.keys[i-1].y)/(this.keys[i+1].x-this.keys[i-1].x);
			}
			this.keys[i].dxr = this.keys[i].dxl;
		}
	}
}

var a = new FloatCurve();
a.setFromKeyList([
	'key = 0 1 -1 0',
	'key = 1 0.3679 -0.3679 0',
	'key = 2 0.1353 -0.1353 0'
]);
console.log(a.valueAt(0.5));

class stockbody {
	constructor(m, r, rp) {
		this.mass = m
		this.radius = r
		this.rotationPeriod = rp;
	}
}

var stockbodies = new Map([
	['Sun',    new stockbody(1.75654591319326e+28, 261600000, 432000)],
	['Moho',   new stockbody(2.52633139930162e+21, 250000,    1210000)],
	['Eve',    new stockbody(1.2243980038014e+23,  700000,    80500)],
	['Gilly',  new stockbody(1.24203632781093e+17, 13000,     28255)],
	['Kerbin', new stockbody(5.29151583439215e+22, 600000,    21549)],
	['Mun',    new stockbody(9.7599066119646e+20,  200000,    138984)],
	['Minmus', new stockbody(2.64575795662095e+19, 60000,     40400)],
	['Duna',   new stockbody(4.51542702477492e+21, 320000,    65517)],
	['Ike',    new stockbody(2.78216152235874e+20, 130000,    65517)],
	['Dres',   new stockbody(3.21909365785247e+20, 138000,    34800)],
	['Jool',   new stockbody(4.23321273059351e+24, 6000000,   36000)],
	['Laythe', new stockbody(2.93973106291216e+22, 500000,    52980)],
	['Vall',   new stockbody(3.10876554482042e+21, 300000,    105962)],
	['Tylo',   new stockbody(4.23321273059351e+22, 600000,    211926)],
	['Bop',    new stockbody(3.72610898343278e+19, 65000,     544507)],
	['Pol',    new stockbody(1.08135065806823e+19, 44000,     901902)],
	['Eeloo',  new stockbody(1.11492242417007e+21, 210000,    12600)]
]);

console.log(stockbodies);

//Drag Cube
class Vector3 {
	constructor(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	multScalar(s) {
		return new Vector3(this.x*s,this.y*s,this.z*s);
	}

	get magnitude() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}
}

function dot3(a, b) {
	return a.x*b.x + a.y*b.y + a.z*b.z; 
}

function add(a, b) {
	return new Vector3(a.x+b.x, a.y+b.y, a.z+b.z);
}

//Drag Cube Normals (+z is up, -z is down, +x is right, -x is left, +y is front, -y is back)
var dgv = [[0,0,1], [0,0,-1], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0]];
console.log(dgv);

class dragcube {
	constructor() {
		this.areas = []; //Area of face
		this.wdrgs = []; //WDRG
	}
}

function lerp(a, b, x) {
	return a + x*(b-a)
}

function frac(a, b, x) {
	return (x-a)/(b-a);
}

function lum(r, g, b) { //Luminance of Color
	return 0.2126*Math.min(r,255)+0.7152*Math.min(g,255)+0.0722*Math.min(b,255);
}

function lummult(r, g, b, m) {
	return lum(r*m, g*m, b*m);
}

function determineScaleFactor(r, g, b, d) { //Determine scale factor of color
	var m0 = Math.min(r, g, b);
	var m2 = Math.max(r, g, b);
	var m1 = r+g+b-m0-m2;
	if (d < lummult(r,g,b,255/m2)) {
		return d/lum(r,g,b);
	}
	if (d < lummult(r,g,b,255/m1)) {
		return lerp(255/m2,255/m1,frac(lummult(r,g,b,255/m2),lummult(r,g,b,255/m1),d));
	}
	if (d < lummult(r,g,b,255/m0)) {
		return lerp(255/m1,255/m0,frac(lummult(r,g,b,255/m1),lummult(r,g,b,255/m0),d));
	}
	return 255/m0;
}

function rgbString(r,g,b) {
	return 'rgb('+r+' '+g+' '+b+')';
}

function rgbFromHexString(str) {
	if (str.length == 4) {
		return rgbFromHexString('#'+str[1]+str[1]+str[2]+str[2]+str[3]+str[3]);
	}
	return [parseInt(str.substr(1,2),16),parseInt(str.substr(3,2),16),parseInt(str.substr(5,2),16)];
}

function rgbFromString(str) {
	if (['HSBA','hsba'].includes(str.substr(0,4))) {
		var color = str.substr(5,str.length-6).split(',');
		color[0] = parseFloat(color[0].trim())*360/255;
		color[1] = parseFloat(color[1].trim())/255;
		color[2] = parseFloat(color[2].trim())/255;
		var C = color[1]*color[2];
		var m = color[2]-C;
		var X = C*(1-Math.abs(((color[0]/60) % 2)-1));

		if (color[0] < 60) {
			return [255*(C+m),255*(X+m),255*(0+m)];
		}
		if (color[0] < 120) {
			return [255*(X+m),255*(C+m),255*(0+m)];
		}
		if (color[0] < 180) {
			return [255*(0+m),255*(C+m),255*(X+m)];
		}
		if (color[0] < 240) {
			return [255*(0+m),255*(X+m),255*(C+m)];
		}
		if (color[0] < 300) {
			return [255*(X+m),255*(0+m),255*(C+m)];
		}
		if (color[0] < 360) {
			return [255*(C+m),255*(0+m),255*(X+m)];
		}
	}
	if (['RGBA','rgba'].includes(str.substr(0,4))) {
		var color = str.substr(5,str.length-6).split(',');
		return [parseFloat(color[0].trim()),parseFloat(color[1].trim()),parseFloat(color[2].trim())];
	}
	if (['RGB','rgb'].includes(str.substr(0,3))) {
		var color = str.substr(4,str.length-5).split(',');
		return [parseFloat(color[0].trim()),parseFloat(color[1].trim()),parseFloat(color[2].trim())];
	}
	if (str[0] == '#') {
		return rgbFromHexString(str);
	}
	var color = str.split(',');
	return [255*parseFloat(color[0].trim()),255*parseFloat(color[1].trim()),255*parseFloat(color[2].trim())];
}

function colorDist(r1,g1,b1,r2,g2,b2) {
	var mult1 = 255/Math.max(r1,g1,b1);
	var mult2 = 255/Math.max(r2,g2,b2);

	var Ra = 0.5*(r1*mult1+r2*mult2);
	var Rd = r1*mult1-r2*mult2;
	var Gd = g1*mult1-g2*mult2;
	var Bd = b1*mult1-b2*mult2;
	return (2+Ra/255)*Rd*Rd+4*Gd*Gd+(3-Ra/255)*Bd*Bd;
}

function determineSimilar(r1,g1,b1,r2,g2,b2,d) { //Determine if color distance is below limit.
	return colorDist(r1,g1,b1,r2,g2,b2) < d;
}

var testGraph = [];
for (var i = 0; i < 6; i++) {
	testGraph.push([]);
	for (var j = 0; j < 6; j++) {
		testGraph[testGraph.length-1].push(i==j);
	}
}

var temp = testGraph[0];

testGraph[0] = testGraph[1];
testGraph[1] = temp;

function determineConnectedComponents(graph) { //Get connected components of graph

	var alt = [];
	for (var i = 0; i < graph.length; i++) {
		alt.push(-1);
	}
	alt[0] = 0;
	for (var i = 1; i < graph.length; i++) {
		for (var j = 0; j < graph.length; j++) {
			if ((j < i) && graph[i][j]) {
				alt[i] = alt[j];
			}
			if (alt[i] == -1) {
				alt[i] = Math.max(...alt.slice(0,i))+1;
			}
		}
	}

	var finalAlt = [];
	for (var i = 0; i <= Math.max(...alt); i++) {
		finalAlt.push([]);
		for (var j = 0; j < alt.length; j++) {
			if (i == alt[j]) {
				finalAlt[finalAlt.length-1].push(j);
			}
		}
	}
	return finalAlt;
}

function comparenum(a, b) {
	var la = a.at(-1);
	var lb = b.at(-1);
	if (la < lb) {
		return -1;
	}
	if (lb < la) {
		return 1;
	}
	return 0;
}

function comparekey(a, b) {
	var la = a.x;
	var lb = b.x;
	if (la < lb) {
		return -1;
	}
	if (lb < la) {
		return 1;
	}
	return 0;
}

//Generate star pattern
var starX = [];
var starY = [];
var starSize = [];
var starPhase = [];

for (var i = 0; i < 40; i++) {
	starX.push(Math.random());
	starY.push(Math.random());
	starSize.push(Math.pow(Math.random(),2)*0.01);
	starPhase.push(Math.random()*2*Math.PI);
}
