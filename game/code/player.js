'use strict';

///////////////////////////////////////////////////////////////////////////////

class Player extends EngineObject
{
    constructor(catType=0, isMenuCat)
    {
        super();
        //this.pos=vec2(510,-50);
        //this.pos.x = islandDistance*12.6

        this.setCatType(catType);
        this.renderOrder = 9;
        //this.velocity = vec2(.1,.1);
        this.airLegAngle = 
        this.legsAngle = 
        this.legsAngle2 = 
        this.legModePercent = 
        this.headAngle = 
        this.wasOnGround = 
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
        this.isMenuCat = isMenuCat;
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
        this.color = BLACK; // body
        this.color2 = BLACK; // les
        this.color3 = RED; // collar
        this.colorEye = YELLOW;
        this.eyeType = 0;
        this.tailLength = 70;
        this.tailWidth = .2;
        this.hasStripes = 0;
        this.tailStripeColor = 0;
        this.noseColor = hsl(0,1,.7); // pink
        this.noseScale = 1;

        const random = new RandomGenerator(13*type*type*1e3);
        this.meowPitch = random.float(.7,1.3);
        this.meowVolume = random.float(.8,1.1);

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
        // warm up tail
        for(let i=99;i--;)
            this.updateTail(i/99);
    }

    updateTail(t=time)
    {
        if (!this.tailLength)
            return;

        // wag tail
        this.tailPoints[0].y = Math.sin(this.pos.x+t*3+this.catType)*.1-.05;

        // update tail points
        for (let i=1; i<this.tailPoints.length; i++)
        {
            const d = .01;
            this.tailPoints[i] = this.tailPoints[i].add(this.tailVelocities[i]);
            const deltaPos = this.tailPoints[i].subtract(this.tailPoints[i-1]);
            this.tailPoints[i] = this.tailPoints[i-1].add(deltaPos.normalize(d));
            this.tailVelocities[i] = this.tailVelocities[i]
                .add(vec2(titleScreen?-noise1D(t+this.catType)*.02-.01:-.01,gravity))  // gravity 
                .subtract(this.velocity.scale(1))  // inertia
                .add( deltaPos.scale(-3)) // spring force
                .scale(.2); // damping
        }
    }

    update()
    {
        this.updateTail();

        if (this.meowTimer.elapsed())
        {
            this.meowTimer.unset();
            this.meow();
        }

        if (this.isMenuCat)
        {
            // special update for menu cat
            // random blink
            if (rand() < .004 && !this.blinkTimer.active())
                this.blinkTimer.set(.2);
                
            // head animation
            const headAngleTarget = Math.sin(this.pos.x*2)*.1;
            this.headAngle = lerp(.1, this.headAngle, headAngleTarget);
            return;
        }

        const h = getGroundHeight(this.pos.x)+.5;
        const n = getGroundNormal(this.pos.x);
        const heightAboveGround = this.pos.y - h;
        const isOnGround = heightAboveGround < 0;
        const gameOver = gameOverTimer.isSet();
        const hasWon = winTimer.isSet();
        const endBoost = this.endBoostTimer.active();
        const allowInput = !titleScreen && !gameOver && !hasWon && !endBoost && !testAutoplay;
        let isPushingDown = (mouseIsDown(0) || keyIsDown('Space')) && allowInput;

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

        if (isPushingDown)
            this.velocity.y -= .014;

        if (isOnGround)
        {
            // clamp to ground
            this.pos.y = h;
            const vN = n.scale(this.velocity.dot(n));
            this.velocity = this.velocity.subtract(vN);
            this.airTimer.set();

            if (mouseWasReleased(0) && allowInput)
            {
                // jump
                this.velocity.y += .1;
                this.blinkTimer.set(.2);

                sound_jump.play();
            }

            this.airMeowTimer.set(rand(.1,.3));
        }

        if (this.airMeowTimer.elapsed() && !this.meowStopTimer.active() && !isOnGround)
        {
            // meow in air
            this.meow();
            this.blinkTimer.set(.4);
            this.airMeowTimer.unset();
            this.meowStopTimer.set(rand(5,10));
        }

        let spawnParticles = hasWon;
        if (this.boostTimer.active() && allowInput || endBoost)
        {
            // apply boost
            this.velocity.x = max(this.velocity.x, .4);
            if (endBoost)
                this.velocity.y += .0025;
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
            for(let i=3; i--;)
            {
                const size = vec2(1)
                const angle = rand(9);
                const colorStart = hsl(rand(.15),1,rand(.5,1));
                const colorEnd =   hsl(rand(.15),1,rand(.5,1),0);
                const lifeTime = rand(.4,.5);
                const sizeStart = rand(.1,.3);
                const sizeEnd = rand(.1,.3);
                const additive = 1;
                const pos = this.pos.add(randInCircle(.5))
                const p = new SimpleParticle(pos, size, angle, colorStart, colorEnd, lifeTime, sizeStart, sizeEnd, additive);
                p.gravityScale = .2;
                p.velocity = randVector(.02);
            }
        }

        // clamp speed
        const minSpeed = tripMode? .2: .05;
        const maxSpeed = .6;
        const maxYSpeed = .6;
        this.velocity.x = clamp(this.velocity.x, minSpeed, maxSpeed);
        this.velocity.y = clamp(this.velocity.y, -maxYSpeed, gameOver? 0 : maxYSpeed);
        if (isOnGround)
            this.velocity.x *= .9999; // ground resistance

        if (titleScreen || gameOver)
            this.velocity.x = 0;
        if (hasWon)
        {
            // flying!
            const p1 = percent(winTimer,3,winTimeFlyAway);
            const p2 = percent(winTimer,0,3);
            this.velocity.x = lerp(p1, .1, .5);
            this.pos.y = lerp(p2, this.pos.y, 6 + noise1D(time/2)*2);
            this.gravityScale = 0;
        }

        // rotate to match velocity
        const isCloseToGround = heightAboveGround<.1;
        const isStill = this.velocity.length() < .01;
        const targetAngle = hasWon ? noise1D(time/2)*.2-.1 :
            isStill || titleScreen || gameOver? 0 : isPushingDown && !isCloseToGround ? 0 : this.velocity.angle() - PI/2;
        this.angle = lerp(.05, this.angle, targetAngle);

        // head animation
        const headAngleTarget = gameOver || titleScreen ? -noise1D(time/2)*.3+.1 : isPushingDown ? isOnGround ? Math.sin(this.pos.x*2)*.3 : -.1 : 0;
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
                ((this.airTimer<.1)&&!isStill?-.05:.1), 0, 1);
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
                this.velocity.y = 0,this.pos.y = mousePos.y
            if (keyIsDown('KeyX'))
                this.pos.x = this.pos.x+2;
            if (keyIsDown('KeyZ'))
                this.pos.x = this.pos.x-2;
            if (keyWasPressed('KeyN'))
                this.pos.x = ((activeIslandID+1)*islandDistance+20);
            if (mouseIsDown(2))
                this.velocity.x = 0; // brake ability for testing
        }

        super.update();

        // clamp y position after physics update
        this.pos.y = min(this.pos.y, maxHeight-playerSpaceAbove);
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
        const h = this.isMenuCat ? this.pos.y -.5: getGroundHeight(this.pos.x);
        const n = this.isMenuCat ? vec2(0,1) : getGroundNormal(this.pos.x);
        const OP = (ofset, pos=this.pos, angle=topAngle) => pos.add(ofset.rotate(angle));

        // shadow
        const shadowScale = clamp(1-(this.pos.y-h)/4,0,1);
        drawTile(vec2(this.pos.x,h-.1), vec2(1.7,.5).scale(shadowScale), spriteAtlas.circle, hsl(0,0,0,.3), n.angle());

        // tail
        const tail = OP(vec2(-.4,.2));
        if (!this.hasStripes)
        {
            for (let i=0; i<this.tailPoints.length; i++)
            {
                const c = color2.scale(.8);
                drawTile(OP(this.tailPoints[i],tail), vec2(this.tailWidth), spriteAtlas.circleSmall, c);
            }
        }
        for (let i=0; i<this.tailPoints.length; i++)
        {
            const c = this.tailStripeColor && i%20>10 ? this.tailStripeColor :
                color2.scale(!this.hasStripes || i%20>10 || .8);
            drawTile(OP(this.tailPoints[i],tail), vec2(this.tailWidth-.1*!this.hasStripes), spriteAtlas.circleSmall, c);
        }

        const legSprite = this.hasStripes ? spriteAtlas.legStriped : spriteAtlas.leg;
        const headSprite = this.hasStripes ? spriteAtlas.headStriped : spriteAtlas.head;
        const bodySprite = this.hasStripes ? spriteAtlas.bodyStriped : spriteAtlas.body;

        // far legs
        const leg1 = OP(vec2(.3,-.3));
        drawTile(leg1, vec2(1), legSprite, color2, topAngle-this.legsAngle);
        const leg2 = OP(vec2(-.3,-.3));
        drawTile(leg2, vec2(1), legSprite, color2, topAngle+this.legsAngle);

        // body
        drawTile(this.pos, vec2(1), bodySprite, color, topAngle); 

        // near legs
        const leg3 = OP(vec2(.4,-.3));
        drawTile(leg3, vec2(1), legSprite, color2, topAngle-this.legsAngle2);
        const leg4 = OP(vec2(-.2,-.3));
        drawTile(leg4, vec2(1), legSprite, color2, topAngle+this.legsAngle2);

        // head
        const headAngle = topAngle+this.headAngle;
        const collarPos = OP(vec2(.25,.2));
        drawTile(collarPos, vec2(.6), spriteAtlas.circle, color3, topAngle);
        const headPos = OP(vec2(.3,.3));
        drawTile(headPos, vec2(1), headSprite, color2, headAngle);

        // nose
        const nose = OP(vec2((.2-.05)/2,-.1), headPos,headAngle);
        const noseSize = vec2(.1,.06).scale(this.noseScale);
        if (this.noseScale)
            drawTile(nose, noseSize, spriteAtlas.circleSmall, this.noseColor, headAngle);
        
        // right eye
        const pupilLook = .03;
        const blinkScale = .5 + .5*Math.cos(this.blinkTimer.getPercent()*PI*2) ;
        const eye1 = OP(vec2(.2,.02), headPos,headAngle);
        const eyeFullSize = vec2(.2);
        const eyeSize = vec2(.2,.2*blinkScale);
        const eyePupil1 = OP(vec2(.2+pupilLook,.02), headPos,headAngle);
        const eyePupilSize = this.eyeType == 2? vec2(.05,.05*blinkScale)  : this.eyeType == 1? vec2(.08,.19*blinkScale) :  vec2(.13,.13*blinkScale);
        drawTile(eye1, eyeFullSize, spriteAtlas.circleSmall, color2, headAngle);
        drawTile(eye1, eyeSize, spriteAtlas.circleSmall, eyeColor, headAngle);
        drawTile(eyePupil1, eyePupilSize, spriteAtlas.circleSmall, BLACK, headAngle);

        // left eye
        const eye2 = OP(vec2(-.05,.02), headPos,headAngle);
        const eyeColor2 = this.catType == 7 ? YELLOW: eyeColor
        const eyePupil2 = OP(vec2(-.05+pupilLook,.02), headPos,headAngle);
        drawTile(eye2, eyeFullSize, spriteAtlas.circleSmall, color2, headAngle);
        drawTile(eye2, eyeSize, spriteAtlas.circleSmall, eyeColor2, headAngle);
        drawTile(eyePupil2, eyePupilSize, spriteAtlas.circleSmall, BLACK, headAngle);
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
            this.coinRunTimer.set(.4);
            sound_coin.playNote([0,2,4,7,12,14,16][this.coinRunCount%7]);
            ++this.coinRunCount;
            ++saveData.coins;
            writeSaveData();
        }
        else if (type == 3) // end of island boost
        {
            //sound_boost.play();
            this.endBoostTimer.set(2);
            this.velocity = vec2(.6)
        }
        else if (type == 4) // jump bubbles
        {
            sound_bubble.play();
            this.bubbleTimer.set(.1);
            if (this.velocity.y < 0)
                this.velocity.y = -.5*this.velocity.y;
        }
        else if (type == 5) // bad pickup, slow down
        {
            sound_gameOver.play(1,2);
            this.velocity = vec2();
        }
    }

    meow()
    {
        if (this.meowTimer.active())
            return;

        sound_meow.play(this.meowVolume, this.meowPitch);
        if (this.catType != 9 && this.meowCount++ < 1 && rand() < (this.catType == 11 ? .6:.3)) // double meow sometimes
            this.meowTimer.set(rand(.25,.4));
        else
            this.meowCount = 0;
    }
}
