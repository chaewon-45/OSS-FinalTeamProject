// ★☆★☆메인 페이지 (인기 및 장르별 영화 목록 / 검색 및 필터 기능 포함)★☆★☆


//useState: 변하는 값을 다루는 React Hook
//useEffect: 컴포넌트가 그려지거나 어떤 값이 바뀔 때 실행할 코드를 넣는 Hook
//useRef: DOM 참조 또는 값 유지
import React, { useEffect, useState, useRef } from "react";

//Link: <a href="">와 비슷하지만 페이지 새로고침 없이 라우터로 이동
import { Link } from "react-router-dom";

// css 파일
import "./App.css";
import "./index.css";

// <함수> 인기 영화 / 장르별 영화 가로 스크롤 기능 구현 (좌우 버튼으로)
function GenreRow({ title, movies}) {
  
  
  const rowRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // 입력 값: direction (-1(좌측) 또는 1(우측))
  // direction * 220만큼 이동
  const scrollRow = (direction) => {
    rowRef.current.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    })
  }

  // 버튼 입력을 통한 현재 스크롤 위치에 따라 버튼을 보여줄지 말지 결정
  // scrollLeft: 현재 왼쪽에서 스크롤 된 px / clientWidth: 화면에 보이는 영역의 px / scrollWidth: 전체 컨텐츠의 총 px
  const handleScroll = () =>{
    const { scrollLeft, scrollWidth, clientWidth} = rowRef.current;
    setShowLeft(scrollLeft > 0); // 0이상이면 아직 왼쪽에 컨텐츠가 남아있음
    setShowRight(scrollLeft + clientWidth < scrollWidth -1); // 스크롤된 px + 화면의 px가 전체 컨텐츠 길이보다 큼
  }

    if (!movies || movies.length === 0) return null;

    return (
      <div className="row-section">
        <h2>{title}</h2>

        <div className="row-scroll-wrapper">
          {showLeft && (
            <button className="scroll-btn left" onClick={() => scrollRow(-1)}>
              ◀
            </button>
          )}

          <ul
            className="row-movie-list"
            ref={rowRef}
            onScroll={handleScroll}
          >
            {movies.map((m) => (
              <Link to={`/movie/${m.id}`} className="movie-link">
                <li key={m.id}>

                    <img
                      src={
                        m.poster_path
                          ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                          : "/no_poster.png"
                      }
                      alt={m.title}
                    />
                    <p className="movie-title">{m.title}</p>

                </li>
              </Link>
            ))}
          </ul>

          {showRight && (
            <button className="scroll-btn right" onClick={() => scrollRow(1)}>
              ▶
            </button>
          )}
        </div>
      </div>
    );
  }


// 메인 App 컴포넌트
function App() {


  // 검색 및 필터 결과에 대한 영화 리스트 배열
  // movies: 화면에 보여줄 영화 리스트 배열
  // setMovies : 이 배열을 변경하기 위한 함수
  const [movies, setMovies] = useState([]);

  // 메인 페이지의 인기 영화 리스트 배열
  const [popularMovies, setPopularMovies] = useState([]);

  // 장르별 영화 객체
  const [genreMovies, setGenreMovies] = useState({});

  // 메인 페이지에서 스크롤을 할 때 중복 실행에 대한 방지
  const genreLockRef = useRef(false);

  // 입력된 검색어를 저장함
  //query: 검색창에 들어있는 문자열, setQuery: 검색어 바뀔 때 업데이트 하는 함수
  const [query, setQuery] = useState("");

  // 선택한 장르를 저장하는 배열
  //genres: 선택된 장르 배열, setGenres: 장르 선택을 변경하는 함수
  const [genres, setGenres] = useState([]);

  // 선택한 연도를 저장
  //startYear: 필터 - 시작 연도 , setStartYear: 시작 연도 변경 함수
  //endYear: 필터 - 종료 연도 , setEndYear: 종료 연도 변경 함수
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  // 선택한 최소 평점을 저장
  //rating: 필터 - 최소 평점 , setRating: 평점 변경 함수
  const [rating, setRating] = useState(0);

  // 상태 저장을 위한 flag
  // isFiltered - 필터 요소가 있는지 없는지
  // isSearched - 검색 요소가 있는지 없는지
  const [isFiltered, setIsFiltered] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  // 무한 스크롤 구현을 위한 상태 저장용
  // page: 현재 불러온 페이지 번호, setPage: 페이지 번호 변경 함수
  // hasMore: 더 불러올 영화가 있는지 여부, setHasMore: 이 값 변경 함수
  // loading: 현재 추가 데이터를 불러오는 중인지 여부, setLoading: 이 값 변경 함수
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 메인 페이지에서 보여줄 장르의 개수 (기본 3개를 보여주도록 설정)
  const [visibleGenreCount, setVisibleGenreCount] = useState(3);

  // IntersectionObserver 대상 ref
  const genreLoaderRef = useRef(null);
  const searchLoaderRef = useRef(null);

  // =============================================
  // 페이지 로딩 시 초기 영화 목록을 불러옴
  // =============================================
  useEffect(() => {
    //async: 이 함수 안에서 'await'을 쓸거라고 선언
    const fetchMovies = async () => { // res에 api 호출 결과 저장

      const popularRes = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&page=1`
      );

      const popularData = await popularRes.json();

      // 상위 10개 영화 사용
      setPopularMovies(popularData.results.slice(0,10));
    };

    fetchMovies();
  }, []);

  // ==========================================
  // 장르별 영화 로딩
  // ==========================================
  const fetchGenreMovies = async (genreId) => {
    // 이미 불러왔으면 재요청 X
    if (genreMovies[genreId]) return;

    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&with_genres=${genreId}&page=1`
    );

    const data = await res.json();

    setGenreMovies((prev) => ({
      ...prev,
      [genreId]: data.results.slice(0, 10)
      }));
    };

  // ========================================  
  // 영화 검색 기능
  // ========================================
  const searchMovies = async () => {
    if (query.trim() === "") {
      setIsSearched(false);
      setIsFiltered(false);
      setMovies([]);
      setHasMore(true);
      setPage(1);
      return; // 빈 문자열이면 검색도 아니고 필터링도 아니므로 API 호출 안하고 그냥 return
    }

    setHasMore(true);
    setPage(1);

    const res = await fetch( // 검색창에 입력하여 업데이트된 query로 res에 api 호출 결과 저장
      `https://api.themoviedb.org/3/search/movie?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&query=${query}`
    );
    const data = await res.json(); // 호출된 api로 data 받아옴
    setMovies(data.results); // 받아온 data로 영화 목록 상태 업데이트
    setPage(1); // 페이지 번호 초기화
    setIsSearched(true);
    setIsFiltered(false);
  };

  // =======================================
  // 영화 필터링 기능
  // =======================================
  const filterMovies = async () => {
    setHasMore(true);
    setPage(1);

    // 기본 필터 URL
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR`;
    
    // 장르 필터에서 선택된 장르가 있으면 URL에 장르 조건 추가(join으로 배열에 있는 요소들을 하나로 묶어 문자열로)
    if(genres.length > 0) {
      url += `&with_genres=${genres.join(",")}`;
    }

    // 시작연도, 종료연도가 있으면 URL에 연도 조건 추가
    if(startYear) {
      url += `&primary_release_date.gte=${startYear}-01-01`;
    }

    if(endYear) {
      url += `&primary_release_date.lte=${endYear}-12-31`;
    }

    // 평점이 0보다 크면 URL에 평점 조건 추가
    if(rating > 0) {
      url += `&vote_average.gte=${rating}`;
    }
    
    
    const res = await fetch(url);  // 필터로 구성된 URL로 API호출
    const data = await res.json(); // 호출된 API로 data를 받아옴
    setMovies(data.results); // 받아온 data로 영화 목록 상태 업데이트
    setPage(1); // 페이지 번호 초기화
    setIsFiltered(true);
    setIsSearched(false);

  }

  // 장르 버튼 클릭 시 호출되는 함수
  const toggleGenre = (genreId) => {
    if (genres.includes(genreId)) { // genres 배열에 이미 선택된 장르이면
      setGenres(genres.filter(g => g !== genreId)); // 해당 장르의 선택을 해제 (배열에서 제거)
    } else { // genres 배열에 선택되지 않은 장르였으면
      setGenres([...genres, genreId]); // 해당 장르를 선택 (배열에 추가)
    }
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setGenres([]);
    setStartYear("");
    setEndYear("");
    setRating(0);
    setIsFiltered(false);
  }


  // 추가 영화 불러오기 함수
  const loadMoreMovies = async () => {
  if (loading) return; // 이미 불러오는 중이면 호출 X

  setLoading(true); // 로딩 상태 true로 설정

  const nextPage = page + 1; // 다음 페이지 번호 계산

  let url = ""; // 상태에 따라 URL이 다르므로 URL을 우선 초기화

  if (isFiltered) {
  url = `https://api.themoviedb.org/3/discover/movie?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&page=${nextPage}`;

  if (genres.length > 0) {
    url += `&with_genres=${genres.join(",")}`;
  }

  if (startYear) {
    url += `&primary_release_date.gte=${startYear}-01-01`;
  }

  if (endYear) {
    url += `&primary_release_date.lte=${endYear}-12-31`;
  }

  if (rating > 0) {
    url += `&vote_average.gte=${rating}`;
  }
  } else if (isSearched) { // 검색 상태였으면 search API에 페이지 번호 추가해서 호출
      url = `https://api.themoviedb.org/3/search/movie?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&query=${query}&page=${nextPage}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (data.results.length === 0) { // 더 불러올 영화가 없으면
    setHasMore(false); // hasMore을 false로 설정
  } else {
    setMovies((prev) => [...prev, ...data.results]); // 기존 영화에 새로 불러온 영화 추가
    setPage(nextPage);
  }

  setLoading(false);
};

  // 장르 목록
  const GENRES = [
    { id: 28, name: "액션" },
    { id: 12, name: "모험" },
    { id: 16, name: "애니메이션" },
    { id: 35, name: "코미디" },
    { id: 80, name: "범죄" },
    { id: 99, name: "다큐멘터리" },
    { id: 18, name: "드라마" },
    { id: 10751, name: "가족" },
    { id: 14, name: "판타지" },
    { id: 36, name: "역사" },
    { id: 27, name: "공포" },
    { id: 10402, name: "음악" },
    { id: 9648, name: "미스터리" },
    { id: 10749, name: "로맨스" },
    { id: 878, name: "SF" },
    { id: 10770, name: "TV 영화" },
    { id: 53, name: "스릴러" },
    { id: 10752, name: "전쟁" },
    { id: 37, name: "서부" }
  ];

  const visibleGenres = GENRES.slice(0, visibleGenreCount);

  const isSearching = isSearched || isFiltered;

  useEffect(() => { // 영화 추가 불러오기를 위한 Intersection Observer 설정
  if (!isSearching || loading || !hasMore) return; // 검색/필터링 중이 아니거나 로딩 중이거나 더 불러올 영화가 없으면 실행 X

  const observer = new IntersectionObserver( // Intersection Observer 생성
    (entries) => { 
      if (entries[0].isIntersecting) { // 관찰 대상이 발견되면
        loadMoreMovies(); // 추가 영화 불러오기 함수를 호출
      }
    },
    { threshold: 1 } // observer 대상이 완전히 보일 때 실행
  );

  if (searchLoaderRef.current) { // 관찰 대상이 존재하면
    observer.observe(searchLoaderRef.current); // 관찰 시작
  }

  return () => observer.disconnect(); 
  }, [isSearching, loading, hasMore, page]);

  useEffect(() => {
  if (isSearching) return; // 검색/필터 중이면 메인 무한 스크롤 X

  if(!genreLoaderRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      
      if (genreLockRef.current) return;
      genreLockRef.current = true;

      setVisibleGenreCount((prev) => { 
        if (prev < GENRES.length) {
          return prev + 1; // 장르 하나 추가
        }
        return prev;
      });  
    },
    { 
      threshold: 1,
      rootMargin: "200px 0px"
     }
  );

  observer.observe(genreLoaderRef.current);

  return () => observer.disconnect();
  }, [isSearching]);

  useEffect(() => {
    if(isSearching) return;

    genreLockRef.current = false;

    visibleGenres.forEach((genre) => {
      fetchGenreMovies(genre.id);
    });
}, [visibleGenreCount, isSearching]);


  //JSX부분 - 화면 그리기
  return (
    <div className="container">
        <h1>Movie Palette</h1>
        

      {/* 필터 */}
      <div className="filter-box">
        <p>장르</p>
        {/* 장르별 필터 */}
        <div className="genre-filter">
            {GENRES.map((g) => ( // 장르 버튼들을 GENRES 배열을 통해 생성
              <button 
                key={g.id} // key값은 각 장르의 고유 id
                onClick={() => toggleGenre(g.id)} // 클릭하면 해당 장르 선택 or 해제
                className={genres.includes(g.id) ? "active" : ""} // 선택된 장르는 active 클래스 적용 (css)
              >
                {g.name} {/* 버튼에 장르 이름 표시 */}
              </button>
            ))}
        </div>

        <div className="year-rating-filter">
          {/* 연도별 필터 */}
          <div>
            <p>개봉 연도</p>
            <div className="year-filter">
              
              <input 
                type="number"
                placeholder="시작 연도"
                value={startYear} 
                onChange={(e) => setStartYear(e.target.value)} // 입력된 값을 시작 연도로 설정
              />
              <span> ~ </span>
              <input 
                type="number"
                placeholder="종료 연도"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)} // 입력된 값을 종료 연도로 설정
              />
            </div>
          </div>
          
          {/* 평점별 필터 */}
          <div className="rating-filter">
            <p>최소 평점</p>
            <input
              type="range"
              min="0" // 슬라이더 최소값
              max="10" // 슬라이더 최대값
              step="1" // 슬라이더 이동 단위
              value={rating}
              onChange={(e) => setRating(e.target.value)} // 슬라이더 값이 바뀔 때 평점 설정
              style={{
                background: `linear-gradient(
                to right, #555 ${rating * 10}%,
                #4aa3df ${rating * 10}%,
                #4aa3df 100%
                )`
              }}
            />

            <div className="rating-labels">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* 필터 적용 버튼 */}
        <div className="filter-apply">
          <button onClick={filterMovies} >적용 </button> 
          <button onClick={resetFilters} style={{marginLeft: "10px"}}>필터 초기화</button>
        </div>
      </div>
        

      {/* 검색창 */}
      <div className="search-bar">
        <input  
          type="text"
          placeholder="영화 제목 검색"
          //input에 들어있는 글자를 state와 동기화
          value={query}
          //onChange : 사용자가 타이핑할 때마다 setQuery로 state를 업데이트(Controlled Component)
          onChange={(e) => {
            setQuery(e.target.value);
          }}  // 검색창에 입력된 값으로 상태 업데이트
          onKeyDown={(e) => {
            if(e.key === "Enter") {
              searchMovies();
            }
          }}
        />
        <button onClick={searchMovies}>검색</button>
      </div>

      {isSearching && (
        <>
        {movies.length === 0 ? ( // 영화 목록이 비어있으면 '검색 결과 없음' 표시
        <p>검색 결과 없음</p>
      ) : ( // 영화 목록이 있으면 영화 리스트 출력
        <ul className="movie-list">
          {/* 배열을 돌면서 <li>...</li>를 반복 생성 → 각 m은 영화 하나의 정보 (id, title, poster_path 등) */}
          {movies.map((m) => (
            <Link to={`/movie/${m.id}`} className="movie-link">
              <li key={m.id}>
                {/* 영화목록 클릭했을 때 상세페이지로 이동
                React Router가 /movie/아이디 로 보내고 그 아이디를 상세 페이지에서 받아서 정보를 다시 요청하는 구조 */}
                
                {/* 영화 포스터 */}
                  <img
                  src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : "/no_poster.png"}
                  alt={m.title}
                  />
                
                {/* 영화제목 */}
                  <p className="movie-title">
                  {m.title}
                  </p>
              </li>
            </Link>
          ))}
        </ul>
      )}

      {/* 스크롤 시 감지할 observer */}
      <div ref={searchLoaderRef} style={{ height: "1px" }} />
      </>
      )}

      {!isSearching && (
        <>
          <GenreRow title="인기 영화" movies={popularMovies} />
          
          {visibleGenres.map((genre) => (
            <GenreRow
              key={genre.id}
              title={`${genre.name} 영화`}
              movies={genreMovies[genre.id]}
            />
          ))}

          {/* 메인 페이지용 observer */}
          <div ref={genreLoaderRef} style={{ height: "1px" }} />
        </>
      )}
    </div>
  );
}

export default App;
