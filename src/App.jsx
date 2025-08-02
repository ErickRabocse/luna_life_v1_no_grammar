import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from 'react'
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
import CustomDragLayer from './components/CustomDragLayer' // o donde lo guardes
import './app.css'

const FONT_SIZES = ['1.2rem', '1.4rem', '1.6rem']
const DEFAULT_FONT_SIZE_INDEX = 1
const NEXT_BUTTON_ANIM_DURATION = 3000
const GLANCE_TIMER_SECONDS = 10

const ACCESS_CODES = {
  master: 'HORIZONBLUE', // clave para desbloquear TODO el libro
  chapters: [
    'TWISTER', // Capítulo 1
    'CLOUDS', // Capítulo 2
    'MOON', // Capítulo 3
    'ECHO', // Capítulo 4
    'FOX', // Capítulo 5
    'SILK', // Capítulo 6
    'HILL', // Capítulo 7
    'IRIS', // Capítulo 8
  ],
}
function isMobileDevice() {
  return window.matchMedia('(max-width: 700px)').matches
}

function DraggableWord({ word, isUsed }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'word',
    item: { word },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <span
      ref={drag}
      className={`draggable-word-fixed ${isDragging ? 'is-dragging' : ''} ${
        isUsed ? 'used-in-bank' : ''
      }`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? 'rgba(66, 135, 245, 0.2)' : '',
        boxShadow: isDragging ? '0 0 16px 3px #4287f5' : '',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'box-shadow 0.15s, background 0.15s, opacity 0.15s',
      }}
    >
      {word}
    </span>
  )
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
const touchDevice = isTouchDevice()

function getSceneAudioSrc(chapterIdx, sceneIdx) {
  if (chapterIdx > 0) {
    return `/audio/ch${chapterIdx}/${chapterIdx}.${sceneIdx + 1}.mp3`
  }
  return null
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
  const [shouldBlinkPlayButton, setShouldBlinkPlayButton] = useState(false)
  const [activeWord, setActiveWord] = useState(null)

  const [hasShownActivityButton, setHasShownActivityButton] = useState(false)

  const [hasListenedToScene, setHasListenedToScene] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)

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
  const menuRef = useRef(null)
  const mobileIndicatorsRef = useRef(null)
  const audioRef = useRef(null)

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showMobileMenu])

  const handleStudentNameSubmit = (nameFromModal, groupFromModal) => {
    setStudentName(nameFromModal)
    setStudentGroup(groupFromModal)
    setShowStudentNameModal(false)
    setSessionStartTime(Date.now())

    // 👇 Asegura que no parpadee al entrar el nombre
    setShouldBlinkPlayButton(false)

    if (chapterIndex === 0) {
      setHighlightChapterSelector(true)
      setTimeout(() => setHighlightChapterSelector(false), 5000)
    }
  }

  const scrollableTextRef = useRef(null)
  useEffect(() => {
    const container = scrollableTextRef.current
    if (!container) return

    const handleScroll = () => {
      const atBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 8 // margen de error
      setIsAtBottom(atBottom)
    }

    container.addEventListener('scroll', handleScroll)
    // Llama una vez por si ya está abajo al cargar
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollableTextRef, hasListenedToScene])
  useEffect(() => {
    if (chapterIndex !== null && sceneIndex !== null && sceneIndex >= 0) {
      setHasListenedToScene(false)
    }
  }, [chapterIndex, sceneIndex])

  useEffect(() => {
    console.log('isAtBottom:', isAtBottom)
  }, [isAtBottom])
  useEffect(() => {
    if (!hasShownActivityButton && hasListenedToScene && isAtBottom) {
      setHasShownActivityButton(true)
    }
  }, [hasListenedToScene, isAtBottom, hasShownActivityButton])

  const [unlockedChapters, setUnlockedChapters] = useState([0]) // 0 = Introducción desbloqueada siempre
  const [hasMasterAccess, setHasMasterAccess] = useState(false)

  const isLastSceneOfLastChapter =
    hasMasterAccess &&
    chapterIndex === allChapters.length - 1 &&
    sceneIndex === allChapters[allChapters.length - 1].scenes.length - 1

  const completedScenesInCurrentChapter = useMemo(() => {
    if (!currentChapter) return 0

    // Si está desbloqueado, cuenta TODAS las escenas como completas
    if (hasMasterAccess) {
      return currentChapter.scenes.length
    }

    // Lógica original para modo con ejercicios
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
  }, [currentChapter, chapterIndex, isActivityCompleted, hasMasterAccess])

  const chapterProgress = useMemo(() => {
    if (!currentChapter || currentChapter.scenes.length === 0) return 0

    if (hasMasterAccess) {
      // Progreso según la escena actual
      return ((sceneIndex + 1) / currentChapter.scenes.length) * 100
    }

    // Lógica normal para modo con actividades
    const progress =
      (completedScenesInCurrentChapter / currentChapter.scenes.length) * 100
    return Math.min(100, progress)
  }, [
    currentChapter,
    completedScenesInCurrentChapter,
    hasMasterAccess,
    sceneIndex, // 👈 importante agregar para que recalcule al cambiar de página
  ])

  const showTwoColumnExerciseLayout =
    showActivity && hasActivity && !activityIsCompletedForCurrentScene

  useEffect(() => {
    let timer
    if (showMobileMenu) {
      timer = setTimeout(() => setShowMobileMenu(false), 5000)
    }
    return () => clearTimeout(timer)
  }, [showMobileMenu])

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

  const resetViewAndTimer = () => {
    // 🚫 Detener audio personalizado si está sonando
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    // 🔄 Resto de tu lógica original
    setReadSentenceIndices(new Set())
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
    setHasListenedToScene(false)
  }

  const playFullScene = () => {
    if (isScenePlaying || !currentScene) return

    // Intentar obtener un MP3 personalizado
    const audioSrc = getSceneAudioSrc(chapterIndex, sceneIndex)

    if (audioSrc) {
      audioRef.current = new Audio(audioSrc)

      audioRef.current.onended = () => {
        // 🔁 Reinicia completamente todos los estados involucrados
        setIsScenePlaying(false)
        setIsPaused(false)
        setReadSentenceIndices(new Set()) // importante para reiniciar la lectura
        setHasListenedToScene(true)

        // 🔧 Debug opcional:
        console.log('🟢 Audio finalizado. Estados reiniciados.')
      }

      audioRef.current.onerror = () => {
        console.error('❌ Error al cargar el audio:', audioSrc)
        setIsScenePlaying(false)
      }

      setIsScenePlaying(true)
      setIsPaused(false)

      audioRef.current.play()
      return
    }
  }

  const handlePlaybackToggle = () => {
    const audioSrc = getSceneAudioSrc(chapterIndex, sceneIndex)

    // 🆗 Si ya hay un audio cargado
    if (audioSrc && audioRef.current) {
      const isEnded = audioRef.current.ended

      // 🔁 Si ya terminó, vuelve a iniciar desde cero
      if (isEnded) {
        playFullScene()
        return
      }

      // ▶️ Reanudar
      if (isPaused) {
        audioRef.current.play()
        setIsPaused(false)
        setIsScenePlaying(true)
      } else {
        // ⏸️ Pausar
        audioRef.current.pause()
        setIsPaused(true)
        setIsScenePlaying(false)
      }
      return
    }

    // 🆕 Si no hay audio aún
    if (!audioRef.current && audioSrc) {
      playFullScene()
      return
    }

    // ⚠️ Si no hay archivo de audio válido
    console.warn('⚠️ No hay audio disponible para esta escena.')
  }

  const handleChapterChange = (newIndex) => {
    if (hasMasterAccess || unlockedChapters.includes(newIndex)) {
      setChapterIndex(newIndex)
      setSceneIndex(0)
      resetViewAndTimer()
      return
    }

    const code = window.prompt(
      'This chapter is protected. Please enter the access code provided by your teacher:'
    )
    if (!code) return

    const codeUpper = code.trim().toUpperCase()

    if (codeUpper === ACCESS_CODES.master) {
      setHasMasterAccess(true)
      setUnlockedChapters([...Array(ACCESS_CODES.chapters.length + 1).keys()])
      setChapterIndex(newIndex)
      setSceneIndex(0)
      resetViewAndTimer()

      // ✅ Parpadea al desbloquear con código maestro
      setShouldBlinkPlayButton(true)
      setTimeout(() => setShouldBlinkPlayButton(false), 5000)
      return
    }

    if (
      newIndex > 0 &&
      ACCESS_CODES.chapters[newIndex - 1] &&
      codeUpper === ACCESS_CODES.chapters[newIndex - 1]
    ) {
      setUnlockedChapters((prev) =>
        prev.includes(newIndex) ? prev : [...prev, newIndex]
      )
      setChapterIndex(newIndex)
      setSceneIndex(0)
      resetViewAndTimer()

      // ✅ Parpadea al desbloquear con código de capítulo
      setShouldBlinkPlayButton(true)
      setTimeout(() => setShouldBlinkPlayButton(false), 5000)
      return
    }

    alert('Invalid access code. Please check with your teacher.')
  }

  const handleSceneAdvance = (offset) => {
    setSceneIndex((prev) => prev + offset)
    resetViewAndTimer()

    // 👇 Si venimos de un ejercicio completado, hacer parpadear el botón de play
    if (animateNextSceneButton) {
      setShouldBlinkPlayButton(true)
      setTimeout(() => setShouldBlinkPlayButton(false), 5000)
    }
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
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    }
    return () => {
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current)
    }
  }, [isGlanceTimerActive, glanceTimeRemaining])

  useLayoutEffect(() => {
    if (isMobileDevice() && mobileIndicatorsRef.current) {
      // Primero hace scroll al elemento
      mobileIndicatorsRef.current.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      })
      // Luego ajusta hacia arriba X píxeles
      window.scrollBy(0, -50) // Cambia 50 por la altura real del div + margen deseado
    }
  }, [
    chapterIndex,
    sceneIndex,
    showActivity,
    isShowingTextDuringActivity,
    activityIsCompletedForCurrentScene,
  ])

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

  const canShowNextChapterButton =
    hasMasterAccess &&
    isLastSceneInChapter &&
    chapterIndex < allChapters.length - 1

  const chapterSelectorDisabled =
    !hasMasterAccess &&
    (pageEffectsActive ||
      currentSceneActivityIsPending ||
      (activityModeIsActive && isGlanceTimerActive))

  const nextSceneButtonDisabled =
    !hasMasterAccess && (pageEffectsActive || currentSceneActivityIsPending)
  const prevSceneButtonDisabled =
    !hasMasterAccess &&
    (pageEffectsActive || sceneIndex === 0 || currentSceneActivityIsPending)

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
              <h2
                className="chapter-title-main"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {currentChapter.title}
                {isGlanceTimerActive &&
                  isShowingTextDuringActivity &&
                  activityModeIsActive && (
                    <span className="glance-timer-inline">
                      {isMobileDevice()
                        ? `${glanceTimeRemaining}s`
                        : `Volviendo al ejercicio en: ${glanceTimeRemaining}`}
                    </span>
                  )}
              </h2>
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
                    ['.', ',', '!', '?'].includes(item.word) ||
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
  } else if (showTwoColumnExerciseLayout && !hasMasterAccess) {
    mainContentToRender = (
      <div className="exercise-fullscreen-layout">
        <div className="exercise-sidebar-left">
          <h3 className="instructions-header-sidebar">
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
              {isMobileDevice()
                ? `${glanceTimeRemaining}s`
                : `Volviendo al ejercicio en: ${glanceTimeRemaining}`}
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
            <div className={`scrollable-text`} ref={scrollableTextRef}>
              {(() => {
                const sentences = []
                let currentSentenceWords = []
                ;(currentScene?.text || []).forEach((item, idx) => {
                  currentSentenceWords.push({ ...item, globalArrIndex: idx })
                  if (
                    ['.', ',', '!', '?'].includes(item.word) ||
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
    <DndProvider
      backend={touchDevice ? TouchBackend : HTML5Backend}
      {...(isTouchDevice() && {
        options: { enableMouseEvents: true, delayTouchStart: 100 },
      })}
    >
      <CustomDragLayer />
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
      <div className={`app-container ${blurPage ? 'app-container-blur' : ''}`}>
        <div className="top-button-bar">
          {/* Fila principal: hamburguesa + capítulo + controles */}
          <div className="mobile-only mobile-bar-row">
            {/* Menú hamburguesa */}
            <div
              className="mobile-hamburger-menu"
              ref={menuRef}
              style={{ flex: '0 0 auto' }}
            >
              <button
                className="hamburger-icon"
                onClick={() => setShowMobileMenu((m) => !m)}
                style={{
                  fontSize: '1.6em',
                  padding: '0.12em 0.38em',
                  marginLeft: '0.1em',
                }}
              >
                ☰
              </button>
              {showMobileMenu && (
                <div className="mobile-dropdown">
                  <button onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? '☀️ Light' : '🌙 Dark'}
                  </button>
                  <button
                    onClick={() =>
                      setFontSizeIndex((prev) => Math.max(0, prev - 1))
                    }
                  >
                    A-
                  </button>
                  <button
                    onClick={() =>
                      setFontSizeIndex((prev) =>
                        Math.min(FONT_SIZES.length - 1, prev + 1)
                      )
                    }
                  >
                    A+
                  </button>
                </div>
              )}
            </div>

            {/* Selector de capítulo */}
            <div className="mobile-chapter-selector">
              <ChapterSelector
                chapters={allChapters}
                chapterIndex={chapterIndex}
                setChapterIndex={handleChapterChange}
                isDisabled={chapterSelectorDisabled}
                className={
                  highlightChapterSelector ? 'chapter-selector-highlight' : ''
                }
              />
            </div>

            {/* Botones navegación */}
            <div className="mobile-nav-buttons">
              <button
                onClick={() => {
                  if (sceneIndex > 0) handleSceneAdvance(-1)
                  else if (chapterIndex > 0) handleGoToLastSceneOfPrevChapter()
                }}
                disabled={
                  prevSceneButtonDisabled ||
                  (chapterIndex === 1 && sceneIndex === 0)
                }
                aria-label="Previous"
              >
                ⬅️
              </button>
              <button
                onClick={handlePlaybackToggle}
                disabled={
                  mainControlsDisabled ||
                  showActivity ||
                  (isShowingTextDuringActivity && isGlanceTimerActive)
                }
                className={`play-scene-button ${
                  isScenePlaying
                    ? 'play-scene-button-active'
                    : shouldBlinkPlayButton
                    ? 'play-scene-button-animate'
                    : ''
                }`}
              >
                {isPaused ? '▶️' : isScenePlaying ? ' ⏸️' : '▶️'}
              </button>
              {isLastSceneInChapter &&
              isMobileDevice() &&
              activityIsCompletedForCurrentScene ? (
                <button onClick={handleGoToIntro} aria-label="Ir a la portada">
                  <span role="img" aria-label="Home">
                    🏠
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (
                      currentChapter &&
                      sceneIndex < currentChapter.scenes.length - 1
                    ) {
                      handleSceneAdvance(1)
                    } else if (
                      chapterIndex < allChapters.length - 1 &&
                      currentChapter &&
                      sceneIndex === currentChapter.scenes.length - 1
                    ) {
                      setChapterIndex(chapterIndex + 1)
                      setSceneIndex(0)
                      resetViewAndTimer()
                    }
                  }}
                  className={
                    animateNextSceneButton ? 'next-scene-button-animate' : ''
                  }
                  disabled={nextSceneButtonDisabled}
                  aria-label="Next"
                >
                  ➡️
                </button>
              )}
            </div>
          </div>

          {/* Indicadores: capítulo a la izquierda, página a la derecha */}
          <div
            className="mobile-only mobile-indicators"
            ref={mobileIndicatorsRef}
          >
            <span className="mobile-chapter-indicator">
              Cap. {chapterIndex}
            </span>
            {getGlobalSceneNumber() && (
              <span className="mobile-page-badge">
                P.{getGlobalSceneNumber()}
              </span>
            )}
          </div>

          {/* Controles y capítulos solo en desktop */}
          <div className="desktop-only left-controls">
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
              disabled={
                mainControlsDisabled ||
                showActivity ||
                (isShowingTextDuringActivity && isGlanceTimerActive)
              }
              className={`play-scene-button ${
                isScenePlaying
                  ? 'play-scene-button-active'
                  : shouldBlinkPlayButton
                  ? 'play-scene-button-animate'
                  : ''
              }`}
            >
              {!isScenePlaying || isPaused ? 'Play' : 'Pause'}
            </button>
          </div>

          <div className="desktop-only right-indicators">
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

              {isLastSceneOfLastChapter ? (
                <button
                  onClick={handleGoToIntro}
                  className="next-chapter-button-special"
                  style={{
                    background:
                      'linear-gradient(320deg, #4364f7 75%, #fbc7d4 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '2em',
                    padding: '0.7em 2em',
                    marginLeft: '1em',
                    fontSize: '1.08em',
                    letterSpacing: '0.04em',
                    border: 'none',
                  }}
                >
                  🌙 Congratulations, you have finished the story!
                </button>
              ) : canShowNextChapterButton ? (
                <button
                  onClick={() => {
                    setChapterIndex(chapterIndex + 1)
                    setSceneIndex(0)
                    resetViewAndTimer()
                  }}
                  className="next-chapter-button-special"
                  style={{
                    background:
                      'linear-gradient(320deg, #4364f7 60%, #fbc7d4 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '2em',
                    boxShadow: '0 4px 18px 2px rgba(42,80,186,0.20)',
                    padding: '0.4em .5em',
                    margin: '.5em',
                    fontSize: '1.05em',
                    letterSpacing: '0.03em',
                    border: 'none',
                    transition: 'transform 0.1s',
                    transform: 'scale(1.07)',
                  }}
                >
                  🌙 Next Chapter
                </button>
              ) : (
                !isLastSceneInChapter &&
                chapterIndex !== 0 && (
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
                )
              )}
              {nextChapterAvailable &&
                chapterIndex !== 0 &&
                !hasMasterAccess && (
                  <button
                    onClick={handleGoToIntro}
                    disabled={pageEffectsActive}
                  >
                    👉 Go to Introduction
                  </button>
                )}
            </div>

            {chapterIndex > 0 && currentChapter && (
              <div className="chapter-progress-container">
                <span className="chapter-progress-text">
                  Capítulo {chapterIndex}
                  {!hasMasterAccess && (
                    <>
                      : {completedScenesInCurrentChapter}/
                      {currentChapter.scenes.length}
                    </>
                  )}
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
          !hasMasterAccess && // 👈 Nueva condición, oculta ejercicios con master code
          !showActivity &&
          !activityIsCompletedForCurrentScene &&
          hasListenedToScene &&
          isAtBottom && (
            <button
              onClick={() => {
                setIsScenePlaying(false)
                setIsPaused(false)
                setReadSentenceIndices(new Set())
                setShowActivity(true)
                setIsShowingTextDuringActivity(false)
              }}
              className={`show-activity-button${
                hasShownActivityButton ? ' animate-slide-up' : ''
              }`}
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: '15px',

                margin: 'auto',
                marginBottom: '.5rem',
                maxWidth: '430px',
                width: '96%',
                zIndex: 100,
                // El resto de tus estilos normales del botón
              }}
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
      </div>
    </DndProvider>
  )
}

export default App
