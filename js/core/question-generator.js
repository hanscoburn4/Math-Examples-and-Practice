/**
 * Core question generation and template processing
 */

class QuestionGenerator {
  constructor() {
    this.questionBank = {};
  }

  /**
   * Load question bank from JSON file
   */
  async loadQuestionBank() {
    try {
      const response = await fetch('src/data/question_bank.json');
      this.questionBank = await response.json();
      return true;
    } catch (error) {
      console.error("Failed to load question bank:", error);
      this.questionBank = {};
      return false;
    }
  }

  /**
   * Apply unified text processing: variable replacement, formatting, expression evaluation, and exponent wrapping
   * This is the core function used for both questions and answers
   */
  processTemplateText(text, variables) {
    if (!text) return "";

    let result = text;

    // Step 1: Handle formatted variable patterns {var|option1|option2|...}
    result = this.processFormattedVariables(result, variables);

    // Step 2: Replace remaining simple {variable} placeholders
    result = window.QuestionUtils.replaceTemplateVariables(result, variables);

    // Step 3: Evaluate single-brace expressions { ... }
    result = result.replace(/\{([^}]+)\}/g, (match, expr) => {
      return this.evaluateExpressionInTemplate(expr, variables, match);
    });

    // Step 4: Evaluate double-brace expressions {{ ... }}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
      try {
        const cleanExpr = expr.trim();
        return window.QuestionUtils.evaluateMathExpression(cleanExpr, variables);
      } catch (e) {
        const availableVars = Object.keys(variables).join(', ');
        console.error(
          `Double-brace expression evaluation failed: "${expr}"\n` +
          `Available variables: ${availableVars}\n` +
          `Error: ${e.message}`
        );
        return match;
      }
    });

    // Step 5: Wrap exponents for MathJax rendering
    result = result.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
      return `${base}^{${exp}}`;
    });

    return result;
  }

  /**
   * Process formatted variable patterns like {var|sign}, {var|coef}, {var|signedCoef}, {var|decimal:2}, {var|fraction}
   * Supports flexible formatting options for both questions and answers
   */
  processFormattedVariables(text, variables) {
    return text.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)(\|[^}]*)*\}/g, (match, varName, opts) => {
      const value = variables[varName];
      if (value === undefined || value === null) return match;

      const options = opts ? opts.slice(1).split('|').filter(o => o) : [];

      return this.formatVariableValue(value, options);
    });
  }

  /**
   * Format a variable value based on specified formatting options
   * Supported options: sign, coef, signedCoef, decimal:n, fraction, percent
   */
  formatVariableValue(value, options = []) {
    // Handle {var|fraction}
    if (options.includes('fraction')) {
      try {
        const mathInstance = window.MathUtils.mathInstance;
        const fraction = mathInstance.fraction(value);
        const formatted = mathInstance.format(fraction);
        if (formatted.includes('/')) {
          const parts = formatted.split('/');
          return `\\frac{${parts[0]}}{${parts[1]}}`;
        }
        return formatted;
      } catch (e) {
        console.error(`Failed to format as fraction: ${value}`, e);
        return String(value);
      }
    }

    // Handle {var|decimal:n}
    const decimalMatch = options.find(o => o.startsWith('decimal:'));
    if (decimalMatch) {
      const precision = parseInt(decimalMatch.split(':')[1], 10);
      if (!isNaN(precision)) {
        return Number.isInteger(value) ? String(value) : value.toFixed(precision);
      }
    }

    // Handle {var|percent}
    if (options.includes('percent')) {
      const percent = value * 100;
      return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2)}%`;
    }

    // Handle {var|signedCoef} - shows sign and coefficient, omitting 1
    const useSignedCoef = options.includes('signedCoef');
    if (useSignedCoef) {
      if (value === 0) return '';
      const sign = value >= 0 ? '+' : '-';
      const coef = Math.abs(value) === 1 ? '' : Math.abs(value).toString();
      return `${sign}${coef}`;
    }

    // Handle {var|sign} and {var|coef} combinations
    const useSign = options.includes('sign');
    const useCoef = options.includes('coef');

    let sign = '';
    let coef = '';

    // Determine sign
    if (useSign) {
      sign = value >= 0 ? '+' : '-';
    } else if (value < 0) {
      sign = '-';
    }

    const absVal = Math.abs(value);

    // Determine coefficient
    if (useCoef) {
      if (absVal === 1) {
        coef = ''; // omit coefficient 1
      } else {
        coef = String(absVal);
      }
    } else {
      coef = String(absVal);
    }

    return `${sign}${coef}`;
  }

  /**
   * Evaluate a single expression within {braces} in template text
   * Returns the result or the original match if it's literal LaTeX
   */
  evaluateExpressionInTemplate(expr, variables, originalMatch) {
    try {
      const cleanExpr = expr.trim();
      // Treat expressions with LaTeX commands as literal
      if (cleanExpr.includes('\\') || cleanExpr.includes('^{')) {
        return cleanExpr;
      }
      return window.QuestionUtils.evaluateMathExpression(cleanExpr, variables);
    } catch (e) {
      const availableVars = Object.keys(variables).join(', ');
      console.error(
        `Template expression evaluation failed: "${expr}"\n` +
        `Available variables: ${availableVars}\n` +
        `Error: ${e.message}`
      );
      return originalMatch;
    }
  }

  /**
   * Get all courses
   */
  getCourses() {
    return Object.keys(this.questionBank);
  }

  /**
   * Get chapters for a course
   */
  getChapters(course) {
    return this.questionBank[course] ? Object.keys(this.questionBank[course]) : [];
  }

  /**
   * Get all questions from specified chapters
   */
  getQuestionsFromChapters(course, chapters) {
    if (!this.questionBank[course]) return [];

    return chapters.flatMap(chapter => 
      this.questionBank[course][chapter] || []
    );
  }

  /**
   * Filter questions by criteria
   */
  filterQuestions(questions, filters) {
    return questions.filter(question => {
      // Filter by objective
      if (filters.objective && question.objective !== filters.objective) {
        return false;
      }

      // Filter by difficulty
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false;
      }

      return true;
    });
  }

  /**
   * Generate a question instance from a template
   * Uses unified text processing for both question and answer text
   */
  generateQuestion(template) {
    try {
      const question = JSON.parse(JSON.stringify(template));

      const variables = window.QuestionUtils.generateQuestionVariables(question);

      const questionText = this.processTemplateText(question.question || "", variables);

      let answer = "";

      if (question.answer) {
        answer = this.processTemplateText(question.answer, variables);
      } else if (question.answerExpression) {
        answer = this.processTemplateText(question.answerExpression, variables);
      } else if (question.answerFormula) {
        console.warn(
          `Question ${question.id} uses deprecated 'answerFormula'. ` +
          `Please migrate to 'answer' field for consistent template processing.`
        );
        answer = this.processTemplateText(question.answerFormula, variables);
      }

      return {
        ...question,
        questionText,
        answer,
        variables,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(
        `Failed to generate question: ${template?.id || 'Unknown ID'}\n` +
        `Error: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Get unique objectives from questions
   */
  getObjectives(questions) {
    const objectives = new Set();
    questions.forEach(q => {
      if (q.objective) objectives.add(q.objective);
    });
    return Array.from(objectives);
  }

  /**
   * Get unique difficulties from questions
   */
  getDifficulties(questions) {
    const difficulties = new Set();
    questions.forEach(q => {
      if (q.difficulty) difficulties.add(q.difficulty);
    });
    return Array.from(difficulties).sort();
  }
}

window.QuestionGenerator = new QuestionGenerator();
