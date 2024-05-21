const OtpModel = require('../models/otp');
const { otpVerification } = require('../helpers/otpValidate');

const otpGenerator = require('otp-generator');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
//process.env.TWILIO_PHONE_NUMBER;

const twilioClient = new twilio(accountSid, authToken)


const sendOtp = async(req, res) => {
    try {

        const {phoneNumber} = req.body;
        const otp = otpGenerator.generate(6, {upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: flase});


        const cDate = new Date();
        await OtpModel.findOneAndUpdate(
            { phoneNumber },
            { otp, otpExpiration: new Date(cDate.getTime()) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await twilioClient.messages.create(
            {
                body:`Your OTP is: ${otp}`,
                to: phoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER
            }
        );

        return res.status(400).json({
            success: true,
            msg: 'OTP sent successfully!'
        })
    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const verifyOtp = async(req, res) => {
    try{

        const { phoneNumber, otp } = req.body;

        const otpData = await OtpModel.findOne({
           phoneNumber,
           otp 
        });

        if(!otpData){
            return res.status(400).json({
                success:false,
                msg: 'You entered wrong OTP!'
            });
        }

        const isOtpExpired = otpVerification(otpData.otpExpiration);

        if(isOtpExpired){
            return res.status(400).json({
                success:false,
                msg: 'Your OTP has been Expired!'
            });
        }

        return res.status(200).json({
            success: true,
            msg: 'OTP verified successfully.'
        })

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

module.exports = {
    sendOtp,
    verifyOtp
}