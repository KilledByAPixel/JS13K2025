'use strict';

///////////////////////////////////////////////////////////////////////////////

class Player extends EngineObject
{
    constructor(catType=0, isMenuCat)
    {
        super();
        //this.pos=vec2(450,-23);
        //this.pos.x = islandDistance*12.6

        this.lastPosTail = vec2(); // must be before set cat
        this.setCatType(catType);
        this.renderOrder = 9;
        //this.velocity = vec2(.1,.1);
        this.airLegAngle = 
        this.legsAngle = 
        this.legsAngle2 = 
        this.legModePercent = 
        this.headAngle = 
        this.wasOnGround = 
        this.wasPushingDown = 
        this.coinRunCount = 0;
        this.airTimer = new Timer;
        this.blinkTimer = new Timer;
        this.airMeowTimer = new Timer;
        this.boostTimer = new Timer;
        this.meowStopTimer = new Timer(5); // prevent meow at start
        this.meowTimer = new Timer;
        this.coinRunTimer = new Timer;
        this.endBoostTimer = new Timer;
        this.bubbleTimer = new Timer;
        this.jumpTimer = new Timer;
        this.isMenuCat = isMenuCat;
        this.airTimer.set();
        this.meowCount = 0;
        
        /*this.trailParticles = new ParticleEmitter(
        vec2(), 0,      // emitPos, emitAngle
        .7, 0, 0, 0,      // emitSize, emitTime, emitRate, emiteCone
        spriteAtlas.circle, // tileIndex, tileSize
        new Color(1,1,1),   new Color(0,0,1),   // colorStartA, colorStartB
        new Color(0,0,0,0), new Color(0,0,1,0), // colorEndA, colorEndB
        .5, .2, .2, .1, .05, // time, sizeStart, sizeEnd, speed, angleSpeed
        .99, 1, .5, PI,      // damping, angleDamping, gravityScale, cone
        .05, .5, 1, 1,       // fadeRate, randomness, collide, additive
         1, 9 // random color linear, renderOrder
        );
        this.addChild(this.trailParticles, undefined, -PI/2);
        */
    }

    setCatType(type)
    {
        this.catType = type;

        // default appearance
        this.color = BLACK;  // body
        this.color2 = BLACK; // legs
        this.color3 = RED;   // collar
        this.colorEye = YELLOW;
        this.eyeType = 0;
        this.tailLength = 70;
        this.tailWidth = .2;
        this.hasStripes = 0;
        this.tailStripeColor = 0;
        this.noseColor = hsl(0,1,.7); // pink
        this.noseScale = 1;

        const random = new RandomGenerator((type+99)*3e3);
        this.meowPitch = random.float(.7,1.3);
        this.meowVolume = random.float(.8,1.1);
        this.size = vec2(this.drawPosScale = random.float(.8,1.1));

        if (type == 0)
        {
            // black (default)
            this.noseColor = BLACK;
        }
        else if (type == 1)
        {
            // gray
            this.color2 = this.color = GRAY;
            this.color3 = hsl(.6,1,.4);
            this.eyeType = 1;
            this.tailWidth = .15;
        }
        else if (type == 2)
        {
            // cream
            this.color2 = this.color = hsl(.1,1,.8);
            this.color3 = hsl(0,0,0,0);
            this.colorEye = YELLOW;
            this.hasStripes = 1;
            this.size = vec2(this.drawPosScale = .75);
        }
        else if (type == 3)
        {
            // white
            this.color2 = this.color = WHITE;
            this.color3 = hsl(.8,1,.8);
            this.colorEye = GREEN;
            this.eyeType = 1;
            this.tailLength = 50;
            this.tailWidth = .3;
        }
        else if (type == 4)
        {
            // white/black
            this.color = WHITE;
            this.color2 = BLACK;
            this.color3 = GREEN;
            this.noseColor = BLACK;
            this.colorEye = YELLOW;
            this.eyeType = 1;
            this.tailLength = 90;
            this.tailWidth = .2;
            this.tailStripeColor = WHITE;
        }
        else if (type == 5)
        {
            // red
            this.color2 = this.color = hsl(0,1,.6);
            this.color3 = BLACK;
            this.colorEye = WHITE;
            this.eyeType = 1;
            this.hasStripes = 1;
        }
        else if (type == 6)
        {
            // gray/black
            this.color = GRAY;
            this.color2 = BLACK;
            this.color3 = WHITE;
            this.noseColor = BLACK;
            this.colorEye = CYAN;
            this.eyeType = 1;
            this.tailLength = 30;
            this.tailWidth = .3;
            this.meowVolume = .4;
        }
        else if (type == 7)
        {
            // orange/black
            this.color = ORANGE;
            this.color2 = BLACK;
            this.color3 = hsl(0,0,0,0);
            this.colorEye = GREEN;
            this.eyeType = 1;
            this.tailLength = 50;
            this.hasStripes = 1;
        }
        else if (type == 8)
        {
            // orange stripe
            this.color2 = this.color = ORANGE;
            this.color3 = hsl(0,0,0,0);
            this.colorEye = WHITE;
            this.eyeType = 2;
            this.hasStripes = 1;
            this.drawPosScale = 1;
            this.size = vec2(1.2);
        }
        else if (type == 9)
        {
            // small tail
            this.color = BLACK;
            this.color2 = hsl(0,0,.3)
            this.color3 = hsl(0,0,0,0);
            this.colorEye = YELLOW;
            this.eyeType = 2;
            this.tailLength = 5;
            this.tailWidth = .35;
            this.noseScale = 1.5;
        }
        else if (type == 10)
        {
            // pink
            this.color2 = this.color = hsl(.9,1,.8);
            this.color3 = WHITE;
            this.colorEye = YELLOW;
            this.tailLength = 50;
            this.tailWidth = .5;
            this.tailStripeColor = WHITE;
            this.meowPitch = 1.5;
        }
        else if (type == 11)
        {
            // cheshire cat
            this.color2 = this.color = PURPLE;
            this.color3 = hsl(0,0,0,0);
            this.noseColor = BLACK;
            this.colorEye = YELLOW;
            this.eyeType = 1;
            this.tailWidth = .3;
            this.hasStripes = 1;
            this.meowPitch = .7;
        }
        else if (type == 12)
        {
            // evil
            this.color2 = this.color = hsl(0,0,.1);
            this.color3 = hsl(0,0,0,0);
            this.noseColor = BLACK;
            this.colorEye = RED;
            this.eyeType = 1;
            this.tailLength = 99;
            this.hasStripes = 0;
            this.tailStripeColor = BLACK;
            this.tailWidth = .25;
            this.meowPitch = .6;
        }

        // create tail
        this.tailPoints = [];
        this.tailVelocities = [];
        for(let i=0; i<this.tailLength; i++)
        {
            this.tailPoints[i] = vec2(-i*.01,0);
            this.tailVelocities[i] = vec2();
        }
    }

    update()
    {
        {
            const t = time;
            if (!this.tailLength)
                return;

            // wag tail
            this.tailPoints[0].y = Math.sin(this.pos.x+t*3+this.catType)*.1-.05;

            let velocity = this.pos.subtract(this.lastPosTail);
            if (this.isMenuCat)
                velocity = vec2(.02,0);
            this.lastPosTail = this.pos.copy();

            // update tail points
            for (let i=1; i<this.tailPoints.length; i++)
            {
                const d = .01;
                this.tailPoints[i] = this.tailPoints[i].add(this.tailVelocities[i]);
                const deltaPos = this.tailPoints[i].subtract(this.tailPoints[i-1]);
                this.tailPoints[i] = this.tailPoints[i-1].add(deltaPos.normalize(d));
                this.tailVelocities[i] = this.tailVelocities[i]
                    .add(vec2(-.01,gravity))  // gravity 
                    .subtract(velocity)  // inertia
                    .add(deltaPos.scale(-3)) // spring force
                    .scale(.2); // damping
            }
        }

        if (this.meowTimer.elapsed())
        {
            this.meowTimer.unset();
            this.meow();
        }

        if (this.isMenuCat)
        {
            // special update for menu cat
            // random blink
            if (rand() < .003 && !this.blinkTimer.active())
                this.blinkTimer.set(.2);
                
            // head animation
            const headAngleTarget = noise1D(time+this.catType*1e7)*.2-.1;
            this.headAngle = lerp(.1, this.headAngle, headAngleTarget);
            return;
        }

        super.update();

        const h = getGroundHeight(this.pos.x) + this.size.y/2;
        const n = getGroundNormal(this.pos.x);
        const heightAboveGround = this.pos.y - h;
        const isOnGround = heightAboveGround < 0;
        const gameOver = gameOverTimer.isSet();
        const hasWon = winTimer.isSet();
        const endBoost = this.endBoostTimer.active();
        const allowInput = !titleScreen && !gameOver && !hasWon && !endBoost && !testAutoplay;

        let isPushingDown = (mouseIsDown(0) || keyIsDown('Space') || enhancedMode && keyIsDown('ArrowDown')) && allowInput;
        if (testAutoplay && !endBoost)
        {
            // todo: predict ground location
            const n2 = getGroundNormal(this.pos.x+this.pos.y/4);
            if (n2.x > 0 && heightAboveGround < .1 ||
                n2.x > 0 && this.velocity.y < 0 && heightAboveGround < 2)
                isPushingDown= 1;
            //console.log(this.pos.y);
            //this.velocity.x *= .9999;
            this.velocity.x += .0005;
        }

        // detect button release
        const releasedPushingDown = !isPushingDown && this.wasPushingDown && (allowInput||testAutoplay);
        this.wasPushingDown = isPushingDown;
        if (isPushingDown)
        {
            // dive down
            this.velocity.y -= .014;
            this.jumpTimer.unset();
        }

        if (isOnGround)
        {
            // clamp to ground
            this.pos.y = h;
            const vN = n.scale(this.velocity.dot(n));
            this.velocity = this.velocity.subtract(vN);
            this.airTimer.set();
            this.airMeowTimer.set(rand(.1,.3));

            if (releasedPushingDown)
            {
                // jump
                this.velocity.y += .1;
                this.blinkTimer.set(.2);
                sound_jump.play();
            }
        }

        if (releasedPushingDown )
            this.jumpTimer.set(.5); // always set jump timer on release

        if (this.airMeowTimer.elapsed() && !this.meowStopTimer.active() && !isOnGround)
        {
            // meow in air
            this.meow();
            this.blinkTimer.set(.4);
            this.airMeowTimer.unset();
            this.meowStopTimer.set(rand(5,10));
        }

        let spawnParticles = hasWon;
        if (this.boostTimer.active() && (allowInput||testAutoplay) || endBoost)
        {
            // apply boost
            this.velocity.x = max(this.velocity.x + .001, .4);
            if (endBoost)
                this.velocity.y += .003;
            spawnParticles = 1;
        }
        if (this.bubbleTimer.active())
        {
            this.velocity.x += .005;
            this.velocity.y = max(this.velocity.y+.02, .03);
        }

        if (spawnParticles)
        {
            // spawn particles
            for(let i=6; i--;)
            {
                const angle = rand(9);
                const evilParticles = this.catType == 12;
                const rainbowParticles = this.catType == 10;
                const colorStart = evilParticles ? BLACK : hsl(rand(rainbowParticles ? 1 : .15),1,rand(.4,.8));
                const colorEnd = evilParticles ? hsl(0,0,0,0) : hsl(rand(.15),1,rand(.5,1),0);
                const lifeTime = rand(.4,.5);
                const sizeStart = rand(.1,.3);
                const sizeEnd = rand(.1,.3);
                const additive = !evilParticles;
                const pos = this.pos.add(randInCircle(this.size.y/2))
                const p = new SimpleParticle(pos, angle, colorStart, colorEnd, lifeTime, sizeStart, sizeEnd, additive);
                p.gravityScale = .2;
                p.velocity = randVector(.02);
            }
        }

        // clamp speed
        const minSpeed = .1;
        const maxSpeed = .6;
        const maxYSpeed = .6;
        this.velocity.x = clamp(this.velocity.x, minSpeed, maxSpeed);
        this.velocity.y = clamp(this.velocity.y, -maxYSpeed, gameOver? 0 : maxYSpeed);
        if (isOnGround)
            this.velocity.x *= .9999; // ground resistance

        const noisePos = enhancedMode ? time/2+1e5 : time/2;
        if (titleScreen || gameOver)
            this.velocity.x = 0;
        if (hasWon)
        {
            // cats can fly
            const p1 = percent(winTimer,3,winTimeFlyAway);
            const p2 = percent(winTimer,0,3);
            this.velocity.x = lerp(p1, .1, .5);
            this.pos.y = lerp(p2, this.pos.y, 9 + noise1D(noisePos)*2);
            this.gravityScale = 0;
        }

        // rotate to match velocity
        const isCloseToGround = this.airTimer<.15;
        const isStill = this.velocity.length() < .01;
        const endFlips = this.catType == 6;
        const targetAngle = hasWon ? endFlips ? winTimer*9 :noise1D(noisePos)*.2-.1 :
            isStill || titleScreen || gameOver? 0 : isPushingDown && !isCloseToGround ? 0 : this.velocity.angle() - PI/2;
        this.angle = lerp(.1, this.angle, targetAngle, 2*PI);

        // head animation
        const headAngleTarget = gameOver || titleScreen ? -noise1D(noisePos)*.3+.1 : 
            isOnGround ? Math.sin(this.pos.x*2)*.3 : // ground head
            isPushingDown ? .3 : 0; // air head
        
       // isPushingDown ? isOnGround ? -.3 : .3 : Math.sin(this.pos.x*2)*.3;
        this.headAngle = lerp(.1, this.headAngle, headAngleTarget);

        // legs animation
        if (titleScreen || gameOver)
        {
            // special update for start/end
            this.legsAngle = lerp(.05, this.legsAngle, .1);
            this.legsAngle2 = lerp(.05, this.legsAngle2, .1);
        }
        else
        {
            this.legModePercent = clamp(this.legModePercent + 
                (isCloseToGround && !this.jumpTimer.active() &&!isStill?-.05:.1), 0, 1);
            this.airLegAngle = lerp(.2, this.airLegAngle, isPushingDown||isStill ? .3: 1.3);
            this.legsAngle = lerp(this.legModePercent, Math.sin(this.pos.x*2)+.3, this.airLegAngle);
            this.legsAngle2 = lerp(this.legModePercent, Math.cos(this.pos.x*2)+.3, this.airLegAngle);
        }

        // random blink
        if ((rand() < (titleScreen||gameOver?.005:.002) || isOnGround && !this.wasOnGround) && !this.blinkTimer.active())
            this.blinkTimer.set(.2);

        if (debug)
        {
            // debug controls
            if (mouseIsDown(1))
                this.velocity.y = 0,this.pos.y = mousePos.y;
            if (keyIsDown('KeyX'))
                this.pos.x = this.pos.x+2;
            if (keyIsDown('KeyZ'))
                this.pos.x = this.pos.x-2;
            if (keyWasPressed('KeyN'))
            {
                ++boostIslandID; // prevent boost islands
                this.pos.x = ((activeIslandID+1)*islandDistance+20);
            }
            if (mouseIsDown(2))
                this.velocity.x = 0; // brake ability for testing
        }

        // clamp y position
        if (this.pos.y > maxHeight-playerSpaceAbove)
        {
            this.pos.y = maxHeight-playerSpaceAbove;
            this.velocity.y = 0
        }
        this.wasOnGround = isOnGround;
    }

    render()
    {
        if (this.isMenuCat)
            return; // do not do normal render

        this.renderHack();
    }

    renderHack()
    {
        const color = this.color;
        const color2 = this.color2;
        const color3 = this.color3;
        const eyeColor = this.colorEye;
        const topAngle = this.angle;
        const h = this.isMenuCat  || testMakeThumbnail==2? this.pos.y -this.size.y/2: getGroundHeight(this.pos.x);
        const n = this.isMenuCat  || testMakeThumbnail==2? vec2(0,1) : getGroundNormal(this.pos.x);
        const scale = this.size.y;
        const posScale = this.drawPosScale;
        const OP = (offset, pos=this.pos, angle=topAngle) => pos.add(offset.scale(posScale).rotate(angle));
        const drawScaleTile = (pos, size, tileInfo, color, angle) =>
        { drawTile(pos, size.scale(scale), tileInfo, color, angle); }

        // shadow
        const shadowScale = clamp(1-(this.pos.y-h)/4,0,1);
        drawScaleTile(vec2(this.pos.x,h-.1), vec2(1.7,.5).scale(shadowScale), spriteAtlas.circle, hsl(0,0,0,.3), n.angle());

        // tail
        const tail = OP(vec2(-.4,.2));
        if (!this.hasStripes)
        {
            for (let i=0; i<this.tailPoints.length; i++)
            {
                const c = color2.scale(.8);
                drawScaleTile(OP(this.tailPoints[i],tail), vec2(this.tailWidth), spriteAtlas.circleSmall, c);
            }
        }
        for (let i=0; i<this.tailPoints.length; i++)
        {
            const c = this.tailStripeColor && i%20>10 ? this.tailStripeColor :
                color2.scale(!this.hasStripes || i%20>10 || .8);
            drawScaleTile(OP(this.tailPoints[i],tail), vec2(this.tailWidth-.1*!this.hasStripes), spriteAtlas.circleSmall, c);
        }

        const legSprite = this.hasStripes ? spriteAtlas.legStriped : spriteAtlas.leg;
        const headSprite = this.hasStripes ? spriteAtlas.headStriped : spriteAtlas.head;
        const bodySprite = this.hasStripes ? spriteAtlas.bodyStriped : spriteAtlas.body;

        // far legs
        const leg3 = OP(vec2(.4,-.2));
        drawScaleTile(leg3, vec2(1), legSprite, color2, topAngle-this.legsAngle2);
        const leg4 = OP(vec2(-.2,-.2));
        drawScaleTile(leg4, vec2(1), legSprite, color2, topAngle+this.legsAngle2);

        // body
        drawScaleTile(this.pos, vec2(1), bodySprite, color, topAngle);

        // near legs
        const leg1 = OP(vec2(.3,-.3));
        drawScaleTile(leg1, vec2(1), legSprite, color2, topAngle-this.legsAngle);
        const leg2 = OP(vec2(-.3,-.3));
        drawScaleTile(leg2, vec2(1), legSprite, color2, topAngle+this.legsAngle);

        // head
        const headAngle = topAngle+this.headAngle;
        const collarPos = OP(vec2(.25,.2));
        drawScaleTile(collarPos, vec2(.6), spriteAtlas.circle, color3, topAngle);
        const headPos = OP(vec2(.3,.3));
        drawScaleTile(headPos, vec2(1), headSprite, color2, headAngle);

        // nose
        const nose = OP(vec2((.2-.05)/2,-.1), headPos,headAngle);
        const noseSize = vec2(.1,.06).scale(this.noseScale);
        if (this.noseScale)
            drawScaleTile(nose, noseSize, spriteAtlas.circleSmall, this.noseColor, headAngle);
        
        // right eye
        const pupilLook = .03;
        const blinkScale = .5 + .5*Math.cos(this.blinkTimer.getPercent()*PI*2) ;
        const eye1 = OP(vec2(.2,.02), headPos,headAngle);
        const eyeFullSize = vec2(.2);
        const eyeSize = vec2(.2,.2*blinkScale);
        const eyePupil1 = OP(vec2(.2+pupilLook,.02), headPos,headAngle);
        const eyePupilSize = this.eyeType == 2? vec2(.05,.05*blinkScale)  : this.eyeType == 1? vec2(.08,.19*blinkScale) :  vec2(.13,.13*blinkScale);
        drawScaleTile(eye1, eyeFullSize, spriteAtlas.circleSmall, color2, headAngle);
        drawScaleTile(eye1, eyeSize, spriteAtlas.circleSmall, eyeColor, headAngle);
        drawScaleTile(eyePupil1, eyePupilSize, spriteAtlas.circleSmall, BLACK, headAngle);

        // left eye
        const eye2 = OP(vec2(-.05,.02), headPos,headAngle);
        const eyeColor2 = this.catType == 7 ? YELLOW: eyeColor
        const eyePupil2 = OP(vec2(-.05+pupilLook,.02), headPos,headAngle);
        drawScaleTile(eye2, eyeFullSize, spriteAtlas.circleSmall, color2, headAngle);
        drawScaleTile(eye2, eyeSize, spriteAtlas.circleSmall, eyeColor2, headAngle);
        drawScaleTile(eyePupil2, eyePupilSize, spriteAtlas.circleSmall, BLACK, headAngle);
    }
    
    endIslandBoost()
    {
        sound_jump.play(1, .5);
        this.endBoostTimer.set(2);
        this.velocity = vec2(.6)
    }

    pickup(type)
    {
        const gameOver = gameOverTimer.isSet();
        if (gameOver)
            return;

        if (type == 1) // boost
        {
            sound_boost.play();
            this.boostTimer.set(1.5);
        }
        else if (type == 2) // coin
        {
            if (this.coinRunTimer.elapsed())
                this.coinRunCount = 0;
            this.coinRunTimer.set(.5);
            sound_coin.playNote(this.coinRunCount);
            ++this.coinRunCount;
            ++saveData.coins;
            writeSaveData();
        }
        else if (type == 4) // jump bubbles
        {
            sound_bubble.play();
            this.bubbleTimer.set(.1);
            if (this.velocity.y < 0)
                this.velocity.y = -.5*this.velocity.y;
        }
    }

    meow()
    {
        if (this.meowTimer.active())
            return;

        const sound = rand() < .5 || this.catType == 6 ? sound_meow : sound_meow2;
        sound.play(this.meowVolume, this.meowPitch);
        //sounds_cat[this.catType].play();

        if (this.catType != 9 && this.meowCount++ < 1 && rand() < (this.catType == 11 ? .6:.3)) // double meow sometimes
            this.meowTimer.set(rand(.25,.4));
        else
            this.meowCount = 0;
    }
}
