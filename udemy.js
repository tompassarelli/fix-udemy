let udemySC_DOMQueries = {
    videoQueryResult: function () {
        return document.querySelector('video');
    },
    instructorQueryResult: function () {
        return document.querySelector('meta[property="udemy_com:instructor"]')
    },
    speedButtonQueryResult: function () {
        return document.querySelector('span.ud-focus-visible-target');
    }
}
let udemySC_State = {
    lastUrl: window.location.href,
    instructorSpeedPref: 1,
    instructorName: '',
    speedButtonElement: undefined,
    instructorElement: undefined,
    videoElement: undefined,
    updating: false,
    checkVideoDOMReferenceValid: function () {
        if (this.videoElement !== undefined && this.videoElement !== null) {
            return true
        }
        return false
    },
    checkInstructorDOMReferenceValid: function () {
        if (this.instructorElement !== undefined && this.instructorElement !== null) {
            return true
        }
        return false
    },
    checkSpeedButtonDOMReferenceValid: function () {
        if (this.speedButtonElement !== undefined && this.isSpeedButtonElement !== null) {
            return true
        }
        return false
    }
} 

// INIT
udemySC_reload()

// handle non-url state changes, i.e user changes speed 
// lock on updating to prevent race conditions, we want to reload with preferences, only then monitor video speed
function udemySC_run() {

    setInterval(() => {
        if (udemySC_State.lastUrl != window.location.href) {
            udemySC_State.lastUrl = window.location.href;
            udemySC_reload();
            return;
        }
            // redraw UI
            //TODO: modify aria data appropriately
            udemySC_State.speedButtonElement.innerText = udemySC_State.videoElement.playbackRate + 'x'
            // handle case where user updates speed and save as preference on drift
            browser.storage.local.set({ [udemySC_State.instructorName]: udemySC_State.videoElement.playbackRate })
            udemySC_State.instructorSpeedPref = udemySC_State.videoElement.playbackRate
            // debug :MDNREVIEW:
            // console.log(udemySC_State)
    }, 2000)
}
udemySC_run()

function udemySC_reload() {
    udemySC_updateInstructorState();
    udemySC_updateVideoState();
}

// SPEEDBUTTON

function udemySC_updateSpeedButtonRef() {
    udemySC_State.speedButtonElement = udemySC_DOMQueries.speedButtonQueryResult();
    udemySC_State.speedButtonElement.innerText = udemySC_State.videoElement.playbackRate + 'x'
}

// INSTRUCTOR
async function udemySC_updateInstructorState() {
    udemySC_State.instructorElement = udemySC_getInstructor();
    udemySC_State.instructorName = (udemySC_State.instructorElement).content.split('/')[4]
    let savedSpeed = await udemySC_getInstructorSpeed()
    if (typeof(savedSpeed) != 'undefined') { // there is an entry for the instructor
        udemySC_State.instructorSpeedPref = savedSpeed[udemySC_State.instructorName]
    } 
}

function udemySC_getInstructor() {
    return udemySC_DOMQueries.instructorQueryResult()
}

async function udemySC_getInstructorSpeed() {
    return await browser.storage.local.get(udemySC_State.instructorName)
}

// VIDEO 
async function udemySC_updateVideoState() {
    udemySC_State.videoElement = await udemySC_getVideo();
    udemySC_updateSpeedButtonRef();
    udemySC_State.videoElement.playbackRate = udemySC_State.instructorSpeedPref;
}

async function udemySC_getVideo() {
    return await new Promise(function (resolve) {
        let interval = setInterval(() => {
            if (document.querySelector('video') !== undefined && document.querySelector('video') !== null) {
                clearInterval(interval);
                resolve(udemySC_DOMQueries.videoQueryResult());
            }
        }, 1000)
    })
}


