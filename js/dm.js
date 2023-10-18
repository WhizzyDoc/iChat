
var base_url = `https://riganapi.pythonanywhere.com`;
/************* function to load chats ***************/
function loadChats() {
    var url = `${base_url}/api/chatrooms/get_chatrooms/?username=${localStorage.username}`;
    
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
        //console.log(data);
        $('.chat-table').empty();
        var f_name = "";
        if(data['status'] == "success") {
            if(data.data.length == 0) {
                var temp = `
                                <h5 class="w-bold w-padding">
                                    You do not have any chat messages yet. 
                                    <a href="#" class="w-text-red" onclick="openSearchUser();">click here</a> 
                                    to start connecting with friends
                                </h5>
                            `;
                $('.chat-table').append(temp);
                return  
            }
            for(var g in data.data) {
                gr = data.data;
                var time, message;
                if(gr[g].last_message != "") {
                    msg = gr[g].last_message;
                    if(msg.length > 20) {
                        message = msg.substring(0, 18) + "...";
                    }
                    else {
                        message = gr[g].last_message;
                    }
                    
                    var hour = new Date(gr[g].updated).getHours();
                    var min = new Date(gr[g].updated).getMinutes();
                    var session = (hour >= 12) ? "pm" : "am";
                    hour = (hour > 12) ? hour - 12 : hour;
                    min = (min < 10) ? "0" + min : min;
                    time = `${hour}:${min} ${session}`;
                }
                if(message.startsWith('file:')) {
                    message = `<i class="fa fa-file-o"></i> ${message}`;
                }
                var pro_img = '';
                var pro_name = '';
                var pro_n = '';
                var f_id = '';
                for(var i in gr[g].members) {
                    mem = gr[g].members;
                    if(mem[i].user.username != localStorage.username) {
                        $('#receiver_id').val(mem[i].id)
                        
                        pro_name = mem[i].user.username;

                        if(mem[i].user.is_superuser === true) {
                            pro_n = `${mem[i].user.username} <i class="fa fa-certificate verify"></i>`;
                        }
                        else {pro_n = mem[i].user.username;}
                        
                        if(mem[i].image != null) {
                            pro_img = `${base_url}${mem[i].image}`;
                        }
                        else {
                            if(mem[i].gender == 'Male') {
                                pro_img = 'image/male.jpeg';
                            }
                            else if(mem[i].gender == 'Female') {
                                pro_img = 'image/female.png';
                            }
                            else {
                                pro_img = 'image/other.jpeg';
                            }
                        }
                    }
                }
                //console.log(pro_img);
                var temp = `<tr class="user-chat" data-id="${gr[g].id}" data-name="${pro_name}" data-action="${f_id}" data-image="${pro_img}">
                                <td><img class="group-icon" src="${pro_img}" alt="" /></td>
                                <td>
                                    <div class="h6 w-bold-x">${pro_n}</div>
                                    <p class="w-left w-text-gray w-small">${message}</p>
                                    <p class="w-right w-small">${time}</p>
                                <td>
                            </tr>`;
                $('.chat-table').append(temp);
            }
            $('.user-chat').click(function() {
                var id = $(this).data('id');
                var name = $(this).data('name')
                var image = $(this).data('image')
                startChat(id, name, image);
            })
        }
        else if(data['status'] == 'error') {
            swal("Error", data['message'], "error");
        }
     })
     .catch(error => {
        console.log(error);
        swal("Oops", "Error occured!Please check your internet connection", "error");
    })
}

/************* function to get new messages in current DM ***************/
function getNewChats() {
    var url = `${base_url}/api/chatrooms/get_new_chats/?user_id=${localStorage.profile_id}`;
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
        //console.log(data);
        if(data['status'] == 'success') {
            $('#new_c_no').css('display', 'inline').html(data['number'])
            loadChats()
            //playTone('notification');
        }
        else if(data['status'] == 'error') {
            $('#new_c_no').css('display', 'none').html(`0`)
        }
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}

/************* function to load messages ***************/
// supported extensions
var imageExt = ['jpg', 'jpeg', 'png', 'gif'];
var videoExt = ['mp4', 'webm', 'ogg'];
var audioExt = ['mp3', 'wav', 'ogg'];
var pdfExt = ['pdf'];
var docExt = ['doc', 'docx', 'ppt', 'pptx', 'txt', 'pdf', 'xls', 'xlsx', 'txt', 'csv', 'html', 'xml', 'json', 'pptm', 'dotx', 'tsv', 'log', 'css', 'js', 'py', 'java', 'cpp', 'c', 'ejs', 'rar', 'zip', 'ini']

function loadMessages() {
    var id = localStorage.room_id;
    var url = `${base_url}/api/chatrooms/${id}/get_chats/?user_id=${localStorage.profile_id}`;
    
    fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        }
         return response.json() // convert response to json
    })
    .then(data => {
        //console.log(data);
        $('#chat-content').empty();
        if(data.blocked == true) {
            $('#dm-chat-form').css('display', 'none');
            $('.dm-block').css('display', 'flex');
        }
        else {
            $('#dm-chat-form').css('display', 'flex');
            $('.dm-block').css('display', 'none');
        }
        for(var i in data.data) {
            chat = data.data;
            var time, seen_icon = '';
            seen = chat[i].seen;
            
            var hour = new Date(chat[i].date).getHours();
            var min = new Date(chat[i].date).getMinutes();
            var session = (hour >= 12) ? "pm" : "am";
            hour = (hour > 12) ? hour - 12 : hour;
            min = (min < 10) ? "0" + min : min;
            time = `${hour}:${min} ${session}`;
        
            var class_name, delete_chat = '';
            if(chat[i].sender.user.username == localStorage.username) {
                class_name = "user";
                if(seen == true) {
                    seen_icon = `<i class="bx bx-check"></i><i class="bx bx-check"></i>`;
                }
                else {
                    seen_icon = `<i class="bx bx-check"></i>`;
                }
                delete_chat = `<i class="bx bx-trash option delete-chat" data-action="delete" data-id="${chat[i].id}"></i>`;
            }
            else {
                class_name = "other";
                
                if(chat[i].sender.online) {
                    $('.online').css('background-color' ,'#02fa02');
                }
                else {
                    $('.online').css('background-color' ,'#ddd');
                }
            }
            var starred = '';
            if(chat[i].starred_by != undefined) {
                for(var s in chat[i].starred_by) {
                    p = chat[i].starred_by;
                    if(p[s].user.username == localStorage.username) {
                        starred = `<i class="bx bx-star"></i>`;
                    }
                    else {starred = ''}
                }
            }
            var message, file, file_des;
            if(chat[i].files !== null) {
                var fileExt = chat[i].files.split('.').pop().toLowerCase();
                // supported extensions
                
                if(chat[i].file_description.length > 25) {
                    file_des = chat[i].file_description.substring(0, 18) + "..." + chat[i].file_description.split('.').pop();
                }
                else {
                    file_des = chat[i].file_description
                }
                if(imageExt.includes(fileExt)) {
                    file = `<img src="${base_url}${chat[i].files}" alt="" width="150px" height="auto" />
                            <div class="file-det">
                            <a href="${base_url}${chat[i].files}" data-image="${chat[i].files}" class="file-download"><i class="bx bx-download"></i></a>
                            <span>${file_des}</span>
                            </div>`;
                }
                else if(videoExt.includes(fileExt)) {
                    file = `<video src="${base_url}${chat[i].files}" width="150px" height="auto" controls muted>Video not supported</video>
                    <div class="file-det">
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(audioExt.includes(fileExt)) {
                    file = `<audio src="${base_url}${chat[i].files}" width="150px" controls>Audio not supported</audio>
                    <div class="file-det">
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(pdfExt.includes(fileExt)) {
                    file = `<div class="file-det">
                    <a href="${base_url}${chat[i].files}" data-image="${base_url}${chat[i].files}" class="file-download"><i class="bx bx-download"></i></a>
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(docExt.includes(fileExt)) {
                    file = `<div class="file-det">
                    <a href="${base_url}${chat[i].files}" data-image="${base_url}${chat[i].files}" class="file-download"><i class="bx bx-download"></i></a>
                    <span>${file_des}</span>
                    </div>`;
                }
                else {
                    file = `Unsupported file format.`;
                }
                
            }
            if(chat[i].message != null && chat[i].files == null) {
                message = `<div>${chat[i].message}<div>`;
            }
            else if(chat[i].message == null && chat[i].files != null) {
                message = `<div class="image-files">${file}</div>`
            }
            else if(chat[i].message != null && chat[i].files != null) {
                message = `<div class="image-files">${file}</div>
                <div>${chat[i].message}<div>`;
            }

            var temp = `<div class="message-con">
                            <div class="chat ${class_name}">
                                <div class="options">
                                    ${delete_chat}
                                    <!--
                                    <i class="bx bx-copy option copy-chat" data-action="copy" data-id="${chat[i].message}" data-name="dm"></i>
                                    -->
                                    <i class="bx bx-star option star-chat" data-action="star" data-id="${chat[i].id}" data-name="dm"></i>
                                    <i class="bx bx-share option forward-chat" data-action="forward" data-id="${chat[i].message}" data-name="dm"></i>
                                </div>
                                <div class="msg">${message}</div>
                                <div class="time w-right">${starred} ${time} ${seen_icon}</div>
                            </div>
                        </div>`;
            $('#chat-content').append(temp);
        }
        last_chat();
        $('.chat').click(function() {
            playTone('keypad');
            $(this).children('.options').toggleClass('active');
        })
        $('.option').click(function() {
            playTone('message_send');
            processChat($(this));
        })
        $('.file-download').click(function(e) {
            e.preventDefault();
            var path = $(this).data('image');
            path = path.slice(1);
            //console.log(path)
            downloadFile($(this), path)
        })
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
    var new_chat_url = `${base_url}/api/chatrooms/${localStorage.room_id}/get_new_room_chats/?user_id=${localStorage.profile_id}`;
    var new_dm = setInterval(getNewDM, 3000, new_chat_url);
    $('.close-chat').click(function() {
        $('.chat-container').removeClass('active');
        clearInterval(new_dm);
    });
}

/************* function to send DMs ***************/
function sendDM() {
    var id = localStorage.room_id;
    var url = `${base_url}/api/chatrooms/${id}/send_dm_chat/`;
    var sender_id = localStorage.profile_id;
    var chat = $('#chat-message').val();
    var file_input = $('input[name="chat-files"]');
    var file = undefined;
    if(file_input.get(0).files[0]) {
        file = file_input.get(0).files[0]
    }
    else if(file_input.get(1).files[0]) {
        file = file_input.get(1).files[0]
    }
    else if(file_input.get(2).files[0]) {
        file = file_input.get(2).files[0]
    }
    else if(file_input.get(3).files[0]) {
        file = file_input.get(3).files[0]
    }
    else if(file_input.get(4).files[0]) {
        file = file_input.get(4).files[0]
    };
    //console.log(file);
    //console.log(typeof(message));
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();
    var message, files;
    $('.file-preview').removeClass('active');
    if(chat.trim() == '' && file === undefined) {
        return;
    }

    if(file !== undefined) {
        var fileName = file.name;
        var fileExt = fileName.split('.').pop().toLowerCase();
        if(fileName.length > 25) {
            fileName = fileName.substring(0, 18) + "..." + fileName.split('.').pop();
        }

        if(imageExt.includes(fileExt)) {
            files = `<img src="${file}" alt="" width="150px" height="auto" />
                    <a href="${file}" download="${file.name}"><i class="bx bx-download"></i></a>
                    <p>${fileName}&nbsp;&nbsp;${file.size/1024}kB</p>`;
        }
        else if(audioExt.includes(fileExt)) {
            files = `<audio src="${file}" controls>Audio not supported</audio>
            <p>${fileName}&nbsp;&nbsp;${file.size/1048576}MB</p>`;
        }
        else if(videoExt.includes(fileExt)) {
            files = `<video src="${file}" width="200px" height="auto" controls>Video not supported</video>
            <p>${fileName}&nbsp;&nbsp;${file.size/1048576}MB</p>`;
        }
        else if(pdfExt.includes(fileExt)) {
            files = `<a href="${file}" download="${file.name}"><i class="bx bx-download"></i> ${fileName}</a>
            <p>${fileName}&nbsp;&nbsp;${file.size/1048576}MB</p>`;
        }
        else if(docExt.includes(fileExt)) {
            files = `<a href="${file}" download="${file.name}"><i class="bx bx-download"></i> ${fileName}</a>
            <p>${fileName}&nbsp;&nbsp;${file.size/1024}KB</p>`;
        }
        else {
            files = `Unsupported file format.`;
        }
        
    }
    $('input[name="chat-files"]').val('');
    
    $('.file-preview').removeClass('active');
    if(chat.trim() != '' && file === undefined) {
        message = `${chat}`;
    }
    else if(chat.trim() == '' && file !== undefined) {
        message = `<div class="image-files">${files}</div>`
    }
    else if(chat.trim() != '' && file !== undefined) {
        message = `<div class="image-files">${files}</div>
                    ${chat}`;
    }
    var session = (hour >= 12) ? "pm" : "am";
    hour = (hour > 12) ? hour - 12 : hour;
    min = (min < 10) ? "0" + min : min;
    time = `${hour}:${min} ${session}`;
    var temp = `<div class="message-con">
                            <div class="chat user">
                                <div class="msg">${message}</div>
                                <div class="time w-right">${time} <i class="bx bx-time"></i></div>
                            </div>
                        </div>`;
    $('#chat-content').append(temp);
    last_chat();
    $('#chat-send').attr('disabled', false);
    
    var linkRegex = /(?:https?|ftp):\/\/[\n\S]+/g;
    var asteriskRegex = /\*(.*?)\*/g;
    var hashRegex = /#(.*?)#/g;
    var entityRegex = /&#[^\s;]+;/g;
    var mssg = chat;
    if(mssg.match(linkRegex)) {
        p = mssg.replace(linkRegex, function(url) {
            return `<a href='${url}'>${url}</a>`;
        })
        mssg = p;
    }
    if(mssg.match(asteriskRegex)) {
        p = mssg.replace(asteriskRegex, function(match, content) {
            return `<span style='font-weight:700;'>${content}</span>`;
        })
        mssg = p;
    }
    if(mssg.match(hashRegex)) {
        p = mssg.replace(hashRegex, function(match, content) {
            return `<i>${content}</i>`;
        })
        mssg = p;
    }
    if(mssg.match(entityRegex)) {
        p = mssg.replace(entityRegex, function(match) {
            return `<span>${match}</span>`;
        })
        mssg = p;
    }
    const formData = new FormData()
    formData.append('sender_id', sender_id);
    formData.append('message', mssg);
    formData.append('file', file);
    $('#chat-message').val('');
    $('.send-btn')
      .removeClass('active').empty()
      .html(`<i class="bx bx-microphone"></i>`)
    /*
    JSON.stringify({
        sender_id: sender_id,
        receiver_id: receiver_id,
        message: message
    });
    */
    fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          },
        body: formData,
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        }
         return response.json() // convert response to json
     })
     .then(data => {
        if(data['status'] == 'success') {
            loadMessages();
            loadChats();
            $('input[name="chat-files"]').val('');
        }
     })
     .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })

}

/************* function to get new messages in current DM ***************/
function getNewDM(url) {
    fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        }
         return response.json() // convert response to json
    })
    .then(data => {
        //console.log(data);
        if(data['status'] == 'success') {
            loadMessages(localStorage.room_id)
        }
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}


function processChat(elem) {
    var action = elem.data('action');
    var param = elem.data('id');
    var profile = localStorage.profile_id;
    switch(action) {
        case "copy":
            copyChat(param)
            //alert('copied!');
            break;
        case "delete":
            var url = `${base_url}/api/chatrooms/${localStorage.room_id}/delete_chat/`;
            deleteChat(elem, param, url, profile);
            break;
        case "star":
            var url = `${base_url}/api/chatrooms/${localStorage.room_id}/star_chat/`;
            starChat(elem, param, url, profile);
            break;
        case "forward":
            //forwardChat(param, place, profile);
            break;
    }
}


function starChat(elem, param, url, id) {
    //alert(url)
    var formData = new FormData();
    formData.append('chat_id', param);
    formData.append('profile_id', id)
    fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          },
        body: formData,
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        }
         return response.json() // convert response to json
     })
     .then(data => {
        if(data['status'] == 'success-star') {
            //playTone('message_send');
            elem.parent('.options').siblings('.time').prepend(`<i class="bx bx-star"></i>`)
        }
        else if(data['status'] == 'success-unstar') {
            elem.parent('.options').siblings('.time').children('.bx-star').remove();
        }
     })
     .catch(error => {
        console.log(error);
        //alert(error);
        //swal("Oops", "Error occured!", "error");
    })
}


function copyChat(message) {
    const textArea = document.createElement('textarea');
    textArea.value = message;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea)
    swal('Success', 'copied!', 'success')
}

// private chat voice note
$('#chat-send').click(function(e) {
    if(!$(this).hasClass('active')) {
        e.preventDefault();
        var time_s = 0;
        var time_m = 0;
        const player = $('#record');
        let mediaRecorder;
        let audioChunks = [];
        var audio_blob = null;
        // start recording
        playTone('sound_recorder');
        $('#rec-time').html(`00:00`).show();
        $('#rec-state').show();
        $('#play-rec').show();
        $('.rec-audio-con').addClass('active')
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(function(stream) {
            mediaRecorder = new MediaRecorder(stream);
            var start_time = setInterval(function() {
                time_s += 1
                if(time_s >= 60) {
                    time_m += 1;
                    time_s = 0;
                }
                time_sec = (time_s < 10) ? '0' + time_s : time_s;
                time_min = (time_m < 10) ? '0' + time_m : time_m;
                $('#rec-time').html(`${time_min}:${time_sec}`)
            }, 1000)
            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };
            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
                audioChunks = [];
                clearInterval(start_time)
                $('#rec-time').html(`00:00`).hide();
                $('#rec-state').hide();
                $('#play-rec').hide();
                player.attr('src', URL.createObjectURL(audioBlob));
                player.show()
                var aud = player.attr('src')
                //alert(aud)
                fetch(aud)
                .then(response => {return response.blob()})
                .then(blob => {audio_blob = blob})
                .catch(err => console.log(err));
                $('#send-rec').show();
                $('#send-rec').click(function() {
                    if(audio_blob !== null) {
                        //console.log(audio_blob);
                        var file_ext = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
                        var id = localStorage.room_id;
                        var url = `${base_url}/api/chatrooms/${id}/send_dm_chat/`;
                        var sender_id = localStorage.profile_id;
                        const formData = new FormData();
                        formData.append('file', audio_blob, `recording_${file_ext}.mp3`);
                        formData.append('sender_id', sender_id);
                        var date = new Date();
                        var hour = date.getHours();
                        var min = date.getMinutes();
                        var session = (hour >= 12) ? "pm" : "am";
                        hour = (hour > 12) ? hour - 12 : hour;
                        min = (min < 10) ? "0" + min : min;
                        time = `${hour}:${min} ${session}`;
                        var message = `<div class="image-files">
                                        ${player}
                                        <p>${Math.floor(audio_blob.size/1024)}KB</p>
                                    </div>`;
                        var temp = `<div class="message-con">
                                    <div class="chat user">
                                        <div class="msg">${message}</div>
                                        <div class="time w-right">${time} <i class="bx bx-time"></i></div>
                                    </div>
                                </div>`;
                        $('#chat-content').append(temp);
                        $('.rec-audio-con').removeClass('active')
                        last_chat();

                        fetch(url, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              },
                            body: formData,
                        })
                        .then(response => {
                            if(!response.ok) {
                               throw new Error('Network response was not ok');
                            }
                             return response.json() // convert response to json
                         })
                         .then(data => {
                            if(data['status'] == 'success') {
                                player.attr('src', '').hide()
                                loadMessages();
                                loadChats();
                                $('.send-btn')
                                .removeClass('active').empty()
                                .html(`<i class="bx bx-microphone"></i>`)
                            }
                         })
                         .catch(error => {
                            console.log(error);
                            //swal("Oops", "Error occured!", "error");
                        })
                    }
                })
                
            };
            mediaRecorder.start();
        })
        .catch(function(error) {
            console.log('Error accessing microphone: ', error);
        });
        // stop recording
        $('#play-rec').click(function() {
            if(mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                //$('.rec-audio-con').removeClass('active')
            }
        })
        $('#cancel-rec').click(function() {
            $('.rec-audio-con').removeClass('active')
            player.attr('src', '').hide()
        })
    }
})


function startChat(id, name, image) {
    localStorage.setItem('room_id', id)
    $('.chat-container').addClass('active');
    $('.chat-input').val('');
    $('.icon-friend').attr('src', image);
    $('.friend-username').html(name);
    
    $('.chat-refresh').data('id', id);
    $('#chat-content').empty().html(`<div class="loader"></div>`);

    $('.emoji-but').click(function() {
        console.log('clicked');
        $('#dd-chat').toggleClass('show');
    })
    $('.emoji-but2').click(function() {
        console.log('clicked');
        $('#dd-group').toggleClass('show');
    })
    $('.emoji-but3').click(function() {
        console.log('clicked');
        $('#dd-reply').toggleClass('show');
    })
    
    loadMessages();
    loadChats();
}

function downloadFile(elem, path) {
    elem.addClass('active');
    var filename = path.split('/')
    filename = filename[filename.length - 1];
    var d_url = `${base_url}/api/chatrooms/download_file/?path=${path}`;
    fetch(d_url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        }
    })
    .then(response => {
     if(!response.ok) {
        throw new Error('Network response was not ok');
     }
      return response.blob() // convert response to json
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        elem.removeClass('active');
        elem.empty().html(`<i class="bx bx-check"></i>`)
    })
    .catch(error => {
        console.log(error);
        elem.removeClass('active');
        swal('Error', 'Error downloading file', 'error');
    })
}

function previewFile(input, type) {
    $('#file-preview').empty();
    if(input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            var file = '';
            //console.log(input.files[0])
            var fileName = input.files[0].name;
            if(fileName.length > 30) {
                fileName = fileName.substring(0, 22) + "..." + fileName.split('.').pop();
            }
            switch(type) {
                case "image":
                    file = `<img src="${e.target.result}" alt="" />
                    <div class="file-det">
                    <i style="color:#fff;font-size:30px;margin-right:5px;" class="fa fa-photo"></i> 
                    <span style="color:#fff;font-size:25px;">${fileName} ${Math.floor(input.files[0].size/1024)}KB</span>
                    </div>`;
                    break;
                case "pdf":
                    file = `<iframe src="${e.target.result}" style="width:250px;height:400px;border:none;"></iframe>
                    <div class="file-det">
                    <i style="color:#fff;margin-right:5px;" class="fa fa-file-pdf-o"></i> 
                    <span style="color:#fff;font-size:25px;">${fileName} ${Math.floor(input.files[0].size/1024)}KB</span>
                    </div>`;
                    break
                case "audio":
                    file = `<audio src="${e.target.result}" controls>Audio not supported</audio>
                    <div class="file-det">
                    <i style="color:#fff;font-size:30px;margin-right:5px;" class="fa fa-music"></i> 
                    <span style="color:#fff;font-size:25px;">${fileName} ${Math.floor(input.files[0].size/1024)}KB</span>
                    </div>`;
                    break
                case "video":
                        file = `<video src="${e.target.result}" width="100%" height="auto" controls>Video not supported</video>
                        <div class="file-det">
                        <i style="color:#fff;font-size:30px;margin-right:5px;" class="fa fa-video-camera"></i> 
                        <span style="color:#fff;font-size:25px;">${fileName} ${Math.floor(input.files[0].size/1024)}KB</span>
                        </div>`;
                    break
                case "doc":
                    file = `<div class="file-det">
                    <i style="color:#fff;margin-right:5px;" class="fa fa-file-o"></i> 
                    <span style="color:#fff;font-size:25px;">${fileName} ${Math.floor(input.files[0].size/1024)}KB</span>
                    </div>`;
                    break
            } 
        
        $('#file-preview').addClass('active').append(file);
        $('.send-btn')
        .addClass('active').empty()
        .html(`<i class="bx bx-send"></i>`)
        };
        reader.readAsDataURL(input.files[0]);
        $('.file-send-con').toggleClass('active')
    }
    
}
// Search user
function searchUser() {
    var query = $('#search-user').val();
    if(query.trim() === '') {
        return
    }
    var url = `${base_url}/api/users/search_user/?query=${query}`;
    $('#search-user-content').empty().html(`<div class="loader"></div>`)
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
        $('#search-user-content').empty()
        console.log(data);
        if(data['status'] == 'success') {
            u = data.data;
            for(var i in u) {
                var img;
                var superuser = '';
                if(u[i].user.is_superuser === true) {
                    superuser = ` <i class="fa fa-certificate verify"></i>`;
                }
                if(u[i].image) {
                    img = `${base_url}${u[i].image}`;
                }
                else {
                    if(u[i].gender == 'Male') {
                        img = 'image/male.jpeg';
                    }
                    else if(u[i].gender == 'Female') {
                        img = 'image/female.png';
                    }
                    else {
                        img = 'image/other.jpeg';
                    }
                }
                var temp = `<div class="user-item">
                <img class="user-item-img" alt="" src="${img}" />
                <div class="user-item-content">
                <div id="user-item-name" class="h6 w-bold-x">${u[i].firstName} ${u[i].lastName}${superuser}</div>
                <div id="user-item-username" class="h6">${u[i].user.username}</div>
                <div class="user-item-buttons">
                    <button class="btn btn-success chat-user" data-id="${u[i].id}" data-image="${img}" data-name="${u[i].user.username}">
                        <i class="fa fa-comment"></i> Chat
                    </button>
                    <button class="btn btn-primary profile-user" data-id="${u[i].id}" data-name="${u[i].user.username}">
                    <i class="fa fa-user"></i> Profile
                    </button>
                </div>
                </div>
            </div>`;
            $('#search-user-content').append(temp)
            }
        }
        else if(data['status'] == 'error') {
            var temp = `<h6 class="w-center w-text-gray">${data['message']}</h6>`;
            $('#search-user-content').append(temp);
        }

        $('.profile-user').click(function() {
            var id = $(this).data('id');
            var name = $(this).data('name');
            $('.search-user-container').removeClass('active');
            $('.profile-container').addClass('active');
            userProfile(id, name)
        })

        $('.chat-user').click(function() {
            var f_id = $(this).data('id');
            var f_name = $(this).data('name');
            var f_image = $(this).data('image');
            var user_id = localStorage.profile_id;
            $(this).empty().html(`<div class="loader" style="width:20px;height:20px"></div>`);
            var url = `${base_url}/api/chatrooms/find_chatroom/?user_id=${user_id}&friend_id=${f_id}`;
            fetch(url, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                  }
            })
            .then(response => {
                if(!response.ok) {
                   throw new Error('Network response was not ok');
                }
                 return response.json() // convert response to json
            })
            .then(data => {
                //console.log(data);
                if(data['status'] == 'success') {
                    $('.search-user-container').removeClass('active');
                    var id = data.data.id;
                    startChat(id, f_name, f_image);
                }
                else if(data['status'] == 'error') {
                    swal('Error', data['message'], 'error');
                }
                $('.chat-user').empty().html(`<i class="fa fa-comment"></i> Chat`);
            })
            .catch(error => {
                console.log(error);
                //swal("Oops", "Error occured!", "error");
                $('.chat-user').empty().html(`<i class="fa fa-comment"></i> Chat`);
            });
        })
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}


// view user profile
function myProfile() {
    var url = `${base_url}/api/users/get_profile/`;
    const formData = JSON.stringify({
        'username': localStorage.username,
        'password': localStorage.password
    })
    fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
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
            p = data.data;
            var dp;
            if(p.image != null) {
                dp = `${base_url}${p.image}`;
            }
            else {
                if(p.gender == 'Male') {
                    dp = 'image/male.jpeg';
                }
                else if(p.gender == 'Female') {
                    dp = 'image/female.png';
                }
                else {
                    dp = 'image/other.jpeg';
                }
            }
            $('.u-profile-dp').attr('src', dp);
            $('#pp-user').html(p.user.username);
            $('#pp-name').html(`${p.firstName} ${p.lastName}`);
            $('#pp-email').html(p.email);
            $('#pp-tel').html(p.phone_number);
            $('#pp-gender').html(p.gender);
            $('#pp-bio').html(p.bio);

            $('.pp-btn').click(function(e) {
                e.preventDefault();
                var url = `${base_url}/api/users/update_profile_image/`;
                var image = $('#pp-input')[0].files[0];
                //console.log(image);
                const formData = new FormData();
                formData.append('image', image);
                formData.append('username', localStorage.username);
                $(this).html(`<div class="loader" style="width:20px;height:20px;"></div>`)
                .attr('disabled', true);
            
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                        },
                    body: formData,
                })
                .then(response => {
                    if(!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json() // convert response to json
                })
                .then(data => {
                    console.log(data);
                    $('.pp-btn').html('Save Image').attr('disabled', false)
                    if(data['status'] == 'success') {
                        swal("Success", data['message'], "success");
                        $('.pp-btn').hide();
                    }
                    else if(data['status'] == 'error') {
                        swal("Error", data['message'], "error");
                    }
                })
                .catch(error => {
                    console.log(error);
                    swal("Oops", "Error occured!", "error");
                })
            })

            $('.pp-edit').click(function() {
                var name = $(this).data('name')
                editProfile(data.data, name)
            })

            $('.account-rem').click(function() {
                var option = $(this).data('name');
                //$('.logout').click();
                accountOption(option);
            })
        }
     })
     .catch(err => {
        console.log(err)
     })
}

function accountOption(opt) {
    swal({
        title: `Are you sure you want to ${opt} your account?`,
        input: 'password',
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        inputPlaceholder: `Enter your password to confirm`,
        inputValidator: (value) => {
           if(value == "") {
              return "Field cannot be empty!";
           }
        },
    })
    .then((result) => {
        if(result.value) {
           pass = result.value;
           if(pass != localStorage.password) {
            swal('Error', 'Incorrect Password', 'error');
            return;
           }
           else {
            var url = `${base_url}/api/users/account_options/`
            const formData = JSON.stringify({
                option: opt,
                username: localStorage.username
            });
        
            fetch(url, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: formData,
            })
            .then(response => {
                if(!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json() // convert response to json
            })
            .then(data => {
                console.log(data)
                if(data.status == 'success') {
                    swal('Success', data['message'], 'success');
                    setTimeout(function() {
                        location.href = './login.html';
                    }, 3000);
                }
                else if(data.status == 'error') {
                    swal('Error', data['message'], 'error');
                }
            })
            .catch(err => {
                console.log(err);
            })
           }
        }
    })
}

function editProfile(p, name) {
    var title, type, value;
    switch(name) {
        case "username":
            title = 'username';
            value = p.user.username;
            type = 'text';
            break;
        case "name":
            title = 'full name';
            value = p.firstName + ' ' + p.lastName;
            type = 'text';
            break;
        case "phone":
            title = 'phone number';
            value = p.phone_number;
            type = 'tel';
            break;
        case "email":
            title = 'email';
            value = p.email;
            type = 'email';
            break;
        case "bio":
            title = 'bio';
            value = p.bio;
            type = 'textarea';
            break;
        case "api-key":
            title = 'API Key';
            value = p.openai_key;
            type = 'text';
            break;
        case "pin":
            title = 'recovery PIN';
            value = p.pin;
            type = 'text';
            break;
    }
    swal({
        title: `Edit ${title}`,
        input: type,
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        inputValue: value,
        inputPlaceholder: `Enter your ${title}`,
        inputValidator: (value) => {
           if(value == "") {
              return "Field cannot be empty!";
           }
        },
     })
     .then((result) => {
        if(result.value) {
           val = result.value;
           //alert(val);
           var url = `${base_url}/api/users/update_profile/`;
           var username = p.user.username;
           var firstName = p.firstName;
           var lastName = p.lastName;
           var email = p.email;
           var phoneNumber = p.phone_number;
           var pin = p.pin;
           var bio = p.bio
           var api_key = p.openai_key;

           switch(name) {
                case "username":
                    username = val;
                    break;
                case "name":
                    f_name = val.split(' ');
                    firstName = f_name[0]
                    lastName = f_name[1]
                    break;
                case "phone":
                    phoneNumber = val
                    break;
                case "email":
                    email = val
                    break;
                case "bio":
                    bio = val
                    break;
                case "api-key":
                    api_key = val;
                    break;
                case "pin":
                    pin = val;
                    break;
            }


            const formData = JSON.stringify({
                username: username,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber,
                pin: pin,
                bio: bio,
                api_key: api_key
            });
        
            fetch(url, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: formData,
            })
            .then(response => {
                if(!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json() // convert response to json
            })
            .then(data => {
                console.log(data)
                swal(data.status, data.message, data.status);
                myProfile()
            })
            .catch(err => {
                console.log(err);
            })
        }
     });
}

// check friend profile
function userProfile(id, name) {
    $('.name-title').empty().html(name);
    //$('#profile-content').empty().html(`<div class="loader"></div>`);
    var url = `${base_url}/api/users/${id}/get_user_profile/?user_id=${localStorage.profile_id}`;

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
        //console.log(data);
        if(data['status'] == 'success') {
            //alert('successful');
            var pro = data.data;
            $('.name-pro').html(`${pro.firstName} ${pro.lastName}`);
            $('.email-pro').html(`${pro.email}`);
            $('.phone-pro').html(`${pro.phone_number}`);
            if(pro.bio !== null) {
                $('#pro-bio').html(`${pro.bio}`);
            }
            else {$('#pro-bio').html(`No bio`);}
            if(pro.image) {
                $('.profile-dp').attr('src', `${base_url}${pro.image}`);
                $('.message-user').data('image', `${base_url}${pro.image}`)
            }
            else {
                if(pro.gender == 'Male') {
                    $('.profile-dp').attr('src', `./image/male.jpeg`);
                    $('.message-user').data('image', `./image/male.jpeg`)
                }
                else if(pro.gender == 'Female') {
                    $('.profile-dp').attr('src', `./image/female.png`);
                    $('.message-user').data('image', `./image/female.png`)
                }
                else {
                    $('.profile-dp').attr('src', `./image/other.jpeg`);
                    $('.message-user').data('image', `./image/other.jpeg`)
                }
            }
            var g = data.groups;
            $('.user-group-list').empty();
            for(var i in g) {
                var members = g[i].members;
                for(var m in members) {
                    if(members[m].user.username == localStorage.username) {
                        var temp = `<div class="user-group-item">
                                <img class="group-icon" alt="" src="./image/group.jpeg" />
                                <div>
                                <div class="h6 w-bold-x">${g[i].title}</div>
                                <p class="w-small w-text-gray"><i class="fa fa-lock"></i> ${g[i].type}&nbsp;&nbsp;&nbsp;<i class="fa fa-group"></i> ${g[i].members.length} members</p>
                                </div>
                            </div>`;
                        $('.user-group-list').append(temp);
                    }
                }
                
            }
            var f = data.friends
            var mf = data.my_friends
            $('.user-option-list').empty();
            var tempo = `<div class="user-option-item w-text-blue" data-action="add" data-id="${pro.id}" data-name="${pro.user.username}">
                            <i class="fa fa-user-plus"></i>&nbsp;&nbsp;Add ${pro.user.username} as Friend
                        </div>`;

            for(var p in f.active_friends) {
                a = f.active_friends[p];
                if(a.user.username == localStorage.username) {
                    tempo = `<div class="user-option-item w-text-green" data-action="accept" data-id="${pro.id}" data-name="${pro.user.username}">
                                <i class="fa fa-check-circle"></i>&nbsp;&nbsp;Accept Friend Request
                            </div>`;
                }
            } 
            for(var i in mf.active_friends) {
                af = mf.active_friends[i];
                if(af.user.username == pro.user.username) {
                    tempo = `<div class="user-option-item w-text-red" data-action="block" data-id="${pro.id}" data-name="${pro.user.username}">
                                    <i class="fa fa-times-circle"></i>&nbsp;&nbsp;Block ${pro.user.username}
                                </div>`;
                }
            }
            for(var i in mf.blocked_friends) {
                af = mf.blocked_friends[i];
                if(af.user.username == pro.user.username) {
                    tempo = `<div class="user-option-item w-text-red" data-action="unblock" data-id="${pro.id}" data-name="${pro.user.username}">
                                    <i class="fa fa-unlock"></i>&nbsp;&nbsp;Unblock ${pro.user.username}
                                </div>`;
                }
            }
            $('.user-option-list').append(tempo);

            $('.user-option-item').click(function() {
                var f_id = $(this).data('id');
                //alert(f_id)
                var action = $(this).data('action');
                var name = $(this).data('name');
                userOption(f_id, action, name);
            })

            $('message-user').click(function(e) {
                e.preventDefault();
                var f_name = pro.user.username;
                var f_image = $(this).data('image');
                var user_id = localStorage.profile_id;
                var url = `${base_url}/api/chatrooms/find_chatroom/?user_id=${user_id}&friend_id=${pro.id}`;
                fetch(url, {
                    method: 'GET',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if(!response.ok) {
                    throw new Error('Network response was not ok');
                    }
                    return response.json() // convert response to json
                })
                .then(data => {
                    //console.log(data);
                    if(data['status'] == 'success') {
                        $('.profile-container').removeClass('active');
                        var id = data.data.id;
                        startChat(id, f_name, f_image);
                    }
                    else if(data['status'] == 'error') {
                        swal('Error', data['message'], 'error');
                    }
                })
                .catch(error => {
                    console.log(error);
                    //swal("Oops", "Error occured!", "error");
                });
            })
        }
        else if(data['status'] == 'error') {
            //alert('error');
        }
     })
     .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}


function userOption(id, action, name) {
    var url = `${base_url}/api/users/${id}/user_option/`;
    var act;
    switch(action) {
        case "add":
            act = `<i class="fa fa-user-plus"></i>&nbsp;&nbsp;Adding...`;
            break;
        case "accept":
            act = `<i class="fa fa-check-circle"></i>&nbsp;&nbsp;Accepting...`;
            break;
        case "block":
            act = `<i class="fa fa-times-circle"></i>&nbsp;&nbsp;Blocking...`;
            break;
        case "unblock":
            act = `<i class="fa fa-unlock"></i>&nbsp;&nbsp;Unblocking...`;
            break;
    }
    $('.user-option-item').empty().html(act);

    const formData = new FormData();
    formData.append('user_id', localStorage.profile_id)
    formData.append('action', action)

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
            swal('Success', data.message, 'success');
        }
        else if(data.status == 'error') {
            swal('Error', data.message, 'error');
        }
        userProfile(id, name)
     })
     .catch(err => {
        console.log(err);
        userProfile(id, name)
     })
}
