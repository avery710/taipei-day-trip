let images = []
const images_container = document.getElementById('images-container')
const dots_container = document.getElementById('dots-container')
const spot_name = document.getElementById('name')
const cat = document.getElementById('category')
const mrt = document.getElementById('mrt')
const description = document.getElementById('description')
const address = document.getElementById('address')
const transport = document.getElementById('transport')
const expense = document.getElementById('expense-result')
const bookingButt = document.getElementById('start-booking')


let slideIndex = 1

function showSlides(n) {
    let slides = document.querySelectorAll('.slide-img')
    let dots = document.querySelectorAll('.dot')

    if (n > slides.length){
        slideIndex = 1
    }

    if (n < 1){
        slideIndex = slides.length
    }

    // reset all the images and dots
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // set all the dots to non-active
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}


// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n)
}


// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n)
}


function add_img(img_url){
    let image = document.createElement('img')
    image.src = img_url
    image.className = 'slide-img'
    images_container.appendChild(image)
}


function add_dot(){
    let dot = document.createElement('span')
    dot.className = 'dot'
    dots_container.appendChild(dot)
}


// fetch basic info about the attraction
async function fetchAttraction(){
    try {
        const res = await fetch(`/api/attraction/${id}`)
        const data = await res.json()

        if (data['error'] == true){
            const attraction_section  = document.getElementById('attraction-section')
            attraction_section.textContent = "查無此景點"
            attraction_section.classList.add('empty')
        }
        else {
            let attraction = data['data']

            spot_name.textContent = attraction['name']
            cat.textContent = attraction['category']
            mrt.textContent = attraction['mrt']
            description.textContent = attraction['description']
            address.textContent = attraction['address']
            transport.textContent = attraction['transport']

            images = attraction['images']
            images.forEach(url => {
                add_img(url)
                add_dot()
            })

            let dots = document.querySelectorAll('.dot')
            for (let i = 0; i < images.length; i++){
                dots[i].addEventListener('click', event => {
                    currentSlide(i + 1)
                })
            }

            slideIndex = 1
            showSlides(slideIndex)
        }
    }
    catch(error){
        console.log(error)
    }

    loadingSection.style.display = "none" 
}


window.onload = fetchAttraction()


// radio input eventListener
document.querySelectorAll('input[name="booking-time"]').forEach(radio => {
    radio.addEventListener('change', event => {
        if (event.target.value === "morning"){
            expense.textContent = "新台幣 2000 元"
        }
        else if (event.target.value === "afternoon"){
            expense.textContent = "新台幣 2500 元"
        }
    })
})


bookingButt.addEventListener('click', async event => {
    try {
        const res = await fetch('/api/user/auth', {
            credentials: 'include'
        })
    
        const user = await res.json()
        const user_data = user.data

        if (user_data == null){
            //  if not login, then login first
            overlay_section.style.display = 'flex'
        }
        else {
            // make new booking
            const bookingDate = document.querySelector('#booking-date input').value

            if (!bookingDate){
                showPrompt("請選擇行程日期")
            }
            else {
                loadingSection.style.display = "flex" 

                const bookingTime = document.querySelector('input[name="booking-time"]:checked').value
                let bookingPrice = 0
                if (bookingTime == "morning"){
                    bookingPrice = 2000
                }
                else {
                    bookingPrice = 2500
                }

                bookingData = {
                    "attractionId": id,
                    "date": bookingDate,
                    "time": bookingTime,
                    "price": bookingPrice
                }

                const res = await fetch('/api/booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingData)
                })

                const data = await res.json()
                if (data.ok == true){
                    window.location.href = '/booking'
                }
                else if (data.error == true) {
                    loadingSection.style.display = "none" 
                    showPrompt(data.message)
                }
            }
        }
    }
    catch(error) {
        console.log(error)
    }
})