const nodemailer = require("nodemailer");

export default handler = async (req, res) => {

    try {
        const transporter = nodemailer.createTransport({
            port: 465,
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PW
            },
            secure: true,
        });
        await new Promise((resolve, reject) => {
            // verify connection configuration
            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log("Successful connection");
                    resolve(success);
                }
            });
        });
        const mailData = {
            from: {
                name: "EFSP Admin",
                address: process.env.NODEMAILER_EMAIL,
            },
            to: "c4g.efsp.main@gmail.com",
            subject: "EFSP Portal - A request is created or updated",
            text: "Visit https://c4g-efsp.vercel.app/ to view the request.",
        };
        await new Promise((resolve, reject) => {
            // send mail
            transporter.sendMail(mailData, (err, info) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    res.status(200).json({ result: `Sent email.` });
                } else {
                    console.log(info);
                    resolve(info);
                    res.status(400).json({ result: `Fail to send email.` });
                }
            });
        });

    } catch ( error ) {

        console.log(error);
        res.status(400).json({ result: error })

    }
};