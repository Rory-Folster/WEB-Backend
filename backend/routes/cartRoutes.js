import Cart from '../models/cartModel.js';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';

const cartRouter = express.Router();

cartRouter.post(
    "/",
    isAuth,
    async (req, res) => {
    const { userId, productId, quantity, name, price } = req.body;
    try {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        //cart exists for user
        let itemIndex = cart.products.findIndex(p => p.productId == productId);
  
        if (itemIndex > -1) {
          //product exists in the cart, update the quantity
          let productItem = cart.products[itemIndex];
          productItem.quantity = quantity;
          cart.products[itemIndex] = productItem;
        } else {
          //product does not exists in cart, add new item
          cart.products.push({ productId, quantity, name, price });
        }
        cart = await cart.save();
        return res.status(201).send(cart);
      } else {
        //no cart for user, create new cart
        const newCart = await Cart.create({
          userId,
          products: [{ productId, quantity, name, price }]
        });
  
        return res.status(201).send(newCart);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong");
    }
  });

cartRouter.delete(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const cart = await Cart.findById(req.params.id);
      if (cart) {
        await cart.remove();
        res.send({ message: 'Cart Deleted' });
      } else {
        res.status(404).send({ message: 'Cart Not Found' });
      }
    })
  );


export default cartRouter;