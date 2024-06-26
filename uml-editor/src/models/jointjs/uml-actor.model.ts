import { dia, mvc, shapes, util } from '@joint/core'
import { CustomJointJSElementAttributes } from './custom-jointjs-element.model'
import { TextBlock } from './text-block.model'

const legsY = 0.7
const bodyY = 0.3
const headY = 0.15
const initWidth = 40
const initHeight = 80
const listItemHeight = 20

const markup = [
  {
    tagName: 'rect',
    selector: 'background',
  },
  {
    tagName: 'path',
    selector: 'body',
  },
  {
    tagName: 'circle',
    selector: 'head',
  },
  {
    tagName: 'foreignObject',
    selector: 'foreignObject',
  },
]

export class UmlActor extends dia.Element {
  override readonly markup = [...markup]

  private _textBlock!: TextBlock

  override initialize(
    attributes?: shapes.standard.RectangleAttributes,
    options?: mvc.CombinedModelConstructorOptions<never, this>
  ) {
    super.initialize(attributes, options)

    this._textBlock = new TextBlock()
    this._textBlock.inputElement.style['text-align'] = 'center'
    this._textBlock.attr('ref', 'foreignObject')

    // Use a custom event to add the child to the graph
    this.on('add', () => {
      this.synchronizeTextBlock()

      this.embed(this._textBlock)
      this.graph.addCell(this._textBlock)
    })
  }

  override defaults() {
    const elementAttributes: CustomJointJSElementAttributes<dia.Element.Attributes> = {
      type: 'custom.uml.Actor',
      size: {
        width: initWidth,
        height: initHeight,
      },
      attrs: {
        background: {
          width: 'calc(w)',
          height: 'calc(h)',
          fillOpacity: 0,
        },
        body: {
          d: `M 0 calc(0.4 * h) h calc(w) M 0 calc(h) calc(0.5 * w) calc(${legsY} * h) calc(w) calc(h) M calc(0.5 * w) calc(${legsY} * h) V calc(${bodyY} * h)`,
          fill: 'none',
          stroke: 'black',
          strokeWidth: 2,
        },
        head: {
          cx: 'calc(0.5 * w)',
          cy: `calc(${headY} * h)`,
          r: `calc(${headY} * h)`,
          stroke: 'black',
          strokeWidth: 2,
          fill: '#ffffff',
        },
        foreignObject: {
          width: initWidth,
          height: listItemHeight,
          x: 0,
          y: initHeight,
        },
      },
    }

    util.defaultsDeep(elementAttributes, super.defaults)
    return elementAttributes
  }

  override resize(width: number, height: number) {
    super.resize(width, height)

    this.attr('foreignObject/width', width)
    this.attr('foreignObject/y', height)
    this.synchronizeTextBlock()

    return this
  }

  private synchronizeTextBlock() {
    const parentPosition = this.position()
    const foreignObject = this.attr('foreignObject')

    this._textBlock.position(parentPosition.x + foreignObject.x, parentPosition.y + foreignObject.y)
    this._textBlock.resize(foreignObject.width, foreignObject.height)
  }
}
