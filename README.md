# libmanage-server

## 서비스 소개
**libmanage**는 사용자의 스팀 라이브러리에 있는 게임의 메타 정보를 PC, 모바일 등 다양한 디바이스에서 설치할 수 있는 앱 형태로 제공하는 애플리케이션입니다.

**libmanage-server**는 **libmanage** 애플리케이션의 백엔드 프로젝트입니다.


## 목차
* 기획 배경 및 상세 소개
* 프로젝트 구조
* 기능 명세 및 상세 화면
* 기술 스택


## 기획 배경 및 상세 소개
* 프론트엔드 역량 향상을 위해 연습할 때보다 대규모의 프로젝트를 진행하는 한편, 관심 있던 기술을 구현해보며 지난 프로젝트들과 차별점을 두는 것을 목표로 삼았습니다.

* 웹 앱의 기본적인 작동 방식에 대한 이해를 쌓기 위해 백엔드 서버를 직접 구현해보는 한편, MySQL을 활용해 DB 구축 및 CRUD 실습을 진행했습니다.


## 프로젝트 구조
```
├── index.js/
│   ├── 로그인 서버/
│   │   ├── post(/login_process): 로그인 인증 진행
│   │   ├── post(/logout_process): 로그아웃 진행
│   │   ├── post(/check_login): 세션 유효성 검사 진행
│   │   ├── post(/member/register): 회원 가입 진행
│   │   ├── post(/member/find/id): 아이디 찾기
│   │   ├── post(/member/find/pwd): 비밀번호 찾기
│   │   ├── post(/member/reset): 비밀번호 초기화 토큰 검사
│   │   ├── post(/member/reset/pwd): 비밀번호 초기화 요청
│   │   ├── post(/verify): DB 데이터 중복 검사
│   │   ├── put(/member/modify_option): 카테고리 재정렬 요청
│   │   ├── put(/member/update): 사용자 정보 변경
│   │   └── delete(/member): 회원 탈퇴 요청
│   │
│   ├── api 통신/
│   │   ├── passport.*: 외부 서비스(스팀) 유효성 검사 진행
│   │   ├── get(/auth/steam): 외부 서비스(스팀) 인증 진행
│   │   ├── get(/auth/steam/return): 사용자 라이브러리 정보 취득
│   │   ├── post(/api/search): 프론트엔드의 메타데이터 검색 요청 처리
│   │   ├── post(/api/connect): igdb.com api 인증 진행
│   │   ├── post(/meta/search): 백엔드에서 메타데이터 검색 진행
│   │   ├── post(/disconnect): 사용자 계정에 연결된 스토어 연동 해제
│   │   ├── post(/get/db): 라이브러리 리스트 표시를 위한 DB 정보 로드
│   │   └── post(/get/meta): 선택한 리스트 아이템의 RAW 메타데이터 가공
│   │
```


## 기능 명세 및 상세 화면
<details>
<summary>기능 명세 및 상세 화면</summary>
<details>
<summary>기본 화면</summary>
<div markdown="1">

![main](https://user-images.githubusercontent.com/20578093/163828641-81572288-f474-43b1-8184-66774b385769.png)

</div>
</details>
<details>
<summary>로그인</summary>
<div markdown="1">

* DB 데이터와의 대조를 통한 **로그인** 기능
* 임의의 사용자 정보 생성을 통한 **게스트 로그인** 기능
* 로그인 없이 사용할 수 있는 **오프라인으로 접속** 기능
![libmng-login](https://user-images.githubusercontent.com/20578093/163829017-557eb190-c4a7-4fa2-b5dc-66a9455ff2e4.png)

</div>
</details>
<details>
<summary>사용자 정보 관리</summary>
<details>
<summary>회원가입</summary>
<div markdown="1">

![libmng-reg](https://user-images.githubusercontent.com/20578093/163829174-f951975e-9c38-415f-bbf6-3ba2ee7c3f2d.png)

</div>
</details>
<details>
<summary>아이디/비밀번호 찾기</summary>
<div markdown="1">

* 아이디 찾기
	![libmng_find_id](https://user-images.githubusercontent.com/20578093/163829466-3f33f88e-5f97-4b43-bf53-c4e77766d6cd.png)
* 비밀번호 찾기
	![libmng_find_pwd](https://user-images.githubusercontent.com/20578093/163829516-16e6ca66-2ab2-474a-90c7-247ed92c307f.png)
* 경우별 예시
	![libmng_find_ex](https://user-images.githubusercontent.com/20578093/163829567-8fd3c940-013e-4bfe-b4e5-a226d1bbe8dd.png)
<details>
<summary>비밀번호 재설정</summary>
<div markdown="1">

* 사용자 요청별 토큰 기반으로 비밀번호 재설정 링크 제공
* 토큰이 유효할 경우
	![libmng_token_valid](https://user-images.githubusercontent.com/20578093/163829755-41dc4186-f260-472c-b191-0e2d4d0d942a.png)
* 토큰이 만료된 경우
	![libmng_token_expired](https://user-images.githubusercontent.com/20578093/163829848-653acec0-26a4-43e5-afc8-983877fcbc7a.png)
* 올바르지 않은 토큰을 사용할 경우
	![libmng_token_invalid](https://user-images.githubusercontent.com/20578093/163829790-21496226-0e26-40a8-969f-016c6dbc1729.png)
* 오류가 발생한 경우
	![libmng_token_err](https://user-images.githubusercontent.com/20578093/163829843-149dc5fe-b619-47ef-845d-ac59bb0dd2c5.png)

</div>
</details>

</div>
</details>
<details>
<summary>회원정보 수정</summary>
<div markdown="1">

* 기능 이용 방법
	![libmng_meminfo_howto](https://user-images.githubusercontent.com/20578093/163830117-4e61e00d-da2f-4aa9-a92b-3717e37a49f8.png)
* 기능 상세
	![libmng_meminfo_mod](https://user-images.githubusercontent.com/20578093/163830125-c9eab841-7c70-4df3-a7d6-d98bf7be7093.png)

</div>
</details>
<details>
<summary>회원 탈퇴</summary>
<div markdown="1">

* 기능 이용 방법
	![libmng_meminfo_howto](https://user-images.githubusercontent.com/20578093/163830117-4e61e00d-da2f-4aa9-a92b-3717e37a49f8.png)
* 기능 상세
	![libmng_meminfo_out](https://user-images.githubusercontent.com/20578093/163830128-98d72746-8bd3-44e8-8e8c-518a94f2876a.png)

</div>
</details>
</details>
<details>
<summary>사용자 라이브러리 관리</summary>
<details>
<summary>사용자의 스팀 로그인을 통한 라이브러리 정보 등록</summary>
<div markdown="1">

1. 라이브러리를 등록할 스토어(스팀)에 로그인
	![libmng_process](https://user-images.githubusercontent.com/20578093/163830499-1c70cecd-24e9-4f9a-84ef-c6cbc3af423a.png)
2. 백엔드 서버를 통해 보유 게임의 메타데이터 검색 후 DB에 저장
	* 프론트엔드 영역은 Websocket 연결을 통해 진행 상황 정보를 백엔드 서버로부터 수령, 표시
	<details>
	<summary>상태 메시지 일람</summary>
	<div markdown="1">

	1. 보유 중인 라이브러리를 IGDB 서비스에 검색 중입니다.
		* 사용자 라이브러리에 저장된 콘텐츠(= 게임)의 제목을 기반으로 [igdb.com](https://www.igdb.com/) 데이터 검색
		![libmng_search](https://user-images.githubusercontent.com/20578093/163830505-d85aeabd-55b3-4b0e-8771-0a226d4380ff.png)
	2. IGDB 서비스로부터 메타데이터를 수신하는 중입니다. (n 회차 / 전체 m 회)
		* 애플리케이션 배포 플랫폼인 Heroku 설정으로 인해 요청 하나의 길이가 30초를 초과할 경우 강제로 접속 종료가 발생함
			* 테스트 환경에서 25개를 초과하는 아이템에 대해 검색 + 데이터 정렬을 위한 가공 + DB 저장까지 진행했을 때 연결 종료가 발생해 25개 단위로 요청
			* 테스트 환경: 와이파이 환경(5GHz 대역, 공유기까지 약 8m 거리)
		![libmng_get_meta](https://user-images.githubusercontent.com/20578093/163830487-9739134b-980a-4e06-b718-16f5e8e0da7f.png)
	3. 수신한 메타데이터를 가공하는 중입니다.
		* 검색한 메타데이터를 리스트 표시를 위한 형태로 가공
		<details>
		<summary>테이블 구조</summary>
		<div markdown="1">

		* libid: 테이블 내 번호
		* title: 콘텐츠 제목 - 텍스트 리스트 표시용
		* cover: 콘텐츠 섬네일 - 섬네일 리스트 표시용
		* igdb_url: 메타데이터 사이트상 해당 콘텐츠의 검색 결과 url
		* processed: 아래 meta 항목이 igdb 사이트에서 막 검색된 상태인지, libmanage 앱에서 표시를 위해 가공된 상태인지 표시
		* meta: 콘텐츠를 메타데이터 사이트에 검색했을 때 받을 수 있는 데이터
			* igdb의 경우 해당 사이트 고유의 id로 값이 제공되므로, libmanage 앱에서의 표시를 위해 추가 가공이 필요
			<details>
			<summary>미가공 상태 예시</summary>
			<div markdown="1">

			* number 값, string 값, number 형태의 추가 검색이 필요한 id가 혼재된 상태
			```
			{
				"id":42,
				"age_ratings":[3193],
				"aggregated_rating":80,
				"aggregated_rating_count":4,
				"alternative_names":[20708,69677,69678,69679],
				"bundles":[46712,52883],
				"category":0,
				"collection":9,
				"cover":86954,
				"created_at":1297808346,
				"external_games":[14911,62326,76954,148020,247081],
				"first_release_date":1070323200,
				"follows":24,
				"game_engines":[6],
				"game_modes":[1],
				"genres":[5,12],
				"involved_companies":[51,52],
				"keywords":[3,58,67,103,106,132,221,283,453,872,970,1026,1097,1098,1158,1219,1313,1322,1346,1423,1523,1527,2242,3061,3270,4035,4094,4134,4183,4187,4202,4250,4284,4304,4330,4345,4376,4391,4397,4420,4428,4432,4444,4446,4543,4571,4592,4594,4598,4611,4613,4619,4621,4624,4626,4634,4660,4662,4681,4712,4737,4770,4777,4832,4838,4850,4892,4896,4902,4918,4920,4980,4992,5029,5185,5197,5264,5272,5349,5350,5382,5426,5427,5479,5542,5544,5554,5578,5583,5595,5599,5697,5704,5760,5783,5799,5800,5812,5892,5963,6002,6005,6135,6250,6258,6260,6261,6352,6363,6374,6377,6378,6391,6397,6400,6428,6478,6589,6619,6621,6624,6630,6737,6767,7021,7038,7353,7476,7498,7582,7593,7670,8101,8262,8792,8806,8969,8996,9003,9083,9291,9306,9313,9376,9378,9382,9444,9653,10047,10048,10322,11067,11699,11810,12123,12195,12254,12279,12442,13114,13115,13117,16058],
				"name":"Deus Ex: Invisible War",
				"platforms":[6,11],
				"player_perspectives":[1],
				"rating":63.0240945538585,
				"rating_count":83,
				"release_dates":[17,14215],
				"screenshots":[418,419,420,421,422],
				"similar_games":[41,43,2031,3042,5647,9498,9727,11270,19441,19531],
				"slug":"deus-ex-invisible-war",
				"summary":"Several religious and political factions see an opportunity to re-shape a worldwide government to their agendas. In this techno-nightmare, take part in the dark struggle to raise the world from its own ashes.\n\nThis dynamic and innovative 1st person-action/adventure brings a level of reality unprecedented in a videogame. Biotech modifications allow players to see through walls, leap 40 feet into the air, regenerate critical body damage or render yourself radar invisible. Globe-hop to real world locations such as Seattle, Antarctica, and Cairo.",
				"tags":[1,18,268435461,268435468,536870915,536870970,536870979,536871015,536871018,536871044,536871133,536871195,536871365,536871784,536871882,536871938,536872009,536872010,536872070,536872131,536872225,536872234,536872258,536872335,536872435,536872439,536873154,536873973,536874182,536874947,536875006,536875046,536875095,536875099,536875114,536875162,536875196,536875216,536875242,536875257,536875288,536875303,536875309,536875332,536875340,536875344,536875356,536875358,536875455,536875483,536875504,536875506,536875510,536875523,536875525,536875531,536875533,536875536,536875538,536875546,536875572,536875574,536875593,536875624,536875649,536875682,536875689,536875744,536875750,536875762,536875804,536875808,536875814,536875830,536875832,536875892,536875904,536875941,536876097,536876109,536876176,536876184,536876261,536876262,536876294,536876338,536876339,536876391,536876454,536876456,536876466,536876490,536876495,536876507,536876511,536876609,536876616,536876672,536876695,536876711,536876712,536876724,536876804,536876875,536876914,536876917,536877047,536877162,536877170,536877172,536877173,536877264,536877275,536877286,536877289,536877290,536877303,536877309,536877312,536877340,536877390,536877501,536877531,536877533,536877536,536877542,536877649,536877679,536877933,536877950,536878265,536878388,536878410,536878494,536878505,536878582,536879013,536879174,536879704,536879718,536879881,536879908,536879915,536879995,536880203,536880218,536880225,536880288,536880290,536880294,536880356,536880565,536880959,536880960,536881234,536881979,536882611,536882722,536883035,536883107,536883166,536883191,536883354,536884026,536884027,536884029,536886970],
				"themes":[1,18],
				"total_rating":71.51204727692925,
				"total_rating_count":87,
				"updated_at":1635246352,
				"url":"https://www.igdb.com/games/deus-ex-invisible-war",
				"videos":[10],
				"websites":[40860,40861,118817,127466,127467],
				"checksum":"c5d279b8-a8d6-ed33-c612-69f87661f8be"
			}
			```

			</div>
			</details>
			<details>
			<summary>가공 상태 예시</summary>
			<div markdown="1">

			* 표시할 데이터만 추출한 후 개별적인 검색 요청을 통해 유의미한 값을 수령하는 방식으로 가공 진행
			```
			{
				"artworks":["ars1d"],
				"covers":["co1vok"],
				"collections":["Batman: Arkham"],
				"genres":["Hack and slash/Beat ''em up","Adventure"],
				"game_videos":["T8bu2Y_cZb8"],
				"game_modes":["Single player"],
				"player_perspectives":["Third person"],
				"franchises":["Batman"],
				"release_dates":[{"id":208307,"human":"Mar 26, 2010","platform":6,"platform_name":"PC (Microsoft Windows)"},{"id":208308,"human":"May 11, 2010","platform":9,"platform_name":"PlayStation 3"},{"id":208309,"human":"May 11, 2010","platform":12,"platform_name":"Xbox 360"},{"id":208310,"human":"Nov 03, 2011","platform":14,"platform_name":"Mac"},{"id":208311,"human":"Mar 26, 2010","platform":9,"platform_name":"PlayStation 3"},{"id":208312,"human":"Mar 26, 2010","platform":12,"platform_name":"Xbox 360"}],
				"platforms":["PC (Microsoft Windows)","PlayStation 3","Xbox 360","Mac"],
				"themes":["Action","Horror","Stealth"],
				"age_ratings":[{"id":29694,"category":1,"rating":10},{"id":29695,"category":2,"rating":3}],
				"screenshots":["giqxuveuvxoc9e8zwh64","ppduuwevxcv7ttbs6pwy","ks88mlsjpk5ggdniz4sw","m5cbxh6yq3cobpe6dord","uqtqx7bajgm51ld0sjxg"],
				"involved_companies":[{"id":51849,"company":50,"developer":false,"publisher":true,"company_name":"WB Games"},{"id":106800,"company":164,"developer":true,"publisher":false,"company_name":"Rocksteady Studios"},{"id":106801,"company":4,"developer":false,"publisher":true,"company_name":"Eidos Interactive"},{"id":106802,"company":23,"developer":false,"publisher":false,"company_name":"Feral Interactive"},{"id":106803,"company":165,"developer":false,"publisher":true,"company_name":"DC Entertainment"}],
				"websites":[{"id":40018,"category":13,"url":"https://store.steampowered.com/app/35140"},{"id":120154,"category":16,"url":"https://www.epicgames.com/store/en-US/product/batman-arkham-asylum/home"},{"id":150964,"category":1,"url":"http://rocksteadyltd.com/#arkham-asylum"},{"id":150965,"category":6,"url":"https://www.twitch.tv/rocksteady"},{"id":150966,"category":9,"url":"https://www.youtube.com/user/BatmanArkhamCity"},{"id":150967,"category":4,"url":"https://www.facebook.com/BatmanArkhamUK"},{"id":150968,"category":5,"url":"https://twitter.com/batmanarkham"},{"id":150969,"category":8,"url":"https://www.instagram.com/batmanarkham"},{"id":150970,"category":14,"url":"https://www.reddit.com/r/BatmanArkham"},{"id":150971,"category":2,"url":"https://batman.fandom.com/wiki/Batman:_Arkham_Asylum"}],
				"name":"Batman: Arkham Asylum - Game of the Year Edition",
				"summary":"Critically acclaimed Batman: Arkham Asylum returns with a remastered Game of the Year Edition, featuring 4 extra Challenge Maps. The additional Challenge Maps are Crime Alley; Scarecrow Nightmare; Totally Insane and Nocturnal Hunter (both from the Insane Night Map Pack). \n- Utilize the unique FreeFlow™ combat system to chain together unlimited combos seamlessly and battle with huge groups of The Joker’s henchmen in brutal melee brawls \n- Investigate as Batman, the WORLD’S GREATEST DETECTIVE, by solving intricate puzzles with the help of cutting edge forensic tools including x-ray scanning, fingerprint scans, ‘Amido Black’ spray and a pheromone tracker \n- Face off against Gotham’s greatest villains including The Joker, HARLEY QUINN, POISON IVY and KILLER CROC \n- Become the Invisible Predator™ with Batman’s fear takedowns and unique vantage point system to move without being seen and hunt enemies \n- Choose multiple takedown methods, including swooping from the sky and smashing through walls. \n- Explore every inch of Arkham Asylum and roam freely on the infamous island, presented for the first time ever in its gritty and realistic entirety \n- Experience what it’s like to be BATMAN using BATARANGS, explosive gel aerosol, The Batclaw, sonar resonator and the line launcher \n- Unlock more secrets by completing hidden challenges in the world and develop and customize equipment by earning experience points \n- Enjoy complete superhero freedom in the environment with the use of Batman’s grapnel gun to get to any place you can see, jump from any height and glide in any direction",
				"totalRating":89.39922440890159
			}
			```

			</div>
			</details>
		```
		+--------------+-------------+------+-----+---------+----------------+
		| Field        | Type        | Null | Key | Default | Extra          |
		+--------------+-------------+------+-----+---------+----------------+
		| libid        | int(11)     | No   | PRI | NULL    | auto_increment |
		| title        | text        | No   |     | NULL    |                |
		| cover        | text        | Yes  |     | NULL    |                |
		| igdb_url     | text        | No   |     | NULL    |                |
		| processed    | char(5)     | No   |     | NULL    |                |
		| meta         | text        | No   |     | NULL    |                |
		+--------------+-------------+------+-----+---------+----------------+
		```

		</div>
		</details>

		![libmng_proc_meta](https://user-images.githubusercontent.com/20578093/163830494-c5dbc240-6556-4066-af5b-a940d8720ed5.png)

	4. 메타데이터의 저장이 완료됐습니다.
		* 사용자 라이브러리에 등록된 모든 아이템의 메타데이터를 검색, 가공한 후 DB에 저장까지 마친 상태
		![libmng_save_done](https://user-images.githubusercontent.com/20578093/163830503-48aeebef-6628-4353-8eeb-828c09cb474b.png)

	</div>
	</details>

</div>
</details>
<details>
<summary>카테고리 관리</summary>
<div markdown="1">

* 원하는 목록만 표시
	![libmng_cat_filter](https://user-images.githubusercontent.com/20578093/163830869-b42cde91-d194-4aac-adac-e4ac38e088ae.png)
	<details>
	<summary>카테고리 목록 정렬 기능</summary>
	<div markdown="1">

	![libmng_cat_reorder](https://user-images.githubusercontent.com/20578093/163830872-9c752e63-1389-4f14-bb0d-28bddbc67bac.png)

	</div>
	<details>
	<summary>기능 시연</summary>
	<div markdown="1">

	![libmng_cat_reorder_demo](https://user-images.githubusercontent.com/20578093/163830853-009708fb-8d2a-47a0-85b9-a004258072e4.gif)

	</div>
	</details>
	</details>

</div>
</details>
<details>
<summary>라이브러리 텍스트/섬네일 표시</summary>
<div markdown="1">

* 텍스트 리스트
	![libmng_txt_list](https://user-images.githubusercontent.com/20578093/163831234-c6c5c7cd-1110-4320-91d8-fc902c7f15eb.png)
* 섬네일 리스트
	![libmng_thumbs_list](https://user-images.githubusercontent.com/20578093/163831228-8ac92217-054c-477d-87ce-584e7c5d18b6.png)
<details>
<summary>섬네일 크기 조정 시연</summary>
<div markdown="1">

![libmng_thumbs_resize_demo](https://user-images.githubusercontent.com/20578093/163831207-345f157e-55e6-4083-98ca-630a9743dd63.gif)

</div>
</details>

</div>
</details>
<details>
<summary>라이브러리 필터링 기능</summary>
<details>
<summary>카테고리/스토어 단위 필터 시연</summary>
<div markdown="1">

* 기본 State: `all`
	* all 버튼을 누를 경우 목록 제거/표시 전환
* 개별 스토어 클릭(= 클릭 1회) → state를 해당 스토어(steam)로 변경
	* 스토어 버튼 2회째 클릭: 목록 제거
	* 스토어 버튼 3회째 클릭: 목록 표시
![libmng_lib_store_filter](https://user-images.githubusercontent.com/20578093/163831420-c344438a-ee53-4ec8-8e1c-e59c3f55c7ce.gif)

</div>
</details>
<details>
<summary>라이브러리 내 필터 시연</summary>
<div markdown="1">

* `Array.prototype.filter()`를 사용해 표시 아이템 필터링
![libmng_lib_txt_filter](https://user-images.githubusercontent.com/20578093/163831428-57ad0cce-219b-4cc2-ad26-0b9610ea4181.gif)

</div>
</details>
</details>
<details>
<summary>라이브러리 열람</summary>
<div markdown="1">

* 사용자 라이브러리 중 [igdb.com](https://www.igdb.com/) 등록 데이터 열람 기능
	<details>
	<summary>항목</summary>
	<div markdown="1">

	* 메타 점수
	* 연령 제한
	* 게임 소개
	* 게임 스크린샷 등 미디어
	* 상세 정보

	</div>
	</details>
* 열람 화면
	![libmng_meta_main](https://user-images.githubusercontent.com/20578093/163831575-851eb917-feae-4030-8507-75777fcc2659.png)
* 스크린샷 열람
	![libmng_meta_media](https://user-images.githubusercontent.com/20578093/163831592-aef56b52-e591-4eb9-ac92-7bc393062144.png)
* 기타 상세 정보 열람
	![libmng_meta_meta](https://user-images.githubusercontent.com/20578093/163831598-0c721549-37e2-48be-958d-ee8f82bee3bc.png)
</div>
</details>
</details>
</details>


## 기술 스택
* Back-End
	* Express.js
* DBMS
	* MySQL
