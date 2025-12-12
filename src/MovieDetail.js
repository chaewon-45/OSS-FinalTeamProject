import React, { useEffect, useState } from "react";
//useParams: URL에 있는 id 값을 꺼내주는 hook
import { useParams } from "react-router-dom";
import "./MovieDetail.css";
import "./index.css";

function MovieDetail() {
  const { id } = useParams(); // useParams()로 영화 ID 받음(App.js에서 클릭했던 영화의 id값 들어옴)
  //movie: 한 편의 영화 상세 정보 객체
  const [movie, setMovie] = useState(null);
  //cast: 출연 배우 배열
  const [cast, setCast] = useState([]);
  //director: 감독 이름 문자열
  const [director, setDirector] = useState("");
  //trailerKey: 예고편의 ID를 저장하는 변수
  const [trailerKey, setTrailerKey] = useState(null);


  //useEffect: 이 컴포넌트가 처음 나타날 때 실행(URL의 아이디가 바뀌면 다시 실행)
  useEffect(() => {
    //fetchMovieDetail: /movie/:id 호출 → 결과를 movie에 저장
    const fetchMovieDetail = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR`
      );//기본정보 API 요청
      const data = await res.json();
      //state를 새로운 값으로 바꾸고, 화면 다시 그리기
      setMovie(data);
    };

    //fetchMovieCast: /movie/:id/credits 호출 → cast와 crew가 함께 들어옴
    const fetchMovieCast = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR`
      );//감독+출연진 목록 API 요청
      const data = await res.json();
      // data.cast → 배우 배열
      setCast(data.cast);
      //crew 배열에서 job이 "Director" 인 객체 하나 찾기(없을 수도 있으니 ?.name 으로 안전하게 접근)
      setDirector(data.crew.find(person => person.job === "Director")?.name);
    };

  const fetchTrailer = async () => {
    //이 영화의 영상목록에 API 요청 보냄
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=7e44b2dfbbfb999b75d88bfaa53d2196&language=ko-KR`
    );
    //json으로 파싱
    const data = await res.json();

    // YouTube 예고편(trailer)만 필터링
    const trailer = data.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    //trailerKey에 유튜브 ID 저장
    setTrailerKey(trailer ? trailer.key : null);
  };

  //실제 실행
  fetchMovieDetail();
  fetchMovieCast();
  fetchTrailer();
  }, [id]);

  //아직 setMovie가 안불렸을 때: movie가 null(이 때는 상세정보가 없으므로 임시 문구만 보여줌)
  //API 응답 오고 setMovie 호출되면 다시 렌더링되면서 아래 JSX가 보이게 됨
  if (!movie) return <p>불러오는 중...</p>;

  return (
    <div className="detail-container">
        <div className="detail-top">
            <div className="detail-poster">
                {/* 포스터이미지 */}
                <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                alt={movie.title}
                />
            </div>
            <div className="detail-info">
                <p>제목: {movie.title}</p>
                <p>개봉일: {movie.release_date}</p>
                {/* 예: [{name: "액션"}, {name: "코미디"}] → "액션, 코미디" */}
                <p>장르: {movie.genres.map(g => g.name).join(", ")}</p>
                <p>제작사: {movie.production_companies.map(p => p.name)}</p>
                {/* 출연 배우 너무 많으니까 5명까지만 보이도록 */}
                <p>출연진: {cast.slice(0, 5).map(c => c.name).join(", ")}</p>
                <p>감독: {director}</p>
                <p>상영여부: {movie.status}</p>
            </div>
        </div>
        <div className="detail-bottom">
          {/* 줄거리 요약 */}
            <p>{movie.overview}</p>
        </div>
        {trailerKey && (
          // <iframe
          //   width="560"
          //   height="315"
          //   src={`https://www.youtube.com/embed/${trailerKey}`}
          //   title="YouTube video player"
          //   frameBorder="0"
          //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          //   allowFullScreen
          // ></iframe>
          <a
            href={`https://www.youtube.com/watch?v=${trailerKey}`}
            //새 탭에서 열리게 하는 옵션
            target="_blank"
            //새 탭 열 때 보안 문제 방지용
            rel="noopener noreferrer"
            className="trailer-button"
          >
            🎬 예고편 보러가기
          </a>
        )}
        <p>출연진: {cast.slice(0, 5).map(c => c.name).join(", ")}</p>
                  {cast.slice(0,5).map((cast, index) => {
                  return (
                    <div key={index}>
                      <img src={`https://image.tmdb.org/t/p/w300${cast.profile_path}`} 
                      alt={movie.title}
                      />
                    </div>
                  )
                  })}

    </div>
  );
}

export default MovieDetail;
