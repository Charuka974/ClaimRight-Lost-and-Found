$(document).ready(function () {
    // Forgot Password form handler
    $('#loginForm').submit(function (e) {
        e.preventDefault();

        const email = $('input[name="email"]').val();

        // Disable submit button and show loading spinner
        $('#loginForm button[type="submit"]').prop('disabled', true);
        $('#loadingOverlay').addClass('show');

        $.ajax({
            url: 'http://localhost:8080/claimrightauth/forgot-password',
            method: 'POST',
            data: { email: email },
            success: function (response) {
                // Hide loading spinner and enable button
                $('#loadingOverlay').removeClass('show');
                $('#loginForm button[type="submit"]').prop('disabled', false);

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data
                }).then(() => {
                    if (response.token) {
                        window.location.href = `/Front_End/html/reset-new-password.html?token=${encodeURIComponent(response.token)}`;
                    } else {
                        window.location.href = "/Front_End/html/login-signup.html";
                    }
                });
            },
            error: function (xhr) {
                // Hide loading spinner and enable button
                $('#loadingOverlay').removeClass('show');
                $('#loginForm button[type="submit"]').prop('disabled', false);

                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: xhr.responseJSON?.message || 'Something went wrong.'
                });
            }
        });
    });

    // Reset Password form handler
    if ($('#resetPasswordForm').length) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Link',
                text: 'Reset token is missing or invalid.'
            });
            $('#resetPasswordForm button[type="submit"]').prop('disabled', true);
            return;
        }

        $('#resetPasswordForm').submit(function (e) {
            e.preventDefault();

            const newPassword = $('#newPassword').val();

            if (!newPassword || newPassword.length < 6) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Weak Password',
                    text: 'Password should be at least 6 characters.'
                });
                return;
            }

            // Disable submit button and show loading spinner
            $('#resetPasswordForm button[type="submit"]').prop('disabled', true);
            $('#loadingOverlay').addClass('show');

            $.ajax({
                url: 'http://localhost:8080/claimrightauth/reset-password',
                method: 'POST',
                data: {
                    token: token,
                    newPassword: newPassword
                },
                success: function (response) {
                    // Hide loading spinner and enable button
                    $('#loadingOverlay').removeClass('show');
                    $('#resetPasswordForm button[type="submit"]').prop('disabled', false);

                    Swal.fire({
                        icon: 'success',
                        title: 'Password Reset',
                        text: response.data
                    });

                    setTimeout(() => {
                        window.location.href = "/Front_End/html/login-signup.html";
                    }, 3000);
                },
                error: function (xhr) {
                    // Hide loading spinner and enable button
                    $('#loadingOverlay').removeClass('show');
                    $('#resetPasswordForm button[type="submit"]').prop('disabled', false);

                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: xhr.responseJSON?.message || 'Something went wrong.'
                    });
                }
            });
        });
    }
});
