import { useCallback, useEffect, useState } from "react";

import { createItem, getItemById, getItems, updateItem } from "../api/items.api.js";

export const useItem = (itemId) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(Boolean(itemId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId) return;
    let alive = true;
    setLoading(true);
    setError("");

    const run = async () => {
      try {
        const data = await getItemById(itemId);
        if (!alive) return;
        setItem(data);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || err?.message || "Failed");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [itemId]);

  return { item, loading, error };
};

export const useSimilarItems = () => {
  const fetchSimilar = useCallback(async ({ category, excludeOwnerId }) => {
    const res = await getItems({
      category,
      status: "available",
      sort: "newest",
      page: 1,
      limit: 6,
    });
    const list = res?.items ?? [];
    return list.filter((x) => {
      const ownerId = x?.owner?._id || x?.owner || x?.ownerId;
      if (!ownerId) return true;
      if (!excludeOwnerId) return true;
      return String(ownerId) !== String(excludeOwnerId);
    });
  }, []);

  return { fetchSimilar };
};

export const useCreateItem = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const run = async (payload) => {
    setPending(true);
    setError("");
    try {
      const res = await createItem(payload);
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create item";
      setError(msg);
      throw err;
    } finally {
      setPending(false);
    }
  };

  return { create: run, pending, error };
};

export const useUpdateItem = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const run = async (id, payload) => {
    setPending(true);
    setError("");
    try {
      const res = await updateItem(id, payload);
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to update item";
      setError(msg);
      throw err;
    } finally {
      setPending(false);
    }
  };

  return { update: run, pending, error };
};

