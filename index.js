"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

const searchOverlay = document.getElementById("search-overlay");
const openSearchBtn = document.getElementById("open-search");
const closeSearchBtn = document.getElementById("close-search");

function setOverlayVisibility(show) {
	if (!searchOverlay) return;
	searchOverlay.classList.toggle("hidden", !show);
	if (show) {
		const addressInput = document.getElementById("uv-address");
		addressInput?.focus();
	}
}

openSearchBtn?.addEventListener("click", (event) => {
	event.preventDefault();
	setOverlayVisibility(true);
});

closeSearchBtn?.addEventListener("click", (event) => {
	event.preventDefault();
	setOverlayVisibility(false);
});

window.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		if (searchOverlay && !searchOverlay.classList.contains("hidden")) {
			setOverlayVisibility(false);
		}
	}
});

setOverlayVisibility(true);

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let frame = document.getElementById("uv-frame");
	frame.style.display = "block";
	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [
			{ wisp: wispUrl },
		]);
	}
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});
