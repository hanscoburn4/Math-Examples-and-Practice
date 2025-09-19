/**
 * Main Assessment Builder application controller
 */

class AssessmentBuilder {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log("Initializing Assessment Builder...");
      
      // Load question bank
      const loaded = await window.QuestionGenerator.loadQuestionBank();
      if (!loaded) {
        throw new Error("Failed to load question bank");
      }

      // Initialize UI
      window.UIManager.populateCourses();
      
      this.initialized = true;
      console.log("Assessment Builder initialized successfully");
      
    } catch (error) {
      console.error("Failed to initialize Assessment Builder:", error);
      this.showError("Failed to initialize the application. Please refresh the page.");
    }
  }

  /**
   * Show error message to user
   */
  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 8px;
      margin: 20px;
      border: 1px solid #f5c6cb;
    `;
    errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      questionBankLoaded: Object.keys(window.QuestionGenerator.questionBank).length > 0,
      selectedQuestions: window.UIManager.selectedQuestions.length
    };
  }
}

window.AssessmentBuilder = new AssessmentBuilder();