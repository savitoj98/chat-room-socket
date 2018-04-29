var socket = io();


function scrollToBottom() {
	var messages = $('#messages');
	var newMessage = messages.children('li:last-child');

	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop');
	var scrollHeight = messages.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();

	if( clientHeight + scrollTop + newMessageHeight >= scrollHeight ) {
		messages.scrollTop(scrollHeight);
	}
}

socket.on('connect', function () {
	var params = $.deparam(window.location.search.slice(1));

	socket.emit('join', params, function(err){
		if (err) {
			alert(err);
			window.location.href = '/';
		} else {
			console.log('No error');
		}
	});

	//console.log('Connected to server');
});

socket.on('disconnect', function () {
	console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
	var ol = $('<ol></ol>');

	users.forEach(function (user) {
		ol.append($('<li></li>').text(user));
	});

	$('#users').html(ol);
});


socket.on('newMessage', function(message) {
	
	var formattedTime = moment(message.createdAt).format('h:mm a');

	// var li = $('<li></li>');
	// li.html('<span class="bold_li">' + message.from + "</span> (" +  formattedTime + ") : " + message.text);

	var template = $('#message-template').html();
	var html = Mustache.render(template, {
		text: message.text,
		from: message.from, 
		createdAt: formattedTime
	});

	$('#messages').append(html);
	scrollToBottom();
});

socket.on('newLocationMessage', function(message) {

	var formattedTime = moment(message.createdAt).format('h:mm a');

	// var li = $('<li></li>');
	// var a = $('<a target="_blank">My Current Location</a>');
	
	// li.html('<span class="bold_li">' + message.from + "</span> (" +  formattedTime + ") : ");
	// a.attr('href', message.url);
	// li.append(a);
	
	var template = $('#location-message-template').html();
	var html = Mustache.render(template, {
		from: message.from, 
		url: message.url,
		createdAt: formattedTime
	});

	$('#messages').append(html);
	scrollToBottom();
});


$('#message-form').on('submit', function(e) {
	e.preventDefault();

	socket.emit('createMessage', {
		from: 'User',
		text: $('[name=message]').val()
	}, function() {
		$('[name=message]').val('');
	});
});

var locationButton = $('#send-location');
locationButton.on('click', function() {
	if (!navigator.geolocation) {
		return alert('Geolocation not supported.');
	}

	locationButton.attr('disabled', 'disabled').text('Sending Location...');

	navigator.geolocation.getCurrentPosition( function(position) {
		locationButton.removeAttr('disabled').text('Send Location');
		socket.emit('createLocationMessage', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});
	
	}, function() {
		locationButton.removeAttr('disabled').text('Send Location');
		alert('Unable to fetch location.')
	});
});