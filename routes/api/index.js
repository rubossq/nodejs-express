let express = require('express');
let router = express.Router();

let v1 = require('./v1');
router.use('/v1', v1);

module.exports = router;
