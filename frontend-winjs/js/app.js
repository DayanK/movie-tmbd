(function () {
  "use strict";

  WinJS.UI.Pages.define("/pages/home/home.html", {
    ready: function () {
      const controller = new MovieController();
      controller.init();
    }
  });

  WinJS.Navigation.navigate("/frontend-winjs/pages/home/home.html");
})();
