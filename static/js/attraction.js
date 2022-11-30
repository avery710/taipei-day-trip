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

const root_url = "http://52.69.53.123:3000/"
// const root_url = "http://127.0.0.1:3000/"

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
fetch(`${root_url}api/attraction/${id}`)
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
    console.log("hihi")
})
.catch(error => console.log(error))