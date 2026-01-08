import { nodes, edges } from "./GameObjects.js";
import { MarkovEngine } from "./MarkovEngine.js";

let engine;

let THREERef = null;
let OrbitControlsClass = null;

function setShadow(...objects) {
    objects.forEach(obj => {
        if (!obj) return;
        obj.castShadow = true;
        obj.receiveShadow = true;
    });
}

function buildBalloon() {
    const THREE = THREERef;
    const group = new THREE.Group();
    const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(10, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xff4d6d, roughness: 0.35 })
    );
    balloon.position.y = 32;
    const knot = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 3, 12),
        new THREE.MeshStandardMaterial({ color: 0xff4d6d })
    );
    knot.position.y = 23.5;
    knot.rotation.x = Math.PI;
    const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 20, 10),
        new THREE.MeshStandardMaterial({ color: 0x464646, metalness: 0.2, roughness: 0.8 })
    );
    string.position.y = 12;
    const basket = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 4, 16),
        new THREE.MeshStandardMaterial({ color: 0xc48a3a, roughness: 0.7 })
    );
    basket.position.y = 2;
    group.add(balloon, knot, string, basket);
    setShadow(balloon, knot, string, basket);
    group.userData.balloon = {
        mesh: balloon,
        string,
        baseY: balloon.position.y,
        active: false,
        time: 0,
        token: 0
    };
    return group;
}

function buildSandbox() {
    const THREE = THREERef;
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(30, 4, 30),
        new THREE.MeshStandardMaterial({ color: 0xd99932, roughness: 0.6 })
    );
    frame.position.y = 2;
    const sand = new THREE.Mesh(
        new THREE.BoxGeometry(26, 2, 26),
        new THREE.MeshStandardMaterial({ color: 0xf5d28b, roughness: 0.8 })
    );
    sand.position.y = 4;
    group.add(frame, sand);
    setShadow(frame, sand);
    return group;
}

function buildTree() {
    const THREE = THREERef;
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.8, 18, 12),
        new THREE.MeshStandardMaterial({ color: 0x8d5a2b, roughness: 0.8 })
    );
    trunk.position.y = 9;
    const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(14, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.45 })
    );
    foliage.position.y = 24;
    group.add(trunk, foliage);
    setShadow(trunk, foliage);
    group.userData.hide = {
        behind: new THREE.Vector3(-3, 5.5, -6),
        peek: new THREE.Vector3(-3, 6, -2.5)
    };
    return group;
}

function buildSlide() {
    const THREE = THREERef;
    const group = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(22, 2, 22),
        new THREE.MeshStandardMaterial({ color: 0x1e6091, roughness: 0.45 })
    );
    base.position.y = 1;

    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(12, 2, 12),
        new THREE.MeshStandardMaterial({ color: 0xf3722c, roughness: 0.4 })
    );
    platform.position.set(-5, 12, -6);

    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0xf8961e, roughness: 0.4 });
    const railFront = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 10, 12), railingMaterial);
    railFront.position.set(-10, 12, -10);
    railFront.rotation.z = Math.PI / 2;
    const railBack = railFront.clone();
    railBack.position.z = -2;
    const railSide = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 10, 12), railingMaterial);
    railSide.position.set(-5, 16, -12);
    railSide.rotation.x = Math.PI / 2;

    const stepMaterial = new THREE.MeshStandardMaterial({ color: 0xffba08, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 6), stepMaterial);
        step.position.set(-10 + i * 2.6, 4 + i * 2, -8);
        group.add(step);
        setShadow(step);
    }

    const slidePath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 12, -4),
        new THREE.Vector3(4, 10, 0),
        new THREE.Vector3(10, 5, 6),
        new THREE.Vector3(16, 1.5, 10)
    ], false, 'centripetal');
    const slideWidth = 4;
    const slideThickness = 1.2;
    const shape = new THREE.Shape();
    shape.moveTo(-slideWidth / 2, 0);
    shape.lineTo(slideWidth / 2, 0);
    shape.lineTo(slideWidth / 2, -slideThickness);
    shape.lineTo(-slideWidth / 2, -slideThickness);
    shape.lineTo(-slideWidth / 2, 0);
    const extrudeSettings = {
        steps: 40,
        bevelEnabled: false,
        extrudePath: slidePath
    };
    const slideGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const slideMaterial = new THREE.MeshStandardMaterial({ color: 0x4cc9f0, metalness: 0.15, roughness: 0.3 });
    const slideSurface = new THREE.Mesh(slideGeom, slideMaterial);

    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x264653, roughness: 0.5 });
    const support1 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 14, 12), supportMaterial);
    support1.position.set(8, 7, 9);
    const support2 = support1.clone();
    support2.position.set(14, 6, 12);

    const guardLeftPath = new THREE.CatmullRomCurve3(slidePath.points.map(p => p.clone().add(new THREE.Vector3(-slideWidth / 2 - 0.6, 0.8, 0))));
    const guardRightPath = new THREE.CatmullRomCurve3(slidePath.points.map(p => p.clone().add(new THREE.Vector3(slideWidth / 2 + 0.6, 0.8, 0))));
    const guardGeom = new THREE.TubeGeometry(guardLeftPath, 40, 0.45, 8, false);
    const guardGeomRight = new THREE.TubeGeometry(guardRightPath, 40, 0.45, 8, false);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xf9844a, roughness: 0.45 });
    const guardLeft = new THREE.Mesh(guardGeom, guardMat);
    const guardRight = new THREE.Mesh(guardGeomRight, guardMat);

    slideSurface.castShadow = true;
    slideSurface.receiveShadow = true;

    group.add(base, platform, railFront, railBack, railSide, slideSurface, support1, support2, guardLeft, guardRight);
    setShadow(base, platform, railFront, railBack, railSide, slideSurface, support1, support2, guardLeft, guardRight);

    group.userData.anchor = new THREE.Vector3(-6, 12, -6);
    group.userData.slide = {
        path: slidePath,
        duration: 1.9
    };

    return group;
}

function buildSwing() {
    const THREE = THREERef;
    const group = new THREE.Group();
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1b4965, roughness: 0.5 });

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 24, 16), frameMaterial);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 16;

    const legGeom = new THREE.CylinderGeometry(1.3, 1.3, 22, 16);
    const legOffset = 10;
    const legDepth = 5;
    const legAngle = Math.PI / 10;
    const legs = [];
    [[-legOffset, -legDepth, legAngle], [legOffset, -legDepth, -legAngle], [-legOffset, legDepth, legAngle], [legOffset, legDepth, -legAngle]].forEach(([x, z, rot]) => {
        const leg = new THREE.Mesh(legGeom, frameMaterial);
        leg.position.set(x, 9, z);
        leg.rotation.z = rot;
        legs.push(leg);
    });

    const braceMaterial = new THREE.MeshStandardMaterial({ color: 0x264653, roughness: 0.5 });
    const braceFront = new THREE.Mesh(new THREE.BoxGeometry(20, 1.2, 1.2), braceMaterial);
    braceFront.position.set(0, 4, legDepth);
    const braceBack = braceFront.clone();
    braceBack.position.z = -legDepth;

    const pivot = new THREE.Group();
    pivot.position.set(0, 16, 0);

    const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0xf7b538, roughness: 0.65 });
    const ropeLength = 12;
    const ropeGeom = new THREE.CylinderGeometry(0.35, 0.35, ropeLength, 12);
    const ropeOffset = 4;
    const ropeLeft = new THREE.Mesh(ropeGeom, ropeMaterial);
    ropeLeft.position.set(-ropeOffset, -ropeLength / 2, 0);
    const ropeRight = ropeLeft.clone();
    ropeRight.position.x = ropeOffset;

    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.2, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x6a040f, roughness: 0.35 })
    );
    seat.position.set(0, -ropeLength, 0);

    pivot.add(ropeLeft, ropeRight, seat);

    group.add(beam, braceFront, braceBack, pivot, ...legs);
    setShadow(beam, braceFront, braceBack, ropeLeft, ropeRight, seat, ...legs);

    const seatAnchor = new THREE.Vector3(0, -ropeLength, 0);
    group.userData.swing = {
        pivot,
        seatAnchor,
        girlOffset: new THREE.Vector3(0, 6, 0),
        getSeatWorld() {
            return pivot.localToWorld(seatAnchor.clone());
        },
        reset() {
            pivot.rotation.set(0, 0, 0);
        }
    };

    return group;
}

function buildTrain() {
    const THREE = THREERef;
    const group = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(30, 10, 14),
        new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.4 })
    );
    body.position.y = 9;
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(12, 10, 12),
        new THREE.MeshStandardMaterial({ color: 0x457b9d, roughness: 0.4 })
    );
    cabin.position.set(8, 14, 0);
    const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.8, 8, 12),
        new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.3 })
    );
    chimney.position.set(-10, 16, 0);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0xff5400, roughness: 0.5 });
    const wheelGeom = new THREE.CylinderGeometry(3.2, 3.2, 2, 16);
    const wheels = [];
    [-10, 10].forEach(x => {
        const left = new THREE.Mesh(wheelGeom, wheelMaterial);
        left.rotation.z = Math.PI / 2;
        left.position.set(x, 3, -7);
        const right = left.clone();
        right.position.z = 7;
        wheels.push(left, right);
    });
    group.add(body, cabin, chimney, ...wheels);
    setShadow(body, cabin, chimney, ...wheels);
    group.userData.train = {
        entry: new THREE.Vector3(-14, 4, -6),
        top: new THREE.Vector3(4, 16, 0)
    };
    return group;
}

function buildPlayStructure(name) {
    const lower = name.toLowerCase();
    if (lower.includes("ballon")) return buildBalloon();
    if (lower.includes("sable")) return buildSandbox();
    if (lower.includes("cache")) return buildTree();
    if (lower.includes("toboggan")) return buildSlide();
    if (lower.includes("balan")) return buildSwing();
    if (lower.includes("train")) return buildTrain();
    return buildSandbox();
}

function buildGirl() {
    const THREE = THREERef;
    const group = new THREE.Group();
    const dress = new THREE.Mesh(
        new THREE.ConeGeometry(4.8, 12, 28, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xeb5e82, roughness: 0.38 })
    );
    dress.position.y = 6;
    const belt = new THREE.Mesh(
        new THREE.TorusGeometry(3.4, 0.5, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.3 })
    );
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 7.5;

    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x5e548e, roughness: 0.4 });
    const legGeom = new THREE.CylinderGeometry(0.9, 0.9, 6, 12);
    const leftLeg = new THREE.Mesh(legGeom, legMaterial);
    leftLeg.position.set(-1.4, 3, 0.6);
    const rightLeg = leftLeg.clone();
    rightLeg.position.set(1.4, 3, 0.6);

    const shoeGeom = new THREE.CapsuleGeometry(1.1, 1.4, 6, 12);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x22223b, roughness: 0.3 });
    const leftShoe = new THREE.Mesh(shoeGeom, shoeMat);
    leftShoe.position.set(-1.4, 0.2, 1.2);
    leftShoe.rotation.x = Math.PI / 12;
    const rightShoe = leftShoe.clone();
    rightShoe.position.x = 1.4;

    const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.8, 4.6, 20),
        new THREE.MeshStandardMaterial({ color: 0xff92c2, roughness: 0.35 })
    );
    torso.position.y = 10.5;

    const armGeom = new THREE.CylinderGeometry(0.7, 0.7, 5.2, 16);
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffddb5, roughness: 0.6 });
    const leftArm = new THREE.Mesh(armGeom, skinMaterial);
    leftArm.position.set(-3.4, 10.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    const rightArm = leftArm.clone();
    rightArm.position.x = 3.4;
    rightArm.rotation.z = -Math.PI / 4;

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(3.4, 28, 28),
        new THREE.MeshStandardMaterial({ color: 0xffddb5, roughness: 0.5 })
    );
    head.position.y = 15.5;

    const fringe = new THREE.Mesh(
        new THREE.SphereGeometry(3.7, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2.1),
        new THREE.MeshStandardMaterial({ color: 0x2f1b13, roughness: 0.4 })
    );
    fringe.position.y = 16.2;

    const ponytail = new THREE.Mesh(
        new THREE.CapsuleGeometry(1.1, 4.5, 12, 18),
        new THREE.MeshStandardMaterial({ color: 0x2f1b13, roughness: 0.4 })
    );
    ponytail.rotation.x = Math.PI / 8;
    ponytail.position.set(0, 15.8, -3.2);

    const eyeGeom = new THREE.SphereGeometry(0.4, 12, 12);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 });
    const leftEye = new THREE.Mesh(eyeGeom, whiteMat);
    leftEye.position.set(-1.1, 16.1, 3);
    const rightEye = leftEye.clone();
    rightEye.position.x = 1.1;
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), pupilMat);
    leftPupil.position.set(-1.1, 16.1, 3.4);
    const rightPupil = leftPupil.clone();
    rightPupil.position.x = 1.1;

    const smile = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.16, 8, 20, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x9e2a2b, roughness: 0.3 })
    );
    smile.rotation.set(Math.PI, 0, 0);
    smile.position.set(0, 14.6, 3.3);

    group.add(dress, belt, torso, leftLeg, rightLeg, leftShoe, rightShoe, leftArm, rightArm, head, fringe, ponytail, leftEye, rightEye, leftPupil, rightPupil, smile);
    setShadow(dress, belt, torso, leftLeg, rightLeg, leftShoe, rightShoe, leftArm, rightArm, head, fringe, ponytail, leftEye, rightEye, leftPupil, rightPupil, smile);
    return group;
}

export async function loadMarkovPage() {
    const app = document.getElementById("app");
    if (!app) return;

    const floatingPanel = document.querySelector('.right-panel');
    if (floatingPanel) floatingPanel.remove();

    if (!THREERef || !OrbitControlsClass) {
        app.innerHTML = `
            <div class="game-area-3d loading">
                <h2>Chargement de la scène 3D...</h2>
                <p>Merci de patienter, les ressources nécessaires sont en cours de récupération.</p>
            </div>
        `;
        try {
            const [threeModule, controlsModule] = await Promise.all([
                import('https://unpkg.com/three@0.159.0/build/three.module.js?module'),
                import('https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js?module')
            ]);
            THREERef = threeModule;
            OrbitControlsClass = controlsModule.OrbitControls;
        } catch (err) {
            console.error('Impossible de charger Three.js', err);
            app.innerHTML = `
                <div class="game-area-3d error">
                    <h2>Erreur de chargement de la scène 3D</h2>
                    <p>Le chargement de Three.js a échoué. Vérifie ta connexion Internet et réessaie.</p>
                    <button id="retry-3d" class="tn-button">Réessayer</button>
                </div>
            `;
            const retry = document.getElementById('retry-3d');
            if (retry) retry.addEventListener('click', () => loadMarkovPage());
            return;
        }
    }

    const THREE = THREERef;

    app.innerHTML = `
        <div id="game-area" class="game-area-3d">
            <h2>Chaîne de Markov - Aire de jeux 3D</h2>
            <p class="game-intro">
                Observe Lily-May évoluer dans l'aire de jeux 3D et suis les transitions du graphe pour comprendre la chaîne de Markov.
            </p>
            <div id="playground3d" class="playground-3d"></div>
            <div id="controls">
                <button id="start-btn" class="tn-button">Démarrer</button>
                <button id="stop-btn" class="tn-button red">Arrêter</button>
                <button id="replay-btn" class="tn-button ghost">Rejouer</button>
            </div>
        </div>
    `;

    const container = document.getElementById('playground3d');
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const overlay = document.createElement('div');
    overlay.className = 'visit-overlay';
    container.appendChild(overlay);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe0ff);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 140, 240);

    const controls = new OrbitControlsClass(camera, renderer.domElement);
    controls.target.set(0, 24, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    const clock = new THREE.Clock();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x476072, 0.75);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(120, 160, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 400;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(640, 420),
        new THREE.MeshStandardMaterial({ color: 0xf7f9fc, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pathPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(640, 420),
        new THREE.MeshStandardMaterial({ color: 0xe7f1ff, side: THREE.DoubleSide, roughness: 0.95 })
    );
    pathPlane.position.y = 0.01;
    pathPlane.rotation.x = -Math.PI / 2;
    scene.add(pathPlane);

    const scaleFactor = 0.7;
    const nodePositions = {};
    Object.entries(nodes).forEach(([id, data]) => {
        const pos = new THREE.Vector3(
            (data.x - 450) * scaleFactor,
            0,
            (data.y - 220) * scaleFactor
        );
        nodePositions[id] = pos;
    });

    const nodeRadius = {
        1: 30,
        2: 26,
        3: 26,
        4: 28,
        5: 28,
        6: 30
    };

    const nodeGroups = {};
    Object.entries(nodePositions).forEach(([id, pos]) => {
        const group = buildPlayStructure(nodes[id].name);
        group.position.copy(pos);
        nodeGroups[id] = group;
        scene.add(group);
    });

    const girlBaseOffset = new THREE.Vector3(0, 0, 0);
    const nodeAnchorResolvers = {};
    Object.keys(nodePositions).forEach(id => {
        nodeAnchorResolvers[id] = () => (nodePositions[id] || new THREE.Vector3()).clone().add(girlBaseOffset);
    });

    Object.entries(nodeGroups).forEach(([id, group]) => {
        if (group.userData && group.userData.anchor) {
            nodeAnchorResolvers[id] = () => group.localToWorld(group.userData.anchor.clone());
        }
    });

    const swingData = nodeGroups['5'] && nodeGroups['5'].userData && nodeGroups['5'].userData.swing ? nodeGroups['5'].userData.swing : null;
    let girl = null;
    if (swingData) {
        nodeAnchorResolvers['5'] = () => {
            const seat = swingData.getSeatWorld();
            return seat.add(swingData.girlOffset.clone());
        };
    }

    const swingState = swingData ? {
        active: false,
        follow: false,
        time: 0,
        amplitude: 0.5,
        phase: 0
    } : null;

    const slideGroup = nodeGroups['4'] || null;
    const slideInfo = slideGroup && slideGroup.userData && slideGroup.userData.slide ? slideGroup.userData.slide : null;
    if (slideInfo) slideInfo.group = slideGroup;
    const slideState = slideInfo ? {
        active: false,
        time: 0,
        resolve: null,
        token: 0,
        offset: new THREE.Vector3(0, 5.6, 0)
    } : null;

    const treeGroup = nodeGroups['3'] || null;
    const treeInfo = treeGroup && treeGroup.userData && treeGroup.userData.hide ? treeGroup.userData.hide : null;
    if (treeInfo) treeInfo.group = treeGroup;

    const trainGroup = nodeGroups['6'] || null;
    const trainInfo = trainGroup && trainGroup.userData && trainGroup.userData.train ? trainGroup.userData.train : null;
    if (trainInfo) trainInfo.group = trainGroup;

    const balloonGroup = nodeGroups['1'] || null;
    const balloonInfo = balloonGroup && balloonGroup.userData && balloonGroup.userData.balloon ? balloonGroup.userData.balloon : null;
    if (balloonInfo) {
        balloonInfo.group = balloonGroup;
    }

    const balloonState = balloonInfo ? {
        active: false,
        time: 0,
        token: 0
    } : null;

    let arrivalToken = 0;

    function resetArrivalAnimations({ skipSwing = false } = {}) {
        arrivalToken++;
        if (!skipSwing) {
            stopSwingAnimation();
        }
        if (slideState && slideState.active) {
            slideState.active = false;
            if (slideState.resolve) {
                slideState.resolve();
            }
            slideState.resolve = null;
            slideState.time = 0;
        }
        if (balloonState && balloonInfo) {
            balloonState.active = false;
            balloonState.time = 0;
            balloonState.token = arrivalToken;
            balloonInfo.mesh.position.y = balloonInfo.baseY;
            balloonInfo.mesh.position.x = 0;
            balloonInfo.mesh.rotation.z = 0;
            balloonInfo.string.scale.set(1, 1, 1);
        }
    }

    function waitMs(ms, token) {
        if (!ms) return Promise.resolve();
        return new Promise(resolve => {
            const start = performance.now();
            const step = now => {
                if (token !== arrivalToken) {
                    resolve();
                    return;
                }
                if (now - start >= ms) {
                    resolve();
                } else {
                    requestAnimationFrame(step);
                }
            };
            requestAnimationFrame(step);
        });
    }

    function easeInOut(t) {
        return t * t * (3 - 2 * t);
    }

    function animatePositionTo(target, duration, token) {
        if (!girl) return Promise.resolve();
        if (duration <= 0) {
            girl.position.copy(target);
            girl.lookAt(target.clone().add(new THREE.Vector3(0.1, 0.2, 0.1)));
            return Promise.resolve();
        }
        const start = girl.position.clone();
        return new Promise(resolve => {
            const startTime = performance.now();
            const step = now => {
                if (token !== arrivalToken) {
                    resolve();
                    return;
                }
                const t = Math.min((now - startTime) / duration, 1);
                const eased = easeInOut(t);
                girl.position.lerpVectors(start, target, eased);
                const lookTarget = target.clone();
                lookTarget.y = girl.position.y + 1.2;
                girl.lookAt(lookTarget);
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }

    function startSlideAnimation(token) {
        if (!slideInfo || !slideState || !girl) return Promise.resolve();
        slideState.active = true;
        slideState.time = 0;
        slideState.token = token;
        const top = slideInfo.path.getPoint(0).clone();
        const topWorld = slideInfo.group.localToWorld(top);
        girl.position.copy(topWorld.clone().add(slideState.offset));
        const firstStep = slideInfo.path.getPoint(0.08).clone();
        const firstWorld = slideInfo.group.localToWorld(firstStep);
        girl.lookAt(firstWorld.add(slideState.offset.clone()));
        return new Promise(resolve => {
            slideState.resolve = () => {
                if (slideState.resolve) {
                    slideState.resolve = null;
                    resolve();
                }
            };
        });
    }

    function updateSlide(delta) {
        if (!slideInfo || !slideState || !slideState.active || slideState.token !== arrivalToken || !girl) return;
        slideState.time += delta;
        const tRaw = slideState.time / (slideInfo.duration || 1.8);
        const t = Math.min(tRaw, 1);
        const localPoint = slideInfo.path.getPoint(t).clone();
        const worldPoint = slideInfo.group.localToWorld(localPoint);
        const ridePosition = worldPoint.clone().add(slideState.offset);
        girl.position.copy(ridePosition);
        const nextPoint = slideInfo.path.getPoint(Math.min(t + 0.02, 1)).clone();
        const worldNext = slideInfo.group.localToWorld(nextPoint);
        const lookPos = worldNext.clone().add(slideState.offset);
        girl.lookAt(lookPos);
        if (t >= 1) {
            slideState.active = false;
            const bottomPoint = slideInfo.path.getPoint(1).clone();
            const bottomWorld = slideInfo.group.localToWorld(bottomPoint);
            girl.position.copy(bottomWorld.add(slideState.offset));
            if (slideState.resolve) {
                slideState.resolve();
                slideState.resolve = null;
            }
        }
    }

    function startBalloonAnimation(token) {
        if (!balloonInfo || !balloonState) return;
        balloonState.active = true;
        balloonState.time = 0;
        balloonState.token = token;
    }

    function updateBalloon(delta) {
        if (!balloonInfo || !balloonState || !balloonState.active) return;
        if (balloonState.token !== arrivalToken) {
            balloonState.active = false;
            return;
        }
        balloonState.time += delta;
        const wobble = Math.sin(balloonState.time * 4) * 2.5;
        balloonInfo.mesh.position.y = balloonInfo.baseY + Math.sin(balloonState.time * 1.6) * 3.5;
        balloonInfo.mesh.position.x = Math.sin(balloonState.time * 1.3) * 1.2;
        balloonInfo.mesh.rotation.z = THREE.MathUtils.degToRad(wobble);
        const stretch = 1 + Math.sin(balloonState.time * 2.8) * 0.06;
        balloonInfo.string.scale.set(1, stretch, 1);
        if (balloonState.time >= 4.5) {
            balloonState.active = false;
            balloonInfo.mesh.position.y = balloonInfo.baseY;
            balloonInfo.mesh.position.x = 0;
            balloonInfo.mesh.rotation.z = 0;
            balloonInfo.string.scale.set(1, 1, 1);
        }
    }

    function startSwingAnimation() {
        if (!swingData || !swingState) return;
        swingData.reset();
        swingState.active = true;
        swingState.follow = true;
        swingState.time = 0;
        swingState.amplitude = 0.6;
        swingState.phase = Math.PI / 3;
        if (girl) {
            const seatWorld = swingData.getSeatWorld().add(swingData.girlOffset.clone());
            girl.position.copy(seatWorld);
            const forwardLocal = swingData.seatAnchor.clone().add(new THREE.Vector3(0, -2, -6));
            const lookTarget = swingData.pivot.localToWorld(forwardLocal);
            girl.lookAt(lookTarget);
        }
    }

    function stopSwingAnimation() {
        if (!swingData || !swingState) return;
        swingState.active = false;
        swingState.follow = false;
        swingState.time = 0;
        swingData.reset();
        if (girl) {
            const forward = girl.position.clone().add(new THREE.Vector3(0.2, 0, 0.2));
            girl.lookAt(forward);
        }
    }

    async function runTreeHideSequence(token) {
        if (!treeInfo || !treeGroup || !girl) return;
        const behindWorld = treeGroup.localToWorld(treeInfo.behind.clone());
        const peekWorld = treeGroup.localToWorld(treeInfo.peek.clone());
        const anchorWorld = getAnchorPosition('3');
        await animatePositionTo(behindWorld, 520, token);
        if (token !== arrivalToken) return;
        await waitMs(200, token);
        for (let i = 0; i < 2; i++) {
            await animatePositionTo(peekWorld, 340, token);
            if (token !== arrivalToken) return;
            await waitMs(220, token);
            await animatePositionTo(behindWorld, 320, token);
            if (token !== arrivalToken) return;
            await waitMs(180, token);
        }
        await animatePositionTo(anchorWorld, 440, token);
    }

    async function runTrainBoardingSequence(token) {
        if (!trainInfo || !trainGroup || !girl) return;
        const entry = trainGroup.localToWorld(trainInfo.entry.clone());
        const top = trainGroup.localToWorld(trainInfo.top.clone());
        const approach = entry.clone();
        approach.y += 2.5;
        await animatePositionTo(entry, 520, token);
        if (token !== arrivalToken) return;
        await animatePositionTo(approach, 320, token);
        if (token !== arrivalToken) return;
        const hopPeak = top.clone().add(new THREE.Vector3(0, 5, 0));
        await animatePositionTo(hopPeak, 360, token);
        if (token !== arrivalToken) return;
        await animatePositionTo(top, 320, token);
        if (token !== arrivalToken) return;
        await waitMs(400, token);
        const lookTarget = top.clone().add(new THREE.Vector3(6, 2, 12));
        girl.lookAt(lookTarget);
    }

    function getAnchorPosition(nodeId) {
        const resolver = nodeAnchorResolvers[String(nodeId)];
        if (resolver) {
            return resolver();
        }
        return (nodePositions[String(nodeId)] || new THREE.Vector3()).clone();
    }

    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);
    const arrowMaterial = new THREE.LineBasicMaterial({ color: 0x102037 });
    const arrowHeadMaterial = new THREE.MeshStandardMaterial({ color: 0x102037, roughness: 0.3 });

    function addArrow(fromId, toId, curved = false) {
        const from = nodePositions[fromId];
        const to = nodePositions[toId];
        if (!from || !to) return;

        if (curved) {
            const startDir = new THREE.Vector3().subVectors(to, from).normalize();
            const start = from.clone().add(startDir.clone().multiplyScalar((nodeRadius[fromId] || 24)));
            const end = to.clone().add(startDir.clone().multiplyScalar(-(nodeRadius[toId] || 24)));
            const control = start.clone().add(end).multiplyScalar(0.5);
            control.x += 45;
            control.y += 24;
            control.z += 20;
            const curve = new THREE.QuadraticBezierCurve3(start, control, end);
            const points = curve.getPoints(48);
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            arrowGroup.add(new THREE.Line(geom, arrowMaterial));
            const tangent = curve.getTangent(0.98).normalize();
            const cone = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 12), arrowHeadMaterial);
            cone.position.copy(end);
            cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            setShadow(cone);
            arrowGroup.add(cone);
            return;
        }

        const direction = new THREE.Vector3().subVectors(to, from).normalize();
        const origin = from.clone().add(direction.clone().multiplyScalar((nodeRadius[fromId] || 24)));
        const end = to.clone().add(direction.clone().multiplyScalar(-(nodeRadius[toId] || 24)));

        const mutual = edges[toId] && edges[toId].includes(Number(fromId));
        if (mutual) {
            const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(5);
            const adjust = Number(fromId) < Number(toId) ? side : side.clone().multiplyScalar(-1);
            origin.add(adjust);
            end.add(adjust);
        }

        const headLength = 8;
        const shaftEnd = end.clone().add(direction.clone().multiplyScalar(-headLength));
        const points = [origin, shaftEnd];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        arrowGroup.add(new THREE.Line(geometry, arrowMaterial));

        const cone = new THREE.Mesh(new THREE.ConeGeometry(3, headLength, 12), arrowHeadMaterial);
        cone.position.copy(end);
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        setShadow(cone);
        arrowGroup.add(cone);
    }

    Object.entries(edges).forEach(([from, arr]) => {
        arr.forEach(to => {
            if (Number(from) === 5 && Number(to) === 1) {
                addArrow(Number(from), Number(to), true);
            } else {
                addArrow(Number(from), Number(to));
            }
        });
    });

    const visitCardOffsets = {
        '1': { x: -120, y: -26 },
        '2': { x: 120, y: -26 },
        '3': { x: -120, y: -8 },
        '4': { x: 120, y: -8 },
        '5': { x: -120, y: -8 },
        '6': { x: 120, y: -8 }
    };

    const visitDisplayRecords = {};
    Object.entries(nodePositions).forEach(([id, pos]) => {
        const name = nodes[id].name || `Jeu ${id}`;
        const card = document.createElement('div');
        card.className = 'visit-card';
        card.innerHTML = `
            <div class="visit-card-title">${name}</div>
            <div class="visit-card-stats">
                <div class="visit-card-item">
                    <span class="visit-card-label">visites</span>
                    <span class="visit-card-value" data-role="count">0</span>
                </div>
                <div class="visit-card-item">
                    <span class="visit-card-label">fréquence</span>
                    <span class="visit-card-value" data-role="freq">0.000000</span>
                </div>
            </div>
        `;
        overlay.appendChild(card);
        visitDisplayRecords[id] = {
            element: card,
            position: pos,
            offset: visitCardOffsets[id] || { x: 0, y: 0 },
            countEl: card.querySelector('[data-role="count"]'),
            freqEl: card.querySelector('[data-role="freq"]')
        };
    });

    girl = buildGirl();
    const initialAnchor = getAnchorPosition('1');
    girl.position.copy(initialAnchor);
    girl.lookAt(initialAnchor.clone().add(new THREE.Vector3(0.1, 0, 0.1)));
    scene.add(girl);
    stopSwingAnimation();

    let activeMoveCancel = null;
    function moveCharacterTo(nodeId, duration) {
        const target = getAnchorPosition(nodeId);
        if (!target) return Promise.resolve();

        if (Number(nodeId) !== 5) {
            stopSwingAnimation();
        }

        if (!duration || duration <= 0) {
            girl.position.copy(target);
            girl.lookAt(target.clone().add(new THREE.Vector3(0.1, 0.1, 0.1)));
            return handleArrival(nodeId);
        }

        const start = girl.position.clone();
        const travelTime = Math.max(duration, 320);
        if (activeMoveCancel) activeMoveCancel(false);
        let stopped = false;

        return new Promise(resolve => {
            const startTime = performance.now();
            activeMoveCancel = (runArrival = true) => {
                if (stopped) return;
                stopped = true;
                girl.position.copy(target);
                girl.lookAt(target.clone().add(new THREE.Vector3(0.2, 0.1, 0.2)));
                activeMoveCancel = null;
                if (runArrival) {
                    handleArrival(nodeId).then(resolve);
                } else {
                    resolve();
                }
            };

            const step = now => {
                if (stopped) return;
                const t = Math.min((now - startTime) / travelTime, 1);
                girl.position.lerpVectors(start, target, t);
                const lookTarget = target.clone();
                lookTarget.y = girl.position.y + 1.5;
                girl.lookAt(lookTarget);
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    stopped = true;
                    activeMoveCancel = null;
                    handleArrival(nodeId).then(resolve);
                }
            };

            requestAnimationFrame(step);
        });
    }

    function handleArrival(nodeId) {
        resetArrivalAnimations();
        const token = arrivalToken;
        const idNum = Number(nodeId);
        switch (idNum) {
            case 1:
                startBalloonAnimation(token);
                return waitMs(700, token);
            case 3:
                return runTreeHideSequence(token);
            case 4:
                return startSlideAnimation(token);
            case 5:
                startSwingAnimation();
                return Promise.resolve();
            case 6:
                return runTrainBoardingSequence(token);
            default:
                return Promise.resolve();
        }
    }

    const visits = Array(Object.keys(nodes).length + 1).fill(0);
    const stepPill = document.createElement('div');
    stepPill.className = 'tn-pill';
    stepPill.innerHTML = `
        <div class="tn-pill-left">
            <div class="tn-pill-dot"></div>
            <div class="tn-pill-label">markov-étapes_restantes</div>
        </div>
        <div class="tn-pill-value" id="steps-remaining">0</div>
    `;

    function updateVisitDisplays() {
        const total = visits.reduce((sum, v) => sum + v, 0);
        for (let i = 1; i <= Object.keys(nodes).length; i++) {
            const record = visitDisplayRecords[String(i)];
            if (!record) continue;
            const count = visits[i] || 0;
            const freq = total > 0 ? (count / total) : 0;
            if (record.countEl) record.countEl.textContent = String(count);
            if (record.freqEl) record.freqEl.textContent = freq.toFixed(6);
        }
    }

    function updateVisitCardPositions() {
        const canvas = renderer.domElement;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        Object.entries(visitDisplayRecords).forEach(([id, rec]) => {
            const world = rec.position.clone();
            world.y += 26;
            world.project(camera);
            const x = (world.x * 0.5 + 0.5) * w;
            const y = (-world.y * 0.5 + 0.5) * h;
            const offset = rec.offset || { x: 0, y: 0 };
            rec.element.style.transform = `translate(-50%, -50%) translate(${x + offset.x}px, ${y + offset.y}px)`;
            rec.element.style.opacity = world.z < 1 ? '1' : '0';
        });
    }

    function updateSwing(delta) {
        if (!swingData || !swingState) return;

        if (swingState.active) {
            swingState.time += delta;
            const damping = Math.exp(-swingState.time * 0.85);
            const angle = Math.sin(swingState.time * 3.2 + swingState.phase) * swingState.amplitude * damping;
            swingData.pivot.rotation.x = angle;
            if (damping < 0.02) {
                swingState.active = false;
            }
        } else if (!swingState.follow) {
            swingData.pivot.rotation.x *= 0.8;
            if (Math.abs(swingData.pivot.rotation.x) < 0.001) {
                swingData.pivot.rotation.x = 0;
            }
        }

        if (swingState.follow && girl) {
            const seatWorld = swingData.getSeatWorld().add(swingData.girlOffset.clone());
            girl.position.copy(seatWorld);
            const forwardLocal = swingData.seatAnchor.clone().add(new THREE.Vector3(0, -2, -6));
            const lookTarget = swingData.pivot.localToWorld(forwardLocal);
            girl.lookAt(lookTarget);
        }
    }

    function handleResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        updateVisitCardPositions();
    }

    window.addEventListener('resize', handleResize);

    engine = new MarkovEngine();

    engine.setVisitCallback(idx => {
        visits[idx] = (visits[idx] || 0) + 1;
        updateVisitDisplays();
    });

    engine.setStepCallback(r => {
        const el = document.getElementById('steps-remaining');
        if (el) el.textContent = String(r);
    });

    const rightPanel = document.createElement('aside');
    rightPanel.className = 'right-panel';
    const rpTitle = document.createElement('div');
    rpTitle.className = 'rp-title';
    rpTitle.textContent = 'Paramètres';
    rightPanel.appendChild(rpTitle);
    rightPanel.appendChild(stepPill);
    document.body.appendChild(rightPanel);

    function createSliderPill({ id, label, min, max, value, onChange, showAsLevel = false }) {
        const pill = document.createElement('div');
        pill.className = 'tn-slider-pill';
        pill.innerHTML = `
            <div class="tn-pill-left">
                <div class="tn-pill-dot"></div>
                <div class="tn-pill-label">${label}</div>
            </div>
            <div class="tn-slider-wrap">
                <input type="range" id="${id}" min="${min}" max="${max}" value="${value}" />
                <div class="tn-slider-badge" id="${id}-val">${value}</div>
            </div>
        `;
        rightPanel.appendChild(pill);
        const input = pill.querySelector('input[type=range]');
        const badge = pill.querySelector(`#${id}-val`);
        const updateDisplay = val => {
            if (showAsLevel) {
                const ratio = (val - Number(input.min)) / (Number(input.max) - Number(input.min));
                const level = Math.round(ratio * 9) + 1;
                badge.textContent = level;
            } else {
                badge.textContent = val;
            }
        };
        input.addEventListener('input', evt => {
            const val = Number(evt.target.value);
            updateDisplay(val);
            onChange(val);
        });
        updateDisplay(value);
        return { input, badge };
    }

    createSliderPill({
        id: 'slider-steps',
        label: 'markov-nombre_étapes',
        min: 0,
        max: 300,
        value: 0,
        onChange: v => {
            engine.setSteps(v);
            const el = document.getElementById('steps-remaining');
            if (el) el.textContent = String(v);
        }
    });

    createSliderPill({
        id: 'slider-speed',
        label: 'markov-vitesse',
        min: 100,
        max: 1500,
        value: 500,
        showAsLevel: true,
        onChange: v => {
            const mapped = 1600 - v;
            engine.setSpeed(mapped);
        }
    });

    engine.setSteps(0);
    engine.setSpeed(1600 - 500);
    const stepsDisplay = document.getElementById('steps-remaining');
    if (stepsDisplay) stepsDisplay.textContent = '0';

    let disposed = false;
    function disposeScene() {
        if (disposed) return;
        disposed = true;
        window.removeEventListener('resize', handleResize);
        resetArrivalAnimations();
        controls.dispose();
        renderer.dispose();
    }

    window.stopMarkovEngine = () => {
        if (engine) engine.stop();
        if (activeMoveCancel) activeMoveCancel(false);
        activeMoveCancel = null;
        resetArrivalAnimations();
        disposeScene();
    };

    document.getElementById('start-btn').onclick = () => {
        if (engine) engine.start(moveCharacterTo);
    };

    document.getElementById('stop-btn').onclick = () => {
        if (engine) engine.stop();
        if (activeMoveCancel) activeMoveCancel(false);
        activeMoveCancel = null;
        resetArrivalAnimations();
    };

    document.getElementById('replay-btn').onclick = () => {
        if (engine) engine.stop();
        if (activeMoveCancel) activeMoveCancel(false);
        activeMoveCancel = null;
        resetArrivalAnimations();
        disposeScene();
        loadMarkovPage();
    };

    updateVisitDisplays();
    updateVisitCardPositions();

    function renderLoop() {
        if (disposed) return;
        const delta = clock.getDelta();
        controls.update();
        updateSwing(delta);
        updateSlide(delta);
        updateBalloon(delta);
        renderer.render(scene, camera);
        updateVisitCardPositions();
        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
}