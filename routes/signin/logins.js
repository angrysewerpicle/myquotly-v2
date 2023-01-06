const express = require('express')
const router = express.Router()
const login = require('../../models/signin/login')
const bcrypt = require('bcrypt')
const PasswordReset = require('../../models/signin/PasswordReset')

//umm idk if i need uuid

const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid')

//nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

//router get stuf ---------------->

router.get('/', (req, res) => {
    res.render('login_acc/login', {username: ""})
    //res.render('errorpage', {error: "my special message"})
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
                //console.log(login.password)
                if (await bcrypt.compare(req.body.password, login.password)) {
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

//password reset stuff
router.post('/requestPasswordReset', async (req, res) => {
    const {email, redirectUrl} = req.body

    Login.find({email})
        .then((data) => {
            if (data.length) {
                if (!data[0].verified) {
                    res.render('errorpage', {error: "please verify email first"})
                } else {
                    //proceed with email to reset password
                    sendResetEmail(data[0], redirectUrl, res);
                }
            }
        })
        .catch((e) => {
            console.log(e)
            res.render('errorpage', {error: "no account with this email exists"})
        })
})

//send password reset email
const sendResetEmail = ({_id, email}, redirectUrl, res) => {
    const resetString = uuidv4 + _id

    //clearing all existing reset records
    PasswordReset.deleteMany({userId: _id})
        .then((result) => {
            //reset records deleted 
            //now send the email
            const mailoptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Password Reset",
                html: `<p> Use link below to reset your password</p><p>This link 
                <b>expires in 6 hours</b>.</p><p>Press <a href=${
                    redirectUrl+"/"+ _id + "/" + resetString}>here</a>
                 to proceed.</p>`
            }

            bcrypt.hash(resetString, 10)
                .then((hashedResetString => {
                    //set values in password reset collection
                    const newPasswordReset = new PasswordReset({
                        userId: _id,
                        resetString: hashedResetString,
                        createdAt: Date.now(),
                        expiresAt: Date.now()+3600000
                    })
                    
                    newPasswordReset.save()
                        .then(() => {
                            transporter.sendMail(mailOptions)
                                .then(() => {
                                    res.render('login_acc/resetpass')
                                })
                                .catch((e) => {
                                    console.log(e)
                                    res.render('errorpage', {error: "failed to send mail!"}) 
                                })
                        })
                        .catch((e) => {
                            console.log(e)
                            res.render('errorpage', {error: "could not save password reset data!"})
                        })
                }))
                .catch((e) => {
                    console.log(e)
                    res.render('errorpage', {error: "error while hashing reset password"})
                })
        })
        .catch((e) => {
            console.log(e)
            res.render('errorpage', {error: "error while clearing existing records"})
        })
}

module.exports = router