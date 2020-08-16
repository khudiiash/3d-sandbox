const canvas = document.getElementById("scene");

const three = new ThreeManager(canvas);

bindEventListeners();
render();
init()

function bindEventListeners() {
	window.onresize = resizeCanvas;
	resizeCanvas();

	let buttons = document.querySelectorAll('.button:not(#color-paint)')
	for (let b of buttons) {
		b.addEventListener('mousedown', function () {
			gsap.to(this, .1, { backgroundColor: '#fff' });
			gsap.to(this, .1, { color: '#000' });

		})
		b.addEventListener('mouseup', function () {
			gsap.to(this, .1, { backgroundColor: '#000' });
			gsap.to(this, .1, { color: '#fff' });
		})
		b.addEventListener('touchstart', function () {
			gsap.to(this, .1, { backgroundColor: '#fff' });
			gsap.to(this, .1, { color: '#000' });

		})
		b.addEventListener('touchend', function () {
			gsap.to(this, .1, { backgroundColor: '#000' });
			gsap.to(this, .1, { color: '#fff' });
		})
	}

	let input = document.querySelector('#texture-input')
	input.addEventListener('mouseleave', () => {
		hideTextureClear()
		gsap.to('#texture-label', .3, { y: 0, opacity: 0 })
	})
	input.addEventListener('mouseenter', () => {
		gsap.to('#texture-clear', .3, { x: 40 })
		gsap.to('#texture-label', .3, { y: 20, opacity: .7 })

	})
	let cp = document.querySelector('#color')
	cp.addEventListener('mouseenter', () => {
		gsap.to('#color-paint', .3, { x: 40, opacity: 1 })

	})
	cp.addEventListener('mouseleave', () => {
		hidePaint()
	})

	let physics = document.querySelector('#run-physics')
	physics.addEventListener('click', () => {
		three.simulation = !three.simulation
		if (three.simulation) {
			gsap.set('#formula', { backgroundColor: 'goldenrod' })
		}
		else {
			gsap.set('#formula', { backgroundColor: 'transparent' })

		}

	})

	let textureClear = document.querySelector('#texture-clear')
	let paint = document.querySelector('#color-paint')
	textureClear.addEventListener('click', three.clearTexture)

	function hideTextureClear() {
		gsap.delayedCall(.3, () => { if (!textureClear.mouseOver) gsap.to(textureClear, .3, { x: 0 }) })
	}
	function hidePaint() {
		gsap.delayedCall(.3, () => { if (!paint.mouseOver) gsap.to(paint, .3, { x: 0 }) })
	}

	textureClear.addEventListener('mouseenter', function () { this.mouseOver = true })
	textureClear.addEventListener('mouseleave', function () { this.mouseOver = false, hideTextureClear() })
	paint.addEventListener('mouseenter', function () { this.mouseOver = true })
	paint.addEventListener('mouseleave', function () { this.mouseOver = false, hidePaint() })
	paint.addEventListener('click', paintMode)
	document.querySelector('#link').addEventListener('click', linkingMode)


	let cube = document.getElementById('cube')
	let sphere = document.getElementById('sphere')
	let cylinder = document.getElementById('cylinder')

	let colorPicker = document.getElementById('color')
	colorPicker.onchange = handleColor


	cube.onclick = () => {
		let cube = three.cube(1, 1, 1, three.baseColor)
		if (three.baseScale) {
			cube.scale.x = three.baseScale.x
			cube.scale.y = three.baseScale.y
			cube.scale.z = three.baseScale.z
		}
		three.add(cube)
	}
	sphere.onclick = () => {
		let sphere = three.sphere(.5, 32, 32, three.baseColor)
		if (three.baseScale) {
			sphere.scale.x = three.baseScale.x
			sphere.scale.y = three.baseScale.y
			sphere.scale.z = three.baseScale.z
		}
		three.add(sphere)

	}
	cylinder.onclick = () => {
		let cylinder = three.cylinder(.5, 1, three.baseColor)
		if (three.baseScale) {
			cylinder.scale.x = three.baseScale.x
			cylinder.scale.y = three.baseScale.y
			cylinder.scale.z = three.baseScale.z
		}
		cylinder.color(three.baseColor)
		cylinder.pos(0, three.baseScale?.y / 2 || .5, 0)
		three.add(cylinder)
	}
}
function linkingMode() {
	if (!three.linkingMode) {
		three.linkingMode = true;
		three.attachAll()
		document.querySelector('#link').style.backgroundColor = 'goldenrod'
	}
	else {
		console.log('Unlink')

		three.linkingMode = false
		three.detachAll()
		document.querySelector('#link').style.backgroundColor = '#333'
	}
}
function paintMode() {
	if (!three.paintMode) {
		three.paintMode = true;
		document.querySelector('#color-paint').style.background = '#ffffff'
		document.querySelector('#color-paint').style.color = '#000'
	}
	else {
		three.paintMode = false
		document.querySelector('#color-paint').style.background = '#000'
		document.querySelector('#color-paint').style.color = '#fff'
	}
}

function handleColor() {
	// Receive color from color input, bring it to THREE and update the interface
	let colorPicker = document.getElementById('color')
	let color = colorPicker.value;
	let highlight = lightOrDark(color) === 'dark' ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)'
	gsap.to('#add-panel .side', .5, { background: 'radial-gradient(circle at 10px 10px, ' + color + ', ' + highlight })
	gsap.set('.sphere, .cylinder, .cylinder:before', { background: 'radial-gradient(circle at 10px 10px, ' + color + ', ' + highlight });
	gsap.to('#texture-cover', .5, { background: 'radial-gradient(circle at 10px 10px, ' + color + ', ' + highlight })
	gsap.to('#radial-gradient stop', .5, { 'stop-color': color })
	gsap.to('#radial-gradient-2 stop', .5, { 'stop-color': color })


	three.setColor(colorPicker.value)
}
function handleTexture(element) {
	// Receive texture file from the input, bring it to THREE and update the interface
	let file = element.files[0]
	if (FileReader && file) {
		var fr = new FileReader();
		fr.onload = function () {
			document.getElementById('texture-image').src = fr.result;
			three.loadTexture(fr.result, three.baseColor)
			gsap.set('#texture-cover', { display: 'none' })
		}
		fr.readAsDataURL(file);
	}
}
function resizeCanvas() {
	canvas.style.width = '100%';
	canvas.style.height = '100%';

	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	three.onWindowResize();
}

function render() {
	requestAnimationFrame(render);
	three.update();
}
// Mediating functions
function scaleUp(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.scaleUp(val)
}
function scaleDown(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.scaleDown(val)
}
function rotateCW(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.rotateCW(val)
}
function rotateCC(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.rotateCC(val)
}
function scaleX(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.scaleX(val)

}
function scaleY(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.scaleY(val)

}
function scaleZ(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.scaleZ(val)

}
function rotateX(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.rotateX(val)
}
function rotateY(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.rotateY(val)

}
function rotateZ(val) {
	let obj = three.object
	if (obj && obj?.scaleUp) obj.rotateZ(val)

}
function clearScale() {
	console.log("CLEAR")
	three.object.scale.set(1, 1, 1)
	three.baseScale = { x: 1, y: 1, z: 1 }
}
function clearRotation() {
	three.object.rotation.set(0, 0, 0)
	three.baseRotation = { x: 0, y: 0, z: 0 }
}
function clearScaleX() {
	three.object.scale.x = 1;
	three.baseScale.x = 1;
}
function clearRotationX() {
	three.object.rotation.x = 0;
	three.baseRotation.x = 0;
}
function clearScaleY() {
	three.object.scale.y = 1;
	three.baseScale.y = 1;
}
function clearRotationY() {
	three.object.rotation.y = 0;
	three.baseRotation.y = 0;
}
function clearScaleZ() {
	three.object.scale.z = 1
	three.baseScale.z = 1
}
function clearRotationZ() {
	three.object.rotation.z = 0
	three.baseRotation.z = 0
}
function addLight() {
	if (three.lights.length < 2) {
		three.createLight(700, three.baseColor)
		gsap.to('#light', 1, {opacity: 1})
	}
	else if (three.lights.length === 2) {
		three.createLight(700, three.baseColor)
		gsap.to('#light', 1, {opacity: .3})
	}
}
// Init
function init() {
	// Can do setup here
	three.createLight(700)
}