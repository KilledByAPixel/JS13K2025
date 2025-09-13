/** 
 * LittleJS Object System
 */

'use strict';

/** 
 * LittleJS Object Base Object Class
 * - Top level object class used by the engine
 * - Automatically adds self to object list
 * - Will be updated and rendered each frame
 * - Renders as a sprite from a tilesheet by default
 * - Can have color and additive color applied
 * - 2D Physics
 * - Sorted by renderOrder
 * - Objects can have children attached
 * - Parents are updated before children, and set child transform
 * - Call destroy() to get rid of objects
 *
 * @example
 * // create an engine object, normally you would first extend the class with your own
 * const pos = vec2(2,3);
 * const object = new EngineObject(pos); 
 */
class EngineObject
{
    /** Create an engine object and adds it to the list of objects
     *  @param {Vector2}  [pos=(0,0)]       - World space position of the object
     *  @param {Vector2}  [size=(1,1)]      - World space size of the object
     *  @param {TileInfo} [tileInfo]        - Tile info to render object (undefined is untextured)
     *  @param {Number}   [angle]           - Angle the object is rotated by
     *  @param {Color}    [color=(1,1,1,1)] - Color to apply to tile when rendered
     *  @param {Number}   [renderOrder]     - Objects sorted by renderOrder before being rendered
     */
    constructor(pos=vec2(), size=vec2(1), tileInfo, angle=0, color=new Color, renderOrder=0)
    {
        // set passed in params
        ASSERT(isVector2(pos) && isVector2(size), 'ensure pos and size are vec2s');
        ASSERT(typeof tileInfo !== 'number' || !tileInfo, 'old style tile setup');

        /** @property {Vector2} - World space position of the object */
        this.pos = pos.copy();
        /** @property {Vector2} - World space width and height of the object */
        this.size = size;
        /** @property {TileInfo} - Tile info to render object (undefined is untextured) */
        this.tileInfo = tileInfo;
        /** @property {Number}  - Angle to rotate the object */
        this.angle = angle;
        /** @property {Color}   - Color to apply when rendered */
        this.color = color;
        /** @property {Color}   - Additive color to apply when rendered */
        this.additiveColor = undefined;
        /** @property {Boolean} - Should it flip along y axis when rendered */
        this.mirror = false;

        /** @property {Number} [damping=objectDefaultDamping]           - How much to slow down velocity each frame (0-1) */
        this.damping      = objectDefaultDamping;
        /** @property {Number} [angleDamping=objectDefaultAngleDamping] - How much to slow down rotation each frame (0-1) */
        this.angleDamping = objectDefaultAngleDamping;
        /** @property {Number}  - How much to scale gravity by for this object */
        this.gravityScale = 1;
        /** @property {Number}  - Objects are sorted by render order */
        this.renderOrder = renderOrder;
        /** @property {Vector2} - Velocity of the object */
        this.velocity = vec2();
        /** @property {Number}  - Angular velocity of the object */
        this.angleVelocity = 0;
        /** @property {Number}  - Track when object was created  */
        this.spawnTime = time;
        /** @property {Array}   - List of children of this object */
        this.children = [];

        // parent child system
        /** @property {EngineObject} - Parent of object if in local space  */
        this.parent = undefined;
        /** @property {Vector2}      - Local position if child */
        this.localPos = vec2();
        /** @property {Number}       - Local angle if child  */
        this.localAngle = 0;

        // add to list of objects
        engineObjects.push(this);
    }
    
    /** Update the object transform, called automatically by engine even when paused */
    updateTransforms()
    {
        const parent = this.parent;
        if (parent)
        {
            // copy parent pos/angle
            const mirror = parent.getMirrorSign();
            this.pos = this.localPos.multiply(vec2(mirror,1)).rotate(parent.angle).add(parent.pos);
            this.angle = mirror*this.localAngle + parent.angle;
        }

        // update children
        for (const child of this.children)
            child.updateTransforms();
    }

    /** Update the object physics, called automatically by engine once each frame */
    update()
    {
        // child objects do not have physics
        if (this.parent)
            return;

        if (!isJS13KBuild)
        {
            // limit max speed
            const length2 = this.velocity.lengthSquared();
            if (length2 > objectMaxSpeed*objectMaxSpeed)
            {
                const s = objectMaxSpeed / length2**.5;
                this.velocity.x *= s;
                this.velocity.y *= s;
            }
        }

        // apply physics
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        this.velocity.y += gravity * this.gravityScale;
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        this.angle += this.angleVelocity *= this.angleDamping;
    }
       
    /** Render the object, draws a tile by default, automatically called each frame, sorted by renderOrder */
    render()
    {
        // default object render
        drawTile(this.pos, this.size, this.tileInfo, this.color, this.angle, this.mirror, this.additiveColor);
    }
    
    /** Destroy this object, destroy it's children, detach it's parent, and mark it for removal */
    destroy()
    { 
        if (this.destroyed)
            return;
        
        // disconnect from parent and destroy children
        this.destroyed = 1;
        this.parent && this.parent.removeChild(this);
        for (const child of this.children)
            child.destroy(child.parent = 0);
    }

    /** Convert from local space to world space
     *  @param {Vector2} pos - local space point */
    localToWorld(pos) { return this.pos.add(pos.rotate(this.angle)); }

    /** Convert from world space to local space
     *  @param {Vector2} pos - world space point */
    worldToLocal(pos) { return pos.subtract(this.pos).rotate(-this.angle); }

    /** Convert from local space to world space for a vector (rotation only)
     *  @param {Vector2} vec - local space vector */
    localToWorldVector(vec) { return vec.rotate(-this.angle); }

    /** Convert from world space to local space for a vector (rotation only)
     *  @param {Vector2} vec - world space vector */
    worldToLocalVector(vec) { return vec.rotate(this.angle); }

    /** How long since the object was created
     *  @return {Number} */
    getAliveTime()                    { return time - this.spawnTime; }

    /** Apply acceleration to this object (adjust velocity, not affected by mass)
     *  @param {Vector2} acceleration */
    applyAcceleration(acceleration)   { if (this.mass) this.velocity = this.velocity.add(acceleration); }
    
    /** Get the direction of the mirror
     *  @return {Number} -1 if this.mirror is true, or 1 if not mirrored */
    getMirrorSign() { return this.mirror ? -1 : 1; }

    /** Attaches a child to this with a given local transform
     *  @param {EngineObject} child
     *  @param {Vector2}      [localPos=(0,0)]
     *  @param {Number}       [localAngle] */
    addChild(child, localPos=vec2(), localAngle=0)
    {
        ASSERT(!child.parent && !this.children.includes(child));
        this.children.push(child);
        child.parent = this;
        child.localPos = localPos.copy();
        child.localAngle = localAngle;
    }

    /** Removes a child from this one
     *  @param {EngineObject} child */
    removeChild(child)
    {
        ASSERT(child.parent == this && this.children.includes(child));
        this.children.splice(this.children.indexOf(child), 1);
        child.parent = 0;
    }

    /** Returns string containing info about this object for debugging
     *  @return {String} */
    toString()
    {
        if (debug)
        {
            let text = 'type = ' + this.constructor.name;
            if (this.pos.x || this.pos.y)
                text += '\npos = ' + this.pos;
            if (this.velocity.x || this.velocity.y)
                text += '\nvelocity = ' + this.velocity;
            if (this.size.x || this.size.y)
                text += '\nsize = ' + this.size;
            if (this.angle)
                text += '\nangle = ' + this.angle.toFixed(3);
            if (this.color)
                text += '\ncolor = ' + this.color;
            return text;
        }
    }

    /** Render debug info for this object  */
    renderDebugInfo()
    {
        if (debug)
        {
            // show object info for debugging
            const size = vec2(max(this.size.x, .2), max(this.size.y, .2));
            const color1 = rgb(1,1,1,this.parent?.2:.5);
            const color2 = this.parent ? rgb(1,1,1,.5) : rgb(0,0,0,.8);
            drawRect(this.pos, size, color1, this.angle, false);
            drawRect(this.pos, size.scale(.8), color2, this.angle, false);
            this.parent && drawLine(this.pos, this.parent.pos, .1, rgb(0,0,1,.5), false);
        }
    }
}