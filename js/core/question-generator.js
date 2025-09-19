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

    // Generate answer
    let answer = "";
    if (question.answerFormula) {
      answer = window.QuestionUtils.evaluateAnswerFormula(question.answerFormula, variables);
    } else if (question.answer) {
      answer = window.QuestionUtils.replaceTemplateVariables(question.answer, variables);
      
      // Evaluate any remaining expressions in the answer
      answer = answer.replace(/\{([^}]+)\}/g, (match, expr) => {
        try {
          return window.QuestionUtils.evaluateAnswerFormula(expr, variables);
        } catch (e) {
          return match;
        }
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