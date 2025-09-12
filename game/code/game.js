'use strict';

///////////////////////
// littlejs global settings

const gameName = 'L1ttl3 Paws'; // name of the game
const gameVersion = '0.5';

debugShowErrors();

///////////////////////
const playerSpaceAbove = 1;
const playerSpaceBelow = 19;
const maxHeight = 20;
const defaultWorldSeed = 13;
const winTimeFlyAway = 6;

// game variables
let player;
let world;
let islands;
let track;
let worldSeed;
let spriteAtlas;
let titleScreen;
let attractMode;
let gameMode;
let gameContinued;
let gameTimer = new Timer;
let islandTimer = new Timer;
let gameOverTimer = new Timer;
let winTimer = new Timer;
let activeIslandID;
let tripMode = 0;
let autoPause = !isTouchDevice;
let timeLeft;
let colorBandTextureInfo;
let parallaxTextureInfo;
let worldSeedContinue;
let storeMode;
let lastWinTime;
let newDistanceRecord;

// debug settings
let testTitleScreen;
let testPickups;
let quickStart;
let testLevelView;
let testRandomize;
let testNoRamps;
let testAutoplay;
let testLevel;
let testSeed;
let testStore;
let menuCats;
let testMakeThumbnail;

///////////////////////////////////////////////////////////////////////////////

function gameStart(isTitleScreen)
{
    paused = 0; // unpause at start
    engineObjectsDestroy();

    // settings
    gravity = -.005;
    titleScreen = quickStart || testAutoplay || testLevel ? 0 : isTitleScreen;
    timeLeft = 30;
    activeIslandID = 0;
    newDistanceRecord = 0;

    // create objects
    cameraPos = vec2();
    world = new World;
    player = new Player(saveData.selectedCatType);
    menuCats = [];
    if (titleScreen)
    {
        const menuCat = 1;
        for(let i=catCount;i--;)
            menuCats[i] = new Player(i, menuCat);
    }
    gameTimer.set();       // total time playing since game start
    islandTimer.set();     // total time in this island
    gameOverTimer.unset(); // time in game over screen
    winTimer.unset();      // time in win screen
    gameContinued = !!worldSeedContinue; // set if continuing from a save
    if (!gameContinued && !isTitleScreen)
        saveData.lastMode = -1; // reset last mode if new game

    // fix camera still being in old place causing objects to despawn!
    updateCamera();
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    attractMode = !testTitleScreen && !testStore && !testAutoplay; // start in attract mode
    if (testStore)
        storeMode = 1;
    //overlayCanvas.style.imageRendering = 'auto'; // smoother rendering for overlay text
    debug && console.log(gameName + ' v' + gameVersion + ' by Frank Force');
    onblur = ()=>
    {
        // auto pause when focus is lost
        if (!isTouchDevice && !titleScreen && autoPause && !paused)
            setPaused(1, 0);
    }

    // sprites
    spriteAtlas =
    {
        circle:       tile(0,16,0,1),
        circleSmall:  tile(2,8,0,1),
        triangle:     tile(7,16,0,1),

        // cat parts
        body:         tile(2,16,0,1),
        head:         tile(3,16,0,1),
        leg:          tile(4,16,0,1),
        bodyStriped:  tile(9,16,0,1),
        headStriped:  tile(10,16,0,1),
        legStriped:   tile(11,16,0,1),
    };

    generativeInit();
    createUI();

    // start at the title screen
    gameStart(1);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if (testLevel)
        return;

    if (titleScreen)
    {
        // update title screen
        if (mouseWasPressed(0) || keyWasPressed('Space'))
            attractMode = 0;
        if (keyWasPressed('Space'))
        {
            // start the game
            sound_select.play();
            titleScreen = 0;
            gameMode = 0;
            clearInput();
            gameStart();
        }
        if (keyWasPressed('Escape'))
        {
            if (storeMode)
            {
                // exit store
                storeMode = 0;
                sound_select.play(1, .25);
            }
            else if (!testTitleScreen)
                attractMode = 1;
        }
    }
    else
    {
        // update game controls
        if (keyWasPressed('KeyR'))
        {
            // restart
            gameStart();
            sound_gameOver.play();
        }
        
        if (gameOverTimer.isSet())
        {
            // game over screen
            const pressed = mouseWasPressed(0) || keyWasPressed('Space');
            if (gameOverTimer > 1)
            if (pressed || gameOverTimer > 9)
            {
                // restart
                gameStart(1);
                pressed && sound_gameOver.play();
            }
        }
        else if (winTimer.isSet())
        {
            // win screen
            if (winTimer > winTimeFlyAway + 5)
            {
                // return to title
                gameStart(1);
            }
        }
        else
        {
            // normal gameplay (not win or game over)
            const islandID = player.pos.x/islandDistance|0;
            if (islandID > activeIslandID)
            {
                // player got to new island
                activeIslandID = islandID;
                if (activeIslandID > islandCount-1)
                {
                    // player won!
                    sound_win.play();
                    winTimer.set();
                    saveData.lastMode = -1; // beat game, so no continue
                    saveData.remixUnlocked = 1; // unlock remix mode
                    if (gameMode == 0) // only save distance in classic mode
                        saveData.bestDistanceClassic = -1; // dont show distance again
                    if (gameContinued)
                        lastWinTime = 0;
                    else
                    {
                        // only save best time if not continued from a save
                        lastWinTime = gameTimer.get();
                        if (gameMode == 0) // classic mode
                        {
                            if (lastWinTime < saveData.bestTimeClassic || !saveData.bestTimeClassic)
                                saveData.bestTimeClassic = lastWinTime; // new best time!
                        }
                        else if (gameMode == 1) // remix mode
                        {
                            if (lastWinTime < saveData.bestTimeRemix || !saveData.bestTimeRemix)
                                saveData.bestTimeRemix = lastWinTime; // new best time!
                        }
                    }
                    writeSaveData();
                }
                else
                {
                    islandTimer.set();
                    timeLeft = min(timeLeft+20, 60); // extra time

                    if (activeIslandID > 0)
                    {
                        // save last game mode to continue from
                        saveData.lastMode = gameMode;
                        saveData.lastSeed = worldSeed;
                        saveData.lastIsland = activeIslandID;
                        writeSaveData();
                    }
                }
            }

            if (player.pos.x > saveData.bestDistanceClassic && !newDistanceRecord)
            {
                // new record distance!
                newDistanceRecord = 1;
                sound_win.play(1,2);
            }
        
            // update game time  
            timeLeft -= timeDelta;
            if (testAutoplay && timeLeft < 10)
                timeLeft = 10; // dont let autoplay run out of time
            if (timeLeft <= 0)
            {
                // game over!
                timeLeft = 0;
                gameOverTimer.set();
                sound_gameOver.play();
                if (gameMode == 0) // only save distance in classic mode
                {
                    if (player.pos.x > saveData.bestDistanceClassic)
                    {
                        // new record distance!
                        saveData.bestDistanceClassic = player.pos.x;
                    }
                }
                writeSaveData();
            }
        }
    }
        
    if (debug)
    {
        if (keyWasPressed('KeyT'))
        {
            // test random mode
            gameMode = 1;
            gameStart();
        }
        if (keyWasPressed('KeyG'))
        {
            // test game over
            timeLeft = 0;
        }
        if (keyWasPressed('KeyM'))
        {
            saveData.coins = 1e5;
            writeSaveData();
        }
    }

    musicUpdate();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    {
        // aspect ratio improvements
        // use whichever side is longer to get full pixel usage
        const minAspect = 1.6;
        const maxAspect = 2.2;
        const maxCanvasSize = vec2(1920*2, 1080*2);
        const innerAspect = innerWidth / innerHeight;
        if (innerAspect > maxAspect)
        {
            // full height
            canvasFixedSize.y = min(innerHeight, maxCanvasSize.y);
            canvasFixedSize.x = canvasFixedSize.y * maxAspect | 0;
        }
        else if (innerAspect < minAspect)
        {
            // full width
            canvasFixedSize.x = min(innerWidth, maxCanvasSize.x);
            canvasFixedSize.y = canvasFixedSize.x / minAspect | 0;
        }
        else if (canvasFixedSize.x)
        {
            // full width and height
            canvasFixedSize.x = 0
        }
    }
    
    updateGameUI();

    // pause/unpause
    if (!titleScreen)
    {
        if (keyWasPressed('KeyP') || paused && mouseWasPressed(0) && !uiObjectWasClicked)
            setPaused(!paused);
        if (keyWasPressed('Escape'))
        {
            // quit after game over
            gameStart(1);
            sound_gameOver.play();
        }
    }

    updateCamera();
}

function updateCamera()
{
    function getCameraBottom(x)
    {
        const i = clamp(x*trackResolution,0,track.length-2);
        return lerp(i%1, track[i|0].bottom, track[i+1|0].bottom);
    }

    // position camera
    let cameraBottom = getCameraBottom(player.pos.x);
    cameraBottom = max(cameraBottom, player.pos.y - playerSpaceBelow); // limit max zoom
    const minZoom = .09; // max zoom in
    cameraScale = minZoom*mainCanvasSize.y; // zoom
    const s = getCameraSize();
    const playerXOffset = .4;
    const maxPlayerPos = s.y-playerSpaceAbove+cameraBottom;
    const a = s.y + max(player.pos.y - maxPlayerPos, 0);
    cameraScale = mainCanvasSize.y / a;
    let winOffset = max((winTimer-winTimeFlyAway)*20,0);
    cameraPos = vec2(
        player.pos.x + playerXOffset*mainCanvasSize.x/cameraScale - winOffset, 
        getCameraSize().y/2+cameraBottom);

    if (testMakeThumbnail)
    {
        cameraScale = 150;
        player.pos.x = 10
        cameraPos = vec2(player.pos.x, player.pos.y+2)
        return;
    }

    if (titleScreen)
    {
        // move camera to show more of level at title screen
        const titleScreenDistance = islandDistance*9; // show 9 islands
        cameraPos.x = 7 + max(gameTimer-5,0)%titleScreenDistance;
    }

    if (testLevelView)
    {
        cameraPos = vec2(mousePosScreen.x/mainCanvasSize.x*islandDistance*islandCount, 0);
        //cameraPos = vec2(522, 0);
        cameraScale = 4;
    }
    if (testLevel)
    {
        cameraPos.x = time*29;
        cameraScale = 10;
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    world.renderBackground();
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    if (testLevelView)
        return;

    world.renderForeground();
    drawHUD();

    // show camera extents for debugging
    //drawRect(cameraPos, getCameraSize().scale(.99), YELLOW);
    //drawRect(vec2(cameraPos.x,-500), vec2(1e3,1e3), GRAY);
}

///////////////////////////////////////////////////////////////////////////////

function setPaused(_paused=1, playSound=1)
{
    if (paused == _paused)
        return;

    paused = _paused;
    if (playSound)
        sound_select.play(1, paused? .5 : 1);
}

///////////////////////////////////////
// save data

const saveName = 'L1ttl3Paws';
let saveData;

{
    // read save data
    saveData = JSON.parse(localStorage[saveName] || '{}');
    saveData.coins = parseInt(saveData.coins) || 0;
    saveData.lastMode = parseInt(saveData.lastMode);
    if (!(saveData.lastMode > -1))
        saveData.lastMode = -1; // -1 means no continue available
    saveData.lastIsland = parseInt(saveData.lastIsland);
    saveData.lastSeed = parseInt(saveData.lastSeed);
    saveData.remixUnlocked = parseInt(saveData.remixUnlocked);
    saveData.bestDistanceClassic = parseFloat(saveData.bestDistanceClassic) || 0;
    saveData.bestTimeClassic = parseFloat(saveData.bestTimeClassic) || 0;
    saveData.bestTimeRemix = parseFloat(saveData.bestTimeRemix) || 0;
    saveData.selectedCatType = parseInt(saveData.selectedCatType) || 0;
    if (!Array.isArray(saveData.cats))
        saveData.cats = [];
    saveData.cats[0] = 1; // first cat is always unlocked
}

function writeSaveData()
{
    //debug && console.log('WRITE SAVE DATA');
    localStorage.setItem(saveName, JSON.stringify(saveData));
}