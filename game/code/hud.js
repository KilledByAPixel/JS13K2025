'use strict';

///////////////////////////////////////////////////////////////////////////////
// game UI
let uiRoot, uiMenu, uiStore;
let buttonClassic, buttonRemix, buttonContinue, buttonStore;
let uiTextBestTimeClassic, uiTextBestTimeRemix, uiTextContinueIsland;
let buttonBack, buttonPause, storeButtons;

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
        clearInput();
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
        clearInput();
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
        clearInput();
        gameStart();
        player.pos.x = saveData.lastIsland * islandDistance + 20;
        worldSeedContinue = 0;
    }

    pos.x += buttonSize.x + spaceing;
    uiMenu.addChild(buttonStore = new UIButton(pos, buttonSize, 'Store'));
    buttonStore.onClick = ()=> 
    {
        sound_select.play(.5);
        storeMode = 1;
    }

    // back button in top corner
    class UICornerButton extends UIButton
    {
        constructor(type) { super(vec2(), buttonSizeSmall); this.type = type; }
        render()
        {
            super.render();
            if (this.type == 1)
            {
                // pause
                drawUIRect(this.pos.add(vec2( 16,0)), vec2(10,60), BLACK, undefined, undefined, 0);
                drawUIRect(this.pos.add(vec2(-16,0)), vec2(10,60), BLACK, undefined, undefined, 0);
            }
            else
            {
                // back arrow
                const points = [vec2(-30,0), vec2(20,30), vec2(20,-30)];
                drawUIPoints(this.pos, points, BLACK);
            }
        }
    }
    
    const buttonSizeSmall = vec2(120);
    buttonBack = new UICornerButton;
    buttonBack.onClick = ()=>
    {
        sound_select.play(1, .25);
        if (storeMode)
        {
            storeMode = 0;
            return;
        }

        gameStart(1);
    }

    buttonPause = new UICornerButton(1);
    buttonPause.onClick = ()=>
    {
        setPaused(!paused);
        clearInput();
    }
}

function createStoreUI()
{
    uiRoot.addChild(uiStore = new UIObject(vec2(0,180)));
    //uiStore.visible = 0; // store hidden by default
   
    //const uiTextStoreTitle = new UIText(vec2(), vec2(1e3,100), 'L1ttl3 Paws Store');
    //uiStore.addChild(new UIText(vec2(), vec2(1e3,100), 'L1ttl3 Paws Store'));

    // back button in top corner
    const buttonSize = vec2(220,200);
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
            this.cornerRadius = 8;
            this.lineWidth = 8;
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
            const backgroundSize = vec2(2.25,2.05)
            drawRect(worldPos, backgroundSize, isActiveCat ? CYAN :
            owned ? this.mouseIsOver ? YELLOW : WHITE : this.mouseIsOver ? canAfford ? YELLOW : RED : hsl(0,0,.2));

            // draw the cat!
            const menuCat = menuCats[this.catType];
            ASSERT(menuCat)
            if (menuCat)
            {
                menuCat.pos = worldPos.add(vec2(.1,.2));
                menuCat.renderHack();
            }

            //if (!owned && saveData.coins < this.cost)
            //    drawRect(pos, vec2(1.75), hsl(0,0,0,.5));

            if (!owned)
            {
                const textPos = this.pos.add(vec2(.8,.55).multiply(textSize));
                const shadowPos = textPos.add(vec2(5,5));
                const color = saveData.coins < this.cost ? RED : WHITE;
                drawUIText(this.cost, shadowPos, textSize, BLACK, 0, undefined, 'right', this.font);
                drawUIText(this.cost, textPos, textSize, color, 0, undefined, 'right', this.font);
                drawCoinPickup(worldPos.add(vec2(-.7,-.5)), vec2(1), undefined, undefined, time/4);
            }
            if (isActiveCat)
            {
                const textSize = vec2(this.size.x*.9, this.size.y*.4);
                const textPos = this.pos.add(vec2(0,.8).multiply(textSize));
                const shadowPos = textPos.add(vec2(5,5));
                drawUIText('Selected', shadowPos, textSize, BLACK, 0, undefined, 'center', this.font);
                drawUIText('Selected', textPos, textSize, WHITE, 0, undefined, 'center', this.font);
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

    const columns = 4
    storeButtons = [];
    for(let i=catCount; i--;)
    {
        const col = i%columns;
        const row = (i/columns)|0;

        const pos = vec2((col - (columns-1)/2)*buttonSize.x*1.2, 
            row*buttonSize.y*1.2);
        if (row == 3)
            pos.x = 0; // center last row
            
        const cost = 100+i*50 + (i%2?0:13);
        const button = new StoreButton(pos);
        button.catType = i;
        button.cost = cost;
        button.cornerRadius = 9;
        uiStore.addChild(button);
        storeButtons.push(button);
    }
}

function updateGameUI()
{
    const margin = 20
    const r = mainCanvasSize.y/uiNativeHeight;
    
    // position corner buttons
    buttonBack.visible = !titleScreen || storeMode; // only show back button in game
    buttonBack.pos.x = (mainCanvasSize.x/2/r - buttonBack.size.x/2 - margin);
    buttonPause.pos.y = buttonBack.pos.y = buttonBack.size.y/2 + margin;
    buttonPause.visible = !titleScreen;
    buttonPause.pos.x = buttonBack.pos.x - buttonBack.size.x - margin;
    buttonPause.color = paused ? YELLOW : uiDefaultButtonColor;
    
    // update menu visibility
    uiMenu.visible = titleScreen && !storeMode && !attractMode;
    buttonContinue.disabled = saveData.lastMode < 0; // only show continue if have a save
    buttonRemix.disabled = !saveData.remixUnlocked; // only show continue if have a save

    // update store
    uiStore.visible = storeMode;
    /*
    if (storeMode)
    {
        for(let i=catCount; i--;)
        {
            const b = storeButtons[i];
            const owned = saveData.cats[b.catType];
            b.disabled = saveData.coins < b.cost;
            b.text = owned ? 'Owned' : `Cost: ${b.cost}`;
            b.color = owned ? WHITE : uiDefaultButtonColor;
        }
    }*/

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
    const textSize = .1;
    const textColorWave = hsl(1,1,1,wave(.5));
    if (!quickStart && !testTitleScreen && !testStore)
    {
        // intro transition, black circle around center
        const p = time;
        const count = 99;
        for(let i=count; p<1 && i--;)
        {
            const a = i/count*PI*2;
            drawRect(cameraPos.add(vec2(p*15,0).rotate(a)), vec2(1,30), BLACK, a);
        }
    }

    if (debug && debugGenerativeCanvas)
    {
        const scale = 1;
        const s1 = generativeTextureSize*scale;
        const s2 = parallaxTextureSize*scale;
        if (debugGenerativeCanvas == 1)
            overlayContext.drawImage(colorBandCanvas, 0, 0, s1*4, s1/2);
        else
            overlayContext.drawImage(parallexCanvas, 0, 0, s2/2, s2/2);
        return;
    }
    
    //drawTextShadow(gameName + ' v' + gameVersion, vec2(.99, .97), .05, rgb(1,1,1,.5), 'right');
    const context = overlayContext;
    context.strokeStyle = BLACK;

    if (!attractMode)
    {
        // draw coin count
        drawCoinPickup(vec2(.05, .93), vec2(.12), undefined, undefined, time/4, 1);
        drawTextShadow(saveData.coins, vec2(.09, .94), .08, WHITE, 'left');
    }

    if (titleScreen)
    {
        drawTitleScreen();
        return;
    }

    if (paused)
        drawTextShadow(`-Paused-`, vec2(.5, .94), textSize, WHITE);

    if (testAutoplay)
        drawTextShadow(`-AUTOPLAY-`, vec2(.5, .95), .05, WHITE);

    if (winTimer.isSet())
    {
        drawTextShadow(`You Win!`, vec2(.5, .45), textSize, textColorWave);
        if (lastWinTime)
        {
            const time = formatTimeString(lastWinTime);
            drawTextShadow(time, vec2(.5, .55), textSize, textColorWave);
        }
    }
    else if (gameOverTimer.isSet())
    {
        drawTextShadow(`Game Over!`, vec2(.5, .5), textSize, textColorWave);
    }
    else
    {
        // time left in corner
        drawTextShadow((timeLeft).toFixed(1), vec2(.99, .94), .08, WHITE, 'right');

        const islandFade = 2;
        const islandHold = 5;
        ASSERT(islandHold > islandFade*2);

        const islandTime = islandTimer.get();
        if (islandTime < islandHold && !paused)
        {
            const fade = 
                islandTime < islandFade ? percent(islandTime, 0, islandFade) : 
                percent(islandTime, islandHold, islandHold - islandFade);
            const id = activeIslandID;

            const c = hsl(1,1,1,fade);
            if (id) // dont show first island
                drawTextShadow(`Island ` + (id+1), vec2(.5, .06), textSize, c);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

function drawTitleScreen()
{
    const context = overlayContext;
    const titleScreenTime = testTitleScreen ? 5+time : time;
    const alpha = clamp(titleScreenTime/.5);
    const textSize = .1;

    if (storeMode)
    {
        if (!isJS13KBuild)
            drawTextShadow(`L1TTL3 PAWS STORE`, vec2(.5, .06), textSize);
        return;
    }
        
    if (attractMode && !testMakeThumbnail)
        drawTextShadow(`Click To Play`, vec2(.5, .92), textSize, hsl(1,1,1,wave(.5)*clamp(titleScreenTime-2)));

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
        const pos = vec2(.5,.2+j*.2).multiply(mainCanvasSize);
        if (testMakeThumbnail)
            pos.y += 30
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

    //drawTextShadow(`${isTouchDevice?'Touch':'Click'} To Play`, vec2(.5, .92), .1, hsl(1,1,1,wave(.5)*clamp(titleScreenTime-2)));

    /*const s4 = mainCanvasSize.y*(.1+Math.sin(time*3+PI*2*1/3)*.005 )*s3*.6;
    drawTextShadow(`A Game by Frank Force`, vec2(mainCanvasSize.x/2, mainCanvasSize.y*.53), s4, WHITE);
    const s5 = mainCanvasSize.y*(.1+Math.sin(time*3+PI*2*2/3)*.005 )*s3*.6;
    drawTextShadow(`Created for JS13K 2025`, vec2(mainCanvasSize.x/2, mainCanvasSize.y*.6), s5, WHITE);*/
}

///////////////////////////////////////////////////////////////////////////////

function drawTextShadow(text, pos, size, color=WHITE, textAlign)
{
    pos = pos.multiply(mainCanvasSize);
    size *= mainCanvasSize.y;
    drawTextScreen(text, pos.add(vec2(size*.05)), size, rgb(0,0,0,color.a), 0, 0, textAlign);
    drawTextScreen(text, pos, size, color, 0, 0, textAlign);
}

function formatTimeString(t, showMS=true)
{
    const timeS = t%60|0;
    const timeM = t/60|0;
    const timeMS = t%1*1e3|0;
    if (showMS)
        return `${timeM}:${timeS<10?'0'+timeS:timeS}.${(timeMS<10?'00':timeMS<100?'0':'')+timeMS}`;
    else
        return `${timeM}:${timeS<10?'0'+timeS:timeS}`;
}