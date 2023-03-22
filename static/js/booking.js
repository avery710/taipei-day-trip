const username = document.getElementById('username')
const tripName = document.getElementById('trip-name')
const tripDate = document.getElementById('trip-date')
const tripTime = document.getElementById('trip-time')
const tripCost = document.getElementById('trip-cost')
const tripAddress = document.getElementById('trip-address')
const tripImgSection = document.getElementById('bookingSpot-img')
const deleteTrip = document.getElementById('delete-trip')
const totalCost = document.getElementById('total-cost')
const bookingContent = document.getElementById('booking-content-all')
const noBooking = document.getElementById('no-booking')

const contactName = document.getElementById('contact-name')
const contactEmail = document.getElementById('contact-email')
const contactPhone = document.getElementById('contact-phone')

const cardNumber = document.getElementById('card-number')
const cardExpires = document.getElementById('card-expiration-date')
const cardCCV = document.getElementById('card-ccv')
const confirmPayment = document.getElementById('confirm-payment')

let trip = {}

async function initPage(){
    localStorageName = localStorage.getItem("name")

    if (!localStorageName){
        // if not login, redirect to index
        window.location.href = '/'
    }
    else {
        try {
            username.textContent = localStorageName
            
            const res = await fetch('/api/booking', {
                credentials: 'include'
            })

            const jsonData = await res.json()

            trip = jsonData

            if (jsonData.data == null){
                bookingContent.style.display = "none"
                noBooking.style.display = "flex"
                loadingSection.style.display = "none" 
            }
            else {
                // show attraction info
                tripName.textContent = jsonData.data.attraction.name
                tripDate.textContent = jsonData.data.date
                tripAddress.textContent = jsonData.data.attraction.address
        
                if (jsonData.data.time == "morning"){
                    tripTime.textContent = "早上 9 點到下午 1 點"
                }
                else {
                    tripTime.textContent = "下午 1 點到下午 6 點"
                }

                if (jsonData.data.price == 2500){
                    tripCost.textContent = "新台幣 2500 元"
                    totalCost.textContent = "總價：新台幣 2500 元"
                }
                else {
                    tripCost.textContent = "新台幣 2000 元"
                    totalCost.textContent = "總價：新台幣 2000 元"
                }

                const tripImg = document.createElement('img')
                tripImg.src = jsonData.data.attraction.image
                tripImg.className = "trip-img"
                tripImgSection.appendChild(tripImg)

                tripImg.addEventListener('load', () => {
                    loadingSection.style.display = "none" 
                })
            }
        }
        catch(error){
            console.log(error)
        }
    }
}


window.onload = initPage()


deleteTrip.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/booking', {
            method: "DELETE"
        })
    
        const data = await res.json()

        if (data.error){
            showPrompt(data.message)
        }
        else {
            location.reload()
        }
    }
    catch(error) {
        console.log(error)
    }
})


function setNumberFormGroupToError(element){
    element.classList.add('has-error')
    element.classList.remove('has-success')
}

function setNumberFormGroupToSuccess(element){
    element.classList.add('has-success')
    element.classList.remove('has-error')
}

function setNumberFormGroupToNormal(element){
    element.classList.remove('has-success')
    element.classList.remove('has-error')
}


TPDirect.card.setup({
    fields: {
        number: {
            element: cardNumber,
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: cardExpires,
            placeholder: 'MM / YY'
        },
        ccv: {
            element: cardCCV,
            placeholder: 'ccv'
        }
    },
    styles: {
        'input': {
            'color': '#666666'
        },
        'input.ccv': {
            'font-size': '13px'
        },
        'input.expiration-date': {
            'font-size': '13px'
        },
        'input.card-number': {
            'font-size': '13px'
        },
        ':focus': {
            'color': 'black',
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})


TPDirect.card.onUpdate(function(update){
    // check whether the input can get prime on update
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        confirmPayment.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        confirmPayment.setAttribute('disabled', true)
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        setNumberFormGroupToError(cardNumber)
    } else if (update.status.number === 0) {
        setNumberFormGroupToSuccess(cardNumber)
    } else {
        setNumberFormGroupToNormal(cardNumber)
    }

    if (update.status.expiry === 2) {
        setNumberFormGroupToError(cardExpires)
    } else if (update.status.expiry === 0) {
        setNumberFormGroupToSuccess(cardExpires)
    } else {
        setNumberFormGroupToNormal(cardExpires)
    }

    if (update.status.ccv === 2) {
        setNumberFormGroupToError(cardCCV)
    } else if (update.status.ccv === 0) {
        setNumberFormGroupToSuccess(cardCCV)
    } else {
        setNumberFormGroupToNormal(cardCCV)
    }
})


function validateEmail(email){
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}


contactEmail.addEventListener('blur', event => {
    if (validateEmail(event.target.value)){
        event.target.style.color = "green"
    }
    else {
        event.target.style.color = "red"
    }
})


contactEmail.addEventListener('input', event => {
    if (validateEmail(event.target.value)){
        event.target.style.color = "green"
    }
})


contactName.addEventListener('blur', event => {
    if (event.target.value){
        event.target.style.color = "green"
    }
    else {
        event.target.style.color = "red"
    }
})

contactName.addEventListener('input', event => {
    if (event.target.value){
        event.target.style.color = "green"
    }
})


contactPhone.addEventListener('blur', event => {
    if (event.target.value.length === 10){
        event.target.style.color = "green"
    }
    else {
        event.target.style.color = "red"
    }
})


contactPhone.addEventListener('input', event => {
    if (event.target.value.length === 10){
        event.target.style.color = "green"
    }
})


function contactStatus(){
    if (validateEmail(contactEmail.value) && contactName.value && contactPhone.value.length == 10){
        return true
    }
    else {
        return false
    }
}


async function makeOrders(body_data){
    const res = await fetch('/api/orders', {
        method: "POST",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body_data)
    })

    const data = await res.json()

    if (data.error){
        showPrompt(data.message)
    }
    else if (data.data){
        // redirect to thankyou.html
        let orderNumber = data.data.number
        const url = "/thankyou?number=" + encodeURIComponent(orderNumber)
        window.location.href = url
    }
}


confirmPayment.addEventListener('click', event => {
    event.preventDefault()

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false || contactStatus() === false) {
        console.log('can not get prime')
        return
    }

    loadingSection.style.display = "flex" 

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            showPrompt(result.msg)
            return
        }

        // send prime to your server, to pay with Pay by Prime API .
        const body_data = {
            "prime": result.card.prime,
            "order": {
                "price": trip.data.price,
                "attractionID": trip.data.attraction.id,
                "date": trip.data.date,
                "time": trip.data.time
            },
            "contact": {
                "name": contactName.value,
                "email": contactEmail.value,
                "phone": contactPhone.value
            }
        }

        makeOrders(body_data)
    })
})