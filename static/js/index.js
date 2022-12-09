let next_page = null
let keyword = ""
let isLoading = false

let input_field = document.getElementById('input-field')
let category = document.getElementById('category')
let search_bar = document.getElementById('search-bar')


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


function add_grid(parentElem, attraction){
    let grid = document.createElement('a')
    grid.className = "per-grid"
    grid.setAttribute('href', `/attraction/${attraction['id']}`)
    parentElem.appendChild(grid)


    // create grid-pic part
    let grid_pic = document.createElement('div')
    grid_pic.className = "grid-pic-section"
    grid.appendChild(grid_pic)

    let img = document.createElement('img')
    img.src = attraction['images'][0]
    img.className = "grid-img"
    grid_pic.appendChild(img)

    let name = document.createElement('div')
    name.className = "grid-name"
    grid_pic.appendChild(name)

    let name_text = document.createElement('div')
    name_text.textContent = attraction['name']
    name_text.className = "grid-name-text"
    name.appendChild(name_text)


    // create grid-info part
    let grid_info = document.createElement('div')
    grid_info.className = "grid-info-section"
    grid.appendChild(grid_info)

    let mrt = document.createElement('div')
    mrt.textContent = attraction['mrt']
    mrt.className = "grid-mrt"
    grid_info.appendChild(mrt)

    let cat = document.createElement('div')
    cat.textContent = attraction['category']
    cat.className = "grid-cat"
    grid_info.appendChild(cat)
}


function add_category(parentElem, text){
    let cat_grid = document.createElement('div')
    cat_grid.className = "category-grid"
    cat_grid.textContent = text
    parentElem.appendChild(cat_grid)
}


// Initialize the page!
window.onload = function(){
    // load attraction on visit the page
    fetch('/api/attractions?page=0')
    .then(res => res.json())
    .then(data => {
        const attractions = data['data']
        next_page = data['nextPage']

        let grid_section = document.querySelector('.grid-container')

        attractions.forEach(attraction => {
            add_grid(grid_section, attraction)
        });

    }).catch(error => {
        console.log(error)
    })

    // load category
    fetch('/api/categories')
    .then(res => res.json())
    .then(data => {
        const categories = data['data']

        let category_section = document.getElementById('category')

        categories.forEach(content => {
            add_category(category_section, content)
        })

    }).catch(error => {
        console.log(`error: ${error}`)
    })

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

    fetch('/api/user/auth', {
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

    fetch('/api/user', {
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
    fetch('/api/user/auth', {
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


input_field.addEventListener('click', function(){
    input_field.focus()
    category.style.visibility = 'visible'

    let cats = document.querySelectorAll('.category-grid')
    cats.forEach(cat => {
        cat.addEventListener('mouseover', e => {
            cats.forEach(cat => {
                cat.style.backgroundColor = '#FFFFFF'
            })

            cat.style.backgroundColor = '#E8E8E8'
        })

        cat.addEventListener('click', e => {
            // clear other gray blocks first
            cats.forEach(cat => {
                cat.style.backgroundColor = '#FFFFFF'
            })

            cat.style.backgroundColor = '#E8E8E8'
            input_field.value = cat.textContent
        })
    })
})


// handle events click outside of input-field
document.addEventListener('click', function click_outside_input_field(e){
    if (!input_field.contains(e.target)){
        category.style.visibility = 'hidden'
    }
})


search_bar.addEventListener('submit', event => {
    event.preventDefault()

    keyword = input_field.value
    
    fetch(`/api/attractions?page=0&keyword=${keyword}`)
    .then(res => res.json())
    .then(data => {
        let grid_section = document.querySelector('.grid-container')

        // remove old grids
        let old_grids = document.querySelectorAll('.per-grid')
        old_grids.forEach(old_grid => old_grid.remove())
        grid_section.innerHTML = null

        const attractions = data['data']
        next_page = data['nextPage']

        if (attractions.length === 0){
            grid_section.innerHTML = "查無此景點"
        }
        else {
            attractions.forEach(attraction => {
                add_grid(grid_section, attraction)
            })
        }
    })
    .catch(error => { console.log(`error: ${error}`) })
});


// infinite scroll using intersection observer
const options = {
  threshold: 0.6
};

const callback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (next_page != null && isLoading == false){
                isLoading = true

                fetch(`/api/attractions?page=${next_page}&keyword=${keyword}`)
                .then(res => res.json())
                .then(data => {
                    const attractions = data['data']
                    
                    console.log(next_page)
                    next_page = data['nextPage']
    
                    let grid_section = document.querySelector('.grid-container')
    
                    attractions.forEach(attraction => {
                        add_grid(grid_section, attraction)
                    })
                }).catch(error => {
                    console.log(`error: ${error}`)
                })

                isLoading = false
            }
        }
    })
};

const observer = new IntersectionObserver(callback, options);

const target = document.querySelector('.footer');
observer.observe(target);