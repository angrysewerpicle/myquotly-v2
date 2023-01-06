const express = require('express')
const router = express.Router()
const Login = require('../../models/signin/login')
const bcrypt = require('bcrypt')
require('dotenv').config()
const VerifLogin = require('../../models/signin/userverification')

const nodemailer = require('nodemailer')
const {v4: uuid} = require('uuid')

//nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

//testing success
transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log('ready for messages: '+success)
    }
})

// send verification email
const sendVerificationemail = ({_id, email}, res) => {
    //url to be used in the email
    const currentUrl = process.env.EMAIL_SEND_URL

    const uniqueString = uuid()+_id;

    //mail options
    const mailoptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your email",
        html: `<p> Verify your email address to complete the signup and login to your account.</p><p>This link 
        <b>expires in 6 hours</b>.</p><p>Press <a href=${
            currentUrl+"register/verify/"+ _id + "/" + uniqueString}>here</a>
         to proceed.</p>`
    }
    bcrypt.hash(uniqueString, 10)
        .then((hashedUniqueString) => {
            //set values in userVerification collection
            const newverification = new VerifLogin({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 21600000,
            })
            newverification.save()
                .then(() => {
                    transporter.sendMail(mailoptions)
                        .then(() => {
                            //email sent and verification record saved
                            res.render('registor_acc/request_verify')
                        })
                        .catch((e) =>{
                            console.log(e)
                            res.render('errorpage', {error: e})
                        })
                })
                .catch((e) => {
                    console.log(e)
                    res.render('errorpage', {error: e})
                })
        })
        .catch((e) => {
            console.log(e)
            res.render('errorpage', {error: e})
        })
    
}

router.get('/verify/:userId/:uniqueString', (req, res) => {
    let { userId, uniqueString } = req.params
    VerifLogin.find({userId})
        .then((result) => {
            if (result.length > 0){
                //console.log(result)

                const { expiresAt } = result[0]
                const hashedUniqueString = result[0].uniqueString

                if (expiresAt < Date.now()){
                    VerifLogin.deleteOne({userId})
                        .then(() => {
                            Login.deleteOne({_id: userId})
                                .then(res => {
                                    res.render('errorpage', {error: 'Link has expired. Please sign up again.'})
                                })
                                .catch(e => {
                                    console.log(e)
                                    res.render('errorpage', {error: 'error occured while clearing user with expired unique string.'})
                                })
                        })
                        .catch((e) => {
                            console.log(e)
                            res.render('errorpage', {error: 'error occured while clearing expired user verification record.'})
                        })
                } else {
                    //validate record exists
                    //first compare hased unique string
                    //console.log(uniqueString)
                    //console.log(hashedUniqueString)
                    bcrypt.compare(uniqueString, hashedUniqueString)
                        .then((result) => {
                            if (result) {
                                //strings match
                                Login.updateOne({_id: userId}, {verified: true})
                                    .then(() => {
                                        VerifLogin.deleteOne({userId})
                                            .then(() => {
                                                res.render('registor_acc/verify')
                                            })
                                            .catch((e) => {
                                                console.log(e)
                                                res.render('errorpage', {error: 'error occured while deleting user verification'})
                                            })
                                    })
                                    .catch((e) => {
                                        console.log(e)
                                        res.render('errorpage', {error: 'error occured while updating user record for verification'})
                                    })
                            } else {
                                //existing record but doesnt match
                                res.render('errorpage', {error: 'Invalid verification details passed'})
                            }
                        })
                        .catch((e) => {
                            console.log(e)
                            res.render('errorpage', {error: 'error occured while comparing unique strings.'})
                        })
                }
            } else {
                res.render('errorpage', {error: "account record doesn't exist or has been verified already. Please sign up or login"}) 
            }
        })
        .catch((e) => {
            console.log(e)
            res.render('errorpage', {error: 'error occured while trying to verify your account'})
        })
})

router.get('/', (req, res) => {
    res.render('registor_acc/registor')
})

router.post('/', async (req, res) => {  // Get the 'first' field from the request body

    var res1, res2, res3, res4, res5 = false

    async function setres(re1, re2, re3, re4, re5) {
        if (re1){
            res.render('errorpage', {error: "Empty input!"})
        } else if (re2) {
            res.render('errorpage', {error: "incorrect email format!"})
        } else if (re3) {
            res.render("errorpage", {error:"password needs to be between 8 and 16 chars, have a special char, uppercase, and a number"})
        } else if (re4) {
            res.render('registor_acc/registor', {error: "check your email to verify this account!"})
        } else if(re5){
            res.render('errorpage', {error: "email already exists!"})
        } else{
            const login = new Login()

            const hashedPass = await bcrypt.hash(password, 10)
            login.email = email
            login.password = hashedPass
            login.verified = false
    
            await login.save().then(result => {
                    sendVerificationemail(result, res)
                    //res5 = true // res5
            })
        }
        
    }

    let {email, password} = req.body
    email = email.trim()
    password = password.trim()

    if (email == "" || password == "") {
        //res.render('errorpage', {error: "Empty input!"}) // REPLACE LATER TO RELOAD TO SAME THING WITH ERROR
        //return // res1
        res1 = true
    } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        //res.render('errorpage', {error: "incorrect email format!"})
        //return // res2
        res2 = true
    } else if (!(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/.test(password))) {
        res3 = true
    }

    
    try{

        await Login.find({ email: email })
            .then((result) => {
                //console.log(result)
                if (result.length > 0) {
                    if (!result[0].verified) {
                        //res.render('errorpage', {error: "check your email to verify this account!"})
                        //return // res3
                        res4 = true
                    } else {
                        res5 = true
                    }
                }
            })

        //hopefully tbis sends the right responce :()
        setres(res1, res2, res3, res4, res5)


    } catch(e){
        res.render('errorpage', {error: e})
        console.log(e)
    }
})

module.exports = router