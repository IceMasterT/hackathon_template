// FlexNetGX/gx-web/src/components/mod.rs

// Layout components
pub mod layout {
    pub mod navigation;     // Navigation sidebar
    pub mod header;        // App header with user info
    pub mod footer;        // App footer
    pub mod modal;         // Reusable modal component 
}

// Authentication components
pub mod auth {
    pub mod login;         // Login form
    pub mod register;      // Registration form
    pub mod forgot_password; // Password reset
}

// Dashboard components
pub mod dashboard {
    pub mod admin;         // Admin dashboard
    pub mod research;      // Research dashboard
    pub mod volunteer;     // Volunteer dashboard
    pub mod welcome;       // Welcome dashboard
}

// User components
pub mod user {
    pub mod profile;       // User profile
    pub mod settings;      // User settings
    pub mod activity;      // User activity monitor
}

// Workspace components
pub mod workspace {
    pub mod list;          // Workspace list
    pub mod detail;        // Workspace detail
    pub mod create;        // Create workspace
}

// Team components
pub mod team {
    pub mod list;          // Team list
    pub mod detail;        // Team detail
    pub mod create;        // Create team
}

// Survey components
pub mod survey {
    pub mod list;          // Survey list
    pub mod create;        // Create survey
    pub mod respond;       // Survey response
    pub mod results;       // Survey results
}

// gx-mobile components
pub mod gx-mobile {
    pub mod table;         // Reusable table
    pub mod button;        // Button components
    pub mod input;         // Input components
    pub mod notification;  // Notification system
    pub mod loading;       // Loading states
    pub mod error;         // Error handling
}