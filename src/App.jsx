import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import Word from './Word'
import { allChapters } from './data/chapters'
import ChapterSelector from './components/ChapterSelector'
import DragDropSentence from './components/DragDropSentence'
import StudentNameModal from './components/StudentNameModal'
import { ChapterCompletionModal } from './components/ChapterCompletionModal'
import { AnimatePresence } from 'framer-motion'
import { DndProvider, useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import StarEffect from './components/StarEffect'
import './app.css'

const FONT_SIZES = ['1.2rem', '1.4rem', '1.6rem']
const DEFAULT_FONT_SIZE_INDEX = 1
const NEXT_BUTTON_ANIM_DURATION = 3000
const GLANCE_TIMER_SECONDS = 10

function DraggableWord({ word, isUsed }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'word',
    item: { word },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }))
  return (
    <span
      ref={drag}
      className={`draggable-word-fixed ${isDragging ? 'is-dragging' : ''} ${
        isUsed ? 'used-in-bank' : ''
      }`}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {word}
    </span>
  )
}
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

function App() {
  useEffect(() => {
    localStorage.removeItem('completedActivities')
    localStorage.removeItem('fontSizeIndex')
    localStorage.removeItem('studentName')
    localStorage.removeItem('studentGroup')
    localStorage.removeItem('chaptersStartTime')
    setChapterIndex(0)
    setSceneIndex(0)
    setDarkMode(false)
    setFontSizeIndex(DEFAULT_FONT_SIZE_INDEX)
    setIsActivityCompleted({})
    setShowActivity(false)
    setIsShowingTextDuringActivity(false)
    setAvailableWords([])
    setAnimateNextSceneButton(false)
    setStudentName('')
    setStudentGroup('')
    setShowStudentNameModal(true)
    setShowCongratulatoryModal(false)
    setCongratulatoryModalDetails(null)
    setShowStarEffect(false)
    setBlurPage(false)
    setIsGlanceTimerActive(false)
    setGlanceTimeRemaining(0)
    if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    setPlacedWords(new Set())
    setIsScenePlaying(false)
  }, [])

  const [isPaused, setIsPaused] = useState(false)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE_INDEX)
  const [isActivityCompleted, setIsActivityCompleted] = useState({})
  const [showActivity, setShowActivity] = useState(false)
  const [isShowingTextDuringActivity, setIsShowingTextDuringActivity] =
    useState(false)
  const [availableWords, setAvailableWords] = useState([])
  const [placedWords, setPlacedWords] = useState(new Set())
  const [animateNextSceneButton, setAnimateNextSceneButton] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [studentGroup, setStudentGroup] = useState('')
  const [showStudentNameModal, setShowStudentNameModal] = useState(true)
  const [showCongratulatoryModal, setShowCongratulatoryModal] = useState(false)
  const [congratulatoryModalDetails, setCongratulatoryModalDetails] =
    useState(null)
  const [blurPage, setBlurPage] = useState(false)
  const [showStarEffect, setShowStarEffect] = useState(false)

  const [glanceTimeRemaining, setGlanceTimeRemaining] = useState(0)
  const [isGlanceTimerActive, setIsGlanceTimerActive] = useState(false)
  const glanceTimerRef = useRef(null)
  const dragDropSentenceRef = useRef(null)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const currentChapter = allChapters[chapterIndex]
  const currentScene = currentChapter?.scenes[sceneIndex]
  const hasActivity = currentScene && currentScene.activity !== undefined
  const currentActivityId = `${chapterIndex}-${sceneIndex}`
  const activityIsCompletedForCurrentScene =
    !!isActivityCompleted[currentActivityId]
  const [isScenePlaying, setIsScenePlaying] = useState(false)
  const [readSentenceIndices, setReadSentenceIndices] = useState(new Set())
  const [highlightChapterSelector, setHighlightChapterSelector] =
    useState(false)

  const handleStudentNameSubmit = (nameFromModal, groupFromModal) => {
    setStudentName(nameFromModal)
    setStudentGroup(groupFromModal)
    localStorage.setItem('studentName', nameFromModal)
    localStorage.setItem('studentGroup', groupFromModal)
    setShowStudentNameModal(false)
    setSessionStartTime(Date.now())
    if (chapterIndex === 0) {
      setHighlightChapterSelector(true)
      setTimeout(() => setHighlightChapterSelector(false), 5000)
    }
  }

  const completedScenesInCurrentChapter = useMemo(() => {
    if (!currentChapter) return 0
    return currentChapter.scenes.filter((scene, idx) => {
      const activityId = `${chapterIndex}-${idx}`
      if (
        chapterIndex === 0 &&
        currentChapter.scenes.length === 1 &&
        !currentChapter.scenes.some((s) => s.activity)
      )
        return true
      const sceneHasActivity = scene.activity !== undefined
      return !sceneHasActivity || !!isActivityCompleted[activityId]
    }).length
  }, [currentChapter, chapterIndex, isActivityCompleted])

  const chapterProgress = useMemo(() => {
    if (!currentChapter || currentChapter.scenes.length === 0) return 0
    if (
      chapterIndex === 0 &&
      currentChapter.scenes.length === 1 &&
      !currentChapter.scenes.some((s) => s.activity)
    ) {
      return 100
    }
    const progress =
      (completedScenesInCurrentChapter / currentChapter.scenes.length) * 100
    return Math.min(100, progress)
  }, [currentChapter, chapterIndex, completedScenesInCurrentChapter])

  const showTwoColumnExerciseLayout =
    showActivity && hasActivity && !activityIsCompletedForCurrentScene

  useEffect(() => {
    setIsShowingTextDuringActivity(false)
    setIsGlanceTimerActive(false)
    setGlanceTimeRemaining(0)
    if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    if (
      currentScene &&
      currentScene.activity &&
      currentScene.activity.sentences &&
      Array.isArray(currentScene.activity.sentences)
    ) {
      const correctWordsForBank = currentScene.activity.sentences.reduce(
        (acc, sentence) => {
          sentence.parts.forEach((part) => {
            if (
              part.type === 'blank' &&
              part.correctWord &&
              !acc.includes(part.correctWord)
            )
              acc.push(part.correctWord)
          })
          return acc
        },
        []
      )
      setAvailableWords(shuffleArray(correctWordsForBank))
      if (activityIsCompletedForCurrentScene) {
        setPlacedWords(new Set(correctWordsForBank))
      } else {
        setPlacedWords(new Set())
      }
    } else {
      setAvailableWords([])
      setPlacedWords(new Set())
    }
    const scrollableTextElement = document.querySelector('.scrollable-text')
    if (scrollableTextElement) scrollableTextElement.scrollTop = 0
    if (!showActivity && dragDropSentenceRef.current?.resetActivityState) {
      dragDropSentenceRef.current.resetActivityState()
    }
  }, [
    chapterIndex,
    sceneIndex,
    currentScene,
    activityIsCompletedForCurrentScene,
    showActivity,
  ])

  useEffect(() => {
    localStorage.setItem(
      'completedActivities',
      JSON.stringify(isActivityCompleted)
    )
  }, [isActivityCompleted])
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode)
  }, [darkMode])
  useEffect(() => {
    localStorage.setItem('fontSizeIndex', fontSizeIndex.toString())
  }, [fontSizeIndex])

  const currentFontSize = FONT_SIZES[fontSizeIndex]
  const [activeWord, setActiveWord] = useState(null)
  const speakWord = (wordToSpeak) => {
    if (isScenePlaying) {
      setIsScenePlaying(false)
      setIsPaused(false)
    }
    setReadSentenceIndices(new Set())
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    const utterance = new SpeechSynthesisUtterance(wordToSpeak)
    utterance.lang = 'en-US'
    utterance.rate = 0.6
    utterance.onstart = () => {
      setActiveWord(wordToSpeak)
    }
    utterance.onend = () => {
      setActiveWord(null)
    }
    setTimeout(() => {
      speechSynthesis.speak(utterance)
    }, 150)
  }
  const resetViewAndTimer = () => {
    setReadSentenceIndices(new Set())
    speechSynthesis.cancel()
    setIsPaused(false)
    setIsScenePlaying(false)
    setShowActivity(false)
    setIsShowingTextDuringActivity(false)
    setIsGlanceTimerActive(false)
    setGlanceTimeRemaining(0)
    if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    setBlurPage(false)
    setShowCongratulatoryModal(false)
    dragDropSentenceRef.current?.resetActivityState()
  }

  const playFullScene = () => {
    if (isScenePlaying || !currentScene || !currentScene.text) return
    setIsPaused(false)
    if (speechSynthesis.speaking) speechSynthesis.cancel()
    const sentencesText = currentScene.text
      .reduce((acc, item) => {
        if (
          !acc.length ||
          ['.', '!', '?'].includes(acc[acc.length - 1].slice(-1))
        ) {
          acc.push(item.word)
        } else {
          acc[acc.length - 1] += ' ' + item.word
        }
        return acc
      }, [])
      .map((sentence) => sentence.replace(/\s+([.,!?])/g, '$1'))
    if (sentencesText.length === 0) return
    setIsScenePlaying(true)
    setReadSentenceIndices(new Set())
    const playNextSentence = (sentenceIndex) => {
      if (sentenceIndex >= sentencesText.length) {
        setIsScenePlaying(false)
        setIsPaused(false)
        setTimeout(() => {
          setReadSentenceIndices(new Set())
        }, 1000)
        return
      }
      setReadSentenceIndices((prev) => new Set(prev).add(sentenceIndex))
      const utterance = new SpeechSynthesisUtterance(
        sentencesText[sentenceIndex]
      )
      utterance.lang = 'en-US'
      utterance.rate = 0.65
      utterance.onend = () => {
        playNextSentence(sentenceIndex + 1)
      }
      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 150)
    }
    playNextSentence(0)
  }

  const handlePlaybackToggle = () => {
    if (!isScenePlaying) {
      playFullScene()
      return
    }
    if (isPaused) {
      speechSynthesis.resume()
      setIsPaused(false)
    } else {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const handleChapterChange = (newIndex) => {
    setChapterIndex(newIndex)
    setSceneIndex(0)
    resetViewAndTimer()
  }
  const handleSceneAdvance = (offset) => {
    setSceneIndex((prev) => prev + offset)
    resetViewAndTimer()
  }
  const handleGoToLastSceneOfPrevChapter = () => {
    const prevCh = chapterIndex - 1
    setChapterIndex(prevCh)
    setSceneIndex(allChapters[prevCh].scenes.length - 1)
    resetViewAndTimer()
  }
  const handleGoToFirstSceneOfChapter = () => {
    setShowCongratulatoryModal(false)
    setShowStarEffect(false)
    setBlurPage(false)
    setSceneIndex(0) // 👈 Te quedas en el capítulo actual pero en la primera página
    resetViewAndTimer()
  }

  const getGlobalSceneNumber = () => {
    if (chapterIndex === 0) return null
    let page = 0
    for (let i = 1; i < allChapters.length; i++) {
      if (i < chapterIndex) page += allChapters[i].scenes.length
    }
    return page + sceneIndex + 1
  }

  const shuffleArray = (inputArray) => {
    if (!inputArray) return []
    const newArray = [...inputArray]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  const handleBlanksStateChange = useCallback((wordsCurrentlyInBlanksSet) => {
    setPlacedWords(new Set(wordsCurrentlyInBlanksSet))
  }, [])

  const handleActivityComplete = (activitySuccess) => {
    if (activitySuccess) {
      setIsActivityCompleted((prev) => ({ ...prev, [currentActivityId]: true }))
      setIsShowingTextDuringActivity(false)
      setShowActivity(true)
      setIsGlanceTimerActive(false)
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
      setGlanceTimeRemaining(0)
      const isLastSceneOfChapter =
        currentChapter && sceneIndex === currentChapter.scenes.length - 1
      if (hasActivity && isLastSceneOfChapter && chapterIndex >= 0) {
        let durationMinutes = 0
        if (sessionStartTime) {
          const durationMs = Date.now() - sessionStartTime
          durationMinutes = Math.round(durationMs / (1000 * 60))
        }
        setBlurPage(true)
        setShowStarEffect(true)
        setCongratulatoryModalDetails({
          chapterNumber: chapterIndex,
          chapterTitle: currentChapter.title,
          studentName: studentName,
          studentGroup: studentGroup,
          completionTimestamp: new Date().toISOString(),
          durationMinutes: durationMinutes,
        })
      } else if (
        currentChapter &&
        sceneIndex < currentChapter.scenes.length - 1
      ) {
        setAnimateNextSceneButton(true)
        setTimeout(
          () => setAnimateNextSceneButton(false),
          NEXT_BUTTON_ANIM_DURATION
        )
      }
    }
  }

  const handleGoToIntro = () => {
    setShowCongratulatoryModal(false)
    setShowStarEffect(false)
    setBlurPage(false)
    setChapterIndex(0)
    setSceneIndex(0)
    resetViewAndTimer()
  }

  useEffect(() => {
    if (isGlanceTimerActive && glanceTimeRemaining > 0) {
      glanceTimerRef.current = setInterval(() => {
        setGlanceTimeRemaining((prevTime) => prevTime - 1)
      }, 1000)
    } else if (glanceTimeRemaining === 0 && isGlanceTimerActive) {
      setIsShowingTextDuringActivity(false)
      setIsGlanceTimerActive(false)
      speechSynthesis.cancel()
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    }
    return () => {
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    }
  }, [isGlanceTimerActive, glanceTimeRemaining])

  const handleToggleActivityView = () => {
    if (activityIsCompletedForCurrentScene && !isShowingTextDuringActivity) {
      setShowActivity(false)
      return
    }
    if (!isShowingTextDuringActivity) {
      setIsShowingTextDuringActivity(true)
      setGlanceTimeRemaining(GLANCE_TIMER_SECONDS)
      setIsGlanceTimerActive(true)
    } else {
      setIsShowingTextDuringActivity(false)
      setIsGlanceTimerActive(false)
      setGlanceTimeRemaining(0)
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    }
  }

  const isLastSceneInChapter =
    currentChapter && sceneIndex === currentChapter.scenes.length - 1
  const nextChapterAvailable =
    isLastSceneInChapter &&
    chapterIndex < allChapters.length - 1 &&
    (chapterIndex === 0 || chapterProgress === 100)
  const pageEffectsActive = blurPage || showCongratulatoryModal
  const currentSceneActivityIsPending =
    hasActivity && !activityIsCompletedForCurrentScene
  const activityModeIsActive =
    showActivity && hasActivity && !activityIsCompletedForCurrentScene

  const chapterSelectorDisabled =
    pageEffectsActive ||
    currentSceneActivityIsPending ||
    (activityModeIsActive && isGlanceTimerActive)
  const nextSceneButtonDisabled =
    pageEffectsActive || currentSceneActivityIsPending
  const prevSceneButtonDisabled =
    pageEffectsActive || sceneIndex === 0 || currentSceneActivityIsPending

  const mainControlsDisabled = pageEffectsActive
  const glanceButtonDisabled =
    pageEffectsActive ||
    activityIsCompletedForCurrentScene ||
    (isShowingTextDuringActivity &&
      isGlanceTimerActive &&
      glanceTimeRemaining === 0)
  const checkButtonDisabledInSidebar =
    pageEffectsActive ||
    (isShowingTextDuringActivity && isGlanceTimerActive) ||
    activityIsCompletedForCurrentScene

  if (!currentChapter || !currentScene) {
    return <div>Cargando...</div>
  }

  let mainContentToRender
  if (
    activityModeIsActive &&
    isShowingTextDuringActivity &&
    isGlanceTimerActive
  ) {
    mainContentToRender = (
      <div className={`reading-view-layout glance-mode`}>
        <img
          src={currentScene.image}
          alt={`Scene ${sceneIndex + 1} from Chapter ${
            currentChapter.title || 'Introduction'
          }`}
          className="scene-image"
        />
        <div className="text-container">
          <div style={{ marginBottom: '1rem' }}>
            {chapterIndex === 0 ? (
              <h1 className="main-book-title">{allChapters[0].title}</h1>
            ) : (
              <h2 className="chapter-title-main">{currentChapter.title}</h2>
            )}
          </div>
          <div className="content-area-wrapper">
            <div className="scrollable-text">
              {(() => {
                const sentences = []
                let currentSentenceWords = []
                ;(currentScene?.text || []).forEach((item, idx) => {
                  currentSentenceWords.push({ ...item, globalArrIndex: idx })
                  if (
                    ['.', '!', '?'].includes(item.word) ||
                    idx === (currentScene.text?.length || 0) - 1
                  ) {
                    if (currentSentenceWords.length > 0) {
                      sentences.push(currentSentenceWords)
                    }
                    currentSentenceWords = []
                  }
                })
                if (currentSentenceWords.length > 0) {
                  sentences.push(currentSentenceWords)
                }
                return sentences.map((sentenceData, sIndex) => {
                  return (
                    <span
                      key={sIndex}
                      className={`sentence-wrapper ${
                        readSentenceIndices.has(sIndex) ? 'read-sentence' : ''
                      }`}
                    >
                      {sentenceData.map(
                        ({
                          word: textWord,
                          translation,
                          globalArrIndex: GAI,
                        }) => {
                          const isPunctuation = [
                            '.',
                            ',',
                            '!',
                            '?',
                            '...',
                          ].includes(textWord)
                          return (
                            <span key={`${GAI}-${textWord}`}>
                              {isPunctuation ? (
                                textWord
                              ) : (
                                <Word
                                  text={textWord}
                                  translation={translation}
                                  activeWord={activeWord}
                                  setActiveWord={setActiveWord}
                                  onSpeak={speakWord}
                                  fontSize={currentFontSize}
                                />
                              )}
                            </span>
                          )
                        }
                      )}
                    </span>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  } else if (showTwoColumnExerciseLayout) {
    mainContentToRender = (
      <div className="exercise-fullscreen-layout">
        <div className="exercise-sidebar-left">
          <h3>
            {currentScene.activity?.instructions ||
              'Instrucciones no disponibles.'}
          </h3>
          <div className="sidebar-word-bank">
            <div className="word-options-area-sidebar">
              {availableWords.map((word, index) => (
                <DraggableWord
                  key={`${word}-${index}-bank`}
                  word={word}
                  isUsed={placedWords.has(word)}
                />
              ))}
            </div>
          </div>
          {!activityIsCompletedForCurrentScene && (
            <div className="activity-action-buttons-sidebar">
              <button
                onClick={() =>
                  dragDropSentenceRef.current?.triggerCheckAnswers()
                }
                className="check-button"
                disabled={checkButtonDisabledInSidebar}
              >
                Comprobar
              </button>
              <button
                onClick={handleToggleActivityView}
                className="toggle-activity-view-button"
                disabled={glanceButtonDisabled}
              >
                Ver Texto
              </button>
            </div>
          )}
          {isGlanceTimerActive && isShowingTextDuringActivity && (
            <p className="glance-timer-display">
              Volviendo al ejercicio en: {glanceTimeRemaining}s
            </p>
          )}
        </div>
        <div className="exercise-main-area-right">
          {currentScene.activity &&
          currentScene.activity.sentences &&
          currentScene.activity.sentences.length > 0 ? (
            <DragDropSentence
              ref={dragDropSentenceRef}
              key={currentActivityId + '-active-main'}
              activityData={currentScene.activity}
              onBlanksStateChange={handleBlanksStateChange}
              onActivityComplete={handleActivityComplete}
              isInternallyCompletedProp={activityIsCompletedForCurrentScene}
            />
          ) : (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-color)',
              }}
            >
              Error: No se pueden cargar las oraciones del ejercicio.
            </div>
          )}
        </div>
      </div>
    )
  } else {
    mainContentToRender = (
      <div className={`reading-view-layout`}>
        <img
          src={currentScene.image}
          alt={`Scene ${sceneIndex + 1} from Chapter ${
            currentChapter.title || 'Introduction'
          }`}
          className={`scene-image`}
        />
        <div className={`text-container`}>
          <div style={{ marginBottom: '1rem' }}>
            {chapterIndex === 0 ? (
              <h1 className="main-book-title">{allChapters[0].title}</h1>
            ) : (
              <h2 className="chapter-title-main">{currentChapter.title}</h2>
            )}
          </div>
          <div className="content-area-wrapper">
            <div className={`scrollable-text`}>
              {(() => {
                const sentences = []
                let currentSentenceWords = []
                ;(currentScene?.text || []).forEach((item, idx) => {
                  currentSentenceWords.push({ ...item, globalArrIndex: idx })
                  if (
                    ['.', '!', '?'].includes(item.word) ||
                    idx === (currentScene.text?.length || 0) - 1
                  ) {
                    if (currentSentenceWords.length > 0) {
                      sentences.push(currentSentenceWords)
                    }
                    currentSentenceWords = []
                  }
                })
                if (currentSentenceWords.length > 0) {
                  sentences.push(currentSentenceWords)
                }
                return sentences.map((sentenceData, sIndex) => {
                  return (
                    <span
                      key={sIndex}
                      className={`sentence-wrapper ${
                        readSentenceIndices.has(sIndex) ? 'read-sentence' : ''
                      }`}
                    >
                      {sentenceData.map(
                        ({
                          word: textWord,
                          translation,
                          globalArrIndex: GAI,
                        }) => {
                          const isPunctuation = [
                            '.',
                            ',',
                            '!',
                            '?',
                            '...',
                          ].includes(textWord)
                          return (
                            <span key={`${GAI}-${textWord}`}>
                              {isPunctuation ? (
                                textWord
                              ) : (
                                <Word
                                  text={textWord}
                                  translation={translation}
                                  activeWord={activeWord}
                                  setActiveWord={setActiveWord}
                                  onSpeak={speakWord}
                                  fontSize={currentFontSize}
                                />
                              )}
                            </span>
                          )
                        }
                      )}
                    </span>
                  )
                })
              })()}
            </div>
            {hasActivity &&
              showActivity &&
              activityIsCompletedForCurrentScene &&
              !isShowingTextDuringActivity && (
                <div
                  className="activity-status-section"
                  style={{ marginTop: '1rem' }}
                >
                  <p
                    style={{
                      color: 'var(--blank-correct-color)',
                      fontWeight: 'bold',
                    }}
                  >
                    ¡Ejercicio completado!
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      {showStudentNameModal && (
        <StudentNameModal
          onSubmit={handleStudentNameSubmit}
          currentName={studentName}
          currentGroup={studentGroup}
        />
      )}
      {showCongratulatoryModal && congratulatoryModalDetails && (
        <ChapterCompletionModal
          details={congratulatoryModalDetails}
          onProceed={handleGoToFirstSceneOfChapter} // 👈 Usa la nueva función
          buttonText="Review This Chapter"
        />
      )}
      {showStarEffect && (
        <StarEffect
          onParticlesLoaded={() => setShowCongratulatoryModal(true)}
        />
      )}
      <div
        className={`app-container ${blurPage ? 'app-container-blur' : ''}`}
        onClick={() => {
          if (activeWord) setActiveWord(null)
        }}
      >
        <div className="top-button-bar">
          <div className="left-controls">
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}
              disabled={mainControlsDisabled}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button
              onClick={() => setFontSizeIndex((prev) => Math.max(0, prev - 1))}
              style={{ marginRight: '0.25rem' }}
              disabled={fontSizeIndex === 0 || mainControlsDisabled}
            >
              A-
            </button>
            <button
              onClick={() =>
                setFontSizeIndex((prev) =>
                  Math.min(FONT_SIZES.length - 1, prev + 1)
                )
              }
              disabled={
                fontSizeIndex === FONT_SIZES.length - 1 || mainControlsDisabled
              }
            >
              A+
            </button>
            <ChapterSelector
              chapters={allChapters}
              chapterIndex={chapterIndex}
              setChapterIndex={handleChapterChange}
              isDisabled={chapterSelectorDisabled}
              className={
                highlightChapterSelector ? 'chapter-selector-highlight' : ''
              }
            />

            <button
              onClick={handlePlaybackToggle}
              disabled={mainControlsDisabled}
              className={isScenePlaying ? 'play-scene-button-active' : ''}
            >
              {isPaused ? 'Continuar' : isScenePlaying ? 'Pause' : 'Play Scene'}
            </button>
          </div>
          <div className="right-indicators">
            <div className="nav-buttons-top">
              {chapterIndex !== 0 && (
                <button
                  onClick={() => {
                    if (sceneIndex > 0) handleSceneAdvance(-1)
                    else if (chapterIndex > 0)
                      handleGoToLastSceneOfPrevChapter()
                  }}
                  disabled={
                    prevSceneButtonDisabled ||
                    (chapterIndex === 1 && sceneIndex === 0)
                  }
                >
                  ⬅️ Previous
                </button>
              )}
              {!isLastSceneInChapter && chapterIndex !== 0 && (
                <button
                  onClick={() => {
                    if (
                      currentChapter &&
                      sceneIndex < currentChapter.scenes.length - 1
                    )
                      handleSceneAdvance(1)
                  }}
                  className={
                    animateNextSceneButton ? 'next-scene-button-animate' : ''
                  }
                  disabled={nextSceneButtonDisabled}
                >
                  Next Scene ➡️
                </button>
              )}
              {nextChapterAvailable && chapterIndex !== 0 && (
                <button onClick={handleGoToIntro} disabled={pageEffectsActive}>
                  👉 Go to Introduction
                </button>
              )}
            </div>

            {chapterIndex > 0 && currentChapter && (
              <div className="chapter-progress-container">
                <span className="chapter-progress-text">
                  Capítulo {chapterIndex}: {completedScenesInCurrentChapter}/
                  {currentChapter.scenes.length}
                </span>
                <div className="progress-bar-outer">
                  <div
                    className="progress-bar-inner"
                    style={{ width: `${chapterProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            {getGlobalSceneNumber() && (
              <div className="page-number-top-right">
                Página {getGlobalSceneNumber()}
              </div>
            )}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <div
            key={`${chapterIndex}-${sceneIndex}-${showActivity}-${isShowingTextDuringActivity}-${isGlanceTimerActive}`}
            className="scene-and-activity-container"
          >
            {mainContentToRender}
          </div>
        </AnimatePresence>
        {hasActivity &&
          !showActivity &&
          !activityIsCompletedForCurrentScene && (
            <button
              onClick={() => {
                speechSynthesis.cancel()
                setIsScenePlaying(false)
                setIsPaused(false)
                setReadSentenceIndices(new Set())
                setShowActivity(true)
                setIsShowingTextDuringActivity(false)
              }}
              className="show-activity-button"
            >
              Show Exercise
            </button>
          )}
        {hasActivity && !showActivity && activityIsCompletedForCurrentScene && (
          <div className="activity-completed-indicator">
            <span role="img" aria-label="Completed">
              ✅
            </span>
            Actividad Completada
          </div>
        )}
        {isGlanceTimerActive &&
          isShowingTextDuringActivity &&
          activityModeIsActive && (
            <div
              className="activity-status-section"
              style={{
                position: 'fixed',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1001,
                background: 'var(--sidebar-bg)',
                padding: '5px 10px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              }}
            >
              <p className="glance-timer-display">
                Volviendo al ejercicio en: {glanceTimeRemaining}s
              </p>
            </div>
          )}
      </div>
    </DndProvider>
  )
}

export default App
