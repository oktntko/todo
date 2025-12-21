<script setup lang="ts">
import { dayjs } from '@todo/lib/dayjs';
import { R } from '@todo/lib/remeda';
import { vElementSize } from '@vueuse/components';
import type { ElementSize } from '@vueuse/core';
import * as fabric from 'fabric';
import Sortable from 'sortablejs';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useToast } from '~/plugin/ToastPlugin';
import ModalEditWhiteboard, {
  type ModalEditWhiteboardResult,
} from './modal/ModalEditWhiteboard.vue';

const refstate = ref<{
  mode:
    | 'pan'
    | 'panning'
    | 'select'
    | 'freehand'
    | 'object:draw:rectangle'
    | 'object:draw:circle'
    | 'object:draw:triangle'
    | 'object:draw:line'
    | 'object:draw:text'
    | 'smart-eraser'
    | 'smart-erasing';
  isObjectChanging: boolean; // 図形の選択中は panning にしないようにするためのフラグ
  // ブラウザ座標
  clientX: number;
  clientY: number;
  // キャンバス座標
  pointerX: number;
  pointerY: number;
}>({
  mode: 'select',
  isObjectChanging: false,
  clientX: 0,
  clientY: 0,
  pointerX: 0,
  pointerY: 0,
});
const state: {
  drawingObject: fabric.FabricObject | null;
  smartEraseTargetObjectList: fabric.FabricObject[];
} = {
  drawingObject: null,
  smartEraseTargetObjectList: [],
};

const undoStack: string[] = [];
const redoStack: string[] = [];

function saveState() {
  const state = JSON.stringify(canvas.toDatalessJSON());

  if (state === undoStack[history.length - 1]) {
    return;
  }

  trpc.whiteboard.upsert
    .mutate({
      whiteboard_id: currentWhiteboard.value?.whiteboard_id,
      whiteboard_content: state,
    })
    .then((whiteboard) => {
      currentWhiteboard.value = whiteboard;
      const index = whiteboard_list.value.findIndex(
        (x) => x.whiteboard_id === whiteboard.whiteboard_id,
      );

      if (index !== -1) {
        whiteboard_list.value.splice(index, 1, whiteboard);
      } else {
        whiteboard_list.value.push(whiteboard);
      }
    });

  undoStack.push(state);
  redoStack.length = 0; // 新しい操作があったら redo はクリア
}

async function undo() {
  if (history.length <= 1) {
    return;
  }
  const current = undoStack.pop()!; // 現在を取り除く
  redoStack.push(current); // redo用に保存
  const prev = undoStack[undoStack.length - 1]!;

  await canvas.loadFromJSON(prev);
  canvas.renderAll();
}

async function redo() {
  if (redoStack.length < 1) {
    return;
  }

  const next = redoStack.pop()!;
  undoStack.push(next);

  await canvas.loadFromJSON(next);
  canvas.renderAll();
}

async function setCurrentWhiteboard(whiteboard: RouterOutput['whiteboard']['get'] | undefined) {
  if (whiteboard?.whiteboard_id === currentWhiteboard.value?.whiteboard_id) {
    return;
  }

  currentWhiteboard.value = whiteboard;

  canvas.clear();
  if (whiteboard?.whiteboard_content) {
    await canvas.loadFromJSON(whiteboard.whiteboard_content);
  }
  canvas.requestRenderAll();
  undoStack.length = 0;
  redoStack.length = 0;
  saveState();
}

const control = ref({
  background: '#000000',
  backgroundAlpha: 1.0,
  stroke: '#000000',
  strokeWidth: 3,
  opacity: 1,
  zoom: 1,
});

// ref を使うと IText が編集できなくなる
// https://stackoverflow.com/questions/75628752/fabric-js-itext-interaction-issue-moving-but-not-editing
let canvas = new fabric.Canvas('canvas'); // nullable が鬱陶しいので回避用。 エラーにならないので仮初期化
onMounted(() => {
  canvas = new fabric.Canvas('canvas', {
    allowTouchScrolling: true,
    isDrawingMode: false,
    renderOnAddRemove: true,
  });

  canvas.on('mouse:down', function (opt) {
    if (refstate.value.isObjectChanging) {
      return;
    }

    const mouseEvent = opt.e as MouseEvent;
    refstate.value.clientX = mouseEvent.clientX;
    refstate.value.clientY = mouseEvent.clientY;

    const pointer = canvas.getScenePoint(opt.e); // getViewportPoint を使うと パンした後ずれる
    refstate.value.pointerX = pointer.x;
    refstate.value.pointerY = pointer.y;

    switch (refstate.value.mode) {
      case 'select':
      case 'freehand':
      case 'panning':
      case 'smart-erasing':
        break;

      case 'smart-eraser': {
        refstate.value.mode = 'smart-erasing';
        state.smartEraseTargetObjectList = [];
        const target = canvas.findTarget(opt.e);
        if (target) {
          target.opacity = 0.3;
          state.smartEraseTargetObjectList.push(target);
          canvas.requestRenderAll();
        }
        break;
      }

      case 'pan': {
        // client を参照する
        refstate.value.mode = 'panning';
        break;
      }

      case 'object:draw:rectangle':
      case 'object:draw:circle':
      case 'object:draw:triangle':
      case 'object:draw:line': {
        // pointer を参照する
        const object = (function () {
          switch (refstate.value.mode) {
            case 'object:draw:rectangle':
              return new fabric.Rect({
                canvas,
                left: refstate.value.pointerX,
                top: refstate.value.pointerY,
                width: 0,
                height: 0,
                fill: R.rgba(control.value.background, control.value.backgroundAlpha),
                stroke: control.value.stroke,
                strokeWidth: control.value.strokeWidth,
              });
            case 'object:draw:circle':
              return new fabric.Ellipse({
                canvas,
                left: refstate.value.pointerX,
                top: refstate.value.pointerY,
                originX: 'left',
                originY: 'top',
                rx: 0,
                ry: 0,
                fill: R.rgba(control.value.background, control.value.backgroundAlpha),
                stroke: control.value.stroke,
                strokeWidth: control.value.strokeWidth,
              });
            case 'object:draw:triangle':
              return new fabric.Triangle({
                canvas,
                left: refstate.value.pointerX,
                top: refstate.value.pointerY,
                width: 0,
                height: 0,
                fill: R.rgba(control.value.background, control.value.backgroundAlpha),
                stroke: control.value.stroke,
                strokeWidth: control.value.strokeWidth,
              });
            case 'object:draw:line':
              return new fabric.Line(
                [
                  refstate.value.pointerX,
                  refstate.value.pointerY,
                  refstate.value.pointerX,
                  refstate.value.pointerY,
                ],
                {
                  canvas,
                  fill: R.rgba(control.value.background, control.value.backgroundAlpha),
                  stroke: control.value.stroke,
                  strokeWidth: control.value.strokeWidth,
                },
              );
            // TODO arrow はいろいろ試したが無理だった
            // case 'object:draw:arrow':
            // TODO diamond はいろいろ試したが無理だった
            // case 'object:draw:diamond':
          }
        })();

        state.drawingObject = object;
        canvas.add(object);
        break;
      }

      case 'object:draw:text': {
        // pointer を参照する
        const object = new fabric.IText('text', {
          left: refstate.value.pointerX,
          top: refstate.value.pointerY,
          fontFamily: 'Noto Sans JP',
        });
        canvas.add(object);
        canvas.setActiveObject(object);
        refstate.value.mode = 'select';
        break;
      }
    }
  });

  canvas.on('mouse:move', function (opt) {
    if (refstate.value.isObjectChanging) {
      return;
    }

    if (refstate.value.mode === 'panning') {
      const mouseEvent = opt.e as MouseEvent;

      const vpt = canvas.viewportTransform; // 変換行列 （世界座標 → 画面座標）
      // vpt = [拡大縮小(scaleX), 傾き, 傾き, 拡大縮小(scaleY), 移動(translateX), 移動(translateY)]
      vpt[4] += mouseEvent.clientX - refstate.value.clientX;
      vpt[5] += mouseEvent.clientY - refstate.value.clientY;
      // マウスの移動量（今回の位置 − 前回の位置）を取り、その分だけビューポートをずらす
      // => キャンバスをドラッグして移動する動きを実現
      canvas.requestRenderAll(); // viewportTransform の変更分を再描画

      refstate.value.clientX = mouseEvent.clientX;
      refstate.value.clientY = mouseEvent.clientY;
    }

    if (refstate.value.mode === 'smart-erasing') {
      const target = canvas.findTarget(opt.e);
      if (target) {
        target.opacity = 0.3;
        state.smartEraseTargetObjectList.push(target);
        canvas.requestRenderAll();
      }
    }

    if (refstate.value.mode.startsWith('object:draw:') && state.drawingObject != null) {
      const pointer = canvas.getScenePoint(opt.e);
      let w = pointer.x - refstate.value.pointerX;
      let h = pointer.y - refstate.value.pointerY;

      if (opt.e.shiftKey) {
        // shift キー押下中は 幅と高さを同じにする
        const size = Math.max(Math.abs(w), Math.abs(h));
        w = w < 0 ? -size : size;
        h = h < 0 ? -size : size;
      }

      switch (state.drawingObject.type) {
        case 'textbox':
          break;

        case 'rect':
        case 'triangle': {
          state.drawingObject.set({ width: Math.abs(w), height: Math.abs(h) });
          if (w < 0) {
            state.drawingObject.set({ left: pointer.x });
          }
          if (h < 0) {
            state.drawingObject.set({ top: pointer.y });
          }
          break;
        }

        case 'ellipse': {
          // circle
          state.drawingObject.set({ rx: Math.abs(w) / 2, ry: Math.abs(h) / 2 });
          state.drawingObject.set({
            left: refstate.value.pointerX + (w < 0 ? w : 0),
            top: refstate.value.pointerY + (h < 0 ? h : 0),
          });
          break;
        }

        case 'line': {
          state.drawingObject.set({
            x2: pointer.x,
            y2: pointer.y,
          });
          break;
        }
        default:
          break;
      }

      canvas.requestRenderAll();
    }
  });

  canvas.on('mouse:up', async function () {
    if (refstate.value.mode === 'panning') {
      refstate.value.mode = 'pan';
    }

    if (refstate.value.mode === 'smart-erasing') {
      refstate.value.mode = 'smart-eraser';
      canvas.discardActiveObject(); // 解除してからじゃないと render しても反映されない
      state.smartEraseTargetObjectList.forEach((obj) => canvas.remove(obj as fabric.FabricObject));
      state.smartEraseTargetObjectList = [];
    }

    if (refstate.value.mode.startsWith('object:draw:') && state.drawingObject != null) {
      if (state.drawingObject.width > 5 || state.drawingObject.height > 5) {
        // 図形の描画が完了したので、選択状態にする
        const drawingObject = state.drawingObject as fabric.FabricObject;
        canvas.setActiveObject(drawingObject);
      } else {
        // 図形が小さすぎる場合は削除する
        canvas.remove(state.drawingObject as fabric.FabricObject);
      }
    }
    state.drawingObject = null;

    saveState();
  });

  function handleSelection() {
    refstate.value.isObjectChanging = true;

    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      const object = activeObjects[0]!;
      if (object.fill) {
        control.value.background = R.hex(object.fill.toString());
      }
    }
  }
  canvas.on('selection:created', handleSelection);
  canvas.on('selection:updated', handleSelection);
  canvas.on('selection:cleared', function () {
    refstate.value.isObjectChanging = false;
  });

  const minimap = new fabric.StaticCanvas('minimap');
  async function updateMinimap() {
    minimap.clear();

    const objects = canvas.getObjects();
    if (objects.length === 0) return;

    // オブジェクト全体のバウンディングボックス
    const bounds = objects.reduce(
      (acc, object) => {
        const rect = object.getBoundingRect();
        acc.minX = Math.min(acc.minX, rect.left);
        acc.minY = Math.min(acc.minY, rect.top);
        acc.maxX = Math.max(acc.maxX, rect.left + rect.width);
        acc.maxY = Math.max(acc.maxY, rect.top + rect.height);
        return acc;
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );

    const worldW = Math.max(bounds.maxX - bounds.minX, canvas.width);
    const worldH = Math.max(bounds.maxY - bounds.minY, canvas.height);

    // 縮小率
    const scaleX = minimap.width / worldW;
    const scaleY = minimap.height / worldH;
    const scale = Math.min(scaleX, scaleY);

    // オブジェクトをコピーしてミニマップに配置
    for await (const object of objects.map((object) => object.clone())) {
      object.left = (object.left - bounds.minX) * scale;
      object.top = (object.top - bounds.minY) * scale;
      object.scaleX = object.scaleX * scale;
      object.scaleY = object.scaleY * scale;
      minimap.add(object);
    }

    // 現在の viewport 矩形
    const vpt = canvas.viewportTransform;
    const zoom = vpt[0];

    const viewX = ((-vpt[4] - bounds.minX) / zoom) * scale;
    const viewY = ((-vpt[5] - bounds.minY) / zoom) * scale;
    const viewW = (canvas.width / zoom) * scale;
    const viewH = (canvas.height / zoom) * scale;

    minimap.add(
      new fabric.Rect({
        left: viewX,
        top: viewY,
        width: viewW,
        height: viewH,
        fill: 'rgba(193,193,193,0.5)',
        stroke: 'red',
        strokeWidth: 0.5,
        selectable: false,
      }),
    );

    minimap.renderAll();
  }

  updateMinimap();
  canvas.on('after:render', updateMinimap);

  setCurrentWhiteboard(whiteboard_list.value[0]);
});

function handleResize(size: ElementSize) {
  canvas.setDimensions(size);
}

watch(
  () => refstate.value.mode,
  (mode) => {
    canvas.isDrawingMode = mode === 'freehand';
    const selection = !(mode === 'pan' || mode === 'panning');
    canvas.selection = selection;
    canvas.forEachObject((obj) => (obj.selectable = selection));

    if (mode === 'freehand') {
      const brush = new fabric.PencilBrush(canvas);
      brush.width = control.value.strokeWidth;
      brush.color = control.value.stroke;
      canvas.freeDrawingBrush = brush;
    }
  },
);

function setActiveObjectsProperty(key: string, value: string | number) {
  canvas.getActiveObjects().forEach((obj) => obj.set(key, value));
  canvas.requestRenderAll();
  saveState();
}

function setActiveObjectsLayer(
  key: 'sendObjectToBack' | 'sendObjectBackwards' | 'bringObjectForward' | 'bringObjectToFront',
) {
  canvas.getActiveObjects().forEach((obj) => canvas[key](obj as fabric.FabricObject));
  canvas.requestRenderAll();
  saveState();
}

async function copyActiveObjects() {
  for await (const object of canvas.getActiveObjects().map((object) => object.clone())) {
    object.set({
      left: object.left + 20, // Offset the new object
      top: object.top + 20,
    });
    canvas.add(object);
    canvas.setActiveObject(object);
  }
  saveState();
}

function removeActiveObjects() {
  const activeObjects = canvas.getActiveObjects();
  canvas.discardActiveObject(); // 解除してからじゃないと render しても反映されない
  activeObjects.forEach((obj) => canvas.remove(obj as fabric.FabricObject));
  saveState();
}

function saveAsImage() {
  const dataURL = canvas.toDataURL();
  const link = document.createElement('a');
  link.href = dataURL;
  link.download =
    (currentWhiteboard.value?.whiteboard_name ?? dayjs('YYYY-MM-DD hh:mm:ss')) + '.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleZoomChanged() {
  canvas.zoomToPoint(canvas.getCenterPoint(), control.value.zoom);
}

const whiteboard_list = ref(await trpc.whiteboard.list.query());
const currentWhiteboard = ref<RouterOutput['whiteboard']['get']>();

const $toast = useToast();

let sortable: Sortable | null = null;
onMounted(async () => {
  sortable?.destroy();

  const el = document.getElementById(`whiteboard-sortable-container`)!;
  sortable = Sortable.create(el, {
    animation: 150,
    group: 'whiteboard',

    onEnd(e) {
      if (e.from !== e.to) {
        return;
      }
      if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
        return;
      }

      const whiteboard = whiteboard_list.value[e.oldIndex]!;
      const tail = whiteboard_list.value.slice(e.oldIndex + 1);

      whiteboard_list.value.splice(e.oldIndex);
      whiteboard_list.value.push(...tail);
      whiteboard_list.value.splice(e.newIndex, 0, whiteboard);

      whiteboard_list.value = whiteboard_list.value.map((x, i) => ({
        ...x,
        whiteboard_order: i,
      }));

      trpc.whiteboard.reorder.mutate(whiteboard_list.value).then(() => {
        $toast.success('Reordered successfully');
      });
    },
  });
});
</script>

<template>
  <div class="flex flex-row">
    <div class="flex h-[calc(100vh-64px)] w-56 shrink-0 flex-col gap-4 px-2 pb-2">
      <!-- ステータス -->
      <div class="grow overflow-y-auto">
        <aside class="flex flex-col gap-2">
          <h1 class="flex items-center gap-1 text-xs text-gray-500">
            <span class="capitalize">whiteboard</span>
          </h1>

          <div>
            <ul id="whiteboard-sortable-container" class="text-sm">
              <li
                v-for="whiteboard of whiteboard_list"
                :key="whiteboard.whiteboard_id"
                class="rounded-e-full py-px"
              >
                <label
                  :for="whiteboard.whiteboard_id.toString()"
                  class="group/item relative flex w-full cursor-pointer items-center justify-start rounded-e-full p-1 transition duration-75 hover:bg-gray-200"
                  :class="[
                    {
                      'bg-gray-300': currentWhiteboard?.whiteboard_id === whiteboard.whiteboard_id,
                    },
                    `border-l-[6px]`,
                  ]"
                >
                  <button
                    :id="whiteboard.whiteboard_id.toString()"
                    name="whiteboard"
                    class="sr-only"
                    @click="setCurrentWhiteboard(whiteboard)"
                  />
                  <span class="mx-1 shrink grow truncate">{{ whiteboard.whiteboard_name }}</span>
                  <button
                    type="button"
                    class="group/edit inline-flex justify-center rounded-full p-1 transition-all"
                    :class="['invisible group-hover/item:visible', 'hover:bg-gray-300']"
                    @click.prevent="
                      async () => {
                        const result: ModalEditWhiteboardResult = await $modal.showModal(
                          ModalEditWhiteboard,
                          (resolve) => ({
                            whiteboard_id: whiteboard.whiteboard_id,
                            onDone: resolve,
                          }),
                        );

                        const index = whiteboard_list.findIndex(
                          (x) => x.whiteboard_id === result.whiteboard.whiteboard_id,
                        );

                        if (result.event === 'delete') {
                          whiteboard_list.splice(index, 1);
                          setCurrentWhiteboard(whiteboard_list[0]);
                        } else {
                          whiteboard_list.splice(index, 1, result.whiteboard);
                          setCurrentWhiteboard(result.whiteboard);
                        }
                      }
                    "
                  >
                    <span
                      class="icon-[bx--menu] h-4 w-4 shrink-0 transition-all"
                      :class="['group-hover/edit:scale-125 group-hover/edit:text-gray-900']"
                    ></span>
                  </button>
                </label>
              </li>
            </ul>

            <button
              type="button"
              class="group sticky bottom-0 flex w-full cursor-pointer items-center rounded-e-full bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition duration-75 hover:bg-gray-200"
              @click="
                async () => {
                  const loading = $modal.loading();
                  try {
                    const whiteboard = await trpc.whiteboard.upsert.mutate({
                      whiteboard_content: '',
                    });

                    setCurrentWhiteboard(whiteboard);
                    whiteboard_list.push(whiteboard);
                  } finally {
                    loading.close();
                  }
                }
              "
            >
              <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
              <span class="ms-1 capitalize">create new canvas</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- 編集 -->
      <div class="grid shrink-0 grid-cols-2 flex-col gap-2">
        <div class="flex grow flex-col gap-0.5 px-2">
          <label for="background" class="text-xs capitalize"> background </label>
          <input
            id="background"
            v-model="control.background"
            list="color-picker"
            type="color"
            class="block w-full rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
            @input="
              setActiveObjectsProperty('fill', R.rgba(control.background, control.backgroundAlpha))
            "
          />
        </div>
        <div class="flex grow flex-col gap-0.5 px-2">
          <label for="background" class="text-xs capitalize"> alpha </label>
          <input
            id="background-alpha"
            v-model.number="control.backgroundAlpha"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="block w-full rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
            @input="
              setActiveObjectsProperty('fill', R.rgba(control.background, control.backgroundAlpha))
            "
          />
        </div>

        <div class="flex grow flex-col gap-0.5 px-2">
          <label for="stroke" class="text-xs capitalize"> stroke </label>
          <input
            id="stroke"
            v-model="control.stroke"
            list="color-picker"
            type="color"
            class="block w-full rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
            @input="setActiveObjectsProperty('stroke', control.stroke)"
          />
        </div>
        <div class="flex grow flex-col gap-0.5 px-2">
          <label for="stroke-width" class="text-xs capitalize"> stroke width </label>
          <input
            id="stroke-width"
            v-model.number="control.strokeWidth"
            type="range"
            min="0"
            max="10"
            class="block w-full rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
            @input="setActiveObjectsProperty('strokeWidth', control.strokeWidth)"
          />
        </div>

        <div class="col-span-2 flex grow flex-col gap-0.5 px-2">
          <label for="opacity" class="text-xs capitalize"> opacity </label>
          <input
            id="opacity"
            v-model.number="control.opacity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="block w-full rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
            @input="setActiveObjectsProperty('opacity', control.opacity)"
          />
        </div>

        <div class="col-span-2 flex grow flex-col gap-0.5 px-2">
          <span class="text-xs capitalize">layer</span>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              title="send Object To Back"
              @click="setActiveObjectsLayer('sendObjectToBack')"
            >
              <span class="icon-[hugeicons--layer-send-to-back] h-5 w-5"></span>
              <span class="sr-only">send Object To Back</span>
            </button>
            <button
              type="button"
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              title="send Object To Backwards"
              @click="setActiveObjectsLayer('sendObjectBackwards')"
            >
              <span class="icon-[hugeicons--layer-send-backward] h-5 w-5"></span>
              <span class="sr-only">send Object To Backwards</span>
            </button>
            <button
              type="button"
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              title="bring Object Forward"
              @click="setActiveObjectsLayer('bringObjectForward')"
            >
              <span class="icon-[hugeicons--layer-bring-forward] h-5 w-5"></span>
              <span class="sr-only">bring Object Forward</span>
            </button>
            <button
              type="button"
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              title="bring Object To Front"
              @click="setActiveObjectsLayer('bringObjectToFront')"
            >
              <span class="icon-[hugeicons--layer-bring-to-front] h-5 w-5"></span>
              <span class="sr-only">bring Object To Front</span>
            </button>
          </div>
        </div>

        <div class="col-span-2 flex grow flex-col gap-0.5 px-2">
          <span class="text-xs capitalize"> actions </span>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              title="copy Active Objects"
              @click="copyActiveObjects"
            >
              <span class="icon-[streamline-flex--copy-2] h-5 w-5"></span>
              <span class="sr-only">copy Active Objects</span>
            </button>
            <button
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              type="button"
              title="remove Active Objects"
              @click="removeActiveObjects"
            >
              <span class="icon-[streamline--database-remove-solid] h-5 w-5"></span>
              <span class="sr-only">remove Active Objects</span>
            </button>
            <button
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              type="button"
              title="undo"
              @click="undo"
            >
              <span class="icon-[jam--undo] h-5 w-5"></span>
              <span class="sr-only">undo</span>
            </button>
            <button
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              type="button"
              title="redo"
              @click="redo"
            >
              <span class="icon-[jam--redo] h-5 w-5"></span>
              <span class="sr-only">redo</span>
            </button>
            <button
              class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 bg-white p-1.5 transition-colors hover:bg-gray-200"
              type="button"
              title="save as image"
              @click="saveAsImage"
            >
              <span class="icon-[material-symbols--save] h-5 w-5"></span>
              <span class="sr-only">save as image</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ミニマップ -->
      <div class="flex shrink-0 flex-col gap-2">
        <nav class="border border-gray-300 bg-white">
          <canvas id="minimap" width="200" height="128"></canvas>
        </nav>

        <!-- zoom -->
        <div class="shrink-0">
          <div class="flex grow flex-col gap-0.5 px-2">
            <label for="background" class="text-xs capitalize"> zoom </label>
            <div class="flex flex-row items-center gap-2">
              <input
                id="background-alpha"
                v-model.number="control.zoom"
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                class="block w-full rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
                @input="handleZoomChanged"
              />
              <span class="w-8 shrink-0 text-right text-xs">
                {{ Math.floor(control.zoom * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-element-size="handleResize"
      class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] grow-0 overflow-x-auto"
      :class="['relative border bg-white']"
    >
      <canvas id="canvas"></canvas>

      <div class="absolute right-0 bottom-2 left-0 inline-flex justify-center gap-2">
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'pan' || refstate.mode === 'panning',
            },
          ]"
          title="pan"
          @click.prevent="refstate.mode = 'pan'"
        >
          <span class="icon-[vaadin--grab] h-5 w-5"></span>
          <span class="sr-only">pan</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'select',
            },
          ]"
          title="select"
          @click.prevent="refstate.mode = 'select'"
        >
          <span class="icon-[grommet-icons--select] h-5 w-5"></span>
          <span class="sr-only">select</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'freehand',
            },
          ]"
          title="freehand"
          @click.prevent="refstate.mode = 'freehand'"
        >
          <span class="icon-[ic--outline-draw] h-5 w-5"></span>
          <span class="sr-only">freehand</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'object:draw:rectangle',
            },
          ]"
          title="object:draw:rectangle"
          @click.prevent="refstate.mode = 'object:draw:rectangle'"
        >
          <span class="icon-[bx--rectangle] h-5 w-5"></span>
          <span class="sr-only">object:draw:rectangle</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'object:draw:circle',
            },
          ]"
          title="object:draw:circle"
          @click.prevent="refstate.mode = 'object:draw:circle'"
        >
          <span class="icon-[bx--circle] h-5 w-5"></span>
          <span class="sr-only">object:draw:circle</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'object:draw:triangle',
            },
          ]"
          title="object:draw:triangle"
          @click.prevent="refstate.mode = 'object:draw:triangle'"
        >
          <span class="icon-[mingcute--triangle-line] h-5 w-5"></span>
          <span class="sr-only">object:draw:triangle</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'object:draw:line',
            },
          ]"
          title="object:draw:line"
          @click.prevent="refstate.mode = 'object:draw:line'"
        >
          <span class="icon-[fluent--line-20-filled] h-5 w-5"></span>
          <span class="sr-only">object:draw:line</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'object:draw:text',
            },
          ]"
          title="object:draw:text"
          @click.prevent="refstate.mode = 'object:draw:text'"
        >
          <span class="icon-[oui--vis-text] h-5 w-5"></span>
          <span class="sr-only">object:draw:text</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-400 p-1.5 transition-colors hover:bg-gray-200"
          :class="[
            {
              'bg-blue-100 shadow ring-2 shadow-blue-400 ring-blue-400 hover:bg-blue-200!':
                refstate.mode === 'smart-eraser',
            },
          ]"
          title="smart-eraser"
          @click.prevent="refstate.mode = 'smart-eraser'"
        >
          <span class="icon-[mdi--vanish] h-5 w-5"></span>
          <span class="sr-only">smart-eraser</span>
        </button>
      </div>
    </div>
  </div>
</template>
