//Handle html inputs

//Data
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

//Get important elements
var obj_type_select = document.getElementById('obj-type-select'); //Select object source
var system = document.getElementById('system'); //Solar system/planet pack
var object = document.getElementById('object'); //Object in planet pack
var body_display = document.getElementById('body-display'); //Display body name
var prop_display = document.getElementById('prop-display'); //Property display
var cfg_input = document.getElementById('cfg'); //File object input
var customfilelabel = document.getElementById('customfilelabel');

var drop_input_container = document.getElementById('drop-input-container'); //Dropdown object input div container
var file_input_container = document.getElementById('file-input-container'); //File object input div container

var addstagebutton = document.getElementById('addstagebutton');
var stagetable = document.getElementById('stagetable');

//Input handling functions
function updateBodyDisplay(systemz, objectz) {
	body_display.innerHTML = 'Selected Object: ' + objectz + ' (' + systemz + ')';
}

function setInputMode(mode) { //Set body input mode
	if (mode == 'file') {
		file_input_container.style.display = 'flex';
		drop_input_container.style.display = 'none';
	} else {
		drop_input_container.style.display = 'block';
		file_input_container.style.display = 'none';
	}
}

function updateBody(mode) { //Update body display
	if (mode == 'file') {
		updateBodyDisplay('Imported', cfg_input.value.split('\\').pop().slice(0,-4));
	} else {

		var sys = system.value;
		var systemindex = -1;
		for (var i = 0; i < systems.length; i++) {
			if (systems[i] == sys) {
				systemindex = i;
			}
		}
		updateBodyDisplay(systemcapitalized[systemindex], object.value);
	}
}

function updateBodyList() { //Update object list
	var sys = system.value;
	var systemindex = -1;
	for (var i = 0; i < systems.length; i++) {
		if (systems[i] == sys) {
			systemindex = i;
		}
	}
	object.length = 0;
	for (var i = 0; i < objects[systemindex].length; i++) {
		object.options[i] = new Option(objects[systemindex][i],objects[systemindex][i]);
	}
	updateBody('drop');
}

addstagebutton.onclick = function(event) { //Add a new stage.
	var row = stagetable.insertRow();
	var newCell = row.insertCell();
	var stageid = stagetable.children[0].children.length-1;
	row.id = 'stage'+stageid;
	newCell.style.backgroundColor = '#888';
	newCell.style.borderRadius = '10px';
	newCell.innerHTML = `
		<h4 style='text-align: center;'>
			Stage `+stageid+`
		</h4>
		<p style='margin-bottom:5px; font-size: 15px; margin-top:0px; text-align:center;'>
			Starting Mass: <input type='number' min='0' step='0.1' style='margin-right:0px'> t
		</p>
		<p style='margin-top:0px; text-align:center; font-size: 15px;'>
			<input type='number' value='0' placeholder='0' min='0' style='width:30px; margin:0px;'> LF, 
			<input type='number' value='0' placeholder='0' min='0' style='width:30px; margin:0px;'> OX, 
			<input type='number' value='0' placeholder='0' min='0' style='width:30px; margin:0px;'> MP, 
			<input type='number' value='0' placeholder='0' min='0' style='width:30px; margin:0px;'> XE
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size: 15px;'>
			Starting Wing Area: <input type='number' value='0' placeholder='0' min='0' step='0.001' style='width:50px; margin:0px;'> m^2
		</p>
		<p style='margin-top:0px; text-align:center; font-size: 15px;'>
			Starting Wing AoA: <input type='number' value='0' placeholder='0' min='-90' max='90' style='width:30px; margin:0px;'> degrees
		</p>

		<h4 style='text-align: center;'>
			Drag Cube
		</h4>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Front Body Area: <input type='number' min='0' step='0.001' placeholder='0'> m^2
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Side Body Area: <input type='number' min='0' step='0.001' placeholder='0'> m^2
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Top Body Area: <input type='number' min='0' step='0.001' placeholder='0'> m^2
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Bottom Body Area: <input type='number' min='0' step='0.001' placeholder='0'> m^2
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 10px; font-size:15px'>
			Total Back Body Area: <input type='number' min='0' step='0.001' placeholder='0'> m^2
		</p>

		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Front Body Pointiness: <input type='number' min='0' max='1' step='0.001' placeholder='0'>
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Side Body Pointiness: <input type='number' min='0' max='1' step='0.001' placeholder='0'>
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Top Body Pointiness: <input type='number' min='0' max='1' step='0.001' placeholder='0'>
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 5px; font-size:15px'>
			Total Bottom Body Pointiness: <input type='number' min='0' max='1' step='0.001' placeholder='0'>
		</p>
		<p style='margin-top:0px; text-align:center; margin-bottom: 10px; font-size:15px'>
			Total Back Body Pointiness: <input type='number' min='0' max='1' step='0.001' placeholder='0'>
		</p>


		<h4 style='text-align: center; margin-bottom:10px;'>
			Engine Counts
		</h4>
								
		<div class='centered'>
			<input type='button' value='Add Engine Group' style='margin-bottom:10px;' class='keepcolor' id='ae`+stageid+`'>
		</div>

		<div class='centered'>
			<table style='width:70%' id='e`+stageid+`'>
			</table>
		</div>

		<input type='button' value='-' class='redstop' style='margin-bottom: 8px;' id='ds`+stageid+`'>
	`;

	document.getElementById('ds'+stageid).onclick = function(e) {
		document.getElementById('stage'+stageid).remove();

		var trs = stagetable.children[0].children;
		for (var i = 0; i < trs.length; i++) {
			trs[i].children[0].children[0].innerHTML = 'Stage ' + i;
		}
	}

	document.getElementById('ae'+stageid).onclick = function(e) {
		var aerow = document.getElementById('e'+stageid).insertRow();

		aerow.innerHTML = `
			<td style='background-color:#777; border-radius: 10px;'>
				<h4 style='text-align: center; margin:5px;'>
					Engine Group
				</h4>
				<div class='centered'>
					<input type='number' value='5' min='1' step='1' style='width:50px; margin-right:2px;'>
					<select style='width:80px; margin-left:0px;'>
						<option>Mohos</option>
						<option>Eves</option>
					</select>	
				</div>

				<input type='button' value='-' class='redstop' style='margin-bottom: 8px;'>
			</td>
		`;

		var redstop = aerow.children[0].children;
		redstop[redstop.length-1].onclick = function(e) {
			redstop[redstop.length-1].parentElement.parentElement.remove();
		}
	}
}

setInputMode('drop');
obj_type_select.oninput = function(e) { //Show/hide input methods
	var v = obj_type_select.value;
	if (v == 'drop') {
		setInputMode('drop');
	} else {
		setInputMode('file');
	}
}

updateBody('drop');
var fileinputted = '';
cfg_input.oninput = function(e) {
	updateBody('file');
	customfilelabel.innerHTML = cfg_input.value.split('\\').pop();
	fileinputted = cfg_input.files[0];
	readandinterpretcfg(fileinputted);
}
updateBodyList();
system.oninput = updateBodyList;
object.oninput = function(e) {
	updateBody('drop');
}