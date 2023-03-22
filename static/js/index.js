let next_page = null
let keyword = ""
let isLoading = false

const inputField = document.getElementById('input-field')
const category = document.getElementById('category')
const searchBar = document.getElementById('search-bar')
const gridLoading = document.getElementById('grid-loading')


function add_grid(parentElem, attraction, imgArray, gridArray){
    let grid = document.createElement('a')
    grid.style.display = "none"
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
    imgArray.push(img)

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

    gridArray.push(grid)
}


function add_category(parentElem, text){
    let cat_grid = document.createElement('div')
    cat_grid.className = "category-grid"
    cat_grid.textContent = text
    parentElem.appendChild(cat_grid)
}


function pageLoad(imgs){
    const total = imgs.length
    let count = 0

    imgs.forEach(img => {
        img.addEventListener('load', () => {
            count++
            if (count == total){
                loadingSection.style.display = "none"
                return
            }
        })
    })
}


function loadMore(imgs, grids){
    const total = imgs.length
    let count = 0

    imgs.forEach(img => {
        img.addEventListener('load', () => {
            count++
            if (count == total){
                gridLoading.style.display = "none"

                grids.forEach(grid => {
                    grid.style.display = "flex"
                })

                return
            }
        })
    })
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

        let imgArray = []
        let gridArray = []

        attractions.forEach(attraction => {
            add_grid(grid_section, attraction, imgArray, gridArray)
        })

        gridArray.forEach(grid => {
            grid.style.display = "flex"
        })

        pageLoad(imgArray)
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


inputField.addEventListener('click', function(){
    inputField.focus()
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
            inputField.value = cat.textContent
        })
    })
})


// handle events click outside of input-field
document.addEventListener('click', function click_outside_input_field(e){
    if (!inputField.contains(e.target)){
        category.style.visibility = 'hidden'
    }
})


async function searchKeyword(keyword){
    try {
        gridLoading.style.display = "flex" 

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
            gridLoading.style.display = "none" 
            grid_section.innerHTML = "查無此景點"
        }
        else {
            imgArray = []
            gridArray = []

            attractions.forEach(attraction => {
                add_grid(grid_section, attraction, imgArray, gridArray)
            })

            loadMore(imgArray, gridArray)
        }
    }
    catch(error) {
        console.log(error)
    }
}


searchBar.addEventListener('submit', async event => {
    event.preventDefault()

    keyword = inputField.value
    
    searchKeyword(keyword)
})


// infinite scroll using intersection observer
const options = {
    threshold: 0.6
}


async function loadNextPage(){
    try {
        isLoading = true

        gridLoading.style.display = "flex"

        const res = await fetch(`/api/attractions?page=${next_page}&keyword=${keyword}`)
        const data = await res.json()

        const attractions = data.data
                        
        next_page = data.nextPage

        let grid_section = document.querySelector('.grid-container')

        imgArray = []
        gridArray = []

        attractions.forEach(attraction => {
            add_grid(grid_section, attraction, imgArray, gridArray)
        })

        loadMore(imgArray, gridArray)

        isLoading = false
    }
    catch(error) {
        console.log(error)
    }
}


const callback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (next_page != null && isLoading == false){
                loadNextPage()
            }
        }
    })
};

const observer = new IntersectionObserver(callback, options);

const target = document.querySelector('.footer');
observer.observe(target);