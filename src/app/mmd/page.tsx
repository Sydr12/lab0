"use client";

export default function MMDPage() {
  return (
    <div className="space-y-4">
      <div
        id="three-container"
        style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid #E8ECF0", position: "relative" }}
      />
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#1A1A2E", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          PMX 모델
          <input id="pmx-input" type="file" accept=".pmx,.pmd" style={{ display: "none" }} />
        </label>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#4A90C4", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          VMD 모션
          <input id="vmd-input" type="file" accept=".vmd" style={{ display: "none" }} />
        </label>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#2a2a4e", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          GLB 모델
          <input id="glb-input" type="file" accept=".glb,.gltf" style={{ display: "none" }} />
        </label>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#8B5CF6", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          WAV 음악
          <input id="wav-input" type="file" accept=".wav,.mp3,.ogg" style={{ display: "none" }} />
        </label>
        <button id="play-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#22C55E", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          ▶ 재생
        </button>
        <button id="stop-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#EF4444", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          ■ 정지
        </button>
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

  addLog('초기화 시작...');

  var scripts = [
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/mmd-parser/build/mmdparser.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MMDLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/MMDAnimationHelper.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/effects/OutlineEffect.js'
  ];

  var loaded = 0;
  function loadNext() {
    if (loaded >= scripts.length) {
      addLog('모든 모듈 로드 완료');
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

      var effect = new THREE.OutlineEffect(renderer);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1, 0);
      controls.enableDamping = true;

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(3, 5, 3);
      scene.add(dirLight);
      var backLight = new THREE.DirectionalLight(0x6cb4ee, 0.3);
      backLight.position.set(-2, 2, -3);
      scene.add(backLight);

      var floor = new THREE.Mesh(
        new THREE.CircleGeometry(2, 64),
        new THREE.MeshStandardMaterial({ color: 0x2a2a4e })
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      var grid = new THREE.GridHelper(4, 20, 0x444488, 0x333366);
      grid.position.y = 0.001;
      scene.add(grid);

      // 텍스처 로드 실패를 무시하는 LoadingManager
      var mmdManager = new THREE.LoadingManager();
      mmdManager.onError = function(url) {
        addLog('리소스 스킵: ' + url.split('/').pop());
      };
      // 백슬래시→슬래시 변환, TGA→PNG 폴백
      mmdManager.setURLModifier(function(url) {
        var fixed = url.replace(/\\\\/g, '/');
        // blob URL의 경우 텍스처 스킵
        if (fixed.indexOf('blob:') === 0 && !fixed.match(/\\.(pmx|pmd|vmd)$/i)) {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==';
        }
        return fixed;
      });

      helper = new THREE.MMDAnimationHelper();
      clock = new THREE.Clock();
      mixer = null;

      function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        if (helper.meshes && helper.meshes.length > 0) {
          helper.update(delta);
        }
        if (mixer) mixer.update(delta);
        controls.update();
        effect.render(scene, camera);
      }
      animate();
      addLog('렌더링 시작됨');

      var gltfLoader = new THREE.GLTFLoader();
      var mmdLoader = new THREE.MMDLoader(mmdManager);
      var pmxUrl = '/mmd/lovelive20141216/lovelive2/Kousaka_Honoka.pmx';
      var vmdUrl = '/mmd/dance.vmd';
      var audioUrl = '/mmd/audio.wav';

      // MMDLoader로 모델+모션+오디오 로드
      addLog('PMX 모델 로딩 (MMDLoader)...');
      mmdLoader.loadWithAnimation(pmxUrl, vmdUrl, function(mmd) {
        currentModel = mmd.mesh;
        scene.add(mmd.mesh);

        helper.add(mmd.mesh, { animation: mmd.animation, physics: false });

        var box = new THREE.Box3().setFromObject(mmd.mesh);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());
        controls.target.copy(center);
        camera.position.set(center.x, center.y, center.z + size.y * 2.5);
        controls.update();

        addLog('✅ 모델+모션 로드 완료', 'lime');

        // 오디오 로드 시도
        var audioEl = document.getElementById('bgm-audio');
        if (audioEl) {
          audioEl.src = audioUrl;
          addLog('오디오 준비 완료 (재생 버튼을 누르세요)');
        }
      }, function(p) {
        if (p.total > 0) addLog('로딩: ' + Math.round(p.loaded / p.total * 100) + '%');
      }, function(err) {
        addLog('MMDLoader 실패, 커스텀 파서로 시도...', 'yellow');
        // 커스텀 파서 폴백
        var xhr = new XMLHttpRequest();
        xhr.open('GET', pmxUrl, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          try {
            var parser = new MMDParser.Parser();
            var pmx = parser.parsePmx(xhr.response, true);
            var geo = new THREE.BufferGeometry();
            var positions = [], normals = [], uvs = [], indices = [];

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
            geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            var materials = [];
            var offset = 0;
            for (var i = 0; i < pmx.materials.length; i++) {
              var m = pmx.materials[i];
              var d = m.diffuse || [0.8, 0.8, 0.8, 1.0];
              var mat = new THREE.MeshPhongMaterial({
                color: new THREE.Color(d[0], d[1], d[2]),
                opacity: d[3],
                transparent: d[3] < 1.0,
                side: THREE.DoubleSide
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
            controls.target.copy(center);
            camera.position.set(center.x, center.y, center.z + 50);
            controls.update();

            addLog('✅ 커스텀 파서로 로드 완료 (텍스처 없음)', 'lime');
          } catch(e) {
            addLog('❌ 파싱 실패: ' + e.message, 'red');
          }
        };
        xhr.send();
      });

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

      // 재생/정지
      document.getElementById('play-btn').addEventListener('click', function() {
        var audioEl = document.getElementById('bgm-audio');
        if (audioEl.src) {
          audioEl.play();
          addLog('▶ 재생 시작');
        }
        // MMD 애니메이션도 리셋
        if (helper.meshes && helper.meshes.length > 0) {
          addLog('애니메이션 재생 중');
        }
      });

      document.getElementById('stop-btn').addEventListener('click', function() {
        var audioEl = document.getElementById('bgm-audio');
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
