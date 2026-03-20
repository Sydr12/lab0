"use client";

export default function MMDPage() {
  return (
    <div className="space-y-4">
      <div
        id="three-container"
        style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid #E8ECF0", position: "relative" }}
      />
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#1A1A2E", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          PMX 모델 로드
          <input id="pmx-input" type="file" accept=".pmx,.pmd" style={{ display: "none" }} />
        </label>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#4A90C4", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          VMD 모션 로드
          <input id="vmd-input" type="file" accept=".vmd" style={{ display: "none" }} />
        </label>
        <label style={{ fontSize: "12px", padding: "6px 12px", background: "#2a2a4e", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>
          GLB 모델 로드
          <input id="glb-input" type="file" accept=".glb,.gltf" style={{ display: "none" }} />
        </label>
      </div>
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

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.5, 3);

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

      // 기본 모델 로드
      addLog('기본 모델 로딩...');
      var gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load('/mmd/model.glb', function(gltf) {
        currentModel = gltf.scene;
        scene.add(currentModel);
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(currentModel);
          mixer.clipAction(gltf.animations[0]).play();
        }
        addLog('✅ 기본 모델 로드 완료', 'lime');
      }, null, function(err) {
        addLog('기본 모델 없음 (PMX/GLB를 업로드하세요)');
      });

      // PMX 파일 업로드
      document.getElementById('pmx-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        addLog('PMX 로딩: ' + file.name);

        if (currentModel) {
          scene.remove(currentModel);
          currentModel = null;
          mixer = null;
        }

        var reader = new FileReader();
        reader.onload = function(ev) {
          var mmdLoader = new THREE.MMDLoader();
          var blob = new Blob([ev.target.result]);
          var url = URL.createObjectURL(blob);

          mmdLoader.load(url, function(mesh) {
            currentModel = mesh;
            scene.add(mesh);
            helper.add(mesh);
            addLog('✅ PMX 모델 로드 완료: ' + file.name, 'lime');
            URL.revokeObjectURL(url);

            // 카메라 자동 조정
            var box = new THREE.Box3().setFromObject(mesh);
            var center = box.getCenter(new THREE.Vector3());
            var size = box.getSize(new THREE.Vector3());
            controls.target.copy(center);
            camera.position.set(center.x, center.y + size.y * 0.3, size.y * 2.5);
          }, function(p) {
            if (p.total > 0) addLog('로딩: ' + Math.round(p.loaded / p.total * 100) + '%');
          }, function(err) {
            addLog('❌ PMX 로드 실패: ' + (err.message || err), 'red');
          });
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

          var mmdLoader = new THREE.MMDLoader();
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
