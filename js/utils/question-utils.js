/**
 * Utility functions for question handling and validation
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
 * Evaluate answer formulas safely
 */
function evaluateAnswerFormula(formula, variables) {
  try {
    // Try using the expression evaluator for more complex expressions
    if (window.expressionEvaluator && formula.includes('=')) {
      // Handle multi-step calculations with intermediate variables
      const steps = formula.split(';').map(s => s.trim()).filter(s => s);
      const tempEvaluator = new window.ExpressionEvaluator();
      
      // Set initial variables
      for (const [key, value] of Object.entries(variables)) {
        tempEvaluator.defineVariable(key, value);
      }
      
      let result;
      for (const step of steps) {
        if (step.includes('=')) {
          const [varName, expression] = step.split('=').map(s => s.trim());
          tempEvaluator.defineExpression(varName, expression);
          result = tempEvaluator.evaluate(varName);
        } else {
          // Direct expression evaluation
          result = tempEvaluator.evaluateExpression(step);
        }
      }
      
      return result;
    }
    
    // Create a safe evaluation context
    const context = {
      ...variables,
      Math,
      simplifyFraction: window.MathUtils.simplifyFraction,
      simplifyRadical: window.MathUtils.simplifyRadical,
      calculateDistance: window.MathUtils.calculateDistance,
      calculateMidpoint: window.MathUtils.calculateMidpoint,
      formatCoordinate: window.MathUtils.formatCoordinate
    };
    
    // Use Function constructor for safer evaluation than eval
    const func = new Function(...Object.keys(context), `return ${formula}`);
    return func(...Object.values(context));
  } catch (error) {
    console.error("Error evaluating answer formula:", error);
    return "Error in calculation";
  }
}

window.QuestionUtils = {
  validateVariableValue,
  generateVariableValue,
  generateQuestionVariables,
  replaceTemplateVariables,
  evaluateAnswerFormula
};
