import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostList from './components/posts/PostList';
import PostDetails from './components/posts/PostDetails';
import PostForm from './components/posts/PostForm';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/posts"
              element={
                <ProtectedRoute>
                  <PostList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/:id"
              element={
                <ProtectedRoute>
                  <PostDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <PostForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <PostForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}