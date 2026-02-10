const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
