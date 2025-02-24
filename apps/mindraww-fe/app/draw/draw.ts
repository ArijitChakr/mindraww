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
}
interface Text {
  type: "text";
  text: string;
  x: number;
  y: number;
}

type Shape = Rect | Circle | FreePencil | Line | Diamond | Arrow | Text;

export type ShapeTypes =
  | "rect"
  | "circle"
  | "freePencil"
  | "line"
  | "diamond"
  | "arrow"
  | "text";

export class Draw {
  private ctx: CanvasRenderingContext2D;
  private startX: number = 0;
  private startY: number = 0;
  private isDrawing: boolean;
  private selectedShape: ShapeTypes = "rect";
  private shapes: Shape[] = [];
  private currFreePencil: FreePencil | null = null;
  private isWriting: boolean = false;
  private text: string = "";
  private cursor: boolean = false;
  private blinkInterval: number = 0;
  private canvas: HTMLCanvasElement;
  private zoom: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.canvas = canvas;
    this.isDrawing = false;
    this.clearCanvas();
    this.initDraw();
  }

  clearCanvas = () => {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.scale(this.zoom, this.zoom);

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
        this.drawLine(shape.startX, shape.startY, shape.endX, shape.endY);
      }
      if (shape.type === "diamond") {
        this.drawDiamond(shape.startX, shape.startY, shape.endX, shape.endY);
      }
      if (shape.type === "arrow") {
        this.drawArrow(shape.fromX, shape.fromY, shape.toX, shape.toY);
      }
      if (shape.type === "text") {
        this.writeText(shape.text, shape.x, shape.y, false);
      }
    });
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
  };

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      this.zoom += zoomFactor;
    } else {
      this.zoom = Math.max(0.1, this.zoom - zoomFactor);
    }
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
    }
  };

  mouseClickHandler = (e: MouseEvent) => {
    if (this.selectedShape !== "text") {
      return;
    }
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
      this.clearCanvas();
    } else {
      window.clearInterval(this.blinkInterval);
      this.isWriting = true;
      this.text = "";
      this.startX = e.clientX;
      this.startY = e.clientY;
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
  };

  mouseDownHandler = (e: MouseEvent) => {
    if (this.selectedShape === "text") return;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.isDrawing = true;

    if (this.selectedShape === "freePencil") {
      this.currFreePencil = {
        type: "freePencil",
        currX: [e.clientX],
        currY: [e.clientY],
        lastX: [e.clientX],
        lastY: [e.clientY],
      };
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.selectedShape === "text") return;
    if (!this.isDrawing) return;
    this.clearCanvas();
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    if (this.selectedShape === "rect") {
      this.drawRect(this.startX, this.startY, width, height);
    }
    if (this.selectedShape === "circle") {
      this.drawCircle(
        this.startX - this.canvas.offsetLeft,
        this.startY - this.canvas.offsetTop,
        e.clientX - this.canvas.offsetLeft,
        e.clientY - this.canvas.offsetTop
      );
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
      this.currFreePencil.currX.push(e.clientX);
      this.currFreePencil.currY.push(e.clientY);

      this.startX = e.clientX;
      this.startY = e.clientY;
    }

    if (this.selectedShape === "line") {
      this.drawLine(this.startX, this.startY, e.clientX, e.clientY);
    }
    if (this.selectedShape === "diamond") {
      this.drawDiamond(
        this.startX - this.canvas.offsetLeft,
        this.startY - this.canvas.offsetTop,
        e.clientX - this.canvas.offsetLeft,
        e.clientY - this.canvas.offsetTop
      );
    }
    if (this.selectedShape === "arrow") {
      this.drawArrow(this.startX, this.startY, e.clientX, e.clientY);
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.isDrawing = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    if (this.selectedShape === "rect") {
      this.shapes.push({
        type: this.selectedShape,
        width,
        height,
        x: this.startX,
        y: this.startY,
      });
    } else if (this.selectedShape === "circle") {
      this.shapes.push({
        type: this.selectedShape,
        startX: this.startX - this.canvas.offsetLeft,
        startY: this.startY - this.canvas.offsetTop,
        endX: e.clientX - this.canvas.offsetLeft,
        endY: e.clientY - this.canvas.offsetTop,
      });
    } else if (this.selectedShape === "freePencil") {
      if (!this.currFreePencil) return;

      this.shapes.push(this.currFreePencil);
      this.currFreePencil = null;
    } else if (this.selectedShape === "line") {
      this.shapes.push({
        type: this.selectedShape,
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      });
    } else if (this.selectedShape === "diamond") {
      this.shapes.push({
        type: this.selectedShape,
        startX: this.startX - this.canvas.offsetLeft,
        startY: this.startY - this.canvas.offsetTop,
        endX: e.clientX - this.canvas.offsetLeft,
        endY: e.clientY - this.canvas.offsetTop,
      });
    } else if (this.selectedShape === "arrow") {
      this.shapes.push({
        type: this.selectedShape,
        fromX: this.startX,
        fromY: this.startY,
        toX: e.clientX,
        toY: e.clientY,
      });
    }
  };

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
    const arrowHeadLength = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    const angle = Math.atan2(toY - fromY, toX - fromX);

    const arrowAngle1 = angle - Math.PI / 6;
    const arrowAngle2 = angle + Math.PI / 6;

    const arrowPoint1X = toX - arrowHeadLength * Math.cos(arrowAngle1);
    const arrowPoint1Y = toY - arrowHeadLength * Math.sin(arrowAngle1);

    const arrowPoint2X = toX - arrowHeadLength * Math.cos(arrowAngle2);
    const arrowPoint2Y = toY - arrowHeadLength * Math.sin(arrowAngle2);

    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(arrowPoint1X, arrowPoint1Y);
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(arrowPoint2X, arrowPoint2Y);
    this.ctx.stroke();
  };

  writeText = (
    text: string,
    x: number,
    y: number,
    drawCursor: boolean = true
  ) => {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "rgba(255, 255, 255)";
    const lineHeight = 20;
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
