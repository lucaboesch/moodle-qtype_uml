import { shapes, util } from '@joint/core'
import { ClassifierConfigurationComponent } from '../../../shared/classifier-configuration/classifier-configuration.component'
import { CustomJointJSElementAttributes } from '../custom-jointjs-element.model'
import { BaseUmlClassifierModel, ClassifierType, UmlClassSectors } from './base-uml-classifier.model'

const initialWidth = 150
const initialHeight = 80
const listItemHeight = 20

const markup = [
  {
    tagName: 'rect',
    selector: 'body',
  },
  {
    tagName: 'text',
    selector: 'headerlabel',
  },
  {
    tagName: 'rect',
    selector: 'header',
  },
  {
    tagName: 'rect',
    selector: 'functionsRect',
  },
]

export class UmlInterface extends BaseUmlClassifierModel {
  override readonly initialWidth = initialWidth
  override readonly listItemHeight = listItemHeight
  override readonly type: ClassifierType = 'Interface'
  override readonly markup = [...markup]

  private get functionsComponentAllHeight(): number {
    return initialHeight - 2 * listItemHeight + this.functionComponents.length * listItemHeight
  }

  override defaults() {
    const elementAttributes: CustomJointJSElementAttributes<shapes.standard.RectangleAttributes> = {
      type: 'custom.uml.Interface',
      propertyView: ClassifierConfigurationComponent,
      size: {
        width: initialWidth,
        height: initialHeight,
      },
      attrs: {
        body: {
          rx: 0,
          ry: 0,
          strokeWidth: 4,
          stroke: 'black',
        },
        ['headerlabel' satisfies UmlClassSectors]: {
          text: '<<Interface>>',
          width: '100%', // Assuming you want the label to occupy the entire width of the body
          height: listItemHeight,
          'ref-y': 0,
          'ref-x': 0.5, // Adjust reference to center horizontally
          'text-anchor': 'middle', // Center align text horizontally
          ref: 'body',
          fill: 'black',
        },
        ['header' satisfies UmlClassSectors]: {
          width: initialWidth,
          height: listItemHeight,
          'ref-y': listItemHeight,
          'ref-x': 0,
          'text-anchor': 'middle',
          ref: 'body',
          fillOpacity: 0,
        },
        ['functionsRect' satisfies UmlClassSectors]: {
          width: initialWidth,
          height: this.functionsComponentAllHeight,
          stroke: 'black',
          strokeWidth: 3,
          'ref-y': 2 * listItemHeight,
          'ref-x': 0,
          ref: 'body',
          fill: 'white',
        },
      },
    }

    util.defaultsDeep(elementAttributes, super.defaults)
    return elementAttributes
  }

  override resize(width: number, height: number) {
    width = Math.max(width, initialWidth)
    const minHeight = this.functionComponents.length * 30 + 2 * listItemHeight
    if (height < minHeight) {
      height = minHeight
    }

    super.resize(width, height)

    // Update subelements
    this.attr('header/width', width)

    this.attr('functionsRect' satisfies UmlClassSectors, {
      width: width,
      height: height - 2 * listItemHeight,
      'ref-y': 2 * listItemHeight,
    })

    this.functionComponents.forEach(component => {
      component.resize(super.listItemWidth, listItemHeight)
    })
    return this
  }
}
