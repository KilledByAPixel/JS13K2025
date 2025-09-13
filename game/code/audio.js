'use strict';

// sound effects
const sound_meow = new Sound([.7,.1,900,.05,.1,.1,5,,3,-18,,,,.3,,.05,,.7,.05]); // cat
const sound_meow2 = new Sound([.7,.1,900,.05,.2,.2,5,,3,-18,,,,.3,,.05,,.7,.05]); // cat
const sound_select = new Sound([,.2,900,.01,,.01,2,,18,,500,.01,.01]); // squeek
const sound_jump = new Sound([.5,,250,.05,,,,2,,-40,,,,5]); // jump
const sound_boost = new Sound([,,200,.2,.02,.06,1,2,-15,,-99,,.1,,,.2,,.5,.2]); // boost
const sound_coin = new Sound([1.5,0,110,.02,.01,.2,,.6,,,440,.05,,,,,.03,.6,.03]); // coin
const sound_bubble = new Sound([.9,,80,.01,,.01,,2,-50,,-400,.01,,,25,,,.8,.01,,-1e3]); // bubble
const sound_win = new Sound([2,,630,.02,.2,1,,2,-6,1,,,.12,,,.2,,.5,.2,,-2e3]); // win
const sound_gameOver = new Sound([.6,,300,.01,.2,.7,,2,,,-30,.05,.07,,,.2,.3,,.1]); // game over

///////////////////////////////////////////////////////////////////////////////
// tiny tunes

const drumKick = new Sound([2,,99,,,.05,,,,,,,,2]); // Loaded Sound 7789
const drumHat = new Sound([.4,,1e3,,,.005,4]); // drumHat
const piano = new Sound([.5,0,,,.1,.2,,2,,,,,.1,,,,,,,.2]); // Toy Piano
//const bass = new Sound([1.6,0,110,,.1,.2,1,.5,,,,,,,,,.02,.5,.04,,-160]); // bass;
const bass = new Sound([,0,55,,.1,,,.5]); // Toy Piano
let beatTimer = new Timer;
let beatCount;
let pianoNote;
let chordNote;

function musicStart()
{
    beatCount = pianoNote = chordNote = 0;
}

function musicUpdate()
{
    if (!titleScreen)
        return;
    if (beatTimer.active())
        return;

    const pianoActive = 1;
    const chordsActive = 1;
    const drumsActive = 1;
    const bassActive = 1;
    const musicRate = .08;
    const scale = [0,4,7,9,12]; // major pentatonic scale

    if (drumsActive)
    {
        // precussion
        if (beatCount%4==0 || !randInt(30))
        {
            // hat
            drumHat.play(rand(.7,1));
        }
        if (beatCount%8==0 || beatCount%4==0 && !randInt(9))
        {
            // kick
            drumKick.play(rand(.7,1));
        }
    }
    {
        // piano chords
        if (beatCount%64==0) // set new chord
            pianoNote = chordNote = beatCount%256 ? chordNote + randSign() : 0;
        if (beatCount >= 64)
        {
            if (chordsActive)
            if (beatCount%2==0)
            {
                // play the chord
                const v = rand(.1,.2);
                piano.playNote(scale[mod(chordNote,  scale.length)], v);
                piano.playNote(scale[mod(chordNote+3,scale.length)], v);
            }
        }
    }
    if (beatCount >= 128)
    {
        if (pianoActive)
        if (beatCount%4==0 && !randInt(9) || beatCount%2==0 && randInt(2))
        {
            const note = scale[mod(pianoNote += randSign(), scale.length)];
            piano.playNote(note+7, rand(.5,1));
        }
        if (bassActive)
        if (beatCount%4==0 || beatCount%2==0 && !randInt(9))
        {
            const note = scale[mod(chordNote, scale.length)];
            bass.playNote(note, rand(.4,.7));
        }
    }
    ++beatCount;
    beatTimer.set(musicRate);
}