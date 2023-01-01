const loginPrompt = document.getElementById('login-prompt')
const signupPrompt = document.getElementById('signup-prompt')
const loginSection = document.getElementById('login')
const signupSection = document.getElementById('signup')
const promptSection = document.getElementById('prompt-section')
const overlaySection = document.querySelector('.overlay')
const closeButtons = document.querySelectorAll('.close-button')
const overlayTrigger = document.getElementById('overlay-trigger')
const logout = document.getElementById('logout')
const loginForm = document.getElementById('login-form')
const signupForm = document.getElementById('signup-form')
const toBookingPage = document.getElementById('to-booking-page')
const prompt = document.getElementById('message-content')
const loadingSection = document.getElementById('page-loading')
const tooltip = document.querySelector('.tooltip')


// check whether the user is login
async function isLogin(){
    try {
        let res = await fetch('/api/user/auth', {
            credentials: 'include'
        })
    
        let user = await res.json()
        let user_data = user.data
    
        if (user_data == null){
            overlayTrigger.style.display = "inline"
            logout.style.display = "none"

            toBookingPage.addEventListener('click', () => {
                overlaySection.style.display = 'flex'
            })
        }
        else {
            logout.style.display = "inline-block"
            overlayTrigger.style.display = "none"
            
            toBookingPage.addEventListener('click', () => {
                window.location.href = '/booking'
            })

            localStorage.setItem("name", user_data.name)
        }
        
    }
    catch(error) {
        console.log(error)
    }
}


isLogin()


loginPrompt.addEventListener('click', e => {
    loginSection.style.display = 'none'
    signupSection.style.display = 'flex'
})


signupPrompt.addEventListener('click', e => {
    signupSection.style.display = 'none'
    loginSection.style.display = 'flex'
})


closeButtons.forEach(button => {
    button.addEventListener('click', e => {
        overlaySection.style.display = 'none'
    })
})


overlayTrigger.addEventListener('click', e => {
    overlaySection.style.display = 'flex'
})


loginForm.addEventListener('submit', async event => {
    event.preventDefault();

    const email = document.getElementById('login-email').value
    const pw = document.getElementById('login-pw').value

    const error_message = document.querySelector('#login .error-message')

    // Build formData object.
    let formData = new FormData()
    formData.append('password', pw)
    formData.append('email', email)

    try {
        const res = await fetch('/api/user/auth', {
            method: "PUT",
            body: formData,
        })
        const data = await res.json()

        if (data.error){
            error_message.textContent = data['message']
        }
        else if (data.ok) {
            window.location.reload();
        }
    }
    catch(error){
        console.log(error)
    }
})


async function fetchSignup(error_message, formData){
    try {
        const res = await fetch('/api/user', {
            method: "POST",
            body: formData,
        })

        const data = await res.json()

        // error -> show error-message
        if (data.error){
            error_message.textContent = data.message
        }
        else if (data.ok) {
            error_message.textContent = "註冊成功！"
        }
    }
    catch(error){
        console.log(error)
    }
}


signupForm.addEventListener('submit', event => {
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

    fetchSignup(error_message, formData)
})


async function fetchLogout(){
    try {
        const res = await fetch('/api/user/auth', {
            method: "DELETE"
        })
    
        const data = await res.json()
        
        if (data.ok){
            localStorage.removeItem("name")
            window.location.reload()
        }
    }
    catch(error){
        console.log(error)
    }
}


logout.addEventListener('click', () => {
    fetchLogout()
})


function showPrompt(message){
    overlaySection.style.display = 'flex'
    signupSection.style.display = "none"
    loginSection.style.display = "none"
    promptSection.style.display = "flex"

    prompt.textContent = message
}


toBookingPage.addEventListener('mouseover', () => {
    localStorageName = localStorage.getItem("name")

    if (localStorageName){
        tooltip.style.visibility = "visible"
    }
})

document.addEventListener('mouseover', event => {
    if (!toBookingPage.contains(event.target) && !tooltip.contains(event.target)){
        tooltip.style.visibility = "hidden"
    }
})