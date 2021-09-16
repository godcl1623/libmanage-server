const axios = require('axios');

const getOwnedGames = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json`;
const getPlayerSummaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`;

axios.get(getOwnedGames)
  .then(res => console.log(res.data.response));