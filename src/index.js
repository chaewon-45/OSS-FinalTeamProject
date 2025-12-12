//앱 시작 & 라우팅 설정(App과 MovieDetail로 라우트를 나눔)

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
//BrowserRouter as Router: 라우터 라이브러리. URL에 따라 다른 컴포넌트를 보여줄 수 있게 해줌
//Route, Routes: 이 URL에는 이 컴포넌트. 이런 규칙을 정의하는 컴포넌트
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//MovieDetail: 상세페이지 컴포넌트
import MovieDetail from './MovieDetail';

//createRoot: React component를 실제 HTML에 그려주는 역할
const root = ReactDOM.createRoot(document.getElementById('root'));
//index.html 안에 'root' id 있음(그 HTML 요소를 가져와서 React가 그 위에 내용을 마운트함)

root.render(
  //개발 시 경고 더 잘 보여주는 래퍼(실제 동작에는 거의 영향X)
  <React.StrictMode>
    {/* 이제 안에서 라우팅 기능 쓸거야.라고 감싸주는 부모 */}
    <Router>
      {/* 여러 개의 <Route>를 그룹으로 묵는 컴포넌트 */}
      <Routes>
        {/* URL이 /일 때에는 <App />컴포넌트 보여주면 됨 */}
        <Route path="/" element={<App />} />
        {/* 상세 페이지 보여줌 
        :id = 영화 고유 번호(이 값을 useParams()로 MovieDetail.js에서 받아감 */}
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
