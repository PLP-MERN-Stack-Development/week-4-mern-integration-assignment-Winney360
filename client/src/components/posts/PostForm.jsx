import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { postService, categoryService } from '../../services/api';
import * as Yup from 'yup';

// Validation schema (excluding file as it's handled by multer)
const postSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  content: Yup.string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters'),
  categoryId: Yup.string().required('Category is required'),
});

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    featuredImage: null, // Changed from featuredimage to featuredImage
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [optimisticPost, setOptimisticPost] = useState(null);

  useEffect(() => {
    console.log('User from AuthContext:', user);
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        console.log('Categories Response:', data);
        setCategories(data || []);
        if (data.length > 0 && !id) setFormData((prev) => ({ ...prev, categoryId: data[0]._id }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories: ' + (error.message || 'Unknown error'));
      }
    };

    const fetchPost = async () => {
      if (id) {
        try {
          const data = await postService.getPost(id);
          setFormData({
            title: data.title,
            content: data.content,
            categoryId: data.category._id,
            featuredImage: null, // File input will override this
          });
        } catch (error) {
          toast.error('Failed to load post');
          navigate('/posts');
        }
      }
    };

    fetchCategories();
    if (id) fetchPost();
  }, [id, navigate, user]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    const newFormData = {
      ...formData,
      [name]: files ? files[0] : value,
    };
    setFormData(newFormData);
    console.log('FormData updated:', newFormData); // Debug log

    try {
      await postSchema.validateAt(name, newFormData);
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [name]: error.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting formData:', formData); // Debug log
      await postSchema.validate(formData, { abortEarly: false });

      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('categoryId', formData.categoryId);
      if (formData.featuredImage) {
        data.append('featuredImage', formData.featuredImage); // Changed from image to featuredImage
      }

      // Log FormData contents
      for (let [key, value] of data.entries()) {
        console.log(`FormData entry: ${key}=${value}`);
      }

      if (!user || !user._id) {
        throw new Error('User not authenticated');
      }
      const tempPost = {
        _id: id || `temp-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        category: categories.find((cat) => cat._id === formData.categoryId) || {
          _id: formData.categoryId,
          name: 'Loading...',
        },
        author: { _id: user._id, username: user.username },
        createdAt: new Date().toISOString(),
        featuredImage: formData.featuredImage
          ? URL.createObjectURL(formData.featuredImage)
          : 'default-post.jpg',
      };
      setOptimisticPost(tempPost);
      toast.info(id ? 'Updating post...' : 'Creating post...');

      let response;
      if (id) {
        response = await postService.updatePost(id, data);
        toast.success('Post updated successfully');
      } else {
        response = await postService.createPost(data);
        toast.success('Post created successfully');
      }

      setOptimisticPost(null);
      window.dispatchEvent(new Event('postsUpdated'));
      navigate('/posts');
    } catch (error) {
      setOptimisticPost(null);
      console.error('Post submission error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.error || 'Failed to save post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {id ? 'Edit Post' : 'Create Post'}
      </h2>
      {optimisticPost && (
        <div className="mb-4 p-4 bg-green-100 rounded-md">
          <p>Optimistic Preview:</p>
          <p>
            <strong>{optimisticPost.title}</strong>
          </p>
          <p>{optimisticPost.content.substring(0, 100)}...</p>
          {optimisticPost.featuredImage && (
            <img
              src={optimisticPost.featuredImage}
              alt="Optimistic Preview"
              className="mt-2 w-32 h-auto"
            />
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} encType="multipart/form-data"> {/* Added encType */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.title ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            name="content"
            id="content"
            value={formData.content}
            onChange={handleChange}
            rows="5"
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.content ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          ></textarea>
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="categoryId"
            id="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.categoryId ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            <option value="">Select a category</option>
            {categories.length === 0 ? (
              <option value="" disabled>
                No categories available
              </option>
            ) : (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700"> {/* Changed from image */}
            Featured Image
          </label>
          <input
            type="file"
            name="featuredImage" // Changed from image
            id="featuredImage" // Changed from image
            accept="image/*"
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Saving...' : id ? 'Update Post' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}