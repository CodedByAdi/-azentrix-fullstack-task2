import { useState, useEffect, useCallback } from 'react';
import { getBoards, createBoard, updateBoard, deleteBoard } from '../api/boards';

export function useBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBoards();
      setBoards(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const addBoard = async (data) => {
    const res = await createBoard(data);
    setBoards((prev) => [res.data, ...prev]);
    return res.data;
  };

  const editBoard = async (id, data) => {
    const res = await updateBoard(id, data);
    setBoards((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    return res.data;
  };

  const removeBoard = async (id) => {
    await deleteBoard(id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  return { boards, loading, error, fetchBoards, addBoard, editBoard, removeBoard };
}
