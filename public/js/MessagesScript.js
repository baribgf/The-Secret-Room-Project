const SendButton = document.getElementById("send-button");
const ChatArea = document.getElementById("chat-area");
const TextArea = document.getElementById("text-area");
const MembersList = document.getElementById("members-list");

const ClientID = localStorage.getItem('secretroom_client_id');
const ClientValKey = localStorage.getItem('secretroom_client_val_key');
const ClientType = localStorage.getItem('secretroom_client_type');
const RoomID = localStorage.getItem('secretroom_room_id');
const RoomValKey = localStorage.getItem('secretroom_room_val_key');

var ChatData = "";
var MembersData = "";
var Connected = true;
const RIGHT_MSG_COLORS = ["#096386", "#233E8B"];
const LEFT_MSG_COLORS = ["#464159", "#464255"];

function newMessage(id, user, content, datetime) {
    let msgBox = document.createElement("msg-container")
    msgBox.setAttribute("msg-id", id)

    if (user === ClientID) {
        msgBox.style.alignSelf = "flex-end";
        msgBox.style.background = `linear-gradient(45deg, ${RIGHT_MSG_COLORS[0]}, ${RIGHT_MSG_COLORS[1]})`;
    } else {
        msgBox.style.alignSelf = "flex-start";
        msgBox.style.background = `linear-gradient(45deg, ${LEFT_MSG_COLORS[0]}, ${LEFT_MSG_COLORS[1]})`;
    }

    let clid = document.createElement("clid")
    clid.innerHTML = user
    msgBox.appendChild(clid)

    let msg = document.createElement("msg")
    msg.innerHTML = content.replaceAll('\\n', "<br>")
    msgBox.appendChild(msg)

    let msgToolBar = document.createElement("msg-toolbar")
    msgBox.appendChild(msgToolBar)

    let msgDatetime = document.createElement("msg-datetime")
    try {
        if (new Date().toLocaleString().split(', ')[0] == datetime.split(', ')[0]) {
            msgDatetime.innerText = datetime.split(', ')[1]
        } else {
            msgDatetime.innerText = datetime
        }
    } catch (TypeError) {
        msgDatetime.innerText = datetime
    }

    msgBox.appendChild(msgDatetime)

    return msgBox;
}

function updateMsgToolbars() {
    return new Promise((resolve) => {
        for (const msgBox of document.getElementsByTagName("msg-container")) {
            const ANIM_DURATION = 200
            const msgToolBar = document.createElement("msg-toolbar")
            msgToolBar.style.left = `${msgBox.getBoundingClientRect().left}px`
            msgToolBar.style.top = `${msgBox.getBoundingClientRect().top - 31}px`

            // begin: msg toolbar items
            const msgToolBarDelBtn = document.createElement("span")
            msgToolBarDelBtn.innerText = "Delete"
            msgToolBarDelBtn.setAttribute("class", "msg-toolbar-item")
            msgToolBarDelBtn.onclick = async () => {
                await deleteMessage(msgBox.getAttribute("msg-id"))
            }
            msgToolBar.appendChild(msgToolBarDelBtn)

            const msgToolBarCopyBtn = document.createElement("span")
            msgToolBarCopyBtn.innerText = "Copy"
            msgToolBarCopyBtn.setAttribute("class", "msg-toolbar-item")
            msgToolBar.appendChild(msgToolBarCopyBtn)
            // end: msg toolbar items

            let toReplace = null
            for (const child of msgBox.children) {
                if (child.tagName.toLowerCase() == "msg-toolbar") {
                    toReplace = child
                    break
                }
            }

            msgBox.onmouseenter = () => {
                try {
                    msgBox.replaceChild(msgToolBar, toReplace)
                } catch (error) {
                }

                $(msgToolBar).fadeIn(ANIM_DURATION)
                msgToolBar.style.display = "flex"
            }
            msgBox.onmouseleave = () => {
                msgToolBar.style.display = "none"
                $(toReplace).fadeOut(ANIM_DURATION)
            }
        }
        resolve()
    })
}

function deleteMessage(MessageId) {
    return new Promise((resolve) => {
        fetch('/api-cr-ck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "command": "delete_message", "message_id": MessageId, "roomid": RoomID, "room_val_key": RoomValKey, "clientid": ClientID, "client_val_key": ClientValKey })
        })
            .then(res => {
                if (res.status == 403) window.location.href = "/403.html";
                return res.text()
            })
            .then(data => {
            	resolve()
            })
    })
}

function loadChat() {
    return new Promise((resolve) => {
        fetch('/api-cr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "command": "read_chat", "roomid": RoomID, "clientid": ClientID })
        })
            .then(res => {
                if (res.status == 403) window.location.href = "/403.html";
                return res.json()
            })
            .then(data => {
                if (data.toString() != ChatData.toString() && data['status'] != 'NO') {
                    ChatData = data
                    $(ChatArea).empty()

                    for (let i = 0; i < data.length; i++) {
                        ChatArea.appendChild(newMessage(data[i][0], data[i][1], data[i][2], data[i][3]));
                    }

                    ChatArea.scrollTop = ChatArea.scrollHeight;
                }
            })
            .finally(() => {
                resolve()
            })
    })
}

function deleteJoiner(joinerid) {
    fetch("/api-cr-ct", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'command': 'delete_joiner', 'joinerid': joinerid, 'roomid': RoomID, 'room_val_key': RoomValKey, 'clientid': ClientID, 'client_val_key': ClientValKey })
    })
        .then(res => {
            alert("You are deleting a joiner !")
            return res.text()
        })
}

function getMembers() {
    return new Promise((resolve) => {
        fetch('/api-cr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "command": "get_members", "roomid": RoomID, "clientid": ClientID })
        })
            .then(res => {
                if (res.status == 403) window.location.href = "/403.html";
                return res.json()
            })
            .then(data => {
                if (MembersData != data) {
                    MembersData = data;
                    $(MembersList).empty()
                    for (const member of Object.keys(MembersData)) {
                        const memElem = document.createElement("li")
                        memElem.setAttribute("class", "member horizontal-container")
                        memElem.innerHTML = member
                        const memTypeElem = document.createElement("span")
                        memTypeElem.setAttribute("class", "member-type-elem")
                        memTypeElem.innerHTML = MembersData[member]
                        memElem.appendChild(memTypeElem)

                        if (ClientType === "host" && member != ClientID) {
                            const memDelElem = document.createElement("span")
                            memDelElem.setAttribute("class", "member-del-item")
                            memDelElem.innerText = "X"
                            memDelElem.onclick = () => {
                                deleteJoiner(member)
                            }
                            memElem.appendChild(memDelElem)
                        }

                        MembersList.appendChild(memElem)
                    }
                }
                resolve()
            })
            .finally(() => {
                resolve()
            })
    })
}

function checkRequests() {
    return new Promise((resolve) => {
        fetch('/api-cr-ct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "command": "check_requests", "roomid": RoomID, "room_val_key": RoomValKey, 'clientid': ClientID, 'client_val_key': ClientValKey })
        })
            .then(res => {
                if (res.status == 403) window.location.href = "/403.html";
                return res.json()
            })
            .then(data => {
                if (data['status'] == 'FOUND') {
                    let decision = window.confirm(data['request'] + " wants to join")
                    if (decision == true) {
                        fetch('/api-cr-ct', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ "command": "accept_request", "request": data['request'], "roomid": RoomID, "room_val_key": RoomValKey, 'clientid': ClientID, 'client_val_key': ClientValKey })
                        })
                            .then(res => {
                                if (res.status == 403) window.location.href = "/403.html";
                            })
                    } else if (decision == false) {
                        fetch('/api-cr-ct', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ "command": "refuse_request", "request": data['request'], "roomid": RoomID, "room_val_key": RoomValKey, 'clientid': ClientID, 'client_val_key': ClientValKey })
                        })
                            .then(res => {
                                if (res.status == 403) window.location.href = "/403.html";
                            })
                    }
                }
                resolve()
            })
            .finally(() => {
                resolve()
            })
    })
}

function sendMessage() {
    return new Promise((resolve) => {
        let prepMessage = String(TextArea.value)
        prepMessage = prepMessage.trim()
        TextArea.value = "";

        if (prepMessage.replaceAll("\\n", "").length > 0 && prepMessage.length > 0) {
            prepMessage = prepMessage.replaceAll('\n', "\\n")
            let sentMessage = prepMessage;
            fetch('/api-cr-ck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "command": "write_message", "message": sentMessage, "datetime": new Date().toLocaleString(), "roomid": RoomID, "room_val_key": RoomValKey, "clientid": ClientID, "client_val_key": ClientValKey })
            })
                .then(res => {
                    if (res.status === 403) window.location.href = "/403.html";
                    return res.text()
                })
        }
        resolve()
    })
}

async function mainInterval() {
    if (Connected) {
        await loadChat()
        await updateMsgToolbars()
        await getMembers()
        if (ClientType == 'host') await checkRequests()
        setTimeout(() => {
			mainInterval()
        }, 100)
    } else {
    	console.log("Exiting main interval . . !")
        return 0
    }
}

mainInterval()

SendButton.addEventListener('click', async () => {
    await sendMessage()
})

if (ClientType === "host") {
    fetch('/host-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "command": 'cancel_clear_room', "roomid": RoomID, "room_val_key": RoomValKey, 'clientid': ClientID, 'client_val_key': ClientValKey })
    })
        .then(res => {
            if (res.status == 403) window.location.href = "/403.html";
            return res.text()
        })

    window.addEventListener('beforeunload', () => {
        Connected = false;
        window.location.href = '../index.html'
        fetch('/host-exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "command": 'clear_room', "roomid": RoomID, "room_val_key": RoomValKey, 'clientid': ClientID, 'client_val_key': ClientValKey })
        })
            .then(res => {
                if (res.status == 403) window.location.href = "/403.html";
                return res.text()
            })
    })
}
