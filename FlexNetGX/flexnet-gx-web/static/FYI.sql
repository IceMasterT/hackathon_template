FYI

-- Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(40) UNIQUE,
    password_hash VARCHAR(128),
    created_at DATETIME,
    last_login DATETIME,
    phone VARCHAR(16),
    email VARCHAR(45),
    account_status CHAR(1) CHECK (account_status IN ('A', 'I'))
);

-- Roles Table
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_type CHAR(1) CHECK (role_type IN ('V', 'R', 'A')),
    role_name VARCHAR(10) CHECK (role_name IN ('Volunteer', 'Research', 'Admin'))
);

-- Teams Table
CREATE TABLE Teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    team_name VARCHAR(20),
    team_status CHAR(1) CHECK (team_status IN ('A', 'I')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Workspaces Table
CREATE TABLE Workspaces (
    workspace_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    workspace_name VARCHAR(20),
    workspace_status CHAR(1) CHECK (workspace_status IN ('A', 'I')),
    FOREIGN KEY (team_id) REFERENCES Teams(team_id)
);

-- Assign Table
CREATE TABLE Assign (
    assign_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    team_id INT,
    workspace_id INT,
    status_id CHAR(1) CHECK (status_id IN ('A', 'I')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (team_id) REFERENCES Teams(team_id),
    FOREIGN KEY (workspace_id) REFERENCES Workspaces(workspace_id)
);

-- Login_Attempts Table
CREATE TABLE Login_Attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    attempt DATETIME,
    ip_address VARCHAR(30),
    success BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Sessions Table
CREATE TABLE Sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(40),
    session_token VARCHAR(128),
    created_at DATETIME,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(username)
);

-- Password_Reset Table
CREATE TABLE Password_Reset (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    reset_token VARCHAR(128),
    created_at DATETIME,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Settings Table
CREATE TABLE Settings (
    settings_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date_format ENUM('mdy', 'dmy', 'ydm'),
    time_format ENUM('24h', '12h'),
    time_overlay BOOLEAN,
    display_mode ENUM('day', 'night'),
    font_preference VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- User_Preferences Table
CREATE TABLE User_Preferences (
    user_pref_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date_format VARCHAR(10),
    time_format VARCHAR(8),
    display_mode CHAR(1),
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Priority Table
CREATE TABLE Priority (
    priority_id INT AUTO_INCREMENT PRIMARY KEY,
    priority_type VARCHAR(4),
    priority_name VARCHAR(25),
    priority_description VARCHAR(45)
);

-- Task_Status Table
CREATE TABLE Task_Status (
    task_status CHAR(1) PRIMARY KEY CHECK (task_status IN ('A', 'I', 'R', 'P', 'C')),
    task_name VARCHAR(20) CHECK (task_name IN ('Assigned', 'In Progress', 'Review', 'Approval', 'Complete')),
    due_date DATETIME
);

-- Task_Ind Table
CREATE TABLE Task_Ind (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_type VARCHAR(4),
    task_name VARCHAR(25),
    task_description VARCHAR(45),
    user_id INT,
    due_date DATETIME,
    priority_id INT,
    task_status CHAR(1),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (priority_id) REFERENCES Priority(priority_id),
    FOREIGN KEY (task_status) REFERENCES Task_Status(task_status)
);

-- Task_Team Table
CREATE TABLE Task_Team (
    team_task_id INT AUTO_INCREMENT PRIMARY KEY,
    team_task_type VARCHAR(4),
    team_task_name VARCHAR(25),
    team_description VARCHAR(45),
    team_id INT,
    due_date DATETIME,
    priority_id INT,
    task_status CHAR(1),
    FOREIGN KEY (team_id) REFERENCES Teams(team_id),
    FOREIGN KEY (priority_id) REFERENCES Priority(priority_id),
    FOREIGN KEY (task_status) REFERENCES Task_Status(task_status)
);

-- Task_Workspace Table
CREATE TABLE Task_Workspace (
    workspace_task_id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_type VARCHAR(4),
    workspace_task_name VARCHAR(25),
    workspace_description VARCHAR(45),
    workspace_id INT,
    due_date DATETIME,
    priority_id INT,
    task_status_id CHAR(1),
    FOREIGN KEY (workspace_id) REFERENCES Workspaces(workspace_id),
    FOREIGN KEY (priority_id) REFERENCES Priority(priority_id),
    FOREIGN KEY (task_status_id) REFERENCES Task_Status(task_status)
);

-- Surveys Table
CREATE TABLE Surveys (
    survey_id INT AUTO_INCREMENT PRIMARY KEY,
    survey_name VARCHAR(20),
    survey_description VARCHAR(45),
    target_type VARCHAR(10),
    target_id INT,
    due_date DATETIME
);

-- Survey_Questions Table
CREATE TABLE Survey_Questions (
    survey_ques_id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT,
    question_text VARCHAR(128),
    question_type VARCHAR(10),
    FOREIGN KEY (survey_id) REFERENCES Surveys(survey_id)
);

-- Notifications Table
CREATE TABLE Notifications (
    Not_id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(200),
    user_id INT,
    sent_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Feedback Table
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_text VARCHAR(200),
    user_id INT,
    submission_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Settings_List Table
CREATE TABLE Settings_List (
    Set_list_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(45),
    setting_value VARCHAR(200)
);
