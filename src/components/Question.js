import { memo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../models/ItemTypes.js";

const style = {
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  margin: "0 0 0.5rem",
  backgroundColor: "white",
  cursor: "move"
};

export const Question = memo(function Question({
  id,
  text,
  moveQuestion,
  findQuestion,
  findBlock,
  moveBlock
}) {
  const originalIndex = findQuestion(id).index;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.QUESTION,
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveQuestion(droppedId, originalIndex);
        }
      }
    }),
    [id, originalIndex, moveQuestion]
  );
  const [collect, drop] = useDrop(
    () => ({
      accept: [ItemTypes.QUESTION, ItemTypes.BLOCK],
      collect: (monitor) => ({ item: monitor.getItem() }),
      hover({ id: draggedId }, monitor) {
        const type = monitor.getItemType();
        const { index: overIndex } = findQuestion(id);

        if (type === ItemTypes.QUESTION && draggedId !== id) {
          moveQuestion(draggedId, overIndex);
        } else if (type === ItemTypes.BLOCK && draggedId) {
          moveBlock(draggedId, overIndex);
        }
      }
    }),
    [findQuestion, moveQuestion, findBlock, moveBlock]
  );

  let opacity = 1;
  if (isDragging || (collect.item && collect.item.id === id)) {
    opacity = 0.3;
  }

  return (
    <div ref={(node) => drag(drop(node))} style={{ ...style, opacity }}>
      Q{originalIndex + 1} | {text}
    </div>
  );
});
