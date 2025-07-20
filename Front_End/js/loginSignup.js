$(document).ready(function () {

        

});

function flipCard() {
    document.getElementById('flipCard').classList.toggle('flipped');
}
 
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling.querySelector('i');
            
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}
        
            // Form submission handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    Swal.fire({
        title: 'Login Successful!',
        text: 'Welcome back to ClaimRight',
        icon: 'success',
        confirmButtonText: 'Continue'
    });
});
        
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    Swal.fire({
        title: 'Account Created!',
        text: 'Your ClaimRight account has been created successfully',
        icon: 'success',
        confirmButtonText: 'Continue'
    });
});
        
        // Add some interactive effects to form inputs
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
            
    input.addEventListener('blur', function() {
        if (this.value === '') {
                    this.parentElement.classList.remove('focused');
        }
    });
});
