import { useState, useCallback } from 'react';
import { getColumns, getCardsInColumn, createCard, updateCard, deleteCard, moveCard as moveCardApi } from '../api/cards';

export function useCards(boardId) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const colRes = await getColumns(boardId);
      const cols = colRes.data;

      // Fetch cards for each column in parallel
      const colsWithCards = await Promise.all(
        cols.map(async (col) => {
          const cardRes = await getCardsInColumn(col.id);
          return { ...col, cards: cardRes.data };
        })
      );
      setColumns(colsWithCards);
    } catch (err) {
      console.error('Failed to fetch board data:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const addCard = async (data) => {
    const res = await createCard(data);
    const newCard = res.data;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === newCard.column_id
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );
    return newCard;
  };

  const editCard = async (id, data) => {
    const res = await updateCard(id, data);
    const updated = res.data;
    // Re-fetch whole board to handle column moves cleanly
    await fetchBoard();
    return updated;
  };

  const removeCard = async (id, columnId) => {
    await deleteCard(id);
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== id) }
          : col
      )
    );
  };

  const moveCard = async (cardId, sourceColumnId, targetColumnId, newPosition) => {
    // Optimistic update — move card in local state immediately
    setColumns((prev) => {
      const newCols = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const sourceCol = newCols.find((c) => c.id === sourceColumnId);
      const targetCol = newCols.find((c) => c.id === targetColumnId);
      if (!sourceCol || !targetCol) return prev;

      const cardIndex = sourceCol.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = sourceCol.cards.splice(cardIndex, 1);
      card.column_id = targetColumnId;
      targetCol.cards.splice(newPosition, 0, card);

      // Update positions
      sourceCol.cards.forEach((c, i) => (c.position = i));
      targetCol.cards.forEach((c, i) => (c.position = i));

      return newCols;
    });

    // Persist to backend
    try {
      await moveCardApi(cardId, { column_id: targetColumnId, position: newPosition });
    } catch (err) {
      console.error('Failed to move card:', err);
      // Revert on failure
      await fetchBoard();
    }
  };

  return { columns, loading, fetchBoard, addCard, editCard, removeCard, moveCard };
}
