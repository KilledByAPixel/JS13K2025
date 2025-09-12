/**
 * LittleJS User Interface Plugin
 * - Nested Menus
 * - Text
 * - Buttons
 * - Checkboxes
 * - Images
 */

'use strict';

///////////////////////////////////////////////////////////////////////////////

// ui defaults
const uiDefaultColor         = WHITE;
const uiDefaultLineColor     = BLACK;
const uiDefaultTextColor     = BLACK;
const uiDefaultDisabledColor = hsl(0,0,.2);
const uiDefaultButtonColor   = hsl(0,0,.8);
const uiDefaultHoverColor    = WHITE;
const uiDefaultLineWidth     = 4;
const uiDefaultFont          = fontDefault;

// ui system
const uiObjects = [];
const uiNativeHeight = 1080;

function uiUpdate()
{
    uiObjectWasClicked = 0;
    overlayContext = mainContext;
    function updateInvisible(o)
    {
        o.mouseIsOver = o.mouseIsHeld = 0; // reset input state when not visible
        for(const c of o.children)
            updateInvisible(c);
    }

    function updateObject(o)
    {
        if (!o.visible)
        {
            updateInvisible(o);
            return;
        }
        if (o.parent)
            o.pos = o.localPos.add(o.parent.pos);
        o.update();
        for(const c of o.children)
            updateObject(c);
    }
    uiObjects.forEach(o=> o.parent || updateObject(o));
}

function uiRender()
{
    const s = mainCanvasSize.y / uiNativeHeight; // auto adjust height
    overlayContext = mainContext;
    overlayContext.save();
    overlayContext.translate(mainCanvasSize.x/2,0);
    overlayContext.scale(s,s);

    function renderObject(o)
    {
        if (!o.visible)
            return;
        if (o.parent)
            o.pos = o.localPos.add(o.parent.pos);
        o.render();
        for(const c of o.children)
            renderObject(c);
    }
    uiObjects.forEach(o=> o.parent || renderObject(o));
    overlayContext.restore();
}

function drawUIRect(pos, size, color=uiDefaultColor, lineWidth=uiDefaultLineWidth, lineColor=uiDefaultLineColor, cornerRadius)
{
    overlayContext.fillStyle = color.toString();
    overlayContext.beginPath();
    if (cornerRadius && overlayContext.roundRect)
        overlayContext.roundRect(pos.x-size.x/2, pos.y-size.y/2, size.x, size.y, cornerRadius);
    else
        overlayContext.rect(pos.x-size.x/2, pos.y-size.y/2, size.x, size.y);
    overlayContext.fill();

    if (lineWidth)
    {
        overlayContext.strokeStyle = lineColor.toString();
        overlayContext.lineWidth = lineWidth;
        overlayContext.stroke();
    }
}

function drawUIPoints(pos, points, color=uiDefaultColor)
{
    overlayContext.fillStyle = color.toString();
    overlayContext.beginPath();
    for(const p of points)
        overlayContext.lineTo(pos.x + p.x, pos.y + p.y);
    overlayContext.fill();
}

function drawUILine(posA, posB, thickness=uiDefaultLineWidth, color=uiDefaultLineColor)
{
    overlayContext.strokeStyle = color.toString();
    overlayContext.lineWidth = thickness;
    overlayContext.beginPath();
    overlayContext.lineTo(posA.x, posA.y);
    overlayContext.lineTo(posB.x, posB.y);
    overlayContext.stroke();
}

function drawUIText(text, pos, size, color=uiDefaultColor, lineWidth=uiDefaultLineWidth, lineColor=uiDefaultLineColor, align='center', font=uiDefaultFont)
{
    drawTextScreen(text, pos, size.y, color, lineWidth, lineColor, align, font, size.x, overlayContext);
}

function isMouseOverlappingUI(posA, sizeA)
{
    const s = mainCanvasSize.y / uiNativeHeight;
    const v = vec2(mainCanvasSize.x/2,0);
    const p = mousePosScreen.subtract(v).scale(1/s)
    return isOverlapping(posA, sizeA, p);
}

///////////////////////////////////////////////////////////////////////////////

let uiObjectWasClicked; // set to true if any UI object was clicked this frame

class UIObject
{
    constructor(localPos=vec2(), size=vec2())
    {
        this.localPos = localPos.copy();
        this.pos = localPos.copy();
        this.size = size.copy();
        this.color      = uiDefaultColor;
        this.lineColor  = uiDefaultLineColor;
        this.textColor  = uiDefaultTextColor;
        this.hoverColor = uiDefaultHoverColor;
        this.lineWidth  = uiDefaultLineWidth;
        this.font       = uiDefaultFont;
        this.cornerRadius = 50;
        this.visible = true;
        this.children = [];
        this.parent = null;
        uiObjects.push(this);
    }

    addChild(child)
    {
        ASSERT(!child.parent && !this.children.includes(child));
        this.children.push(child);
        child.parent = this;
    }

    removeChild(child)
    {
        ASSERT(child.parent == this && this.children.includes(child));
        this.children.splice(this.children.indexOf(child), 1);
        child.parent = 0;
    }

    update()
    {
        const mousePress = mouseWasPressed(0);
        const mouseDown = mouseIsDown(0);
        if (!mouseDown || this.mouseIsHeld || mousePress)
        {
            this.mouseIsOver = isMouseOverlappingUI(this.pos, this.size);
            if (mousePress && this.mouseIsOver)
                uiObjectWasClicked = 1; // prevent clicks from passing through UI
        }
        if (this.mouseIsOver && !this.disabled)
        {
            if (mousePress)
            {
                sound_select.play(.4, 2);
                this.mouseIsHeld = 1;
            }
            if (!mouseDown && this.mouseIsHeld)
                this.onClick();
        }

        if (!mouseDown)
            this.mouseIsHeld = 0;
    }
    render()
    {
        if (this.size.x && this.size.y)
            drawUIRect(this.pos, this.size, this.color, this.lineWidth, this.lineColor, this.cornerRadius);
    }

    // callback function
    onClick()  {}
}

///////////////////////////////////////////////////////////////////////////////

class UIText extends UIObject
{
    constructor(pos, size, text='', align='center', font=fontDefault)
    {
        super(pos, size);

        this.text = text;
        this.align = align;
        this.font = font;
        this.lineWidth = 0;
    }
    render()
    {
        drawUIText(this.text, this.pos, this.size, this.textColor, this.lineWidth, this.lineColor, this.align, this.font);
    }
}

///////////////////////////////////////////////////////////////////////////////

class UITile extends UIObject
{
    constructor(pos, size, tileInfo, color=WHITE, angle=0, mirror=false)
    {
        super(pos, size);

        this.tileInfo = tileInfo;
        this.color = color;
        this.angle = angle;
        this.mirror = mirror;
    }
    render()
    {
        //drawUITile(this.pos, this.size, this.tileInfo, this.color, this.angle, this.mirror);
    }
}

///////////////////////////////////////////////////////////////////////////////

class UIButton extends UIObject
{
    constructor(pos, size, text='', textOffset=vec2())
    {
        super(pos, size);
        this.text = text;
        this.color = uiDefaultButtonColor;
        this.textOffset = textOffset;
        this.disabledColor = uiDefaultDisabledColor;
    }
    render()
    {
        const lineColor = this.mouseIsHeld && !this.disabled ? this.color : this.lineColor;
        const color = this.disabled ? this.disabledColor : this.mouseIsOver ? this.hoverColor : this.color;
        drawUIRect(this.pos, this.size, color, this.lineWidth, lineColor, this.cornerRadius);
        const textSize = vec2(this.size.x*.9, this.size.y*.6);
        drawUIText(this.text, this.pos.add(this.textOffset.multiply(textSize)), textSize, 
            this.textColor, 0, undefined, this.align, this.font);
    }
}

///////////////////////////////////////////////////////////////////////////////

class UICheckbox extends UIObject
{
    constructor(pos, size, checked=false)
    {
        super(pos, size);
        this.checked = checked;
    }
    onClick()
    {
        this.checked = !this.checked;
    }
    render()
    {
        const color = this.mouseIsOver? this.hoverColor : this.color;
        drawUIRect(this.pos, this.size, color, this.lineWidth, this.lineColor, this.cornerRadius);
        if (this.checked)
        {
            // draw an X if checked
            drawUILine(this.pos.add(this.size.multiply(vec2(-.5,-.5))), this.pos.add(this.size.multiply(vec2(.5,.5))), this.lineWidth, this.lineColor);
            drawUILine(this.pos.add(this.size.multiply(vec2(-.5,.5))), this.pos.add(this.size.multiply(vec2(.5,-.5))), this.lineWidth, this.lineColor);
        }
    }
}
