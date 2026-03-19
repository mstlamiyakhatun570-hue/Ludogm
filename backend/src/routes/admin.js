const router = require('express').Router();
const { adminRouter } = require('./users');

// Mount admin user routes
router.use('/users', adminRouter);

module.exports = router;
