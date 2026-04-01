import { useEffect, useState, useCallback } from "react";

import { getReviewsForItem } from "../api/reviews.api.js";

export const useItemReviews = (itemId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(Boolean(itemId));
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getReviewsForItem(itemId);
      setReviews(data?.reviews ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load"
      );
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (!itemId) return;
    refetch();
  }, [itemId]);

  return { reviews, loading, error, setReviews, refetch };
};

