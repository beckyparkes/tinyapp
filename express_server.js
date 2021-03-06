////////////// DECLARATIONS/INITIALIZATIONS ////////////////////////

const express = require("express");
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString(6)],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  //shortURL as the object name
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

/////////// NEW COMMENT 
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "1@1.com", 
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

///////////    PRELIM STUFF     //////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 /////////////////////////////////////////////

 /////////// "/urls" //////////////////////////


 app.get("/urls", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const shortURLS = urlDatabase;

  console.log(id, "user id");
  console.log(user, "user");
  console.log(shortURLS, "shortURLS");


   const templateVars = { 
     shortURLS,
     user,
    };
   res.render("urls_index", templateVars);
 });


 app.post("/urls", (req, res) => {

    const shortURL = generateRandomString(8);
    const longURL = req.body.longURL;
  const userID = req.cookies['userID'];

  urlDatabase[shortURL] = {
    longURL,
    userID
  }
  res.redirect("/urls");

  res.redirect(`/urls/${shortUrl}`);
});


/////////////////////////////////////////////////

////////// "/urls/new" //////////////////////////


 app.get("/urls/new", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  
  if (!user) {
    // console.log("person is not logged in and cannot make a new URL");
    return res.status(403).send("Sorry! You are not logged in and cannot make a new URL. <a href= '/urls'>Click here to return home</a>, and select 'Login' or 'Register'");
  }

   const templateVars = { 
     shortURLS: urlDatabase,
     user
    };
   res.render("urls_new", templateVars); 
});

/////////////////////////////////////////////////

////////// "/urls/:shortURL" and routes /////////


//adding a route used to render this new template
 app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = req.session;
  
  const templateVars = { 
    shortURL, 
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === user.id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
})

//////////    MODIFY EXISTING URL    ////////////////


app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.userID;
  const user = users[id];

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  console.log("the longURL", longURL);

  if (urlDatabase[shortURL].userID === user.id) {
    
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("Not yours. Please <a href= '/login'>try again</a>");
  }

})

//////////////////////////////////////////////////

////////// "/login" and "/logout" //////////////


app.get("/login", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  res.render("user-login", { user });
})

app.post("/login", (req, res) => {
  const email = req.body.email;

  const password = req.body.password; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);


  if (bcrypt.compareSync(password, hashedPassword)) {
    const user = getUserByEmail(email, users);
    req.session.userID = user.id;
    return res.redirect(`/urls`);
  }//returns true
  return res.status(403).send("Invalid Credentials. Please <a href= '/login'>try again</a>"); 
   // returns false
})

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect("/urls");
})

//////////////////////////////////////////////

////////// "/register" ////////////////////////

app.get("/register", (req, res) => {

  const id = req.session.userID;
  const user = users[id];
  
  res.render("user-reg", { user });
  
})

app.post("/register", (req, res) => {

  const email = req.body.email;

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Missing email or password. Please <a href= '/register'>try again</a>");
  }

  const id = generateRandomString(8);
  const user = { id, email, password };
  users[id] = user;

  res.redirect("/urls");

})

