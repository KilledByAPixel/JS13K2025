/*
Little Paws!

Features
- Procedurally generated terrain
- Mouse, touch, or keyboard controls
- Multiple game modes (classic, remix)
- 13 Unlockable cats with different abilities
- 13 levels in each world

*/

'use strict';

if (debug)
{
   // quickStart = 1;
   //soundEnable = 0;
    //testPickups=1
    //testTitleScreen=1
    //debugGenerativeCanvas=1
    //testGameOver=1
    //testLevelView=1
    //testRandomize=1
    // testNoRamps=1;
   // testAutoplay=1;
    //autoPause=0
    //testLevel=0
    //testTitleScreen=1
    // testSeed = 90
    // testStore = 1;
    //testMakeThumbnail=1
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine

//const imageSource = 'tiles.png';
const imageSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAgMAAAC+UIlYAAAACVBMVEUAAAD///+9vb1a+/H2AAAAAXRSTlMAQObYZgAAAOVJREFUWMPtkj0KwzAMhRVDhmTqkr1Llp4iR8iQF0Knjj1GLlHomKGG4lPWyINbOT+FUjpUHxhr+MCW9Og9so6WycFnmQoNHzq4cVYAWhbMBWeicZ88D3QsFEBP5nRNvwA8CcdhTuBP1r4YDbyQtVLgNqNQDIng+Y4Q2/SELoLQy0FFgdzEghy1J0wyVE4ui+Fd/Ir2QyHmsbbjqpBZeyNqdrOh5dtaS6Yd1oWYqHTUlRcaFsy0IZR3uU0h5N22IAMjn5CC6KJ0MpNR4ETlkEKcZKjw2iXQyF2kgqIoiqIoiqIof88DCEVdiDHOHWkAAAAASUVORK5CYII="

engineInit();