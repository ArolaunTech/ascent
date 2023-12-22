class Engine { //Generic engine class
	constructor(velocityThrustMultCurve, thrustCurve, LFCurve, OXCurve, MPCurve, XECurve, SFCurve, requireOxygen) {
		this.vTMC = velocityThrustMultCurve; 
		this.tC = thrustCurve;
		this.LFC = LFCurve;
		this.OXC = OXCurve;
		this.MPC = MPCurve;
		this.XEC = XECurve;
		this.SFC = SFCurve;
		this.rO = requireOxygen;
	}

	getConsumption(alt, speed, mult) { //[Thrust, LF, OX, MP, XE, SF]/second
		var p = bodyprops.get('pressCurve').valueAt(alt)[0]*1000;
		var s = bodyprops.get('soundCurve').valueAt(alt)[0];
		var mach = speed/s;

		var vm = this.vTMC.valueAt(mach)[0];

		if (this.rO) {
			if (!(bodyprops.has('oxygen'))) {
				return [0, 0, 0, 0, 0, 0];
			}
			if (!(bodyprops.get('oxygen'))) {
				return [0, 0, 0, 0, 0, 0];
			}
		}
		return [mult*vm*this.tC.valueAt(p)[0], mult*vm*this.LFC.valueAt(p)[0], mult*vm*this.OXC.valueAt(p)[0], mult*vm*this.MPC.valueAt(p)[0], mult*vm*this.XEC.valueAt(p)[0], mult*vm*this.SFC.valueAt(p)[0]];
	}
}

function getX(y, x1, y1, x2, y2) { //Inverse of a line
	return x1 + (y-y1)*(x2-x1)/(y2-y1);
}

function straightCurve(min, max, x1, y1, x2, y2) {
	var out = new FloatCurve();
	out.keys = [];
	out.keys.push(new Key(getX(min,x1,y1,x2,y2),min,(y2-y1)/(x2-x1), (y2-y1)/(x2-x1)));
	out.keys.push(new Key(getX(max,x1,y1,x2,y2),max,(y2-y1)/(x2-x1), (y2-y1)/(x2-x1)));
	out.keys.sort(comparekey);
	return out;
}

function constCurve(val, min, max) {
	var out = new FloatCurve();
	out.keys = [];
	out.keys.push(new Key(min, val, 0, 0));
	out.keys.push(new Key(max, val, 0, 0));
	out.keys.sort(comparekey);
	return out;
}

function rocket(lf, ox, mp, xe, sf, vacthrust, atmthrust) {
	return new Engine(
		constCurve(1, 0, 1e+12), 
		straightCurve(0, vacthrust, 0, vacthrust, 101325, atmthrust), 
		constCurve(lf, 0, 1e+12), 
		constCurve(ox, 0, 1e+12), 
		constCurve(mp, 0, 1e+12), 
		constCurve(xe, 0, 1e+12), 
		constCurve(sf, 0, 1e+12), 
		false
	);
}

function jet(isp, thrustCurve, velocityThrustMultCurve, stationaryThrust) {
	var multISP = 1/(5*9.80665*isp);

	var rThrust = new FloatCurve();
	rThrust.keys = [];
	for (var i = 0; i < thrustCurve.keys.length; i++) {
		rThrust.keys.push(new Key(thrustCurve.keys[i].x, stationaryThrust*thrustCurve.keys[i].y, stationaryThrust*thrustCurve.keys[i].dx));
	}

	var lfCurve = new FloatCurve();
	lfCurve.keys = [];
	for (var i = 0; i < thrustCurve.keys.length; i++) {
		lfCurve.keys.push(new Key(rThrust.keys[i].x, multISP*rThrust.keys[i].y, multISP*rThrust.keys[i].dx));
	}

	return new Engine(
		velocityThrustMultCurve, 
		rThrust, 
		lfCurve, 
		constCurve(0, 0, 1e+12), 
		constCurve(0, 0, 1e+12), 
		constCurve(0, 0, 1e+12), 
		constCurve(0, 0, 1e+12), 
		true
	);
}
//Juno
var junoVTMC = new FloatCurve();
junoVTMC.keys = [new Key(0, 1, 0), new Key(0.44, 0.897, 0), new Key(1, 1, 0.1988732), new Key(1.3, 1.03, 0), new Key(2, 0.68, -1.065708), new Key(2.4, 0, 0)];
var junoTC = new FloatCurve();
junoTC.keys = [new Key(0, 0, 0), new Key(0.072, 0.13, 2.075459), new Key(0.16, 0.28, 1.464173), new Key(0.42, 0.578, 0.93687), new Key(1, 1, 0.5529748), new Key(1e+12, 5.529748e+11, 0.5529748)];
for (var i = 0; i < junoTC.keys.length; i++) {
	junoTC.keys[i].x *= 101325;
	junoTC.keys[i].dx /= 101325;
}
//Wheesley
var wheesleyTC = new FloatCurve();
wheesleyTC.setFromKeyList([
	'key = 0 0 0 0', 'key = 0.1 0.1 1.276916 1.276916', 'key = 0.297 0.35 1.304143 1.304143',
	'key = 0.538 0.59 0.8485174 0.8485174', 'key = 1 1 0.8554117 0'
]);
wheesleyTC.keys.push(new Key(1e+12, 8.55e+11, 0.8554117));
for (var i = 0; i < wheesleyTC.keys.length; i++) {
	wheesleyTC.keys[i].x *= 101325;
	wheesleyTC.keys[i].dx /= 101325;
}
var wheesleyVTMC = new FloatCurve();
wheesleyVTMC.keys = [new Key(0, 1, 0), new Key(0.35, 0.96, 0), new Key(1.05, 1.2, 0.54), new Key(1.67, 1.7, 0), new Key(2.15, 1.1, -3.5), new Key(2.3, 0.5, -3.164), new Key(2.5, 0, 0)];
//Goliath
var goliathTC = new FloatCurve();
goliathTC.keys = [new Key(0, 0, 0.03), new Key(0.074, 0.0845, 1.4), new Key(0.2455, 0.2647, 0.9), new Key(1, 1, 1.1), new Key(1e+12, 1.1e+12, 1.1)];
for (var i = 0; i < goliathTC.keys.length; i++) {
	goliathTC.keys[i].x *= 101325;
	goliathTC.keys[i].dx /= 101325;
}
var goliathVTMC = new FloatCurve();
goliathVTMC.keys = [new Key(0,1,-0.15), new Key(0.61, 0.792, 0.09), new Key(0.942, 0.838, 0.43), new Key(1.357, 0.958, 0.1), new Key(1.623, 0.9746, 0.17), new Key(1.856, 0.75, -3), new Key(2, 0.308, -3.6), new Key(2.1, 0, -0.17)];
//Panther (dry)
var pantherDryTC = new FloatCurve();
pantherDryTC.setFromKeyString(`key = 0 0 1.069445 0.7244952
			key = 0.072 0.08 1.472049 1.472049
			key = 0.17 0.21 1.227685 1.227685
			key = 0.34 0.39 1.01426 1.01426
			key = 1 1 0.969697 0.969697`);
pantherDryTC.keys.push(new Key(1e+12, 9.69697e+11, 0.969697));
for (var i = 0; i < pantherDryTC.keys.length; i++) {
	pantherDryTC.keys[i].x *= 101325;
	pantherDryTC.keys[i].dx /= 101325;
}
var pantherDryVTMC = new FloatCurve();
pantherDryVTMC.setFromKeyString(`key = 0 1 0 0
			key = 0.35 0.932 0 0
			key = 1 1.13 0.4510796 0.4510796
			key = 1.75 1.5 0 0
			key = 2 1.38 -1.126258 -1.126258
			key = 2.5 0 0 0`);
//Panther (wet)
var pantherWetTC = new FloatCurve();
pantherWetTC.setFromKeyString(`key = 0 0 1.666667 1.666667
			key = 0.07066164 0.1397133 1.961396 1.961396
			key = 0.34 0.56 1.084002 1.084002
			key = 1 1 0.5302638 0.5302638`);
pantherWetTC.keys.push(new Key(1e+12, 5.303e+11, 0.5303));
for (var i = 0; i < pantherWetTC.keys.length; i++) {
	pantherWetTC.keys[i].x *= 101325;
	pantherWetTC.keys[i].dx /= 101325;
}
var pantherWetVTMC = new FloatCurve();
pantherWetVTMC.setFromKeyString(`key = 0 1 0 0
			key = 0.18 0.97 0 0
			key = 0.43 1 0.202683 0.202683
			key = 1 1.42 1.280302 1.280302
			key = 2.5 3.63 0 0
			key = 3 0.58 -2.708558 -2.708558
			key = 3.35 0 -0.6150925 0`);
//Whiplash
var whiplashTC = new FloatCurve();
whiplashTC.setFromKeyString(`key = 0 0 0 0
			key = 0.045 0.166 4.304647 4.304647
			key = 0.16 0.5 0.5779132 0.5779132
			key = 0.5 0.6 0.4809403 0.4809403
			key = 1 1 1.013946 0`);
whiplashTC.keys.push(new Key(1e+12, 1.013946e+12, 1.013946));
for (var i = 0; i < whiplashTC.keys.length; i++) {
	whiplashTC.keys[i].x *= 101325;
	whiplashTC.keys[i].dx /= 101325;
}
var whiplashVTMC = new FloatCurve();
whiplashVTMC.setFromKeyString(`key = 0 1 0 0
			key = 0.2 0.98 0 0
			key = 0.72 1.716 2.433527 2.433527
			key = 1.36 3.2 1.986082 1.986082
			key = 2.15 4.9 1.452677 1.452677
			key = 3 5.8 0.0005786046 0.0005786046
			key = 4.5 3 -4.279616 -4.279616
			key = 5.5 0 -0.02420209 0`);
//R.A.P.I.E.R. (closed-cycle)
var rapierTC = new FloatCurve();
rapierTC.setFromKeyString(`key = 0 0 0 0
			key = 0.018 0.09 7.914787 7.914787
			key = 0.08 0.3 1.051923 1.051923
			key = 0.35 0.5 0.3927226 0.3927226
			key = 1 1 1.055097 0`);
rapierTC.keys.push(new Key(1e+12, 1.055097e+12, 1.055097));
for (var i = 0; i < rapierTC.keys.length; i++) {
	rapierTC.keys[i].x *= 101325;
	rapierTC.keys[i].dx /= 101325;
}
var rapierVTMC = new FloatCurve();
rapierVTMC.setFromKeyString(`key = 0 1 0 0.08333334
			key = 0.2 0.98 0.42074 0.42074
			key = 0.7 1.8 2.290406 2.290406
			key = 1.4 4.00 3.887193 3.887193
			key = 3.75 8.5 0 0
			key = 4.5 7.3 -2.831749 -2.831749
			key = 5.5 3 -5.260566 -5.260566
			key = 6 0 -0.02420209 0`);

var enginemap = new Map([
	['Ant', rocket(0.058269, 0.071218, 0, 0, 0, 2000, 507.94)],
	['Spider', rocket(0.063293, 0.077358, 0, 0, 0, 2000, 1793.1)],
	['Puff', rocket(0, 0, 2.039432, 0, 0, 20000, 9600)],
	['Nerv', rocket(1.529574, 0, 0, 0, 0, 60000, 13875)],
	['Terrier', rocket(1.596078, 1.950761, 0, 0, 0, 60000, 14782.61)],
	['Twitch', rocket(0.506342, 0.618862, 0, 0, 0, 16000, 15172.41)],
	['Spark', rocket(0.57359, 0.701055, 0, 0, 0, 20000, 16562.5)],
	['Poodle', rocket(6.555319, 8.012056, 0, 0, 0, 250000, 64285.71)],
	['Thud', rocket(3.610798, 4.413198, 0, 0, 0, 120000, 108196.72)],
	['Dart', rocket(4.858648, 5.938347, 0, 0, 0, 180000, 153529.41)],
	['RAPIER (closed-cycle)', rocket(5.416198, 6.619797, 0, 0, 0, 180000, 162295.08)],
	['Swivel', rocket(6.166096, 7.53634, 0, 0, 0, 215000, 167968.75)],
	['Reliant', rocket(7.105119, 8.684035, 0, 0, 0, 240000, 205161.29)],
	['Skipper', rocket(18.641687, 22.784284, 0, 0, 0, 650000, 568750)],
	['Vector', rocket(29.134749, 35.609138, 0, 0, 0, 1000000, 936507.94)],
	['Rhino', rocket(53.984976, 65.981637, 0, 0, 0, 2000000, 1205882.35)],
	['Mainsail', rocket(44.406996, 54.275218, 0, 0, 0, 1500000, 1379032.26)],
	['Twin-Boar', rocket(61.182973, 74.779189, 0, 0, 0, 2000000, 1866666.67)],
	['Mammoth', rocket(116.538996, 142.436550, 0, 0, 0, 4000000, 3746031.75)],
	['Dawn', rocket(0, 0, 0, 0.485579, 0, 2000, 47.62)],
	['Mite', rocket(0, 0, 0, 0, 0.809299, 12500, 11011.90)],
	['Separatron', rocket(0, 0, 0, 0, 1.589168, 18000, 13792.21)],
	['Shrimp', rocket(0, 0, 0, 0, 1.897146, 30000, 26511.63)],
	['Flea', rocket(0, 0, 0, 0, 15.821052, 192000, 162909.09)],
	['Hammer', rocket(0, 0, 0, 0, 15.827390, 227000, 197897.44)],
	['Thumper', rocket(0, 0, 0, 0, 19.423166, 300000, 250000)],
	['Kickback', rocket(0, 0, 0, 0, 41.406658, 670000, 593863.64)],
	['Thoroughbred', rocket(0, 0, 0, 0, 100.493772, 1700000, 1515217.39)],
	['Clydesdale', rocket(0, 0, 0, 0, 190.925589, 3300000, 2948936.17)],
	['Juno', jet(6400, junoTC, junoVTMC, 20000)],
	['Wheesley', jet(10500, wheesleyTC, wheesleyVTMC, 120000)],
	['Panther (dry)', jet(9000, pantherDryTC, pantherDryVTMC, 85000)],
	['Panther (wet)', jet(4000, pantherWetTC, pantherWetVTMC, 130000)],
	['Goliath', jet(12600, goliathTC, goliathVTMC, 360000)],
	['Whiplash', jet(4000, whiplashTC, whiplashVTMC, 130000)],
	['RAPIER (open-cycle)', jet(3200, rapierTC, rapierVTMC, 105000)]
]);
