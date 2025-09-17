'use strict';

class WorldObject extends EngineObject
{
    constructor(pos, size, tileInfo, angle, color, renderOrder)
    {
        super(pos, size, tileInfo, angle, color, renderOrder);
    }

    update()
    {
        super.update();
        if (this.pos.x < cameraPos.x - getCameraSize().x/2-10)
            this.destroy(); // if it goes too far behind the player
    }
}

///////////////////////////////////////////////////////////////////////////////

class Pickup extends WorldObject
{
    constructor(pos, type=0)
    {
        const size = vec2(type == 4 ? rand(1.3,1.5) : type == 1 ? 1 : rand(1,1.2));
        const tileInfo = spriteAtlas.circle;
        super(pos, size, tileInfo, 0, WHITE, 5);

        this.type = type;
        this.gravityScale = 0;
        this.spinSpeed = type == 1 ? 1 : rand(.5,1)*randSign();
        this.color1 = type == 1 ? hsl(.15,1,.6,.5) : hsl(rand(.6,.7),1,rand(.5,.6));
        this.color2 = type == 1 ? hsl(0,1,.5) : hsl(.15,1,rand(.6,.8))
        this.height = type == 4 ? rand(4,9) : 1;
        
        /*if (this.type == 1)
        {
            this.trailParticles = new ParticleEmitter(
                vec2(), 0,      // emitPos, emitAngle
                1.2, 0, 30, PI,      // emitSize, emitTime, emitRate, emiteCone
                0, // tileIndex, tileSize
                hsl(.15,1,.5), hsl(0,0,1),   // colorStartA, colorStartB
                hsl(.15,1,.5,0), hsl(0,0,1,0), // colorEndA, colorEndB
                .5, .1, .1, 0, .01, // time, sizeStart, sizeEnd, speed, angleSpeed
                .99, 1, -.1, PI,      // damping, angleDamping, gravityScale, cone
                .5, .5, 1, 1,       // fadeRate, randomness, collide, additive
                0, 9 // random color linear, renderOrder
            );
            this.addChild(this.trailParticles, vec2(0,this.height));
        }*/
    }

    update()
    {
        const pos = this.pos.add(vec2(0,this.height));
        if (pos.distance(player.pos) < 1)
        {
            player.pickup(this.type);

            if (enhancedMode && this.type == 4) // jump bubbles
            for(let i=30; i--;)
            {
                // create bubble pop particles
                const angle = rand(9);
                const colorStart = hsl(.6,1,1,.5)
                const colorEnd = hsl(.6,1,.5,.5)
                const lifeTime = rand(.3,.5);
                const sizeStart = rand(.2,.4);
                const sizeEnd = 0
                const pos = this.pos.add(vec2(0,this.height)).add(randInCircle(.5));
                const p = new SimpleParticle(pos, angle, colorStart, colorEnd, lifeTime, sizeStart, sizeEnd);
                p.gravityScale = 0;
                p.velocity = randVector(.1);
            }

            this.destroy();
        }

        if (testLevelView)
            return; // prevent going away in test view

        {
            // adjust to ground height (incase ground moves)
            const ground = getGroundHeight(this.pos.x);
            this.pos.y = ground;
        }

        if (this.type == 1 || this.type == 3) // boost or bad pickup
        {
            // create particles
            const angle = rand(9);
            const colorStart = hsl(0,0,rand(.5,1) );
            const colorEnd = hsl(0,0,rand(.5,1),0);
            const lifeTime = rand(.3,.5);
            const sizeStart = rand(.2,.4);
            const sizeEnd = 0
            const additive = 1;
            const pos = this.pos.add(vec2(0,this.height)).add(randInCircle(.7));
            const p = new SimpleParticle(pos, angle, colorStart, colorEnd, lifeTime, sizeStart, sizeEnd, additive);
            p.gravityScale = -.3;
            p.velocity = randVector(.01);
        }

        super.update();
    }

    render()
    {
        const height = this.height;
        const wind = .2*Math.sin(time+this.pos.x/2);
        const topPos = this.pos.add(vec2(0,height + wind));
        const a = this.pos.x + time*this.spinSpeed;
        if (this.type == 1) // boost
        {
            for(let i=5; i--;)
                drawTile(topPos.add(vec2(.2).rotate(a+i/5*2*PI)), this.size, this.tileInfo, this.color1);
            for(let i=3; i--;)
                drawTile(topPos.add(vec2(.2).rotate(a+i/3*2*PI)), vec2(.3), this.tileInfo, this.color2, a+i/3*PI);
        }
        else if (this.type == 2) // coin
            drawCoinPickup(topPos, this.size, this.color1, this.color2, a);
        else if (this.type == 4) // jump bubbles
        {
            for(let i=6; i--;)
            {
                const p = i/5;
                drawTile(topPos.add(this.size.scale(-p*.2)), this.size.scale(p), this.tileInfo, hsl(.6,1,1-p/2,1-p/2), a);
            }
        }

        // draw shadow
        //const h = this.pos.y;
        //const y = topPos.y;
        //const n = getGroundNormal(this.pos.x);
        //const shadowScale = (this.type == 1 ? 1.4 : .8)*clamp(1-(y-h)/4,0,1);
        //drawTile(vec2(this.pos.x,h-.1), vec2(1.5,.5).scale(shadowScale), this.tileInfo, hsl(0,0,0,.3), n.angle());
    }
}

function drawCoinPickup(pos, size, color1=hsl(.65,1,.5), color2=hsl(.15,1,.7), a=0, screenSpace)
{
    if (screenSpace)
    {
        pos = pos.multiply(mainCanvasSize);
        size = size.scale(mainCanvasSize.y);
    }

    const tileInfo = spriteAtlas.circle;
    const backColor = rgb(1,1,1,.3);
    for(let i=5; i--;)
        drawTile(pos, size.scale(.2+i/5), tileInfo, backColor, 0, 0, undefined, 1, screenSpace);
    for(let i=3; i--;)
        drawTile(pos,  vec2(.8,.3).multiply(size), tileInfo, color1, i/3*PI+a, 0, undefined, 1, screenSpace);
    drawTile(pos, size.scale(.3), spriteAtlas.circleSmall, color2, a, 0, undefined, 1, screenSpace);
}

///////////////////////////////////////////////////////////////////////////////

class SimpleParticle extends EngineObject
{
    constructor(position, angle, colorStart, colorEnd, lifeTime, sizeStart, sizeEnd, additive)
    { 
        super(position, vec2(), 0, angle); 
    
        this.colorStart = colorStart;
        this.colorEnd = colorEnd;
        this.lifeTime = lifeTime;
        this.sizeStart = sizeStart;
        this.sizeEnd = sizeEnd;
        this.additive = additive;
        this.fadeRate = .1;
        this.renderOrder = additive ? 8 : 7;
    }

    render()
    {
        const p = percent(time - this.spawnTime, 0, this.lifeTime);
        if (p == 1)
        {
            this.destroyed = 1;
            return;
        }

        // modulate size and color
        const size = vec2(lerp(p, this.sizeStart, this.sizeEnd));
        const color = this.colorStart.lerp(this.colorEnd, p);
        const fadePercent = this.fadeRate;
        color.a *= p < fadePercent ? p/fadePercent : (1-p)/(1-fadePercent);

        // draw the particle
        setBlendMode(this.additive);
        drawRect(this.pos, size, color, this.angle + time);
        setBlendMode();
        debugParticles && debugRect(this.pos, size, '#f005', 0, this.angle);
    }
}