'use strict';

///////////////////////////////////////////////////////////////////////////////
// game UI
let uiRoot, uiMenu, uiStore;
let buttonClassic, buttonRemix, buttonContinue, buttonStore;
let uiTextBestTimeClassic, uiTextBestTimeRemix, uiTextContinueIsland;
let buttonBack, buttonPause, storeButtons, buttonWebsite;

function createUI()
{
    // setup root to attach all ui elements to
    uiRoot = new UIObject;

    // setup menu
    uiRoot.addChild(uiMenu = new UIObject(vec2(0,100)));
    //uiMenu.visible = 0; // menu hidden by default
    createStoreUI();

    const buttonSize = vec2(460, 180);
    const spaceing = 50;
    const startPosX = -spaceing/2-buttonSize.x/2;
    const pos = vec2(startPosX,630)
    const buttonInfoOffset = vec2(0, 55);
    const buttonInfoSize = vec2(420, 80);

    uiMenu.addChild(buttonClassic = new UIButton(pos, buttonSize, 'Classic'));
    buttonClassic.addChild(uiTextBestTimeClassic = new UIText(buttonInfoOffset, buttonInfoSize));
    buttonClassic.onClick = ()=>
    {
        sound_select.play();
        titleScreen = 0;
        gameMode = 0;
        gameStart();
    }
  
    pos.x += buttonSize.x + spaceing;
    uiMenu.addChild(buttonRemix = new UIButton(pos, buttonSize, 'Remix'));
    buttonRemix.addChild(uiTextBestTimeRemix = new UIText(buttonInfoOffset, buttonInfoSize));
    buttonRemix.onClick = ()=>
    {
        if (!saveData.remixUnlocked)
            return;

        sound_select.play();
        titleScreen = 0;
        gameMode = 1;
        gameStart();
    }

    pos.x = startPosX;
    pos.y += buttonSize.y + spaceing;
    uiMenu.addChild(buttonContinue = new UIButton(pos, buttonSize, 'Continue'));
    buttonContinue.addChild(uiTextContinueIsland = new UIText(buttonInfoOffset, buttonInfoSize));
    buttonContinue.onClick = ()=>
    {
        if (saveData.lastMode < 0)
            return;

        sound_select.play();
        titleScreen = 0;
        gameMode = saveData.lastMode;
        worldSeedContinue = saveData.lastSeed;
        gameStart();
        player.pos.x = saveData.lastIsland * islandDistance-30;
        player.pos.y = -20;
        boostIslandID = worldSeedContinue = 0;
        activeIslandID = saveData.lastIsland;
    }

    pos.x += buttonSize.x + spaceing;
    uiMenu.addChild(buttonStore = new UIButton(pos, buttonSize, 'Shop'));
    buttonStore.onClick = ()=> 
    {
        sound_select.play(.5);
        storeMode = 1;
    }

    // back button in top corner
    class UICornerButton extends UIButton
    {
        constructor(type)
        {
            super();
            this.type = type;
            this.extraTouchSize = 200;
        }

        render()
        {
            // hack: make it slightly alpha
            const color = hsl(0,0,0,this.lineColor.a = this.color.a = paused || storeMode ? 1 :.5+this.mouseIsOver);
            super.render();
            // hack must set alpha back
            this.lineColor.a = this.color.a = 1;

            if (this.type == 1)
            {
                // pause
                drawUIRect(this.pos.add(vec2( 16,0)), vec2(16,60), color, 0, undefined, 0);
                drawUIRect(this.pos.add(vec2(-16,0)), vec2(16,60), color, 0, undefined, 0);
            }
            else if (!enhancedMode || this.type != 2)
            {
                // back arrow
                const points = [vec2(-30,0), vec2(20,30), vec2(20,-30)];
                drawUIPoints(this.pos, points, color);
            }
        }
    }
    
    buttonBack = new UICornerButton;
    buttonBack.onClick = ()=>
    {
        sound_select.play(1, .5);
        if (storeMode)
            storeMode = 0;
        else
            gameStart(1);
    }

    buttonPause = new UICornerButton(1);
    buttonPause.onClick = ()=> setPaused(!paused);

    if (enhancedMode)
    {
        buttonWebsite = new UICornerButton(2);
        buttonWebsite.text = '?';
        buttonWebsite.onClick = ()=>
        {
            open("https://github.com/KilledByAPixel/JS13K2025", "_blank", "noopener,noreferrer");
        }
    }
}

function createStoreUI()
{
    uiRoot.addChild(uiStore = new UIObject(vec2(0,190)));
    //uiStore.visible = 0; // store hidden by default
   
    //const uiTextStoreTitle = new UIText(vec2(), vec2(1e3,100), 'L1ttl3 Paws Store');
    //uiStore.addChild(new UIText(vec2(), vec2(1e3,100), 'L1ttl3 Paws Store'));

    // back button in top corner
    const buttonSize = vec2(290,300);
    class StoreButton extends UIButton
    {
        constructor(pos)
        {
            super(pos, buttonSize);
        }
        update()
        {
            super.update();

            const owned = this.isOwned();
        }
        render()
        {
            // make these colors invisible
            const isActiveCat = saveData.selectedCatType == this.catType;
            this.lineColor = isActiveCat ? WHITE : BLACK;
            this.disabledColor = this.hoverColor = this.color = rgb(0,0,0,0);
            this.cornerRadius = this.lineWidth = 8;
            super.render();
            const textSize = vec2(this.size.x*.6, this.size.y*.5);
            const owned = this.isOwned();

            // setup
            const s = mainCanvasSize.y / uiNativeHeight; // auto adjust height
            let pos = this.pos.copy();
            pos = pos.scale(s);
            pos.x += mainCanvasSize.x/2;
            const worldPos = screenToWorld(pos);

            // background
            const canAfford = saveData.coins >= this.cost;
            const backgroundSize = vec2(2.7,2.75)
            drawRect(worldPos, backgroundSize, isActiveCat ? CYAN :
            owned ? this.mouseIsOver ? YELLOW : WHITE : this.mouseIsOver ? canAfford ? YELLOW : RED : hsl(0,0,.2));

            // draw the cat!
            const menuCat = menuCats[this.catType];
            ASSERT(menuCat)
            if (menuCat)
            {
                menuCat.pos = worldPos.add(vec2(.1,owned ? 0:.1));
                menuCat.pos.y += menuCat.size.y/2;
                menuCat.renderHack();
            }

            //if (!owned && saveData.coins < this.cost)
            //    drawRect(pos, vec2(1.75), hsl(0,0,0,.5));

            if (!owned)
            {
                const textPos = this.pos.add(vec2(.7,.6).multiply(textSize));
                const shadowPos = textPos.add(vec2(5,5));
                const color = saveData.coins < this.cost ? RED : WHITE;
                drawUIText(this.cost, shadowPos, textSize, BLACK, 0, undefined, 'right', this.font);
                drawUIText(this.cost, textPos, textSize, color, 0, undefined, 'right', this.font);
                drawCoinPickup(worldPos.add(vec2(-.8,-.7)), vec2(1), undefined, undefined, time/4);
            }
            if (isActiveCat && !enhancedMode)
            {
                const textSize = vec2(this.size.x*.9, this.size.y*.4);
                const textPos = this.pos.add(vec2(0,.8).multiply(textSize));
                const shadowPos = textPos.add(vec2(5,5));
                drawUIText('Selected', shadowPos, textSize, BLACK, 0, undefined, 'center', this.font);
                drawUIText('Selected', textPos, textSize, WHITE, 0, undefined, 'center', this.font);
            }
            else if (enhancedMode && owned)
            {
                const catNames = 
                [
                    'Triska', 
                    'Joe', 
                    'Tiger', 
                    'Princess', 
                    'Oreo',
                    'Rusty',
                    'Skye',
                    'Dini',
                    'Chonk',
                    'Zed',
                    'Rosie',
                    'Cheshire',
                    'Hex',
                ];

                const name = catNames[this.catType] || '';
                const textSize = vec2(this.size.x*.9, this.size.y*.35);
                const textPos = this.pos.add(vec2(0,.8).multiply(textSize));
                const shadowPos = textPos.add(vec2(5,5));
                const color = isActiveCat ? WHITE : GRAY;
                const shadowColor = BLACK;
                drawUIText(name, shadowPos, textSize, shadowColor, 0, undefined, 'center', this.font);
                drawUIText(name, textPos, textSize, color, 0, undefined, 'center', this.font);
            }
        }
        isOwned()
        {
            return saveData.cats[this.catType];
        }
        onClick()
        {
            if (this.isOwned())
            {
                // set active cat
                const menuCat = menuCats[this.catType];
                if (menuCat)
                    menuCat.meow();
                const isActiveCat = saveData.selectedCatType == this.catType;
                if (!isActiveCat)
                {
                    player.setCatType(saveData.selectedCatType = this.catType);
                    writeSaveData();
                }
                return; // meow !
            }

            // buy the cat!
            if (saveData.coins >= this.cost && !saveData.cats[this.catType])
            {
                saveData.coins -= this.cost;
                saveData.cats[this.catType] = 1;
                sound_win.play(.7, 2);
                player.setCatType(saveData.selectedCatType = this.catType);
                writeSaveData();
            }
            else
            {
                // play error sound
                sound_gameOver.play(.7, 2);
            }
        }
    }

    const columns = 5;
    storeButtons = [];
    for(let i=catCount; i--;)
    {
        const j = enhancedMode ? (i < 4 ? i : i>8 ? i+2 : i+1) :
             i+2-(i<9) ; // shift over to make 13 fit

        const col = j%columns;
        const row = (j/columns)|0;
        const pos = vec2((col - (columns-1)/2)*buttonSize.x*1.15, 
            row*buttonSize.y*1.15);
            
        const cost = 100+i*50 + (i%2?0:13);
        const button = new StoreButton(pos);
        button.catType = i;
        button.cost = cost;
        uiStore.addChild(button);
        storeButtons.push(button);
    }
}

function updateGameUI()
{
    if (hideHud)
    {
        buttonPause.visible = buttonBack.visible = uiRoot.visible = 0;
        return;
    }

    const largeCorner = isTouchDevice || titleScreen || paused;
    const cornerMargin = largeCorner ? 40 : 20;
    const r = mainCanvasSize.y/uiNativeHeight;
    const buttonSizeSmall = vec2(largeCorner ? 200 : 99);
    buttonPause.size = buttonBack.size = buttonSizeSmall;
    buttonPause.cornerRadius = buttonBack.cornerRadius = buttonSizeSmall.x/3;
    
    // corner pause button
    buttonPause.visible = !titleScreen && (paused || !winTimer.isSet() && !gameOverTimer.isSet());
    buttonPause.pos.x = (mainCanvasSize.x/2/r - buttonBack.size.x/2 - cornerMargin);
    buttonPause.pos.y = buttonBack.pos.y = buttonBack.size.y/2 + cornerMargin;
    buttonPause.color = paused ? YELLOW : uiDefaultButtonColor;

    // corner back button
    buttonBack.visible = paused && !titleScreen || storeMode; // only show back button in game
    buttonBack.pos.x = buttonBack.size.x/2 + cornerMargin-mainCanvasSize.x/2/r;

    if (enhancedMode && storeMode)
        buttonBack.pos = buttonPause.pos.copy();

    if (enhancedMode)
    {
        buttonWebsite.visible = paused;
        buttonWebsite.size = buttonSizeSmall;
        buttonWebsite.pos.x = buttonBack.pos.x + buttonSizeSmall.x + 50
        buttonWebsite.pos.y = buttonBack.pos.y;
        buttonWebsite.cornerRadius = buttonBack.cornerRadius;
    }

    // update menu visibility
    uiMenu.visible = titleScreen && !storeMode && !attractMode;
    buttonContinue.disabled = saveData.lastMode < 0; // only show continue if have a save
    buttonRemix.disabled = !saveData.remixUnlocked; // only show continue if have a save

    // update store
    uiStore.visible = storeMode;

    // classic time
    const textOffset = vec2(0,-.25);
    const bestTimeClassic = saveData.bestTimeClassic;
    uiTextBestTimeClassic.text = bestTimeClassic ? 'Best ' + formatTimeString(bestTimeClassic) : '';
    buttonClassic.textOffset = bestTimeClassic ? textOffset : vec2();

    // remix time
    const bestTimeRemix = saveData.bestTimeRemix;
    uiTextBestTimeRemix.text = bestTimeRemix ? 'Best ' + formatTimeString(bestTimeRemix) : '';
    buttonRemix.textOffset = bestTimeRemix ? textOffset : vec2();

    // continue island
    const hasContinue = saveData.lastMode >= 0;
    uiTextContinueIsland.text = hasContinue ? `${saveData.lastMode ? 'Remix' : 'Classic'} ${saveData.lastIsland+1}` : '';
    buttonContinue.textOffset = hasContinue ? textOffset : vec2();
}

///////////////////////////////////////////////////////////////////////////////

function drawHUD()
{
    if (hideHud)
        return;

    const textSize = .1;
    if (enhancedMode && !quickStart)
    if (!testMakeThumbnail && !testTitleScreen && !testStore)
    {
        // intro transition, black circle around center
        const p = gameTimer*(titleScreen?.5:1);
        const count = 99;
        for(let i=count; p<1 && i--;)
        {
            const a = i/count*PI*2;
            drawRect(cameraPos.add(vec2(p*30+8,0).rotate(a)), vec2(20,30), BLACK, a);
        }
    }

    if (debug && debugGenerativeCanvas)
    {
        const scale = 1;
        const s1 = generativeTextureSize*scale;
        const s2 = parallaxTextureSize*scale;
        if (debugGenerativeCanvas == 1)
            mainContext.drawImage(colorBandCanvas, 0, 0, s1*4, s1/2);
        else
            mainContext.drawImage(parallexCanvas, 0, 0, s2/2, s2/2);
        return;
    }
    
    //drawTextShadow(gameName + ' v' + gameVersion, vec2(.99, .97), .05, rgb(1,1,1,.5), 'right');
    const context = mainContext;
    context.strokeStyle = BLACK;

    if (!attractMode)
    {
        // draw coin count
        drawCoinPickup(vec2(.05, .93), vec2(.12), undefined, undefined, time/4, 1);
        drawTextShadow(saveData.coins, vec2(.09, .94), .1, WHITE, 'left', undefined, .2);
    }

    if (titleScreen)
    {
        drawTitleScreen();
        return;
    }

    if (paused)
        drawTextShadow('-Pawsed-', vec2(.5, .94), textSize, WHITE);
    if (testAutoplay)
        drawTextShadow('AUTOPLAY', vec2(.5, .95), .05, WHITE);

    if (enhancedMode && !quickStart)
    if (!saveData.remixUnlocked && !gameOverTimer.isSet() && !winTimer.isSet())
    {
        // show how to play if they havent played before
        const helpTime = 20;
        if (gameTimer < helpTime && !gameMode && !gameContinued)
        {
            const p = gameTimer < 3 ? percent(gameTimer, 3, 1) : percent(gameTimer, helpTime-3, helpTime);
            const color = hsl(0,0,1,1-p);
            drawTextShadow('Use only one button to play!\nHold on down slopes to gain speed.', vec2(.5, .33), .1, color, 'center', undefined, 1.5);
        }
    }
    if (winTimer.isSet())
    {
        const alpha = enhancedMode ? winTimer.get()/2 : .5+Math.sin(time*3)/2;
        const textColorWave = hsl(0,0,1,alpha);
        drawTextShadow('You Win!', vec2(.5, .4), .15, textColorWave);
        if (lastWinTime)
        {
            const winTime = formatTimeString(lastWinTime);
            drawTextShadow(winTime, vec2(.5, .52), textSize, textColorWave);
            if (enhancedMode && newTimeRecord)
                drawTextShadow('New Record!', vec2(.5, .62), textSize, hsl(0,1,.5,alpha));
        }
    }
    else if (gameOverTimer.isSet())
    {
        const alpha = enhancedMode ? gameOverTimer.get()/2 : .5+Math.sin(time*3)/2;
        const textColorWave = hsl(0,0,1,alpha);
        drawTextShadow('Game Over!', vec2(.5, .5), .15, textColorWave);
    }
    else
    {
        // time left in corner
        const timeColor = timeLeft < 5 ? RED : WHITE; // warning time
        drawTextShadow(timeLeft.toFixed(1), vec2(.99, .94), .1, timeColor, 'right');

        // show time in corner if player has beat that mode and not continuing
        if (enhancedMode && !paused && !gameOverTimer.isSet() && !winTimer.isSet())
        {
            const hasWon = gameMode == 0 && saveData.bestTimeClassic ||
                gameMode == 1 && saveData.bestTimeRemix;
            if (hasWon && !gameContinued)
                drawTextShadow(formatTimeString(gameTimer), vec2(.99, .86), .05, WHITE, 'right','monospace',.19);
        }

        const islandFade = 2;
        const islandHold = 5;
        ASSERT(islandHold > islandFade*2);

        const islandTime = islandTimer.get();
        if (islandTime < islandHold)
        {
            const fade = 
                islandTime < islandFade ? percent(islandTime, 0, islandFade) : 
                percent(islandTime, islandHold, islandHold - islandFade);
            const id = activeIslandID;

            const c = hsl(1,1,1,fade);
            if (id) // dont show first island
                drawTextShadow('Island ' + (id+1), vec2(.5, .06), textSize, c);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

function drawTitleScreen()
{
    const context = mainContext;
    const titleScreenTime = testMakeThumbnail || testTitleScreen ? 5+gameTimer : gameTimer;
    const alpha = clamp(titleScreenTime/.5);
    const textSize = .1;

    if (storeMode)
    {
        if (!isJS13KBuild)
            drawTextShadow(`L1TTL3 PAWS STORE`, vec2(.5, .06), textSize);
        return;
    }

    if (enhancedMode)
    {
        drawTextShadow('v'+gameVersion, vec2(.99, .97), .05, hsl(1,1,1,.2*clamp(titleScreenTime-1)), 'right');
        
        if (attractMode && !testMakeThumbnail)
        {
            const color1 = hsl(1,1,1,clamp(titleScreenTime-2));
            drawTextShadow(`A Game By Frank Force`, vec2(.5, .58), .08, color1);
            const color2 = hsl(1,1,1,clamp(titleScreenTime-4));
            drawTextShadow(`Made for JS13K 2025`, vec2(.5, .66), .08, color2);
        }
            
        if (attractMode && !testMakeThumbnail)
            drawTextShadow(`${isTouchDevice?'Touch':'Click'} To Play`, vec2(.5, .92), textSize, hsl(1,1,1,wave(.5)*clamp(titleScreenTime-6)));
    }

    for(let j=2;j--;) // top and bottom rows of text
    {
        const text = j?'PAWS':'L1TTL3';
        const weight = 900;
        const style = '';
        const font = 'arial';
        const size = mainCanvasSize.y/5 * lerp(titleScreenTime*2-j-1,0,1);
        const fontSize = size/2;
        const fontRatio = size / fontSize;
        context.font = `${style} ${weight} ${fontSize}px ${font}`;
        context.lineWidth = size/10/fontRatio;
        context.strokeStyle = WHITE
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineJoin = 'round';

        let totalWidth = 0, measuredWidths = [];
        let pos = vec2(.5,.2+j*.2).multiply(mainCanvasSize);
        if (testMakeThumbnail == 1)
            pos.y += 30;
        if (testMakeThumbnail == 2)
            pos = vec2(.25+j*.41,.5).multiply(mainCanvasSize);
        for(let k=2; k--;) // measure the whole row of text first
        for(let i=text.length; i--;)
        {
            const p = Math.sin(i-titleScreenTime*2+j);
            const c = text[i];
            const extraSpace = size*.1;
            if (k)
                totalWidth += measuredWidths[i] = context.measureText(c).width + extraSpace;
            else
            {
                const w = fontRatio*measuredWidths[i];
                const x = pos.x-w/2+fontRatio*totalWidth/2;
                const y = pos.y + fontRatio*p*mainCanvasSize.y*.02
                for(let m=3;m--;)
                {
                    const layerScale = size/fontRatio*(.07 + .02*Math.sin(time*3+i));
                    context.save();
                    context.translate(x, y);
                    context.scale(fontRatio,fontRatio);
                    context.rotate(Math.cos(i*4-time*2)*.1);
                    {
                        m || context.strokeText(c, 0, 0);
                        context.fillStyle = hsl(p/9, m, m?1-m/4:0, alpha);
                        const o = m ? m + .5 : 0;
                        context.fillText(c, -o*layerScale, -o*layerScale);
                    }
                    context.restore();
                }
                pos.x -= w;
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

function drawTextShadow(text, pos, size, color=WHITE, textAlign, font, maxWidth)
{
    pos = pos.multiply(mainCanvasSize);
    size *= mainCanvasSize.y;
    if (maxWidth)
        maxWidth *= mainCanvasSize.y;
    drawTextScreen(text, pos.add(vec2(size*.05)), size, rgb(0,0,0,color.a), 0, 0, textAlign, font, maxWidth);
    drawTextScreen(text, pos, size, color, 0, 0, textAlign, font, maxWidth);
}

function formatTimeString(t, showMS=true)
{
    const timeS = t%60|0;
    const timeM = t/60|0;
    const timeMS = t%1*1e3|0;
    return `${timeM}:${timeS<10?'0'+timeS:timeS}` +
        (showMS ? `.${(timeMS<10?'00':timeMS<100?'0':'')+timeMS}` : '');
}