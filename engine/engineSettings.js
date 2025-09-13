/**
 * LittleJS Engine Settings
 * - All settings for the engine are here
 * @namespace Settings
 */

'use strict';

///////////////////////////////////////////////////////////////////////////////
// Camera settings

/** Position of camera in world space
 *  @type {Vector2}
 *  @default Vector2()
 *  @memberof Settings */
let cameraPos = vec2();

/** Scale of camera in world space
 *  @type {Number}
 *  @default
 *  @memberof Settings */
let cameraScale = 32;

///////////////////////////////////////////////////////////////////////////////
// Display settings

/** The max size of the canvas, centered if window is larger
 *  @type {Vector2}
 *  @default Vector2(1920,1080)
 *  @memberof Settings */
const canvasMaxSize = vec2(1920, 1080);

/** Fixed size of the canvas, if enabled canvas size never changes
 * - you may also need to set mainCanvasSize if using screen space coords in startup
 *  @type {Vector2}
 *  @default Vector2()
 *  @memberof Settings */
const canvasFixedSize = vec2();

/** Use nearest neighbor scaling algorithm for canvas for more pixelated look
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const canvasPixelated = false;

/** Disables texture filtering for crisper pixel art
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const tilesPixelated = true;

/** Default font used for text rendering
 *  @type {String}
 *  @default
 *  @memberof Settings */
const fontDefault = 'arial';

/** Enable to show the LittleJS splash screen be shown on startup
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const showSplashScreen = false;

/** Disables all rendering, audio, and input for servers
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const headlessMode = false;

///////////////////////////////////////////////////////////////////////////////
// WebGL settings

/** Enable webgl rendering, webgl can be disabled and removed from build (with some features disabled)
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const glEnable = true;

/** Fixes slow rendering in some browsers by not compositing the WebGL canvas
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const glOverlay = true;

///////////////////////////////////////////////////////////////////////////////
// Tile sheet settings

/** Default size of tiles in pixels
 *  @type {Vector2}
 *  @default Vector2(16,16)
 *  @memberof Settings */
const tileSizeDefault = vec2(16);

/** How many pixels smaller to draw tiles to prevent bleeding from neighbors
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const tileFixBleedScale = 0;

///////////////////////////////////////////////////////////////////////////////
// Object settings

/** How much to slow velocity by each frame (0-1)
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const objectDefaultDamping = 1;

/** How much to slow angular velocity each frame (0-1)
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const objectDefaultAngleDamping = 1;

/** Clamp max speed to avoid fast objects missing collisions
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const objectMaxSpeed = 1;

/** How much gravity to apply to objects along the Y axis, negative is down
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const gravity = -.005;

/** Scales emit rate of particles, useful for low graphics mode (0 disables particle emitters)
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const particleEmitRateScale = 1;

///////////////////////////////////////////////////////////////////////////////
// Input settings

/** Should gamepads be allowed
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const gamepadsEnable = true;

/** If true, the dpad input is also routed to the left analog stick (for better accessability)
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const gamepadDirectionEmulateStick = true;

/** If true the WASD keys are also routed to the direction keys (for better accessability)
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const inputWASDEmulateDirection = false;

/** True if touch input is enabled for mobile devices
 *  - Touch events will be routed to mouse events
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const touchInputEnable = true;

/** Allow vibration hardware if it exists
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
const vibrateEnable = false;

///////////////////////////////////////////////////////////////////////////////
// Audio settings

/** All audio code can be disabled and removed from build
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
let soundEnable = true;

/** Volume scale to apply to all sound, music and speech
 *  @type {Number}
 *  @default
 *  @memberof Settings */
let soundVolume = .3;

/** Default range where sound no longer plays
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const soundDefaultRange = 40;

/** Default range percent to start tapering off sound (0-1)
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const soundDefaultTaper = .7;

///////////////////////////////////////////////////////////////////////////////
// Medals settings

/** How long to show medals for in seconds
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const medalDisplayTime = 5;

/** How quickly to slide on/off medals in seconds
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const medalDisplaySlideTime = .5;

/** Size of medal display
 *  @type {Vector2}
 *  @default Vector2(640,80)
 *  @memberof Settings */
const medalDisplaySize = vec2(640, 80);

/** Size of icon in medal display
 *  @type {Number}
 *  @default
 *  @memberof Settings */
const medalDisplayIconSize = 50;

/** Set to stop medals from being unlockable (like if cheats are enabled)
 *  @type {Boolean}
 *  @default
 *  @memberof Settings */
let medalsPreventUnlock = false;