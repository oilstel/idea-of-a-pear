if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var quantityInput = document.getElementById('cart-quantity-input')
    quantityInput.addEventListener('change', quantityChanged)

    document.getElementById('btn-purchase').addEventListener('click', purchaseClicked)

    updateQuantityDisplay()
    updateCartTotal()
    updatePears()
    resetFields()
}

function updateQuantityDisplay() {
    document.getElementById('cart-quantity-display').innerText = document.getElementById('cart-quantity-input').value
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token) {
        var quantity = document.getElementById('cart-quantity-input').value
        var fromName = document.getElementById('from-name').value
        // var fromEmail = document.getElementById('from-email').value
        var recipientsName = document.getElementById('recipients-name').value
        var recipientsEmail = document.getElementById('recipients-email').value

        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                quantity: quantity,
                fromName: fromName,
                // fromEmail: fromEmail,
                recipientsName: recipientsName,
                recipientsEmail: recipientsEmail
            })
        }).then(function(res) {
            return res.json()
        }).then(function(data) {
            alert(data.message)
            resetFields()
            document.getElementById('pearview').style.display = 'none'
            document.body.style.overflowY = 'initial'
        }).catch(function(error) {
            console.error(error)
        })
    }
})

function resetFields() {
    document.getElementById('cart-quantity-input').value = '1'
    document.getElementById('from-name').value = ''
    // document.getElementById('from-email').value = ''
    document.getElementById('recipients-name').value = ''
    document.getElementById('recipients-email').value = ''
    updateQuantityDisplay()
    updateCartTotal()
    updatePears()
}

// function validateEmail(email) {
//     var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return re.test(email);
// }

function purchaseClicked() {
    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price = parseFloat(priceElement.innerText.replace('$', '')) * 100
    // var fromEmail = document.getElementById('from-email').value
    var quantity = document.getElementById('cart-quantity-input').value
    stripeHandler.open({
        amount: price,
        description: `The idea of ${quantity} 🍐`,
        // email: fromEmail
    })
    console.log(price)
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
    updatePears()
    console.log('here')
}

function updatePears() {
    var quantity = document.getElementById('cart-quantity-input').value

    if (quantity > 1) {
        document.getElementById('pear-quantity-text').innerText = quantity + ' pears'
    } else {
        document.getElementById('pear-quantity-text').innerText = 'a pear'
    }
}

function updateCartTotal() {
    var total = 0

    var priceElement = document.getElementById('item-price')
    var quantityElement = document.getElementById('cart-quantity-input')
    var price = parseFloat(priceElement.innerText.replace('$', ''))
    var quantity = quantityElement.value
    total = total + (price * quantity)

    total = Number.parseFloat(Math.round(total * 100) / 100).toFixed(2)
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}

// Buttons up/down
document.getElementById('button-down').addEventListener('click', () => {
    var quantityInput = document.getElementById('cart-quantity-input')
    if (quantityInput.value >= 2) {
        quantityInput.stepDown()
        updateQuantityDisplay()
        updateCartTotal()
        updatePears()
        updatePearview()
    } else {
    }
})

document.getElementById('button-up').addEventListener('click', () => {
    document.getElementById('cart-quantity-input').stepUp()
    updateQuantityDisplay()
    updateCartTotal()
    updatePears()
    updatePearview()
})

// Pearview
document.getElementById('pearview-open').addEventListener('click', () => {
    document.getElementById('pearview').style.display = 'flex'
    document.body.style.overflowY = 'hidden'
    updatePearview()
})

document.getElementById('pearview-close').addEventListener('click', () => {
    document.getElementById('pearview').style.display = 'none'
    document.body.style.overflowY = 'initial'
})

updatePearview = () => {
    var quantity = document.getElementById('cart-quantity-input').value
    var fromName = document.getElementById('from-name').value
    var recipientsName = document.getElementById('recipients-name').value
    var recipientsEmail = document.getElementById('recipients-email').value
    var pearviewEmailBody = document.getElementById('email')

    pearsArray = []

    for (var i = 0; i < quantity; i++) {
        pearsArray.push(`🍐`)
    }

    var pears = pearsArray.join(' ')

    console.log(pears)

    pearviewEmailBody.innerHTML = `
        <b>to:</b> <span class="light">&lt;${recipientsEmail}&gt;</span>
        <br /><br />
        <div id="pearview-pears">
            ${pears}
        </div>
        <br />
        Yours in pearpetuity,<br />
        ${fromName}
    `
}

updatePearview()




