function ThreeManager(canvas) {

    Physijs.scripts.worker = 'js/lib/physijs_worker.js';
    const clock = new THREE.Clock();
    const mouse = { x: 0, y: 0 };
    let buffer = {};
    let clicker;
    let mousePos;
    let objects = []
    let isMobile = window.innerWidth < window.innerHeight

    this.objects = objects
    this.simulation = false;
    this.baseColor = '#ffffff';
    this.baseSize = { w: 1, h: 1, d: 1 };
    this.lights = [];

    let baseRotation;
    let wasSimulating = false;
    let initialPos = { x: 0, y: 0, z: 0 }
    let roundness = 0;
    let baseScale = { x: 1, y: 1, z: 1 }
    let baseSize = this.baseSize;
    let baseTexture;


    const prevPosition = {
        x: 0,
        y: 0,
        z: 0,
    }

    let followObject;
    var stats = new Stats();
    stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    //document.body.appendChild( stats.dom );
    const screenDimensions = {
        width: canvas.clientWidth,
        height: canvas.clientHeight
    }
    this.createLight = (power, color) => {
        let radius = isMobile ? .3 : .12
        let bulbGeometry = new THREE.SphereBufferGeometry(radius, 32, 32, 8);
        bulbLight = new THREE.PointLight(new THREE.Color(color).convertSRGBToLinear() || 0xffffff, power || 50, 100, 2);
        bulbLight.castShadow = true;
        bulbLight.shadow.mapSize.width = 4096;  // default
        bulbLight.shadow.mapSize.height = 4096; // default
        bulbLight.shadow.camera.near = 0.5;       // default
        bulbLight.shadow.camera.far = 500      // default
        bulbMat = new THREE.MeshStandardMaterial({
            emissive: color || this.baseColor,
            emissiveIntensity: 1,
            color: color || this.baseColor,
        });
        //bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 );

        let bulb = new THREE.Mesh(bulbGeometry, bulbMat)
        bulb.hide = () => { scene.remove(bulb); bulb.geometry.dispose(); bulb.material.dispose(); this.lights = this.lights.filter(i => i.uuid !== bulb.uuid); if (this.lights.length < 3) gsap.to('#light', 1, { opacity: 1 }) }
        bulb.add(bulbLight)
        bulb.position.set(0, 8, 0);
        bulb.light = true;
        this.lights.push(bulb)
        this.objects.push(bulb)
        this.object = bulb
        scene.add(bulb)
        return bulb;

    }

    const Ambient = (power, color) => {
        let ambient = new THREE.AmbientLight(color || 0xffee88, power || 20, 100, 2);
        this.ambient = ambient
        scene.add(ambient)
        return ambient;
    }
    const Floor = (size, color) => {
        const floorMat = new THREE.MeshStandardMaterial({
            roughness: 0.6,
            color: color || 0xffffff,
            metalness: 0.1,
            bumpScale: 0.005
        });
        const floorGeometry = new THREE.PlaneGeometry(size, size);

        const floorMesh = new Physijs.PlaneMesh(floorGeometry, floorMat, 100000);
        floorMesh.receiveShadow = true;
        floorMesh.rotation.x = - Math.PI / 2.0;
        this.floor = floorMesh
        scene.add(floorMesh);
    }
    const buildCamera = ({ width, height }) => {
        const aspectRatio = width / height;
        const fieldOfView = 60;
        const nearPlane = .1;
        const farPlane = 500;
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        camera.position.x = -5;
        camera.position.z = 5.4;
        camera.position.y = 3.4;

        camera.lookAt(0, 2, 0)

        var orbitControls = new THREE.OrbitControls(camera, canvas);
        orbitControls.minDistance = 1;
        orbitControls.maxDistance = 600;

        const dragControls = new THREE.DragControls(this.objects, camera, renderer.domElement);
        dragControls.addEventListener('dragstart', (e) => {

            if (this.simulation === true) {
                this.simulation = false;
                wasSimulating = true;
            }

            let o = e.object
            followObject = o
            this.object = o

            initialPos.x = o.position.x
            initialPos.y = o.position.y
            initialPos.z = o.position.z


            orbitControls.enabled = false;
            if (this.paintMode) {
                if (typeof this.object.color === 'function') this.object.color(this.baseColor)
                else this.object.children[0].color = new THREE.Color(this.baseColor)

            }
            if (this.paintModeTexture) {
                if (this.object && this.baseTexture && !this.object.light)
                    this.object.material = new THREE.MeshPhongMaterial({
                        map: this.baseTexture,
                        transparent: true,
                        opacity: 1,
                        roughness: 1,
                        metalness: 0,
                        color: new THREE.Color(color)
                    })
                else if (this.object && !this.texture && !this.object.light) {
                    this.object.material = new THREE.MeshStandardMaterial({
                        roughness: 0.8,
                        metalness: 0.2,
                        transparent: true,
                        opacity: 1,
                        color: new THREE.Color(this.baseColor).convertSRGBToLinear()
                    })
                }
            }
            if (o.light) {
                let PointLight = o.children[0]

                o.scaleUp = () => {
                    PointLight.intensity += 50
                }
                o.scaleDown = () => {
                    if (PointLight.intensity >= 50)
                        PointLight.intensity -= 50
                }
                o.scaleX = (v) => {
                    if (v > 0)
                        PointLight.intensity += 50
                    if (v < 0)
                        if (PointLight.intensity >= 50)
                            PointLight.intensity -= 50
                }
                o.scaleY = o.scaleX
                o.scaleZ = o.scaleX



            }

        });
        this.dragControls = dragControls
        dragControls.addEventListener('drag', (e) => {
            let o = e.object
            if (!o.isLinked && o.position.y < o.scale.y / 2) o.position.y = o.scale.y / 2
        })

        dragControls.addEventListener('dragend', (e) => {
            orbitControls.enabled = true;
            if (wasSimulating) { this.simulation = true; wasSimulating = false }
        });

        return camera;
    }
    this.detachAll = () => {
        this.objects.forEach(o => {
            if (o.isLinked) {
                THREE.SceneUtils.detach(o, o.parent, scene);
                o.isLinked = false
            }
            if (o.isBase) {
                o.isBase = false
            }

        })
    }
    this.attachAll = () => {
        let baseC = new THREE.Color().setHSL(.12, 1, 0.1)
        let childC = new THREE.Color().setHSL(.56, 1, 0.1)

        baseAnimation = gsap.from(this.object.material.color, 2, { r: baseC.r, g: baseC.g, b: baseC.b, ease: Linear.easeNone })

        this.objects.forEach(o => {
            if (o !== this.object && !this.object.light && !o.light) {

                this.object.attach(o);
                this.object.isBase = true;
                o.isLinked = true


                childAnimation = gsap.from(o.material.color, 1, { r: childC.r, g: childC.g, b: childC.b, ease: Linear.easeNone })

            }

        })
    }
    const detectObjectOverlapping = (a, b) => {
        var rcaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
        // Cast a ray through every vertex or extremity
        for (var vi = 0, l = a.geometry.vertices.length; vi < l; vi++) {
            var glovert = a.geometry.vertices[vi].clone().applyMatrix4(a.matrix);
            var dirv = glovert.sub(a.position);
            // Setup ray caster
            rcaster.set(getCenterPoint(a), dirv.clone().normalize());
            // Get collision result
            var hitResult = rcaster.intersectObject(b);
            // Check if collision is within range of other cube
            if (hitResult.length && hitResult[0].distance < dirv.length()) {
                return true
            }
        }
    }

    const normalize = () => {
        let position = this.object.position
        let newObject, oldObject = this.object;
        if (!this.object.isBase && !this.object.light) {
            let { type } = this.object
            oldColor = oldObject.material.color
            newObject = type === 'cube' ? this.cube(1, 1, 1, oldColor) : type === 'sphere' ? this.sphere(.5, 32, 32, oldColor) : this.cylinder(.5, 1, oldColor)
            this.add(newObject)
            newObject.position.set(position.x, position.y, position.z)
            oldObject.position.set(999, 999, 999)
            this.object = newObject
        }
    }

    function getCenterPoint(mesh) {
        var middle = new THREE.Vector3();
        var geometry = mesh.geometry;

        geometry.computeBoundingBox();

        middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
        middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
        middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

        mesh.localToWorld(middle);
        return middle;
    }
    const setScale = (scale) => {
        this.baseScale = scale
    }
    const setRotation = (rotation) => {
        this.baseRotation = rotation
    }
    const setTexture = (texture) => {
        this.baseTexture = texture
        baseTexture = texture
    }
    function buildScene() {
        const scene = new Physijs.Scene;
        scene.background = new THREE.Color("#000");

        return scene;
    }
    function setShadow(o) {
        o.castShadow = true;
        o.receiveShadow = true;
    }
    function registerMethods(o) {
        o.toMouse = function () {
            if (mousePos?.y < 0) mousePos.y = o.scale.y / 2

            let params = { x: mousePos?.x, y: mousePos?.y, z: mousePos?.z }
            o.apos(.1, params)
        }
        o.pos = function (x, y, z) {
            this.position.set(x, y, z)
        }
        o.hide = function () {
            this.geometry.dispose();
            this.material.dispose();
            scene.remove(this);
            objects.slice(objects.indexOf[o], 1)
        }
        o.apos = function (t, params) {
            gsap.to(this.position, t, params)
        }
        o.arot = function (t, params) {
            gsap.to(this.rotation, t, params)
        }
        o.scaleUp = function (s, t) {
            gsap.to(this.scale, t || .1, { x: '+=' + s, y: '+=' + s, z: '+=' + s, })
            if (this.position.y < this.scale.y / 2) this.position.y = this.scale.y / 2
            baseScale = this.scale
            setScale(baseScale)
        }
        o.scaleDown = function (s, t) {
            gsap.to(this.scale, t || .1, { x: '-=' + s, y: '-=' + s, z: '-=' + s, })
            baseScale = this.scale
            setScale(baseScale)
        }

        o.scaleX = function (s, t) {
            gsap.to(this.scale, t || .1, { x: '+=' + s })
            baseScale = this.scale
            setScale(baseScale)
        }
        o.scaleY = function (s, t) {
            this.scale.y += s
            if (this.position.y < this.scale.y / 2) {
                this.position.y = this.scale.y / 2
            }
            baseScale = this.scale
            setScale(baseScale)


        }
        o.scaleZ = function (s, t) {
            gsap.to(this.scale, t || .1, { z: '+=' + s })
            baseScale = this.scale
            setScale(baseScale)

        }
        o.rotateCC = function (s, t) {
            gsap.to(this.rotation, t || .1, { y: '+=' + s })
            baseRotation = this.rotation
            setRotation(baseRotation)
        }
        o.rotateCW = function (s, t) {
            gsap.to(this.rotation, t || .1, { y: '-=' + s })
            baseRotation = this.rotation
            setRotation(baseRotation)

        }
        o.rotateX = function (s, t) {
            gsap.to(this.rotation, t || .1, { x: '+=' + s })
            baseRotation = this.rotation
            setRotation(baseRotation)

        }
        o.rotateY = function (s, t) {
            gsap.to(this.rotation, t || .1, { y: '+=' + s, })
            baseRotation = this.rotation
            setRotation(baseRotation)

        }
        o.rotateZ = function (s, t) {
            gsap.to(this.rotation, t || .1, { z: '+=' + s, })
            baseRotation = this.rotation
            setRotation(baseRotation)

        }
        if (o.type === 'cube') {
            o.round = function () {
                o.roundness += .02
                let g = createBoxWithRoundedEdges(o.width, o.height, o.depth, o.roundness, 10)
                o.geometry = g
                roundness = o.roundness

            }
            o.flat = function () {
                o.roundness -= .02
                let g = createBoxWithRoundedEdges(o.width, o.height, o.depth, o.roundness, 10)
                o.geometry = g
                roundness = o.roundness

            }
        }
        if (!o.color) o.color = function (c) {
            o.material.color = new THREE.Color(c).convertSRGBToLinear()
            if (typeof c === 'string') this.material.color = new THREE.Color(c).convertSRGBToLinear()
        }
    }


    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, outputEncoding: THREE.sRGBEncoding, gammaOutput: true });
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        renderer.physicallyCorrectLights = true;

        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.setPixelRatio(1);

        renderer.setSize(width, height);

        return renderer;
    }


    function createSceneSubjects() {
        const sceneSubjects = [
            Floor(400, 'black'),
            Ambient(.05, 'white')
        ];
        return sceneSubjects;
    }

    function recordPrevPos() {
        prevPosition.x = followObject.position.x;
        prevPosition.z = followObject.position.z;
        prevPosition.y = followObject.position.y;

    }

    bindObjectScaler()

    const onKeyUp = ({ key }) => {
        buffer[key] = false
    }
    const onKeyDown = ({ key }) => {
        if (key === 'Escape') cancelMovement({ initialPos })

        buffer[key] = true
        if (buffer['s'] && buffer['x'] && buffer['='] && followObject) followObject.scaleX(.2)
        else if (buffer['s'] && buffer['y'] && buffer['='] && followObject) followObject.scaleY(.2)
        else if (buffer['s'] && buffer['z'] && buffer['='] && followObject) followObject.scaleZ(.2);

        else if (buffer['s'] && buffer['x'] && buffer['-'] && followObject) followObject.scaleX(-.2)
        else if (buffer['s'] && buffer['y'] && buffer['-'] && followObject) followObject.scaleY(-.2)
        else if (buffer['s'] && buffer['z'] && buffer['-'] && followObject) followObject.scaleZ(-.2);
        else if (buffer['s'] && buffer['='] && followObject) {
            if (followObject.intensity) followObject.lightUp(40)
            else followObject.scaleUp(.2)
        }
        else if (buffer['s'] && buffer['-'] && followObject) {
            if (followObject.intensity) followObject.lightDown(40)
            else followObject.scaleDown(.2)
        }

        if (buffer['r'] && buffer['x'] && buffer['='] && followObject) followObject.rotateY(.2)
        else if (buffer['r'] && buffer['y'] && buffer['='] && followObject) followObject.rotateY(.2)
        else if (buffer['r'] && buffer['z'] && buffer['='] && followObject) followObject.rotateZ(.2)
        else if (buffer['r'] && buffer['x'] && buffer['-'] && followObject) followObject.rotateX(-.2)
        else if (buffer['r'] && buffer['y'] && buffer['-'] && followObject) followObject.rotateY(-.2)
        else if (buffer['r'] && buffer['z'] && buffer['-'] && followObject) followObject.rotateZ(-.2)
        else if (buffer['r'] && buffer['='] && followObject) followObject.rotateCW(.2)
        else if (buffer['r'] && buffer['-'] && followObject) followObject.rotateCC(.2)

        switch (key.toLowerCase()) {

            case "c": {
                let cube = this.cube()
                if (this.baseColor) cube.color(this.baseColor)
                if (this.baseScale) cube.scale.set(this.baseScale.x, this.baseScale.y, this.baseScale.z)
                if (this.baseRotation) cube.rotation.set(baseRotation.x, baseRotation.y, baseRotation.z)
                if (cube.position.y < cube.scale.y / 2) cube.position.y = cube.scale.y / 2
                this.add(cube)
                cube.toMouse()
                followObject = cube
                this.object = cube


            }
                break

            case "backspace":
            case "delete":
            case 'x':
                this.object.hide()
                break
            case "o":
                if (followObject.round) followObject.round()


        }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('touchstart', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchend', onMouseUp)
    document.addEventListener('keyup', onKeyUp)

    function onMouseUp(e) {
        if (clicker) {
            e.preventDefault()
            clearInterval(clicker)
            clicker = 0

            normalize()
        }
    }
    function onMouseDown(e) {
        if (e.target.className === 'button') {
            e.preventDefault()
            clicker = setInterval(() => { e.target.click() }, 30)
        }
    }
    this.update = () => {
        const elapsedTime = clock.getElapsedTime();
        if (camera.position.y < 0.555) camera.position.y = 0.555;
        if (this.simulation) {
            for (i of scene.children) {
                i.__dirtyPosition = true;
                i.__dirtyRotation = true;
            }


            scene.simulate()
        }
        //stats.update(); 
        renderer.render(scene, camera);
    }

    this.onWindowResize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function onMouseMove() {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        var vector = new THREE.Vector3(mouse.x, mouse.y, 2);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        let axis = 'z';
        let distance;
        distance = - camera.position[axis] / dir[axis];
        mousePos = camera.position.clone().add(dir.multiplyScalar(distance));
    }
    this.loadTexture = (name, color) => {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(name)
        setTexture(texture)
        if (this.object) {
            this.object.material = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                opacity: 1,
                roughness: 1,
                metalness: 0,
                color: new THREE.Color(color)
            })
        }


    }
    const cancelMovement = () => {
        let { x, y, z } = initialPos

        this.object.apos({ x, y, z })

    }
    this.add = function (...arguments) {
        arguments.forEach(o => { scene.add(o); this.objects.push(o) })

    }
    this.setColor = (color) => {
        this.baseColor = color
        if (this.object && typeof this.object.color === 'function' && !this.paintMode) {
            this.object.color(color)
        }
        else if (this.object?.light) {
            this.object.children[0].color = new THREE.Color(color).convertSRGBToLinear()
            this.object.material = new THREE.MeshStandardMaterial({ color, emissive: color })
            this.object.material.emissiveIntensity = 2



        } else { this.baseColor = color }
    }

    this.background = function (c) {
        scene.background = new THREE.Color(c)
    }
    // Loaders
    this.loadGLTF = function (path) {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(path, (gltf) => {
            const mesh = gltf.scene;
            scene.add(mesh);
        })
    }
    this.clearTexture = () => {
        setTexture(undefined)
        if (this.object) {
            this.object.material = new THREE.MeshStandardMaterial({
                map: undefined,
                transparent: true,
                opacity: 1,
                roughness: 1,
                metalness: 0.2,
                bumpScale: 1,
                color: new THREE.Color(this.baseColor).convertSRGBToLinear()
            })
        }
        gsap.set('#texture-cover', { display: 'block' })
        document.getElementById('texture-image').src = "";
    }

    // Primitives

    this.cube = function (w, h, d, c) {
        if (!w) {
            w = baseSize.w
            h = baseSize.h
            d = baseSize.d,
                c = new THREE.Color(this.baseColor).convertSRGBToLinear()
        }
        if (typeof c === 'string') c = new THREE.Color(c).convertSRGBToLinear()
        let g = roundness ? createBoxWithRoundedEdges(w, h, d, roundness || 0, 10) : new THREE.BoxGeometry(w, h, d)
        let m = new THREE.MeshStandardMaterial({
            roughness: 0.5,
            color: c,
            metalness: 0.2,
            map: baseTexture,
            transparent: true,
            opacity: 1
        });
        let cube = new Physijs.BoxMesh(g, m)
        cube.type = 'cube'
        cube.width = w
        cube.height = h
        cube.depth = d
        cube.roundness = roundness


        if (this.baseScale) cube.scale.set(this.baseScale.x, this.baseScale.y, this.baseScale.z)
        if (this.baseRotation) cube.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z)
        if (cube.position.y < cube.scale.y / 2) cube.position.y = cube.scale.y / 2



        registerMethods(cube)
        setShadow(cube)
        followObject = cube;
        this.object = cube;
        return cube

    }
    this.cylinder = function (r, h, c) {
        if (!r) {
            r = .5
            h = baseSize.h
            c = new THREE.Color(this.baseColor).convertSRGBToLinear()
        }
        if (typeof c === 'string') c = new THREE.Color(c).convertSRGBToLinear()
        let g = new THREE.CylinderGeometry(r, r, h, 32)
        let m = new THREE.MeshStandardMaterial({
            roughness: 0.5,
            color: c,
            metalness: 0.2,
            map: baseTexture,
            transparent: true,
            opacity: 1
        });
        let cylinder = new Physijs.CylinderMesh(g, m)
        cylinder.type = 'cylinder'
        cylinder.height = h
        cylinder.roundness = roundness

        if (this.object) cylinder.position.set(this.object.position.x + (this.baseScale?.x || this.object.scale.x) + .2, this.object.position.y, this.object.position.z)
        if (this.baseScale) cylinder.scale.set(this.baseScale.x, this.baseScale.y, this.baseScale.z)
        if (this.baseRotation) cylinder.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z)
        if (cylinder.position.y < cylinder.scale.y / 2) cylinder.position.y = cylinder.scale.y / 2

        registerMethods(cylinder)
        setShadow(cylinder)
        followObject = cylinder;
        this.object = cylinder;
        return cylinder

    }
    function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
        let shape = new THREE.Shape();
        let eps = 0.00001;
        let radius = radius0 - eps;
        shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
        shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
        shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
        shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
        let geometry = new THREE.ExtrudeBufferGeometry(shape, {
            amount: depth - radius0 * 2,
            bevelEnabled: true,
            bevelSegments: smoothness * 2,
            steps: 1,
            bevelSize: radius,
            bevelThickness: radius0,
            curveSegments: smoothness
        });

        geometry.center();

        return geometry;
    }

    this.cone = function (r, h, c) {
        var g = new THREE.ConeGeometry(r || 5, h || 20, 32);
        let m = new THREE.MeshStandardMaterial({
            roughness: 0.5,
            color: new THREE.Color(this.baseColor).convertSRGBToLinear(),
            metalness: 0.2,
            map: baseTexture
        });
        var cone = new Physijs.ConeMesh(g, m);
        cone.position.y += cone.scale.y / 2
        cone.type = 'cone'
        registerMethods(cone)
        setShadow(cone)
        return cone;
    }
    this.sphere = function (r, w, h, c) {
        if (!r) {
            r = .5,
                w = 32,
                h = 32,
                c = new THREE.Color(this.baseColor).convertSRGBToLinear()
        }
        if (typeof c === 'string') c = new THREE.Color(c).convertSRGBToLinear()

        let g = new THREE.SphereGeometry(r, w, h)
        let m = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            color: c,
            metalness: 0.2,
            map: this.baseTexture,
            transparent: true,
            opacity: 1,
        });
        let sphere = new Physijs.SphereMesh(g, m, 1)
        sphere.type = 'sphere'
        sphere.height = r * 2;
        sphere.radius = r
        sphere.position.y += sphere.scale.y / 2

        if (this.baseScale) sphere.scale.set(this.baseScale.x, this.baseScale.y, this.baseScale.z)
        if (this.baseRotation) sphere.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z)
        if (sphere.position.y < sphere.scale.y / 2) sphere.position.y = sphere.scale.y / 2

        registerMethods(sphere)
        setShadow(sphere)
        this.object = sphere
        return sphere
    }

    const scene = buildScene();
    const renderer = buildRender(screenDimensions);
    const camera = buildCamera(screenDimensions);
    const sceneSubjects = createSceneSubjects(scene);

}

