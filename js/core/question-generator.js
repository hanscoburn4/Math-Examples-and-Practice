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
   * Updated to use math.js instead of answerFormula
   */
  generateQuestion(template) {
    // Deep clone the template
    const question = JSON.parse(JSON.stringify(template));
    
    // Generate variables
    const variables = window.QuestionUtils.generateQuestionVariables(question);
    
    // Replace variables in question text
    let questionText = window.QuestionUtils.replaceTemplateVariables(
      question.question || "", 
      variables
    );

    // Wrap exponents in questionText for proper MathJax rendering
    // Matches things like x^12, y^3, (ab)^10, 5^4 etc.
    questionText = questionText.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
      return `${base}^{${exp}}`;
    });

    // Generate answer using math.js expressions
    let answer = "";
    if (question.answerExpression) {
      try {
        // Check if answerExpression contains LaTeX syntax
        if (question.answerExpression.includes('\\') || question.answerExpression.includes('^{')) {
          // Treat as literal LaTeX string for display
          answer = window.QuestionUtils.replaceTemplateVariables(question.answerExpression, variables);
        } else {
          answer = window.QuestionUtils.evaluateMathExpression(question.answerExpression, variables);
          // Wrap all exponents (any base) so MathJax renders correctly
          answer = answer.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
            return `${base}^{${exp}}`;
          });
        }
      } catch (e) {
        console.error(`Failed to evaluate answerExpression "${question.answerExpression}" with variables:`, variables, e);
        answer = "Error evaluating answer expression";
      }
    } else if (question.answerFormula) {
      // Legacy support for old answerFormula - convert to answerExpression
      console.warn(`Question ${question.id} uses deprecated 'answerFormula'. Please update to 'answerExpression'.`);
      try {
        // Check if answerFormula contains LaTeX syntax
        if (question.answerFormula.includes('\\') || question.answerFormula.includes('^{')) {
          // Treat as literal LaTeX string for display
          answer = window.QuestionUtils.replaceTemplateVariables(question.answerFormula, variables);
        } else {
          answer = window.QuestionUtils.evaluateMathExpression(question.answerFormula, variables);
          // Wrap all exponents (any base) so MathJax renders correctly
          answer = answer.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
            return `${base}^{${exp}}`;
          });
        }
      } catch (e) {
        console.error(`Failed to evaluate legacy answerFormula "${question.answerFormula}" with variables:`, variables, e);
        answer = "Error evaluating answer formula";
      }
    } else if (question.answer) {
      answer = window.QuestionUtils.replaceTemplateVariables(question.answer, variables);
      
      // Evaluate any remaining expressions in the answer
      answer = answer.replace(/\{([^}]+)\}/g, (match, expr) => {
        try {
          // Trim whitespace and ensure we only pass the inner content
          const cleanExpr = expr.trim();
          // Check if expression contains LaTeX syntax
          if (cleanExpr.includes('\\') || cleanExpr.includes('^{')) {
            // Return as-is for LaTeX expressions
            return cleanExpr;
          } else {
            return window.QuestionUtils.evaluateMathExpression(cleanExpr, variables);
          }
        } catch (e) {
          console.error(`Failed to evaluate expression in answer: "${cleanExpr}" in answer with variables:`, variables, e);
          return match;
        }
      });
      // Only wrap exponents if not already formatted as MathJax block
      if (!answer.includes('\\(') && !answer.includes('\\)')) {
        // Wrap all exponents (any base) so MathJax renders correctly
        answer = answer.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
          return `${base}^{${exp}}`;
        });
      }
    }

    return {
      ...question,
      questionText,
      answer,
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
    return Array.from(objectives).sort();
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