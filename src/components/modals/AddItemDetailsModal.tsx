"use client";
import React, { useState, useEffect, useMemo } from "react";
import BaseModal from "./BaseModal";
import { ItemDetails } from "../../types/address";

interface AddItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItemDetails) => void | Promise<void>;
  initialData?: ItemDetails;
  title?: string;
}

// Map of field -> error message
type ErrorMap = Partial<Record<keyof ItemDetails, string>>;

const AddItemDetailsModal: React.FC<AddItemDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = "Item Details",
}) => {
  const emptyForm: ItemDetails = useMemo(() => ({
    name: "",
    sku: "",
    category: "",
    price: null,
    taxType: "",
    discount: null,
    discountType: "percent",
    imageUrl: "",
    quantity: null,
    weight: null,
    length: null,
    breadth: null,
    height: null,
  }), []);

  const [formData, setFormData] = useState<ItemDetails>(emptyForm);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Accessories",
    "Beauty & Personal Care",
    "Home & Kitchen",
    "Sports & Outdoors",
    "Toys & Games",
    "Automotive",
    "Health & Wellness",
    "Others",
  ];

  // Initialize / hydrate form
  useEffect(() => {
    setFormData(initialData ?? emptyForm);
    setErrors({});
  }, [initialData, isOpen, emptyForm]); // re-hydrate when modal opens with new data

  const handleInputChange = (
    field: keyof ItemDetails,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value } as ItemDetails));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isValidUrl = (s: string): boolean => {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorMap = {};

    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.price === null) newErrors.price = "Price is required";

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setErrors({});
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add item category and other details
        </p>

        {/* Basic Item Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter item name"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SKU Code
            </label>
            <input
              type="text"
              value={formData.sku ?? ""}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              placeholder="Enter SKU code"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            {/* <select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.category
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
              }`}
            >
              <option value="">For example, Electronics</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select> */}
            <input type="text" value={formData.category} onChange={(e) => handleInputChange("category", e.target.value)} placeholder="Enter category" className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.category
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
            }`} />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={formData.price ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "price",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="Enter price"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.price
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Product Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Image <span className="text-gray-400">Optional</span>
          </label>
          <input
            type="url"
            value={formData.imageUrl ?? ""}
            onChange={(e) => handleInputChange("imageUrl", e.target.value)}
            placeholder="Enter Image URL"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.imageUrl
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
            }`}
          />
          {errors.imageUrl && (
            <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
          )}
        </div>


        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Add Item</span>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddItemDetailsModal;
