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

const formatProviderLabel = (provider) => (provider === 'gitlab' ? 'GitLab' : 'GitHub')

const formatAuthTypeLabel = (authType) => {
  if (authType === 'gitlab_pat') {
    return 'GitLab PAT'
  }

  return 'GitHub App'
}

const normalizeProject = (project) => {
  const sourceCode = project.provider ?? project.sourceCode ?? 'github'
  const authConfig = project.auth_config ?? project.authConfig ?? {}
  const authType = authConfig.type ?? (sourceCode === 'gitlab' ? 'gitlab_pat' : 'github_app')
  const projectName = project.project_name ?? project.projectName ?? ''

  return {
    id: project.project_id ?? project.id ?? `${project.owner ?? projectName}-${project.repo_name ?? project.repoName ?? Date.now()}`,
    sourceCode,
    owner: project.owner ?? projectName ?? '-',
    repoName: project.repo_name ?? project.repoName ?? projectName ?? '-',
    projectName,
    pemFileName: project.pem_file_name ?? project.pemFileName ?? '',
    authType,
    appId: authConfig.app_id ?? project.app_id ?? project.appId ?? '-',
    installId: authConfig.installation_id ?? project.installation_id ?? project.installId ?? '-',
    isActive: project.is_active ?? project.isActive ?? true,
    createdAt: formatProjectDate(project.created_at ?? project.createdAt),
  }
}

const extractConnection = (payload) => payload?.data ?? payload?.connection ?? payload

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

  const authIssueDescription = project.authType === 'gitlab_pat'
    ? 'Please verify GitLab Personal Access Token scope and expiration policy.'
    : `Please verify GitHub App ID ${project.appId} and Install ID ${project.installId} mapping.`

  return [
    {
      id: `${project.id}-issue-1`,
      status: 'Open',
      priority: 'High',
      title: `${project.repoName} Authentication Flow Exception Handling`,
      description: `Need to organize response messages and status codes for login failures in ${project.owner}/${project.repoName}.`,
    },
    {
      id: `${project.id}-issue-2`,
      status: 'In Review',
      priority: 'Medium',
      title: `${project.repoName} Pre-deployment Environment Variables Check`,
      description: authIssueDescription,
    },
    {
      id: `${project.id}-issue-3`,
      status: 'Planned',
      priority: 'Low',
      title: `${project.repoName} Operations Log Visibility Improvement`,
      description: `Add issue tracking logs and dashboard connection points based on Project ID ${project.id}.`,
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
  const [accessToken, setAccessToken] = useState('')
  const [owner, setOwner] = useState('')
  const [repoName, setRepoName] = useState('')
  const [gitlabProjectName, setGitlabProjectName] = useState('')
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

    if (sourceCode !== 'github') {
      return
    }

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.pem')) {
      setPemFile(file)
    }
  }

  const handleSourceCodeChange = (value) => {
    setSourceCode(value)
    setPemFile(null)
    setAppId('')
    setInstallId('')
    setAccessToken('')
    setGitlabProjectName('')
    setIsDragging(false)
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
      setProjectsError('Failed to load projects. Server requires GET /source_control/connections API.')
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

  const ownerValue = owner.trim()
  const repoNameValue = repoName.trim()
  const appIdValue = appId.trim()
  const installIdValue = installId.trim()
  const accessTokenValue = accessToken.trim()
  const gitlabProjectNameValue = gitlabProjectName.trim()
  const isGithubFormValid = Boolean(sourceCode === 'github' && pemFile && appIdValue && installIdValue && ownerValue && repoNameValue)
  const isGitlabFormValid = Boolean(sourceCode === 'gitlab' && accessTokenValue && gitlabProjectNameValue)
  const isProjectFormValid = isGithubFormValid || isGitlabFormValid

  const handleAddProject = async () => {
    if (!isProjectFormValid) {
      return
    }

    setIsLoading(true)
    try {
      let authConfig

      if (sourceCode === 'github') {
        const pemContent = await pemFile.text()
        authConfig = {
          type: 'github_app',
          app_id: appIdValue,
          installation_id: installIdValue,
          pem: pemContent,
        }
      } else {
        authConfig = {
          type: 'gitlab_pat',
          access_token: accessTokenValue,
        }
      }

      const requestBody = sourceCode === 'github'
        ? {
            project_id: 0,
            provider: sourceCode,
            owner: ownerValue,
            repo_name: repoNameValue,
            auth_config: authConfig,
          }
        : {
            project_id: 0,
            provider: sourceCode,
            project_name: gitlabProjectNameValue,
            auth_config: authConfig,
          }

      const response = await fetch(`${config.apiBaseUrl}/source_control/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Failed to register project: ${response.status}`)
      }

      const data = await response.json()
      const createdConnection = extractConnection(data)
      const newProject = normalizeProject({
        ...createdConnection,
        provider: sourceCode,
        owner: sourceCode === 'github' ? ownerValue : gitlabProjectNameValue,
        repo_name: sourceCode === 'github' ? repoNameValue : gitlabProjectNameValue,
        project_name: sourceCode === 'gitlab' ? gitlabProjectNameValue : undefined,
        pem_file_name: sourceCode === 'github' ? pemFile?.name ?? '' : '',
        auth_config: {
          ...createdConnection?.auth_config,
          type: createdConnection?.auth_config?.type ?? authConfig.type,
          ...(sourceCode === 'github'
            ? {
                app_id: appIdValue,
                installation_id: installIdValue,
              }
            : {}),
        },
        created_at: createdConnection?.created_at ?? new Date().toISOString(),
      })

      setProjects(prevProjects => [...prevProjects, newProject])
      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Failed to connect to server.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSourceCode('')
    setPemFile(null)
    setAppId('')
    setInstallId('')
    setAccessToken('')
    setOwner('')
    setRepoName('')
    setGitlabProjectName('')
    setIsDragging(false)
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
        throw new Error(`Analysis request failed: ${response.status}`)
      }

      const data = await response.json()
      setAnalyzeResult(data)
    } catch (error) {
      console.error('Analyze error:', error)
      setAnalyzeError(error.message || 'An error occurred during analysis.')
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
              Logout
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
                  <p className="empty-message">Loading projects...</p>
                ) : projectsError ? (
                  <p className="empty-message">{projectsError}</p>
                ) : projects.length === 0 ? (
                  <p className="empty-message">No projects found. Click the Add button to add one.</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="project-card">
                      <div className="project-icon">📁</div>
                      <div className="project-info">
                        <h3 className="project-name">{project.owner}/{project.repoName}</h3>
                        <p className="project-detail project-id">Project ID: {project.id}</p>
                        <p className="project-detail">Provider: {formatProviderLabel(project.sourceCode)} | Auth: {formatAuthTypeLabel(project.authType)}</p>
                        {project.authType === 'github_app' ? (
                          <p className="project-detail">App ID: {project.appId} | Install ID: {project.installId}</p>
                        ) : (
                          <p className="project-detail">Token credentials are stored server-side.</p>
                        )}
                        {project.pemFileName && (
                          <p className="project-detail">PEM File: {project.pemFileName}</p>
                        )}
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
                  <p className="empty-message">Loading projects...</p>
                ) : projectsError ? (
                  <p className="empty-message">{projectsError}</p>
                ) : projects.length === 0 ? (
                  <p className="empty-message">No registered projects to display issues.</p>
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
                    <h2>Enter Job ID</h2>
                  </div>
                  <div className="analyze-popup-body">
                    <p className="analyze-description">Please enter the Job ID for analysis.</p>
                    <input
                      type="text"
                      className="analyze-input"
                      placeholder="Enter Job ID"
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
                            Completed: {new Date(analyzeResult.data.finished_at).toLocaleString()}
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
                      {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
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
                <h2>Add Project</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label>Source Code</label>
                  <select
                    value={sourceCode}
                    onChange={e => handleSourceCodeChange(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select</option>
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
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
                          onChange={e => setPemFile(e.target.files[0] ?? null)}
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
                              <span className="upload-text">Drag and drop or click to select</span>
                              <span className="upload-hint">.pem files only</span>
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
                        placeholder="Enter App ID"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Install ID</label>
                      <input
                        type="text"
                        value={installId}
                        onChange={e => setInstallId(e.target.value)}
                        placeholder="Enter Install ID"
                        className="form-input"
                      />
                    </div>
                  </>
                )}

                {sourceCode === 'gitlab' && (
                  <>
                    <div className="form-field">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={gitlabProjectName}
                        onChange={e => setGitlabProjectName(e.target.value)}
                        placeholder="Project name (e.g., my-group/my-project)"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Access Token</label>
                      <input
                        type="password"
                        value={accessToken}
                        onChange={e => setAccessToken(e.target.value)}
                        placeholder="Enter GitLab Personal Access Token"
                        className="form-input"
                      />
                    </div>
                  </>
                )}

                {sourceCode === 'github' && (
                  <>
                    <div className="form-field">
                      <label>Owner</label>
                      <input
                        type="text"
                        value={owner}
                        onChange={e => setOwner(e.target.value)}
                        placeholder="GitHub owner (e.g., octocat)"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Repository Name</label>
                      <input
                        type="text"
                        value={repoName}
                        onChange={e => setRepoName(e.target.value)}
                        placeholder="Repository name (e.g., my-repo)"
                        className="form-input"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseModal} disabled={isLoading}>
                  Cancel
                </button>
                <button
                  className={`btn-register ${isLoading ? 'loading' : ''}`}
                  onClick={handleAddProject}
                  disabled={!isProjectFormValid || isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register'}
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

        <section className="login-panel" aria-label="Login Panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Username</span>
              <input type="text" name="username" placeholder="dark-lord" autoComplete="username" />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" name="password" placeholder="••••••••" autoComplete="current-password" />
            </label>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default App
