let images = []
let images_container = document.getElementById('images-container')
let dots_container = document.getElementById('dots-container')
let spot_name = document.getElementById('name')
let cat = document.getElementById('category')
let mrt = document.getElementById('mrt')
let description = document.getElementById('description')
let address = document.getElementById('address')
let transport = document.getElementById('transport')
let expense = document.getElementById('expense-result')


const login_prompt = document.getElementById('login-prompt')
const signup_prompt = document.getElementById('signup-prompt')
const login_section = document.getElementById('login')
const signup_section = document.getElementById('signup')

const close_buttons = document.querySelectorAll('.close-button')
const overlay_section = document.querySelector('.overlay')

const overlay_trigger = document.getElementById('overlay-trigger')
const logout = document.getElementById('logout')

const login_form = document.getElementById('login-form')
const signup_form = document.getElementById('signup-form')


window.onload = function(){
    // check whether the user is login
    fetch('/api/user/auth', {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        const user_data = data['data']

        if (user_data == null){
            overlay_trigger.style.display = "inline"
            logout.style.display = "none"
        }
        else {
            logout.style.display = "inline-block"
            overlay_trigger.style.display = "none"
        }
    }).catch(error => {
        console.log(`error: ${error}`)
    })
}


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


// fetch basic info about the attraction
fetch(`/api/attraction/${id}`)
.then(res => res.json())
.then(data => {
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
})
.catch(error => console.log(error))




login_prompt.addEventListener('click', e => {
    login_section.style.display = 'none'
    signup_section.style.display = 'flex'
})


signup_prompt.addEventListener('click', e => {
    signup_section.style.display = 'none'
    login_section.style.display = 'flex'
})


close_buttons.forEach(button => {
    button.addEventListener('click', e => {
        overlay_section.style.display = 'none'
    })
})


overlay_trigger.addEventListener('click', e => {
    overlay_section.style.display = 'flex'
})


login_form.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.getElementById('login-email').value
    const pw = document.getElementById('login-pw').value

    const error_message = document.querySelector('#login .error-message')

    // Build formData object.
    let formData = new FormData()
    formData.append('password', pw)
    formData.append('email', email)

    fetch(`/api/user/auth`, {
        method: "PUT",
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        if (data['error'] == true){
            error_message.textContent = data['message']
        }
        else if (data['ok'] == true) {
            window.location.reload();
        }
    })
    .catch(error => console.log(error))
})


signup_form.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.getElementById('signup-email').value
    const pw = document.getElementById('signup-pw').value
    const name = document.getElementById('signup-name').value

    const error_message = document.querySelector('#signup .error-message')

    // Build formData object.
    let formData = new FormData()
    formData.append('name', name)
    formData.append('password', pw)
    formData.append('email', email)

    fetch(`/api/user`, {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        // error -> show error-message
        if (data['error'] == true){
            error_message.textContent = data['message']
        }
        else if (data['ok'] == true) {
            error_message.textContent = "註冊成功！"
        }
    })
    .catch(error => console.log(error))
})


logout.addEventListener('click', e => {
    fetch(`/api/user/auth`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if (data['ok'] == true){
            window.location.reload();
        }
    })
    .catch(error => console.log(error))
})