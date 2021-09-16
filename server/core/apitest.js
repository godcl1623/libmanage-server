const axios = require('axios');
const { Issuer } = require('openid-client');
const { cyber, blade } = require('../custom_modules/security/fes');

const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${cyber}&steamid=${blade}&format=json`;
const getPlayerSummaries = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${cyber}&steamids=${blade}&format=json`;

// axios.get(getPlayerSummaries)
//   .then(res => console.log(res.data.response.players));
Issuer.discover('http://steamcommunity.com/openid')
  .then(res => console.log(res))