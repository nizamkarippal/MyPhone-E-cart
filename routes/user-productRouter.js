const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const  userSession= require('../middlewares/userSessionMD')
const objectIdCheck = userSession.objectIdCheck;
const productListing = require('../controllers/userproduct/user-productListing');
const product = require('../controllers/userproduct/user-singleproduct')


// ========user Product listing  sorting, filtter and seraching
router.get('/productsinglesarch',productListing.singleview)
router
      .route('/products')
      .get(productListing.collection)
      .patch(productListing.currentFilter)
      .post(productListing.sortBy)
      .put(productListing.search)

//======================SINGLE PRODUCT PAGE ====================================
router
      .route('/products/:id')
      .get(objectIdCheck, product.view)
      .patch(objectIdCheck, product.listedCheck);


module.exports = router;




