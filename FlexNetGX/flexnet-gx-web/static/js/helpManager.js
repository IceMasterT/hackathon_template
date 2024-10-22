const helpManager = {
  toggleHelpForm: function() {
      $("#help-form").toggle();
  },
  submitHelpRequest: function(e) {
      e.preventDefault();
      let fullName = $("#full-name").val();
      let message = $("#help-message").val();
      console.log("Help request from:", fullName, "Message:", message);
      $("#help-request-form")[0].reset();
      $("#help-form").hide();
  }
};
