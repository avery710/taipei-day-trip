const login_prompt = document.getElementById('login-prompt')
const signup_prompt = document.getElementById('signup-prompt')
const login_section = document.getElementById('login')
const signup_section = document.getElementById('signup')
const prompt_section = document.getElementById('prompt-section')
const overlay_section = document.querySelector('.overlay')
const close_buttons = document.querySelectorAll('.close-button')
const overlay_trigger = document.getElementById('overlay-trigger')
const logout = document.getElementById('logout')
const login_form = document.getElementById('login-form')
const signup_form = document.getElementById('signup-form')
const toBookingPage = document.getElementById('to-booking-page')
const prompt = document.getElementById('message-content')


// check whether the user is login
async function isLogin(){
    try {
        let res = await fetch('/api/user/auth', {
            credentials: 'include'
        })
    
        let user = await res.json()
        let user_data = user.data
    
        if (user_data == null){
            overlay_trigger.style.display = "inline"
            logout.style.display = "none"

            toBookingPage.addEventListener('click', () => {
                overlay_section.style.display = 'flex'
            })

            localStorage.setItem("name", false)
        }
        else {
            logout.style.display = "inline-block"
            overlay_trigger.style.display = "none"
            
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


login_form.addEventListener('submit', async event => {
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


async function fetchSignup(error_message){
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

    fetchSignup(error_message)
})


async function fetchLogout(){
    try {
        const res = await fetch('/api/user/auth', {
            method: "DELETE"
        })
    
        const data = await res.json()
        
        if (data.ok){
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
    overlay_section.style.display = 'flex'
    signup_section.style.display = "none"
    login_section.style.display = "none"
    prompt_section.style.display = "flex"

    prompt.textContent = message
}