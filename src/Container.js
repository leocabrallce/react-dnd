import update from "immutability-helper";
import { memo, useCallback, useState } from "react";
import { useDrop } from "react-dnd";
import { Question } from "./components/Question.js";
import { Block } from "./components/Block.js";
import { ItemTypes } from "./models/ItemTypes.js";

const style = {
  width: 400
};
const ITEMS = {
  questions: [
    {
      id: "123",
      text: "Original question #1"
    },
    {
      id: "234",
      text: "Original question #2",
      block_id: "abc"
    },
    {
      id: "345",
      text: "Original question #3",
      block_id: "abc"
    },
    {
      id: "456",
      text: "Original question #4"
    },
    {
      id: "567",
      text: "Original question #5"
    },
    {
      id: "678",
      text: "Original question #6"
    },
    {
      id: "789",
      text: "Original question #7",
      block_id: "def"
    }
  ],
  blocks: [
    {
      id: "abc",
      text: "Block #1",
      questions: ["234", "345"]
    },
    {
      id: "def",
      text: "Block #2",
      questions: ["789"]
    },
    {
      id: "ghi",
      text: "Block #3"
    },
    {
      id: "jkl",
      text: "Block #4"
    }
  ]
};

const reduceBlocks = (questions, blocks) =>
  questions.reduce((array, current, currentIndex) => {
    let result;
    current.type = ItemTypes.QUESTION;

    if (current.block_id) {
      const previous = array.pop();

      if (previous && current.block_id === previous.id) {
        // if the current question should be in the same block
        result = array.concat({
          ...previous,
          questions: previous.questions.concat(current)
        });
      } else {
        // if the current questions should be in a different block
        const block = blocks.find((block) => block.id === current.block_id);
        const card = {
          ...block,
          type: ItemTypes.BLOCK,
          questions: [current]
        };

        result =
          currentIndex === 0
            ? array.concat(card)
            : array.concat(previous, card);
      }
    } else {
      // if the current question isn't in a block
      result = array.concat(current);
    }

    return result;
  }, []);

const appendEmptyBlocks = (blocks, cards) => {
  const emptyBlocks = blocks
    .filter((block) => !block.questions || !block.questions.length)
    .map((block) => {
      block.type = ItemTypes.BLOCK;
      return block;
    });
  return [...emptyBlocks, ...cards];
};

export const Container = memo(function Container() {
  const [questions, setQuestions] = useState(ITEMS.questions);
  const [blocks] = useState(ITEMS.blocks);
  const reducedBlocks = reduceBlocks(questions, blocks);
  // const cards = reduceBlocks(questions, blocks);
  const cards = appendEmptyBlocks(blocks, reducedBlocks);

  console.log(cards);
  const findQuestion = useCallback(
    (id) => {
      const question = questions.find((q) => `${q.id}` === id);
      return {
        question,
        index: questions.indexOf(question)
      };
    },
    [questions]
  );

  const findBlock = useCallback(
    (id) => {
      const block = blocks.find((b) => `${b.id}` === id);
      const firstQuestionIndex = questions.findIndex((q) => q.block_id === id);
      return {
        block,
        index: firstQuestionIndex
      };
    },
    [blocks, questions]
  );

  const moveQuestion = useCallback(
    (id, atIndex) => {
      const { question, index } = findQuestion(id);
      const questionAtIndex = questions.at(atIndex);

      if (question.block_id) {
        if (
          questionAtIndex.block_id &&
          question.block_id.valueOf() !== questionAtIndex.block_id.valueOf()
        ) {
          question.block_id = questionAtIndex.block_id;
        } else if (!questionAtIndex.block_id) {
          question.block_id = undefined;
        }
      } else if (questionAtIndex.block_id) {
        question.block_id = questionAtIndex.block_id;
      }

      const newQuestions = update(questions, {
        $splice: [
          [index, 1],
          [atIndex, 0, question]
        ]
      });

      setQuestions(newQuestions);
    },
    [findQuestion, questions, setQuestions]
  );

  const moveBlock = useCallback(
    (id, atIndex) => {
      const { block, index } = findBlock(id);
      if (block) {
        const isOverAnotherBlock =
          questions.at(atIndex).block_id &&
          questions.at(atIndex).block_id !== block.id;

        if (!isOverAnotherBlock) {
          block.questions = questions.filter(
            (question) => question.block_id === block.id
          );
          const newQuestions = update(questions, {
            $splice: [
              [index, block.questions.length],
              [atIndex, 0, ...block.questions]
            ]
          });

          setQuestions(newQuestions);
        }
      }
    },
    [findBlock, questions, setQuestions]
  );

  const [, drop] = useDrop(() => ({
    accept: [ItemTypes.QUESTION, ItemTypes.BLOCK]
  }));
  let index = -1;

  return (
    <div ref={drop} style={style}>
      {cards.map((card) => {
        if (card.type === ItemTypes.BLOCK) {
          return (
            <Block
              key={card.id}
              id={`${card.id}`}
              text={card.text}
              moveQuestion={moveQuestion}
              findQuestion={findQuestion}
              moveBlock={moveBlock}
              findBlock={findBlock}
            >
              {card.questions &&
                card.questions.map((question) => {
                  index++;

                  return (
                    <Question
                      key={question.id}
                      id={`${question.id}`}
                      text={question.text}
                      index={index}
                      moveQuestion={moveQuestion}
                      findQuestion={findQuestion}
                      moveBlock={moveBlock}
                      findBlock={findBlock}
                    />
                  );
                })}
            </Block>
          );
        } else {
          index++;
          return (
            <Question
              key={card.id}
              id={`${card.id}`}
              text={card.text}
              index={index}
              moveQuestion={moveQuestion}
              findQuestion={findQuestion}
              moveBlock={moveBlock}
              findBlock={findBlock}
            />
          );
        }
      })}
    </div>
  );
});
