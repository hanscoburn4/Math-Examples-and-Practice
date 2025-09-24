/**
 * Expression Evaluator - Handles partial evaluation of mathematical expressions with variables
 * Supports variable dependencies and dynamic evaluation
 */

class ExpressionEvaluator {
  constructor() {
    this.variables = new Map();
    this.expressions = new Map();
    this.evaluationCache = new Map();
  }

  /**
   * Define a variable with a specific numeric value
   * @param {string} name - Variable name
   * @param {number} value - Numeric value
   */
  defineVariable(name, value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid value for variable '${name}': must be a number`);
    }
    
    this.variables.set(name, value);
    this.expressions.delete(name); // Remove any expression definition
    this.clearCache(); // Clear cache when variables change
    
    console.log(`Variable '${name}' defined as ${value}`);
  }

  /**
   * Define a variable using an expression that references other variables
   * @param {string} name - Variable name
   * @param {string} expression - Mathematical expression
   */
  defineExpression(name, expression) {
    if (typeof expression !== 'string' || expression.trim() === '') {
      throw new Error(`Invalid expression for variable '${name}': must be a non-empty string`);
    }

    // Check for circular dependencies before adding
    if (this.wouldCreateCircularDependency(name, expression)) {
      throw new Error(`Circular dependency detected: '${name}' cannot depend on itself`);
    }

    this.expressions.set(name, expression.trim());
    this.variables.delete(name); // Remove any direct value definition
    this.clearCache(); // Clear cache when expressions change
    
    console.log(`Variable '${name}' defined as expression: ${expression}`);
  }

  /**
   * Evaluate a variable or expression
   * @param {string} name - Variable name to evaluate
   * @returns {number} - Evaluated result
   */
  evaluate(name) {
    // Check cache first
    if (this.evaluationCache.has(name)) {
      return this.evaluationCache.get(name);
    }

    let result;

    // Direct variable value
    if (this.variables.has(name)) {
      result = this.variables.get(name);
    }
    // Expression-based variable
    else if (this.expressions.has(name)) {
      const expression = this.expressions.get(name);
      result = this.evaluateExpression(expression);
    }
    // Undefined variable
    else {
      throw new Error(`Variable '${name}' is not defined`);
    }

    // Cache the result
    this.evaluationCache.set(name, result);
    return result;
  }

  /**
   * Evaluate a mathematical expression string
   * @param {string} expression - Expression to evaluate
   * @returns {number} - Evaluated result
   */
  evaluateExpression(expression) {
    try {
      // Replace variables with their values
      let processedExpression = this.substituteVariables(expression);
      
      // Replace ^ with ** for JavaScript exponentiation
      processedExpression = processedExpression.replace(/\^/g, '**');
      
      // Validate the expression contains only allowed characters
      if (!/^[0-9+\-*/.() \t**]+$/.test(processedExpression)) {
        throw new Error(`Invalid characters in expression: ${expression}`);
      }

      // Use Function constructor for safer evaluation than eval
      const func = new Function('return ' + processedExpression);
      const result = func();

      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error(`Expression evaluation resulted in invalid number: ${expression}`);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to evaluate expression '${expression}': ${error.message}`);
    }
  }

  /**
   * Substitute variables in an expression with their evaluated values
   * @param {string} expression - Expression containing variables
   * @returns {string} - Expression with variables substituted
   */
  substituteVariables(expression) {
    let result = expression;
    
    // Find all variable references (letters followed by optional letters/numbers)
    const variableMatches = expression.match(/[a-zA-Z][a-zA-Z0-9]*/g);
    
    if (variableMatches) {
      const uniqueVars = [...new Set(variableMatches)];
      
      for (const varName of uniqueVars) {
        const value = this.evaluate(varName);
        // Replace all instances of this variable with its value
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        result = result.replace(regex, value.toString());
      }
    }
    
    return result;
  }

  /**
   * Check if adding an expression would create a circular dependency
   * @param {string} name - Variable name being defined
   * @param {string} expression - Expression being assigned
   * @returns {boolean} - True if circular dependency would be created
   */
  wouldCreateCircularDependency(name, expression) {
    const dependencies = this.getExpressionDependencies(expression);
    return this.hasCircularDependency(name, dependencies, new Set());
  }

  /**
   * Get all variable dependencies from an expression
   * @param {string} expression - Expression to analyze
   * @returns {Set<string>} - Set of variable names referenced
   */
  getExpressionDependencies(expression) {
    const matches = expression.match(/[a-zA-Z][a-zA-Z0-9]*/g);
    return new Set(matches || []);
  }

  /**
   * Recursively check for circular dependencies
   * @param {string} targetVar - Variable we're checking for cycles
   * @param {Set<string>} dependencies - Current dependencies to check
   * @param {Set<string>} visited - Variables already visited in this path
   * @returns {boolean} - True if circular dependency exists
   */
  hasCircularDependency(targetVar, dependencies, visited) {
    for (const dep of dependencies) {
      if (dep === targetVar) {
        return true; // Direct circular dependency
      }
      
      if (visited.has(dep)) {
        continue; // Already checked this path
      }
      
      if (this.expressions.has(dep)) {
        visited.add(dep);
        const subDeps = this.getExpressionDependencies(this.expressions.get(dep));
        if (this.hasCircularDependency(targetVar, subDeps, visited)) {
          return true;
        }
        visited.delete(dep);
      }
    }
    
    return false;
  }

  /**
   * Clear the evaluation cache
   */
  clearCache() {
    this.evaluationCache.clear();
  }

  /**
   * Get all defined variables and their current values
   * @returns {Object} - Object containing all variables and their values
   */
  getAllVariables() {
    const result = {};
    
    // Direct variables
    for (const [name, value] of this.variables) {
      result[name] = value;
    }
    
    // Expression-based variables
    for (const [name] of this.expressions) {
      try {
        result[name] = this.evaluate(name);
      } catch (error) {
        result[name] = `Error: ${error.message}`;
      }
    }
    
    return result;
  }

  /**
   * Get the definition (value or expression) for a variable
   * @param {string} name - Variable name
   * @returns {string} - Human-readable definition
   */
  getDefinition(name) {
    if (this.variables.has(name)) {
      return `${name} = ${this.variables.get(name)}`;
    } else if (this.expressions.has(name)) {
      return `${name} = ${this.expressions.get(name)}`;
    } else {
      return `${name} is not defined`;
    }
  }

  /**
   * Clear all variables and expressions
   */
  clear() {
    this.variables.clear();
    this.expressions.clear();
    this.clearCache();
    console.log('All variables and expressions cleared');
  }

  /**
   * Get dependency graph for debugging
   * @returns {Object} - Dependency relationships
   */
  getDependencyGraph() {
    const graph = {};
    
    for (const [name, expression] of this.expressions) {
      graph[name] = Array.from(this.getExpressionDependencies(expression));
    }
    
    return graph;
  }
}

// Export for use in other modules
window.ExpressionEvaluator = ExpressionEvaluator;

// Create a global instance for easy access
window.expressionEvaluator = new ExpressionEvaluator();

// Example usage and demonstrations
function demonstrateExpressionEvaluator() {
  console.log('=== Expression Evaluator Demonstration ===');
  
  const evaluator = new ExpressionEvaluator();
  
  try {
    // Basic variable definition
    console.log('\n1. Basic Variable Definition:');
    evaluator.defineVariable('a', 5);
    evaluator.defineVariable('b', 3);
    console.log(`a = ${evaluator.evaluate('a')}`); // 5
    console.log(`b = ${evaluator.evaluate('b')}`); // 3
    
    // Expression-based variables
    console.log('\n2. Expression-based Variables:');
    evaluator.defineExpression('c', 'a * b');
    evaluator.defineExpression('d', 'c + a');
    console.log(`c = a * b = ${evaluator.evaluate('c')}`); // 15
    console.log(`d = c + a = ${evaluator.evaluate('d')}`); // 20
    
    // Complex expressions
    console.log('\n3. Complex Expressions:');
    evaluator.defineExpression('e', '(a + b) * 2');
    evaluator.defineExpression('f', 'a^2 + b^2');
    console.log(`e = (a + b) * 2 = ${evaluator.evaluate('e')}`); // 16
    console.log(`f = a^2 + b^2 = ${evaluator.evaluate('f')}`); // 34
    
    // Dynamic updates
    console.log('\n4. Dynamic Updates:');
    console.log('Before update - c =', evaluator.evaluate('c')); // 15
    evaluator.defineVariable('a', 10); // Change a from 5 to 10
    console.log('After updating a to 10 - c =', evaluator.evaluate('c')); // 30
    console.log('After updating a to 10 - d =', evaluator.evaluate('d')); // 40
    
    // Show all variables
    console.log('\n5. All Variables:');
    console.log(evaluator.getAllVariables());
    
    // Error handling examples
    console.log('\n6. Error Handling:');
    
    try {
      evaluator.evaluate('undefined_var');
    } catch (error) {
      console.log('Error - Undefined variable:', error.message);
    }
    
    try {
      evaluator.defineExpression('circular1', 'circular2 + 1');
      evaluator.defineExpression('circular2', 'circular1 + 1');
    } catch (error) {
      console.log('Error - Circular dependency:', error.message);
    }
    
    try {
      evaluator.defineExpression('invalid', 'a + invalid_function()');
      evaluator.evaluate('invalid');
    } catch (error) {
      console.log('Error - Invalid expression:', error.message);
    }
    
  } catch (error) {
    console.error('Demonstration error:', error);
  }
}

// Run demonstration when this file is loaded
if (typeof window !== 'undefined') {
  // Browser environment - run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demonstrateExpressionEvaluator);
  } else {
    demonstrateExpressionEvaluator();
  }
} else {
  // Node.js environment - run immediately
  demonstrateExpressionEvaluator();
}