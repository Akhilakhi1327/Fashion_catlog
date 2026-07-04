import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { createProduct } from '../../services/productService';
import ProductForm from '../../components/admin/ProductForm';
import { useToast } from '../../context/ToastContext';

const AddProductPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await createProduct(formData);
      if (res.success) {
        toast.success('Product published successfully in store catalog!');
        navigate('/admin/products');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error(err.response?.data?.message || 'Failed to publish product. Check details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 border rounded-lg text-gray-500 hover:text-indigo-950 hover:bg-gray-50 transition-all focus:outline-none"
          aria-label="Back to Products"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Add Product</h1>
          <p className="text-sm text-gray-500 mt-1">Publish a new catalog item with images</p>
        </div>
      </div>

      {/* Main product form */}
      <ProductForm onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
};

export default AddProductPage;
