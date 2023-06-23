
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/passwords', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const passwordSchema = new mongoose.Schema({
  password: String,
});


const Password = mongoose.model('Password', passwordSchema);


app.use(bodyParser.json());


app.post('/passwords', (req, res) => {
  const password = req.body.password;

  const stepsRequired = checkPasswordStrength(password);

  if (stepsRequired === 0) {
    const newPassword = new Password({ password });
    newPassword.save()
      .then(() => {
        res.status(200).send('Password saved successfully!');
      })
      .catch((error) => {
        res.status(500).send('Error saving password to MongoDB: ' + error);
      });
  } else {
    res.status(400).send('Password is not strong enough. Steps required: ' + stepsRequired);
  }
});

function checkPasswordStrength(password) {
  const lowercaseRegex = /[a-z]/;
  const uppercaseRegex = /[A-Z]/;
  const digitRegex = /\d/;
  const repeatingRegex = /(\w)\1\1/;

  let steps = 0;

  if (password.length < 6) {
    steps += 6 - password.length;
  } else if (password.length > 20) {
    steps += password.length - 20;
  }

  if (!lowercaseRegex.test(password)) {
    steps++;
  }

  if (!uppercaseRegex.test(password)) {
    steps++;
  }

  if (!digitRegex.test(password)) {
    steps++;
  }

  if (repeatingRegex.test(password)) {
    steps++;
  }

  return steps;
}


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
