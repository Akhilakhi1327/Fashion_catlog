import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { getProductById, updateProduct } from '../../services/productService';
import ProductForm from '../../components/admin/ProductForm';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error('Error fetching product for edit:', err);
        toast.error('Failed to retrieve product details from database');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await updateProduct(id, formData);
      if (res.success) {
        toast.success('Product details updated successfully!');
        navigate('/admin/products');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error(err.response?.data?.message || 'Failed to save updates. Check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Modify properties and image arrays of published items</p>
        </div>
      </div>

      {/* Main product form */}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={submitting}
        isEdit={true}
      />
    </div>
  );
};

export default EditProductPage;
