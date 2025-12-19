/*
Little Paws!

Features
- Procedurally generated terrain
- 13 unlockable cats to play with
- 13 islands in each game mode
- Mouse, touch, or keyboard controls
- Parallex background effect
- Time of day system
- Classic Mode is always the same
- Remix Mode is randomized, beat classic to unlock
- Continue where you left off
- Saves your coins to use anytime
- Best times are save if you win without continuing
- Adaptive screen resolution and aspect

How to play
- Press and hold to gain speed on down slopes
- Release to gain speed on up slopes
- Eat pizza to get a boost
- Collect flowers to buy more cats

Controls
- Space, Mouse, or Touch = Push Down
- R = Restart
- Escape = Back

Made by Frank Force
https://frankforce.com/

Created with LittleJS Engine
https://github.com/KilledByAPixel/LittleJS

Donate Cryptocurrency to Help Homeless Pets!
https://bestfriends.org/donate/cryptocurrency-donations

This game is dedicated to my cat Baldy, 
a black cat who always brought me good luck.

*/

'use strict';

if (debug)
{
    //musicEnable = 0;
    //autoPause=0
    //quickStart = 1;
    //soundEnable = 0;
    //testPickups=1
    //testTitleScreen=1
    //debugGenerativeCanvas=1
    //testGameOver=1x
    //testLevelView=1
    //testRandomize=1
    //testNoRamps=1;
    //testAutoplay=1;
    //testTitleScreen=1
    //testSeed = 8956012
    //testStore = 1;
    //testMakeThumbnail=2
    //testGodMode=1;
    //testStore=1
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine

engineInit();