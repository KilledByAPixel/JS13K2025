'use strict';

class World extends EngineObject
{
    constructor()
    { 
        super();
        this.trackSpawnedIndex = 0;

        // setup world
        worldSeed = worldSeedContinue ? worldSeedContinue :
            gameMode == 1 || testRandomize || titleScreen? 
            Math.floor(Math.random()*1e7) : // random mode
            defaultWorldSeed;               // classic mode
        if (testSeed)
            worldSeed = testSeed;
        //debug && console.log('Seed: ' + worldSeed);
        
        generateParallaxTexture();
        generateColorBandTexture();
        generateWorld();
        this.spawnAtmosphere(50); // warm up atmosphere
        this.timeOfDay = 1; // start of day
    }

    spawnAtmosphere(spawnCount=1)
    {
        if (testMakeThumbnail)
            return;

        // spawn atmosphere objects in front of camera
        const hasWon = winTimer.isSet();
        for(let i=spawnCount; i--;)
        {
            const renderOrder = -10;
            const color = hasWon ? hsl(rand(),1,.5,rand(.5,1)) : hsl(0,0,rand(.7,1),rand(.2,.5));
            const velocity = vec2(-rand(.1,.2), rand(-.01,.01));
            const angle = velocity.angle() + PI/2;
            const o = new WorldObject(vec2(cameraPos.x+20, cameraPos.y+rand(-20,20)), vec2(rand(.2,.6),rand(.1,.2)).scale(rand(.5,1)), 0, angle, color, renderOrder);
            if (spawnCount > 1)
                o.pos.x = cameraPos.x + rand(20); // warm up mode, spawn on screen
            o.velocity = velocity;
            o.gravityScale = 0;
        }
    }

    update()
    {
        // update time of day
        const realTimeOfDay = clamp(timeLeft/30);
        this.timeOfDay = lerp(.01, this.timeOfDay, realTimeOfDay);
        if (testMakeThumbnail)
            this.timeOfDay = .8;

        // spawn pickups
        const w = getCameraSize().x/2+4;
        for(; this.trackSpawnedIndex < (cameraPos.x+w)*trackResolution; ++this.trackSpawnedIndex)
        {
            const p = track[this.trackSpawnedIndex];
            if (p && p.pickupType)
            {
                const x = this.trackSpawnedIndex/trackResolution;
                new Pickup(vec2(x,p.y), p.pickupType);
            }
        }

        this.spawnAtmosphere();
    }

    renderBackground()
    {
        const backgroundIsland = cameraPos.x/islandDistance-.5|0;
        {
            // island sky backgsround fade bands
            const backgroundSize = vec2(islandDistance, 2e3);
            const bandCount = 50;
            const pos = vec2();
            const color = rgb();
            for(let i=2; i--;)
            {
                const id = i + backgroundIsland;
                const island = getIslandI(id);
                const islandCenter = islandDistance*(id+.5);
                for(let j=bandCount; j--;)
                {
                    // draw 2 nearest islands only
                    // in place color lerp
                    const p1 = j/bandCount, p2 = 1-p1;
                    color.r = p1*island.backgroundColorTop.r + p2*island.backgroundColorBottom.r;
                    color.g = p1*island.backgroundColorTop.g + p2*island.backgroundColorBottom.g;
                    color.b = p1*island.backgroundColorTop.b + p2*island.backgroundColorBottom.b;
                    pos.x = islandCenter-j/4;
                    pos.y = j == bandCount-1 ? 0 : lerp(p1,1,15) - backgroundSize.y/2;
                    drawRect(pos, backgroundSize, color);
                }
            }
        }
        if (testMakeThumbnail == 2)
            return;
        {
            // sun
            const timeOfDay = this.timeOfDay;
            const w = getCameraSize().x/2+4;
            const sunSize = lerp(timeOfDay,2,1)*(2 + Math.sin(time*2)*.1);
            const sunPos = vec2(w*lerp(timeOfDay,-.5,.5),lerp(timeOfDay,-3,6));
            const sunHue = timeOfDay*.15;
            const sunRayBrightness = lerp(timeOfDay,.06,.03);
            setBlendMode(1)
            for(let i=0; i<8; i++)
            {
                drawRect(cameraPos.add(sunPos), vec2(sunSize), hsl(sunHue,.9,.5,.2), i*PI/8+time/9);
                drawRect(cameraPos.add(sunPos), vec2(.25,99).scale(sunSize), hsl(sunHue,.9,sunRayBrightness), i*PI/8+time/9);
            }
            // red overlay
            drawRect(cameraPos, vec2(1e3), hsl(0,1,(1-timeOfDay)*.5));
            setBlendMode();
        }

        if (!testMakeThumbnail)
        {
            // parallax mountains
            const bleed = 2; // to fix seams
            const parallaxMaxScale = .3;
            const parallaxHeight = parallaxTextureSize/parallaxTextureLayers;
            glSetTexture(parallaxTextureInfo.glTexture);
            for(let i=2; i--;)
            {
                // draw 2 nearest islands only
                const id = i + backgroundIsland;
                const island = getIslandI(id);
                const centerIslandDistance = islandDistance*(id+.5);
                const random = new RandomGenerator(island.seed);
                const sx = islandDistance*parallaxMaxScale;
                const sy = sx/parallaxTextureLayers;
                const parallaxPercentMin = .1;
                const parallaxPercentMax = .4;
                const maxK = 3;
                for(let j=0; j<parallaxTextureLayers; ++j)
                for(let k=maxK; k--;)
                {
                    // draw each parallax layer
                    const p = (j+1-k/maxK)/parallaxTextureLayers;
                    const parallaxPercent = lerp(p,parallaxPercentMax,parallaxPercentMin);
                    const color = hsl(island.hue + random.float(-.15,.15), 
                        .5+p/2,
                        random.float(.7,.9)-p*.1);
                    const kp = k/(maxK-1);
                    const layerOffset = lerp(kp,-1.9,1.9) +  
                        +(id||k?random.float(-.1,.1):-.3); // ensure start of island has background
                    const x = lerp(parallaxPercent, centerIslandDistance+layerOffset*sx/2, cameraPos.x);
                    const y = min(cameraPos.y,maxHeight/2) - max(p*cameraPos.y/2,0);
                    const textureIndex = random.int(parallaxTextureLayers);
                    const flip = random.sign();
                    const t = textureIndex*parallaxHeight;
                    parallaxTileInfo.pos.y = t+bleed;
                    parallaxTileInfo.size.y = parallaxHeight-bleed*2;
                    drawParallaxTile(x, y, flip * sx, sy, parallaxTileInfo, color);
                }
            }
        }
        {
            // water line
            const backgroundSize = vec2(islandDistance*islandCount*2, 2e3);
            const waterLevel =  min(cameraPos.y,maxHeight/2) - max(cameraPos.y/2,0);
            const pos = vec2(backgroundSize.x/2, waterLevel-backgroundSize.y/2);
            drawRect(pos, backgroundSize, hsl(.5,.8,.7));
            const random = new RandomGenerator(worldSeed);

            // water lines
            const baseline = pos.y + backgroundSize.y/2;
            const chunkSize = 100; // for max zoom
            for(let i=99;i--;)
            {
                if (i)
                {
                    // sparkly water
                    const lineSize = vec2(random.float(5,10), random.float(.03,.06));
                    const linePos = vec2(random.float(chunkSize), baseline);
                    linePos.x = cameraPos.x + mod(linePos.x - cameraPos.x, chunkSize) - chunkSize/2;
                    linePos.y -= random.float(8);
                    const b = random.float(.3,.7);
                    const color = rgb(1,1,1,b+Math.sin(time*5+linePos.x)*.3);
                    drawRect(linePos, lineSize, color);
                }
                else
                {
                    // leave one line at top
                    const lineSize = vec2(backgroundSize.x, .08);
                    const linePos = vec2(0, baseline);
                    lineSize.x = backgroundSize.x;
                    drawRect(linePos, lineSize, hsl(0,0,.9));
                }
            }
        }

        if (enhancedMode)
        if (gameMode == 0 && !gameContinued)
        if (!titleScreen && !gameOverTimer.isSet())
        if (saveData.bestDistanceClassic > 0)
        {
            // draw line where record is
            drawRect(vec2(saveData.bestDistanceClassic,0), vec2(.5,1e4), hsl(0,1,.5,.5));
        }
    }

    renderForeground()
    {
        // clouds
        const maxWindow = 99;
        const random = new RandomGenerator(worldSeed);
        for(let i=400; --i;)
        {
            // for each puff
            const speed = random.float(1,2);
            const ox = mod(random.float(maxWindow)-time*speed,maxWindow)-maxWindow/2;
            const p = vec2(player.pos.x+ox,maxHeight-Math.sin(i**3+time/9)**3-1);
            const b = random.float(.7,1)
            drawTile(p, vec2(1,.5).scale(random.float(1,4)), spriteAtlas.circle, rgb(b,b,b,random.float(.3,.5)), 0);
        }
    }

    render()
    {
        if (testMakeThumbnail == 2)
            return;

        // scenery
        const w = getCameraSize().x/2;
        for(let i=cameraPos.x-w-4|0; i<cameraPos.x+w+4; ++i)
        {
            const random = new RandomGenerator(worldSeed+i**3%1e7);
            if (random.float()>.2)
                continue;

            // cluster scenery in groups
            const count = random.int(1,4);
            for(let j=count; j--;)
            {
                const x = i + random.float(-2,2);
                const h = getGroundHeight(x);
                const pos = vec2(x,h);
                const island = getIsland(x);

                const n = getGroundNormal(x);
                const size = random.float(.5,1);
                let angle = n.angle();
                const hue = island.sceneryHue + random.float(-.1,.1);
                const color1 = hsl(hue,random.float(.5,.8),random.float(.3,.5));
                const color2 = GRAY;
                const type = island.sceneryType;

                if (type == 0) // bush
                {
                    angle += random.float(-.3,.3); // rotate a bit
                    const s = vec2(2,2.5);
                    const p = pos.add(vec2(0,size*.6).rotate(angle));
                    drawTile(p, s.scale(size),    spriteAtlas.circle, color2, angle);
                    drawTile(p, s.scale(size-.1), spriteAtlas.circle, color1, angle);
                }
                else if (type == 1) // box
                {
                    const s = vec2(random.float(1,2),random.float(1,2));
                    const p = pos.add(n.scale(size*s.y*.4));
                    drawTile(p, s.scale(size),    0, color2, angle);
                    drawTile(p, s.scale(size-.1), 0, color1, angle);
                }
                else if (type == 2) // triangle
                {
                    const s = vec2(random.float(1,2),2);
                    const p = pos.add(n.scale(size*s.y*.4));
                    drawTile(p, s.scale(size),    spriteAtlas.triangle, color2, angle);
                    drawTile(p, s.scale(size-.1), spriteAtlas.triangle, color1, angle);
                }
                else if (type == 3) // upside down triangle
                {
                    const s = vec2(random.float(1,2),2);
                    const p = pos.add(n.scale(size));
                    drawTile(p, s.scale(size),    spriteAtlas.triangle, color2, angle+PI);
                    drawTile(p, s.scale(size-.1), spriteAtlas.triangle, color1, angle+PI);
                }
                else if (type == 4) // tree
                {
                    angle += random.float(-.3,.3);  // rotate a bit
                    const s = vec2(2);
                    const p = pos.add(vec2(0,size*2).rotate(angle));
                    drawTile(p, s.scale(size),    spriteAtlas.circle, color2, angle);
                    drawTile(p, s.scale(size-.1), spriteAtlas.circle, color1, angle);
                    drawTile(pos, vec2(.2,4).scale(size), 0, color1, angle);
                }
            }
        }
        
        const drawStep = isTouchDevice ? .1 : .05; // less draw calls on mobile
        const sideDrawExtra = .5; // draw extra on sides
        const xStart = cameraPos.x - w - sideDrawExtra;
        const xEnd = cameraPos.x + w + sideDrawExtra;
        
        {
            // hills background
            const height = 15; // how tall to draw hills to cover bottom of screen
            const sx = drawStep+.05, sy = height;
            glSetTexture(colorBandTextureInfo.glTexture);
            for(let i=xStart/drawStep|0; i<xEnd/drawStep; ++i)
            {
                const x = i * drawStep;
                const h = getGroundHeight(x);
                const island = getIsland(x);

                // colored texture
                colorBandTileInfo.pos.x = island.textureHue;
                colorBandTileInfo.pos.y = x*island.hueTextureSlide;
                colorBandTileInfo.size.y = generativeTextureSize*island.hillWrapCount;
                drawColorBandTile(x, h-height/2, sx, sy, colorBandTileInfo);
                //drawTile(vec2(x,h-e/2), vec2(drawStep+.05,e));

                // shading
                const yOffset = -1;
                colorBandTileInfo.pos.x = 0.5;
                colorBandTileInfo.pos.y = 1;
                colorBandTileInfo.size.y = generativeTextureSize-1;
                drawColorBandTile(x, h-height/2 + yOffset, sx, sy, colorBandTileInfo);
            }
        }
        {
            // hills details
            const pos = vec2(), size = vec2(), color = rgb();
            const detailCount = 6;
            for(let i=xStart/drawStep|0; i<xEnd/drawStep; ++i)
            {
                const x = i * drawStep;
                const h = getGroundHeight(x);
                const random = new RandomGenerator(i*i+9);
                for(let j=detailCount; --j;)
                {
                    pos.x = x + random.float(-1,1)*drawStep/2;
                    pos.y = h - random.float(1)**3*10;
                    size.x = size.y = random.float(.1,.2);
                    color.a = random.float(.1,.2) + Math.sin(time*5+i+j)*.05; // sparkle
                    drawTile(pos, size, spriteAtlas.circle, color);
                }
            }
        }
        {
            // hills outline
            const outlineStep = isTouchDevice ? .4 : .2; // less draw calls on mobile
            const width = .2;
            let p = vec2(), s = vec2(width);
            for(let i=xStart/outlineStep|0; i<xEnd/outlineStep; ++i)
            {
                // get the points
                const x = i * outlineStep;
                const x2 = (i+1) * outlineStep;
                const y = getGroundHeight(x);
                const y2 = getGroundHeight(x2);
                const island = getIsland(x);
                const color = island.lineColor;

                // calculate length of line with mitered joints
                const dx = x - x2
                const dy = y - y2;
                const d = Math.hypot(dx, dy);
                const a = Math.atan2(dx, dy);
                p.x = (x+x2)/2; p.y = (y+y2)/2;
                s.y = d + Math.abs(width/2*Math.tan(a/2));
                drawRect(p, s, color, a);
                if (testLevelView) // camera bottom display
                    drawRect(vec2(x, getTrackPoint(x).bottom), vec2(width), BLACK);
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

function drawParallaxTile(x, y, sx, sy, tileInfo, color)
{
    // calculate uvs and render
    const sizeInverse = parallaxTextureInfo.sizeInverse;
    const u = tileInfo.pos.x * sizeInverse.x;
    const v = tileInfo.pos.y * sizeInverse.y;
    const w = tileInfo.size.x * sizeInverse.x;
    const h = tileInfo.size.y * sizeInverse.y;
    glDraw(x, y, sx, sy, 0, u, v, u+w, v+h, color.rgbaInt());
}

function drawColorBandTile(x, y, sx, sy, tileInfo)
{
    // calculate uvs and render
    const sizeInverse = colorBandTextureInfo.sizeInverse;
    const u = tileInfo.pos.x * sizeInverse.x;
    const v = tileInfo.pos.y * sizeInverse.y;
    const w = tileInfo.size.x * sizeInverse.x;
    const h = tileInfo.size.y * sizeInverse.y;
    glDraw(x, y, sx, sy, 0, u, v, u+w, v+h);
}