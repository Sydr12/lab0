"use client";

import { useEffect, useRef, useState } from "react";

export default function MMDPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    async function init() {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );

      if (disposed) return;

      const container = containerRef.current!;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.5, 3);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(3, 5, 3);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const backLight = new THREE.DirectionalLight(0x6cb4ee, 0.4);
      backLight.position.set(-2, 3, -3);
      scene.add(backLight);

      // Floor
      const floorGeo = new THREE.CircleGeometry(2, 64);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a4e,
        roughness: 0.8,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Grid
      const grid = new THREE.GridHelper(4, 20, 0x444488, 0x333366);
      grid.position.y = 0.001;
      scene.add(grid);

      // Load Model
      const loader = new GLTFLoader();
      let mixer: InstanceType<typeof THREE.AnimationMixer> | null = null;

      loader.load(
        "/mmd/model.glb",
        (gltf) => {
          if (disposed) return;
          const model = gltf.scene;
          model.traverse((child) => {
            if ((child as any).isMesh) {
              child.castShadow = true;
            }
          });
          scene.add(model);

          // Animation
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }

          setLoading(false);
        },
        undefined,
        (err) => {
          setError("모델 로드 실패");
          setLoading(false);
        }
      );

      // Animation Loop
      const clock = new THREE.Clock();
      function animate() {
        if (disposed) return;
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Resize
      function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      return () => {
        disposed = true;
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    }

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="w-full h-[500px] sm:h-[600px] rounded-2xl overflow-hidden border border-border relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-white text-sm">
            로딩 중...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="text-xs text-text-secondary">
        마우스 드래그: 회전 | 스크롤: 줌 | 우클릭 드래그: 이동
      </div>
    </div>
  );
}
