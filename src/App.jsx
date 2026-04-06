import { useEffect, useState } from 'react'
import config from './config'

const formatProjectDate = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString()
}

const normalizeProject = (project) => ({
  id: project.project_id ?? project.id ?? `${project.owner}-${project.repo_name ?? project.repoName ?? Date.now()}`,
  sourceCode: project.provider ?? project.sourceCode ?? 'github',
  owner: project.owner ?? '-',
  repoName: project.repo_name ?? project.repoName ?? '-',
  pemFileName: project.pem_file_name ?? project.pemFileName ?? '',
  appId: project.app_id ?? project.appId ?? '-',
  installId: project.installation_id ?? project.installId ?? '-',
  createdAt: formatProjectDate(project.created_at ?? project.createdAt),
})

const extractProjects = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data?.connections)) {
    return payload.data.connections
  }

  if (Array.isArray(payload?.connections)) {
    return payload.connections
  }

  if (Array.isArray(payload?.projects)) {
    return payload.projects
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

const buildProjectIssues = (project) => {
  if (!project) {
    return []
  }

  return [
    {
      id: `${project.id}-issue-1`,
      status: 'Open',
      priority: 'High',
      title: `${project.repoName} 인증 흐름 예외 처리`,
      description: `${project.owner}/${project.repoName}에서 로그인 실패 시 응답 메시지와 상태 코드를 정리해야 합니다.`,
    },
    {
      id: `${project.id}-issue-2`,
      status: 'In Review',
      priority: 'Medium',
      title: `${project.repoName} 배포 전 환경변수 점검`,
      description: `GitHub App ID ${project.appId} 와 Install ID ${project.installId} 매핑 확인이 필요합니다.`,
    },
    {
      id: `${project.id}-issue-3`,
      status: 'Planned',
      priority: 'Low',
      title: `${project.repoName} 운영 로그 가시성 개선`,
      description: `프로젝트 ID ${project.id} 기준으로 이슈 추적 로그와 대시보드 연결 포인트를 추가합니다.`,
    },
  ]
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [activeMenu, setActiveMenu] = useState('project')
  const [showModal, setShowModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedIssueProjectId, setSelectedIssueProjectId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingProjects, setIsFetchingProjects] = useState(false)
  const [projectsError, setProjectsError] = useState('')

  // 프로젝트 추가 폼 상태
  const [sourceCode, setSourceCode] = useState('')
  const [pemFile, setPemFile] = useState(null)
  const [appId, setAppId] = useState('')
  const [installId, setInstallId] = useState('')
  const [owner, setOwner] = useState('')
  const [repoName, setRepoName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Analyze 상태
  const [jobId, setJobId] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [analyzeError, setAnalyzeError] = useState('')

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.pem')) {
      setPemFile(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setUsername(formData.get('username') || 'User')
    setIsLoggedIn(true)
  }

  const loadProjects = async () => {
    setIsFetchingProjects(true)
    setProjectsError('')

    try {
      const response = await fetch(`${config.apiBaseUrl}/source_control/connections`)

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`)
      }

      const data = await response.json()
      setProjects(extractProjects(data).map(normalizeProject))
    } catch (error) {
      console.error('Failed to load projects:', error)
      setProjectsError('기존 프로젝트 목록을 불러오지 못했습니다. 서버에 GET /source_control/connections API가 필요합니다.')
    } finally {
      setIsFetchingProjects(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    loadProjects()
  }, [isLoggedIn])

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedIssueProjectId('')
      return
    }

    const hasSelectedProject = projects.some(project => String(project.id) === selectedIssueProjectId)

    if (!hasSelectedProject) {
      setSelectedIssueProjectId(String(projects[0].id))
    }
  }, [projects, selectedIssueProjectId])

  const handleAddProject = async () => {
    if (sourceCode === 'github' && pemFile && appId && installId && owner && repoName) {
      setIsLoading(true)
      try {
        // PEM 파일 내용 읽기
        const pemContent = await pemFile.text()

        const requestBody = {
          project_id: 0,
          provider: 'github',
          owner: owner,
          repo_name: repoName,
          app_id: appId,
          installation_id: installId,
          pem: pemContent
        }

        const response = await fetch(`${config.apiBaseUrl}/source_control/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const data = await response.json()
          const newProject = normalizeProject({
            ...data,
            provider: sourceCode,
            owner,
            repo_name: repoName,
            pem_file_name: pemFile.name,
            app_id: appId,
            installation_id: installId,
            created_at: new Date().toISOString()
          })
          setProjects(prevProjects => [...prevProjects, newProject])
          resetForm()
          setShowModal(false)
        } else {
          alert('프로젝트 등록에 실패했습니다.')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const resetForm = () => {
    setSourceCode('')
    setPemFile(null)
    setAppId('')
    setInstallId('')
    setOwner('')
    setRepoName('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleAnalyze = async () => {
    if (!jobId.trim()) return

    setIsAnalyzing(true)
    setAnalyzeError('')
    setAnalyzeResult(null)

    try {
      const response = await fetch(`${config.apiBaseUrl}/analyze/${jobId.trim()}`)

      if (!response.ok) {
        throw new Error(`분석 요청 실패: ${response.status}`)
      }

      const data = await response.json()
      setAnalyzeResult(data)
    } catch (error) {
      console.error('Analyze error:', error)
      setAnalyzeError(error.message || '분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const selectedIssueProject = projects.find(project => String(project.id) === selectedIssueProjectId) ?? null
  const selectedProjectIssues = buildProjectIssues(selectedIssueProject)

  if (isLoggedIn) {
    return (
      <div className="dashboard">
        {/* 사이드바 */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo" />
            <span className="sidebar-title">SAURON</span>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeMenu === 'project' ? 'active' : ''}`}
              onClick={() => setActiveMenu('project')}
            >
              <span className="nav-icon">📁</span>
              <span className="nav-label">Project</span>
            </button>
            <button
              className={`nav-item ${activeMenu === 'issues' ? 'active' : ''}`}
              onClick={() => setActiveMenu('issues')}
            >
              <span className="nav-icon">🐛</span>
              <span className="nav-label">Issues</span>
            </button>
            <button
              className={`nav-item ${activeMenu === 'analyze' ? 'active' : ''}`}
              onClick={() => setActiveMenu('analyze')}
            >
              <span className="nav-icon">🔍</span>
              <span className="nav-label">Analyze</span>
            </button>
          </nav>
          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-name">{username}</span>
            </div>
            <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
              로그아웃
            </button>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="main-content">
          <header className="content-header">
            <h1 className="page-title">
              {activeMenu === 'project' && 'Project'}
              {activeMenu === 'issues' && 'Issues'}
              {activeMenu === 'analyze' && 'Analyze'}
            </h1>
            {activeMenu === 'project' && (
              <button className="add-button" onClick={() => setShowModal(true)}>
                + Add
              </button>
            )}
          </header>
          <div className="content-body">
            {activeMenu === 'project' && (
              <div className="project-list">
                {isFetchingProjects ? (
                  <p className="empty-message">프로젝트 목록을 불러오는 중입니다...</p>
                ) : projectsError ? (
                  <p className="empty-message">{projectsError}</p>
                ) : projects.length === 0 ? (
                  <p className="empty-message">프로젝트가 없습니다. Add 버튼을 눌러 추가하세요.</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="project-card">
                      <div className="project-icon">📁</div>
                      <div className="project-info">
                        <h3 className="project-name">{project.owner}/{project.repoName}</h3>
                        <p className="project-detail project-id">Project ID: {project.id}</p>
                        <p className="project-detail">Provider: GitHub</p>
                        <p className="project-detail">App ID: {project.appId} | Install ID: {project.installId}</p>
                      </div>
                      <span className="project-date">{project.createdAt}</span>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeMenu === 'issues' && (
              <>
                {isFetchingProjects ? (
                  <p className="empty-message">프로젝트 목록을 불러오는 중입니다...</p>
                ) : projectsError ? (
                  <p className="empty-message">{projectsError}</p>
                ) : projects.length === 0 ? (
                  <p className="empty-message">등록된 프로젝트가 없어 이슈를 표시할 수 없습니다.</p>
                ) : (
                  <div className="issues-screen">
                    <div className="issues-toolbar">
                      <div className="issues-select-group">
                        <label htmlFor="project-issues-select" className="issues-select-label">Project</label>
                        <select
                          id="project-issues-select"
                          className="issues-select"
                          value={selectedIssueProjectId}
                          onChange={e => setSelectedIssueProjectId(e.target.value)}
                        >
                          {projects.map(project => (
                            <option key={project.id} value={String(project.id)}>
                              {project.owner}/{project.repoName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedIssueProject && (
                        <div className="issues-selected-meta">
                          <span className="issues-selected-title">{selectedIssueProject.owner}/{selectedIssueProject.repoName}</span>
                          <span className="issues-selected-subtitle">Project ID {selectedIssueProject.id}</span>
                        </div>
                      )}
                    </div>

                    <div className="issues-list">
                      {selectedProjectIssues.map(issue => (
                        <article key={issue.id} className="issue-card">
                          <div className="issue-card-header">
                            <div className="issue-badges">
                              <span className={`issue-badge status-${issue.status.toLowerCase().replace(/\s+/g, '-')}`}>{issue.status}</span>
                              <span className="issue-badge issue-priority">{issue.priority}</span>
                            </div>
                            <span className="issue-id">{issue.id}</span>
                          </div>
                          <h3 className="issue-title">{issue.title}</h3>
                          <p className="issue-description">{issue.description}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {activeMenu === 'analyze' && (
              <div className="analyze-container">
                <div className="analyze-popup">
                  <div className="analyze-popup-header">
                    <span className="analyze-icon">🔍</span>
                    <h2>Job ID 입력</h2>
                  </div>
                  <div className="analyze-popup-body">
                    <p className="analyze-description">분석할 작업의 Job ID를 입력해주세요.</p>
                    <input
                      type="text"
                      className="analyze-input"
                      placeholder="Job ID를 입력하세요"
                      value={jobId}
                      onChange={e => setJobId(e.target.value)}
                      disabled={isAnalyzing}
                    />
                    {analyzeError && (
                      <p className="analyze-error">{analyzeError}</p>
                    )}
                    {analyzeResult?.data && (
                      <div className="analyze-result">
                        <div className="analyze-meta">
                          <span className={`analyze-status status-${analyzeResult.data.status}`}>
                            {analyzeResult.data.status}
                          </span>
                          <span className="analyze-job-id">Job: {analyzeResult.data.job_id}</span>
                        </div>
                        {analyzeResult.data.finished_at && (
                          <p className="analyze-time">
                            완료: {new Date(analyzeResult.data.finished_at).toLocaleString()}
                          </p>
                        )}
                        {analyzeResult.data.result_content && (
                          <div className="analyze-content">
                            <pre>{analyzeResult.data.result_content}</pre>
                          </div>
                        )}
                        {analyzeResult.data.error_message && (
                          <p className="analyze-error">{analyzeResult.data.error_message}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="analyze-popup-footer">
                    <button
                      className="analyze-submit-btn"
                      disabled={!jobId.trim() || isAnalyzing}
                      onClick={handleAnalyze}
                    >
                      {isAnalyzing ? '분석 중...' : '분석 시작'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 프로젝트 추가 모달 */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>프로젝트 추가</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label>SourceCode</label>
                  <select
                    value={sourceCode}
                    onChange={e => setSourceCode(e.target.value)}
                    className="form-select"
                  >
                    <option value="">선택하세요</option>
                    <option value="github">GitHub</option>
                  </select>
                </div>

                {sourceCode === 'github' && (
                  <>
                    <div className="form-field">
                      <label>PEM File</label>
                      <div
                        className={`file-upload ${isDragging ? 'dragging' : ''} ${pemFile ? 'has-file' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pem"
                          onChange={e => setPemFile(e.target.files[0])}
                          id="pem-file"
                        />
                        <label htmlFor="pem-file" className="file-label">
                          {pemFile ? (
                            <>
                              <span className="file-icon">📄</span>
                              <span className="file-name">{pemFile.name}</span>
                            </>
                          ) : (
                            <>
                              <span className="upload-icon">📁</span>
                              <span className="upload-text">파일을 드래그하거나 클릭하여 선택</span>
                              <span className="upload-hint">.pem 파일만 가능</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>App ID</label>
                      <input
                        type="text"
                        value={appId}
                        onChange={e => setAppId(e.target.value)}
                        placeholder="App ID를 입력하세요"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Install ID</label>
                      <input
                        type="text"
                        value={installId}
                        onChange={e => setInstallId(e.target.value)}
                        placeholder="Install ID를 입력하세요"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Owner</label>
                      <input
                        type="text"
                        value={owner}
                        onChange={e => setOwner(e.target.value)}
                        placeholder="GitHub 소유자명 (예: octocat)"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Repository Name</label>
                      <input
                        type="text"
                        value={repoName}
                        onChange={e => setRepoName(e.target.value)}
                        placeholder="레포지토리 이름 (예: my-repo)"
                        className="form-input"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseModal} disabled={isLoading}>
                  취소
                </button>
                <button
                  className={`btn-register ${isLoading ? 'loading' : ''}`}
                  onClick={handleAddProject}
                  disabled={!(sourceCode === 'github' && pemFile && appId && installId && owner && repoName) || isLoading}
                >
                  {isLoading ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
