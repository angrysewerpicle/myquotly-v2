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
    query.exec(async function (err, login) {
        if (err) return handleError(err);
        // Prints "Space Ghost is a talk show host."
        try {
            console.log(login.password)
            if (await bycrypt.compare(req.body.password, login.password)) {
                res.send("login works")
            } else {
                res.send("login failed")
            }
        } catch(e) {
            res.send('error')
            //console.log(e)
        }
    });
})

module.exports = router