import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { evaluateStage } from "../timeline.ts";
import type {
  NumericPose,
  RuntimeAsset,
  StoryRecord,
} from "../story-records.ts";
export type MotionHandle = {
  seek(progress: number): void;
  dispose(): void;
  ready: Promise<void>;
};
/** Owns only descendants created in the supplied mount; the host owns page layout. */
export function mountMotionStage(
  element: HTMLElement,
  story: StoryRecord,
  stageId: string,
  assets: RuntimeAsset[],
): MotionHandle {
  const found = story.stages.find((s) => s.id === stageId);
  if (!found) throw new Error("Stage does not exist");
  const stage = found;
  const actors = story.actors.filter((a) => a.stageId === stageId),
    surface = document.createElement("div"),
    fallback = document.createElement("div");
  surface.className = "pep-motion-surface";
  Object.assign(surface.style, {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  });
  fallback.className = "pep-motion-fallback";
  for (const view of story.fallbackViews.filter((v) => v.stageId === stageId)) {
    const section = document.createElement("section"),
      title = document.createElement("h3"),
      description = document.createElement("p");
    title.textContent = view.label;
    description.textContent = view.description;
    section.append(title, description);
    if (view.assetId) {
      const asset = assets.find((a) => a.id === view.assetId);
      if (asset?.type === "raster") {
        const image = document.createElement("img");
        image.src = `data:${rasterMime(asset.data)};base64,${asset.data}`;
        image.alt = view.description;
        image.style.maxWidth = "100%";
        section.prepend(image);
      }
    }
    fallback.append(section);
  }
  element.append(surface, fallback);
  const nodes = new Map<string, HTMLElement>(),
    objects = new Map<string, THREE.Group>(),
    lights = new Map<string, THREE.Light>();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let disposed = false,
    current = 0,
    active = true,
    frame = 0,
    renderer: THREE.WebGLRenderer | undefined,
    scene: THREE.Scene | undefined,
    camera: THREE.PerspectiveCamera | undefined,
    failed = false;
  const resources = new Set<THREE.Object3D>();
  for (const actor of actors) {
    const node = document.createElement("div");
    node.dataset.actorId = actor.id;
    node.setAttribute("aria-label", actor.role);
    Object.assign(node.style, {
      position: "absolute",
      left: "0",
      top: "0",
      transformStyle: "preserve-3d",
      width: "100%",
      height: "100%",
    });
    nodes.set(actor.id, node);
  }
  for (const actor of actors) {
    const node = nodes.get(actor.id)!;
    (actor.parentId ? nodes.get(actor.parentId)! : surface).append(node);
  }
  function showFallback(message?: string) {
    surface.hidden = true;
    fallback.hidden = false;
    if (message) {
      element.dataset.motionError = message;
      const status = document.createElement("p");
      status.setAttribute("role", "status");
      status.textContent = `Motion unavailable: ${message}. Static explanation remains available.`;
      fallback.prepend(status);
    }
    element.dataset.motionState = message ? "failed" : "static";
  }
  function disposeObject(root: THREE.Object3D) {
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) {
              value.dispose();
              const image = value.image;
              if (image instanceof ImageBitmap) image.close();
            }
          material.dispose();
        }
      }
    });
  }
  function render() {
    frame = 0;
    if (disposed || failed) return;
    fallback.hidden = !reduced.matches;
    surface.hidden = reduced.matches;
    if (reduced.matches) {
      showFallback();
      return;
    }
    element.dataset.motionState = "animated";
    const pose = evaluateStage(story, stageId, current),
      width = surface.clientWidth,
      height = surface.clientHeight;
    for (const actor of actors) {
      const p = pose.actors[actor.id]!,
        node = nodes.get(actor.id)!;
      node.dataset.pose = JSON.stringify(p);
      if (stage.renderer === "2d") {
        node.style.transform = `translate3d(${(p.x ?? 0) * width}px,${(p.y ?? 0) * height}px,${p.z ?? 0}px) rotateX(${p.rotationX ?? 0}deg) rotateY(${p.rotationY ?? 0}deg) rotateZ(${p.rotationZ ?? 0}deg) scale3d(${p.scaleX ?? 1},${p.scaleY ?? 1},${p.scaleZ ?? 1})`;
        node.style.opacity = String(p.opacity ?? 1);
      } else {
        const object = objects.get(actor.id);
        if (object) {
          applyTransform(object, p);
          node.dataset.objectId = object.uuid;
        }
      }
    }
    if (scene) {
      const actorIds = new Map(
        [...objects].map(([id, object]) => [object.uuid, id]),
      );
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        let opacity = 1,
          parent: THREE.Object3D | null = child;
        while (parent) {
          const id = actorIds.get(parent.uuid);
          if (id) opacity *= pose.actors[id]?.opacity ?? 1;
          parent = parent.parent;
        }
        for (const material of Array.isArray(child.material)
          ? child.material
          : [child.material]) {
          material.opacity = opacity;
          material.transparent = opacity < 1;
        }
      });
    }
    if (renderer && scene && camera) {
      applyTransform(camera, pose.camera);
      camera.fov = pose.camera.fov ?? 45;
      camera.aspect = Math.max(width, 1) / Math.max(height, 1);
      camera.lookAt(
        pose.camera.targetX ?? 0,
        pose.camera.targetY ?? 0,
        pose.camera.targetZ ?? 0,
      );
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      for (const [id, light] of lights) {
        const p = pose.lights[id]!;
        light.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
        light.intensity = p.intensity ?? 1;
        if (
          light instanceof THREE.SpotLight ||
          light instanceof THREE.DirectionalLight
        ) {
          light.target.position.set(
            p.targetX ?? 0,
            p.targetY ?? 0,
            p.targetZ ?? 0,
          );
          light.target.updateMatrixWorld();
        }
      }
      renderer.render(scene, camera);
    }
    const bounds: Record<
      string,
      {
        x: number;
        y: number;
        width: number;
        height: number;
        clipped: boolean;
        readingConflict: boolean;
        materialOpacity?: number;
      }
    > = {};
    for (const actor of actors) {
      if (actor.visual.kind === "group") continue;
      let x = 0,
        y = 0,
        w = 0,
        h = 0,
        clipped = false;
      if (camera && objects.get(actor.id)) {
        const box = new THREE.Box3().setFromObject(objects.get(actor.id)!);
        if (box.isEmpty()) continue;
        const points = [];
        for (const a of [box.min.x, box.max.x])
          for (const b of [box.min.y, box.max.y])
            for (const c of [box.min.z, box.max.z])
              points.push(new THREE.Vector3(a, b, c).project(camera));
        x = Math.min(...points.map((p) => (p.x + 1) / 2));
        y = Math.min(...points.map((p) => (1 - p.y) / 2));
        w = Math.max(...points.map((p) => (p.x + 1) / 2)) - x;
        h = Math.max(...points.map((p) => (1 - p.y) / 2)) - y;
        clipped = points.some((p) => p.z < -1 || p.z > 1);
      } else {
        const node = nodes.get(actor.id)!;
        const visual = [...node.children].find(
          (child) => !(child as HTMLElement).dataset.actorId,
        );
        if (!visual) continue;
        const r = visual.getBoundingClientRect(),
          base = surface.getBoundingClientRect();
        x = (r.left - base.left) / Math.max(width, 1);
        y = (r.top - base.top) / Math.max(height, 1);
        w = r.width / Math.max(width, 1);
        h = r.height / Math.max(height, 1);
      }
      bounds[actor.id] = {
        x,
        y,
        width: w,
        height: h,
        clipped: clipped || x < 0 || y < 0 || x + w > 1 || y + h > 1,
        materialOpacity: (() => {
          let opacity: number | undefined;
          objects.get(actor.id)?.traverse((child) => {
            if (opacity === undefined && child instanceof THREE.Mesh) {
              const material = Array.isArray(child.material)
                ? child.material[0]
                : child.material;
              opacity = material?.opacity;
            }
          });
          return opacity;
        })(),
        readingConflict: stage.readingZones.some(
          (r) =>
            x < r.x + r.width &&
            x + w > r.x &&
            y < r.y + r.height &&
            y + h > r.y,
        ),
      };
    }
    element.dispatchEvent(
      new CustomEvent("pep-motion-pose", {
        detail: { progress: current, pose, bounds },
      }),
    );
  }
  function schedule() {
    if (!disposed && active && !frame) frame = requestAnimationFrame(render);
  }
  const resize = new ResizeObserver(schedule);
  resize.observe(element);
  const visibility = new IntersectionObserver((entries) => {
    active = entries[0]?.isIntersecting ?? true;
    if (active) schedule();
  });
  visibility.observe(element);
  const onReduced = () => {
    if (reduced.matches) showFallback();
    else if (!failed) schedule();
  };
  reduced.addEventListener("change", onReduced);
  const ready = (async () => {
    try {
      if (stage.renderer === "2d") {
        for (const actor of actors) {
          const node = nodes.get(actor.id)!;
          if (actor.visual.kind === "group") continue;
          let visual: HTMLElement;
          if (actor.visual.kind === "asset") {
            const assetId = actor.visual.assetId;
            const asset = assets.find((a) => a.id === assetId);
            if (!asset || asset.type !== "raster" || actor.visual.partName)
              throw new Error(
                "2D stage requires raster assets without model part names",
              );
            const image = document.createElement("img");
            image.src = `data:${rasterMime(asset.data)};base64,${asset.data}`;
            image.alt = actor.role;
            visual = image;
            Object.assign(visual.style, {
              width: "180px",
              height: "180px",
              objectFit: "contain",
            });
          } else {
            visual = document.createElement("div");
            visual.style.background = actor.visual.color;
            visual.style.width = `${actor.visual.dimensions[0] * 100}%`;
            visual.style.height = `${actor.visual.dimensions[1] * 100}%`;
            node.style.width = "100%";
            node.style.height = "100%";
            if (actor.visual.shape === "cylinder")
              visual.style.borderRadius = "50%";
          }
          visual.style.transform = "translate(-50%,-50%)";
          node.append(visual);
        }
      } else {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.domElement.setAttribute(
          "aria-label",
          "Interactive motion stage",
        );
        Object.assign(renderer.domElement.style, {
          width: "100%",
          height: "100%",
          display: "block",
          position: "absolute",
          inset: "0",
        });
        surface.prepend(renderer.domElement);
        for (const actor of actors) {
          const group = new THREE.Group();
          group.name = actor.id;
          objects.set(actor.id, group);
          resources.add(group);
        }
        for (const actor of actors) {
          const group = objects.get(actor.id)!;
          (actor.parentId ? objects.get(actor.parentId)! : scene).add(group);
          const visual = actor.visual;
          if (visual.kind === "primitive") {
            const [x, y, z] = visual.dimensions;
            const geometry =
              visual.shape === "box"
                ? new THREE.BoxGeometry(x, y, z)
                : visual.shape === "cylinder"
                  ? new THREE.CylinderGeometry(x / 2, x / 2, y, 48)
                  : new THREE.PlaneGeometry(x, y);
            group.add(
              new THREE.Mesh(
                geometry,
                new THREE.MeshStandardMaterial({
                  color: visual.color,
                  metalness: visual.metalness,
                  roughness: visual.roughness,
                  side: THREE.DoubleSide,
                }),
              ),
            );
          } else if (visual.kind === "asset") {
            const asset = assets.find((a) => a.id === visual.assetId);
            if (!asset) throw new Error("Asset is missing");
            if (asset.type === "glb") {
              const data = Uint8Array.from(atob(asset.data), (c) =>
                c.charCodeAt(0),
              );
              const model = await new GLTFLoader().parseAsync(data.buffer, "");
              resources.add(model.scene);
              if (disposed) {
                disposeObject(model.scene);
                return;
              }
              const part = visual.partName
                ? model.scene.getObjectByName(visual.partName)
                : model.scene;
              if (!part) throw new Error("Named model part is missing");
              group.add(part);
            } else {
              const texture = await new THREE.TextureLoader().loadAsync(
                `data:${rasterMime(asset.data)};base64,${asset.data}`,
              );
              if (disposed) {
                texture.dispose();
                return;
              }
              texture.colorSpace = THREE.SRGBColorSpace;
              group.add(
                new THREE.Mesh(
                  new THREE.PlaneGeometry(1, 1),
                  new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide,
                  }),
                ),
              );
            }
          }
        }
        for (const declared of stage.lights) {
          const light =
            declared.kind === "ambient"
              ? new THREE.AmbientLight(declared.color)
              : declared.kind === "spot"
                ? new THREE.SpotLight(declared.color)
                : new THREE.DirectionalLight(declared.color);
          lights.set(declared.id, light);
          scene.add(light);
          if (
            light instanceof THREE.SpotLight ||
            light instanceof THREE.DirectionalLight
          )
            scene.add(light.target);
        }
      }
      if (!disposed) schedule();
    } catch (error) {
      failed = true;
      if (!disposed)
        showFallback(
          error instanceof Error ? error.message : "Initialization failed",
        );
    }
  })();
  return {
    ready,
    seek(progress) {
      if (disposed) return;
      if (!Number.isFinite(progress))
        throw new Error("Progress must be finite");
      current = Math.max(0, Math.min(1, progress));
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      reduced.removeEventListener("change", onReduced);
      for (const object of resources) disposeObject(object);
      renderer?.dispose();
      surface.remove();
      fallback.remove();
      delete element.dataset.motionState;
      delete element.dataset.motionError;
    },
  };
}
function applyTransform(object: THREE.Object3D, pose: NumericPose) {
  object.position.set(pose.x ?? 0, pose.y ?? 0, pose.z ?? 0);
  object.rotation.set(
    THREE.MathUtils.degToRad(pose.rotationX ?? 0),
    THREE.MathUtils.degToRad(pose.rotationY ?? 0),
    THREE.MathUtils.degToRad(pose.rotationZ ?? 0),
  );
  object.scale.set(pose.scaleX ?? 1, pose.scaleY ?? 1, pose.scaleZ ?? 1);
}
function rasterMime(data: string) {
  const signature = atob(data.slice(0, 24));
  return signature.startsWith("\x89PNG")
    ? "image/png"
    : signature.startsWith("RIFF")
      ? "image/webp"
      : "image/jpeg";
}
