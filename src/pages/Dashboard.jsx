import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  MapPin,
  BatteryMedium,
  Heart,
  Phone,
  Gamepad2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import DashboardModals from '../components/DashboardModals';

// World dimensions in virtual game units
const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 680;
const GROUND_Y = 535; // Ground top edge
const CHAR_WIDTH = 52;
const CHAR_HEIGHT = 64;

// Physical constants
const GRAVITY = 0.58;
const MOVE_SPEED = 5.2;
const JUMP_FORCE = -13.2;

export default function Dashboard({ telemetry, onOpenSOS }) {
  const navigate = useNavigate();
  const gameAreaRef = useRef(null);

  // Active module modal state ('location' | 'battery' | 'health' | 'contacts' | null)
  const [activeModule, setActiveModule] = useState(null);

  // Sound muted state
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());

  // Interactive blocks state
  // Group 1: Brick 0, Block 1 (Location), Brick 2, Block 2 (Battery), Brick 4
  // Group 2: Pipe + Block 3 (Health) above it
  // Group 3: Block 4 (Contacts)
  const [blocks, setBlocks] = useState([
    // Group 1: 5-block platform (Brick, ?, Brick, ?, Brick)
    { id: 'b0', type: 'brick', x: 230, y: 340, w: 46, h: 46, bouncing: false },
    { id: 'q1', type: 'question', module: 'location', x: 276, y: 340, w: 46, h: 46, activated: false, bouncing: false, hits: 0 },
    { id: 'b2', type: 'brick', x: 322, y: 340, w: 46, h: 46, bouncing: false },
    { id: 'q2', type: 'question', module: 'battery', x: 368, y: 340, w: 46, h: 46, activated: false, bouncing: false, hits: 0 },
    { id: 'b4', type: 'brick', x: 414, y: 340, w: 46, h: 46, bouncing: false },

    // Group 2: Question block directly above the pipe
    { id: 'q3', type: 'question', module: 'health', x: 672, y: 245, w: 46, h: 46, activated: false, bouncing: false, hits: 0 },

    // Group 3: Standalone question block
    { id: 'q4', type: 'question', module: 'contacts', x: 940, y: 340, w: 46, h: 46, activated: false, bouncing: false, hits: 0 },
  ]);

  // The Pipe obstacle definition
  const pipe = {
    x: 650,
    y: 425, // top of pipe
    w: 90,
    h: 110, // down to ground at 535
  };

  // Particles / Coin animation list
  const [particles, setParticles] = useState([]);

  // Character physics state
  const charRef = useRef({
    x: 105,
    y: GROUND_Y - CHAR_HEIGHT,
    vx: 0,
    vy: 0,
    prevX: 105,
    prevY: GROUND_Y - CHAR_HEIGHT,
    isGrounded: true,
    facingLeft: false,
    isJumping: false,
  });

  // Render state for character DOM position
  const [charVisual, setCharVisual] = useState({
    x: 105,
    y: GROUND_Y - CHAR_HEIGHT,
    facingLeft: false,
    isJumping: false,
    walkFrame: 0,
  });

  // Keys pressed map
  const keysRef = useRef({
    left: false,
    right: false,
    jump: false,
  });

  // Touch control state for mobile
  const [touchState, setTouchState] = useState({
    left: false,
    right: false,
    jump: false,
  });

  // Cooldown tracker to prevent multiple rapid triggers while touching block
  const blockCooldownRef = useRef({});

  // Responsive scale factor
  const [scale, setScale] = useState(1);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });

  // Update scale on window resize to fit the 1200x680 world
  const updateScaling = useCallback(() => {
    if (!gameAreaRef.current) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    // Header takes ~75px
    const availableHeight = windowHeight - 75;

    const s = Math.min(windowWidth / WORLD_WIDTH, availableHeight / WORLD_HEIGHT);
    // Don't scale down below 0.55 on small screens; allows centering
    const finalScale = Math.max(0.52, Math.min(1.2, s));
    setScale(finalScale);

    const actualWidth = WORLD_WIDTH * finalScale;
    const actualHeight = WORLD_HEIGHT * finalScale;
    setViewportOffset({
      x: Math.max(0, (windowWidth - actualWidth) / 2),
      y: Math.max(0, (availableHeight - actualHeight) / 2),
    });
  }, []);

  useEffect(() => {
    updateScaling();
    window.addEventListener('resize', updateScaling);
    return () => window.removeEventListener('resize', updateScaling);
  }, [updateScaling]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture keys if a modal or input is active
      if (activeModule) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = true;
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        if (!keysRef.current.jump) {
          keysRef.current.jump = true;
          // Trigger jump if grounded
          if (charRef.current.isGrounded) {
            charRef.current.vy = JUMP_FORCE;
            charRef.current.isGrounded = false;
            charRef.current.isJumping = true;
            soundEffects.playJump();
          }
        }
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = false;
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeModule]);

  // Spawn coin + score particle above block
  const spawnBlockParticle = (x, y, label) => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [
      ...prev,
      {
        id,
        x: x + 12,
        y: y - 10,
        label: label || '+100',
      },
    ]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  };

  // Trigger interactive block action
  const hitBlock = useCallback((blockId) => {
    const now = Date.now();
    if (blockCooldownRef.current[blockId] && now - blockCooldownRef.current[blockId] < 450) {
      return;
    }
    blockCooldownRef.current[blockId] = now;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          // Bounce animation
          return {
            ...b,
            bouncing: true,
            activated: true,
            hits: (b.hits || 0) + 1,
          };
        }
        return b;
      })
    );

    // Reset bounce after 220ms
    setTimeout(() => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, bouncing: false } : b))
      );
    }, 220);

    const hitTarget = blocks.find((b) => b.id === blockId);
    if (!hitTarget) return;

    if (hitTarget.type === 'question') {
      soundEffects.playCoin();
      soundEffects.playBlockHit();
      spawnBlockParticle(hitTarget.x, hitTarget.y, hitTarget.module.toUpperCase());

      // Open corresponding module after slight delay for visual impact
      setTimeout(() => {
        soundEffects.playModalOpen();
        setActiveModule(hitTarget.module);
      }, 260);
    } else {
      // Brick block hit
      soundEffects.playBlockHit();
    }
  }, [blocks]);

  // Direct click / tap shortcut to trigger block
  const handleBlockClick = (block) => {
    if (block.type === 'question') {
      hitBlock(block.id);
    }
  };

  // Reset Character to starting position
  const resetCharacter = () => {
    charRef.current.x = 105;
    charRef.current.y = GROUND_Y - CHAR_HEIGHT;
    charRef.current.vx = 0;
    charRef.current.vy = 0;
    charRef.current.isGrounded = true;
    charRef.current.facingLeft = false;
    charRef.current.isJumping = false;
    setCharVisual({
      x: 105,
      y: GROUND_Y - CHAR_HEIGHT,
      facingLeft: false,
      isJumping: false,
      walkFrame: 0,
    });
  };

  // Sound toggle handler
  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  // Game Animation Loop (60 FPS via requestAnimationFrame)
  useEffect(() => {
    let animId;
    let walkCounter = 0;

    const gameLoop = () => {
      const char = charRef.current;
      char.prevX = char.x;
      char.prevY = char.y;

      // Handle horizontal input (Keyboard or Touch)
      const moveLeft = keysRef.current.left || touchState.left;
      const moveRight = keysRef.current.right || touchState.right;

      if (!activeModule) {
        if (moveLeft && !moveRight) {
          char.vx = -MOVE_SPEED;
          char.facingLeft = true;
          walkCounter += 0.2;
        } else if (moveRight && !moveLeft) {
          char.vx = MOVE_SPEED;
          char.facingLeft = false;
          walkCounter += 0.2;
        } else {
          char.vx = 0;
        }
      } else {
        char.vx = 0;
      }

      // Apply horizontal movement
      char.x += char.vx;

      // Stage boundaries
      if (char.x < 15) char.x = 15;
      if (char.x > WORLD_WIDTH - CHAR_WIDTH - 15) char.x = WORLD_WIDTH - CHAR_WIDTH - 15;

      // Apply gravity
      char.vy += GRAVITY;
      if (char.vy > 14) char.vy = 14; // terminal fall velocity
      char.y += char.vy;

      // ================= COLLISION DETECTION =================

      // 1. Pipe horizontal side collision
      const inPipeY = char.y + CHAR_HEIGHT > pipe.y + 6 && char.y < pipe.y + pipe.h;
      if (inPipeY) {
        // Approaching from left
        if (char.prevX + CHAR_WIDTH <= pipe.x + 4 && char.x + CHAR_WIDTH > pipe.x) {
          char.x = pipe.x - CHAR_WIDTH;
          char.vx = 0;
        }
        // Approaching from right
        if (char.prevX >= pipe.x + pipe.w - 4 && char.x < pipe.x + pipe.w) {
          char.x = pipe.x + pipe.w;
          char.vx = 0;
        }
      }

      // 2. Landing on top of Pipe
      let landedOnPipe = false;
      const inPipeX = char.x + CHAR_WIDTH > pipe.x + 4 && char.x < pipe.x + pipe.w - 4;
      if (inPipeX) {
        // If falling down and previous position was above pipe rim
        if (char.vy >= 0 && char.prevY + CHAR_HEIGHT <= pipe.y + 12 && char.y + CHAR_HEIGHT >= pipe.y) {
          char.y = pipe.y - CHAR_HEIGHT;
          char.vy = 0;
          char.isGrounded = true;
          char.isJumping = false;
          landedOnPipe = true;
        }
      }

      // 3. Ground Collision
      if (!landedOnPipe) {
        if (char.y + CHAR_HEIGHT >= GROUND_Y) {
          char.y = GROUND_Y - CHAR_HEIGHT;
          char.vy = 0;
          char.isGrounded = true;
          char.isJumping = false;
        } else {
          // In mid-air
          char.isGrounded = false;
        }
      }

      // 4. Block Collisions
      blocks.forEach((b) => {
        const overlapX = char.x + CHAR_WIDTH > b.x + 4 && char.x < b.x + b.w - 4;

        if (overlapX) {
          // Character jumping UP into underside of block
          if (char.vy < 0) {
            // Head crossed block bottom edge
            if (char.prevY >= b.y + b.h - 10 && char.y <= b.y + b.h) {
              char.y = b.y + b.h;
              char.vy = 2.5; // bounce character downward
              hitBlock(b.id);
            }
          }
          // Character landing ON TOP of block
          else if (char.vy >= 0) {
            if (char.prevY + CHAR_HEIGHT <= b.y + 12 && char.y + CHAR_HEIGHT >= b.y) {
              char.y = b.y - CHAR_HEIGHT;
              char.vy = 0;
              char.isGrounded = true;
              char.isJumping = false;
            }
          }
        }
      });

      // Update visual state for smooth rendering
      setCharVisual({
        x: char.x,
        y: char.y,
        facingLeft: char.facingLeft,
        isJumping: !char.isGrounded,
        walkFrame: Math.floor(walkCounter) % 2,
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [blocks, hitBlock, activeModule, touchState]);

  // Mobile touch buttons trigger helper
  const handleTouchJump = () => {
    if (charRef.current.isGrounded && !activeModule) {
      charRef.current.vy = JUMP_FORCE;
      charRef.current.isGrounded = false;
      charRef.current.isJumping = true;
      soundEffects.playJump();
    }
  };

  const batteryPercent = telemetry?.battery ?? 85;
  const motionVal = telemetry
    ? Math.round(Math.sqrt((telemetry.X ?? 120) ** 2 + (telemetry.Y ?? -45) ** 2 + (telemetry.Z ?? 980) ** 2))
    : 985;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#3690ca]">
      {/* Sky Canvas / Background Wrapper */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #00d0f6 0%, #3bbaff 50%, #7ee0ff 85%, #9aeaff 100%)',
        }}
      >
        {/* Repeating Pixel Brick Ground spanning full width */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[145px] z-10"
          style={{
            backgroundImage: "url('/mario/Brick.png')",
            backgroundRepeat: 'repeat-x',
            backgroundSize: '36px 36px',
            imageRendering: 'pixelated',
          }}
        >
          {/* Top highlight line for bricks */}
          <div className="w-full h-2 bg-[#d76c24] border-t-2 border-[#ffb076] border-b-2 border-[#8e390c]"></div>
          {/* Subterranean darker brick texture layer */}
          <div
            className="w-full h-full opacity-90"
            style={{
              backgroundImage: "url('/mario/UndergroundBrick.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '36px 36px',
              imageRendering: 'pixelated',
            }}
          ></div>
        </div>
      </div>

      {/* Main Scaled Game Arena Viewport */}
      <div
        ref={gameAreaRef}
        className="absolute top-[70px] left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="relative pointer-events-auto"
          style={{
            width: `${WORLD_WIDTH}px`,
            height: `${WORLD_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Top Title & Telemetry Pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-widest text-white drop-shadow-[4px_4px_0_#000000] font-['Fredoka']">
              CHILD SAFETY DASHBOARD
            </h1>
            <div className="mt-2 inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/50 text-xs font-bold text-cyan-300 shadow-[0_0_20px_rgba(0,234,255,0.3)]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>ESP32 STATUS: ONLINE</span>
              <span>•</span>
              <span>BATTERY: {batteryPercent}%</span>
              <span>•</span>
              <span>MOTION: {motionVal}</span>
            </div>
          </div>

          {/* Quick Controls Bar (Sound & Reset) */}
          <div className="absolute top-3 right-4 z-30 flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition shadow-md"
              title={isMuted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>
            <button
              onClick={resetCharacter}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 text-xs font-bold backdrop-blur-md transition shadow-md"
              title="Reset Character Position"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          </div>

          {/* Pixel Clouds in Sky */}
          <img
            src="/mario/Cloud3.png"
            alt="Cloud"
            className="absolute top-10 left-8 w-24 [image-rendering:pixelated] opacity-90 pointer-events-none drop-shadow-sm"
          />
          <img
            src="/mario/Cloud1.png"
            alt="Cloud"
            className="absolute top-8 left-72 w-16 [image-rendering:pixelated] opacity-80 pointer-events-none"
          />
          <img
            src="/mario/Cloud2.png"
            alt="Cloud"
            className="absolute top-14 right-80 w-20 [image-rendering:pixelated] opacity-85 pointer-events-none"
          />
          <img
            src="/mario/Cloud3.png"
            alt="Cloud"
            className="absolute top-6 right-16 w-24 [image-rendering:pixelated] opacity-90 pointer-events-none drop-shadow-sm"
          />

          {/* Distant Hills / Skyline Pixel Silhouette */}
          <div
            className="absolute bottom-[145px] left-0 right-0 h-28 pointer-events-none opacity-45"
            style={{
              backgroundImage: "url('/mario/Hill2.png')",
              backgroundRepeat: 'repeat-x',
              backgroundSize: '160px 80px',
              backgroundPosition: 'bottom',
              imageRendering: 'pixelated',
            }}
          ></div>

          {/* Pixel Trees & Bushes along ground */}
          {/* Far Left Bush */}
          <img
            src="/mario/Bush1.png"
            alt="Bush"
            className="absolute bottom-[145px] left-4 w-16 [image-rendering:pixelated] pointer-events-none z-10"
          />
          {/* Bush near character start */}
          <img
            src="/mario/Bush2.png"
            alt="Bush"
            className="absolute bottom-[145px] left-44 w-20 [image-rendering:pixelated] pointer-events-none z-10"
          />
          {/* Bush between Group 1 and Pipe */}
          <img
            src="/mario/Bush3.png"
            alt="Bush"
            className="absolute bottom-[145px] left-[510px] w-24 [image-rendering:pixelated] pointer-events-none z-10"
          />
          {/* Bush between Pipe and Group 3 */}
          <img
            src="/mario/Bush2.png"
            alt="Bush"
            className="absolute bottom-[145px] left-[800px] w-20 [image-rendering:pixelated] pointer-events-none z-10"
          />
          {/* Far Right Bush */}
          <img
            src="/mario/Bush1.png"
            alt="Bush"
            className="absolute bottom-[145px] right-6 w-16 [image-rendering:pixelated] pointer-events-none z-10"
          />

          {/* ================= GROUP 1: LOCATION & BATTERY LIFE ================= */}
          {/* Floating Pill Label for LOCATION */}
          <div
          onClick={() => hitBlock('q1')}
          className="absolute top-[300px] left-[225px] w-[140px] z-20 cursor-pointer flex flex-col items-center text-center"
        >
          <div className="flex flex-col items-center animate-[labelBob_1.2s_ease-in-out_infinite] hover:scale-110 transition-transform">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="font-extrabold text-[12px] tracking-wider text-white">LOCATION</span>
            </div>
            {/* Pointer */}
            <div className="mt-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white translate-x-1"></div>
          </div>
        </div>

          {/* Floating Pill Label for BATTERY LIFE */}
          {/* ================= BATTERY LIFE ================= */}
        {/* ================= BATTERY LIFE ================= */}
      <div
        onClick={() => hitBlock('q2')}
        className="absolute top-[290px] left-[310px] w-[150px] z-20 cursor-pointer flex flex-col items-center text-center"
      >
        <div className="flex flex-col items-center animate-[labelBob_1.2s_ease-in-out_infinite] hover:scale-110 transition-transform">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-[12px] tracking-wider text-white">BATTERY</span>
          </div>
          <span className="font-extrabold text-[12px] tracking-wider text-white leading-none translate-x-2">LIFE</span>
          <div className="mt-1! w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white translate-x-2"></div>
        </div>
      </div>

          {/* ================= HEALTH ================= */}
          <div
            onClick={() => hitBlock('q3')}
            className="absolute top-[210px] left-[625px] w-[140px] z-20 cursor-pointer flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center animate-[labelBob_1.2s_ease-in-out_infinite] hover:scale-110 transition-transform">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="font-extrabold text-[12px] tracking-wider text-white">HEALTH</span>
              </div>
              <div className="mt-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
            </div>
          </div>

          {/* ================= EMERGENCY CONTACTS ================= */}
          <div
            onClick={() => hitBlock('q4')}
            className="absolute top-[305px] left-[885px] w-[155px] z-20 cursor-pointer flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center animate-[labelBob_1.2s_ease-in-out_infinite] hover:scale-110 transition-transform">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Phone className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="font-extrabold text-[12px] tracking-wider text-white">EMERGENCY CONTACTS</span>
              </div>
              <div className="mt-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
            </div>
          </div>

          {/* ================= INTERACTIVE BLOCKS RENDERING ================= */}
          {blocks.map((b) => (
            <div
              key={b.id}
              onClick={() => handleBlockClick(b)}
              className={`absolute z-20 cursor-pointer transition-transform select-none ${
                b.bouncing ? '-translate-y-3.5 duration-100 ease-out' : 'translate-y-0 duration-150 ease-in'
              }`}
              style={{
                left: `${b.x}px`,
                top: `${b.y}px`,
                width: `${b.w}px`,
                height: `${b.h}px`,
              }}
              title={b.type === 'question' ? `Hit block or click to open ${b.module} module` : 'Brick'}
            >
              {b.type === 'question' ? (
                <div className="relative w-full h-full group">
                  <img
                    src="/mario/MysteryBlock.png"
                    alt="Question Block"
                    className="w-full h-full [image-rendering:pixelated] drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
                  />
                  {b.activated && (
                    <div className="absolute inset-0 rounded border-2 border-yellow-300 shadow-[0_0_15px_#facc15] pointer-events-none animate-pulse"></div>
                  )}
                </div>
              ) : (
                <img
                  src="/mario/Brick.png"
                  alt="Brick"
                  className="w-full h-full [image-rendering:pixelated] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] hover:brightness-110"
                />
              )}
            </div>
          ))}

          {/* ================= THE PIPE ================= */}
          {/* Assembled from PipeTop.png and PipeBottom.png */}
          <div
            className="absolute z-20 pointer-events-auto"
            style={{
              left: `${pipe.x}px`,
              top: `${pipe.y}px`,
              width: `${pipe.w}px`,
              height: `${pipe.h}px`,
            }}
            title="Green Mario Pipe (Solid Obstacle - Stand and jump to reach Health block!)"
          >
            {/* Pipe Rim Top */}
            <div className="w-full h-[40px] relative">
              <img
                src="/mario/PipeTop.png"
                alt="Pipe Top"
                className="w-full h-full [image-rendering:pixelated] drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
              />
            </div>
            {/* Pipe Stem Body */}
            <div
              className="w-[84%] mx-auto h-[70px]"
              style={{
                backgroundImage: "url('/mario/PipeBottom.png')",
                backgroundRepeat: 'repeat-y',
                backgroundSize: '100% 32px',
                imageRendering: 'pixelated',
              }}
            ></div>
          </div>

          {/* ================= PARTICLES & COIN EFFECT ================= */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute z-30 pointer-events-none flex flex-col items-center animate-[floatUpFade_0.8s_ease-out_forwards]"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
              }}
            >
              <img
                src="/mario/Coin.png"
                alt="Coin"
                className="w-6 h-6 [image-rendering:pixelated] drop-shadow-[0_0_10px_gold] animate-spin"
              />
              <span className="font-['Press_Start_2P'] text-[9px] font-bold text-yellow-300 drop-shadow-[2px_2px_0_#000000] mt-1 whitespace-nowrap">
                {p.label}
              </span>
            </div>
          ))}

          {/* ================= PLAYABLE CHARACTER ================= */}
          <div
            className="absolute z-30 pointer-events-none transition-transform"
            style={{
              left: `${charVisual.x}px`,
              top: `${charVisual.y}px`,
              width: `${CHAR_WIDTH}px`,
              height: `${CHAR_HEIGHT}px`,
              transform: `${charVisual.facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} ${
                charVisual.isJumping ? 'scale(0.96, 1.04)' : charVisual.walkFrame === 1 ? 'translateY(-2px)' : 'translateY(0)'
              }`,
              transformOrigin: 'bottom center',
            }}
          >
            <img
              src="/character.png"
              alt="KAVACH Hero Character"
              className="w-full h-full [image-rendering:pixelated] drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)]"
            />
          </div>

          {/* Level Ground Plane Collision Line Marker */}
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{
              top: `${GROUND_Y}px`,
              height: `${WORLD_HEIGHT - GROUND_Y}px`,
            }}
          >
            {/* Top row of bricks on arena ground */}
            <div
              className="w-full h-[36px]"
              style={{
                backgroundImage: "url('/mario/Brick.png')",
                backgroundRepeat: 'repeat-x',
                backgroundSize: '36px 36px',
                imageRendering: 'pixelated',
              }}
            >
              <div className="w-full h-1.5 bg-[#d76c24] border-t border-[#ffb076] border-b border-[#8e390c]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP CONTROLS HINT BANNER ================= */}
      <div className="hidden md:flex absolute bottom-4 left-6 z-40 items-center gap-3 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-xs text-white shadow-xl">
        <Gamepad2 className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-semibold text-gray-200">
          Controls: <span className="text-cyan-300 font-mono">[A][D]</span> or{' '}
          <span className="text-cyan-300 font-mono">[◀][▶]</span> to Run •{' '}
          <span className="text-yellow-300 font-mono">[SPACE]</span> or{' '}
          <span className="text-yellow-300 font-mono">[▲]</span> to Jump into Blocks!
        </span>
      </div>

      {/* ================= MOBILE ON-SCREEN TOUCH CONTROLS ================= */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        {/* Left / Right D-Pad */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onTouchStart={() => setTouchState((prev) => ({ ...prev, left: true }))}
            onTouchEnd={() => setTouchState((prev) => ({ ...prev, left: false }))}
            onMouseDown={() => setTouchState((prev) => ({ ...prev, left: true }))}
            onMouseUp={() => setTouchState((prev) => ({ ...prev, left: false }))}
            className="w-14 h-14 rounded-2xl bg-black/70 active:bg-cyan-500/50 border-2 border-white/30 active:border-cyan-400 text-white flex items-center justify-center text-xl shadow-2xl backdrop-blur-md transition-transform active:scale-95"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6 text-cyan-300" />
          </button>
          <button
            onTouchStart={() => setTouchState((prev) => ({ ...prev, right: true }))}
            onTouchEnd={() => setTouchState((prev) => ({ ...prev, right: false }))}
            onMouseDown={() => setTouchState((prev) => ({ ...prev, right: true }))}
            onMouseUp={() => setTouchState((prev) => ({ ...prev, right: false }))}
            className="w-14 h-14 rounded-2xl bg-black/70 active:bg-cyan-500/50 border-2 border-white/30 active:border-cyan-400 text-white flex items-center justify-center text-xl shadow-2xl backdrop-blur-md transition-transform active:scale-95"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6 text-cyan-300" />
          </button>
        </div>

        {/* Jump Button */}
        <div className="pointer-events-auto">
          <button
            onTouchStart={handleTouchJump}
            onClick={handleTouchJump}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-400 active:scale-90 border-2 border-white shadow-[0_0_25px_rgba(251,191,36,0.6)] text-slate-950 font-extrabold flex flex-col items-center justify-center transition-transform"
            aria-label="Jump"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-[9px] tracking-wider font-mono">JUMP</span>
          </button>
        </div>
      </div>

      {/* ================= INTERACTIVE DASHBOARD MODULE MODALS ================= */}
      <DashboardModals
        activeModule={activeModule}
        onClose={() => setActiveModule(null)}
        telemetry={telemetry}
        onOpenSOS={onOpenSOS}
      />
    </div>
  );
}
