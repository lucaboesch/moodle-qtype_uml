import { Clipboard } from '@angular/cdk/clipboard'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  numberAttribute,
  Output,
  signal,
} from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { MatFabButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTooltip } from '@angular/material/tooltip'
import { skip } from 'rxjs'
import { UmlCorrection } from '../../models/correction.model'
import { EMPTY_DIAGRAM_ENCODED, EMPTY_DIAGRAM_OBJECT } from '../../models/jointjs/jointjs-diagram.model'
import { injectCreateEvaluateCorrectionFn, prepareEvaluateCorrectionPrompt } from '../../utils/correction.utils'
import { decodeDiagram } from '../../utils/uml-editor-compression.utils'
import { UmlEditorComponent } from '../uml-editor/uml-editor.component'

@Component({
  selector: 'app-uml-editor-correctness',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './uml-editor-correctness.component.html',
  styleUrl: './uml-editor-correctness.component.scss',
  imports: [MatListModule, MatFabButton, MatIcon, MatProgressSpinner, MatTooltip, UmlEditorComponent],
})
export class UmlEditorCorrectnessComponent {
  @Input({ required: true }) inputId!: string
  @Input({ required: true }) diagram!: string
  @Input({ required: true }) correctAnswer!: string
  @Input({ required: true, transform: numberAttribute }) maxPoints!: number
  @Input() promptEndpoint?: string
  @Input() additionalCorrectionPrompt?: string

  @Output() protected readonly correctionChanged = new EventEmitter<{
    inputId: string
    maxPoints: number
    comment: string
    points: number
    summary?: string
  }>()

  protected readonly isLoading = signal(false)

  private readonly correction = signal<UmlCorrection>({
    differences: [],
    points: 0,
    normalizedAnswer: EMPTY_DIAGRAM_OBJECT,
    normalizedSolution: EMPTY_DIAGRAM_OBJECT,
  })

  private readonly evaluateCorrection = injectCreateEvaluateCorrectionFn()
  private readonly clipboard = inject(Clipboard)
  private readonly snackbar = inject(MatSnackBar)

  constructor() {
    toObservable(this.correction)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(correction => {
        const emittedCorrection = {
          inputId: this.inputId,
          maxPoints: this.maxPoints,
          comment: JSON.stringify(correction.differences),
          points: correction.points,
          summary: correction.summary,
        }

        console.debug('correction changed', correction, 'emitting', emittedCorrection)
        this.correctionChanged.emit(emittedCorrection)
      })
  }

  protected async correctDiagram() {
    this.isLoading.set(true)

    try {
      const decodedDiagram = decodeDiagram(this.diagram || EMPTY_DIAGRAM_ENCODED)
      const decodedCorrectAnswerDiagram = decodeDiagram(this.correctAnswer || EMPTY_DIAGRAM_ENCODED)

      const correction = await this.evaluateCorrection(
        decodedDiagram,
        decodedCorrectAnswerDiagram,
        this.maxPoints,
        this.promptEndpoint,
        this.additionalCorrectionPrompt
      )
      this.correction.set(correction)
    } catch (error) {
      console.error('Error while evaluating correction:', error)
      this.snackbar.open('Error while evaluating correction', 'Dismiss', {
        duration: 2000,
      })
    } finally {
      this.isLoading.set(false)
    }
  }

  protected copyPromptToClipboard() {
    const decodedDiagram = decodeDiagram(this.diagram || EMPTY_DIAGRAM_ENCODED)
    const decodedCorrectAnswerDiagram = decodeDiagram(this.correctAnswer || EMPTY_DIAGRAM_ENCODED)
    const prompt = prepareEvaluateCorrectionPrompt(
      decodedDiagram,
      decodedCorrectAnswerDiagram,
      this.maxPoints,
      this.additionalCorrectionPrompt
    )

    this.clipboard.copy(prompt)

    this.snackbar.open('Prompt copied to clipboard', 'Dismiss', {
      duration: 2000,
    })
  }
}
