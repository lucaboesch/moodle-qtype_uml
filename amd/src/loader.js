// This file is part of Moodle - https://moodle.org
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Set the diagram to the reference input field.
 *
 * @param {Event} event the custom event (fired by the editor)
 */
function setDiagramToReferenceInputField(event) {
    const element = document.getElementById(event.detail?.inputId);
    if (element) {
        element.value = event.detail.diagram;
    }
}

/**
 * Set the correction to the reference input field and the moodle textarea.
 *
 * @param {Event} event the custom event (fired by the editor)
 */
function setCorrectionToInputField(event) {
    const elements = document.querySelectorAll(`[id^='${event.detail?.inputId}__']`);
    if (elements) {
        elements.forEach((element) => {
            // If there is no AI summary we need to add the static evaluation to the expected comment and points
            if (!event.detail.summary) {
                if (element.id.endsWith('__expected-comment')) {
                    element.innerHTML = event.detail.comment;
                } else if (element.id.endsWith('__expected-points')) {
                    element.innerHTML = `${event.detail.points} / ${event.detail.maxPoints}`;
                }
            } else {
                // In the case of an AI summary we need to add the AI summary to the comment section
                if (element.id.endsWith('__expected-comment')) {
                    element.innerHTML = event.detail.summary;
                }
            }
        });
    }
}

/**
 * Initialize the uml editor elements.
 *
 * @param {String} basePath path to the dist folder of the uml-element
 */
export const init = (basePath) => {
    // Create script and style tag for custom elements
    const mainScript = document.createElement('script');
    mainScript.src = `${basePath}/main.js`;
    mainScript.type = 'module';
    mainScript.defer = true;

    const mainStyle = document.createElement('link');
    mainStyle.href = `${basePath}/styles.css`;
    mainStyle.rel = 'stylesheet';

    // Load script and style tag for custom elements
    document.head.appendChild(mainScript);
    document.head.appendChild(mainStyle);

    // Listen for dom changes to detect when the editor is loaded
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'UML-EDITOR') {
                    node.addEventListener('diagramChanged', setDiagramToReferenceInputField);
                } else if (node.nodeName === "UML-EDITOR-CORRECTNESS") {
                    node.addEventListener("correctionChanged", setCorrectionToInputField);
                }
            });
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});
};