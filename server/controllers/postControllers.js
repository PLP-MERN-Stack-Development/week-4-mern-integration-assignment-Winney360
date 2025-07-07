     const Post = require('../models/Post');
     const Category = require('../models/Category');
     const mongoose = require('mongoose');
     const multer = require('multer');
     const path = require('path');
     const slugify = require('slugify');

     // Multer configuration
     const storage = multer.diskStorage({
       destination: (req, file, cb) => cb(null, 'uploads/'),
       filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
     });
     const upload = multer({ storage });

     // Controller to create a post
     const createPost = async (req, res) => {
       try {
         console.log('CreatePost - Request body:', req.body);
         console.log('CreatePost - File:', req.file);
         console.log('CreatePost - User:', req.user);

         const { title, content, categoryId } = req.body;

         if (!title || !content || !categoryId) {
           console.log('CreatePost - Missing required fields:', { title, content, categoryId });
           return res.status(400).json({ success: false, error: 'Title, content, and category are required' });
         }

         if (!mongoose.isValidObjectId(categoryId)) {
           console.log('CreatePost - Invalid categoryId:', categoryId);
           return res.status(400).json({ success: false, error: 'Invalid category ID' });
         }

         const category = await Category.findById(categoryId);
         if (!category) {
           console.log('CreatePost - Category not found:', categoryId);
           return res.status(400).json({ success: false, error: 'Category not found' });
         }

         if (!req.user || !req.user.id) {
           console.log('CreatePost - User not authenticated:', req.user);
           return res.status(401).json({ success: false, error: 'User not authenticated' });
         }

         const slug = slugify(title, { lower: true, strict: true }); // Generate slug from title
         const post = new Post({
           title,
           content,
           category: categoryId,
           featuredImage: req.file ? req.file.filename : 'default-post.jpg',
           author: req.user.id,
           slug, // Add the generated slug
         });

         await post.save();
         console.log('CreatePost - Post created:', post);
         res.status(201).json(post);
       } catch (err) {
         console.error('CreatePost - Error:', err.message, err.stack);
         if (err.name === 'MongoServerError' && err.code === 11000) {
           return res.status(400).json({ success: false, error: 'Duplicate slug detected' });
         }
         res.status(500).json({ success: false, error: 'Server error during post creation' });
       }
     };

     // Controller to get all posts (example)
     const getPosts = async (req, res) => {
       try {
         const posts = await Post.find().populate('category').populate('author', 'username email');
         console.log('GetPosts - Retrieved posts:', posts.length);
         res.status(200).json(posts);
       } catch (err) {
         console.error('GetPosts - Error:', err.message, err.stack);
         res.status(500).json({ success: false, error: 'Server error retrieving posts' });
       }
     };

     // Controller to get a single post (example)
     const getPostById = async (req, res) => {
       try {
         const post = await Post.findById(req.params.id).populate('category').populate('author', 'username email');
         if (!post) {
           console.log('GetPostById - Post not found:', req.params.id);
           return res.status(404).json({ success: false, error: 'Post not found' });
         }
         console.log('GetPostById - Retrieved post:', post);
         res.status(200).json(post);
       } catch (err) {
         console.error('GetPostById - Error:', err.message, err.stack);
         res.status(500).json({ success: false, error: 'Server error retrieving post' });
       }
     };

     // Controller to update a post (example)
     const updatePost = async (req, res) => {
       try {
         const { title, content, categoryId } = req.body;
         const post = await Post.findById(req.params.id);
         if (!post) {
           console.log('UpdatePost - Post not found:', req.params.id);
           return res.status(404).json({ success: false, error: 'Post not found' });
         }
         if (post.author.toString() !== req.user.id) {
           console.log('UpdatePost - Unauthorized:', { postAuthor: post.author, userId: req.user.id });
           return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
         }
         const slug = title ? slugify(title, { lower: true, strict: true }) : post.slug; // Update slug if title changes
         const updatedPost = await Post.findByIdAndUpdate(
           req.params.id,
           { title, content, category: categoryId, featuredImage: req.file ? req.file.filename : post.featuredImage, slug },
           { new: true, runValidators: true }
         );
         console.log('UpdatePost - Post updated:', updatedPost);
         res.status(200).json(updatedPost);
       } catch (err) {
         console.error('UpdatePost - Error:', err.message, err.stack);
         res.status(500).json({ success: false, error: 'Server error updating post' });
       }
     };

     // Controller to delete a post (example)
     const deletePost = async (req, res) => {
       try {
         const post = await Post.findById(req.params.id);
         if (!post) {
           console.log('DeletePost - Post not found:', req.params.id);
           return res.status(404).json({ success: false, error: 'Post not found' });
         }
         if (post.author.toString() !== req.user.id) {
           console.log('DeletePost - Unauthorized:', { postAuthor: post.author, userId: req.user.id });
           return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
         }
         await Post.findByIdAndDelete(req.params.id);
         console.log('DeletePost - Post deleted:', req.params.id);
         res.status(200).json({ success: true, message: 'Post deleted' });
       } catch (err) {
         console.error('DeletePost - Error:', err.message, err.stack);
         res.status(500).json({ success: false, error: 'Server error deleting post' });
       }
     };

     module.exports = {
       createPost,
       getPosts,
       getPostById,
       updatePost,
       deletePost,
       upload,
     };