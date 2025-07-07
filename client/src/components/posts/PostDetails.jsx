
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postService } from '../../services/api';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getPost(id);
        setPost(data);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load post');
        navigate('/posts');
      }
    };
    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center mt-8">Post not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-4">{post.title}</h2>
      {post.featuredImage && (
        <img
          src={`${import.meta.env.VITE_API_URL}/uploads/${post.featuredImage}`}
          alt={post.title}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      )}
      <p className="text-gray-600 mb-2">
        By {post.author?.username || 'Unknown'} on{' '}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-600 mb-4">Category: {post.category?.name || 'Uncategorized'}</p>
      <div className="prose max-w-none">{post.content}</div>
      {post.comments && post.comments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Comments</h3>
          {post.comments.map((comment) => (
            <div key={comment._id} className="border-t pt-2 mt-2">
              <p className="text-gray-600">
                {comment.user?.username || 'Anonymous'}: {comment.content}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}