const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const igdb = require('igdb-api-node').default;
const { libDB, db } = require('../custom_modules/db');
const { cyber, owl } = require('../custom_modules/security/fes');

const app = express();
const port = 3003;
let uid = '';
let gameList = '';
let apiCredential = '';
let requestedUser = '';
const statObj = {
  count: 0,
  total: 0,
  status: 1
};

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(helmet(), compression());
libDB.connect();

passport.use(new SteamStrategy({
    returnURL: `http://localhost:${port}/auth/steam/return`,
    realm: `http://localhost:${port}/`,
    apiKey: cyber
  },
  (identifier, profile, done) => {
    process.nextTick(() => {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(session({
  secret: 'guitar',
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/steam',
  passport.authenticate('steam', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    res.send('test')
});

app.get('/auth/steam/return',
  passport.authenticate('steam', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // 1. 스팀 로그인 성공 후 사용자 아이디를 반환
    uid = req.user.id;
    // 2. 반환받은 사용자 아이디로 게임 목록 호출, 제목만 추출한 후 알파벳 순 정렬
    // 제목에서 appid로 변경 - url 대조를 위해
    const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${cyber}&steamid=${uid}&format=json`;
    axios.get(getOwnedGames)
      .then(result => {
        const rawGamesData = result.data.response.games;
        const steamResult = rawGamesData.map(gameDataObj => gameDataObj.appid);
        const sortedTempArr = steamResult.sort((prev, next) => prev < next ? -1 : 1);
        // 정렬된 게임 목록을 변수 gameList로 업데이트
        gameList = sortedTempArr;
        statObj.total = gameList.length;
      })
      .then(() => {
        axios.post(`http://localhost:${port}/api/connect`, { execute: 'order66' })
          .then(result => {
            apiCredential = result.data;
            res.redirect('http://localhost:3000/api/progress');
          })
      })
  }
)

app.get('/login', (req, res) => {
  res.send('failed');
})

app.get('/', (req, res) => {
  res.send('api server');
});

app.post('/test', (req, res) => {
  libDB.query(`select * from dee`, (err, result) => {
    if (err) {
      const columns = {
        first: 'libid int not null auto_increment',
        second: 'title text not null',
        third: 'cover text null',
        fourth: 'igdb_url text not null',
        fifth: 'meta text not null',
        sixth: 'primary key (libid)'
      }
      const queryString = `
        create table dee (
          ${columns.first},
          ${columns.second},
          ${columns.third},
          ${columns.fourth},
          ${columns.fifth},
          ${columns.sixth}
        );
      `;
      libDB.query(queryString, (err, result) => {
        if (err) {
          throw err;
        } else {
          console.log(result);
        }
      })
    } else {
      console.log('result is', result)
    }
  })
});

app.post('/api/search', (req, res) => {
  const { reqUserInfo } = req.body;
  requestedUser = reqUserInfo.nickname;
  axios.post(`http://localhost:${port}/meta_search`, { apiCred: apiCredential })
  .then(searchResult => {
    if (searchResult.data === true) {
      console.log('DB write completed. Return to app service.')
      const stores = {
        game: {
          steam: true
        }
      }
      db.query(`update user_info set stores=? where user_nick=?`,
      [JSON.stringify(stores), requestedUser],
      (err, result) => {
        if (err) throw err;
        res.send({
          result: true,
          newInfo: {
            ...reqUserInfo,
            stores: {
              ...stores
            }
          }
        })
      })
    } else {
      res.redirect('/error/search');
    }
  })
})

app.post('/stat/track', (req, res) => {
  res.send({
    count: String(statObj.count),
    total: String(statObj.total),
    status: String(statObj.status)
  });
})

app.get('/error/search', (req, res) => {
  res.send('<h1>Error has occured. Please try again later.</h1>')
});

// 프론트에서 처리하도록 수정
app.post('/api/connect', (req, res) => {
  if (req.body.execute === 'order66') {
    const cid = `client_id=${owl.me}`;
    const secret = `client_secret=${owl.spell}`;
    const cred = 'grant_type=client_credentials';
    const address = `https://id.twitch.tv/oauth2/token?${cid}&${secret}&${cred}`;
    axios.post(address)
      .then(response => {
        response.data.cid = owl.me;
        res.json(response.data)
      });
  }
});

app.post('/meta_search', (req, res) => {
  // const tempList = [1210030, 1222140, 1254120, 1286830, 1289310];
  const { cid, access_token: token } = req.body.apiCred;
  const client = igdb(cid, token);
  // 1. 스팀 게임별 고유 id와 IGDB 사이트에 등록된 스팀 url 대조 함수 - IGDB 고유 게임 아이디 이용 예정
  const steamURLSearchQuery = async steamAppId => {
    const response = await client
      .fields(['*'])
      .where(`category = 13 & url = *"/${steamAppId}"`)
      .request('/websites');
    return response;
  };
  // 2. 스팀 url 중 1과 다른 형식의 게임들 검색 함수 - IGDB 고유 게임 아이디 이용 예정
  const steamURLException = async steamAppId => {
    const response = await client
      .fields(['*'])
      .where(`category = 13 & url = *"/${steamAppId}/"*`)
      .request('/websites');
    return response;
  };
  // 3. IGDB 아이디를 이용한 게임 메타데이터 검색 함수
  const igdbIDSearch = async igdbID => {
    const response = await client
      .fields(['*'])
      // .search('cyberpunk 2077')
      .where(`id = ${igdbID}`)
      .request('/games');
    return response;
  };
  // 4. 게임 표지 검색 함수
  const coverSearch = async igdbCoverID => {
    const response = await client
      .fields(['*'])
      .where(`id = ${igdbCoverID}`)
      .request('/covers');
    return response;
  };
  // 테스트: 쿼리별 검색 함수
  const eachQuerySearch = async (endpoints, id, field) => {
    const response = await client
      .fields(`${field}`)
      .where(`id=${id}`)
      .request(`/${endpoints}`);
    return response;
  };
  // 테스트: 멀티쿼리
  const multiQuerySearch = async (endpoints, valNeed, query) => {
    let queryStr = '';
    let queryData = '';
    if (typeof query === 'object') {
      if (query.length <= 10) {
        queryStr = query.map((que, idx) => 
          `query ${endpoints} "${idx}" { fields ${valNeed};where id=${que}; }`
        );
      } else {
        queryStr = query.slice(0, 10).map((que, idx) => 
          `query ${endpoints} "${idx}" { fields ${valNeed};where id=${que}; }`
        );
      }
      queryData = queryStr.join(';');
    } else if (typeof query === 'number') {
      queryData = `query ${endpoints} "0" { fields ${valNeed};where id=${query}; }`
    }
    const response = await axios({
      url: "https://api.igdb.com/v4/multiquery",
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Client-ID': cid,
          'Authorization': `Bearer ${token}`,
      },
      data: queryData+';'
    });
    return response;
  };
  // 5. IGDB상 저장된 스팀 게임의 url을 기반으로 IGDB 고유 게임 아이디 반환
  const firstFilter = (rawData, filterFunc) => new Promise(resolve => {
    const temp = [];
    const fail = [];
    statObj.total = rawData.length;
    // rawData.slice(rawData.length - 30,rawData.length).forEach((steamAppId, index) => {
    rawData.slice(0 - 5).forEach((steamAppId, index) => {
    // rawData.forEach((steamAppId, index) => {
      setTimeout(() => {
        filterFunc(steamAppId)
          .then(result => {
            if (result.data[0] === undefined) {
              fail.push(steamAppId);
            } else {
              temp.push(result.data[0].game);
              // 기능 완성 이후 삭제할 것
            }
            statObj.count++;
            console.log(`Searching for steam URL based on steam app id: ${temp.length + fail.length}/${rawData.length}`);
            // if (temp.length + fail.length === 30) {
            if (temp.length + fail.length === 5) {
            // if (temp.length + fail.length === rawData.length) {
              statObj.total = fail.length;
              statObj.count = 0;
              statObj.status = '2';
              console.log(`First attempt: Succeed(${temp.length}), Fail(${fail.length})`)
              resolve({ temp, fail });
            }
          });
      }, index * 300);
    });
  });
  // 6. 5에서 검색에 실패한 게임들 대상 IGDB 고유 게임 아이디 검색 함수
  const secondFilter = (rawData, filterFunc) => new Promise(resolve => {
    const { temp, fail } = rawData;
    const secTemp = [];
    const secFail = [];
    if (fail[0] !== undefined) {
      fail.forEach((steamAppId, index, thisArr) => {
        setTimeout(() => {
          filterFunc(steamAppId)
            .then(result => {
              if (result.data[0] === undefined && thisArr.includes(steamAppId)) {
                secFail.push(steamAppId);
              // eslint-disable-next-line no-else-return
              } else {
                secTemp.push(result.data[0].game);
                // 기능 구현 이후에 삭제할 것
              }
              statObj.count++;
              console.log(`Searching for steam URL from steam app id failed on first attempt: ${secTemp.length + secFail.length}/${fail.length}`);
              if (secTemp.length + secFail.length === thisArr.length) {
                console.log(`Second attempt: Succeed(${secTemp.length}), Fail(${secFail.length})`)
                const totalSuccess = temp.concat(secTemp).sort((prev, next) => prev < next ? -1 : 1);
                statObj.total = totalSuccess.length;
                statObj.count = 0;
                statObj.status = '3';
                resolve(totalSuccess);
              }
            });
        }, index * 300);
      });
    } else {
      console.log(`Second attempt: No fails detected. Proceed to next step.`)
      resolve(temp);
    }
  });
  // 7. 5, 6에서 검색된 IGDB 고유 아이디를 통한 게임 메타데이터 검색 함수
  const returnMeta = (rawData, filterFunc) => new Promise(resolve => {
    const temp = [];
    rawData.forEach((igdbID, index) => {
      setTimeout(() => {
        filterFunc(igdbID)
          .then(result => {
            temp.push(result.data[0]);
            statObj.count++;
            console.log(`Searching meta: ${temp.length}/${rawData.length}`);
            if (temp.length === rawData.length) {
              console.log(`Searching meta: Search complete. Proceed to next step.`)
              const rawMeta = temp.sort((prev, next) => prev.name < next.name ? -1 : 1)
              statObj.total = rawMeta.length;
              statObj.count = 0;
              statObj.status = '4';
              resolve(rawMeta);
            }
          });
      }, index * 300);
    });
  });
  // 8. 메타 데이터 가공 함수 - 제목, 표지, 추출 및 고유 아이디 평문으로 변환
  const processMeta = (rawData, filterFunc) => new Promise(resolve => {
    const titles = rawData.map(gameMeta => gameMeta.name);
    const resultArr = [];
    let metaCount = 0;
    // const tempData = [...rawData.slice(1, 2)];
    const tempData = [...rawData];
    // tempData.push(rawData.slice(1, 2)[rawData.slice(1, 2).length-1]);
    tempData.push(rawData[rawData.length-1]);
    tempData.forEach((gameMeta, index) =>{
      const {
        artworks,
        cover: covers,
        collection: collections,
        release_dates: releaseDates,
        genres,
        keywords,
        name,
        platforms,
        screenshots,
        summary,
        themes,
        videos,
        websites,
        total_rating: totalRating,
        involved_companies: involvedCompanies,
        game_modes: gameModes,
        player_perspectives: playerPerspectives,
        franchises,
        age_ratings: ageRatings
      } = gameMeta;
      const waitQuery = [
        artworks, covers, collections,
        releaseDates, genres, keywords,
        platforms, screenshots, themes,
        videos, websites,
        involvedCompanies, gameModes,
        playerPerspectives, franchises,
        ageRatings, ageRatings, ageRatings
      ];
      const endPoints = [
        'artworks', 'covers', 'collections',
        'release_dates', 'genres', 'keywords',
        'platforms', 'screenshots', 'themes',
        'game_videos', 'websites',
        'involved_companies', 'game_modes',
        'player_perspectives', 'franchises',
        'age_ratings', 'age_ratings', 'age_ratings'
      ];
      const valNeed = endPoint => {
        const images = ['artworks', 'covers', 'screenshots'];
        let result = '';
        if (images.find(ele => ele === endPoint)) {
          result = 'image_id';
        } else if (endPoint === 'game_videos') {
          result = 'video_id';
        } else if (endPoint === 'release_dates') {
          result = 'human';
        } else if (endPoint === 'websites') {
          result = 'url';
        } else if (endPoint === 'involved_companies') {
          result = ['company', 'developer', 'publisher'];
        } else if (endPoint === 'age_ratings') {
          result = ['category', 'rating'];
        } else {
          result = 'name';
        }
        return result;
      }
      const processedMeta = {};
      let tempCount = 0;
      setTimeout(() => {
        console.log(`meta: ${metaCount}`);
        waitQuery.forEach((queryIds, queIdx) => {
          setTimeout(() => {
            console.log(`temp: ${tempCount}`);
            console.log(endPoints[queIdx]);
            if (queryIds) {
              filterFunc(endPoints[queIdx], valNeed(endPoints[queIdx]), queryIds)
              .then(res => {
                processedMeta[endPoints[queIdx]] = [];
                res.data.forEach(r => {
                  if (typeof valNeed(endPoints[queIdx]) === 'string') {
                    processedMeta[endPoints[queIdx]].push(r.result[0][valNeed(endPoints[queIdx])]);
                  } else {
                    processedMeta[endPoints[queIdx]].push(r.result[0]);
                  }
                });
              });
            } else {
              processedMeta[endPoints[queIdx]] = 'N/A';
            }
            tempCount++;
            if (tempCount === waitQuery.length) {
              processedMeta.name = name;
              processedMeta.summary = summary;
              processedMeta.ratings = totalRating;
              resultArr.push(processedMeta);
            }
          }, queIdx * 300);
        });
        metaCount++;
        // if (resultArr.length === rawData.slice(1, 2).length) {
        if (resultArr.length === rawData.length) {
          const covers = [];
          resultArr.forEach(result => covers.push(result.covers));
          resolve({titles, covers, resultArr});
        }
      }, index * 300 * waitQuery.length);
    });
  });
  // 회사, 연령제한 체크
  const processOmit = (resultObj, filterFunc) => new Promise(resolve => {
    const { titles, covers, resultArr } = resultObj;
    // console.log(resultArr)
    const withoutNA = resultArr.filter(result => result.involved_companies !== 'N/A');
    const copyResultArr = [...resultArr, resultArr[resultArr.length - 1]];
    const tempResultArr = [];
    const processCompanies = () => new Promise(subReso => {
      copyResultArr.forEach((result, resIdx) => {
        const { involved_companies: companies } = result;
        setTimeout(() => {
          if (typeof companies === 'object') {
            const temp = [];
            companies.forEach((eachCompany, comIdx) => {
              const processedCompany = {};
              const { company } = eachCompany;
              setTimeout(() => {
                filterFunc('companies', company, 'name')
                  .then(res => new Promise(subsubRes => {
                    eachCompany.name = res.data[0].name;
                    temp.push(eachCompany);
                    if (temp.length === companies.length) {
                      processedCompany.origin = resultArr[resIdx].name;
                      processedCompany.processRes = temp;
                      subsubRes(processedCompany);
                    }
                  }))
                  .then(res => {
                    tempResultArr.push(res)
                    if (tempResultArr.length === withoutNA.length) {
                      subReso(tempResultArr);
                    }
                    // console.log('tempResultArr', tempResultArr)
                  });
              }, comIdx * 300);
            });
          }
        }, resIdx * 300 * companies.length);
      });
    });
    processCompanies().then(res => {
      let processCount = 0;
      res.forEach(eachRes => {
        const changeTarget = resultArr.indexOf(resultArr.find(result => result.name === eachRes.origin));
        resultArr[changeTarget].involved_companies = eachRes.processRes;
        processCount++;
        if (processCount === res.length) {
          // console.log(resultArr[changeTarget]);
          resolve({ titles, covers, resultArr });
        }
      })
    });
    // const { involved_companies: companies, age_ratings: ratings } = resultArr[0];
    // const companies = [];
    // const ratings = [];
    // resultArr.forEach(result => {
    //   companies.push(result.involved_companies);
    //   ratings.push(result.age_ratings);
    // });
    // const tempCompanies = [...companies, companies[companies.length - 1], companies[companies.length - 1]];
    // const tempRatings = [...ratings, ratings[ratings.length - 1]];
    // console.log(companies, ratings)
    // const result = [];
    // const processCompanies = () => new Promise(subRes => {
    //   tempCompanies.forEach((companyInfo, comArrIdx) => {
    //     setTimeout(() => {
    //       if (typeof companyInfo === 'object') {
    //         const temp = [];
    //         companyInfo.forEach((eachCompany, comIdx) => {
    //           const processedCompany = {};
    //           const { company, developer, publisher } = eachCompany;
    //           setTimeout(() => {
    //             filterFunc('companies', company, 'name')
    //               .then(res => {
    //                 processedCompany.developer = developer;
    //                 processedCompany.publisher = publisher;
    //                 processedCompany.name = res.data[0].name;
    //                 temp.push(processedCompany);
    //                 if (temp.length === companyInfo.length) {
    //                   result.push(temp);
    //                 }
    //               })
    //           }, comIdx * 300);
    //         });
    //         // const processedCompany = {};
    //         // const { company, developer, publisher } = companyInfo;
    //         // setTimeout(() => {
    //         //   filterFunc('companies', company, 'name')
    //         //     .then(res => {
    //         //       processedCompany.developer = developer;
    //         //       processedCompany.publisher = publisher;
    //         //       processedCompany.name = res.data[0].name;
    //         //       result.push(processedCompany);
    //         //       console.log('result', result);
    //         //       if (result.length === companies.length) {
    //         //         console.log('##############################')
    //         //         subRes(result);
    //         //       }
    //         //     })
    //         // }, comArrIdx * 300);
    //       } else {
    //         // setTimeout(() => {
    //           result.push(companyInfo);
    //         // }, comArrIdx * 300);
    //         // console.log('string', companyInfo);
    //       }
    //       console.log('processing', result)
    //       if (result.length === companies.length) {
    //         subRes(result);
    //       }
    //     }, comArrIdx * 300 * companyInfo.length);
    //   });
    // });
    // processCompanies().then(res => console.log('result', res));
  })
  // 9. DB 기록 함수
  const writeToDB = resultObj => new Promise((resolve, reject) => {
    const { titles, urls, covers, rawData } = resultObj;
    const writeDB = () => {
      (() => {
        const columns = 'title, cover, igdb_url, meta';
        // const queryString = `insert into foo (${columns}) values(?, ?, ?, ?)`;
        const queryString = `insert into ${requestedUser} (${columns}) values(?, ?, ?, ?)`;
        rawData.forEach((data, index) => {
          const values = [titles[index], covers[index], urls[index], JSON.stringify(data)];
          libDB.query(queryString, values, (err, result) => {
            if (err) {
              throw err;
            } else {
              resolve(true);
            }
          });
        });
      })();
    };
    libDB.query(`select * from ${requestedUser}`, (err, result) => {
    // libDB.query(`select * from foo`, (err, result) => {
      if (err) {
        console.log(err)
        const columns = {
          first: 'libid int not null auto_increment',
          second: 'title text not null',
          third: 'cover text null',
          fourth: 'igdb_url text not null',
          fifth: 'meta text not null',
          sixth: 'primary key (libid)'
        }
        const queryString = `
          create table ${requestedUser} (
            ${columns.first},
            ${columns.second},
            ${columns.third},
            ${columns.fourth},
            ${columns.fifth},
            ${columns.sixth}
          );
        `;
        libDB.query(queryString, (err, result) => {
          if (err) {
            throw err;
          } else {
            writeDB();
          }
        })
      } else {
        writeDB();
      }
    });
  });
  // 실제 검색 실행 코드
  firstFilter(gameList, steamURLSearchQuery)
  // firstFilter(tempList, steamURLSearchQuery)
    .then(rawURLSearchResult => secondFilter(rawURLSearchResult, steamURLException))
    .then(gamesInIGDB => returnMeta(gamesInIGDB, igdbIDSearch))
    // .then(igdbResult => processMeta(igdbResult, coverSearch))
    .then(igdbResult => processMeta(igdbResult, multiQuerySearch))
  // 최종 메타데이터 목록 - igdbResult는 배열, 이 중 name, cover 정보 필요. name은 추출하기만 하면 되는데, cover는 image_id를 별도로 검색해서 받아와야 함
    // .then(resultObj => writeToDB(resultObj))
    // .then(writeResult => res.send(writeResult))
    // .catch(err => console.log(err));
    .then(resultObj => processOmit(resultObj, eachQuerySearch))
    .then(res => {
      res.forEach(r => console.log(r))
    })
});

app.post('/disconnect', (req, res) => {
  const originalMsg = JSON.parse(req.body.reqUserInfo);
  const { nickname, stores } = originalMsg;
  const { game: gameStoreList } = stores;
  const storeNames = Object.keys(gameStoreList);
  const isStoreAdded = Object.values(gameStoreList);
  // const storeNames = ['steam', 'epic', 'origin', 'ubisoft'];
  // const isStoreAdded = [true, false, false, true]
  const deletedStoresFilter = storeNames
    .map((store, index) => {
      let temp = '';
      if (!isStoreAdded[index]) {
        temp = store;
      }
      return temp;
    })
    .filter(result => result !== '');
  deletedStoresFilter.forEach(store => {
    const queryString = `select * from ${nickname}`;
    libDB.query(queryString, (err, result) => {
      console.log('search', err, result);
      if (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          res.send('오류가 발생했습니다.');
        }
      } else {
        const delQueryString = `delete from ${nickname}`;
        libDB.query(delQueryString, (err, result) => {
          console.log('del', err, result);
          if (err) {
            throw err;
          } else {
            // 추후 여러 스토어에 대응 가능하도록 수정
            const stores = {
              game: {
                steam: false
              }
            };
            const updateQueryStr = `update user_info set stores=? where user_nick=?`;
            db.query(updateQueryStr, [JSON.stringify(stores), nickname], (err, result) => {
              if (err) {
                throw err;
              } else {
                res.send(true);
              }
            });
          }
        });
      }
    });
  });
  // console.log(deletedStoresFilter);
});

app.post('/get/db', (req, res) => {
  // console.log(req.body.reqData)
  if (req.body.reqData.reqLibs !== undefined) {
    const [gameStores] = req.body.reqData.reqLibs;
    const { reqUser: nickname } = req.body.reqData;
    if (gameStores !== '') {
      // 추후 스토어 갯수 늘어나면 db 선택식으로 변경하기
      libDB.query(`select title, cover from ${nickname}`, (err, result) => {
        if (err) {
          throw err;
        } else {
          res.send(result);
        }
      })
    } else {
      res.send('pending');
    }
  }
});

app.post('/get/meta', (req, res) => {
  const { reqUser, selTitle, credData } = req.body.reqData;
  const { cid, access_token: token } = credData;
  //   /*
  //     쿼리 필요: artworks(obj), cover(num), collections(num), release_dates(obj), genres, keywords, platforms, screenshots, themes, videos, websites, involved_companies, game_modes, player_perspectives, franchises, age_ratings
  //     num 제외 전부 obj, franchises는 경우에 따라서 undefined
  //     endpoint, 변수 불일치 항목: cover(covers), collection(collections)
  //     artworks: image_id
  //       url 형식
  //         썸네일: images.igdb.com/igdb/image/upload/t_thumb/[아이디.확장자]
  //         오리지널: images.igdb.com/igdb/image/upload/t_original/[아이디.확장자]
  //     cover: image_id
  //         썸네일: images.igdb.com/igdb/image/upload/t_thumb/[아이디.확장자]
  //         오리지널: images.igdb.com/igdb/image/upload/t_cover_big/[아이디.확장자]
  //     collection: name
  //     release_dates: human
  //     genres: name
  //     keywords: name
  //     platforms: name
  //     screenshots: image_id
  //         썸네일: images.igdb.com/igdb/image/upload/t_thumb/[아이디.확장자]
  //         오리지널: images.igdb.com/igdb/image/upload/t_original/[아이디.확장자]
  //     themes: name
  //     videos: video_id
  //       유튜브 아이디 -> https://youtu.be/[아이디]
  //     websites: url
  //     involved_companies: company, developer, publisher
  //       company 별도 검색 필요 -> name 값 필요
  //     game_modes: name
  //     player_perspectives: name
  //     franchises: name
  //     age_ratings: category, rating
  //       rating enum 1~5는 PEGI, 6~12는 ESRB
  //       PEGI
  //         3
  //           https://www.igdb.com/assets/pegi/PEGI_3-477c57b0d607627660e0ee86f4e39bad95233170528b028b21688faaba6a455b.png
  //         7
  //           https://www.igdb.com/assets/pegi/PEGI_7-fc2907b8d2f83bccc55070468cb0d4e90f1dd98a6a987cb53ed908e6eda31451.png
  //         12
  //           https://www.igdb.com/assets/pegi/PEGI_12-5c83ad44ed32a4c9bd40019d9817ba2ef69d2081db831285c64bfe08002a79ae.png
  //         16
  //           https://www.igdb.com/assets/pegi/PEGI_16-177256b4d01a59019d708199d71ccdc9721680ca8165c452b3eecff8bf47b61c.png
  //         18
  //           https://www.igdb.com/assets/pegi/PEGI_18-1efef95fe494465b999ef3d607f28e684a30341a0a9270a071fc559ee09577fc.png
  //       ESRB
  //         RP
  //           https://www.igdb.com/assets/esrb/esrb_rp-2b9f914da8685eb905a3cb874e497ce9848db879a65e43444c6998fc28852c9b.png
  //         EC
  //           https://www.igdb.com/assets/esrb/esrb_ec-c2202019bef0475ea95d5ffdbfd882f595912e4a6cbea9204132fa73a0804076.png
  //         E
  //           https://www.igdb.com/assets/esrb/esrb_e-3ff51fae393dfcf5decdd4daa462372f28e3d78b417906e64d3d65ff08179838.png
  //         E10
  //           https://www.igdb.com/assets/esrb/esrb_e10-2b4600f85680e68b6e65b050e150754607669cd2602a224c5d9198ecbf0a860f.png
  //         T
  //           https://www.igdb.com/assets/esrb/esrb_t-addf8c69e4e93438b2a4cf046972279b7f9a6448929fbb0b0b7b7c28a0e60a24.png
  //         M
  //           https://www.igdb.com/assets/esrb/esrb_m-5472ffae8a4488c825e55818f41312dcc04401e45302246d3d19b0a08014de96.png
  //         AO
  //           https://www.igdb.com/assets/esrb/esrb_ao-53b8347d8123bf6cab401d0aa7e4f22aa88e25cb6b032be1813f967313bab2c5.png
  //   */
  //   // console.log(JSON.parse(result[0].meta))
});

app.listen(port, () => console.log(`server is running at port${port}`));