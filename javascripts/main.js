//Main js file

//Render planet display
function renderStars(time) {
	propwidth = prop2_display.width;
	prop2_display.height = 0.7*propwidth;
	propheight = prop2_display.height;

	prop2.beginPath();
	prop2.fillStyle = '#4080FF';
	for (var i = 0; i < starX.length; i++) {
		prop2.beginPath();
		prop2.arc(propwidth*starX[i], propheight*starY[i], (starSize[i]*(0.8+0.4*Math.sin(starPhase[i]+time/1000)))*Math.min(propwidth, propheight), 0, 2*Math.PI, false);
		prop2.fill();
	}
	prop2.fill();
}

function renderBody() {
	propwidth = prop2_display.width;
	propheight = prop2_display.height;
	var bottomratio = 1;
	if (bodyprops.has('pressCurve')) {
		bottomratio = bodyprops.get('radius')/(bodyprops.get('radius')+bodyprops.get('pressCurve').keys.at(-1).x);
	}

	var atmoDetail = 4;

	if (bodyprops.has('enabled')) {
		if (bodyprops.has('invWaveLength')) {
			var inv = bodyprops.get('invWaveLength');
			var v = 255/Math.min(inv[0],inv[1],inv[2]);

			for (var i = 0; i < 0.99999999999; i+=1/atmoDetail) {
				var cm = i+0.5/atmoDetail;

				prop2.fillStyle = 'rgb('+cm*v*inv[0]+' '+cm*v*inv[1]+' '+cm*v*inv[2]+')';
				prop2.beginPath();
				prop2.arc(propwidth/2, propheight/2, 0.5*Math.min(propwidth, propheight)*(1-(1-bottomratio)*i), 0, 2*Math.PI, false);
				prop2.fill();
			}
		} else {
			for (var i = 0; i < 0.99999999999; i+=1/atmoDetail) {
				prop2.fillStyle = rgbString(255*i,255*i,255*i);
				prop2.beginPath();
				prop2.arc(propwidth/2, propheight/2, 0.5*Math.min(propwidth, propheight)*(1-(1-bottomratio)*i), 0, 2*Math.PI, false);
				prop2.fill();
			}
		}
	}

	prop2.lineCap = 'round';
	
	if (!(bodyprops.has('components'))) {
		if (bodyprops.has('invWaveLength')) {
			var inv = bodyprops.get('invWaveLength');
			var v = 255/Math.max(inv[0],inv[1],inv[2]);

			bodyprops.set('components',[[[inv[0]*v,inv[1]*v,inv[2]*v],0]]);
		} else {
			bodyprops.set('components',[[[255,255,255],0]]);
		}
	}
	var avgColor = bodyprops.get('components')[0].at(-2);
	if (bodyprops.get('components').length > 1) {
		var avgColor2 = bodyprops.get('components')[1].at(-2);
	} else {
		var avgColor2 = [avgColor[0]*0.6,avgColor[1]*0.6,avgColor[2]*0.6];
	}
	prop2.fillStyle=rgbString(avgColor[0],avgColor[1],avgColor[2]);
	prop2.beginPath();
	prop2.arc(propwidth/2, propheight/2, 0.5*Math.min(propwidth, propheight)*bottomratio, 0, 2*Math.PI, false);
	prop2.fill();

	prop2.strokeStyle=rgbString(avgColor2[0],avgColor2[1],avgColor2[2]); //Make planet
	prop2.fillStyle=rgbString(avgColor2[0],avgColor2[1],avgColor2[2]);

	prop2.save();

	prop2.beginPath();
	prop2.arc(propwidth/2, propheight/2, 0.5*Math.min(propwidth, propheight)*bottomratio, 0, 2*Math.PI, false);
	prop2.closePath();

	prop2.clip();

	var cl=propwidth/2-bottomratio*propheight/2;
	var cw = propheight*bottomratio;

	prop2.lineWidth = 0.15*cw;
	prop2.beginPath();
	prop2.moveTo(cl+0.20*cw, 0.325*cw+(1-bottomratio)*0.5*propheight);
	prop2.lineTo(cl+0.70*cw, 0.325*cw+(1-bottomratio)*0.5*propheight);
	prop2.stroke();

	prop2.lineWidth = 0.075*cw;
	prop2.beginPath();
	prop2.moveTo(cl+0.40*cw, 0.475*cw+(1-bottomratio)*0.5*propheight);
	prop2.lineTo(cl+0.65*cw, 0.475*cw+(1-bottomratio)*0.5*propheight);
	prop2.stroke();

	prop2.lineWidth = 0.1*cw;
	prop2.beginPath();
	prop2.moveTo(cl+0.20*cw, 0.75*cw+(1-bottomratio)*0.5*propheight);
	prop2.lineTo(cl+0.4*cw, 0.75*cw+(1-bottomratio)*0.5*propheight);
	prop2.stroke();

	prop2.fillRect(cl+0.50*cw, 0.3*cw+(1-bottomratio)*0.5*propheight, 0.1*cw, 0.2*cw);
	prop2.fillStyle=rgbString(avgColor[0],avgColor[1],avgColor[2]);
	prop2.beginPath();
	prop2.arc(cl+0.50*cw, 0.41875*cw+(1-bottomratio)*0.5*propheight, 0.01875*cw, 0, 2*Math.PI, false);
	prop2.arc(cl+0.60*cw, 0.41875*cw+(1-bottomratio)*0.5*propheight, 0.01875*cw, 0, 2*Math.PI, false);
	prop2.fill();

	prop2.restore();

	prop2.beginPath();
	prop2.arc(propwidth/2, propheight/2, 0.5*Math.min(propwidth, propheight), 0, 2*Math.PI, false);
	prop2.closePath();

	prop2.clip();

	if (!bodyprops.has('st') || bodyprops.get('st') < 1000) {
		prop2.fillStyle = 'rgba(0,0,0,.7)';
		prop2.fillRect(propwidth/2, 0, propwidth/2, propheight);
	}

	prop2.restore();
}

interpretcfg(`@Kopernicus:NEEDS[!Kopernicus]
{
	Body
	{
		name = Sun
		barycenter = False
		identifier = Squad/Sun
		implements = 
		finalizeOrbit = False
		randomMainMenuBody = False
		contractWeight = 30
		Properties
		{
			radius = 261600000
			geeASL = 1.74684656100137
			mass = 1.75654591319326E+28
			gravParameter = 1.17233279483249E+18
			rotates = True
			rotationPeriod = 432000
			tidallyLocked = False
			initialRotation = 0
			inverseRotThresholdAltitude = 600000
			albedo = 0
			emissivity = 0
			coreTemperatureOffset = 0
			timewarpAltitudeLimits = 0 3270000 3270000 6540000 1.308E+07 2.616E+07 5.232E+07 6.54E+07
			sphereOfInfluence = Infinity
			solarRotationPeriod = False
			navballSwitchRadiusMult = 0.06
			navballSwitchRadiusMultLow = 0.055
			nonExactThreshold = 0.05
			exactSearch = False
			useTheInName = True
			displayName = The Sun^N
			selectable = True
			RnDVisibility = Visible
			RnDRotation = True
			maxZoom = 60000
		}
		Atmosphere
		{
			enabled = True
			oxygen = False
			staticDensityASL = 0.00072492861572823
			adiabaticIndex = 1.42999994754791
			atmosphereDepth = 600000
			gasMassLapseRate = 0.465695397616382
			atmosphereMolarMass = 0.00219999998807907
			pressureCurveIsNormalized = False
			staticPressureASL = 16
			temperatureCurveIsNormalized = False
			temperatureLapseRate = 0.00973333333333333
			temperatureSeaLevel = 5840
			ambientColor = 0,0,0,0
			pressureCurve
			{
				key = 0 16 0 0
				key = 5000 8.3 -0.001532 -0.001532
				key = 10000 0.68 -0.001178053 -0.001178053
				key = 10753.09 0.300954 -2.96097E-05 -2.96097E-05
				key = 14194.01 0.2613179 -8.41565E-07 -8.41565E-07
				key = 350000 0.1 -7.49481E-07 -7.49481E-07
				key = 400000 0.04 -7.05211E-07 -7.05211E-07
				key = 590000 2E-05 -6.21053E-09 -6.21053E-09
				key = 600000 0 0 0
			}
			temperatureCurve
			{
				key = 0 5840 0 -0.2780258
				key = 10000 4465 -0.01447884 -0.01447884
				key = 50000 4000 -0.007179292 0.003853968
				key = 250000 5800 0.0009989792 0.0009989792
				key = 500000 6000 0.001352723 0.001352723
				key = 600000 10000 0.06371323 0
			}
		}
	}
}`);

//Get canvases
var trajcanvas = document.getElementById('traj');

console.log(trajcanvas);

//GL
trajgl = trajcanvas.getContext('webgl2');

console.log(trajgl);

//Animation
function animate(time) {
	//Render
	renderStars(time);
	if (bodyprops.size > 0) {
		renderBody();
	}

	trajgl.viewport(0,0,trajgl.canvas.width, trajgl.canvas.height);
	trajgl.clear(trajgl.COLOR_BUFFER_BIT | trajgl.DEPTH_BUFFER_BIT);
	trajgl.enable(trajgl.DEPTH_TEST);
	trajgl.clearColor(0,0,1,1);

	//Request next frame
	window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
