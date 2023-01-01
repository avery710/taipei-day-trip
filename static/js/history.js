const noOrder = document.getElementById('no-order')
const orderTemplate = document.querySelector('.order-template')
const orderSection = document.getElementById('order-content-all')
const username = document.getElementById('username')

async function fetchOrders(){
    localStorageName = localStorage.getItem("name")

    if (!localStorageName){
        // if not login, redirect to index
        window.location.href = '/'
    }
    else {
        try {
            username.textContent = localStorageName

            let res = await fetch('/api/orders/history', {
                credentials: 'include'
            })
            let orders = await res.json()

            if (orders.noData == true){
                noOrder.style.display = "block"
                loadingSection.style.display = "none"
            }
            else {
                let count = 0
                
                orders.forEach(order => {
                    let div = orderTemplate.content.cloneNode(true)

                    div.querySelector('.order-content').href = `/attraction/${order.attraction_id}`

                    div.querySelector('.order-name').textContent = order.name
                    div.querySelector('.order-date').textContent = order.date
                    div.querySelector('.order-address').textContent = order.address
                    div.querySelector('.order-number').textContent = order.order_number

                    if (order.time == "morning"){
                        div.querySelector('.order-time').textContent = "早上 9 點到下午 1 點"
                    }
                    else {
                        div.querySelector('.order-time').textContent = "下午 1 點到下午 6 點"
                    }

                    if (order.price == 2000){
                        div.querySelector('.order-cost').textContent = "NT$2000"
                    }
                    else {
                        div.querySelector('.order-cost').textContent = "NT$2500"
                    }

                    div.querySelector('.order-img-tag').src = order.images[0]

                    div.querySelector('.order-img-tag').addEventListener('load', () => {
                        count++
                        if (count == orders.length){
                            loadingSection.style.display = "none"
                        }
                    })

                    orderSection.append(div)
                })
            }
        }
        catch(error){
            console.log(error)
        }
    }
}

fetchOrders()