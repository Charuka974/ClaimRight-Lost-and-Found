function flipCard() {
        document.getElementById('flipCard').classList.toggle('flipped');
    }

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();
        const username = this.username.value;
        Swal.fire('Login Success', `Welcome back, ${username}`, 'success');
        // TODO: Send login API request
    });

    $('#signupForm').on('submit', function (e) {
        e.preventDefault();
        const username = this.username.value;
        Swal.fire('Signup Success', `Account created for ${username}`, 'success');
        // TODO: Send signup API request
    });