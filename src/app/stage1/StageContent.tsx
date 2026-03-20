"use client";

import { useEffect, useRef } from "react";

export default function MMDPage() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const el = document.getElementById("stage-script");
    if (el) {
      const s = document.createElement("script");
      s.textContent = el.textContent || "";
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div
        id="three-container"
        style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid #E8ECF0", position: "relative" }}
      />
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <select id="model-select" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "8px", background: "#2a2a4e", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 캐릭터 --</option>
          <option value="honoka">호노카 (러브라이브)</option>
          <option value="yor">요르 (스파이패밀리)</option>
          <option value="nezuko">네즈코 (귀멸의 칼날)</option>
          <option value="anya">아냐 (스파이패밀리)</option>
          <option value="zoey">Zoey (HUNTRIX)</option>
          <option value="rumi">Rumi (HUNTRIX)</option>
          <option value="mira">Mira (HUNTRIX)</option>
          <option value="tda_cn">TDA (CN)</option>
          <option value="ming">Ming (카라피큐)</option>
          <option value="kizuna">키즈나아이</option>
        </select>
        <select id="version-select" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "8px", background: "#2a2a4e", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 버전 --</option>
        </select>
        <button id="model-load-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#6B7280", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          모델
        </button>
        <select id="artist-select" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "8px", background: "#1A1A2E", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 가수 --</option>
        </select>
        <select id="song-select" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "8px", background: "#1A1A2E", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 곡 --</option>
        </select>
        <button id="load-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#4A90C4", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          곡 로드
        </button>
        <button id="play-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#22C55E", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          ▶ 재생
        </button>
        <button id="stop-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#EF4444", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          ■ 정지
        </button>
        <button id="cam-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#666", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer", display: "none" }}>
          CAM OFF
        </button>
      </div>
      {/* 수동 업로드 버튼 — 비활성화 */}
      <div style={{ display: "none" }}>
        <input id="pmx-input" type="file" accept=".pmx,.pmd" />
        <input id="vmd-input" type="file" accept=".vmd" />
        <input id="glb-input" type="file" accept=".glb,.gltf" />
        <input id="wav-input" type="file" accept=".wav,.mp3,.ogg" />
      </div>
      <audio id="bgm-audio" style={{ display: "none" }} />
      <div style={{ fontSize: "12px", color: "#6B7280" }}>
        터치 드래그: 회전 | 핀치: 줌 | 두 손가락 드래그: 이동
      </div>
      <div
        id="log-panel"
        style={{ background: "#000", borderRadius: "12px", padding: "12px", fontSize: "12px", fontFamily: "monospace", color: "#aaa", maxHeight: "160px", overflow: "auto" }}
      />
      <script
        id="stage-script"
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var logEl = document.getElementById('log-panel');
  function addLog(msg, color) {
    var div = document.createElement('div');
    div.textContent = msg;
    div.style.color = color || '#aaa';
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // 모델 데이터베이스
  var modelDB = {
    honoka: {
      name: '호노카 (러브라이브)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/lovelive20141216/lovelive2/Kousaka_Honoka.pmx' }
      }
    },
    yor: {
      name: '요르 (스파이패밀리)',
      versions: {
        dress: { name: 'Dress', pmx: '/mmd/models/yor_forger/yor_dress.pmx' },
        base: { name: 'Base', pmx: '/mmd/models/yor_forger/yor_base.pmx' }
      }
    },
    nezuko: {
      name: '네즈코 (귀멸의 칼날)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/nezuko/nezuko.pmx' },
        base: { name: 'Base', pmx: '/mmd/models/nezuko/nezuko_base.pmx' },
        child: { name: 'Child', pmx: '/mmd/models/nezuko/nezuko_child.pmx' }
      }
    },
    anya: {
      name: '아냐 (스파이패밀리)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/anya_forger/anya.pmx' }
      }
    },
    zoey: {
      name: 'Zoey (HUNTRIX)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/zoey/Zoey.pmx' }
      }
    },
    rumi: {
      name: 'Rumi (HUNTRIX)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/rumi/Rumi.pmx' }
      }
    },
    mira: {
      name: 'Mira (HUNTRIX)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/mira/Mira.pmx' }
      }
    },
    tda_cn: {
      name: 'TDA (CN)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/tda_cn/tda.pmx' }
      }
    },
    ming: {
      name: 'Ming (카라피큐)',
      versions: {
        default: { name: 'Default', pmx: '/mmd/models/ming/ming.pmx' }
      }
    },
    kizuna: {
      name: '키즈나아이',
      versions: {
        normal: { name: 'Normal', pmx: '/mmd/models/kizuna_normal/kizuna_normal.pmx' },
        anime: { name: 'Anime', pmx: '/mmd/models/kizuna_anime/kizuna_anime.pmx' },
        live: { name: 'Live', pmx: '/mmd/models/kizuna_live/kizuna_live.pmx' }
      }
    }
  };

  // 곡 데이터베이스 (외부 JSON에서 로드)
  var songDB = {};
  fetch('/mmd/songdb.json').then(function(r) { return r.json(); }).then(function(data) {
    songDB = data;
    // 아티스트 드롭박스 채우기
    var artistSelect = document.getElementById('artist-select');
    artistSelect.innerHTML = '<option value="">-- 가수 --</option>';
    Object.keys(songDB).sort().forEach(function(key) {
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = songDB[key].name;
      artistSelect.appendChild(opt);
    });
    addLog('songDB 로드: ' + Object.keys(songDB).length + '개 아티스트');
  });

  // 가수 선택 → 곡 목록 갱신
  document.getElementById('artist-select').addEventListener('change', function(e) {
    var songSelect = document.getElementById('song-select');
    songSelect.innerHTML = '<option value="">-- 곡 --</option>';
    var artist = songDB[e.target.value];
    if (artist) {
      Object.keys(artist.songs).forEach(function(key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = artist.songs[key].name;
        songSelect.appendChild(opt);
      });
    }
  });

  addLog('초기화 시작...');

  var scripts = [
    'https://cdn.jsdelivr.net/npm/ammo.js@0.0.10/ammo.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/mmd-parser/build/mmdparser.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/TGALoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MMDLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/CCDIKSolver.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/MMDPhysics.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/MMDAnimationHelper.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/effects/OutlineEffect.js'
  ];

  var loaded = 0;
  function loadNext() {
    if (loaded >= scripts.length) {
      addLog('모든 모듈 로드 완료');
      if (typeof Ammo === 'function') {
        addLog('Ammo 초기화중...');
        Ammo().then(function(AmmoLib) {
          window.Ammo = AmmoLib;
          addLog('Ammo 초기화 완료');
          startScene();
        });
        return;
      }
      startScene();
      return;
    }
    var s = document.createElement('script');
    var name = scripts[loaded].split('/').pop();
    s.src = scripts[loaded];
    s.onload = function() {
      addLog(name + ' 로드');
      loaded++;
      loadNext();
    };
    s.onerror = function() {
      addLog('❌ ' + name + ' 로드 실패', 'red');
      loaded++;
      loadNext();
    };
    document.head.appendChild(s);
  }
  loadNext();

  var scene, camera, renderer, controls, mixer, helper, clock, currentModel;

  function startScene() {
    try {
      var container = document.getElementById('three-container');
      var width = container.clientWidth;
      var height = container.clientHeight;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
      camera.position.set(0, 10, 60);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      var effect = renderer;

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1, 0);
      controls.enableDamping = true;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(0, 10, 10);
      scene.add(dirLight);
      var fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-5, 5, 5);
      scene.add(fillLight);
      var backLight = new THREE.DirectionalLight(0x6cb4ee, 0.15);
      backLight.position.set(0, 5, -5);
      scene.add(backLight);

      // 바닥
      var floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0x2a2a4e, roughness: 0.8, transparent: true, opacity: 0.3 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      var grid = new THREE.GridHelper(60, 30, 0x444488, 0x333366);
      grid.position.y = 0.01;
      scene.add(grid);

      // 뒷벽
      var backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40),
        new THREE.MeshStandardMaterial({ color: 0x222244, roughness: 0.9, transparent: true, opacity: 0.3 })
      );
      backWall.position.set(0, 20, -30);
      scene.add(backWall);

      // 뒷벽 앨범 커버
      var coverPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 15),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      coverPlane.position.set(0, 20, -29.9);
      scene.add(coverPlane);

      function setCoverImage(coverUrl) {
        if (!coverUrl) {
          coverPlane.material.opacity = 0;
          coverPlane.material.needsUpdate = true;
          return;
        }
        var texLoader = new THREE.TextureLoader();
        texLoader.load(coverUrl, function(tex) {
          tex.encoding = THREE.sRGBEncoding;
          coverPlane.material.map = tex;
          coverPlane.material.opacity = 0.8;
          coverPlane.material.needsUpdate = true;
        });
      }

      // 좌벽
      var leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40),
        new THREE.MeshStandardMaterial({ color: 0x1e1e3e, roughness: 0.9, transparent: true, opacity: 0.3 })
      );
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(-30, 20, 0);
      scene.add(leftWall);

      // 우벽
      var rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40),
        new THREE.MeshStandardMaterial({ color: 0x1e1e3e, roughness: 0.9, transparent: true, opacity: 0.3 })
      );
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.set(30, 20, 0);
      scene.add(rightWall);

      // 텍스처 로드 실패를 무시하는 LoadingManager
      var mmdManager = new THREE.LoadingManager();
      mmdManager.onError = function(url) {
        addLog('리소스 스킵: ' + url.split('/').pop());
      };
      // 백슬래시→슬래시 변환
      mmdManager.setURLModifier(function(url) {
        var fixed = url.split(String.fromCharCode(92)).join('/');
        if (fixed.indexOf('blob:') === 0 && fixed.indexOf('.pmx') === -1 && fixed.indexOf('.pmd') === -1 && fixed.indexOf('.vmd') === -1) {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==';
        }
        // 기본 toon 텍스처를 공통 경로에서 로드
        var toonMatch = fixed.match(/toon0[0-9]\.bmp$|toon10\.bmp$/);
        if (toonMatch && fixed.indexOf('/mmd/toon/') === -1) {
          return '/mmd/toon/' + toonMatch[0];
        }
        return fixed;
      });
      // 5초 타임아웃으로 로드 실패 방지
      var loadTimeout = null;

      helper = new THREE.MMDAnimationHelper();
      clock = new THREE.Clock();
      mixer = null;

      var isPlaying = false;

      function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        if (isPlaying) {
          if (helper.meshes && helper.meshes.length > 0) {
            helper.update(delta);
          }
          if (mixer) mixer.update(delta);
          if (window._ikSolver) window._ikSolver.update();
        }
        controls.update();
        effect.render(scene, camera);
      }
      animate();
      addLog('렌더링 시작됨');

      var gltfLoader = new THREE.GLTFLoader();
      var mmdLoader = new THREE.MMDLoader(mmdManager);
      var pmxUrl = modelDB.honoka.versions.default.pmx;
      var currentVmdUrl = '/mmd/songs/emon/shake_it/emon-shake_it.vmd';
      var currentMp3Url = '/mmd/songs/emon/shake_it/emon-shake_it.mp3';

      // 모델 로드 함수
      function loadModel(pmxPath, callback) {
        isPlaying = false;
        if (currentModel) {
          scene.remove(currentModel);
          if (helper.meshes && helper.meshes.length > 0) {
            try { helper.remove(currentModel); } catch(e) {}
          }
          currentModel = null;
          mixer = null;
          helper = new THREE.MMDAnimationHelper();
        }
        addLog('모델 로딩: ' + pmxPath.split('/').pop());
        mmdLoader.load(pmxPath, function(mesh) {
          currentModel = mesh;
          scene.add(mesh);
          var box = new THREE.Box3().setFromObject(mesh);
          var center = box.getCenter(new THREE.Vector3());
          var size = box.getSize(new THREE.Vector3());
          controls.target.copy(center);
          camera.position.set(center.x, center.y, center.z + size.y * 2.5);
          controls.update();
          var box = new THREE.Box3().setFromObject(mesh);
          var center = box.getCenter(new THREE.Vector3());
          var size = box.getSize(new THREE.Vector3());
          addLog('크기: ' + size.x.toFixed(1) + 'x' + size.y.toFixed(1) + 'x' + size.z.toFixed(1));

          // 비정상적으로 큰 모델은 상단부만 보이게
          if (size.y > 100) {
            controls.target.set(0, 10, 0);
            camera.position.set(0, 10, 40);
          } else {
            controls.target.copy(center);
            camera.position.set(center.x, center.y, center.z + size.y * 2.5);
          }
          controls.update();
          // 뿌연 모델 보정
          if (mesh.material) {
            var mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(function(m) {
              if (m.color && m.color.r > 0.85) {
                m.color.multiplyScalar(0.65);
              }
              if (m.emissive) m.emissive.setScalar(0);
              if (m.gradientMap) m.gradientMap = null;
              m.needsUpdate = true;
            });
          }
          addLog('✅ 모델 로드 완료', 'lime');
          if (callback) callback(mesh);
        }, function(p) {
          if (p.total > 0) addLog('PMX: ' + Math.round(p.loaded / p.total * 100) + '%');
        }, function(err) {
          addLog('❌ 모델 로드 실패: ' + (err.message || err), 'red');
        });
      }

      // 모델 선택 → 버전 목록 갱신
      document.getElementById('model-select').addEventListener('change', function(e) {
        var versionSelect = document.getElementById('version-select');
        versionSelect.innerHTML = '<option value="">-- 버전 --</option>';
        var model = modelDB[e.target.value];
        if (model) {
          var keys = Object.keys(model.versions);
          keys.forEach(function(key) {
            var opt = document.createElement('option');
            opt.value = key;
            opt.textContent = model.versions[key].name;
            versionSelect.appendChild(opt);
          });
          // 버전이 1개면 자동 선택
          if (keys.length === 1) {
            versionSelect.value = keys[0];
          }
        }
      });

      var cameraAnimation = null;
      var cameraEnabled = false;
      var savedCameraPos = null;
      var savedCameraTarget = null;

      // 카메라 모션 로드
      function loadCamera(camUrl) {
        if (!camUrl) {
          document.getElementById('cam-btn').style.display = 'none';
          cameraAnimation = null;
          return;
        }
        addLog('카메라 모션 로딩...');
        mmdLoader.loadAnimation(camUrl, camera, function(animation) {
          cameraAnimation = animation;
          document.getElementById('cam-btn').style.display = '';
          document.getElementById('cam-btn').textContent = 'CAM ON';
          document.getElementById('cam-btn').style.background = '#F59E0B';
          addLog('✅ 카메라 모션 로드 완료', 'lime');
        }, null, function(err) {
          addLog('카메라 모션 로드 실패');
          document.getElementById('cam-btn').style.display = 'none';
          cameraAnimation = null;
        });
      }

      // 카메라 ON/OFF 토글
      document.getElementById('cam-btn').addEventListener('click', function() {
        if (!cameraAnimation) return;
        cameraEnabled = !cameraEnabled;
        if (cameraEnabled) {
          savedCameraPos = camera.position.clone();
          savedCameraTarget = controls.target.clone();
          helper.add(camera, { animation: cameraAnimation });
          controls.enabled = false;
          this.textContent = 'CAM OFF';
          this.style.background = '#EF4444';
          addLog('카메라 모션 ON');
        } else {
          try { helper.remove(camera); } catch(e) {}
          camera.position.copy(savedCameraPos);
          camera.rotation.set(0, 0, 0);
          camera.up.set(0, 1, 0);
          controls.target.copy(savedCameraTarget);
          controls.enabled = true;
          controls.update();
          this.textContent = 'CAM ON';
          this.style.background = '#F59E0B';
          addLog('카메라 모션 OFF');
        }
      });

      // 곡 로드 함수
      function loadSong(vmdUrl, mp3Url, camUrl, coverUrl) {
        if (!currentModel) { addLog('❌ 먼저 모델을 로드하세요', 'red'); return; }
        isPlaying = false;
        var audioEl = document.getElementById('bgm-audio');
        audioEl.pause();
        audioEl.currentTime = 0;

        // 기존 애니메이션 제거
        if (helper.meshes && helper.meshes.length > 0) {
          try { helper.remove(currentModel); } catch(e) {}
        }
        mixer = null;
        helper = new THREE.MMDAnimationHelper();

        addLog('VMD 로딩...');
        mmdLoader.loadAnimation(vmdUrl, currentModel, function(animation) {
          addLog('VMD 파싱 완료, 모션 적용중...');
          var helperDone = false;
          setTimeout(function() {
            if (!helperDone) {
              addLog('helper 타임아웃, FK로 폴백');
              mixer = new THREE.AnimationMixer(currentModel);
              mixer.clipAction(animation).play();
            }
          }, 8000);
          try {
            helper.add(currentModel, { animation: animation, physics: true });
            helperDone = true;
            addLog('✅ 모션 적용 완료 (IK+물리)', 'lime');
          } catch(e) {
            helperDone = true;
            addLog('helper 실패: ' + e.message + ', FK 시도');
            try {
              mixer = new THREE.AnimationMixer(currentModel);
              var action = mixer.clipAction(animation);
              action.setLoop(THREE.LoopOnce);
              action.clampWhenFinished = true;
              action.play();
              addLog('✅ 모션 적용 (FK)', 'lime');
            } catch(e2) {
              addLog('❌ FK도 실패: ' + e2.message, 'red');
            }
          }
          audioEl.src = mp3Url;
          addLog('✅ 음악 로드 완료', 'lime');

          // 카메라 리셋 및 로드
          cameraEnabled = false;
          try { helper.remove(camera); } catch(e) {}
          controls.enabled = true;
          loadCamera(camUrl || null);
          setCoverImage(coverUrl || null);
        }, function(p) {
          if (p.total > 0) addLog('VMD: ' + Math.round(p.loaded / p.total * 100) + '%');
        }, function(err) {
          addLog('❌ VMD 실패: ' + (err.message || err), 'red');
        });
      }

      // 로드 버튼 — 모델+곡 전체 새로 로드
      var currentPmxPath = null;

      // 모델만 로드
      document.getElementById('model-load-btn').addEventListener('click', function() {
        var modelKey = document.getElementById('model-select').value;
        var versionKey = document.getElementById('version-select').value;
        var model = modelDB[modelKey];
        if (!model || !versionKey || !model.versions[versionKey]) { addLog('❌ 캐릭터와 버전을 선택하세요', 'red'); return; }
        var pmxPath = model.versions[versionKey].pmx;
        currentPmxPath = pmxPath;
        addLog('모델 로드: ' + model.name + ' (' + model.versions[versionKey].name + ')');
        loadModel(pmxPath);
      });

      // 곡 로드 버튼
      document.getElementById('load-btn').addEventListener('click', function() {
        var artist = document.getElementById('artist-select').value;
        var songKey = document.getElementById('song-select').value;
        if (!artist || !songKey) { addLog('❌ 가수와 곡을 선택하세요', 'red'); return; }
        if (!currentModel) { addLog('❌ 먼저 모델을 로드하세요', 'red'); return; }
        var song = songDB[artist].songs[songKey];
        addLog('곡 로드: ' + songDB[artist].name + ' - ' + song.name);
        loadSong(song.vmd, song.mp3, song.cam, song.cover);
      });

      // 기본 모델만 로드 (T포즈 대기)
      loadModel(pmxUrl);

      // PMX 파일 업로드 — parser로 직접 파싱
      document.getElementById('pmx-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        addLog('PMX 로딩: ' + file.name);

        if (currentModel) {
          scene.remove(currentModel);
          currentModel = null;
          mixer = null;
          helper = new THREE.MMDAnimationHelper();
        }

        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var data = ev.target.result;
            var parser = new MMDParser.Parser();
            var pmx = parser.parsePmx(data, true);
            addLog('파싱 완료: 정점 ' + pmx.metadata.vertexCount + ', 면 ' + pmx.metadata.faceCount);

            // 직접 지오메트리 생성
            var geo = new THREE.BufferGeometry();
            var positions = [];
            var normals = [];
            var uvs = [];
            var indices = [];

            for (var i = 0; i < pmx.vertices.length; i++) {
              var v = pmx.vertices[i];
              positions.push(v.position[0], v.position[1], v.position[2]);
              normals.push(v.normal[0], v.normal[1], v.normal[2]);
              uvs.push(v.uv[0], v.uv[1]);
            }

            for (var i = 0; i < pmx.faces.length; i++) {
              var face = pmx.faces[i];
              indices.push(face.indices[0], face.indices[1], face.indices[2]);
            }

            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

            var indexArray = new Uint32Array(indices);
            geo.setIndex(new THREE.BufferAttribute(indexArray, 1));

            var materials = [];
            var offset = 0;
            for (var i = 0; i < pmx.materials.length; i++) {
              var m = pmx.materials[i];
              var d = m.diffuse || [0.8, 0.8, 0.8, 1.0];
              var mat = new THREE.MeshPhongMaterial({
                color: new THREE.Color(d[0], d[1], d[2]),
                opacity: d[3],
                transparent: d[3] < 1.0,
                side: THREE.DoubleSide,
                shininess: 20
              });
              materials.push(mat);
              geo.addGroup(offset, m.faceCount * 3, i);
              offset += m.faceCount * 3;
            }

            geo.computeBoundingSphere();
            var mesh = new THREE.Mesh(geo, materials);
            currentModel = mesh;
            scene.add(mesh);

            var box = new THREE.Box3().setFromObject(mesh);
            var center = box.getCenter(new THREE.Vector3());
            var size = box.getSize(new THREE.Vector3());
            controls.target.copy(center);
            camera.position.set(center.x, center.y, center.z + size.y * 2.5);
            controls.update();

            addLog('✅ PMX 모델 로드 완료 (' + pmx.materials.length + ' 머티리얼)', 'lime');
          } catch(err) {
            addLog('❌ PMX 파싱 실패: ' + (err.message || err), 'red');
          }
        };
        reader.readAsArrayBuffer(file);
      });

      // VMD 모션 업로드
      document.getElementById('vmd-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        if (!currentModel) {
          addLog('❌ 먼저 모델을 로드하세요', 'red');
          return;
        }
        addLog('VMD 로딩: ' + file.name);

        var reader = new FileReader();
        reader.onload = function(ev) {
          var blob = new Blob([ev.target.result]);
          var url = URL.createObjectURL(blob);

          mmdLoader.loadAnimation(url, currentModel, function(animation) {
            helper.remove(currentModel);
            helper.add(currentModel, { animation: animation });
            addLog('✅ VMD 모션 적용 완료: ' + file.name, 'lime');
            URL.revokeObjectURL(url);
          }, function(p) {
            if (p.total > 0) addLog('로딩: ' + Math.round(p.loaded / p.total * 100) + '%');
          }, function(err) {
            addLog('❌ VMD 로드 실패: ' + (err.message || err), 'red');
          });
        };
        reader.readAsArrayBuffer(file);
      });

      // GLB 파일 업로드
      document.getElementById('glb-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        addLog('GLB 로딩: ' + file.name);

        if (currentModel) {
          scene.remove(currentModel);
          currentModel = null;
          mixer = null;
        }

        var reader = new FileReader();
        reader.onload = function(ev) {
          var blob = new Blob([ev.target.result]);
          var url = URL.createObjectURL(blob);

          gltfLoader.load(url, function(gltf) {
            currentModel = gltf.scene;
            scene.add(currentModel);
            if (gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(currentModel);
              mixer.clipAction(gltf.animations[0]).play();
              addLog('✅ GLB 로드 완료 (애니메이션 ' + gltf.animations.length + '개)', 'lime');
            } else {
              addLog('✅ GLB 로드 완료', 'lime');
            }

            var box = new THREE.Box3().setFromObject(currentModel);
            var center = box.getCenter(new THREE.Vector3());
            var size = box.getSize(new THREE.Vector3());
            controls.target.copy(center);
            camera.position.set(center.x, center.y + size.y * 0.3, size.y * 2.5);

            URL.revokeObjectURL(url);
          }, null, function(err) {
            addLog('❌ GLB 로드 실패: ' + (err.message || err), 'red');
          });
        };
        reader.readAsArrayBuffer(file);
      });

      // WAV 음악 업로드
      document.getElementById('wav-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var audioEl = document.getElementById('bgm-audio');
        var url = URL.createObjectURL(file);
        audioEl.src = url;
        addLog('✅ 음악 로드: ' + file.name, 'lime');
      });

      // 음악 끝나면 모션도 정지
      document.getElementById('bgm-audio').addEventListener('ended', function() {
        isPlaying = false;
        this.currentTime = 0;
        addLog('■ 재생 완료');
      });

      // 재생 — 모션 + 음악 동시 시작
      document.getElementById('play-btn').addEventListener('click', function() {
        var audioEl = document.getElementById('bgm-audio');
        isPlaying = true;
        clock.getDelta(); // 델타 리셋
        if (audioEl.src) {
          audioEl.play();
        }
        addLog('▶ 재생 시작 (모션+음악 동기화)');
      });

      // 정지 — 모션 + 음악 동시 정지
      document.getElementById('stop-btn').addEventListener('click', function() {
        var audioEl = document.getElementById('bgm-audio');
        isPlaying = false;
        audioEl.pause();
        audioEl.currentTime = 0;
        addLog('■ 정지');
      });

      window.addEventListener('resize', function() {
        var w = container.clientWidth;
        var h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

    } catch(e) {
      addLog('❌ 씬 초기화 실패: ' + e.message, 'red');
    }
  }
})();
`,
        }}
      />
    </div>
  );
}
