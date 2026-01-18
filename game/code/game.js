'use strict';

///////////////////////
// littlejs global settings

const gameName = 'L1ttl3 Paws'; // name of the game
const gameVersion = '1.22';

debugShowErrors();

///////////////////////
const playerSpaceAbove = 1;
const playerSpaceBelow = 19;
const maxHeight = 20;
const defaultWorldSeed = 13;
const winTimeFlyAway = 6;

// game variables
let lowResMode=0;
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
let activeIslandID, boostIslandID;
let autoPause = !isTouchDevice; // auto pause when focus is lost
let timeLeft;
let colorBandTextureInfo;
let parallaxTextureInfo;
let worldSeedContinue;
let storeMode;
let lastWinTime;
let newDistanceRecord;
let newTimeRecord;

// debug settings
let testTitleScreen;
let testPickups;
let quickStart;
let testLevelView;
let testRandomize;
let testNoRamps;
let testAutoplay;
let testSeed;
let testStore;
let menuCats;
let testMakeThumbnail;
let testGodMode;
let hideHud;

///////////////////////////////////////////////////////////////////////////////

function gameStart(isTitleScreen)
{
    paused = 0; // unpause at start
    engineObjectsDestroy();

    if (quickStart)
        gameMode = 0;

    // settings
    titleScreen = quickStart || testAutoplay ? 0 : isTitleScreen;
    timeLeft = 30;
    activeIslandID = boostIslandID = newDistanceRecord = lastWinTime = 0;
    if (enhancedMode)
        newTimeRecord = 0;
    if (testAutoplay)
        gameMode = 1; // remix mode

    // create objects
    cameraPos = vec2();
    menuCats = [];
    if (titleScreen)
    {
        const isMenuCat = 1;
        for(let i=catCount;i--;)
            menuCats[i] = new Player(i, isMenuCat);
    }
    gameTimer.set();       // total time playing since game start
    islandTimer.set();     // total time in this island
    gameOverTimer.unset(); // time in game over screen
    winTimer.unset();      // time in win screen
    gameContinued = !!worldSeedContinue; // set if continuing from a save

    // start in attract mode if title screen
    attractMode = titleScreen && !testTitleScreen && !testStore && !testAutoplay;
    if (!testStore)
        storeMode = 0;

    world = new World;
    player = new Player(saveData.selectedCatType);

    // fix camera still being in old place causing objects to despawn!
    updateCamera();
    musicStart();
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    if (testStore)
        storeMode = 1;
    if (testStore)
        quickStart = 0;
    //mainCanvas.style.imageRendering = 'auto'; // smoother rendering for overlay text
    enhancedMode && console.log(gameName + ' v' + gameVersion + ' by Frank Force');
    if (autoPause)
    {
        onblur = ()=>
        {
            // auto pause when focus is lost
            if (!isTouchDevice && !titleScreen && !paused)
                setPaused(1, 0);
        }
    }

    // sprites
    spriteAtlas =
    {
        circle:       tile(0,16,1),
        circleSmall:  tile(2,8,1),
        triangle:     tile(7,16,1),

        // cat parts
        body:         tile(2,16,1),
        head:         tile(3,16,1),
        leg:          tile(4,16,1),
        bodyStriped:  tile(9,16,1),
        headStriped:  tile(10,16,1),
        legStriped:   tile(11,16,1),
    };

    generativeInit();
    createUI();

    // start at the title screen
    gameStart(1);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if (titleScreen)
    {
        // update title screen
        if (mouseWasPressed(0))
            attractMode = 0;
        if (keyWasPressed('Space'))
        {
            // start game, continue if possible
            if (saveData.lastMode < 0)
                buttonClassic.onClick();
            else
                buttonContinue.onClick();
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
        if (keyWasPressed('KeyR') && !gameOverTimer.isSet() && !winTimer.isSet())
        {
            sound_gameOver.play();
            /*if (enhancedMode && gameContinued)
            {
                // continue from save
                worldSeedContinue = saveData.lastSeed;
                gameStart();
                player.pos.x = saveData.lastIsland * islandDistance-30;
                player.pos.y = -20;
                boostIslandID = worldSeedContinue = 0;
                activeIslandID = saveData.lastIsland;
            }
            else*/
            {
                // restart
                gameStart();
            }
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
            {
                // boost at end of island
                const nextIslandBoostLookAhead = 70; // just a little ahead of camera
                const islandBoostID = (player.pos.x+nextIslandBoostLookAhead)/islandDistance|0;
                if (islandBoostID > boostIslandID)
                {
                    boostIslandID = islandBoostID;
                    player.endIslandBoost();
                }
            }

            // normal gameplay (not win or game over)
            const nextIslandLookAhead = 9; // just a little ahead of camera
            const islandID = (player.pos.x+nextIslandLookAhead)/islandDistance|0;
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
                    if (enhancedMode)
                    if (gameMode == 0 && !gameContinued) // only save distance in classic mode
                        saveData.bestDistanceClassic = -1; // dont show distance again after player wins
                    if (!gameContinued)
                    {
                        // only save best time if not continued from a save
                        lastWinTime = gameTimer.get();
                        if (gameMode == 0) // classic mode
                        {
                            if (lastWinTime < saveData.bestTimeClassic || !saveData.bestTimeClassic)
                            {
                                saveData.bestTimeClassic = lastWinTime; // new best time!
                                if (enhancedMode)
                                    newTimeRecord = 1;
                            }
                        }
                        else if (gameMode == 1) // remix mode
                        {
                            if (lastWinTime < saveData.bestTimeRemix || !saveData.bestTimeRemix)
                            {
                                saveData.bestTimeRemix = lastWinTime; // new best time!
                                if (enhancedMode)
                                    newTimeRecord = 1;
                            }
                        }
                    }
                    writeSaveData();
                }
                else
                {
                    islandTimer.set();
                    timeLeft += 20;

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

            if (enhancedMode)
            if (gameMode == 0 && !gameContinued)
            if (player.pos.x > saveData.bestDistanceClassic && !newDistanceRecord)
            {
                // new record distance!
                newDistanceRecord = 1;
                sound_win.play(1,2);
            }
        
            // update game time  
            const lastTimeLeft = timeLeft;
            timeLeft -= timeDelta;
            if (enhancedMode)
            if ((timeLeft|0) != (lastTimeLeft|0))
            if (timeLeft < 5)
            {
                // low time warning
                piano.playNote(12,.5);
            }
            if (testGodMode)
                timeLeft = max(timeLeft,1);
            //if (testAutoplay && timeLeft < 10)
            //    timeLeft = 10; // dont let autoplay run out of time
            if (timeLeft <= 0)
            {
                // game over!
                timeLeft = 0;
                gameOverTimer.set();
                sound_gameOver.play();
                if (enhancedMode)
                if (gameMode == 0 && !gameContinued)
                if (player.pos.x > saveData.bestDistanceClassic)
                {
                    // new record distance!
                    saveData.bestDistanceClassic = player.pos.x;
                }
                writeSaveData();
            }
        }
    }
    
    if (enhancedMode)
    {
        if (keyWasPressed('KeyM'))
        {
            const soundEnabled = soundEnable;
            soundEnable = 1;
            sound_select.play(.5, soundEnabled? 2 : 1);
            soundEnable = !soundEnabled;
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
        if (keyWasPressed('KeyN'))
        {
            saveData.coins = 1e5;
            writeSaveData();
        }
        if (keyWasPressed('KeyU'))
        {
            // unlock all cats
            for(let i=catCount;i--;)
                saveData.cats[i] = 1;
            writeSaveData();
        }
        if (keyWasPressed('KeyV'))
        {
            // capture video
            debugVideoCaptureIsActive() ? 
                debugVideoCaptureStop() : debugVideoCaptureStart();
        }
    }

    musicUpdate();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    if (testMakeThumbnail)
    {
        canvasMaxSize.x = canvasMaxSize.y = 1e4;
    }
    else
    {
        // aspect ratio improvements
        // use whichever side is longer to get full pixel usage
        const minAspect = 1.6;
        const maxAspect = 2.5;
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

        if (lowResMode)
        {
            const scale = 2;
            const pixelated = 1;
            if (mainCanvas)
                mainCanvas.style.imageRendering = pixelated ? 'pixelated' : '';
            if (glCanvas)
                glCanvas.style.imageRendering = pixelated ? 'pixelated' : '';
            if (!canvasFixedSize.x)
            {
                canvasFixedSize.x = innerWidth;
                canvasFixedSize.y = innerHeight;
            }
            canvasFixedSize.x /= scale;
            canvasFixedSize.y /= scale;
        }
    }
    
    updateGameUI();

    // pause/unpause
    if (!titleScreen)
    {
        if (mouseWasPressed(0))
            setPaused(0);
        if (enhancedMode && keyWasPressed('KeyP'))
            setPaused(!paused);
        if (keyWasPressed('Escape'))
        {
            // quit game
            if (quickStart)
                quickStart = 0;
            gameStart(1);
            sound_gameOver.play();
        }
    }

    updateCamera();
}

function updateCamera()
{
    // position camera
    const cbi = clamp(player.pos.x*trackResolution,0,track.length-2);
    const cameraBottom = max(lerp(cbi%1, track[cbi|0].bottom, track[cbi+1|0].bottom),
        player.pos.y - playerSpaceBelow); // limit max zoom

    // position camera
    //const icb = clamp(player.pos.x*trackResolution,0,track.length-2);
    //const cameraBottom = max((icb%1, track[icb|0].bottom, track[icb+1|0].bottom), player.pos.y - playerSpaceBelow); // limit max zoom
    const minZoom = titleScreen ? .1 : .08; // max zoom in
    //const oldCameraScale = cameraScale, oldCameraY = cameraPos.y;
    cameraScale = minZoom*mainCanvasSize.y; // zoom
    const s = getCameraSize();
    const playerXOffset = .4;
    const maxPlayerPos = s.y-playerSpaceAbove+cameraBottom;
    const a = s.y + max(player.pos.y - maxPlayerPos, 0);
    cameraScale = mainCanvasSize.y / a;
    const winOffset = max((winTimer-winTimeFlyAway)*20,0);
    cameraPos = vec2(
        player.pos.x + playerXOffset*mainCanvasSize.x/cameraScale - winOffset, 
        getCameraSize().y/2+cameraBottom);

    //const zoomSpeed = .01; // zoom in slower
    //if (cameraScale > oldCameraScale)
    //    cameraScale = lerp(zoomSpeed, oldCameraScale, cameraScale);
    //if (cameraPos.y < oldCameraY)
    //    cameraPos.y = lerp(zoomSpeed, oldCameraY, cameraPos.y);

    if (testMakeThumbnail)
    {
        cameraScale = 150;
        cameraPos = vec2(10, 5)
        player.pos = cameraPos.copy();
        player.pos.x -= .6;
        player.pos.y += .1;
        return;
    }

    if (titleScreen)
    {
        // move camera to show more of level at title screen
        const titleScreenDistance = islandDistance*9; // show 9 islands
        cameraPos = vec2(7 + max(gameTimer-5,0)%titleScreenDistance, 6);
    }

    if (testLevelView)
    {
        cameraPos = vec2(mousePosScreen.x/mainCanvasSize.x*islandDistance*islandCount, 0);
        cameraPos.x = .2*islandDistance*islandCount;
        cameraScale = 14;
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
    if (enhancedMode)
        saveData.bestDistanceClassic = parseFloat(saveData.bestDistanceClassic) || 0;
    saveData.bestTimeClassic = parseFloat(saveData.bestTimeClassic) || 0;
    saveData.bestTimeRemix = parseFloat(saveData.bestTimeRemix) || 0;
    saveData.selectedCatType = parseInt(saveData.selectedCatType) || 0;
    if (!saveData.cats || !saveData.cats.length)
        saveData.cats = []; // must be an array
    saveData.cats[0] = 1; // first cat is always unlocked
}

function writeSaveData()
{
    //debug && console.log('WRITE SAVE DATA');
    localStorage.setItem(saveName, JSON.stringify(saveData));
}

///////////////////////////////////////////////////////////////////////////////
// image data

//const imageSource = 'tiles.png';
const imageSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAgMAAAC+UIlYAAAACVBMVEUAAAD///+9vb1a+/H2AAAAAXRSTlMAQObYZgAAAOVJREFUWMPtkj0KwzAMhRVDhmTqkr1Llp4iR8iQF0Knjj1GLlHomKGG4lPWyINbOT+FUjpUHxhr+MCW9Og9so6WycFnmQoNHzq4cVYAWhbMBWeicZ88D3QsFEBP5nRNvwA8CcdhTuBP1r4YDbyQtVLgNqNQDIng+Y4Q2/SELoLQy0FFgdzEghy1J0wyVE4ui+Fd/Ir2QyHmsbbjqpBZeyNqdrOh5dtaS6Yd1oWYqHTUlRcaFsy0IZR3uU0h5N22IAMjn5CC6KJ0MpNR4ETlkEKcZKjw2iXQyF2kgqIoiqIoiqIof88DCEVdiDHOHWkAAAAASUVORK5CYII="