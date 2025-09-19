/**
 * Mathematical utility functions for the Assessment Builder
 */

/**
 * Calculate the greatest common divisor
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Simplify a fraction to lowest terms
 */
function simplifyFraction(numerator, denominator) {
  if (denominator === 0) return "undefined";
  
  const divisor = gcd(numerator, denominator);
  numerator = numerator / divisor;
  denominator = denominator / divisor;
  
  // Handle negative fractions
  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }
  
  if (denominator === 1) {
    return numerator.toString();
  } else {
    return `\\( \\frac{${numerator}}{${denominator}} \\)`;
  }
}

/**
 * Simplify a square root to its simplest radical form
 */
function simplifyRadical(number) {
  if (number < 0) return `\\( i\\sqrt{${Math.abs(number)}} \\)`;
  if (number === 0) return "0";
  if (number === 1) return "1";
  
  let simplified = 1;
  let remaining = Math.abs(number);
  
  // Find perfect square factors
  for (let i = 2; i * i <= remaining; i++) {
    while (remaining % (i * i) === 0) {
      simplified *= i;
      remaining = remaining / (i * i);
    }
  }
  
  if (remaining === 1) {
    return simplified.toString();
  } else if (simplified === 1) {
    return `\\( \\sqrt{${remaining}} \\)`;
  } else {
    return `\\( ${simplified}\\sqrt{${remaining}} \\)`;
  }
}

/**
 * Calculate distance between two points and return in simplified radical form
 */
function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distanceSquared = dx * dx + dy * dy;
  
  return simplifyRadical(distanceSquared);
}

/**
 * Calculate midpoint between two points
 */
function calculateMidpoint(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  
  return { x: mx, y: my };
}

/**
 * Format a coordinate pair for display
 */
function formatCoordinate(x, y) {
  // Handle fractional coordinates
  const formatNum = (num) => {
    if (num % 1 === 0) return num.toString();
    
    // Convert to fraction if it's a simple fraction
    const denominator = 2; // Most common case
    if (Math.abs(num * denominator - Math.round(num * denominator)) < 0.0001) {
      const numerator = Math.round(num * denominator);
      return simplifyFraction(numerator, denominator).replace(/\\|\(|\)/g, '');
    }
    
    return num.toFixed(1);
  };
  
  return `(${formatNum(x)}, ${formatNum(y)})`;
}

window.MathUtils = {
  gcd,
  simplifyFraction,
  simplifyRadical,
  calculateDistance,
  calculateMidpoint,
  formatCoordinate
};