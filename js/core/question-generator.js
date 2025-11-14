/**
 * Core question generation and template processing
 */
class QuestionGenerator {
  constructor() {
    this.questionBank = {};
  }

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
   * Unified text processing – now correctly uses __display for plain {var}
   * and evaluates {expression} when evaluateExpressions===true
   */
  processTemplateText(text, variables, { evaluateExpressions = false } = {}) {
    if (!text) return "";

    let result = text;

    /* --------------------------------------------------------------
       Step 1 – {var|option…}  (your original formatter)
       -------------------------------------------------------------- */
    result = result.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)(\|[a-zA-Z0-9:_-]+)*\}/g, (match, varName, opts) => {
      const value = variables[varName];
      if (value === undefined || value === null) return match;

      const options = opts ? opts.slice(1).split('|') : [];

      if (options.includes('signedCoef')) {
        if (value === 0) return '+0';
        const sign = value >= 0 ? '+' : '-';
        const coef = Math.abs(value) === 1 ? '' : Math.abs(value).toString();
        return `${sign}${coef}`;
      }

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
        coef = absVal === 1 ? '' : String(absVal);
      } else {
        coef = String(absVal);
      }

      return `${sign}${coef}`;
    });

    /* --------------------------------------------------------------
       Step 2 – plain {var}  and  {expression}
       -------------------------------------------------------------- */
    if (evaluateExpressions) {
      // evaluate any {…} that is NOT already handled by Step 1
      result = result.replace(/\{([^{}]+)\}/g, (match, inner) => {
        const trimmed = inner.trim();

        // 1. skip anything that still contains a pipe (already processed)
        if (trimmed.includes('|')) return match;

        // 2. simple variable name → use __display if it exists
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
          const display = variables.__display?.[trimmed];
          if (display !== undefined && display !== '') return display;
          return String(variables[trimmed] ?? match);
        }

        // 3. otherwise treat as a math expression
        return window.QuestionUtils.evaluateMathExpression(trimmed, variables);
      });
    } else {
      // original behaviour – just replace {var}
      result = window.QuestionUtils.replaceTemplateVariables(result, variables);
    }

    /* --------------------------------------------------------------
       Step 3 – wrap simple exponents x^2 → x^{2}
       -------------------------------------------------------------- */
    result = result.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
      return `${base}^{${exp}}`;
    });

    return result;
  }

  /* -----------------------------------------------------------------
     The rest of the class is unchanged – only the method above matters
     ----------------------------------------------------------------- */
  getCourses() {
    return Object.keys(this.questionBank);
  }

  getChapters(course) {
    return this.questionBank[course] ? Object.keys(this.questionBank[course]) : [];
  }

  getQuestionsFromChapters(course, chapters) {
    if (!this.questionBank[course]) return [];
    return chapters.flatMap(chapter =>
      this.questionBank[course][chapter] || []
    );
  }

  filterQuestions(questions, filters) {
    return questions.filter(question => {
      if (filters.objective && question.objective !== filters.objective) return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      return true;
    });
  }

  generateQuestion(template) {
    const question = JSON.parse(JSON.stringify(template));
    const variables = window.QuestionUtils.generateQuestionVariables(question);

    const questionText = this.processTemplateText(question.question || "", variables, { evaluateExpressions: false });
    const answerText   = this.processTemplateText(question.answer   || "", variables, { evaluateExpressions: false });

    return {
      ...question,
      questionText,
      answer: answerText,
      variables,
      generatedAt: new Date().toISOString()
    };
  }

  getObjectives(questions) {
    const set = new Set();
    questions.forEach(q => q.objective && set.add(q.objective));
    return Array.from(set);
  }

  getDifficulties(questions) {
    const set = new Set();
    questions.forEach(q => q.difficulty && set.add(q.difficulty));
    return Array.from(set).sort();
  }
}

window.QuestionGenerator = new QuestionGenerator();
