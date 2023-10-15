/************* function to load profile ***************/
function loadProfile() {
    $('#profile-content').empty().html(`<div class="loader"></div>`);
    var url = `http://127.0.0.1:8000/api/users/get_profile/`;
    const formData = JSON.stringify({
        username: localStorage.username,
        password: localStorage.password
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
        console.log(data);
        $('#profile-content').empty();
        if(data['status'] == "success") {
            var dp_link = '';
            if(data['data']['image'] != null) {
                dp_link = `http://127.0.0.1:8000${data['data']['image']}`;
            }
            else {
                dp_link = 'static/image/avatar.png';
            }
            console.log(dp_link);
            var temp = `<form id="dp-form">
                            <label for="dp" id="dp-label">
                                <img src="${dp_link}" id="dp-image" alt="profile Picture" />
                                <div class="fa fa-camera"></div>
                            </label>
                            <button type="submit" class="w-margin-top btn btn-info profile-btn">Save Image</button>
                            <input type="file" class="image-in" id="dp" onchange="readFile();" />
                        </form>
                        <table class="table profile-table">
                            <tbody>
                                <tr>
                                    <td class="w-bold-x"><i class="fa fa-user"></i> First Name</td>
                                    <td>${data.data.firstName}</td>
                                <tr>
                                <tr>
                                    <td class="w-bold-x"><i class="fa fa-user"></i> Last Name</td>
                                    <td>${data.data.lastName}</td>
                                <tr>
                                <tr>
                                    <td class="w-bold-x"><i class="fa fa-user"></i> Username</td>
                                    <td>${data.username}</td>
                                <tr>
                                <tr>
                                    <td class="w-bold-x"><i class="fa fa-envelope"></i> Email</td>
                                    <td>${data.data.email}</td>
                                <tr>
                                <tr>
                                    <td class="w-bold-x"><i class="fa fa-phone"></i> Phone Number</td>
                                    <td>${data.data.phone_number}</td>
                                <tr>
                                <tr>
                                    <td class="w-bold-x"><i class="fa fa-key"></i> Recovery PIN</td>
                                    <td>${data.data.pin}</td>
                                <tr>
                                <tr>
                                    <td colspan="2" style="text-align:center">
                                    <button class="btn btn-info edit-profile-btn" data-toggle="modal" data-target="#profileModal">Edit Profile</button>
                            </tbody>
                        </table>`;
            $('#profile-content').append(temp);
            // edit profile modal
            $('#fname').val(data.data.firstName);
            $('#lname').val(data.data.lastName);
            $('#fname').val(data.data.firstName);
            $('#email').val(data.data.email);
            $('#phone').val(data.data.phone_number);
            $('#pin').val(data.data.pin);
        }
        else if(data['status'] == 'error') {
            swal("Error", data['message'], "error");
        }
        // edit profile button
        // upload profile image
        $('.profile-btn').click(function(e) {
            e.preventDefault();
            if(!localStorage.username || !localStorage.password) {
                swal("error", "Sorry, you are logged out at this moment, kindly log back in to continue", "error");
                return;
            }
            var url = 'http://127.0.0.1:8000/api/users/update_profile_image/';
            var image = $('#dp')[0].files[0];
            //console.log(image);
            const formData = new FormData();
            formData.append('image', image);
            formData.append('username', localStorage.username);
            $(this).html(`<div class="loader"></div>`).attr('disabled', true);
        
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
                $('.profile-btn').html('Save Image').attr('disabled', false)
                if(data['status'] == 'success') {
                    swal("Success", data['message'], "success");
                    $('.profile-btn').hide();
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
     })
     .catch(error => {
        console.log(error);
        swal("Oops", "Error occured!", "error");
    })
    
}


/************* function to load app list ***************/
// More Apps Section
function getMoreApps(url) {
    // get all apps
    fetch(url, {
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(res => {return res.json()})
    .then(data => {
        console.log(data);
        $('.more-app').empty();
        for(var a in data.data) {
            app = data.data;
            var paid = '';
            if(app[a].is_paid == false) {
                paid = "Free"
            }
            else {
                paid = "N" + (app[a].price).toLocaleString();
            }
            var temp = `<tr class="get-detail" data-id="${app[a].id}" data-name="${app[a].name}">
            <td><img class="app-img" src="http://127.0.0.1:8000${app[a].icon}" /></td>
            <td>
                <h6>${app[a].name}</h6>
                <p>V ${app[a].version} | ${app[a].category.title}</p>
            </td>
            <td>${paid}</td>
        </tr>`;
        $('.more-app').append(temp);
        }

        $('.get-detail').click(function() {
            $('.app-det-con').addClass('active');
            getAppDetail($(this));
          })
    })
    .catch(err => {
        console.log(err);
        swal("Oops!", "Error Occured, Please check your internet connection", "error");
    })
}

// function to load filters
function loadMenu() {
    // empty filters
    $('#by-category').empty();
    $('#by-type').empty();
    $('#by-category').append(`<option value="all" selected>All categories</option>`);
    $('#by-type').append(`<option value="all" selected>All Types</option>`);
    // add a loader to container
    $('.more-app').html(`<div class="loader"></div>`);
    // fetch all categories
    var cat_url = 'http://127.0.0.1:8000/api/categories/';
    fetch(cat_url, {
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(res => {return res.json()})
    .then(data => {
        console.log(data);
        for(var c in data) {
            var temp = `<option value="${data[c].id}">${data[c].title}</option>`;
            $('#by-category').append(temp);
        }
    })
    .catch(error => {
        console.error(error);
        swal("Oops!", "Error Occured, failed to get data", "error");
    });
    // fetch all types
    var type_url = 'http://127.0.0.1:8000/api/types/';
    fetch(type_url, {
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(res => {return res.json()})
    .then(data => {
        console.log(data);
        for(var c in data) {
            var temp = `<option value="${data[c].id}">${data[c].name}</option>`;
            $('#by-type').append(temp);
        }
    })
    .catch(error => {
        console.error(error);
        swal("Oops!", "Error Occured, failed to get data", "error");
    })
    // function to fetch all apps
    var url = 'http://127.0.0.1:8000/api/apps/get_all_apps/'
    getMoreApps(url);
}


// App Detail view
function getAppDetail(elem) {
    var id = elem.data('id');
    var title = elem.data('name');
    $('.app-det-refesh').data('id', id);
    $('.app-det-refesh').data('name', title);
    
    $('#user-rating').val(id);
    $('.app-det-title').html(title);
    //$('.myApp').html(`<div class="loader"></div>`);
    // fetch app details
    var det_url = `http://127.0.0.1:8000/api/apps/${id}/`;
    fetch(det_url, {
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(res => {return res.json()})
    .then(data => {
        console.log(data);
        $('#app-icon').attr('src', data['icon']);
        $('#app-name').html(data['name']);
        $('#developer').html(`${data.developer.firstName} ${data.developer.lastName}`);
        $('#app-category').html(data.category.title);
        $('#version').html(data.version);
        $('.app-description').html(data.description);
        if(data.is_paid == false) {
            $('#app-price').html("Free");
        }
        else {
            $('#app-price').html(`N${data.price}`);
        }
        $('.app-images').empty();
        for(var c in data.images) {
            var images = data.images;
            console.log(images);
            var temp = `<a href="${images[c].image}"><div>
                <img src="${images[c].image}" alt="" /></div>
                </a>`;
            $('.app-images').append(temp);
        }
        $('#os').empty();
        for(t in data.types) {
            
            var temp = `<option value="${data.types[t].id}">${data.types[t].name}</option>`;
            $('#os').append(temp);
        }
        $('#os').on('change', function() {
            var value = $(this).val();
            if(data.files.length !== 0) {
                console.log("file present");
                for(f in data.files) {
                    file = data.files;
                    if(file[f].type == parseInt(value)) {
                        console.log("file found");
                        $('#app-file').attr('href', file[f].file);
                        console.log("file assigned");
                    }
                    else {
                        $('#app-file').attr('href', '#');
                        
                    }
                }
            }
            else {
                swal("Oops!", "No file available for download", "error");
            }
            
        })
        $('#app-file').click(function() {
            if($('#app-file').attr('href') != '#') {
                swal("Success", "Your App is Downloading", "success");
            }
            else if($('#app-file').attr('href') == '#') {
                swal("Oops!", "Download not available for this device", "error");
            }
        });
        
    })
    .catch(err => {
        swal("Oops!", "Error Occured, Please check your internet connection", "error");
    });
    // fetch related apps
    var rel_url = `http://127.0.0.1:8000/api/apps/${id}/get_related_apps/`;
    fetch(rel_url, {
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(res => {return res.json()})
    .then(data => {
        console.log(data.data);
        $('.rel-apps').empty();
        for(key in data.data) {
            app = data.data;
            var temp = `<div class="rel-app-con" data-id="${app[key].id}" data-name="${app[key].name}">
            <img src="http://127.0.0.1:8000${app[key].icon}" class="rel-app-icon" alt="" />
            <h5>${app[key].name}</h5>
            </div>`;
            $('.rel-apps').append(temp);
        }
        $('.rel-app-con').click(function() {
            getAppDetail($(this));
        })
    })
    .catch(err => {
        swal("Oops!", "Error Occured, Please check your internet connection", "error");
    });

    // fetch comments
    var com_url = `http://127.0.0.1:8000/api/apps/${id}/get_comments/`;
    fetch(com_url, {
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(res => {return res.json()})
    .then(data => {
        $('.comment-con').empty();
        console.log(data);
        var av_star = 0;
        var total_star = 0;
        var star_1, star_2, star_3, star_4, star_5;
        star_1 = star_2 = star_3 = star_4 = star_5 = 0;
        for(var key in data.data) {
            c = data.data;
            av_star += c[key].star;
            total_star += 1;
            switch(c[key].star) {
                case 1:
                    star_1 += 1;
                    break;
                case 2:
                    star_2 += 1;
                    break;
                case 3:
                    star_3 += 1;
                    break;
                case 4:
                    star_4 += 1;
                    break;
                case 5:
                    star_5 += 1;
                    break;
                default:
                    return;
            }
            $('#tot-review').html(c.length);
            var date = new Date(c[key].created).toLocaleDateString();
            var temp = `<div class="comm-con" id="${c[key].name}_c">
                            <div class="com comment">
                                <h4 style="text-transform:uppercase;">${c[key].name}</h4>
                                <p class="star-no" id="${c[key].name}">
                                    &nbsp;&nbsp; 
                                    ${date}
                                </p>
                                <p>${c[key].comment}</p>
                            </div>

                        </div>`;

            
            $('.comment-con').append(temp);

            if(c[key].reply != "") {
                var id = `#${c[key].name}_c`;
                var temp4 = `<div class="com reply">
                                <h4 style="text-transform:uppercase;">Admin</h4>
                                <p><i class="fa fa-reply"></i> Reply to <span id="reply-to">${c[key].name}</span></p>
                                <p>${c[key].reply}</p>
                            </div>`;
                $(id).append(temp4);
            }

            var id = "#" + c[key].name;
            //console.log(typeof(id));
            
            var remaining = parseInt(5 - parseInt(c[key].star));
            for(var i=0; i < remaining; i++) {
                var temp3 = `<span class="fa fa-star"></span>`;
                $(id).prepend(temp3);
            }
            for(var i=0; i < c[key].star; i++) {
                var temp2 = `<span class="fa fa-star checked"></span>`;
                $(id).prepend(temp2);
            }
            
        }
        average = (av_star / total_star).toFixed(1);
        $('#av-star').html(average);
        var round_down_average = Math.floor(average);
        var round_up_average = Math.ceil(average);
        $('#star-me').empty();
        for(var i=0; i<round_down_average; i++) {
            var temp = `<span class="fa fa-star checked"></span>`;
            $('#star-me').append(temp);
        }
        if(average > round_down_average) {
            $('#star-me').append(`<span class="fa fa-star-half-o checked"></span>`)
        }
        remaining = 5 - round_up_average;
        for(var i=0; i<remaining; i++) {
            var temp = `<span class="fa fa-star"></span>`;
            $('#star-me').append(temp);
        }
        // percentage for each star
        per_star_1 = Math.floor((star_1 / total_star) * 100);
        $('.bar-1').css('width', per_star_1 + '%');
        per_star_2 = Math.floor((star_2 / total_star) * 100);
        $('.bar-2').css('width', per_star_2 + '%');
        per_star_3 = Math.floor((star_3 / total_star) * 100);
        $('.bar-3').css('width', per_star_3 + '%');
        per_star_4 = Math.floor((star_4 / total_star) * 100);
        $('.bar-4').css('width', per_star_4 + '%');
        per_star_5 = Math.floor((star_5 / total_star) * 100);
        $('.bar-5').css('width', per_star_5 + '%');
    })
    .catch(err => {
        swal("Oops!", "Error Occured, Failed to get apps", "error");
    });
}