const bcrypt = require('bcryptjs');

// Change 'dev123' to your desired password
const password = 'dev123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Bcrypt hash for password "' + password + '":');
  console.log(hash);
});