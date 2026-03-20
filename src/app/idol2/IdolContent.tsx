"use client";

import { useEffect, useRef } from "react";

export default function IdolContent() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    const el = document.getElementById("idol-script");
    if (el) {
      const s = document.createElement("script");
      s.textContent = el.textContent || "";
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "calc(100vh - 80px)" }}>
      {/* 상단: 3D 뷰포트 */}
      <div
        id="idol-viewport"
        style={{ flex: "1", minHeight: "250px", borderRadius: "12px", overflow: "hidden", border: "1px solid #E8ECF0", position: "relative" }}
      />

      {/* 컨트롤 바 */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        <select id="idol-model-select" style={{ fontSize: "11px", padding: "4px 6px", borderRadius: "6px", background: "#1A1A2E", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 모델 --</option>
          <option value="/mmd/models/lovelive20141216/lovelive2/Kousaka_Honoka.pmx">호노카</option>
          <option value="/mmd/models/zoey/Zoey.pmx">Zoey</option>
          <option value="/mmd/models/rumi/Rumi.pmx">Rumi</option>
          <option value="/mmd/models/mira/Mira.pmx">Mira</option>
          <option value="/mmd/models/kizuna_live/kizuna_live.pmx">키즈나 Live</option>
          <option value="/mmd/models/kizuna_normal/kizuna_normal.pmx">키즈나 Normal</option>
        </select>
        <button id="idol-model-load" style={{ fontSize: "11px", padding: "4px 8px", background: "#1A1A2E", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          모델
        </button>
        <select id="idol-vmd-select" style={{ fontSize: "11px", padding: "4px 6px", borderRadius: "6px", background: "#4A90C4", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- VMD --</option>
          <option value="/mmd/songs/aespa/black_mamba/aespa-black_mamba.vmd">Black Mamba</option>
          <option value="/mmd/songs/emon/shake_it/emon-shake_it.vmd">Shake It</option>
          <option value="/mmd/songs/jennie/solo/jennie-solo.vmd">JENNIE SOLO</option>
          <option value="/mmd/songs/psy/gentleman/psy-gentleman.vmd">Gentleman</option>
        </select>
        <button id="idol-vmd-load" style={{ fontSize: "11px", padding: "4px 8px", background: "#4A90C4", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          VMD
        </button>
        <button id="idol-prev" style={{ fontSize: "11px", padding: "4px 8px", background: "#333", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          ◀◀
        </button>
        <button id="idol-stepb" style={{ fontSize: "11px", padding: "4px 8px", background: "#333", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          ◀
        </button>
        <button id="idol-play" style={{ fontSize: "11px", padding: "4px 10px", background: "#22C55E", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          ▶
        </button>
        <button id="idol-pause" style={{ fontSize: "11px", padding: "4px 10px", background: "#EF4444", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          ■
        </button>
        <button id="idol-stepf" style={{ fontSize: "11px", padding: "4px 8px", background: "#333", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          ▶
        </button>
        <button id="idol-next" style={{ fontSize: "11px", padding: "4px 8px", background: "#333", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>
          ▶▶
        </button>
        <span id="idol-frame" style={{ fontSize: "12px", color: "#aaa", fontFamily: "monospace", minWidth: "80px" }}>
          F: 0 / 0
        </span>
      </div>

      {/* 타임라인 */}
      <div style={{ height: "60px", background: "#111", borderRadius: "8px", position: "relative", overflow: "hidden" }}>
        <canvas id="idol-timeline" style={{ width: "100%", height: "100%" }} />
      </div>

      {/* 본 정보 패널 */}
      <div style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
        <div style={{ flex: "1", background: "#111", borderRadius: "8px", padding: "8px", maxHeight: "120px", overflow: "auto" }}>
          <div style={{ color: "#888", marginBottom: "4px" }}>본 목록</div>
          <div id="idol-bonelist" style={{ fontFamily: "monospace", color: "#ccc" }} />
        </div>
        <div style={{ flex: "1", background: "#111", borderRadius: "8px", padding: "8px", maxHeight: "120px", overflow: "auto" }}>
          <div style={{ color: "#888", marginBottom: "4px" }}>키프레임 정보</div>
          <div id="idol-keyinfo" style={{ fontFamily: "monospace", color: "#ccc" }} />
        </div>
      </div>

      {/* 로그 */}
      <div
        id="idol-log"
        style={{ background: "#000", borderRadius: "8px", padding: "8px", fontSize: "11px", fontFamily: "monospace", color: "#aaa", maxHeight: "100px", overflow: "auto" }}
      />

      <script
        id="idol-script"
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var logEl = document.getElementById('idol-log');
  function addLog(msg, color) {
    var div = document.createElement('div');
    div.textContent = msg;
    div.style.color = color || '#aaa';
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  addLog('Idol2 초기화...');

  var scripts = [
    'https://cdn.jsdelivr.net/npm/ammo.js@0.0.10/ammo.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/mmd-parser/build/mmdparser.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/TGALoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MMDLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/CCDIKSolver.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/MMDPhysics.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/MMDAnimationHelper.js'
  ];

  var loaded = 0;
  function loadNext() {
    if (loaded >= scripts.length) {
      addLog('모듈 로드 완료');
      if (typeof Ammo === 'function') {
        Ammo().then(function(AmmoLib) {
          window.Ammo = AmmoLib;
          startEditor();
        });
        return;
      }
      startEditor();
      return;
    }
    var s = document.createElement('script');
    s.src = scripts[loaded];
    s.onload = function() { loaded++; loadNext(); };
    s.onerror = function() { loaded++; loadNext(); };
    document.head.appendChild(s);
  }
  loadNext();

  var scene, camera, renderer, controls, clock;
  var currentModel = null;
  var mixer = null;
  var vmdData = null;
  var currentFrame = 0;
  var totalFrames = 0;
  var isPlaying = false;
  var FPS = 30;
  var selectedBone = null;

  function startEditor() {
    try {
      var container = document.getElementById('idol-viewport');
      var width = container.clientWidth;
      var height = container.clientHeight;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
      camera.position.set(0, 10, 40);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 10, 0);
      controls.enableDamping = true;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(0, 10, 10);
      scene.add(dirLight);

      // 바닥
      var grid = new THREE.GridHelper(40, 20, 0x444488, 0x333366);
      scene.add(grid);

      clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        if (isPlaying && mixer) {
          mixer.update(1 / FPS);
          currentFrame++;
          if (currentFrame > totalFrames) {
            currentFrame = totalFrames;
            isPlaying = false;
          }
          updateFrameDisplay();
        }
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
      addLog('에디터 준비 완료', 'lime');

      // 프레임 표시 업데이트
      function updateFrameDisplay() {
        document.getElementById('idol-frame').textContent = 'F: ' + currentFrame + ' / ' + totalFrames;
        drawTimeline();
        showKeyframeInfo();
      }

      // 타임라인 그리기
      function drawTimeline() {
        var canvas = document.getElementById('idol-timeline');
        var ctx = canvas.getContext('2d');
        var w = canvas.parentElement.clientWidth;
        var h = canvas.parentElement.clientHeight;
        canvas.width = w;
        canvas.height = h;

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        if (totalFrames === 0) return;

        // 눈금
        var step = Math.max(1, Math.floor(totalFrames / 50));
        ctx.strokeStyle = '#333';
        ctx.fillStyle = '#555';
        ctx.font = '9px monospace';
        for (var i = 0; i <= totalFrames; i += step) {
          var x = (i / totalFrames) * w;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
          if (i % (step * 5) === 0) {
            ctx.fillText(i, x + 2, 10);
          }
        }

        // 키프레임 표시
        if (vmdData && selectedBone) {
          var keys = vmdData.bones.filter(function(b) { return b.name === selectedBone; });
          keys.forEach(function(k) {
            var x = (k.frameNum / totalFrames) * w;
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(x - 1, 15, 3, h - 20);
          });
        } else if (vmdData) {
          // 전체 키프레임 밀도
          var density = new Uint8Array(w);
          vmdData.bones.forEach(function(b) {
            var x = Math.floor((b.frameNum / totalFrames) * w);
            if (x >= 0 && x < w) density[x] = Math.min(255, density[x] + 10);
          });
          for (var px = 0; px < w; px++) {
            if (density[px] > 0) {
              ctx.fillStyle = 'rgba(106,180,238,' + (density[px] / 255) + ')';
              ctx.fillRect(px, 20, 1, h - 25);
            }
          }
        }

        // 재생 위치
        var cx = (currentFrame / totalFrames) * w;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();
      }

      // 타임라인 클릭 → 프레임 이동
      document.getElementById('idol-timeline').addEventListener('click', function(e) {
        if (totalFrames === 0) return;
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        currentFrame = Math.round((x / rect.width) * totalFrames);
        if (mixer) mixer.setTime(currentFrame / FPS);
        updateFrameDisplay();
      });

      // 키프레임 정보 표시
      function showKeyframeInfo() {
        var el = document.getElementById('idol-keyinfo');
        if (!vmdData) { el.textContent = 'VMD 미로드'; return; }

        var boneName = selectedBone || '(본 선택 안 됨)';
        var keys = vmdData.bones.filter(function(b) { return b.name === boneName && b.frameNum === currentFrame; });

        if (keys.length === 0) {
          // 가장 가까운 키프레임 찾기
          var nearest = vmdData.bones.filter(function(b) { return b.name === boneName; });
          nearest.sort(function(a, b) { return Math.abs(a.frameNum - currentFrame) - Math.abs(b.frameNum - currentFrame); });
          if (nearest.length > 0) {
            var n = nearest[0];
            el.innerHTML = '<div style="color:#888">본: ' + boneName + '</div>' +
              '<div style="color:#666">현재 프레임에 키 없음</div>' +
              '<div>가장 가까운 키: F' + n.frameNum + '</div>' +
              '<div>위치: ' + n.position.map(function(v) { return v.toFixed(2); }).join(', ') + '</div>' +
              '<div>회전: ' + n.rotation.map(function(v) { return v.toFixed(3); }).join(', ') + '</div>';
          }
        } else {
          var k = keys[0];
          el.innerHTML = '<div style="color:#F59E0B">본: ' + boneName + ' [키프레임]</div>' +
            '<div>프레임: ' + k.frameNum + '</div>' +
            '<div>위치: ' + k.position.map(function(v) { return v.toFixed(2); }).join(', ') + '</div>' +
            '<div>회전: ' + k.rotation.map(function(v) { return v.toFixed(3); }).join(', ') + '</div>';
        }
      }

      // 본 목록 표시
      function showBoneList() {
        var el = document.getElementById('idol-bonelist');
        if (!vmdData) { el.textContent = 'VMD 미로드'; return; }

        var boneNames = {};
        vmdData.bones.forEach(function(b) {
          if (!boneNames[b.name]) boneNames[b.name] = 0;
          boneNames[b.name]++;
        });

        var html = '';
        Object.keys(boneNames).sort().forEach(function(name) {
          var cls = name === selectedBone ? 'color:#F59E0B;font-weight:bold' : 'color:#ccc';
          html += '<div style="cursor:pointer;padding:1px 0;' + cls + '" data-bone="' + name + '">' +
            name + ' (' + boneNames[name] + ')' + '</div>';
        });
        el.innerHTML = html;

        // 본 클릭 이벤트
        el.querySelectorAll('[data-bone]').forEach(function(div) {
          div.addEventListener('click', function() {
            selectedBone = this.getAttribute('data-bone');
            addLog('본 선택: ' + selectedBone);
            showBoneList();
            updateFrameDisplay();
          });
        });
      }

      // PMX 로드
      var folderFiles = {}; // 폴더 업로드 시 텍스처 맵
      var mmdManager = new THREE.LoadingManager();
      mmdManager.setURLModifier(function(url) {
        var fixed = url.split(String.fromCharCode(92)).join('/');
        // 폴더 업로드 텍스처 매핑
        if (fixed.indexOf('blob:') === 0) {
          var filename = fixed.split('/').pop().split('#')[0];
          // blob URL에서 파일명 추출 불가하므로 folderFiles에서 검색
          var keys = Object.keys(folderFiles);
          for (var i = 0; i < keys.length; i++) {
            if (fixed.indexOf(keys[i]) >= 0 || keys[i].indexOf(filename) >= 0) {
              return folderFiles[keys[i]];
            }
          }
          if (fixed.indexOf('.pmx') === -1 && fixed.indexOf('.pmd') === -1) {
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==';
          }
        }
        return fixed;
      });
      var mmdLoader = new THREE.MMDLoader(mmdManager);

      // 드롭박스 모델 로드
      document.getElementById('idol-model-load').addEventListener('click', function() {
        var pmxUrl = document.getElementById('idol-model-select').value;
        if (!pmxUrl) { addLog('모델을 선택하세요', 'red'); return; }
        if (currentModel) { scene.remove(currentModel); currentModel = null; mixer = null; }
        addLog('모델 로딩...');
        mmdLoader.load(pmxUrl, function(mesh) {
          currentModel = mesh;
          scene.add(mesh);
          var box = new THREE.Box3().setFromObject(mesh);
          var center = box.getCenter(new THREE.Vector3());
          var size = box.getSize(new THREE.Vector3());
          if (size.y > 100) { controls.target.set(0, 10, 0); camera.position.set(0, 10, 40); }
          else { controls.target.copy(center); camera.position.set(center.x, center.y, center.z + size.y * 2.5); }
          controls.update();
          if (mesh.material) {
            var mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(function(m) {
              if (m.color && m.color.r > 0.85) m.color.multiplyScalar(0.65);
              if (m.emissive) m.emissive.setScalar(0);
              if (m.gradientMap) { m.gradientMap = null; m.needsUpdate = true; }
            });
          }
          addLog('모델 로드 완료: ' + (mesh.skeleton ? mesh.skeleton.bones.length : 0) + '본', 'lime');
        }, function(p) {
          if (p.total > 0) addLog('PMX: ' + Math.round(p.loaded / p.total * 100) + '%');
        }, function(err) { addLog('모델 로드 실패: ' + (err.message || err), 'red'); });
      });

      // 드롭박스 VMD 로드
      document.getElementById('idol-vmd-load').addEventListener('click', function() {
        var vmdUrl = document.getElementById('idol-vmd-select').value;
        if (!vmdUrl) { addLog('VMD를 선택하세요', 'red'); return; }
        addLog('VMD 로딩...');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', vmdUrl, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          try {
            var parser = new MMDParser.Parser();
            vmdData = parser.parseVmd(xhr.response, true);
            var boneKey = vmdData.bones ? 'bones' : (vmdData.motions ? 'motions' : null);
            if (!boneKey) {
              Object.keys(vmdData).forEach(function(k) {
                if (Array.isArray(vmdData[k]) && vmdData[k].length > 0 && vmdData[k][0].frameNum !== undefined && !boneKey) boneKey = k;
              });
            }
            if (boneKey && boneKey !== 'bones') vmdData.bones = vmdData[boneKey];
            if (!vmdData.bones) { addLog('VMD 본 데이터 없음', 'red'); return; }

            totalFrames = 0;
            vmdData.bones.forEach(function(b) { if (b.frameNum > totalFrames) totalFrames = b.frameNum; });
            addLog('VMD 파싱: ' + vmdData.bones.length + '키, ' + totalFrames + '프레임', 'lime');
            currentFrame = 0;
            selectedBone = null;
            showBoneList();
            updateFrameDisplay();

            if (currentModel) {
              mmdLoader.loadAnimation(vmdUrl, currentModel, function(animation) {
                mixer = new THREE.AnimationMixer(currentModel);
                var action = mixer.clipAction(animation);
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                action.play();
                mixer.setTime(0);
                isPlaying = false;
                addLog('모션 적용 완료', 'lime');
              }, null, function(err) { addLog('모션 적용 실패', 'red'); });
            }
          } catch(err) { addLog('VMD 파싱 실패: ' + err.message, 'red'); }
        };
        xhr.send();
      });

      // 폴더 업로드 — 텍스처 포함
      document.getElementById('idol-pmx-folder').addEventListener('change', function(e) {
        var files = e.target.files;
        if (!files || files.length === 0) return;
        folderFiles = {};
        var pmxFile = null;
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          var path = (f.webkitRelativePath || f.name).split(String.fromCharCode(92)).join('/');
          var blobUrl = URL.createObjectURL(f);
          // 파일명과 상대경로 모두 매핑
          folderFiles[f.name] = blobUrl;
          folderFiles[path] = blobUrl;
          // 하위 경로도 매핑 (TEX/face.png 등)
          var parts = path.split('/');
          if (parts.length > 1) {
            folderFiles[parts.slice(1).join('/')] = blobUrl;
          }
          if (f.name.toLowerCase().endsWith('.pmx') || f.name.toLowerCase().endsWith('.pmd')) {
            pmxFile = f;
          }
        }
        addLog('폴더: ' + files.length + '개 파일, PMX: ' + (pmxFile ? pmxFile.name : '없음'));
        if (!pmxFile) { addLog('PMX 파일 없음', 'red'); return; }

        if (currentModel) { scene.remove(currentModel); currentModel = null; mixer = null; }

        var reader = new FileReader();
        reader.onload = function(ev) {
          var blob = new Blob([ev.target.result]);
          var ext = pmxFile.name.toLowerCase().endsWith('.pmd') ? '.pmd' : '.pmx';
          var url = URL.createObjectURL(blob) + '#model' + ext;
          mmdLoader.load(url, function(mesh) {
            currentModel = mesh;
            scene.add(mesh);
            var box = new THREE.Box3().setFromObject(mesh);
            var center = box.getCenter(new THREE.Vector3());
            var size = box.getSize(new THREE.Vector3());
            if (size.y > 100) { controls.target.set(0, 10, 0); camera.position.set(0, 10, 40); }
            else { controls.target.copy(center); camera.position.set(center.x, center.y, center.z + size.y * 2.5); }
            controls.update();
            if (mesh.material) {
              var mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach(function(m) {
                if (m.color && m.color.r > 0.85) m.color.multiplyScalar(0.65);
                if (m.emissive) m.emissive.setScalar(0);
                if (m.gradientMap) { m.gradientMap = null; m.needsUpdate = true; }
              });
            }
            addLog('PMX 로드 완료 (텍스처 포함): ' + (mesh.skeleton ? mesh.skeleton.bones.length : 0) + '본', 'lime');
          }, null, function(err) { addLog('PMX 로드 실패: ' + (err.message || err), 'red'); });
        };
        reader.readAsArrayBuffer(pmxFile);
      });

      // 단일 PMX 업로드
      document.getElementById('idol-pmx').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        addLog('PMX 로딩: ' + file.name);
        if (currentModel) { scene.remove(currentModel); currentModel = null; mixer = null; }

        var reader = new FileReader();
        reader.onload = function(ev) {
          var blob = new Blob([ev.target.result]);
          var ext = file.name.toLowerCase().endsWith('.pmd') ? '.pmd' : '.pmx';
          var url = URL.createObjectURL(blob) + '#model' + ext;
          mmdLoader.load(url, function(mesh) {
            currentModel = mesh;
            scene.add(mesh);
            var box = new THREE.Box3().setFromObject(mesh);
            var center = box.getCenter(new THREE.Vector3());
            var size = box.getSize(new THREE.Vector3());
            if (size.y > 100) {
              controls.target.set(0, 10, 0);
              camera.position.set(0, 10, 40);
            } else {
              controls.target.copy(center);
              camera.position.set(center.x, center.y, center.z + size.y * 2.5);
            }
            controls.update();

            // 머티리얼 보정
            if (mesh.material) {
              var mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach(function(m) {
                if (m.color && m.color.r > 0.85) m.color.multiplyScalar(0.65);
                if (m.emissive) m.emissive.setScalar(0);
                if (m.gradientMap) { m.gradientMap = null; m.needsUpdate = true; }
              });
            }

            addLog('PMX 로드 완료: ' + (mesh.skeleton ? mesh.skeleton.bones.length : 0) + '본', 'lime');
          }, null, function(err) {
            addLog('PMX 로드 실패: ' + (err.message || err), 'red');
          });
        };
        reader.readAsArrayBuffer(file);
      });

      // VMD 로드
      document.getElementById('idol-vmd').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        addLog('VMD 로딩: ' + file.name);

        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var parser = new MMDParser.Parser();
            vmdData = parser.parseVmd(ev.target.result, true);

            // VMD 구조 확인
            addLog('VMD 키: ' + Object.keys(vmdData).join(', '));

            // bones가 없으면 motions 등 다른 키 사용
            var boneKey = vmdData.bones ? 'bones' : (vmdData.motions ? 'motions' : null);
            if (!boneKey) {
              // 키 중에서 배열인 것 찾기
              Object.keys(vmdData).forEach(function(k) {
                if (Array.isArray(vmdData[k]) && vmdData[k].length > 0) {
                  addLog('  ' + k + ': ' + vmdData[k].length + '개 (타입: ' + typeof vmdData[k][0] + ')');
                  if (vmdData[k][0] && vmdData[k][0].frameNum !== undefined && !boneKey) {
                    boneKey = k;
                  }
                }
              });
            }

            if (!boneKey) { addLog('VMD 본 데이터 없음', 'red'); return; }

            // bones 키로 통일
            if (boneKey !== 'bones') {
              vmdData.bones = vmdData[boneKey];
              addLog('본 데이터 키: ' + boneKey + ' → bones로 매핑');
            }

            // 총 프레임 계산
            totalFrames = 0;
            vmdData.bones.forEach(function(b) {
              if (b.frameNum > totalFrames) totalFrames = b.frameNum;
            });

            addLog('VMD 파싱 완료: ' + vmdData.bones.length + '개 키프레임, ' + totalFrames + '프레임', 'lime');
            currentFrame = 0;
            selectedBone = null;
            showBoneList();
            updateFrameDisplay();

            // 모델에 모션 적용
            if (currentModel) {
              var blob = new Blob([ev.target.result]);
              var url = URL.createObjectURL(blob);
              mmdLoader.loadAnimation(url, currentModel, function(animation) {
                mixer = new THREE.AnimationMixer(currentModel);
                var action = mixer.clipAction(animation);
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                action.play();
                mixer.setTime(0);
                isPlaying = false;
                addLog('모션 적용 완료', 'lime');
              }, null, function(err) {
                addLog('모션 적용 실패: ' + (err.message || err), 'red');
              });
            }
          } catch(err) {
            addLog('VMD 파싱 실패: ' + err.message, 'red');
          }
        };
        reader.readAsArrayBuffer(file);
      });

      // 컨트롤 버튼
      document.getElementById('idol-play').addEventListener('click', function() {
        if (!mixer) return;
        isPlaying = true;
        clock.getDelta();
      });
      document.getElementById('idol-pause').addEventListener('click', function() {
        isPlaying = false;
      });
      document.getElementById('idol-stepf').addEventListener('click', function() {
        if (!mixer) return;
        isPlaying = false;
        currentFrame = Math.min(currentFrame + 1, totalFrames);
        mixer.setTime(currentFrame / FPS);
        updateFrameDisplay();
      });
      document.getElementById('idol-stepb').addEventListener('click', function() {
        if (!mixer) return;
        isPlaying = false;
        currentFrame = Math.max(currentFrame - 1, 0);
        mixer.setTime(currentFrame / FPS);
        updateFrameDisplay();
      });
      document.getElementById('idol-next').addEventListener('click', function() {
        if (!mixer || !vmdData || !selectedBone) return;
        isPlaying = false;
        var keys = vmdData.bones.filter(function(b) { return b.name === selectedBone && b.frameNum > currentFrame; });
        keys.sort(function(a, b) { return a.frameNum - b.frameNum; });
        if (keys.length > 0) {
          currentFrame = keys[0].frameNum;
          mixer.setTime(currentFrame / FPS);
          updateFrameDisplay();
        }
      });
      document.getElementById('idol-prev').addEventListener('click', function() {
        if (!mixer || !vmdData || !selectedBone) return;
        isPlaying = false;
        var keys = vmdData.bones.filter(function(b) { return b.name === selectedBone && b.frameNum < currentFrame; });
        keys.sort(function(a, b) { return b.frameNum - a.frameNum; });
        if (keys.length > 0) {
          currentFrame = keys[0].frameNum;
          mixer.setTime(currentFrame / FPS);
          updateFrameDisplay();
        }
      });

      window.addEventListener('resize', function() {
        var c = document.getElementById('idol-viewport');
        var w = c.clientWidth;
        var h = c.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

    } catch(e) {
      addLog('에디터 초기화 실패: ' + e.message, 'red');
    }
  }
})();
`,
        }}
      />
    </div>
  );
}
