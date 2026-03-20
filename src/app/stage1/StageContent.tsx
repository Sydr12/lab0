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

        const { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, DirectionalLight, Color3, Color4, MeshBuilder, StandardMaterial, ShadowGenerator } = await import("@babylonjs/core");
        await import("@babylonjs/loaders");
        const { MmdRuntime, MmdPhysics, MmdAmmoJSPlugin, MmdAmmoPhysics } = await import("babylon-mmd");
        const { SceneLoader } = await import("@babylonjs/core/Loading/sceneLoader");
        const { PmxLoader } = await import("babylon-mmd/esm/Loader/pmxLoader");
        const { VmdLoader } = await import("babylon-mmd/esm/Loader/vmdLoader");
        const { MmdOutlineRenderer } = await import("babylon-mmd/esm/Loader/mmdOutlineRenderer");
        const { StreamAudioPlayer } = await import("babylon-mmd/esm/Runtime/Audio/streamAudioPlayer");
        const { DefaultRenderingPipeline } = await import("@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline");
        const { GlowLayer } = await import("@babylonjs/core/Layers/glowLayer");

        addLog("모듈 로드 완료");

        // 엔진
        const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, adaptToDeviceRatio: true });
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.1, 0.1, 0.15, 1);

        // PMX 로더 등록
        const pmxLoader = new PmxLoader();
        SceneLoader.RegisterPlugin(pmxLoader);

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

        // 그림자 (기본 off)
        const shadowGenerator = new ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 4;
        shadowGenerator.setDarkness(1); // 1 = 그림자 없음

        // 아웃라인 렌더러
        const outlineRenderer = new MmdOutlineRenderer(scene);

        // 바닥
        const ground = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
        const groundMat = new StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new Color3(0.15, 0.15, 0.25);
        groundMat.alpha = 0.3;
        ground.material = groundMat;
        ground.receiveShadows = true;

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

        // 포스트 프로세싱
        const pipeline = new DefaultRenderingPipeline("pipeline", true, scene, [camera]);
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.contrast = 1.2;
        pipeline.imageProcessing.exposure = 1.1;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = 1; // ACES
        pipeline.fxaaEnabled = true;

        // 글로우 레이어
        const glowLayer = new GlowLayer("glow", scene);
        glowLayer.intensity = 0.3;

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
        let stageMeshes: any[] = [];
        let audioEl = document.getElementById("bgm-audio") as HTMLAudioElement;
        let audioPlayer: any = null;
        let isPlaying = false;

        // 멀티 캐릭터 슬롯
        interface CharSlot {
          model: any;
          meshes: any[];
          pmxPath: string | null;
          modelKey: string;
          versionVal: string;
        }
        let slots: CharSlot[] = [];
        let slotCount = 1;
        const SLOT_SPACING = 8;
        let maxMembers = 1; // 현재 곡의 최대 멤버 수 (기본 솔로)
        let songLoaded = false;

        const modelOptionsHtml = `
          <option value="">-- 캐릭터 --</option>
          <option value="honoka">호노카</option>
          <option value="zoey">Zoey</option><option value="rumi">Rumi</option>
          <option value="mira">Mira</option><option value="kizuna">키즈나아이</option>
          <option value="yor">요르</option><option value="nezuko">네즈코</option>
          <option value="anya">아냐</option><option value="tda_cn">TDA CN</option>
          <option value="ming">Ming</option><option value="pauline">Pauline</option>
          <option value="sakura">Sakura</option><option value="chloe">Chloe</option>
          <option value="kaiji">Kaiji</option><option value="mash">Mash</option>
          <option value="eleanor">Eleanor</option>`;

        function updateUIState() {
          const hasChar = slots.some(s => s && s.model);
          const addBtn = document.getElementById("slot-add") as HTMLButtonElement;
          const removeBtn = document.getElementById("slot-remove") as HTMLButtonElement;
          const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
          const musicPanel = document.getElementById("music-panel");
          const loadSongBtn = document.getElementById("load-btn") as HTMLButtonElement;

          // 뮤직 패널: 캐릭터 1개 이상 로드 시 활성
          if (musicPanel) musicPanel.style.opacity = hasChar ? "1" : "0.4";
          if (loadSongBtn) loadSongBtn.disabled = !hasChar;

          // +/- 버튼: 곡 멤버수에 따라
          if (addBtn) addBtn.disabled = slotCount >= maxMembers;
          if (removeBtn) removeBtn.disabled = slotCount <= 1;

          // 재생: 캐릭터 + 곡 둘 다 있어야
          if (playBtn) playBtn.disabled = !(hasChar && songLoaded);
        }

        function renderSlots() {
          const container = document.getElementById("char-slots");
          if (!container) return;

          // 기존 슬롯의 선택값 보존
          const savedSelections: { modelKey: string; versionVal: string }[] = [];
          for (let i = 0; i < slotCount; i++) {
            const ms = document.getElementById("slot-model-" + i) as HTMLSelectElement;
            const vs = document.getElementById("slot-version-" + i) as HTMLSelectElement;
            savedSelections.push({
              modelKey: ms?.value || (slots[i]?.modelKey || ""),
              versionVal: vs?.value || (slots[i]?.versionVal || ""),
            });
          }

          container.innerHTML = "";
          for (let i = 0; i < slotCount; i++) {
            const row = document.createElement("div");
            row.style.cssText = "display:flex;gap:4px;align-items:center;margin-bottom:4px;";
            row.innerHTML = `
              <span style="color:#F59E0B;width:18px;flex-shrink:0">#${i + 1}</span>
              <select id="slot-model-${i}" style="flex:1;font-size:11px;padding:3px 4px;border-radius:6px;background:#1a1a2e;color:#fff;border:1px solid #333">${modelOptionsHtml}</select>
              <select id="slot-version-${i}" style="flex:1;font-size:11px;padding:3px 4px;border-radius:6px;background:#1a1a2e;color:#fff;border:1px solid #333"><option value="">-- 버전 --</option></select>
              <button id="slot-load-${i}" style="font-size:10px;padding:3px 8px;background:#6B7280;color:#fff;border-radius:4px;border:none;cursor:pointer">로드</button>`;
            container.appendChild(row);

            const ms = document.getElementById("slot-model-" + i) as HTMLSelectElement;
            const vs = document.getElementById("slot-version-" + i) as HTMLSelectElement;

            // 선택값 복원
            if (savedSelections[i]?.modelKey) {
              ms.value = savedSelections[i].modelKey;
              // 버전 목록 채우기
              const versions = modelDB[ms.value];
              if (versions) {
                vs.innerHTML = '<option value="">-- 버전 --</option>';
                Object.keys(versions).forEach((v) => {
                  const opt = document.createElement("option");
                  opt.value = versions[v];
                  opt.textContent = v;
                  vs.appendChild(opt);
                });
                if (savedSelections[i].versionVal) vs.value = savedSelections[i].versionVal;
                else if (Object.keys(versions).length === 1) vs.value = versions[Object.keys(versions)[0]];
              }
            }

            // 이벤트
            ms.addEventListener("change", () => {
              vs.innerHTML = '<option value="">-- 버전 --</option>';
              const versions = modelDB[ms.value];
              if (versions) {
                Object.keys(versions).forEach((v) => {
                  const opt = document.createElement("option");
                  opt.value = versions[v];
                  opt.textContent = v;
                  vs.appendChild(opt);
                });
                if (Object.keys(versions).length === 1) vs.value = versions[Object.keys(versions)[0]];
              }
              if (slots[i]) { slots[i].modelKey = ms.value; slots[i].versionVal = ""; }
            });

            document.getElementById("slot-load-" + i)?.addEventListener("click", () => {
              const pmx = vs?.value;
              if (!pmx) { addLog("#" + (i+1) + " 모델을 선택하세요", "red"); return; }
              if (!slots[i]) slots[i] = { model: null, meshes: [], pmxPath: null, modelKey: "", versionVal: "" };
              slots[i].modelKey = ms.value;
              slots[i].versionVal = vs.value;
              loadSlotModel(i, pmx);
            });
          }
          updateUIState();
        }

        // 슬롯 추가/제거
        document.getElementById("slot-add")?.addEventListener("click", () => {
          if (slotCount >= maxMembers) return;
          slotCount++;
          renderSlots();
          addLog("슬롯 " + slotCount + "/" + maxMembers);
        });
        document.getElementById("slot-remove")?.addEventListener("click", () => {
          if (slotCount <= 1) return;
          const idx = slotCount - 1;
          if (slots[idx]) {
            if (slots[idx].model) try { mmdRuntime?.destroyMmdModel(slots[idx].model); } catch(e) {}
            slots[idx].meshes.forEach((m: any) => { try { m.dispose(); } catch(e) {} });
            slots[idx] = { model: null, meshes: [], pmxPath: null, modelKey: "", versionVal: "" };
          }
          slotCount--;
          renderSlots();
          addLog("슬롯 " + slotCount + "/" + maxMembers);
        });

        renderSlots();

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

        // 런타임 초기화
        function ensureRuntime() {
          if (mmdRuntime) return;
          if (physicsReady) {
            try {
              scene.enablePhysics(new Vector3(0, -30, 0), new MmdAmmoJSPlugin(true, ammoInstance));
              mmdRuntime = new MmdRuntime(scene, new MmdAmmoPhysics(scene));
              addLog("물리 엔진 적용");
            } catch (pe: any) {
              addLog("물리 실패: " + pe.message);
              mmdRuntime = new MmdRuntime(scene);
            }
          } else {
            mmdRuntime = new MmdRuntime(scene);
          }
          mmdRuntime.register(scene);
        }

        // 슬롯별 모델 로드
        async function loadSlotModel(slotIdx: number, pmxPath: string) {
          addLog("#" + (slotIdx+1) + " 로딩: " + pmxPath.split("/").pop());
          try {
            // 기존 슬롯 제거
            if (slots[slotIdx]) {
              if (slots[slotIdx].model) try { mmdRuntime?.destroyMmdModel(slots[slotIdx].model); } catch(e) {}
              slots[slotIdx].meshes.forEach((m: any) => { try { m.dispose(); } catch(e) {} });
            }

            ensureRuntime();

            const dir = pmxPath.substring(0, pmxPath.lastIndexOf("/") + 1);
            const file = pmxPath.split("/").pop()!;
            const result = await SceneLoader.ImportMeshAsync("", dir, file, scene);

            // 위치 오프셋 (슬롯 번호에 따라 좌우 배치)
            const offset = (slotIdx - Math.floor(slotCount / 2)) * SLOT_SPACING;
            result.meshes[0].position.x = offset;

            const model = mmdRuntime.createMmdModel(result.meshes[0]);

            // 그림자
            result.meshes.forEach((m: any) => shadowGenerator.addShadowCaster(m));

            slots[slotIdx] = { model, meshes: result.meshes, pmxPath, modelKey: slots[slotIdx]?.modelKey || "", versionVal: slots[slotIdx]?.versionVal || "" };

            if (slotIdx === 0) {
              camera.target = result.meshes[0].position.add(new Vector3(0, 10, 0));
            }

            addLog("✅ #" + (slotIdx+1) + " 로드 완료", "lime");
            updateUIState();
          } catch (e: any) {
            addLog("❌ #" + (slotIdx+1) + " 실패: " + e.message, "red");
          }
        }

        // 카메라 상태
        let cameraEnabled = false;
        let currentCamPath: string | null = null;
        const camBtn = document.getElementById("cam-btn");

        // 곡 로드 (모든 슬롯에 동일 VMD 적용)
        async function loadSong(vmdPath: string, mp3Path: string | null, camPath: string | null) {
          const activeSlots = slots.filter(s => s && s.model);
          if (activeSlots.length === 0) {
            addLog("❌ 먼저 모델을 로드하세요", "red");
            return;
          }
          addLog("VMD 로딩...");
          try {
            const vmdLoader = new VmdLoader(scene);
            const animation = await vmdLoader.loadAsync("motion", vmdPath);

            // 모든 슬롯에 VMD 적용
            for (const slot of slots) {
              if (slot && slot.model) {
                try {
                  const handle = slot.model.createRuntimeAnimation(animation);
                  slot.model.setRuntimeAnimation(handle);
                } catch (e) {}
              }
            }

            mmdRuntime.seekAnimation(0, true);
            isPlaying = false;

            if (mp3Path) {
              audioPlayer = new StreamAudioPlayer(scene);
              audioPlayer.source = mp3Path;
              mmdRuntime.setAudioPlayer(audioPlayer);
              // 폴백: HTML audio도 설정
              if (audioEl) { audioEl.src = mp3Path; audioEl.currentTime = 0; }
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

            songLoaded = true;
            // 멤버 수 — 현재 모든 곡 솔로이므로 5로 허용 (멀티 VMD 미구현)
            maxMembers = 5;
            updateUIState();
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
          addLog("▶ 재생");
        });

        document.getElementById("stop-btn")?.addEventListener("click", () => {
          if (!mmdRuntime) return;
          isPlaying = false;
          mmdRuntime.pauseAnimation();
          mmdRuntime.seekAnimation(0, true);
          addLog("■ 정지");
        });

        // Shadow 토글
        document.getElementById("chk-shadow")?.addEventListener("change", (e) => {
          const on = (e.target as HTMLInputElement).checked;
          shadowGenerator.setDarkness(on ? 0 : 1);
          addLog(on ? "Shadow ON" : "Shadow OFF");
        });

        // SDEF 토글 (다음 모델 로드 시 적용)
        document.getElementById("chk-sdef")?.addEventListener("change", (e) => {
          const on = (e.target as HTMLInputElement).checked;
          (pmxLoader as any).useSdef = on;
          addLog(on ? "SDEF ON (다음 모델 로드 시 적용)" : "SDEF OFF (다음 모델 로드 시 적용)");
        });

        // 오디오 종료 감지
        const checkEnd = setInterval(() => {
          if (isPlaying && audioPlayer && audioPlayer.currentTime > 0 && audioPlayer.duration > 0) {
            if (audioPlayer.currentTime >= audioPlayer.duration - 0.1) {
              isPlaying = false;
              mmdRuntime.pauseAnimation();
              addLog("■ 재생 완료");
            }
          }
        }, 500);

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
      {/* 스테이지 패널 — 뷰어 위 */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "6px 8px", background: "#111", borderRadius: "8px", fontSize: "11px" }}>
        <span style={{ color: "#888" }}>STAGE</span>
        <select id="stage-select" style={{ flex: 1, fontSize: "11px", padding: "3px 6px", borderRadius: "6px", background: "#1a1a2e", color: "#fff", border: "1px solid #333" }}>
          <option value="">-- 스테이지 --</option>
          <option value="none">없음</option>
          <option value="moon_all">Moon 전체</option>
          <option value="/mmd/models/stages/moon/moon_main.pmx">Moon 본체</option>
          <option value="/mmd/models/stages/moon/moon_tree.pmx">Moon 나무</option>
          <option value="/mmd/models/stages/moon/moon_lantern.pmx">Moon 등불</option>
          <option value="/mmd/models/stages/moon/moon_flower.pmx">Moon 꽃</option>
          <option value="neon_all">Neon 전체</option>
          <option value="/mmd/models/stages/neon/neon_main.pmx">Neon 본체</option>
          <option value="/mmd/models/stages/neon/neon_block_big.pmx">Neon 블록 대</option>
          <option value="/mmd/models/stages/neon/neon_block_small.pmx">Neon 블록 소</option>
        </select>
        <button id="stage-load-btn" style={{ fontSize: "11px", padding: "3px 10px", background: "#8B5CF6", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>적용</button>
      </div>

      {/* 곡 패널 */}
      <div id="music-panel" style={{ display: "flex", gap: "6px", alignItems: "center", padding: "6px 8px", background: "#111", borderRadius: "8px", fontSize: "11px", opacity: 0.4 }}>
        <span style={{ color: "#888" }}>MUSIC</span>
        <select id="artist-select" style={{ flex: 1, fontSize: "11px", padding: "3px 6px", borderRadius: "6px", background: "#1a1a2e", color: "#fff", border: "1px solid #333" }}>
          <option value="">-- 가수 --</option>
        </select>
        <select id="song-select" style={{ flex: 1, fontSize: "11px", padding: "3px 6px", borderRadius: "6px", background: "#1a1a2e", color: "#fff", border: "1px solid #333" }}>
          <option value="">-- 곡 --</option>
        </select>
        <button id="load-btn" style={{ fontSize: "11px", padding: "3px 10px", background: "#4A90C4", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>로드</button>
      </div>

      {/* 캐릭터 슬롯 패널 */}
      <div style={{ padding: "8px", background: "#111", borderRadius: "8px", fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ color: "#888" }}>CHARACTERS</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button id="slot-add" style={{ fontSize: "10px", padding: "2px 8px", background: "#22C55E", color: "#fff", borderRadius: "4px", border: "none", cursor: "pointer" }}>+</button>
            <button id="slot-remove" style={{ fontSize: "10px", padding: "2px 8px", background: "#EF4444", color: "#fff", borderRadius: "4px", border: "none", cursor: "pointer" }}>-</button>
          </div>
        </div>
        <div id="char-slots" /></div>

      {/* 컨트롤 패널 */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "6px 8px", background: "#111", borderRadius: "8px", fontSize: "11px", flexWrap: "wrap" }}>
        <button id="play-btn" style={{ fontSize: "11px", padding: "4px 12px", background: "#22C55E", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>▶ 재생</button>
        <button id="stop-btn" style={{ fontSize: "11px", padding: "4px 12px", background: "#EF4444", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}>■ 정지</button>
        <button id="cam-btn" style={{ fontSize: "11px", padding: "4px 12px", background: "#F59E0B", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer", display: "none" }}>CAM ON</button>
        <div style={{ flex: 1 }} />
        <label style={{ color: "#888", cursor: "pointer" }}>
          <input id="chk-shadow" type="checkbox" style={{ marginRight: "3px" }} />Shadow
        </label>
        <label style={{ color: "#888", cursor: "pointer" }}>
          <input id="chk-sdef" type="checkbox" style={{ marginRight: "3px" }} />SDEF
        </label>
      </div>

      <audio id="bgm-audio" style={{ display: "none" }} />
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
