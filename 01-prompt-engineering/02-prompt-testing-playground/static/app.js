// ---------------------------------------------------------
// Prompt Testing Playground
// Frontend JavaScript
// ---------------------------------------------------------

// Helper for document.querySelector()
const $ = (selector) => document.querySelector(selector);

// Stores prompts received from the FastAPI backend.
let prompts = [];


// ---------------------------------------------------------
// API Helper
// ---------------------------------------------------------

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    let body = {};

    try {
        body = await response.json();
    } catch (error) {
        // Response may not contain JSON.
    }

    if (!response.ok) {
        throw new Error(body.detail || "Request failed.");
    }

    return body;
}


// ---------------------------------------------------------
// HTML escaping
// ---------------------------------------------------------

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


// ---------------------------------------------------------
// Get currently selected prompt
// ---------------------------------------------------------

function currentPrompt() {
    const selectedPromptId = Number($("#prompt").value);

    return prompts.find(
        prompt => prompt.id === selectedPromptId
    );
}


// ---------------------------------------------------------
// Load prompts
// ---------------------------------------------------------

async function loadPrompts() {
    try {
        prompts = await api("/api/prompts");

        if (prompts.length === 0) {
            $("#msg").textContent =
                "No prompts are available.";

            return;
        }

        $("#prompt").innerHTML = prompts
            .map(prompt => `
                <option value="${prompt.id}">
                    ${escapeHtml(prompt.name)}
                </option>
            `)
            .join("");

        renderVersions();

        await loadHistory();

    } catch (error) {
        console.error(error);

        $("#msg").textContent =
            `Unable to load prompts: ${error.message}`;
    }
}


// ---------------------------------------------------------
// Render prompt versions
// ---------------------------------------------------------

function renderVersions() {
    const prompt = currentPrompt();

    if (!prompt) {
        $("#versions").innerHTML = "";
        return;
    }

    $("#versions").innerHTML = prompt.versions
        .map(version => `
            <label class="version">

                <input
                    type="checkbox"
                    value="${version.id}"
                    ${version.version <= 3 ? "checked" : ""}
                >

                v${version.version}:
                ${escapeHtml(
                    version.change_notes || "No change notes"
                )}

            </label>
        `)
        .join("");
}


// ---------------------------------------------------------
// Run prompt comparison
// ---------------------------------------------------------

async function runComparison() {

    const selectedVersionIds = [
        ...document.querySelectorAll(
            "#versions input:checked"
        )
    ].map(input => Number(input.value));


    // We allow comparison of 2 or 3 versions.
    if (
        selectedVersionIds.length < 2 ||
        selectedVersionIds.length > 3
    ) {
        $("#msg").textContent =
            "Please select 2 or 3 prompt versions.";

        return;
    }


    const testInput = $("#input").value.trim();

    if (!testInput) {
        $("#msg").textContent =
            "Please enter some test input.";

        return;
    }


    $("#msg").textContent =
        "Running prompt comparison...";

    $("#results").innerHTML = "";


    try {

        const results = await api(
            "/api/compare",
            {
                method: "POST",

                body: JSON.stringify({
                    prompt_id: Number(
                        $("#prompt").value
                    ),

                    version_ids:
                        selectedVersionIds,

                    test_input:
                        testInput
                })
            }
        );


        renderComparisonResults(results);


        $("#msg").textContent =
            "Comparison completed and saved.";


        await loadHistory();

    } catch (error) {

        console.error(error);

        $("#msg").textContent =
            `Comparison failed: ${error.message}`;
    }
}


// ---------------------------------------------------------
// Render comparison results
// ---------------------------------------------------------

function renderComparisonResults(items) {

    if (!items || items.length === 0) {

        $("#results").innerHTML =
            "<p>No comparison results available.</p>";

        return;
    }


    $("#results").innerHTML = items
        .map(item => `

            <article class="card">

                <h3>
                    Version ${item.version}
                </h3>


                <p class="metrics">

                    ${item.word_count} words

                    ·

                    ${item.response_time_ms} ms

                </p>


                <h4>
                    Rendered Prompt
                </h4>

                <pre>
${escapeHtml(item.rendered_prompt)}
                </pre>


                <h4>
                    Output
                </h4>

                <pre>
${escapeHtml(item.output)}
                </pre>


                <label>

                    Rating

                    <select
                        id="rating-${item.result_id}"
                    >

                        <option value="5">
                            5 - Excellent
                        </option>

                        <option value="4">
                            4 - Good
                        </option>

                        <option
                            value="3"
                            selected
                        >
                            3 - Average
                        </option>

                        <option value="2">
                            2 - Needs Improvement
                        </option>

                        <option value="1">
                            1 - Poor
                        </option>

                    </select>

                </label>


                <label>

                    Observation

                    <textarea
                        id="notes-${item.result_id}"
                        rows="3"
                        placeholder="What improved or needs improvement?"
                    ></textarea>

                </label>


                <button
                    onclick="saveRating(${item.result_id})"
                >
                    Save Observation
                </button>

            </article>

        `)
        .join("");
}


// ---------------------------------------------------------
// Save rating / observation
// ---------------------------------------------------------

async function saveRating(resultId) {

    const ratingElement =
        $(`#rating-${resultId}`);

    const notesElement =
        $(`#notes-${resultId}`);


    if (!ratingElement || !notesElement) {

        $("#msg").textContent =
            "Unable to find the rating controls.";

        return;
    }


    const rating =
        Number(ratingElement.value);

    const notes =
        notesElement.value.trim();


    try {

        await api(
            `/api/results/${resultId}/rating`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    rating: rating,
                    notes: notes
                })
            }
        );


        $("#msg").textContent =
            "Observation saved successfully.";


        await loadHistory();

    } catch (error) {

        console.error(error);

        $("#msg").textContent =
            `Unable to save observation: ${error.message}`;
    }
}


// ---------------------------------------------------------
// Load test history
// ---------------------------------------------------------

async function loadHistory() {

    const promptId =
        Number($("#prompt").value);


    if (!promptId) {
        return;
    }


    try {

        const history = await api(
            `/api/prompts/${promptId}/history`
        );


        if (!history || history.length === 0) {

            $("#history").innerHTML =
                "<p>No test runs yet.</p>";

            return;
        }


        $("#history").innerHTML = history
            .slice(0, 20)
            .map(item => `

                <div class="history">

                    <strong>
                        Version ${item.version}
                    </strong>

                    ·

                    ${item.response_time_ms} ms

                    ·

                    Rating:
                    ${item.rating ?? "Not rated"}

                    <br>

                    <small>
                        ${escapeHtml(
                            item.notes ||
                            "No observation yet"
                        )}
                    </small>

                </div>

            `)
            .join("");


    } catch (error) {

        console.error(error);

        $("#history").innerHTML =
            `<p>
                Unable to load history:
                ${escapeHtml(error.message)}
            </p>`;
    }
}


// ---------------------------------------------------------
// Open "Create New Version" dialog
// ---------------------------------------------------------

function openNewVersionDialog() {

    const prompt =
        currentPrompt();


    if (!prompt) {

        $("#msg").textContent =
            "Unable to find the selected prompt.";

        return;
    }


    if (
        !prompt.versions ||
        prompt.versions.length === 0
    ) {

        $("#msg").textContent =
            "No existing prompt versions are available.";

        return;
    }


    // Get latest version.
    // Avoid Array.at(-1) for broader browser compatibility.

    const latestVersion =
        prompt.versions[
            prompt.versions.length - 1
        ];


    // Start the new version using the latest prompt.
    $("#template").value =
        latestVersion.template;


    $("#notes").value = "";


    $("#dialog").showModal();
}


// ---------------------------------------------------------
// Close dialog
// ---------------------------------------------------------

function closeNewVersionDialog() {

    $("#dialog").close();
}


// ---------------------------------------------------------
// Save new prompt version
// ---------------------------------------------------------

async function saveNewVersion(event) {

    event.preventDefault();


    const template =
        $("#template").value.trim();

    const changeNotes =
        $("#notes").value.trim();


    if (!template) {

        $("#msg").textContent =
            "Prompt template cannot be empty.";

        return;
    }


    try {

        await api(
            `/api/prompts/${$("#prompt").value}/versions`,
            {
                method: "POST",

                body: JSON.stringify({
                    template: template,
                    change_notes: changeNotes
                })
            }
        );


        $("#dialog").close();


        // Reload prompts so the new version
        // appears immediately.

        await loadPrompts();


        $("#msg").textContent =
            "New prompt version saved successfully.";


    } catch (error) {

        console.error(error);

        $("#msg").textContent =
            `Unable to save version: ${error.message}`;
    }
}


// ---------------------------------------------------------
// Event listeners
// ---------------------------------------------------------

$("#compare").addEventListener(
    "click",
    runComparison
);


$("#prompt").addEventListener(
    "change",
    async () => {

        renderVersions();

        await loadHistory();
    }
);


$("#new").addEventListener(
    "click",
    openNewVersionDialog
);


$("#cancel").addEventListener(
    "click",
    closeNewVersionDialog
);


$("#form").addEventListener(
    "submit",
    saveNewVersion
);


// Needed because the dynamically-created buttons
// use onclick="saveRating(...)"

window.saveRating =
    saveRating;


// ---------------------------------------------------------
// Initial application load
// ---------------------------------------------------------

loadPrompts();
