function submitForm(form) {
    Swal.fire({
        title: "Are you sure?",
        text: "The task will be added to the database",
        showCancelButton: true,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then(function (isOkay) {
        if (isOkay.isConfirmed) {
            form.submit();
        }
    });
    return false;
}

function submitForm2(form) {
    Swal.fire({
        title: "Are you sure?",
        text: "The Quiz will start. You can not reverse this process.",
        showCancelButton: true,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then(function (isOkay) {
        if (isOkay.isConfirmed) {
            form.submit();
        }
    });
    return false;
}