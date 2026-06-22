const mongoose = require('mongoose');
const Product = require('../models/Product');

// POST /products  — Create a product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category } = req.body;
    const product = await Product.create({ name, price, description, category });
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

// GET /products  — List with filtering, price range, and pagination
// Query params: ?category=electronics&minPrice=100&maxPrice=500&page=1&limit=10&sort=newest
exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category.toLowerCase();

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: products,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /products/:id  — Get a single product
exports.getProductById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

// PUT /products/:id  — Update a product
exports.updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    const { name, price, description, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, category },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

// DELETE /products/:id  — Delete a product
exports.deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Product deleted', data: product });
  } catch (err) {
    return next(err);
  }
};
