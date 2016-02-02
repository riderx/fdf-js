var container, scene, camera, renderer, controls, stats,
clock = new THREE.Clock(),
windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2;

init();
animate();

/*
* Init vars for Threejs 
*/
function init()
{
	"use strict";
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight,
	VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.01, FAR = 200000;

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	

	renderer = new THREE.WebGLRenderer( {antialias:true, alpha:true} );
	renderer.setClearColor(0x000000, 0.3);
	renderer.setSize(SCREEN_WIDTH - 22, SCREEN_HEIGHT - 38);

	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	THREEx.WindowResize(renderer, camera);
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	scene.add(new THREE.AxisHelper(100));
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
}

/*
* Clean a scene 
*/
function deletefdf()
{
	if (scene) {
		delete scene;
		scene = new THREE.Scene();
		scene.add(camera);
		scene.add(new THREE.AxisHelper(100));
		scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	}
}

/*
* Transform hexadecimal color to RGB color 
*/
function hexToRGB(hex){
	if (hex.search("0x") !== -1)
		hex = hex.replace("0x", "");
	if (hex.search("#") !== -1)
		hex = hex.replace("#", "");

	var R = parseInt(hex.slice(0,2), 16),
	G = parseInt(hex.slice(2,4), 16),
	B = parseInt(hex.slice(4,6), 16);

	if (R === "NaN" || G === "NaN" || B === "NaN")
		console.log("nanisme");
	R = (R === "NaN") ? 0: R;
	G = (G === "NaN") ? 0: G;
	B = (B === "NaN") ? 0: B;
	return {r: R,g: G,b: B};
}

/*
* Add new position in the scene 
*/
function add_positions (positions, u, xFact, yFact, j, i, z) {
	positions[ u * 3 ] = xFact + (20* j);
	positions[ u * 3 + 1 ] = z;
	positions[ u * 3 + 2 ] = yFact + (20* i);
	return positions;
}

/*
* Add specifiq color for position in the scene 
*/
function add_colors (colors, u, hexColor) {
	var clr = hexToRGB(hexColor);

	colors[ u * 3 ] = clr.r;
	colors[ u * 3 + 1 ] = clr.g;
	colors[ u * 3 + 2 ] = clr.b;
	return colors;
}

/*
* Parse a fdf file 
*/
function get_fdf_file() {
	var map = [],
	file_fdf = document.getElementById( 'filefdf' ).value;
	
	file_fdf = file_fdf.replace(/  /g, " ");	
	if (file_fdf.search("\n") !== -1)
	{
		var fdfline = file_fdf.split("\n");
		for (var i = 0; i < fdfline.length; i++) {
			if (fdfline[i].search(" ") !== -1)
				map.push(fdfline[i].split(" "));
			else {
				console.log("ligne invalide n:" + i + " (pas d'espaces)");
				map.push([]);
			}
			
		}
	}
	else
		console.log("fichier invalide, pas de retour a la ligne");
	return map;
}


/*
* Push in the scene the new fdf 
*/
function renderfdf() {

	var map = get_fdf_file(),
	material_color = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
	segments = (map.length) * (map[0].length ) * 2,
	geometry = new THREE.BufferGeometry(),
	positions = new Float32Array( segments * 3 ),
	colors = new Float32Array( segments * 3 ),
	u = 0,
	yFact = (20 * ((map.length-1) / 2)) * -1,
	xFact = (20 * ((map[0].length-1) / 2)) * -1;

	var i = 0, j = 0, dotmap = [];
	for (i = 0; i < map.length; i++) {
		if (i % 2 === 0) {
			for (j = 0; j < map[i].length; j++) {
				if (map[i][j].search(",") === -1) {
					add_positions(positions, u, xFact, yFact, j, i, map[i][j]);
					add_colors(colors, u, "0x0000ff");
				}
				else {
					dotmap = map[i][j].split(",");
					add_positions(positions, u, xFact, yFact, j, i, dotmap[0]);
					add_colors(colors, u, dotmap[1]);
				}
				u++;
			}
		}
		else {
			for (j = map[i].length - 1; j >= 0; j--) {
				if (map[i][j].search(",") === -1) {
					positions = add_positions(positions, u, xFact, yFact, j, i, map[i][j]);
					add_colors(colors, u, "0x0000ff");
				}
				else {
					dotmap = map[i][j].split(",");
					add_positions(positions, u, xFact, yFact, j, i, dotmap[0]);
					add_colors(colors, u, dotmap[1]);
				}
				u++;
			}
		}
	}
	for (i = 0; i < map[1].length; i++) {
		if (i % 2 === 0) {
			for (j = map.length - 1; j >= 0; j--) {
				if (map[j][i] && map[j][i].search(",") === -1) {
					add_positions(positions, u, xFact, yFact, i, j, map[j][i]);
					add_colors(colors, u, "0x0000ff");
				}
				else if (map[j][i]) {
					dotmap = map[j][i].split(",");
					add_positions(positions, u, xFact, yFact, i, j, dotmap[0]);
					add_colors(colors, u, dotmap[1]);
				}
				u++;
			}
		}
		else {
			for (j = 0; j < map.length; j++) {
				if (map[j][i] && map[j][i].search(",") === -1) {
					add_positions(positions, u, xFact, yFact, i, j, map[j][i]);
					add_colors(colors, u, "0x0000ff");
				}
				else if (map[j][i]){
					dotmap = map[j][i].split(",");
					add_positions(positions, u, xFact, yFact, i, j, dotmap[0]);
					add_colors(colors, u, dotmap[1]);
				}
				u++;
			}
		}
	}
	geometry.addAttribute( "position", new THREE.BufferAttribute(positions, 3) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	mesh = new THREE.Line( geometry, material_color );
	scene.add( mesh );
}


/*
* Animate the scene 
*/
function animate() 
{
	requestAnimationFrame( animate );
	render();		
	update();
}

/*
* Update the scene 
*/
function update()
{
	var delta = clock.getDelta(); 
	controls.update();
}

/*
* Render the scene 
*/
function render() 
{	
	renderer.render( scene, camera );
}
