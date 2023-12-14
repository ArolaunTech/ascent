//.cfg reader script
var bodyprops = new Map();

var prop2_display = document.getElementById('planet-display');
var prop2 = prop2_display.getContext('2d');

function updatePropDisplay() {
	//Update the body display
	//Get HTML elements
	var prop_display = document.getElementById('prop-display');

	prop_display.innerHTML = '<img src="icons/weight.svg" alt="" height="14" style="margin-right:3px; display:inline;"/> Mass: '+bodyprops.get('mass').toExponential(6)+' kg<br><img src="icons/radius.svg" alt="" height="14" style="margin-right:3px; display:inline;"/> Radius: '+bodyprops.get('radius')/1000+' km<br><img src="icons/rot.svg" alt="" height="14" style="margin-right:3px; display:inline;"/> Rotational Period: ';
	if (bodyprops.get('rotates')) {
		prop_display.innerHTML = prop_display.innerHTML + +parseFloat(bodyprops.get('rotationPeriod').toFixed(2)) + ' s<br><img src="icons/up_arrow.svg" alt="" height="14" style="margin-right:3px; display:inline;"/> Navball Switch Altitude (UP): ';
	} else {
		prop_display.innerHTML = prop_display.innerHTML + 'Infinity s<br><img src="icons/up_arrow.svg" alt="" height="14" style="margin-right:3px; display:inline;"/> Navball Switch Altitude (UP): '
	}
	prop_display.innerHTML = prop_display.innerHTML + Math.round(bodyprops.get('navballSwitchRadiusMult')/10)/100 + 'km<br><img src="icons/down_arrow.svg" alt="" height="14" style="margin-right:3px; display:inline;"/> Navball Switch Altitude (DOWN): ';
	prop_display.innerHTML = prop_display.innerHTML + Math.round(bodyprops.get('navballSwitchRadiusMultLow')/10)/100 + 'km';
	
	if (bodyprops.has('densityCurve')) {
		updateFromFloatCurve(bodyprops.get('densityCurve'),100,densitychart,0);
		updateFromFloatCurve(bodyprops.get('pressCurve'),100,densitychart,1);
		updateFromFloatCurve(bodyprops.get('soundCurve'),100,soundchart,0);
	} else {
		var placeholderFloatCurve = new FloatCurve();
		placeholderFloatCurve.setAsConst(0,0,100000);
		updateFromFloatCurve(placeholderFloatCurve,1,densitychart,0);
		updateFromFloatCurve(placeholderFloatCurve,1,densitychart,1);
		updateFromFloatCurve(placeholderFloatCurve,1,soundchart,0);
	}
}

function interpretcfg(text) { //Takes cfg text and interprets it.
	//Basic filters - newlines, tabs, brackets
	var te = text.replaceAll('\t','');
	te = te.replaceAll('{','\t{\t');
	te = te.replaceAll('}','\t}\t')
	var tel = te.split(/[\t\n]/);

	for (var i = 0; i < tel.length; i++) { //Comments
		if (tel[i].includes('//')) {
			tel[i] = tel[i].substr(0, tel[i].indexOf('//')).trim();
		} else {
			tel[i] = tel[i].trim();
		}
	}
	tel = tel.filter(tel => tel.length>0); //Remove empty strings

	//Groups
	var stack = [[]];
	for (var i=0; i < tel.length; i++) {
		if (tel[i] == '}') {
			var newarr = stack.pop();
			stack[stack.length-1].push(newarr);
		} else if (tel[i] == '{') {
			stack.push([]);
		} else {
			stack[stack.length-1].push(tel[i]);
		}
	}

	console.log(stack);
	while (stack.length < 3) {
		if (stack.length == 1) {
			stack = stack[0];
		} else {
			stack = stack[1];
		}
	}
	console.log(stack);

	if ((typeof stack[2]) == 'string') {
		if ((stack[2].substr(0, 10) == 'Kopernicus') || (stack[2].substr(1,10) == 'Kopernicus')) {
			stack = stack[1];
		}
	}

	if (stack.includes('Body')) {
		stack = stack[stack.indexOf('Body')+1];
	}
	console.log(stack);

	while (stack.length < 3) {
		if (stack.length == 1) {
			stack = stack[0];
		} else {
			stack = stack[1];
		}
	}
	console.log(stack);

	var removeNodes = ['Debug','PQS','Orbit','ScaledVersion','Ocean','Rings','HazardousBody','SpaceCenter','PostSpawnOrbit'];
	var l = removeNodes.length
	for (var i = 0; i < l; i++) {
		removeNodes.push('%'+removeNodes[i]);
		removeNodes.push('@'+removeNodes[i]);
		removeNodes.push('!'+removeNodes[i]);
	}
	for (var i = 0; i < removeNodes.length; i++) {
		if (stack.includes(removeNodes[i])) {
			ind = stack.indexOf(removeNodes[i]);
			stack.splice(ind,2);
		}
	}
	if (stack.includes('Properties') || stack.includes('%Properties') || stack.includes('@Properties')) {
		var stackpropertyindex = stack.indexOf('Properties')+1;
		if (stackpropertyindex == 0) {
			stackpropertyindex = stack.indexOf('%Properties')+1;
		}
		if (stackpropertyindex == 0) {
			stackpropertyindex = stack.indexOf('@Properties')+1;
		}
		var removeproperties = ['ScienceValues'];

		var l = removeproperties.length
		for (var i = 0; i < l; i++) {
			removeproperties.push('%'+removeproperties[i]);
			removeproperties.push('@'+removeproperties[i]);
		}

		for (var i = 0; i < removeproperties.length; i++) {
			if (stack[stackpropertyindex].includes(removeproperties[i])) {
				ind = stack[stackpropertyindex].indexOf(removeproperties[i]);
				stack[stackpropertyindex].splice(ind,2);
			}
		}
		if (stack[stackpropertyindex].includes('Biomes')) {
			stack[stackpropertyindex] = stack[stackpropertyindex].concat(stack[stackpropertyindex][stack[stackpropertyindex].indexOf('Biomes')+1]);
			stack[stackpropertyindex].splice(stack[stackpropertyindex].indexOf('Biomes'),2);
		}
		stack = stack.concat(stack[stackpropertyindex]);
		stack.splice(stackpropertyindex-1,2);
	}

	var biomecolors = [];
	for (var i = 0; i < stack.length; i++) {
		if ((typeof stack[i]) == 'object') {
			for (var j = 0; j < stack[i].length; j++) {
				if (((typeof stack[i][j]) == 'string') && (stack[i][j].substr(0,5) == 'color')) {
					biomecolors.push(rgbFromString(stack[i][j].split('=')[1].trim()));
				}
			}
		}
	}

	if (biomecolors.length>0) {
		var biomeGraph = [];
		var biomeGraph2 = [];

		var maxDist = 30000;

		for (var i = 0; i < biomecolors.length; i++) {
			biomeGraph.push([]);
			biomeGraph2.push([]);
			for (var j = 0; j < biomecolors.length; j++) {
				biomeGraph[biomeGraph.length-1].push(determineSimilar(biomecolors[i][0],biomecolors[i][1],biomecolors[i][2],biomecolors[j][0],biomecolors[j][1],biomecolors[j][2],maxDist));
				biomeGraph2[biomeGraph2.length-1].push(colorDist(biomecolors[i][0],biomecolors[i][1],biomecolors[i][2],biomecolors[j][0],biomecolors[j][1],biomecolors[j][2]));
			}
		}

		var components = determineConnectedComponents(biomeGraph);
		for (var i = 0; i < components.length; i++) {
			var totalRed = 0;
			var totalGreen = 0;
			var totalBlue = 0;
			for (var j = 0; j < components[i].length; j++) {
				var rgbc = biomecolors[components[i][j]];
				totalRed += rgbc[0];
				totalGreen += rgbc[1];
				totalBlue += rgbc[2];
			}
			totalRed /= components[i].length;
			totalGreen /= components[i].length;
			totalBlue /= components[i].length;
			components[i].push([totalRed, totalGreen, totalBlue]);
			components[i].push(lum(totalRed, totalGreen, totalBlue));
		}

		components.sort(comparenum);

		console.log(biomeGraph, biomeGraph2);
		console.log(components);
	}

	if (stack.includes('Atmosphere') || stack.includes('%Atmosphere') || stack.includes('@Atmosphere')) {
		var stackpropertyindex = stack.indexOf('Atmosphere')+1;
		if (stackpropertyindex == 0) {
			stackpropertyindex = stack.indexOf('%Atmosphere')+1;
		}
		if (stackpropertyindex == 0) {
			stackpropertyindex = stack.indexOf('@Atmosphere')+1;
		}
		var removeproperties = ['temperatureSunMultCurve', 'temperatureLatitudeBiasCurve', 'temperatureLatitudeSunMultCurve', 'temperatureAxialSunBiasCurve', 'temperatureEccentricityBiasCurve', 'temperatureAxialSunMultCurve', 'temperatureLatitudeSunBiasCurve'];
		for (var i = 0; i < removeproperties.length; i++) {
			if (stack[stackpropertyindex].includes(removeproperties[i])) {
				ind = stack[stackpropertyindex].indexOf(removeproperties[i]);
				stack[stackpropertyindex].splice(ind,2);
			}
		}
		stack = stack.concat(stack[stackpropertyindex]);
		stack.splice(stackpropertyindex-1,2);
	}

	if (stack.includes('Orbit') || stack.includes('%Orbit') || stack.includes('@Orbit')) {
		var stackpropertyindex = stack.indexOf('Orbit')+1;
		if (stackpropertyindex == 0) {
			stackpropertyindex = stack.indexOf('%Orbit')+1;
		}
		if (stackpropertyindex == 0) {
			stackpropertyindex = stack.indexOf('@Orbit')+1;
		}
		stack = stack.concat(stack[stackpropertyindex]);
		stack.splice(stackpropertyindex-1,2);
	}

	for (var i = 0; i < stack.length; i++) {
		if (!(stack[i].includes('='))) {
			continue;
		}
		var pair = stack[i].split('=');
		pair[0] = pair[0].trim();
		pair[1] = pair[1].trim();
		if (['True', 'true'].includes(pair[1])) {
			pair[1] = true;
		} else if (['False', 'false'].includes(pair[1])) {
			pair[1] = false;
		} else {
			if (!(isNaN(pair[1]))) {
				pair[1] = parseFloat(pair[1]);
			}
		}
		stack[i] = pair;
	}

	var allowedFields = [
		'name', 'removeAtmosphere', 'radius', 'mass', 'gravParameter', 'geeASL',
		'rotates', 'rotationPeriod', 'initialRotation',
		'navballSwitchRadiusMult', 'navballSwitchRadiusMultLow', 'enabled', 'oxygen', 'static',
		'atmosphereDepth', 'maxAltitude', 'altitude', 'atmosphereMolarMass', 'pressure', 
		'temperature', 'key', 'adiabatic', 'waveLength', 'invWaveLength', 'lightColor'
	];

	if (stack.includes('AtmosphereFromGround')) {
		for (var i=0; i < stack[stack.indexOf('AtmosphereFromGround')+1].length; i++) {
			var pair = stack[stack.indexOf('AtmosphereFromGround')+1][i];
			var pairsplit = pair.split('=');
			pairsplit[0] = pairsplit[0].trim();
			pairsplit[1] = pairsplit[1].trim();
			stack.push(pairsplit);
		}
		stack.splice(stack.indexOf('AtmosphereFromGround'),2);
	}

	var l = allowedFields.length
	for (var i = 0; i < l; i++) {
		allowedFields.push('%'+allowedFields[i]);
		allowedFields.push('@'+allowedFields[i]);
	}

	console.log(stack);
	for (var i = 0; i < stack.length; i++) {
		if ((typeof stack[i]) != 'object') {
			continue;
		}
		var found = false;
		for (var j = 0; j < allowedFields.length; j++) {
			if (stack[i].length > 0) {
				if (stack[i][0].substr(0, allowedFields[j].length) == allowedFields[j]) {
					found = true;
				}
			}
		}
		if (!found) {
			stack.splice(i, 1);
			i--;
		}
	}

	console.log(stack);
	//Filtering done, now simplify computer-readable data

	if (stack.includes('Template') || stack.includes('%Template') || stack.includes('@Template')) {
		var ind = stack.indexOf('Template')+1;
		if (ind == 0) {
			ind = stack.indexOf('%Template')+1;
		}
		if (ind == 0) {
			ind = stack.indexOf('@Template')+1;
		}
		stack[ind][0] = stack[ind][0].split('=');
		stack[ind][0][0] = 'template';
		stack[ind][0][1] = stack[ind][0][1].trim();

		var templatebody = stockbodies.get(stack[ind][0][1]);
		console.log(templatebody);

		for (var i = 1; i < stack[ind].length; i++) {
			var pair = stack[ind][i].split('=');
			pair[0] = pair[0].trim();
			pair[1] = pair[1].trim();
			stack[ind][i] = pair;
		}

		stack = stack.concat(stack[ind]);

		stack.splice(ind-1, 2);
	}

	console.log(stack);
	//Set to map
	var objmap = new Map();
	for (var i = 0; i < stack.length; i++) {
		if ((typeof stack[i]) != 'object') {
			var k = stack[i];
			if (['%','@'].includes(k[0])) {
				k = k.substr(1);
			}
			objmap.set(k, stack[i+1]);
			i++;
		} else {
			var k = stack[i][0];
			if (['%','@'].includes(k[0])) {
				k = k.substr(1);
			}
			objmap.set(k, stack[i][1]);
		}
	}

	if (biomecolors.length > 0) {
		objmap.set('components', components);
		objmap.set('biomecolors', biomecolors);
	}

	//Determine mass and radius
	var objm = -1;
	var objr = -1;
	if (objmap.has('mass')) {
		objm = objmap.get('mass');
	} else if (objmap.has('gravParameter')) {
		objm = objmap.get('gravParameter') / 6.67408e-11;
	}
	if (objmap.has('radius')) {
		objr = objmap.get('radius');
	}
	if (objmap.has('geeASL')) {
		var sg = 9.80665 * objmap.get('geeASL');
		if (objm == -1) {
			objm = sg*objr*objr/6.67408e-11;
		} else if (objr == -1) {
			objr = Math.sqrt(6.67408e-11 * objm/sg);
		}
	}

	if (objm == -1) {
		objm = templatebody.mass;
	}
	if (objr == -1) {
		objr = templatebody.radius;
	}

	objmap.set('mass', objm);
	objmap.set('radius', objr);
	objmap.delete('gravParameter');
	objmap.delete('geeASL');

	//Navball Switch
	if (objmap.has('navballSwitchRadiusMult')) {
		objmap.set('navballSwitchRadiusMult', objr*objmap.get('navballSwitchRadiusMult'));
	} else {
		objmap.set('navballSwitchRadiusMult', 0.06*objr);
	}
	if (objmap.has('navballSwitchRadiusMultLow')) {
		objmap.set('navballSwitchRadiusMultLow', objr*objmap.get('navballSwitchRadiusMultLow'));
	} else {
		objmap.set('navballSwitchRadiusMultLow', 0.055*objr);
	}

	//Rotational period is solved, so atmospheric curves
	//Find if object has atmo, not all objects do
	var hasAtmo = objmap.has('enabled');
	//Find if has curves
	var hasPress = objmap.has('pressureCurve');
	var hasTemp = objmap.has('temperatureCurve');

	if (objmap.has('maxAltitude')) {
		objmap.set('altitude', objmap.get('maxAltitude'));
	}

	if (objmap.has('atmosphereDepth')) {
		objmap.set('altitude', objmap.get('atmosphereDepth'));
	}

	if (hasAtmo) {
		var maxAlt = objmap.get('altitude');
		if (objmap.get('pressureCurveisNormalized')) {
			var pressureCurve = objmap.get('pressureCurve');
			for (var i = 0; i < pressureCurve.keys.length; i++) {
				pressureCurve.keys[i].x *= maxAlt;
				pressureCurve.keys[i].dxl /= maxAlt;
				pressureCurve.keys[i].dxr /= maxAlt;
			}
		}
		if (objmap.get('temperatureCurveisNormalized')) {
			var temperatureCurve = objmap.get('temperatureCurve');
			for (var i = 0; i < temperatureCurve.keys.length; i++) {
				temperatureCurve.keys[i].x *= maxAlt;
				temperatureCurve.keys[i].dxl /= maxAlt;
				temperatureCurve.keys[i].dxr /= maxAlt;
			}
		}
	}

	if (hasAtmo) {
		if (hasTemp && hasPress) {
			//Read curves from string to key form
			var stringPress = objmap.get('pressureCurve');
			var stringTemp = objmap.get('temperatureCurve');
			var curvepress = new FloatCurve([]);
			var curvetemp = new FloatCurve([]);

			curvepress.setFromKeyList(stringPress);
			curvetemp.setFromKeyList(stringTemp);

			curvepress.fixDerivatives();
			curvetemp.fixDerivatives();

			objmap.set('pressureCurve', curvepress);
			objmap.set('temperatureCurve', curvetemp);
		} else {
			//Determine curves (ATMOSPHERIC BODIES ONLY)
			console.log('determineCurves');
			var curvePress = new FloatCurve([]);
			curvePress.keys = [];

			var curveTemp = new FloatCurve([]);

			var atmoHeight = objmap.get('altitude');

			//Constant temperature curve
			curveTemp.setAsConst(objmap.get('temperatureSeaLevel'),0,atmoHeight);

			var scaleHeight = (8.315*objmap.get('temperatureSeaLevel')*Math.pow(objmap.get('radius'),2))/(6.67408e-11*objmap.get('mass')*objmap.get('atmosphereMolarMass'));

			//Calculate pressure
			var alts = [];
			var presses = [];
			var altd = atmoHeight/50;
			if (objmap.has('staticPressureASL')) {
				var aslP = objmap.get('staticPressureASL');
			} else {
				var aslP = objmap.get('staticDensityASL')*8.315*objmap.get('temperatureSeaLevel')/objmap.get('atmosphereMolarMass');
			}

			for (var i = 0; i <= atmoHeight; i += altd) {
				alts.push(i);
				presses.push(aslP*Math.exp(-i/scaleHeight));
			}

			var dxes = [0];

			for (var i = 1; i < alts.length; i++) {
				dxes.push((presses[i]-presses[i-1])/(alts[i]-alts[i-1]));
			}

			for (var i = 0; i < alts.length; i++) {
				curvePress.keys.push(new Key(alts[i], presses[i], dxes[i], dxes[i]));
			}
			curvePress.keys[0].dxl = 0;
			curvePress.keys[curvePress.keys.length-1].dxr = 0;

			objmap.set('pressureCurve', curvePress);
			objmap.set('temperatureCurve', curveTemp);
		}
	}

	if (hasAtmo) {
		objmap.set('st',objmap.get('temperatureCurve').valueAt(0)[0]);
	}
	
	//Find density curves, as they matter more than pressure curves. Treating atmosphere as an ideal gas (which is how it seems to work in KSP)
	if (hasAtmo) {
		var amm = objmap.get('atmosphereMolarMass');
		var pressureCurve = objmap.get('pressureCurve');

		var newPress = new FloatCurve();
		objmap.set('pressCurve', Object.assign(newPress,structuredClone(objmap.get('pressureCurve'))));

		var temperatureCurve = objmap.get('temperatureCurve');

		for (var i = 0; i < pressureCurve.keys.length; i++) {
			var temps = temperatureCurve.valueAt(pressureCurve.keys[i].x);
			//Calculate density
			pressureCurve.keys[i].y *= amm/(8.315*temps[0]);
			//Density derivative using product and chain rule
			pressureCurve.keys[i].dx = pressureCurve.keys[i].dx*amm/(8.315*temps[0]) - pressureCurve.keys[i].y*amm*temps[1]/(Math.pow(temps[0],2)*8.315);
		}

		for (var i = 0; i < pressureCurve.keys.length; i++) {
			//Calculate density
			pressureCurve.keys[i].y *= 1000;
			pressureCurve.keys[i].dx *= 1000;
		}

		objmap.set('densityCurve', objmap.get('pressureCurve'));
		objmap.delete('pressureCurve');

		//Find speed of sound, will use to replace temperature curves.
		var ssmult = Math.sqrt(objmap.get('adiabaticIndex')*8.315/amm);
		console.log(ssmult);

		for (var i = 0; i < temperatureCurve.keys.length; i++) {
			temperatureCurve.keys[i].dx *= 0.5*ssmult/Math.sqrt(temperatureCurve.keys[i].y);
			temperatureCurve.keys[i].y = ssmult*Math.sqrt(temperatureCurve.keys[i].y);
		}

		objmap.set('soundCurve', objmap.get('temperatureCurve'));
		objmap.delete('temperatureCurve');
	}

	if (!(objmap.has('rotates'))) {
		objmap.set('rotates', true);
	}

	if (objmap.has('lightColor')) {
		objmap.set('waveLength',objmap.get('lightColor'));
	}

	if (objmap.has('waveLength')) {
		var wavelength = objmap.get('waveLength').split(',');
		var invwavelength = [0,0,0];
		for (var i = 0; i < 4; i++) {
			wavelength[i] = parseFloat(wavelength[i]);
			invwavelength[i] = Math.pow(wavelength[i],-4);
		}
		objmap.set('invWaveLength', invwavelength);
	} else if (objmap.has('invWaveLength')) {
		var wavelength = objmap.get('waveLength').split(',');
		for (var i = 0; i < 4; i++) {
			wavelength[i] = parseFloat(wavelength[i]);
		}
		objmap.set('invWaveLength', wavelength);
	}

	objmap.delete('staticPressureASL');
	objmap.delete('staticDensityASL');
	objmap.delete('pressureCurveIsNormalized');
	objmap.delete('temperatureCurveIsNormalized');
	objmap.delete('adiabaticIndex');
	objmap.delete('atmosphereDepth');
	objmap.delete('maxAltitude');
	objmap.delete('temperatureLapseRate');
	objmap.delete('temperatureSeaLevel');
	objmap.delete('atmosphereMolarMass');
	objmap.delete('altitude');
	objmap.delete('removePQSMods');
	objmap.delete('template');
	objmap.delete('name');
	objmap.delete('waveLength');
	objmap.delete('lightColor');

	if (!(objmap.has('rotationPeriod'))) {
		objmap.set('rotationPeriod', templatebody.rotationPeriod);
	}

	console.log(stack, objmap);

	bodyprops = objmap;

	updatePropDisplay();
}

function readandinterpretcfg(cfg) { //Takes cfg file and interprets it.
	cfg.text().then(interpretcfg);
}
