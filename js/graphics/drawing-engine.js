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
   * Draw angles (for angle measure problems)
   */
  drawAngles(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Draw angle rays
    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 2;

    // First angle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * 1.5, centerY);
    ctx.stroke();

    const angle1 = (vars.angle1 || 45) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * 1.5 * Math.cos(angle1), centerY - radius * 1.5 * Math.sin(angle1));
    ctx.stroke();

    // Draw angle arc
    ctx.strokeStyle = "#3498db";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, -angle1, true);
    ctx.stroke();

    // Label
    ctx.fillStyle = "#2c3e50";
    ctx.font = "16px Arial";
    ctx.fillText(`${vars.angle1 || 45}°`, centerX + 50, centerY - 20);
  }

  /**
   * Draw vertical angles
   */
  drawVerticalAngles(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw two intersecting lines
    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(centerX - 120, centerY - 80);
    ctx.lineTo(centerX + 120, centerY + 80);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 60);
    ctx.lineTo(centerX + 100, centerY - 60);
    ctx.stroke();

    // Label angles
    ctx.fillStyle = "#2c3e50";
    ctx.font = "16px Arial";
    if (vars.angle1) {
      ctx.fillText(`${vars.angle1}°`, centerX + 30, centerY - 30);
      ctx.fillText(`${vars.angle1}°`, centerX - 50, centerY + 40);
    }
  }

  /**
   * Draw rectangle (for perimeter problems)
   */
  drawRectangle(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = (vars.width || 6) * 25;
    const height = (vars.height || 4) * 25;
    const startX = (canvas.width - width) / 2;
    const startY = (canvas.height - height) / 2;

    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 2;

    ctx.strokeRect(startX, startY, width, height);

    // Labels
    ctx.fillStyle = "#2c3e50";
    ctx.font = "14px Arial";
    ctx.fillText(`${vars.width || 6}`, startX + width/2 - 10, startY - 10);
    ctx.fillText(`${vars.height || 4}`, startX - 20, startY + height/2);
  }

  /**
   * Draw rectangular prism (for volume problems)
   */
  drawRectangularPrism(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = (vars.width || 4) * 15;
    const h = (vars.height || 3) * 15;
    const d = (vars.depth || 5) * 15;
    const startX = 100;
    const startY = 150;

    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 2;

    // Draw front face
    ctx.strokeRect(startX, startY, w, h);

    // Draw back face (offset for 3D effect)
    ctx.strokeRect(startX + d, startY - d, w, h);

    // Connect corners
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + d, startY - d);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(startX + w, startY);
    ctx.lineTo(startX + w + d, startY - d);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(startX, startY + h);
    ctx.lineTo(startX + d, startY + h - d);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(startX + w, startY + h);
    ctx.lineTo(startX + w + d, startY + h - d);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#2c3e50";
    ctx.font = "14px Arial";
    ctx.fillText(`l=${vars.width || 4}`, startX + w/2 - 15, startY + h + 20);
    ctx.fillText(`w=${vars.depth || 5}`, startX + w + d/2, startY - d - 5);
    ctx.fillText(`h=${vars.height || 3}`, startX - 25, startY + h/2);
  }

  /**
   * Draw cylinder (for volume problems)
   */
  drawCylinder(canvas, vars) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const r = (vars.radius || 3) * 20;
    const h = (vars.height || 5) * 20;
    const centerX = canvas.width / 2;
    const topY = 50;

    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 2;

    // Draw top ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, topY, r, r/3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw sides
    ctx.beginPath();
    ctx.moveTo(centerX - r, topY);
    ctx.lineTo(centerX - r, topY + h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + r, topY);
    ctx.lineTo(centerX + r, topY + h);
    ctx.stroke();

    // Draw bottom ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, topY + h, r, r/3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#2c3e50";
    ctx.font = "14px Arial";
    ctx.fillText(`r=${vars.radius || 3}`, centerX + r + 10, topY + h/2);
    ctx.fillText(`h=${vars.height || 5}`, centerX - 30, topY + h/2);
  }

  /**
   * Draw coordinate transformation (for preimage/image problems)
   */
  drawTransformation(canvas, vars) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const xMid = width / 2;
    const yMid = height / 2;
    const scale = 25;

    this.drawCoordinateGrid(ctx, width, height, xMid, yMid, scale);

    // Draw preimage triangle
    const x1 = vars.x1 || 1;
    const y1 = vars.y1 || 1;
    const x2 = vars.x2 || 4;
    const y2 = vars.y2 || 1;
    const x3 = vars.x3 || 2;
    const y3 = vars.y3 || 4;

    ctx.strokeStyle = "#3498db";
    ctx.fillStyle = "rgba(52, 152, 219, 0.2)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(xMid + x1 * scale, yMid - y1 * scale);
    ctx.lineTo(xMid + x2 * scale, yMid - y2 * scale);
    ctx.lineTo(xMid + x3 * scale, yMid - y3 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Labels for preimage
    ctx.fillStyle = "#2c3e50";
    ctx.font = "12px Arial";
    ctx.fillText(`A(${x1},${y1})`, xMid + x1 * scale + 5, yMid - y1 * scale - 5);
    ctx.fillText(`B(${x2},${y2})`, xMid + x2 * scale + 5, yMid - y2 * scale - 5);
    ctx.fillText(`C(${x3},${y3})`, xMid + x3 * scale + 5, yMid - y3 * scale - 5);
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

    // Draw open/closed circles for endpoints if specified
    segments.forEach(segment => {
      const { type, vars, xMin, xMax, leftClosed = true, rightClosed = true } = segment;
      const ctx = canvas.getContext("2d");
      const { width, height } = canvas;
      const xMid = width / 2;
      const yMid = height / 2;
      const scale = this.defaultScale;

      const a = vars.a || 1;
      const b = vars.b || 0;
      const c = vars.c || 0;
      const h = vars.h || 0;
      const k = vars.k || 0;

      // Define function formula based on type
      function f(x) {
        switch (type) {
          case "linear": return a * (x - h) + b + k;
          case "parabola":
          case "quadratic": return a * Math.pow(x - h, 2) + b * (x - h) + c + k;
          case "exponential": return a * Math.pow(b, x - h) + k;
          case "absoluteValue": return a * Math.abs(x - h) + k;
          case "squareRoot": return a * Math.sqrt(x - h) + k;
          case "cubeRoot": return a * Math.cbrt(x - h) + k;
          default: return 0;
        }
      }

      const radius = 4;

      ctx.fillStyle = "#333";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;

      // Draw left endpoint
      if (xMin !== null && xMin !== undefined) {
        const yMin = f(xMin);
        const xPixel = xMid + xMin * scale;
        const yPixel = yMid - yMin * scale;
        if (leftClosed) {
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, radius, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      // Draw right endpoint
      if (xMax !== null && xMax !== undefined) {
        const yMax = f(xMax);
        const xPixel = xMid + xMax * scale;
        const yPixel = yMid - yMax * scale;
        if (rightClosed) {
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, radius, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
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
    const base = vars.b || 2;

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
      case "angles":
        this.drawAngles(canvas, vars);
        break;
      case "verticalAngles":
        this.drawVerticalAngles(canvas, vars);
        break;
      case "rectangle":
        this.drawRectangle(canvas, vars);
        break;
      case "rectangularPrism":
        this.drawRectangularPrism(canvas, vars);
        break;
      case "cylinder":
        this.drawCylinder(canvas, vars);
        break;
      case "transformation":
        this.drawTransformation(canvas, vars);
        break;
      default:
        console.warn(`Unknown draw type: ${drawType}`);
    }
  }
}

window.DrawingEngine = new DrawingEngine();
