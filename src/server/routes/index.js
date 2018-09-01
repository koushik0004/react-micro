var express = require('express');
var router = express.Router();
var templateResolver = require('../utils/template-resolver');
router.get('/*', async function(req, res, next) {
  try {
    await templateResolver(req, res, next);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
