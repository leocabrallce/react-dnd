import { memo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../models/ItemTypes.js";

const style = {
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  marginBottom: ".5rem",
  backgroundColor: "white",
  cursor: "move"
};

export const Block = memo(function Block({
  id,
  text,
  children,
  moveBlock,
  findBlock,
  moveQuestion,
  findQuestion
}) {
  const originalIndex = findBlock(id).index;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.BLOCK,
      item: { id, originalIndex },
      canDrag: !!children,
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveBlock(droppedId, originalIndex);
        }
      }
    }),
    [id, originalIndex, moveBlock]
  );
  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.BLOCK],
      collect: (monitor) => ({
        item: monitor.getItem()
      }),
      hover({ id: draggedId }, monitor) {
        const type = monitor.getItemType();
        const { index: overIndex } = findBlock(id);

        if (type === ItemTypes.BLOCK && draggedId !== id) {
          moveBlock(draggedId, overIndex);
        }
      }
    }),
    [findBlock, moveBlock, findQuestion, moveQuestion]
  );
  const opacity = isDragging ? 0.3 : 1;

  return (
    <div ref={(node) => drag(drop(node))} style={{ ...style, opacity }}>
      <div>{text}</div>
      <div>{children}</div>
    </div>
  );
});
