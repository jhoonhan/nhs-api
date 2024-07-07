import { find, findById, create, update, deleteRecord } from '../db/queries.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await find();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await findById(req.params.id);
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProduct = async (req, res) => {
  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(403).json({ message: 'Please provide all fields' });
  }

  try {
    const product = await create(title, description, price);

    return res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProduct = async (req, res) => {
  const { title, description, price } = req.body;
  const id = req.params.id;

  if (!title || !description || !price) {
    return res.status(403).json({ message: 'Please provide all fields' });
  }

  try {
    const product = await update(title, description, price, id);

    return res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await deleteRecord(req.params.id);
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
