"use client";

import { useEffect, useRef, useState } from "react";

export default function StageContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initRef = useRef(false);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<string[]>([]);

  const addLog = (msg: string, color?: string) => {
    logRef.current = [...logRef.current.slice(-15), msg];
    setLog([...logRef.current]);
  };

  useEffect(() => {
    if (!canvasRef.current || initRef.current) return;
    initRef.current = true;

    const canvas = canvasRef.current;

    (async () => {
      try {
        addLog("Babylon.js 초기화...");

        const { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, DirectionalLight, Color3, Color4, MeshBuilder, StandardMaterial } = await import("@babylonjs/core");
        await import("@babylonjs/loaders");
        const { MmdRuntime, MmdPhysics, MmdAmmoJSPlugin, MmdAmmoPhysics } = await import("babylon-mmd");
        const { SceneLoader } = await import("@babylonjs/core/Loading/sceneLoader");
        const { PmxLoader } = await import("babylon-mmd/esm/Loader/pmxLoader");
        const { VmdLoader } = await import("babylon-mmd/esm/Loader/vmdLoader");

        addLog("모듈 로드 완료");

        // 엔진
        const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, adaptToDeviceRatio: true });
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.1, 0.1, 0.15, 1);

        // PMX 로더 등록
        SceneLoader.RegisterPlugin(new PmxLoader());

        // 카메라
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 45, new Vector3(0, 10, 0), scene);
        camera.attachControl(canvas, true);
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 100;

        // 조명
        const hemiLight = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.5;
        const dirLight = new DirectionalLight("dir", new Vector3(0, -1, 1), scene);
        dirLight.intensity = 0.6;
        dirLight.position = new Vector3(0, 20, -10);

        // 바닥
        const ground = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
        const groundMat = new StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new Color3(0.15, 0.15, 0.25);
        groundMat.alpha = 0.3;
        ground.material = groundMat;

        // 물리 엔진 (babylon-mmd 내장 ammo)
        let physicsReady = false;
        let ammoInstance: any = null;
        try {
          const ammoModule = await import("babylon-mmd/esm/Runtime/Physics/External/ammo.wasm");
          ammoInstance = await ammoModule.default();
          physicsReady = true;
          addLog("ammo.wasm 로드 완료");
        } catch (e: any) {
          addLog("ammo 실패: " + e.message);
        }

        // 렌더 루프
        engine.runRenderLoop(() => scene.render());
        window.addEventListener("resize", () => engine.resize());

        addLog("씬 준비 완료");

        // songDB 로드
        let songDB: any = {};
        try {
          const res = await fetch("/mmd/songdb.json");
          songDB = await res.json();
          const artistSelect = document.getElementById("artist-select") as HTMLSelectElement;
          if (artistSelect) {
            artistSelect.innerHTML = '<option value="">-- 가수 --</option>';
            Object.keys(songDB).sort().forEach((key) => {
              const opt = document.createElement("option");
              opt.value = key;
              opt.textContent = songDB[key].name;
              artistSelect.appendChild(opt);
            });
          }
          addLog("songDB: " + Object.keys(songDB).length + " 아티스트");
        } catch (e) {
          addLog("songDB 로드 실패");
        }

        // modelDB
        const modelDB: Record<string, Record<string, string>> = {
          honoka: { Default: "/mmd/models/lovelive20141216/lovelive2/Kousaka_Honoka.pmx" },
          zoey: { Default: "/mmd/models/zoey/Zoey.pmx" },
          rumi: { Default: "/mmd/models/rumi/Rumi.pmx" },
          mira: { Default: "/mmd/models/mira/Mira.pmx" },
          kizuna: { Normal: "/mmd/models/kizuna_normal/kizuna_normal.pmx", Anime: "/mmd/models/kizuna_anime/kizuna_anime.pmx", Live: "/mmd/models/kizuna_live/kizuna_live.pmx" },
          yor: { Dress: "/mmd/models/yor_forger/yor_dress.pmx", Base: "/mmd/models/yor_forger/yor_base.pmx" },
          nezuko: { Base: "/mmd/models/nezuko/nezuko_base.pmx", Kimono: "/mmd/models/nezuko/nezuko.pmx", Child: "/mmd/models/nezuko/nezuko_child.pmx" },
          anya: { Default: "/mmd/models/anya_forger/anya.pmx" },
          tda_cn: { Default: "/mmd/models/tda_cn/tda.pmx" },
          ming: { Default: "/mmd/models/ming/ming.pmx" },
          pauline: { NSFW: "/mmd/models/pauline/pauline_nsfw.pmx", Dress: "/mmd/models/pauline/pauline_dress.pmx", Suit: "/mmd/models/pauline/pauline_suit.pmx" },
          sakura: { Default: "/mmd/models/sakura/sakura.pmx" },
          chloe: { Default: "/mmd/models/chloe/chloe.pmx" },
          kaiji: { Default: "/mmd/models/kaiji/Tatsuta_Kaiji_Comprehensive_better.pmx", Angel: "/mmd/models/kaiji/Tatsuta_Kaiji_Angel_Comprehensive_better.pmx" },
          mash: { "1st": "/mmd/models/mash/mash_1st.pmx", "2nd": "/mmd/models/mash/mash_2nd.pmx", "3rd": "/mmd/models/mash/mash_3rd.pmx", Inner: "/mmd/models/mash/mash_inner.pmx" },
          eleanor: { Day: "/mmd/models/eleanor/eleanor_day.pmx", Night: "/mmd/models/eleanor/eleanor_night.pmx" },
        };

        // 상태
        let mmdRuntime: any = null;
        let currentModel: any = null;
        let currentMeshes: any[] = [];
        let stageMeshes: any[] = [];
        let audioEl = document.getElementById("bgm-audio") as HTMLAudioElement;
        let isPlaying = false;

        // 모델 선택 → 버전 갱신
        const modelSelect = document.getElementById("model-select") as HTMLSelectElement;
        const versionSelect = document.getElementById("version-select") as HTMLSelectElement;

        modelSelect?.addEventListener("change", () => {
          if (!versionSelect) return;
          versionSelect.innerHTML = '<option value="">-- 버전 --</option>';
          const versions = modelDB[modelSelect.value];
          if (versions) {
            Object.keys(versions).forEach((v) => {
              const opt = document.createElement("option");
              opt.value = versions[v];
              opt.textContent = v;
              versionSelect.appendChild(opt);
            });
            if (Object.keys(versions).length === 1) {
              versionSelect.value = versions[Object.keys(versions)[0]];
            }
          }
        });

        // 가수 선택 → 곡 갱신
        const artistSelect = document.getElementById("artist-select") as HTMLSelectElement;
        const songSelect = document.getElementById("song-select") as HTMLSelectElement;

        artistSelect?.addEventListener("change", () => {
          if (!songSelect) return;
          songSelect.innerHTML = '<option value="">-- 곡 --</option>';
          const artist = songDB[artistSelect.value];
          if (artist) {
            Object.keys(artist.songs).forEach((key) => {
              const opt = document.createElement("option");
              opt.value = key;
              opt.textContent = artist.songs[key].name;
              songSelect.appendChild(opt);
            });
          }
        });

        // 모델 로드
        async function loadModel(pmxPath: string) {
          addLog("모델 로딩: " + pmxPath.split("/").pop());
          try {
            // 기존 모델 제거
            if (currentModel) {
              try { mmdRuntime?.destroyMmdModel(currentModel); } catch (e) {}
              currentModel = null;
            }
            currentMeshes.forEach((m: any) => { try { m.dispose(); } catch(e) {} });
            currentMeshes = [];

            const dir = pmxPath.substring(0, pmxPath.lastIndexOf("/") + 1);
            const file = pmxPath.split("/").pop()!;
            const result = await SceneLoader.ImportMeshAsync("", dir, file, scene);
            currentMeshes = result.meshes;

            if (!mmdRuntime) {
              if (physicsReady) {
                try {
                  scene.enablePhysics(new Vector3(0, -30, 0), new MmdAmmoJSPlugin(true, ammoInstance));
                  mmdRuntime = new MmdRuntime(scene, new MmdAmmoPhysics(scene));
                  addLog("물리 엔진 적용");
                } catch (pe: any) {
                  addLog("물리 실패, 물리 없이 진행: " + pe.message);
                  mmdRuntime = new MmdRuntime(scene);
                }
              } else {
                mmdRuntime = new MmdRuntime(scene);
              }
              mmdRuntime.register(scene);
            }

            currentModel = mmdRuntime.createMmdModel(result.meshes[0]);
            camera.target = result.meshes[0].position.add(new Vector3(0, 10, 0));

            addLog("✅ 모델 로드 완료", "lime");
          } catch (e: any) {
            addLog("❌ 모델 로드 실패: " + e.message, "red");
          }
        }

        // 카메라 상태
        let cameraEnabled = false;
        let currentCamPath: string | null = null;
        const camBtn = document.getElementById("cam-btn");

        // 곡 로드
        async function loadSong(vmdPath: string, mp3Path: string | null, camPath: string | null) {
          if (!currentModel) {
            addLog("❌ 먼저 모델을 로드하세요", "red");
            return;
          }
          addLog("VMD 로딩...");
          try {
            const vmdLoader = new VmdLoader(scene);
            const animation = await vmdLoader.loadAsync("motion", vmdPath);

            const handle = currentModel.createRuntimeAnimation(animation);
            currentModel.setRuntimeAnimation(handle);

            mmdRuntime.seekAnimation(0, true);
            isPlaying = false;

            if (mp3Path && audioEl) {
              audioEl.src = mp3Path;
              audioEl.currentTime = 0;
            }

            // 카메라 모션
            currentCamPath = camPath;
            cameraEnabled = false;
            if (camBtn) {
              if (camPath) {
                camBtn.style.display = "";
                camBtn.textContent = "CAM ON";
                (camBtn as HTMLButtonElement).style.background = "#F59E0B";
              } else {
                camBtn.style.display = "none";
              }
            }

            addLog("✅ 모션+음악 로드 완료" + (camPath ? " (카메라 있음)" : ""), "lime");
          } catch (e: any) {
            addLog("❌ VMD 로드 실패: " + e.message, "red");
          }
        }

        // 카메라 ON/OFF
        let mmdCamera: any = null;

        camBtn?.addEventListener("click", async () => {
          if (!currentCamPath || !mmdRuntime) return;

          if (!cameraEnabled) {
            try {
              const mmdCameraModule = await import("babylon-mmd/esm/Runtime/mmdCamera");
              await import("babylon-mmd/esm/Runtime/Animation/mmdRuntimeCameraAnimation");

              mmdCamera = new mmdCameraModule.MmdCamera("MmdCamera", new Vector3(0, 10, 0), scene);

              const vmdLoader = new VmdLoader(scene);
              const camAnimation = await vmdLoader.loadAsync("camera", currentCamPath);

              const camHandle = mmdCamera.createRuntimeAnimation(camAnimation);
              mmdCamera.setRuntimeAnimation(camHandle);
              mmdRuntime.addAnimatable(mmdCamera);

              scene.activeCamera = mmdCamera;
              camera.detachControl();

              cameraEnabled = true;
              camBtn!.textContent = "CAM OFF";
              (camBtn as HTMLButtonElement).style.background = "#EF4444";
              addLog("카메라 모션 ON");
            } catch (e: any) {
              addLog("카메라 실패: " + e.message, "red");
            }
          } else {
            if (mmdCamera) {
              try { mmdRuntime.removeAnimatable(mmdCamera); } catch (e) {}
              mmdCamera.dispose();
              mmdCamera = null;
            }
            scene.activeCamera = camera;
            camera.attachControl(canvas, true);
            cameraEnabled = false;
            camBtn!.textContent = "CAM ON";
            (camBtn as HTMLButtonElement).style.background = "#F59E0B";
            addLog("카메라 모션 OFF");
          }
        });

        // 버튼 이벤트
        // 스테이지 로드
        document.getElementById("stage-load-btn")?.addEventListener("click", async () => {
          const stageUrl = (document.getElementById("stage-select") as HTMLSelectElement)?.value;

          // 기존 스테이지 제거
          stageMeshes.forEach((m: any) => { try { m.dispose(); } catch(e) {} });
          stageMeshes = [];

          if (!stageUrl || stageUrl === "none") {
            ground.setEnabled(true);
            addLog("스테이지 제거");
            return;
          }

          ground.setEnabled(false);
          addLog("스테이지 로딩...");

          try {
            const stagePresets: Record<string, string[]> = {
              moon_all: [
                "/mmd/models/stages/moon/moon_main.pmx",
                "/mmd/models/stages/moon/moon_tree.pmx",
                "/mmd/models/stages/moon/moon_lantern.pmx",
                "/mmd/models/stages/moon/moon_flower.pmx",
              ],
              neon_all: [
                "/mmd/models/stages/neon/neon_main.pmx",
                "/mmd/models/stages/neon/neon_block_big.pmx",
                "/mmd/models/stages/neon/neon_block_small.pmx",
              ],
            };

            const urls = stagePresets[stageUrl] || [stageUrl];

            for (const url of urls) {
              const dir = url.substring(0, url.lastIndexOf("/") + 1);
              const file = url.split("/").pop()!;
              const result = await SceneLoader.ImportMeshAsync("", dir, file, scene);
              stageMeshes.push(...result.meshes);
              addLog("  로드: " + file);
            }
            addLog("✅ 스테이지 로드 완료", "lime");
          } catch (e: any) {
            addLog("❌ 스테이지 실패: " + e.message, "red");
            ground.setEnabled(true);
          }
        });

        document.getElementById("model-load-btn")?.addEventListener("click", () => {
          const pmx = versionSelect?.value;
          if (!pmx) { addLog("❌ 모델을 선택하세요"); return; }
          loadModel(pmx);
        });

        document.getElementById("load-btn")?.addEventListener("click", () => {
          const artist = artistSelect?.value;
          const songKey = songSelect?.value;
          if (!artist || !songKey) { addLog("❌ 곡을 선택하세요"); return; }
          const song = songDB[artist].songs[songKey];
          loadSong(song.vmd, song.mp3, song.cam || null);
        });

        document.getElementById("play-btn")?.addEventListener("click", () => {
          if (!mmdRuntime) return;
          isPlaying = true;
          mmdRuntime.playAnimation();
          if (audioEl?.src) audioEl.play();
          addLog("▶ 재생");
        });

        document.getElementById("stop-btn")?.addEventListener("click", () => {
          if (!mmdRuntime) return;
          isPlaying = false;
          mmdRuntime.pauseAnimation();
          if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
          mmdRuntime.seekAnimation(0);
          addLog("■ 정지");
        });

        audioEl?.addEventListener("ended", () => {
          isPlaying = false;
          if (mmdRuntime) mmdRuntime.pauseAnimation();
          addLog("■ 재생 완료");
        });

      } catch (e: any) {
        addLog("❌ 초기화 실패: " + e.message);
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl border border-border"
        style={{ height: "400px" }}
      />
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        <select id="model-select" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "8px", background: "#2a2a4e", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 캐릭터 --</option>
          <option value="honoka">호노카</option>
          <option value="zoey">Zoey</option>
          <option value="rumi">Rumi</option>
          <option value="mira">Mira</option>
          <option value="kizuna">키즈나아이</option>
          <option value="yor">요르</option>
          <option value="nezuko">네즈코</option>
          <option value="anya">아냐</option>
          <option value="tda_cn">TDA CN</option>
          <option value="ming">Ming</option>
          <option value="pauline">Pauline</option>
          <option value="sakura">Sakura</option>
          <option value="chloe">Chloe</option>
          <option value="kaiji">Kaiji Tatsuta</option>
          <option value="mash">Mash (FGO)</option>
          <option value="eleanor">Eleanor</option>
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
        <select id="stage-select" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "8px", background: "#2a2a4e", color: "#fff", border: "1px solid #444" }}>
          <option value="">-- 스테이지 --</option>
          <option value="none">없음 (그리드)</option>
          <option value="moon_all">Moon 전체 (달밤)</option>
          <option value="/mmd/models/stages/moon/moon_main.pmx">Moon 본체</option>
          <option value="/mmd/models/stages/moon/moon_tree.pmx">Moon 나무</option>
          <option value="/mmd/models/stages/moon/moon_lantern.pmx">Moon 등불</option>
          <option value="/mmd/models/stages/moon/moon_flower.pmx">Moon 꽃</option>
          <option value="neon_all">Neon 전체 (네온)</option>
          <option value="/mmd/models/stages/neon/neon_main.pmx">Neon 본체</option>
          <option value="/mmd/models/stages/neon/neon_block_big.pmx">Neon 블록 대</option>
          <option value="/mmd/models/stages/neon/neon_block_small.pmx">Neon 블록 소</option>
        </select>
        <button id="stage-load-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#8B5CF6", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          스테이지
        </button>
        <button id="cam-btn" style={{ fontSize: "12px", padding: "6px 12px", background: "#F59E0B", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer", display: "none" }}>
          CAM ON
        </button>
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
        className="bg-black rounded-xl p-3 text-xs font-mono max-h-40 overflow-y-auto"
        style={{ color: "#aaa" }}
      >
        {log.map((l, i) => (
          <div key={i} className={l.startsWith("❌") ? "text-red-500" : l.startsWith("✅") ? "text-green-500" : "text-gray-400"}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
