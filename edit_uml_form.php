<?php
// This file is part of Moodle - https://moodle.org/
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
 * The editing form for UML question type is defined here.
 *
 * @package     qtype_uml
 * @copyright   copy
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/question/type/edit_question_form.php');
require_once(__DIR__ . '/classes/helpers/editor_helper.php');

/**
 * UML question editing form definition.
 *
 * You should override functions as necessary from the parent class located at
 * /question/type/edit_question_form.php.
 */
class qtype_uml_edit_form extends question_edit_form {
    /**
     * Returns the question type name.
     *
     * @return string The question type name.
     */
    public function qtype(): string {
        return 'uml';
    }

    /**
     * Loads and sets up the editor
     *
     * @param MoodleQuickForm $mform The form to load the inputs to
     * @throws coding_exception Editor could not being loaded
     */
    protected function definition_inner($mform): void {
        // Generate hidden input element to keep the editors content.
        $correctanswerid = $this->question->options->correctanswer ?? null;
        $correctanswer = $this->question->options->answers[$correctanswerid]->answer ?? '';

        $correctanswerinput = $mform->addElement('hidden', 'correctanswer', $correctanswer);
        $mform->setType('correctanswer', PARAM_RAW);
        // Generate the id for the input element to bind the editor to.
        $bindelementid = uniqid('correctanswer');
        $correctanswerinput->setAttributes(array_merge(['id' => $bindelementid], $correctanswerinput->_attributes));

        // Generate the label html.
        $labelhtml = '
        <div class="col-md-3 col-form-label d-flex pb-0 pr-md-0">
            <label id="id_idnumber_label" class="d-inline word-break " for="id_idnumber">
                ' . get_string("correctanswer", "qtype_uml") . '
            </label>
        </div>';

        // Generate the editor html.
        $editorcontent = EditorHelper::load_editor_html_for_id($bindelementid, true, $correctanswer);
        $editorhtml = '
        <div class="col-md-9 form-inline align-items-start felement" data-fieldtype="text">
            ' . $editorcontent . '
        </div>';

        $mform->addElement('html', '<div class="form-group row fitem">' . $labelhtml . $editorhtml . '</div>');

        // Render grader information.
        $mform->addElement('header', 'graderinfoheader', get_string('graderinfoheader', 'qtype_uml'));
        $mform->setExpanded('graderinfoheader');
        $mform->addElement(
                'editor',
                'graderinfo',
                get_string('graderinfo', 'qtype_uml'),
                ['rows' => 10],
                $this->editoroptions
        );

        // Prompt configuration information.
        $mform->addElement('header', 'promptconfigurationheader', get_string('promptconfigurationheader', 'qtype_uml'));
        $mform->setExpanded('promptconfigurationheader');
        $mform->addElement(
                'editor',
                'promptconfiguration',
                get_string('promptconfiguration', 'qtype_uml'),
                ['rows' => 10],
                $this->editoroptions
        );
        $mform->setDefault('promptconfiguration',
                ['text' => get_string('promptconfigurationdefault', 'qtype_uml'), 'format' => FORMAT_HTML]);
    }

    /**
     * Reads the question data and processes it
     *
     * @param object $question The question to process
     * @return object
     */
    protected function data_preprocessing($question): object {
        $question = parent::data_preprocessing($question);

        if (empty($question->options)) {
            return $question;
        }

        if (!empty($question->options->correctanswer)) {
            $correctanswerid = $question->options->correctanswer;
            $correctanswer = $question->options->answers[$correctanswerid];

            $question->correctanswer = $correctanswer->answer;
        }

        // Load grader information.
        $draftidgraderinfo = file_get_submitted_draft_itemid('graderinfo');
        $question->graderinfo = [];
        $question->graderinfo['text'] = file_prepare_draft_area(
                $draftidgraderinfo,
                $this->context->id,
                'qtype_uml',
                'graderinfo',
                !empty($question->id) ? (int) $question->id : null,
                $this->fileoptions,
                $question->options->graderinfo
        );
        $question->graderinfo['format'] = $question->options->graderinfoformat;
        $question->graderinfo['itemid'] = $draftidgraderinfo;

        // Prompt configuration.
        $draftidpromptconfiguration = file_get_submitted_draft_itemid('promptconfiguration');
        $texttouse = $question->options->promptconfiguration ?? get_string('promptconfigurationdefault', 'qtype_uml');
        $formattouse = $question->options->promptconfigurationformat ?? FORMAT_HTML;
        $question->promptconfiguration = [];
        $question->promptconfiguration['text'] = file_prepare_draft_area(
                $draftidpromptconfiguration,
                $this->context->id,
                'qtype_uml',
                'promptconfiguration',
                !empty($question->id) ? (int) $question->id : null,
                $this->fileoptions,
                $texttouse
        );
        $question->promptconfiguration['format'] = $formattouse;
        $question->promptconfiguration['itemid'] = $draftidpromptconfiguration;

        return $question;
    }
}
