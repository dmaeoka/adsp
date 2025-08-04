// cypress/support/e2e.ts
import "./commands";

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (!app.document.head.querySelector("[data-hide-command-log-request]")) {
	const style = app.document.createElement("style");
	style.innerHTML =
		".command-name-request, .command-name-xhr { display: none }";
	style.setAttribute("data-hide-command-log-request", "");
	app.document.head.appendChild(style);
}

// Global error handling
Cypress.on("uncaught:exception", (err, runnable) => {
	// Ignore specific errors that might occur in development
	if (err.message.includes("ResizeObserver loop limit exceeded")) {
		return false;
	}
	if (err.message.includes("Non-Error promise rejection captured")) {
		return false;
	}
	// Let other errors fail the test
	return true;
});
