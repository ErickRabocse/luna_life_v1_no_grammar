import { useDragLayer } from 'react-dnd'

export default function CustomDragLayer() {
  const { isDragging, itemType, item, currentOffset } = useDragLayer(
    (monitor) => ({
      isDragging: monitor.isDragging(),
      itemType: monitor.getItemType(),
      item: monitor.getItem(),
      currentOffset: monitor.getSourceClientOffset(),
    })
  )

  if (!isDragging || !currentOffset || itemType !== 'word') {
    return null
  }

  const style = {
    position: 'fixed',
    pointerEvents: 'none',
    left: currentOffset.x,
    top: currentOffset.y,
    zIndex: 10000,
    transform: 'translate(-20%, -20%)',
    fontWeight: 'normal',
    fontSize: '1.1rem',
    background: 'rgba(66, 135, 245, 0.13)', // subtle light blue with transparency
    color: 'green',
    borderRadius: '14px',
    boxShadow: '0 2px 8px 0 rgba(66,135,245,0.11)', // soft blue shadow
    padding: '5px 10px',
    border: '1.5px solid #90caf9', // subtle blue border
    outline: 'none',
    opacity: 0.93, // slightly see-through
  }

  return <div style={style}>{item.word}</div>
}
