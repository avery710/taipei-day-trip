const orderNumber = document.getElementById('order-number')

// orderNumber.textContent = window.location.href.searchParams.get('number')
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

orderNumber.textContent = getParameterByName('number')

window.addEventListener('load', () => {
    loadingSection.style.display = "none"
})