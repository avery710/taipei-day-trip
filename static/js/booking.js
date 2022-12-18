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

const creditNumber = document.getElementById('credit-number')
const creditExpires = document.getElementById('credit-expires')
const creditCVC = document.getElementById('credit-cvc')
const telNum = document.getElementById('tel-num')


async function initPage(){
    localStorageName = localStorage.getItem("name")

    if (!localStorageName){
        // if not login, redirect to index
        window.location.href = '/'
    }
    else {
        console.log("hi")
        try {
            username.textContent = localStorageName
            
            const res = await fetch('/api/booking', {
                credentials: 'include'
            })

            const jsonData = await res.json()

            if (jsonData.data == null){
                bookingContent.style.display = "none"
                noBooking.style.display = "flex"
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


telNum.addEventListener('input', event => {
    if (event.target.value.length <= 4){
        event.target.value = event.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ')
    }
    else if (event.target.value.length < 8){
        event.target.value = event.target.value.replace(/[^\d]/g, '').replace(/(.{4})(.+)/g, '$1 $2')
    }
    else if (event.target.value.length == 8){
        event.target.value = event.target.value.replace(/[^\d]/g, '').replace(/(.{4})(.{3})/g, '$1 $2 ')
    }
    else if (event.target.value.length > 8){
        event.target.value = event.target.value.replace(/[^\d]/g, '').replace(/(.{4})(.{3})(.+)/g, '$1 $2 $3')
    }
    
})


creditNumber.addEventListener('input', event => {
    event.target.value = event.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim()
})


creditExpires.addEventListener('input', event => {
    event.target.value = event.target.value.replace(/[^\d]/g, '').replace(/(.{2})(.+)/g, '$1 / $2')
})


creditCVC.addEventListener('input', event => {
    event.target.value = event.target.value.replace(/[^\d]/g, '')
})