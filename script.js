'use strict';
/* =======================================================================
   PORTFOLIO — Saksham  |  CS / Engineering Edition
   • Themed 3D backgrounds per section (Binary→CPU→Neural Net→Git→Build→Network)
   • Scroll-driven drone guide
   • Light / Dark mode with Three.js color sync
   ======================================================================= */

// ─── 1. GSAP ─────────────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── 2. DUAL-THEME COLOR PALETTE ─────────────────────────────────────────
// Each entry: [darkHex, lightHex]
const PAL = {
    cyan:   [0x00f2fe, 0x0057e7],
    purple: [0x9b59ff, 0x7c3aed],
    blue:   [0x4f6fff, 0x1e40af],
    mint:   [0x00ffcc, 0x0f766e],
    orange: [0xff7733, 0xea580c],
    white:  [0xeeeeff, 0x0f172a],
    green:  [0x00c47a, 0x166534],
};
let isDark = true;
const C = key => PAL[key][isDark ? 0 : 1];

// Material helpers — store _base opacity and _cKey for theme updates
function mMesh(cKey, op = 0.6) {
    const m = new THREE.MeshBasicMaterial({
        color: C(cKey), transparent: true, opacity: op,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    m._base = op; m._cKey = cKey; return m;
}
function mLine(cKey, op = 0.5) {
    const m = new THREE.LineBasicMaterial({ color: C(cKey), transparent: true, opacity: op });
    m._base = op; m._cKey = cKey; return m;
}
function mPts(cKey, size = 0.08, op = 0.8) {
    const m = new THREE.PointsMaterial({
        color: C(cKey), size, transparent: true, opacity: op,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    m._base = op; m._cKey = cKey; return m;
}

/* Sync all Three.js material colors to the active theme */
function syncThreeTheme() {
    scene.traverse(obj => {
        if (!obj.material) return;
        const m = obj.material;
        if (m._cKey) {
            m.color.setHex(C(m._cKey));
            // Lines always use NormalBlending; meshes & points use Additive in dark, Normal in light
            if (m instanceof THREE.LineBasicMaterial) {
                m.blending = THREE.NormalBlending;
            } else {
                m.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
            }
        }
    });
}

/* Called by the toggle button */
function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = `<i class='bx ${isDark ? "bx-moon" : "bx-sun"}'></i>`;
    syncThreeTheme();
}

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

// ─── 3. LOADING SCREEN ───────────────────────────────────────────────────
window.addEventListener('load', () => {
    const loader = document.getElementById('loading');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        document.querySelector('main').style.opacity = '1';
        gsap.timeline()
            .from('.hero-card',           { y: 60, opacity: 0, duration: 1,   ease: 'power3.out' })
            .from('.profile-img-wrapper', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.5')
            .from('.name',                { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
            .from('.subtitle',            { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
            .from('.btn-group',           { y: 20, opacity: 0, duration: 0.5 }, '-=0.3');

        document.querySelectorAll('section:not(#hero)').forEach(sec => {
            gsap.from(sec.children, {
                scrollTrigger: { trigger: sec, start: 'top 80%' },
                y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out'
            });
        });
    }, 1000);
});

// ─── 4. VANILLA TILT ─────────────────────────────────────────────────────
VanillaTilt.init(document.querySelectorAll('[data-tilt]'),
    { max: 15, speed: 400, glare: true, 'max-glare': 0.2 });
VanillaTilt.init(document.querySelectorAll('.skill-card, .project-card, .timeline-item'),
    { max: 10, speed: 300 });

// ─── 5. THREE.JS SETUP ───────────────────────────────────────────────────
const canvas   = document.getElementById('bg-canvas');
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* Fade / hide a group by multiplying all material opacities */
function setGroupAlpha(grp, factor) {
    grp.visible = factor > 0.01;
    if (!grp.visible) return;
    grp.traverse(obj => {
        if (obj.material && obj.material._base !== undefined) {
            obj.material.opacity = obj.material._base * factor;
        }
    });
}

// ─── 6. CS / ENGINEERING 3D BACKGROUNDS ─────────────────────────────────

/* ── BG 0: HERO — Binary Data Stream (Matrix rain) ────────────────────── */
function createHeroBG() {
    const g = new THREE.Group(); g.name = 'binary';
    const COLS = 22, DROPS = 20;
    const cols = [];
    for (let c = 0; c < COLS; c++) {
        const x     = (c / (COLS - 1) - 0.5) * 20;
        const speed = 0.5 + Math.random() * 1.6;
        const yOff  = Math.random() * 16;
        const arr   = new Float32Array(DROPS * 3);
        for (let r = 0; r < DROPS; r++) {
            arr[r * 3]     = x;
            arr[r * 3 + 1] = (r / DROPS - 0.5) * 16 + yOff;
            arr[r * 3 + 2] = 0;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        const mat = mPts('cyan', 0.06, 0.72);
        const pts = new THREE.Points(geo, mat);
        g.add(pts);
        cols.push({ pts, speed, arr, bottom: -9, top: 9 });
    }
    g._cols = cols;

    // Faint horizontal scan lines across the matrix
    for (let row = -6; row <= 6; row += 2) {
        const v = new Float32Array([-10, row, 0, 10, row, 0]);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
        g.add(new THREE.Line(geo, mLine('blue', 0.04)));
    }
    return g;
}

/* ── BG 1: ABOUT — CPU Chip Die ───────────────────────────────────────── */
function createAboutBG() {
    const g = new THREE.Group(); g.name = 'cpu';

    // Outer chip package
    const outerE = new THREE.EdgesGeometry(new THREE.BoxGeometry(10, 10, 0.1));
    g.add(new THREE.LineSegments(outerE, mLine('cyan', 0.45)));

    // Inner die area
    const innerE = new THREE.EdgesGeometry(new THREE.BoxGeometry(7, 7, 0.1));
    g.add(new THREE.LineSegments(innerE, mLine('cyan', 0.3)));

    // 3×3 CPU core grid
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const core = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.05), mMesh('cyan', 0.15));
            core.position.set(i * 2.2, j * 2.2, 0);
            g.add(core);
            const coreE = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 1.5, 0.05));
            const coreW = new THREE.LineSegments(coreE, mLine('cyan', 0.6));
            coreW.position.copy(core.position);
            g.add(coreW);
        }
    }

    // Circuit trace grid (faint horizontal + vertical lines on the die)
    for (let t = -3.5; t <= 3.5; t += 0.7) {
        const hv = new Float32Array([-5, t, 0, 5, t, 0]);
        const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(hv, 3));
        g.add(new THREE.Line(hg, mLine('blue', 0.09)));

        const vv = new Float32Array([t, -5, 0, t, 5, 0]);
        const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.BufferAttribute(vv, 3));
        g.add(new THREE.Line(vg, mLine('blue', 0.07)));
    }

    // Pin connectors on all 4 edges
    for (let i = -4; i <= 4; i++) {
        [['y', 5.3, 0.18, 0.55], ['y', -5.3, 0.18, 0.55]].forEach(([ax, pos]) => {
            const pin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.04), mMesh('purple', 0.75));
            pin.position.set(i, pos, 0); g.add(pin);
        });
        [['x', 5.3], ['x', -5.3]].forEach(([ax, pos]) => {
            const pin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.04), mMesh('purple', 0.75));
            pin.position.set(pos, i, 0); g.add(pin);
        });
    }

    // Central "hot-spot" glow
    const hs = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), mMesh('mint', 0.25));
    g.add(hs);

    return g;
}

/* ── BG 2: SKILLS — Neural Network (MLP) ─────────────────────────────── */
function createSkillsBG() {
    const g = new THREE.Group(); g.name = 'neural';
    const layers     = [4, 6, 6, 4];
    const layerX     = [-5.5, -1.8, 1.8, 5.5];
    const layerColor = ['cyan', 'blue', 'blue', 'purple'];
    const allPos     = [];

    layers.forEach((count, li) => {
        const pos = [];
        for (let ni = 0; ni < count; ni++) {
            const y = (ni - (count - 1) / 2) * 1.75;
            const node = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), mMesh(layerColor[li], 0.88));
            node.position.set(layerX[li], y, 0);
            g.add(node);
            pos.push(node.position.clone());
        }
        allPos.push(pos);

        // Vertical separator line per layer
        const lv = new Float32Array([layerX[li], -5.5, 0, layerX[li], 5.5, 0]);
        const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lv, 3));
        g.add(new THREE.Line(lg, mLine(layerColor[li], 0.1)));
    });

    // Connections between adjacent layers
    for (let li = 0; li < allPos.length - 1; li++) {
        allPos[li].forEach(from => {
            allPos[li + 1].forEach(to => {
                const connGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
                const op = 0.04 + Math.random() * 0.1;
                const cm = mLine('blue', op); cm._base = op;
                g.add(new THREE.Line(connGeo, cm));
            });
        });
    }

    g._allPos = allPos;
    return g;
}

/* ── BG 3: PROJECTS — Git Branch Graph ──────────────────────────────── */
function createProjectsBG() {
    const g = new THREE.Group(); g.name = 'git';

    // Main branch
    const mainGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-7.5, 0, 0), new THREE.Vector3(7.5, 0, 0)
    ]);
    g.add(new THREE.Line(mainGeo, mLine('cyan', 0.7)));

    // Feature branch 1 (splits up)
    const feat1 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, 0, 0), new THREE.Vector3(-1.5, 2, 0),
        new THREE.Vector3(1.5, 2.2, 0), new THREE.Vector3(3, 0, 0)
    ]).getPoints(60);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(feat1), mLine('purple', 0.65)));

    // Feature branch 2 (splits down)
    const feat2 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0.5, -2, 0),
        new THREE.Vector3(3, -2.2, 0), new THREE.Vector3(5, 0, 0)
    ]).getPoints(60);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(feat2), mLine('mint', 0.55)));

    // Commits on main branch
    [-6.5, -4, -3, -1, 1, 3, 5, 7].forEach(x => {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), mMesh('cyan', 0.92));
        c.position.set(x, 0, 0); g.add(c);
    });
    // Commits on branches
    [[-2, 2], [0, 2.2], [2, 2]].forEach(([x, y]) => {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), mMesh('purple', 0.92));
        c.position.set(x, y, 0); g.add(c);
    });
    [[0.5, -2], [2.5, -2.2], [4, -1.5]].forEach(([x, y]) => {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), mMesh('mint', 0.92));
        c.position.set(x, y, 0); g.add(c);
    });

    // HEAD (current commit) — orange
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), mMesh('orange', 0.95));
    head.position.set(6.5, 0, 0); g.add(head);

    return g;
}

/* ── BG 4: ACHIEVEMENTS — Build Progress Bars (3D bar chart) ────────── */
function createAchieveBG() {
    const g = new THREE.Group(); g.name = 'progress';
    const bars    = [3.8, 6.2, 4.5, 7.5, 5.8, 4.2, 6.8, 5.0];
    const cKeys   = ['cyan','purple','blue','cyan','mint','purple','blue','orange'];
    const BASE_Y  = -4;

    bars.forEach((h, i) => {
        const x = (i - (bars.length - 1) / 2) * 1.9;

        // Filled bar
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 0.6), mMesh(cKeys[i], 0.3));
        bar.position.set(x, BASE_Y + h / 2, 0);
        g.add(bar);

        // Wire outline
        const barE = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, h, 0.6));
        const barW = new THREE.LineSegments(barE, mLine(cKeys[i], 0.7));
        barW.position.copy(bar.position);
        g.add(barW);

        // Horizontal tick marks inside bar
        for (let tick = 0; tick < h; tick += 0.9) {
            const tv = new Float32Array([x - 0.5, BASE_Y + tick, 0.31, x + 0.5, BASE_Y + tick, 0.31]);
            const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(tv, 3));
            g.add(new THREE.Line(tg, mLine(cKeys[i], 0.18)));
        }
    });

    // Baseline
    const bv = new Float32Array([-9, BASE_Y, 0, 9, BASE_Y, 0]);
    const bg2 = new THREE.BufferGeometry(); bg2.setAttribute('position', new THREE.BufferAttribute(bv, 3));
    g.add(new THREE.Line(bg2, mLine('white', 0.3)));

    return g;
}

/* ── BG 5: CONTACT — Network Server Topology ──────────────────────────── */
function createContactBG() {
    const g = new THREE.Group(); g.name = 'network';

    const nodes = [
        { pos: [ 0,    0,  0], key: 'cyan'   }, // central server
        { pos: [-4,    2.5,0], key: 'purple'  }, // LinkedIn node
        { pos: [-4.5, -2,  0], key: 'blue'    }, // GitHub node
        { pos: [ 4,    3,  0], key: 'cyan'    }, // top right
        { pos: [ 4.5, -2.5,0], key: 'mint'    }, // bottom right
        { pos: [ 0,    4.5,0], key: 'purple'  }, // top relay
        { pos: [ 1,   -4,  0], key: 'blue'    }, // bottom relay
    ];

    // Draw server boxes
    nodes.forEach(({ pos: [x, y, z], key }) => {
        const srv = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.3), mMesh(key, 0.38));
        srv.position.set(x, y, z); g.add(srv);
        const srvE = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 1.2, 0.3));
        const srvW = new THREE.LineSegments(srvE, mLine(key, 0.85));
        srvW.position.set(x, y, z); g.add(srvW);
        // Blinking LED top of server box
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mMesh('mint', 0.95));
        led.position.set(x, y + 0.65, z); g.add(led);
    });

    // Network cables
    const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,5],[2,6],[3,4]];
    edges.forEach(([a, b]) => {
        const pa = nodes[a].pos, pb = nodes[b].pos;
        const eg = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...pa), new THREE.Vector3(...pb)
        ]);
        g.add(new THREE.Line(eg, mLine('blue', 0.35)));
    });

    // Animated data packets
    const packetEdges = [[0,1],[0,3],[0,5],[2,0],[4,0]];
    const packets = [];
    packetEdges.forEach(([a, b]) => {
        const pkt = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mMesh('mint', 0.95));
        pkt._s = new THREE.Vector3(...nodes[a].pos);
        pkt._e = new THREE.Vector3(...nodes[b].pos);
        pkt._t = Math.random();
        g.add(pkt);
        packets.push(pkt);
    });
    g._packets = packets;

    // Wi-Fi rings expanding from central server
    for (let i = 1; i <= 4; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(i * 1.2, 0.04, 8, 80),
            mMesh('cyan', Math.max(0.06, 0.3 - i * 0.06))
        );
        ring.rotation.x = Math.PI / 2;
        ring._ri = i;
        g.add(ring);
    }

    return g;
}

// ─── Build & register all groups ──────────────────────────────────────────
const bgGroups = [
    createHeroBG(),
    createAboutBG(),
    createSkillsBG(),
    createProjectsBG(),
    createAchieveBG(),
    createContactBG(),
];
bgGroups.forEach((g, i) => { scene.add(g); setGroupAlpha(g, i === 0 ? 1 : 0); });

// ─── 7. DRONE SETUP ──────────────────────────────────────────────────────
const droneContainer = document.getElementById('drone-container');
const droneSVG       = document.getElementById('drone-svg');
const droneLabel     = document.getElementById('drone-label');

// Drone waypoints: (nx, ny) = normalized viewport fractions per section
const WAYPOINTS = [
    { nx: 0.80, ny: 0.13, label: '⬥ BINARY RAIN',    tilt: -8 }, // Hero
    { nx: 0.18, ny: 0.40, label: '⬥ CPU CORE',         tilt: 12 }, // About
    { nx: 0.75, ny: 0.50, label: '⬥ NEURAL NET',       tilt:-10 }, // Skills
    { nx: 0.15, ny: 0.62, label: '⬥ GIT GRAPH',        tilt: 10 }, // Projects
    { nx: 0.72, ny: 0.28, label: '⬥ BUILD PROGRESS',   tilt: -8 }, // Achievements
    { nx: 0.50, ny: 0.70, label: '⬥ SERVER NETWORK',   tilt:  0 }, // Contact
];

function smoothstep(t) { return t * t * (3 - 2 * t); }

function droneAt(prog) {
    const t   = Math.min(prog * (WAYPOINTS.length - 1), WAYPOINTS.length - 1.001);
    const idx = Math.floor(t);
    const f   = smoothstep(t - idx);
    const a   = WAYPOINTS[idx];
    const b   = WAYPOINTS[Math.min(idx + 1, WAYPOINTS.length - 1)];
    return {
        x: (a.nx + (b.nx - a.nx) * f) * window.innerWidth,
        y: (a.ny + (b.ny - a.ny) * f) * window.innerHeight,
        tilt: a.tilt + (b.tilt - a.tilt) * f,
        label: a.label,
    };
}

let droneX = window.innerWidth * 0.80, droneY = window.innerHeight * 0.13;
let droneTX = droneX, droneTY = droneY;

// ─── 8. SCROLL → DRONE + BACKGROUNDS ────────────────────────────────────
ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end:   'bottom bottom',
    onUpdate(self) {
        const prog = self.progress;
        const pt   = droneAt(prog);
        droneTX = pt.x; droneTY = pt.y;

        gsap.to(droneSVG, { rotateZ: pt.tilt, duration: 0.6, ease: 'power2.out' });
        const idx = Math.min(Math.round(prog * (WAYPOINTS.length - 1)), WAYPOINTS.length - 1);
        if (droneLabel) droneLabel.textContent = WAYPOINTS[idx].label;

        // Crossfade backgrounds
        const sectionF = prog * (bgGroups.length - 1);
        bgGroups.forEach((grp, i) => setGroupAlpha(grp, Math.max(0, 1 - Math.abs(i - sectionF) * 2.2)));
    }
});

// ─── 9. MOUSE PARALLAX ───────────────────────────────────────────────────
let mX = 0, mY = 0;
document.addEventListener('mousemove', e => {
    mX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── 10. ANIMATION LOOP ──────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* BG0 — Binary rain: slide columns downward, wrap at bottom */
    if (bgGroups[0].visible && bgGroups[0]._cols) {
        bgGroups[0]._cols.forEach(col => {
            const pos = col.pts.geometry.attributes.position;
            for (let r = 0; r < pos.count; r++) {
                const ny = pos.getY(r) - 0.04 * col.speed;
                pos.setY(r, ny < col.bottom ? col.top : ny);
            }
            pos.needsUpdate = true;
        });
    }

    /* BG1 — CPU: pulse hot-spot and very subtle tilt */
    if (bgGroups[1].visible) {
        bgGroups[1].rotation.z = Math.sin(t * 0.18) * 0.015;
    }

    /* BG2 — Neural net: pulse node scales */
    if (bgGroups[2].visible) {
        bgGroups[2].traverse(obj => {
            if (obj.isMesh && obj.geometry.type === 'SphereGeometry') {
                const sc = 1 + 0.08 * Math.sin(t * 1.5 + obj.position.x * 0.8 + obj.position.y * 0.5);
                obj.scale.setScalar(sc);
            }
        });
    }

    /* BG3 — Git graph: gentle float commits */
    if (bgGroups[3].visible) {
        bgGroups[3].children.forEach((m, i) => {
            if (m.isMesh) m.position.y += Math.sin(t * 0.6 + i * 0.4) * 0.0015;
        });
    }

    /* BG4 — Build bars: breathe height */
    if (bgGroups[4].visible) {
        bgGroups[4].rotation.z = Math.sin(t * 0.12) * 0.01;
    }

    /* BG5 — Network: move data packets + pulse Wi-Fi rings */
    if (bgGroups[5].visible) {
        if (bgGroups[5]._packets) {
            bgGroups[5]._packets.forEach(p => {
                p._t = (p._t + 0.009) % 1;
                p.position.lerpVectors(p._s, p._e, p._t);
            });
        }
        bgGroups[5].children.forEach(m => {
            if (m._ri !== undefined) {
                const sc = 1 + 0.05 * Math.sin(t * 1.4 + m._ri * 0.8);
                m.scale.set(sc, sc, sc);
            }
        });
    }

    /* Drone hover bob */
    droneX += (droneTX - droneX) * 0.07;
    droneY += (droneTY - droneY) * 0.07;
    if (droneContainer) {
        const bob = Math.sin(t * 2.2) * 5;
        droneContainer.style.left      = droneX + 'px';
        droneContainer.style.top       = droneY + 'px';
        droneContainer.style.transform = `translate(-50%, calc(-50% + ${bob}px))`;
    }

    /* Camera mouse parallax */
    camera.position.x += (mX * 1.4 - camera.position.x) * 0.05;
    camera.position.y += (-mY * 0.9 - camera.position.y) * 0.05;
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, 0);

    renderer.render(scene, camera);
}
animate();

// ─── 11. RESIZE ──────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ─── 12. AI CHATBOT ──────────────────────────────────────────────────────
const chatToggle    = document.getElementById('chatbot-toggle');
const chatContainer = document.getElementById('chatbot-container');
const closeChat     = document.getElementById('close-chat');
const sendBtn       = document.getElementById('send-btn');
const chatInput     = document.getElementById('chat-input');
const chatBody      = document.getElementById('chat-body');

chatToggle?.addEventListener('click', () => {
    chatContainer.classList.remove('hidden');
    chatToggle.style.display = 'none';
});
closeChat?.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    setTimeout(() => { chatToggle.style.display = 'flex'; }, 350);
});

const BOT = {
    skills:    'Saksham is skilled in Python, HTML/CSS/JS, Basic AI, and Git/GitHub.',
    project:   'He has built an AI document analyser and interactive UI components. Check his Projects section!',
    education: 'Saksham is a CSE student passionate about AI and modern web technologies.',
    linkedin:  'You can connect with Saksham on LinkedIn. Find the link in the Contact section!',
    github:    'Saksham loves open-source. Check his GitHub in the Contact section!',
    hello:     'Hey! Ask me about skills, projects, education, or social links.',
    hi:        'Hello! What would you like to know about Saksham?',
    default:   'I know about skills, projects, education & social links. Ask me about one!',
};

function addMsg(txt, sender) {
    const d = document.createElement('div');
    d.className = `message ${sender}`;
    d.innerText = txt;
    chatBody.appendChild(d);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function handleSend() {
    const raw = chatInput.value.trim(); if (!raw) return;
    addMsg(raw, 'user'); chatInput.value = '';
    const q = raw.toLowerCase();
    setTimeout(() => {
        let reply = BOT.default;
        for (const [k, v] of Object.entries(BOT)) { if (q.includes(k)) { reply = v; break; } }
        addMsg(reply, 'bot');
    }, 550);
}
sendBtn?.addEventListener('click', handleSend);
chatInput?.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });
