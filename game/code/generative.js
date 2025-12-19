'use strict';

const generativeTextureSize = 256;
const parallaxTextureSize = 2048;
const parallaxTextureLayers = 4;
let debugGenerativeCanvas;
let parallexCanvas, colorBandCanvas, parallexWorkCanvas;
const parallaxTileInfo = new TileInfo(vec2(),vec2(parallaxTextureSize));
const colorBandTileInfo = new TileInfo(vec2(),vec2(.1));

const islandCount = 13;
const catCount = 13;
const trackResolution = 5; // points per unit distance

// end of island ramp settings
const islandEndRampFade = 60;  // how much to fade into the ramp
const islandEndRampUp = 140;   // how long to go before the ramp
const islandEndGap = 160;      // where the gap starts
const islandEndRamp = 230;     // total length of end ramp including gap
const islandDistance = 600;    // length of each island
const islandEndDownSlope = .4; // down slope of end ramp

///////////////////////////////////////////////////////////////////////////////

class TrackPoint
{
    constructor(y, bottom)
    {
        this.y = y;
        this.bottom = bottom; // bottom of level for camera
        this.pickupType = 0;  // Math.random()<.1? 1 : 0;
    }
}

///////////////////////////////////////////////////////////////////////////////

class Island
{
    constructor(id, random)
    {
        this.id = id;
        this.seed = random.int(1e6);
        this.hue = random.float();
        this.textureHue = ((this.hue*generativeTextureSize|0) || 1) + .5;
        this.hillWrapCount = random.float(-9,9);
        this.hueTextureSlide = random.float() < .2 && abs(this.hillWrapCount) > 3? 0 : random.floatSign(5,99);
        this.sceneryType = random.int(5);
        this.sceneryHue = this.hue + random.floatSign(.1,.2);

        const difficulty = percent(id, 0, islandCount-1);
        this.waveRate1 = random.float(.3,.4) + difficulty * random.float(-.05,.05);
        this.waveScale1 = random.float(1.5,2) + difficulty*random.float(-.2,.2);
        this.waveRate2 = .05 + difficulty * random.float(.1,.3);
        this.waveScale2 = .3 + difficulty * random.float(.5,1);
        this.noiseScale = .5 + difficulty * random.float(.5,1.5);
        this.noiseRate = .005 + difficulty * random.float(.02,.04);
        this.lineColor = hsl(this.hue + random.floatSign(.1,.3),.2,.2);
        this.dunes = id%(islandCount-1) > 2 && random.float() < .4; // some sand dunes (not at start or end)

        const backgroundHue = this.hue + random.float(.2,.8); // not the same as main hue
        this.backgroundColorTop    = hsl(backgroundHue, random.float(.2,.5),.5);
        this.backgroundColorBottom = hsl(backgroundHue + random.floatSign(.1,.3), random.float(.4,.8),.9);
    }
}

///////////////////////////////////////////////////////////////////////////////

function generativeInit()
{
    parallexCanvas = new OffscreenCanvas(parallaxTextureSize, parallaxTextureSize);
    colorBandCanvas = new OffscreenCanvas(generativeTextureSize, generativeTextureSize);
    parallexWorkCanvas = new OffscreenCanvas(2, parallaxTextureSize);
}

function generateWorld()
{
    const random = new RandomGenerator(worldSeed);
    const islandFadeIn = 15;

    // create islands
    islands = [];
    for(let i=0; i<islandCount; ++i)
    {
        const island = new Island(i, random);
        islands.push(island);
    }

    // create track
    const trackLength = islandDistance*islandCount*trackResolution;
    const wavePos1 = 0;
    const wavePos2 = random.float(1e4,1e6);
    const noisePos = random.float(1e4,1e6);
    let rampEndBottom = 0;
    track = [];

    for (let i=0; i<trackLength; i++)
    {
        const minGroundHeight = 1;
        const x = i / trackResolution;
        const island = getIsland(x); 
        const islandX = x % islandDistance;
        let y = minGroundHeight;

        // get island settings
        const dunes = island.dunes;
        const r1 = island.waveRate1/(dunes?2:1);
        const s1 = island.waveScale1*(dunes?2:1);
        const r2 = island.waveRate2/(dunes?2:1);
        const s2 = island.waveScale2*(dunes?2:1);
        let waveHeight =
           s1*Math.sin(wavePos1 + i*r1/trackResolution) +
           s2*Math.sin(wavePos2 + i*r2/trackResolution)
        if (dunes)
            waveHeight = -Math.abs(waveHeight); // make dunes
        y += waveHeight + s1 + s2;

        // apply noise
        const noiseScale = island.noiseScale;
        const noiseRate = island.noiseRate;
        y += noiseScale*noise1D(noisePos + i*noiseRate);

        // start ramp
        const startArea = 50;
        if (testMakeThumbnail)
        {
            y = y / 2 + 1
        }
        else if (i < startArea)
        {
            const p = smoothStep(1-i/startArea);
            y = lerp(p,y,6);
        }

        let cameraY = 0;
        if (testNoRamps)
        {
            track[i] = new TrackPoint(y, 0);
            continue;
        }

        // check if end of island
        const belowRampHeight = -80;
        if (islandX > islandDistance-islandEndRamp)
        {
            // har far we are in the ramp
            const rampDistance = islandX - (islandDistance-islandEndRamp);
            let rampY = -rampDistance*islandEndDownSlope;
            let rampBumps = Math.sin(rampDistance/2)/2;
            cameraY = rampY; // no bumps on camera

            const p3 = smoothStep(1-percent(rampDistance, 0, islandEndRampUp)**4);
            rampY += p3 * rampBumps;

            if (rampDistance > islandEndRampUp)
            {
                // the ramp part of the jump
                const p = percent(rampDistance, islandEndRampUp, islandEndGap);
                const ramp = p**2*13;
                rampY += ramp
                cameraY += ramp;
            }

            // fade into the ramp
            const cameraBelowRampHeight = -5;
            const rampFade = smoothStep(percent(rampDistance, 0, islandEndRampFade));
            y = lerp(rampFade, y, rampY);
            cameraY = lerp(rampFade, 0, cameraY+cameraBelowRampHeight);

            if (rampDistance > islandEndGap)
            {
                const islandEndGapFade= 9;
                const p = percent(rampDistance, islandEndGap, islandEndGap+islandEndGapFade); // fade down into the gap
                y = lerp(smoothStep(p), y, belowRampHeight);

                // fade camera back to normal the gap part of the jump
                const p2 = percent(rampDistance, islandEndGap, islandEndRamp);
                cameraY = lerp(p2, rampEndBottom, 0);

            }
            else
                rampEndBottom = cameraY;
        }
        else
            rampEndBottom = 0;

        if (islandX < islandFadeIn && island.id > 0)
        {
            const p = smoothStep(percent(islandX, 0, islandFadeIn));
            y = lerp(p, belowRampHeight, y);
        }

        track[i] = new TrackPoint(y, cameraY);
    }

    // set pickup locations
    const bubbleIsland = random.int(5,11);// one island will have jump bubbles
    const extraPickupIsland = random.int(3,9);// one island will have more pickups
    let lastPickup = 0;
    let lastPickupWasBoost;
    for (let i=1; i<trackLength-1; i++)
    {
        const trackPoint = track[i];
        const x = i / trackResolution;
        const islandX = x % islandDistance;
        const island = getIsland(x);

        if (trackPoint.pickupType)
            continue; // already a pickup here

        if (islandX < islandFadeIn+20 && !testPickups)
            continue; // start of new island
                
        if (islandX > islandDistance-islandEndRamp)
        {
            const startSpace = 20;
            const moreCoins = 20;
            if (islandX > islandDistance-islandEndRamp + startSpace)
            if (islandX < islandDistance-islandEndRamp + islandEndGap)
            if (i%10==0 && (Math.sin(i/13)>0 || islandX > islandDistance-islandEndRamp + islandEndGap - moreCoins))
                trackPoint.pickupType = 2; // groups of coins on ramp
            continue; // end ramp, make special pickups
        }

        const bubblePickups = island.id == bubbleIsland;
        const extraPickups = island.id == extraPickupIsland;
        const firstIsland = !island.id;
        const finalIsland = island.id == islandCount-1;
        if (bubblePickups && i%18==0 && random.float() < .8)
        {
            // make bubble
            trackPoint.pickupType = 4;
        }

        // check if slope is changing from down to up
        const slope = (trackPoint.y > track[i-1].y) - (track[i+1].y > trackPoint.y);
        if (slope < 0 && (i - lastPickup > 150 || testPickups))
        if (!trackPoint.pickupType) // not already a pickup here
        if (random.float() < (firstIsland?.5:.8)  || extraPickups || testPickups) // chance of pickup
        {
            // what type of pickup?
            if (!bubblePickups && // no boost on bubble island
                !lastPickupWasBoost && // prevent 2 boosts in a row
                (random.float() < .8 + finalIsland) && // more boosts on final island
                islandX < islandDistance-islandEndRamp-20) // dont put boosts near ramp
            {
                // boost
                trackPoint.pickupType = 1;
                lastPickup = i;
                lastPickupWasBoost = 1;
            }
            else
            {
                // coins
                lastPickup = i;
                lastPickupWasBoost = 0;

                // add coins in front and behind
                const count = random.int(1,5)+finalIsland+extraPickups;
                const spacing = 7;
                for(let j=-count; j<=count; j++)
                {
                    let k = i+j*spacing;
                    if (k>0 && k<trackLength)
                        track[k].pickupType = 2;
                }
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

function generateParallaxTexture()
{
    const canvas = parallexCanvas;
    const context = canvas.getContext('2d');
    const canvas2 = parallexWorkCanvas;
    const context2 = canvas2.getContext('2d');
    const w = parallaxTextureSize;
    const h = w/parallaxTextureLayers|0;
    const random = new RandomGenerator(worldSeed);

    // clear canvas
    canvas.width += 0;

    if (debug && debugGenerativeCanvas == 2)
    {
        context.fillStyle = RED;
        context.fillRect(0,0,w,w);
    }
    
    for(let j=parallaxTextureLayers; j--;)
    {
        // get random settings
        const o = j*h;
        const r1 = random.float(.1,.2);
        const s1 = random.float(3,6);
        const r2 = random.float(.05,.01);
        const s2 = random.float(3,6);
        const wavePos1 = random.float(1e4);
        const wavePos2 = random.float(1e4);
        const noiseScale = random.float(30,60);
        const noiseRate = random.float(.005,.02);
        const noisePos = random.float(1e4,1e6);
        const bandNoiseRate = random.float(20, 50);
        const textureSlide = random.floatSign(.2,.6);
        const bandBaseHue = random.float();

        {
            // draw gradients to work textures
            canvas2.width += 0; // clear canvas
            let bandSize = 0, bandBright, bandHue, bandSat;
            for(let i=w; i--;)
            {
                if (bandSize-- < 0)
                {
                    bandSize = random.int(3, 15);
                    bandBright = random.float(.7,1);
                    bandHue = bandBaseHue + random.float(-.2,.2);
                    bandSat = random.float() > .2 ? 0 : random.float(.8);
                }

                context2.fillStyle = hsl(bandHue,bandSat,bandBright);
                context2.fillRect(0, i, 1, 1);
                
                // outline on top and fade to black towards bottom
                const outline = 32, b = .5;
                context2.fillStyle = i < outline ? hsl(0,0,b,percent(i,outline,0)) : hsl(0,0,0,percent(i,outline,w));
                context2.fillRect(1, i, 1, 1);
            }
        }

        // draw the layer
        for(let i=w; i--;)
        {
            let y = h/2;
            y += s1+s1*Math.sin(wavePos1 + i*r1);
            y += s2+s2*Math.sin(wavePos2 + i*r2);
            y += noiseScale*(noise1D(noisePos+i*noiseRate)*2-1);
            y = clamp(y, 0, h);

            // fade down at edges
            const edgeFade = 200;
            if (i < edgeFade)
                y *= smoothStep(i/edgeFade);
            if (i > w-edgeFade)
                y *= smoothStep((w-i)/edgeFade);

            // color bands
            const textureHeight = 128;
            const textureOffset = textureSlide < 0 && 2e3-textureHeight;
            const n = noise1D(i/w*bandNoiseRate)*40-20;
            context.drawImage(canvas2, 0, i*textureSlide  + n + textureOffset, 1, textureHeight,  i,o+h-y-1,1,y);
        
            // fade to black on bottom
            context.drawImage(canvas2, 1, 0, 1, w, i, o+h-y-1, 1, y);

            //context.fillStyle = hsl(i/w,1,.5,.5); //test
            //context.fillRect(i,0,1,h);
            //context.fillStyle= RED;
            //context.fillRect(w/2,0,2,h);
        }
    }

    // create texture info
    if (parallaxTextureInfo)
        glSetTextureData(parallaxTextureInfo.glTexture, canvas);
    else
        parallaxTextureInfo = new TextureInfo(canvas);
}

function generateColorBandTexture()
{
    const canvas = colorBandCanvas;
    const context = canvas.getContext('2d');
    const w = generativeTextureSize;
    const gradientAlpha = .8;

    // clear canvas
    canvas.width += 0;

    // create an array of hue bands
    const random = new RandomGenerator(worldSeed);
    const minBand = w/8;
    for(let i=w;i--;)
    {
        const hueVariance = random.float()**2;
        const satVariance = random.float()**2;
        const litVariance = random.float(.1,1);

        // first band is an alpha gradient
        let band = w * (random.float()<.3 ? random.float(.25,.6) : .5);
        let h=i/w, s=1, l=.5
        for(let j=w; j--;)
        {
            context.fillStyle = i ? hsl(h,s,l) :
                hsl(0,0,0,(1-(1-j/w)**3)*gradientAlpha);
            context.fillRect(i,j,1,1);

            if (--band < 0 && j > minBand)
            {
               // new hsl hue band
               h =  i/w + random.float(-hueVariance,hueVariance);
               s = 1 - random.float(satVariance);
               l = .5 + random.float(litVariance);
               band = random.float(minBand, w/2);
            }
        }
    }

    // create texture info
    if (colorBandTextureInfo)
        glSetTextureData(colorBandTextureInfo.glTexture, canvas);
    else
        colorBandTextureInfo = new TextureInfo(canvas);
}

///////////////////////////////////////////////////////////////////////////////

function getIslandI(i) { return islands[clamp(i|0, 0, islandCount-1)]; }
function getIsland(x) { return getIslandI(x/islandDistance); }
function getTrackPoint(x) { return track[clamp(x*trackResolution|0,0,track.length-1)]; }

function getGroundHeightI(i)
{
    let ground = track[clamp(i|0,0,track.length-1)].y;
    if (i > (islandCount-1)*islandDistance*trackResolution)
        ground += (Math.sin(i/19-time*2)+1)/2; // final island movement
    return ground;
}

function getGroundHeight(x)
{
    const i = x*trackResolution;
    const h1 = getGroundHeightI(i);
    const h2 = getGroundHeightI(i+1);
    return lerp(i%1, h1, h2);
}

function getGroundNormal(x)
{
    const e = .05;
    const h1 = getGroundHeight(x+e);
    const h2 = getGroundHeight(x-e);
    const slope = (h2 - h1)/e/2;
    return vec2(slope, 1).normalize();
}

function hash1D(x)
{
    const random = new RandomGenerator((x|0)**2||1);
    return random.float();
}

function noise1D(x)
{
    return lerp(smoothStep(mod(x,1)), hash1D(x), hash1D(x+1));
}