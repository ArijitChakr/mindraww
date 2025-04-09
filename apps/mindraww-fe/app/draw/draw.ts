import { getShapes } from "./getShapes";

interface Rect {
  type: "rect";
  width: number;
  height: number;
  x: number;
  y: number;
}
interface Circle {
  type: "circle";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
interface FreePencil {
  type: "freePencil";
  currX: number[];
  currY: number[];
  lastX: number[];
  lastY: number[];
}
interface Line {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  bendX?: number;
  bendY?: number;
}
interface Diamond {
  type: "diamond";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
interface Arrow {
  type: "arrow";
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  bendX?: number;
  bendY?: number;
}
interface Text {
  type: "text";
  text: string;
  x: number;
  y: number;
  fontSize?: number;
}
interface Pan {
  type: "pan";
}
interface Selection {
  type: "selection";
}
interface Eraser {
  type: "eraser";
}

type Shape =
  | Rect
  | Circle
  | FreePencil
  | Line
  | Diamond
  | Arrow
  | Text
  | Pan
  | Selection
  | Eraser;

export type ShapeTypes =
  | "rect"
  | "circle"
  | "freePencil"
  | "line"
  | "diamond"
  | "arrow"
  | "text"
  | "pan"
  | "selection"
  | "eraser";

export class Draw {
  private ctx: CanvasRenderingContext2D;
  private startX: number = 0;
  private startY: number = 0;
  private isDrawing: boolean;
  public selectedShape: ShapeTypes = "selection";
  private shapes: Shape[] = [];
  private currFreePencil: FreePencil | null = null;
  private isWriting: boolean = false;
  private text: string = "";
  private cursor: boolean = false;
  private blinkInterval: number = 0;
  private canvas: HTMLCanvasElement;
  private zoom: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;
  public isPanning: boolean = false;
  private panStartX: number = 0;
  private panStartY: number = 0;
  private panOffsetX: number = 0;
  private panOffsetY: number = 0;
  private activeShape: Shape | null = null;
  private activeShapeIndex: number | null = null;
  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private resizingHandle: string | null = null;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;
  private roomId: string;
  private currDrawing: Shape | null = null;
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, socket: WebSocket, roomId: string) {
    this.ctx = canvas.getContext("2d")!;
    this.canvas = canvas;
    this.isDrawing = false;
    this.roomId = roomId;
    this.socket = socket;
    this.initShapes();
    this.initDraw();
    this.initChat();
    this.clearCanvas();
  }

  initShapes = async () => {
    this.shapes = await getShapes(this.roomId);
    this.clearCanvas();
  };

  initChat = () => {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        if (message.isDrawing) {
          this.currDrawing = JSON.parse(message.payload.message);
          this.clearCanvas();
        } else {
          this.currDrawing = null;
          this.shapes.push(JSON.parse(message.payload.message));
          this.clearCanvas();
        }
      }
    };
  };

  clearCanvas = () => {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.setTransform(
      this.zoom,
      0,
      0,
      this.zoom,
      this.offsetX,
      this.offsetY
    );

    this.shapes.map((shape) => {
      if (shape.type === "rect") {
        this.drawRect(shape.x, shape.y, shape.width, shape.height);
      }
      if (shape.type === "circle") {
        this.drawCircle(shape.startX, shape.startY, shape.endX, shape.endY);
      }
      if (shape.type === "freePencil") {
        shape.currX.map((_, i) => {
          this.drawFreePencil(
            shape.lastX[i],
            shape.lastY[i],
            shape.currX[i],
            shape.currY[i]
          );
        });
      }
      if (shape.type === "line") {
        if (shape.bendX !== undefined && shape.bendY !== undefined) {
          this.drawBendedLine(
            shape.type,
            shape.startX,
            shape.startY,
            shape.endX,
            shape.endY,
            shape.bendX,
            shape.bendY
          );
        } else {
          this.drawLine(shape.startX, shape.startY, shape.endX, shape.endY);
        }
      }
      if (shape.type === "diamond") {
        this.drawDiamond(shape.startX, shape.startY, shape.endX, shape.endY);
      }
      if (shape.type === "arrow") {
        if (shape.bendX !== undefined && shape.bendY !== undefined) {
          this.drawBendedLine(
            shape.type,
            shape.fromX,
            shape.fromY,
            shape.toX,
            shape.toY,
            shape.bendX,
            shape.bendY
          );
        } else {
          this.drawArrow(shape.fromX, shape.fromY, shape.toX, shape.toY);
        }
      }
      if (shape.type === "text") {
        this.writeText(shape.text, shape.x, shape.y, false, shape.fontSize);
      }
    });
    if (this.selectedShape === "selection" && this.activeShape) {
      this.drawSelectionBox(this.activeShape);
    }
    this.ctx.restore();
  };

  setTool = (shape: ShapeTypes) => {
    this.selectedShape = shape;
    if (shape !== "text" && this.text.length > 0) {
      this.shapes.push({
        type: "text",
        text: this.text,
        x: this.startX,
        y: this.startY,
      });
      this.cursor = false;
      this.text = "";
      this.isWriting = false;
      this.clearCanvas();
    } else if (shape !== "text" && this.text.length === 0) {
      this.cursor = false;
      this.text = "";
      this.isWriting = false;
      this.clearCanvas();
    }
    return this.selectedShape;
  };

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();

    const zoomFactor = 0.1;
    const scaleFactor = e.deltaY < 0 ? 1 + zoomFactor : 1 - zoomFactor;
    const newZoom = Math.max(0.1, this.zoom * scaleFactor);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.offsetX = centerX - (centerX - this.offsetX) * (newZoom / this.zoom);
    this.offsetY = centerY - (centerY - this.offsetY) * (newZoom / this.zoom);

    this.zoom = newZoom;

    this.clearCanvas();
  };

  typingHandler = (e: KeyboardEvent) => {
    if (this.isWriting) {
      if (e.key === "Backspace") {
        this.text = this.text.slice(0, -1);
      } else if (e.key === "Enter") {
        this.text += "\n";
      } else if (e.key.length === 1) {
        this.text += e.key;
      }
      this.clearCanvas();
      this.writeText(this.text, this.startX, this.startY);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          isDrawing: true,
          payload: {
            message: JSON.stringify(this.text),
            roomId: this.roomId,
          },
        })
      );
    }
  };

  mouseClickHandler = (e: MouseEvent) => {
    if (this.selectedShape === "text") {
      if (this.isWriting) {
        this.shapes.push({
          type: "text",
          text: this.text,
          x: this.startX,
          y: this.startY,
        });
        this.isWriting = false;
        this.cursor = false;
        this.text = "";
        this.selectedShape = "selection";
        this.clearCanvas();
      } else if (this.isWriting === false) {
        window.clearInterval(this.blinkInterval);
        this.isWriting = true;
        this.text = "";
        const worldX = (e.clientX - this.offsetX) / this.zoom;
        const worldY = (e.clientY - this.offsetY) / this.zoom;
        this.startX = worldX;
        this.startY = worldY;
        this.clearCanvas();
        this.cursor = true;
        this.blinkInterval = window.setInterval(() => {
          // console.log(this.isWriting);
          if (this.isWriting) {
            this.cursor = !this.cursor;
            this.clearCanvas();
            this.writeText(this.text, this.startX, this.startY);
          }
        }, 500);
      }
    }
    if (this.selectedShape === "eraser") {
      const erasable = this.shapes.find((shape) => {
        if (shape.type === "rect") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        } else if (shape.type === "circle") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        } else if (shape.type === "freePencil") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        } else if (shape.type === "line") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        } else if (shape.type === "arrow") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        } else if (shape.type === "text") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        } else if (shape.type === "diamond") {
          const bbox = this.getBoundingBox(shape);
          return this.pointInRect(e.clientX, e.clientY, bbox);
        }
      });
      // console.log(erasable);
      if (erasable) {
        const index = this.shapes.indexOf(erasable);
        this.shapes.splice(index, 1);
        this.clearCanvas();
        // console.log(index);
        // this.shapes = this.shapes.filter((shape) => shape !== erasable);
      }
    }
  };

  mouseDownHandler = (e: MouseEvent) => {
    if (this.selectedShape === "text") return;
    if (this.selectedShape === "pan") {
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.panOffsetX = this.offsetX;
      this.panOffsetY = this.offsetY;
      return;
    }

    const X = (e.clientX - this.offsetX) / this.zoom;
    const Y = (e.clientY - this.offsetY) / this.zoom;

    if (this.selectedShape === "selection") {
      if (this.activeShape) {
        const handles = this.getSelectionHandles(this.activeShape);
        if (
          this.activeShape.type === "line" ||
          this.activeShape.type === "arrow"
        ) {
          for (const h of handles) {
            if (this.pointInCircle(X, Y, h.x, h.y, 5)) {
              this.isResizing = true;
              this.resizingHandle = h.key;
              return;
            }
          }
          if (this.isPointInShape(this.activeShape, X, Y)) {
            this.isDragging = true;
            const ref = handles[0];
            this.dragOffsetX = X - ref.x;
            this.dragOffsetY = Y - ref.y;
            return;
          }
        } else {
          const handleSize = 8;
          for (const h of handles) {
            if (
              this.pointInRect(X, Y, {
                x: h.x,
                y: h.y,
                width: handleSize,
                height: handleSize,
              })
            ) {
              this.isResizing = true;
              this.resizingHandle = h.key;
              return;
            }
          }
          const bbox = this.getBoundingBox(this.activeShape);
          if (this.pointInRect(X, Y, bbox)) {
            this.isDragging = true;
            this.dragOffsetX = X - bbox.x;
            this.dragOffsetY = Y - bbox.y;
            return;
          }
        }
      }
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        const shape = this.shapes[i];
        if (this.isPointInShape(shape, X, Y)) {
          this.activeShapeIndex = i;
          this.activeShape = shape;
          if (shape.type === "line" || shape.type === "arrow") {
            const ref = this.getSelectionHandles(shape)[0];
            this.dragOffsetX = X - ref.x;
            this.dragOffsetY = Y - ref.y;
          } else {
            const bbox = this.getBoundingBox(shape);
            this.dragOffsetX = X - bbox.x;
            this.dragOffsetY = Y - bbox.y;
          }
          this.clearCanvas();
          return;
        }
      }
      this.activeShape = null;
      this.activeShapeIndex = null;
      this.clearCanvas();
      return;
    }

    this.startX = X;
    this.startY = Y;
    this.isDrawing = true;

    if (this.selectedShape === "freePencil") {
      this.currFreePencil = {
        type: "freePencil",
        currX: [X],
        currY: [Y],
        lastX: [X],
        lastY: [Y],
      };
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.selectedShape === "text") return;
    if (this.selectedShape === "pan" && this.isPanning) {
      const dx = e.clientX - this.panStartX;
      const dy = e.clientY - this.panStartY;
      this.offsetX = this.panOffsetX + dx;
      this.offsetY = this.panOffsetY + dy;
      this.clearCanvas();
      return;
    }
    const worldX = (e.clientX - this.offsetX) / this.zoom;
    const worldY = (e.clientY - this.offsetY) / this.zoom;

    if (this.selectedShape === "selection") {
      if (this.isDragging && this.activeShape) {
        if (
          this.activeShape.type === "line" ||
          this.activeShape.type === "arrow"
        ) {
          const handles = this.getSelectionHandles(this.activeShape);
          const ref = handles[0];
          const dx = worldX - ref.x - this.dragOffsetX;
          const dy = worldY - ref.y - this.dragOffsetY;
          this.updateShapePosition(this.activeShape, dx, dy);
        } else {
          const bbox = this.getBoundingBox(this.activeShape);
          const dx = worldX - bbox.x - this.dragOffsetX;
          const dy = worldY - bbox.y - this.dragOffsetY;
          this.updateShapePosition(this.activeShape, dx, dy);
        }
        this.clearCanvas();
        return;
      }
      if (this.isResizing && this.activeShape && this.resizingHandle) {
        this.resizeShape(this.activeShape, this.resizingHandle, worldX, worldY);
        this.clearCanvas();
        return;
      }
      return;
    }

    if (!this.isDrawing) return;
    this.clearCanvas();

    if (this.selectedShape === "rect") {
      const width = worldX - this.startX;
      const height = worldY - this.startY;
      this.drawRect(this.startX, this.startY, width, height);
    }
    if (this.selectedShape === "circle") {
      this.drawCircle(this.startX, this.startY, worldX, worldY);
    }
    if (this.selectedShape === "freePencil") {
      if (!this.currFreePencil) return;
      if (this.currFreePencil.type !== "freePencil") return;
      this.currFreePencil.currX.map((_, i) => {
        if (this.currFreePencil) {
          this.drawFreePencil(
            this.currFreePencil?.lastX[i],
            this.currFreePencil?.lastY[i],
            this.currFreePencil?.currX[i],
            this.currFreePencil?.currY[i]
          );
        }
      });

      this.currFreePencil.lastX.push(this.startX);
      this.currFreePencil.lastY.push(this.startY);
      this.currFreePencil.currX.push(worldX);
      this.currFreePencil.currY.push(worldY);

      this.startX = worldX;
      this.startY = worldY;
    }

    if (this.selectedShape === "line") {
      this.drawLine(this.startX, this.startY, worldX, worldY);
    }
    if (this.selectedShape === "diamond") {
      this.drawDiamond(this.startX, this.startY, worldX, worldY);
    }
    if (this.selectedShape === "arrow") {
      this.drawArrow(this.startX, this.startY, worldX, worldY);
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.selectedShape === "pan") {
      this.isPanning = false;
      return;
    }
    if (this.selectedShape === "selection") {
      this.isDragging = false;
      this.isResizing = false;
      this.resizingHandle = null;
      return;
    }
    this.isDrawing = false;
    const worldX = (e.clientX - this.offsetX) / this.zoom;
    const worldY = (e.clientY - this.offsetY) / this.zoom;
    if (this.selectedShape === "rect") {
      const width = worldX - this.startX;
      const height = worldY - this.startY;
      this.shapes.push({
        type: this.selectedShape,
        width,
        height,
        x: this.startX,
        y: this.startY,
      });
    } else if (this.selectedShape === "circle") {
      this.shapes.push({
        type: "circle",
        startX: this.startX,
        startY: this.startY,
        endX: worldX,
        endY: worldY,
      });
    } else if (this.selectedShape === "freePencil") {
      if (!this.currFreePencil) return;

      this.shapes.push(this.currFreePencil);
      this.currFreePencil = null;
    } else if (this.selectedShape === "line") {
      this.shapes.push({
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: worldX,
        endY: worldY,
      });
    } else if (this.selectedShape === "diamond") {
      this.shapes.push({
        type: "diamond",
        startX: this.startX,
        startY: this.startY,
        endX: worldX,
        endY: worldY,
      });
    } else if (this.selectedShape === "arrow") {
      this.shapes.push({
        type: "arrow",
        fromX: this.startX,
        fromY: this.startY,
        toX: worldX,
        toY: worldY,
      });
    }
  };

  getBoundingBox(shape: Shape): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (shape.type === "rect") {
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
      };
    } else if (shape.type === "circle") {
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      return {
        x,
        y,
        width: Math.abs(shape.endX - shape.startX),
        height: Math.abs(shape.endY - shape.startY),
      };
    } else if (shape.type === "diamond") {
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      return {
        x,
        y,
        width: Math.abs(shape.endX - shape.startX),
        height: Math.abs(shape.endY - shape.startY),
      };
    } else if (shape.type === "text") {
      const metrics = this.ctx.measureText(shape.text);
      return { x: shape.x, y: shape.y - 20, width: metrics.width, height: 20 };
    } else if (shape.type === "freePencil") {
      const allX = [...shape.currX, ...shape.lastX];
      const allY = [...shape.currY, ...shape.lastY];
      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else if (shape.type === "line") {
      const xs = [shape.startX, shape.endX];
      const ys = [shape.startY, shape.endY];
      if (shape.bendX !== undefined && shape.bendY !== undefined) {
        xs.push(shape.bendX);
        ys.push(shape.bendY);
      }
      return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    } else if (shape.type === "arrow") {
      const xs = [shape.fromX, shape.toX];
      const ys = [shape.fromY, shape.toY];
      if (shape.bendX !== undefined && shape.bendY !== undefined) {
        xs.push(shape.bendX);
        ys.push(shape.bendY);
      }
      return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  pointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  pointInCircle(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radius: number = 5
  ): boolean {
    const dx = x - centerX;
    const dy = y - centerY;
    return dx * dx + dy * dy <= radius * radius;
  }

  isPointNearLineSegment(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    threshold: number = 5
  ): boolean {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  }

  isPointInShape(shape: Shape, x: number, y: number): boolean {
    if (shape.type === "line") {
      if (shape.bendX !== undefined && shape.bendY !== undefined) {
        return (
          this.isPointNearLineSegment(
            x,
            y,
            shape.startX,
            shape.startY,
            shape.bendX,
            shape.bendY
          ) ||
          this.isPointNearLineSegment(
            x,
            y,
            shape.bendX,
            shape.bendY,
            shape.endX,
            shape.endY
          )
        );
      }
      return this.isPointNearLineSegment(
        x,
        y,
        shape.startX,
        shape.startY,
        shape.endX,
        shape.endY
      );
    } else if (shape.type === "arrow") {
      if (shape.bendX !== undefined && shape.bendY !== undefined) {
        return (
          this.isPointNearLineSegment(
            x,
            y,
            shape.fromX,
            shape.fromY,
            shape.bendX,
            shape.bendY
          ) ||
          this.isPointNearLineSegment(
            x,
            y,
            shape.bendX,
            shape.bendY,
            shape.toX,
            shape.toY
          )
        );
      }
      return this.isPointNearLineSegment(
        x,
        y,
        shape.fromX,
        shape.fromY,
        shape.toX,
        shape.toY
      );
    } else {
      const bbox = this.getBoundingBox(shape);
      return this.pointInRect(x, y, bbox);
    }
  }

  getSelectionHandles(shape: Shape): { key: string; x: number; y: number }[] {
    if (shape.type === "line" || shape.type === "arrow") {
      const handles = [];
      if (shape.type === "line") {
        handles.push({ key: "start", x: shape.startX, y: shape.startY });
        handles.push({ key: "end", x: shape.endX, y: shape.endY });
        if (shape.bendX !== undefined && shape.bendY !== undefined) {
          handles.push({ key: "bend", x: shape.bendX, y: shape.bendY });
        } else {
          const midX = (shape.startX + shape.endX) / 2;
          const midY = (shape.startY + shape.endY) / 2;
          handles.push({ key: "bend", x: midX, y: midY });
        }
      } else {
        handles.push({ key: "from", x: shape.fromX, y: shape.fromY });
        handles.push({ key: "to", x: shape.toX, y: shape.toY });
        if (shape.bendX !== undefined && shape.bendY !== undefined) {
          handles.push({ key: "bend", x: shape.bendX, y: shape.bendY });
        } else {
          const midX = (shape.fromX + shape.toX) / 2;
          const midY = (shape.fromY + shape.toY) / 2;
          handles.push({ key: "bend", x: midX, y: midY });
        }
      }
      return handles;
    } else {
      const bbox = this.getBoundingBox(shape);
      const handleSize = 8;
      const half = handleSize / 2;
      return [
        { key: "top-left", x: bbox.x - half, y: bbox.y - half },
        { key: "top-right", x: bbox.x + bbox.width - half, y: bbox.y - half },
        {
          key: "bottom-left",
          x: bbox.x - half,
          y: bbox.y + bbox.height - half,
        },
        {
          key: "bottom-right",
          x: bbox.x + bbox.width - half,
          y: bbox.y + bbox.height - half,
        },
      ];
    }
  }
  // drawSelectionBox(shape: Shape) {
  //   const bbox = this.getBoundingBox(shape);
  //   this.ctx.save();
  //   this.ctx.strokeStyle = "blue";
  //   this.ctx.lineWidth = 2;
  //   this.ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
  //   const handleSize = 8;
  //   const half = handleSize / 2;
  //   const handles = [
  //     { x: bbox.x - half, y: bbox.y - half },
  //     { x: bbox.x + bbox.width - half, y: bbox.y - half },
  //     { x: bbox.x - half, y: bbox.y + bbox.height - half },
  //     { x: bbox.x + bbox.width - half, y: bbox.y + bbox.height - half },
  //   ];
  //   this.ctx.fillStyle = "blue";
  //   handles.forEach((h) => {
  //     this.ctx.fillRect(h.x, h.y, handleSize, handleSize);
  //   });
  //   this.ctx.restore();
  // }

  drawSelectionBox(shape: Shape) {
    const handles = this.getSelectionHandles(shape);
    const bbox = this.getBoundingBox(shape);
    this.ctx.save();
    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
    const handleSize = 8;
    if (shape.type === "line" || shape.type === "arrow") {
      this.ctx.fillStyle = "blue";
      handles.forEach((h) => {
        this.ctx.beginPath();
        this.ctx.arc(h.x, h.y, handleSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
      });
    } else {
      this.ctx.fillStyle = "blue";
      handles.forEach((h) => {
        this.ctx.fillRect(h.x, h.y, handleSize, handleSize);
      });
    }
    this.ctx.restore();
  }

  drawSelectionVisual(shape: Shape) {
    this.ctx.save();
    if (shape.type === "line" || shape.type === "arrow") {
      this.ctx.strokeStyle = "blue";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      if (shape.type === "line") {
        if (shape.bendX !== undefined && shape.bendY !== undefined) {
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.bezierCurveTo(
            shape.bendX,
            shape.bendY,
            shape.bendX,
            shape.bendY,
            shape.endX,
            shape.endY
          );
        } else {
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
        }
      } else {
        if (shape.bendX !== undefined && shape.bendY !== undefined) {
          this.ctx.moveTo(shape.fromX, shape.fromY);
          this.ctx.bezierCurveTo(
            shape.bendX,
            shape.bendY,
            shape.bendX,
            shape.bendY,
            shape.toX,
            shape.toY
          );
        } else {
          this.ctx.moveTo(shape.fromX, shape.fromY);
          this.ctx.lineTo(shape.toX, shape.toY);
        }
      }
      this.ctx.stroke();
    } else {
      const bbox = this.getBoundingBox(shape);
      this.ctx.strokeStyle = "blue";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
    }
    this.drawSelectionBox(shape);
    this.ctx.restore();
  }

  updateShapePosition(shape: Shape, dx: number, dy: number) {
    if (shape.type === "rect") {
      shape.x += dx;
      shape.y += dy;
    } else if (shape.type === "circle") {
      shape.startX += dx;
      shape.startY += dy;
      shape.endX += dx;
      shape.endY += dy;
    } else if (shape.type === "diamond") {
      shape.startX += dx;
      shape.startY += dy;
      shape.endX += dx;
      shape.endY += dy;
    } else if (shape.type === "text") {
      shape.x += dx;
      shape.y += dy;
    } else if (shape.type === "freePencil") {
      shape.currX = shape.currX.map((x) => x + dx);
      shape.currY = shape.currY.map((y) => y + dy);
      shape.lastX = shape.lastX.map((x) => x + dx);
      shape.lastY = shape.lastY.map((y) => y + dy);
    } else if (shape.type === "line") {
      shape.startX += dx;
      shape.startY += dy;
      shape.endX += dx;
      shape.endY += dy;
      if (shape.bendX !== undefined && shape.bendY !== undefined) {
        shape.bendX += dx;
        shape.bendY += dy;
      } else {
        shape.bendX = dx;
        shape.bendY = dy;
      }
    } else if (shape.type === "arrow") {
      shape.fromX += dx;
      shape.fromY += dy;
      shape.toX += dx;
      shape.toY += dy;
      if (shape.bendX !== undefined && shape.bendY !== undefined) {
        shape.bendX += dx;
        shape.bendY += dy;
      } else {
        shape.bendX = dx;
        shape.bendY = dy;
      }
    }
  }

  getHandleUnderMouse(
    bbox: { x: number; y: number; width: number; height: number },
    x: number,
    y: number
  ): "top-left" | "top-right" | "bottom-left" | "bottom-right" | null {
    const handleSize = 8;
    const half = handleSize / 2;
    const handles = {
      "top-left": { x: bbox.x - half, y: bbox.y - half },
      "top-right": { x: bbox.x + bbox.width - half, y: bbox.y - half },
      "bottom-left": { x: bbox.x - half, y: bbox.y + bbox.height - half },
      "bottom-right": {
        x: bbox.x + bbox.width - half,
        y: bbox.y + bbox.height - half,
      },
    };
    for (const key in handles) {
      const pos =
        handles[
          key as "top-left" | "top-right" | "bottom-left" | "bottom-right"
        ];
      if (
        this.pointInRect(x, y, {
          x: pos.x,
          y: pos.y,
          width: handleSize,
          height: handleSize,
        })
      ) {
        return key as "top-left" | "top-right" | "bottom-left" | "bottom-right";
      }
    }
    return null;
  }

  resizeShape(shape: Shape, handle: string, mouseX: number, mouseY: number) {
    if (shape.type === "rect") {
      const bbox = this.getBoundingBox(shape);
      const right = bbox.x + bbox.width;
      const bottom = bbox.y + bbox.height;
      switch (handle) {
        case "top-left":
          shape.x = mouseX;
          shape.y = mouseY;
          shape.width = right - mouseX;
          shape.height = bottom - mouseY;
          break;
        case "top-right":
          shape.y = mouseY;
          shape.width = mouseX - bbox.x;
          shape.height = bottom - mouseY;
          break;
        case "bottom-left":
          shape.x = mouseX;
          shape.width = right - mouseX;
          shape.height = mouseY - bbox.y;
          break;
        case "bottom-right":
          shape.width = mouseX - bbox.x;
          shape.height = mouseY - bbox.y;
          break;
      }
    } else if (shape.type === "circle") {
      switch (handle) {
        case "top-left":
          shape.startX = mouseX;
          shape.startY = mouseY;
          break;
        case "top-right":
          shape.startY = mouseY;
          shape.endX = mouseX;
          break;
        case "bottom-left":
          shape.startX = mouseX;
          shape.endY = mouseY;
          break;
        case "bottom-right":
          shape.endX = mouseX;
          shape.endY = mouseY;
          break;
      }
    } else if (shape.type === "diamond") {
      switch (handle) {
        case "top-left":
          shape.startX = mouseX;
          shape.startY = mouseY;
          break;
        case "top-right":
          shape.startY = mouseY;
          shape.endX = mouseX;
          break;
        case "bottom-left":
          shape.startX = mouseX;
          shape.endY = mouseY;
          break;
        case "bottom-right":
          shape.endX = mouseX;
          shape.endY = mouseY;
          break;
      }
    } else if (shape.type === "line") {
      if (handle === "start") {
        shape.startX = mouseX;
        shape.startY = mouseY;
      } else if (handle === "end") {
        shape.endX = mouseX;
        shape.endY = mouseY;
      } else if (handle === "bend") {
        shape.bendX = mouseX;
        shape.bendY = mouseY;
      }
    } else if (shape.type === "arrow") {
      if (handle === "from") {
        shape.fromX = mouseX;
        shape.fromY = mouseY;
      } else if (handle === "to") {
        shape.toX = mouseX;
        shape.toY = mouseY;
      } else if (handle === "bend") {
        shape.bendX = mouseX;
        shape.bendY = mouseY;
      }
    } else if (shape.type === "text") {
      const currentFontSize = shape.fontSize || 20;
      const currentBottom = shape.y;
      const currentTop = currentBottom - currentFontSize;
      if (handle === "top-left") {
        const newLeft = mouseX;
        const newTop = mouseY;
        const newFontSize = currentBottom - newTop;
        shape.fontSize = Math.max(newFontSize, 10);
        shape.x = newLeft;
      } else if (handle === "top-right") {
        const newTop = mouseY;
        const newFontSize = currentBottom - newTop;
        shape.fontSize = Math.max(newFontSize, 10);
      } else if (handle === "bottom-left") {
        const newLeft = mouseX;
        const newBottom = mouseY;
        const newFontSize = newBottom - currentTop;
        shape.fontSize = Math.max(newFontSize, 10);
        shape.x = newLeft;
        shape.y = newBottom;
      } else if (handle === "bottom-right") {
        const newBottom = mouseY;
        const newFontSize = newBottom - currentTop;
        shape.fontSize = Math.max(newFontSize, 10);
        shape.y = newBottom;
      }
    } else if (shape.type === "freePencil") {
      const bbox = this.getBoundingBox(shape);
      let newLeft = bbox.x,
        newTop = bbox.y,
        newRight = bbox.x + bbox.width,
        newBottom = bbox.y + bbox.height;
      switch (handle) {
        case "top-left":
          newLeft = mouseX;
          newTop = mouseY;
          break;
        case "top-right":
          newRight = mouseX;
          newTop = mouseY;
          break;
        case "bottom-left":
          break;
          newLeft = mouseX;
          newBottom = mouseY;
        case "bottom-right":
          newRight = mouseX;
          newBottom = mouseY;
          break;
      }
      const scaleX = (newRight - newLeft) / bbox.width;
      const scaleY = (newBottom - newTop) / bbox.height;
      shape.currX = shape.currX.map((x) => newLeft + (x - bbox.x) * scaleX);
      shape.currY = shape.currY.map((y) => newTop + (y - bbox.y) * scaleY);
      shape.lastX = shape.lastX.map((x) => newLeft + (x - bbox.x) * scaleX);
      shape.lastY = shape.lastY.map((y) => newTop + (y - bbox.y) * scaleY);
    }
  }

  drawBendedLine(
    type: "arrow" | "line",
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    bendX: number,
    bendY: number
  ) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.lineWidth = 2;
    const controlX = 2 * bendX - (startX + endX) / 2;
    const controlY = 2 * bendY - (startY + endY) / 2;
    this.ctx.moveTo(startX, startY);
    this.ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    this.ctx.stroke();
    if (type === "arrow") {
      const dx = endX - controlX;
      const dy = endY - controlY;
      const angle = Math.atan2(dy, dx);
      this.drawArrowHead(endX, endY, angle);
    }
  }

  drawRect = (X: number, Y: number, width: number, height: number) => {
    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.strokeRect(X, Y, width, height);
    this.ctx.lineWidth = 2;
  };

  drawCircle = (X: number, Y: number, currX: number, currY: number) => {
    const centerX = (X + currX) / 2;
    const centerY = (Y + currY) / 2;
    const radiousX = Math.abs(currX - X) / 2;

    const radiousY = Math.abs(currY - Y) / 2;
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, radiousX, radiousY, 0, 0, 2 * Math.PI);
    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.stroke();
  };

  drawFreePencil = (
    lastX: number,
    lastY: number,
    currX: number,
    currY: number
  ) => {
    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(lastX, lastY);
    this.ctx.lineTo(currX, currY);
    this.ctx.stroke();
  };

  drawLine = (startX: number, startY: number, endX: number, endY: number) => {
    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  };

  drawDiamond = (
    startX: number,
    startY: number,
    currX: number,
    currY: number
  ) => {
    const centerX = (startX + currX) / 2;
    const centerY = (startY + currY) / 2;
    const width = Math.abs(currX - startX);
    const height = Math.abs(currY - startY);

    this.ctx.strokeStyle = "rgba(255,255,255)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - height / 2);
    this.ctx.lineTo(centerX + width / 2, centerY);
    this.ctx.lineTo(centerX, centerY + height / 2);
    this.ctx.lineTo(centerX - width / 2, centerY);
    this.ctx.closePath();
    this.ctx.stroke();
  };

  drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    const angle = Math.atan2(toY - fromY, toX - fromX);
    this.drawArrowHead(toX, toY, angle);
  };

  drawArrowHead = (x: number, y: number, angle: number) => {
    const arrowHeadLength = 10;
    const arrowAngle1 = angle - Math.PI / 6;
    const arrowAngle2 = angle + Math.PI / 6;

    const arrowPoint1X = x - arrowHeadLength * Math.cos(arrowAngle1);
    const arrowPoint1Y = y - arrowHeadLength * Math.sin(arrowAngle1);

    const arrowPoint2X = x - arrowHeadLength * Math.cos(arrowAngle2);
    const arrowPoint2Y = y - arrowHeadLength * Math.sin(arrowAngle2);

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(arrowPoint1X, arrowPoint1Y);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(arrowPoint2X, arrowPoint2Y);
    this.ctx.stroke();
  };

  writeText = (
    text: string,
    x: number,
    y: number,
    drawCursor: boolean = true,
    fontSize: number = 20
  ) => {
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = "rgba(255, 255, 255)";
    const lineHeight = fontSize;
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      this.ctx.fillText(line, x, y + index * lineHeight);
    });

    if (this.isWriting && this.cursor && drawCursor) {
      const lastLine = lines[lines.length - 1];
      const metrics = this.ctx.measureText(lastLine);

      const cursorX = x + metrics.width;
      const cursorY = y + (lines.length - 1) * lineHeight;
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(cursorX, cursorY - lineHeight, 1, lineHeight);
    }
  };

  initDraw = () => {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("click", this.mouseClickHandler);

    this.canvas.addEventListener("wheel", this.wheelHandler);

    window.addEventListener("keydown", this.typingHandler);
  };

  eventRemover = () => {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("click", this.mouseClickHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    window.removeEventListener("keydown", this.typingHandler);
    window.clearInterval(this.blinkInterval);
  };
}
