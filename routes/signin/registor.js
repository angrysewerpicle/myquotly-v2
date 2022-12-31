const express = require('express')
const router = express.Router()
const Login = require('../../models/signin/login')
const bcrypt = require('bcrypt')
require('dotenv').config()

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
            currentUrl+"/registor/verify/"+ _id + "/" + uniqueString}here</a>
         to proceed.</p>`
    }
    
}


router.get('/', (req, res) => {
    res.render('registor_acc/registor')
})

router.post('/', async (req, res) => {  // Get the 'first' field from the request body
    
    let {email, password} = req.body
    email = email.trim()
    password = password.trim()

    if (email == "" || password == "") {
        res.send('Empty input!') // REPLACE LATER TO RELOAD TO SAME THING WITH ERROR
        return
    } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        res.send('incorrect email')
        return
    }

    
    
    try{
        const login = new Login()

        const doesemailexist = await Login.exists({ email: email });

        if (doesemailexist) {
            res.send('email already exists')
            return
        }

        const hashedPass = await bcrypt.hash(password, 10)
        login.email = email
        login.password = hashedPass
        login.verified = false
        await login.save().then(result => {
            //console.log(result)
            sendVerificationemail(result, res)
        })
        res.redirect('/login')
    } catch(e){
        res.redirect('/registor')
        console.log(e)
    }
})

module.exports = router