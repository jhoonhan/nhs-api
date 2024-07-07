import { find, create } from '../db/queries.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await find();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
export const getProduct = async (req, res) => {};
export const createProduct = async (req, res) => {
  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const product = await create(title, description, price);

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
export const updateProduct = async (req, res) => {};
export const deleteProduct = async (req, res) => {};
