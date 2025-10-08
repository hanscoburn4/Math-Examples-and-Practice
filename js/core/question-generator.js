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
   * Updated to handle LaTeX exponents and expression evaluation
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
    questionText = questionText.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
      return `${base}^{${exp}}`;
    });

    // Generate answer
    let answer = "";
    if (question.answerExpression) {
      try {
        if (question.answerExpression.includes('\\') || question.answerExpression.includes('^{')) {
          answer = window.QuestionUtils.replaceTemplateVariables(question.answerExpression, variables);
        } else {
          answer = window.QuestionUtils.evaluateMathExpression(question.answerExpression, variables);
          answer = answer.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
            return `${base}^{${exp}}`;
          });
        }
      } catch (e) {
        console.error(`Failed to evaluate answerExpression "${question.answerExpression}" with variables:`, variables, e);
        answer = "Error evaluating answer expression";
      }
    } else if (question.answerFormula) {
      console.warn(`Question ${question.id} uses deprecated 'answerFormula'. Please update to 'answerExpression'.`);
      try {
        if (question.answerFormula.includes('\\') || question.answerFormula.includes('^{')) {
          answer = window.QuestionUtils.replaceTemplateVariables(question.answerFormula, variables);
        } else {
          answer = window.QuestionUtils.evaluateMathExpression(question.answerFormula, variables);
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
      
      // Evaluate single-brace expressions { ... }
      answer = answer.replace(/\{([^}]+)\}/g, (match, expr) => {
        try {
          const cleanExpr = expr.trim();
          if (cleanExpr.includes('\\') || cleanExpr.includes('^{')) {
            return cleanExpr; // treat as literal LaTeX
          } else {
            return window.QuestionUtils.evaluateMathExpression(cleanExpr, variables);
          }
        } catch (e) {
          console.error(`Failed to evaluate expression in answer: "${expr}" with variables:`, variables, e);
          return match;
        }
      });
      
      // Evaluate double-brace expressions {{ ... }}
      answer = answer.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
        try {
          const cleanExpr = expr.trim();
          return window.QuestionUtils.evaluateMathExpression(cleanExpr, variables);
        } catch (e) {
          console.error(`Failed to evaluate double-brace expression: "${expr}" with variables:`, variables, e);
          return match;
        }
      });

      // Ensure exponents are wrapped properly for MathJax
      answer = answer.replace(/([a-zA-Z0-9\)\]])\^(-?\d+)/g, (_, base, exp) => {
        return `${base}^{${exp}}`;
      });
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
