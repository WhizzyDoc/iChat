var base_url = `https://riganapi.pythonanywhere.com`;
$(document).ready(function() {
  // open draggable menu
  $(".toggle-btn").on("click" , () =>{
    $("nav").toggleClass("open");
  });

  //localStorage.removeItem('username')
  //localStorage.removeItem('password')
  // check if user is logged in
  if(!localStorage.username || !localStorage.password) {
    location.href = 'login.html';
    return
  }
  // load chats and groups
  loadChats(localStorage.username);
  loadGroups(localStorage.username);
  loadNotification();
  loadStatus();
  loadEmoji();
 
  $('.close-group-create').click(function(e) {
    $('.group-create-container').removeClass('active');
  });

  $('.file-send-btn').click(function() {
    $('.file-send-con').toggleClass('active')
  })
  $('.file-s-close').click(function() {
    alert('hi');
    $('#file-preview').empty().removeClass('active');
  })
  $('.g-file-s-close').click(function() {
    $('#g-file-preview').removeClass('active').empty();
  })

  $('.open-add-status').click(function(e) {
    e.preventDefault();
    $('.add-status-container').addClass('active');
  });
  $('.close-add-status').click(function(e) {
    e.preventDefault();
    $('.add-status-container').removeClass('active');
  });
  $('.close-stat-view').click(function(e) {
    e.preventDefault();
    $('.status-view').removeClass('active');
  });

  $('.open-notification').click(function() {
    $('.note-container').addClass('active')
  })

  $('.open-gpt-container').click(function(e) {
    e.preventDefault();
    $('.gpt-container').addClass('active')
    $('#gpt-content').empty().html(`<div class="loader"></div>`);
    loadGPTMessages();
  })
  $('.gpt-refresh').click(function(e) {
    e.preventDefault();
    $('#gpt-content').empty().html(`<div class="loader"></div>`);
    loadGPTMessages();
  })
  $('.close-gpt-container').click(function(e) {
    e.preventDefault();
    $('.gpt-container').removeClass('active')
  })
  $('.open-gpt-history').click(function(e) {
    e.preventDefault();
    $('.gpt-history-container').addClass('active')
    $('#gpt-history-content').html(`<div class="loader"></div>`);
    loadHistory();
  })
  $('.close-gpt-history').click(function(e) {
    e.preventDefault();
    $('.gpt-history-container').removeClass('active')
  })

  $('.create-new-room').click(function() {
    createGPTRoom();
  })

  $('#gpt-chat-send').click(function(e) {
    e.preventDefault();
    sendGPTChat();
  })

  $('.blog').click(function() {
    $('.open-search-user').hide()
    $('.open-search-group').show()
  })
  $('.home').click(function() {
    $('.open-search-user').show()
    $('.open-search-group').hide()
  })
  $('.code').click(function() {
    $('.open-search-user').hide()
    $('.open-search-group').hide()
  })

  $('.open-search-user').click(function() {
    $('.search-user-container').addClass('active')
  })

  $('.open-search-group').click(function() {
    $('.search-group-container').addClass('active')
  })

  $('.close-note').click(function() {
    $('.note-container').removeClass('active')
  })

  $('.close-search-user').click(function() {
    $('.search-user-container').removeClass('active')
  })

  $('.close-profile-con').click(function() {
    $('.profile-container').removeClass('active')
  })

  $('.open-user-profile-con').click(function() {
    $('.user-profile-container').addClass('active')
    myProfile()
  })

  $('.close-user-profile-con').click(function() {
    $('.user-profile-container').removeClass('active')
  })

  $('.close-search-group').click(function() {
    $('.search-group-container').removeClass('active')
  })

  $('input[name="chat-files"]').change(function() {
    $('input[name="chat-files"]').not(this).val('');
    var type = $(this).data('id')
    console.log(type + ": " + this)
    previewFile(this, type);
  });
  
  $('input[name="g-chat-files"]').change(function() {
    $('input[name="g-chat-files"]').not(this).val('');
    var type = $(this).data('id')
    console.log(type + ": " + this)
    gpreviewFile(this, type);
  });
  
  $('.group-chat-refresh').click(function(e) {
    e.preventDefault();
    id = $(this).data('id');
    loadGroupMessages()
  });
  $('.note-refresh').click(function(e) {
    e.preventDefault();
    loadNotification();
  });

  var flag = 0
  $('.stat-view-header').click(function() {
    if(flag == 0) {
      $('.stat-user-view-con').css('top', 'calc(100vh - 300px)');
      flag = 1;
    }
    else {
      $('.stat-user-view-con').css('top', 'calc(100vh - 80px)');
      flag = 0;
    }
    
  })
  $('.chat-refresh').click(function(e) {
    e.preventDefault();
    loadMessages()
  });
  $('.home-refresh').click(function(e) {
    e.preventDefault();
    id = $(this).data('id');
    loadChats(localStorage.username);
    loadGroups(localStorage.username);
    loadNotification();
    loadStatus();
  });
  // send DM form submission
  $('#dm-chat-form').submit(function(e) {
    e.preventDefault();
    $('#chat-send').attr('disabled', true);
    playTone('message_send');
    sendDM();
  })

  $('#search-user').on('input', function() {
    searchUser()
  })
  $('.search-user-form').on('submit', function(e) {
    e.preventDefault();
    searchUser()
  })

  $('#search-group').on('input', function() {
    searchGroup()
  })
  $('.search-group-form').on('submit', function(e) {
    e.preventDefault();
    searchGroup()
  })

  $('.create-group').click(function() {
    $('.group-create-container').addClass('active');
    
})

  $('.create-group-form').submit(function(e) {
    e.preventDefault();
    createNewGroup();
  })

  $('#group-chat-form').submit(function(e) {
    e.preventDefault();
    $('#group-chat-send').attr('disabled', true);
    playTone('message_send');
    sendGroupChat();
  })

  $('.chat-input').on('input', function() {
    //alert('hi')
    playTone('keypad');
    $(this).css('height', 'auto');
    var scroll = Math.min(this.scrollHeight, 100) + 'px';
    //console.log(scroll + ' ' + typeof(scroll))
    $(this).css('height', scroll)
    if($(this).val() != '') {
      $('.send-btn')
      .addClass('active').empty()
      .html(`<i class="bx bx-send"></i>`)
    }
    else {
      $('.send-btn')
      .removeClass('active').empty()
      .html(`<i class="bx bx-microphone"></i>`)
    }
  })
  $('#group-description').on('input', function() {
    $(this).css('height', 'auto');
    var scroll = Math.min(this.scrollHeight, 100) + 'px';
    //console.log(scroll + ' ' + typeof(scroll))
    $(this).css('height', scroll)
  })
  // logout
  $('.logout').click(function(e) {
    e.preventDefault();
    clearInterval(new_chats);
    clearInterval(new_chats_group);
    clearInterval(new_status);
    clearInterval(new_notification);
    clearInterval(update_status);
    var logout_url = `${base_url}/api/users/logout_view/`;
    const formData = JSON.stringify({
      username: localStorage.username,
      password: localStorage.password
    });
    fetch(logout_url, {
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
      // perform action with response data
      var msg = data['status'];
      if(msg == 'success') {
        swal("Success", data['message'], "success");
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('profile_id');
        localStorage.removeItem('room_id');
        localStorage.removeItem('group_id');
        localStorage.removeItem('gpt_room_id');
        location.href = 'login.html';
      }
      else if(msg == 'error') {
       swal("Error", data['message'], "error");
      }
    })
    .catch(error => {
      console.log(error);
    })
  });

  $('.home-icon').css('display', 'flex');
  $('.tab-but.home').click(function() {
    $('.home-icon').css('display', 'flex');
    $('.status-icon').css('display', 'none');
  })
  $('.tab-but.blog').click(function() {
    $('.home-icon').css('display', 'flex');
    $('.status-icon').css('display', 'none');
  })
  $('.tab-but.code').click(function() {
    $('.home-icon').css('display', 'none');
    $('.status-icon').css('display', 'flex');
  })

  $('.view-pr').click(function(e) {
    e.preventDefault();
    room_id = localStorage.room_id;
    user_id = localStorage.profile_id;
    
    var url = `${base_url}/api/chatrooms/${room_id}/get_other_user/?user_id=${user_id}`;

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
        //alert(data.data.id +': ' + data.data.user.username)
        $('.chat-container').removeClass('active');
        $('.profile-container').addClass('active');
        userProfile(data.data.id, data.data.user.username)
      }
    })
    .catch(err => {
      console.log(err);
    })
})

  // constant check for new updates
  var new_notification = setInterval(getNewNote, 5000)
  var new_chats = setInterval(getNewChats, 3000)
  var new_chats_group = setInterval(getNewChatsG, 3000)
  var new_status = setInterval(getNewStatus, 3000)
  var update_status = setInterval(loadStatus, 30000)
  
})

function openSearchUser() {
  $('.search-user-container').addClass('active')
}
      
function openFriendList(elem, param) {
  var id = localStorage.profile_id;
  $('.friend-list-container').addClass('active')
  
  
}

function readFile() {
  var reader = new FileReader();
  var file = document.querySelector('#g-icon').files[0];
  reader.onload = function(e) {
      document.querySelector('.g-icon').src = e.target.result;
  }
  reader.readAsDataURL(file);
}

function readDp() {
  var reader = new FileReader();
  var file = document.querySelector('#pp-input').files[0];
  reader.onload = function(e) {
      document.querySelector('.u-profile-dp').src = e.target.result;
  }
  reader.readAsDataURL(file);
  document.querySelector('.pp-btn').style.display = 'inline';
}

function dropDown(elem) {
    elem.siblings('.dropdown-content').toggleClass('show');
}
// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.bx-dots-vertical-rounded')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
//functiok to add drag
const button = document.querySelector('nav');
let isDragging = false;
let offsetX, offsetY;
// Mouse event listeners
button.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - button.getBoundingClientRect().left;
  offsetY = e.clientY - button.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const newX = e.clientX - offsetX;
  const newY = e.clientY - offsetY;
  // Ensure the button stays within the viewport's boundaries
  const maxX = window.innerWidth - button.clientWidth;
  const maxY = window.innerHeight - button.clientHeight;
  button.style.left = `${Math.min(maxX, Math.max(0, newX))}px`;
  button.style.top = `${Math.min(maxY, Math.max(0, newY))}px`;
});
document.addEventListener('mouseup', () => {
  isDragging = false;
});
// Touch event listeners for mobile
button.addEventListener('touchstart', (e) => {
  isDragging = true;
  offsetX = e.touches[0].clientX - button.getBoundingClientRect().left;
  offsetY = e.touches[0].clientY - button.getBoundingClientRect().top;
});
document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const newX = e.touches[0].clientX - offsetX;
  const newY = e.touches[0].clientY - offsetY;
  // Ensure the button stays within the viewport's boundaries
  const maxX = window.innerWidth - button.clientWidth;
  const maxY = window.innerHeight - button.clientHeight;
  button.style.left = `${Math.min(maxX, Math.max(0, newX))}px`;
  button.style.top = `${Math.min(maxY, Math.max(0, newY))}px`;
  e.preventDefault(); // Prevent page scrolling while dragging
});
document.addEventListener('touchend', () => {
  isDragging = false;
});

const tabButtons = document.querySelectorAll('.tab-but');
const tabPanels = document.querySelectorAll('.content');
const tabContent = document.querySelector('section');

let activeTabIndex = 0;
/*
tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    activateTab(index);
  })
})
*/
tabContent.addEventListener('toucstart', handleTouchStart, false);
tabContent.addEventListener('touhmove', handleTouchMove, false);

function activateTab(index) {
  const prevIndex = activeTabIndex;
  activeTabIndex = index;
  updateTabButtonStyles();

  const direction = index > prevIndex ? 1 : -1;
  const panelWidth = tabContent.offsetWidth;
  //const offset = ((direction * panelWidth) + (index * 33.3333333)) * (Math.abs(index - prevIndex));
  const offset = (prevIndex * 33.3333333) + (direction * panelWidth);

  tabContent.style.transform = `translateX(${offset}%)`;
  

  setTimeout(() => {
    tabPanels.forEach(panel => {
      tabContent.style.transition = '';
    });
  }, 3000);
/*
  if(index == 0) {
    tabContent.classList.remove('b');
    tabContent.classList.remove('c');
  }
  else if(index == 1) {
    tabContent.classList.add('b');
    tabContent.classList.remove('c');
  }
  else if(index == 2) {
    tabContent.classList.add('c');
    tabContent.classList.remove('b');
  }
  */
}

function updateTabButtonStyles() {
  tabButtons.forEach((button, index) => {
    if(index === activeTabIndex) {
      document.querySelector('.tabs .slider').style.left = (33.3333333 * index) + '%';
    }
  });
}

function handleTouchStart(event) {
  xDown = event.touches[0].clientX;
}
let xDown = null;
function handleTouchMove(event) {
  if(!xDown) {return;}
  let xUp = event.touches[0].clientX;
  let xDiff = xDown - xUp;
  if (xDiff > 0 && activeTabIndex < tabButtons.length - 1) {
    // swipe left
    activateTab(activeTabIndex + 1);
  }
  else if(xDiff < 0 && activeTabIndex > 0) {
    activateTab(activeTabIndex - 1);
  }
  xDown = null;
}
//activateTab(0);

function playTone(name) {
  var className = '.' + name;
  //document.querySelector(className).play();
}