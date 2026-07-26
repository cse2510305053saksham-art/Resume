'use strict';
/* ═══════════════════════════════════════════════════════════════
   Saksham Thakur — Portfolio  |  script.js
   • Themed 3D WebGL backgrounds per section
   • Scroll-driven drone navigation widget
   • Light / Dark mode with Three.js colour sync
   • Custom cursor, stat counters, skill bar animations
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', init);

function init() {

    // ─── GSAP ──────────────────────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // ─── Year ──────────────────────────────────────────────────
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ─── Colour Palette (dark / light) ────────────────────────
    const PAL = {
        cyan: [0x00c8dc, 0x006e8a],
        purple: [0x7c5cfc, 0x5b3ecb],
        blue: [0x4f6fff, 0x1e40af],
        mint: [0x00ffcc, 0x0f766e],
        orange: [0xff7733, 0xea580c],
        white: [0xeeeeff, 0x1e2540],
        green: [0x00c47a, 0x166534],
    };
    let isDark = true;
    const C = k => PAL[k][isDark ? 0 : 1];

    // ─── Theme Toggle ──────────────────────────────────────────
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.innerHTML = `<i class="bx ${isDark ? 'bx-moon' : 'bx-sun'}"></i>`;
        syncThreeTheme();
    }
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        isDark = !isDark; applyTheme();
    });

    // ─── Three.js Setup ────────────────────────────────────────
    const canvas = document.getElementById('bg-canvas');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);
    const renderer = canvas
        ? new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        : new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    /* Material factories */
    const mMesh = (k, op = .6) => Object.assign(
        new THREE.MeshBasicMaterial({
            color: C(k), transparent: true, opacity: op,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        }),
        { _base: op, _cKey: k });

    const mLine = (k, op = .5) => Object.assign(
        new THREE.LineBasicMaterial({ color: C(k), transparent: true, opacity: op }),
        { _base: op, _cKey: k });

    const mPts = (k, size = .08, op = .8) => Object.assign(
        new THREE.PointsMaterial({
            color: C(k), size, transparent: true, opacity: op,
            blending: THREE.AdditiveBlending, depthWrite: false
        }),
        { _base: op, _cKey: k });

    function setGroupAlpha(grp, f) {
        grp.visible = f > .01;
        if (!grp.visible) return;
        grp.traverse(o => {
            if (o.material?._base !== undefined) o.material.opacity = o.material._base * f;
        });
    }

    function syncThreeTheme() {
        scene.traverse(o => {
            if (!o.material?._cKey) return;
            o.material.color.setHex(C(o.material._cKey));
            if (!(o.material instanceof THREE.LineBasicMaterial))
                o.material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
        });
    }

    // ─── BG Scenes ─────────────────────────────────────────────

    /* BG 0 – Binary Matrix */
    function bgHero() {
        const g = new THREE.Group(); g.name = 'binary';
        const COLS = 24, DROPS = 22, cols = [];
        for (let c = 0; c < COLS; c++) {
            const x = (c / (COLS - 1) - .5) * 22, speed = .5 + Math.random() * 1.5;
            const arr = new Float32Array(DROPS * 3);
            for (let r = 0; r < DROPS; r++) {
                arr[r * 3] = x;
                arr[r * 3 + 1] = (r / DROPS - .5) * 18 + Math.random() * 16;
                arr[r * 3 + 2] = (Math.random() - .5) * 4;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
            const pts = new THREE.Points(geo, mPts('cyan', .05 + Math.random() * .04, .72));
            g.add(pts); cols.push({ pts, speed, bottom: -10, top: 10 });
        }
        g._cols = cols;
        for (let y = -7; y <= 7; y += 2) {
            const v = new Float32Array([-12, y, 0, 12, y, 0]);
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
            g.add(new THREE.Line(geo, mLine('blue', .04)));
        }
        return g;
    }

    /* BG 1 – CPU Chip */
    function bgAbout() {
        const g = new THREE.Group(); g.name = 'cpu';
        g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(11, 11, .15)), mLine('cyan', .45)));
        g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7.5, 7.5, .1)), mLine('cyan', .28)));
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, .12), mMesh('cyan', .13));
            m.position.set(i * 2.4, j * 2.4, 0); g.add(m);
            const w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 1.6, .12)), mLine('cyan', .58));
            w.position.copy(m.position); g.add(w);
        }
        for (let t = -3.8; t <= 3.8; t += .7) {
            const mk = (x1, y1, x2, y2, op) => {
                const v = new Float32Array([x1, y1, 0, x2, y2, 0]);
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
                g.add(new THREE.Line(geo, mLine('blue', op)));
            };
            mk(-5.5, t, 5.5, t, .08); mk(t, -5.5, t, 5.5, .06);
        }
        for (let i = -4; i <= 4; i++) {
            const h = new THREE.Mesh(new THREE.BoxGeometry(.18, .65, .04), mMesh('purple', .75));
            const h2 = h.clone(), v = new THREE.Mesh(new THREE.BoxGeometry(.65, .18, .04), mMesh('purple', .75)), v2 = v.clone();
            h.position.set(i, 5.8, 0); h2.position.set(i, -5.8, 0);
            v.position.set(5.8, i, 0); v2.position.set(-5.8, i, 0);
            g.add(h, h2, v, v2);
        }
        g.add(new THREE.Mesh(new THREE.CircleGeometry(1.1, 32), mMesh('mint', .2)));
        return g;
    }

    /* BG 2 – Neural Net */
    function bgSkills() {
        const g = new THREE.Group(); g.name = 'neural';
        const layers = [4, 6, 6, 4], xs = [-6, -2, 2, 6], cols = ['cyan', 'blue', 'blue', 'purple'], allPos = [];
        layers.forEach((n, li) => {
            const pos = [];
            for (let ni = 0; ni < n; ni++) {
                const y = (ni - (n - 1) / 2) * 1.85;
                const nd = new THREE.Mesh(new THREE.SphereGeometry(.3, 14, 14), mMesh(cols[li], .9));
                nd.position.set(xs[li], y, 0); g.add(nd); pos.push(nd.position.clone());
            }
            allPos.push(pos);
            const v = new Float32Array([xs[li], -6, 0, xs[li], 6, 0]);
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
            g.add(new THREE.Line(geo, mLine(cols[li], .08)));
        });
        for (let li = 0; li < allPos.length - 1; li++)
            allPos[li].forEach(a => allPos[li + 1].forEach(b => {
                const op = .04 + Math.random() * .1, m = mLine('blue', op); m._base = op;
                g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), m));
            }));
        g._allPos = allPos; return g;
    }

    /* BG 3 – Git Graph */
    function bgProjects() {
        const g = new THREE.Group(); g.name = 'git';
        const line = (pts, k, op) =>
            g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mLine(k, op)));

        line([new THREE.Vector3(-8, 0, 0), new THREE.Vector3(8, 0, 0)], 'cyan', .7);

        line(new THREE.CatmullRomCurve3([
            new THREE.Vector3(-3, 0, 0), new THREE.Vector3(-1.5, 2.5, 0),
            new THREE.Vector3(1.5, 2.7, 0), new THREE.Vector3(3, 0, 0)
        ]).getPoints(80), 'purple', .65);

        line(new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1, 0, 0), new THREE.Vector3(.5, -2.5, 0),
            new THREE.Vector3(3, -2.7, 0), new THREE.Vector3(5.5, 0, 0)
        ]).getPoints(80), 'mint', .55);

        const commit = (x, y, k) => {
            const m = new THREE.Mesh(new THREE.SphereGeometry(.24, 10, 10), mMesh(k, .92));
            m.position.set(x, y, 0); g.add(m);
        };
        [-7, -5, -3, -1, 1, 3, 5, 7].forEach(x => commit(x, 0, 'cyan'));
        [[-2.2, 2.5], [0, 2.7], [2.2, 2.5]].forEach(([x, y]) => commit(x, y, 'purple'));
        [[.5, -2.4], [2.5, -2.7], [4, -2]].forEach(([x, y]) => commit(x, y, 'mint'));
        const head = new THREE.Mesh(new THREE.SphereGeometry(.38, 14, 14), mMesh('orange', .95));
        head.position.set(7, 0, 0); g.add(head);
        return g;
    }

    /* BG 4 – Bar Chart */
    function bgAchieve() {
        const g = new THREE.Group(); g.name = 'bars';
        const heights = [3.8, 6.2, 4.5, 7.5, 5.8, 4.2, 6.8, 5.0];
        const ckeys = ['cyan', 'purple', 'blue', 'cyan', 'mint', 'purple', 'blue', 'orange'];
        const BASE = -4.5;
        heights.forEach((h, i) => {
            const x = (i - (heights.length - 1) / 2) * 2.1;
            const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, h, .7), mMesh(ckeys[i], .28));
            bar.position.set(x, BASE + h / 2, 0); g.add(bar);
            const ew = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, h, .7)), mLine(ckeys[i], .75));
            ew.position.copy(bar.position); g.add(ew);
            for (let t = 0; t < h; t += 1) {
                const v = new Float32Array([x - .55, BASE + t, .36, x + .55, BASE + t, .36]);
                const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
                g.add(new THREE.Line(geo, mLine(ckeys[i], .15)));
            }
        });
        const v = new Float32Array([-10, BASE, 0, 10, BASE, 0]);
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
        g.add(new THREE.Line(geo, mLine('white', .28)));
        return g;
    }

    /* BG 5 – Network Topology */
    function bgContact() {
        const g = new THREE.Group(); g.name = 'network';
        const nodes = [
            { p: [0, 0, 0], k: 'cyan' }, { p: [-4.5, 2.5, 0], k: 'purple' }, { p: [-4.5, -2.5, 0], k: 'blue' },
            { p: [4.5, 3, 0], k: 'cyan' }, { p: [4.5, -2.5, 0], k: 'mint' }, { p: [0, 5, 0], k: 'purple' }, { p: [1, -4.5, 0], k: 'blue' }
        ];
        nodes.forEach(({ p: [x, y, z], k }) => {
            const box = new THREE.Mesh(new THREE.BoxGeometry(.95, 1.3, .35), mMesh(k, .38));
            box.position.set(x, y, z); g.add(box);
            const ew = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.95, 1.3, .35)), mLine(k, .85));
            ew.position.set(x, y, z); g.add(ew);
            const led = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 8), mMesh('mint', .95));
            led.position.set(x, y + .72, z); g.add(led);
        });
        [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [2, 6], [3, 4]].forEach(([a, b]) => {
            g.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...nodes[a].p), new THREE.Vector3(...nodes[b].p)]),
                mLine('blue', .35)));
        });
        const pkts = [];
        [[0, 1], [0, 3], [0, 5], [2, 0], [4, 0]].forEach(([a, b]) => {
            const p = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 8), mMesh('mint', .95));
            p._s = new THREE.Vector3(...nodes[a].p); p._e = new THREE.Vector3(...nodes[b].p); p._t = Math.random();
            g.add(p); pkts.push(p);
        });
        g._packets = pkts;
        for (let i = 1; i <= 4; i++) {
            const r = new THREE.Mesh(new THREE.TorusGeometry(i * 1.3, .04, 8, 80), mMesh('cyan', Math.max(.05, .28 - i * .06)));
            r.rotation.x = Math.PI / 2; r._ri = i; g.add(r);
        }
        return g;
    }

    // ─── Register Groups ─────────────────────────────────────
    const bgGroups = [bgHero(), bgAbout(), bgSkills(), bgProjects(), bgAchieve(), bgContact()];
    bgGroups.forEach((g, i) => { scene.add(g); setGroupAlpha(g, i === 0 ? 1 : 0); });

    // ─── Loading Screen ───────────────────────────────────────
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('loading')?.classList.add('out');
            const main = document.querySelector('main');
            if (main) main.classList.add('visible');

            // Hero entrance
            gsap.timeline({ delay: .2 })
                .from('.hero-inner', { y: 60, opacity: 0, duration: 1, ease: 'power3.out' })
                .from('.hero-badge', { y: 20, opacity: 0, duration: .5 }, '-=.6')
                .from('.hero-name', { y: 30, opacity: 0, duration: .6 }, '-=.4')
                .from('.hero-role', { y: 20, opacity: 0, duration: .5 }, '-=.35')
                .from('.hero-desc', { y: 20, opacity: 0, duration: .5 }, '-=.3')
                .from('.hero-cta', { y: 20, opacity: 0, duration: .5 }, '-=.3')
                .from('.hero-stats', { y: 16, opacity: 0, duration: .4 }, '-=.25')
                .from('.hero-visual', { scale: .9, opacity: 0, duration: .8, ease: 'back.out(1.4)' }, '-=.8');

            // Scroll reveals for other sections
            document.querySelectorAll('section:not(#hero)').forEach(sec => {
                gsap.from(sec.querySelectorAll('.glass-card, .section-label, .section-heading, .section-sub, .tl-item'), {
                    scrollTrigger: { trigger: sec, start: 'top 78%' },
                    y: 50, opacity: 0, duration: .8, stagger: .12, ease: 'power2.out'
                });
            });

            // Stat counter animation
            document.querySelectorAll('.stat-num').forEach(el => {
                const target = parseInt(el.dataset.target || '0', 10);
                gsap.fromTo({ n: 0 }, { n: 0 }, {
                    n: target, duration: 2.2, delay: .8, ease: 'power1.out',
                    onUpdate() { el.textContent = Math.round(this.targets()[0].n); }
                });
            });

            // Skill bars on scroll
            document.querySelectorAll('.skill-fill').forEach(fill => {
                ScrollTrigger.create({
                    trigger: fill, start: 'top 88%',
                    onEnter: () => fill.classList.add('go')
                });
            });

        }, 1100);
    });

    // ─── VanillaTilt ─────────────────────────────────────────
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), { max: 14, speed: 450, glare: true, 'max-glare': .18 });
    }

    // ─── Profile fallback ────────────────────────────────────
    const pImg = document.getElementById('profile-img');
    const pFb = document.getElementById('profile-fallback');
    if (pImg && pFb) {
        const hideFb = () => { pFb.style.display = 'none'; };
        const showFb = () => { pImg.style.display = 'none'; pFb.style.display = 'flex'; };
        if (pImg.complete) { pImg.naturalWidth ? hideFb() : showFb(); }
        else { pImg.addEventListener('load', hideFb); pImg.addEventListener('error', showFb); }
    }

    // ─── Drone ───────────────────────────────────────────────
    const droneCont = document.getElementById('drone-container');
    const droneSVG = document.getElementById('drone-svg');
    const droneLabel = document.getElementById('drone-label');

    const WP = [
        { nx: .85, ny: .10, label: 'BINARY RAIN', tilt: -12 },
        { nx: .15, ny: .28, label: 'CPU CORE',   tilt:  12 },
        { nx: .85, ny: .46, label: 'NEURAL NET', tilt: -12 },
        { nx: .15, ny: .64, label: 'GIT GRAPH',  tilt:  12 },
        { nx: .85, ny: .82, label: 'BUILD BARS', tilt: -12 },
        { nx: .15, ny: .96, label: 'SERVER NET', tilt:  0 }
    ];
    const ss = t => t * t * (3 - 2 * t);

    function droneAt(p) {
        const t = Math.min(p * (WP.length - 1), WP.length - 1.001);
        const idx = Math.floor(t), f = ss(t - idx);
        const a = WP[idx], b = WP[Math.min(idx + 1, WP.length - 1)];
        return {
            x: (a.nx + (b.nx - a.nx) * f) * innerWidth,
            y: (a.ny + (b.ny - a.ny) * f) * innerHeight,
            tilt: a.tilt + (b.tilt - a.tilt) * f,
            label: a.label
        };
    }

    let dX = innerWidth * .80, dY = innerHeight * .13, dTX = dX, dTY = dY;

    // ─── Scroll → Drone + Background fade ───────────────────
    ScrollTrigger.create({
        trigger: document.body, start: 'top top', end: 'bottom bottom',
        onUpdate(self) {
            const prog = self.progress, pt = droneAt(prog);
            dTX = pt.x; dTY = pt.y;
            if (droneSVG) gsap.to(droneSVG, { rotateZ: pt.tilt, duration: .6, ease: 'power2.out' });
            if (droneLabel) droneLabel.textContent = pt.label;
            const sf = prog * (bgGroups.length - 1);
            bgGroups.forEach((g, i) => setGroupAlpha(g, Math.max(0, 1 - Math.abs(i - sf) * 2.2)));

            // active nav link
            const navLinks = document.querySelectorAll('.nav-link');
            const maxIndex = Math.max(navLinks.length - 1, 0);
            const si = Math.min(Math.round(prog * maxIndex), maxIndex);
            navLinks.forEach((a, i) => a.classList.toggle('active', i === si));
        }
    });

    // ─── Mouse parallax & custom cursor ─────────────────────
    let mX = 0, mY = 0;
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let cX = 0, cY = 0, cTX = 0, cTY = 0;

    document.addEventListener('mousemove', e => {
        mX = (e.clientX / innerWidth - .5) * 2;
        mY = (e.clientY / innerHeight - .5) * 2;
        cTX = e.clientX; cTY = e.clientY;
        if (cursorDot) { cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px'; }
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
    document.querySelectorAll('a,button,[data-tilt]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // ─── Animation Loop ──────────────────────────────────────
    const clock = new THREE.Clock();

    (function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        /* BG0 – binary rain */
        if (bgGroups[0].visible && bgGroups[0]._cols) {
            bgGroups[0]._cols.forEach(col => {
                const pos = col.pts.geometry.attributes.position;
                for (let r = 0; r < pos.count; r++) {
                    const ny = pos.getY(r) - .045 * col.speed;
                    pos.setY(r, ny < col.bottom ? col.top : ny);
                }
                pos.needsUpdate = true;
            });
        }
        /* BG1 – cpu tilt */
        if (bgGroups[1].visible) {
            bgGroups[1].rotation.z = Math.sin(t * .18) * .015;
            bgGroups[1].rotation.x = Math.sin(t * .11) * .008;
        }
        /* BG2 – neural pulse */
        if (bgGroups[2].visible) {
            bgGroups[2].traverse(o => {
                if (o.isMesh && o.geometry.parameters?.radius < .5) {
                    const s = 1 + .1 * Math.sin(t * 1.6 + o.position.x * .8 + o.position.y * .5);
                    o.scale.setScalar(s);
                }
            });
        }
        /* BG3 – git float */
        if (bgGroups[3].visible) {
            bgGroups[3].children.forEach((m, i) => {
                if (m.isMesh) m.position.y += Math.sin(t * .55 + i * .4) * .0018;
            });
        }
        /* BG4 – bars breathe */
        if (bgGroups[4].visible) bgGroups[4].rotation.z = Math.sin(t * .12) * .012;
        /* BG5 – network */
        if (bgGroups[5].visible) {
            bgGroups[5]._packets?.forEach(p => {
                p._t = (p._t + .009) % 1;
                p.position.lerpVectors(p._s, p._e, p._t);
            });
            bgGroups[5].children.forEach(m => {
                if (m._ri) { const s = 1 + .06 * Math.sin(t * 1.4 + m._ri * .8); m.scale.set(s, s, s); }
            });
        }

        /* Drone hover-bob */
        dX += (dTX - dX) * .07; dY += (dTY - dY) * .07;
        if (droneCont) {
            const bob = Math.sin(t * 2.2) * 5;
            droneCont.style.left = dX + 'px';
            droneCont.style.top = dY + 'px';
            droneCont.style.transform = `translate(-50%, calc(-50% + ${bob}px))`;
        }

        /* Camera parallax */
        camera.position.x += (mX * 1.4 - camera.position.x) * .04;
        camera.position.y += (-mY * 1.0 - camera.position.y) * .04;
        camera.lookAt(camera.position.x * .25, camera.position.y * .25, 0);

        /* Cursor ring smooth */
        if (cursorRing) {
            cX += (cTX - cX) * .12;
            cY += (cTY - cY) * .12;
            cursorRing.style.left = cX + 'px';
            cursorRing.style.top = cY + 'px';
        }

        renderer.render(scene, camera);
    })();

    // ─── Resize ──────────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    });

    // ─── Contact Form ────────────────────────────────────────
    document.getElementById('contact-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        if (!btn) return;
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>Sent!</span><i class="bx bx-check"></i>';
        btn.style.background = 'linear-gradient(135deg,#00c47a,#00c8dc)';
        btn.disabled = true;
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; e.target.reset(); }, 3000);
    });

    // ─── Chatbot ─────────────────────────────────────────────
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatContainer = document.getElementById('chatbot-container');
    const closeChat = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    chatToggle?.addEventListener('click', () => {
        if (!chatContainer) return;
        chatContainer.classList.remove('hidden');
        chatToggle.style.display = 'none';
        chatInput?.focus();
    });
    closeChat?.addEventListener('click', () => {
        if (!chatContainer) return;
        chatContainer.classList.add('hidden');
        setTimeout(() => { if (chatToggle) chatToggle.style.display = 'flex'; }, 380);
    });

    const BOT = {
        skills: 'Saksham is skilled in Python, HTML/CSS/JS, AI/ML, Git, backend APIs, and Cybersecurity.',
        project: 'He\'s built an AI Document Analyser, a 3D UI Component Library, and a Cyber Threat Detector. See the Projects section!',
        education: 'Saksham is studying AI & Data Science (B.Tech) at RGGEC.',
        hackathon: 'Saksham regularly competes in hackathons, building real solutions under pressure.',
        contact: 'Email: tsaksham94189@gmail.com — or use the Contact form!',
        linkedin: 'LinkedIn link is in the Contact section!',
        github: 'GitHub link is in the Contact section!',
        hello: 'Hey! 👋 Ask me about Saksham\'s skills, projects, or education.',
        hi: 'Hello! What would you like to know about Saksham?',
        thanks: 'You\'re welcome! Feel free to reach out anytime. 🚀',
        default: 'I can tell you about skills, projects, education, or contact info. What would you like to know?',
    };

    function addMsg(txt, who) {
        if (!chatBody) return;
        const d = document.createElement('div');
        d.className = `message ${who}`;
        d.textContent = txt;
        chatBody.appendChild(d);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleSend() {
        const raw = chatInput?.value.trim();
        if (!raw) return;
        addMsg(raw, 'user'); chatInput.value = '';
        const q = raw.toLowerCase();
        setTimeout(() => {
            let reply = BOT.default;
            for (const [k, v] of Object.entries(BOT)) { if (q.includes(k)) { reply = v; break; } }
            addMsg(reply, 'bot');
        }, 460);
    }
    sendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

} // end init()
