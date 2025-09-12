'use strict';

// sound effects
const sound_meow = new Sound([.8,.1,900,.05,.2,.2,5,,3,-18,,,,.3,,.05,,.7,.05]); // cat
const sound_select = new Sound([.5,,552,.02,.01,.04,,2.4,,,,,,,18,,,.59,,,-928]); // select
const sound_boost = new Sound([,,126,.17,.02,.06,1,1.9,-13,,-43,.08,.07,.1,,.2,,.52,.16]); // Random 7688
const sound_coin = new Sound([1.5,,110,.02,.01,.12,,.6,,,448,.05,,,,,.03,.6,.03]); // Pickup 7654
const sound_gameOver = new Sound([.6,,294,.01,.17,.28,,2.2,,,493,.06,.06,,,.2,.16,.99,.15]); // Pickup 6602
const sound_win = new Sound([1.39,,663,.02,.17,.42,1,.29,-6.4,1.1,,,.12,,,.2,,.53,.19,,-2303]); // Powerup 401;
const sound_ui = new Sound([1,0]);
const sound_jump = new Sound([.5,,250,.05,,,,1.3,,-35,,,,5]);
const sound_bubble = new Sound([,,224,.02,.02,.08,1,1.7,-13.9,,,,,,6.7]);

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
        //sounds_wind[i] = new Sound([1,0,300+i/(sounds_wind_count-1)*99]);
        //sounds_wind.push(new Sound([.5,0,500*i/sounds_wind_count]));
    }
}
*/
///////////////////////////////////////////////////////////////////////////////

//let windVolume = .05;
let test = 0;
let beatTimer = new Timer;
let beatCount = 0;
function musicUpdate()
{

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
