/**
 * Expression evaluator for mathematical calculations
 */

class ExpressionEvaluator {
  constructor() {
    this.variables = {};
    this.expressions = {};
  }

  /**
   * Define a variable with a value
   */
  defineVariable(name, value) {
    this.variables[name] = value;
  }

  /**
   * Define an expression that can reference variables
   */
  defineExpression(name, expression) {
    this.expressions[name] = expression;
  }

  /**
   * Evaluate an expression by name
   */
  evaluate(name) {
    if (this.expressions[name]) {
      return this.evaluateExpression(this.expressions[name]);
    }
    if (this.variables[name] !== undefined) {
      return this.variables[name];
    }
    throw new Error(`Unknown expression or variable: ${name}`);
  }

  /**
   * Evaluate a mathematical expression string
   */
  evaluateExpression(expression) {
    try {
      // Create a safe evaluation context
      const context = {
        ...this.variables,
        Math,
        abs: Math.abs,
        sqrt: Math.sqrt,
        cbrt: Math.cbrt,
        pow: Math.pow,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        log: Math.log,
        exp: Math.exp,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        min: Math.min,
        max: Math.max
      };

      // Use Function constructor for safer evaluation than eval
      const func = new Function(...Object.keys(context), `return ${expression}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error("Error evaluating expression:", error);
      throw new Error(`Failed to evaluate expression: ${expression}`);
    }
  }
}

window.ExpressionEvaluator = ExpressionEvaluator;