//메인 페이지(인기/검색 리스트 화면)

//useState: 변하는 값을 다루는 React Hook
//useEffect: 컴포넌트가 그려지거나 어떤 값이 바뀔 때 실행할 코드를 넣는 Hook
import React, { useEffect, useState } from "react";
//Link: <a href="">와 비슷하지만 페이지 새로고침 없이 라우터로 이동
import { Link } from "react-router-dom";
import "./App.css";
import "./index.css";

function App() {
  //movies: 화면에 보여줄 영화 리스트 배열, setMovies: 이 배열을 변경하는 함수
  //useState([]): 초기값은 빈 배열(처음에는 영화 목록이 없음)
  const [movies, setMovies] = useState([]);
  //query: 검색창에 들어있는 문자열, setQuery: 검색어 바뀔 때 업데이트 하는 함수
  const [query, setQuery] = useState(""); // 검색어 상태

  // 페이지가 처음 실행되면 인기영화 목록 불러오기
  useEffect(() => {
    //async: 이 함수 안에서 'await'을 쓸거라고 선언
    const fetchMovies = async () => { // res에 api 호출 결과 저장
      //fetch: 비동기함수(바로 결과를 리턴하는 게 아니라, 나중에 도착할 수도 있는 약속을 반환함
      const res = await fetch(//이 줄에서 기다렸다가, fetch가 서버에서 응답 받아오면 그 값을 res에 넣기
        `https://api.themoviedb.org/3/movie/popular?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&page=1`
      );
      //res.json()도 비동기 → JSON 파싱이 끝날 때까지 await
      const data = await res.json(); // 호출된 api로 data 받아옴
      //React state 변경 -> 컴포넌트 리렌더링 -> 아래 JSX에서 movies.map(...) 다시 그림
      setMovies(data.results); // 받아온 data로 영화 목록 상태 업데이트
    };

    fetchMovies();
  }, []);

  // 검색 실행 함수((검색 버튼의 onClick에 연결))
  const searchMovies = async () => {
    if (query.trim() === "") return; // 빈 문자열이면 API 호출 안하고 그냥 return

    const res = await fetch( // 검색창에 입력하여 업데이트된 query로 res에 api 호출 결과 저장
      `https://api.themoviedb.org/3/search/movie?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR&query=${query}`
    );
    const data = await res.json(); // 호출된 api로 data 받아옴
    setMovies(data.results); // 받아온 data로 영화 목록 상태 업데이트
  };

  //JSX부분 - 화면 그리기
  return (
    <div className="container">
        <h1>Movie Palette</h1>

        {/* 검색창 */}
      <div className="search-bar">
        <input  
          type="text"
          placeholder="영화 제목 검색"
          //input에 들어있는 글자를 state와 동기화
          value={query}
          //onChange : 사용자가 타이핑할 때마다 setQuery로 state를 업데이트(Controlled Component)
          onChange={(e) => setQuery(e.target.value)} // 검색창에 입력된 값으로 상태 업데이트
        />
        <button onClick={searchMovies}>검색</button>
      </div>
      

      {/* 영화 목록 */}
      {movies.length === 0 ? ( // 영화 목록이 비어있으면 '검색 결과 없음' 표시
        <p>검색 결과 없음</p>
      ) : ( // 영화 목록이 있으면 영화 리스트 출력
        <ul className="movie-list">
          {/* 배열을 돌면서 <li>...</li>를 반복 생성 → 각 m은 영화 하나의 정보 (id, title, poster_path 등) */}
          {movies.map((m) => (
              <li key={m.id}>
                {/* 영화목록 클릭했을 때 상세페이지로 이동
                React Router가 /movie/아이디 로 보내고 그 아이디를 상세 페이지에서 받아서 정보를 다시 요청하는 구조 */}
                <Link to={`/movie/${m.id}`} className="movie-link">
                {/* 영화 포스터 */}
                  <img
                  src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                  alt={m.title}
                  />
                </Link>
                <Link to={`/movie/${m.id}`} className="movie-link">
                {/* 영화제목 */}
                  <p className="movie-title">
                  {m.title}
                  </p>
                </Link>
              </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
