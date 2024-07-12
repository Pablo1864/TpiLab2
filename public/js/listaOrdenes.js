document.addEventListener('DOMContentLoaded', () => {
    // Función para formatear las fechas
    function formatearFechas() {
        const fechas = document.querySelectorAll('.fecha-orden');
        fechas.forEach(fecha => {
            const fechaOriginal = new Date(fecha.textContent);
            const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
            const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

            const fechaFormateada = fechaOriginal.toLocaleDateString('es-ES', opcionesFecha);
            const horaFormateada = fechaOriginal.toLocaleTimeString('es-ES', opcionesHora);

            fecha.textContent = `${fechaFormateada} ${horaFormateada}`;
        });
    }

    // Llama a la función para formatear fechas
    formatearFechas();
});

$(document).ready(function () {
    $('a[data-bs-toggle="modal"]').on('click', function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        $('#modalIframe').attr('src', href);
        $('#modalDetalles').modal('show');
    });

    $('#modalDetalles').on('hidden.bs.modal', function () {
        $('#modalIframe').attr('src', '');
    });
});


