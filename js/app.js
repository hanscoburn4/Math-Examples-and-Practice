/**
 * Application entry point
 */

document.addEventListener("DOMContentLoaded", async function() {
  console.log("Assessment Builder starting up...");
  
  try {
    await window.AssessmentBuilder.init();
    console.log("Application ready!");
  } catch (error) {
    console.error("Application startup failed:", error);
  }
});

// Global error handler for debugging
window.addEventListener("error", function(event) {
  console.error("Global error:", event.error);
});

// For development - expose API to console
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  window.dev = {
    questionGenerator: window.QuestionGenerator,
    uiManager: window.UIManager,
    assessmentBuilder: window.AssessmentBuilder,
    mathUtils: window.MathUtils,
    questionUtils: window.QuestionUtils,
    drawingEngine: window.DrawingEngine
  };
  
  console.log("Development mode: window.dev object available for debugging");
}