import {
  MinimalEventProps, BaseComponent, ComponentContext, h,
  Seg, isMultiDayRange, DateFormatter, buildSegTimeText, createFormatter, EventMeta, EventRoot, ComponentChildren, RenderHook, Fragment
} from "@fullcalendar/core"


const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  meridiem: 'short'
}


export default class ListViewEventRow extends BaseComponent<MinimalEventProps> {

  render(props: MinimalEventProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { seg } = props

    // TODO: avoid createFormatter, cache!!! see TODO in StandardEvent
    let timeFormat = createFormatter(
      options.eventTimeFormat || DEFAULT_TIME_FORMAT,
      options.defaultRangeSeparator
    )

    return (
      <EventRoot
        seg={seg}
        timeText={'' /* BAD. because of all-day content */}
        defaultInnerContent={renderEventInnerContent}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
        isSelected={props.isSelected}
        isDragging={props.isDragging}
        isResizing={props.isResizing}
        isDateSelecting={props.isDateSelecting}
      >
        {(rootElRef, classNames, style, innerElRef, innerContent, dynamicProps) => (
          <tr className={[ 'fc-list-event' ].concat(classNames).join(' ')} ref={rootElRef}>
            {buildTimeContent(seg, timeFormat, context)}
            <td class='fc-list-event-graphic'>
              <span class='fc-list-event-dot fc-dot' style={{
                backgroundColor: dynamicProps.event.backgroundColor
              }} />
            </td>
            <td class='fc-list-event-title' ref={innerElRef}>
              {innerContent}
            </td>
          </tr>
        )}
      </EventRoot>
    )
  }

}


function renderEventInnerContent(props: EventMeta) {
  let { event } = props
  let url = event.url
  let anchorAttrs = url ? { href: url } : {}

  return (
    <a {...anchorAttrs}>{/* TODO: document how whole row become clickable */}
      {event.title || <Fragment>&nbsp;</Fragment>}
    </a>
  )
}


function buildTimeContent(seg: Seg, timeFormat: DateFormatter, context: ComponentContext): ComponentChildren {
  let { displayEventTime } = context.options

  if (displayEventTime !== false) {
    let eventDef = seg.eventRange.def
    let eventInstance = seg.eventRange.instance
    let timeText: string

    if (eventDef.allDay) {
      let innerProps = { view: context.view }
      return (
        <RenderHook name='allDay' mountProps={innerProps} dynamicProps={innerProps}>
          {(rootElRef, classNames, innerElRef, innerContent) => (
            <td class={[ 'fc-list-event-time' ].concat(classNames).join(' ')} ref={rootElRef}>
              {innerContent}
            </td>
          )}
        </RenderHook>
      )

    } else if (isMultiDayRange(seg.eventRange.range)) { // TODO: use (!isStart || !isEnd) instead?

      if (seg.isStart) {
        timeText = buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          eventInstance.range.start,
          seg.end
        )

      } else if (seg.isEnd) {
        timeText = buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          seg.start,
          eventInstance.range.end
        )
      }

    } else {
      timeText = buildSegTimeText(
        seg,
        timeFormat,
        context
      )
    }

    return (
      <td class='fc-list-event-time'>
        {timeText}
      </td>
    )
  }

  return null
}