//Main js file
var a = fetch('./bodies/Stock/Eve.cfg');
console.log(a);

//Get canvases
var trajcanvas = document.getElementById('traj');

console.log(trajcanvas);

//GL
trajgl = trajcanvas.getContext('webgl2');

var timestepslider = document.getElementById('timestep');
timestepslider.oninput = function(event){
	var newtimestep = 0.001*Math.pow(10000,timestepslider.value);
	var suffix = 's';

	if (newtimestep < 1) {
		newtimestep *= 1000;
		suffix = 'ms';
		newtimestep = newtimestep.toFixed(1);
	} else {
		newtimestep = newtimestep.toFixed(3);
	}

	document.getElementById('timestep-display').innerHTML=newtimestep + suffix;
}

var body_display = document.getElementById('body-display');

var cfginput = document.getElementById('cfg');
var customfilelabel = document.getElementById('customfilelabel');
cfginput.oninput = function(event) {
	console.log(cfginput.value);
	var filestring = cfginput.value.split('\\').pop();
	var bodyname_file = filestring.slice(0,-4);
	customfilelabel.innerHTML = filestring;
	body_display.innerHTML = 'Selected Object: ' + bodyname_file + ' (Imported)';
}

var systemdropdown = document.getElementById('system');
var objectdropdown = document.getElementById('object');

var systems = ['stock', 'rss', 'jnsq', 'opm', 'gpp'];

var systemcapitalized = ['Stock', 'RSS', 'JNSQ', 'OPM', 'GPP'];

var objects = [
	[
		'Sun', 'Moho', 'Eve', 'Gilly', 'Kerbin', 'Mun', 'Minmus', 'Duna', 'Ike',
		'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo'
	],[
		'Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Phobos', 'Deimos',
		'Vesta', 'Ceres', 'Jupiter', 'Io', 'Europa', 'Ganymede', 'Callisto', 'Saturn',
		'Mimas', 'Enceladus', 'Tethys', 'Dione', 'Rhea', 'Titan', 'Iapetus', 'Uranus',
		'Miranda', 'Ariel', 'Umbriel', 'Titania', 'Oberon', 'Neptune', 'Triton',
		'Pluto', 'Charon'
	],[
		'Sun', 'Moho', 'Eve', 'Gilly', 'Kerbin', 'Mun', 'Minmus', 'Duna', 'Ike',
		'Edna', 'Dak', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Lindor',
		'Krel', 'Aden', 'Huygen', 'Riga', 'Talos', 'Eeloo', 'Celes', 'Tam', 'Nara',
		'Amos', 'Enon', 'Prax'
	],[
		'Sun', 'Moho', 'Eve', 'Gilly', 'Kerbin', 'Mun', 'Minmus', 'Duna', 'Ike',
		'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Sarnus', 'Hale',
		'Ovok', 'Eeloo', 'Slate', 'Tekto', 'Urlum', 'Polta', 'Priax', 'Wal', 'Tal',
		'Neidon', 'Thatmo', 'Nissee', 'Plock', 'Karen'
	],[
		'Ciro', 'Icarus', 'Thalia', 'Eta', 'Niven', 'Gael', 'Iota', 'Ceti', 'Tellumo',
		'Gratian', 'Geminus', 'Otho', 'Augustus', 'Hephaestus', 'Jannah', 'Gauss',
		'Loki', 'Catullus', 'Tarsiss', 'Nero', 'Hadrian', 'Narisse', 'Muse', 'Minona',
		'Agrippina', 'Julia', 'Hox', 'Argo', 'Leto', 'Grannus'
	]
];

function updateObjectList(e) {
	console.log(systemdropdown.value);

	var systemindex = -1;
	for (var i = 0; i < systems.length; i++) {
		if (systems[i] == systemdropdown.value) {
			systemindex = i;
		}
	}
	objectdropdown.length = 0;
	for (var i = 0; i < objects[systemindex].length; i++) {
		objectdropdown.options[i] = new Option(objects[systemindex][i],objects[systemindex][i]);
	}

	body_display.innerHTML = 'Selected Object: ' + objectdropdown.value + ' (' + systemcapitalized[systemindex] + ')';
}

systemdropdown.oninput = updateObjectList;
updateObjectList(0);

objectdropdown.oninput = function(event) {

	var systemindex = -1;
	for (var i = 0; i < systems.length; i++) {
		if (systems[i] == systemdropdown.value) {
			systemindex = i;
		}
	}
	
	body_display.innerHTML = 'Selected Object: ' + objectdropdown.value + ' (' + systemcapitalized[systemindex] + ')';
}

document.getElementById('update-object-select').onclick = function(e) {
	var systemindex = -1;
	for (var i = 0; i < systems.length; i++) {
		if (systems[i] == systemdropdown.value) {
			systemindex = i;
		}
	}
	
	body_display.innerHTML = 'Selected Object: ' + objectdropdown.value + ' (' + systemcapitalized[systemindex] + ')';
};
document.getElementById('update-object').onclick = function(e) {
	var filestring = cfginput.value.split('\\').pop();
	var bodyname_file = filestring.slice(0,-4);
	if (bodyname_file != '') {
		body_display.innerHTML = 'Selected Object: ' + bodyname_file + ' (Imported)'
	};
};

console.log(trajgl);

//Animation
function animate(time) {
	//Render
	trajgl.viewport(0,0,trajgl.canvas.width, trajgl.canvas.height);
	trajgl.clear(trajgl.COLOR_BUFFER_BIT | trajgl.DEPTH_BUFFER_BIT);
	trajgl.enable(trajgl.DEPTH_TEST);
	trajgl.clearColor(0,0,1,1);

	//Request next frame
	window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
