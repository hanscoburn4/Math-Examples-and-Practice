/**
 * Mathematical utility functions for the Assessment Builder
 * Now integrated with math.js for enhanced mathematical operations
 */

// Create a math.js instance with custom functions for backward compatibility
const mathInstance = math.create(math.all);

// Add custom functions to math.js scope for backward compatibility
mathInstance.import({
  // Legacy function names that may be used in question templates
  simplifyFraction: (numerator, denominator) => {
    if (denominator === 0) return "undefined";
    
    try {
      const fraction = mathInstance.fraction(numerator, denominator);
      const simplified = mathInstance.format(fraction);
      
      // Convert to LaTeX format if it's a fraction
      if (simplified.includes('/')) {
        const parts = simplified.split('/');
        return `\\( \\frac{${parts[0]}}{${parts[1]}} \\)`;
      }
      return simplified;
    } catch (error) {
      console.error('Error simplifying fraction:', error);
      return `${numerator}/${denominator}`;
    }
  },
  
  simplifyRadical: (number) => {
    if (number < 0) return `\\( i\\sqrt{${Math.abs(number)}} \\)`;
    if (number === 0) return "0";
    if (number === 1) return "1";
    
    try {
      const simplified = mathInstance.simplify(`sqrt(${number})`);
      const result = mathInstance.format(simplified);
      
      // Format for LaTeX if it contains sqrt
      if (result.includes('sqrt')) {
        return `\\( ${result.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')} \\)`;
      }
      return result;
    } catch (error) {
      console.error('Error simplifying radical:', error);
      return `\\( \\sqrt{${number}} \\)`;
    }
  },
  
  calculateDistance: (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSquared = dx * dx + dy * dy;
    
    try {
      const simplified = mathInstance.simplify(`sqrt(${distanceSquared})`);
      const result = mathInstance.format(simplified);
      
      if (result.includes('sqrt')) {
        return `\\( ${result.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')} \\)`;
      }
      return result;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return `\\( \\sqrt{${distanceSquared}} \\)`;
    }
  },
  
  calculateMidpoint: (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return { x: mx, y: my };
  },
  
  formatCoordinate: (x, y) => {
    const formatNum = (num) => {
      if (num % 1 === 0) return num.toString();
      
      try {
        const fraction = mathInstance.fraction(num);
        const formatted = mathInstance.format(fraction);
        return formatted.includes('/') ? formatted : num.toFixed(1);
      } catch (error) {
        return num.toFixed(1);
      }
    };
    
    return `(${formatNum(x)}, ${formatNum(y)})`;
  }
});

/**
 * Calculate the greatest common divisor (kept for legacy compatibility)
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
 * Simplify a fraction to lowest terms (legacy function - use math.js version instead)
 * @deprecated Use mathInstance.import.simplifyFraction instead
 */
function simplifyFraction(numerator, denominator) {
  return mathInstance.simplifyFraction(numerator, denominator);
}

/**
 * Simplify a square root to its simplest radical form (legacy function)
 * @deprecated Use mathInstance.import.simplifyRadical instead
 */
function simplifyRadical(number) {
  return mathInstance.simplifyRadical(number);
}

/**
 * Calculate distance between two points (legacy function)
 * @deprecated Use mathInstance.import.calculateDistance instead
 */
function calculateDistance(x1, y1, x2, y2) {
  return mathInstance.calculateDistance(x1, y1, x2, y2);
}

/**
 * Calculate midpoint between two points (legacy function)
 * @deprecated Use mathInstance.import.calculateMidpoint instead
 */
function calculateMidpoint(x1, y1, x2, y2) {
  return mathInstance.calculateMidpoint(x1, y1, x2, y2);
}

/**
 * Format a coordinate pair for display (legacy function)
 * @deprecated Use mathInstance.import.formatCoordinate instead
 */
function formatCoordinate(x, y) {
  return mathInstance.formatCoordinate(x, y);
}

window.MathUtils = {
  mathInstance, // Expose math.js instance for advanced usage
  gcd,
  simplifyFraction,
  simplifyRadical,
  calculateDistance,
  calculateMidpoint,
  formatCoordinate
};