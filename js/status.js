var base_url = `https://riganapi.pythonanywhere.com`;
/************* function to load notification ***************/
function loadNotification() {
    var url = `${base_url}/api/notifications/get_notifications/?app_type=iChat`;
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
        $('#note-content').empty();
        note = data.data;
        
        for(var i in note) {
            var className = '';
            if(note[i].seen_by) {
                for(var p in note[i].seen_by) {
                    b = note[i].seen_by;
                    username = localStorage.username;
                    if(username === b[p].user.username) {
                        className = 'read'
                    }
                    else {className = 'unread'}
                }
            }
            var hour = new Date(note[i].date).getHours();
            var min = new Date(note[i].date).getMinutes();
            var date = new Date(note[i].date).toLocaleDateString();
            var session = (hour >= 12) ? "pm" : "am";
            hour = (hour > 12) ? hour - 12 : hour;
            min = (min < 10) ? "0" + min : min;
            time = `${hour}:${min} ${session}`;
            var message;
            if(note[i].message.length > 60) {
                message = note[i].message.substring(0, 50) + "...Read More";
            }
            else {
                message = note[i].message
            }
            var type;
            switch(note[i].type) {
                case "Warning":
                    type = '&#9888;';
                    break;
                case "Success":
                    type = '&#127879;';
                    break;
                case "Congrats":
                    type = '&#9989';
                    break;
                case "Info":
                    type = '&#10069;';
                    break;
                case "Danger":
                    type = '&#10060;';
                    break;
            }

            var temp = `<div class="note-item ${className}" data-id="${i}">
            <h5 class="w-bold-x">${type} ${note[i].title}</h5>
            <div class="w-small">${message}</div>
            <span class="n-date w-small">${date} ${time}</span>
            </div>`;
            $('#note-content').append(temp);
        }

        $('.note-item').click(function() {
            var index = parseInt($(this).data('id'));
            //alert(index)
            $('.note-modal').addClass('active');
            $('.note-modal-header').html(note[index].title);
            $('.note-modal-body').html(note[index].message);

            var url = `${base_url}/api/notifications/${note[index].id}/view_notification/?user_id=${localStorage.profile_id}`;
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
                console.log(data);
                loadNotification();
            })
            .catch(err => {
                console.log(err);
            })
        })
        $('.close-note-modal').click(function() {
            $('.note-modal').removeClass('active');
        })
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}

/************* function to load statuses ***************/
function loadStatus() {
    var url = `${base_url}/api/users/get_my_status/?profile_id=${localStorage.profile_id}`;
    
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
        s = data.data;
        var img = '';
        if(data.profile.image) {
            img = `${base_url}${data.profile.image}`;
        }
        else {
            if(data.profile.gender == 'Male') {
                img = 'image/male.jpeg';
            }
            else if(data.profile.gender == 'Female') {
                img = 'image/female.png';
            }
            else {
                img = 'image/other.jpeg';
            }
        }
        if(data['status'] == "success") {
            var date = new Date(s[0].date);
            var duration = getDuration(date);
            $('#my-status-time').html(duration)
            var status_len = s.length;
            //alert(status_len)
            sec = 360/status_len;
            $('#my-circle').empty();
            $('.my-status-view').data('id', 'active');
            
            for(var i = 0; i < status_len; i++) {
                deg = i * sec;
                //alert(deg)
                var temp = `<div class="sector" style="transform:rotate(${deg}deg)"></div>`;
                $('#my-circle').append(temp);
            }
            $('#my-circle').append(`<img class="stat-img" id="my-status" src="${img}" alt="" />`);
                
        }
        else if(data['status'] == "error") {
            $('#my-status-time').html(`You don\'t have any status`)
            $('.my-status-view').data('id', 'inactive');
            $('#my-circle').append(`<img class="stat-img" id="my-status" src="${img}" alt="" />`);
        }
        var s;
        if(data.data) {
            s = data.data.reverse()
        }
        $('.my-status-view').click(function() {
            // if status present
            if($(this).data('id') == 'active') {
                // view status
                $('.status-username').html(`My Status`);
                $('.status-dp').attr('src', `${img}`)
                $('.status-view').addClass('active');
                $('.btm-slides').empty();
                $('.images').empty();
                for(var i in s) {
                    //alert(i)
                    var indicator = `<span class="stat-btn"></span>`;
                    $('.btm-slides').append(indicator);
                    var stat = `<div class="status-item" style="background:${s[i].background};font-family:${s[i].font_family};font-weight:${s[i].font_weight}">
                                    <div>${s[i].status}<div>
                                </div>`;
                    $('.images').append(stat);

                }
                //var stat_btn_len = (100 / $('.stat-btn').length);
                //$('.stat-btn').css('width', `calc(${stat_btn_len}% - 10px)`)
                $('.sliders').remove();
                var next_btn = `<div class="sliders left">
                        <span class="fa fa-angle-left"></span>
                    </div>
                    <div class="sliders right">
                        <span class="fa fa-angle-right"></span>
                    </div>`;
                $('.status-content').append(next_btn);
                displayStatus('mine')
            }
        })
        
       

        // fetch other statuses
        $('.status-table').empty();
        var o_url = `${base_url}/api/users/get_other_status/?profile_id=${localStorage.profile_id}`;
    
        fetch(o_url, {
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
            p = data.data;
            if(data['status'] == 'success') {
                for(var s in p) {
                    var date = new Date(p[s].statuses[0].date);
                    var duration = getDuration(date);
                    var dp = '';
                    if(p[s].user.image != null) {
                        dp = `${base_url}${p[s].user.image}`
                    }
                    else {
                        dp = `${base_url}/media/users/images/avatar.png`;
                    }
                    var temp = `<tr id="${s}" class="other-status-view" data-id="${p[s].id}" data-name="${p[s].user.user.username}" data-image="${dp}">
                                <td>
                                    <div class="stat-circle" id="stat_${p[s].id}" style="border:2px solid #fff;padding:3px;">
                                        ${p[s].statuses[0].status}
                                    </div>
                                </td>
                                <td class="w-small">
                                    <div class="h6 w-bold">${p[s].user.user.username}</div>
                                    ${duration}
                                </td>
                                <td><i class="fa fa-ellipsis-v"></i></td>
                            </tr>`;
                            
                    $('.status-table').append(temp)
                    $(`#stat_${p[s].id}`).css({
                        'background-color': p[s].statuses[0].background,
                        'font-weight': p[s].statuses[0].font_weight,
                        'font-family': p[s].statuses[0].font_family,
                    })
                }
                
            }
            else if(data['status'] == "error") {

                var temp = `<tr>
                                <td colspan="3" style="text-align:center;">
                                    ${data['message']}
                                </td>
                            </tr>`;
                $('.status-table').append(temp)
            }

            $('.other-status-view').click(function() {
                // view status
                $('.status-username').html($(this).data('name'));
                $('.status-dp').attr('src', $(this).data('image'))
                $('.status-view').addClass('active');
                $('.btm-slides').empty();
                $('.images').empty();
                $('.status-view').addClass('active');
                user_index = $(this).attr('id')
                //alert(user_index);
                for(var i in p[user_index].statuses) {
                    s = p[user_index].statuses;
                    //alert(i)
                    var indicator = `<span class="stat-btn"></span>`;
                    $('.btm-slides').append(indicator);
                    var stat = `<div class="status-item" style="background:${s[i].background};font-family:${s[i].font_family};font-weight:${s[i].font_weight}">
                                    ${s[i].status}
                                </div>`;
                    $('.images').prepend(stat);
                }
                //var stat_btn_len = (100 / $('.stat-btn').length);
                //$('.stat-btn').css('width', `calc(${stat_btn_len}% - 10px)`)
                $('.sliders').remove();
                var next_btn = `<div class="sliders left">
                        <span class="fa fa-angle-left"></span>
                    </div>
                    <div class="sliders right">
                        <span class="fa fa-angle-right"></span>
                    </div>`;
                $('.status-content').append(next_btn);
                displayStatus('other');
            })

        })
        .catch(error => {
            console.log(error);
            //swal("Oops", "Error occured!Please check your internet connection", "error");
        })
        
    })
    .catch(error => {
        console.log(error);
       // swal("Oops", "Error occured!Please check your internet connection", "error");
    })

    
}

/************* function to get new status ***************/
function getNewStatus() {
    var url = `${base_url}/api/users/${localStorage.profile_id}/get_new_status/`;
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
            $('#new_s_no').css('display', 'inline').html(data['number'])
            loadStatus();
        }
        else if(data['status'] == 'error') {
            $('#new_s_no').css('display', 'none').html(`0`)
        }
    })
    .catch(error => {
        console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}


function getDuration(date) {
    var present = new Date();
    time = parseInt(present - date);
    time = time/1000;
    var duration = '';
    if(time < 60) {
        duration = `<i>Just Now</i>`;
    }
    else if(time >= 60) {
        if(time >= 3600) {
            hour = Math.floor(time/3600)
            min = Math.floor((time%3600)/60)
            if(hour == 1) {
                duration = `<i>${hour} hour ${min} minutes ago</i>`;
            }
            else {duration = `<i>${hour} hours ${min} minutes ago</i>`;}
        }
        else {
            min = Math.floor(time/60)
            sec = Math.floor(time%60)
            duration = `<i>${min} minutes ago</i>`;
        }
    }
    return duration
}

var stat_font = 'sans-serif';
var stat_color = 'maroon';
var stat_bold = 'normal';

var color_index = 0;
$('.color-change').click(function(e) {
    e.preventDefault();
    const colors = ['maroon', 'darkgreen', 'blue', 'purple', 'violet',
                    'indigo', 'black', 'gray', 'orange', 'red', 'navy', 'brown', 'pink', 'orangered',
                    'geenyellow', 'lime', 'lightblue', 'turqoise']
    if(color_index < colors.length - 1) {
        color_index += 1;
    }
    else {color_index = 0}
    $('.add-status-container').css('background', colors[color_index]);
    stat_color = colors[color_index];
})

var font_index = 0;
$('.font-change').click(function(e) {
    e.preventDefault();
    const fonts = ['sans-serif', 'courier', 'verdana', 'cursive', 'times new roman']
    if(font_index < fonts.length - 1) {
        font_index += 1;
    }
    else {font_index = 0}
    $('#status').css('font-family', fonts[font_index]);
    $(this).css('font-family', fonts[font_index]);
    stat_font = fonts[font_index];
})

$('.bold-change').click(function(e) {
    e.preventDefault();
    if($('#status').hasClass('bold')) {stat_bold = 'normal'}
    else {stat_bold = 'bold'};
    $('#status').toggleClass('bold');
    $(this).toggleClass('bold');
})

$('.send-status').click(function() {
    var url = `${base_url}/api/users/${localStorage.profile_id}/upload_status/`;
    var stat = $('#status').val();

    var linkRegex = /(?:https?|ftp):\/\/[\n\S]+/g;
    var asteriskRegex = /\*(.*?)\*/g;
    var hashRegex = /#(.*?)#/g;
    var entityRegex = /&#[^\s;]+;/g;
    var mssg = stat;

    if(mssg.match(linkRegex)) {
        p = mssg.replace(linkRegex, function(url) {
            return `<a style='text-decoration:underline' href='${url}'>${url}</a>`;
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
    formData.append('color', stat_color);
    formData.append('font', stat_font);
    formData.append('bold', stat_bold);
    formData.append('status', mssg);
    $('.send-status').empty().html(`<div class="loader"></div>`);
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
        console.log(data);
        if(data['status'] == 'success') {
            swal("Success", "Status uploaded", "success");
            $('#status').val('');
            $('.add-status-container').removeClass('active');
            loadStatus();
        }
        else if(data['status'] == 'error') {
            swal("Error", "Error while uploading status", "error");
        }
        $('.send-status').empty().html(`<i class="bx bx-send"></i>`);
    })
    .catch(error => {
        console.log(error);
        $('.send-status').empty().html(`<i class="bx bx-send"></i>`);
        //swal("Oops", "Error occured!", "error");
    })
})


function displayStatus(owner) {
    if(owner === 'mine') {
        $('.stat-reply').css('display', 'none')
        $('.stat-user-view-con').show()
    }
    else if(owner === 'other') {
        $('.stat-reply').css('display', 'flex')
        $('.stat-user-view-con').hide()
    }
    var currentIndex = 0
    var stat_btn_len = (100 / $('.stat-btn').length);
    $('.stat-btn').css('width', `calc(${stat_btn_len}% - 10px)`)
    $('.status-item').hide()
    
    $('.status-item').eq(0).css('display', 'flex');
    $('.stat-btn').eq(0).addClass('active')
    //var next_stat = setInterval(checkStatus, 3000, currentIndex + 1)
    //alert(index);
    $('.stat-btn').click(function() {
        //clearInterval(next_status)
        var index = $('.stat-btn').index(this);
        currentIndex = index;
        checkStatus(index)
        
    })
    $('.sliders.right').click(function() {
        //clearInterval(next_status)
        var index = currentIndex + 1;
        if(index >= $('.stat-btn').length) {
            $('.status-view').removeClass('active');
        }
        currentIndex = index;
        checkStatus(index)
    })
    $('.sliders.left').click(function() {
        //clearInterval(next_status)
        var index = currentIndex - 1;
        if(index < 0) {
            index = $('.stat-btn').length - 1;
        }
        currentIndex = index;
        checkStatus(index)
    })
    
}

function checkNextStatus(index) {
    checkStatus(index);
    currentIndex += 1;
}
function checkStatus(index) {
    $('.stat-btn').removeClass('active');
    $('.status-item').hide()
    $('.status-item').eq(index).css('display', 'flex');
    $('.stat-btn').eq(index).addClass('active')
}

/************* function to get new notifications ***************/
function getNewNote() {
    var url = `${base_url}/api/notifications/get_new_notifications/?user_id=${localStorage.profile_id}&app_type=iChat`;
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
            $('.note-number').html(data['number']);
            $('.open-notification').addClass('bx-tada');
            //playTone('notification');
            loadNotification();
        }
        else {
            $('.note-number').html('0');
            $('.open-notification').removeClass('bx-tada');
        }
    })
    .catch(error => {
        //console.log(error);
        //swal("Oops", "Error occured!", "error");
    })
}
