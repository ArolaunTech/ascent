//Optimization script
class Instruction { //Tell the craft what to do
	constructor(time, dir, throttle) {
		self.t = time;
		self.dir = dir;
		self.throttle = throttle;
	}
}

function getRocketState(time, code) {
	for (var i = 0; i < code.length; i++) {
		if (code[i].t <= time) {
			if ((i == code.length-1) || (code[i+1].t > time)) {
				return [code[i].dir, code[i].throttle];
			}
		}
	}
}

var stagepropmap = new Map([
	[1, 'mass'],
	[2, 'resources'],
	[3, 'wingarea'],
	[4, 'wingaoa'],
	[6, 'frontarea'],
	[7, 'sidearea'],
	[8, 'toparea'],
	[9, 'bottomarea'],
	[10, 'backarea'],
	[11, 'frontwdrg'],
	[12, 'sidewdrg'],
	[13, 'topwdrg'],
	[14, 'bottomwdrg'],
	[15, 'backwdrg'],
	[18, 'engines']
]);

var stageprops = [];

function getStages() {
	stagetable = document.getElementById('stagetable');

	if (stagetable.children.length == 0) {
		return [];
	}
	stageprops = [];
	for (var i = 0; i < stagetable.children[0].children.length; i++) {
		stageprops[i] = new Map();
		for (var j = 0; j < stagetable.children[0].children[i].children[0].children.length-1; j++) {
			if (j != stagetable.children[0].children[i].children[0].children.length-3) {
				var elem = stagetable.children[0].children[i].children[0].children[j];
				if (elem.nodeName[0] != 'H') {
					stageprops[i].set(stagepropmap.get(j),elem.children);
					if (elem.children.length == 5) {
						stageprops[i].set('lf', stageprops[i].get('resources')[0]);
						stageprops[i].set('ox', stageprops[i].get('resources')[1]);
						stageprops[i].set('mp', stageprops[i].get('resources')[2]);
						stageprops[i].set('xe', stageprops[i].get('resources')[3]);
						stageprops[i].set('sf', stageprops[i].get('resources')[4]);
						stageprops[i].delete('resources');
						
						if (stageprops[i].get('lf').value == '') {
							stageprops[i].set('lf', parseFloat(stageprops[i].get('lf').placeholder));
						} else {
							stageprops[i].set('lf', parseFloat(stageprops[i].get('lf').value));
						}
						if (stageprops[i].get('ox').value == '') {
							stageprops[i].set('ox', parseFloat(stageprops[i].get('ox').placeholder));
						} else {
							stageprops[i].set('ox', parseFloat(stageprops[i].get('ox').value));
						}
						if (stageprops[i].get('mp').value == '') {
							stageprops[i].set('mp', parseFloat(stageprops[i].get('mp').placeholder));
						} else {
							stageprops[i].set('mp', parseFloat(stageprops[i].get('mp').value));
						}
						if (stageprops[i].get('xe').value == '') {
							stageprops[i].set('xe', parseFloat(stageprops[i].get('xe').placeholder));
						} else {
							stageprops[i].set('xe', parseFloat(stageprops[i].get('xe').value));
						}
						if (stageprops[i].get('sf').value == '') {
							stageprops[i].set('sf', parseFloat(stageprops[i].get('sf').placeholder));
						} else {
							stageprops[i].set('sf', parseFloat(stageprops[i].get('sf').value));
						}
					}
					if (elem.children.length == 1) {
						if (stageprops[i].get(stagepropmap.get(j))[0].nodeName == 'INPUT') {
							if (stageprops[i].get(stagepropmap.get(j))[0].value == "") {
								stageprops[i].set(stagepropmap.get(j),parseFloat(stageprops[i].get(stagepropmap.get(j))[0].placeholder));
							} else {
								stageprops[i].set(stagepropmap.get(j),parseFloat(stageprops[i].get(stagepropmap.get(j))[0].value));
							}
						}
					}
					//console.log(elem.innerHTML, elem.children, i, stagepropmap.get(j));
				}
			}
		}
		stageprops[i].set('engines', stageprops[i].get('engines')[0].children[0]);
		if (stageprops[i].get('engines') == undefined) {
			stageprops[i].set('engines', []);
		} else {
			var newengines = [];
			for (var j = 0; j < stageprops[i].get('engines').children.length; j++) {
				newengines[j] = stageprops[i].get('engines').children[j].children[0].children[1].children;

				newengines[j] = [newengines[j][0], newengines[j][1]];

				if (newengines[j][0].value == '') {
					newengines[j][0] = parseFloat(newengines[j][0].placeholder);
				} else {
					newengines[j][0] = parseFloat(newengines[j][0].value);
				}
				newengines[j][1] = enginemap.get(newengines[j][1].value);		
			}
			stageprops[i].set('engines', newengines);
		}
	}
	return stageprops;
}

function getStageConsumption(alt, speed, stageindex) { //Use stageprops.
	var stage = stageprops[stageindex];
	var engines = stage.get('engines');

	var out = [0,0,0,0,0,0];

	for (var i = 0; i < engines.length; i++) {
		var consump = engines[i][1].getConsumption(alt, speed, engines[i][0]);
		for (var j = 0; j < 6; j++) {
			out[j] += consump[j];
		}
	}
	return out;
}

function magnitude(pos) {
	return Math.sqrt(pos[0]*pos[0]+pos[1]*pos[1]+pos[2]*pos[2]);
}

function dragFace(normal, v) {
	var dot = normal[0]*v[0] + normal[1]*v[1] + normal[2]*v[2];

	var dot = dot/(magnitude(normal)*magnitude(v));

	var frontMult = dot;
	var rearMult = dot;
	var sideMult = Math.sqrt(1-dot*dot);

	var frontDrag = 0;
	var rearDrag = 0;
	var sideDrag = 0;

	return frontDrag*frontMult + rearDrag*rearMult + sideDrag*sideMult;
}

function simulate(code, ts, init, initVel) {
	var currPos = init;
	var prevPos = [currPos[0] - initVel[0]*ts,currPos[1] - initVel[1]*ts,currPos[2] - initVel[2]*ts];

	var t = 0;
	var currStage = 0;
	var resources = [stageprops[0].get('lf'), stageprops[0].get('ox'), stageprops[0].get('mp'), stageprops[0].get('xe'), stageprops[0].get('sf')];
	var fuelmass = resources[0]*5 + resources[1]*5 + resources[2]*4 + resources[3]*0.1 + resources[4]*7.5;
	var drymass = stageprops[0].get('mass')*1000 - fuelmass;

	var dv = 0;

	while (t < 10000) {
		var orbv = [(currPos[0]-prevPos[0])/ts,(currPos[1]-prevPos[1])/ts,(currPos[2]-prevPos[2])/ts];
		//Get rotation velocity
		var radVel = 2*Math.PI/bodyprops.get('rotationPeriod');
		var surfv = [-currPos[2]*radVel,currPos[0]*radVel,0];
		var v = [orbv[0]-surfv[0],orbv[1]-surfv[1],orbv[2]-surfv[2]];

		var alt = magnitude(currPos) - bodyprops.get('radius');

		var craftState = getRocketState(t, code);
		var craftDir = craftState[0];

		var gravMag = 6.67408e-11*bodyprops.get('mass')/Math.pow(magnitude(currPos),3);

		acc = [-gravMag*currPos[0],-gravMag*currPos[1],-gravMag*currPos[2]];

		//Drag
		var drag = 0;
		acc = [acc[0]-drag*v[0], acc[1]-drag*v[1], acc[2]-drag*v[2]];
		
		//Stage handling
		var engines = stageprops[currStage].get('engines');
		var thrust = 0;
		for (var i = 0; i < engines.length; i++) {
			var consump = engines[i][1].getConsumption(alt, magnitude(v), engines[i][0]*craftState[1]);

			var activate = true;
			for (var j = 0; j < resources.length; j++) {
				if ((consump[j+1] > 0) && (resources[j] == 0)) {
					activate = false;
				}
			}
			if (activate) {
				for (var j = 0; j < resources.length; j++) {
					resources[j] -= consump[j+1]*ts;
				}
				thrust += consump[0];
			}
		}
		for (var i = 0; i < resources.length; i++) {
			if (resources[i] < 0) {
				resources[i] = 0;
			}
		}
		var mass = drymass + resources[0]*5 + resources[1]*5 + resources[2]*4 + resources[3]*0.1 + resources[4]*7.5;
		var engineAcc = thrust/mass;
		acc = [acc[0]+craftDir[0]*engineAcc, acc[1]+craftDir[1]*engineAcc, acc[2]+craftDir[2]*engineAcc];
		//Verlet
		var newPos = [currPos[0]+ts*(orbv[0]+ts*acc[0]), currPos[1]+ts*(orbv[1]+ts*acc[1]), currPos[2]+ts*(orbv[2]+ts*acc[2])];

		prevPos = currPos;
		currPos = newPos;

		//console.log(currPos, orbv, magnitude(orbv));

		if (resources == [0,0,0,0,0]) {
			//Stage
			if (currStage + 1 < stageprops.length) {
				currStage += 1;
				//Get stage props
				resources = [stageprops[currStage].get('lf'), stageprops[currStage].get('ox'), stageprops[currStage].get('mp'), stageprops[currStage].get('xe'), stageprops[currStage].get('sf')];
				fuelmass = resources[0]*5 + resources[1]*5 + resources[2]*4 + resources[3]*0.1 + resources[4]*7.5;
				drymass = stageprops[currStage].get('mass')*1000 - fuelmass;
			}
		}

		t += ts;
	}
}

//Simulation test
function test() {
	var initTime = performance.now();
	var c = [new Instruction()];
	c[0].t = 0;
	c[0].throttle = 0;
	c[0].dir = [0,0,1];

	stageprops = [new Map([
		['mass', 1000],
		['lf', 50],
		['ox', 61],
		['mp', 0],
		['xe', 0],
		['sf', 0],
		['wingarea', 0],
		['wingaoa', 0],
		['frontarea', 1],
		['sidearea', 1],
		['toparea', 1],
		['bottomarea', 1],
		['backarea', 1],
		['frontwdrg', 0.2],
		['sidewdrg', 0.2],
		['topwdrg', 0.2],
		['bottomwdrg', 0.2],
		['backwdrg', 0.2],
		['engines', [[5, enginemap.get('Ant')]]]
	])];

	simulate(c, 3, [0,0,261600000], [-70000,0,0]);
	console.log(performance.now()-initTime);
}

function optimize() { //Main optimization function
	getStages();

	console.log(stageprops);
}
