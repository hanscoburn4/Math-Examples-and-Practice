/**
 * Utility functions for question handling and validation
 *
 * Features:
 * - Evaluate formulas with built-in Math
 * - Display formula results as:
 *     • Integers
 *     • Simplified fractions (e.g. \( \frac{7}{3} \))
 *     • Simplified radicals (e.g. \( 2\sqrt{3} \), \( \frac{1}{2}\sqrt{5} \))
 * - Exact fraction detection for integer arithmetic
 */

function validateVariableValue(value, constraints, allVars) {
  if (!constraints) return true;

  if (constraints.exclude) {
    for (const exclusion of constraints.exclude) {
      if (typeof exclusion === 'string') {
        if (allVars[exclusion] !== undefined) {
          if (value === allVars[exclusion]) return false;
        } else {
          const numEx = Number(exclusion);
          if (!isNaN(numEx) && value === numEx) return false;
        }
      } else if (value === exclusion) {
        return false;
      }
    }
  }

  return true;
}

function generateVariableValue(key, constraints, allVars, maxAttempts = 50) {
  let attempts = 0;
  let value;

  do {
    if (constraints.values) {
      value = constraints.values[Math.floor(Math.random() * constraints.values.length)];
    } else if (typeof constraints.min === "number" && typeof constraints.max === "number") {
      value = Math.floor(Math.random() * (constraints.max - constraints.min + 1)) + constraints.min;
    } else {
      value = constraints.default !== undefined ? constraints.default : 0;
    }

    attempts++;
  } while (!validateVariableValue(value, constraints, allVars) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    console.warn(`Could not generate valid value for variable ${key} after ${maxAttempts} attempts`);
    return constraints.default !== undefined ? constraints.default : 0;
  }

  return value;
}

/* -----------------------------
   Math Helpers
   ----------------------------- */

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function evaluateJSExpression(expression, variables = {}) {
  const helpers = {
    sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    abs: Math.abs, pow: Math.pow, log: Math.log, ln: Math.log,
    exp: Math.exp, min: Math.min, max: Math.max,
    round: Math.round, floor: Math.floor, ceil: Math.ceil,
    PI: Math.PI, E: Math.E,
  };

  const helperNames = Object.keys(helpers);
  const fnArgs = ['vars', ...helperNames, 'Math'];
  const fnBody = `with(vars){ return (${expression}); }`;
  const fn = new Function(...fnArgs, fnBody);

  const fnArgValues = [variables, ...helperNames.map(n => helpers[n]), Math];
  return fn(...fnArgValues);
}

/**
 * Try to parse a simple arithmetic expression (for exact fraction detection)
 */
function tryParseIntegerDivision(formula, vars) {
  if (!formula) return null;

  // Match patterns like: (a*d + c)/b  or  a/b  or  (x + 1)/(y - 2)
  const divRegex = /\(?\s*([^()\/]+)\s*\/\s*([^()\/]+)\s*\)?$/;
  const match = formula.match(divRegex);
  if (!match) return null;

  const numExpr = match[1].trim();
  const denExpr = match[2].trim();

  try {
    const num = evaluateJSExpression(numExpr, vars);
    const den = evaluateJSExpression(denExpr, vars);

    if (Number.isInteger(num) && Number.isInteger(den) && den !== 0) {
      return { n: num, d: den };
    }
  } catch (e) {
    // ignore
  }

  return null;
}

/**
 * Detect simplified radical: k * sqrt(m) or (p/q) * sqrt(m)
 */
function detectSimplifiedRadical(value, maxM = 100, maxDen = 100, eps = 1e-10) {
  if (!isFinite(value) || value === 0) return null;
  const signStr = value < 0 ? "-" : "";
  const absVal = Math.abs(value);

  for (let m = 2; m <= maxM; m++) {
    const sqrtM = Math.sqrt(m);
    if (Math.abs(sqrtM - Math.round(sqrtM)) < 1e-12) continue;

    const kFloat = absVal / sqrtM;
    const frac = approximateFraction(kFloat, maxDen, eps);
    if (frac) {
      const candidate = (frac.n / frac.d) * sqrtM;
      if (Math.abs(candidate - absVal) < eps) {
        let radical = m;
        let coeffNum = frac.n;
        for (let i = 2; i * i <= radical; i++) {
          while (radical % (i * i) === 0) {
            coeffNum *= i;
            radical /= (i * i);
          }
        }
        const g = gcd(Math.abs(coeffNum), frac.d);
        coeffNum /= g;
        const finalD = frac.d / g;

        const absN = Math.abs(coeffNum);
        const signCoeff = coeffNum < 0 ? "-" : "";
        let coeffPart = "";
        if (absN === 1 && finalD === 1) {
          coeffPart = "";
        } else if (finalD === 1) {
          coeffPart = String(absN);
        } else {
          coeffPart = `\\frac{${absN}}{${finalD}}`;
        }
        const radicalPart = radical === 1 ? "" : `\\sqrt{${radical}}`;
        const expr = coeffPart + radicalPart;
        return `${signStr}${signCoeff}\\( ${expr} \\)`.replace(/^\-\(\s*-/, '\\( -').replace(/\(\s*$/, '\\(');
      }
    }
  }
  return null;
}

function approximateFraction(x, maxDenominator = 1000, eps = 1e-12) {
  if (!isFinite(x)) return null;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a = [];
  let q = x;
  for (let i = 0; i < 20; i++) {
    const ai = Math.floor(q);
    a.push(ai);
    const frac = q - ai;
    if (frac < eps) break;
    q = 1 / frac;
  }

  let num0 = 1, den0 = 0;
  let num1 = a[0], den1 = 1;
  if (a.length === 1) {
    const g = gcd(num1, den1);
    return { n: sign * (num1 / g), d: den1 / g };
  }
  for (let i = 1; i < a.length; i++) {
    const num2 = a[i] * num1 + num0;
    const den2 = a[i] * den1 + den0;
    if (den2 > maxDenominator) break;
    num0 = num1; den0 = den1;
    num1 = num2; den1 = den2;
  }
  const g = gcd(Math.abs(num1), den1);
  const approxN = sign * (num1 / g);
  const approxD = den1 / g;
  if (Math.abs(approxN / approxD - x) < eps) {
    return { n: approxN, d: approxD };
  }
  return null;
}

/**
 * Main display formatter — now detects exact fractions from formulas
 */
function formatNumberForDisplay(num, formula = null, vars = null) {
  if (num === null || num === undefined || Number.isNaN(num)) return String(num);
  if (!isFinite(num)) return String(num);

  // 1. Integer
  if (Number.isInteger(num)) return String(num);

  // 2. Exact fraction from integer division (e.g. (a*d+c)/b)
  if (formula && vars) {
    const exact = tryParseIntegerDivision(formula, vars);
    if (exact) {
      let n = exact.n;
      let d = exact.d;
      const sign = n < 0 ? -1 : 1;
      n = Math.abs(n);
      d = Math.abs(d);
      const g = gcd(n, d);
      n /= g;
      d /= g;
      n *= sign;
      if (d === 1) return String(n);
      return `\\( \\frac{${n < 0 ? '-' + (-n) : n}}{${d}} \\)`;
    }
  }

  // 3. Simplified radical
  const radical = detectSimplifiedRadical(num);
  if (radical) return radical;

  // 4. Approximate fraction (fallback)
  const frac = approximateFraction(num, 1000, 1e-12);
  if (frac && frac.d !== 1 && Math.abs(frac.n / frac.d - num) < 1e-12) {
    return `\\( \\frac{${frac.n}}{${frac.d}} \\)`;
  }

  // 5. Clean decimal (last resort)
  let s = num.toFixed(8);
  s = s.replace(/\.?0+$/, '');
  return s || '0';
}

/* -----------------------------
   Main Variable Generation
   ----------------------------- */

function generateQuestionVariables(questionTemplate) {
  const vars = {};
  const displayVars = {};
  const variableDefinitions = questionTemplate.variables || {};

  
  // Pass 1: Base variables
  for (const [key, constraints] of Object.entries(variableDefinitions)) {
    if (typeof constraints === 'number') {
      vars[key] = constraints;
      continue;
    }
    if (!constraints || constraints.formula) continue;
    vars[key] = generateVariableValue(key, constraints, vars);
  }

  // Pass 2: Formula variables
  let formulaKeys = Object.keys(variableDefinitions).filter(k => variableDefinitions[k]?.formula);
  let maxIterations = 20;

  while (formulaKeys.length > 0 && maxIterations > 0) {
    const resolved = [];
    for (const key of formulaKeys) {
      const constraints = variableDefinitions[key];
      try {
        const numericVars = { ...vars };
        const rawResult = evaluateJSExpression(constraints.formula, numericVars);
        const value = typeof rawResult === 'number' ? rawResult : Number(rawResult);
        const textValue = { ...displayVars };
        textValue[key] = String(value);

        if (!Number.isNaN(value)) {
          vars[key] = value;
          resolved.push(key);
        }
      } catch (err) {
        // skip
      }
    }
    formulaKeys = formulaKeys.filter(k => !resolved.includes(k));
    if (resolved.length === 0 && formulaKeys.length > 0) {
      console.error(`Unresolved formulas: ${formulaKeys.join(', ')}`);
      formulaKeys.forEach(k => {
        vars[k] = NaN;
        displayVars[k] = "NaN";
      });
      break;
    }
    maxIterations--;
  }

  if (maxIterations <= 0) {
    console.error('Max iterations reached');
  }

  // Build display map
  for (const [key, constraints] of Object.entries(variableDefinitions)) {
    const numeric = vars[key];
    if (constraints && constraints.formula) {
      displayVars[key] = formatNumberForDisplay(numeric, constraints.formula, vars);
    } else if (constraints && constraints.display === 'math') {
      displayVars[key] = formatNumberForDisplay(numeric);
    } else {
      displayVars[key] = (numeric === undefined) ? '' : String(numeric);
    }
  }

  Object.defineProperty(vars, '__display', {
    value: displayVars,
    enumerable: false,
    configurable: true,
    writable: true,
  });

  return vars;
}

/**
 * Replace {var} with display value if available
 */
function replaceTemplateVariables(text, variables) {
  if (!text || !variables) return text;

  const replacements = {};
  const keys = Object.keys(variables).filter(k => k !== '__display');

  for (const key of keys) {
    const display = variables.__display?.[key];
    replacements[key] = display !== undefined && display !== '' ? display : String(variables[key]);
  }

  const sorted = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length);

  let result = text;
  for (const [key, value] of sorted) {
    const regex = new RegExp(`\\{${escapeRegExp(key)}\\}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

function evaluateMathExpression(expression, variables) {
  try {
    const numericVars = { ...variables };
    delete numericVars.__display;
    const result = evaluateJSExpression(expression, numericVars);
    const num = typeof result === 'number' ? result : Number(result);
    if (Number.isNaN(num)) return expression;
    return formatNumberForDisplay(num);
  } catch (err) {
    console.error("Eval error:", err);
    return "Error";
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Export */
window.QuestionUtils = {
  validateVariableValue,
  generateVariableValue,
  generateQuestionVariables,
  replaceTemplateVariables,
  evaluateMathExpression,
};
