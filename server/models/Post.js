const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
    featuredImage: {
      type: String,
      default: 'default-post.jpg',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      maxlength: [200, 'Excerpt cannot be more than 200 characters'],
      default: '', // Make optional
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create unique slug from title before saving
PostSchema.pre('save', async function (next) {
  if (!this.isModified('title')) {
    return next();
  }

  try {
    let slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Check for duplicate slugs and append a number if necessary
    let count = 0;
    let uniqueSlug = slug;
    while (await mongoose.model('Post').findOne({ slug: uniqueSlug })) {
      count++;
      uniqueSlug = `${slug}-${count}`;
    }
    this.slug = uniqueSlug;
    console.log('Generated slug:', this.slug); // Debug log
    next();
  } catch (err) {
    console.error('Error generating slug:', err.message); // Debug log
    next(err);
  }
});

// Validate category and author ObjectIds
PostSchema.pre('save', async function (next) {
  try {
    if (this.isModified('category')) {
      const Category = mongoose.model('Category');
      const categoryExists = await Category.findById(this.category);
      if (!categoryExists) {
        return next(new Error('Invalid category ID'));
      }
    }
    if (this.isModified('author')) {
      const User = mongoose.model('User');
      const userExists = await User.findById(this.author);
      if (!userExists) {
        return next(new Error('Invalid author ID'));
      }
    }
    next();
  } catch (err) {
    console.error('Error validating category or author:', err.message); // Debug log
    next(err);
  }
});

// Virtual for post URL
PostSchema.virtual('url').get(function () {
  return `/posts/${this.slug}`;
});

// Method to add a comment
PostSchema.methods.addComment = async function (userId, content) {
  try {
    this.comments.push({ user: userId, content });
    await this.save();
    console.log('Comment added:', { userId, content }); // Debug log
    return this;
  } catch (err) {
    console.error('Error adding comment:', err.message); // Debug log
    throw err;
  }
};

// Method to increment view count
PostSchema.methods.incrementViewCount = async function () {
  try {
    this.viewCount += 1;
    await this.save();
    console.log('View count incremented:', this.viewCount); // Debug log
    return this;
  } catch (err) {
    console.error('Error incrementing view count:', err.message); // Debug log
    throw err;
  }
};

module.exports = mongoose.model('Post', PostSchema);