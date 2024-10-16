// admin-management.js

/**
 * Namespace for admin management functionality.
 * @namespace
 */
const adminManagement = {
    timeline: null,
    items: null,
    questionCount: 0,

    /**
     * Initializes the admin management functionality.
     */
    init: function() {
        this.initTabs();
        this.initTimeline();
        this.initEventListeners();
        this.updateDropdowns();
        this.initSortableTables();
    },

    /**
     * Initializes jQuery UI tabs.
     */
    initTabs: function() {
        $("#tabs").tabs();
    },

    /**
     * Initializes the vis-timeline.
     */
    initTimeline: function() {
        this.items = new vis.DataSet([]);
        const container = document.getElementById('timeline');
        const options = {
            editable: true,
            onMove: this.handleTimelineItemMove.bind(this)
        };
        this.timeline = new vis.Timeline(container, this.items, options);
    },

    /**
     * Handles moving an item in the timeline.
     * @param {Object} item - The timeline item being moved.
     * @param {Function} callback - Callback function to be called after moving the item.
     */
    handleTimelineItemMove: function(item, callback) {
        const row = $(`#workload-list tr[data-id="${item.id}"]`);
        row.find('td:eq(3)').text(item.start.toLocaleString());
        callback(item);
    },

    /**
     * Initializes all event listeners.
     */
    initEventListeners: function() {
        $("#add-person-form").on("submit", this.handleAddPerson.bind(this));
        $("#add-team-form").on("submit", this.handleAddTeam.bind(this));
        $("#add-workspace-form").on("submit", this.handleAddWorkspace.bind(this));
        $("#add-task-form").on("submit", this.handleAddTask.bind(this));
        $(document).on('change', '.team-select, .workspace-select, .person-select', this.updateDropdowns.bind(this));
        $(document).on('change', '.status-select', this.updateStatusColor);
        $("#add-question").click(this.addSurveyQuestion.bind(this));
        $(document).on('change', '.question-type', this.handleQuestionTypeChange);
        $(document).on('click', '.add-option', this.addQuestionOption);
        $("#survey-target").change(this.handleSurveyTargetChange.bind(this));
        $("#survey-form").submit(this.handleSurveySubmit.bind(this));
        $("#welcome-message-form").submit(this.handleWelcomeMessageSubmit);
        $("#volunteer-instructions-form").submit(this.handleVolunteerInstructionsSubmit);
    },

    /**
     * Handles adding a new person.
     * @param {Event} e - The submit event.
     */
    handleAddPerson: function(e) {
        e.preventDefault();
        const firstName = $("#first-name").val();
        const lastName = $("#last-name").val();
        const email = $("#email").val();
        const phone = $("#phone").val();
        const role = $("#role").val();

        const newRow = `
            <tr>
                <td>${firstName} ${lastName}</td>
                <td>${role}</td>
                <td><input type="checkbox"></td>
                <td><input type="datetime-local"></td>
                <td>
                    <select class="status-select">
                        <option value="Ready" class="status-ready">Ready</option>
                        <option value="In Progress" class="status-in-progress">In Progress</option>
                        <option value="Delayed" class="status-delayed">Delayed</option>
                        <option value="Blocked/Help" class="status-blocked">Blocked/Help</option>
                    </select>
                </td>
                <td>
                    <select class="team-select">
                        <!-- Will be populated dynamically -->
                    </select>
                </td>
                <td>
                    <select class="workspace-select">
                        <!-- Will be populated dynamically -->
                    </select>
                </td>
            </tr>
        `;

        $("#personnel-list").append(newRow);
        this.updateDropdowns();
        e.target.reset();
        
        // @TODO: Backend operation - Save new person to database
    },

    /**
     * Handles adding a new team.
     * @param {Event} e - The submit event.
     */
    handleAddTeam: function(e) {
        e.preventDefault();
        const teamName = $("#team-name").val();

        const newRow = `
            <tr>
                <td>${teamName}</td>
                <td class="assigned-personnel"></td>
                <td><input type="checkbox"></td>
                <td><input type="datetime-local"></td>
                <td>
                    <select class="status-select">
                        <option value="Ready" class="status-ready">Ready</option>
                        <option value="In Progress" class="status-in-progress">In Progress</option>
                        <option value="Delayed" class="status-delayed">Delayed</option>
                        <option value="Blocked/Help" class="status-blocked">Blocked/Help</option>
                    </select>
                </td>
                <td>
                    <select class="workspace-select">
                        <!-- Will be populated dynamically -->
                    </select>
                </td>
            </tr>
        `;

        $("#teams-list").append(newRow);
        this.updateDropdowns();
        e.target.reset();
        
        // @TODO: Backend operation - Save new team to database
    },

    /**
     * Handles adding a new workspace.
     * @param {Event} e - The submit event.
     */
    handleAddWorkspace: function(e) {
        e.preventDefault();
        const workspaceName = $("#workspace-name").val();

        const newRow = `
            <tr>
                <td>${workspaceName}</td>
                <td class="assigned-teams"></td>
                <td><input type="checkbox"></td>
                <td><input type="datetime-local"></td>
                <td>
                    <select class="status-select">
                        <option value="Ready" class="status-ready">Ready</option>
                        <option value="In Progress" class="status-in-progress">In Progress</option>
                        <option value="Delayed" class="status-delayed">Delayed</option>
                        <option value="Blocked/Help" class="status-blocked">Blocked/Help</option>
                    </select>
                </td>
            </tr>
        `;

        $("#workspaces-list").append(newRow);
        this.updateDropdowns();
        e.target.reset();
        
        // @TODO: Backend operation - Save new workspace to database
    },

    /**
     * Handles adding a new task.
     * @param {Event} e - The submit event.
     */
    handleAddTask: function(e) {
        e.preventDefault();
        const taskName = $("#task-name").val();
        const dueDate = new Date($("#task-due-date").val());
        const priority = $("#task-priority").val();

        const newRow = `
            <tr data-id="${Date.now()}">
                <td>${taskName}</td>
                <td>${priority}</td>
                <td>
                    <select class="person-select">
                        <!-- Will be populated dynamically -->
                    </select>
                </td>
                <td>${dueDate.toLocaleString()}</td>
                <td>
                    <select class="status-select">
                        <option value="Ready" class="status-ready">Ready</option>
                        <option value="In Progress" class="status-in-progress">In Progress</option>
                        <option value="Delayed" class="status-delayed">Delayed</option>
                        <option value="Blocked/Help" class="status-blocked">Blocked/Help</option>
                    </select>
                </td>
                <td>
                    <select class="team-select">
                        <!-- Will be populated dynamically -->
                    </select>
                </td>
                <td>
                    <select class="workspace-select">
                        <!-- Will be populated dynamically -->
                    </select>
                </td>
            </tr>
        `;

        $("#workload-list").append(newRow);
        this.updateDropdowns();

        this.items.add({
            id: Date.now(),
            content: taskName,
            start: dueDate,
            type: 'point'
        });

        e.target.reset();
        
        // @TODO: Backend operation - Save new task to database
    },

    /**
     * Updates all dropdowns with current data.
     */
    updateDropdowns: function() {
        const teams = $("#teams-list tr").map(function() {
            return $(this).find("td:first").text();
        }).get();

        const workspaces = $("#workspaces-list tr").map(function() {
            return $(this).find("td:first").text();
        }).get();

        const personnel = $("#personnel-list tr").map(function() {
            return $(this).find("td:first").text();
        }).get();

        this.updateSelectOptions('.team-select', teams);
        this.updateSelectOptions('.workspace-select', workspaces);
        this.updateSelectOptions('.person-select', personnel);

        this.updateAssignedPersonnel();
        this.updateAssignedTeams();
    },

    /**
     * Updates options for a select element.
     * @param {string} selector - The CSS selector for the select element.
     * @param {string[]} options - The array of option values.
     */
    updateSelectOptions: function(selector, options) {
        $(selector).each(function() {
            const select = $(this);
            const currentValue = select.val();
            select.empty();
            $.each(options, function(i, option) {
                select.append($('<option></option>').val(option).text(option));
            });
            select.val(currentValue);
        });
    },

    /**
     * Updates the assigned personnel for each team.
     */
    updateAssignedPersonnel: function() {
        $("#teams-list tr").each(function() {
            const teamName = $(this).find("td:first").text();
            const assignedPersonnel = $("#personnel-list tr").filter(function() {
                return $(this).find(".team-select").val() === teamName;
            }).map(function() {
                return $(this).find("td:first").text();
            }).get().join(", ");
            $(this).find(".assigned-personnel").text(assignedPersonnel);
        });
    },

    /**
     * Updates the assigned teams for each workspace.
     */
    updateAssignedTeams: function() {
        $("#workspaces-list tr").each(function() {
            const workspaceName = $(this).find("td:first").text();
            const assignedTeams = $("#teams-list tr").filter(function() {
                return $(this).find(".workspace-select").val() === workspaceName;
            }).map(function() {
                return $(this).find("td:first").text();
            }).get().join(", ");
            $(this).find(".assigned-teams").text(assignedTeams);
        });
    },

    /**
     * Updates the status color for a status select element.
     */
    updateStatusColor: function() {
        $(this).attr('class', 'status-select status-' + $(this).val().toLowerCase().replace(/\s+/g, '-'));
    },

    /**
     * Initializes sortable tables.
     */
    initSortableTables: function() {
        $("#personnel-table, #teams-table, #workspaces-table, #workload-table").sortable({
            items: 'tr:not(tr:first-child)',
            cursor: 'pointer',
            axis: 'y',
            dropOnEmpty: false,
            start: function (e, ui) {
                ui.item.addClass("selected");
            },
            stop: function (e, ui) {
                ui.item.removeClass("selected");
                $(this).find("tr").each(function (index) {
                    if (index > 0) {
                        $(this).find("td").eq(0).html(index);
                    }
                });
            }
        });
    },

    /**
     * Adds a new question to the survey form.
     */
    addSurveyQuestion: function() {
        this.questionCount++;
        $("#survey-questions").append(`
            <div class="question">
                <input type="text" placeholder="Question ${this.questionCount}" required>
                <select class="question-type">
                    <option value="text">Text</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                </select>
                <div class="question-options" style="display: none;">
                    <input type="text" placeholder="Option 1" class="option-input">
                    <input type="text" placeholder="Option 2" class="option-input">
                    <button type="button" class="add-option">Add Option</button>
                </div>
            </div>
        `);
    },

    /**
     * Handles change in question type.
     */
    handleQuestionTypeChange: function() {
        const optionsDiv = $(this).siblings('.question-options');
        if ($(this).val() === 'multiple') {
            optionsDiv.show();
        } else if ($(this).val() === 'true-false') {
            optionsDiv.html(`
                <input type="text" placeholder="True Label" class="option-input" value="True">
                <input type="text" placeholder="False Label" class="option-input" value="False">
            `).show();
        } else {
            optionsDiv.hide();
        }
    },

    /**
     * Adds a new option to a multiple choice question.
     */
    addQuestionOption: function() {
        const optionsDiv = $(this).parent();
        const optionCount = optionsDiv.find('.option-input').length;
        optionsDiv.append(`<input type="text" placeholder="Option ${optionCount + 1}" class="option-input">`);
    },

    /**
     * Handles change in survey target.
     */
    handleSurveyTargetChange: function() {
        const targetSpecific = $("#survey-target-specific");
        if ($(this).val() !== "all") {
            targetSpecific.show();
            let options = [];
            switch($(this).val()) {
                case "workspace":
                    options = $("#workspaces-list tr").map(function() {
                        return $(this).find("td:first").text();
                    }).get();
                    break;
                case "team":
                    options = $("#teams-list tr").map(function() {
                        return $(this).find("td:first").text();
                    }).get();
                    break;
                case "individual":
                    options = $("#personnel-list tr").map(function() {
                        return $(this).find("td:first").text();
                    }).get();
                    break;
            }
            targetSpecific.empty();
            $.each(options, function(i, option) {
                targetSpecific.append($('<option></option>').val(option).text(option));
            });
        } else {
            targetSpecific.hide();
        }
    },

    /**
     * Handles survey form submission.
     * @param {Event} e - The submit event.
     */
    handleSurveySubmit: function(e) {
        e.preventDefault();
        let surveyData = {
            name: $("#survey-name").val(),
            description: $("#survey-description").val(),
            target: $("#survey-target").val(),
            targetSpecific: $("#survey-target-specific").val(),
            dueDate: $("#survey-due-date").val(),
            questions: []
        };

        $(".question").each(function() {
            let question = {
                text: $(this).find('input:first').val(),
                type: $(this).find('.question-type').val(),
                options: []
            };

            if (question.type === 'multiple' || question.type === 'true-false') {
                $(this).find('.option-input').each(function() {
                    question.options.push($(this).val());
                });
            }

            surveyData.questions.push(question);
        });

        console.log("Survey created:", surveyData);
        // @TODO: Backend operation - Save survey data to database
        
        e.target.reset();
        $("#survey-questions").empty();
        this.questionCount = 0;
    },

    /**
     * Handles welcome message form submission.
     * @param {Event} e - The submit event.
     */
    handleWelcomeMessageSubmit: function(e) {
        e.preventDefault();
        let welcomeMessage = $("#welcome-message").val();
        console.log("Welcome message set:", welcomeMessage);
        localStorage.setItem('welcomeMessage', welcomeMessage);
        e.target.reset();
        
        // @TODO: Backend operation - Save welcome message to database
    },

    /**
     * Handles volunteer instructions form submission.
     * @param {Event} e - The submit event.
     */
    handleVolunteerInstructionsSubmit: function(e) {
        e.preventDefault();
        let volunteerInstructions = $("#volunteer-instructions").val();
        console.log("Volunteer instructions set:", volunteerInstructions);
        localStorage.setItem('volunteerInstructions', volunteerInstructions);
        e.target.reset();
        
        // @TODO: Backend operation - Save volunteer instructions to database
    }
};

// Initialize the admin management functionality when the DOM is ready
$(document).ready(function() {
    adminManagement.init();
});