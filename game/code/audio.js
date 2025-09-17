'use strict';

let musicEnable = 1;

// sound effects
const sound_meow = new Sound([.7,.1,600,.05,.1,.1,5,,3,-18,,,,.3,,.05,,.7,.05]); // cat
const sound_meow2 = new Sound([.7,.1,600,.05,.2,.2,5,,3,-18,,,,.3,,.05,,.7,.05]); // cat
const sound_select = new Sound([,.2,900,.01,,.01,2,,18,,500,.01,.01]); // squeek
const sound_jump = new Sound([.5,,250,.05,,,,2,,-40,,,,5]); // jump
const sound_boost = new Sound([,,200,.2,.02,.06,1,2,-15,,-99,,.1,,,.2,,.5,.2]); // boost
const sound_coin = new Sound([1.5,0,110,.02,.01,.2,,.6,,,440,.05,,,,,.03,.6,.03]); // coin
const sound_bubble = new Sound([.9,,80,.01,,.01,,2,-50,,-400,.01,,,25,,,.8,.01,,-1e3]); // bubble
const sound_win = new Sound([2,,630,.02,.2,1,,2,-6,1,,,.12,,,.2,,.5,.2,,-2e3]); // win
const sound_gameOver = new Sound([.6,,300,.01,.2,.7,,2,,,-30,.05,.07,,,.2,.3,,.1]); // game over

///////////////////////////////////////////////////////////////////////////////
// tiny tunes

const drumKick = new Sound([,,99,,,.02,,,,,,,,2]); // drumKick
const drumHat = new Sound([,,1e3,,,.01,4,,,,,,,,,,,,,,4e3]); // drumHat
const piano = new Sound([1,220.5,,,.1,,1,1.5,,,,,,,,,.1]); // piano
const bass = new Sound([,0,55,,,,,.5,,,,,,,,,,.1,.05]); // bass
let beatCount, bassNote, pianoNote, chordNote;

function musicStart()
{
    beatCount = bassNote = pianoNote = chordNote = 0;
}

function musicUpdate()
{
    if (!titleScreen || !musicEnable)
        return;
    if (frame%8)
        return;

    const skipAhead = 0; // for debugging
    const scale = [0,2,7,4,-3,-5]; // major pentatonic scale

    if (beatCount%32==0) // set new chord
    {
        bassNote = pianoNote = chordNote = beatCount%256 ? chordNote + randSign() : 0;
        //debug && console.log('chord',  chordNote, scale[mod(chordNote,  scale.length)]);
    }

    // hat
    if (beatCount%128 < 96 || skipAhead)
    if (beatCount%2==0 || !randInt(9))
        drumHat.play(((beatCount>>1)%4==2 ? .4:.2) - rand(.1));
    
    // kick
    if (beatCount%4==0)
        drumKick.play(((beatCount>>1)%4==0 ? .5:1) - rand(.2));
    
    // bass line
    if (beatCount >= 32 || skipAhead)
    if (beatCount%2==0 && (beatCount%8==0 || randInt(4)) || !randInt(9))
    {
        const note = scale[mod(bassNote + randSign(), scale.length)];
        bass.playNote(note, .7);
    }

    // piano melody
    if (beatCount%256 >= 64 || skipAhead)
    if (beatCount%8==0 || beatCount%2 == 0 && randInt(2))
    {
        const note = scale[mod(pianoNote = randInt(9) ? pianoNote - 1 : randInt(9), scale.length)];
        piano.playNote(note+12,.15);
    }
    beatCount = ++beatCount;
}