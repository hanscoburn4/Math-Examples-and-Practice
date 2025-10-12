/**
 * UI management and event handling
 */

class UIManager {
  constructor() {
    this.selectedQuestions = [];
    this.showAnswers = false;
    this.customTitle = "SMWYK - Name: ____________";
    this.questionColumns = 1;
    this.questionSpacing = 20;
    this.currentLoadedQuestions = [];
    this.addAllButtonTop = null;
    this.bindEvents();
  }

  /**
   * Bind all UI events
   */
  bindEvents() {
    // Course selection
    document.getElementById("courseSelect").addEventListener("change", () => {
      this.onCourseChange();
    });

    // Objective selection
    document.getElementById("objectiveSelect").addEventListener("change", () => {
      this.clearQuestionList();
    });

    // Button events
    document.getElementById("loadQuestions").addEventListener("click", () => {
      this.loadQuestions();
    });

    // Add All button (top menu)
    this.addAllButtonTop = document.getElementById("addAllQuestionsTop");
    this.addAllButtonTop.addEventListener("click", () => {
      this.addAllQuestions(this.currentLoadedQuestions);
    });

    document.getElementById("clearSelection").addEventListener("click", () => {
      this.clearPreview();
    });

    document.getElementById("generateAssignment").addEventListener("click", () => {
      this.generateAssignment();
    });

    document.getElementById("editButton").addEventListener("click", () => {
      this.editAssignment();
    });

    // Custom title input
    document.getElementById("customTitle").addEventListener("input", (e) => {
      this.customTitle = e.target.value || "SMWYK - Name: ____________";
      this.updateDisplayedTitle();
    });

    // Layout controls
    document.querySelectorAll('input[name="questionColumns"]').forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.questionColumns = parseInt(e.target.value);
      });
    });

    document.getElementById("questionSpacing").addEventListener("input", (e) => {
      // Convert px input to pt for print consistency (1px ≈ 0.75pt)
      this.questionSpacing = Math.round(parseInt(e.target.value) * 0.75);
    });
  }

  /**
   * Handle course selection change
   */
  onCourseChange() {
    const course = document.getElementById("courseSelect").value;
    this.buildChapterCheckboxes(course);
    this.populateObjectives();
    this.populateDifficultyOptions();
    this.clearQuestionList();
  }

  /**
   * Populate course dropdown
   */
  populateCourses() {
    const courseSelect = document.getElementById("courseSelect");
    courseSelect.innerHTML = "";

    const courses = window.QuestionGenerator.getCourses();
    
    if (courses.length === 0) {
      courseSelect.innerHTML = "<option value=''>No courses available</option>";
      return;
    }

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "(select course)";
    courseSelect.appendChild(defaultOption);

    // Add course options
    courses.forEach(course => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      courseSelect.appendChild(option);
    });

    // Auto-select first course
    if (courses.length > 0) {
      courseSelect.value = courses[0];
      this.onCourseChange();
    }
  }

  /**
   * Build chapter checkboxes
   */
  buildChapterCheckboxes(course) {
    const container = document.getElementById("chapterContainer");
    container.innerHTML = "";

    if (!course) {
      container.innerHTML = "<div class='muted'>Select a course first</div>";
      return;
    }

    const chapters = window.QuestionGenerator.getChapters(course);
    
    if (chapters.length === 0) {
      container.innerHTML = "<div class='muted'>No chapters available</div>";
      return;
    }

    chapters.forEach(chapter => {
      const label = document.createElement("label");
      label.className = "chapter-checkbox";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = chapter;
      checkbox.checked = false;
      checkbox.addEventListener("change", () => {
        this.populateObjectives();
        this.populateDifficultyOptions();
        this.clearQuestionList();
      });

      const span = document.createElement("span");
      span.textContent = chapter;

      label.appendChild(checkbox);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  /**
   * Get selected chapters
   */
  getSelectedChapters() {
    return Array.from(document.querySelectorAll("#chapterContainer input[type=checkbox]:checked"))
      .map(cb => cb.value);
  }

  /**
   * Populate objectives dropdown
   */
  populateObjectives() {
    const objectiveSelect = document.getElementById("objectiveSelect");
    objectiveSelect.innerHTML = "";

    const course = document.getElementById("courseSelect").value;
    const chapters = this.getSelectedChapters();

    if (!course || chapters.length === 0) {
      objectiveSelect.innerHTML = "<option value=''>(select course & chapters)</option>";
      return;
    }

    const questions = window.QuestionGenerator.getQuestionsFromChapters(course, chapters);
    const objectives = window.QuestionGenerator.getObjectives(questions);

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "(any objective)";
    objectiveSelect.appendChild(defaultOption);

    // Add objective options
    objectives.forEach(objective => {
      const option = document.createElement("option");
      option.value = objective;
      option.textContent = objective;
      objectiveSelect.appendChild(option);
    });
  }

  /**
   * Populate difficulty dropdown
   */
  populateDifficultyOptions() {
    const difficultySelect = document.getElementById("difficultySelect");
    difficultySelect.innerHTML = "";

    const course = document.getElementById("courseSelect").value;
    const chapters = this.getSelectedChapters();
    const objective = document.getElementById("objectiveSelect").value;

    if (!course || chapters.length === 0) {
      difficultySelect.innerHTML = "<option value=''>(any)</option>";
      return;
    }

    let questions = window.QuestionGenerator.getQuestionsFromChapters(course, chapters);
    
    if (objective) {
      questions = questions.filter(q => q.objective === objective);
    }

    const difficulties = window.QuestionGenerator.getDifficulties(questions);

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "(any)";
    difficultySelect.appendChild(defaultOption);

    // Add difficulty options
    difficulties.forEach(difficulty => {
      const option = document.createElement("option");
      option.value = difficulty;
      option.textContent = difficulty;
      difficultySelect.appendChild(option);
    });
  }

  /**
   * Load and display filtered questions
   */
  loadQuestions() {
    const course = document.getElementById("courseSelect").value;
    const chapters = this.getSelectedChapters();
    const objective = document.getElementById("objectiveSelect").value;
    const difficulty = document.getElementById("difficultySelect").value;

    const questionList = document.getElementById("questionList");
    questionList.innerHTML = "";

    if (!course || chapters.length === 0) {
      questionList.innerHTML = "<div class='muted'>Select a course and at least one chapter.</div>";
      return;
    }

    // Get questions
    let questions = window.QuestionGenerator.getQuestionsFromChapters(course, chapters);
    
    // Apply filters
    questions = window.QuestionGenerator.filterQuestions(questions, { objective, difficulty });

    // Store current loaded questions for the Add All button
    this.currentLoadedQuestions = questions;

    if (questions.length === 0) {
      questionList.innerHTML = "<div class='muted'>No questions match the current filters.</div>";
      this.addAllButtonTop.classList.add("hidden");
      return;
    }

    // Update and show the Add All button in top menu
    this.addAllButtonTop.textContent = `Add All ${questions.length} Questions`;
    this.addAllButtonTop.classList.remove("hidden");

    // Display questions
    questions.forEach(question => {
      const questionItem = this.createQuestionItem(question);
      questionList.appendChild(questionItem);
    });
  }

  /**
   * Create a question item element
   */
  createQuestionItem(question) {
    const item = document.createElement("div");
    item.className = "question-item";

    const info = document.createElement("div");
    
    const difficultyClass = `difficulty-${question.difficulty || 'basic'}`;
    
    info.innerHTML = `
      <div class="objective-header">${question.id || 'Unknown ID'}</div>
      <div class="muted">
        ${question.objective || 'No objective'} • 
        <span class="difficulty-badge ${difficultyClass}">${question.difficulty || 'basic'}</span>
      </div>
      <div style="margin-top: 8px;">${question.question || 'No question text'}</div>
    `;

    const controls = document.createElement("div");
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.className = "small";
    addButton.addEventListener("click", () => {
      this.addQuestionToPreview(question);
    });

    controls.appendChild(addButton);
    item.appendChild(info);
    item.appendChild(controls);

    return item;
  }

  /**
   * Add question to preview
   */
  addQuestionToPreview(question) {
    // Create a deep copy
    const copy = JSON.parse(JSON.stringify(question));
    this.selectedQuestions.push(copy);
    this.renderPreview();
  }

  /**
   * Add all questions to preview
   */
  addAllQuestions(questions) {
    questions.forEach(question => {
      const copy = JSON.parse(JSON.stringify(question));
      this.selectedQuestions.push(copy);
    });
    this.renderPreview();
  }

  /**
   * Clear preview
   */
  clearPreview() {
    this.selectedQuestions = [];
    this.renderPreview();
  }

  /**
   * Render preview section
   */
  renderPreview() {
    const preview = document.getElementById("assignmentPreview");
    preview.innerHTML = "";

    if (this.selectedQuestions.length === 0) {
      preview.innerHTML = "<div class='muted'>No questions selected yet. Use 'Add' button on questions to build your assignment.</div>";
      return;
    }

    // Make preview container sortable
    preview.style.position = "relative";

    this.selectedQuestions.forEach((question, index) => {
      const previewItem = this.createPreviewItem(question, index);
      preview.appendChild(previewItem);
    });

    // Initialize drag and drop functionality
    this.initializeDragAndDrop();
  }

  /**
   * Create preview item element
   */
  createPreviewItem(question, index) {
    const item = document.createElement("div");
    item.className = "preview-item draggable";
    item.draggable = true;
    item.dataset.index = index;

    const info = document.createElement("div");
    const difficultyClass = `difficulty-${question.difficulty || 'basic'}`;
    
    // Add drag handle
    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    dragHandle.innerHTML = "⋮⋮";
    dragHandle.style.cssText = `
      cursor: grab;
      color: #95a5a6;
      font-size: 16px;
      font-weight: bold;
      margin-right: 10px;
      user-select: none;
      line-height: 1;
    `;
    
    info.innerHTML = `
      <div><strong>${index + 1}. ${question.id || 'Unknown ID'}</strong></div>
      <div class="muted">
        ${question.objective || 'No objective'} • 
        <span class="difficulty-badge ${difficultyClass}">${question.difficulty || 'basic'}</span>
      </div>
    `;

    const leftSection = document.createElement("div");
    leftSection.style.display = "flex";
    leftSection.style.alignItems = "center";
    leftSection.appendChild(dragHandle);
    leftSection.appendChild(info);

    const controls = document.createElement("div");
    
    const duplicateBtn = document.createElement("button");
    duplicateBtn.textContent = "Duplicate";
    duplicateBtn.className = "small";
    duplicateBtn.addEventListener("click", () => {
      const copy = JSON.parse(JSON.stringify(question));
      this.selectedQuestions.splice(index + 1, 0, copy);
      this.renderPreview();
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "small";
    removeBtn.style.marginLeft = "5px";
    removeBtn.addEventListener("click", () => {
      this.selectedQuestions.splice(index, 1);
      this.renderPreview();
    });

    controls.appendChild(duplicateBtn);
    controls.appendChild(removeBtn);
    item.appendChild(leftSection);
    item.appendChild(controls);

    return item;
  }

  /**
   * Initialize drag and drop functionality for preview items
   */
  initializeDragAndDrop() {
    const preview = document.getElementById("assignmentPreview");
    let draggedElement = null;
    let draggedIndex = null;

    // Add event listeners to all draggable items
    const draggableItems = preview.querySelectorAll('.draggable');
    
    draggableItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedElement = item;
        draggedIndex = parseInt(item.dataset.index);
        item.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', (e) => {
        item.style.opacity = '1';
        draggedElement = null;
        draggedIndex = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== item) {
          const targetIndex = parseInt(item.dataset.index);
          this.reorderQuestions(draggedIndex, targetIndex);
        }
      });
    });
  }

  /**
   * Reorder questions in the selected questions array
   */
  reorderQuestions(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    // Remove the item from its current position
    const movedQuestion = this.selectedQuestions.splice(fromIndex, 1)[0];
    
    // Insert it at the new position
    this.selectedQuestions.splice(toIndex, 0, movedQuestion);
    
    // Re-render the preview to update indices
    this.renderPreview();
  }

  /**
   * Generate final assignment
   */
  generateAssignment() {
    if (this.selectedQuestions.length === 0) {
      alert("Please add at least one question to the preview before generating.");
      return;
    }

    this.displayFinalAssignment();
    
    // Hide builder controls
    document.getElementById("builderSection").classList.add("hidden");
    document.getElementById("questionList").classList.add("hidden");
    document.getElementById("assignmentPreview").classList.add("hidden");
    
    // Hide layout controls
    document.querySelector(".layout-controls").classList.add("hidden");
    
    // Hide title input section
    document.querySelector(".title-input-section").classList.add("hidden");
    
    // Show edit button
    document.getElementById("editSection").classList.remove("hidden");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Draw all graphs in the final assignment
    const canvases = document.querySelectorAll("#output canvas");
    canvases.forEach(canvas => {
      const questionIndex = Array.from(canvases).indexOf(canvas);
      const question = this.selectedQuestions[questionIndex];
      if (question && question.draw) {
        window.DrawingEngine.drawCoordinateGrid(
          canvas.getContext("2d"), canvas.width, canvas.height
        );
        window.DrawingEngine.draw(canvas, question.draw, question.variables);
      }
    });
  }

  /**
   * Toggle answer key visibility
   */
  toggleAnswerKey() {
    this.showAnswers = !this.showAnswers;
    const answersSection = document.querySelector(".answers");
    const toggleButton = document.getElementById("toggleAnswers");
    
    if (answersSection) {
      answersSection.style.display = this.showAnswers ? "block" : "none";
      toggleButton.textContent = this.showAnswers ? "Hide Answer Key" : "Show Answer Key";
    }
  }

  /**
   * Update the displayed title
   */
  updateDisplayedTitle() {
    const titleElement = document.getElementById("displayTitle");
    if (titleElement) {
      titleElement.textContent = this.customTitle;
    }
  }

  /**
   * Display final assignment with questions and answers
   */
  displayFinalAssignment() {
    const output = document.getElementById("output");
    output.innerHTML = "";

    // Apply layout settings
    output.className = `columns-${this.questionColumns}`;
    output.style.setProperty('--question-spacing', `${this.questionSpacing}pt`);

    const answers = [];

    // Add custom title
    const titleDiv = document.createElement("div");
    titleDiv.className = "assignment-title";
    titleDiv.innerHTML = `<h2 id="displayTitle">${this.customTitle}</h2>`;
    output.appendChild(titleDiv);

    // Re-bind the toggle event after creating the button
    setTimeout(() => {
      const toggleBtn = document.getElementById("toggleAnswers");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          this.toggleAnswerKey();
        });
      }
    }, 0);

    this.selectedQuestions.forEach((template, index) => {
      const question = window.QuestionGenerator.generateQuestion(template);
      
      // Create question element
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
      
      const difficultyClass = `difficulty-${question.difficulty || 'basic'}`;
      
      questionDiv.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong>${index + 1})</strong>
          <span class="objective-header">${question.objective || 'No objective'}</span>
          <span class="difficulty-badge ${difficultyClass}" style="margin-left: 8px;">${question.difficulty || 'basic'}</span>
          <span class="question-id" style="margin-left: 8px;">[${question.id || 'No ID'}]</span>
        </div>
        <div>${question.questionText || 'No question text'}</div>
      `;

      output.appendChild(questionDiv);

      // Draw graph if needed
      if (question.draw) {
        const canvas = document.createElement("canvas");
        canvas.width = 420;
        canvas.height = 240;
        output.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        
        // Always draw a blank grid for students
        window.DrawingEngine.drawCoordinateGrid(ctx, canvas.width, canvas.height);

        // Handle piecewise functions by drawing each segment
        if (question.draw.type === "piecewise" && Array.isArray(question.draw.segments)) {
          question.draw.segments.forEach(segment => {
            const segmentDraw = { ...question.draw, ...segment };
            window.DrawingEngine.draw(canvas, segmentDraw, question.variables);
          });
        }
        // Draw the actual function only if allowed
        if (question.showGraphInQuestion !== false) {
          window.DrawingEngine.draw(canvas, question.draw, question.variables);}
      }

      // Collect answer
      answers.push(`<strong>${index + 1})</strong> ${question.answer || 'No answer provided'}`);
      if (question.draw && question.showGraphInAnswer) {
        const answerCanvas = document.createElement("canvas");
        answerCanvas.width = 420;
        answerCanvas.height = 240;
        answers.push(answerCanvas.outerHTML);
        // Draw the graph for the answer key
        window.DrawingEngine.drawCoordinateGrid(
          answerCanvas.getContext("2d"), answerCanvas.width, answerCanvas.height
        );
        window.DrawingEngine.draw(answerCanvas, question.draw, question.variables);
      } 
    });

    // Add answer key
    const answerDiv = document.createElement("div");
    answerDiv.className = "answers";
    answerDiv.style.display = "none"; // Hidden by default
    answerDiv.innerHTML = `
      <h3>Answer Key</h3>
      ${answers.map(answer => `<div class="answer">${answer}</div>`).join("")}
    `;

    // Add toggle button
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "assignment-controls";
    controlsDiv.innerHTML = `
      <button id="toggleAnswers" class="toggle-answers-btn">Show Answer Key</button>
    `;
    output.appendChild(controlsDiv);
    output.appendChild(answerDiv);

    // Reset answer key visibility
    this.showAnswers = false;

    // Render math
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }

  /**
   * Edit assignment (return to builder view)
   */
  editAssignment() {
    document.getElementById("builderSection").classList.remove("hidden");
    document.getElementById("questionList").classList.remove("hidden");
    document.getElementById("assignmentPreview").classList.remove("hidden");
    document.getElementById("editSection").classList.add("hidden");
    
    // Show layout controls
    document.querySelector(".layout-controls").classList.remove("hidden");
    
    // Show title input section
    document.querySelector(".title-input-section").classList.remove("hidden");
    
    // Clear output
    document.getElementById("output").innerHTML = "";
    
    // Reset layout classes and styles
    const output = document.getElementById("output");
    output.className = "";
    output.style.removeProperty('--question-spacing');
    
    // Reset states
    this.showAnswers = false;
  }

  /**
   * Clear question list
   */
  clearQuestionList() {
    document.getElementById("questionList").innerHTML = "";
    this.addAllButtonTop.classList.add("hidden");
    this.currentLoadedQuestions = [];
  }
}

window.UIManager = new UIManager();
