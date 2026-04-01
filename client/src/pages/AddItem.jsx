import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import ItemForm from "../components/uniborrow/ItemForm.jsx";
import { useCreateItem } from "../hooks/useItems.js";

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authed = Boolean(user?.id);

  const { create, pending, error } = useCreateItem();
  const [localPending, setLocalPending] = useState(false);

  const submitLabel = useMemo(() => "Publish Listing", []);

  const handleSubmit = async (payload) => {
    setLocalPending(true);
    try {
      const res = await create(payload);
      const created = res?.item;
      toast.success("Listing created!");
      if (created?._id) {
        navigate(`/item/${created._id}`);
        return;
      }
      navigate("/browse");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create item"
      );
    } finally {
      setLocalPending(false);
    }
  };

  if (!authed) {
    toast.error("Please login to list an item.");
    navigate("/login");
    return null;
  }

  return (
    <ItemForm
      onSubmit={handleSubmit}
      pending={pending || localPending}
      submitLabel={submitLabel}
    />
  );
};

export default AddItem;

