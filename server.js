if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const fs = require('fs')
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(stripeSecretKey)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))


app.get('/', function(req, res) {
    fs.readFile('pear.json', function(error, data) {
        if (error) {
            res.status(500).end()
        } else {
            const itemJson = JSON.parse(data)

            var getPurchases = async () => {
                try {
                    const allCharges = await stripe.charges
                    .list()
                    .autoPagingToArray({limit: 10000});

                    purchasedArray = []
                    allCharges.forEach(function(charge) {
                        var pearQuantity = (Math.floor(charge.amount / itemJson.price))
                        purchasedArray.push(pearQuantity)
                    })

                    var purchasedArraySum = arr => purchasedArray.reduce((a,b) => a + b, 0)

                    pearsArray = []

                    console.log(purchasedArraySum())

                    for (i = 0; i < purchasedArraySum(); i++) {
                        pearsArray.push('🍐')
                    }

                    pearsHtml = pearsArray.join(' ')

                    res.render('index.ejs', {
                        stripePublicKey: stripePublicKey,
                        pear: itemJson,
                        totalPurchased: pearsHtml
                    })
                } catch(err) {
                    console.log(err)
                }
            }

            getPurchases()

        }
    })
})

app.post('/purchase', function(req, res) {
    fs.readFile('pear.json', function(error, data) {
        if (error) {
            res.status(500).end()
        } else {
            console.log(req.body)
            
            const quantity = req.body.quantity
            const fromName = req.body.fromName
            const fromEmail = req.body.fromEmail
            const recipientsName = req.body.recipientsName
            const recipientsEmail = req.body.recipientsEmail
            const itemJson = JSON.parse(data)
            let total = 0
            total = total + itemJson.price * quantity

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(function() {
                console.log('Charge Successful')
                res.json({message: '🍐 sent!'})
            }).catch(function() {
                console.log('Charge Fail')
                res.status(500).end()
            })

            pearsArray = []

            for(var i = 0; i < quantity; i++) {
                pearsArray.push(`🍐`)
            }

            var pears = pearsArray.join(' ')
            console.log(pears)

            // Send recipient email
            const emails = [
                {
                    to: fromEmail,
                    from: 'pear@ideaofapear.com',
                    templateId: 'd-cd1d430ed416465badaad80dbf8fd53a',
                    dynamic_template_data: {
                        subject: `Receipt: ${quantity} ideas of a pear sent to ${recipientsName}`,
                        previewText: pears,
                        fromName: 'Idea of a Pear',
                        recipientsName: fromName,
                        recipientsEmail: fromEmail,
                        pears: pears,
                    },
                },
                {
                    to: recipientsEmail,
                    from: 'pear@ideaofapear.com',
                    templateId: 'd-cd1d430ed416465badaad80dbf8fd53a',
                    dynamic_template_data: {
                        subject: `Received ${quantity} ideas of a pear from ${fromName}`,
                        previewText: pears,
                        fromName: fromName,
                        fromEmail: '<' + fromEmail + '>',
                        recipientsName: recipientsName,
                        recipientsEmail: recipientsEmail,
                        pears: pears,
                    },
                }
            ]
            sgMail.send(emails);
        }
    })
})

app.listen(3002)

