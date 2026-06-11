import { useState, useCallback } from 'react';
import { getColumns, getCardsInColumn, createCard, updateCard, deleteCard } from '../api/cards';

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
    // TODO: optimize to only update in-place if column didn't change
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

  return { columns, loading, fetchBoard, addCard, editCard, removeCard };
}
