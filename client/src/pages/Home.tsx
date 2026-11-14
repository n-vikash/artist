/**
 * After-Hours Sketchbook: a dark editorial stage where provided artwork is the focus;
 * controls mimic tactile archival labels and motion has an intentional story purpose.
 */
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Dices,
  Maximize2,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { birthdayContent, funnyGalleryNotes, siteAssets } from "@/content";

type Scene = "mystery" | "birthday" | "gallery" | "midbreak" | "lastthing" | "finale" | "letter";

const sceneVariants = {
  initial: { opacity: 0, y: 18, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(4px)" },
};

function TypeLine({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    const timer = window.setTimeout(() => {
      let pointer = 0;
      const typing = window.setInterval(() => {
        pointer += 1;
        setVisible(text.slice(0, pointer));
        if (pointer >= text.length) window.clearInterval(typing);
      }, 36);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [text, delay]);

  return (
    <span className={className} aria-label={text}>
      {visible}
      <span className="typing-cursor" aria-hidden="true" />
    </span>
  );
}

function DoodleField({ celebratory = false }: { celebratory?: boolean }) {
  return (
    <div className={`doodle-field ${celebratory ? "is-celebratory" : ""}`} aria-hidden="true">
      <div className="pastel-balloon balloon-pink" />
      <div className="pastel-balloon balloon-blue" />
      <div className="pastel-balloon balloon-lavender" />
      <i className="pastel-sparkle sparkle-one">✦</i>
      <i className="pastel-sparkle sparkle-two">✧</i>
      <i className="pastel-sparkle sparkle-three">✦</i>
      <i className="doodle doodle-pencil">⌁</i>
      <i className="doodle doodle-scribble">〰</i>
      <i className="doodle doodle-dot" />
      <i className="doodle doodle-loop" />
      <i className="doodle doodle-tape" />
      <span className="stage-loopmark-css" aria-hidden="true" />
    </div>
  );
}

function ArtworkPlaceholder({ number }: { number: number }) {
  const serial = String(number).padStart(2, "0");
  return (
    <div className="artwork-placeholder" aria-label={`Artwork placeholder ${serial}`}>
      <div className="placeholder-orbit" />
      <div className="placeholder-strokes"><span /><span /><span /></div>
      <span className="placeholder-label">PRIVATE ARCHIVE · {serial}</span>
      <span className="placeholder-help">A real piece will live here</span>
    </div>
  );
}

function ArtworkView({ index, large = false }: { index: number; large?: boolean }) {
  const work = birthdayContent.artwork[index];
  return (
    <div className={`artwork-surface ${large ? "is-large" : ""}`}>
      <span className="frame-tack frame-tack-one" aria-hidden="true" />
      <span className="frame-tack frame-tack-two" aria-hidden="true" />
      {work.src ? (
        <img src={work.src} alt={work.alt} className="artwork-image" draggable={false} />
      ) : (
        <ArtworkPlaceholder number={work.id} />
      )}
    </div>
  );
}

export default function Home() {
  const previewScene = new URLSearchParams(window.location.search).get("scene");
  const initialScene: Scene = ["mystery", "birthday", "gallery", "midbreak", "lastthing", "finale", "letter"].includes(previewScene ?? "")
    ? (previewScene as Scene)
    : "mystery";
  const [scene, setScene] = useState<Scene>(initialScene);
  const [introStep, setIntroStep] = useState(0);
  const [artworkIndex, setArtworkIndex] = useState(0);
  const [hasPassedBreak, setHasPassedBreak] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [isSlideshowOn, setIsSlideshowOn] = useState(true);
  const [isPausedAfterInteraction, setIsPausedAfterInteraction] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [cakeBlownOut, setCakeBlownOut] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalArtworks = birthdayContent.artwork.length;
  const currentSerial = String(artworkIndex + 1).padStart(2, "0");
  const progress = ((artworkIndex + 1) / totalArtworks) * 100;
  const displayName = birthdayContent.name === "[HER_NAME]" ? "Brain less.... Lalli" : birthdayContent.name;
  const displayMessage = birthdayContent.personalMessage === "[PERSONAL_MESSAGE]"
    ? "A note from the curator is tucked behind this page — because apparently 29 drawings were not enough."
    : birthdayContent.personalMessage;

  const pauseAfterManualMove = useCallback(() => {
    setIsPausedAfterInteraction(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setIsPausedAfterInteraction(false), 12000);
  }, []);

  const revealNote = useCallback((nextIndex: number) => {
    if ([3, 8, 15, 23, 29].includes(nextIndex)) {
      setNote(funnyGalleryNotes[nextIndex % funnyGalleryNotes.length]);
      setShowNote(true);
      window.setTimeout(() => setShowNote(false), 2800);
    }
  }, []);

  const goNext = useCallback(
    (manual = false) => {
      if (manual) pauseAfterManualMove();
      if (artworkIndex === 11 && !hasPassedBreak) {
        setScene("midbreak");
        return;
      }
      if (artworkIndex < totalArtworks - 1) {
        const next = artworkIndex + 1;
        setArtworkIndex(next);
        revealNote(next);
      }
    },
    [artworkIndex, hasPassedBreak, pauseAfterManualMove, revealNote, totalArtworks],
  );

  const goPrevious = useCallback(
    (manual = false) => {
      if (manual) pauseAfterManualMove();
      if (artworkIndex > 0) setArtworkIndex((current) => current - 1);
    },
    [artworkIndex, pauseAfterManualMove],
  );

  const goRandom = useCallback(() => {
    pauseAfterManualMove();
    let next = artworkIndex;
    while (next === artworkIndex) next = Math.floor(Math.random() * totalArtworks);
    setArtworkIndex(next);
    setHasPassedBreak(true);
    revealNote(next);
  }, [artworkIndex, pauseAfterManualMove, revealNote, totalArtworks]);

  useEffect(() => {
    if (scene !== "mystery") return;
    const timers = [
      window.setTimeout(() => setIntroStep(1), 1500),
      window.setTimeout(() => setIntroStep(2), 3900),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [scene]);

  useEffect(() => {
    if (scene !== "gallery" || !isSlideshowOn || isPausedAfterInteraction || lightboxOpen) return;
    const timer = window.setTimeout(() => goNext(false), 8200);
    return () => window.clearTimeout(timer);
  }, [artworkIndex, goNext, isPausedAfterInteraction, isSlideshowOn, lightboxOpen, scene]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (scene !== "gallery" && !lightboxOpen) return;
      if (event.key === "ArrowRight") goNext(true);
      if (event.key === "ArrowLeft") goPrevious(true);
      if (event.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [goNext, goPrevious, lightboxOpen, scene]);

  useEffect(() => {
    if (!audioRef.current || !birthdayContent.musicSrc) return;
    if (musicOn) audioRef.current.play().catch(() => setMusicOn(false));
    else audioRef.current.pause();
  }, [musicOn]);

  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  const introCopy = useMemo(
    () => ["Preparing something...", "Please don’t judge the website.", "She's my friend. Therefore, normal was never an option.."],
    [],
  );

  const restartExperience = () => {
    setScene("mystery");
    setIntroStep(0);
    setArtworkIndex(0);
    setHasPassedBreak(false);
    setCelebrate(false);
    setCakeBlownOut(false);
    setLightboxOpen(false);
  };

  return (
    <main className="experience-shell">
      {birthdayContent.musicSrc ? <audio ref={audioRef} src={birthdayContent.musicSrc} loop /> : null}
      <header className="experience-header">
        <button className="brand-mark" aria-label="Restart birthday experience" onClick={restartExperience}>
          <span className="brand-loopmark-css" aria-hidden="true" />
          <span><b>AFTER HOURS</b><small>29 PAGES</small></span>
        </button>
        <button
          className={`music-toggle ${musicOn ? "is-on" : ""}`}
          type="button"
          aria-pressed={musicOn}
          onClick={() => setMusicOn((value) => !value)}
          title={birthdayContent.musicSrc ? "Toggle music" : "Add a music URL in content.ts to enable playback"}
        >
          <Music2 size={16} aria-hidden="true" />
          <span>Music</span>
          {musicOn ? <i className="music-bars" aria-hidden="true"><b /><b /><b /></i> : null}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {scene === "mystery" && (
          <motion.section key="mystery" className="scene scene-mystery" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.55 }}>
            <div className="scene-backdrop mystery-backdrop" style={{ backgroundImage: `url(${siteAssets.hero})` }} />
            <DoodleField />
            <div className="pastel-ribbon"><span>A LITTLE SURPRISE FOR YOU...</span></div>
            <div className="mystery-copy">
              <span className="archive-tab">FILE OPENING · BIRTHDAY EDITION</span>
              <div className="pencil-stroke" aria-hidden="true"><i /><i /></div>
              <div className="intro-lines" aria-live="polite">
                {introCopy.slice(0, introStep + 1).map((line, index) => (
                  <p className={index === introStep ? "is-current" : "is-past"} key={line}>
                    {index === introStep ? <TypeLine text={line} /> : line}
                  </p>
                ))}
              </div>
              {introStep === 2 ? (
                <button className="ink-button" onClick={() => setScene("birthday")}>
                  LET’S GO <ArrowRight size={17} aria-hidden="true" />
                </button>
              ) : <span className="quiet-loading">calibrating chaos</span>}
            </div>
          </motion.section>
        )}

        {scene === "birthday" && (
          <motion.section key="birthday" className="scene scene-birthday" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.55 }}>
            <div className="birthday-paper" />
            <DoodleField celebratory />
            <div className="birthday-copy">
              <span className="archive-tab">A LITTLE INTERRUPTION</span>
              <h1><TypeLine text="HAPPY" delay={150} /><br /><em><TypeLine text="BIRTHDAY" delay={1150} /></em></h1>
              <p>Warning: 100% friendship nonsense ahead.</p>
              <div className={`cake-widget ${cakeBlownOut ? "is-blown" : ""}`}>
                <button className="birthday-cake" onClick={() => setCakeBlownOut(true)} aria-label={cakeBlownOut ? "Candles blown out" : "Blow out the birthday candles"}>
                  <span className="cake-flame flame-one" />
                  <span className="cake-flame flame-two" />
                  <span className="cake-flame flame-three" />
                  <span className="cake-candles"><i /><i /><i /></span>
                  <span className="cake-top" /><span className="cake-middle" /><span className="cake-bottom" />
                </button>
                <small>{cakeBlownOut ? "A little dramatic, but effective." : "Tap the candles."}</small>
              </div>
              {cakeBlownOut ? <div className="cake-fireworks" aria-live="polite">✦ &nbsp; candles out — party on &nbsp; ✦</div> : null}
              <span className="more-copy">Wait... there’s more.</span>
              <button className="ink-button ink-button-yellow" onClick={() => setScene("gallery")}>
                SHOW ME <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </motion.section>
        )}

        {scene === "gallery" && (
          <motion.section key="gallery" className="scene scene-gallery" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
            <div className="scene-backdrop gallery-backdrop" style={{ backgroundImage: `url(${siteAssets.gallery})` }} />
            <DoodleField />
            <div className="gallery-topline">
              <span className="archive-tab">THE UNOFFICIAL EXHIBITION</span>
              <button className={`slideshow-switch ${isSlideshowOn ? "is-on" : ""}`} onClick={() => setIsSlideshowOn((value) => !value)} aria-pressed={isSlideshowOn}>
                {isSlideshowOn ? <Pause size={14} /> : <Play size={14} />} {isSlideshowOn ? "AUTO ON" : "AUTO OFF"}
              </button>
            </div>
            <div className="gallery-layout">
              <aside className="gallery-index" aria-label="Artwork position">
                <span className="side-label">NOW VIEWING</span>
                <strong key={currentSerial}>{currentSerial}</strong>
                <span>/ {String(totalArtworks).padStart(2, "0")}</span>
              </aside>
              <div className="gallery-stage" onPointerDown={(event) => { pointerStart.current = event.clientX; }} onPointerUp={(event) => {
                if (pointerStart.current === null) return;
                const difference = event.clientX - pointerStart.current;
                pointerStart.current = null;
                if (difference < -42) goNext(true);
                if (difference > 42) goPrevious(true);
              }}>
                <AnimatePresence mode="wait">
                  <motion.div key={artworkIndex} className="exhibit-card" initial={{ opacity: 0, x: 22, rotate: 0.7 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -18, rotate: -0.5 }} transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}>
                    <div className="artwork-meta"><span>{birthdayContent.artwork[artworkIndex].label}</span><i>selected from a very serious archive</i></div>
                    <button className="artwork-open" aria-label={`Enlarge artwork ${currentSerial}`} onClick={() => setLightboxOpen(true)}>
                      <ArtworkView index={artworkIndex} />
                      <span className="expand-hint"><Maximize2 size={15} /> tap to inspect</span>
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="gallery-bottom">
                <div className="progress-line" aria-label={`${Math.round(progress)} percent through the exhibition`}><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
                <nav className="art-controls" aria-label="Artwork navigation">
                  <button className="control-button" onClick={() => goPrevious(true)} disabled={artworkIndex === 0}><ArrowLeft size={16} /> <span>PREVIOUS</span></button>
                  <button className="random-button" onClick={goRandom}><Dices size={17} /> <span>RANDOM</span></button>
                  <button className="control-button" onClick={() => goNext(true)} disabled={artworkIndex === totalArtworks - 1}><span>NEXT</span> <ArrowRight size={16} /></button>
                </nav>
                {isPausedAfterInteraction ? <p className="auto-status">Auto resumes after a brief human-curated detour.</p> : null}
                {artworkIndex === totalArtworks - 1 ? (
                  <button className="last-thing-button" onClick={() => setScene("lastthing")}>That’s all 29. <b>ONE LAST THING</b> <ArrowRight size={16} /></button>
                ) : null}
              </div>
            </div>
            <AnimatePresence>{showNote ? <motion.p className="curator-note" initial={{ opacity: 0, y: 10, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>{note}</motion.p> : null}</AnimatePresence>
          </motion.section>
        )}

        {scene === "midbreak" && (
          <motion.section key="midbreak" className="scene scene-midbreak" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.42 }}>
            <div className="pause-card">
              <span className="archive-tab">CURATOR INTERRUPTION</span>
              <h2>Okay, enough art<br /><em>for a second.</em></h2>
              <p>Let’s get back to the actual reason you’re here.</p>
              <button className="ink-button" onClick={() => { setHasPassedBreak(true); setArtworkIndex(12); setScene("gallery"); }}>CONTINUE <ArrowRight size={17} /></button>
            </div>
          </motion.section>
        )}

        {scene === "lastthing" && (
          <motion.section key="lastthing" className="scene scene-lastthing" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.48 }}>
            <div className="lastthing-copy">
              <span className="archive-tab">ARCHIVE COMPLETE</span>
              <h2>That’s all 29.</h2>
              <p>But I forgot one thing...</p>
              <button className="ink-button ink-button-yellow" onClick={() => setScene("finale")}>ONE LAST THING <ArrowRight size={17} /></button>
            </div>
          </motion.section>
        )}

        {scene === "finale" && (
          <motion.section key="finale" className="scene scene-finale" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.55 }}>
            <div className="scene-backdrop finale-backdrop" style={{ backgroundImage: `url(${siteAssets.finale})` }} />
            <DoodleField celebratory />
            <div className="finale-copy">
              <span className="archive-tab">RECORDING, TAKE 4</span>
              <div className="typing-joke">
                <p className="crossed"><TypeLine text="Happy birthday brainless" /></p>
                <p className="sorry"><TypeLine text="OH—SORRY." delay={1200} /></p>
                <p className="erasable"><TypeLine text="Balli" delay={2050} /></p>
                <p className="erasable second"><TypeLine text="Pakodi" delay={2830} /></p>
                <p className="wait"><TypeLine text="Wait..." delay={3700} /></p>
                <p className="know"><TypeLine text="I KNOW YOUR NAME." delay={4350} /></p>
              </div>
              <motion.div className="name-reveal" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 5.7, duration: 0.45 }}>
                <h2>HAPPY BIRTHDAY,<br /><em>{displayName}!</em></h2>
                <button className="photo-reveal-button" onClick={() => { setCelebrate(true); setScene("letter"); }}>Okay, NOW we’re done. <span>...maybe.</span> <ArrowRight size={17} /></button>
              </motion.div>
            </div>
          </motion.section>
        )}

        {scene === "letter" && (
          <motion.section key="letter" className="scene scene-letter" variants={sceneVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }}>
            <div className="scene-backdrop letter-backdrop" style={{ backgroundImage: `url(${siteAssets.finale})` }} />
            <DoodleField celebratory />
            {celebrate ? <div className="confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div> : null}
            <div className="letter-layout">
              <div className="final-photo-frame">
                {birthdayContent.personalPhoto ? <img src={birthdayContent.personalPhoto} alt={`A final birthday portrait of ${displayName}`} /> : <div className="personal-photo-placeholder"><i>✦</i><span>PRIVATE PHOTO · LAST PAGE</span><small>The final reveal lives here</small></div>}
              </div>
              <div className="final-letter">
                <span className="archive-tab">FINALLY GOT IT RIGHT</span>
                <h2>HAPPY BIRTHDAY,<br /><em>{displayName}!</em></h2>
                <p>{displayMessage}</p>
                <div className="celebration-signoff"><span>✦</span> 29 pages later. Still worth it. <span>✦</span></div>
                <button className="replay-button" onClick={restartExperience}><RotateCcw size={16} /> REPLAY EVERYTHING</button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={`Artwork ${currentSerial} enlarged`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close enlarged artwork"><X size={22} /></button>
            <button className="lightbox-arrow previous" onClick={() => goPrevious(true)} aria-label="Previous artwork"><ChevronLeft size={28} /></button>
            <div className="lightbox-work"><ArtworkView index={artworkIndex} large /><span>{currentSerial} / {String(totalArtworks).padStart(2, "0")}</span></div>
            <button className="lightbox-arrow next" onClick={() => goNext(true)} aria-label="Next artwork"><ChevronRight size={28} /></button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
