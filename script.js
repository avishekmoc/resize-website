  // navigation bar
  document.addEventListener('DOMContentLoaded', function () {
    const toggler = document.querySelector('.navbar-toggler');
    const menu = document.getElementById('navbarMenu');

    toggler.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true' || false;
        this.setAttribute('aria-expanded', !expanded);
        menu.classList.toggle('active');
    });
});

//            ***********************            //
document.addEventListener('DOMContentLoaded', function () {
    const dragDropArea = document.getElementById('drag-drop-area');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const reduceOptions = document.getElementById('reduce-options');
    const qualityValue = document.getElementById('quality-value');

    let originalImageDataURL = '';
    let displayedImageDataURL = '';
    let originalImage = null;
    let displayedImage = null;
    dragDropArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);
    dragDropArea.addEventListener('dragover', handleDragOver);
    dragDropArea.addEventListener('drop', handleFileDrop);

    document.getElementById('manual-quality').addEventListener('input', function (event) {
        qualityValue.textContent = event.target.value;
    });

    function handleDragOver(event) {
        event.preventDefault();
        dragDropArea.classList.add('dragging');
    }

    function handleFileDrop(event) {
        event.preventDefault();
        dragDropArea.classList.remove('dragging');
        const file = event.dataTransfer.files[0];
        handleFile(file);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        handleFile(file);
    }

    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                originalImageDataURL = e.target.result;
                displayedImageDataURL = originalImageDataURL;
                displayImage(displayedImageDataURL);
                reduceOptions.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    function displayImage(dataURL) {
        imagePreview.innerHTML = '';
        const img = new Image();
        img.src = dataURL;
        img.onload = function () {
            imagePreview.appendChild(img);
        };
        displayedImage = img;
    }

    window.reduceImage = function () {
        const widthInput = document.getElementById('manual-width').value;
        const heightInput = document.getElementById('manual-height').value;
        const qualityInput = document.getElementById('manual-quality').value;
        const unit = document.getElementById('unit-selection').value;

        let width = widthInput;
        let height = heightInput;
        const quality = qualityInput / 100;

        if (unit === 'cm') {
            width *= 37.7953; // convert cm to pixels
            height *= 37.7953; // convert cm to pixels
        } else if (unit === 'inch') {
            width *= 96; // convert inches to pixels (assuming 96 DPI)
            height *= 96; // convert inches to pixels (assuming 96 DPI)
        } // No conversion needed for px

        if (originalImageDataURL && width && height && quality) {
            const img = new Image();
            img.src = originalImageDataURL;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const reducedDataURL = canvas.toDataURL('image/jpeg', quality);
                displayImage(reducedDataURL);

                const sizeDisplay = document.getElementById('size-display');
                sizeDisplay.innerText = `Size: ${Math.round(reducedDataURL.length / 1024)} KB`;

                displayedImageDataURL = reducedDataURL;

                document.getElementById('download-btn-container').style.display = 'block';
                document.getElementById('rotate-left').style.display = 'inline-block';
                document.getElementById('rotate-right').style.display = 'inline-block';
            };
        }
    };

    window.downloadImage = function (format) {
        const link = document.createElement('a');
        link.href = displayedImageDataURL;

        if (format === 'jpeg') {
            link.download = 'image.jpeg';
            link.click();
        } else if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            pdf.addImage(displayedImageDataURL, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
            pdf.save('image.pdf');
        }
    };

    window.rotateImage = function (degrees) {
        if (displayedImage) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (degrees === 90 || degrees === -90) {
                canvas.width = displayedImage.height;
                canvas.height = displayedImage.width;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((degrees * Math.PI) / 180);
                ctx.drawImage(displayedImage, -displayedImage.width / 2, -displayedImage.height / 2);
            } else {
                canvas.width = displayedImage.width;
                canvas.height = displayedImage.height;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((degrees * Math.PI) / 180);
                ctx.drawImage(displayedImage, -displayedImage.width / 2, -displayedImage.height / 2);
            }

            const rotatedDataURL = canvas.toDataURL('image/jpeg');
            displayImage(rotatedDataURL);

            // Update the global variable for displayed image data URL
            displayedImageDataURL = rotatedDataURL;
        }
    };

    window.applyPredefinedOptions = function () {
        const selectedOption = document.getElementById('jee-main-options').value;
        const quality = 80; // default quality

        if (selectedOption === 'jee-main-photo-1' || selectedOption === 'jee-main-photo-2') {
            document.getElementById('unit-selection').value = 'cm';
            document.getElementById('manual-width').value = 3.5;
            document.getElementById('manual-height').value = 4.5;
            document.getElementById('manual-quality').value = quality;
            qualityValue.textContent = quality;
        } else if (selectedOption === 'jee-main-signature-1' || selectedOption === 'jee-main-signature-2') {
            document.getElementById('unit-selection').value = 'cm';
            document.getElementById('manual-width').value = 3.5;
            document.getElementById('manual-height').value = 1.5;
            document.getElementById('manual-quality').value = quality;
            qualityValue.textContent = quality;
        }
    };
});