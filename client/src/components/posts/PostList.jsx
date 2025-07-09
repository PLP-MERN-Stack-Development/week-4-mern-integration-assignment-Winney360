import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { postService } from '../../services/api';

export default function PostList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimisticPosts, setOptimisticPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getAllPosts();
        console.log('API Response in PostList:', data); // Debug log
        setPosts(Array.isArray(data) ? data : []); // Handle flat array
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error(error.response?.data?.error || 'Failed to load posts');
        setPosts([]);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Listen for postsUpdated event to refresh after creation
  useEffect(() => {
    const handlePostsUpdated = () => {
      console.log('Posts updated event received, refetching...'); // Debug log
      fetchPosts(); // Re-fetch posts on update
    };

    window.addEventListener('postsUpdated', handlePostsUpdated);
    return () => window.removeEventListener('postsUpdated', handlePostsUpdated);
  }, []);

  // Listen for optimistic post updates from PostForm
  useEffect(() => {
    const handleOptimisticPost = (event) => {
      const newPost = event.detail;
      console.log('Optimistic post received:', newPost); // Debug log
      setOptimisticPosts((prev) => [newPost, ...prev].filter((post, index, self) =>
        index === self.findIndex((p) => p._id === post._id)
      )); // Avoid duplicates
    };

    window.addEventListener('optimisticPost', handleOptimisticPost);
    return () => window.removeEventListener('optimisticPost', handleOptimisticPost);
  }, []);

  const handleDelete = async (postId) => {
    try {
      // Optimistic delete
      const originalPosts = [...posts];
      setPosts(posts.filter((post) => post._id !== postId));
      toast.info('Deleting post...');

      await postService.deletePost(postId);
      toast.success('Post deleted successfully');
    } catch (error) {
      setPosts(originalPosts);
      toast.error(error.response?.data?.error || 'Failed to delete post');
    }
  };

  const allPosts = [...optimisticPosts, ...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  console.log('allPosts:', allPosts); // Debug log to check the final array

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Blog Posts</h2>
      {allPosts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        <div className="grid gap-6">
          {allPosts.map((post) => (
            <div key={post._id} className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                <Link to={`/posts/${post._id}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-2">{post.excerpt || post.content.substring(0, 100) + '...'}</p>
              <p className="text-sm text-gray-500">
                By {post.author?.username || 'Unknown'} on{' '}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              {user && post.author?._id === user._id && (
                <div className="mt-2">
                  <Link
                    to={`/edit/${post._id}`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Link
          to="/create"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create New Post
        </Link>
      </div>
    </div>
  );
}