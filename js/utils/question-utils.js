/**
 * Utility functions for question handling and validation
 * Updated to use math.js for secure mathematical expression evaluation
 */

/**
 * Validate variable constraints and exclusions
 */
function validateVariableValue(value, constraints, allVars) {
  if (!constraints) return true;
  
  // Check exclusions
  if (constraints.exclude) {
    for (const exclusion of constraints.exclude) {
      if (typeof exclusion === 'string') {
        // Reference to another variable
        if (value === allVars[exclusion]) return false;
      } else {
        // Direct value
        if (value === exclusion) return false;
      }
    }
  }
  
  return true;
}

/**
 * Generate a random value within constraints
 */
function generateVariableValue(key, constraints, allVars, maxAttempts = 50) {
  let attempts = 0;
  let value;
  
  do {
    if (constraints.values) {
      // Pick from predefined values
      value = constraints.values[Math.floor(Math.random() * constraints.values.length)];
    } else if (typeof constraints.min === "number" && typeof constraints.max === "number") {
      // Generate within range
      value = Math.floor(Math.random() * (constraints.max - constraints.min + 1)) + constraints.min;
    } else {
      // Fallback
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

/**
 * Generate all variables for a question template, including dependent formulas
 */
function generateQuestionVariables(questionTemplate) {
  const vars = {};
  const variableDefinitions = questionTemplate.variables || {};

  // Pass 1: generate base variables (random values / chosen values)
  for (const [key, constraints] of Object.entries(variableDefinitions)) {
    if (!constraints) continue;

    // Skip formula variables for now
    if (constraints.formula) continue;

    vars[key] = generateVariableValue(key, constraints, vars);
  }

  // Pass 2: resolve formula variables that depend on previously generated ones
  for (const [key, constraints] of Object.entries(variableDefinitions)) {
    if (!constraints || !constraints.formula) continue;

    try {
      vars[key] = Function("vars", `with(vars){ return ${constraints.formula}; }`)(vars);
    } catch (error) {
      console.error(`Error evaluating formula for variable "${key}" (${constraints.formula})`, error);
      vars[key] = NaN;
    }
  }

  return vars;
}


/**
 * Replace template variables in text
 */
function replaceTemplateVariables(text, variables) {
  let result = text;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Evaluate mathematical expressions safely using math.js
 * Replaces the old evaluateAnswerFormula function
 */
function evaluateMathExpression(expression, variables) {
  try {
    // Pre-process LaTeX syntax to math.js compatible format
    let processedExpression = expression;
    
    // Convert LaTeX fractions: \frac{a}{b} -> (a)/(b)
    processedExpression = processedExpression.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    
    // Convert LaTeX exponents with braces: x^{...} -> x^(...)
    processedExpression = processedExpression.replace(/\^\{([^}]+)\}/g, '^($1)');
    
    // Convert LaTeX square roots: \sqrt{...} -> sqrt(...)
    processedExpression = processedExpression.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
    
    // Convert LaTeX multiplication symbols
    processedExpression = processedExpression.replace(/\\cdot/g, '*');
    processedExpression = processedExpression.replace(/\\times/g, '*');
    
    // Convert LaTeX division symbol
    processedExpression = processedExpression.replace(/\\div/g, '/');
    
    // Convert LaTeX parentheses
    processedExpression = processedExpression.replace(/\\left\(/g, '(');
    processedExpression = processedExpression.replace(/\\right\)/g, ')');
    processedExpression = processedExpression.replace(/\\left\[/g, '[');
    processedExpression = processedExpression.replace(/\\right\]/g, ']');
    
    // Remove any remaining backslashes that might cause issues
    processedExpression = processedExpression.replace(/\\/g, '');
    
    // Use math.js for safe evaluation
    const mathInstance = window.MathUtils.mathInstance;
    
    // Create a scope with variables for evaluation
    const scope = { ...variables };
    
    // Evaluate the expression using math.js
    const result = mathInstance.evaluate(processedExpression, scope);
    
    // Format the result appropriately
    if (typeof result === 'number') {
      // Check if it's a simple integer
      if (Number.isInteger(result)) {
        return result.toString();
      }
      // Check if it can be represented as a simple fraction
      try {
        const fraction = mathInstance.fraction(result);
        const formatted = mathInstance.format(fraction);
        if (formatted.includes('/')) {
          const parts = formatted.split('/');
          return `\\( \\frac{${parts[0]}}{${parts[1]}} \\)`;
        }
        return formatted;
      } catch (e) {
        // If fraction conversion fails, return as decimal
        return result.toString();
      }
    }
    
    // For other types (expressions, etc.), format using math.js
    return mathInstance.format(result);
    
  } catch (error) {
    console.error(`Error evaluating math expression "${expression}" (processed: "${processedExpression}") with variables:`, variables, error);
    return "Error in calculation";
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use evaluateMathExpression instead
 */
function evaluateAnswerFormula(formula, variables) {
  console.warn('evaluateAnswerFormula is deprecated. Use evaluateMathExpression instead.');
  return evaluateMathExpression(formula, variables);
}

window.QuestionUtils = {
  validateVariableValue,
  generateVariableValue,
  generateQuestionVariables,
  replaceTemplateVariables,
  evaluateMathExpression,
  evaluateAnswerFormula // Keep for backward compatibility
};