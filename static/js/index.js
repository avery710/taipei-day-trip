let next_page = null
let keyword = ""
let isLoading = false

const input_field = document.getElementById('input-field')
const category = document.getElementById('category')
const search_bar = document.getElementById('search-bar')


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
// load attraction on visit the page
async function loadAttraction(){
    try {
        const res = await fetch('/api/attractions?page=0')
        const data = await res.json()

        const attractions = data.data
        next_page = data.nextPage

        let grid_section = document.querySelector('.grid-container')

        attractions.forEach(attraction => {
            add_grid(grid_section, attraction)
        })
    }
    catch(error) {
        console.log(error)
    }
}


loadAttraction()


// load category
async function loadCategory(){
    try {
        const res = await fetch('/api/categories')
        const data = await res.json()

        const categories = data['data']

        let category_section = document.getElementById('category')

        categories.forEach(content => {
            add_category(category_section, content)
        })
    }
    catch(error) {
        console.log(error)
    }
}


loadCategory()


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


async function searchKeyword(keyword){
    try {
        const res = await fetch(`/api/attractions?page=0&keyword=${keyword}`)
        const data = await res.json()

        let grid_section = document.querySelector('.grid-container')

        // remove old grids
        let old_grids = document.querySelectorAll('.per-grid')
        old_grids.forEach(old_grid => old_grid.remove())
        grid_section.innerHTML = null

        const attractions = data.data
        next_page = data.nextPage

        if (attractions.length === 0){
            grid_section.innerHTML = "查無此景點"
        }
        else {
            attractions.forEach(attraction => {
                add_grid(grid_section, attraction)
            })
        }
    }
    catch(error) {
        console.log(error)
    }
}


search_bar.addEventListener('submit', async event => {
    event.preventDefault()

    keyword = input_field.value
    
    searchKeyword(keyword)
})


// infinite scroll using intersection observer
const options = {
  threshold: 0.6
};


async function loadNextPage(){
    try {
        const res = await fetch(`/api/attractions?page=${next_page}&keyword=${keyword}`)
        const data = await res.json()

        const attractions = data.data
                        
        console.log(next_page)
        next_page = data.nextPage

        let grid_section = document.querySelector('.grid-container')

        attractions.forEach(attraction => {
            add_grid(grid_section, attraction)
        })
    }
    catch(error) {
        console.log(error)
    }
}


const callback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (next_page != null && isLoading == false){
                isLoading = true
  
                loadNextPage()

                isLoading = false
            }
        }
    })
};

const observer = new IntersectionObserver(callback, options);

const target = document.querySelector('.footer');
observer.observe(target);