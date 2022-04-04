module.exports = {
  getRandom: () => String(Math.random()).split('.')[1].slice(0, 6),
  apiOptions: {
    getOwned: {
      appinfo: 'include_appinfo=1',
      freeGame: 'include_played_free_games=1',
      format: 'format=json'
    }
  }
}