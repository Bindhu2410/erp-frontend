import React, { useState, useCallback } from "react";
import { SalesBoard, SalesCard as SalesCardType } from "../models/Sales";
import SalesColumn from "./SalesColumn";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import SalesCard from "./SalesCard";

interface KanbanBoardProps {
  initialData: SalesBoard;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialData }) => {
  const [board, setBoard] = useState<SalesBoard>(initialData);
  const [activeCard, setActiveCard] = useState<SalesCardType | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeCardId = active.id;
      const overCardId = over.id;

      // Find the relevant source and destination columns
      const activeColumnIndex = board.findIndex((column) =>
        column.cards.some((card) => card.id === activeCardId)
      );

      let overColumnId: UniqueIdentifier;

      if (over.data.current?.type === "card") {
        const overCardColumnIndex = board.findIndex((column) =>
          column.cards.some((card) => card.id === overCardId)
        );
        overColumnId = board[overCardColumnIndex].id;
      } else {
        overColumnId = over.id;
      }

      if (activeColumnIndex === -1) return;

      const sourceColumn = board[activeColumnIndex];
      const destinationColumnIndex = board.findIndex(
        (column) => column.id === overColumnId
      );

      if (destinationColumnIndex === -1) return;

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];

        // Get the active card
        const activeCardIndex = sourceColumn.cards.findIndex(
          (card) => card.id === activeCardId
        );

        if (activeCardIndex === -1) return prevBoard;

        const [movedCard] = newBoard[activeColumnIndex].cards.splice(
          activeCardIndex,
          1
        );

        // If dragging over a card, insert before or after depending on position
        if (over.data.current?.type === "card") {
          const overCardIndex = newBoard[
            destinationColumnIndex
          ].cards.findIndex((card) => card.id === overCardId);

          if (overCardIndex === -1) return prevBoard;

          newBoard[destinationColumnIndex].cards.splice(
            overCardIndex,
            0,
            movedCard
          );
        } else {
          // If dragging over a column, append to the end
          newBoard[destinationColumnIndex].cards.push(movedCard);
        }

        return newBoard;
      });
    },
    [board]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCard(null);

      const { active, over } = event;
      if (!over) return;

      const activeCardId = active.id;
      const overCardId = over.id;

      if (activeCardId === overCardId) return;

      // Handle reordering within the same column
      const activeColumnIndex = board.findIndex((column) =>
        column.cards.some((card) => card.id === activeCardId)
      );

      if (activeColumnIndex === -1) return;

      const activeColumn = board[activeColumnIndex];
      const activeCardIndex = activeColumn.cards.findIndex(
        (card) => card.id === activeCardId
      );

      if (activeCardIndex === -1) return;

      // Find if overCardId is a card in the same column
      const overCardIndex = activeColumn.cards.findIndex(
        (card) => card.id === overCardId
      );

      if (overCardIndex !== -1) {
        // Reordering within the same column
        setBoard((prevBoard) => {
          const newBoard = [...prevBoard];
          newBoard[activeColumnIndex] = {
            ...activeColumn,
            cards: arrayMove(
              activeColumn.cards,
              activeCardIndex,
              overCardIndex
            ),
          };
          return newBoard;
        });
      }
    },
    [board]
  );

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  return (
    <div className="h-full flex flex-col">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 p-4 overflow-x-auto h-full">
          {board.map((column) => (
            <SalesColumn
              key={column.id}
              column={column}
              isCollapsed={collapsedColumns.includes(column.id)}
              onToggleCollapse={toggleColumnCollapse}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && <SalesCard card={activeCard} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
