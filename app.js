const express = require('express');
const app = express();
const port = 3000;
const website = "http://localhost:3000/"

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Example app on ${website}`);
})
  

app.get('/username', async(request, response) => {
  const FetchAPI = await fetch("https://api.mojang.com/users/profiles/minecraft/hello", {
    "method": "GET",
  })
  const Username = await FetchAPI.json();
  console.log(Username);
  response.json(Username);

});
