console.log("script loaded");

//getUsername()

async function getUsername() {
    const response = await fetch('/username');
    const data = await response.json();
    console.log(data);
    document.getElementById('username').innerHTML = data['id'];
    //document.write(data['id'])
}