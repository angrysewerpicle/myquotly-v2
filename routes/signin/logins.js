const express = require('express')
const router = express.Router()
const login = require('../../models/signin/login')
const bycrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('login_acc/login', {username: ""})
})

router.post('/', (req, res) => {  // Get the 'first' field from the request body
    //res.render('login_acc/login', {username: req.body.username});

    // find each person with a last name matching 'Ghost'
    const query = login.findOne({ 'email': req.body.email});

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');
    // execute the query at a later time
    query.exec(async (err, login) => {
        if (err) {
            console.log(e)
            res.render('errorpage', {error: "internal server error"})
            return
        }
        try {
            if (login == null){
                res.render('errorpage', {error: "Acount does not exist!"})
            } else if (!login.verified) {
                res.render('errorpage', {error: "please verify your email first. Check your inbox."})
            } else {
                console.log(login.password)
                if (await bycrypt.compare(req.body.password, login.password)) {
                    res.send("login works")
                } else {
                    res.render('errorpage', {error: "incorrect password or username"})
                }
            }
        } catch(e) {
            res.send('error')
            console.log(e)
        }
    });
})

module.exports = router