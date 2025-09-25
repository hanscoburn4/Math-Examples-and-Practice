/**
 * Graphics engine for drawing mathematical visualizations
 */

class DrawingEngine {
  constructor() {
    this.defaultWidth = 420;
    this.defaultHeight = 240;
    this.defaultScale = 20;
  }

  /**
   * Draw coordinate grid with axes
   */
  drawCoordinateGrid(ctx, width, height, xMid = width/2, yMid = height/2, scale = 20) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Vertical lines
    for (let x = xMid % scale; x < width; x += scale) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    
    // Horizontal lines
    for (let y = yMid % scale; y < height; y += scale) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    
    ctx.stroke();
    
    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // X-axis
    ctx.moveTo(0, yMid);
    ctx.lineTo(width, yMid);
    
    // Y-axis
    ctx.moveTo(xMid, 0);
    ctx.lineTo(xMid, height);
    
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  /**
   * Draw linear function
   */
  drawLinear(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const m = vars.m || 1;
    const b = vars.b || 0;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 2;
    ctx.beginPath();

    let first = true;
    
    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }
    
    for (let xPixel = startPixel; xPixel < endPixel; xPixel += 2) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      const y = m * (x - h) + b + k;
      const yPixel = yMid - y * scale;

      if (yPixel >= 0 && yPixel <= height) {
        if (first) {
          ctx.moveTo(xPixel, yPixel);
          first = false;
        } else {
          ctx.lineTo(xPixel, yPixel);
        }
      }
    }
    ctx.stroke();
  }

  /**
   * Draw parabola
   */
  drawParabola(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const b = vars.b || 0;
    const c = vars.c || 0;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 2;
    ctx.beginPath();

    let first = true;
    
    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }
    
    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      const y = a * Math.pow(x - h, 2) + b * (x - h) + c + k;
      const yPixel = yMid - y * scale;

      if (first) {
        ctx.moveTo(xPixel, yPixel);
        first = false;
      } else {
        ctx.lineTo(xPixel, yPixel);
      }
    }
    ctx.stroke();
  }

  /**
   * Draw exponential function
   */
  drawExponential(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const base = vars.b || 2;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#9b59b6";
    ctx.lineWidth = 2;
    ctx.beginPath();

    let first = true;
    
    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }
    
    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      const y = a * Math.pow(base, x - h) + k;
      const yPixel = yMid - y * scale;

      if (yPixel >= -100 && yPixel <= height + 100) { // Extended range for exponentials
        if (first) {
          ctx.moveTo(xPixel, yPixel);
          first = false;
        } else {
          ctx.lineTo(xPixel, yPixel);
        }
      }
    }
    ctx.stroke();
  }

  /**
   * Draw rational function (hyperbola)
   */
  drawRational(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#f39c12";
    ctx.lineWidth = 2;

    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }

    // Draw left branch
    ctx.beginPath();
    let first = true;
    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      if (Math.abs(x - h) > 0.05) { // Avoid asymptote
        const y = a / (x - h) + k;
        const yPixel = yMid - y * scale;

        if (yPixel >= 0 && yPixel <= height && x < h) {
          if (first) {
            ctx.moveTo(xPixel, yPixel);
            first = false;
          } else {
            ctx.lineTo(xPixel, yPixel);
          }
        }
      } else if (!first) {
        break;
      }
    }
    ctx.stroke();

    // Draw right branch
    ctx.beginPath();
    first = true;
    for (let xPixel = endPixel; xPixel >= startPixel; xPixel--) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      if (Math.abs(x - h) > 0.05) { // Avoid asymptote
        const y = a / (x - h) + k;
        const yPixel = yMid - y * scale;

        if (yPixel >= 0 && yPixel <= height && x > h) {
          if (first) {
            ctx.moveTo(xPixel, yPixel);
            first = false;
          } else {
            ctx.lineTo(xPixel, yPixel);
          }
        }
      } else if (!first) {
        break;
      }
    }
    ctx.stroke();
  }

  /**
   * Draw trigonometric function
   */
  drawTrigonometric(canvas, vars, type = "sine", xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const b = vars.b || 1;
    const c = vars.c || 0;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }

    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      const angle = b * (x - h) + c;
      let y;
      
      if (type === "cosine") {
        y = a * Math.cos(angle) + k;
      } else {
        y = a * Math.sin(angle) + k;
      }
      
      const yPixel = yMid - y * scale;

      if (xPixel === startPixel) {
        ctx.moveTo(xPixel, yPixel);
      } else {
        ctx.lineTo(xPixel, yPixel);
      }
    }
    ctx.stroke();
  }

  /**
   * Draw geometric shapes
   */
  drawTriangle(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 25;
    const baseLength = (vars.a || 3) * scale;
    const height = (vars.b || 4) * scale;

    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(50, 180);
    ctx.lineTo(50 + baseLength, 180);
    ctx.lineTo(50, 180 - height);
    ctx.closePath();
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#2c3e50";
    ctx.font = "14px Arial";
    ctx.fillText(`${vars.a || 3}`, 50 + baseLength/2, 195);
    ctx.fillText(`${vars.b || 4}`, 30, 180 - height/2);
  }

  /**
   * Draw circle
   */
  drawCircle(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (vars.r || 4) * 20;

    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Draw absolute value function
   */
  drawAbsoluteValue(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#e67e22";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }

    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      const y = a * Math.abs(x - h) + k;
      const yPixel = yMid - y * scale;

      if (xPixel === startPixel) {
        ctx.moveTo(xPixel, yPixel);
      } else {
        ctx.lineTo(xPixel, yPixel);
      }
    }
    ctx.stroke();
  }

  /**
   * Draw square root function
   */
  drawSquareRoot(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }

    let first = true;
    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      // Check if x-h is non-negative (domain of square root)
      if (x - h >= 0) {
        const y = a * Math.sqrt(x - h) + k;
        const yPixel = yMid - y * scale;

        if (first) {
          ctx.moveTo(xPixel, yPixel);
          first = false;
        } else {
          ctx.lineTo(xPixel, yPixel);
        }
      }
    }
    ctx.stroke();
  }

  /**
   * Draw cube root function
   */
  drawCubeRoot(canvas, vars, xMin = null, xMax = null) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Only draw grid if this is not part of a piecewise function
    if (xMin === null && xMax === null) {
      this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);
    }

    const a = vars.a || 1;
    const h = vars.h || 0;
    const k = vars.k || 0;

    // Use domain constraints from vars if provided
    const domainXMin = xMin !== null ? xMin : (vars.xMin !== undefined ? vars.xMin : null);
    const domainXMax = xMax !== null ? xMax : (vars.xMax !== undefined ? vars.xMax : null);

    ctx.strokeStyle = "#8e44ad";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Determine pixel range based on domain constraints
    let startPixel = 0;
    let endPixel = width;
    
    if (domainXMin !== null) {
      startPixel = Math.max(0, xMid + domainXMin * scale);
    }
    if (domainXMax !== null) {
      endPixel = Math.min(width, xMid + domainXMax * scale);
    }

    for (let xPixel = startPixel; xPixel < endPixel; xPixel++) {
      const x = (xPixel - xMid) / scale;
      
      // Skip if outside domain
      if (domainXMin !== null && x < domainXMin) continue;
      if (domainXMax !== null && x > domainXMax) continue;
      
      const y = a * Math.cbrt(x - h) + k;
      const yPixel = yMid - y * scale;

      if (xPixel === startPixel) {
        ctx.moveTo(xPixel, yPixel);
      } else {
        ctx.lineTo(xPixel, yPixel);
      }
    }
    ctx.stroke();
  }

  /**
   * Draw piecewise function
   */
  drawPiecewise(canvas, segments) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    // Draw coordinate grid once
    this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);

    // Draw each segment
    segments.forEach(segment => {
      const { type, vars, xMin, xMax } = segment;
      
      switch (type) {
        case "linear":
        case "linearGraph":
          this.drawLinear(canvas, vars, xMin, xMax);
          break;
        case "parabola":
        case "quadratic":
          this.drawParabola(canvas, vars, xMin, xMax);
          break;
        case "exponential":
          this.drawExponential(canvas, vars, xMin, xMax);
          break;
        case "rational":
          this.drawRational(canvas, vars, xMin, xMax);
          break;
        case "sine":
        case "trigSine":
          this.drawTrigonometric(canvas, vars, "sine", xMin, xMax);
          break;
        case "cosine":
        case "trigCosine":
          this.drawTrigonometric(canvas, vars, "cosine", xMin, xMax);
          break;
        case "absoluteValue":
          this.drawAbsoluteValue(canvas, vars, xMin, xMax);
          break;
        case "squareRoot":
          this.drawSquareRoot(canvas, vars, xMin, xMax);
          break;
        case "cubeRoot":
          this.drawCubeRoot(canvas, vars, xMin, xMax);
          break;
        default:
          console.warn(`Unknown segment type: ${type}`);
      }
    });

    // Draw open/closed circles for endpoints if specified
    segments.forEach(segment => {
      const { vars, xMin, xMax, leftClosed = true, rightClosed = true } = segment;
      
      if (xMin !== undefined && xMin !== null) {
        this.drawEndpoint(canvas, xMin, this.evaluateFunction(segment, xMin), leftClosed);
      }
      if (xMax !== undefined && xMax !== null) {
        this.drawEndpoint(canvas, xMax, this.evaluateFunction(segment, xMax), rightClosed);
      }
    });
  }

  /**
   * Draw endpoint circle (open or closed)
   */
  drawEndpoint(canvas, x, y, closed = true) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = this.defaultScale;

    const xPixel = xMid + x * scale;
    const yPixel = yMid - y * scale;

    ctx.beginPath();
    ctx.arc(xPixel, yPixel, 4, 0, Math.PI * 2);
    
    if (closed) {
      ctx.fillStyle = "#2c3e50";
      ctx.fill();
    } else {
      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Evaluate function at a specific x value
   */
  evaluateFunction(segment, x) {
    const { type, vars } = segment;
    const a = vars.a || 1;
    const b = vars.b || 0;
    const c = vars.c || 0;
    const h = vars.h || 0;
    const k = vars.k || 0;

    switch (type) {
      case "linear":
      case "linearGraph":
        return a * (x - h) + b + k;
      case "parabola":
      case "quadratic":
        return a * Math.pow(x - h, 2) + b * (x - h) + c + k;
      case "exponential":
        const base = vars.b || 2;
        return a * Math.pow(base, x - h) + k;
      case "rational":
        return a / (x - h) + k;
      case "sine":
      case "trigSine":
        const angle = b * (x - h) + c;
        return a * Math.sin(angle) + k;
      case "cosine":
      case "trigCosine":
        const angleC = b * (x - h) + c;
        return a * Math.cos(angleC) + k;
      case "absoluteValue":
        return a * Math.abs(x - h) + k;
      case "squareRoot":
        return x - h >= 0 ? a * Math.sqrt(x - h) + k : undefined;
      case "cubeRoot":
        return a * Math.cbrt(x - h) + k;
      default:
        return 0;
    }
  }

  /**
   * Main drawing dispatcher
   */
  draw(canvas, drawType, vars) {
    if (!canvas || !drawType) return;

    // Set canvas size if not already set
    if (!canvas.width) canvas.width = this.defaultWidth;
    if (!canvas.height) canvas.height = this.defaultHeight;

    switch (drawType) {
      case "linearGraph":
        this.drawLinear(canvas, vars);
        break;
      case "parabola":
        this.drawParabola(canvas, vars);
        break;
      case "exponential":
        this.drawExponential(canvas, vars);
        break;
      case "rational":
        this.drawRational(canvas, vars);
        break;
      case "sine":
      case "trigSine":
        this.drawTrigonometric(canvas, vars, "sine");
        break;
      case "cosine":
      case "trigCosine":
        this.drawTrigonometric(canvas, vars, "cosine");
        break;
      case "absoluteValue":
        this.drawAbsoluteValue(canvas, vars);
        break;
      case "squareRoot":
        this.drawSquareRoot(canvas, vars);
        break;
      case "cubeRoot":
        this.drawCubeRoot(canvas, vars);
        break;
      case "piecewise":
        this.drawPiecewise(canvas, vars.segments || []);
        break;
      case "triangle":
      case "rightTriangle":
        this.drawTriangle(canvas, vars);
        break;
      case "circle":
        this.drawCircle(canvas, vars);
        break;
      default:
        console.warn(`Unknown draw type: ${drawType}`);
    }
  }
}

window.DrawingEngine = new DrawingEngine();