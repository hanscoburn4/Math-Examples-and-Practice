/**
 * Core question generation and template processing
 *
 * This file preserves the original question-text formatting behaviour you used,
 * but makes the answer processing safe (evaluates expressions) while protecting LaTeX.
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
   * Unified text processing used for both question and answer text.
   *
   * - formattedVarsFirst: apply the {var|option} handler first (keeps your original behaviour)
   * - then call the standard replaceTemplateVariables to substitute remaining placeholders
   * - finally, wrap simple exponents for MathJax rendering
   * - expression evaluation step has been removed for question text to preserve original behaviour
   * - for answer text, expression evaluation is done in generateQuestion()
   * - This keeps question rendering unchanged while making answers safe and computed.
   */
  processTemplateText(text, variables, { evaluateExpressions = false } = {}) {
    if (!text) return "";

    let result = text;

    // Step 1: Handle formatted variable patterns {var|option1|option2|...}
    // This is the same unified pattern handler you had previously.
    result = result.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)(\|[a-zA-Z0-9:_-]+)*\}/g, (match, varName, opts) => {
      const value = variables[varName];
      if (value === undefined || value === null) return match;

      const options = opts ? opts.slice(1).split('|') : [];

      // Direct combined version {a|signedCoef}
      if (options.includes('signedCoef')) {
        if (value === 0) return '+0';
        const sign = value >= 0 ? '+' : '-';
        const coef = Math.abs(value) === 1 ? '' : Math.abs(value).toString();
        return `${sign}${coef}`;
      }

      // handle normal sign/coef combos
      const useSign = options.includes('sign');
      const useCoef = options.includes('coef');

      let sign = '';
      let coef = '';

      if (useSign) {
        sign = value >= 0 ? '+' : '-';
      } else if (value < 0) {
        sign = '-';
      }

      const absVal = Math.abs(value);

      if (useCoef) {
        if (absVal === 1) coef = ''; // omit 1
        else coef = String(absVal);
      } else {
        coef = String(absVal);
      }

      return `${sign}${coef}`;
    });

    // Step 2: Replace remaining simple {variable} placeholders using your existing util
    // This handles numeric selection, choices, etc.
    result = window.QuestionUtils.replaceTemplateVariables(result, variables);

    // Step 3: was optional so it has been removed

    // Step 4: Wrap simple exponents for MathJax rendering (x^2 -> x^{2})
    // This intentionally only matches plain ^number occurrences (not inside LaTeX commands)
    result = result.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
      return `${base}^{${exp}}`;
    });

    return result;
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
      if (filters.objective && question.objective !== filters.objective) {
        return false;
      }
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false;
      }
      return true;
    });
  }

  /**
   * Generate a question instance from a template
   *
   * Behavior:
   * - questionText uses the original question-style pipeline (no expression evaluation)
   * - answerText uses the same pipeline but with evaluateExpressions=true (so {x+2} in answers is computed)
   *
   * This keeps your question rendering exactly as before while making answers safer and computed.
   * If you truly want identical pipelines for question and answer (including expression evaluation),
   * change the evaluateExpressions flag below for questionText.
   */
  generateQuestion(template) {
    // Deep clone the template
    const question = JSON.parse(JSON.stringify(template));

    // Generate variables
    const variables = window.QuestionUtils.generateQuestionVariables(question);

    // QUESTION: use original-style processing (no expression evaluation)
    const questionText = this.processTemplateText(question.question || "", variables, { evaluateExpressions: false });

    // ANSWER: use same processing but evaluate expressions (so answers like {x+2} are computed)
    const answerText = this.processTemplateText(question.answer || "", variables, { evaluateExpressions: true });

    return {
      ...question,
      questionText,
      answer: answerText,
      variables,
      generatedAt: new Date().toISOString()
    };
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
