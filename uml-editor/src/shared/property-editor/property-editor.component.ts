import { ComponentType } from '@angular/cdk/overlay'
import { NgComponentOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostBinding, HostListener, inject, OnInit } from '@angular/core'
import { MatButton, MatFabButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { PropsOfType } from '../../models/property-of.type'
import { PropertyEditorService } from './property-editor.service'

@Component({
  standalone: true,
  imports: [MatButton, MatIcon, NgComponentOutlet, MatFabButton, MatTooltip],
  templateUrl: './property-editor.component.html',
  styleUrl: './property-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyEditorComponent<T> implements OnInit {
  @HostBinding('class') protected readonly hostClasses = 'mat-drawer-side mat-drawer-end'

  protected readonly propertyEditorService = inject(PropertyEditorService)

  type!: ComponentType<T>
  initProperties?: Partial<PropsOfType<T>>

  ngOnInit() {
    if (!this.type) {
      throw new Error('Template is not defined')
    }
  }

  @HostListener('mouseenter', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('mousedown', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mousemove', ['$event'])
  @HostListener('mouseover', ['$event'])
  @HostListener('mouseout', ['$event'])
  @HostListener('click', ['$event'])
  @HostListener('dblclick', ['$event'])
  @HostListener('contextmenu', ['$event'])
  @HostListener('keydown', ['$event'])
  @HostListener('keyup', ['$event'])
  @HostListener('keypress', ['$event'])
  @HostListener('touchstart', ['$event'])
  @HostListener('touchend', ['$event'])
  @HostListener('touchmove', ['$event'])
  protected suppressAllEventsFromBubbling(event: Event) {
    event.stopPropagation()
  }
}
