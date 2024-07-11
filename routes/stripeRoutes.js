const express = require("express");
const router = express.Router();
const Product = require("../model/productModel");
require("dotenv").config();
// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

router.post("/create/stripe/product", async (request, response) => {
  const {
    productId,
    name,
    description,
    images,
    unit_label,
    default_price_data,
    metadata,
  } = request.body;

  try {
    const product = await stripe.products.create({
      name: name,
      description: description,
      images: images,
      unit_label: unit_label,
      default_price_data: {
        unit_amount: default_price_data.unit_amount,
        currency: "myr",
      },
      metadata: {
        merchantName: metadata.profileName,
        merchantEmail: metadata.profileEmail,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: default_price_data.unit_amount,
      currency: "myr",
    });

    const customer = await stripe.customers.create({
      id: product.id,
      metadata: {
        merchantName: metadata.profileName,
        merchantEmail: metadata.profileEmail,
      },
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
    });

    await Product.findByIdAndUpdate(productId, {
      paymentLink: paymentLink.url,
    });

    response.json({ product, price, customer, paymentLink });
  } catch (error) {
    response.status(500).json({ error: error });
  }
});

router.get("/get/stripe/products", async (request, response) => {
  try {
    const products = await stripe.products.list({
      limit: 3,
    });

    response.json(products);
  } catch (error) {
    response.status(500).json({ error: error });
  }
});

module.exports = router;
