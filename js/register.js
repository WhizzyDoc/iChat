$(document).ready(function() {
        
    var slider = $('.slide-page');
    var base_url = `https://riganapi.pythonanywhere.com`;
    // next buttons
    $('.firstNext').click(function(e) {
        e.preventDefault();
        if($('#first-name').val().trim() == '' || $('#last-name').val().trim() == '') {
            swal('Warning', 'field cannot be empty', 'warning');
            return
        }
        slider.css('margin-left', '-25%');
    })
    $(".next-1").click(function(e) {
        e.preventDefault();
        var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        var telRegex = /^\d{11}$/;;
        if(!emailRegex.test($('#email').val())) {
            swal('Warning', 'Invalid email', 'warning');
            return
        }
        if(!telRegex.test($('#phone-number').val())) {
            swal('Warning', 'Invalid phone number', 'warning');
            return
        }
        slider.css('margin-left', '-50%');
    })
    $(".next-2").click(function(e) {
        e.preventDefault();
        slider.css('margin-left', '-75%');
    })
    // prev buttons
    $(".prev-1").click(function(e) {
        e.preventDefault();
        slider.css('margin-left', '0%');
    })
    $(".prev-2").click(function(e) {
        e.preventDefault();
        slider.css('margin-left', '-25%');
    })
    $(".prev-3").click(function(e) {
        e.preventDefault();
        slider.css('margin-left', '-50%');
    })

    $('.submit').click(function(e) {
        e.preventDefault();
        var register_url = `${base_url}/api/users/register/`;
        var usernameRegex = /^[a-zA-Z0-9_\-]+$/;
        var passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if(!usernameRegex.test($('#username').val())) {
            swal('Warning', 'Invalid username', 'warning');
            return
        }
        if($('#password').val().length < 8) {
            swal('Warning', 'Password must be at least 8 characters long', 'warning');
            return
        }
        if($('#password').val() != $('#cpassword').val()) {
            swal("Error", 'Passwords do not match', "error");
            return;
        }
        if(!passwordRegex.test($('#password').val())) {
            swal('Warning', 'Password must contain letters and numbers', 'warning');
            return
        }
        const formData = JSON.stringify({
            username: $('#username').val(),
            email: $('#email').val(),
            gender: $('#gender').val(),
            bio: $('#bio').val(),
            firstName: $('#first-name').val(),
            lastName: $('#last-name').val(),
            phoneNumber: $('#phone-number').val(),
            password: $('#password').val(),
        });
            
            $('.submit').html(`<div class="loader"></div>`).attr('disabled', true);
    
            fetch(register_url, {
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
                      location.href = 'login.html';
                    }
                    else if(msg == 'error') {
                     swal("Error", data['message'], "error");
                    }
                    $('.submit').empty().text('Register').attr('disabled', false);
                    
            })
            .catch(error => {
              console.log(error);
              $('.submit').empty().text('Register').attr('disabled', false);
              })
      })
})


var password = document.querySelector('#password');
var cpassword = document.querySelector('#cpassword');
var pass = document.querySelector('#pass');
var cpass = document.querySelector('#cpass');
pass.onclick = function() {
    if(password.type == "password") {
        password.type = "text";
    }
    else {
        password.type = "password";
    }
}
cpass.onclick = function() {
    if(cpassword.type == "password") {
        cpassword.type = "text";
    }
    else {
        cpassword.type = "password";
    }
}