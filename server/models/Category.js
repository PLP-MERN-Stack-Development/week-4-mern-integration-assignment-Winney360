const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Generate unique slug from name before saving
CategorySchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    return next();
  }

  try {
    let slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Ensure unique slug
    let count = 0;
    let uniqueSlug = slug;
    while (await mongoose.model('Category').findOne({ slug: uniqueSlug })) {
      count++;
      uniqueSlug = `${slug}-${count}`;
    }
    this.slug = uniqueSlug;
    console.log('Generated category slug:', this.slug); // Debug log
    next();
  } catch (err) {
    console.error('Error generating category slug:', err.message); // Debug log
    next(err);
  }
});

module.exports = mongoose.model('Category', CategorySchema);