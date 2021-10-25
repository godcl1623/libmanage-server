import React from 'react';
import { useSelector } from 'react-redux';

const Meta = () => {
  const selectedItem = useSelector(state => state.selectedItem);
  const selectedItemData = useSelector(state => state.selectedItemData);
  const {
    artworks,
    covers,
    collections,
    genres,
    player_perspectives: perspectives,
    franchises,
    platforms,
    game_modes: modes,
    game_videos: videos,
    age_ratings: ages,
    release_dates: release,
    themes,
    screenshots,
    involved_companies: companies,
    websites,
    name,
    summary,
    totalRating
  } = selectedItemData;
  return (
    <article
      id="meta"
      style={{
        flex: '2',
        zIndex: '1',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <img
        src={
          selectedItemData.covers
            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${covers}.png`
            : ''
        }
        alt="test"
        style={{
          position: 'absolute',
          zIndex: '0',
          width: '100%',
          height: '100%',
          filter: 'opacity(0.25)'
        }}
      />
      <article
        className="meta-wrapper-top"
        style={{
          zIndex: '1',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.6)',
          height: '100%'
        }}
      >
        <h2>{name}</h2>
        <h3>{selectedItemData.totalRating ? parseInt(totalRating, 10) : ''}</h3>
        {/* <article className="meta-wrapper-tab"> */}
        {/* <nav id="meta-tab">
            <button>정보</button>
            <button>사용자 입력 정보</button>
          </nav> */}
        <article className="meta-wrapper-contents">
          <p>{summary}</p>
          <article className="meta-wrapper-contents-media">
            <div className="media-contents-wrapper">
              <div className="media-tabs">
                <button>스크린샷({selectedItemData.screenshots ? screenshots.length : 0})</button>
                <button>동영상({videos ? videos.length : 0})</button>
                <button>기타({selectedItemData.artworks ? artworks.length : 0})</button>
              </div>
              <div className="media-contents">
                {
                  selectedItemData.screenshots
                    ?
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_thumb/${screenshots[0]}.jpg`}
                        alt="screenshot"
                      />
                    : ''
                }
                {
                  videos
                    ? <iframe
                      width="560"
                      height="315"
                      src={`https://www.youtube.com/embed/${videos[0]}`}
                      title="YouTube video player"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    />
                    : ''
                }
                {
                  selectedItemData.artworks
                    ?
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_thumb/${artworks[0]}.jpg`}
                        alt="artworks"
                      />
                    : ''
                }
              </div>
            </div>
          </article>
          <article className="meta-wrapper-contents-info">
            <div className="info-title">
              장르
              시점
              게임 모드
              테마
              플랫폼
              출시일
              개발사 등
              시리즈
              프랜차이즈
              연령 제한
              관련 링크
            </div>
            <div className="info-contents">
              {genres}
              {perspectives}
              {modes}
              {themes}
              {platforms}
              {release ? release[0].human : '0000-00-00'}
              {companies ? companies[0].company_name : ''}
              {collections}
              {franchises}
              {ages ? ages[0].rating : ''}
              {selectedItemData.websites ? websites[0] : ''}
            </div>
          </article>
        </article>
        {/* </article> */}
      </article>
    </article>
  );
};

export default Meta;
