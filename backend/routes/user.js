import express from 'express'
import { User, Product, Bid } from '../orm/index.js'
import { sequelize } from '../orm/database.js'

const router = express.Router()

router.get('/api/users/:userId/products', async (req, res) => {
  try {
    const userId = req.params.userId
    const products = await Product.findAll({
      where: {
        sellerId: userId
      },
      include: [
        {
          model: Bid,
          attributes: [
            'amount',
            'createdAt',
            'status',
            [sequelize.fn('max', sequelize.col('amount')), 'highestBid']
          ],
          group: ['productId'],
          raw: true
        }
      ]
    })
    const productList = products.map(product => ({
      name: product.name,
      description: product.description,
      photo: product.photo,
      currentPrice: product.bids[0].highestBid || product.startingPrice,
      bidCount: product.bids.length,
      link: `/product/${product.id}`
    }))
    res.json(productList)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

router.get('/api/users/:userId/bids', async (req, res) => {
  try {
    const userId = req.params.userId
    const bids = await Bid.findAll({
      where: {
        userId
      },
      include: [Product]
    })
    const bidList = bids.map(bid => ({
      name: bid.product.name,
      link: `/product/${bid.productId}`,
      highestBid: bid.amount,
      date: bid.createdAt,
      status: bid.status
    }))
    res.json(bidList)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

// Get products and bids of authenticated user
router.get('/users/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login')
    }
    const userId = req.user.id
    const products = await Product.findAll({
      where: {
        sellerId: userId
      },
      include: [
        {
          model: Bid,
          attributes: [
            'amount',
            'createdAt',
            'status',
            [sequelize.fn('max', sequelize.col('amount')), 'highestBid']
          ],
          group: ['productId'],
          raw: true
        }
      ]
    })
    const productList = products.map(product => ({
      name: product.name,
      description: product.description,
      photo: product.photo,
      currentPrice: product.bids[0].highestBid || product.startingPrice,
      bidCount: product.bids.length,
      link: `/product/${product.id}`
    }))
    const bids = await Bid.findAll({
      where: {
        userId
      },
      include: [Product]
    })
    const bidList = bids.map(bid => ({
      name: bid.product.name,
      link: `/product/${bid.productId}`,
      highestBid: bid.amount,
      date: bid.createdAt,
      status: bid.status
    }))
    res.render('user', {
      user: req.user,
      productList,
      bidList
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

export default router
