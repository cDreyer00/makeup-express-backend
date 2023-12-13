document.getElementById('img').addEventListener('change', function (event) {
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('preview').src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});