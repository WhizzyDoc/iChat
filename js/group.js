var base_url = `https://riganapi.pythonanywhere.coms`;
function last_chat() {
    $('.app-content').scrollTop($('.app-content')[0].scrollHeight);
    $('#gpt-content').scrollTop($('#gpt-content')[0].scrollHeight);

};
  
/************* function to load groups ***************/
function loadGroups(user) {
    var url = `${base_url}/api/groups/get_groups/?username=${user}`;

    fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          },
    })
    .then(response => {
        if(!response.ok) {
           throw new Error('Network response was not ok');
        } 
         return response.json() // convert response to json
     })
     .then(data => {
        //console.log(data);
        $('.group-table').empty();
        if(data['status'] == "success") {
            for(var g in data.data) {
                gr = data.data;
                var time = '', message = '';
                var img = '';
                if(gr[g].image) {
                    img = `${base_url}${gr[g].image}`;
                }
                else {
                    img = `./image/group.jpeg`;
                }
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
                var temp = `<tr class="group-chat" id="${gr[g].members.length}" data-id="${gr[g].id}" data-name="${gr[g].title}" data-image="${img}">
                                <td><img class="group-icon" src="${img}" alt="" /></td>
                                <td>
                                    <div class="h6 w-bold-x">${gr[g].title}</div>
                                    <p class="w-left w-text-gray w-small">~${message}</p>
                                    <p class="w-right w-small">${time}</p>
                                <td>
                            </tr>`;
                $('.group-table').append(temp);
            }
            
            $('.group-chat').click(function() {
                var id = $(this).data('id');
                var name = $(this).data('name')
                var image = $(this).data('image')
                var mem = $(this).attr('id');
                $('.group-chat-container').addClass('active');
                localStorage.setItem('group_id', id)
                $('.chat-input').val('');
                $('.group-title').html(`${name}<br><small>${mem} participants</small>`);
                $('.icon-group').attr('src', image);
                $('.group-chat-refresh').data('id', id);
                $('#group-chat-content').empty().html(`<div class="loader"></div>`);
                loadGroupMessages();
                loadGroups(localStorage.username);
            })
            
        }
        else if(data['status'] == 'error1') {
            $('.group-table').empty()
            $('.group-table').append(data['message']);
        }
        else if(data['status'] == 'error') {
            swal("Error", data['message'], "error");
        }
        $('.page-loader').fadeOut('slow');
        
     })
     .catch(error => {
        console.log(error);
        swal("Oops", "Error occured!\nPlease check your internet connection", "error");
    })
    
}


/************* function to get new messages in current Group ***************/
function getNewChatsG() {
    var url = `${base_url}/api/groups/get_new_chats/?user_id=${localStorage.profile_id}`;
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
            $('#new_g_no').css('display', 'inline').html(data['number'])
            loadGroups(localStorage.username)
            //playTone('notification');
        }
        else if(data['status'] == 'error') {
            $('#new_g_no').css('display', 'none').html(`0`)
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

function loadGroupMessages() {
    var id = localStorage.group_id;
    var url = `${base_url}/api/groups/${id}/get_chats/?user_id=${localStorage.profile_id}`;
    
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
        $('#group-chat-content').empty();
        for(var i in data.data) {
            chat = data.data;
            var time;
            var seen_icon = `<i class="bx bx-check"></i>`;
            
            var hour = new Date(chat[i].date).getHours();
            var min = new Date(chat[i].date).getMinutes();
            var session = (hour >= 12) ? "pm" : "am";
            hour = (hour > 12) ? hour - 12 : hour;
            min = (min < 10) ? "0" + min : min;
            time = `${hour}:${min} ${session}`;

            var class_name, sender, delete_chat = '';
            if(chat[i].sender.user.username == localStorage.username) {
                class_name = "user";
                sender = "";
                delete_chat = `<i class="bx bx-trash g-option delete-chat" data-action="delete" data-id="${chat[i].id}"></i>`;
            }
            else {
                class_name = "other";
                sender = `~${chat[i].sender.user.username}`
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
            if(chat[i].files != null) {
                var fileExt = chat[i].files.split('.').pop().toLowerCase();
                
                if(chat[i].file_description.length > 25) {
                    file_des = chat[i].file_description.substring(0, 18) + "..." + chat[i].file_description.split('.').pop();
                }
                else {
                    file_des = chat[i].file_description
                }

                if(imageExt.includes(fileExt)) {
                    file = `<img src="${base_url}${chat[i].files}" alt="" width="200px" height="auto" />
                    <div class="file-det">
                    <a href="${base_url}${chat[i].files}" data-image="${chat[i].files}" class="file-download"><i class="bx bx-download"></i></a>
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(videoExt.includes(fileExt)) {
                    file = `<video src="${base_url}${chat[i].files}" width="200" height="auto" controls muted>Video not supported</video>
                    <div class="file-det">
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(audioExt.includes(fileExt)) {
                    file = `<audio src="${base_url}${chat[i].files}" controls>Audio not supported</audio>
                    <div class="file-det">
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(pdfExt.includes(fileExt)) {
                    file = `<div class="file-det">
                    <a href="${base_url}${chat[i].files}" data-image="${chat[i].files}" class="file-download"><i class="bx bx-download"></i></a>
                    <span>${file_des}</span>
                    </div>`;
                }
                else if(docExt.includes(fileExt)) {
                    file = `<div class="file-det">
                    <a href="${base_url}${chat[i].files}" data-image="${chat[i].files}" class="file-download"><i class="bx bx-download"></i></a>
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
                                    <i class="bx bx-copy g-option copy-chat" data-action="copy" data-id="${chat[i].message}" data-name="group"></i>
                                    -->
                                    <i class="bx bx-star g-option star-chat" data-action="star" data-id="${chat[i].id}" data-name="group"></i>
                                    <i class="bx bx-share g-option forward-chat" data-action="forward" data-id="${chat[i].message}" data-name="group"></i>
                                </div>
                                <div class="h6 w-small w-bold-x">${sender}</div>
                                <div class="msg">${message}</div>
                                <div class="time w-right">${starred} ${time} ${seen_icon}</div>
                            </div>
                        </div>`;
            $('#group-chat-content').append(temp);
        }
        last_chat();
        $('.chat').click(function() {
            playTone('keypad');
            $(this).children('.options').toggleClass('active');
        })
        $('.g-option').click(function() {
            playTone('message_send');
            gProcessChat($(this));
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
        //console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
    var new_group_chat_url = `${base_url}/api/groups/${localStorage.group_id}/get_new_group_chats/?user_id=${localStorage.profile_id}`;
    var new_group_dm = setInterval(getNewGroupDM, 3000, new_group_chat_url);
    $('.close-group-chat').click(function() {
        $('.group-chat-container').removeClass('active');
        clearInterval(new_group_dm);
    });
}


/************* function to send Group DMs ***************/
function sendGroupChat() {
    var id = localStorage.group_id;
    var url = `${base_url}/api/groups/${id}/send_group_chat/`;
    var sender_id = localStorage.profile_id;
    var chat = $('#group-chat-message').val();
    var file_input = $('input[name="g-chat-files"]');
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
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();
    var message, files;
    $('.file-preview').removeClass('active');
    if(chat.trim() == '' && file === undefined) {
        // recordAudio();
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
            ${fileName}&nbsp;&nbsp;${file.size/1048576}MB</p>`;
        }
        else if(videoExt.includes(fileExt)) {
            files = `<video src="${file}" width="200px" height="auto" controls>Video not supported</video>
            ${fileName}&nbsp;&nbsp;${file.size/1048576}MB</p>`;
        }
        else if(pdfExt.includes(fileExt)) {
            files = `<a href="${file}" download="${file.name}"><i class="bx bx-download"></i> ${fileName}</a>
            ${fileName}&nbsp;&nbsp;${file.size/1048576}MB</p>`;
        }
        else if(docExt.includes(fileExt)) {
            files = `<a href="${file}" download="${file.name}"><i class="bx bx-download"></i> ${fileName}</a>
            ${fileName}&nbsp;&nbsp;${file.size/1024}KB</p>`;
        }
        else {
            files = `Unsupported file format.`;
        }
    }
    $('input[name="g-chat-files"]').val('');
    
    $('.g-file-preview').removeClass('active');
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
                            <div class="h6 w-bold-x"></div>
                                <div class="msg">${message}</div>
                                <div class="time w-right">${time} <i class="bx bx-time"></i></div>
                            </div>
                        </div>`;
    $('#group-chat-content').append(temp);
    last_chat();
    $('#group-chat-send').attr('disabled', false);
    $('#group-chat-message').val('');
    $('.send-btn')
      .removeClass('active').empty()
      .html(`<i class="bx bx-microphone"></i>`)

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
    $('#group-chat-message').val('');

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
            loadGroupMessages();
            loadGroups(localStorage.username);
            
        }
     })
     
     .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}

/************* function to get new messages in current Group DM ***************/
function getNewGroupDM(url) {
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
            loadGroupMessages()
        }
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}

function createNwGroup() {
    var id = localStorage.profile_id;
    var url = `${base_url}/api/users/${id}/get_friends/`;
    $('#group-add-members').empty().html(`<div class="loader"></div>`);
    
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
        $('#group-add-members').empty();
        if(data.status == 'success') {
            for(var i in data.data) {
                f = data.data;
                var temp = `<tr class="friend-check">
                            <input type="checkbox" id="user_${f[i].id}" value="${f[i].id}" name="add-group-members">
                            <td><label class="" for="user_${f[i].id}">${f[i].firstName} ${f[i].lastName} (${f[i].user.username})</label></td>
                            <td><i class="bx bx-check-circle"></i></td>
                        </tr>`;
              $('#group-add-members').append(temp);
            }
        }
        else if(data.status == 'error') {
            var temp = `<h3 class="w-center w-gray w-bold-x">${data.message}</h3>`
            $('#group-add-members').html(temp)
        }
        
    })
    .catch(error => {
        console.log(error);
        swal("Oops", "Error occured!", "error");
    })
}

function createNewGroup() {
    $('#create-g-btn').attr('disabled', true).html(`Creating Group...`);
    var url = `${base_url}/api/groups/create_group/`;
    var group_name = $('#group-name').val();
    var group_des = $('#group-description').val();
    var group_type = $('input[name="group-type"]:checked').val();
    var group_icon = $('#g-icon')[0].files[0];
    console.log(group_icon)

    const formData = new FormData();
    formData.append('name', group_name);
    formData.append('user_id', localStorage.profile_id);
    formData.append('description', group_des);
    formData.append('type', group_type);
    formData.append('image', group_icon);

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
        //console.log(data);
        if(data['status'] == 'success') {
            $('#group-name').val('');
            $('#group-description').val('');
            $('#g-icon').val('');
            $('.g-icon').attr('src', './image/group.jpeg');
            swal('Success', 'Group created successfully', 'success');
            $('.group-create-container').removeClass('active');
            loadGroups(localStorage.username);
        }
        else if(data['status'] == 'error') {
            swal('Error', data['message'], 'error');
        }
        $('#create-g-btn').attr('disabled', false).html(`Create Group`);
     })
     .catch(err => {
        console.log(err)
        $('#create-g-btn').attr('disabled', false).html(`Create Group`);
     });
}

// process chat options
function gProcessChat(elem) {
    var action = elem.data('action');
    var param = elem.data('id');
    var profile = localStorage.profile_id;
    switch(action) {
        case "copy":
            copyChat(param);
            //alert('copied!');
            break;
        case "delete":
            var url = `${base_url}/api/groups/${localStorage.group_id}/delete_chat/`;
            deleteChat(elem, param, url, profile);
            break;
        case "star":
            var url = `${base_url}/api/groups/${localStorage.group_id}/star_chat/`;
            starChat(elem, param, url, profile);
            break;
        case "forward":
            //forwardChat(param, place, profile);
            break;
    }
}

function deleteChat(elem, param, url, id) {
    elem.parent('.options').siblings('.msg').empty().html(`<i>deleting message...</i>`)
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
        if(data['status'] == 'success') {
            elem.parent('.options').siblings('.msg').empty().html(`<i>${data['message']}</i>`)
        }
        else if(data['status'] == 'error') {
            elem.parent('.options').siblings('.msg').empty().html(`<i>${data['message']}</i>`)
        }
        loadGroups(localStorage.username);
        loadChats()
     })
     .catch(error => {
        console.log(error);
        //alert(error);
        //swal("Oops", "Error occured!", "error");
    })
}

function gpreviewFile(input, type) {
    $('#g-file-preview').empty();
    if(input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            var file = '';
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
          $('#g-file-preview').addClass('active').append(file);
          $('.send-btn')
            .addClass('active').empty()
            .html(`<i class="bx bx-send"></i>`)
        };
        reader.readAsDataURL(input.files[0]);
        $('.file-send-con').toggleClass('active')
    }
    $('.g-file-send-close').click(function() {
        $('#g-file-preview').removeClass('active').empty();
      })
}


// group voice note
$('#group-chat-send').click(function(e) {
    if(!$(this).hasClass('active')) {
        e.preventDefault();
        var time_s = 0;
        var time_m = 0;
        const player = $('#g-record');
        let mediaRecorder;
        let audioChunks = [];
        var audio_blob = null;
        // start recording
        playTone('sound_recorder');
        $('#g-rec-time').html(`00:00`).show();
        $('#g-rec-state').show();
        $('#g-play-rec').show();
        $('.g-rec-audio-con').addClass('active')
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
                $('#g-rec-time').html(`${time_min}:${time_sec}`)
            }, 1000)
            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };
            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
                audioChunks = [];
                clearInterval(start_time)
                $('#g-rec-time').html(`00:00`).hide();
                $('#g-rec-state').hide();
                $('#g-play-rec').hide();
                player.attr('src', URL.createObjectURL(audioBlob));
                player.show()
                var aud = player.attr('src')
                //alert(aud)
                fetch(aud)
                .then(response => {return response.blob()})
                .then(blob => {audio_blob = blob})
                .catch(err => console.log(err));
                $('#g-send-rec').show();
                $('#g-send-rec').click(function() {
                    if(audio_blob !== null) {
                        //console.log(audio_blob);
                        var file_ext = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
                        var id = localStorage.group_id;
                        var url = `${base_url}/api/groups/${id}/send_group_chat/`;
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
                        $('#group-chat-content').append(temp);
                        $('.g-rec-audio-con').removeClass('active')
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
                                loadGroupMessages();
                                loadGroups();
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


function searchGroup() {
    var query = $('#search-group').val();
    if(query.trim() === '') {
        return
    }
    var url = `${base_url}/api/groups/search_group/?query=${query}`;
    $('#search-group-content').empty().html(`<div class="loader"></div>`)
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
        $('#search-group-content').empty()
        console.log(data);
        if(data['status'] == 'success') {
            u = data.data;
            for(var i in u) {
                var img;
                if(u[i].image) {
                    img = `${base_url}${u[i].image}`;
                }
                else {
                    img = './image/group.jpeg';
                }
                var group_join, join_icon, join_text;
                for(s in u[i].members) {
                    p = u[i].members;
                    if(p[s].user.username == localStorage.username) {
                        group_join = 'leave';
                        join_text = 'Leave';
                        join_icon = 'btn-danger';
                    }
                    else {
                        group_join = 'join';
                        join_text = 'join';
                        join_icon = 'btn-success';
                    }
                }

                var temp = `<div class="group-item">
                <img class="group-item-img" alt="" src="${img}" />
                <div class="user-item-content">
                <div id="user-item-name" class="h6 w-bold-x">${u[i].title}</div>
                <div id="user-item-username" class="h6 w-small w-text-gray">
                <i class="fa fa-lock"></i> ${u[i].type}&nbsp;&nbsp;&nbsp;<i class="fa fa-group"></i> ${u[i].members.length} members
                </div>
                <div class="user-item-buttons">
                    <button class="btn ${join_icon} join-group" data-action="${group_join}" data-id="${u[i].id}">
                        <i class="fa fa-user-plus"></i> ${join_text}
                    </button>
                    <button class="btn btn-primary"><i class="fa fa-eye"></i> View</button>
                </div>
                </div>
            </div>`;
            $('#search-group-content').append(temp)
            }
        }
        else if(data['status'] == 'error') {
            var temp = `<h6 class="w-center w-text-gray">${data['message']}</h6>`;
            $('#search-group-content').append(temp);
        }

        $('.join-group').click(function() {
            var group_id = $(this).data('id');
            var action = $(this).data('action');
            //alert(group_id + ': ' + action)
            $(this).empty().attr('disbled', true).html(`<div class="loader" style="width:20px;height:20px"></div>`);
            joinGroup(group_id, action);
        })

    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}

function joinGroup(id, action) {
    var url = `${base_url}/api/groups/${id}/join_group/`;
    const formData = new FormData();
    formData.append('user_id', localStorage.profile_id);
    formData.append('action', action)

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
            searchGroup();
            loadGroups(localStorage.username);
        }
        else if(data['status'] == 'error') {
            swal('Error', 'Sorry, an error occured', 'error');
            searchGroup();
        }
     })
     .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}

function createGroup() {
    console.log('hello')
}

function loadEmoji() {
    for(var e=0; e<face.length; e++) {
        var content = `<span class="emoji">${face[e]}</span>`;
        $('.face').append(content);
    };
    for(var e=0; e<dress.length; e++) {
        var content = `<span class="emoji">${dress[e]}</span>`;
        $('.dress').append(content);
    };
    for(var e=0; e<heart.length; e++) {
        var content = `<span class="emoji">${heart[e]}</span>`;
        $('.heart').append(content);
    };
    for(var e=0; e<hand.length; e++) {
        var content = `<span class="emoji">${hand[e]}</span>`;
        $('.hand').append(content);
    };
     for(var e=0; e<animal.length; e++) {
        var content = `<span class="emoji">${animal[e]}</span>`;
        $('.animal').append(content);
    };
    for(var e=0; e<food.length; e++) {
        var content = `<span class="emoji">${food[e]}</span>`;
        $('.food').append(content);
    };
    for(var e=0; e<place.length; e++) {
        var content = `<span class="emoji">${place[e]}</span>`;
        $('.place').append(content);
    };
                    
    $('.emoji').click(function() {
        var value = $(this).html()
        value = he.decode(value);
        $('#chat-message').val($('#chat-message').val() + value)
        $('#group-chat-message').val($('#group-chat-message').val() + value)
        $('#status-reply').val($('#status-reply').val() + value)
        $('.emj').remove();
    });
}