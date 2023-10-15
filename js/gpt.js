var base_url = `https://riganapi.pythonanywhere.com`;
function loadGPTMessages() {
    var url;
    if(localStorage.gpt_room_id) {
        url = `${base_url}/api/gptrooms/get_current_room/?user_id=${localStorage.profile_id}&room_id=${localStorage.gpt_room_id}`;
    }
    else {
        url = `${base_url}/api/gptrooms/get_current_room/?user_id=${localStorage.profile_id}`;
    }
    fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          }
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        } 
         return response.json() // convert response to json
    })
    .then(data => {
        //console.log(data)
        $('#gpt-content').empty()
        if(data['status'] == 'success') {
            if(data['mode'] == 'new') {
                localStorage.setItem('gpt_room_id', data.data.room_id)
            }
            else if(data['mode'] == 'existing' || data['mode'] == 'first') {
                if(data['mode'] == 'first') {
                    localStorage.gpt_room_id = data.room.room_id;
                }
                c = data.data;
                for(var i in c) {
                    var hour = new Date(c[i].date).getHours();
                    var min = new Date(c[i].date).getMinutes();
                    var session = (hour >= 12) ? "pm" : "am";
                    hour = (hour > 12) ? hour - 12 : hour;
                    min = (min < 10) ? "0" + min : min;
                    time = `${hour}:${min} ${session}`;

                    var temp = `<div class="message-con">
                                    <div class="chat user">
                                        <div class="options">
                                            <i class="bx bx-copy option copy-chat" data-action="copy" data-id="${c[i].prompt}" data-name="dm"></i>
                                        </div>
                                        <div class="msg">${c[i].prompt}</div>
                                        <div class="time w-right">${time}</div>
                                    </div>
                                </div>
                                <div class="message-con">
                                    <div class="chat other">
                                        <div class="options">
                                            <i class="bx bx-copy option copy-chat" data-action="copy" data-id="${c[i].reply}" data-name="dm"></i>
                                        </div>
                                        <div class="msg">${c[i].reply}</div>
                                        <div class="time w-right">${time}</div>
                                    </div>
                                </div>`;
                    $('#gpt-content').append(temp)
                }
                last_chat();
            }
        }
        else if(data['status'] == 'error') {
            if(data['mode'] == 'first') {
                localStorage.gpt_room_id = data.room.room_id;
            }
            $('#gpt-content').html(`<p class="w-center w-text-gray w-small">${data.message}</p>`)
        }
    })
    .catch(error => {
        console.log(error);
    })
}

function loadHistory() {
    var url = `${base_url}/api/gptrooms/get_gpt_rooms/?user_id=${localStorage.profile_id}`;
    fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          }
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        } 
         return response.json() // convert response to json
    })
    .then(data => {
        //console.log(data)
        $('#gpt-history-content').empty()
        if(data['status'] == 'success') {
            h = data.data;
            for(var i in h) {
                var title;
                t = h[i].title;
                if(t.length > 28) {
                    title = t.substring(0, 25) + "...";
                }
                else {
                    title = t;
                }
                var temp = `<tr class="history-item" data-id="${h[i].room_id}">
                                <td><i class="fa fa-comments"></i>&nbsp;&nbsp;${title}</td>
                            </tr>`;
                $('#gpt-history-content').append(temp);
            }
        }
        else if(data['status'] == 'error') {
            var temp = `<tr>
                                <td>${data.message}</td>
                            </tr>`;
            $('#gpt-history-content').append(temp);
        }

        $('.history-item').click(function() {
            var id = $(this).data('id');
            localStorage.gpt_room_id = id;
            $('.gpt-history-container').removeClass('active');
            loadGPTMessages();
        })
    })
    .catch(error => {
        console.log(error);
    })
}

function sendGPTChat() {
    var url = `${base_url}/api/gptrooms/send_gpt_chat/`;
    const formData = new FormData();
    var prompt = $('#gpt-prompt').val();
    if(prompt.trim() == '') {
        return;
    }
    formData.append('user_id', localStorage.profile_id);
    formData.append('room_id', localStorage.gpt_room_id);
    formData.append('prompt', prompt)

    // get current time
    var hour = new Date().getHours();
    var min = new Date().getMinutes();
    var session = (hour >= 12) ? "pm" : "am";
    hour = (hour > 12) ? hour - 12 : hour;
    min = (min < 10) ? "0" + min : min;
    time = `${hour}:${min} ${session}`;

    // append chat to container
    var temp = `<div class="message-con">
                    <div class="chat user">
                        <div class="options">
                            <i class="bx bx-copy option copy-chat" data-action="copy" data-id="${prompt}" data-name="dm"></i>
                        </div>
                        <div class="msg">${prompt}</div>
                        <div class="time w-right">${time}</div>
                    </div>
                </div>
                <div class="message-con temporary">
                    <div class="chat other">
                        <div class="msg">Generating response...</div>
                    </div>
                </div>`;
    $('#gpt-content').append(temp)
    last_chat();

    $('#gpt-prompt').val('');
    fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          },
        body: formData
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        } 
         return response.json() // convert response to json
    })
    .then(data => {
        //console.log(data);
        $('.temporary').remove();
        if(data.status == 'success') {

            var temp = `<div class="message-con">
                    <div class="chat other">
                        <div class="options">
                            <i class="bx bx-copy option copy-chat" data-action="copy" data-id="${data.data.reply}" data-name="dm"></i>
                        </div>
                        <div class="msg" id="reply_${data.data.id}"></div>
                        <div class="time w-right">${time}</div>
                    </div>
                </div>`;
            $('#gpt-content').append(temp)

            var txt = data.data.reply;
            elem = $(`#reply_${data.data.id}`);
            typeWriter(txt, elem);
            //loadGPTMessages()
        }
        else if(data.status == 'error') {
            var message;
            if(data.mode == 'server') {
                message = data.message;
            }
            else if(data.mode == 'gpt') {
                message = `Error while generating response. could be due to:<br><br>
                            <ul>
                                <li>No internet connection</li>
                                <li>Invalid/incorrect API key</li>
                                <li>Exhausted API limits</li>
                                <li>Server error</li>
                            </ul>`;
            }
            var temp = `<div class="message-con">
                    <div class="chat other">
                        <div class="msg error-message">${message}</div>
                    </div>
                </div>`;
            $('#gpt-content').append(temp);
            last_chat();
        }
    })
    .catch(err => {
        var temp = `<div class="message-con">
                    <div class="chat other">
                        <div class="msg error-message">${err}</div>
                    </div>
                </div>`;
            $('#gpt-content').append(temp);
            last_chat();
    })
}

function createGPTRoom() {
    var url = `${base_url}/api/gptrooms/create_gpt_room/`;
    const formData = new FormData();
    formData.append('user_id', localStorage.profile_id);
    $('.create-new-room').empty().html(`<div class="loader" style="width:20px;height:20px"></div>`)
    
    fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          },
        body: formData
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        } 
         return response.json() // convert response to json
    })
    .then(data => {
        console.log(data);
        if(data.status == 'success') {
            localStorage.gpt_room_id = data.data.room_id;
            $('.gpt-history-container').removeClass('active');
            loadGPTMessages();
            loadHistory();
        }
        else if(data.status == 'error') {
            swal('Error', data.message, 'error');
        }
        $('.create-new-room').empty().html(`<i class="fa fa-plus"></i> New Conversation`)
    })
    .catch(err => {
        console.log(err);
        $('.create-new-room').empty().html(`<i class="fa fa-plus"></i> New Conversation`)
    })
}


var i = 0
var speed = 30
function typeWriter(txt, elem) {
    if (i < txt.length) {
        elem.html(txt.substring(0, i + 1));
        i++;
        last_chat();
        setTimeout(function() {
            typeWriter(txt, elem);
        }, speed);
    }
}

// hello
// what are you?
// who is the president of America
// what question did i ask just before this?
