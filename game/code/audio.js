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


/*
new Sound([2.48,,1910,,,.02,2,.07,-75,-13,147,,,,,,.01,.25]); // wood hit
new Sound([,,129,.01,,.15,,,,,,,,5]); // drum
new Sound([,0,261.6256,,,.07,,2]); // Toy Piano
new Sound([,0,523.2511,.02,,.45,,1.15,,,,,,,,,.16]); // flute
new Sound([,,2e3,,.005,.02,4]); // closed hat
new Sound([,0,711,.01,.06,.01]); // whistle
new Sound([,,411,,,.21,1,1.67,,,,,,,,.1,.01]); // cowbell

new Sound([1.3,,110,.04,.2,2,,3,,1,332,.06,.05,,,,.3,.8,.3,.5,-1e3]); // win
new Sound([,,1838,.03,,,,48,,,-30,.07,,.4]); // dry whiste
new Sound([,,1004,,,.06,,27,13,,-157,.29]); // Blip 3169
new Sound([,.2,1e3,.02,,.01,2,,18,,475,.01,.01]); // Squeek
new Sound([5,,93,,.01,.005,1,2.7,,,,,.02,.3,15,,.12,.95,.18,.37,887]); // crackel
*/

/*
const sounds_cat = [];
// cache unique meow sound for each cat
function gameAudioInit()
{
    const random = new RandomGenerator(1e4);
    for(let i=catCount; i--;)
    {
        const frequency = i==12 ? 99: i == 10 ? 1300 : random.float(300,1e3);
        const attack = random.float(.02,.1);
        const sustain = random.float(.05,.2);
        const release = i == 10 ? .03 : random.float(.1,.4);
        const shapeCurve = random.float(.1,.3);
        const slide = random.float(1,4);
        const deltaSlide = random.float(-20);
        const noise = random.float(.5);
        const crush = random.float(.06);
        const sustainVolume = random.float(.6,.7);
        const decay = random.float(.03,.06);
        sounds_cat[i] = new Sound([.8,.3,frequency,attack,sustain,release,5,shapeCurve,slide,deltaSlide,,,,noise,,crush,,sustainVolume,decay]);
    }
}
*/

const drumKick = new Sound([,,129,.01,,.15,,,,,,,,5]); // drumKick
const drumHat = new Sound([,,2e3,,.005,.02,4]); // drumHat
const flute = new Sound([,0,440,.02,,.45,,1.15,,,,,,,,,.16]); // flute
const piano = new Sound([,0,220,,,.07,,2]); // Toy Piano
const bass = new Sound([1.61,0,110,,.09,,1,.63,,,,,,,,,.02,.5,.04,,-165]); // bass
///////////////////////////////////////////////////////////////////////////////

//let windVolume = .05;
let test = 0;
let beatTimer = new Timer;
let beatCount = 0;
function musicUpdate()
{
    const musicMode = 0
    const measureLength = musicMode == 1? 3 : 4;
    const kickMeasureLength = 2; //3
return
    if (!beatTimer.active())
    {
        ++beatCount;
        beatTimer.set(.1);

        // precussion
        if (1)
        {
            if (beatCount%measureLength==0||!randInt(9))
                drumHat.play();
            if (beatCount%kickMeasureLength==0||!randInt(9))
                drumKick.play();
        }
    }

    return;
    // update music
    if (beatTimer.elapsed())
    {
        ++beatCount;
        let dif = 0;//GetDifficulty();
        let musicMode = 0
        let bonusGame = false;
        let measureLength = musicMode == 1? 3 : 4;

        if (bonusGame)
            beatTimer.set(.1);
        else if (musicMode == 2)
            beatTimer.set(.1);
        else if (musicMode == 0)
            beatTimer.set(lerp(dif,.25, .1));
        else
            beatTimer.set(.2);

        let RandInt = x=>Math.floor(Math.random()*x);

        // bass
        if (beatCount>(bonusGame?4:8) && ((beatCount%(beatCount+2)<1) || !RandInt(4)))
        {
            let scale1 = [-5,0,2,7]; // major pentatonic scale
            let scale2 = [-5,-2,0,2,4,7]; // major pentatonic scale
            let scale3 = [0,3,5,7,11,12]; // minor pentatonic scale
            let scale = bonusGame? scale3 : musicMode == 0 ? scale2 : scale1;
            let noteIndex = RandInt(scale.length)

            // play the note
            let volume = .6;
            let note = scale[noteIndex]-12;
            let length = .2;(RandInt(2)+1)/2;
            let attack = .01
            let noise = .5;

            zzfx(volume, 0, 220*2**(note/12), length, attack, 0, noise);
        }

        // chords
        if (!bonusGame)
        if (beatCount>(musicMode==0?0:24) && ((beatCount%(measureLength)==0) || !RandInt(musicMode==1? 4 : 9)))
        {
            let scale1 = [0,4,5,10,12]; // major pentatonic scale
            let scale2 = [0,4,7,12]; // major pentatonic scale
            let scale = musicMode == 0 ? scale2 : scale1;
            let noteIndex = RandInt(scale.length)

            // play the note
            let volume = .4;
            let note = scale[noteIndex];
            let length = (RandInt(2)+1)/4;
            let attack = .03
            let noise = .1;

            if (musicMode == 1)
                zzfx(volume, 0, 220*2**(note/12), length, attack, 0, noise);

            if (musicMode == 1 && Rand() < .3)
            {
                let noteIndex2 = RandInt(scale.length)
                if (noteIndex2 != noteIndex)
                {
                    let note = scale[noteIndex2];
                    zzfx(volume, 0, 220*2**(note/12), length, attack, 0, noise);
                }
            }
        }
        
        // precussion
        if (1)
        {
            if (beatCount%measureLength==0||!RandInt(9))
                zzfx(.4,.2,1e3,.01,.05,.8,21,51); // ZzFX  highhat
            if (beatCount%(bonusGame?3:2)==0||!RandInt(9))
                zzfx(.5,.2,150,.02,.002,.1,1,.5,.15); // ZzFX 17553 kick
        }
    }
}
