const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport');
const cookieSession = require('cookie-session')
require('./google_auth/passport-setup');
const path = require('path')
const nlp = require('./services/nlp')
const db = require('./services/database')
const translate = require('./services/translate')
const utils = require('./utils/utils')

var userLogs = new Map();

app.use('/public', express.static(__dirname + '/public'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('html', require('ejs').renderFile);
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieSession({
    name: 'cc-session',
    keys: ['key1', 'key2']
  }))
// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());
// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}


app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/html/index.html')))
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get('/analyze', isLoggedIn, async (req, res) => {
  /*
  Pentru BD:
  - Inserat log nou
  const collection = 'logs'
  const data = {
    ce field-uri vrei tu, gen:
    date: '24.03.2022',
    user: 'plm'
  }
  db.firestoreClient.save(collection, data)
  */
  res.render(path.join(__dirname, "/html/form.html"), {google_name: req.user.displayName})
})

app.get('/home', isLoggedIn, (req, res) => res.render(path.join(__dirname, '/html/home.html'), {google_name: req.user.displayName}))

app.get('/logs', async (req, res) => {
  const collection = await db.firestoreClient.getAll('logs');
  var logs = []
  collection.forEach(doc => {
    logs.push({
      user: doc.user,
      loginDate: doc.loginDate,
      logoutDate: doc.logoutDate
    })
  })
  const data = {
    logs_array: logs
  }
  res.render(path.join(__dirname, "/html/logs.html"), data)
})

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile' ,'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    userLogs.set(req.user.displayName, new Date().toString())
    res.redirect('/home');
  }
);

app.post('/result', isLoggedIn, async (req, res) => {
  const textAnalysis = await nlp.analyzeText(req, res)
  const translation = await translate.translateText(req, res)

  const textLanguageCode = textAnalysis.get("documentLanguage")
  const textLanguage = utils.getLanguageByCode(textLanguageCode)
  const targetLanguage = utils.getLanguageByCode(req.body.target_language)

  var sentences = []
  for (var sentence of textAnalysis.get("sentences")) {
    // sentences.push(sentence.text.content)
    sentences.push(sentence)
  }
  
  const data = {
    original_text: req.body.text,
    input_text_language: textLanguage,
    translate_target_language: targetLanguage,
    translated_text: translation,
    sentences_array: sentences
  }
  res.render(path.join(__dirname, "/html/results.html"), data)
})

app.get('/logout', (req, res) => {
    var logoutDate = new Date();

    const data = {
      user: req.user.displayName,
      loginDate: userLogs.get(req.user.displayName),
      logoutDate: logoutDate.toString(),
    }
    db.firestoreClient.save('logs', data)

    req.session = null;
    req.logout();
    res.redirect('/');
})

app.listen(8080, () => console.log(`Example app listening on port ${8080}!`))