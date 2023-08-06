//Graph writing library

//Get HTML
var density_graph = document.getElementById('density');
var sound_graph = document.getElementById('sound');
var pressure_graph = document.getElementById('pressure');

//Generate data
function updateFromFloatCurve(curve, detail, chart, set) {
	var d = generateDataFromFloatCurve(curve, detail);
	chart.data.labels = d[0];
	chart.data.datasets[set].data = d[1];
	chart.update();
}

function generateDataFromFloatCurve(curve, detail) {
	var minx = curve.keys[0].x;
	var maxx = curve.keys[curve.keys.length-1].x;
	var xv = [];
	for (var i = 0; i <= detail; i++) {
		xv.push(minx + i*(maxx-minx)/detail);
	}
	return [xv, generateYFromFloatCurve(curve, xv)];
}

function generateYFromFloatCurve(curve, xv) {
	var yv = [];
	for (var i = 0; i < xv.length; i++) {
		yv.push(curve.valueAt(xv[i])[0]);
	}
	return yv;
}

//Render charts
var densitychart = new Chart(density_graph, {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			data: [],
			yAxisID: 'dense',
			label: 'Density (kg/m^3)',
			pointRadius: 0,
			pointHoverRadius: 5,
			normalized: true,
			borderColor: '#0080FF',
			backgroundColor: '#0080FF'
		},{
			data: [],
			yAxisID: 'press',
			label: 'Pressure (kPa)',
			pointRadius: 0,
			pointHoverRadius: 5,
			normalized: true,
			borderColor: '#FF8000',
			backgroundColor: '#FF8000'
		}]
	},
	options: {
		aspectRatio: 1.7,
		scales: {
			dense: {
				min:0,
				position: 'left',
				title: {
					display: true,
					text: 'Density (kg/m^3)'
				}
			},
			press: {
				min:0,
				position: 'right',
				title: {
					display: true,
					text: 'Pressure (kPa)'
				},
				grid: {
					display: true,
					color: '#404040'
				}
			},
			x: {
				title: {
					display:true,
					text: 'Altitude (m)'
				},
				grid: {
					display: true,
					color: '#404040'
				}
			}
		},
		plugins: {
			decimation: {
				enabled: true,
				algorithm: 'lttb',
				samples: 1
			},
			legend: {
                labels: {
                    font: {
                        size: 12
                    }
                }
            }
		}
	}
});

var soundchart = new Chart(sound_graph, {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			data: [],
			yAxisID: 'sound',
			label: 'Speed of Sound (m/s)',
			pointRadius: 0,
			pointHoverRadius: 5,
			normalized: true,
			borderColor: '#02B056',
			backgroundColor: '#02B056'
		}]
	},
	options: {
		aspectRatio: 1.7,
		scales: {
			sound: {
				position: 'left',
				title: {
					display: true,
					text: 'Speed of Sound (m/s)'
				},
				grid: {
					display: true,
					color: '#404040'
				}
			},
			x: {
				title: {
					display:true,
					text: 'Altitude (m)'
				},
				grid: {
					display: true,
					color: '#404040'
				}
			}
		},
		plugins: {
			decimation: {
				enabled: true,
				algorithm: 'lttb',
				samples: 1
			},
			legend: {
                labels: {
                    font: {
                        size: 12
                    }
                }
            }
		}
	}
});