/* Jerry Rulsky Law Group, APC — site scripts */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    primaryNav.addEventListener("click", function (event) {
      if (event.target.closest("a") && window.innerWidth <= 820) {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Forms: _page injection + submission + confirmation ---------- */
  var forms = Array.prototype.slice.call(document.querySelectorAll("form"));
  var successPanel = document.getElementById("formSuccess");
  var errorPanel = document.getElementById("formError");
  var submitBtn = document.getElementById("submitBtn");

  // Give every form a hidden _page field set to the current page URL.
  forms.forEach(function (form) {
    var pageField = form.querySelector('input[name="_page"]');
    if (!pageField) {
      pageField = document.createElement("input");
      pageField.type = "hidden";
      pageField.name = "_page";
      form.appendChild(pageField);
    }
    pageField.value = window.location.href;
  });

  // Confirmation shown both after a plain POST (?submitted=1) and after a fetch submit.
  function showSuccess() {
    if (successPanel) {
      successPanel.hidden = false;
      successPanel.focus({ preventScroll: true });
      var top = successPanel.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  function showError() {
    if (errorPanel) {
      errorPanel.hidden = false;
    }
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get("submitted") === "1") {
    showSuccess();
  }

  // Progressively enhance the contact form with fetch() submission to the
  // same LeadrVision endpoint. Without JS the plain POST still works.
  var form = document.getElementById("contactForm");
  if (form && typeof window.fetch === "function" && typeof window.FormData === "function") {
    form.addEventListener("submit", function (event) {
      // Let the browser's native validation run first.
      if (!form.checkValidity()) {
        return;
      }
      event.preventDefault();

      if (errorPanel) { errorPanel.hidden = true; }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Sending\u2026";
      }

      var data = new FormData(form);
      var body = {};
      data.forEach(function (value, key) {
        body[key] = value;
      });
      body._page = window.location.href;

      fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; });
        })
        .then(function (result) {
          if (result && result.ok) {
            form.reset();
            showSuccess();
          } else {
            showError();
          }
        })
        .catch(function () {
          showError();
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.dataset.label) {
              submitBtn.textContent = submitBtn.dataset.label;
            }
          }
        });
    });
  }
})();
