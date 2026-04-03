import { useState } from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setUsername(formData.get('username') || 'User')
    setIsLoggedIn(true)
  }

  if (isLoggedIn) {
    return (
      <main className="app-shell logged-in">
        <div className="fire-background" aria-hidden="true">
          <div className="fire-sky" />
          <div className="heat-wave wave-one" />
          <div className="heat-wave wave-two" />
          <div className="heat-wave wave-three" />
          <div className="flame-layer flame-back" />
          <div className="flame-layer flame-mid" />
          <div className="flame-layer flame-front" />
          <div className="fire-glow glow-center" />
          <div className="fire-glow glow-left" />
          <div className="fire-glow glow-right" />
        </div>
        <div className="welcome-screen">
          <h1 className="welcome-title">환영합니다, {username}</h1>
          <p className="welcome-subtitle">로그인 성공</p>
          <button className="logout-button" onClick={() => setIsLoggedIn(false)}>
            로그아웃
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <div className="fire-background" aria-hidden="true">
        {/* 이글거리는 하늘 */}
        <div className="fire-sky" />

        {/* 열기 웨이브 */}
        <div className="heat-wave wave-one" />
        <div className="heat-wave wave-two" />
        <div className="heat-wave wave-three" />

        {/* 화염 레이어 */}
        <div className="flame-layer flame-back" />
        <div className="flame-layer flame-mid" />
        <div className="flame-layer flame-front" />

        {/* 이글거리는 광채 */}
        <div className="fire-glow glow-center" />
        <div className="fire-glow glow-left" />
        <div className="fire-glow glow-right" />

        {/* 불씨 파티클 */}
        <div className="spark spark-1" />
        <div className="spark spark-2" />
        <div className="spark spark-3" />
        <div className="spark spark-4" />
        <div className="spark spark-5" />
        <div className="spark spark-6" />
        <div className="spark spark-7" />
        <div className="spark spark-8" />
        <div className="spark spark-9" />
        <div className="spark spark-10" />
        <div className="spark spark-11" />
        <div className="spark spark-12" />
        <div className="spark spark-13" />
        <div className="spark spark-14" />
        <div className="spark spark-15" />
        <div className="spark spark-16" />
        <div className="spark spark-17" />
        <div className="spark spark-18" />
        <div className="spark spark-19" />
        <div className="spark spark-20" />
      </div>

      <div className="login-shell">
        {/* 사우론의 눈 - 엠블럼 컨테이너 */}
        <div className="emblem-container" aria-hidden="true">
          {/* 금속 프레임 - 복잡한 가시 모양 테두리 */}
          <div className="metal-frame">
            <div className="frame-spike spike-1" />
            <div className="frame-spike spike-2" />
            <div className="frame-spike spike-3" />
            <div className="frame-spike spike-4" />
            <div className="frame-spike spike-5" />
            <div className="frame-spike spike-6" />
            <div className="frame-spike spike-7" />
            <div className="frame-spike spike-8" />
            <div className="frame-inner-ring" />
          </div>

          {/* 외부 불꽃 레이어 0 - 가장 뒤 (가장 크고 느림) */}
          <div className="fire-gooey-wrapper fire-layer-far">
            <div className="fire-particle fp-f1" />
            <div className="fire-particle fp-f2" />
            <div className="fire-particle fp-f3" />
            <div className="fire-particle fp-f4" />
            <div className="fire-particle fp-f5" />
            <div className="fire-particle fp-f6" />
            <div className="fire-particle fp-f7" />
            <div className="fire-particle fp-f8" />
            <div className="fire-particle fp-f9" />
            <div className="fire-particle fp-f10" />
            <div className="fire-core core-f1" />
            <div className="fire-core core-f2" />
          </div>

          {/* 외부 불꽃 레이어 1 - 중간 */}
          <div className="fire-gooey-wrapper fire-layer-back">
            <div className="fire-particle fp-b1" />
            <div className="fire-particle fp-b2" />
            <div className="fire-particle fp-b3" />
            <div className="fire-particle fp-b4" />
            <div className="fire-particle fp-b5" />
            <div className="fire-particle fp-b6" />
            <div className="fire-particle fp-b7" />
            <div className="fire-particle fp-b8" />
            <div className="fire-particle fp-b9" />
            <div className="fire-particle fp-b10" />
            <div className="fire-particle fp-b11" />
            <div className="fire-particle fp-b12" />
            <div className="fire-core core-b1" />
            <div className="fire-core core-b2" />
          </div>

          {/* 외부 불꽃 레이어 2 - 앞쪽 (더 작고 빠름) */}
          <div className="fire-gooey-wrapper fire-layer-front">
            <div className="fire-particle fp-1" />
            <div className="fire-particle fp-2" />
            <div className="fire-particle fp-3" />
            <div className="fire-particle fp-4" />
            <div className="fire-particle fp-5" />
            <div className="fire-particle fp-6" />
            <div className="fire-particle fp-7" />
            <div className="fire-particle fp-8" />
            <div className="fire-particle fp-9" />
            <div className="fire-particle fp-10" />
            <div className="fire-particle fp-11" />
            <div className="fire-particle fp-12" />
            <div className="fire-particle fp-13" />
            <div className="fire-particle fp-14" />
            <div className="fire-particle fp-15" />
            <div className="fire-particle fp-16" />
            <div className="fire-particle fp-17" />
            <div className="fire-particle fp-18" />
            <div className="fire-particle fp-19" />
            <div className="fire-particle fp-20" />
            <div className="fire-core core-1" />
            <div className="fire-core core-2" />
            <div className="fire-core core-3" />
          </div>

          {/* 눈 소켓 - 깊은 그림자 영역 */}
          <div className="eye-socket">
            <div className="socket-shadow" />

            {/* 홍채 불꽃 영역 */}
            <div className="iris-fire">
              <div className="iris-gradient" />
              <div className="iris-texture" />

              {/* 내부 불꽃 레이어 */}
              <div className="fire-inner">
                <div className="inner-flame inner-flame-1" />
                <div className="inner-flame inner-flame-2" />
                <div className="inner-flame inner-flame-3" />
              </div>
            </div>

            {/* 중앙 눈동자 - 수직 슬릿 */}
            <div className="pupil">
              <div className="pupil-core" />
              <div className="pupil-glow" />
            </div>

            {/* 빛 반사 하이라이트 */}
            <div className="eye-highlight highlight-1" />
            <div className="eye-highlight highlight-2" />
          </div>

          {/* 요새 베이스 - 하단 뾰족한 왕관 모양 */}
          <div className="fortress-base">
            <div className="fortress-spire spire-center" />
            <div className="fortress-spire spire-left-1" />
            <div className="fortress-spire spire-left-2" />
            <div className="fortress-spire spire-right-1" />
            <div className="fortress-spire spire-right-2" />
            <div className="fortress-glow" />
          </div>
        </div>

        <section className="login-panel" aria-label="로그인 패널">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>아이디</span>
              <input type="text" name="username" placeholder="dark-lord" autoComplete="username" />
            </label>

            <label className="field">
              <span>비밀번호</span>
              <input type="password" name="password" placeholder="••••••••" autoComplete="current-password" />
            </label>

            <button type="submit" className="login-button">
              로그인
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default App
