const { ipcRenderer } = require("electron");

class DrawingApp {
  constructor() {
    this.initializeCanvas();
    this.initializeColorPicker();

    this.startPoint = null;
    this.isDrawing = false;

    this.currentColor = "#000";
    this.ctx.lineWidth = 4;

    this.setupEventListeners();
  }

  initializeCanvas() {
    this.canvas = document.getElementById("drawingCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.previewCanvas = document.getElementById("previewCanvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    this.previewCtx.setLineDash([5, 5]);
  }

  initializeColorPicker() {
    this.ctx.strokeStyle = this.currentColor;

    const parent = document.getElementById("colorPickerContainer");

    this.picker = new Picker({
      parent: parent,
      color: this.currentColor,
      popup: false,
    });

    this.picker.onChange = (color) => {
      this.currentColor = color.hex;
      this.ctx.strokeStyle = this.currentColor;

      parent.style.backgroundColor = this.currentColor;
    };
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.startDrawing(e);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      this.updatePreview(e);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.finishDrawing(e);
    });

    const clearBtn = document.getElementById("clearBtn");
    clearBtn.addEventListener("click", () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    });

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.addEventListener("click", () => this.saveImage());

    const loadBtn = document.getElementById("loadBtn");
    loadBtn.addEventListener("click", () => this.loadImage());
  }

  async loadImage() {
    const imageData = await ipcRenderer.invoke("load-image");
    if (!imageData) return;

    const img = new Image();
    img.src = imageData;

    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    };
  }

  async saveImage() {
    const dataURL = this.canvas.toDataURL("image/png");
    await ipcRenderer.invoke("save-image", dataURL);
    console.log("Image saved");
  }

  startDrawing(event) {
    this.startPoint = { x: event.offsetX, y: event.offsetY };
    this.isDrawing = true;
  }

  updatePreview(event) {
    this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.isDrawing) return;

    const point = { x: event.offsetX, y: event.offsetY };

    this.previewCtx.beginPath();
    this.previewCtx.moveTo(this.startPoint.x, this.startPoint.y);
    this.previewCtx.lineTo(point.x, point.y);
    this.previewCtx.stroke();
  }

  finishDrawing(event) {
    const endPoint = { x: event.offsetX, y: event.offsetY };

    this.ctx.beginPath();
    this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
    this.ctx.lineTo(endPoint.x, endPoint.y);
    this.ctx.stroke();

    this.isDrawing = false;
    this.startPoint = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new DrawingApp();
});
