const ProgElem = new ProgressCompo();

function goodInput(...inputs) {
    for (let i of inputs) {
        if (
            i.length <= 0
        ) return false;
    }
    return true;
}

function startProgress(progElem) {
    document.getElementById('progress-container').appendChild(progElem.get())
}

function stopProgress(progElem) {
    document.getElementById('progress-container').removeChild(progElem.get())
}

function pointerInsideElement(element, x, y) {
    if (
        element.getBoundingClientRect().left <= x
        && x <= element.getBoundingClientRect().right
        && element.getBoundingClientRect().top <= y
        && y <= element.getBoundingClientRect().bottom
    ) return true;
    return false;
}

document.getElementById("client-host").addEventListener('keypress', e => {
    if (e.key == "Enter") {
        const input1 = document.getElementById("hostid-entry").value.trim();
        const input2 = document.getElementById("host-roomid-entry").value.trim();
        if (!goodInput(input1, input2)) {
            return alert("Invalid inputs");
        }
        startProgress(ProgElem)
        fetch('/host', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'HostID': input1, 'RoomID': input2 })
        })
            .then(res => res.json())
            .then(data => {
                if (data['status'] == 'ALLOWED') {
                    localStorage.setItem('secretroom_room_val_key', data['room_val_key'])
                    localStorage.setItem('secretroom_room_id', String(document.getElementById("host-roomid-entry").value).trim())
                    localStorage.setItem('secretroom_client_id', String(document.getElementById("hostid-entry").value).trim())
                    localStorage.setItem('secretroom_client_val_key', data['client_val_key'])
                    localStorage.setItem('secretroom_client_type', data['client_type'])
                    window.location.href = `./messages.html`
                } else {
                    alert("Invalid RoomID !");
                }
                stopProgress(ProgElem)
            })
    }
})

document.getElementById("client-join").addEventListener('keypress', e => {
    if (e.key == "Enter") {
        const input1 = document.getElementById("joinerid-entry").value.trim();
        const input2 = document.getElementById("join-roomid-entry").value.trim();
        if (!goodInput(input1, input2)) {
            return alert("Invalid inputs");
        }
        startProgress(ProgElem)
        fetch('/request-to-join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'JoinerID': input1, 'RoomID': input2 })
        })
            .then(res => res.json())
            .then(data => {
                stopProgress(ProgElem)
                if (data['status'] == 'FOUND') {
                    alert('Wait until acceptance !');
                    let waiting = true;
                    async function CheckForAcceptanceInterval() {
                        if (!waiting) return;
                        await new Promise((resolve) => {
                            startProgress(ProgElem)
                            fetch('/check-acceptance', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 'JoinerID': String(document.getElementById("joinerid-entry").value).trim(), 'RoomID': String(document.getElementById("join-roomid-entry").value).trim() })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    stopProgress(ProgElem)
                                    if (data['status'] == 'ALLOWED') {
                                        waiting = false
                                        alert('Request accepted !')
                                        localStorage.setItem('secretroom_room_val_key', data['room_val_key'])
                                        localStorage.setItem('secretroom_room_id', String(document.getElementById("join-roomid-entry").value).trim())
                                        localStorage.setItem('secretroom_client_id', String(document.getElementById("joinerid-entry").value).trim())
                                        localStorage.setItem('secretroom_client_val_key', data['client_val_key'])
                                        localStorage.setItem('secretroom_client_type', data['client_type'])
                                        window.location.href = `./messages.html`
                                    } else if (data['status'] == 'NOT_ALLOWED') {
                                        waiting = false
                                        alert('Request refused !')
                                    }
                                    resolve()
                                })
                        })
                        CheckForAcceptanceInterval()
                    }
                    CheckForAcceptanceInterval()
                } else if (data['status'] == 'NOT_FOUND') {
                    alert('Room not found')
                } else if (data['status'] == 'INVALID_JOINER_ID') {
                    alert('Invalid Joiner ID')
                } else {
                    alert('Something went wrong! Try again later')
                }
            })
    }
})

for (let elem of document.getElementsByClassName('info-container')) {
    $(elem).hide()
}

for (let i of document.getElementsByClassName("client-container")) {
    i.addEventListener('mouseleave', e => {
        if (!pointerInsideElement(i, e.clientX, e.clientY)) {
            for (let l of i.getElementsByClassName('info-container')) {
                setTimeout(() => { l.style.display = 'none' }, 100)
                $(l).hide(150)
            }
        }
    })
    i.addEventListener('mouseover', e => {
        for (let l of i.getElementsByClassName('info-container')) {
            $(l).show(150)
        }
    })
}

document.querySelector("html").style.height = document.documentElement.scrollHeight + "px";