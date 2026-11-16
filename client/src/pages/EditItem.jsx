import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import { useItem, useUpdateItem } from "../hooks/useItems.js";
import ItemForm from "../components/uniborrow/ItemForm.jsx";

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const authed = Boolean(user?.id);

  const { item, loading, error } = useItem(id);
  const { update, pending, error: updateError } = useUpdateItem();

  const [localPending, setLocalPending] = useState(false);

  const initialValues = useMemo(() => {
    const doc = item?.item || item || null;
    if (!doc) return null;

    return {
      title: doc.title,
      category: doc.category,
      condition: doc.condition,
      listingType: doc.listingType,
      price: doc.price,
      originalPrice: doc.originalPrice,
      description: doc.description,
      images: Array.isArray(doc.images) ? doc.images : [],
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      pickupLocation: doc.pickupLocation,
      status: doc.status,
    };
  }, [item]);

  useEffect(() => {
    if (!authed) {
      toast.error("Please login to edit an item.");
      navigate("/login");
    }
  }, [authed, navigate]);

  const handleSubmit = async (payload) => {
    setLocalPending(true);
    try {
      await update(id, payload);
      toast.success("Listing updated!");
      // After update, redirect to item detail.
      navigate(`/item/${id}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          updateError ||
          "Failed to update item"
      );
    } finally {
      setLocalPending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 space-y-4 shadow-sm animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 text-rose-500 font-semibold shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 font-medium shadow-sm">
          Item not found or already deleted.
        </div>
      </div>
    );
  }

  return (
    <ItemForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      pending={pending || localPending}
      submitLabel="Save Changes"
    />
  );
};

export default EditItem;

